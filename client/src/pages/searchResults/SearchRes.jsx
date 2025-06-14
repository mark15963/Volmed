import { useLocation, useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { usePageTitle } from '../../components/PageTitle'
import { Menu } from '../../components/Menu'
import { message } from "antd"

import { Tab1 } from './tabs/tab1'
import { Tab2 } from './tabs/tab2'
import { Tab3 } from './tabs/tab3'

import styles from './searchResults.module.css'

import Button from '../../components/Buttons'

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
                    const response = await axios.get(`https://volmed-backend.onrender.com/api/patients/${id}`);
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
                    const response = await axios.get(`https://volmed-backend.onrender.com/api/patients/${data.id}/files`);
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
            const response = await axios.get(`https://volmed-backend.onrender.com/api/patients/${id}/files`);
            setFileList(response.data.map(file => ({
                uid: file.path,
                name: file.originalname,
                status: 'done',
                url: `https://volmed-backend.onrender.com${file.path}`,
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
            await refreshFileList();

            const response = await axios.get(`https://volmed-backend.onrender.com/api/patients/${id}/files`);
            setFiles(response.data);

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

                const response = await axios.delete('https://volmed-backend.onrender.com/api/files', {
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

    // reset the editing states when tab change
    useEffect(() => {
        setIsEditingAssignments(false);
        setIsEditingFiles(false);
    }, [activeTab]);

    // Fetch medications
    useEffect(() => {
        if (!data?.id) return;

        const fetchMedications = async () => {
            try {
                const response = await axios.get(`https://volmed-backend.onrender.com/api/patients/${data.id}/medications`);

                const medications = response.data.map(item => ({
                    ...item,
                    administered: Array.isArray(item.administered) ? item.administered : []
                }));

                setAssignments(medications.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                ));
            } catch (error) {
                console.error('Error fetching medications:', error);
            }
        };

        fetchMedications();
    }, [data?.id]);

    const handleSaveAssignments = async () => {
        try {
            console.log("Saving assignments...", assignments);

            for (const item of assignments) {
                const payload = {
                    name: item.name,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    administered: Array.isArray(item.administered) ? item.administered : []
                };
                console.log("Payload:", payload);

                try {
                    if (item.id) {
                        // Existing medication — update
                        const response = await axios.put(`https://volmed-backend.onrender.com/api/medications/${item.id}`, payload);
                        console.log("Update response:", response.data);

                    } else {
                        // New medication — create
                        const response = await axios.post(`https://volmed-backend.onrender.com/api/patients/${data.id}/medications`, payload);
                        console.log("Create response:", response.data);

                    }
                } catch (error) {
                    console.error("Error saving medication:", {
                        error: error.response?.data || error.message,
                        medication: item
                    });
                    throw error; // Re-throw to exit the loop
                }
            }

            setIsEditingAssignments(false);
            messageApi.success('Назначения успешно сохранены');

        } catch (error) {
            console.error("Error saving medications:", {
                error: error,
                response: error.response?.data
            });
            messageApi.error('Ошибка при сохранении назначений: ' + (error.response?.data?.message || error.message));
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

    //Main block state
    if (loading) return <div className={styles.resultsContainer}>Загрузка...</div>;
    if (error) return <div className={styles.resultsContainer}>Ошибка: {error}</div>;
    if (!data) return <div className={styles.resultsContainer}>Пациент не найден.</div>;

    const tabContents = [
        <Tab1 data={data} />,
        <Tab2
            files={files}
            fileList={fileList}
            setFileList={setFileList}
            isEditingFiles={isEditingFiles}
            setIsEditingFiles={setIsEditingFiles}
            handleSaveFiles={handleSaveFiles}
            handleRemoveFile={handleRemoveFile}
            uploadStatus={uploadStatus}
            setUploadStatus={setUploadStatus}
            id={id}
            messageApi={messageApi}
        />,
        <Tab3
            assignments={assignments}
            isEditingAssignments={isEditingAssignments}
            setAssignments={setAssignments}
            data={data}
            handleSaveAssignments={handleSaveAssignments}
        />
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
                <div style={{ display: 'flex' }}>
                    <Button
                        text='Редактировать'
                        onClick={(e) => {
                            handleEdit(e)
                            {
                                isEditingAssignments && (
                                    handleSaveAssignments(e)
                                )
                                isEditingFiles && (
                                    handleSaveFiles(e)
                                )
                            }
                        }}
                    >
                        {isEditingAssignments || isEditingFiles ?
                            `Сохранить` : `Редактировать`
                        }
                    </Button>

                    <Button text="Печать" onClick={handlePrint} />
                </div>

                <Button text="Назад на главную" onClick={() => navigate('/')} />
            </div>
        </div >
    );
};
