const { Router } = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = require("../models/User");
const { db } = require("../services/db-connection");
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
  // res.send(`
  //   <!DOCTYPE html>
  //   <html>
  //   <head>
  //     <title>VolMed Server</title>
  //     <style>
  //       body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
  //       h1 { color: #2c3e50; }
  //       .endpoint { background: #f4f4f4; padding: 10px; border-radius: 5px; margin: 10px 0; }
  //     </style>
  //   </head>
  //   <body>
  //     <h1>VolMed API Server - LOGIN</h1>
  //     <div style="display:flex; flex-direction:column; align-items:center;">
  //       <form action="/login" method="POST">
  //         <label htmlFor="username">
  //           Username:
  //         </label>
  //         <input
  //           name="username"
  //           type="text"
  //           placeholder="Username"
  //         />
  //         <br/>
  //         <label htmlFor="password">
  //           Password:
  //         </label>
  //         <input
  //           name="password"
  //           type="password"
  //           placeholder="Password"
  //         />
  //         <br/>
  //        <button type="submit">Login</button>
  //       </form>
  //       <a href="/register">Register</a>
  //     </div>
  //   </body>
  //   </html>
  // `);
  res.render("login");
});

router.post("/login", originMiddleware, async (req, res) => {
  const { username, password } = req.body;

  debug.log(`Login attempt for username: ${username}`);
  debug.log(`Password received (length): ${password ? password.length : 0}`);

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (!rows.length) {
      debug.log("User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.redirect("/login");
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      debug.log("Wrong password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    debug.log(`Logging in user ${username}`);

    req.session.regenerate((error) => {
      if (error) {
        console.error("Login error:", error);
        res.status(500).json({
          error: "Internal server error",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }

      req.session.isAuth = true;
      if (user.status === "admin" || user.status === "Администратор")
        req.session.isAdmin = true;
      req.session.user = user.username;
      req.session.lastName = user.lastName || "Undefined";
      req.session.firstName = user.firstName || "Undefined";
      req.session.patr = user.patr || "";
      req.session.status = user.status || "Undefined";

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

        if (process.env.NODE_ENV === "development") {
          if (req.accepts("json")) {
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
              },
            });
          }
          return res.redirect("/api/dashboard");
        }

        if (req.accepts("json")) {
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
            },
          });
        }
        return res.redirect(process.env.FRONTEND_URL || "/");
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/register", (req, res) => {
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
      <h1>VolMed API Server - REGISTER</h1>
      <div style="display:flex; flex-direction:column; align-items:center;">
        <form action="/register" method="POST">
          <label htmlFor="username">
            Username:
          </label>
          <input 
            type="text"
            placeholder="Username"
            name="username"
          />
          <br/>
          <label htmlFor="password">
            Password:
          </label>
          <input 
            type="password"    
            placeholder="Password"
            name="password"
          />
          <br/>
         <button type="submit">Register</button>
        </form>
        <a href="/login">Login</a>
      </div>
    </body>
    </html>
  `);
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
  res.redirect("/login");
});

router.post("/logout", isAuth, async (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);
      if (req.app.locals.debug?.error) {
        req.app.locals.debug.error("Logout error:", error);
      }
      return res.status(500).json({ error: "Logout failed" });
    }

    try {
      // Clear session cookie
      res.clearCookie("volmed.sid", {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
      });

      // Clear user cookie
      res.clearCookie("user", {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      if (process.env.NODE_ENV === "development") {
        res.redirect("/api");
      } else {
        if (req.accepts("json")) {
          return res.status(200).json({
            success: true,
            message: "Logged out successfully",
            redirect: `${process.env.FRONTEND_URL}/login`,
          });
        }
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
      }
    } catch (clearCookieError) {
      console.error("Clear cookie error:", clearCookieError);
      res.status(500).json({
        error: "Logout failed during cookie cleanup",
      });
    }
  });
});

router.get("/status", originMiddleware, async (req, res) => {
  try {
    res.json({
      isAuthenticated: !!req.session.isAuth,
      isAdmin: req.session.isAdmin,
      user: req.session.user
        ? {
            username: req.session.user,
            firstName: req.session.firstName,
            lastName: req.session.lastName,
            patr: req.session.patr,
            status: req.session.status,
          }
        : null,
    });
  } catch (error) {
    console.error("Auth status check failed:", error);
    res.status(500).json({
      isAuthenticated: false,
      error: "Authentication service unavailable",
    });
  }
});

router.get("/dashboard", isAuth, async (req, res) => {
  try {
    const sessionData = req.session
      ? JSON.stringify(req.session, null, 2)
      : "null";

    if (!req.cookies.user) {
      return res.redirect("/login");
    }

    const client = await db.connect();
    try {
      const { rows: users } = await db.query("SELECT * FROM users ORDER BY id");
      const { rows: patients } = await db.query(
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
