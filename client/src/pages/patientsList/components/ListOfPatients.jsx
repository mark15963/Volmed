//#region ===== IMPORTS =====
import { useEffect, useState } from "react";

// --- COMPONENTS ---
import { PatientsListRow } from "../../../components/tables/PatientsListRow";

// --- HOOKS ---
import { usePatientList } from "../../../hooks/Patients/usePatientsList";

// --- TOOLS ---
import api from "../../../services/api";
import debug from "../../../utils/debug";

// --- UI ---
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from '../../../components/tables/PatientsListRow.module.scss'
//#endregion

//#region ===== COMPONENT =====
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
export const ListOfPatients = () => {
  const { patients, loading, error } = usePatientList()

  useEffect(() => {
    if (error) {
      console.error("Patients list error:", error);
    }
  }, [error]);

  const renderContent = () => {
    if (loading) {
      return (
        <SkeletonTheme baseColor="#51a1da" highlightColor="#488ab9">
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className={styles.rowsLoading}>
              <td>
                <Skeleton borderRadius={5} />
              </td>
            </tr>
          ))}
        </SkeletonTheme>
      )
    }
    if (error) {
      return (
        <tr>
          <td colSpan={10} className={styles.noData}>
            Ошибка загрузки пациентов...
          </td>
        </tr>
      )
    }
    if (patients.length === 0) {
      return (
        <tr>
          <td colSpan={10} className={styles.noData}>
            Пациентов не найдено
          </td>
        </tr>
      );
    }
    return patients.map((patient) => (
      <PatientsListRow
        key={patient.id}
        id={patient.id}
        lastName={patient.lastName}
        firstName={patient.firstName}
        patr={patient.patr}
        age={patient.age}
        sex={patient.sex}
        createdAt={patient.createdAt}
        room={patient.room}
        doctor={patient.doctor}
        mkb={patient.mkb}
        state={patient.state}
        allergy={patient.allergy}
      // onClick={() => navigate(`/patients/${patient.id}`)}   // ← add later
      />
    ))
  }

  return (
    <table className={styles.table}>
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
      <tbody>{renderContent()}</tbody>
    </table>
  )
}

