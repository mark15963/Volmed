//#region ===== IMPORTS =====
import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import { fetchPatientCount } from "../../../api/fetchPatientCount";

import debug from "../../../utils/debug";

import styles from './styles/patientList.module.scss'
import { fetchPatients } from "../../../api";
//#endregion

export const PatientCount = () => {
  const [count, setCount] = useState(0)           // total from backend
  const [activeCount, setActiveCount] = useState(0) // filtered
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])    // from /patients
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const loadCount = async () => {
      try {
        const [countRes, patientsRes] = await Promise.all([
          fetchPatientCount(),
          fetchPatients()
        ])
        if (countRes.ok) setCount(countRes.count)

        if (patientsRes.ok) {
          const active = patientsRes.patients.filter(
            p => p.state !== "Выписан" && p.state !== "Выписана"
          )
          setPatients(active)
          setActiveCount(active.length)
        }
      } catch (err) {
        debug.error("ParientCount error:", err)
        setCount("N/A")
      } finally {
        setLoading(false)
      }
    };
    loadCount();
  }, []);

  const handleMouseEnter = async () => setShowTooltip(true)
  const handleMouseLeave = () => setShowTooltip(false)

  return (
    <div
      className={styles.countContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative" }}
    >
      <span style={{ marginRight: '10px' }}>Активных пациентов: </span>
      {loading ? (
        <SkeletonTheme baseColor="#51a1da" highlightColor="#488ab9">
          <Skeleton
            borderRadius={5}
            width='20px'
            duration='3'
            inline />
        </SkeletonTheme>
      ) : (
        <span className={styles.counterText}>{activeCount}</span>
      )}

      {showTooltip && (
        <div className={styles.tooltipBox}>
          <strong>Всего пациентов:</strong> {count}
        </div>
      )}
    </div>
  )
}