const express = require("express");
const router = express.Router();
const { db } = require("../config/db-connection");
const debug = require("../utils/debug");

router.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({ status: "healthy", db: "connected" });
  } catch (error) {
    debug.error("Chat health check failed:", error.message);
    res.status(500).json({ status: "error", db: "unreachable" });
  }
});
router.post("/save-message", async (req, res) => {
  const { room, sender, senderName, message, timestamp } = req.body;

  try {
    await db.query(
      "INSERT INTO messages (room, sender, sender_name, message, timestamp) VALUES ($1, $2, $3, $4, $5)",
      [room, sender, senderName, message, timestamp]
    );
    debug.log(`💾 Message saved to database: "${message}"`);
    res.status(201).json({ success: true });
  } catch (err) {
    debug.error("❌ Database save error:", err.message);
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
router.delete("/room/:room", async (req, res) => {
  const room = req.params.room;
  try {
    await db.query("DELETE FROM messages WHERE room = $1", [room]);

    const io = req.app.get("io");
    io.to(room).emit("chat_deleted", { room });
    res.json({ success: true, message: "Chat room deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat room:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/active-rooms", async (req, res) => {
  try {
    const result = await db.query("SELECT DISTINCT room FROM messages");
    res.json({ rooms: result.rows.map((r) => r.room) });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
