const { db } = require("../config/db-connection");
const { fetchRow } = require("../utils/dbUtils");

const User = {
  async create(username, password, lastName, firstName, patr, status) {
    try {
      const { rows } = await db.query(
        `INSERT INTO users (username, password, "lastName", "firstName", patr, status) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
        [username, password, lastName, firstName, patr || null, status],
      );

      return rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async findByUsername(username) {
    try {
      return await fetchRow("users", { username });
    } catch (err) {
      console.error("Database error at findByUsername:", err);
      return null;
    }
  },
};

module.exports = User;
