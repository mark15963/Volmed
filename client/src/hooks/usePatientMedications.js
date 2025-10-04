import { useCallback, useEffect, useState } from "react";

import api from "../services/api";
import debug from "../utils/debug";

export function usePatientMedications(patientId, messageApi) {
  const [medications, setMedications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const apiInstance = messageApi?.api ?? {
    success: () => {},
    error: () => {},
    open: () => {},
  };
  const contextHolder = messageApi?.holder;

  const fetchMedications = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await api.getMedications(patientId);
      setMedications(
        res.data.map((med) => ({
          ...med,
          createdAt: med.createdAt || new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error("Ошибка при получении назначений:", err);
    }
  }, [patientId]);

  // Reset edit mode when patient changes
  useEffect(() => {
    setIsEditing(false);
    fetchMedications();
  }, [patientId, fetchMedications]);

  // Validation
  const hasEmptyFields = () => {
    for (let i = 0; i < medications.length; i++) {
      const med = medications[i];
      const isLastRow = i === medications.length - 1;

      if (isLastRow) {
        const hasData =
          med.name.trim() || med.dosage.trim() || med.frequency.trim();

        // If last row has any data, check ALL required fields
        if (hasData) {
          // Checking fields data
          if (!med.name.trim() || !med.dosage.trim() || !med.frequency.trim())
            return true;
        }
      } else {
        if (!med.name.trim() || !med.dosage.trim() || !med.frequency.trim()) {
          // For non-last rows, check ALL required fields
          return true; // Non-last row has no name
        }
      }
    }
    return false;
  };

  const removeEmptyLastRow = () => {
    const lastItem = medications[medications.length - 1];
    const isEmpty =
      !lastItem.name.trim() &&
      !lastItem.dosage.trim() &&
      !lastItem.frequency.trim();

    if (isEmpty) {
      setMedications((prev) => prev.slice(0, -1));
    }
  };

  // UI/validation logic
  const handleSave = () => {
    // Validation
    if (hasEmptyFields()) {
      apiInstance.error("Пожалуйста, заполните все поля");
      return;
    }
    removeEmptyLastRow();
    handleSaveToAPI();
  };

  // Internal implementation to API
  const handleSaveToAPI = useCallback(async () => {
    try {
      debug.log("Saving medication");

      // Show loading message if there are changes
      await apiInstance.open?.({
        type: "loading",
        content: "Идет загрузка...",
        duration: 1,
      });

      const validMedications = medications.filter((item) => item.name?.trim());

      if (validMedications.length === 0) {
        setIsEditing(false);
        return;
      }

      await Promise.all(
        validMedications.map(async (med) => {
          const payload = {
            name: med.name.trim(),
            dosage: med.dosage?.trim() || "",
            frequency: med.frequency?.trim() || "",
            createdAt: med.createdAt || new Date().toISOString(),
          };

          if (med.id) {
            // update existing medication
            await api.updateMedication(med.id, payload);
          } else {
            // add new medication
            if (!patientId) throw new Error("Отсутствует ID пациента");
            const res = await api.createMedication(patientId, payload);

            setMedications((prev) =>
              prev.map((item) =>
                item === med ? { ...item, id: res.data.id } : item
              )
            );
          }
        })
      );

      setIsEditing(false);
      apiInstance.success("Назначения успешно сохранены");
    } catch (error) {
      debug.error("Ошибка при сохранении назначений", error);
      apiInstance.error("Ошибка при сохранении назначений: " + error.message);
    }
  }, [medications, patientId]);

  return {
    medications,
    setMedications,
    isEditing,
    setIsEditing,
    handleSave,
    contextHolder,
  };
}
