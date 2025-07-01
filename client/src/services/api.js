import axios from "axios";

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

export default {
  //Patients
  getPatient: () => axios.get(`${apiUrl}/api/patients`),
  getPatient: (id) => axios.get(`${apiUrl}/api/patients/${id}`),
  getPatientCount: () => axios.get(`${apiUrl}/api/patient-count`),
  createPatient: (data) => axios.post(`${apiUrl}/api/patients`, data),
  updatePatient: (id, data) => axios.put(`${apiUrl}/api/patients/${id}`, data),
  deletePatient: (id) => axios.delete(`${apiUrl}/api/patients/${id}`),

  // Medications
  deleteMedication: (medId) =>
    axios.delete(`${apiUrl}/api/medications/${medId}`),
  getMedications: (patientId) =>
    axios.get(`${apiUrl}/api/patients/${patientId}/medications`),
  createMedication: (patientId, data) =>
    axios.post(`${apiUrl}/api/patients/${patientId}/medications`, data),
  updateMedication: (medId, data) =>
    axios.put(`${apiUrl}/api/medications/${medId}`, data),

  // Files
  getPatientFiles: (patientId) =>
    axios.get(`${apiUrl}/api/patients/${patientId}/files`),
  uploadFile: (patientId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${apiUrl}/api/patients/${patientId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteFile: (filePath) =>
    axios.delete(`${apiUrl}/api/files`, {
      data: { filePath },
      headers: {
        "Content-Type": "application/json",
      },
    }),

  // Vital Signs (Pulse)
  savePulse: (patientId, pulseValue) =>
    axios.post(`${apiUrl}/api/patients/${patientId}/pulse`, { pulseValue }),
  getPulseData: (patientId) =>
    axios.get(`${apiUrl}/api/patients/${patientId}/pulse`),

  //Auth
};
