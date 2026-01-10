// Used in:
// - Administered.jsx

import { useState, useEffect } from "react";
import debug from "../utils/debug";

/**
 * useApi()
 * --------
 * A universal data-fetching React hook
 * It automatically handles:
 *
 *✅ **loading** state
 *
 *✅ **error** handling
 *
 *✅ storing and updating **data**
 *
 *✅ automatic re-fetching when dependencies change
 *
 *You simply give it an API function (like fetchPatients) and it handles the rest.
 *
 *
 * - **Fetch data once** - useApi(fetchPatients)
 *
 * - **Fetch with parameter** -	useApi(fetchPatientById, [id], [id])
 *
 * - **Re-fetch on change** -	useApi(fetchPatients, [], [refreshKey])
 *
 * - **Get loading/error** - { loading, error } returned automatically
 *
 *
 * @example
 * import { useApi } from "@/hooks/useApi"
 *
 * const Administered = () => {
 *   const { data: patients = [], loading, error } = useApi(fetchPatients, [], []);
 *   if (loading) ...
 *   if (error) ...
 *
 *   return (
 *     ...
 *     {patients.map(p => (
 *       ...
 *
 *
 * @param {*} apiFn - Set which API to use
 * @param {*} params - Parameters for the API
 * @param {*} deps - Re-fetch depentencie
 * @returns
 */

export function useApi(apiFn, params = [], deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // ✅ Skip API call if params contain falsy values (undefined, null, '')
    const shouldFetch = params.every(
      (p) => p !== undefined && p !== null && p !== ""
    );
    if (!shouldFetch) {
      debug.log("[useApi] Skipping fetch because params not ready:", params);
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    apiFn(...params)
      .then((res) => {
        if (!mounted) return;

        if (res.ok) {
          setData(
            res.patients || res.patient || res.data || res.medications || []
          );
        } else {
          setError(res.message || "Ошибка при получении данных");
        }
      })
      .catch((err) => setError(err.message || "Ошибка подключения к серверу"))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, deps);
  return { data, loading, error };
}
