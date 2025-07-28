import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { message } from "antd";

const apiUrl = import.meta.env.VITE_API_URL;

export function usePatientFiles(patientId, messageApiRef) {
  const [files, setFiles] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadFilesStatus, setUploadFilesStatus] = useState(null);
  const messageApi = messageApiRef?.api;
  const contextHolder = messageApiRef?.holder;

  const fetchFiles = useCallback(async () => {
    if (!patientId) return;
    const response = await api.getPatientFiles(patientId);
    setFiles(response.data);
  }, [patientId]);

  const refreshFileList = useCallback(async () => {
    if (!patientId) return;
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
  }, [patientId]);

  const handleSaveFiles = useCallback(async () => {
    await refreshFileList();
    const response = await api.getPatientFiles(patientId);
    setFiles(response.data);
    setIsEditing(false);
    messageApi.success("Файлы успешно сохранены");
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

  // Refresh the list of files
  useEffect(() => {
    fetchFiles();
    refreshFileList();
  }, [fetchFiles, refreshFileList]);

  return {
    files,
    fileList,
    setFileList,
    isEditing,
    setIsEditing,
    handleSaveFiles,
    handleRemoveFiles,
    uploadFilesStatus,
    setUploadFilesStatus,
    contextHolder,
  };
}
