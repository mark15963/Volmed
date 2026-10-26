const { Router } = require("express");
const debug = require("../utils/debug");

const router = Router();

router.get("/", (req, res) => {
  debug.log(
    "[main.ejs] session user:",
    req.session.user,
    "isAuth:",
    req.session.isAuth,
  );
  res.render("main", {
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,
    sessionAuth: req.session.isAuth,
    lastName: req.session.lastName,
    firstName: req.session.firstName,
    patr: req.session.patr,
  });
});

module.exports = router;
