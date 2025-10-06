async function fetchRow(query, params = []) {
  const { db } = require("../config/db-connection");
  const { rows } = await db.query(query, params);
  return rows[0] || null;
}

async function updateRow(query, params = []) {
  const { db } = require("../config/db-connection");
  const { rows } = await db.query(
    query,
    params.map((p) => p.value)
  );
  return rows[0] || null;
}

module.exports = { fetchRow, updateRow };
