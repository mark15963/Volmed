import { useEffect, useRef } from "react";

export function useResetEditingOnTabChange(activeTab, filesHook, medsHook) {
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    const prevTab = prevTabRef.current;
    if (activeTab !== prevTab) {
      filesHook.setIsEditing(false);
      medsHook.setIsEditing(false);

      if (activeTab !== 2 && medsHook.medications.length > 0) {
        const lastItem = medsHook.medications[medsHook.medications.length - 1];
        if (
          !lastItem.name.trim() &&
          !lastItem.dosage.trim() &&
          !lastItem.frequency.trim()
        ) {
          medsHook.setMedications((prev) => prev.slice(0, -1));
        }
      }
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);
}
