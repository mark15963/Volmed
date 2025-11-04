//#region ===== IMPORTS =====
import { useState, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { Upload, Form, Collapse } from "antd"
const { message } = await import('antd/es')
const { Dragger } = Upload;
const { Panel } = Collapse;

import Input from '../../../components/Input';
import Graph from './Components/Graph';
import { SpinLoader } from '../../../components/loaders/SpinLoader';

import api from '../../../services/api'
import debug from '../../../utils/debug';

import styles from './styles/tab2.module.scss'
//#endregion

const environment = import.meta.env.VITE_ENV
const apiUrl = import.meta.env.VITE_API_URL

export const Tab2 = memo(({
  files,
  fileList,
  setFileList,
  isLoading,
  isEditing,
  handleRemoveFile,
  setUploadStatus,
  id,
}) => {
  //#region -----CONSTS-----
  const [messageApi, contextHolder] = message.useMessage()
  const [loadingPulse, setLoadingPulse] = useState(true);
  const [loadingO2, setLoadingO2] = useState(true);
  const [pulseValue, setPulseValue] = useState('');
  const [pulseValues, setPulseValues] = useState([]);
  const [o2Value, setO2Value] = useState('');
  const [o2Values, setO2Values] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [frameState, setFrameState] = useState(false)
  //#endregion

  //#region -----PULSE DATA-----
  useEffect(() => {
    const fetchPulseData = async () => {
      if (!id) {
        debug.log('Skipping pulse fetch - no patient ID');
        setPulseValues([]); // Clear previous data
        return;
      }
      setLoadingPulse(true);
      try {
        debug.log('Fetching pulse data for patient:', id);
        const response = await api.getPulseData(id)
        debug.log('Pulse data response:', response.data);
        const values = response.data.map(item => ({
          val: Number(item.value),
          created_at: item.timestamp,
        }));
        setPulseValues(values);
      } catch (error) {
        console.error('Error fetching pulse data:', error);
      } finally {
        setLoadingPulse(false);
      }
    };
    fetchPulseData();
  }, [id]);

  const handlePulseKeyPress = async (e) => {
    if (e.key === 'Enter' && pulseValue.trim() !== '') {
      if (!id) {
        console.error('Patient ID is missing');
        messageApi.error('Отсутствует ID пациента')
        return;
      }

      const num = Number(pulseValue);
      if (!isNaN(num)) {
        try {
          await api.savePulse(id, num)
          messageApi.success('Данные сохранены!', 2.5)
          const newEntry = {
            val: num,
            created_at: new Date().toISOString()
          };

          // Update local state
          setPulseValues([...pulseValues, newEntry]);
          setPulseValue('');
        } catch (error) {
          messageApi.error('Ошибка!', 2.5)
          console.error('Error saving pulse:', error);
        }
      }
    }
  };

  const HrItems = [
    {
      key: '1',
      label: 'ЧСС',
      children: (
        <>
          <div className={styles.graphContainer}>
            {loadingPulse ? (
              <div>Загрузка данных ЧСС...</div>
            ) : pulseValues.length > 0 ? (
              <Graph
                data={pulseValues}
                lineColor='#ff0f0f'
              />
            ) : (
              <div>Нет данных ЧСС</div>
            )}
            <Input
              type='number'
              value={pulseValue}
              onChange={(e) => setPulseValue(e.target.value)}
              onKeyDown={handlePulseKeyPress}
              placeholder='ЧСС'
              className={styles.inputfield}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 className={styles.graphTableTitle}>
              История изменений ЧСС
            </h4>
            <table className={styles.itemsTable}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', color: 'black' }}>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Дата</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>ЧСС</th>
                </tr>
              </thead>
              <tbody>
                {pulseValues
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {new Date(item.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.val}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ),
      showArrow: false
    }
  ]
  //#endregion

  //#region -----O2 DATA-----
  useEffect(() => {
    const fetchO2Data = async () => {
      setLoadingO2(true)
      try {
        debug.log('Fetching O2 data for patient:', id);
        const response = await api.getO2Data(id)
        debug.log('O2 data response:', response.data);
        const values = response.data.map(item => ({
          val: Number(item.value),
          created_at: item.timestamp,
        }));
        setO2Values(values);
      } catch (error) {
        console.error('Error fetching O2 data:', error);
      } finally {
        setLoadingO2(false)
      }
    };

    if (id) {
      fetchO2Data();
    }
  }, [id]);

  const handleO2KeyPress = async (e) => {
    if (e.key === 'Enter' && o2Value.trim() !== '') {
      const num = Number(o2Value);
      if (!isNaN(num)) {
        try {
          await api.saveO2(id, num)
          messageApi.success('Данные сохранены!', 2.5)
          const newEntry = {
            val: num,
            created_at: new Date().toISOString()
          };

          // Update local state
          setO2Values([...o2Values, newEntry]);
          setO2Value('');
        } catch (error) {
          messageApi.error('Ошибка!', 2.5)
          console.error('Error saving O2:', error);
        }
      }
    }
  };

  const O2Items = [
    {
      key: '2',
      label: 'SpO2',
      children: (
        <>
          <div className={styles.graphContainer}>
            <div className={styles.graph}>
              {loadingO2 ? (
                <div>Загрузка данных O2...</div>
              ) : o2Values.length > 0 ? (
                <Graph
                  data={o2Values}
                  lineColor='#1CABE8'
                />
              ) : (
                <div>Нет данных O2</div>
              )}
            </div>
            <Input
              type='number'
              value={o2Value}
              onChange={(e) => setO2Value(e.target.value)}
              onKeyDown={handleO2KeyPress}
              placeholder='SpO2'
              className={styles.inputfield}
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <h4>История изменений SpO2</h4>
            <table className={styles.itemsTable}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', color: 'black' }}>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Дата</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>SpO2</th>
                </tr>
              </thead>
              <tbody>
                {o2Values
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {new Date(item.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.val}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ),
      showArrow: false
    }
  ];
  //#endregion

  //#region -----FILES-----
  const frame = (filePath) => {
    const fullPath = filePath.startsWith('http') ? filePath : `${apiUrl}${filePath}`;
    setSelectedFile((prev) => (prev === fullPath ? null : fullPath));
  }

  const openFile = (filePath) => {
    debug.log(`Opening file from: ${filePath}`)
    window.open(`${apiUrl}${filePath}`, '_blank');
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    action: `${apiUrl}/api/patients/${id || 'temp'}/upload`,
    headers: {
      'X-Requested-With': null,
    },
    withCredentials: true,
    onChange(info) {
      setFileList([...info.fileList])
      const { status } = info.file
      if (status !== 'uploading') {
        setFileList(info.fileList)
      }
      else if (status === 'done' || status === 'error') {
        setUploadStatus({
          status,
          fileName: info.file.name
        });
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove: handleRemoveFile,
    showUploadList: {
      extra: (file) => {
        const size = file.size || (file.response && file.response.size) || 0
        const sizeText = size < 1024 * 1024
          ? `(${(size / 1024).toFixed(2)}KB)`
          : `(${(size / (1024 * 1024)).toFixed(2)}MB)`
        return (
          <span style={{ marginLeft: '8px', color: '#cccccc' }}>{sizeText}</span>
        );
      },
      showPreventIcon: true,
      showDownloadIcon: true,
      downloadIcon: 'Скачать',
      showRemoveIcon: true,
      removeIcon: (
        <DeleteOutlined
          onClick={e => console.log('Удаление файла', e)}
        />
      ),

    }
  }
  //#endregion

  return (
    <div className={styles.info}>
      {contextHolder}
      <div className={styles.bg}>
        <div className={styles.collapseContainer}>
          <div>
            <Collapse items={HrItems} />
          </div>
          <div>
            <Collapse items={O2Items} />
          </div>
        </div>

        {/* FILES */}
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
              <>
                <ul>
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className={styles.fileItem}
                      onClick={() => frame(file.path)}
                    >
                      <span>{file.originalname || file.filename}</span>
                      <span className={styles.fileSize}>
                        {' '}{(file.size / 1024).toFixed(2)} KB
                      </span>
                    </li>
                  ))}
                </ul>
                {selectedFile ? (
                  <iframe
                    src={selectedFile}
                    height={400}
                    width="100%"
                    title='Документ'
                    className={styles.frame}
                  />
                ) : (
                  <></>
                )}

              </>
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
      </div>
    </div>
  )
})

export default Tab2