import { useLocation, useNavigate } from "react-router";
import { useCallback, useMemo } from "react";

import { useAuth, useConfig } from "../context"

import Button from "../components/Button"
import Chat from "../components/admin/Chat";
import SideMenu from "../components/admin/SideMenu";
import { ContextMenu } from "../components/admin/ContextMenu";

import logo from '../assets/images/logo.webp'

import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import styles from './styles/header.module.scss'

import debug from "../utils/debug";

export const Header = (props) => {
    const navigate = useNavigate();
    const { authState, logout } = useAuth();
    const { title, color } = useConfig()
    const location = useLocation()

    const handleClick = useCallback(() => {
        debug.log("Clicked on logo")
        navigate('/');
    }, [navigate])

    const isLoginPage = useMemo(() => location.pathname === '/login', [location.pathname]);

    const userContainerClass = `${styles.userContainer} ${!authState.isAuthenticated ? styles.userContainerHidden : ''}`.trim()

    return (
        <header>
            <div
                style={{
                    backgroundColor: color.header,
                }}
                className={styles.content}
            >
                <img
                    src={logo}
                    alt="Logo"
                    className={styles.logo}
                    onClick={handleClick}
                    loading='eager'
                    draggable='false'
                />
                <div
                    className={styles.title}
                >
                    <span className={styles.titleTop}>{title.top}</span>
                    <span className={styles.titleBottom}>{title.bottom}</span>
                </div>
                <div
                    className={styles.titlePrint}
                >
                    <span className={styles.titlePrintText}>{title.top}</span>
                    <span className={styles.titlePrintText}>{title.bottom}</span>
                    <br />
                    <span className={styles.titleStreetPrint}>Волноваха, Железнодорожный переулок</span>
                </div>
                <div className={userContainerClass}>
                    {authState.isAuthenticated && (
                        <>
                            {authState.isAdmin && (
                                <ContextMenu authState={authState}>
                                    <div className={styles.userNameContainer}>
                                        <div className={styles.userNameText}>
                                            {authState.user.status}
                                        </div>
                                        <div className={styles.userNameText}>
                                            {`${authState.user.lastName} ${authState.user.firstName} ${authState.user.patr}`}
                                        </div>
                                    </div>
                                </ContextMenu>
                            )}

                            {!authState.isAdmin && (
                                <div className={styles.userNameContainer}>
                                    <span className={styles.userNameText}>
                                        {authState.user.status}
                                    </span>
                                    <span className={styles.userNameText}>
                                        {`${authState.user.lastName} ${authState.user.firstName} ${authState.user.patr}`}
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
