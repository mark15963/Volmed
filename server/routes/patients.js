const { Router } = require("express");
const { db } = require("../config/db-connection");
const { isAuth, isAdmin } = require("../middleware/auth");
const { buildInsert, buildUpdate } = require("../utils/sql");

const router = Router();

//#region ===== PATIENTS =====
//Get all patients
router.get("/patients", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM patients ORDER BY id");
    res.json(rows);
  } catch (e) {
    console.error("Error fetching patients:", e.stack);
    res
      .status(500)
      .json({ error: "Failed to fetch patients", details: e.message });
  }
});
//Get data of a specific patient
router.get("/patients/:id", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT * FROM patients WHERE id = $1`,
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({
        error: "Patient not found",
      });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "Database error",
    });
  }
});
// Amount of ID's in DB
router.get("/patient-count", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT COUNT(id) AS count 
      FROM patients
      `);
    res.json({
      ok: true,
      count: parseInt(rows[0].count, 10) || 0,
    });
  } catch (e) {
    console.error("Error fetching patient count:", e);
    res.status(500).json({
      ok: false,
      error: "DB error",
      count: 0,
    });
  }
});
// Add a new patient
router.post("/patients", isAuth, async (req, res) => {
  if (!req.body || !Object.keys(req.body).length) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Request body is empty or invalid",
    });
  }

  let q;
  try {
    q = buildInsert("patients", req.body);
    const { rows } = await db.query(q);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("Insert error:", e);
    if (e.code === "23502") {
      return res.status(400).json({
        error: "Missing required field",
        field: e.column,
      });
    }
    if (e.code === "23505") {
      return res.status(409).json({
        error: "Duplicate value",
        field: e.detail,
      });
    }
    if (e.code === "42601") {
      // Syntax error — log the actual SQL so we can see the shape
      debug.error("Failing query:", q.text);
      debug.error("Failing params:", q.values);
    }
    res.status(500).json({ error: "Database insert failed" });
  }
});
// Update a patient
router.put("/patients/:id", isAuth, async (req, res) => {
  if (!req.body || !Object.keys(req.body).length) {
    return res.status(400).json({
      error: "No fields to update",
    });
  }

  try {
    const q = buildUpdate("patients", req.params.id, req.body);
    const { rows, rowCount } = await db.query(q);
    if (!rowCount)
      return res.status(404).json({
        error: "Patient not found",
      });
    res.json({
      success: true,
      message: "Updated",
      patient: rows[0],
    });
  } catch (e) {
    console.error("Update error:", e.stack);
    if (e.code === "23502") {
      return res.status(400).json({
        error: "Missing required field",
        field: e.column,
      });
    }
    if (e.code === "23505") {
      return res.status(409).json({
        error: "Duplicate value",
        field: e.detail,
      });
    }
    res.status(500).json({ error: "Database update failed" });
  }
});
// Delete a patient
router.delete("/patients/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const { rowCount } = await db.query("DELETE FROM patients WHERE id = $1", [
      req.params.id,
    ]);

    if (!rowCount) {
      return res.status(404).json({
        error: "Patient not found",
      });
    }

    res.json({
      success: true,
      message: "Deleted",
      deletedId: req.params.id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "Delete failed",
      message: e.message,
    });
  }
});

//#endregion

module.exports = router;
