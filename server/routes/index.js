const { Router } = require("express");
const { db } = require("../config/db-connection");

const authRouter = require("./auth");
const patientsRouter = require("./patients");
const usersRouter = require("./users");
const chatRoutes = require("./chat");

const router = Router();

router.use(authRouter);
router.use(patientsRouter);
router.use(usersRouter);
router.use("/chat", chatRoutes);

router.get("/", (req, res) => {
  res.render("main", {
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,
    sessionAuth: req.session.isAuth,
    cookiesUser: req.cookies.user,
  });
});

// Health Check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    database: db ? "connected" : "disconnected",
  });
});

// General Data
router.get("/general-data", async (req, res) => {
  try {
    const client = await db.connect();
    try {
      const { rows } = await db.query("SELECT * FROM general");
      res.json(rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Fetching General Data error details:", err);
    res.status(500).json({
      error: "Failed to fetch general data",
      details: err.message,
    });
  }
});
router.put("/general-data", async (req, res) => {
  const { hospitalName, backgroundColor } = req.body;

  // const keys = Object.keys(edited),
  //   values = Object.values(edited);

  // if (keys.length === 0) {
  //   return res.status(400).json({ error: "No fields to update" });
  // }

  // const setSQL = keys.map((k, i) => `"${k}"=$${i + 1}`).join(", ");
  // const q = `UPDATE general SET ${setSQL} RETURNING *`;

  try {
    const client = await db.connect();
    try {
      const result = await db.query(
        'UPDATE general SET "hospitalName" =  $1, "backgroundColor" = $2 RETURNING *',
        [hospitalName, backgroundColor]
      );
      if (result.rows.length > 0) res.status(200).json(result.rows[0]);
      else res.status(404).send("Record not found");
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Update error:", e.stack);
    res.status(500).json({
      error: "Database update failed",
      message: e.message,
      detail: e.detail,
    });
  }
});

module.exports = router;
