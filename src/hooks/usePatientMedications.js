import { useCallback, useEffect, useState } from "react";
import { message } from "antd";

import api from "../services/api";
import debug from "../utils/debug";

export function usePatientMedications(patientId, messageApiRef) {
  const [medications, setMedications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const messageApi = messageApiRef?.api;
  const contextHolder = messageApiRef?.holder;

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

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const handleSaveMedications = useCallback(async () => {
    try {
      debug.log("Saving medication");
      const validMedications = medications.filter((item) => item.name?.trim());

      if (validMedications.length !== medications.length) {
        throw new Error("Название препарата не может быть пустым");
      }

      if (validMedications.length === 0) {
        setIsEditing(false);
        return;
      }

      await Promise.all(
        validMedications.map(async (item) => {
          const payload = {
            name: item.name.trim(),
            dosage: item.dosage?.trim() || "",
            frequency: item.frequency?.trim() || "",
            createdAt: item.createdAt || new Date().toISOString(),
          };

          if (item.id) {
            await api.updateMedication(item.id, payload);
          } else {
            if (!patientId) throw new Error("Отсутствует ID пациента");
            const res = await api.createMedication(patientId, payload);
            setMedications((prev) =>
              prev.map((a) =>
                !a.id &&
                a.name === item.name &&
                a.dosage === item.dosage &&
                a.frequency === item.frequency
                  ? { ...a, id: res.data.id }
                  : a
              )
            );
          }
        })
      );

      setIsEditing(false);
      messageApi.success("Назначения успешно сохранены");
    } catch (error) {
      debug.error("Ошибка при сохранении назначений", error);
      messageApi.error("Ошибка при сохранении назначений: " + error.message);
    }
  }, [medications, patientId]);

  const handleSave = () => {
    const hasEmptyNames = medications.some((item, index) => {
      // Only validate non-empty rows that aren't the last row
      if (index < medications.length - 1) {
        return !item.name.trim();
      }
      const lastItem = medications[medications.length - 1];
      // For the last row, only validate if it's not completely empty
      return item.name || item.dosage || item.frequency
        ? !item.name.trim()
        : false;
    });

    if (hasEmptyNames) {
      messageApi.error("Пожалуйста, заполните названия всех препаратов");
      debug.log("Empty spaces");
      return;
    }

    // Remove empty row before saving
    const lastItem = medications[medications.length - 1];
    if (
      !lastItem.name.trim() &&
      !lastItem.dosage.trim() &&
      !lastItem.frequency.trim()
    ) {
      setMedications((prev) => prev.slice(0, -1));
    }
    handleSaveMedications();
  };

  return {
    medications,
    setMedications,
    isEditing,
    setIsEditing,
    handleSave,
    contextHolder,
  };
}
