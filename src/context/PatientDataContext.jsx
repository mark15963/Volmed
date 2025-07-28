import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'

const PatientDataContext = createContext()

export const PatientDataProvider = ({ children }) => {
    const [state, setState] = useState({
        patients: [],
        isLoading: true,
        error: null
    })

    const fetchPatients = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }))
            const { data } = await api.getPatients()
            setState({
                patients: data || [],
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
    }, [])

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