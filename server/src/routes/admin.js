const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireAdmin);

// GET /api/admin/users — never includes password_hash
router.get("/users", async (req, res, next) => {
  try {
    const r = await pool.query(
      "SELECT id, email, name, role, created_at FROM users ORDER BY created_at ASC"
    );
    res.json({ users: r.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats
router.get("/stats", async (req, res, next) => {
  try {
    const r = await pool.query(
      "SELECT (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM briefs) AS briefs"
    );
    res.json({
      users: Number(r.rows[0].users),
      briefs: Number(r.rows[0].briefs),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
