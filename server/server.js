const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;
const { exec } = require("child_process");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json");
  }
  next();
});
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "volmed_db",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const patientId = req.params.id;
    const uploadPath = `./uploads/patients/${patientId}`;

    // Create directory if it doesn't exist
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

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});

// Amount of ID's in DB
app.get("/api/patient-count", (req, res) => {
  db.query("SELECT COUNT(id) AS count FROM patients", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({
      count: results[0].count,
    });
  });
});

// Get all patients
app.get("/api/patients", (req, res) => {
  db.query("SELECT * FROM patients", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Add a new patient
app.post("/api/patients", (req, res) => {
  const newPatient = req.body;

  db.query(
    "INSERT INTO patients SET ?",
    newPatient,
    (insertErr, insertResults) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({
          error: "Database error",
          message: insertErr.message,
        });
      }

      const patientId = insertResults.insertId;

      // Fetch the newly created patient
      db.query(
        "SELECT * FROM patients WHERE id = ?",
        [patientId],
        (selectErr, selectResults) => {
          if (selectErr) {
            console.error(selectErr);
            return res.status(500).json({
              error: "Could not retrieve created patient",
            });
          }

          if (selectResults.length === 0) {
            return res.status(500).json({
              error: "Patient not found after creation",
            });
          }

          // Single response with the created data
          res.status(201).json(selectResults[0]);
        }
      );
    }
  );
});

// Update a patient
app.put("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  const editPatient = req.body;

  db.query(
    "UPDATE patients SET ? WHERE id = ?",
    [editPatient, id],
    (updateErr, updateResults) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({
          error: "Update failed",
          details: updateErr.message,
        });
      }

      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Single response after successful update
      db.query(
        "SELECT * FROM patients WHERE id = ?",
        [id],
        (selectErr, selectResults) => {
          if (selectErr) {
            console.error(selectErr);
            return res.status(500).json({
              error: "Fetch failed",
              details: selectErr.message,
            });
          }

          res.json({
            success: true,
            message: "Patient updated successfully",
            patient: selectResults[0],
          });
        }
      );
    }
  );
});

// Delete a patient
app.delete("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM patients WHERE id = ?", id, (err, results) => {
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
});

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

app.get("/api/patients/:id", (req, res) => {
  const { id } = req.params;

  // Validate ID is a number
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid patient ID format" });
  }

  db.query("SELECT * FROM patients WHERE id = ?", id, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json(results[0]);
  });
});

// Upload patient files
app.post("/api/patients/:id/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // res.json({
  //   filename: (req, file, cb) => {
  //     const originalname = file.originalname;
  //     const ext = path.extname(originalname);
  //     const basename = path.basename(originalname, ext);

  //     const safeName = basename.replace(/[^a-zA-Z0-9-_]/g, "") + ext;
  //     const fullPath = `./uploads/patients/${req.params.id}/${safeName}`;

  //     if (fs.existsSync(fullPath)) {
  //       let counter = 1;
  //       let newName = `${basename} (${counter})${ext}`;

  //       while (
  //         fs.existsSync(`./uploads/patients/${req.params.id}/${newName}`)
  //       ) {
  //         counter++;
  //         newName = `${basename} (${counter})${ext}`;
  //       }

  //       cb(null, newName);
  //     } else {
  //       cb(null, safeName);
  //     }
  //   },
  // });

  res.json({
    success: true,
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: `/uploads/patients/${req.params.id}/${req.file.filename}`,
    size: req.file.size,
  });
});

// Get patient files
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

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  next();
});

app.use("/uploads", express.static("uploads"));
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
