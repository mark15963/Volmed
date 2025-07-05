import moment from 'moment';
import axios from 'axios';

import api from '../../../services/api';

import Input from '../../../components/Input';
import Button from '../../../components/Buttons';

import styles from '../searchResults.module.css';
import tableStyles from '../../../components/styles/Table.module.css';
import medStyles from './tab3.module.css'
import { CalendarTwoTone, FieldTimeOutlined, MedicineBoxTwoTone } from '@ant-design/icons';

axios.defaults.withCredentials = true;

export const Tab3 = ({
    assignments,
    isEditingAssignments,
    setAssignments,
}) => {
    return (
        <div className={medStyles.info}>
            <div className={medStyles.bg}>
                <h2>Назначения</h2>

                {/* EMPTY LIST */}
                {assignments.length === 0 && !isEditingAssignments && (
                    <p>Нет назначений</p>
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

                {/* MED LIST */}
                {(assignments.length > 0 || isEditingAssignments) && (

                    <div className={medStyles.listContainer}>
                        <table className={medStyles.table}>
                            <thead className={tableStyles.head}>
                                <tr className={tableStyles.rows} style={{ fontSize: '13px' }}>
                                    <th style={{ width: '20%', textAlign: 'center' }}>Время назначения</th>
                                    <th style={{ width: '30%', textAlign: 'center' }}>Препарат / Манипуляция</th>
                                    <th style={{ width: '15%', textAlign: 'center' }}>Дозировка</th>
                                    <th style={{ width: '10%', textAlign: 'center' }}>Частота</th>
                                    {isEditingAssignments && <th style={{ width: '15%' }}>Удалить</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((item, index) => (

                                    <tr
                                        key={index}
                                        className={medStyles.rows}
                                    >
                                        <td>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: '30px', display: 'flex', justifyContent: 'center' }}>
                                                    <CalendarTwoTone />
                                                </div>
                                                <div>
                                                    {item.createdAt ? moment(item.createdAt).format(' DD.MM.YYYY HH:mm') : ' Н/Д'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {isEditingAssignments ? (
                                                <input
                                                    style={{ width: '100%', borderRadius: '5px', paddingLeft: '5px' }}
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const newList = [...assignments];
                                                        newList[index].name = e.target.value;
                                                        setAssignments(newList);
                                                    }}
                                                />
                                            ) :
                                                <>
                                                    <div style={{ display: 'flex' }}>
                                                        <div style={{ width: '30px', display: 'flex', justifyContent: 'center' }}>
                                                            <MedicineBoxTwoTone />
                                                        </div>
                                                        <div>
                                                            {' ' + item.name}
                                                        </div>
                                                    </div>
                                                </>
                                            }
                                        </td>
                                        <td>
                                            {isEditingAssignments ? (
                                                <input
                                                    style={{ width: '100%', borderRadius: '5px', paddingLeft: '5px' }}
                                                    value={item.dosage}
                                                    onChange={(e) => {
                                                        const newList = [...assignments];
                                                        newList[index].dosage = e.target.value;
                                                        setAssignments(newList);
                                                    }}
                                                />
                                            ) :
                                                <>
                                                    <div style={{ display: 'flex' }}>
                                                        <div style={{ width: '30px', display: 'flex', justifyContent: 'center' }}>
                                                            <FieldTimeOutlined />
                                                        </div>
                                                        <div>
                                                            {' ' + item.dosage}
                                                        </div>
                                                    </div>
                                                </>
                                            }
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ width: '100px', display: 'flex', justifyContent: 'center' }}>
                                                    {isEditingAssignments ? (
                                                        // <input
                                                        //     style={{ width: '100%', borderRadius: '5px', paddingLeft: '5px' }}
                                                        //     value={item.frequency}
                                                        //     onChange={(e) => {
                                                        //         const newList = [...assignments];
                                                        //         newList[index].frequency = e.target.value;
                                                        //         setAssignments(newList);
                                                        //     }}
                                                        // />
                                                        <Input
                                                            value={item.frequency}
                                                            onChange={(e) => {
                                                                const newList = [...assignments];
                                                                newList[index].frequency = e.target.value;
                                                                setAssignments(newList);
                                                            }}
                                                        />
                                                    ) : item.frequency}
                                                </div>
                                            </div>
                                        </td>
                                        {isEditingAssignments && (
                                            <td style={{ width: '15%' }}>
                                                <button
                                                    style={{ width: 'fit-content', height: 'fit-content', padding: '1px 5px' }}
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
                                                    }}> Удалить</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    )
}

export default Tab3