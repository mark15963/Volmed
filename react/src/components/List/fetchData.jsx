import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import styles from './table.module.css'

export const PatientsList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/patients");
        const patientsWithProperDates = response.data.map(patient => ({
          ...patient,
          birthDate: moment(patient.birthDate, 'DD.MM.YYYY').toISOString(),
          created_at: moment(patient.created_at).toISOString()
        }))
        setPatients(patientsWithProperDates);
      } catch (error) {
        console.log('Error:', error)
      }
    };
    fetchPatients();
  }, []);

  let res = patients.map((patient) => {

    return (
      <tr key={patient.id}>
        <td>{patient.id}</td>
        <td>{patient.lastName} {patient.firstName} {patient.patr}</td>
        <td>{patient.sex}</td>
        <td>{moment(patient.birthDate, 'DD.MM.YYYY').format('DD.MM.YYYY')}</td>
        <td>{patient.diag}</td>
        <td>{patient.mkb}</td>
        <td>{moment(patient.created_at).isValid() ? moment(patient.created_at).format('DD.MM.YYYY') : 'Invalid Date'}</td>
      </tr>
    )

  })

  return (
    <table className={styles.table}>
      <thead>
        <tr style={{ minWidth: '50px', fontWeight: '700' }}>
          <th style={{ minWidth: '50px' }}>№ ИБ</th>
          <th>ФИО</th>
          <th>Пол</th>
          <th style={{ minWidth: '130px' }}>Год рождения</th>
          <th style={{ minWidth: '300px' }}>Диагноз</th>
          <th style={{ minWidth: '300px' }}>МКБ</th>
          <th style={{ minWidth: '150px' }}>Дата поступления</th>
        </tr>
      </thead>
      <tbody>
        {res}
      </tbody>
    </table>
  );
};

export const AllPatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/patients");
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handlePatientClick = (patientId) => {
    navigate(`/search/${patientId}`)
  }


  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr className={styles.rows}>
            <th style={{ flex: 0.6 }}>№ карты</th>
            <th style={{ flex: 2 }}>ФИО</th>
            <th style={{ flex: 0.8 }}>Дата рождения</th>
          </tr>
        </thead>
      </table>
      {loading ? (
        <SkeletonTheme baseColor="#51a1da" highlightColor="#488ab9">
          {Array.from({ length: 5 }).map((_, i) => (
            <table key={i} className={styles.table}>
              <tbody >
                <tr className={styles.rows}>
                  <td style={{ flex: 0.6 }}>
                    <Skeleton borderRadius={5} width={80} />
                  </td>
                  <td style={{ flex: 2 }}>
                    <Skeleton borderRadius={5} width={390} />
                  </td>
                  <td style={{ flex: 0.8 }}>
                    <Skeleton borderRadius={5} width={170} />
                  </td>
                </tr>
              </tbody>
            </table>
          ))}
        </SkeletonTheme>
      ) : (

        patients.map(patient => (
          <table
            key={patient.id}
            className={styles.table}
            onClick={() => handlePatientClick(patient.id)}
            style={{ cursor: 'pointer' }}
          >
            <tbody>
              <tr className={styles.rows}>
                <td style={{ flex: 0.6 }}>№{patient.id}:</td>
                <td style={{ flex: 2 }}>{patient.lastName} {patient.firstName} {patient.patr}</td>
                <td style={{ flex: 0.8 }}>{moment(patient.birthDate).format('DD.MM.YYYY')}</td>
              </tr>
            </tbody>
          </table>
        ))
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
        const response = await axios.get('http://localhost:5000/api/patient-count')
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
    <div className={styles.container}>
      <div style={{ color: 'aliceblue', cursor: 'default' }}>
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
    </div>
  )
}