export const debug = {
  log: (...args) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("[DEBUG]", ...args);
    }
  },
  warn: (...args) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.warn("[DEBUG WARNING]", ...args);
    }
  },
};
