export * from "./patient-form.constants";
export * from "./patient-status.constants";
export * from "./select-options.constants";
export * from "./config.constants";

export const SERVICE = [
  {
    project: "Volmed",
    year: "2025",
  },
];

// Pages
export const PAGES = {
  INDEX: "/",
  LOGIN: "/login",
  PATIENTS: "/patients",
  SEARCH: "/search",
  REGISTER: "/register",
  EDIT: "/edit",
  ADMINISTERED: "/administered",
  DISCHARGED: "/discharged",
  HOSPITALIZED: "/hospitalized",
  DASHBOARD: "/dashboard",
  NOTFOUND: "/*",
  NURSE: "/nurse-menu",
};

// Interface of .env from /src/env.d.ts
export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME ?? "",
  api: {
    baseUrl: `https://${import.meta.env.VITE_API_URL}/api`,
    socketUrl: `https://${import.meta.env.VITE_API_URL}`,
  },

  isDev: import.meta.env.VITE_ENV === "development",
  isDebug: import.meta.env.VITE_DEBUG === "true",
};
