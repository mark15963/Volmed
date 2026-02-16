import axios from "axios";

const isDev = import.meta.env.VITE_ENV === "development";

// Always send cookies/session data with requests
axios.defaults.withCredentials = true;
let baseURL: string;

if (isDev) {
  baseURL = "/";
} else {
  baseURL = import.meta.env.VITE_API_URL || "/";
}

/**
 * Axios instance configuration
 * ----------------------------
 * Sets baseURL from environment variable,
 * adds default headers, and disables strict status validation
 * (we handle success/error manually in parseApiResponse()).
 * No need to add "Content-Type":"application/json" header.
 */
export const apiInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  validateStatus: () => true,
});

if (isDev) {
  // Showing API requests
  let Config: any;
  apiInstance.interceptors.request.use((config) => {
    Config = config;
    console.log(
      `[Axios Request] ${config.method?.toUpperCase()} ${config.url}`,
    );
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
