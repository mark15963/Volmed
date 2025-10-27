import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { createPortal } from "react-dom"

import UserChat from "../Chat/UserChat"
import AdminChat from "../Chat/AdminChat"
import SideMenu from "./SideMenu"

import debug from "../../utils/debug"

import { Dropdown } from "antd"
import styles from './styles/sideMenu.module.css'

export const ContextMenu = ({ authState, children }) => {
    const [chatVisible, setChatVisible] = useState(false)
    const [sideMenuVisible, setSideMenuVisible] = useState(false)
    const navigate = useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL

    // Hide components when another one is choosen
    useEffect(() => {
        if (sideMenuVisible) {
            setChatVisible(false)
        }
    }, [sideMenuVisible])
    useEffect(() => {
        if (chatVisible) {
            setSideMenuVisible(false)
        }
    }, [chatVisible])

    const handleMenuClick = (e) => {
        switch (e.key) {
            case '1':
                navigate('/dashboard')
                break;
            case '2':
                navigate('/nurse-menu')
                break;
            case '3':
                debug.log(chatVisible ? "Chat hidden" : "Chat visible")
                setChatVisible(!chatVisible)
                break;
            case '4':
                debug.log(sideMenuVisible ? "Menu hidden" : "Menu visible")
                setSideMenuVisible(!sideMenuVisible)
                break;
            case '5':
                const serverUrl = `${apiUrl}/dashboard`
                window.location.href = serverUrl;
                break;
            default:
                break;
        }
    }

    const items = [
        {
            label: 'Панель управления',
            key: '1',
        },
        {
            label: 'Страница медсестер',
            key: '2',
        },
        {
            label: chatVisible ? 'Закрыть чат' : 'Чат',
            key: '3',
        },
        {
            label: sideMenuVisible ? 'Закрыть боковое меню' : 'Боковое меню',
            key: '4',
        },
        {
            label: 'Страница сервера',
            key: '5',
        },
    ];

    return (
        <>
            {sideMenuVisible && !chatVisible && createPortal(
                <div style={{ position: 'absolute', top: '50%', left: 0, zIndex: 1000 }}>
                    <SideMenu />
                </div>,
                document.body
            )}

            {chatVisible && !sideMenuVisible && createPortal(
                <div
                    style={{
                        position: 'absolute',
                        left: '10px',
                        top: '200px',
                        transform: 'translateY(-50%)',
                        marginRight: '20px',
                        zIndex: 1000
                    }}
                >
                    {authState.user.status === "Администратор" ? (
                        <AdminChat />
                    ) : (
                        <Chat />
                    )}

                </div>,
                document.body
            )}

            <Dropdown
                menu={{
                    items,
                    onClick: handleMenuClick,
                }}
                trigger={['contextMenu']}
            >
                {children}
            </Dropdown>
        </>
    )
}
