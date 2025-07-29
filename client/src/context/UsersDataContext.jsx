import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const UsersDataContext = createContext()

export const UsersDataProvider = ({ children }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const { authState } = useAuth()

    const fetchUsers = useCallback(async () => {
        // Don't fetch if not authenticated
        if (!authState.isAuthenticated) return

        setLoading(true)
        setError(null)
        try {
            const response = await api.getUsers()
            setUsers(response.data || [])
        } catch (error) {
            console.log("Error fetching users: ", error)
            // Consider adding error state if needed
            setError(error.message);
        } finally {
            setLoading(false)
        }
    }, [authState.isAuthenticated])

    useEffect(() => {
        // Only fetch if authenticated and not loading
        if (authState.isAuthenticated && !authState.isLoading) {
            fetchUsers()
        } else {
            // Clear data when not authenticated
            setUsers([]);
        }
    }, [authState.isAuthenticated, authState.isLoading])

    return (
        <UsersDataContext.Provider value={{
            users,
            loading,
            error
        }}>
            {children}
        </UsersDataContext.Provider>
    )
}

export const useUsers = () => {
    const context = useContext(UsersDataContext)
    if (!context) {
        throw new Error('useUsers must be used within a UsersDataProvider')
    }
    return context
}