// Used in:
// - ListOfPatients.jsx
// - PatientsCount.jsx

import api from "../services/api";
import { debug } from "../utils/debug";

/**
 * ================================================================
 * 📘 FETCH PATIENTS API HELPERS
 * ---------------------------------------------------------------
 * This file provides reusable functions to fetch patient data
 * from the backend. These functions wrap the main `api` service
 * to provide a clean, consistent, and safe API layer.
 *
 * ✅ HOW TO USE:
 *   import { fetchPatients, fetchPatientById } from "../api/fetchPatients";
 *
 *   // Example usage:
 *   const res = await fetchPatients();
 *   if (res.ok) console.log(res.patients);
 *
 *   const single = await fetchPatientById(123);
 *   if (single.ok) console.log(single.patient);
 *
 * Each function returns an object with the following shape:
 * {
 *   ok: boolean,         // true if request succeeded
 *   patients | patient,  // data (array or object)
 *   message?: string     // optional error message
 * }
 *
 * ---------------------------------------------------------------
 * Dependencies:
 * - api (axios instance): handles HTTP requests
 * - debug: lightweight logger for errors
 * ================================================================
 */

/**
 * Fetch all patients
 * ------------------
 *
 * @example
 * useEffect(() => {
 *   const loadPatients = async () => {
 *     const res = await fetchPatients()
 *     if (res.ok) {
 *       setPatients(res.patients);
 *     } else {
 *       debug.error("Error fetching patients:", res.message)
 *       setPatients([])
 *     }
 *     setLoading(false)
 *   }
 *
 *   loadPatients();
 * }, []);
 *
 * @returns {Promise<{ ok: boolean, patients: Array, message?: string }>}
 */
export async function fetchPatients() {
  const res = await api.get("/patients");
  if (!res.ok) {
    debug.error("Error fetching patients:", res.message);
    return {
      ok: false,
      patients: [],
      message: res.message,
    };
  }
  return {
    ok: true,
    patients: res.data ?? [],
  };
}

/**
 * Fetch a patient by ID
 * ---------------------
 * @param {string|number} id - Patient card number or ID
 * @returns {Promise<{ ok: boolean, patient: object|null, message?: string }>}
 */
export async function fetchPatientById(id) {
  if (!id) {
    debug.error("❌ fetchPatientById called without patientId");
    return {
      ok: false,
      patient: null,
      message: "Missing patient ID",
    };
  }
  const res = await api.get(`/patients/${id}`);
  if (!res.ok) {
    debug.error(`❌ Error fetching patient (${id}):`, res.message);
    return {
      ok: false,
      patient: null,
      message: res.message,
    };
  }
  return {
    ok: true,
    patient: res.data,
  };
}

export async function fetchPatientCount() {
  try {
    const res = await api.get("/patient-count");

    if (!res.ok) {
      debug.error("Error fetching patient count:", res.message);
      return {
        ok: false,
        count: "N/A",
        message: res.message,
      };
    }

    const count = res.data?.count ?? 0;
    return { ok: true, count };
  } catch (error) {
    debug.error("Network or parsing error in fetchPatientCount:", error);
    return {
      ok: false,
      count: "N/A",
      message: error.message,
    };
  }
}

export async function createPatient(data) {
  const res = await api.post(`/patients`, data);
  return {
    ok: res.ok,
    patient: res.data ?? null,
    message: res.message,
  };
}

export async function updatePatient(id, data) {
  const res = await api.put(`/patients/${id}`, data);
  return {
    ok: res.ok,
    patient: res.data ?? null,
    message: res.message,
  };
}

export async function deletePatient(id) {
  const res = await api.delete(`/patients/${id}`);
  return {
    ok: res.ok,
    message: res.message,
  };
}
