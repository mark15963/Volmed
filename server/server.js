const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");

const { Pool } = require("pg");
const cors = require("cors");
const { exec } = require("child_process");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const routes = require("./routes/index");

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use(cookieParser());
app.set("trust proxy", 1);

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://volmed-o4s0.onrender.com",
        "https://volmed-backend.onrender.com",
        process.env.FRONTEND_URL,
      ]
    : [
        "http://localhost:5173",
        "http://192.168.0.104:5173",
        "http://localhost:5000",
      ];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cach-Control", "Pragma"],
    exposedHeaders: ["set-cookie"], // Expose cookies to frontend
  })
);

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
app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("Cookies:", req.cookies);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    // 30 seconds timeout
    res.status(503).json({ error: "Request timeout" });
  });
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

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
      console.log("✅ Database connection verified");
      return;
    } catch (err) {
      console.error(`Attempt ${i} failed:`, err.message);
      if (i < retries) await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("❌ Maximum DB connection attempts reached");
}

// Content Security Policy
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json");
  }
  next();
});

app.use(routes);

//-----DATABASE-----
// DB backup
app.get("/api/backup", (req, res) => {
  const dumpFile = path.join(
    __dirname,
    "DB_Backup",
    `backup-${Date.now()}.dump`
  );
  if (!fs.existsSync(path.dirname(dumpFile)))
    fs.mkdirSync(path.dirname(dumpFile), { recursive: true });

  const user = process.env.DB_USER || "postgres";
  const host = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;
  const cmd = `pg_dump -U ${user} -h ${host} -d ${dbName} -F c -f "${dumpFile}"`;

  exec(cmd, { env: process.env }, (err, stdout, stderr) => {
    if (err) {
      console.error("Backup error:", stderr);
      return res.status(500).json({ error: "Backup failed", details: stderr });
    }
    res.download(dumpFile);
  });
});
// DB restore
app.get("/api/restore", (req, res) => {
  const dir = path.join(__dirname, "DB_Backup");
  if (!fs.existsSync(dir))
    return res.status(404).json({ error: "Backup folder not found" });
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".dump"))
    .sort()
    .reverse();
  if (!files.length)
    return res.status(404).json({ error: "No backup files found" });

  const latest = path.join(dir, files[0]);
  const user = process.env.DB_USER || "postgres";
  const host = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;

  const dropCreate = `psql -U ${user} -h ${host} -c "DROP DATABASE ${dbName}; CREATE DATABASE ${dbName};"`;
  const restoreCmd = `pg_restore -U ${user} -h ${host} -d ${dbName} -c "${latest}"`;

  exec(
    `${dropCreate} && ${restoreCmd}`,
    { env: process.env },
    (err, stdout, stderr) => {
      if (err) {
        console.error("Restore error:", stderr);
        return res
          .status(500)
          .json({ error: "Restore failed", details: stderr });
      }
      res.json({ success: true, message: "Database restored successfully" });
    }
  );
});

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
