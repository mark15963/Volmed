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
  error: (...args) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.error("[DEBUG ERROR]", ...args);
    }
  },
  table: (data, columns) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.groupCollapsed("[DEBUG TABLE]");
      console.table(data, columns);
      console.groupEnd();
    }
  },
};

export default debug;
