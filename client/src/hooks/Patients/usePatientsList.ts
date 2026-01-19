import { useEffect, useState } from "react";
import api from "../../services/api";
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
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getPatients()
      .then((res) => {
        if (res.ok) setPatients(res.data);
        else throw new Error(res.message);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  return { patients, loading, error };
}
