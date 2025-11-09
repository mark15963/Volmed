export const getLocalISOTime = () => {
  // const now = new Date();

  // return new Date(
  //   now.getTime() - now.getTimezoneOffset() * 60000
  // ).toISOString();
  return new Date().toISOString();
};

export const formatChatTime = (timestamp) => {
  try {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      console.warn("Invalid timestamp:", timestamp);
      return "--:--";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting time:", error, "Timestamp:", timestamp);
    return "--:--";
  }
};
