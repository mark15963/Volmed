import { useLocation, useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { useEffect, useState, lazy, Suspense } from 'react'
import { usePageTitle } from '../../components/PageTitle'
import { Menu } from '../../components/Menu'
import { message, Spin } from "antd"

import { Tab1 } from './tabs/tab1'
const Tab2 = lazy(() => import('./tabs/tab2'))
const Tab3 = lazy(() => import('./tabs/tab3'))

import styles from './searchResults.module.css'

import Button from '../../components/Buttons.tsx'

import api from '../../services/api'
import { LoadingOutlined } from '@ant-design/icons'
import debug from '../../utils/debug'

const environment = import.meta.env.VITE_ENV
const apiUrl = import.meta.env.VITE_API_URL

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
                    const response = await api.getPatient(id)
                    patientData = response.data
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
                    const response = await api.getPatientFiles(data.id)
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
            const response = await api.getPatientFiles(id)
            setFileList(response.data.map(file => ({
                uid: file.path,
                name: file.originalname,
                status: 'done',
                url: `${apiUrl}${file.path}`,
                response: { path: file.path }
            })));
        } catch (error) {
            setTimeout(() => {
                messageApi.error('Ошибка загрузки списка файлов');
            }, 0)

        }
    };

    // Load files on mount and when patientId changes
    useEffect(() => {
        refreshFileList();
    }, [id]);

    const handleSaveFiles = async () => {
        try {
            await refreshFileList();

            const response = await api.getPatientFiles(id)
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
                const filePath = file.response.path
                    .replace(/^\/?uploads\//, '')
                    .replace(/^\/?public\//, '')
                    .replace(/^\/?/, '')
                    .replace(/\\/g, '/')

                console.log('Sending file:', filePath);

                const response = await api.deleteFile(filePath)

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
            console.error("Delete error:", {
                error: error.message,
                response: error.response?.data
            });
            messageApi.error(`Ошибка при удалении ${file.name}: ${error.response?.data?.error ||
                error.response?.data?.message ||
                error.message
                }`);
            return false;
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
                const response = await api.getMedications(data.id)
                const formattedAssignments = response.data.map(med => ({
                    ...med,
                    createdAt: med.createdAt || new Date().toISOString()
                }));
                setAssignments(formattedAssignments);

            } catch (error) {
                console.error('Ошибка при получении назначений:', error);
            }
        };
        fetchMedications();
    }, [data?.id]);


    const handleSaveAssignments = async () => {
        try {
            for (const item of assignments) {
                const payload = {
                    name: item.name,
                    dosage: item.dosage,
                    frequency: item.frequency,
                };
                try {
                    if (item.id) {
                        const response = await api.updateMedication(item.id, payload)
                    } else {
                        const response = await api.createMedication(data.id, payload)
                        const createdAssignment = response.data;
                        setAssignments(prev =>
                            prev.map(a =>
                                !a.id && a.name === item.name && a.dosage === item.dosage && a.frequency === item.frequency
                                    ? { ...a, id: createdAssignment.id }
                                    : a
                            )
                        );
                    }
                } catch (error) {
                    console.error("Детальная ошибка назначений:", {
                        url: error.config?.url,
                        method: error.config?.method,
                        payload: error.config?.data,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        responseData: error.response?.data,
                        errorMessage: error.message
                    });
                    throw error;
                }
            }

            setIsEditingAssignments(false);
            messageApi.success('Назначения успешно сохранены');

        } catch (error) {
            console.error("Ошибка при сохранении назначений:", {
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

    const tabContents = [
        <Suspense fallback={
            <div className={styles.info}>
                <div className={styles.bg}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Spin indicator={<LoadingOutlined spin style={{ color: 'aliceblue', fontSize: '50px' }} />} />
                    </div>
                </div>
            </div>
        }>
            <Tab1 data={data} />
        </Suspense>,

        <Suspense fallback={
            <div className={styles.info}>
                <div className={styles.bg}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Spin indicator={<LoadingOutlined spin style={{ color: 'aliceblue', fontSize: '50px' }} />} />
                    </div>
                </div>
            </div>
        }>
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
            />
        </Suspense>,

        <Suspense fallback={
            <div className={styles.info}>
                <div className={styles.bg}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Spin indicator={<LoadingOutlined spin style={{ color: 'aliceblue', fontSize: '50px' }} />} />
                    </div>
                </div>
            </div>
        }>
            <Tab3
                assignments={assignments}
                isEditingAssignments={isEditingAssignments}
                setAssignments={setAssignments}
            />
        </Suspense>
    ]

    //Main block state
    if (loading && !data) {
        return (
            <div className={styles.resultsContainer} style={{ display: "flex", justifyContent: 'center', width: 'fit-content' }}>
                <h2>
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
                <div className={styles.info}>
                    <div className={styles.bg}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Spin indicator={<LoadingOutlined spin style={{ color: 'aliceblue', fontSize: '50px' }} />} />
                        </div>
                    </div>
                </div>
                <div className={styles.buttonsContainer}>
                    <div style={{ display: 'flex' }}>
                        <Button
                            text={isEditingAssignments || isEditingFiles ?
                                `Сохранить` : `Редактировать`
                            }
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
                        />

                        <Button text="Печать" className={styles.printButton} onClick={handlePrint} />
                    </div>

                    <Button text="Назад на главную" onClick={() => navigate('/')} />
                </div>
            </div>
        );
    }
    if (error) return <div className={styles.resultsContainer}>Ошибка: {error}</div>;
    if (!data) return <div className={styles.resultsContainer}>Пациент не найден.</div>;

    //Debug
    debug.log(`Search result of patient ${data.lastName} ${data.firstName} ${data.patr}`)

    return (
        <div className={styles.resultsContainer}>
            {contextHolder}
            <h2>
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
                        text={isEditingAssignments || isEditingFiles ?
                            `Сохранить` : `Редактировать`
                        }
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
                    />

                    <Button text="Печать" className={styles.printButton} onClick={handlePrint} />
                </div>

                <Button text="Назад на главную" onClick={() => navigate('/')} />
            </div>
        </div >
    );
};

export default SearchResults