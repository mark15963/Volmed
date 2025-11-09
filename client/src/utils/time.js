export const formatChatTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? "--:--"
      : date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
  } catch (error) {
    console.error("Error formatting time:", error, "Timestamp:", timestamp);
    return "--:--";
  }
};
