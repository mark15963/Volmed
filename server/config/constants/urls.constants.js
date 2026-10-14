const { getLocalNetworkIP } = require("../../utils/getLocalNetworkIP");

const localIP = getLocalNetworkIP() || "localhost";
const lanHostname = process.env.LAN_HOSTNAME;

const frontendPort = process.env.FRONTEND_PORT || 5173;
const backendPort = process.env.BACKEND_PORT || 5000;

const HOSTS = ["localhost", "127.0.0.1", localIP, lanHostname].filter(Boolean);
const PORTS = [frontendPort, backendPort, 80, 443];

const ALLOWED_ORIGINS = [];
for (const host of HOSTS) {
  for (const port of PORTS) {
    ALLOWED_ORIGINS.push(`http://${host}:${port}`);
    ALLOWED_ORIGINS.push(`https://${host}:${port}`);
  }
  ALLOWED_ORIGINS.push(`http://${host}`);
  ALLOWED_ORIGINS.push(`https://${host}`);
}

[process.env.FRONTEND_URL, process.env.BACKEND_URL]
  .filter(Boolean)
  .forEach((u) => ALLOWED_ORIGINS.push(u));

const CORS_RULES = {
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200,
};

module.exports = { ALLOWED_ORIGINS, CORS_RULES };
