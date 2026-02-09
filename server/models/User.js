const { db } = require("../config/db-connection");
const { insertRow, fetchRow } = require("../utils/dbUtils");

//#region === USER MODEL ===

/**
 * User Model - Provides CRUD operations for users table
 * @namespace User
 */
const User = {
  /**
   * Creates a new user in the database
   * @param {string} username - Username for login
   * @param {string} password - Hashed password
   * @param {string} lastName - User's last name
   * @param {string} firstName - User's first name
   * @param {string} [patr] - User's patronymic (optional)
   * @param {string} status - User status/role
   * @returns {Promise<Object>} The created user object
   * @throws {Error} If database operation fails
   * @example
   * const newUser = await User.create(
   *   'johndoe',
   *   'hashed_password',
   *   'Doe',
   *   'John',
   *   'Michael', // optional
   *   'active'
   * );
   */
  async create(username, password, lastName, firstName, patr = null, status) {
    try {
      const userData = {
        username,
        password,
        lastName,
        firstName,
        patr,
        status,
      };

      if (patr === null) {
        delete userData.patr;
      }

      const createUser = await insertRow("users", userData);
      return createUser;
    } catch (error) {
      console.error("Error creating user:", {
        username,
        error: error.message,
      });
      throw error;
    }
  },

  /**
   * Finds a user by username
   * @param {string} username - Username to search for
   * @returns {Promise<Object|null>} User object if found, null otherwise
   * @throws {Error} If database operation fails
   * @example
   * const user = await User.findByUsername('johndoe');
   */
  async findByUsername(username) {
    try {
      const user = await fetchRow("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      return user;
    } catch (error) {
      console.error("Error finding user by username:", {
        username,
        error: error.message,
      });
      throw error;
    }
  },
};

module.exports = User;
