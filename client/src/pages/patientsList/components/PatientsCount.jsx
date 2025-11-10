//#region ===== IMPORTS =====
import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import debug from "../../../utils/debug";

import styles from './styles/patientList.module.scss'
import api from "../../../services/api";
//#endregion

export const PatientCount = () => {
  const [count, setCount] = useState(0)             // total from backend
  const [activeCount, setActiveCount] = useState(0) // filtered
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])      // from /patients
  const [showTooltip, setShowTooltip] = useState(false)

  // Load filtered patients count without the discharged
  useEffect(() => {
    const loadFilteredCount = async () => {
      try {
        const [countRes, patientsRes] = await Promise.all([
          api.getPatientCount(),
          api.getPatients()
        ])
        if (countRes.ok) setCount(countRes.data.count)

        if (patientsRes.ok) {
          const active = patientsRes.data.filter(
            p => p.state !== "Выписан" && p.state !== "Выписана"
          )
          setPatients(active)
          setActiveCount(active.length)
        }
      } catch (err) {
        debug.error("PatientCount error:", err)
        setCount("N/A")
      } finally {
        setLoading(false)
      }
    };
    loadFilteredCount();
  }, []);

  useEffect(() => {
    const loadPatientCount = async () => {
      const res = await api.getPatientCount()
      if (res.ok) {
        setCount(res.data.count)
      } else {
        debug.error("Error fetching patients count", res.message)
        setCount("N/A")
      }
      setLoading(false)
    }
    loadPatientCount()
  }, [])

  const handleMouseEnter = async () => setShowTooltip(true)
  const handleMouseLeave = () => setShowTooltip(false)

  return (
    <div className={styles.countContainer}>
      <span
        style={{ marginRight: '5px' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Активных пациентов:
      </span>
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
          <strong>Всего пациентов: </strong> {loading ? '' : count}
        </div>
      )}
    </div>
  )
}