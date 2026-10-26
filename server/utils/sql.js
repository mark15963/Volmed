function buildInsert(table, data) {
  const keys = Object.keys(data);
  if (!keys.length) throw new Error("No data to insert");
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  return {
    text: `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
    values: Object.values(data),
  };
}

function buildUpdate(table, id, data) {
  const keys = Object.keys(data);
  if (!keys.length) throw new Error("No data to update");
  const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
  return {
    text: `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    values: [...Object.values(data), id],
  };
}

module.exports = { buildInsert, buildUpdate };
