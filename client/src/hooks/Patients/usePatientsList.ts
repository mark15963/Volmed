import { useEffect, useState } from "react";
import api from "../../services/api/index";
import { Patient } from "../../types/patient";
import { loadFromLocalStorage, saveToLocalStorage } from "../../services/localStorage/localCache";
import { debug } from "../../utils";

interface UsePatientListReturn {
  /** Array of all loaded patients */
  patients: Patient[];
  /** Whether the patient list is currently being fetched */
  loading: boolean;
  /** Error message (string) or null if no error occurred */
  error: string | null;
}

/**
 * usePatientList
 * --------------
 * Fetches a list of all patients from the API.
 *
 * Handles loading and error states automatically and returns the results
 * in a format ready to use in table components or dropdowns.
 *
 * @returns {{
 *   patients: Array<Object>,
 *   loading: boolean,
 *   error: Error|null
 * }} Patient list state and control flags
 */

/**
 * Custom hook that fetches and caches the list of all patients.
 *
 * Features:
 * - Attempts to load patients from localStorage cache first (fast initial render)
 * - Falls back to API call if no valid cache exists
 * - Saves fresh API data to localStorage for next sessions
 * - Handles loading and error states
 * - Cleans up on unmount to prevent state updates on unmounted components
 *
 * @remarks
 * - Cache key: `'cachedPatients'`
 * - Uses `api.getPatients()` from your API service
 * - Debug logs are emitted via `debug.success()` / `debug.error()`
 * - Does **not** implement automatic polling or real-time updates
 *
 * @example
 * ```tsx
 * const { patients, loading, error } = usePatientList();
 *
 * if (loading) return <Spinner />;
 * if (error) return <div>Ошибка: {error}</div>;
 *
 * return <PatientTable patients={patients} />;
 * ```
 *
 * @returns Object containing patients array, loading flag, and error state
 */
export const usePatientList = (): UsePatientListReturn => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true
    const init = async () => {
      let cached = loadFromLocalStorage('cachedPatients')
    
      if(mounted && cached && Array.isArray(cached)) {
        debug.success('Patients loaded from cache')
        setPatients(cached) 
        setLoading(false)
        return
      }

      try{
        if (!cached || !Array.isArray(cached)){
          const res = await api.getPatients()
      
          if (!mounted) return
        
          if (res.ok && Array.isArray(res.data)) {  
            debug.success('Patients data loaded from API')
            const freshPatients = res.data as Patient[]

            setPatients(freshPatients);
            saveToLocalStorage('cachedPatients', freshPatients)
            setError(null)
          } 
          else setError(res.message ?? "Не удалось загрузить пациентов");
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message ?? "Ошибка загрузки данных")
          setPatients([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    };
  }, []); // empty deps → runs once on mount

  return { patients, loading, error };
}
