import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from './table.module.css'
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const PatientsList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const response = await axios.get("http://localhost:5000/api/patients");
      setPatients(response.data);
    };
    fetchPatients();
  }, []);

  let res = patients.map((patient) => {

    return (
      <tr key={patient.id}>
        <td>{patient.id}</td>
        <td>{patient.lastName} {patient.firstName} {patient.patr}</td>
        <td>{patient.sex}</td>
        <td>{moment(patient.birthDay).format('DD.MM.YYYY')}</td>
        <td>{patient.diag}</td>
        <td>{patient.mkb}</td>
        <td>{moment(patient.created_at).format('DD.MM.YYYY')}</td>
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
      {loading ? (
        <SkeletonTheme baseColor="#51a1da" highlightColor="#488ab9">
          <table className={styles.skeleton}>
            <tbody>
              <tr style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <td><Skeleton borderRadius={5} width='80%' duration='3' /></td>
                <td><Skeleton borderRadius={5} width='70%' duration='3' /></td>
                <td><Skeleton borderRadius={5} width='80%' duration='3' /></td>
                <td><Skeleton borderRadius={5} width='70%' duration='3' /></td>
                <td><Skeleton borderRadius={5} width='80%' duration='3' /></td>
              </tr>
            </tbody>
          </table>
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
                <td style={{ width: '50px' }}>№{patient.id}:</td>
                <td>{patient.lastName} {patient.firstName} {patient.patr}</td>
              </tr>
            </tbody>
          </table>
        ))
      )}
    </div>
  )
}

/*
export const PatientsList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const response = await axios.get("http://localhost:5000/api/patients");
      setPatients(response.data);
    };
    fetchPatients();
  }, []);

  let res = patients.map((patient) => {

    return (
      <tr key={patient.id}>
        <td>{patient.id}</td>
        <td>{patient.lastName} </td>
        <td>{patient.firstName}</td>
        <td>{patient.patr}</td>
        <td>{patient.sex}</td>
        <td>{moment(patient.birthDay).format('DD.MM.YYYY')}</td>
        <td>{patient.phone}</td>
        <td>{patient.email}</td>
        <td>{patient.address}</td>
        <td>{patient.complaint}</td>
        <td>{patient.anam}</td>
        <td>{patient.life}</td>
        <td>{patient.status}</td>
        <td>{patient.diag}</td>
        <td>{patient.mkb}</td>
        <td>{patient.sop_zab}</td>
        <td>{moment(patient.created_at).format('DD.MM.YYYY')}</td>
        <td>{patient.statusReport}</td>
        <td>{patient.report}</td>
        <td>{patient.treatment}</td>
      </tr>
    )

  })

  return (
    <table className={styles.table}>
      <thead>
        <tr style={{ minWidth: '50px', fontWeight: '700' }}>
          <th style={{ minWidth: '50px' }}>№ ИБ</th>
          <th>Фамилия</th>
          <th>Имя</th>
          <th>Отчество</th>
          <th>Пол</th>
          <th style={{ minWidth: '110px' }}>Год рождения</th>
          <th style={{ minWidth: '130px' }}>Телефон</th>
          <th>E-Mail</th>
          <th style={{ minWidth: '250px' }}>Адрес</th>
          <th style={{ minWidth: '300px' }}>Жалобы</th>
          <th style={{ minWidth: '1000px' }}>История настоящего заболевания</th>
          <th style={{ minWidth: '1000px' }}>Анамнез жизни</th>
          <th style={{ minWidth: '1500px' }}>Локальный статус</th>
          <th style={{ minWidth: '300px' }}>Диагноз</th>
          <th style={{ minWidth: '300px' }}>МКБ</th>
          <th style={{ minWidth: '300px' }}>Сопутствующие заболевания</th>
          <th style={{ minWidth: '150px' }}>Дата поступления</th>
          <th>-</th>
          <th>Эпикриз</th>
          <th>Лечение</th>
        </tr>
      </thead>
      <tbody>
        {res}
      </tbody>
    </table>
  );
};
*/

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
      <div style={{ color: 'aliceblue' }}>
        <span>Общее количиство пациентов: </span>
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