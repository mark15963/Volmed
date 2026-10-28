import { memo, useState } from 'react';

import { useSafeMessage } from '@hooks/useSafeMessage';
import debug from '@utils/debug';
import { appConfig } from '@/config/app.config';

import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Upload, Form } from 'antd';
import { SpinLoader } from '@components/UI/loaders/SpinLoader';
import styles from '../styles/tab2.module.scss';

const { Dragger } = Upload;

export const Files = memo(({
  id,
  files = [],
  fileList,
  setFileList,
  isLoading,
  isEditing,
  handleRemoveFiles,
  setUploadFilesStatus
}) => {
  const safeMessage = useSafeMessage()

  const [selectedFiles, setSelectedFiles] = useState([]);

  //#region -----FILES-----
  const formatFileSize = (size = 0) => {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(size / 1024).toFixed(2)} KB`;
  };

  const frame = (filePath) => {
    setSelectedFiles((prev) =>
      prev.includes(filePath)
        ? prev.filter((path) => path !== filePath)
        : [...prev, filePath]
    );
  }

  const openFile = (filePath) => {
    const fullPath = filePath.startsWith('http')
      ? filePath
      : filePath;

    debug.log(`Opening file from: ${filePath}`)
    window.open(filePath, '_blank');
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    action: `${appConfig.api.baseUrl}/patients/${id}/upload`,
    headers: { 'X-Requested-With': null },
    withCredentials: true,
    beforeUpload(file) {
      console.log('[Tab2] beforeUpload:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      return true;
    },
    onChange(info) {
      const { file, fileList: updatedFileList } = info;

      setFileList([...updatedFileList])

      if (info.file.status === 'done') {
        setUploadFilesStatus({
          status: 'done',
          fileName: file.name
        });
        safeMessage('success', `Файл ${file.name} успешно загружен!`);
      } else if (file.status === 'error') {
        setUploadFilesStatus({
          status: 'error',
          fileName: file.name
        });
        safeMessage('error', `Не удалось загрузить файл ${file.name}.`);
        console.error(
          '[Tab2] Upload failed:',
          file.error,
          file.response
        );
      }
    },
    onDrop(e) {
      const transfer = e.dataTransfer;

      console.log("[Tab2] DROP DIAGNOSTICS", {
        types: Array.from(transfer?.types ?? []),
        filesLength: transfer?.files?.length ?? -1,
        itemsLength: transfer?.items?.length ?? -1,
        items: Array.from(transfer?.items ?? []).map((item, index) => {
          let file = null;

          try {
            file = item.kind === "file" ? item.getAsFile() : null;
          } catch (error) {
            console.warn("getAsFile failed:", error);
          }

          return {
            index,
            kind: item.kind,
            type: item.type,
            fileName: file?.name ?? null,
            fileSize: file?.size ?? null,
          };
        }),
      });
    },
    onRemove: handleRemoveFiles,
    showUploadList: {
      extra: (file) => {
        const size = file.size || file.response?.size || 0;

        return (
          <span
            style={{
              marginLeft: '8px',
              color: '#cccccc'
            }}
          >
            ({formatFileSize(size)})
          </span>
        );
      },
      showPreventIcon: true,
      showDownloadIcon: true,
      downloadIcon: 'Скачать',
      showRemoveIcon: true,
      removeIcon: (
        <DeleteOutlined />
      ),

    }
  }

  return (
    <div className={styles.fileSection}>
      <h3 className={styles.fileSectionTitle}>
        Документы
      </h3>
      <div className={styles.fileList}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <SpinLoader size="30px" />
          </div>
        ) : files.length === 0 && !isEditing ? (
          <p style={{ cursor: 'default', textAlign: 'center', marginBottom: '10px' }}>
            Нет загруженных документов
          </p>
        ) : !isEditing ? (
          <ul
            className={styles.fileContainer}
          >
            {files.map((file, index) => {
              const filePath = file.path
              const isSelected = selectedFiles.includes(filePath);

              return (
                <li
                  key={filePath || index}
                  className={styles.fileItem}
                >
                  <div
                    className={styles.fileHeader}
                    onClick={() => frame(filePath)}
                  >
                    <span>{file.originalname || file.filename}</span>

                    <span className={styles.fileSize}>
                      {' '}{file.size >= 1024 * 1024
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                        : `${(file.size / 1024).toFixed(2)} KB`}
                    </span>
                  </div>
                  {isSelected && (
                    <iframe
                      key={filePath}
                      src={filePath}
                      height={400}
                      width="100%"
                      title={file.originalname || file.filename}
                      className={styles.frame}
                    />
                  )}
                </li>
              )
            })}
          </ul>

        ) : (
          <Form.Item className={styles.uploadArea}>
            <Dragger {...uploadProps} className={styles.uploadListText}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className={styles.uploadAreaText}>Нажмите или перетащите файлы в эту область</p>
            </Dragger>
          </Form.Item>
        )}
      </div>
    </div>
  )
})

export default Files