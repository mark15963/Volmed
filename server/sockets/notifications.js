// Handles personal and broadcast notifications

module.exports = function setupNotificationsSocket(io, socket, debug) {
  debug.log("🔔 Notifications socket initialized for:", socket.id);

  // Join a personal room (e.g., user ID) to receive user-specific notifications
  socket.on("join_notifications", (userId) => {
    if (!userId) return;
    socket.join(`user_${userId}`);
    debug.log(`User ${userId} (${socket.id}) joined notifications room.`);
  });

  // Leave notifications room
  socket.on("leave_notifications", (userId) => {
    socket.leave(`user_${userId}`);
    debug.log(`User ${userId} (${socket.id}) left notifications room.`);
  });

  // Send notification to a specific user
  socket.on("send_notification", (data) => {
    const { userId, title, message, type, timestamp } = data;

    if (!userId) {
      debug.log("❌ Missing userId in send_notification");
      return;
    }

    debug.log(`📢 Sending notification to user_${userId}:`, { title, message });

    io.to(`user_${userId}`).emit("receive_notification", {
      title,
      message,
      type: type || "info",
      timestamp: timestamp || new Date().toISOString(),
    });
  });

  // Example of broadcasting a global announcement
  socket.on("broadcast_announcement", (data) => {
    const { title, message } = data;
    debug.log(`📣 Broadcasting announcement: ${title}`);
    io.emit("receive_announcement", {
      title,
      message,
      timestamp: new Date().toISOString(),
    });
  });
};
