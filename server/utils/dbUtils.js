const db = require("../config/db-connection");

/**
 * Fetch multiple rows from a table with optional ORDER BY clause
 *
 * @param {string} tableName          - Name of the table
 * @param {string|object} [options]   - Either a raw ORDER BY string, or { orderBy: "...", limit: number, offset: number }
 * @param {any[]} [values = []]       - Values for parameterized query (usually empty unless using WHERE)
 * @returns {Promise<any[]>}          - Array of rows (empty array if none found)
 */
async function fetchTable(tableName, options = {}, values = []) {
  // Basic input validation
  if (!tableName || typeof tableName !== "string" || tableName.trim() === "") {
    throw new Error("Invalid table name");
  }

  // Very basic sanitization of table name (prevent injection)
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, "");

  let sql = `SELECT * FROM ${safeTable}`;
  let queryValues = [...values];

  let orderByClause = "";

  if (typeof options === "string") {
    orderByClause = options.trim();
    if (!orderByClause.toUpperCase().startsWith("ORDER BY")) {
      orderByClause = `ORDER BY ${orderByClause}`;
    }
  } else if (
    options &&
    typeof options === "object" &&
    !Array.isArray(options)
  ) {
    // Modern style: fetchTable('users', { orderBy: 'created_at DESC', limit: 20 })
    if (options.orderBy) {
      let clause = options.orderBy.trim();
      if (!clause.toUpperCase().startsWith("ORDER BY")) {
        clause = `ORDER BY ${clause}`;
      }
      orderByClause = clause;
    }

    // You can easily extend later with limit / offset / where etc.
    // if (options.limit)  sql += ` LIMIT ${Number(options.limit)}`;
    // if (options.offset) sql += ` OFFSET ${Number(options.offset)}`;
  }

  if (orderByClause) {
    sql += ` ${orderByClause}`;
  }

  sql += ";";

  try {
    const [rows] = await db.query(sql, queryValues);
    return rows;
  } catch (err) {
    console.error(`fetchTable error [${safeTable}]:`, err.message);
    throw err;
  }
}

// /**
//  * Fetching a row from database
//  * @param {string} query - SQL code
//  * @param {string} values
//  * @returns
//  *
//  * @example
//  * ```js
//  * const row = await fetchRow(`
//  *   SELECT *
//  *   FROM general
//  *   WHERE id = 1
//  * `);
//  * ```
//  */
// async function fetchRow(query, values = []) {
//   const { rows } = await db.query(query, values);
//   return rows[0] || null;
// }

/**
 *
 * @param {string} table
 * @param {*} attributes
 * @param {*} values
 * @returns
 *
 * @example
 * ```js
 * // 1. Object style (most convenient)
 * await fetchRow('users', { id: 42 });
 * // → WHERE id = ?
 *
 * await fetchRow('orders', { user_id: 7, status: 'completed' });
 * // → WHERE user_id = ? AND status = ?
 *
 * // 2. Array style
 * await fetchRow('products', ['sku', 'active'], ['ABC123', true]);
 * // → WHERE sku = ? AND active = ?
 *
 * // 3. Multiple conditions
 * const activeSubscription = await fetchRow('subscriptions', {
 *   user_id: 183,
 *   status: 'active',
 *   cancelled_at: null
 * });
 *
 * // 4. Raw condition style
 * await fetchRow('posts', 'slug = ? AND published_at IS NOT NULL', ['how-to-code']);
 * // → WHERE slug = ? AND published_at IS NOT NULL
 * ```
 */
async function fetchRow(table, attributes, values = []) {
  let whereClause = "";
  let queryValues = values;

  if (typeof attributes === "string") {
    whereClause = attributes;
  } else if (Array.isArray(attributes)) {
    if (attributes.length !== values.length) {
      throw new Error(
        `Number of attributes (${attributes.length}) and values (${values.length}) do not match`,
      );
    }
    whereClause = attributes.map((attr) => `${attr} = ?`).join(" AND ");
  } else if (
    attributes &&
    typeof attributes === "object" &&
    !Array.isArray(attributes)
  ) {
    const conditions = [];
    queryValues = [];

    for (const [col, val] of Object.entries(attributes)) {
      conditions.push(`${col} = ?`);
      queryValues.push(val);
    }
    whereClause = conditions.join(" AND ");
  }

  if (!whereClause) {
    throw new Error("Now valid WHERE conditions provided");
  }

  if (!table || typeof table !== "string" || table.trim() === "") {
    throw new Error("Invalid table name");
  }

  const safeTable = table.replace(/[^a-zA-Z0-9_]/g, "");

  const sql = `
    SELECT *
    FROM ${safeTable}
    WHERE ${whereClause}
    LIMIT 1
  `;

  try {
    const [rows] = await db.query(sql, queryValues);
    return rows[0] || null;
  } catch (err) {
    console.error("fetchRow error:", err);
    throw err;
  }
}

async function updateRow(query, values = []) {
  const { rows } = await db.query(query, values);
  return rows[0] || null;
}

module.exports = { fetchTable, fetchRow, updateRow };
