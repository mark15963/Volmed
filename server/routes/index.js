const { Router } = require("express");
const { db } = require("../config/db-connection");

const authRouter = require("./auth");
const patientsRouter = require("./patients");
const usersRouter = require("./users");
const chatRoutes = require("./chat");
const generalRoutes = require("./general");

const router = Router();

router.use(authRouter);
router.use(patientsRouter);
router.use(usersRouter);
router.use("/chat", chatRoutes);
router.use("/general", generalRoutes);

router.get(["/", ""], (req, res) => {
  try {
    console.log("Attempting to render main.ejs");
    res.type("html");
    console.log("[main.ejs] sessionID:", req.sessionID);
    console.log("[main.ejs] isAuth:", req.session.isAuth);
    console.log("[main.ejs] session:", JSON.stringify(req.session, null, 2));
    console.log("[main.ejs] cookie header:", req.headers.cookie);
    console.log("[main.ejs] host:", req.headers.host);
    res.render("main", {
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL,
      sessionAuth: req.session.isAuth,
      cookiesUser: req.cookies.user,
    });
  } catch (error) {
    console.error("View rendering error:", err);
    res.status(500).send("Error rendering view");
  }
});

// Health Check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    database: db ? "connected" : "disconnected",
  });
});

module.exports = router;
