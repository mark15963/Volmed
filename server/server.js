const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development"
  ),
});

debug.log("Loaded environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  DATABASE_URL: process.env.DATABASE_URL ? "exists" : "missing",
});

const debug = require("./utils/debug");

const express = require("express");
const axios = require("axios");

const { Pool } = require("pg");
const cors = require("cors");
const https = require("https");

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
    rejectUnauthorized: true,
    ca:
      process.env.NODE_ENV === "production"
        ? fs.readFileSync("/etc/ssl/certs/ca-certificates.crt").toString()
        : undefined,
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
  allowExitOnIdle: true,
});

//CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  "http://localhost:5173",
  "http://192.168.0.104:5173",
  "http://192.168.0.104",
  "http://localhost:5000",
];

app.locals.allowedOrigins = allowedOrigins;
app.locals.debug = debug;

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
      maxAge: 1000 * 60 * 60 * 24,
    },
    proxy: true,
  })
);

// Debug session & cookies
app.use((req, res, next) => {
  debug.log("Environment:", process.env.NODE_ENV);
  debug.log("Session ID:", req.sessionID);
  debug.log("Session data:", req.session);
  debug.log("Cookies:", req.cookies);
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
  const retries = 5;
  const delay = 2000;

  for (let i = 1; i <= retries; i++) {
    let client;
    try {
      client = await db.connect();
      const result = await client.query("SELECT version()");
      debug.log("Database version:", result.rows[0].version);
      client.release();
      return;
    } catch (err) {
      debug.error(`Attempt ${i} failed:`, err.message);
      if (client) client.release();
      if (i < retries) {
        await new Promise((r) => setTimeout(r, delay * i));
      }
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
      debug.log(`Server running on port ${PORT}`);
      debug.log(`Website link: ${process.env.FRONTEND_URL}`);
      debug.log(`Backend link: ${process.env.BACKEND_URL}`);
      server.keepAliveTimeout = 60000;
      server.headersTimeout = 65000;
    });

    const io = require("socket.io")(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      debug.log("Socket ID", socket.id);

      socket.on("join_room", (data) => {
        debug.log("Set room", data);
        socket.join(data);
      });

      socket.on("leave_room", (data) => {
        debug.log(data);
        socket.leave(data);
      });

      socket.on("send_message", async (data) => {
        try {
          const { room, sender, message, timestamp } = data;

          if (data.room === "") {
            socket.broadcast.emit("receive_message", data);
          } else {
            socket.to(room).emit("receive_message", data);
          }

          await axios.post(`${process.env.BACKEND_URL}/api/chat/save-message`, {
            room,
            sender,
            message,
            timestamp,
          });
        } catch (error) {
          console.error("Failed to save message:", error.message);
        }
      });
    });

    process.on("SIGTERM", () => {
      debug.log("Shutting down gracefully...");
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
