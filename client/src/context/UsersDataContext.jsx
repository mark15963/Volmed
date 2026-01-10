import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

/**
 * @typedef {Object} User
 * @property {number} id - Unique user ID
 * @property {string} username - Login username
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} [patr] - Optional patronymic
 * @property {string} status - User role ('admin', 'doctor', 'nurse', etc.)
 */

/**
 * @typedef {Object} UsersContextValue
 * @property {User[]} users - List of all users
 * @property {boolean} loading - Global loading indicator
 * @property {string|null} error - Error message (if any)
 * @property {(showGlobalLoader?: boolean) => Promise<void>} fetchUsers - reload the whole page or just the component
 */

const UsersDataContext = createContext()

/**
 * UsersDataProvider
 * -----------------
 * Provides global access to the user list and related operations.
 * Automatically fetches users when the user is authenticated.
 *
 * @component
 * @example
 * <UsersDataProvider>
 *   <App />
 * </UsersDataProvider>
 */
export const UsersDataProvider = ({ children }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const { authState } = useAuth()

    /**
   * Fetches the user list from the API and updates local state.
   *
   * @param {boolean} [showGlobalLoader=true] - Whether to display the loading state globally
   * @returns {Promise<void>}
   */
    const fetchUsers = useCallback(async (showGlobalLoader = true) => {
        if (!authState.isAuthenticated) return

        if (showGlobalLoader) setLoading(true)
        setError(null)

        try {
            const res = await api.getUsers()
            if (res.ok) setUsers(res.data || [])
            else throw new Error(res.message || 'Failed to load users.')
        } catch (err) {
            console.log("Error fetching users: ", err)
            setError(err.message);
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
    }, [authState.isAuthenticated, authState.isLoading, fetchUsers])

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

/**
 * useUsers
 * --------
 * Custom hook to access the global users context.
 * Must be used within a `<UsersDataProvider>`.
 *
 * @throws {Error} If used outside of a UsersDataProvider.
 * @returns {UsersContextValue} The current users context value.
 *
 * @example
 * const { users, loading, fetchUsers } = useUsers();
 * useEffect(() => { fetchUsers(); }, []);
 */
export const useUsers = () => {
    const context = useContext(UsersDataContext)
    if (!context) {
        throw new Error('useUsers must be used within a UsersDataProvider')
    }
    return context
}

export default UsersDataProvider