export * from "./patient-form.constants";
export * from "./patient-status.constants";
export * from "./select-options.constants";

export const SERVICE = [
  {
    project: "Volmed",
    year: "2025",
  },
];

// Default consts
export const CONFIG_DEFAULTS = {
  GENERAL: {
    TITLE: "ГБУ ДНР «Волновахская районная больница»",
    COLOR: {
      HEADER: "#3c97e6",
      CONTENT: "#a5c6e2",
      CONTAINER: "#0073c7",
    },
    LOGO: "/assets/images/logo.webp",
    THEME: {
      TABLE: "default",
      APP: "default",
    },
  },
};

//
export const CACHE_CONFIG = {
  CACHE_URL: `${
    import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "" // If empty -> local file
  }/cache/config-cache.json`,
  CACHE_BUSTER: `?t=${Date.now()}`,
  CACHE_OPTIONS: {
    cache: "no-cache",
  },
};

//
export const CONFIG_KEYS = {
  TITLE: "general.title",
  COLOR: {
    HEADER: "general.color.headerColor",
    CONTENT: "general.color.contentColor",
    CONTAINER: "general.color.containerColor",
  },
  LOGO: "general.logoUrl",
  THEME: {
    TABLE: "general.theme",
    APP: "general.theme",
  },
};

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
