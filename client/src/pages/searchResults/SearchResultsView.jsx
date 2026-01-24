// Used in:
// - SearchResults.jsx

//#region ===== IMPORTS =====
import React, { lazy, Suspense, useMemo } from "react";
import { Menu } from "../../components/Menu";
import ActionButtons from "./tabs/Components/ActionButtons";
import ErrorState from "./tabs/Components/States/ErrorState";
import NotFoundState from "./tabs/Components/States/NotFoundState";
import { SpinLoader } from "../../components/ui/loaders/SpinLoader";

// Menu tabs
import Tab1 from "./tabs/tab1";
const Tab2 = lazy(() => import('./tabs/tab2'))
const Tab3 = lazy(() => import('./tabs/tab3'))

import styles from './searchResults.module.scss'
//#endregion

//#region ===== JSDoc Types =====
/**
 * @typedef {Object} DataProps
 * @property {Patient|null} data - Patient object or null if not loaded
 * @property {boolean} loading - Loading state
 * @property {Error|null} error - Error object if request failed
 */

/**
 * @typedef {Object} RouterProps
 * @property {string} id - Patient ID from the route
 * @property {Object} state - Location state from React Router (e.g. `{ searchQuery, results }`)
 * @property {Function} navigate - React Router navigate function
 */

/**
 * @typedef {Object} UIProps
 * @property {number} activeTab - Currently active tab index
 * @property {Function} setActiveTab - Setter function for active tab
 */

/**
 * @typedef {Object} Hooks
 * @property {Object} filesHook - Hook object returned from `usePatientFiles`
 * @property {Object} medsHook - Hook object returned from `usePatientMedications`
 */

/**
 * @typedef {Object} FilesHook
 * @property {boolean} isLoading - Whether patient files are being loaded
 * @property {boolean} isEditing - Whether files are currently being edited
 * @property {Array<Object>} files - Array of patient files
 * @property {Function} handleUpload - Upload a new file
 * @property {Function} handleDelete - Delete a file
 * @property {Function} handleSave - Save file changes
 */

/**
 * @typedef {Object} MedsHook
 * @property {boolean} isLoading - Whether patient medications are being loaded
 * @property {boolean} isEditing - Whether medications are currently being edited
 * @property {Array<Object>} medications - Array of patient medications
 * @property {Function} handleAddMedication - Add a new medication entry
 * @property {Function} handleRemoveMedication - Remove a medication entry
 * @property {Function} handleSave - Save medication changes
 */

/**
 * @typedef {Object} Handlers
 * @property {Function} handleEdit - Function to edit patient
 * @property {Function} handlePrint - Function to print patient info
 * @property {Function} handleDeletePatient - Function to delete patient
 */
//#endregion

//===== Component JSDoc =====
/**
 * SearchResultsView
 * -----------------
 * Presentational component displaying a patient’s data, files, and medications in tabs.
 *
 * Responsibilities:
 * - Show loader, error, or not-found states at `renderContent()`.
 * - Display patient info and tabbed sections (main info, files, medications) at `tabContents[activeTab]`.
 * - Manage tab switching and lazy-load tab content.
 * - Connect UI to file and medication hooks for editing and saving.
 * - Provide action buttons for print, edit, and delete actions.
 *
 * @param {Object} props - Component props
 * @param {DataProps} props.dataProps - Patient data and loading/error states
 * @param {RouterProps} props.routerProps - Router utilities including `id`, `state`, and `navigate`
 * @param {UIProps} props.uiProps - UI state for tabs (`activeTab` and `setActiveTab`)
 * @param {Hooks} props.hooks - Hook objects for `filesHook` and `medsHook`
 * @param {Handlers} props.handlers - Action handlers (edit, print, delete)
 * @returns {JSX.Element} Rendered view of the patient search results
 */
const SearchResultsView = ({
  dataProps,
  routerProps,
  uiProps,
  hooks,
  handlers
}) => {
  //#region ===== CONSTS =====
  // Regrouping consts from parent component (SearchResult.jsx)  
  const { data, loading, error } = dataProps
  const { id, state, navigate } = routerProps
  const { activeTab, setActiveTab } = uiProps
  const { filesHook, medsHook } = hooks
  const { handleEdit, handlePrint, handleDeletePatient } = handlers
  //#endregion
  //#region ===== RENDER LOGIC & CONTENT =====
  const tabContents = useMemo(
    () => [
      <Tab1 data={data} />,
      <Tab2 {...filesHook} isLoading={filesHook.isLoading} id={id} />,
      <Tab3 {...medsHook} patientId={id} />,
    ],
    [data, filesHook, medsHook, id]
  )
  const renderContent = () => {
    if (loading && !data) return renderLoader('main')
    if (error) return <ErrorState error={error} />
    if (data === null) return <NotFoundState />
    return (
      <Suspense fallback={renderLoader('tab')}>
        {tabContents[activeTab]}
      </Suspense>
    )
  };
  const renderLoader = (type = 'main') => (
    <div className={styles.info}>
      <div className={styles.bg}>
        <SpinLoader />
        {type === 'main' && <div>Загрузка данных пациента...</div>}
        {type === 'tab' && <div>Загрузка вкладки...</div>}
      </div>
    </div>
  )
  //#endregion

  return (
    <div className={styles.resultsContainer}>
      <span className={styles.pageTitle}>
        {state?.searchQuery
          ? `Результаты поиска: №${id}`
          : `Карта пациента №${id}`}
      </span>

      <Menu
        items={[
          { name: 'Основное' },
          { name: 'Анализы' },
          { name: 'Назначения' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {renderContent()}

      <ActionButtons
        activeTab={activeTab}
        isEditingMeds={medsHook.isEditing}
        isEditingFiles={filesHook.isEditing}
        handleEdit={handleEdit}
        handleSaveMedications={medsHook.handleSave}
        handleSaveFiles={filesHook.handleSave}
        handlePrint={handlePrint}
        handleDeletePatient={handleDeletePatient}
        navigate={navigate}
      />
    </div >
  );
}

export default SearchResultsView