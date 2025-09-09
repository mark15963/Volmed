import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import moment from 'moment';

import Button from "../../components/Button";

import api from "../../services/api";
import debug from "../../utils/debug";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from "./dischargedStyles.module.scss"

const Discharged = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.getPatients()
        const data = Array.isArray(response.data) ? response.data : [];
        debug.table(data, ['id', 'room', 'created_at', 'lastName', 'firstName', 'patr', 'diag'])

        const dischargedPatients = data.filter(patient => patient.state === "Выписана" || patient.state === "Выписан")

        setPatients(dischargedPatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        <div className={styles.title}>
          Список выписанных
        </div>
        <table className={styles.table}>

          <thead className={styles.head}>
            <tr className={styles.rows}>
              <th>#</th>
              <th>Поступление</th>
              <th>ФИО</th>
              <th>Диагноз</th>
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
                  <td>{patient.id}</td>
                  <td>{moment(patient.created_at).format('DD.MM.YYYY')}</td>
                  <td>{patient.lastName} {patient.firstName} {patient.patr}</td>
                  <td>{patient.diag}</td>
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

export default Discharged
