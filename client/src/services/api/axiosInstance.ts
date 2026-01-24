import axios, {AxiosInstance} from "axios";

const isDev = import.meta.env.VITE_ENV === "development"

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
  headers: { "Content-Type": "application/json" },
  validateStatus: () => true,
});

// if (isDev) {
//   apiInstance.interceptors.request.use((config) => {
//     console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`);
//     return config;
//   });

//   apiInstance.interceptors.response.use(
//     (response) => {
//       console.log(`[Axios Response] ${response.status} ${response.config.url}`);
//       return response;
//     },
//     (error) => {
//       console.error("[Axios Error]", error);
//       return Promise.reject(error);
//     }
//   );
// }

export default apiInstance;