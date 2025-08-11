const express = require("express");
const router = express.Router();
const { db } = require("../config/db-connection");

router.post("/save-message", async (req, res) => {
  const { room, sender, senderName, message, timestamp } = req.body;

  try {
    await db.query(
      "INSERT INTO messages (room, sender, sender_name, message, timestamp) VALUES ($1, $2, $3, $4, $5)",
      [room, sender, senderName, message, timestamp || new Date()]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error saving message:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/room/:room/messages", async (req, res) => {
  const room = req.params.room;
  try {
    const result = await db.query(
      "SELECT * FROM messages WHERE room = $1 ORDER BY timestamp ASC",
      [room]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
