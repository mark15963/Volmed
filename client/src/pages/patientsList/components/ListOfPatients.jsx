import { useEffect, useState } from "react";
import axios from "axios";
import moment from 'moment';
import { useNavigate } from "react-router";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import 'react-loading-skeleton/dist/skeleton.css';
import styles from './styles/patientList.module.scss'

import api from "../../../services/api";
import debug from "../../../utils/debug";

export const ListOfPatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // List state UI
  const getStateClass = (state) => {
    switch (state) {
      case 'Стабильно': return styles.stable;
      case 'Cредней степени тяжести': return styles.moderate;
      case 'Критическое': return styles.critical;
      case 'Выписан':
      case 'Выписана':
        return styles.leave;
      default: return '';
    }
  }

  // Fetching all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.getPatients()
        const data = Array.isArray(response.data)
          ? response.data
          : [];
        // debug.table(data, ['id', 'lastName', 'firstName', 'patr', 'birthDate', 'created_at', 'state'])
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

  const handlePatientClick = (patientId, e) => {
    if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') {
        e.preventDefault();
      }
      debug.log(`Clicked on patient ID ${patientId}`)
      navigate(`/search/${patientId}`)
    }
  }

  return (
    <div className={styles.container}>
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
          {loading
            ? (
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
                  onClick={(e) => handlePatientClick(patient.id, e)}
                  onKeyDown={(e) => handlePatientClick(patient.id, e)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Данные ${patient.lastName} ${patient.firstName} ${patient.patr}`}
                >
                  <td>
                    {patient.id}
                  </td>
                  <td>
                    {patient.lastName} {patient.firstName} {patient.patr}
                  </td>
                  <td>
                    {moment(patient.birthDate).format('DD.MM.YYYY')}
                  </td>
                  <td>
                    {moment(patient.created_at).format('DD.MM.YYYY')}
                  </td>
                  <td className={`${getStateClass(patient.state)}`}>
                    {patient.state}
                  </td>
                </tr>
              ))
            ) : patients.length === 0 ? (
              <tr>
                <td className={styles.noData}>
                  No patients!
                </td>
              </tr>
            ) : (
              <tr>
                <td className={styles.noData}>
                  No data found!
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div >
  )
}