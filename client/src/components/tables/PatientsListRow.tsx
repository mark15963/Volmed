// ROWS COMPONENTS

// ===== IMPORTS =====
import { FC } from "react";
import styles from "./PatientsListRow.module.scss";
import moment from "moment";
import { calculateAge, getStateClass, debug } from "../../utils";
import { PatientRowProps } from "../../types/patient";
import { SexIcon } from "../icons";
import { extractMkbCode } from "../../services/extractMkbCode";
import { useNavigate } from "react-router";

export const PatientsListRow: FC<PatientRowProps> = ({ patient }) => {
  const navigate = useNavigate();
  const {
    id,
    lastName,
    firstName,
    patr = "",
    birthDate,
    sex,
    created_at,
    room,
    doctor,
    diag,
    state,
    allergy = "Неизвестно",
  } = patient;

  const displayAge = calculateAge(birthDate);
  const stateClassName = styles[getStateClass(state)] || "";

  return (
    <tr
      className={styles.rows}
      onClick={() => {
        navigate(`/search/${patient.id}`, {
          state: { patient },
        });
      }}
      tabIndex={0}
      role="button"
      aria-label={`Данные ${lastName} ${firstName} ${patr}`}
    >
      <td>{id}</td>
      <td>
        {lastName} {firstName} {patr}
      </td>
      <td>{displayAge}</td>
      <td>
        <SexIcon sex={sex} />
      </td>
      <td>{moment(created_at).format("DD.MM.YYYY")}</td>
      <td>{room}</td>
      <td>{doctor}</td>
      <td>{extractMkbCode(diag)}</td>
      <td className={stateClassName}>{state}</td>
      <td>{allergy}</td>
    </tr>
  );
};
