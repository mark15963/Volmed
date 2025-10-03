import { useCallback } from "react";
import api from "../../../services/api";

export function useSearchResultsActions({
  activeTab,
  data,
  navigate,
  filesHook,
  medsHook,
  messageApi,
  id,
}) {
  const apiInstance = messageApi?.api ?? {
    success: () => {},
    error: () => {},
    open: () => {},
  };

  const handlePrint = () => window.print();

  const handleEdit = useCallback(() => {
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
  }, [activeTab, data, navigate]);

  const handleDeletePatient = async () => {
    try {
      if (confirm("Удалить пациента?")) {
        await api.deletePatient(id);
      }
      await apiInstance.open({
        type: "loading",
        content: "Идет удаление...",
        duration: 1,
      });
      apiInstance.success("Пациент удален успешно!", 2.5);
      setTimeout(() => navigate("/patients"), 1000);
    } catch (err) {
      apiInstance.error("Ошибка");
    }
  };

  return { handlePrint, handleEdit, handleDeletePatient };
}
