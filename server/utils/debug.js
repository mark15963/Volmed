const debug = {
  log: (...args) => {
    if (process.env.DEBUG === "true") {
      console.log("[DEBUG]", ...args);
    }
  },
  warn: (...args) => {
    if (process.env.DEBUG === "true") {
      console.warn("[DEBUG WARNING]", ...args);
    }
  },
  error: (...args) => {
    if (process.env.DEBUG === "true") {
      console.error("[DEBUG ERROR]", ...args);
    }
  },
  table: (data, columns) => {
    if (process.env.DEBUG === "true") {
      console.groupCollapsed("[DEBUG TABLE]");
      console.table(data, columns);
      console.groupEnd();
    }
  },
};

module.exports = debug;
