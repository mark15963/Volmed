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
  const [showTooltip, setShowTooltip] = useState(false)

  // Load filtered patients count without the discharged
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      debug.log("🔄 Loading patient data...");

      try {
        const [countRes, patientsRes] = await Promise.all([
          api.getPatientCount(),
          api.getPatients()
        ])

        // --- Total count ---
        if (countRes.ok) {
          setCount(countRes.data.count);
          debug.log("✅ Total count loaded:", countRes.data.count);
        } else {
          debug.error("❌ Error loading total count:", countRes.message);
          setCount("N/A");
        }

        // --- Active (filtered) patients ---
        if (patientsRes.ok) {
          const active = patientsRes.data.filter(
            p => p.state !== "Выписан" && p.state !== "Выписана"
          )
          setActiveCount(active.length)
          debug.log("✅ Active count loaded:", active.length);

        } else {
          debug.error("❌ Error loading patients:", patientsRes.message);
          setActiveCount(0);
        }
      } catch (err) {
        debug.error("PatientCount error:", err)
        setCount("N/A")
      } finally {
        setLoading(false)
      }
    };
    loadData();
  }, []);

  // Log when values change
  useEffect(() => {
    debug.log("🧮 Updated state => count:", count, "activeCount:", activeCount, "loading:", loading);
  }, [count, activeCount, loading]);

  const handleMouseEnter = async () => setShowTooltip(true)
  const handleMouseLeave = () => setShowTooltip(false)

  useEffect(() => {
    debug.log("activeCount updated:", activeCount, "loading:", loading)
  }, [activeCount, loading])

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
            width='15px'
            duration='3'
            inline />
        </SkeletonTheme>
      ) : (
        <span className={styles.counterText}>{activeCount}</span>
      )}

      {!loading &&
        showTooltip && (
          <div className={styles.tooltipBox}>
            <strong>Всего пациентов: </strong> {loading ? '' : count}
          </div>
        )}
    </div>
  )
}