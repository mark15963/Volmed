const { Router } = require("express");
const router = Router();
const fs = require("fs");

const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    ca:
      process.env.NODE_ENV === "production"
        ? fs.readFileSync("/etc/ssl/certs/ca-certificates.crt").toString()
        : undefined,
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  allowExitOnIdle: true,
});

router.get("/users", async (req, res) => {
  try {
    const client = await db.connect();
    try {
      const { rows } = await db.query("SELECT * FROM users ORDER BY id");
      res.json(rows);
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Detailed error fetching userss:", e.stack);
    res
      .status(500)
      .json({ error: "Failed to fetch users", details: e.message });
  }
});

module.exports = router;
