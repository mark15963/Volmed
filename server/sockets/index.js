//Initializes Socket.IO and registers feature modules

const { Server } = require("socket.io");
const setupChatSocket = require("./chat");

module.exports = function initSocket(server, app, allowedOrigins, debug) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log("❌ Not allowed by CORS:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    setupChatSocket(io, socket, debug);
  });
  return io;
};
