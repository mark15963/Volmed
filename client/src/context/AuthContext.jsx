import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";

const apiUrl = import.meta.env.VITE_API_URL;

const AuthContext = createContext({
    authState: {
        isAuthenticated: false,
        isLoading: true,
        isAdmin: false,
    }
});

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: true,
        username: '',
        lastName: '',
        firstName: '',
        patr: '',
        status: '',
    });

    const checkAuthStatus = async () => {
        try {
            const response = await api.status(
                {
                    withCredentials: true,
                }
            );

            const isAdmin = response.data.user?.status === 'admin' || response.data.user?.status === 'Администратор';

            setAuthState({
                isAuthenticated: response.data.isAuthenticated,
                isAdmin: isAdmin,
                isLoading: false,
                username: response.data.user?.username || '',
                lastName: response.data.user?.lastName || '',
                firstName: response.data.user?.firstName || '',
                patr: response.data.user?.patr || '',
                status: response.data.user?.status || '',
            });

        } catch (error) {
            console.error('Auth check error:', error);
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                username: '',
                lastName: '',
                firstName: '',
                patr: '',
                status: '',
            });
        }
    };

    const logout = async () => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            await api.logout(
                {},
                { withCredentials: true }
            )
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                username: '',
                lastName: '',
                firstName: '',
                patr: '',
                status: '',
            });
        } catch {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    }

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ authState, checkAuthStatus, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);