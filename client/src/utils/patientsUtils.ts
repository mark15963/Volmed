import moment from "moment";
import debug from "./debug";

//#region === INTERFACES ===
export interface PatientForSearch{
  id?: string;
  lastName: string;
  firstName: string;
  patr?: string;
}
//#endregion
//#region === TYPES ===
export type PatientState =
  | "Удовлетворительное"
  | "Средней степени тяжести"
  | "Тяжёлое"
  | "Крайне тяжёлое"
  | "Выписан";
//#endregion

export const getStateClass = (state: string) => {
  switch (state) {
    case "Удовлетворительное":
      return "stable";
    case "Средней степени тяжести":
      return "moderate";
    case "Тяжёлое":
      return "severe";
    case "Крайне тяжёлое":
      return "critical";
    case "Выписан":
      return "leave";
    default:
      return "";
  }
};

export const calculateAge = (birthDate: string): string => {
  if(!birthDate) return '';
  try{
    const [day,month,year] = birthDate.split('.');
    const birth = moment(`${year}-${month}-${day}`, "YYYY-MM-DD")
    const today = moment()
    const age = today.diff(birth, 'years')

    if (age < 0) return ''

    return `${age} ${getAgeSuffix(age)}`
  } catch (err) {
    debug.error("Error calculating age:", err)
    return ''
  }
}
// Helper function for Russian age suffix
export const getAgeSuffix = (age: number): string => {
  const lastDigit = age % 10;
  const lastTwoDigits = age % 100;
  
  // Special cases for 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "лет";
  }
  
  switch (lastDigit) {
    case 1:
      return "год";
    case 2:
    case 3:
    case 4:
      return "года";
    default:
      return "лет";
  }
};

export function ensureString<T>(value: T | null | undefined): string {
  if(value == null) return '';
  if(typeof value === 'string') return value;
  if(typeof value === 'number') return String(value);
  if(typeof value === 'boolean') return value ? 'true' : 'false';

  debug.warn('ensureString received non-primitive value:', value)
  return String(value ?? '')
}

export const formatPhone = (phone: string | undefined): string => 
  phone
    ? `+7${phone.replace(/\D/g, '').replace(/^7/, '')}`
    : '';

export const formatDateForServer = (dayjsObj: any): string | null => 
        dayjsObj?.format('YYYY-MM-DD') ?? null;