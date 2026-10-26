//#region ===== IMPORTS =====
import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import { TooltipHover } from "../../../components/ui/TooltipHover";

import debug from "../../../utils/debug";
import api from "../../../services/api/index";

import styles from './styles/patientList.module.scss'
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
      debug.log("🔄 Loading data of patients...");

      try {
        const [countRes, activeRes] = await Promise.all([
          api.getPatientCount(),
          api.getPatients()
        ])

        // --- Total count ---
        if (countRes.ok) {
          setCount(countRes.data.count);
        } else {
          debug.error(`Error loading total count: ${countRes.message}`);
          setCount("N/A");
        }

        // --- Active (filtered) patients ---
        if (activeRes.ok) {
          const active = activeRes.data.filter(
            p => p.state !== "Выписан"
          )
          setActiveCount(active.length)
        } else {
          debug.error(`Error loading patients: ${activeRes.message}`);
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

  const handleMouseEnter = async () => setShowTooltip(true)
  const handleMouseLeave = () => setShowTooltip(false)

  return (
    <div className={styles.countContainer}>
      <TooltipHover
        content={
          <>
            <strong>Всего пациентов: </strong>      {/* The shown text when hovered */}
            {loading ? '' : count}                  {/* Total count */}
          </>
        }
      >
        <span>Пациенты в стационаре:</span>         {/* show the text text to activeCount */}
      </TooltipHover>
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
    </div>
  )
}