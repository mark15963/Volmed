const axios = require("axios");

module.exports = function setupChatSocket(io, socket, debug) {
  debug.log("Chat socket initialized for:", socket.id);

  // Log all events for debugging
  socket.onAny((event, ...args) => {
    console.log("📡 Event received:", event, args);
  });

  // Join a room
  socket.on("join_room", (room, callback) => {
    debug.log("Message received for room:", JSON.stringify(room));

    socket.join(room);
    if (callback) callback({ success: true });
    debug.log(`Client ${socket.id} joined room: ${room}`);
    debug.log(
      `👥 Room ${room} now has:`,
      io.sockets.adapter.rooms.get(room)?.size || 0,
      "clients"
    );
  });

  // Leave a room
  socket.on("leave_room", (room) => {
    socket.leave(room);
    debug.log(`Client ${socket.id} left room: ${room}`);
  });

  // Send message
  socket.on("send_message", async (data) => {
    try {
      const { message, room, sender, senderName, timestamp } = data;

      debug.log("Message received for room:", room);
      debug.log("Message details:", { sender, senderName, message, timestamp });

      // Save to backend DB
      await axios.post(`${process.env.BACKEND_URL}/api/chat/save-message`, {
        room,
        sender,
        senderName,
        message,
        timestamp,
      });

      // Broadcast to room (including sender)
      io.to(room).emit("receive_message", {
        message,
        room,
        sender,
        senderName,
        timestamp,
      });

      debug.log(`📨 Message broadcast to room: ${room}`);
    } catch (error) {
      console.error("Failed to save message:", error.message);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    debug.log(`Client disconnected: ${socket.id}`);
  });
};
