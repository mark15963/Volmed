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

// Enhanced version with better stack traces
export const enhancedDebug = {
  log: (...args) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      // This creates a stack trace that shows where debug.log was called from
      console.groupCollapsed(`[DEBUG] ${args[0]}`);
      console.log(...args);
      console.trace(); // This shows the call stack
      console.groupEnd();
    }
  },
  warn: (...args) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.groupCollapsed(`[DEBUG WARNING] ${args[0]}`);
      console.warn(...args);
      console.trace();
      console.groupEnd();
    }
  },
  error: (...args) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.groupCollapsed(`[DEBUG ERROR] ${args[0]}`);
      console.error(...args);
      console.trace();
      console.groupEnd();
    }
  },
  table: (data, columns) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.groupCollapsed("[DEBUG TABLE]");
      console.table(data, columns);
      console.trace();
      console.groupEnd();
    }
  },
};

export default enhancedDebug;
