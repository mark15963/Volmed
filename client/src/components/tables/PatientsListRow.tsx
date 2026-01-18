// ROWS COMPONENTS

// ===== IMPORTS =====
import { FC } from "react";
import styles from "./PatientsListRow.module.scss";
import moment from "moment";
import { calculateAge, getStateClass, debug } from "../../utils";
import { PatientRowProps } from "../../types/patient";

const getSexIcon = (sex: string) => {
  switch (sex) {
    case "M":
    case "М":
    case "Мужской":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15 15.5C15 19.0899 12.0899 22 8.5 22C4.91015 22 2 19.0899 2 15.5C2 11.9101 4.91015 9 8.5 9C12.0899 9 15 11.9101 15 15.5Z"
            stroke="#0f4882"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 2H22V9"
            stroke="#0f4882"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.5 10.5L22 2"
            stroke="#0f4882"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "F":
    case "Ж":
    case "Женский":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M18.5 8.5C18.5 12.0899 15.5899 15 12 15C8.41015 15 5.5 12.0899 5.5 8.5C5.5 4.91015 8.41015 2 12 2C15.5899 2 18.5 4.91015 18.5 8.5Z"
            stroke="#f11f73"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 19H16.5"
            stroke="#f11f73"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22L12 15"
            stroke="#f11f73"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return <span className={styles.sexUnknown}>?</span>;
  }
};

export const PatientsListRow: FC<PatientRowProps> = ({
  id,
  lastName,
  firstName,
  patr = "",
  birthDate,
  sex,
  createdAt,
  room,
  doctor,
  mkb,
  state,
  allergy = "Неизвестно",
  onClick,
}) => {
  const displayAge = calculateAge(birthDate);
  const stateClassName = styles[getStateClass(state)] || "";
  return (
    <tr
      className={styles.rows}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Данные ${lastName} ${firstName} ${patr}`}
    >
      <td>{id}</td>
      <td>
        {lastName} {firstName} {patr}
      </td>
      <td>{displayAge}</td>
      <td>{getSexIcon(sex)}</td>
      <td>{moment(createdAt).format("DD.MM.YYYY")}</td>
      <td>{room}</td>
      <td>{doctor}</td>
      <td>{mkb}</td>
      <td className={stateClassName}>{state}</td>
      <td>{allergy}</td>
    </tr>
  );
};
