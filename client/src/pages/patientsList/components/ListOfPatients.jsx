//#region ===== IMPORTS =====
import { useEffect, useState } from "react";
import moment from 'moment';
import { useNavigate } from "react-router";

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
  const navigate = useNavigate()

  // State elements UI
  const getStateClass = (state) => {
    switch (state) {
      case 'Стабильно': return styles.stable;
      case 'Cредней степени тяжести': return styles.moderate;
      case 'Критическое': return styles.critical;
      case 'Выписан':
      case 'Выписана': return styles.leave;
      default: return '';
    }
  }

  const handlePatientClick = (patient, e) => {
    if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') e.preventDefault();
      debug.log(`Clicked on patient ID ${patient.id}.`)
      debug.log(`Sent data:`, patient)
      navigate(`/search/${patient.id}`, {
        state: { patient }
      })
    }
  }

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
          patients.map(patient => (
            <tr
              key={patient.id}
              className={styles.rows}
              onClick={(e) => handlePatientClick(patient, e)}
              onKeyDown={(e) => handlePatientClick(patient, e)}
              tabIndex={0}
              role="button"
              aria-label={`Данные ${patient.lastName} ${patient.firstName} ${patient.patr}`}
            >
              <td>{patient.id}</td>
              <td>{patient.lastName} {patient.firstName} {patient.patr}</td>
              <td>{moment(patient.birthDate).format('DD.MM.YYYY')}</td>
              <td>{moment(patient.created_at).format('DD.MM.YYYY')}</td>
              <td className={getStateClass(patient.state)}>{patient.state}</td>
            </tr>
          ))
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

/**
 * usePatientList
 * --------------
 * Fetches a list of all patients from the API.
 *
 * Handles loading and error states automatically and returns the results
 * in a format ready to use in table components or dropdowns.
 *
 * @returns {{
 *   patients: Array<Object>,
 *   loading: boolean,
 *   error: Error|null
 * }} Patient list state and control flags
 */
function usePatientList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getPatients()
      .then(res => {
        if (res.ok) setPatients(res.data)
        else throw new Error(res.message)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])
  return { patients, loading, error }
}