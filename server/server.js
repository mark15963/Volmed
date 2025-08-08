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

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const { db, testDbConnection } = require("./services/db-connection");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const routes = require("./routes/index");
const debug = require("./utils/debug");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://192.168.0.103:5173",
];
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

app.locals.allowedOrigins = allowedOrigins;
app.locals.debug = debug;

// Trust Proxy & Middleware
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session config
app.use(
  session({
    name: "volmed.sid",
    store: new pgSession({
      pool: db,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
    proxy: true,
    unset: "destroy",
  })
);

// Static & Routing
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// Use routes
app.use("/api", routes);
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json");
  }
  next();
});

// Debug session & cookies on start
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "development" &&
    !req.app.locals.sessionDebugged
  ) {
    debug.log("Environment:", process.env.NODE_ENV);
    debug.log("Session ID:", req.sessionID);
    debug.log("Session data:", req.session);
    debug.log("Cookies:", req.cookies);
    req.app.locals.sessionDebugged = true;
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  if (req.accepts("json")) {
    return res
      .status(500)
      .json({ error: "Server error", message: err.message });
  }
  res.status(500).send("Server error");
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
      debug.log(`Enviroment: ${process.env.NODE_ENV}`);
      debug.log(`Website link: ${process.env.FRONTEND_URL}`);
      debug.log(`Backend link: ${process.env.BACKEND_URL}`);
      server.keepAliveTimeout = 1000 * 60;
      server.headersTimeout = 1000 * 65;
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
