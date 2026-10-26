const { Router } = require("express");
const { db } = require("../config/db-connection");
const { isAuth } = require("../middleware/auth");

const router = Router();

//#region ===== MEDS =====
// Show patient's medications
router.get("/patients/:id/medications", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM medications WHERE patient_id = $1",
      [req.params.id],
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "DB error",
    });
  }
});
// Add medication to a patient
router.post("/patients/:id/medications", isAuth, async (req, res) => {
  const { name, dosage, frequency } = req.body;
  if (!name || !dosage || !frequency) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    const q = `
      INSERT INTO medications (patient_id, name, dosage, frequency)
      VALUES ($1,$2,$3,$4) RETURNING id
    `;
    const { rows } = await db.query(q, [
      req.params.id,
      name,
      dosage,
      frequency,
    ]);
    res.status(201).json({
      success: true,
      medicationId: rows[0].id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "DB insert error",
      message: e.message,
    });
  }
});

// Update a medication of a patient
router.put("/medications/:medId", isAuth, async (req, res) => {
  const { medId } = req.params;
  const { name, dosage, frequency } = req.body;

  try {
    const current = await db.query("SELECT * FROM medications WHERE id = $1", [
      medId,
    ]);
    if (!current.rowCount) {
      return res.status(404).json({
        message: "Medication not found",
      });
    }

    const result = await db.query(
      `UPDATE medications 
       SET name = $1, dosage = $2, frequency = $3
       WHERE id = $4
       RETURNING *`,
      [
        name ?? current.rows[0].name,
        dosage ?? current.rows[0].dosage,
        frequency ?? current.rows[0].frequency,
        medId,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating medication:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

// Delete a medication from a patient
router.delete("/medications/:medId", isAuth, async (req, res) => {
  const medId = parseInt(req.params.medId, 10);
  if (isNaN(medId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }

  try {
    const result = await db.query(
      `DELETE FROM medications WHERE id = $1 RETURNING *`,
      [medId],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted",
      medication: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting medication:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
});
//#endregion

module.exports = router;
