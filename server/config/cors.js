const allowedOrigins = [
      'http://localhost',
      'https://localhost',
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:5000',
      'https://localhost:5000',
      'http://localhost:5173',
      'https://localhost:5173',
      'http://192.168.0.107',
      'wss://192.168.0.107',
      process.env.FRONTEND_URL,
      process.env.BACKEND_URL
    ].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    
    // console.log('CORS Check - Origin:', origin);
    // console.log('CORS Check - Allowed origins:', allowedOrigins);

    if (!origin) {
      // console.log('CORS: No origin header (server-to-server request)');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      // console.log('CORS: Origin allowed');
      return callback(null, true);
    }
    
    console.log("Not allowed by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200
};

module.exports = { corsOptions, allowedOrigins };
