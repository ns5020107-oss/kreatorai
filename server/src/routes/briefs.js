const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function toBrief(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    brand_name: row.brand_name,
    status: row.status,
    data: row.data && typeof row.data === "object" ? row.data : {},
    created_at: row.created_at,
    updated_at: row.updated_at,
    ...(row.owner_email ? { owner_email: row.owner_email } : {}),
  };
}

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Find a brief the caller may see. Non-owners get null (→ 404) so brief
// existence is never leaked to other users. Admins may see any brief.
async function findVisibleBrief(id, user) {
  const found = await pool.query("SELECT * FROM briefs WHERE id = $1", [id]);
  const row = found.rows[0];
  if (!row) return null;
  if (user.role !== "admin" && row.user_id !== user.id) return null;
  return row;
}

// GET /api/briefs — own briefs; admins may pass ?all=1 for everyone's
router.get("/", async (req, res, next) => {
  try {
    if (req.user.role === "admin" && req.query.all === "1") {
      const r = await pool.query(
        `SELECT b.*, u.email AS owner_email FROM briefs b
         JOIN users u ON u.id = b.user_id
         ORDER BY b.updated_at DESC`
      );
      return res.json({ briefs: r.rows.map(toBrief) });
    }
    const r = await pool.query(
      "SELECT * FROM briefs WHERE user_id = $1 ORDER BY updated_at DESC",
      [req.user.id]
    );
    res.json({ briefs: r.rows.map(toBrief) });
  } catch (err) {
    next(err);
  }
});

// POST /api/briefs { title*, brand_name?, status?, data? }
router.post("/", async (req, res, next) => {
  try {
    const { title, brand_name, status, data } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const r = await pool.query(
      `INSERT INTO briefs (user_id, title, brand_name, status, data)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        req.user.id,
        String(title).trim().slice(0, 200),
        String(brand_name || "").slice(0, 200),
        String(status || "Draft").slice(0, 40),
        data && typeof data === "object" ? data : {},
      ]
    );
    res.status(201).json({ brief: toBrief(r.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// GET /api/briefs/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ error: "Brief not found" });
    const row = await findVisibleBrief(id, req.user);
    if (!row) return res.status(404).json({ error: "Brief not found" });
    res.json({ brief: toBrief(row) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/briefs/:id
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ error: "Brief not found" });
    const row = await findVisibleBrief(id, req.user);
    if (!row) return res.status(404).json({ error: "Brief not found" });
    const { title, brand_name, status, data } = req.body || {};
    if (title !== undefined && !String(title).trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const r = await pool.query(
      `UPDATE briefs
       SET title = COALESCE($2, title),
           brand_name = COALESCE($3, brand_name),
           status = COALESCE($4, status),
           data = COALESCE($5, data),
           updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        id,
        title !== undefined ? String(title).trim().slice(0, 200) : null,
        brand_name !== undefined ? String(brand_name).slice(0, 200) : null,
        status !== undefined ? String(status).slice(0, 40) : null,
        data && typeof data === "object" ? data : null,
      ]
    );
    res.json({ brief: toBrief(r.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/briefs/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ error: "Brief not found" });
    const row = await findVisibleBrief(id, req.user);
    if (!row) return res.status(404).json({ error: "Brief not found" });
    await pool.query("DELETE FROM briefs WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
