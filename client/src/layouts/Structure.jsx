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
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [username, setUsername] = useState('');

    const yearText = year > 2025
        ? `Volmed 2025 - ${year}`
        : `Volmed ${year}`

    const checkAuthCookie = () => {
        const cookies = document.cookie.split(';');
        return cookies.some(cookie =>
            cookie.trim().startsWith('volmed.sid') ||
            cookie.trim().startsWith('user')
        );
    };

    useEffect(() => {
        setIsAuthenticated(checkAuthCookie());
        setIsLoading(false);
    }, []);

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

    useEffect(() => {
        const checkAuth = () => {
            const authCookie = getCookie('volmed.sid');
            const userCookie = getCookie('user');

            setIsAuthenticated(!!authCookie);
            if (userCookie) {
                setUsername(decodeURIComponent(userCookie));
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);
    console.log(checkAuth())

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await axios.post('https://volmed-backend.onrender.com/logout',
                {},
                { withCredentials: true }
            )
            setIsAuthenticated(false);
            setUsername('');
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

    return (
        <div className={footerStyles.container}>
            <div className={footerStyles.footer}>
                © {yearText}
                {username && (
                    <span style={{ margin: '0 10px' }}>
                        {username}
                    </span>
                )}
                {isAuthenticated ? (
                    <Button
                        text='Выход'
                        onClick={handleLogout}
                        disabled={isLoggingOut}
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