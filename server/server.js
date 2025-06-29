const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");

const { Pool } = require("pg");
const cors = require("cors");
const { exec } = require("child_process");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const fs = require("fs");

const routes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 5000;

//DB setup
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

//CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  "http://localhost:5173",
  "http://192.168.0.104:5173",
  "http://localhost:5000",
];

app.locals.allowedOrigins = allowedOrigins;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("Not allowed by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

//Trust Proxy & Middleware
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Session config
app.use(
  session({
    name: "volmed.sid",
    store: new pgSession({
      pool: db,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "your-strong-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60,
    },
    proxy: true,
  })
);

//Debug session & cookies
app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("Cookies:", req.cookies);
  next();
});

//Static & Routing
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json");
  }
  next();
});
app.use(routes);

// DB connection test
async function testDbConnection() {
  const retries = 5,
    delay = 2000;
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`Connection attempt ${i}/${retries}`);
      const client = await db.connect();
      await client.query("SELECT 1");
      client.release();
      console.log("Database connection verified");
      return;
    } catch (err) {
      console.error(`Attempt ${i} failed:`, err.message);
      if (i < retries) await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Maximum DB connection attempts reached");
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

async function startServer() {
  try {
    await testDbConnection();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database connected to: ${process.env.DB_HOST}`);
      console.log(`Website link: ${process.env.FRONTEND_URL}`);
      console.log(`Backend link: ${process.env.BACKEND_URL}`);
      server.keepAliveTimeout = 60000;
      server.headersTimeout = 65000;
    });

    process.on("SIGTERM", () => {
      console.log("Shutting down gracefully...");
      server.close(() => {
        db.end();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}
startServer();

module.exports = { allowedOrigins };
