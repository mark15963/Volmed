import { useEffect, useState } from "react";
import axios from "axios";
import moment from 'moment';
import { useNavigate } from "react-router";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import styles from './styles/Table.module.css'

const API_BASE_URL = "https://volmed-v4-y364.vercel.app";

export const AllPatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/patients`);
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handlePatientClick = (patientId, e) => {
    if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') {
        e.preventDefault();
      }
      navigate(`/search/${patientId}`)
    }
  }


  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr className={styles.rows}>
            <th className={styles.first}>#</th>
            <th className={styles.second}>ФИО</th>
            <th className={styles.third}>Дата рождения</th>
          </tr>
        </thead>
      </table>
      {loading ? (
        <SkeletonTheme baseColor="#51a1da" highlightColor="#488ab9">
          {Array.from({ length: 5 }).map((_, i) => (
            <table key={i} className={styles.table}>
              <tbody >
                <tr className={styles.rowsLoading}>
                  <td style={{ padding: 5, flex: 0.6 }}>
                    <Skeleton borderRadius={5} width={90} />
                  </td>
                  <td style={{ padding: 5, flex: 2 }}>
                    <Skeleton borderRadius={5} width={340} />
                  </td>
                  <td style={{ padding: 5, flex: 0.8 }}>
                    <Skeleton borderRadius={5} width={140} />
                  </td>
                </tr>
              </tbody>
            </table>
          ))}
        </SkeletonTheme>
      ) : patients.length > 0 ? (
        patients.map(patient => (
          <table
            key={patient.id}
            className={styles.table}
            onClick={(e) => handlePatientClick(patient.id, e)}
            onKeyDown={(e) => handlePatientClick(patient.id, e)}
            style={{ cursor: 'pointer' }}
          >
            <tbody>
              <tr
                className={styles.rows}
                tabIndex={0}
                role="button"
                aria-label={`Данные ${patient.lastName} ${patient.firstName} ${patient.patr}`}
              >
                <td style={{ flex: 0.6 }}>{patient.id}</td>
                <td style={{ flex: 2 }}>{patient.lastName} {patient.firstName} {patient.patr}</td>
                <td style={{ flex: 0.8 }}>{moment(patient.birthDate).format('DD.MM.YYYY')}</td>
              </tr>
            </tbody>
          </table>
        ))
      ) : (
        <div className={styles.noData}>
          No data found!
        </div>
      )}

    </div >
  )
}

export const PatientCount = () => {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/patient-count`)
        setCount(response.data.count)
      } catch (error) {
        console.error("Error fetching count:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCount()
  }, [])

  return (
    <div className={styles.countContainer}>
      <span style={{ marginRight: '10px' }}>Всего пациентов: </span>
      {loading ? (
        <SkeletonTheme baseColor="#51a1da" highlightColor="#488ab9">
          <Skeleton
            borderRadius={5}
            width='20px'
            duration='3'
            inline />
        </SkeletonTheme>
      ) : (
        <span>{count}</span>
      )}
    </div>
  )
}