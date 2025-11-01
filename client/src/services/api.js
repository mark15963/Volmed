import axios from "axios";
import debug from "../utils/debug";
import { useNavigate } from "react-router";

const environment = import.meta.env.VITE_ENV;

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global error handling
api.interceptors.response.use(
  (response) => {
    // if (environment === "development") {
    //   debug.log("Response:", {
    //     data: response.data,
    //     headers: response.headers,
    //     method: response.config.method?.toUpperCase(),
    //     url: response.config.url,
    //   });
    // }

    return response;
  },
  (error) => {
    const status = error.response?.status;

    debug.log("❌ Axios Error:", error);
    debug.log("🔍 Response:", error.response);
    debug.log("🔍 Config:", error.config);

    // Backend tells frontend to redirect
    if (status === 401 && error.response.data?.redirectToFrontend) {
      if (typeof window !== "undefined") {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(window.location.pathname);
      }
      return Promise.reject(new Error("Session expired"));
    }

    const errorDetails = {
      code: error.code,
      status,
      url: error.config?.url,
      message: error.message,
    };

    let errorMessage = "Произошла ошибка";

    // Handle specific error cases
    if (error.code === "ECONNABORTED") {
      errorMessage = "Сервер не ответил вовремя.";
    } else if (!error.response) {
      errorMessage = "Ошибка сети. Проверьте подключение.";
    } else {
      const statusMessages = {
        400: "Некорректный запрос",
        401: "Не авторизован",
        403: "Доступ запрещен",
        404: "Не найдено",
        408: "Истекло время ожидания",
        409: "Конфликт",
        500: "Ошибка сервера",
        502: "Ошибочный шлюз",
        503: "Сервис недоступен",
        504: "Шлюз не отвечает",
      };
      errorMessage =
        error.response.data?.message ||
        statusMessages[status] ||
        `Ошибка (${status})`;
    }

    const customError = new Error(errorMessage);
    customError.details = errorDetails;

    return Promise.reject(customError);
  }
);

export default {
  // Config
  getTitle: () => api.get(`/general/title`),
  updateTitle: (data) => api.put(`/general/title`, data),
  getColor: () => api.get(`/general/color`),
  updateColor: (data) => api.put(`/general/color`, data),
  getLogo: () => api.get(`/general/get-logo`),
  uploadLogo: (formData) =>
    api.post(`/general/upload-logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Patients
  getPatients: () => api.get(`/patients`),
  getPatient: (id) => api.get(`/patients/${id}`),
  getPatientCount: () => api.get(`/patient-count`),
  createPatient: (data) => api.post(`/patients`, data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`),

  // Medications
  deleteMedication: (medId) => api.delete(`/medications/${medId}`),
  getMedications: (patientId) => api.get(`/patients/${patientId}/medications`),
  createMedication: (patientId, data) =>
    api.post(`/patients/${patientId}/medications`, data),
  updateMedication: (medId, data) => api.put(`/medications/${medId}`, data),

  // Files
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

  // Vital Signs (Pulse)
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

  // Auth
  postLogin: (data) => api.post(`/login`, data),
  logout: () => api.post(`/logout`),
  status: () => api.get(`/status`),

  // Chat
  getChatHistory: (room) => api.get(`/chat/room/${room}/messages`),
  saveMessage: (data) => api.post(`/chat/save-message`, data),
  getActiveRooms: () => api.get(`/chat/active-rooms`),
  deleteChatRoom: (room) => api.delete(`chat/room/${room}`),

  // Users
  getUsers: () => api.get(`/users`),
  createUser: (data) => api.post(`/users`, data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};
