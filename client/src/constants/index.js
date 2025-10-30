export const services = [
  {
    title: "Project name",
    content: "Volmed", // Footer name
  },
];

// Default consts
export const CONFIG_DEFAULTS = {
  GENERAL: {
    TITLE: "ГБУ ДНР «Волновахская районная больница»",
    COLOR: {
      HEADER: "#3c97e6",
      CONTENT: "#a5c6e2",
    },
    LOGO: "/assets/images/logo.webp",
  },
};

//
export const CACHE_CONFIG = {
  CACHE_URL: `${
    import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || ""
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
  },
  LOGO: "general.logoUrl",
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
