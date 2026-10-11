// KreatorAI API — Express + PostgreSQL.
// Boots even when DATABASE_URL is missing/unreachable: DB routes then
// answer 503 {"error":"Database not configured"} instead of crashing.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { checkDb, isDbUp, requireDb } = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors({ origin: [process.env.FRONTEND_URL || "http://localhost:5173", "https://ns5020107-oss.github.io"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: isDbUp() });
});

app.use("/api/auth", requireDb, require("./routes/auth"));
app.use("/api/briefs", requireDb, require("./routes/briefs"));
app.use("/api/admin", requireDb, require("./routes/admin"));
app.use("/api/creators", requireDb, require("./routes/creators"));

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler: full error goes to the server log only;
// clients get a generic JSON message (never stack traces or SQL).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}]`, err);
  res.status(500).json({ error: "Internal server error" });
});

if (!process.env.JWT_SECRET) {
  console.warn("[warn] JWT_SECRET is not set — auth routes will fail. Copy server/.env.example to server/.env and set it.");
}

checkDb().finally(() => {
  app.listen(PORT, () => {
    console.log(`KreatorAI API listening on port ${PORT}`);
  });
});
