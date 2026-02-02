//#region === IMPORTS ===
import { FC } from "react";
import styles from "./PatientsListRow.module.scss";
import moment from "moment";
import { calculateAge, getStateClass, debug } from "../../utils";
import { PatientRowProps } from "../../types/patient";
import { SexIcon } from "../icons";
import { extractMkbCode } from "../../services/extractMkbCode";
import { useNavigate } from "react-router";
//#endregion

/**
 * Renders a single row in the patients table.
 *
 * Features:
 * - Displays formatted patient data (name, age, sex, admission date, room, doctor, diagnosis code, state, allergies)
 * - Handles two interaction modes:
 *   - Navigation to detailed patient page (`/search/:id`)
 *   - Triggers popup modal (via `displayState` callback)
 * - Accessible row (tabindex + aria-label)
 * - Applies dynamic CSS class to state cell based on patient condition
 *
 * @remarks
 * - Uses `moment` for date formatting — consider migrating to `date-fns` or `luxon` in the future (moment is in maintenance mode)
 * - `extractMkbCode` extracts the primary ICD-10 code from the diagnosis string
 * - `SexIcon` renders gender-specific icon
 * - Row is clickable and keyboard-focusable
 *
 * @example
 * ```tsx
 * <PatientsListRow
 *   patient={somePatient}
 *   onRowClick="navigate"
 * />
 *
 * // In popup mode (passed from ListOfPatients)
 * <PatientsListRow
 *   patient={patient}
 *   onRowClick="popup"
 *   displayState={() => openPopup(patient.id)}
 * />
 * ```
 *
 * @param props - Row properties including patient data and interaction mode
 * @returns Clickable table row element
 */
export const PatientsListRow: FC<PatientRowProps> = ({
  patient,
  onRowClick,
  displayState,
}) => {
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

  const handleClick = () => {
    if (onRowClick === "navigate") {
      navigate(`/search/${patient.id}`, {
        state: { patient },
      });
    } else if (onRowClick === "popup" && displayState) {
      displayState();
    }
  };

  return (
    <tr
      className={styles.rows}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`Данные ${lastName} ${firstName} ${patr} (№${id})`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <td>{id}</td>
      <td>
        {lastName} {firstName} {patr}
      </td>
      <td>{displayAge}</td>
      <td>
        <SexIcon sex={sex} size={24} />
      </td>
      <td>{moment(created_at).format("DD.MM.YYYY")}</td>
      <td>{room || "-"}</td>
      <td>{doctor || "-"}</td>
      <td>{extractMkbCode(diag)}</td>
      <td className={stateClassName}>{state}</td>
      <td>{allergy}</td>
    </tr>
  );
};
