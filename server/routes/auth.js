const { Router } = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = require("../models/User");
const { db } = require("../config/db-connection");
const originMiddleware = require("../middleware/originMiddleware");
const debug = require("../utils/debug");

const router = Router();

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    if (req.accepts("json") || req.xhr) {
      return res.status(401).json({
        error: "Session expired or invalid",
        redirectToFrontend: true,
      });
    }
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
};

router.get("/login", (req, res) => {
  res.type("html");
  res.render("login", { query: req.query });
});

router.post("/login", originMiddleware, async (req, res) => {
  const { username, password } = req.body;

  // no user or pass
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    // look for user in db
    const user = await User.findByUsername(username);
    if (!user) {
      debug.log("User not found");

      // If AJAX/React client (JSON request)
      if (
        req.xhr ||
        req.headers.accept?.includes("application/json") ||
        req.is("application/json")
      ) {
        return res.status(401).json({
          error: "Invalid credentials", // to login() in AuthContext
        });
      }

      // Browser form submit -> rederect back with query param
      return res.redirect("/api/login?error=Invalid+credentials");
    }

    // checking password match
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      debug.log("Wrong password");

      // If AJAX/React client (JSON request)
      if (
        req.xhr ||
        req.headers.accept?.includes("application/json") ||
        req.is("application/json")
      ) {
        return res.status(401).json({
          error: "Invalid credentials", // to login() in AuthContext
        });
      }

      // [Backend] Browser form submit -> redirect back with query param
      return res.redirect("/api/login?error=Invalid+credentials");
    }

    // Setting session
    req.session.regenerate((error) => {
      if (error) {
        console.error("Login error:", error);
        res.status(500).json({
          error: "Internal server auth error",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }

      if (user.status === "admin") {
        req.session.isAdmin = true;
      }
      req.session.isAuth = true;
      req.session.user = user.username;
      req.session.lastName = user.lastName || "Undefined";
      req.session.firstName = user.firstName || "Undefined";
      req.session.patr = user.patr || "";
      req.session.status = user.status || "Undefined";
      req.session.displayStatus = user.displayStatus || "Undefined";

      req.session.save((error) => {
        if (error) {
          console.error("Session save error:", error);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.cookie("user", user.username, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24,
        });

        // returns for dev mode
        if (process.env.NODE_ENV === "development") {
          if (
            req.xhr || // frontend
            req.headers.accept?.includes("application/json") ||
            req.is("application/json")
          ) {
            return res.status(200).json({
              success: true,
              message: "Logged in successfully",
              redirect: "/",
              user: {
                username: user.username,
                lastName: user.lastName,
                firstName: user.firstName,
                patr: user.patr,
                status: user.status,
                displayStatus: user.displayStatus,
              },
            });
          }
          return res.redirect("/api/dashboard");
        }

        let redirectUrl = "/";
        if (user.status === "Nurse") {
          redirectUrl = "/nurse-menu";
        }

        if (
          req.xhr ||
          req.headers.accept?.includes("application/json") ||
          req.is("application/json")
        ) {
          return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            redirect: redirectUrl,
            user: {
              username: user.username,
              lastName: user.lastName,
              firstName: user.firstName,
              patr: user.patr,
              status: user.status,
              displayStatus: user.displayStatus,
            },
          });
        }
        const frontendBase = process.env.FRONTEND_URL || "";
        return res.redirect(`${frontendBase}${redirectUrl}`);
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/register", (req, res) => {
  res.type("html");
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashedPass = await bcrypt.hash(password, saltRounds);
  const user = await User.create(username, hashedPass);

  // req.session.userId = user.id;
  res.redirect("/api/login");
});

router.post("/logout", isAuth, async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => (err ? reject(err) : resolve()));
    });

    res.clearCookie("volmed.sid", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
    });
    res.clearCookie("user", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      ok: true,
      message: "Logged out successfully",
      redirect: `${process.env.FRONTEND_URL}/login`,
    });
  } catch (err) {
    console.error("Logout failed:", err);
    return res.status(500).json({
      ok: false,
      message: "Logout failed",
    });
  }
});

router.get("/status", originMiddleware, async (req, res) => {
  try {
    res.json({
      ok: true,
      isAuthenticated: !!req.session.isAuth,
      isAdmin: !!req.session.isAdmin,
      user: req.session.user
        ? {
            username: req.session.user,
            firstName: req.session.firstName,
            lastName: req.session.lastName,
            patr: req.session.patr,
            status: req.session.status,
            displayStatus: req.session.displayStatus,
          }
        : null,
      message: req.session.isAuth
        ? "User is authenticated"
        : "User not logged in",
    });
  } catch (error) {
    console.error("Auth status check failed:", error);
    res.status(500).json({
      isAuthenticated: false,
      error: "Authentication service unavailable",
      message: "Internal auth error",
    });
  }
});

router.get("/dashboard", isAuth, async (req, res) => {
  try {
    res.type("html");
    const sessionData = req.session
      ? JSON.stringify(req.session, null, 2)
      : "null";
    if (!req.cookies.user) {
      return res.redirect("/login");
    }

    const client = await db.connect();
    try {
      const { rows: users } = await client.query(
        "SELECT * FROM users ORDER BY id"
      );
      const { rows: patients } = await client.query(
        "SELECT * FROM patients ORDER BY id"
      );
      res.render("dashboard", {
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        sessionAuth: req.session.isAuth,
        sessionUser: req.session.user,
        lastName: req.session.lastName,
        firstName: req.session.firstName,
        patr: req.session.patr,
        status: req.session.status,
        displayStatus: req.session.displayStatus,
        sessionData,
        users,
        patients,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Dashboard error:", err);
    res.redirect("/login");
  }
});

module.exports = router;
