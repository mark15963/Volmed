import moment from 'moment';
import tableStyles from '../../../components/styles/Table.module.css';
import styles from '../searchResults.module.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://volmed-backend.onrender.com';
axios.defaults.withCredentials = true;

export const Tab3 = ({
    assignments,
    isEditingAssignments,
    setAssignments,
}) => {
    return (
        <div className={styles.info}>
            <div className={styles.bg} style={{ padding: '20px' }}>
                <h3>Назначения</h3>
                {console.log(assignments)}
                {assignments.length === 0 && !isEditingAssignments && (
                    <p>Нет назначений</p>
                )}
                {isEditingAssignments && (
                    <>
                        <button
                            onClick={() => {
                                setAssignments([...assignments, {
                                    name: '',
                                    dosage: '',
                                    frequency: '',
                                    createdAt: new Date().toISOString()
                                }]);
                            }}
                            style={{ marginBottom: '10px', marginLeft: '0' }}>Добавить</button>
                    </>
                )}
                {(assignments.length > 0 || isEditingAssignments) && (
                    <div className={tableStyles.container}>
                        <table className={tableStyles.table} style={{ width: '100%', tableLayout: 'fixed' }}>

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
                                    <tr key={index} className={tableStyles.rows} style={{ fontSize: '14px', display: 'flex' }}>
                                        <td style={{ width: '20%', fontSize: '11px' }}>
                                            {item.createdAt ? moment(item.createdAt).format('DD.MM.YYYY HH:mm') : 'Н/Д'}
                                        </td>
                                        <td style={{ width: '30%' }}>
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
                                            ) : item.name}
                                        </td>
                                        <td style={{ width: '15%' }}>
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
                                            ) : item.dosage}
                                        </td>
                                        <td style={{ width: '10%' }}>
                                            {isEditingAssignments ? (
                                                <input
                                                    style={{ width: '100%', borderRadius: '5px', paddingLeft: '5px' }}
                                                    value={item.frequency}
                                                    onChange={(e) => {
                                                        const newList = [...assignments];
                                                        newList[index].frequency = e.target.value;
                                                        setAssignments(newList);
                                                    }}
                                                />
                                            ) : item.frequency}
                                        </td>
                                        {isEditingAssignments && (
                                            <td style={{ width: '15%' }}>
                                                <button
                                                    style={{ width: 'fit-content', height: 'fit-content', padding: '1px 5px' }}
                                                    onClick={async () => {
                                                        const itemToDelete = assignments[index];
                                                        console.log("Attempting to delete medication:", itemToDelete);
                                                        try {
                                                            if (itemToDelete.id) {
                                                                console.log("Calling API to delete medication ID:", itemToDelete.id);

                                                                const response = await axios.delete(
                                                                    `https://volmed-backend.onrender.com/api/medications/${itemToDelete.id}`, {
                                                                    withCredentials: true
                                                                });
                                                                console.log("Delete response:", response.data);

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