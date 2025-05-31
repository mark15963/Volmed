import { useLocation, useNavigate, useParams } from 'react-router';
import moment from 'moment';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { usePageTitle } from '../../components/PageTitle';
import { Menu } from '../../components/Menu';
import { Form, Upload, message } from "antd"
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'

const { Dragger } = Upload;


import styles from './searchResults.module.css';
import tableStyles from '../../components/styles/Table.module.css'

import { HomeButton } from '../../components/Buttons';

export const SearchResults = () => {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0)
    const [files, setFiles] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [isEditingAssignments, setIsEditingAssignments] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [isEditingFiles, setIsEditingFiles] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [uploadStatus, setUploadStatus] = useState(null);


    // Patient's name in title
    let title
    if (loading) {
        title = "Загрузка..."
    } else if (error) {
        title = "Ошибка"
    } else if (!data) {
        title = "Пациент не найден"
    } else {
        title = `Карта пациента: ${data.lastName} ${data.firstName} ${data.patr}`
    }
    usePageTitle(title)

    // Fetch patient's data
    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                let patientData;

                if (state?.patientData) {
                    patientData = state.patientData;
                }
                else if (state?.results?.length > 0) {
                    patientData = state.results[0];
                }
                else if (id) {
                    const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
                    patientData = response.data;
                }

                if (!patientData) {
                    throw new Error('Данные пациента не найдены');
                }

                setData(patientData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [id, state]);

    // Page title
    useEffect(() => {
        if (loading) {
            document.title = "Загрузка данных пациента...";
        } else if (error) {
            document.title = "Ошибка загрузки";
        } else if (!data) {
            document.title = "Пациент не найден";
        } else {
            document.title = `Карта пациента: ${data.lastName} ${data.firstName}${data.patr ? ` ${data.patr}` : ''}`;
        }

        return () => {
            document.title = "ГБУ «Городская больница Волновахского района»";
        };
    }, [loading, error, data]);

    // Fetch patient's files
    useEffect(() => {
        const fetchFiles = async () => {
            if (data?.id) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/patients/${data.id}/files`);
                    setFiles(response.data);
                } catch (error) {
                    console.error('Error fetching files:', error);
                }
            }
        };
        fetchFiles();
    }, [data?.id]);

    // Function to refresh file list
    const refreshFileList = async () => {
        if (!id) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/patients/${id}/files`);
            setFileList(response.data.map(file => ({
                uid: file.path,
                name: file.originalname,
                status: 'done',
                url: `http://localhost:5000${file.path}`,
                response: { path: file.path }
            })));
        } catch (error) {
            messageApi.error('Ошибка загрузки списка файлов');
        }
    };

    // Load files on mount and when patientId changes
    useEffect(() => {
        refreshFileList();
    }, [id]);

    const handleSaveFiles = async () => {
        try {
            await refreshFileList(); // Refresh the file list after saving
            setIsEditingFiles(false);
            messageApi.success('Файлы успешно сохранены');
        } catch (error) {
            console.error("Error saving files:", error);
            messageApi.error('Ошибка при сохранении файлов');
        }
    };

    const handleRemoveFile = async (file) => {
        try {
            if (file.response?.path) {
                const filePath = file.response.path.replace(/^\/?uploads\//, '');

                const response = await axios.delete('http://localhost:5000/api/files', {
                    data: { filePath },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.success) {
                    setFileList(prev => prev.filter(f => f.uid !== file.uid));
                    setFiles(prev => prev.filter(f => f.path !== file.response.path));
                    setUploadStatus({
                        status: 'removed',
                        fileName: file.name
                    });
                    return true;
                }
                throw new Error(response.data.message || 'Неизвестная ошибка');
            }
            return false;
        } catch (error) {
            setUploadStatus({
                status: 'remove_error',
                fileName: file.name,
                error: error.response?.data?.message || error.message || 'Ошибка удаления файла'
            });
            return false; // Prevent removal from UI if deletion failed
        }
    };

    useEffect(() => {
        if (uploadStatus) {
            switch (uploadStatus.status) {
                case 'done':
                    messageApi.success(`${uploadStatus.fileName} файл успешно загружен.`);
                    break;
                case 'error':
                    messageApi.error(`${uploadStatus.fileName} ошибка загрузки файла.`);
                    break;
                case 'removed':
                    messageApi.success(`${uploadStatus.fileName} успешно удален`);
                    break;
                case 'remove_error':
                    messageApi.error(`${uploadStatus.error}: ${uploadStatus.fileName}`);
                    break;
            }
            setUploadStatus(null);
        }
    }, [uploadStatus]);

    const uploadProps = {
        name: 'file',
        multiple: true,
        fileList,
        action: `http://localhost:5000/api/patients/${id || 'temp'}/upload`,
        onChange(info) {
            const { status } = info.file
            if (status !== 'uploading') {
                setFileList(info.fileList)
            }
            if (status === 'done' || status === 'error') {
                setUploadStatus({
                    status,
                    fileName: info.file.name
                });
            } else if (status === 'removed') {

            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
        onRemove: handleRemoveFile,
        showUploadList: {
            extra: ({ size = 0 }) => (
                <span style={{ marginLeft: '5px', color: '#cccccc' }}>({(size / 1024 / 1024).toFixed(2)}MB)</span>
            ),
            showPreventIcon: true,
            showRemoveIvon: true,
            removeIcon: (
                <DeleteOutlined
                    onClick={e => console.log('Удаление файла', e)}
                />
            )
        }
    }

    // Fetch medications
    useEffect(() => {
        if (!data?.id) return;

        const fetchMedications = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/patients/${data.id}/medications`);
                setAssignments(response.data);
                setAssignments(response.data.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                ))
            } catch (error) {
                console.error('Error fetching medications:', error);
            }
        };

        fetchMedications();
    }, [data?.id]);

    const handleSaveAssignments = async () => {
        try {
            for (const med of assignments) {
                if (med.id) {
                    await axios.put(`http://localhost:5000/api/medications/${med.id}`, med);
                } else {
                    await axios.post(`http://localhost:5000/api/patients/${data.id}/medications`, {
                        ...med,
                        createdAt: med.createdAt || new Date().toISOString()
                    });
                }
            }

            // After saving, refetch meds to sync
            const response = await axios.get(`http://localhost:5000/api/patients/${data.id}/medications`);
            setAssignments(response.data);

            setIsEditingAssignments(false);
            messageApi.success('Назначения успешно сохранены');

        } catch (error) {
            console.error("Error saving medications:", error);
            messageApi.error('Ошибка при сохранении назначений');
        }
    };

    const handlePrint = () => {
        window.print()
    }

    const handleEdit = () => {
        if (activeTab === 2) {
            setIsEditingAssignments(prev => !prev);
        } else if (activeTab === 1) {
            setIsEditingFiles(prev => !prev);
        } else if (data?.id) {
            navigate(`/edit/${data.id}`, {
                state: {
                    patientData: data
                }
            })

        }
    }

    const openFile = (filePath) => {
        window.open(`http://localhost:5000${filePath}`, '_blank');
    };

    function formatPhoneNumber(phone) {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11 && digits.startsWith('7')) {
            return `+7(${digits.slice(1, 4)})${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
        }
        return phone; // fallback if format doesn't match
    }

    //Main block state
    if (loading) return <div className={styles.resultsContainer}>Загрузка...</div>;
    if (error) return <div className={styles.resultsContainer}>Ошибка: {error}</div>;
    if (!data) return <div className={styles.resultsContainer}>Пациент не найден.</div>;

    const tabContents = [
        // Tab 1
        <div className={styles.info}>
            <div className={styles.bg}>
                <div className={styles.topForms}>
                    <div className={styles.topFormsA}>
                        <div className={styles.title}>ФИО:
                            <span className={styles.data}>
                                {data.lastName} {data.firstName} {data.patr}
                            </span>
                        </div>
                        <div className={styles.title}>№ карты:<br />
                            <span>
                                {data.id}
                            </span>
                        </div>
                        <div className={styles.title}>Дата поступления: <br />
                            <span>
                                {moment(data.created_at).format('DD.MM.YYYY')}
                            </span>
                        </div>

                    </div>
                    <div className={styles.topFormsB}>
                        <div className={styles.title}>Пол: <br />
                            <span>
                                {data.sex}
                            </span>
                        </div>
                        <div className={styles.title}>Дата рождения:<br />
                            <span>
                                {moment(data.birthDate).format('DD.MM.YYYY')}
                            </span>
                        </div>
                    </div>
                    <div className={styles.topFormsC}>
                        <div className={styles.title}>Номер телефона: <br />
                            <span>
                                {formatPhoneNumber(data.phone)}
                            </span>
                        </div>
                        <div className={styles.title}>Адрес: <br />
                            <span>
                                {data.address}
                            </span>
                        </div>
                        <div className={styles.title}>E-Mail: <br />
                            <span>
                                {data.email}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ height: '30px', borderBottom: '1px solid black' }}>
                </div>
                <div style={{ height: '30px' }}>
                </div>

                <div className={styles.bottomForms}>
                    <div className={styles.title}>Жалобы при поступлении: <br />
                        <span>
                            {data.complaint}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>История настоящего заболевания: <br />
                        <span>
                            {data.anam}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Анамнез жизни: <br />
                        <span>
                            {data.life}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Настоящее состояние больного: <br />
                        <span>
                            {data.status}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Клинический диагноз: <br />
                        <span>
                            {/* {data.mkb} */}
                            {data.diag}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Сопутствующие заболевания: <br />
                        <span>
                            {data.sop_zab}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Рекомендации: <br />
                        <span>
                            {data.rec}
                        </span>
                    </div>
                </div>
            </div>
        </div>,

        // Tab 2
        <div className={styles.info}>
            <div className={styles.bg}>
                <div>
                    <h3>Результаты анализов</h3>
                    {/* В РАЗРАБОТКЕ*/}
                    <p style={{ paddingLeft: '10px' }}>Нет анализов</p>
                </div>

                <div className={styles.fileSection}>
                    <h3>Медицинские документы</h3>
                    <div className={styles.fileList}>
                        {files.length === 0 && !isEditingFiles && (
                            <p style={{ cursor: 'default' }}>Нет загруженных документов</p>
                        )}

                        {!isEditingFiles && (
                            <ul style={{ paddingLeft: 10 }}>
                                {files.map((file, index) => (
                                    <li key={index} className={styles.fileItem}>
                                        <span onClick={() => openFile(file.path)}>
                                            {file.originalname || file.filename}
                                        </span>
                                        <span className={styles.fileSize}>
                                            {' '}{(file.size / 1024).toFixed(2)} KB
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {isEditingFiles && (
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <Form.Item>
                                        <Dragger {...uploadProps} >
                                            <p className="ant-upload-drag-icon">
                                                <UploadOutlined />
                                            </p>
                                            <p className="ant-upload-text">Нажмите или перетащите файлы в эту область</p>

                                        </Dragger>
                                    </Form.Item>
                                </div>
                                <button style={{ alignSelf: 'center', width: 'fit-content' }} onClick={handleSaveFiles}>
                                    Сохранить
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,

        // Tab 3
        <div className={styles.info}>
            <div className={styles.bg} style={{ padding: '20px' }}>

                <h3>Назначения</h3>

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
                                    administered: [],
                                    createdAt: new Date().toISOString() // Add creation timestamp
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
                                    <th style={{ width: '20%' }}>Время назначения</th>
                                    <th style={{ width: '30%' }}>Препарат / Манипуляция</th>
                                    <th style={{ width: '15%' }}>Дозировка</th>
                                    <th style={{ width: '10%' }}>Частота</th>
                                    <th style={{ width: '25%' }}>Отмечено медсестрой</th>
                                    {isEditingAssignments && <th style={{ width: '15%' }}>Удалить</th>}
                                </tr>
                            </thead>

                            <tbody>
                                {assignments.map((item, index) => (
                                    <tr key={index} className={tableStyles.rows} style={{ fontSize: '14px', display: 'flex' }}>
                                        <td style={{ width: '20%' }}>
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
                                        <td style={{ width: '25%', display: 'flex' }}>
                                            <button
                                                style={{
                                                    width: 'fit-content', height: 'fit-content', padding: '1px 5px',
                                                    fontSize: '12px'
                                                }}
                                                onClick={() => {
                                                    const newList = [...assignments];
                                                    newList[index].administered.push(new Date().toISOString());
                                                    setAssignments(newList);
                                                }}
                                            >
                                                Отметить
                                            </button>
                                            <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: '5px', height: 'fit-content' }}>
                                                {item.administered.map((time, i) => (
                                                    <li key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '10px' }}>
                                                        <span style={{ fontSize: '10px' }}>{moment(time).format('DD.MM.YY HH:mm')}</span>
                                                        {isEditingAssignments && (
                                                            <button
                                                                onClick={() => {
                                                                    const newList = [...assignments];
                                                                    newList[index].administered.splice(i, 1);
                                                                    setAssignments(newList);
                                                                }}
                                                                style={{
                                                                    marginLeft: '5px',
                                                                    fontSize: '10px',
                                                                    padding: '2px 4px',
                                                                    color: 'red',
                                                                    border: 'none',
                                                                    background: 'transparent',
                                                                    cursor: 'pointer'
                                                                }}
                                                                title="Удалить отметку"
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        {isEditingAssignments && (
                                            <td style={{ width: '15%' }}>
                                                <button
                                                    style={{ width: 'fit-content', height: 'fit-content', padding: '1px 5px' }}
                                                    onClick={async () => {
                                                        const itemToDelete = assignments[index];

                                                        // If the medication has an ID (already saved in DB), delete from backend
                                                        if (itemToDelete.id) {
                                                            try {
                                                                await axios.delete(`http://localhost:5000/api/medications/${itemToDelete.id}`);
                                                            } catch (err) {
                                                                console.error("Ошибка при удалении:", err);
                                                                alert("Не удалось удалить назначение.");
                                                                return; // don't remove from UI if backend failed
                                                            }
                                                        }
                                                        // Remove from UI
                                                        const newList = assignments.filter((_, i) => i !== index);
                                                        setAssignments(newList);
                                                    }}> Удалить</button>
                                            </td>
                                        )}

                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {isEditingAssignments && (
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <button onClick={handleSaveAssignments}>
                                    Сохранить
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    ]

    return (
        <div className={styles.resultsContainer}>
            {contextHolder}
            <h2 style={{ marginBottom: '20px', cursor: 'default' }}>
                {state?.searchQuery ? `Результаты поиска:` : `Карта пациента`}
            </h2>

            <Menu
                items={[
                    { name: 'Основное' },
                    { name: 'Анализы' },
                    { name: 'Назначения' }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {tabContents[activeTab]}

            <div className={styles.buttonsContainer}>
                <div>
                    <button
                        className={styles.updbut}
                        onClick={handleEdit}
                    >
                        Редактировать
                    </button>

                    <button
                        className={styles.printbut}
                        onClick={handlePrint}
                    >
                        Печать
                    </button>
                </div>

                <HomeButton />
            </div>
        </div >
    );
};