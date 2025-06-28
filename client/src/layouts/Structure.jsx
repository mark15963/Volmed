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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [username, setUsername] = useState('Not logged it');

    const yearText = year > 2025
        ? `Volmed 2025 - ${year}`
        : `Volmed ${year}`

    const getCookie = (name) => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null;
    };

    // Check authentication status
    const checkAuthStatus = () => {
        const authCookie = getCookie('volmed.sid');
        const userCookie = getCookie('user');

        const isAuth = !!authCookie;
        setIsAuthenticated(isAuth);

        if (userCookie) {
            setUsername(decodeURIComponent(userCookie));
        } else {
            setUsername('');
        }
        return isAuth;
    };

    // Check auth on mount and set up interval for updates
    useEffect(() => {
        // Initial check
        checkAuthStatus();

        // Set up interval to check auth status periodically
        const intervalId = setInterval(checkAuthStatus, 5000);

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await axios.post('https://volmed-backend.onrender.com/logout',
                {},
                { withCredentials: true }
            )
            checkAuthStatus(); // Force re-check auth status
            navigate('/login')
        } catch (error) {
            console.error("Error logging out:", error);
        } finally {
            setIsLoggingOut(false);
        }
    }

    if (isLoading) {
        return (
            <div className={footerStyles.container}>
                <div className={footerStyles.footer}>
                    © {yearText}
                    {/* Show loading state or nothing while checking auth */}
                </div>
            </div>
        );
    }
    console.log(username)

    return (
        <div className={footerStyles.container}>
            <div className={footerStyles.footer}>
                © {yearText}
                <span style={{ margin: '0 10px' }}>
                    {username || 'Not logged in'}
                </span>
                {isAuthenticated ? (
                    <Button
                        text='Выход'
                        onClick={handleLogout}
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