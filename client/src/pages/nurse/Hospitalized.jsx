import { useEffect, useState } from "react";
import axios from "axios";
import moment from 'moment';

import api from "../../services/api";
import debug from "../../utils/debug";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import styles from "./styles.module.scss"

const Administered = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.getPatients()
        const data = Array.isArray(response.data) ? response.data : [];
        debug.table(data, ['id', 'created_at', 'lastName', 'firstName', 'patr', 'diag'])
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    const birthMoment = moment(birthDate);
    const now = moment();
    const years = now.diff(birthMoment, 'years');
    
    return `${years}`;
    
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        <div style={{ margin: "10px 0" }}>
          СПИСОК ПОСТУПИВШИХ
        </div>
        <table className={styles.table}>

          <thead className={styles.head}>
            <tr className={styles.rows}>
              <th>Фамилия</th>
              <th>Возраст</th>
              <th>Страховка</th>
              <th>Диагноз</th>
              <th>Врач</th>
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {loading ? (
            <SkeletonTheme baseColor="#51a1da" highlightColor="#488ab9">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className={styles.rowsLoading}>
                  <td>
                    <Skeleton borderRadius={5} />
                  </td>
                </tr>
              ))}
            </SkeletonTheme>
            ) : patients.length > 0 ? (
              patients.map(patient => (
                <tr
                  key={patient.id}
                  className={styles.rows}
                >
                  <td>{patient.lastName}</td>
                  <td>({calculateAge(patient.birthDate)})</td>
                  <td>{patient.insurance}</td>
                  <td>{patient.diag}</td>
                  <td>ЛЕЧ.ВРАЧ</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={styles.noData}>
                  Данные не найдены!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Administered
