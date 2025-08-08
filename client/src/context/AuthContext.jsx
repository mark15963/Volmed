import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import api from "../services/api";
import debug from "../utils/debug";

const apiUrl = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: true,
        user: null
    });
    const navigate = useNavigate()

    // Check if user authenticated. If not => login page
    const checkAuthStatus = useCallback(async () => {
        try {
            const { data } = await api.status();
            const isAdmin = ['admin', 'Администратор'].includes(data.user?.status)

            setAuthState({
                isAuthenticated: data.isAuthenticated,
                isAdmin,
                isLoading: false,
                user: data.user
            });

            return data.isAuthenticated
        } catch (error) {
            console.error('Auth check error:', error);
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                user: null
            });
            return false
        }
    }, [])
    useEffect(() => {
        const checkAndRedirect = async () => {
            const isAuthenticated = await checkAuthStatus()
            if (!isAuthenticated) navigate('/login');
        }
        checkAndRedirect();
    }, [checkAuthStatus, navigate]);

    // Login function
    const login = useCallback(async (credentials) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            await api.postLogin(credentials);
            const isAuth = await checkAuthStatus();

            if (!isAuth) {
                throw new Error('Authentication failed after login');
            }

        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw error;  // Let the Login component handle the error
        }
    }, [checkAuthStatus]);

    // Logout function
    const logout = useCallback(async () => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            await api.logout()
        } finally {
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                user: null,
            });
            navigate('/login');
        }
    }, [navigate])

    // Auth check every 10 min
    useEffect(() => {
        const interval = setInterval(checkAuthStatus, 1000 * 60 * 10);
        return () => clearInterval(interval);
    }, [checkAuthStatus]);

    return (
        <AuthContext.Provider value={{ authState, checkAuthStatus, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}