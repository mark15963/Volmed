module.exports = function setupChatSocket(io, socket, debug) {
  // // Log all events for debugging
  // socket.onAny((event, ...args) => {
  //   const filteredArgs = args.map((arg) =>
  //     typeof arg === "function" ? "[Function]" : arg
  //   );
  //   console.log("📡 Event received:", event, filteredArgs);
  // });

  // Join a room
  socket.on("join_room", (room, callback) => {
    socket.join(room);
    if (callback) {
      callback({
        ok: true,
        room,
      });
    }
  });

  // Leave a room
  socket.on("leave_room", (room) => {
    socket.leave(room);
  });

  // Send message
  socket.on("send_message", async (data, callback) => {
    try {
      const { message, room, sender, senderName, timestamp } = data;

      // Broadcast to room (including sender)
      io.to(room).emit("receive_message", {
        message,
        room,
        sender,
        senderName,
        timestamp,
      });
      if (callback) {
        callback({
          ok: true,
          data: {
            room,
            message,
          },
        });
      }
    } catch (error) {
      console.error("Failed to save message:", error.message);
      if (callback) {
        callback({
          ok: false,
          message: error.message,
        });
      }
    }
  });
};
