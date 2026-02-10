const db = require("../config/db-connection");

/**
 * Fetching a table from database
 * @param {string} table - Name of the table
 * @param {string} values
 * @returns table
 *
 * @example
 * ```js
 * const row = await fetchTable('general');
 * ```
 */
async function fetchTable(table, values = []) {
  const table = await db.query(
    `
    SELECT * 
    FROM ${table} 
    WHERE id = 1;
    `,
    values,
  );
  return table;
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
