import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const UsersDataContext = createContext()

export const UsersDataProvider = ({ children }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            const response = await api.getUsers()
            setUsers(response.data || [])
        } catch (error) {
            console.log("Error fetching users: ", error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <UsersDataContext.Provider value={{ users, loading, refresh: fetchUsers }}>
            {children}
        </UsersDataContext.Provider>
    )
}

export const useUsers = () => useContext(UsersDataContext)