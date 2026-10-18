import moment from "moment";
import debug from "./debug";
import { Dayjs } from "dayjs";

//#region === INTERFACES ===
export interface PatientForSearch {
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
  if (!birthDate) return "";
  try {
    const [day, month, year] = birthDate.split(".");
    const birth = moment(`${year}-${month}-${day}`, "YYYY-MM-DD");
    const today = moment();
    const age = today.diff(birth, "years");

    if (age < 0) return "";

    return `${age} ${getAgeSuffix(age)}`;
  } catch (err) {
    debug.error("Error calculating age:", err);
    return "";
  }
};
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
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";

  debug.warn("ensureString received non-primitive value:", value);
  return String(value ?? "");
}

/**
 * Normalize Phone Number
 * ----------------------
 * @param phone
 * @example
 * normalizePhone("6481216411") // -> +7(648)121-64-11
 */
export function formatPhoneForServer(phone: string | null | undefined): string {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");
  const normalized = digits.length === 10 ? `7${digits}` : digits;

  if (normalized.length === 11 && normalized.startsWith("7")) {
    return `+7(${normalized.slice(1, 4)})${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
  }
  return "";
}

export const formatDateForServer = (
  dayjsObj: Dayjs | null | undefined,
): string | null => dayjsObj?.format("YYYY-MM-DD") ?? null;
