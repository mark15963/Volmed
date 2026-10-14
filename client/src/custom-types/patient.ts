export interface Patient {
  id: number | string;
  lastName: string;
  firstName: string;
  patr?: string;
  birthDate: string;
  sex: string;
  created_at: string;
  room: string;
  doctor: string;
  diag: string;
  state: string;
  allergy?: string;
}

/**
 * Props for the {@link PatientsListRow} component.
 */
export interface PatientRowProps {
  /** The patient data object to render */
  patient: Patient;
  /**
   * Click behavior mode passed from parent table.
   * - `"navigate"` → full page navigation
   * - `"popup"` → triggers parent's popup handler via `displayState`
   */
  onRowClick: "navigate" | "popup";
  /**
   * Callback to open the popup mode (only used when `onRowClick === "popup"`).
   * Usually passed from `ListOfPatients` as `() => handleOpenPatientData(patient.id)`
   */
  displayState?: () => void | undefined;
}