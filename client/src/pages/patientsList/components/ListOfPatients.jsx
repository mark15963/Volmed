//#region ===== IMPORTS =====
import { useEffect, useState } from "react";

// --- COMPONENTS ---
import { PatientsListRow } from "../../../components/tables/Row";

// --- HOOKS ---
import { usePatientList } from "../../../hooks/Patients/usePatientsList";

// --- TOOLS ---
import api from "../../../services/api";
import debug from "../../../utils/debug";

// --- UI ---
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './styles/patientList.module.scss'
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

  return (
    <table className={styles.table}>
      <thead className={styles.head}>
        <tr className={styles.rows}>
          <th>#</th>
          <th>ФИО</th>
          <th>Дата рождения</th>
          <th>Поступление</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody className={styles.tbody}>
        {loading ? (                  // Loading
          <SkeletonTheme baseColor="#51a1da" highlightColor="#488ab9">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className={styles.rowsLoading}>
                <td>
                  <Skeleton borderRadius={5} />
                </td>
              </tr>
            ))}
          </SkeletonTheme>
        ) : error ? (
          <tr>
            <td className={styles.noData}>
              Error loading patients
            </td>
          </tr>

        ) : patients.length > 0 ? (   // Existing patients
          <PatientsListRow />         // Row component
        ) : patients.length === 0 ? ( // No patients
          <tr>
            <td className={styles.noData}>
              No patients!
            </td>
          </tr>
        ) : (
          <tr>
            <td className={styles.noData}>
              No patients!
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

