import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'

const PatientDataContext = createContext()

const getValidatedPatientsFromStorage = () => {
    try {
        const stored = localStorage.getItem('cachedPatients')
        if (!stored) return []

        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
    } catch (err) {
        console.error('Error parsing cached patients:', err)
        return []
    }
}

export const PatientDataProvider = ({ children }) => {
    const [state, setState] = useState({
        patients: getValidatedPatientsFromStorage(),
        isLoading: true,
        error: null
    })

    const fetchPatients = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }))
            const { data } = await api.getPatients()
            const patientsData = data || []

            localStorage.setItem('cachedPatients', JSON.stringify(patientsData))

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