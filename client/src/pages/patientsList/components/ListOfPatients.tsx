//#region ===== IMPORTS =====
import { FC, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

// --- COMPONENTS ---
import { PatientsListRow } from "../../../components/tables/PatientsListRow";

// --- HOOKS ---
import { usePatientList } from "../../../hooks/Patients/usePatientsList";

// --- UI ---
import { SkeletonLoader } from "../../../components/ui/loaders/SkeletonLoader";
import styles from "../../../components/tables/PatientsListRow.module.scss";
//#endregion

interface ListProps {
  option?: "all" | "active" | "non-active";
  theme?: "default" | "light" | "dark";
}

/**
 * ListOfPatients
 * --------------
 * Displays a table with all patients from the database.
 *
 * Responsibilities:
 * - Fetch and render patient data using `usePatientList()`.
 * - Show skeleton loader during loading state.
 * - Navigate to a patient's detail page on click or keyboard action.
 *
 * @returns {JSX.Element} Rendered table of patients
 */
export const ListOfPatients: FC<ListProps> = ({
  option = "all",
  theme = "default",
}) => {
  const { patients, loading, error } = usePatientList();

  const filteredPatients = useMemo(() => {
    if (option === "all") return patients;
    if (option === "active") {
      return patients.filter((p) => p.state !== "Выписан");
    }
    if (option === "non-active") {
      return patients.filter((p) => p.state === "Выписан");
    }
    return patients;
  }, [patients, option]);

  useEffect(() => {
    if (error) {
      console.error("Patients list error:", error);
    }
  }, [error]);

  const renderContent = () => {
    if (loading) return <SkeletonLoader lines="5" />;
    if (error) {
      return (
        <tr>
          <td colSpan={10} className={styles.noData}>
            Ошибка загрузки пациентов...
            {error}
          </td>
        </tr>
      );
    }
    if (filteredPatients.length === 0) {
      let message = `Пациентов не найдено по выбранному фильтру: ${option}`;

      if (option === "active") message = "Нет пациентов в стационаре";
      if (option === "non-active") message = "Нет выписанных пациентов";

      return (
        <tr>
          <td colSpan={10} className={styles.noData}>
            {message}
          </td>
        </tr>
      );
    }
    return filteredPatients.map((patient) => (
      <PatientsListRow key={patient.id} patient={patient} />
    ));
  };

  return (
    <table className={styles.table} data-theme={theme}>
      <thead className={styles.head}>
        <tr className={styles.rows}>
          <th>#</th>
          <th>ФИО</th>
          <th>Возраст</th>
          <th>Пол</th>
          <th>Поступление</th>
          <th>Палата</th>
          <th>Врач</th>
          <th>МКБ</th>
          <th>Состояние</th>
          <th>Аллергии / Риски</th>
        </tr>
      </thead>
      <tbody className={styles.tbody}>{renderContent()}</tbody>
    </table>
  );
};
