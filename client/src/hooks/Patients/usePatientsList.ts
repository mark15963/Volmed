import { useEffect, useState } from "react";
import api from "../../services/api/index";
import { Patient } from "../../types/patient";

interface UsePatientListReturn {
  patients: Patient[];
  loading: boolean;
  error: any;
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
export const usePatientList = (): UsePatientListReturn => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true
    api
      .getPatients()
      .then((res) => {
        if(!mounted) return
        if (res.ok && Array.isArray(res.data)) {
          setPatients(res.data);
        }
        else setError(res.message ?? "Не удалось загрузить список пациентов");
      })
      .catch((err) => {
        if(mounted) 
          setError(err.message ?? "Ошибка сети")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, []);
  return { patients, loading, error };
}
