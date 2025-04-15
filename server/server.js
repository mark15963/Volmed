const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "volmed_db",
});

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
    if (err) throw err;
    res.json(results);
  });
});

// Add a new patient
app.post("/api/patients", (req, res) => {
  const newPatient = req.body;
  db.query("INSERT INTO patients SET ?", newPatient, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    // Get the full inserted record
    db.query(
      "SELECT * FROM patients WHERE id = ?",
      [results.insertId],
      (err, patientResults) => {
        if (err || patientResults.length === 0) {
          return res.status(201).json(newPatient); // Fallback to what was sent
        }

        res.status(201).json(patientResults[0]); // Return complete patient data
      }
    );
  });
});

// Update a patient
app.put("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  const editPatient = req.body;

  db.query(
    "UPDATE patients SET ? WHERE id = ?",
    [editPatient, id],
    (err, results) => {
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

      // Get the updated patient
      db.query(
        "SELECT * FROM patients WHERE id = ?",
        [id],
        (err, patientResults) => {
          if (err || patientResults.length === 0) {
            console.error(err || "Patient not found after update");
            return res.json({
              success: true,
              message: "Patient updated but could not retrieve details",
              patient: editPatient, // Return what we have
            });
          }

          res.json({
            success: true,
            message: "Patient updated successfully",
            patient: patientResults[0],
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

app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;

  // Validate ID is a number
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid patient ID format" });
  }

  db.query("SELECT * FROM users WHERE id = ?", id, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(results[0]);
  });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  try {
    db.query(
      "SELECT id, username, password, firstName, lastName, patr FROM users WHERE username = ?",
      [username],
      async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        if (results.length === 0) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        const userResponse = {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          patr: user.patr,
        };

        res.json({
          success: true,
          message: "Login successful",
          user: userResponse,
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Registration endpoint (when creating new users)
app.post("/api/register", async (req, res) => {
  const { username, password, firstName, lastName, patr } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Username and password are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    db.query(
      "INSERT INTO users (username, password, firstName, lastName, patr) VALUES (?, ?, ?, ?, ?)",
      [username, hashedPassword, firstName, lastName, patr],
      (err, results) => {
        if (err) {
          console.error(err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              success: false,
              error: "Username already exists",
            });
          }
          return res.status(500).json({
            success: false,
            error: "Database error",
          });
        }

        res.status(201).json({
          success: true,
          message: "User created successfully",
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Error creating user",
    });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
