export const FORM_OF_CARE_OPTIONS = [
  { value: "Плановая", label: "Плановая" },
  { value: "Экстренная", label: "Экстренная" },
];

export const ADMISSION_TYPE_OPTIONS = [
  { value: "Впервые", label: "Впервые" },
  { value: "Повторно", label: "Повторно" },
];

export const SEX_OPTIONS = [
  { value: "Мужской", label: "М" },
  { value: "Женский", label: "Ж" },
];

export const PATIENT_STATE_OPTIONS = [
  { value: "Удовлетворительно", label: "Удовлетворительно" },
  { value: "Средней степени тяжести", label: "Средней степени тяжести" },
  { value: "Тяжёлое", label: "Тяжёлое" },
  { value: "Крайне тяжелое", label: "Крайне тяжелое" },
  { value: "Выписан", label: "Выписан" },
];
export const PATIENT_STATES = {
  SATISFACTORY:     'Удовлетворительно',
  MODERATE:         'Средней степени тяжести',
  SEVERE:           'Тяжёлое',
  CRITICAL:         'Крайне тяжелое',
  DISCHARGED:       'Выписан',
} as const;

export type PatientState = typeof PATIENT_STATES[keyof typeof PATIENT_STATES]