const { Router } = require("express");
const { db } = require("../config/db-connection");

const router = Router();

// Health Check
router.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({
      status: "healthy",
      database: "connected",
    });
  } catch (e) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: e.message,
    });
  }
});

router.use(require("./api"));
router.use(require("./pages"));

module.exports = router;
