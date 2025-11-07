//#region ===== IMPORTS =====
import axios from "axios";
import debug from "../utils/debug";
import { parseApiResponse, parseApiError } from "../utils/parseApiResponse";
//#endregion

const environment = import.meta.env.VITE_ENV;
// Always send cookies/session data with requests
axios.defaults.withCredentials = true;

/**
 * Axios instance configuration
 * ----------------------------
 * Sets baseURL from environment variable,
 * adds default headers, and disables strict status validation
 * (we handle success/error manually in parseApiResponse()).
 */
const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  validateStatus: () => true,
});

/**
 * requestWrapper()
 * ----------------
 * Generic helper for all HTTP methods.
 * Automatically handles:
 *  - missing payloads (avoids sending `null` which breaks Express)
 *  - consistent error handling
 *  - development logs
 */
async function requestWrapper(method, url, data = null, config = {}) {
  try {
    // Ensure `null` isn't sent to the backend
    const payload =
      data === null
        ? ["post", "put"].includes(method)
          ? {}
          : undefined
        : data;

    // Perform the HTTP request
    const response = await apiInstance[method](url, payload, config);
    // Parse unified format: { ok, data, status, message }
    const parsed = parseApiResponse(response);

    if (environment === "developer") {
      debug.log(`[API ${method}] ${url}`, parsed);
    }

    return parsed;
  } catch (error) {
    // Normalize network or parsing errors
    const parsedError = parseApiError(error);
    debug.error(`[API ERROR] ${method.toUpperCase()} ${url}:`, parsedError);
    return parsedError;
  }
}

/**
 * API Service
 * ------------
 * Centralized axios wrapper for all backend requests.
 * Provides automatic JSON handling, response parsing, and debugging logs.
 *
 * The main API object
 * -------------------
 * Each property here is a preconfigured endpoint call.
 * These can be imported anywhere in the frontend codebase.
 *
 * @example
 *    const result = await api.getPatients();
 *    if (result.ok) setPatients(result.data);
 *
 * @example
 *    import api from "@/services/api";
 *    const { ok, data } = await api.getPatients();
 *    if (ok) console.log(data);
 */
const api = {
  // Generic CRUD helpers for the props bellow(used by all specific endpoints)
  // example: api.get(/patients)
  get: (url, config) => requestWrapper("get", url, null, config),
  post: (url, data, config) => requestWrapper("post", url, data, config),
  put: (url, data, config) => requestWrapper("put", url, data, config),
  delete: (url, config) => requestWrapper("delete", url, null, config),

  /* =======================
     🔧 GENERAL CONFIGURATION
     ======================= */
  getTitle: () => api.get(`/general/title`),
  updateTitle: (data) => api.put(`/general/title`, data),
  getColor: () => api.get(`/general/color`),
  updateColor: async (payload) => {
    try {
      const res = await api.put(`/general/color`, payload);
      return { ok: true, data: res.data };
    } catch (err) {
      return {
        ok: false,
        data: null,
        message: err.message || "Request failed. Try again.",
        status: err.response?.status || 0,
      };
    }
  },
  getLogo: () => api.get(`/general/get-logo`),
  uploadLogo: (formData) =>
    api.post(`/general/upload-logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /* ===============
     👩‍⚕️ PATIENTS API
     =============== */
  getPatients: () => api.get(`/patients`),
  getPatient: (id) => api.get(`/patients/${id}`),
  getPatientCount: () => api.get(`/patient-count`),
  createPatient: (data) => api.post(`/patients`, data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`),

  /* =================
     💊 MEDICATION API
     ================= */
  deleteMedication: (medId) => api.delete(`/medications/${medId}`),
  getMedications: (patientId) => api.get(`/patients/${patientId}/medications`),
  createMedication: (patientId, data) =>
    api.post(`/patients/${patientId}/medications`, data),
  updateMedication: (medId, data) => api.put(`/medications/${medId}`, data),

  /* ===================
     📂 PATIENT FILES API
     =================== */
  getPatientFiles: (patientId) => api.get(`/patients/${patientId}/files`),
  uploadFile: (patientId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/patients/${patientId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteFile: (filePath) =>
    api.delete(`/files`, {
      data: { filePath },
      headers: {
        "Content-Type": "application/json",
      },
    }),

  /* ==================
     ❤️ VITAL SIGNS API
     ================== */
  savePulse: (patientId, pulseValue) => {
    if (!patientId) throw new Error("Patient ID is required");
    return api.post(`/patients/${patientId}/pulse`, {
      pulseValue,
    });
  },
  getPulseData: (patientId) => api.get(`/patients/${patientId}/pulse`),
  saveO2: (patientId, o2Value) =>
    api.post(`/patients/${patientId}/o2`, { o2Value }),
  getO2Data: (patientId) => api.get(`/patients/${patientId}/o2`),

  /* ==============
     🔐 AUTH ENDPOINTS
     ============== */
  postLogin: (data) => api.post(`/login`, data),
  logout: () => api.post(`/logout`),
  status: () => api.get(`/status`),

  /* ==========
     💬 CHAT API
     ========== */
  getChatHistory: (room) => api.get(`/chat/room/${room}/messages`),
  saveMessage: (data) => api.post(`/chat/save-message`, data),
  getActiveRooms: () => api.get(`/chat/active-rooms`),
  deleteChatRoom: (room) => api.delete(`chat/room/${room}`),

  /* ===========
     👤 USERS API
     =========== */
  getUsers: () => api.get(`/users`),
  createUser: (data) => api.post(`/users`, data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;
