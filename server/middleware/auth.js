const debug = require("../utils/debug");

const isAuth = async (req, res, next) => {
  try {
    if (!req.session?.isAuth) throw new Error("Not authorized");
    next();
  } catch (error) {
    debug.log("Not authorized");
    res.status(401).json({ error: error.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.session?.isAdmin) throw new Error("Only admin allowed");
    next();
  } catch (error) {
    debug.log("Only admin allowed");
    res.status(401).json({ error: error.message });
  }
};

module.exports = { isAuth, isAdmin };
