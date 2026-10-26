const { Router } = require("express");

const router = Router();

router.use(require("./auth"));
router.use(require("./users"));
router.use(require("./patients"));
router.use(require("./files"));
router.use(require("./medications"));
router.use(require("./vitals"));
router.use("/chat", require("./chat"));
router.use("/general", require("./general"));

module.exports = router;
