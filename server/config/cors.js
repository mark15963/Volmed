const { getLocalNetworkIP } = require("../utils/getLocalNetworkIP");

const localIP = getLocalNetworkIP() || "localhost";

const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost:5000",
  "https://localhost:5000",
  "http://localhost:5173",
  "https://localhost:5173",

  `http://${localIP}`,
  `https://${localIP}`,

  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,

  process.env.HOST_IP ? `http://${process.env.HOST_IP}` : null,
  process.env.HOST_IP ? `https://${process.env.HOST_IP}` : null,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // Production / strict
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("[CORS BLOCKED ✗] Origin not in list:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200,
};

module.exports = { corsOptions, allowedOrigins };
