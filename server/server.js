//#region ===== REQUIRES & CONSTS =====
const path = require("path");
const dotenv = require("dotenv");
const mode = process.env.NODE_ENV || "development";

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, `.env.${mode}`), override: true });

console.log(`[env] mode = ${mode}`);
console.log(`[env] FRONTEND_URL = ${process.env.FRONTEND_URL}`);
console.log(`[env] BACKEND_URL  = ${process.env.BACKEND_URL}`);

const express = require("express");
const cookieParser = require("cookie-parser");

const { db, testDbConnection } = require("./config/db-connection");
const { corsOptions, allowedOrigins } = require("./config/cors");
const sessionConfig = require("./config/session");
const { initCacheOnStartup } = require("./utils/initCache");
const http = require("http");

const routes = require("./routes/index");
const debug = require("./utils/debug");
//#endregion

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

//#region ===== CORS setup =====
const cors = require("cors");
const { getLocalNetworkIP } = require("./utils/getLocalNetworkIP");
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
  express.static(path.join(__dirname, "..", "client", "public", "assets")),
);
app.use("/cache", express.static(path.join(__dirname, "cache")));

//#region ===== Routes =====
app.get("/", (req, res) => {
  res.redirect("/api");
});

app.use((req, res, next) => {
  const csp =
    process.env.NODE_ENV === "development"
      ? "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: http: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' http: https: ws: wss:; " +
        "frame-src 'none'"
      : "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: http: https:; " +
        "font-src 'self'; " +
        "connect-src 'self' ws: wss:; " +
        "frame-src 'none'";

  res.setHeader("Content-Security-Policy", csp);

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
  const IP = getLocalNetworkIP() || "localhost";
  try {
    await testDbConnection();
    await initCacheOnStartup();

    server.listen(PORT, "0.0.0.0", () => {
      debug.log("");
      debug.log(`Server running on port ${PORT}`);
      debug.log(`Enviroment: ${process.env.NODE_ENV}`);
      debug.log(`Local:   https://localhost:${PORT}`);
      debug.log(`LAN:     https://${IP}:${PORT}`);
      debug.log("");

      server.keepAliveTimeout = 1000 * 60;
      server.headersTimeout = 1000 * 65;

      // Start tests
      if (process.env.NODE_ENV === "development") {
        require(path.join(__dirname, "tests", "startupTest.js"));
      }
    });

    // Socket
    const initSocket = require("./sockets");
    initSocket(server, app, allowedOrigins, debug);

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
