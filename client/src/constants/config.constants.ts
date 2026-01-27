// Default consts
interface ConfigDefaultValues {
  GENERAL: {
    TITLE: string;
    COLOR: {
      HEADER: string;
      CONTENT: string;
      CONTAINER: string;
    };
    LOGO: string;
    THEME: {
      TABLE: 'default' | 'light' | 'dark';
      APP: 'default' | 'light' | 'dark';
    };
  };
}

export const CONFIG_DEFAULTS: ConfigDefaultValues = {
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
