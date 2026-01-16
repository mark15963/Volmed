//#region ===== IMPORTS =====
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate()

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
    return patients.map((p) => (
      <PatientsListRow
        key={p.id}
        id={p.id}
        lastName={p.lastName}
        firstName={p.firstName}
        patr={p.patr}
        birthDate={p.birthDate}
        sex={p.sex}
        createdAt={p.created_at}
        room={p.room}
        doctor={p.doctor}
        mkb={p.diag}
        state={p.state}
        allergy={p.allergy}
        onClick={() => {
          navigate(`/search/${p.id}`, {
            state: { patient: p }
          })
        }}
      />
    ))
  }

  return (
    <table>
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

