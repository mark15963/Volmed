//#region ===== IMPORTS =====
import { useState, useEffect, memo } from 'react';
import { Collapse } from "antd"

import { Input } from '@components';
import Graph from './Components/Graph';
import { SpinLoader } from '@components/UI/loaders/SpinLoader';

import { useSafeMessage } from '@hooks/useSafeMessage';

import api from '@services/api/index'
import debug from '@utils/debug';

import styles from './styles/tab2.module.scss'
import Files from './Components/Files';
//#endregion

export const Tab2 = memo(({
  id,
  files,
  fileList,
  setFileList,
  isLoading,
  isEditing,
  setIsEditing,
  handleRemoveFiles,
  setUploadFilesStatus
}) => {
  //#region -----HOOKS-----
  const safeMessage = useSafeMessage()
  //#endregion

  //#region -----LOCAL STATES (Pulse & O₂)-----
  const [loadingPulse, setLoadingPulse] = useState(true);
  const [loadingO2, setLoadingO2] = useState(true);
  const [pulseValue, setPulseValue] = useState('');
  const [o2Value, setO2Value] = useState('');
  const [pulseValues, setPulseValues] = useState([]);
  const [o2Values, setO2Values] = useState([]);
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
        const res = await api.getPulseData(id)
        debug.success('Pulse data response:', res.data);
        const values = res.data.map(item => ({
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
        safeMessage("error", "Отсутствует ID пациента")
        return;
      }

      const num = Number(pulseValue);
      if (!isNaN(num)) {
        try {
          await api.savePulse(id, num)
          safeMessage("success", "Данные сохранены!", 2.5)
          // Update local state
          setPulseValues([...pulseValues, {
            val: num,
            created_at: new Date().toISOString()
          }]);
          setPulseValue('');
        } catch (error) {
          safeMessage("error", 'Ошибка!', 2.5)
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
              <div style={{ width: '100%', left: '50%' }}>
                <SpinLoader color='black' />
              </div>
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
                      <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}>
                        {new Date(item.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}>{item.val}</td>
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
      if (!id) return;
      setLoadingO2(true)
      try {
        debug.log('Fetching O2 data for patient:', id);
        const res = await api.getO2Data(id)
        debug.success('O2 data response:', res.data);
        const values = res.data.map(item => ({
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

    fetchO2Data();
  }, [id]);

  const handleO2KeyPress = async (e) => {
    if (e.key === 'Enter' && o2Value.trim() !== '') {
      const num = Number(o2Value);
      if (!isNaN(num)) {
        try {
          await api.saveO2(id, num)
          safeMessage("success", 'Данные сохранены!', 2.5)
          // Update local state
          setO2Values([...o2Values, {
            val: num,
            created_at: new Date().toISOString()
          }]);
          setO2Value('');
        } catch (error) {
          safeMessage("error", 'Ошибка!', 2.5)
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
                <div style={{ width: '100%', left: '50%' }}>
                  <SpinLoader color='black' />
                </div>
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
                      <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}>
                        {new Date(item.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '0.8rem' }}>{item.val}%</td>
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

  return (
    <>
      {/* GRAPHS */}
      <div className={styles.collapseContainer}>
        <div>
          <Collapse items={HrItems} />
        </div>
        <div>
          <Collapse items={O2Items} />
        </div>
      </div>

      {/* FILES */}
      <Files
        id={id}
        files={files}
        fileList={fileList}
        setFileList={setFileList}
        isLoading={isLoading}
        isEditing={isEditing}
        handleRemoveFiles={handleRemoveFiles}
        setUploadFilesStatus={setUploadFilesStatus}
      />
    </>
  )
})

export default Tab2