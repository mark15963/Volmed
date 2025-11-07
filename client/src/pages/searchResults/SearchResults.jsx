//#region ===== Imports =====
// React, Router
import { useLocation, useNavigate, useParams } from 'react-router'
import React, { useState } from 'react'

// Components
import SearchResultsView from './SearchResultsView.jsx'

// Local Hooks
import { useSafeMessage } from '../../hooks/useSafeMessage.js'
import { useSearchResultsManager } from './hooks/useSearchResultsManager.js'
import { usePatientFiles } from '../../hooks/Patients/usePatientFiles.js'
import { usePatientData } from '../../hooks/Patients/usePatientData.js'
import { usePatientMedications } from '../../hooks/Patients/usePatientMedications.js'

// Styles & Utils
import debug from '../../utils/debug.js'
import styles from './searchResults.module.scss'
//#endregion

//#region ===== Constants =====
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
  const safeMessage = useSafeMessage()
  const [activeTab, setActiveTab] = useState(TAB_MAIN)
  //#endregion

  //#region ===== Patient data =====
  const { data, loading, error } = usePatientData(id, state)
  const patientId = data?.id || id;

  const filesHook = usePatientFiles(patientId, safeMessage, activeTab === TAB_FILES)

  const medsHook = usePatientMedications(patientId, safeMessage, activeTab === TAB_MEDS);
  //#endregion

  //#region ===== Hooks =====
  const { handlePrint, handleEdit, handleDeletePatient } = useSearchResultsManager({
    activeTab,
    data,
    navigate,
    filesHook,
    medsHook,
    safeMessage,
    id: patientId
  })
  //#endregion

  //#region ===== Grouped Props =====
  // Grouped consts to just one
  const dataProps = { data, loading, error }
  const routerProps = { id, state, navigate }
  const uiProps = { activeTab, setActiveTab }
  const hooks = { filesHook, medsHook }
  const handlers = { handlePrint, handleEdit, handleDeletePatient }
  //#endregion

  //#region ===== JSX =====
  // Passing grouped consts to component and regroup them inside
  return (
    <SearchResultsView
      dataProps={dataProps}
      routerProps={routerProps}
      uiProps={uiProps}
      hooks={hooks}
      handlers={handlers}
    />
  );
  //#endregion
})

export default SearchResults
