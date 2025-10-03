//#region ===== Imports =====
// React, Router
import { useLocation, useNavigate, useParams } from 'react-router'
import React, { useState } from 'react'

// UI & Icons
import { message } from "antd"

// Custom Hooks
import { usePatientFiles } from '../../hooks/usePatientFiles'
import { usePatientData } from '../../hooks/usePatientData'
import { usePatientMedications } from '../../hooks/usePatientMedications'

// Components
import SearchResultsView from './SearchResultsView.jsx'

// Local Hooks
import { useSyncFileList } from './hooks/useSyncFileList.js'
import { useResetEditingOnTabChange } from './hooks/useResetEditingOnTabChange.js'
import { useExclusiveEditing } from './hooks/useExclusiveEditing.js'
import { useSearchResultsActions } from './hooks/useSearchResultsActions.js'

// Styles & Utils
import debug from '../../utils/debug'
import styles from './searchResults.module.css'


//#endregion

//#region ===== Constants =====
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
  const [activeTab, setActiveTab] = useState(TAB_MAIN)
  //#endregion

  //#region ===== Patient data =====
  const { data, loading, error } = usePatientData(id, state)
  const patientId = data?.id || id;

  const filesHook = usePatientFiles(patientId, { api: messageApi, holder: contextHolder }, activeTab === TAB_FILES)
  filesHook.id = patientId

  const medsHook = usePatientMedications(patientId, { api: messageApi, holder: contextHolder }, activeTab === TAB_MEDS);
  //#endregion

  //#region ===== Hooks =====
  useSyncFileList(filesHook, apiUrl)
  useResetEditingOnTabChange(activeTab, filesHook, medsHook)
  useExclusiveEditing(filesHook, medsHook)

  const { handlePrint, handleEdit, handleDeletePatient } = useSearchResultsActions({ activeTab, data, navigate, filesHook, medsHook, messageApi, id })
  //#endregion

  //#region ===== Grouped Props =====
  const dataProps = { data, loading, error }
  const routerProps = { id, state, navigate }
  const uiProps = { activeTab, setActiveTab, contextHolder }
  const hooks = { filesHook, medsHook }
  const handlers = { handlePrint, handleEdit, handleDeletePatient }
  //#endregion

  //#region ===== JSX =====
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
