import { Routes, Route, useNavigate, useLocation } from "react-router"
import React, { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Dropdown } from "antd";

import { useAuth } from "../context/AuthContext"

//----- PAGES -----
const Main = lazy(() => import('../pages/main/Main.jsx'));
const SearchResults = lazy(() => import('../pages/searchResults/SearchRes.jsx'));
const List = lazy(() => import('../pages/patientsList/List.jsx'));
const RegisterPatient = lazy(() => import('../pages/register/RegisterPatient.jsx'));
const EditPatient = lazy(() => import('../pages/edit/EditPatient.jsx'));
const Login = lazy(() => import('../pages/login/Login.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

//----- COMPONENTS -----
import Button from "../components/Buttons.tsx"
import logo from '../assets/images/герб_ямала.png'
import Chat from "../components/Chat";

//----- STYLES -----
import headerStyles from './header.module.css'
import footerStyles from './footer.module.css'
import SideMenu from "../components/admin/SideMenu.jsx";
import adminStyles from '../components/admin/sideMenu.module.css'
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";



export const Header = (props) => {
    const navigate = useNavigate();
    const { authState, logout } = useAuth();
    const location = useLocation()

    const handleClick = useCallback(() => {
        navigate('/');
    }, [navigate])

    const isLoginPage = useMemo(() => location.pathname === '/login', [location.pathname]);

    const userContainerClass = `${headerStyles.userContainer} ${authState.isAuthenticated ? headerStyles.auth : ''}`

    return (
        <div className={headerStyles.container}>
            <div className={headerStyles.content}>
                <img
                    src={logo}
                    alt="Logo"
                    className={headerStyles.logo}
                    onClick={handleClick}
                    loading='lazy'
                />
                <h1 className={headerStyles.title} onClick={handleClick}>
                    <span className={headerStyles.title}>ГБУ «Городская больница</span>
                    <br />
                    <span className={headerStyles.title}>Волновахского района»</span>
                </h1>

                <div className={userContainerClass}>
                    {authState.isAuthenticated && (
                        <div className={headerStyles.userNameContainer}>
                            <span className={headerStyles.userNameText}>
                                {authState.isAuthenticated ? (
                                    `${authState.status}`
                                ) : ''}
                            </span>
                            <span className={headerStyles.userNameText}>
                                {authState.isAuthenticated ? (
                                    `${authState.lastName} ${authState.firstName} ${authState.patr}`
                                ) : ''}
                            </span>
                        </div>
                    )}
                    <div className={headerStyles.authButton}>
                        {location.pathname !== '/login' && (
                            authState.isAuthenticated ? (
                                <Button
                                    icon="logout"
                                    onClick={() => { logout(); navigate('/'); }}
                                    loading={authState.isLoading}
                                />
                            ) : (
                                <Button
                                    text="Вход"
                                    icon="login"
                                    onClick={() => navigate('/login')}
                                />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Content = () => {
    const { authState } = useAuth()
    const [chatVisible, setChatVisible] = useState(false)
    const [sideMenuVisible, setSideMenuVisible] = useState(false)


    const handleMenuClick = (e) => {
        if (e.key === '1') {
            setChatVisible(!chatVisible)
        }
        if (e.key === '2') {
            setSideMenuVisible(!sideMenuVisible)
        }
    }

    const items = [
        {
            label: chatVisible ? 'Close chat' : 'Show chat',
            key: '1',
        },
        {
            label: sideMenuVisible ? 'Close side menu' : 'Show side menu',
            key: '2',
        },
    ];

    return (
        <>
            {authState.isAdmin &&
                <div className={adminStyles.sideMenu}>
                    <SideMenu />
                </div>
            }

            {chatVisible && (
                <div style={{ marginRight: '20px' }}>
                    <Chat />
                </div>
            )}

            <Dropdown
                menu={{
                    items,
                    onClick: handleMenuClick,
                }}
                trigger={['contextMenu']}
            >
                <div>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path='/' element={<Main />} />
                        <Route path='/patients' element={<List />} />
                        <Route path="/search" loader element={<SearchResults />} />
                        <Route path="/search/:id" element={<SearchResults />} />
                        <Route path="/register" element={<RegisterPatient />} />
                        <Route path="/edit/:id" element={<EditPatient />} />
                        <Route path="/*" element={<NotFound />} />
                    </Routes>
                </div>
            </Dropdown>

        </>
    )
}

export const Footer = () => {
    const year = new Date().getFullYear()
    const navigate = useNavigate();
    const location = useLocation();

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
