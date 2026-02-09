/**
 * Fetching a row from database
 * @param {string} query - SQL code
 * @param {string} values
 * @returns
 *
 * @example
 * ```js
 * const row = await fetchRow(`
 *   SELECT *
 *   FROM general
 *   WHERE id = 1
 * `);
 * ```
 */
async function fetchRow(query, values = []) {
  const { db } = require("../config/db-connection");
  const { rows } = await db.query(query, values);
  return rows[0] || null;
}

async function updateRow(query, values = []) {
  const { db } = require("../config/db-connection");
  const { rows } = await db.query(query, values);
  // const { rows } = await db.query(
  //   query,
  //   params.map((p) => p.value)
  // );
  return rows[0] || null;
}

module.exports = { fetchRow, updateRow };
