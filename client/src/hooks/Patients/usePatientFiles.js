import { useCallback, useEffect, useRef, useState } from "react";

import api from "../../services/api";
import debug from "../../utils/debug";

/**
 * Hook for managing a patient's uploaded files.
 *
 * Handles fetching, refreshing, removing, and saving files
 * related to a specific patient. Integrates retry logic,
 * upload status tracking, and user notifications via `safeMessage`.
 *
 * @param {number} patientId - Numeric ID of the patient.
 * @param {(type: 'success'|'error'|'loading', message: string, [duration]?: number) => void} safeMessage
 *   - Function for showing UI messages (toast/snackbar notifications).
 * @param {boolean} [enabled=false] - Whether file fetching is active.
 *   Typically controlled by a UI tab or visibility state.
 *
 * @returns {{
 *   files: Array<Object>,              // Raw file objects from API
 *   fileList: Array<Object>,           // Mapped list for Ant Design Upload
 *   setFileList: Function,             // Manually update the fileList
 *   isEditing: boolean,                // Whether user is in file-editing mode
 *   setIsEditing: Function,            // Toggle editing mode
 *   handleSave: Function,              // Save uploaded files and refresh list
 *   handleRemoveFiles: Function,       // Remove a file from server and UI
 *   uploadFilesStatus: Object|null,    // Status of last upload/remove action
 *   setUploadFilesStatus: Function,    // Manually set upload status
 *   isLoading: boolean                 // Indicates if files are currently loading
 * }}
 *
 * @example
 * const {
 *   files,
 *   fileList,
 *   isLoading,
 *   handleSave,
 *   handleRemoveFiles
 * } = usePatientFiles(patientId, safeMessage, activeTab === TAB_FILES);
 */
export function usePatientFiles(patientId, safeMessage, enabled = false) {
  const [files, setFiles] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadFilesStatus, setUploadFilesStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef();

  if (!patientId) {
    console.error("usePatientFiles: No patientId provided");
    return {
      files: [],
      fileList: [],
      // ... other default values
    };
  }

  const fetchFiles = useCallback(async () => {
    if (!patientId || !enabled) return;

    setIsLoading(true);
    try {
      const response = await api.getPatientFiles(patientId);
      setFiles(response.data);
      setRetryCount(0);
    } catch (error) {
      console.error("Files fetch error:", error);

      if (retryCount < 3) {
        const delay = 1000 * (retryCount + 1);
        timeoutRef.current = setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, delay);
      } else {
        safeMessage("error", "Ошибка загрузки файлов");
        setRetryCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [patientId, enabled, retryCount, safeMessage]);

  useEffect(() => {
    if (retryCount > 0) fetchFiles();
  }, [retryCount, fetchFiles]);

  const refreshFileList = useCallback(async () => {
    if (!patientId || !enabled) return;
    try {
      const res = await api.getPatientFiles(patientId);
      setFileList(
        res.data.map((file) => ({
          uid: file.path,
          name: file.originalname,
          status: "done",
          url: `${import.meta.env.VITE_API_URL}${file.path}`,
          response: { path: file.path },
        }))
      );
    } catch (error) {
      console.error("File list refresh error", error);
    }
  }, [patientId, enabled]);

  // Refresh the list of files
  useEffect(() => {
    if (enabled) fetchFiles();
    else {
      setFiles([]);
      setFileList([]);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [enabled, fetchFiles]);

  const handleSave = useCallback(async () => {
    if (!patientId) return;
    try {
      safeMessage("loading", "Идет загрузка...", 1);
      await refreshFileList();

      const res = await api.getPatientFiles(patientId);
      setFiles(res.data);
      setIsEditing(false);
      safeMessage("success", "Файлы успешно сохранены");
    } catch (error) {
      safeMessage("error", "Ошибка сохранения файлов");
    }
  }, [patientId, refreshFileList, safeMessage]);

  const handleRemoveFiles = useCallback(
    async (file) => {
      const path = file.response?.path;
      if (!path) return false;

      try {
        const filePath = path
          .replace(/^\/?(uploads|public)?\/?/, "")
          .replace(/\\/g, "/");
        const res = await api.deleteFile(filePath);

        if (!res.data.success)
          throw new Error(res.data.message || "Неизвестная ошибка");

        setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        setFiles((prev) => prev.filter((f) => f.path !== file.response.path));
        setUploadFilesStatus({
          status: "removed",
          fileName: file.name,
        });
        return true;
      } catch (error) {
        setUploadFilesStatus({
          status: "remove_error",
          fileName: file.name,
          error: error.message,
        });
        debug.error("Delete error:", {
          error: error.message,
          response: error.response?.data,
        });
        safeMessage(
          "error",
          `Ошибка при удалении ${file.name}: ${error.message}`
        );
        return false;
      }
    },
    [safeMessage]
  );

  // Upload status
  useEffect(() => {
    if (!uploadFilesStatus) return;
    const { status, fileName, error } = uploadFilesStatus;
    const messages = {
      done: `${fileName} файл успешно загружен.`,
      error: `${fileName} ошибка загрузки файла.`,
      removed: `${fileName} успешно удален`,
      remove_error: `${error}: ${fileName}`,
    };
    const type = status.includes("error") ? "error" : "success";

    safeMessage(type, messages[status]);
    setUploadFilesStatus(null);
  }, [uploadFilesStatus, safeMessage]);

  return {
    files,
    fileList,
    setFileList,
    isEditing,
    setIsEditing,
    handleSave,
    handleRemoveFiles,
    uploadFilesStatus,
    setUploadFilesStatus,
    isLoading,
  };
}
