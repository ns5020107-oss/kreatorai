// PostgreSQL pool. The server must boot and stay up even when the
// database is missing or unreachable: every DB route then answers 503
// {"error":"Database not configured"} instead of crashing. Connection
// strings are never included in any response.
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
const pool = connectionString
  ? new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 4000,
      idleTimeoutMillis: 10000,
    })
  : null;

let dbAvailable = false;

if (pool) {
  pool.on("error", (err) => {
    console.error("[db] pool error:", err.message);
    dbAvailable = false;
  });
}

async function checkDb() {
  if (!pool) {
    dbAvailable = false;
    return false;
  }
  try {
    await pool.query("SELECT 1");
    dbAvailable = true;
    return true;
  } catch (err) {
    console.error("[db] unreachable:", err.message);
    dbAvailable = false;
    return false;
  }
}

function isDbUp() {
  return dbAvailable;
}

// Mount before every DB-backed router. Does a live probe so a database
// that dies after boot still yields 503 instead of 500s.
async function requireDb(req, res, next) {
  if (!pool) {
    return res.status(503).json({ error: "Database not configured" });
  }
  try {
    await pool.query("SELECT 1");
    dbAvailable = true;
    next();
  } catch (err) {
    dbAvailable = false;
    console.error("[db] probe failed:", err.message);
    return res.status(503).json({ error: "Database not configured" });
  }
}

module.exports = { pool, checkDb, isDbUp, requireDb };
