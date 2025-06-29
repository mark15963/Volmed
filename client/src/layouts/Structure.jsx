import { Routes, Route, useNavigate } from "react-router"
import axios from "axios"
import { useState, useEffect } from "react"

import { Main } from '../pages/main/Main.jsx'
import { SearchResults } from "../pages/searchResults/SearchRes.jsx"
import { List } from "../pages/patientsList/List.jsx"
import { RegisterPatient } from "../pages/register/RegisterPatient.jsx"
import { EditPatient } from "../pages/edit/EditPatient.jsx"
import { Login } from "../pages/login/Login.jsx"

import logo from '../assets/images/герб_ямала.png'
import Button from "../components/Buttons.jsx"

import headerStyles from './header.module.css'
import footerStyles from './footer.module.css'

const apiUrl = import.meta.env.VITE_API_URL

export const Header = (props) => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <div className={headerStyles.container}>
            <div className={headerStyles.content}>
                <img
                    src={logo}
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                />
                <h1 className={headerStyles.title}>{props.title}</h1>
                <img
                    src={logo}
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        </div>
    )
}

export const Content = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path='/' element={<Main />} />
            <Route path='/patients' element={<List />} />
            <Route path="/search" loader element={<SearchResults />} />
            <Route path="/search/:id" element={<SearchResults />} />
            <Route path="/register" element={<RegisterPatient />} />
            <Route path="/edit/:id" element={<EditPatient />} />
        </Routes>
    )
}

export const Footer = () => {
    const year = new Date().getFullYear()
    const navigate = useNavigate();
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isLoading: true,
        username: '',
        lastName: '',
        firstName: '',
        status: '',
    });

    const yearText = year > 2025
        ? `Volmed 2025 - ${year}`
        : `Volmed ${year}`

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get(
                `${apiUrl}/api/auth/status`,
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
            console.error("Auth check error:", error);
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

    useEffect(() => {
        checkAuthStatus();

        const handleAuthChange = () => checkAuthStatus();
        window.addEventListener('authChange', handleAuthChange);

        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    const handleLogout = async () => {
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
            navigate('/')
        } catch (error) {
            console.error("Error logging out:", error);
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    }

    if (authState.isLoading) {
        return (
            <div className={footerStyles.container}>
                <div className={footerStyles.footer}>
                    © {yearText}
                </div>
            </div>
        );
    }

    return (
        <div className={footerStyles.container}>
            <div className={footerStyles.footer}>
                © {yearText}
                <span style={{ margin: '0 10px' }}>
                    {authState.isAuthenticated ? (
                        `${authState.status} ${authState.lastName} ${authState.firstName} `
                    ) : ''}
                </span>
                {authState.isAuthenticated ? (
                    <Button
                        text='Выход'
                        onClick={handleLogout}
                        disabled={authState.isLoading}
                    />
                ) : (

                    <Button
                        text='Вход'
                        onClick={() => navigate('/login')}
                    />
                )}
            </div>
        </div>
    )
}