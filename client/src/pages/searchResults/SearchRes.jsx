import { useLocation, useNavigate, useParams } from 'react-router'
import { useEffect, useState, lazy, Suspense, useCallback } from 'react'
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

const usePageData = (id, state) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                let patientData = state?.patientData ||
                    (state?.results?.length > 0 && state.results[0]) ||
                    (id && await api.getPatient(id).then(res => res.data))

                if (!patientData) throw new Error('Данные пациента не найдены');
                setData(patientData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPatientData();
    }, [id, state]);
    return { data, loading, error }
}

const usePageTitleEffect = (loading, error, data) => {
    useEffect(() => {
        const title = loading ? "Загрузка данных пациента..." :
            error ? "Ошибка загрузки" :
                !data ? "Пациент не найден" :
                    `Карта пациента: ${data.lastName} ${data.firstName}${data.patr ? ` ${data.patr}` : ''}`

        document.title = title
        return () => {
            document.title = "ГБУ «Городская больница Волновахского района»";
        };
    }, [loading, error, data]);
}

const SearchResults = () => {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    //states
    const { data, loading, error } = usePageData(id, state)
    const [activeTab, setActiveTab] = useState(0)
    const [files, setFiles] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [isEditingAssignments, setIsEditingAssignments] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [isEditingFiles, setIsEditingFiles] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    usePageTitleEffect(loading, error, data)


    const fetchFiles = useCallback(async () => {
        if (!data?.id) return
        try {
            const response = await api.getPatientFiles(data.id)
            setFiles(response.data);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    }, [data?.id])

    useEffect(() => { fetchFiles() }, [fetchFiles])

    // Function to refresh file list
    const refreshFileList = useCallback(async () => {
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
            setTimeout(() => messageApi.error('Ошибка загрузки списка файлов'), 0)
        }
    }, [id, messageApi])

    useEffect(() => { refreshFileList() }, [refreshFileList])

    const handleSaveFiles = useCallback(async () => {
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
    }, [id, messageApi, refreshFileList])

    const handleRemoveFile = useCallback(async (file) => {
        try {
            if (!file.response?.path) return false

            const filePath = file.response.path
                .replace(/^\/?uploads\//, '')
                .replace(/^\/?public\//, '')
                .replace(/^\/?/, '')
                .replace(/\\/g, '/')

            const response = await api.deleteFile(filePath)

            if (!response.data.success) throw new Error(response.data.message || 'Неизвестная ошибка')

            setFileList(prev => prev.filter(f => f.uid !== file.uid));
            setFiles(prev => prev.filter(f => f.path !== file.response.path));
            setUploadStatus({
                status: 'removed',
                fileName: file.name
            })
            return true;
        } catch (error) {
            setUploadStatus({
                status: 'remove_error',
                fileName: file.name,
                error: error.response?.data?.message || error.message || 'Ошибка удаления файла'
            });
            debug.error("Delete error:", {
                error: error.message,
                response: error.response?.data
            });
            messageApi.error(`Ошибка при удалении ${file.name}: ${error.response?.data?.error ||
                error.response?.data?.message ||
                error.message
                }`);
            return false;
        }
    }, [messageApi])

    useEffect(() => {
        if (!uploadStatus) return

        const messages = {
            done: `${uploadStatus.fileName} файл успешно загружен.`,
            error: `${uploadStatus.fileName} ошибка загрузки файла.`,
            removed: `${uploadStatus.fileName} успешно удален`,
            remove_error: `${uploadStatus.error}: ${uploadStatus.fileName}`,
        }

        messageApi[uploadStatus.status.includes('error') ? 'error' : 'success'](
            messages[uploadStatus.status.replace('_', '')]
        )
        setUploadStatus(null);
    }, [uploadStatus, messageApi]);

    // Fetch medications
    const fetchMedications = useCallback(async () => {
        if (!data?.id) return;
        try {
            const response = await api.getMedications(data.id)
            setAssignments(response.data.map(med => ({
                ...med,
                createdAt: med.createdAt || new Date().toISOString()
            })))
        } catch (error) {
            console.error('Ошибка при получении назначений:', error);
        }
    }, [data?.id])

    useEffect(() => { fetchMedications() }, [fetchMedications])

    const handleSaveAssignments = useCallback(async () => {
        try {
            await Promise.all(assignments.map(async (item) => {
                const payload = {
                    name: item.name,
                    dosage: item.dosage,
                    frequency: item.frequency,
                };

                if (item.id) {
                    await api.updateMedication(item.id, payload)
                } else {
                    const response = await api.createMedication(data.id, payload)
                    setAssignments(prev => prev.map(a =>
                        !a.id && a.name === item.name && a.dosage === item.dosage && a.frequency === item.frequency
                            ? { ...a, id: response.data.id }
                            : a
                    ));
                }
            }))

            setIsEditingAssignments(false);
            messageApi.success('Назначения успешно сохранены');
        } catch (error) {
            console.error("Ошибка при сохранении назначений:", {
                error: error,
                response: error.response?.data
            });
            messageApi.error('Ошибка при сохранении назначений: ' + (error.response?.data?.message || error.message));
        }
    }, [assignments, data?.id, messageApi])


    // reset the editing states when tab change
    useEffect(() => {
        setIsEditingAssignments(false);
        setIsEditingFiles(false);
    }, [activeTab]);

    // Handlers
    const handlePrint = () => window.print()

    const handleEdit = useCallback(() => {
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
    }, [activeTab, data, navigate])



    const renderLoader = () => (
        <div className={styles.info}>
            <div className={styles.bg}>
                <SpinContainer />
            </div>
        </div>
    )

    const renderContent = () => {
        if (loading && !data) {
            return (
                <div className={styles.info}>
                    <div className={styles.bg}>
                        <SpinContainer />
                    </div>
                </div>
            );
        }

        if (error) return <ErrorState error={error} />;
        if (!data) return <NotFoundState />;

        return null;
    };

    const tabContents = [
        <Suspense fallback={renderLoader()}>
            <Tab1 data={data} />
        </Suspense>,

        <Suspense fallback={renderLoader()}>
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

        <Suspense fallback={renderLoader()}>
            <Tab3
                assignments={assignments}
                isEditingAssignments={isEditingAssignments}
                setAssignments={setAssignments}
            />
        </Suspense>
    ]

    //Debug
    debug.log(`Search result of patient ${data?.lastName} ${data?.firstName} ${data?.patr}`)

    //Render
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


            {renderContent() || tabContents[activeTab]}

            <ActionButtons
                isEditingAssignments={isEditingAssignments}
                isEditingFiles={isEditingFiles}
                handleEdit={handleEdit}
                handleSaveAssignments={handleSaveAssignments}
                handleSaveFiles={handleSaveFiles}
                handlePrint={handlePrint}
                navigate={navigate}
            />
        </div >
    );
};
const SpinContainer = () => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Spin indicator={<LoadingOutlined spin style={{ color: 'aliceblue', fontSize: '50px' }} />} />
    </div>
);

const ErrorState = ({ error }) => (
    <div className={styles.resultsContainer}>Ошибка: {error}</div>
);

const NotFoundState = () => (
    <div className={styles.resultsContainer}>Пациент не найден.</div>
);

const ActionButtons = ({
    isEditingAssignments,
    isEditingFiles,
    handleEdit,
    handleSaveAssignments,
    handleSaveFiles,
    handlePrint,
    navigate
}) => (
    <div className={styles.buttonsContainer}>
        <div style={{ display: 'flex' }}>
            <Button
                text={
                    isEditingAssignments || isEditingFiles
                        ? `Сохранить`
                        : `Редактировать`
                }
                onClick={(e) => {
                    handleEdit(e);
                    isEditingAssignments && handleSaveAssignments(e);
                    isEditingFiles && handleSaveFiles(e);
                }}
            />
            <Button
                text="Печать"
                className={styles.printButton}
                onClick={handlePrint}
            />
        </div>
        <Button
            text="Назад на главную"
            onClick={() => navigate('/')}
        />
    </div>
);

export default SearchResults