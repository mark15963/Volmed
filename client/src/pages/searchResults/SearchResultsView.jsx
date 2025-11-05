// Used in:
// - SearchResults.jsx

//#region ===== IMPORTS =====
import React, { lazy, Suspense, useMemo } from "react";
import { Menu } from "../../components/Menu";
import ActionButtons from "./tabs/Components/ActionButton";
import ErrorState from "./tabs/Components/States/ErrorState";
import NotFoundState from "./tabs/Components/States/NotFoundState";
import { SpinLoader } from "../../components/loaders/SpinLoader";

// Menu tabs
import Tab1 from './tabs/Tab1'
const Tab2 = lazy(() => import('./tabs/Tab2'))
const Tab3 = lazy(() => import('./tabs/Tab3'))

import styles from './searchResults.module.scss'
//#endregion ================

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
  const { activeTab, setActiveTab, contextHolder } = uiProps
  const { filesHook, medsHook } = hooks
  const { handleEdit, handlePrint, handleDeletePatient } = handlers
  //#endregion

  //#region ===== RENDERS =====
  const renderLoader = () => (
    <div className={styles.info}>
      <div className={styles.bg}>
        <SpinLoader />
      </div>
    </div>
  )
  const renderContent = () => {
    if (loading && !data) return renderLoader();
    if (error) return <ErrorState error={error} />;
    if (data === null) return <NotFoundState />
    return null;
  };
  //#endregion

  const tabContents = useMemo(() => [
    <Tab1 data={data} />,
    <Tab2 {...filesHook} isLoading={filesHook.isLoading} />,
    <Tab3 {...medsHook} patientId={id} />,
  ], [data, filesHook, medsHook])

  return (
    <div className={styles.resultsContainer}>

      {contextHolder} {/* TOP FLOATING MESSAGES */}

      {/* PAGE TITLE */}
      <span className={styles.pageTitle}>
        {state?.searchQuery ? `Результаты поиска: №${id}` : `Карта пациента №${id}`}
      </span>

      {/* NAVIGATION MENU */}
      <Menu
        items={[
          { name: 'Основное' },
          { name: 'Анализы' },
          { name: 'Назначения' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* CONTENT */}
      {renderContent() || (
        <Suspense fallback={renderLoader()}>
          {tabContents[activeTab]}
        </Suspense>
      )}

      {/* BUTTONS */}
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