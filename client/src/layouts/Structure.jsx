import { Routes, Route, useNavigate } from "react-router"
import { useEffect, useState } from 'react'
import { Main } from '../pages/main/Main.jsx'
import { SearchResults } from "../pages/searchResults/SearchRes.jsx"
import { List } from "../pages/patientsList/List.jsx"
import { RegisterPatient } from "../pages/register/RegisterPatient.jsx"
import { EditPatient } from "../pages/edit/EditPatient.jsx"
import { Login } from "../pages/auth/Login.jsx"

import logo from '../assets/images/герб_ямала.png'

import headerStyles from './header.module.css'
import footerStyles from './footer.module.css'

import Button from "../components/Buttons.jsx"

export const Header = (props) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const localServer = 'http://localhost:5000'

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${localServer}/api/check-auth`, {
                    credentials: 'include'
                })
                const data = await res.json()
                setIsAuthenticated(data.isAuthenticated)
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
            }
        }
        checkAuth();
    }, [navigate, localServer])

    const handleLogoClick = () => {
        navigate(`/`);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${localServer}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
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
                {isAuthenticated && (
                    <form onSubmit={handleLogout} style={{ width: 'fit-content' }}>
                        <Button type='submit' text='Выход' />
                    </form>
                )}
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
            <Route path='/' element={<Main />} />
            <Route path="/login" element={<Login />} />
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
    const yearText = year > 2025
        ? `Volmed 2025 - ${year}`
        : `Volmed ${year}`

    return (
        <div className={footerStyles.container}>
            <div className={footerStyles.footer}>
                © {yearText}
            </div>
        </div>
    )
}