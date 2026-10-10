// One-time setup: creates tables and the admin account.
// Usage: cp .env.example .env  (edit it)  →  npm run seed
// The admin password is hashed with bcrypt and NEVER printed.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS briefs (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      brand_name TEXT DEFAULT '',
      status TEXT DEFAULT 'Draft',
      data JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log("Tables ready.");

  const email = (process.env.ADMIN_EMAIL || "admin@kreatorai.demo").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password === "change-me-immediately") {
    console.error("Set a real ADMIN_PASSWORD in .env first (not the placeholder).");
    await pool.end();
    process.exit(1);
  }
  const password_hash = await bcrypt.hash(password, 12);
  await pool.query(
  `INSERT INTO users (email, password_hash, display_name, role)
   VALUES ($1, $2, 'Admin', 'admin')
   ON CONFLICT (email) DO UPDATE SET
     password_hash = EXCLUDED.password_hash,
     display_name = EXCLUDED.display_name,
     role = 'admin'`,
  [email, password_hash]
);
  console.log(`Admin ready: ${email}`);
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
