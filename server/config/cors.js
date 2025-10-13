const os = require("os");
const networkInterfaces = os.networkInterfaces();
let localIp = "localhost";

Object.keys(networkInterfaces).forEach((interfaceName) => {
  networkInterfaces[interfaceName].forEach((interface) => {
    if (interface.family === "IPv4" && !interface.internal) {
      localIp = interface.address;
    }
  });
});

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  `http://${localIp}:5173`,
  "http://192.168.0.102:5173",
];

const corsOptions = {
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
};

module.exports = { corsOptions, allowedOrigins };
