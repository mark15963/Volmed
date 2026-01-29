//#region ===== IMPORTS =====
import React, { FC, useEffect, useMemo, useState } from "react";

// --- COMPONENTS ---
import { PatientsListRow } from "./PatientsListRow";

// --- HOOKS ---
import { usePatientList } from "../../hooks/Patients/usePatientsList";

// --- UI ---
import { SkeletonLoader } from "../ui/loaders/SkeletonLoader";
import styles from "./PatientsListRow.module.scss";
import { Patient } from "../../types/patient";
import Tab1 from "../../pages/searchResults/tabs/tab1";
//#endregion

/**
 * Props for the {@link ListOfPatients} component.
 */
interface ListOfPatientsProps {
  /**
   * Filter mode for displaying patients.
   * @default "all"
   */
  option?: "all" | "active" | "non-active";

  /**
   * Visual theme of the patient table.
   * @default "default"
   */
  theme?: "default" | "light" | "dark";

  /**
   * Behavior when clicking on a patient row.
   * - `"navigate"` — navigates to the patient's detailed page
   * - `"popup"` — opens a modal popup with patient details (Tab1 content)
   * @default "navigate"
   */
  onRowClick?: "navigate" | "popup";
}

/**
 * Displays a responsive table of patients with filtering, loading states, and error handling.
 *
 * Features:
 * - Fetches patient data using the `usePatientList` hook
 * - Supports filtering: all patients, currently active (in hospital), or discharged
 * - Shows skeleton loader during data fetching
 * - Displays user-friendly messages when no data is available or on error
 * - Supports two interaction modes:
 *   - Navigation to full patient page
 *   - Modal popup with detailed patient information (Tab1)
 * - Theme customization (default, light, dark)
 *
 * @example
 * ```tsx
 * // Show only currently hospitalized patients with dark theme
 * <ListOfPatients option="active" theme="dark" />
 *
 * // Open details in popup instead of navigation
 * <ListOfPatients onRowClick="popup" />
 * ```
 *
 * @param props - Component properties
 * @returns Rendered patient table with optional popup
 */
export const ListOfPatients: FC<ListOfPatientsProps> = ({
  option = "all",
  theme = "default",
  onRowClick = "navigate",
}) => {
  const { patients, loading, error } = usePatientList();

  const [showPatientData, setShowPatientData] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<
    number | string | null
  >(null);

  /**
   * Memoized filtered list of patients based on the `option` prop.
   */
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

  // Log errors to console (can be replaced with toast/notification system)
  useEffect(() => {
    if (error) {
      console.error("Patients list error:", error);
    }
  }, [error]);

  const handleOpenPatientData = (patientId: number | string) => {
    setSelectedPatientId(patientId);
    setShowPatientData(true);
  };

  const handleClosePatientData = () => {
    setShowPatientData(false);
    setSelectedPatientId(null);
  };

  const selectedPatient = filteredPatients.find(
    (p) => p.id === selectedPatientId,
  );

  /**
   * Renders table content depending on loading, error, empty, or data states.
   */
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
      <PatientsListRow
        key={patient.id}
        patient={patient}
        onRowClick={onRowClick}
        displayState={() => handleOpenPatientData(patient.id)}
      />
    ));
  };

  return (
    <>
      {showPatientData && selectedPatient && (
        <Popup patient={selectedPatient} onClose={handleClosePatientData} />
      )}
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
    </>
  );
};

/**
 * Modal/popup component that displays detailed patient information (Tab1).
 *
 * Features:
 * - Full-screen overlay with semi-transparent background
 * - Centered scrollable content area
 * - Closes when clicking outside the content
 * - Restores scroll position on close
 *
 * @internal
 * @param patient - The selected patient data to display
 * @param onClose - Callback to close the popup
 */
const Popup: FC<{ patient: Patient; onClose: () => void }> = ({
  patient,
  onClose,
}) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Restore scroll position when popup unmounts
  useEffect(() => {
    const scrollY = window.scrollY;

    return () => {
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        display: "flex",
        top: "0px",
        left: "0px",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#00000090",
        zIndex: 10,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          width: "70%",
          height: "fit-content",
          maxHeight: "90vh",
          margin: "50px",
          overflowY: "scroll",
          scrollbarWidth: "none",
        }}
      >
        <Tab1 data={patient} />
      </div>
    </div>
  );
};
