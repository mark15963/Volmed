import { useLocation, useNavigate } from "react-router";
import { useCallback, useMemo } from "react";
import { Dropdown } from "antd";

import { useAuth } from "../context/AuthContext"

import Button from "../components/Buttons.tsx"
import Chat from "../components/admin/Chat";
import SideMenu from "../components/admin/SideMenu";
import { ContextMenu } from "../components/admin/ContextMenu";
import logo from '../assets/images/logo.webp'

import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import styles from './styles/header.module.css'


export const Header = (props) => {
    const navigate = useNavigate();
    const { authState, logout } = useAuth();
    const location = useLocation()

    const handleClick = useCallback(() => {
        navigate('/');
    }, [navigate])

    const isLoginPage = useMemo(() => location.pathname === '/login', [location.pathname]);

    const userContainerClass = `${styles.userContainer} ${authState.isAuthenticated ? styles.auth : ''}`

    return (
        <header>
            <div className={styles.content}>
                <img
                    src={logo}
                    alt="Logo"
                    className={styles.logo}
                    onClick={handleClick}
                    loading='eager'
                />
                <h1
                    className={styles.title}
                >
                    <span className={styles.title}>ГБУ «Городская больница</span>
                    <br />
                    <span className={styles.title}>Волновахского района»</span>
                </h1>

                <div className={userContainerClass}>
                    {authState.isAuthenticated && (
                        <>
                            {authState.isAdmin && (
                                <ContextMenu authState={authState}>
                                    <div className={styles.userNameContainer}>
                                        <div className={styles.userNameText}>
                                            {authState.isAuthenticated
                                                ? (`${authState.status}`)
                                                : ''}
                                        </div>
                                        <div className={styles.userNameText}>
                                            {authState.isAuthenticated
                                                ? (`${authState.lastName} ${authState.firstName} ${authState.patr}`)
                                                : ''}
                                        </div>
                                    </div>
                                </ContextMenu>
                            )}

                            {!authState.isAdmin && (
                                <div className={styles.userNameContainer}>
                                    <span className={styles.userNameText}>
                                        {authState.isAuthenticated
                                            ? (`${authState.status}`)
                                            : ''}
                                    </span>
                                    <span className={styles.userNameText}>
                                        {authState.isAuthenticated
                                            ? (`${authState.lastName} ${authState.firstName} ${authState.patr}`)
                                            : ''}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                    <div className={styles.authButton}>
                        {location.pathname !== '/login' && (
                            authState.isAuthenticated ? (
                                <Button
                                    icon="logout"
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
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
        </header>
    )
}

export default Header