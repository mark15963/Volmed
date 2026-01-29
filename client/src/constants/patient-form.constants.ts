import dayjs from "dayjs";

export interface PatientFormValues {
  lastName: string,
  firstName: string,
  patr: string,
  type: "Плановая" | "Экстренная",
  sex: "" | "Мужской" | "Женский",
  birthDate: dayjs.Dayjs | null,
  sender: string,
  sendingTime: string,
  insurance: string,
  phone: string,
  address: string,
  email: string,
  freq: "Впервые" | "Повторно",
  firstDiag: string, 
  complaint: string,
  anam: string,
  life: string,
  status: string,
  mkb: string,
  diag: string,
  sop_zab: string,
  rec: string,
  state: string,
};

export const PATIENT_FORM_INITIAL_VALUES: PatientFormValues = {
  lastName: "",
  firstName: "",
  patr: "",
  type: "Плановая",
  sex: "",
  birthDate: null,
  sender: "",
  sendingTime: "",
  insurance: "",
  phone: "",
  address: "",
  email: "",
  freq: "Впервые",
  firstDiag: "",
  complaint: "",
  anam: "",
  life: "",
  status: "",
  mkb: "",
  diag: "",
  sop_zab: "",
  rec: "",
  state: "Удовлетворительно",
} as const;

// ──────────────────────────────────────────────
// Fields that should become empty string if undefined/null
// ──────────────────────────────────────────────
export const PATIENT_STRING_FIELDS_TO_EMPTY = [
  'patr',
  'email',
  'address',
  'complaint',
  'anam',
  'life',
  'status',
  'diag',
  'mkb',
  'sop_zab',
  'rec',
  'state',
] as const;

export type PatientStringField = (typeof PATIENT_STRING_FIELDS_TO_EMPTY)[number]