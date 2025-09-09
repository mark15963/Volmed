import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import moment from 'moment';

import Button from "../../components/Button";

import api from "../../services/api";
import debug from "../../utils/debug";
import { useAuth } from "../../context"

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import styles from "./hospitalizedStyles.module.scss"

const Hospitalized = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { authState } = useAuth();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.getPatients()
        const data = Array.isArray(response.data) ? response.data : [];
        debug.table(data, ['id', 'created_at', 'lastName', 'firstName', 'patr', 'diag', 'doctor'])
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

  const filteredAndSortedPatients = patients.filter(patient => patient.room).sort((a, b) => {
    const roomA = parseInt(a.room) || 0
    const roomB = parseInt(b.room) || 0
    return roomA - roomB
  })

  const drFullName = `${authState.user?.lastName ?? ""} ${authState.user?.firstName ?? ""} ${authState.user?.patr ?? ""}`.trim();

  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        <div className={styles.title}>
          ПАЦИЕНТЫ ОТДЕЛЕНИЯ
        </div>
        <table className={styles.table}>

          <thead className={styles.head}>
            <tr className={styles.rows}>
              <th>Фамилия</th>
              <th>Палата</th>
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
            ) : filteredAndSortedPatients.length > 0 ? (
              filteredAndSortedPatients.map(patient => (
                <tr
                  key={patient.id}
                  className={styles.rows}
                >
                  <td>{patient.lastName}</td>
                  <td>{patient.room || "N/A"}</td>
                  <td>{calculateAge(patient.birthDate)}</td>
                  <td>{patient.insurance}</td>
                  <td>{patient.diag}</td>
                  <td>{drFullName}</td>
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
        <Button
          text="Назад"
          onClick={() => {
            navigate("/")
          }}
          style={{
            marginTop: "15px"
          }}
        />
      </div>
    </div>
  )
}

export default Hospitalized
