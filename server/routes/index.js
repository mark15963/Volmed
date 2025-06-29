const { Router } = require("express");
const authRouter = require("./auth");
const patientsRouter = require("./patients");

const router = Router();

router.use(authRouter);
router.use(patientsRouter);

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

module.exports = router;
