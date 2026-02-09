const debug = require("../utils/debug");

/**
 * Middleware to check if user is authenticated
 */
function isAuthenticated(req, res, next) {
  try {
    if (req.session.isAuth) return next();
    debug.log("Authentication required");
    res.status(401).json({ error: "Authentication required" });
  } catch (error) {
    debug.error("Authentication middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Middleware to check if user is admin
 */
function isAdmin(req, res, next) {
  try {
    if (req.session.isAdmin) return next();
    debug.log("Admin access required");
    res.status(403).json({ error: "Admin access required" });
  } catch (error) {
    debug.error("Admin middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  isAuthenticated,
  isAdmin,
};
