import { Routes, Route, useNavigate } from "react-router"
import axios from "axios"
import { useState } from "react"

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
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const year = new Date().getFullYear()
    const yearText = year > 2025
        ? `Volmed 2025 - ${year}`
        : `Volmed ${year}`
    const handleClick = async () => {
        setIsLoggingOut(true);
        try {
            const res = await axios.post('https://volmed-backend.onrender.com/logout',
                {},
                { withCredentials: true }
            )
            // window.location.href = 'https://volmed-backend.onrender.com';
            navigate('/login')
        } catch (error) {
            console.error("Error logging out:", error);
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <div className={footerStyles.container}>
            <div className={footerStyles.footer}>
                © {yearText}
                <Button text='Выход' onClick={handleClick} disabled={isLoggingOut} />
            </div>
        </div>
    )
}