const { Router } = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = require("../models/User");
const { Pool } = require("pg");

const router = Router();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  allowExitOnIdle: true,
});

const { isAuth } = require("../middleware/authMiddleware");

router.get("/login", (req, res) => {
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
      <h1>VolMed API Server - LOGIN</h1>
      <div style="display:flex; flex-direction:column; align-items:center;">
        <form action="/login" method="POST">
          <label htmlFor="username">
            Username:
          </label>
          <input 
            name="username" 
            type="text"                                             
            placeholder="Username"
          />
          <br/>
          <label htmlFor="password">
            Password:
          </label>
          <input 
            name="password" 
            type="password"                                             
            placeholder="Password"
          />
          <br/>
         <button type="submit">Login</button>
        </form>
        <a href="/register">Register</a>
      </div>
    </body>
    </html>
  `);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = await User.findByUsername(username);

    if (!user) {
      return res.redirect("/login");
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Set session
      req.session.isAuth = true;
      req.session.user = user.username;
      req.session.firstName = user.firstName || "undefined";
      req.session.lastName = user.lastName || "undefined";

      // Save the session before redirect
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Set cookie
        res.cookie("user", user.username, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1000 * 60 * 60 * 24,
        });
        // return res.redirect("/dashboard");
        // res.status(200).json({ success: true });
        res.setHeader("Content-Type", "text/html");
        res.send(`
          <html>
            <head>
              <meta http-equiv="refresh" content="0; url=/dashboard" />
            </head>
            <body>
              <p>Login successful. Redirecting...</p>
            </body>
          </html>
        `);
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

router.post("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("volmed.sid", {
      path: "/",
      domain:
        process.env.NODE_ENV === "production" ? ".onrender.com/" : undefined,
      secure: process.env.NODE_ENV === "production",
    });
    res.clearCookie("user", {
      path: "/",
      domain:
        process.env.NODE_ENV === "production" ? ".onrender.com/" : undefined,
      secure: process.env.NODE_ENV === "production",
    });
    res.redirect("/");
  });
});

router.get("/api/auth/status", (req, res) => {
  res.json({
    isAuthenticated: !!req.session.isAuth,
    user: req.session.user
      ? {
          username: req.session.user,
          firstName: req.session.firstName,
          lastName: req.session.lastName,
        }
      : null,
  });
});

router.get("/dashboard", isAuth, async (req, res) => {
  try {
    console.log("Session:", req.session);
    console.log("Cookies:", req.cookies);

    const sessionData = req.session
      ? JSON.stringify(req.session, null, 2) // Pretty-print JSON
      : "null";

    // if (!req.cookies.user) {
    //   return res.redirect("/login");
    // }

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
      <h1>VolMed API Server - DASHBOARD</h1>
      <p>Server is running successfully in ${process.env.NODE_ENV} mode</p>
      <p>Authentication: ${req.session.isAuth}</p>
      <p>User: ${req.session.user}</p>
      <p>Name: ${req.session.lastName} ${req.session.firstName}</p>
      <p>Session data: ${sessionData}</p>
      <button onClick="window.location='/'">Home</button>
      <form action="/logout" method="POST">
        <button type="submit">Logout</button>
      </form>
      <button onClick="window.location='https://volmed-o4s0.onrender.com/'">Website</button>
      </body>
    </html>
  `);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.redirect("/login");
  }
});

module.exports = router;
