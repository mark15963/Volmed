import { useCallback, useEffect, useState } from "react";

import api from "../../services/api/index";
import debug from "../../utils/debug";

export function usePatientMedications(patientId, safeMessage) {
  const [medications, setMedications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const fetchMedications = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await api.getMedications(patientId);
      if (res.ok) {
        setMedications(
          res.data.map((med) => ({
            ...med,
            createdAt: med.createdAt || new Date().toISOString(),
          })),
        );
      } else {
        safeMessage("error", "Ошибка при получении назначений");
      }
    } catch (err) {
      console.error("Ошибка при получении назначений:", err);
      safeMessage("error", "Ошибка при получении назначений");
    }
  }, [patientId, safeMessage]);

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
  const handleSave = async () => {
    // Validation
    if (hasEmptyFields()) {
      safeMessage("error", "Пожалуйста, заполните все поля");
      return;
    }
    try {
      debug.log("Saving medication");
      safeMessage("loading", "Идет загрузка...", 1);

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
            if (res.ok) {
              setMedications((prev) =>
                prev.map((item) =>
                  item === med ? { ...item, id: res.data.id } : item,
                ),
              );
            } else {
              throw new Error(res.message);
            }
          }
        }),
      );

      setIsEditing(false);
      safeMessage("success", "Назначения успешно сохранены");
    } catch (err) {
      debug.error("Ошибка при сохранении назначений", err);
      safeMessage("error", "Ошибка при сохранении назначений: " + err.message);
    }
  };

  return {
    medications,
    setMedications,
    isEditing,
    setIsEditing,
    handleSave,
  };
}
