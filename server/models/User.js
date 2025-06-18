const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

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
      console.error("Database error in findByUsername:", error);
    }
  },
};

module.exports = User;
