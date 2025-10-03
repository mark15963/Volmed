import { useEffect } from "react";

export function useSyncFileList(filesHook, apiUrl) {
  useEffect(() => {
    if (
      filesHook.isEditing &&
      filesHook.files.length > 0 &&
      (!filesHook.fileList || filesHook.fileList.length === 0)
    ) {
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
  }, [
    filesHook.isEditing,
    filesHook.files,
    filesHook.fileList.length,
    filesHook.setFileList,
  ]);
}
