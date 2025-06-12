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

// const corsOptions = {
//   origin: (origin, cb) => {
//     if (
//       !origin ||
//       allowedOrigins.includes(origin) ||
//       origin.includes("render.com")
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Important for cookies/auth
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// app.use(cors({ origin: "*", credentials: true }));

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
  const newP = req.body;
  const keys = Object.keys(newP),
    values = Object.values(newP);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const q = `INSERT INTO patients (${keys.join(
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
app.put("/api/patients/:id", async (req, res) => {
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
app.delete("/api/patients/:id", async (req, res) => {
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
app.post("/api/patients/:id/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
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
app.delete("/api/files", async (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: "filePath is required" });

  const uploadsDir = path.join(__dirname, "uploads");
  const normalized = path
    .normalize(filePath)
    .replace(/^(\.\.[\\/])+/, "")
    .replace(/\\/g, "/");
  const full = path.join(uploadsDir, normalized);

  if (!full.startsWith(path.normalize(uploadsDir))) {
    return res
      .status(403)
      .json({ error: "Access denied", message: "Invalid path" });
  }

  try {
    await fsp.access(full);
    await fsp.unlink(full);
    res.json({ success: true, message: "Deleted", path: normalized });
  } catch (e) {
    console.error(e);
    if (e.code === "ENOENT")
      return res.status(404).json({ error: "Not found" });
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
app.get("/api/patients/:id/medications", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM medications WHERE patient_id = $1",
      [req.params.id]
    );

    const out = rows.map((m) => {
      let administered = [];

      try {
        if (m.administered) {
          administered = JSON.parse(m.administered);
          if (!Array.isArray(administered)) {
            console.warn(
              `Administered field for medication ID ${m.id} is not an array. Resetting to empty array.`
            );
            administered = [];
          }
        }
      } catch (err) {
        console.warn(
          `Failed to parse 'administered' for medication ID ${m.id}:`,
          err.message
        );
      }

      return {
        ...m,
        administered,
      };
    });

    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});
// Add medication to a patient
app.post("/api/patients/:id/medications", async (req, res) => {
  const { name, dosage, frequency, administered } = req.body;
  if (!name || !dosage || !frequency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const adminJSON = JSON.stringify(administered || []);
  const q = `
    INSERT INTO medications (patient_id, name, dosage, frequency, administered)
    VALUES ($1,$2,$3,$4,$5) RETURNING id
  `;
  try {
    const { rows } = await db.query(q, [
      req.params.id,
      name,
      dosage,
      frequency,
      adminJSON,
    ]);
    res.status(201).json({ success: true, medicationId: rows[0].id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB insert error", message: e.message });
  }
});
// Update a medication of a patient
app.put("/api/medications/:medId", async (req, res) => {
  const { medId } = req.params;
  const { administered } = req.body;

  const administeredJSON = JSON.stringify(
    Array.isArray(administered) ? administered : []
  );

  try {
    const result = await db.query(
      `UPDATE medications SET administered = $1 WHERE id = $2 RETURNING *`,
      [administeredJSON, medId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Medication not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating medication:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Delete a medication from a patient
app.delete("/api/medications/:medId", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://volmed-o4s0.onrender.com");
  res.header("Access-Control-Allow-Credentials", "true");

  const medId = parseInt(req.params.medId, 10);

  if (isNaN(medId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid medication ID",
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
        message: "Medication not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medication deleted",
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

//-----STATES------
// Save pulse data
app.post("/api/patients/:id/pulse", async (req, res) => {
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
app.get("/api/patients/:id/pulse", async (req, res) => {
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

//-----DATABASE-----
// DB backup
app.get("/api/backup", (req, res) => {
  const dumpFile = path.join(
    __dirname,
    "DB_Backup",
    `backup-${Date.now()}.dump`
  );
  if (!fs.existsSync(path.dirname(dumpFile)))
    fs.mkdirSync(path.dirname(dumpFile), { recursive: true });

  const user = process.env.DB_USER || "postgres";
  const host = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;
  const cmd = `pg_dump -U ${user} -h ${host} -d ${dbName} -F c -f "${dumpFile}"`;

  exec(cmd, { env: process.env }, (err, stdout, stderr) => {
    if (err) {
      console.error("Backup error:", stderr);
      return res.status(500).json({ error: "Backup failed", details: stderr });
    }
    res.download(dumpFile);
  });
});
// DB restore
app.get("/api/restore", (req, res) => {
  const dir = path.join(__dirname, "DB_Backup");
  if (!fs.existsSync(dir))
    return res.status(404).json({ error: "Backup folder not found" });
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".dump"))
    .sort()
    .reverse();
  if (!files.length)
    return res.status(404).json({ error: "No backup files found" });

  const latest = path.join(dir, files[0]);
  const user = process.env.DB_USER || "postgres";
  const host = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;

  const dropCreate = `psql -U ${user} -h ${host} -c "DROP DATABASE ${dbName}; CREATE DATABASE ${dbName};"`;
  const restoreCmd = `pg_restore -U ${user} -h ${host} -d ${dbName} -c "${latest}"`;

  exec(
    `${dropCreate} && ${restoreCmd}`,
    { env: process.env },
    (err, stdout, stderr) => {
      if (err) {
        console.error("Restore error:", stderr);
        return res
          .status(500)
          .json({ error: "Restore failed", details: stderr });
      }
      res.json({ success: true, message: "Database restored successfully" });
    }
  );
});

// Global error handler
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
