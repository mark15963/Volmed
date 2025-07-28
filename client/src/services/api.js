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
    // debug.log("API success:", response.config.url, response.data);
    return response;
  },
  (error) => {
    // debug.error("API error:", {
    //   url: error.config?.url,
    //   status: error.response?.status,
    //   data: error.response?.data,
    //   message: error.message,
    // });

    if (error.response?.status === 401) {
      if (error.response.data?.redirectToFrontend) {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    if (error.response) {
      const status = error.response.status;
      const messages = {
        400: "Неверный запрос",
        401: "Требуется авторизация",
        403: "Доступ запрещен",
        404: "Пациент не найден",
        500: "Ошибка сервера",
      };
      return Promise.reject(new Error(messages[status] || `Ошибка: ${status}`));
    } else if (error.request) {
      // Request was made but no response
      return Promise.reject(new Error("Нет ответа от сервера"));
    } else {
      // Other errors
      return Promise.reject(new Error("Ошибка соединения"));
    }
  }
);

export default {
  // Patients
  getPatients: () => api.get(`${apiUrl}/api/patients`),
  getPatient: (id) => api.get(`${apiUrl}/api/patients/${id}`),
  getPatientCount: () => api.get(`${apiUrl}/api/patient-count`),
  createPatient: (data) => api.post(`${apiUrl}/api/patients`, data),
  updatePatient: (id, data) => api.put(`${apiUrl}/api/patients/${id}`, data),
  deletePatient: (id) => api.delete(`${apiUrl}/api/patients/${id}`),

  // Medications
  deleteMedication: (medId) => api.delete(`${apiUrl}/api/medications/${medId}`),
  getMedications: (patientId) =>
    api.get(`${apiUrl}/api/patients/${patientId}/medications`),
  createMedication: (patientId, data) =>
    api.post(`${apiUrl}/api/patients/${patientId}/medications`, data),
  updateMedication: (medId, data) =>
    api.put(`${apiUrl}/api/medications/${medId}`, data),

  // Files
  getPatientFiles: (patientId) =>
    api.get(`${apiUrl}/api/patients/${patientId}/files`),
  uploadFile: (patientId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${apiUrl}/api/patients/${patientId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteFile: (filePath) =>
    api.delete(`${apiUrl}/api/files`, {
      data: { filePath },
      headers: {
        "Content-Type": "application/json",
      },
    }),

  // Vital Signs (Pulse)
  savePulse: (patientId, pulseValue) => {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }
    api.post(`${apiUrl}/api/patients/${patientId}/pulse`, {
      pulseValue,
    });
  },
  getPulseData: (patientId) =>
    api.get(`${apiUrl}/api/patients/${patientId}/pulse`),
  saveO2: (patientId, o2Value) =>
    api.post(`${apiUrl}/api/patients/${patientId}/o2`, { o2Value }),
  getO2Data: (patientId) => api.get(`${apiUrl}/api/patients/${patientId}/o2`),

  // Auth
  postLogin: (data) => api.post(`${apiUrl}/login`, data),
  logout: () => api.post(`${apiUrl}/logout`),
  status: () => api.get(`${apiUrl}/status`),

  // Chat
  getChatHistory: (room) => api.get(`${apiUrl}/api/chat/room/${room}/messages`),
  saveMessage: (data) => api.post(`${apiUrl}/api/chat/save-message`, data),

  // Users
  getUsers: () => api.get(`${apiUrl}/api/users`),
};
