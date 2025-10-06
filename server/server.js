//#region ===== REQUIRES & CONSTS =====
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
const cookieParser = require("cookie-parser");

const { db, testDbConnection } = require("./config/db-connection");
const { corsOptions, allowedOrigins } = require("./config/cors");
const sessionConfig = require("./config/session");
const routes = require("./routes/index");
const debug = require("./utils/debug");
//#endregion

const app = express();
const PORT = process.env.PORT || 5000;

//#region ===== CORS setup =====
const cors = require("cors");
app.use(cors(corsOptions));
//#endregion

app.locals.allowedOrigins = allowedOrigins;
app.locals.debug = debug;

//#region ===== Middleware =====
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//#endregion

// Session setup
app.use(sessionConfig);

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/assets",
  express.static(path.join(__dirname, "..", "client", "public", "assets"))
);
app.use("/cache", express.static(path.join(__dirname, "cache")));

//#region ===== Routes =====
app.get("/", (req, res) => {
  res.redirect("/api");
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json");
  }
  next();
});

app.use("/api", routes);
//#endregion

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
  } else {
    res.status(500).send("Server error");
  }
});

//#region ===== START SERVER =====
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

      // Start tests
      if (process.env.NODE_ENV === "development") {
        require(path.join(__dirname, "tests", "startupTest.js"));
      }
    });

    const io = require("socket.io")(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    app.set("io", io);

    io.on("connection", (socket) => {
      debug.log("Client connected:", socket.id);

      socket.on("join_room", (room, callback) => {
        socket.join(room);
        if (callback) callback({ success: true });
        debug.log(`Client ${socket.id} joined room: ${room}`);
      });

      socket.on("leave_room", (data) => {
        debug.log("User left room:", data);
        socket.leave(data);
      });

      socket.on("send_message", async (data) => {
        try {
          const { room, sender, senderName, message, timestamp } = data;
          debug.log("Message received for room:", room);

          io.to(data.room).emit("receive_message", data);

          await axios.post(`${process.env.BACKEND_URL}/api/chat/save-message`, {
            room,
            sender,
            senderName,
            message,
            timestamp,
          });

          debug.log(`📨 Message broadcast to room: ${data.room}`);
        } catch (error) {
          console.error("Failed to save message:", error.message);
        }
      });

      socket.on("disconnect", () => {
        debug.log("Socket disconnected:", socket.id);
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

//#endregion

module.exports = { allowedOrigins };
