//Initializes Socket.IO and registers feature modules

const { Server } = require("socket.io");
const setupChatSocket = require("./chat");
const setupNotificationsSocket = require("./notifications");

module.exports = function initSocket(server, app, allowedOrigins, debug) {
  const io = new Server(server, {
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
    console.log("✅ Client connected:", socket.id);
    require("./chat")(io, socket, debug);
  });
  return io;
};
