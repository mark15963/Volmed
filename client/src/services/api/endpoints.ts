import { requestWrapper } from "./requestWrapper";

export const endpoints = {
  /* =======================
     🔧 GENERAL CONFIGURATION
     ======================= */
  getGeneralConfig: () => requestWrapper("get", `/general/config`),
  updateGeneralConfig: (data: any) =>
    requestWrapper("put", `/general/config`, data),
  getLogo: () => requestWrapper("get", `/general/get-logo`),
  uploadLogo: (formData: FormData) =>
    requestWrapper("post", `/general/upload-logo`, formData),

  /* ===============
     👩‍⚕️ PATIENTS API
     =============== */
  /** Get all patients */
  getPatients: () => requestWrapper("get", "/patients"),
  /** Get a patient by ID */
  getPatient: (id: string) => requestWrapper("get", `/patients/${id}`),
  /** Get the number of all patients */
  getPatientCount: () => requestWrapper("get", `/patient-count`),
  createPatient: (data: any) => requestWrapper("post", `/patients`, data),
  updatePatient: (id: string, data: any) =>
    requestWrapper("put", `/patients/${id}`, data),
  deletePatient: (id: string) => requestWrapper("delete", `/patients/${id}`),

  /* =================
     💊 MEDICATION API
     ================= */
  deleteMedication: (medId: string) =>
    requestWrapper("delete", `/medications/${medId}`),
  getMedications: (patientId: string) =>
    requestWrapper("get", `/patients/${patientId}/medications`),
  createMedication: (patientId: string, data: any) =>
    requestWrapper("post", `/patients/${patientId}/medications`, data),
  updateMedication: (medId: string, data: any) =>
    requestWrapper("put", `/medications/${medId}`, data),

  /* ===================
     📂 PATIENT FILES API
     =================== */
  getPatientFiles: (patientId: string) =>
    requestWrapper("get", `/patients/${patientId}/files`),
  uploadFile: (patientId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return requestWrapper("post", `/patients/${patientId}/upload`, formData);
  },
  deleteFile: (filePath: string) =>
    requestWrapper("delete", `/files`, { data: { filePath } }),

  /* ==================
     ❤️ VITAL SIGNS API
     ================== */
  savePulse: (patientId: string, pulseValue: string) =>
    requestWrapper("post", `/patients/${patientId}/pulse`, pulseValue),
  getPulseData: (patientId: string) =>
    requestWrapper("get", `/patients/${patientId}/pulse`),
  saveO2: (patientId: string, o2Value: string) =>
    requestWrapper("post", `/patients/${patientId}/o2`, { o2Value }),
  getO2Data: (patientId: string) =>
    requestWrapper("get", `/patients/${patientId}/o2`),

  /* ==============
     🔐 AUTH ENDPOINTS
     ============== */
  postLogin: (data: any) => requestWrapper("post", `/login`, data),
  logout: () => requestWrapper("post", `/logout`),
  status: (config = {}) => requestWrapper("get", `/status`, null, config),

  /* ==========
     💬 CHAT API
     ========== */
  getChatHistory: (room: string) =>
    requestWrapper("get", `/chat/room/${room}/messages`),
  saveMessage: (data: any) =>
    requestWrapper("post", `/chat/save-message`, data),
  getActiveRooms: () => requestWrapper("get", `/chat/active-rooms`),
  deleteChatRoom: (room: string) =>
    requestWrapper("delete", `chat/room/${room}`),

  /* ===========
     👤 USERS API
     =========== */
  getUsers: () => requestWrapper("get", `/users`),
  createUser: (data: any) => requestWrapper("post", `/users`, data),
  updateUser: (id: string, data: any) =>
    requestWrapper("put", `/users/${id}`, data),
  deleteUser: (id: string) => requestWrapper("delete", `/users/${id}`),
};
