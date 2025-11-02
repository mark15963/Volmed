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
 * @returns {Promise<{ ok: boolean, patients: Array, message?: string }>}
 */
export async function fetchPatients() {
  const res = await api.getPatients();

  if (!res.ok) {
    debug.error("Error fetching patients:", res.message);
    return {
      ok: false,
      patients: [],
      message: res.message,
    };
  }

  const patients = Array.isArray(res.data) ? res.data : [];

  return {
    ok: true,
    patients,
  };
}

/**
 * Fetch a single patient by ID
 * @param {string|number} patientId - Patient card number or ID
 * @returns {Promise<{ ok: boolean, patient: object|null, message?: string }>}
 */
export async function fetchPatientById(patientId) {
  if (!patientId) {
    debug.error("❌ fetchPatientById called without patientId");
    return {
      ok: false,
      patient: null,
      message: "No patient ID provided",
    };
  }

  const res = await api.getPatient(patientId);

  if (!res.ok) {
    debug.error(`❌ Error fetching patient (${patientId}):`, res.message);
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
