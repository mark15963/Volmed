const debug = {
  log: (...args) => {
    if (
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.log("[DEBUG]", ...args);
    }
  },
  warn: (...args) => {
    if (
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.warn("[DEBUG WARNING]", ...args);
    }
  },
  error: (...args) => {
    if (
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.error("[DEBUG ERROR]", ...args);
    }
  },
  table: (data, columns) => {
    if (
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.groupCollapsed("[DEBUG TABLE]");
      console.table(data, columns);
      console.groupEnd();
    }
  },
};

if (process.env.NODE_ENV === "development") {
  process.env.DEBUG = "true";
}

module.exports = debug;
