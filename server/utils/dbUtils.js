const { db } = require("../config/db-connection");
const { escapeIdentifier } = require("pg");

async function fetchTable(table) {
  // const { rows } = await db.query(`
  //   SELECT *
  //   FROM $1;
  //   `,
  //   [table]
  // )
  const { rows } = await db.query(`
    SELECT * 
    FROM ${escapeIdentifier(table)}
    WHERE id = 1;
  `);
  return rows[0] || null;
}

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
  const { rows } = await db.query(query, values);
  console.warn("TESTEST");
  return rows[0] || null;
}

async function updateRow(query, values = []) {
  const { rows } = await db.query(query, values);
  return rows[0] || null;
}

module.exports = { fetchTable, fetchRow, updateRow };
