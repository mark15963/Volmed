import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const AuthContext = createContext({
    authState: {
        isAuthenticated: false,
        isLoading: true,
    }
});

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isLoading: true,
        username: '',
        lastName: '',
        firstName: '',
        status: '',
    });

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get(
                `${apiUrl}/status`,
                {
                    withCredentials: true,
                }
            );

            setAuthState({
                isAuthenticated: response.data.isAuthenticated,
                isLoading: false,
                username: response.data.user?.username || '',
                lastName: response.data.user?.lastName || '',
                firstName: response.data.user?.firstName || '',
                status: response.data.user?.status || '',
            });

        } catch (error) {
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                username: '',
                lastName: '',
                firstName: '',
                status: '',
            });
        }
    };

    const logout = async () => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            await axios.post(`${apiUrl}/logout`,
                {},
                { withCredentials: true }
            )
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                username: '',
                lastName: '',
                firstName: '',
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