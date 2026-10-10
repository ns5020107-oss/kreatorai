const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(row) {
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register { name, email, password }
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const fields = {};
    if (!name || !String(name).trim()) fields.name = "Please enter your name";
    if (!email || !EMAIL_RE.test(String(email).trim())) fields.email = "Enter a valid email address";
    if (!password || String(password).length < 8) fields.password = "Password must be at least 8 characters";
    if (Object.keys(fields).length > 0) {
      return res.status(400).json({ error: "Please fix the highlighted fields", fields });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [cleanEmail]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const password_hash = await bcrypt.hash(String(password), 12);
    const inserted = await pool.query(
      "INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, 'user') RETURNING id, email, name, role",
      [cleanEmail, password_hash, cleanName]
    );
    const user = publicUser(inserted.rows[0]);
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    // race: two simultaneous registers with the same email
    if (err && err.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    next(err);
  }
});

// POST /api/auth/login { email, password }
// Always 401 "Incorrect email or password" — never reveal whether the email exists.
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }
    const found = await pool.query(
      "SELECT id, email, password_hash, name, role FROM users WHERE email = $1",
      [String(email).trim().toLowerCase()]
    );
    const row = found.rows[0];
    const ok = row ? await bcrypt.compare(String(password), row.password_hash) : false;
    if (!ok) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }
    const user = publicUser(row);
    res.json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — current user, never the password hash
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const found = await pool.query(
      "SELECT id, email, name, role FROM users WHERE id = $1",
      [req.user.id]
    );
    if (found.rowCount === 0) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.json({ user: publicUser(found.rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
