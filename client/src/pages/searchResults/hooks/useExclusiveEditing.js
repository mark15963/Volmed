import { useEffect } from "react";

export function useExclusiveEditing(filesHook, medsHook) {
  useEffect(() => {
    if (filesHook.isEditingFiles) {
      medsHook.setIsEditing(false);
    }
    if (medsHook.isEditingMedications) {
      filesHook.setIsEditing(false);
    }
  }, [filesHook.isEditingFiles, filesHook.isEditingMedications]);
}
