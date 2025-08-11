import axios from "axios";
import debug from "../utils/debug";
import { useNavigate } from "react-router";

const environment = import.meta.env.VITE_ENV;
const apiUrl = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global error handling
api.interceptors.response.use(
  (response) => {
    // const { method, url } = response.config;
    // const { status } = response;

    // debug.log(`Success: ${method?.toUpperCase()} ${url} (${status})`, {
    //   data: response.data,
    //   headers: response.headers,
    // });
    return response;
  },
  (error) => {
    const errorDetails = {
      code: error.code,
      data: error.response?.status,
      message: error.message,
      stack: environment === "development" ? error.stack : undefined,
      status: error.response?.status,
      url: error.config?.url,
    };

    debug.error("API Error:", errorDetails);

    // Handle specific error cases
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Server timeout. Please try again later.")
      );
    }

    if (!error.response) {
      if (error.message === "Network Error") {
        return Promise.reject(
          new Error("Network error. Please check your internet connection.")
        );
      }
      return Promise.reject(new Error("No response from server"));
    }

    const status = error.response.status;
    const defaultMessage = `Server error (${status})`;

    const statusMessages = {
      400: error.response.data?.message || "Некорректный запрос",
      401: "Не авторизован",
      403: "Доступ запрещен",
      404: "Не найдено",
      408: "Истекло время ожидания",
      500: "Ошибка сервера",
      502: "Ошибочный шлюз",
      503: "Сервис недоступен",
      504: "Шлюз не отвечает",
    };

    if (status === 401 && error.response.data?.redirectToFrontend) {
      if (typeof window !== "undefined") {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(window.location.pathname);
      }
      return Promise.reject(new Error("Session expired"));
    }
    const errorMessage =
      error.response.data?.message || statusMessages[status] || defaultMessage;

    return Promise.reject(new Error(errorMessage));
  }
);

export default {
  //General
  getHospitalName: () => api.get(`${apiUrl}/general-data`),
  setHospitalName: (hospitalName, backgroundColor) =>
    api.put(`${apiUrl}/general-data`),

  // Patients
  getPatients: () => api.get(`${apiUrl}/patients`),
  getPatient: (id) => api.get(`${apiUrl}/patients/${id}`),
  getPatientCount: () => api.get(`${apiUrl}/patient-count`),
  createPatient: (data) => api.post(`${apiUrl}/patients`, data),
  updatePatient: (id, data) => api.put(`${apiUrl}/patients/${id}`, data),
  deletePatient: (id) => api.delete(`${apiUrl}/patients/${id}`),

  // Medications
  deleteMedication: (medId) => api.delete(`${apiUrl}/medications/${medId}`),
  getMedications: (patientId) =>
    api.get(`${apiUrl}/patients/${patientId}/medications`),
  createMedication: (patientId, data) =>
    api.post(`${apiUrl}/patients/${patientId}/medications`, data),
  updateMedication: (medId, data) =>
    api.put(`${apiUrl}/medications/${medId}`, data),

  // Files
  getPatientFiles: (patientId) =>
    api.get(`${apiUrl}/patients/${patientId}/files`),
  uploadFile: (patientId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${apiUrl}/patients/${patientId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteFile: (filePath) =>
    api.delete(`${apiUrl}/files`, {
      data: { filePath },
      headers: {
        "Content-Type": "application/json",
      },
    }),

  // Vital Signs (Pulse)
  savePulse: (patientId, value) => {
    if (!patientId) throw new Error("Patient ID is required");
    return api.post(`${apiUrl}/patients/${patientId}/pulse`, {
      value,
    });
  },
  getPulseData: (patientId) => api.get(`${apiUrl}/patients/${patientId}/pulse`),
  saveO2: (patientId, value) =>
    api.post(`${apiUrl}/patients/${patientId}/o2`, { value }),
  getO2Data: (patientId) => api.get(`${apiUrl}/patients/${patientId}/o2`),

  // Auth
  postLogin: (data) => api.post(`${apiUrl}/login`, data),
  logout: () => api.post(`${apiUrl}/logout`),
  status: () => {
    debug.log("Environment:", environment);
    debug.log("API URL:", apiUrl);
    return api.get(`${apiUrl}/status`);
  },

  // Chat
  getChatHistory: (room) => api.get(`${apiUrl}/chat/room/${room}/messages`),
  saveMessage: (data) => api.post(`${apiUrl}/chat/save-message`, data),

  // Users
  getUsers: () => api.get(`${apiUrl}/users`),
};
