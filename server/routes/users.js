const { Router } = require("express");
const { db } = require("../config/db-connection");

const router = Router();

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
    console.error("Detailed error fetching users:", e.stack);
    res
      .status(500)
      .json({ error: "Failed to fetch users", details: e.message });
  }
});

module.exports = router;
