import moment from 'moment';
import axios from 'axios';
import { message } from 'antd';

import api from '../../../services/api';

import Input from '../../../components/Input';
import Button from '../../../components/Buttons';

import tableStyles from '../../../components/styles/Table.module.css';
import styles from './tab3.module.scss'
import { CalendarTwoTone, FieldTimeOutlined, MedicineBoxTwoTone } from '@ant-design/icons';
import { useState } from 'react';
import debug from '../../../utils/debug';

axios.defaults.withCredentials = true;

export const Tab3 = ({
    medications,
    isEditingMedications,
    setMedications,
}) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleAdd = async () => {
        if (medications.length === 0 || medications[medications.length - 1].name.trim()) {
            debug.log(`Adding new assignment`)
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
                lastRowInput.focus();
                message.warning('Пожалуйста, заполните текущее назначение перед добавлением нового');
            }
        }
    }

    const handleDelete = async (index) => {
        const itemToDelete = medications[index];
        setIsLoading(true)
        debug.log(`Deleting assignment: ${itemToDelete.name}`)

        if (!itemToDelete) {
            alert('Не удалось найти назначение для удаления');
            return;
        }

        if (!window.confirm('Вы уверены, что хотите удалить это назначение?')) {
            setIsLoading(false)
            return;
        }

        try {
            if (itemToDelete.id) {
                const res = await api.deleteMedication(itemToDelete.id)
                if (!res.data.success) {
                    throw new Error(res.data.message || "API returned unsuccessful");
                }
            }

            setMedications(prev => prev.filter((_, i) => i !== index));
            debug.log("Deleted successfully")
        } catch (err) {
            debug.error("Full delete error:", {
                error: err,
                response: err.res?.data
            });
            alert(`Не удалось удалить назначение: ${err.message}`);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.info}>
            <div className={styles.bg}>
                <h2>Назначения</h2>

                {/* EMPTY LIST */}
                {medications.length === 0 && !isEditingMedications && (
                    <p>Нет назначений</p>
                )}

                {/* MED LIST */}
                {(medications.length > 0 || isEditingMedications) && (
                    <div className={styles.listContainer}>
                        <table className={styles.table}>
                            <thead className={styles.head}>
                                <tr className={styles.rows}>
                                    <th>Время назначения</th>
                                    <th>Препарат / Манипуляция</th>
                                    <th>Дозировка</th>
                                    <th>Частота</th>
                                    {isEditingMedications && <th style={{ width: '15%' }}>Удалить</th>}
                                </tr>
                            </thead>
                            <tbody className={styles.body}>
                                {medications.map((item, index) => (
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
                                            {isEditingMedications ? (
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const newList = [...medications];
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
                                            {isEditingMedications ? (
                                                <Input
                                                    value={item.dosage}
                                                    onChange={(e) => {
                                                        const newList = [...medications];
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
                                                {isEditingMedications ? (
                                                    <Input
                                                        value={item.frequency}
                                                        onChange={(e) => {
                                                            const newList = [...medications];
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
                                        {isEditingMedications && (
                                            <td style={{ width: '15%', verticalAlign: 'middle' }}>
                                                <Button
                                                    text='Удалить'
                                                    size='s'
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
                {isEditingMedications && (
                    <Button
                        text='Добавить'
                        onClick={handleAdd}
                        style={{ marginBottom: '10px', marginLeft: 0 }}
                    />
                )}
            </div>
        </div >
    )
}

export default Tab3