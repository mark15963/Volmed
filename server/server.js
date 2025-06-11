const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
console.log("Environment variables:", process.env);
console.log("DB_HOST:", process.env.DB_HOST);

const { Pool } = require("pg");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const fsp = fs.promises;
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.104:5173",
  "https://volmed-o4s0.onrender.com",
  process.env.FRONTEND_URL,
];

const corsOptions = {
  origin: (origin, cb) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.includes("render.com")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    // 30 seconds timeout
    res.status(503).json({ error: "Request timeout" });
  });
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const patientId = req.params.id;
    const uploadPath = path.join(uploadDir, "patients", patientId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    const ext = path.extname(originalname);
    const basename = path.basename(originalname, ext);
    const safeName = basename.replace(/[^a-zA-Z0-9-_]/g, "") + ext;
    const fullPath = `./uploads/patients/${req.params.id}/${safeName}`;

    if (fs.existsSync(fullPath)) {
      let counter = 1;
      let newName = `${basename} (${counter})${ext}`;

      while (fs.existsSync(`./uploads/patients/${req.params.id}/${newName}`)) {
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

// DB connection test
async function testDbConnection() {
  const retries = 5,
    delay = 2000;
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`Connection attempt ${i}/${retries}`);
      const client = await db.connect();
      await client.query("SELECT 1");
      client.release();
      console.log("✅ Database connection verified");
      return;
    } catch (err) {
      console.error(`Attempt ${i} failed:`, err.message);
      if (i < retries) await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("❌ Maximum DB connection attempts reached");
}

// Content Security Policy
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json");
  }
  next();
});

//-----HOME-----
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>VolMed Server</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        .endpoint { background: #f4f4f4; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>VolMed API Server</h1>
      <p>Server is running successfully!</p>
      <p>Frontend: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
    </body>
    </html>
  `);
});

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    database: db ? "connected" : "disconnected",
  });
});

//-----PATIENTS-----
// Get all patients
app.get("/api/patients", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM patients ORDER BY id");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});
//Get data of a specific patient
app.get("/api/patients/:id", async (req, res) => {
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
app.get("/api/patient-count", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT COUNT(id) AS count FROM patients");
    res.json({ count: parseInt(rows[0].count, 10) || 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error", count: 0 });
  }
});
// Add a new patient
app.post("/api/patients", async (req, res) => {
  const newPatient = req.body;

  const keys = Object.keys(newPatient);
  const values = Object.values(newPatient);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const insertQuery = `
  INSERT INTO patients (${keys.join(", ")})
  VALUES (${placeholders})
  RETURNING *
`;

  try {
    const { rows } = await db.query(insertQuery, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});
// Update a patient
app.put("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  const editPatient = req.body;

  // db.query(
  //   "UPDATE patients SET ? WHERE id = ?",
  //   [editPatient, id],
  //   (updateErr, updateResults) => {
  //     if (updateErr) {
  //       console.error(updateErr);
  //       return res.status(500).json({
  //         error: "Update failed",
  //         details: updateErr.message,
  //       });
  //     }

  //     if (updateResults.affectedRows === 0) {
  //       return res.status(404).json({ error: "Patient not found" });
  //     }

  //     // Single response after successful update
  //     db.query(
  //       "SELECT * FROM patients WHERE id = ?",
  //       [id],
  //       (selectErr, selectResults) => {
  //         if (selectErr) {
  //           console.error(selectErr);
  //           return res.status(500).json({
  //             error: "Fetch failed",
  //             details: selectErr.message,
  //           });
  //         }

  //         res.json({
  //           success: true,
  //           message: "Patient updated successfully",
  //           patient: selectResults[0],
  //         });
  //       }
  //     );
  //   }
  // );
  const keys = Object.keys(editPatient);
  const values = Object.values(editPatient);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const query = `UPDATE patients SET ${setClause} WHERE id = $${
    keys.length + 1
  } RETURNING *`;

  const { rows } = await db.query(query, [...values, id]);
});
// Delete a patient
app.delete("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await db.query("DELETE FROM patients WHERE id = $1", [
    id,
  ]);

  if (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Database error",
      message: err.message,
    });
  }

  if (results.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      error: "Patient not found",
    });
  }

  res.json({
    success: true,
    message: "Patient deleted successfully",
    deletedId: id,
  });
});

//-----DATABASE-----
// DB backup
app.get("/api/backup", (req, res) => {
  const dbUser = "root";
  const dbPassword = "";
  const dbName = "volmed_db";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const backupDir = path.join(__dirname, "DB_Backup");
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

  console.log("🗂 Проверка папки DB_Backup:", backupDir);

  console.log("📂 Директория бэкапов:", backupDir);
  console.log("📄 Путь к файлу бэкапа:", backupFile);

  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log("✅ Папка DB_Backup создана");
    }
  } catch (err) {
    console.error("❌ Ошибка при создании папки:", err);
    return res.status(500).json({ error: "Не удалось создать папку" });
  }

  const mysqldumpPath = `"C:\\xampp\\mysql\\bin\\mysqldump.exe"`;

  const command = `${mysqldumpPath} -u ${dbUser} ${
    dbPassword ? `-p${dbPassword}` : ""
  } ${dbName} > "${backupFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Ошибка при создании бэкапа:", error.message);
      console.error("stderr:", stderr);
      return res.status(500).json({
        error: "Ошибка создания бэкапа",
        details: error.message,
        stderr,
      });
    }

    res.download(backupFile, (err) => {
      if (err) {
        console.error("Ошибка при скачивании:", err);
      }
    });
  });
});
// DB restore
app.get("/api/restore", (req, res) => {
  const dbUser = "root";
  const dbPassword = "";
  const dbName = "volmed_db";

  // Check if database exists
  db.query("SHOW DATABASES LIKE ?", [dbName], (err, results) => {
    if (err) {
      console.error("Error checking database existence:", err);
      return res.status(500).json({ error: "Database check failed" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Database already exists" });
    }

    // Find the latest backup file
    const backupDir = path.join(__dirname, "DB_Backup");
    if (!fs.existsSync(backupDir)) {
      return res.status(404).json({ error: "Backup directory not found" });
    }

    const backupFiles = fs
      .readdirSync(backupDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()
      .reverse();

    if (backupFiles.length === 0) {
      return res.status(404).json({ error: "No backup files found" });
    }

    const latestBackup = path.join(backupDir, backupFiles[0]);
    console.log("🔁 Restoring from backup:", latestBackup);

    // First create the database
    db.query(`CREATE DATABASE ${dbName}`, (err) => {
      if (err) {
        console.error("Error creating database:", err);
        return res.status(500).json({ error: "Database creation failed" });
      }

      console.log("✅ Database created");

      // Now restore the backup
      const mysqlPath = `"C:\\xampp\\mysql\\bin\\mysql.exe"`;
      const command = `${mysqlPath} -u ${dbUser} ${
        dbPassword ? `-p${dbPassword}` : ""
      } ${dbName} < "${latestBackup}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("Restore error:", error.message);
          console.error("stderr:", stderr);
          return res.status(500).json({
            error: "Restore failed",
            details: error.message,
            stderr,
          });
        }

        console.log("✅ Database restored successfully");
        res.json({ success: true, message: "Database restored successfully" });
      });
    });
  });
});

//-----FILES-----
// Upload files to a specific patient
app.post("/api/patients/:id/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    success: true,
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: `/uploads/patients/${req.params.id}/${req.file.filename}`,
    size: req.file.size,
  });
});
// Get files of a specific patient
app.get("/api/patients/:id/files", (req, res) => {
  const patientId = req.params.id;
  const uploadPath = `./uploads/patients/${patientId}`;

  if (!fs.existsSync(uploadPath)) {
    return res.json([]);
  }

  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Error reading directory" });
    }

    const fileList = files.map((file) => {
      const stat = fs.statSync(path.join(uploadPath, file));
      return {
        filename: file,
        originalname: file,
        path: `/uploads/patients/${patientId}/${file}`,
        size: stat.size,
      };
    });

    res.json(fileList);
  });
});
// Delete patient's file
app.delete("/api/files", async (req, res) => {
  try {
    // 1. Validate request body
    if (!req.body || !req.body.filePath) {
      return res.status(400).json({
        error: "Bad request",
        message: "filePath is required in request body",
      });
    }
    const { filePath } = req.body;

    // 2. Construct safe path (with additional security)
    const uploadsDir = path.join(__dirname, "uploads");
    const normalizedFilePath = path
      .normalize(filePath)
      .replace(/^(\.\.[\/\\])+/g, "") // Prevent directory traversal
      .replace(/\\/g, "/"); // Normalize to forward slashes

    const fullPath = path.join(uploadsDir, normalizedFilePath);

    // 3. Verify the path is within allowed directory
    if (!fullPath.startsWith(path.normalize(uploadsDir))) {
      console.error("Security violation: Attempted path:", fullPath);
      return res.status(403).json({
        error: "Access denied",
        message: "Invalid file path",
      });
    }

    // 4. Verify file exists (using promises)
    try {
      await fsp.access(fullPath);
    } catch (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({
          error: "Not found",
          message: "File does not exist",
        });
      }
      throw err;
    }

    // 5. Delete the file (using promises)
    await fsp.unlink(fullPath);

    res.json({
      success: true,
      message: "File deleted successfully",
      path: normalizedFilePath,
    });
  } catch (error) {
    console.error("File deletion error:", error);

    // Handle specific errors
    let status = 500;
    let errorMessage = "Internal server error";

    if (error.code === "EPERM") {
      status = 403;
      errorMessage = "Permission denied";
    } else if (error.code === "EISDIR") {
      status = 400;
      errorMessage = "Path is a directory";
    }

    res.status(status).json({
      error: errorMessage,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
});

//-----MEDS-----
// Show patient's medications
app.get("/api/patients/:id/medications", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM medications WHERE patient_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("DB fetch error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Parse the administered field from JSON if needed
      const parsedResults = results.map((m) => ({
        ...m,
        administered: m.administered ? JSON.parse(m.administered) : [],
      }));

      res.json(parsedResults);
    }
  );
});
// Add medication to a patient
app.post("/api/patients/:id/medications", (req, res) => {
  const { id } = req.params;
  const { name, dosage, frequency, administered } = req.body;

  if (!name || !dosage || !frequency) {
    return res
      .status(400)
      .json({ error: "Missing required medication fields" });
  }

  const medicationData = {
    patient_id: id,
    name,
    dosage,
    frequency,
    administered: JSON.stringify(administered || []), // Convert array to JSON
  };

  db.query("INSERT INTO medications SET ?", medicationData, (err, results) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({ success: true, medicationId: results.insertId });
  });
});
// Update a medication of a patient
app.put("/api/medications/:medId", (req, res) => {
  const { medId } = req.params;
  const { name, dosage, frequency, administered } = req.body;

  const updateData = {
    ...(name && { name }),
    ...(dosage && { dosage }),
    ...(frequency && { frequency }),
    administered: administered
      ? JSON.stringify(administered)
      : JSON.stringify([]),
  };

  db.query(
    "UPDATE medications SET ? WHERE id = ?",
    [updateData, medId],
    (err, results) => {
      if (err) {
        console.error("DB update error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Medication not found" });
      }

      db.query(
        "SELECT * FROM medications WHERE id = ?",
        [medId],
        (err2, meds) => {
          if (err2) {
            console.error("DB fetch error:", err2);
            return res.status(500).json({ error: "Database error" });
          }

          if (meds.length === 0) {
            return res
              .status(404)
              .json({ error: "Medication not found after update" });
          }

          const med = meds[0];
          med.administered = med.administered
            ? JSON.parse(med.administered)
            : [];
          res.json({ success: true, medication: med });
        }
      );
    }
  );
});
// Delete a medication from a patient
app.delete("/api/medications/:medId", (req, res) => {
  const { medId } = req.params;

  db.query("DELETE FROM medications WHERE id = ?", medId, (err, results) => {
    if (err) {
      console.error("DB delete error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Medication not found" });
    }

    res.json({
      success: true,
      message: "Medication deleted successfully",
      deletedId: medId,
    });
  });
});

//-----STATES-----
// Save pulse data
app.post("/api/patients/:id/pulse", (req, res) => {
  const { id } = req.params;
  const { pulseValue } = req.body;

  if (!pulseValue || isNaN(pulseValue)) {
    return res.status(400).json({ error: "Invalid pulse value" });
  }

  db.query(
    "INSERT INTO patient_pulse (patient_id, pulse_value) VALUES (?, ?)",
    [id, pulseValue],
    (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true, pulseId: results.insertId });
    }
  );
});
// Get pulse data
app.get("/api/patients/:id/pulse", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT pulse_value, created_at FROM patient_pulse WHERE patient_id = ? ORDER BY created_at ASC",
    [id],
    (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      // Format the dates before sending
      const formattedResults = results.map((item) => ({
        value: item.pulse_value,
        timestamp: item.created_at,
        formattedTime: new Date(item.created_at).toLocaleTimeString(),
        formattedDate: new Date(item.created_at).toLocaleDateString(),
      }));
      res.json(formattedResults);
    }
  );
});

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self'"
  );
  next();
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

async function startServer() {
  try {
    await testDbConnection();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database connected to: ${process.env.DB_HOST}`);
      server.keepAliveTimeout = 60000;
      server.headersTimeout = 65000;
    });

    process.on("SIGTERM", () => {
      console.log("Shutting down gracefully...");
      server.close(() => {
        db.end();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
