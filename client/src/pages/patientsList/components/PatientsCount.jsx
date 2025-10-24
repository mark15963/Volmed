import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import api from "../../../services/api";
import debug from "../../../utils/debug";

import styles from './styles/patientList.module.scss'

export const PatientCount = () => {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await api.getPatientCount()
        const count = response.data?.count || 0;
        debug.log(`patients - ${count}`)
        setCount(count);
      } catch (error) {
        debug.error("Error fetching count:", error);
        setCount('N/A');
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, []);

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
        <span className={styles.counterText}>{count}</span>
      )}
    </div>
  )
}