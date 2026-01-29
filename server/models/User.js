const { db } = require("../config/db-connection");

const User = {
  async create(username, password, lastName, firstName, patr, status) {
    try{
    const { rows } = await db.query(
      `INSERT INTO users (username, password, "lastName", "firstName", patr, status) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [username, password, lastName, firstName, patr || null, status]
    );

    return rows[0];
    }catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async findByUsername(username) {
    try {
      const { rows } = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      return rows[0] || null;
    } catch (err) {
      console.error("Database error at findByUsername:", err);
      return null;
    }
  },
};

module.exports = User;
