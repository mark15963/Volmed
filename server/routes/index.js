const { Router } = require("express");
const { db } = require("../services/db-connection");

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
  const sessionData = req.session
    ? JSON.stringify(req.session, null, 2) // Pretty-print JSON
    : "null";
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
        <p>Server is running successfully in ${process.env.NODE_ENV} mode</p>
        
        <p>Frontend: 
            <a href="${process.env.FRONTEND_URL}">
                ${process.env.FRONTEND_URL}
            </a>
        </p>
        
        <p>Logged in: ${
          req.session.isAuth && req.cookies.user ? req.session.isAuth : false
        }</p>
        
        <p>Logged user: ${
          req.session.isAuth && req.cookies.user ? req.cookies.user : "None"
        }</p>
        
        <button onClick="window.location.pathname='/dashboard'">Dashboard</button>
    </body>
    </html>
  `);
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
