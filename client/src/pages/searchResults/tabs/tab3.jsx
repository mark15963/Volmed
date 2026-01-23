//#region ===== IMPORTS =====
import { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { message } from 'antd';
import { CalendarTwoTone, FieldTimeOutlined, MedicineBoxTwoTone } from '@ant-design/icons';

import { useSafeMessage } from '../../../hooks/useSafeMessage';

import Input from '../../../components/Input';
import Button from '../../../components/Button';

import { SpinLoader } from '../../../components/ui/loaders/SpinLoader';
import styles from './styles/tab3.module.scss'

import api from '../../../services/api';
import debug from '../../../utils/debug';
//#endregion

axios.defaults.withCredentials = true;

export const Tab3 = ({
  medications,
  isEditing,
  setMedications,
  patientId
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [medicationsData, setMedicationsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const safeMessage = useSafeMessage()

  useEffect(() => {
    if (!patientId || isEditing) return

    const fetchMeds = async () => {
      setLoading(true)
      try {
        const res = await api.getMedications(patientId)
        if (res.ok) setMedicationsData(res.data)
        else setError(res.message)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMeds()
  }, [patientId, isEditing])

  const medList = Array.isArray(isEditing ? medications : medicationsData)
    ? (isEditing ? medications : medicationsData)
    : [];

  const handleAdd = async () => {
    if (medications.length === 0 || medications[medications.length - 1].name.trim()) {
      debug.log(`Opened new assignment`)
      setMedications(prev => [...prev, {
        name: '',
        dosage: '',
        frequency: '',
        createdAt: new Date().toISOString()
      }])
    } else {
      // Focus on the empty field in the last row
      const lastRowInput = document.querySelector(`.${styles.table} tr:last-child td:nth-child(2) input`);
      if (lastRowInput) {
        // Add red border
        lastRowInput.classList.add(styles.inputError)

        // Focus on the empty input
        lastRowInput.focus();

        // Show warning
        safeMessage('warning', 'Пожалуйста, заполните текущее назначение перед добавлением нового', 2);

        // Remove red border on user input
        const removeError = () => {
          lastRowInput.classList.remove(styles.inputError);
          lastRowInput.removeEventListener('input', removeError);
        };
        lastRowInput.addEventListener('input', removeError);
      }
    }
  }

  const handleDelete = async (index) => {
    const itemToDelete = medications[index];
    setIsLoading(true)
    debug.log(`Deleting assignment: ${itemToDelete.name}`)

    if (!itemToDelete) {
      alert('Не удалось найти назначение для удаления');
      setIsLoading(false)
      return;
    }
    if (!window.confirm('Вы уверены, что хотите удалить это назначение?')) {
      setIsLoading(false)
      return;
    }

    try {
      if (itemToDelete.id) {
        const res = await api.deleteMedication(itemToDelete.id)
        if (!res.ok) {
          throw new Error(res.message || "API returned unsuccessful");
        }
      }

      setMedications(prev => prev.filter((_, i) => i !== index));
      safeMessage("success", "Назначение удалено успешно")
    } catch (err) {
      debug.error("Full delete error:", err);
      alert(`Не удалось удалить назначение: ${err.message}`);
    } finally {
      setIsLoading(false)
    }
  }

  if (!patientId) {
    return (
      <div className={styles.info}>
        <div className={styles.bg}>
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Ошибка: отсутствует идентификатор пациента
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.info}>
      <div className={styles.bg}>
        <h2>Назначения</h2>

        {loading && <SpinLoader />}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* EMPTY LIST */}
        {!loading && medList.length === 0 && !isEditing && (
          <p style={{ marginTop: '10px', textAlign: 'center' }}>Нет назначений</p>
        )}

        {/* MED LIST */}
        {(medList.length > 0 || isEditing) && (
          <div className={styles.listContainer}>
            <table className={styles.table}>
              <thead className={styles.head}>
                <tr className={styles.rows}>
                  <th>Время назначения</th>
                  <th>Препарат / Манипуляция</th>
                  <th>Дозировка</th>
                  <th>Частота</th>
                  {isEditing &&
                    <th style={{ width: '15%' }}>
                      Удалить
                    </th>
                  }
                </tr>
              </thead>
              <tbody className={styles.body}>
                {medList.map((item, index) => (
                  <tr
                    key={index}
                    className={styles.rows}
                  >
                    {/* Created At */}
                    <td>
                      <CalendarTwoTone className={styles.icon} />
                      <div style={{ display: 'inline-block' }}>
                        {item.createdAt ? moment(item.createdAt).format(' DD.MM.YYYY HH:mm') : ' Н/Д'}
                      </div>
                    </td>
                    {/* Name */}
                    <td>
                      {isEditing ? (
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            const newList = [...medList];
                            newList[index].name = e.target.value;
                            setMedications(newList);
                          }}
                        />
                      ) : (
                        <>
                          <MedicineBoxTwoTone className={styles.icon} />
                          <div style={{ display: 'inline-block' }}>
                            {item.name}
                          </div>
                        </>
                      )}
                    </td>
                    {/* Dosage */}
                    <td>
                      {isEditing ? (
                        <Input
                          value={item.dosage}
                          onChange={(e) => {
                            const newList = [...medList];
                            newList[index].dosage = e.target.value;
                            setMedications(newList);
                          }}
                        />
                      ) : (
                        <>
                          <FieldTimeOutlined className={styles.icon} />
                          <div className={styles.desktop} style={{ display: 'inline-block' }}>
                            {item.dosage}
                          </div>
                          <div className={styles.mobile}>
                            {item.dosage} {item.frequency}
                          </div>
                        </>
                      )}
                    </td>
                    {/* Frequency*/}
                    <td>
                      <div style={{ display: 'inline-block' }}>
                        {isEditing ? (
                          <Input
                            value={item.frequency}
                            onChange={(e) => {
                              const newList = [...medList];
                              newList[index].frequency = e.target.value;
                              setMedications(newList);
                            }}
                          />
                        ) : (
                          <div className={styles.desktop}>
                            {item.frequency}
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Delete Button*/}
                    {isEditing && (
                      <td className={styles.deleteButton}>
                        <Button
                          text='Удалить'
                          size='s'
                          style={{
                            margin: '0'
                          }}
                          onClick={() => handleDelete(index)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* NEW MED */}
        {isEditing && (
          <Button
            text='Добавить'
            onClick={handleAdd}
            style={{ marginBottom: '10px', marginLeft: 0 }}
          />
        )}
      </div>
    </div>
  )
}

export default Tab3
