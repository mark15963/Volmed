import { Routes, Route, useNavigate, useLocation } from "react-router"
import { lazy, Suspence } from "react"

import { useAuth } from "../context/AuthContext.jsx"

import Main from "../pages/main/Main.jsx"
//const Main = lazy(() => import("../pages/main/Main.jsx"))
import SearchResults from "../pages/searchResults/SearchRes.jsx"
import List from "../pages/patientsList/List.jsx"
import RegisterPatient from "../pages/register/RegisterPatient.jsx"
import EditPatient from "../pages/edit/EditPatient.jsx"
import Login from "../pages/login/Login.jsx"
import NotFound from "../pages/NotFound.jsx"

import logo from '../assets/images/герб_ямала.png'
import Button from "../components/Buttons.tsx"

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
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export const Footer = () => {
    const year = new Date().getFullYear()
    const navigate = useNavigate();
    const location = useLocation();
    const { authState, logout } = useAuth();

    const yearText = year > 2025
        ? `Volmed 2025 - ${year}`
        : `Volmed ${year}`

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
                {location.pathname !== '/login' && (
                    authState.isAuthenticated ? (
                        <Button
                            text='Выход'
                            onClick={() => { logout(); navigate('/'); }}
                            disabled={authState.isLoading}
                        />
                    ) : (
                        <Button
                            text='Вход'
                            onClick={() => navigate('/login')}
                        />
                    )
                )}
            </div>
        </div>
    )
}
