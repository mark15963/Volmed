import moment from 'moment';
import axios from 'axios';

import api from '../../../services/api';

import Input from '../../../components/Input';
import Button from '../../../components/Buttons';

// import styles from '../searchResults.module.css';
import tableStyles from '../../../components/styles/Table.module.css';
import styles from './tab3.module.scss'
import { CalendarTwoTone, FieldTimeOutlined, MedicineBoxTwoTone } from '@ant-design/icons';

axios.defaults.withCredentials = true;

export const Tab3 = ({
    assignments,
    isEditingAssignments,
    setAssignments,
}) => {
    return (
        <div className={styles.info}>
            <div className={styles.bg}>
                <h2>Назначения</h2>

                {/* EMPTY LIST */}
                {assignments.length === 0 && !isEditingAssignments && (
                    <p>Нет назначений</p>
                )}

                {/* MED LIST */}
                {(assignments.length > 0 || isEditingAssignments) && (
                    <div className={styles.listContainer}>
                        <table className={styles.table}>
                            <thead className={styles.head}>
                                <tr className={styles.rows}>
                                    <th>Время назначения</th>
                                    <th>Препарат / Манипуляция</th>
                                    <th>Дозировка</th>
                                    <th>Частота</th>
                                    {isEditingAssignments && <th style={{ width: '15%' }}>Удалить</th>}
                                </tr>
                            </thead>
                            <tbody className={styles.body}>
                                {assignments.map((item, index) => (
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
                                            {isEditingAssignments ? (
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const newList = [...assignments];
                                                        newList[index].name = e.target.value;
                                                        setAssignments(newList);
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
                                            {isEditingAssignments ? (
                                                <Input
                                                    value={item.dosage}
                                                    onChange={(e) => {
                                                        const newList = [...assignments];
                                                        newList[index].dosage = e.target.value;
                                                        setAssignments(newList);
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
                                                {isEditingAssignments ? (
                                                    <Input
                                                        value={item.frequency}
                                                        onChange={(e) => {
                                                            const newList = [...assignments];
                                                            newList[index].frequency = e.target.value;
                                                            setAssignments(newList);
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
                                        {isEditingAssignments && (
                                            <td style={{ width: '15%', verticalAlign: 'middle' }}>
                                                <Button
                                                    text='Удалить'
                                                    size='s'
                                                    onClick={async () => {
                                                        const itemToDelete = assignments[index];
                                                        try {
                                                            if (itemToDelete.id) {
                                                                const response = await api.deleteMedication(itemToDelete.id)
                                                                if (!response.data.success) {
                                                                    throw new Error(response.data.message || "API returned unsuccessful");
                                                                }
                                                            }
                                                            const newList = assignments.filter((_, i) => i !== index);
                                                            setAssignments(newList);

                                                        } catch (err) {
                                                            console.error("Full delete error:", {
                                                                error: err,
                                                                response: err.response?.data
                                                            });
                                                            alert(`Не удалось удалить назначение: ${err.message}`);
                                                        }
                                                    }} />
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* NEW MED */}
                {isEditingAssignments && (
                    <Button
                        text='Добавить'
                        onClick={() => {
                            setAssignments([...assignments, {
                                name: '',
                                dosage: '',
                                frequency: '',
                                createdAt: new Date().toISOString()
                            }])
                        }}
                        style={{ marginBottom: '10px', marginLeft: 0 }}
                    />
                )}
            </div>
        </div >
    )
}

export default Tab3