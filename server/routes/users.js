const { Router } = require("express");
const { db } = require("../config/db-connection");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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

router.post("/users", async (req, res) => {
  const { username, password, lastName, firstName, patr, status } = req.body;

  if (!username || !password || !lastName || !firstName || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const inputStatus = req.body.status;
  const allowedStatuses = ["Администратор", "Тестировщик", "Сестра", "Врач"];
  const finalStatus = allowedStatuses.includes(inputStatus)
    ? inputStatus
    : "Сестра";

  try {
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        error: "Username already exists",
        user: existingUser,
      });
    }

    const hashedPass = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create(
      username,
      hashedPass,
      lastName,
      firstName,
      patr,
      finalStatus
    );
    res.status(201).json(newUser);
  } catch (e) {
    console.error("Error creating user:", e.stack);
    res
      .status(500)
      .json({ error: "Failed to create user", details: e.message });
  }
});

router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const client = await db.connect();
    try {
      const { rowCount, rows } = await client.query(
        "UPDATE users SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(rows[0]);
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Error updating user:", e.stack);
    res
      .status(500)
      .json({ error: "Failed to update user", details: e.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const client = await db.connect();
    try {
      const check = await client.query(
        "SELECT status FROM users WHERE id = $1",
        [id]
      );
      if (check.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      if (check.rows[0].status === "Администратор") {
        return res.status(403).json({ error: "Cannon delete admin" });
      }

      const { rowCount } = await client.query(
        "DELETE FROM users WHERE id = $1",
        [id]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, message: "Deleted", deletedId: id });
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Error deleting user:", e.stack);
    res
      .status(500)
      .json({ error: "Failed to delete user", details: e.message });
  }
});

module.exports = router;
