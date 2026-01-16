export interface Patient {
  id: number | string;
  lastName: string;
  firstName: string;
  patr?: string;
  birthDate: string;
  sex: string;
  createdAt: string;
  room: string;
  doctor: string;
  mkb: string;
  state: string;
  allergy?: string;
}

export interface PatientRowProps extends Patient {
  onClick?: () => void;
}