const { Router } = require("express");
const { db } = require("../config/db-connection");

const router = Router();

async function fetchRow(query, res, params = []) {
  if (!res) throw new Error("Response object is required");

  try {
    const { rows } = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Data not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("DB fetch error:", err);
    res
      .status(500)
      .json({ error: "Database fetch failed", details: err.message });
  }
}
async function updateRow(query, res, params = [], requiredFields = []) {
  if (!res) throw new Error("Response object is required");

  for (const field of requiredFields) {
    if (!params[field.index]) {
      return res.status(400).json({ error: `${field.name} is required` });
    }
  }

  try {
    const { rows } = await db.query(
      query,
      params.map((p) => p.value)
    );
    if (rows.length === 0) {
      return res.status(404).send("Record not found");
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("DB update error:", err);
    res
      .status(500)
      .json({ error: "Database update failed", message: err.message });
  }
}

// General Data
router.get("/title", async (req, res) => {
  fetchRow('SELECT "topTitle", "bottomTitle" FROM general WHERE id = 1', res);
});
router.put("/title", async (req, res) => {
  const { topTitle, bottomTitle } = req.body;

  updateRow(
    `UPDATE general SET "topTitle" = $1, "bottomTitle" = $2 WHERE id = 1 RETURNING *`,
    res,
    [{ value: topTitle }, { value: bottomTitle }],
    [{ index: 0, name: "Top title" }] // Required
  );
});

router.get("/color", async (req, res) => {
  fetchRow(
    'SELECT "headerColor", "contentColor" FROM general WHERE id = 1',
    res
  );
});
router.put("/color", async (req, res) => {
  const { headerColor, contentColor } = req.body;

  updateRow(
    'UPDATE general SET "headerColor" = $1, "contentColor" = $2 WHERE id = 1 RETURNING *',
    res,
    [{ value: headerColor }, { value: contentColor }],
    [
      { index: 0, name: "Header color" }, // Required
      { index: 1, name: "Content color" }, // Required
    ]
  );
});

module.exports = router;
