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

export interface PatientRowProps {
  patient: Patient
}