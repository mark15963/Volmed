import api from "../services/api";
import { debug } from "../utils/debug";

/**
 * ================================================================
 * 📘 FETCH PATIENT COUNT
 * ---------------------------------------------------------------
 * Retrieves the total number of patients stored in the backend.
 * This is usually used in dashboard or header components.
 *
 * ✅ HOW TO USE:
 *   import { fetchPatientCount } from "../api/fetchPatientCount";
 *
 *   const res = await fetchPatientCount();
 *   if (res.ok) {
 *     console.log(`Total patients: ${res.count}`);
 *   }
 *
 * ---------------------------------------------------------------
 * Returns an object:
 * {
 *   ok: boolean,
 *   count: number | string,   // "N/A" if unavailable
 *   message?: string
 * }
 * ================================================================
 */

/**
 * Fetches total patient count from backend
 * @returns {Promise<{ ok: boolean, count: number | string, message?: string }>}
 */
export async function fetchPatientCount() {
  try {
    const res = await api.getPatientCount();

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
    return { ok: false, count: "N/A", message: error.message };
  }
}
