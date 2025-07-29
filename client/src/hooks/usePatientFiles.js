import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";
import { message } from "antd";

const apiUrl = import.meta.env.VITE_API_URL;

export function usePatientFiles(patientId, messageApiRef, enabled = false) {
  const [files, setFiles] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadFilesStatus, setUploadFilesStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef();

  const messageApi = messageApiRef?.api;
  const contextHolder = messageApiRef?.holder;

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
        messageApi.error("Ошибка загрузки файлов");
        setRetryCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [patientId, enabled, messageApi, retryCount]);

  useEffect(() => {
    if (retryCount > 0) {
      fetchFiles();
    }
  }, [retryCount, fetchFiles]);

  const refreshFileList = useCallback(async () => {
    if (!patientId || !enabled) return;
    try {
      const response = await api.getPatientFiles(patientId);
      setFileList(
        response.data.map((file) => ({
          uid: file.path,
          name: file.originalname,
          status: "done",
          url: `${apiUrl}${file.path}`,
          response: { path: file.path },
        }))
      );
    } catch (error) {
      console.error("File list refresh error", error);
    }
  }, [patientId, enabled]);

  // Refresh the list of files
  useEffect(() => {
    if (enabled) {
      fetchFiles();
    } else {
      setFiles([]);
      setFileList([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, fetchFiles]);

  const handleSave = useCallback(async () => {
    if (!patientId) return;
    try {
      await refreshFileList();
      const response = await api.getPatientFiles(patientId);
      setFiles(response.data);
      setIsEditing(false);
      messageApi.success("Файлы успешно сохранены");
    } catch (error) {
      messageApi.error("Ошибка сохранения файлов");
    }
  }, [patientId, messageApi, refreshFileList]);

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
        messageApi.error(`Ошибка при удалении ${file.name}: ${error.message}`);
        return false;
      }
    },
    [messageApi]
  );

  // Upload status
  useEffect(() => {
    if (!uploadFilesStatus) return;
    const messages = {
      done: `${uploadFilesStatus.fileName} файл успешно загружен.`,
      error: `${uploadFilesStatus.fileName} ошибка загрузки файла.`,
      removed: `${uploadFilesStatus.fileName} успешно удален`,
      remove_error: `${uploadFilesStatus.error}: ${uploadFilesStatus.fileName}`,
    };
    const type = uploadFilesStatus.status.includes("error")
      ? "error"
      : "success";

    messageApi[type](messages[uploadFilesStatus.status]);
    setUploadStatus(null);
  }, [uploadFilesStatus, messageApi]);

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
    contextHolder,
    isLoading,
  };
}
