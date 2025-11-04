const isDebug = import.meta.env.VITE_DEBUG === "true";
/**
 * Formats console group titles with color and emoji for quick scanning.
 */
const formatTitle = (type, title) => {
  const colors = {
    log: "color: #9bbedbff; font-weight: bold",
    warn: "color: #f57c00; font-weight: bold",
    error: "color: #d32f2f; font-weight: bold",
    table: "color: #43a047; font-weight: bold",
  };
  const icons = {
    log: "",
    warn: "⚠️",
    error: "❌",
    table: "📊",
  };
  return [`%c${icons[type]} [DEBUG] ${title}`, colors[type]];
};

// Enhanced version with better stack traces
export const debug = {
  log: (title = "[DEBUG]", ...details) => {
    if (!isDebug) return;
    console.groupCollapsed(...formatTitle("log", title));
    if (details.length) console.log(...details);
    console.trace(); // This shows the call stack
    console.groupEnd();
  },
  warn: (title = "Debug Warning", ...details) => {
    if (!isDebug) return;
    console.groupCollapsed(...formatTitle("warn", title));
    if (details.length) console.warn(...details);
    console.trace();
    console.groupEnd();
  },
  error: (title = "Error", ...details) => {
    if (!isDebug) return;
    // 👇 Show error group collapsed with red label
    console.groupCollapsed(...formatTitle("error", title));
    // Automatically detect `Error` objects or structured API errors
    details.forEach((d) => {
      if (d instanceof Error) {
        console.error("❌", d.message);
        if (d.stack) console.log(d.stack);
      } else if (typeof d === "object") {
        console.dir(d);
      } else {
        console.error(d);
      }
    });
    console.trace();
    console.groupEnd();
  },
  table: (title = "Debug Table", data, columns) => {
    if (!isDebug) return;
    console.groupCollapsed(...formatTitle("table", title));
    console.table(data, columns);
    console.trace();
    console.groupEnd();
  },
};

export default debug;
