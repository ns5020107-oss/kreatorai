const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 100);
    let result;

    if (q) {
      result = await pool.query(
        "SELECT id, name, platform, niche, location, profile_url, source_url, description, created_at FROM creators WHERE name ILIKE $1 OR platform ILIKE $1 OR niche ILIKE $1 OR location ILIKE $1 OR description ILIKE $1 ORDER BY name ASC LIMIT 100",
        ["%" + q + "%"]
      );
    } else {
      result = await pool.query(
        "SELECT id, name, platform, niche, location, profile_url, source_url, description, created_at FROM creators ORDER BY created_at DESC LIMIT 100"
      );
    }

    res.json({ creators: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      platform,
      niche,
      location,
      profile_url,
      source_url,
      description,
    } = req.body || {};

    if (typeof name !== "string" || !name.trim() || name.trim().length > 200) {
      return res.status(400).json({ error: "A valid creator name is required." });
    }

    const optionalFields = { platform, niche, location, profile_url, source_url, description };

    for (const [key, value] of Object.entries(optionalFields)) {
      if (value != null && (typeof value !== "string" || value.length > 2000)) {
        return res.status(400).json({ error: "Invalid field: " + key });
      }
    }

    const result = await pool.query(
      "INSERT INTO creators (name, platform, niche, location, profile_url, source_url, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, platform, niche, location, profile_url, source_url, description, created_at",
      [
        name.trim(),
        platform || null,
        niche || null,
        location || null,
        profile_url || null,
        source_url || null,
        description || null,
      ]
    );

    res.status(201).json({ creator: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
