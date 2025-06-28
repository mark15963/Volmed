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
        username: '',
        isLoading: true
    });

    const yearText = year > 2025
        ? `Volmed 2025 - ${year}`
        : `Volmed ${year}`



    // Check authentication status
    const checkAuthStatus = async () => {
        try {
            console.log('Checking auth status...');

            const response = await axios.get(
                'https://volmed-backend.onrender.com/api/auth/status',
                { withCredentials: true }
            );
            console.log('Auth status response:', response.data);

            setAuthState({
                isAuthenticated: response.data.isAuthenticated,
                username: response.data.user?.username || '',
                isLoading: false
            });

            // If authenticated but no cookies, log the issue
            if (response.data.isAuthenticated && !document.cookie.includes('user')) {
                console.warn('User is authenticated but cookies not found');
            }

        } catch (error) {
            console.error("Auth check error:", error);
            setAuthState({
                isAuthenticated: false,
                username: '',
                isLoading: false
            });
        }
    };

    useEffect(() => {
        checkAuthStatus();

        const handleAuthChange = () => {
            console.log('Auth change event received');
            checkAuthStatus();
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    const handleLogout = async () => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            await axios.post('https://volmed-backend.onrender.com/logout',
                {},
                { withCredentials: true }
            )
            setAuthState({
                isAuthenticated: false,
                username: '',
                isLoading: false
            });
            navigate('/login')
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

    console.log('Current auth state:', authState);
    console.log('All cookies:', document.cookie);

    return (
        <div className={footerStyles.container}>
            <div className={footerStyles.footer}>
                © {yearText}
                <span style={{ margin: '0 10px' }}>
                    {authState.username || 'Not logged in'}
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