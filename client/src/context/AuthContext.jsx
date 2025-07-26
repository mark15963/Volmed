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

    const checkAuthStatus = useCallback(async () => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            const { data } = await api.status();

            const isAdmin = ['admin', 'Администратор'].includes(data.user?.status)

            setAuthState({
                isAuthenticated: data.isAuthenticated,
                isAdmin: data.isAdmin,
                isLoading: false,
                user: data.user
            });

            if (!data.isAuthenticated) {
                navigate('/login');
            }

            return data.isAuthenticated
        } catch (error) {
            console.error('Auth check error:', error);
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                user: null
            });
            navigate('/login');
            return false
        }
    }, [navigate])

    const login = useCallback(async (credentials) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            const { data } = await api.postLogin(credentials);
            const isAuthenticated = await checkAuthStatus();

            if (isAuthenticated) {
                return { success: true, user: data.user };
            }
            throw new Error('Authentication failed after login');
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, [checkAuthStatus]);

    const logout = useCallback(async () => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            await api.logout()
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                user: null,
            });
            debug.log("Logged out successfully")
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            // Even if logout API fails, clear local auth state
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                user: null,
            });
            navigate('/login');
        }
    }, [navigate])

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Periodic auth check
    useEffect(() => {
        const interval = setInterval(checkAuthStatus, 300000); // 5 minutes
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