import { useCallback, useEffect, useRef } from "react";
import api from "../../../services/api";
import debug from "../../../utils/debug";

export function useSearchResultsManager({
  activeTab,
  data,
  navigate,
  filesHook,
  medsHook,
  safeMessage,
  id,
}) {
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    if (filesHook.isEditing) {
      medsHook.setIsEditing(false);
    }
    if (medsHook.isEditing) {
      filesHook.setIsEditing(false);
    }
  }, [filesHook.isEditing, filesHook.isEditing]);

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

  useEffect(() => {
    if (
      filesHook.isEditing &&
      filesHook.files.length > 0 &&
      (!filesHook.fileList || filesHook.fileList.length === 0)
    ) {
      const apiUrl = import.meta.env.VITE_API_URL;
      filesHook.setFileList(
        filesHook.files.map((file) => ({
          uid: file.path,
          name: file.originalname,
          status: "done",
          url: `${apiUrl}${file.path}`,
          response: { path: file.path },
        }))
      );
    }
  }, [filesHook.isEditing, filesHook.files, filesHook.fileList]);

  const handlePrint = () => window.print();

  const handleEdit = useCallback(() => {
    debug.log("Edit clicked - activeTab:", activeTab);

    const isMedTab = activeTab === 2;
    const isFileTab = activeTab === 1;

    if (isMedTab) {
      medsHook.setIsEditing((prev) => !prev);
      filesHook.setIsEditing(false);
    } else if (isFileTab) {
      filesHook.setIsEditing((prev) => !prev);
      medsHook.setIsEditing(false);
    } else if (data?.id) {
      navigate(`/edit/${data.id}`, {
        state: {
          patientData: data,
        },
      });
    }
  }, [activeTab, data, navigate, medsHook, filesHook]);

  const handleDeletePatient = async () => {
    try {
      if (confirm("Удалить пациента?")) {
        safeMessage("loading", "Идет удаление...", 1);
        const res = await api.deletePatient(id);

        if (res.ok) {
          safeMessage("success", "Пациент удален успешно!", 2.5);
          setTimeout(() => navigate("/patients"), 1000);
        } else {
          throw new Error(res.message);
        }
      }
    } catch (err) {
      safeMessage("error", "Ошибка при удалении пациента");
    }
  };

  return { handlePrint, handleEdit, handleDeletePatient };
}
