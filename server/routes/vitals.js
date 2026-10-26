const { Router } = require("express");
const { db } = require("../config/db-connection");
const { isAuth } = require("../middleware/auth");

const router = Router();

const formatRow = (valueField) => (r) => ({
  value: r[valueField],
  timestamp: r.created_at,
  formattedTime: new Date(r.created_at).toLocaleTimeString(),
  formattedDate: new Date(r.created_at).toLocaleDateString(),
});

//#region ===== VITALS =====
// Save pulse data
router.post("/patients/:id/pulse", isAuth, async (req, res) => {
  const val = req.body.pulseValue;
  if (val == null || isNaN(val))
    return res.status(400).json({
      error: "Invalid pulse value",
    });
  try {
    const { rows } = await db.query(
      "INSERT INTO patient_pulse (patient_id, pulse_value) VALUES ($1,$2) RETURNING id",
      [req.params.id, val],
    );
    res.json({
      success: true,
      pulseId: rows[0].id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error", message: e.message });
  }
});

// Get pulse data
router.get("/patients/:id/pulse", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT pulse_value, created_at FROM patient_pulse WHERE patient_id=$1 ORDER BY created_at ASC",
      [req.params.id],
    );
    res.json(rows.map(formatRow("pulse_value")));
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "DB error",
      message: e.message,
    });
  }
});

// Save O2 data
router.post("/patients/:id/o2", isAuth, async (req, res) => {
  const val = req.body.o2Value;
  if (val == null || isNaN(val))
    return res.status(400).json({
      error: "Invalid O2 value",
    });
  try {
    const { rows } = await db.query(
      "INSERT INTO patient_o2 (patient_id, o2_value) VALUES ($1,$2) RETURNING id",
      [req.params.id, val],
    );
    res.json({
      success: true,
      o2Id: rows[0].id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "DB error",
      message: e.message,
    });
  }
});

// Get O2 data
router.get("/patients/:id/o2", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT o2_value, created_at FROM patient_o2 WHERE patient_id=$1 ORDER BY created_at ASC",
      [req.params.id],
    );
    res.json(rows.map(formatRow("o2_value")));
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "DB error",
      message: e.message,
    });
  }
});
//#endregion

module.exports = router;
