// Interface of .env from /src/env.d.ts
const env = import.meta.env;

export const appConfig = {
  appName: env.VITE_APP_NAME || "VolMed",
  api: {
    baseUrl: `/api`,
    socketUrl: `/socket.io`,
  },

  isDev: env.DEV,
  isProd: env.PROD,
  isDebug: env.VITE_DEBUG === "true",
} as const;
