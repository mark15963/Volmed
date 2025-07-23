import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const PatientDataContext = createContext()

export const PatientDataProvider = ({ children }) => {
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPatients = async () => {
        try {
            const response = await api.getPatients()
            setPatients(response.data || [])
        } catch (error) {
            console.log("Error fetching patients: ", error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPatients()
    }, [])

    return (
        <PatientDataContext.Provider value={{ patients, loading, refresh: fetchPatients }}>
            {children}
        </PatientDataContext.Provider>
    )
}

export const usePatients = () => useContext(PatientDataContext)