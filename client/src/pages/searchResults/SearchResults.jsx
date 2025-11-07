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
/**
 * SearchResults
 * -------------
 * Container component for displaying a single patient's information, files, and medications.
 * 
 * Responsibilities:
 * - Fetch patient data using the `id` route parameter.
 * - Optionally reuse pre-fetched patient data from router `state` to avoid extra API calls.
 * - Manage the active tab (Main, Files, Medications).
 * - Connect UI to hooks for patient files and medications.
 * - Provide action handlers (edit, print, delete) via `useSearchResultsManager`.
 * - Pass grouped props to the presentational `SearchResultsView`.
 * 
 * Router `state` usage (`useLocation().state`):
 * {
 *   results: Patient[];    // Optional array of patient objects from search
 *   searchQuery: string;   // Search input used to reach this page
 * }
 * 
 * Hooks used:
 * - `usePatientData(id, state)` → fetches or reuses patient data
 * - `usePatientFiles(patientId, safeMessage, isActiveTab)` → manages file upload/download
 * - `usePatientMedications(patientId, safeMessage, isActiveTab)` → manages medications
 * - `useSearchResultsManager()` → provides action handlers (edit, print, delete)
 * 
 * Grouped props passed to `SearchResultsView`:
 * @typedef {Object} DataProps
 * @property {Patient|null} data - Patient object or null if not loaded
 * @property {boolean} loading - Loading state
 * @property {Error|null} error - Error object if request failed
 * 
 * @typedef {Object} RouterProps
 * @property {string} id - Patient ID from the route
 * @property {Object} state - Location state from React Router (see above)
 * @property {Function} navigate - React Router navigate function
 * 
 * @typedef {Object} UIProps
 * @property {number} activeTab - Current tab index
 * @property {Function} setActiveTab - Setter for active tab
 * 
 * @typedef {Object} Hooks
 * @property {Object} filesHook - Hook object for patient files
 * @property {Object} medsHook - Hook object for patient medications
 * 
 * @typedef {Object} Handlers
 * @property {Function} handlePrint - Handler for printing patient info
 * @property {Function} handleEdit - Handler for editing patient info
 * @property {Function} handleDeletePatient - Handler for deleting patient
 * 
 * @returns {JSX.Element} Rendered search results page with patient data and tabs.
 */
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
