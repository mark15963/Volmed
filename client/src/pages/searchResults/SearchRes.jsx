//#region ===== Imports =====
// React, Router
import { useLocation, useNavigate, useParams } from 'react-router'
import React, { useEffect, useState, lazy, Suspense, useCallback, useMemo, useRef } from 'react'

// UI & Icons
import { message } from "antd"

// Tabs
import { Tab1 } from './tabs/tab1'
const Tab2 = lazy(() => import('./tabs/tab2'))
const Tab3 = lazy(() => import('./tabs/tab3'))

// Custom Hooks
import { usePatientFiles } from '../../hooks/usePatientFiles'
import { usePatientData, } from '../../hooks/usePatientData'
import { usePatientMedications } from '../../hooks/usePatientMedications'

// Components
import Button from '../../components/Buttons.tsx'
import ActionButtons from './tabs/Components/ActionButton'
import { Menu } from '../../components/Menu'
import ErrorState from './tabs/Components/States/ErrorState'
import NotFoundState from './tabs/Components/States/NotFoundState'

// Styles & Utils
import api from '../../services/api'
import debug from '../../utils/debug'
import styles from './searchResults.module.css'
import { SpinLoader } from './tabs/Components/Loading/SpinLoader'

//#endregion

//#region ===== Constants =====
const environment = import.meta.env.VITE_ENV
const apiUrl = import.meta.env.VITE_API_URL
const TAB_MAIN = 0;
const TAB_FILES = 1;
const TAB_MEDS = 2;
//#endregion

// ===== Main Component =====
const SearchResults = React.memo(() => {
    //#region ===== Router, Message, States =====
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const messageApiRef = {
        api: messageApi,
        holder: contextHolder,
    };
    const [activeTab, setActiveTab] = useState(TAB_MAIN)
    //#endregion

    //#region ===== Patient data =====
    const { data, loading, error } = usePatientData(id, state)
    const {
        files,
        fileList,
        setFileList,
        isEditing: isEditingFiles,
        setIsEditing: setIsEditingFiles,
        handleSaveFiles,
    } = usePatientFiles(data?.id, messageApiRef);
    const {
        medications,
        setMedications,
        isEditing: isEditingMedications,
        setIsEditing: setIsEditingMedications,
        handleSave,
    } = usePatientMedications(data?.id, messageApiRef);
    const filesHook = {
        files,
        fileList,
        setFileList,
        isEditingFiles,
        setIsEditingFiles,
        handleSaveFiles,
    };
    const medsHook = {
        medications,
        setMedications,
        isEditingMedications,
        setIsEditingMedications,
        handleSave,
    }
    //#endregion

    //#region ===== Effects =====
    // Sync list of files
    useEffect(() => {
        if (isEditingFiles && files.length > 0 && (!fileList || fileList.length === 0)) {
            setFileList(
                files.map(file => ({
                    uid: file.path,
                    name: file.originalname,
                    status: "done",
                    url: `${apiUrl}${file.path}`,
                    response: { path: file.path },
                }))
            );
        }
    }, [isEditingFiles, files, fileList.length, setFileList]);
    // Reset the editing states when tab change    
    useEffect(() => {
        const prevTab = prevTabRef.current;
        if (activeTab !== prevTab) {

            setIsEditingFiles(false);
            setIsEditingMedications(false);

            if (activeTab !== 2 && medications.length > 0) {
                const lastItem = medications[medications.length - 1]
                if (!lastItem.name.trim() && !lastItem.dosage.trim() && !lastItem.frequency.trim()) {
                    setMedications(prev => prev.slice(0, -1));
                }
            }
            prevTabRef.current = activeTab
        }
    }, [activeTab]);
    // Sets edit of other tabs off when one is on
    useEffect(() => {
        if (isEditingFiles) {
            setIsEditingMedications(false);
        }
        if (isEditingMedications) {
            setIsEditingFiles(false);
        }
    }, [isEditingFiles, isEditingMedications]);
    //#endregion

    //#region ===== Handlers =====
    const handlePrint = () => window.print()

    const handleEdit = useCallback(() => {
        const isMedTab = activeTab === TAB_MEDS;
        const isFileTab = activeTab === TAB_FILES;

        if (isMedTab) {
            setIsEditingMedications(prev => !prev);
            setIsEditingFiles(false)
        } else if (isFileTab) {
            setIsEditingFiles(prev => !prev)
            setIsEditingMedications(false);
        } else if (data?.id) {
            navigate(`/edit/${data.id}`, {
                state: {
                    patientData: data
                }
            })
        }
    }, [activeTab, data, navigate, isEditingFiles, isEditingMedications])
    //#endregion

    //#region ===== Renders =====
    const renderLoader = () => (
        <div className={styles.info}>
            <div className={styles.bg}>
                <SpinLoader />
            </div>
        </div>
    )
    const renderContent = () => {
        if (loading && !data) {
            return renderLoader();
        }

        if (error) return <ErrorState error={error} />;
        if (!data) return <NotFoundState />;

        return null;
    };
    //#endregion

    //#region ===== Refs & Memorized Values =====
    const prevTabRef = useRef(activeTab);
    const tabContents = useMemo(() => [
        <Suspense fallback={renderLoader()}>
            <Tab1 data={data} />
        </Suspense>,

        <Suspense fallback={renderLoader()}>
            <Tab2 {...filesHook} />
        </Suspense>,

        <Suspense fallback={renderLoader()}>
            <Tab3 {...medsHook} />
        </Suspense>
    ], [data, files, fileList, medications, isEditingFiles, isEditingMedications])
    //#endregion

    //#region ===== JSX =====
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
                activeTab={activeTab}
                isEditingMedications={isEditingMedications}
                isEditingFiles={isEditingFiles}
                handleEdit={handleEdit}
                handleSaveMedications={handleSave}
                handleSaveFiles={handleSaveFiles}
                handlePrint={handlePrint}
                navigate={navigate}
                medications={medications}
            />
        </div >
    );
    //#endregion
})

export default SearchResults