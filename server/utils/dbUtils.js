const { db } = require("../config/db-connection");

//#region === UTILITY FUNCTIONS ===
/**
 * Executes a database query with parameterized values
 * @private
 * @param {string} query - SQL query string
 * @param {Array} values - Parameter values for the query
 * @returns {Promise<Object>} Query result object with rows property
 * @throws {Error} If database query fails
 */
async function executeQuery(query, values = []) {
  try {
    const res = await db.query(query, values);
    return res;
  } catch (error) {
    console.error("Database query failed:", {
      query: query.substring(0, 200) + (query.length > 200 ? "..." : ""),
      values,
      error: error.message,
    });
    throw error;
  }
}
//#endregion

//#region === EXPORTED FUNCTIONS ===
/**
 * Fetches a single row from the database
 * @param {string} query - SQL SELECT query
 * @param {Array} [values=[]] - Parameterized values for the query
 * @returns {Promise<Object|null>} The first row as an object, or null if no results
 * @throws {Error} If database query fails
 * @example
 * ```js
 * const user = await fetchRow('SELECT * FROM users WHERE id = $1', [1]);
 * ```
 * ```js
 * const row = await fetchRow(`
 *   SELECT *
 *   FROM general
 *   WHERE id = 1
 * `);
 * ```
 */
async function fetchRow(query, values = []) {
  if (!query || typeof query !== "string") {
    throw new TypeError("Query must be a non-empty string");
  }

  if (!query.trim().toUpperCase().startsWith("SELECT")) {
    console.warn(
      "fetchRow is typically used for SELECT queries. Query:",
      query.substring(0, 100),
    );
  }

  const { rows } = await executeQuery(query, values);
  return rows[0] || null;
}

/**
 * Fetches multiple rows from the database
 * @param {string} query - SQL SELECT query
 * @param {Array} [values=[]] - Parameterized values for the query
 * @returns {Promise<Array>} Array of row objects
 * @throws {Error} If database query fails
 * @example
 * const users = await fetchRows('SELECT * FROM users WHERE active = $1', [true]);
 */
async function fetchRows(query, values = []) {
  if (!query || typeof query !== "string") {
    throw new TypeError("Query must be a non-empty string");
  }

  const { rows } = await executeQuery(query, values);
  return rows;
}

/**
 * Updates rows in the database and returns the updated row(s)
 * @param {string} query - SQL UPDATE query with RETURNING clause
 * @param {Array} [values=[]] - Parameterized values for the query
 * @returns {Promise<Object|null>} The updated row as an object, or null if no rows affected
 * @throws {Error} If database query fails
 * @example
 * const updatedUser = await updateRow(
 *   'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
 *   ['John', 1] // 'John' is $1 and 1 is $2
 * );
 */
async function updateRow(query, values = []) {
  if (!query || typeof query !== "string") {
    throw new TypeError("Query must be a non-empty string");
  }

  // Validate UPDATE query for updateRow
  if (!query.trim().toUpperCase().startsWith("UPDATE")) {
    console.warn(
      "updateRow is typically used for UPDATE queries. Query:",
      query.substring(0, 100),
    );
  }

  // Ensure RETURNING clause is present for consistency
  const upperQuery = query.toUpperCase();
  if (!upperQuery.includes("RETURNING")) {
    console.warn(
      "UPDATE query should include RETURNING clause to get updated row",
    );
  }

  const { rows } = await executeQuery(query, values);
  return rows[0] || null;
}

/**
 * Inserts a new row into the database
 * @param {string} table - Table name
 * @param {Object} data - Column-value pairs to insert
 * @param {string} [returning='*'] - Columns to return (defaults to all)
 * @returns {Promise<Object|null>} The inserted row as an object
 * @throws {Error} If database query fails
 * @example
 * const newUser = await insertRow('users', { name: 'John', email: 'john@example.com' });
 */
async function insertRow(table, data, returning = "*") {
  if (!table || typeof table !== "string") {
    throw new TypeError("Table name must be a non-empty string");
  }

  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    throw new TypeError("Data must be a non-empty object");
  }

  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, index) => `$${index + 1}`);

  const query = `
    INSERT INTO ${table} (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING ${returning}
  `;

  const { rows } = await executeQuery(query, values);
  return rows[0] || null;
}

/**
 * Deletes rows from the database
 * @param {string} table - Table name
 * @param {string} condition - WHERE condition (without WHERE keyword)
 * @param {Array} [values=[]] - Parameterized values for the condition
 * @param {string} [returning='*'] - Columns to return (defaults to all)
 * @returns {Promise<Array>} Array of deleted rows
 * @throws {Error} If database query fails
 * @example
 * const deletedUsers = await deleteRows('users', 'id = $1', [1]);
 */
async function deleteRows(table, condition, values = [], returning = "*") {
  if (!table || typeof table !== "string") {
    throw new TypeError("Table name must be a non-empty string");
  }

  if (!condition || typeof condition !== "string") {
    throw new TypeError("Condition must be a non-empty string");
  }

  const query = `
    DELETE FROM ${table}
    WHERE ${condition}
    RETURNING ${returning}
  `;

  const { rows } = await executeQuery(query, values);
  return rows;
}

/**
 * Executes a generic database query (for CREATE, DROP, etc.)
 * @param {string} query - SQL query string
 * @param {Array} [values=[]] - Parameterized values for the query
 * @returns {Promise<Object>} Raw query result
 * @throws {Error} If database query fails
 * @example
 * await execute('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT)');
 */
async function execute(query, values = []) {
  return executeQuery(query, values);
}
//#endregion

module.exports = {
  fetchRow,
  fetchRows,
  updateRow,
  insertRow,
  deleteRows,
  execute,
};
