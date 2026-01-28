import { useEffect, useState } from "react";
import api from "../../services/api/index";
import { Patient } from "../../types/patient";
import { loadFromLocalStorage, saveToLocalStorage } from "../../services/localStorage/localCache";
import { debug } from "../../utils";

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
  }, []);

  return { patients, loading, error };
}
