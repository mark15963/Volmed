//#region ===== Imports =====
// React, Router
import { useLocation, useNavigate, useParams } from 'react-router'
import React, { useEffect, useState, lazy, Suspense, useCallback, useMemo, useRef } from 'react'

// UI & Icons
import { message } from "antd"
import { SpinLoader } from '../../components/Loading/SpinLoader.tsx'

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
    const patientId = data?.id || id;

    const filesHook = usePatientFiles(patientId, messageApiRef, activeTab === TAB_FILES)
    filesHook.id = patientId

    const medsHook = usePatientMedications(patientId, messageApiRef);

    //#endregion

    //#region ===== Effects =====
    // Sync list of files
    useEffect(() => {
        if (filesHook.isEditing && filesHook.files.length > 0 && (!filesHook.fileList || filesHook.fileList.length === 0)) {
            filesHook.setFileList(
                filesHook.files.map(file => ({
                    uid: file.path,
                    name: file.originalname,
                    status: "done",
                    url: `${apiUrl}${file.path}`,
                    response: { path: file.path },
                }))
            );
        }
    }, [filesHook.isEditingFiles, filesHook.files, filesHook.fileList.length, filesHook.setFileList]);

    // Reset the editing states when tab change    
    useEffect(() => {
        const prevTab = prevTabRef.current;
        if (activeTab !== prevTab) {

            filesHook.setIsEditing(false);
            medsHook.setIsEditing(false);

            if (activeTab !== 2 && medsHook.medications.length > 0) {
                const lastItem = medsHook.medications[medsHook.medications.length - 1]
                if (!lastItem.name.trim() && !lastItem.dosage.trim() && !lastItem.frequency.trim()) {
                    medsHook.setMedications(prev => prev.slice(0, -1));
                }
            }
            prevTabRef.current = activeTab
        }
    }, [activeTab]);

    // Sets edit of other tabs off when one is on
    useEffect(() => {
        if (filesHook.isEditingFiles) {
            medsHook.setIsEditing(false);
        }
        if (medsHook.isEditingMedications) {
            filesHook.setIsEditing(false);
        }
    }, [filesHook.isEditingFiles, filesHook.isEditingMedications]);
    //#endregion

    //#region ===== Handlers =====
    const handlePrint = () => window.print()

    const handleEdit = useCallback(() => {
        const isMedTab = activeTab === TAB_MEDS;
        const isFileTab = activeTab === TAB_FILES;

        if (isMedTab) {
            medsHook.setIsEditing(prev => !prev);
            filesHook.setIsEditing(false)
        } else if (isFileTab) {
            filesHook.setIsEditing(prev => !prev)
            medsHook.setIsEditing(false);
        } else if (data?.id) {
            navigate(`/edit/${data.id}`, {
                state: {
                    patientData: data
                }
            })
        }
    }, [activeTab, data, navigate, filesHook.isEditing, medsHook.isEditing])
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

    //#region ===== Refs & Tabs =====
    const prevTabRef = useRef(activeTab);
    const tabContents = useMemo(() => [
        <Suspense fallback={renderLoader()}>
            <Tab1 data={data} />
        </Suspense>,

        <Suspense fallback={renderLoader()}>
            <Tab2 {...filesHook} isLoading={filesHook.isLoading} />
        </Suspense>,

        <Suspense fallback={renderLoader()}>
            <Tab3 {...medsHook} />
        </Suspense>
    ], [data, filesHook, medsHook])
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
                isEditingMedications={medsHook.isEditing}
                isEditingFiles={filesHook.isEditing}
                handleEdit={handleEdit}
                handleSaveMedications={medsHook.handleSave}
                handleSaveFiles={filesHook.handleSave}
                handlePrint={handlePrint}
                navigate={navigate}
                medications={medsHook.medications}
            />
        </div >
    );
    //#endregion
})

export default SearchResults