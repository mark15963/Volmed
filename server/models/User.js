const debug = require("../utils/debug");
const { db } = require("../config/db-connection");

const User = {
  async create(username, password) {
    const res = await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
      [username, password]
    );

    return res.rows[0];
  },

  async findByUsername(username) {
    try {
      const { rows } = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      return rows[0] || null;
    } catch (err) {
      console.error("Database error in findByUsername:", err);
    }
  },
};

module.exports = User;
