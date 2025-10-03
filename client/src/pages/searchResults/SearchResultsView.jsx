import React, { lazy, Suspense, useMemo } from "react";
import { Menu } from "../../components/Menu";
import ActionButtons from "./tabs/Components/ActionButton";
import ErrorState from "./tabs/Components/States/ErrorState";
import NotFoundState from "./tabs/Components/States/NotFoundState";
import { SpinLoader } from "../../components/Loading/SpinLoader";

// Tabs
import { Tab1 } from './tabs/tab1'
const Tab2 = lazy(() => import('./tabs/tab2'))
const Tab3 = lazy(() => import('./tabs/tab3'))

import styles from './searchResults.module.css'

const SearchResultsView = ({
  dataProps,
  routerProps,
  uiProps,
  hooks,
  handlers
}) => {
  const { data, loading, error } = dataProps
  const { id, state, navigate } = routerProps
  const { activeTab, setActiveTab, contextHolder } = uiProps
  const { filesHook, medsHook } = hooks
  const { handleEdit, handlePrint, handleDeletePatient } = handlers

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
    if (!data) return <NotFoundState />
    return null;
  };

  //#region ===== Tabs =====
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

  return (
    <div className={styles.resultsContainer}>

      {contextHolder} {/* TOP FLOATING MESSAGES */}

      <span className={styles.pageTitle}>
        {state?.searchQuery ? `Результаты поиска: №${id}` : `Карта пациента №${id}`}
      </span>
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
        isEditing={medsHook.isEditing}
        isEditingFiles={filesHook.isEditing}
        handleEdit={handleEdit}
        handleSaveMedications={medsHook.handleSave}
        handleSaveFiles={filesHook.handleSave}
        handlePrint={handlePrint}
        handleDeletePatient={handleDeletePatient}
        navigate={navigate}
        medications={medsHook.medications}
      />
    </div >
  );
}

export default SearchResultsView