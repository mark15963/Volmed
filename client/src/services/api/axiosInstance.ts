import axios from "axios";

const isDev = import.meta.env.VITE_ENV === "development";

// Always send cookies/session data with requests
axios.defaults.withCredentials = true;

/**
 * Axios instance configuration
 * ----------------------------
 * Sets baseURL from environment variable,
 * adds default headers, and disables strict status validation
 * (we handle success/error manually in parseApiResponse()).
 * No need to add "Content-Type":"application/json" header.
 */
export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Request-Source": "react-frontend",
    "X-App-Version": import.meta.env.VITE_APP_VERSION || "1.0.0",
  },
  validateStatus: () => true,
});

apiInstance.interceptors.request.use((config) => {
  // Add unique ID to every request
  config.headers["X-Request-ID"] =
    `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Add the page path that triggered the request
  if (typeof window !== "undefined") {
    config.headers["X-Request-Path"] = window.location.pathname;
    config.headers["X-Full-URL"] = window.location.href;
    config.headers["X-Request-Query"] = window.location.search;
    config.headers["X-Request-Hash"] = window.location.hash;
  }

  return config;
});

if (isDev) {
  // Showing API requests
  let Config: any;
  apiInstance.interceptors.request.use((config) => {
    Config = config;
    console.log(
      `[Axios Request] ${config.method?.toUpperCase()} ${config.url}`,
    );
    console.log("[Axios Headers]", config.headers);
    console.log("[Full Config]", config);
    return config;
  });

  apiInstance.interceptors.response.use(
    (res) => {
      console.log(`[Axios Response] ${res.status} ${res.config.url}`);
      return res;
    },
    (err) => {
      console.error(`[Axios Error] ${err.message} ${Config?.url}`, err);
      return Promise.reject(err);
    },
  );
}

export default apiInstance;
