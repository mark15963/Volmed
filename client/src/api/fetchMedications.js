// Used in:
// - Tab3.jsx

import api from "../services/api";
import { debug } from "../utils/debug";

/**
 * ================================================================
 * 💊 FETCH MEDICATIONS API HELPERS
 * ---------------------------------------------------------------
 * Provides a consistent and safe way to interact with medication-related
 * backend endpoints via the unified `api` service.
 *
 * ✅ HOW TO USE:
 *   import { fetchMedications, createMedication } from "../api/fetchMedications";
 *
 *   const res = await fetchMedications(patientId);
 *   if (res.ok) setMedications(res.medications);
 *   else console.error(res.message);
 * ================================================================
 */

/**
 * Fetch all medications for a given patient
 * -----------------------------------------
 * @param {string|number} patientId - ID of the patient
 * @returns {Promise<{ ok: boolean, medications: Array, message?: string }>}
 */
export async function fetchMedications(patientId) {
  if (!patientId) {
    debug.error("fetchMedications called without patientId");
    return {
      ok: false,
      medications: [],
      message: "Missing patient ID",
    };
  }

  const res = await api.get(`/patients/${patientId}/medications`);
  if (!res.ok) {
    debug.error(
      `Error fetching medications for patient ${patientId}`,
      res.message
    );
    return {
      ok: false,
      medications: [],
      message: res.message,
    };
  }
  return {
    ok: true,
    medications: res.data ?? [],
  };
}
/**
 * Create a new medication for a patient
 * -------------------------------------
 * @param {string|number} patientId
 * @param {object} data - { name, dosage, frequency }
 * @returns {Promise<{ ok: boolean, medication: object|null, message?: string }>}
 */
export async function createMedications(patientId, data) {
  if (!patientId || !data) {
    debug.error("createMedication missing patientId or data");
    return {
      ok: false,
      medication: null,
      message: "Invalid parameters",
    };
  }
  const res = await api.post(`/patients/${patientId}/medications`, data);
  if (!res.ok) {
    debug.error(
      `Error creating medication for patients ${patientId}`,
      res.message
    );
    return {
      ok: false,
      medication: null,
      message: res.message,
    };
  }

  return {
    ok: true,
    medication: res.data ?? null,
  };
}
/**
 * Update an existing medication
 * -----------------------------
 * @param {string|number} medId
 * @param {object} data - Fields to update
 * @returns {Promise<{ ok: boolean, medication: object|null, message?: string }>}
 */
export async function updateMedications(medId, data) {
  if (!medId || !data) {
    debug.error("updateMedication missing medID or data");
    return {
      ok: false,
      medication: null,
      message: "Invalid parameters",
    };
  }
  const res = await api.put(`/medications/${medId}`, data);
  if (!res.ok) {
    debug.error(`Error update medication ${medId}`, res.message);
    return {
      ok: false,
      medication: null,
      message: res.message,
    };
  }
  return {
    ok: true,
    medication: res.data ?? null,
  };
}
/**
 * Delete a medication
 * -------------------
 * @param {string|number} medId
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
export async function deleteMedications(medId) {
  if (!medId) {
    debug.error("deleteMedication called without medId");
    return {
      ok: false,
      message: "Missing medication ID",
    };
  }
  const res = await api.delete(`/medications/${medId}`);
  if (!res.ok) {
    debug.error(`Error deleting medication ${medId}:`, res.message);
  }

  return {
    ok: res.ok,
    message: res.message,
  };
}
