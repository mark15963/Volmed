import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api/index'
import { loadFromLocalStorage, saveToLocalStorage } from '../services/localStorage/localCache'

const PATIENTS_CACHE_KEY = 'cachedPatients'

const PatientDataContext = createContext()

export const PatientDataProvider = ({ children }) => {
  const [state, setState] = useState({
    patients: loadFromLocalStorage(PATIENTS_CACHE_KEY) ?? [],
    isLoading: true,
    error: null
  })

  const fetchPatients = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const { data } = await api.getPatients()
      const patientsData = data || []

      // Put data from DB to localStorage
      saveToLocalStorage(PATIENTS_CACHE_KEY, patientsData)

      setState({
        patients: patientsData,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setState({
        patients: [],
        isLoading: false,
        error: error.message
      })
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return (
    <PatientDataContext.Provider value={{
      ...state,
      refresh: fetchPatients
    }}>
      {children}
    </PatientDataContext.Provider>
  )
}

export const usePatients = () => {
  const context = useContext(PatientDataContext)
  if (!context) {
    throw new Error('usePatients must be used within PatientDataProvider');
  }
  return context;
}
export default PatientDataProvider