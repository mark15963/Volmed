const path = require("path");

const { Router } = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const fs = require("fs");
const fsp = fs.promises;
const router = Router();

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  allowExitOnIdle: true,
});
db.on("error", (err) => {
  console.error("Database error:", err);
});
db.on("connect", () => {
  console.log("Database connected");
});
db.on("remove", () => {
  console.log("Database connection removed");
});

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const patientId = req.params.id;
    const uploadPath = path.join(uploadDir, "patients", patientId);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    const ext = path.extname(originalname);
    const basename = path.basename(originalname, ext);
    const safeName = basename.replace(/[^a-zA-Z0-9-_]/g, "") + ext;
    const fullPath = path.join(uploadDir, "patients", req.params.id, safeName);

    if (fs.existsSync(fullPath)) {
      let counter = 1;
      let newName = `${basename} (${counter})${ext}`;

      while (
        fs.existsSync(path.join(uploadDir, "patients", req.params.id, newName))
      ) {
        counter++;
        newName = `${basename} (${counter})${ext}`;
      }
      cb(null, newName);
    } else {
      cb(null, safeName);
    }
  },
});

const upload = multer({ storage });

router.get("/api/patients", isAuth, async (req, res) => {
  try {
    const client = await db.connect();
    try {
      const { rows } = await db.query("SELECT * FROM patients ORDER BY id");
      res.json(rows);
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Detailed error fetching patients:", e.stack);
    res
      .status(500)
      .json({ error: "Failed to fetch patients", details: e.message });
  }
});
//Get data of a specific patient
router.get("/api/patients/:id", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM patients WHERE id = $1", [
      req.params.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ error: "Patient not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});
// Amount of ID's in DB
router.get("/api/patient-count", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query("SELECT COUNT(id) AS count FROM patients");
    res.json({ count: parseInt(rows[0].count, 10) || 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error", count: 0 });
  }
});
// Add a new patient
router.post("/api/patients", isAuth, async (req, res) => {
  const newP = req.body;
  const keys = Object.keys(newP);
  const values = Object.values(newP);

  const quotedKeys = keys.map((key) => `"${key}"`);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const q = `INSERT INTO patients (${quotedKeys.join(
    ","
  )}) VALUES (${placeholders}) RETURNING *`;

  try {
    const { rows } = await db.query(q, values);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("Insert error:", e);
    res
      .status(500)
      .json({ error: "Database insert failed", message: e.message });
  }
});
// Update a patient
router.put("/api/patients/:id", isAuth, async (req, res) => {
  const id = req.params.id,
    edited = req.body;
  const keys = Object.keys(edited),
    values = Object.values(edited);
  const setSQL = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");
  const q = `UPDATE patients SET ${setSQL} WHERE id=$${
    keys.length + 1
  } RETURNING *`;

  try {
    const { rows, rowCount } = await db.query(q, [...values, id]);
    if (!rowCount) return res.status(404).json({ error: "Patient not found" });
    res.json({ success: true, message: "Updated", patient: rows[0] });
  } catch (e) {
    console.error("Update error:", e);
    res
      .status(500)
      .json({ error: "Database update failed", message: e.message });
  }
});
// Delete a patient
router.delete("/api/patients/:id", isAuth, async (req, res) => {
  try {
    const { rowCount } = await db.query("DELETE FROM patients WHERE id = $1", [
      req.params.id,
    ]);
    if (!rowCount) return res.status(404).json({ error: "Patient not found" });
    res.json({ success: true, message: "Deleted", deletedId: req.params.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Delete failed", message: e.message });
  }
});

//-----FILES-----
// Upload files to a specific patient
router.post(
  "/api/patients/:id/upload",
  isAuth,
  upload.single("file"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({
      success: true,
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: `/uploads/patients/${req.params.id}/${req.file.filename}`,
      size: req.file.size,
    });
  }
);
// Get files of a specific patient
router.get("/api/patients/:id/files", isAuth, (req, res) => {
  const dir = path.join(uploadDir, "patients", req.params.id);
  if (!fs.existsSync(dir)) return res.json([]);
  try {
    const files = fs.readdirSync(dir).map((fn) => {
      const st = fs.statSync(path.join(dir, fn));
      return {
        filename: fn,
        originalname: fn,
        path: `/uploads/patients/${req.params.id}/${fn}`,
        size: st.size,
      };
    });
    res.json(files);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error reading directory" });
  }
});
// Delete patient's file
router.delete("/api/files", isAuth, async (req, res) => {
  const { filePath } = req.body;

  if (!filePath) return res.status(400).json({ error: "filePath is required" });

  const uploadsDir = path.join(__dirname, "..", "uploads");
  const normalized = path
    .normalize(filePath)
    .replace(/^(\.\.[\\/])+/, "")
    .replace(/\\/g, "/");
  const relativePath = normalized.split("uploads/").pop() || normalized;
  const full = path.join(uploadsDir, relativePath);

  // Security check
  if (!full.startsWith(path.normalize(uploadsDir))) {
    return res
      .status(403)
      .json({ error: "Access denied", message: "Invalid path" });
  }

  try {
    await fsp.access(full);
    await fsp.unlink(full);
    res.json({
      success: true,
      message: "Deleted",
      path: normalized,
    });
  } catch (e) {
    console.error("Deletion error:", e);
    if (e.code === "ENOENT")
      return res.status(404).json({
        error: "Not found",
        requestedPath: normalized,
        actualSearchedPath: full,
      });
    if (e.code === "EPERM")
      return res
        .status(403)
        .json({ error: "Permission denied", message: e.message });
    if (e.code === "EISDIR")
      return res
        .status(400)
        .json({ error: "Path is a directory", message: e.message });
    res
      .status(500)
      .json({ error: "Internal server error", message: e.message });
  }
});

//-----MEDS-----
// Show patient's medications
router.get("/api/patients/:id/medications", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM medications WHERE patient_id = $1",
      [req.params.id]
    );

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});
// Add medication to a patient
router.post("/api/patients/:id/medications", isAuth, async (req, res) => {
  const { name, dosage, frequency } = req.body;
  if (!name || !dosage || !frequency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const q = `
    INSERT INTO medications (patient_id, name, dosage, frequency)
    VALUES ($1,$2,$3,$4) RETURNING id
  `;
  try {
    const { rows } = await db.query(q, [
      req.params.id,
      name,
      dosage,
      frequency,
    ]);
    res.status(201).json({ success: true, medicationId: rows[0].id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB insert error", message: e.message });
  }
});
// Update a medication of a patient
router.put("/api/medications/:medId", isAuth, async (req, res) => {
  const { medId } = req.params;
  const { name, dosage, frequency } = req.body;

  try {
    const current = await db.query("SELECT * FROM medications WHERE id = $1", [
      medId,
    ]);

    if (current.rowCount === 0) {
      return res.status(404).json({ message: "Medication not found" });
    }

    const result = await db.query(
      `UPDATE medications 
       SET name = $1, dosage = $2, frequency = $3
       WHERE id = $4
       RETURNING *`,
      [
        name || current.rows[0].name,
        dosage || current.rows[0].dosage,
        frequency || current.rows[0].frequency,
        medId,
      ]
    );

    const updatedMed = result.rows[0];

    res.json(updatedMed);
  } catch (err) {
    console.error("Error updating medication:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});
// Delete a medication from a patient
router.delete("/api/medications/:medId", isAuth, async (req, res) => {
  const medId = parseInt(req.params.medId, 10);

  if (isNaN(medId)) {
    return res.status(400).json({
      success: false,
      message: "Неверный ID назначения",
    });
  }

  try {
    const result = await db.query(
      `DELETE FROM medications WHERE id = $1 RETURNING *`,
      [medId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Назначение не найдено",
      });
    }

    res.status(200).json({
      success: true,
      message: "Назначение удалено",
      medication: result.rows[0],
    });
  } catch (err) {
    console.error("Ошибка при удалении назначений:", err);
    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
      error: err.message,
    });
  }
});

//-----STATES------
// Save pulse data
router.post("/api/patients/:id/pulse", isAuth, async (req, res) => {
  const val = req.body.pulseValue;
  if (val == null || isNaN(val))
    return res.status(400).json({ error: "Invalid pulse value" });
  try {
    const q =
      "INSERT INTO patient_pulse (patient_id, pulse_value) VALUES ($1,$2) RETURNING id";
    const { rows } = await db.query(q, [req.params.id, val]);
    res.json({ success: true, pulseId: rows[0].id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error", message: e.message });
  }
});
// Get pulse data
router.get("/api/patients/:id/pulse", isAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT pulse_value, created_at FROM patient_pulse WHERE patient_id=$1 ORDER BY created_at ASC",
      [req.params.id]
    );
    const formatted = rows.map((r) => ({
      value: r.pulse_value,
      timestamp: r.created_at,
      formattedTime: new Date(r.created_at).toLocaleTimeString(),
      formattedDate: new Date(r.created_at).toLocaleDateString(),
    }));
    res.json(formatted);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error", message: e.message });
  }
});

module.exports = router;
