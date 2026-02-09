//#region === REQUIREMENTS ===
const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const debug = require("../utils/debug");
const {
  fetchRow,
  fetchRows,
  insertRow,
  updateRow,
  deleteRows,
  execute,
} = require("../utils/dbUtils");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
//#endregion

//#region === CONSTANTS & CONFIGURATION ===
const UPLOADS_BASE_DIR = path.join(__dirname, "..", "uploads");
const PATIENTS_UPLOADS_DIR = path.join(UPLOADS_BASE_DIR, "patients");

if (!fsSync.existsSync(PATIENTS_UPLOADS_DIR)) {
  fsSync.mkdirSync(PATIENTS_UPLOADS_DIR, { recursive: true });
}
//#endregion

const router = Router();

//#region === UTILITY FUNCTIONS ===
/**
 * Gets the upload directory path for a specific patient
 * @param {string} patientId - Patient ID
 * @returns {string} Full path to patient's upload directory
 */
function getPatientUploadDir(patientId) {
  return path.join(PATIENTS_UPLOADS_DIR, patientId);
}

/**
 * Ensures patient upload directory exists
 * @param {string} patientId - Patient ID
 * @returns {Promise<void>}
 */
async function ensurePatientUploadDir(patientId) {
  const dirPath = getPatientUploadDir(patientId);
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    debug.log(`Created upload directory for patient ${patientId}`);
  }
}

/**
 * Sanitizes filename by removing special characters
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);
  const safeBasename = basename.replace(/[^a-zA-Z0-9-_]/g, "");
  return safeBasename + extension;
}

/**
 * Generates a unique filename if it already exists
 * @param {string} dirPath - Directory path
 * @param {string} filename - Desired filename
 * @returns {Promise<string>} Unique filename
 */
async function getUniqueFilename(dirPath, filename) {
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);
  let counter = 0;
  let candidate = filename;

  while (true) {
    try {
      await fs.access(path.join(dirPath, candidate));
      counter++;
      candidate = `${basename} (${counter})${extension}`;
    } catch {
      return candidate;
    }
  }
}
//#endregion

//#region === MULTER CONFIGURATION ===
const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    try {
      const patientId = req.params.id;
      const uploadPath = getPatientUploadDir(patientId);
      await ensurePatientUploadDir(patientId);
      callback(null, uploadPath);
    } catch (error) {
      callback(error);
    }
  },
  filename: async (req, file, callback) => {
    try {
      const patientId = req.params.id;
      const uploadPath = getPatientUploadDir(patientId);
      const sanitized = sanitizeFilename(file.originalname);
      const uniqueFilename = await getUniqueFilename(uploadPath, sanitized);
      callback(null, uniqueFilename);
    } catch (error) {
      callback(error);
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, callback) => {
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
    ];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extension)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`,
        ),
      );
    }
  },
});
//#endregion

//#region ===== PATIENT ROUTES =====
/**
 * GET /patients
 * Retrieves all patients from the database
 */
router.get("/patients", isAuthenticated, async (req, res) => {
  try {
    const patients = await fetchRows("SELECT * FROM patients ORDER BY id");
    res.json(patients);
  } catch (error) {
    debug.error("Detailed error fetching patients:", error.stack);
    res.status(500).json({
      error: "Failed to fetch patients",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * GET /patients/:id
 * Retrieves a specific patient by ID
 */
router.get("/patients/:id", isAuthenticated, async (req, res) => {
  try {
    const patient = await fetchRow("SELECT * FROM patients WHERE id = $1", [
      req.params.id,
    ]);

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    res.json(patient);
  } catch (error) {
    debug.error(`Failed to fetch patient ${req.params.id}:`, error);
    res.status(500).json({
      error: "Failed to fetch patient",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * GET /patient-count
 * Gets the total count of patients
 */
router.get("/patient-count", isAuthenticated, async (req, res) => {
  try {
    const res = await fetchRow(`
      SELECT COUNT(id) AS count 
      FROM patients
      `);
    const count = parseInt(res?.count || 0, 10);

    res.json({
      ok: true,
      count,
    });
  } catch (error) {
    debug.error("Failed to fetch patient count:", error);
    res.status(500).json({
      ok: false,
      error: "Database error",
      count: 0,
    });
  }
});
/**
 * POST /patients
 * Creates a new patient
 */
router.post("/patients", isAuthenticated, async (req, res) => {
  try {
    const patientData = req.body;

    if (!patientData || Object.keys(patientData).length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Request body is empty or invalid",
      });
    }

    const createdPatient = await insertRow("patient", patientData);
    res.status(201).json(createdPatient);
  } catch (error) {
    debug.error("Failed to create patient:", error);
    res.status(500).json({
      error: "Failed to create patient",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * PUT /patients/:id
 * Updates an existing patient
 */
router.put("/patients/:id", isAuthenticated, async (req, res) => {
  try {
    const patientId = req.params.id;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Build dynamic update query
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClauses.push(`"${key}" = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    values.push(patientId);

    const query = `
      UPDATE patients 
      SET ${setClauses.join(", ")} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const updatedPatient = await updateRow(query, values);

    if (!updatedPatient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      success: true,
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    debug.error(`Failed to update patient ${req.params.id}:`, error);
    res.status(500).json({
      error: "Failed to update patient",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * DELETE /patients/:id
 * Deletes a patient (admin only)
 */
router.delete("/patients/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const patientId = req.params.id;

    const deletedPatient = await deleteRows("patients", "id = $1", [id]);

    if (deletedPatient.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // // Clean up patient's upload directory
    // try {
    //   const patientDir = getPatientUploadDir(patientId);
    //   await fs.rm(patientDir, { recursive: true, force: true });
    //   debug.log(`Cleaned up upload directory for patient ${patientId}`);
    // } catch (dirError) {
    //   // Directory might not exist, which is fine
    //   debug.log(`No upload directory to clean for patient ${patientId}`);
    // }

    res.json({
      success: true,
      message: "Patient deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    debug.error(`Failed to delete patient ${req.params.id}:`, error);
    res.status(500).json({
      error: "Failed to delete patient",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
//#endregion

//#region ===== FILE ROUTES =====
/**
 * POST /patients/:id/upload
 * Uploads a file for a specific patient
 */
router.post(
  "/patients/:id/upload",
  isAuthenticated,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      res.status(200).json({
        success: true,
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: `/uploads/patients/${req.params.id}/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error) {
      debug.error(`Failed to upload file for patient ${req.params.id}:`, error);
      res.status(500).json({
        error: "Failed to upload file",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);
/**
 * GET /patients/:id/files
 * Gets all files for a specific patient
 */
router.get("/patients/:id/files", isAuthenticated, async (req, res) => {
  try {
    const patientId = req.params.id;
    const dirPath = getPatientUploadDir(patientId);

    try {
      await fs.access(dirPath);
    } catch {
      return res.json([]);
    }

    const files = await fs.readdir(dirPath);
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(dirPath, filename);
        const stats = await fs.stat(filePath);

        return {
          filename,
          originalname: filename,
          path: `/uploads/patients/${patientId}/${filename}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          mimetype: path.extname(filename).toLowerCase(),
        };
      }),
    );

    res.json(fileDetails);
  } catch (error) {
    debug.error(`Failed to get files for patient ${req.params.id}:`, error);
    res.status(500).json({
      error: "Failed to get files",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * DELETE /files
 * Deletes a file
 */
router.delete("/files", isAuthenticated, async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: "filePath is required" });
    }

    const normalizedPath = path
      .normalize(filePath)
      .replace(/^(\.\.[\\/])+/, "")
      .replace(/\\/g, "/");

    const uploadsIndex = normalizedPath.indexOf("uploads/");
    if (uploadsIndex === -1) {
      return res.status(400).json({
        error: "Invalid file path - must be within uploads directory",
      });
    }

    const relativePath = normalizedPath.substring(uploadsIndex + 8);
    const fullPath = path.join(UPLOADS_BASE_DIR, relativePath);

    // Additional security check
    if (!fullPath.startsWith(path.normalize(UPLOADS_BASE_DIR))) {
      return res.status(403).json({
        error: "Access denied",
        message: "Invalid path traversal attempt",
      });
    }

    try {
      await fs.access(fullPath);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        return res.status(400).json({
          error: "Path is a directory",
        });
      }

      await fs.unlink(fullPath);

      res.json({
        success: true,
        message: "File deleted successfully",
        path: relativePath,
      });
    } catch (error) {
      console.error("Deletion error:", error);
      if (e.code === "ENOENT")
        return res.status(404).json({
          error: "Not found",
          requestedPath: relativePath,
          actualSearchedPath: fullPath,
        });
      if (error.code === "EPERM")
        return res
          .status(403)
          .json({ error: "Permission denied", message: error.message });
      if (error.code === "EISDIR")
        return res
          .status(400)
          .json({ error: "Path is a directory", message: error.message });
      throw error;
    }
  } catch (error) {
    debug.error("Failed to delete file:", error);
    res.status(500).json({
      error: "Failed to delete file",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
//#endregion

//#region ===== MEDS =====
/**
 * GET /patients/:id/medications
 * Gets all medications for a specific patient
 */
router.get("/patients/:id/medications", isAuthenticated, async (req, res) => {
  try {
    const medications = await fetchRows(
      "SELECT * FROM medications WHERE patient_id = $1 ORDER BY created_at DESC",
      [req.params.id],
    );

    res.json(medications);
  } catch (error) {
    debug.error(
      `Failed to fetch medications for patient ${req.params.id}:`,
      error,
    );
    res.status(500).json({
      error: "Failed to fetch medications",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * POST /patients/:id/medications
 * Adds a new medication for a patient
 */
router.post("/patients/:id/medications", isAuthenticated, async (req, res) => {
  try {
    const { name, dosage, frequency } = req.body;
    const patientId = req.params.id;

    if (!name || !dosage || !frequency) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "dosage", "frequency"],
      });
    }

    const medicationData = {
      patient_id: patientId,
      name,
      dosage,
      frequency,
    };

    const createdMedication = await insertRow("medications", medicationData);

    res.status(201).json({
      success: true,
      medicationId: createdMedication,
    });
  } catch (error) {
    debug.error(
      `Failed to add medication for patient ${req.params.id}:`,
      error,
    );
    res.status(500).json({
      error: "Failed to add medication",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * PUT /medications/:medId
 * Updates a medication
 */
router.put("/medications/:medId", isAuthenticated, async (req, res) => {
  try {
    const medicationId = req.params;
    const updates = req.body;

    const currentMedication = await fetchRow(
      "SELECT * FROM medications WHERE id = $1",
      [medicationId],
    );

    if (!currentMedication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    const mergedData = {
      name: updates.name !== undefined ? updates.name : currentMedication.name,
      dosage:
        updates.dosage !== undefined
          ? updates.dosage
          : currentMedication.dosage,
      frequency:
        updatedMed.frequency !== undefined
          ? updates.frequency
          : currentMedication.frequency,
    };

    const updatedMedication = await updateRow(
      `UPDATE medications 
       SET name = $1, dosage = $2, frequency = $3
       WHERE id = $4
       RETURNING *`,
      [mergedData.name, mergedData.dosage, mergedData.frequency, medicationId],
    );

    res.json(updatedMedication);
  } catch (error) {
    debug.error(`Failed to update medication ${req.params.medId}:`, error);
    res.status(500).json({
      error: "Failed to update medication",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * DELETE /medications/:medId
 * Deletes a medication
 */
router.delete("/medications/:medId", isAuthenticated, async (req, res) => {
  try {
    const medicationId = parseInt(req.params.medId, 10);

    if (isNaN(medicationId)) {
      return res.status(400).json({
        success: false,
        message: "Неверный ID назначения",
      });
    }

    const deletedMedications = await deleteRows("medications", "id = $1", [
      medicationId,
    ]);

    if (deletedMedications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Назначение не найдено",
      });
    }

    res.json({
      success: true,
      message: "Назначение удалено",
      medication: deletedMedications[0],
    });
  } catch (error) {
    console.error(`Ошибка при удалении назначений ${req.params.medId}:`, error);
    res.status(500).json({
      error: "Failed to delete medication",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
//#endregion

//#region ===== VITALS =====
/**
 * POST /patients/:id/pulse
 * Records pulse data for a patient
 */
router.post("/patients/:id/pulse", isAuthenticated, async (req, res) => {
  try {
    const pulseValue = req.body.pulseValue;
    const patientId = req.params.id;

    if (isNaN(pulseValue) || pulseValue <= 0) {
      return res.status(400).json({
        error: "Invalid pulse value",
        message: "Pulse must be a positive number between 1 and 300",
      });
    }

    const pulseData = {
      patient_id: patientId,
      pulse_value: pulseValue,
    };

    const createdPulse = await insertRow("patient_pulse", pulseData);

    res.json({
      success: true,
      pulseId: createdPulse.id,
      pulseValue: createdPulse.pulse_value,
      timestamp: createdPulse.created_at,
    });
  } catch (error) {
    debug.error(`Failed to record pulse for patient ${req.params.id}:`, error);
    res.status(500).json({
      error: "Failed to record pulse",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * GET /patients/:id/pulse
 * Gets pulse history for a patient
 */
router.get("/patients/:id/pulse", isAuthenticated, async (req, res) => {
  try {
    const pulseHistory = await fetchRows(
      "SELECT pulse_value, created_at FROM patient_pulse WHERE patient_id=$1 ORDER BY created_at ASC",
      [req.params.id],
    );

    const formatted = pulseHistory.map((record) => ({
      value: record.pulse_value,
      timestamp: record.created_at,
      formattedTime: new Date(record.created_at).toLocaleTimeString(),
      formattedDate: new Date(record.created_at).toLocaleDateString(),
    }));

    res.json(formatted);
  } catch (e) {
    debug.error(
      `Failed to fetch pulse history for patient ${req.params.id}:`,
      error,
    );
    res.status(500).json({
      error: "Failed to fetch pulse history",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * POST /patients/:id/o2
 * Records oxygen saturation data for a patient
 */
router.post("/patients/:id/o2", isAuthenticated, async (req, res) => {
  try {
    const o2Value = req.body.o2Value;
    const patientId = req.params.id;

    if (isNaN(val) || o2Value < 0 || o2Value > 100) {
      return res.status(400).json({
        error: "Invalid O2 value",
        message: "Oxygen saturation must be between 0 and 100",
      });
    }

    const o2Data = {
      patient_id: patientId,
      o2_value: o2Value,
    };

    const createdO2 = await insertRow("patient_o2", o2Data);

    res.json({
      success: true,
      o2Id: createdO2.id,
      o2Value: createdO2.o2_value,
      timestamp: createdO2.created_at,
    });
  } catch (error) {
    debug.error(`Failed to record O2 for patient ${req.params.id}:`, error);
    res.status(500).json({
      error: "Failed to record oxygen saturation",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
/**
 * GET /patients/:id/o2
 * Gets oxygen saturation history for a patient
 */
router.get("/patients/:id/o2", isAuthenticated, async (req, res) => {
  try {
    const o2History = await fetchRows(
      `SELECT o2_value, created_at 
      FROM patient_o2 
      WHERE patient_id=$1 
      ORDER BY created_at ASC`,
      [req.params.id],
    );

    const formatted = o2History.map((record) => ({
      value: record.o2_value,
      timestamp: record.created_at,
      formattedTime: new Date(record.created_at).toLocaleTimeString(),
      formattedDate: new Date(record.created_at).toLocaleDateString(),
    }));

    res.json(formatted);
  } catch (error) {
    debug.error(
      `Failed to fetch O2 history for patient ${req.params.id}:`,
      error,
    );
    res.status(500).json({
      error: "Failed to fetch oxygen saturation history",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
//#endregion

module.exports = router;
