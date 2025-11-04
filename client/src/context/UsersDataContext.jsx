import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const UsersDataContext = createContext()

export const UsersDataProvider = ({ children }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const { authState } = useAuth()

    const fetchUsers = useCallback(async (showGlobalLoader = true) => {
        if (!authState.isAuthenticated) return

        if (showGlobalLoader) setLoading(true)
        setError(null)

        try {
            const response = await api.getUsers()
            setUsers(response.data || [])
        } catch (error) {
            console.log("Error fetching users: ", error)
            setError(error.message);
        } finally {
            if (showGlobalLoader) setLoading(false)
        }
    }, [authState.isAuthenticated])

    useEffect(() => {
        if (authState.isAuthenticated && !authState.isLoading) {
            fetchUsers()
        } else {
            setUsers([]);
        }
    }, [authState.isAuthenticated, authState.isLoading])

    return (
        <UsersDataContext.Provider value={{
            users,
            loading,
            error,
            fetchUsers,
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

export default UsersDataProvider