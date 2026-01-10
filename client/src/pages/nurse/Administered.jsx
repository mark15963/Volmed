import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import moment from 'moment';

import Button from "../../components/Button";

import api from "../../services/api";
import debug from "../../utils/debug";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from "./administeredStyles.module.scss"
import { parseApiResponse } from "../../utils/parseApiResponse";
import { useApi } from "../../hooks/useApi";

const Administered = () => {
  const { data: patients, loading, error } = useApi(
    () => api.getPatients(),
    [],
    []
  )

  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        <div className={styles.title}>
          СПИСОК ПОСТУПИВШИХ
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
            ) : error ? (
              <tr>
                <td colSpan={4} className={styles.noData}>
                  ⚠️ Не удалось загрузить данные<br />
                  <small>{error}</small>
                </td>
              </tr>
            ) : patients && patients.length > 0 ? (
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
          navigateTo="INDEX"
          style={{
            marginTop: "15px"
          }}
        />
      </div>
    </div>
  )
}

export default Administered
