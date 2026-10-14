import { Patient } from "@custom-types/patient";

export interface UsePatientListReturn {
  /** Array of all loaded patients */
  patients: Patient[];
  /** Whether the patient list is currently being fetched */
  loading: boolean;
  /** Error message (string) or null if no error occurred */
  error: string | null;
}
