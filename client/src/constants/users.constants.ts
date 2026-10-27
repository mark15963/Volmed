/** Backend role identifiers → display names */
export const statusDisplayMap = {
  admin: "Администратор",
  tester: "Тестировщик",
  doctor: "Врач",
  nurse: "Медсестра",
};

/** Display names → backend role identifiers */
export const displayStatusMap = Object.fromEntries(
  Object.entries(statusDisplayMap).map(([key, value]) => [value, key]),
);

/** Backend role identifiers allowed for doctors */
export const ALLOWED_DOCTOR_USERS = ["doctor", "admin", "tester"] as const;

/** Backend role identifiers allowed for nurses */
export const ALLOWED_NURSE_USERS = ["nurse"] as const;

/** Available role display names */
export const USER_STATUS_OPTIONS = Object.values(statusDisplayMap);
