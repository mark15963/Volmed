import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { createPortal } from "react-dom"

import Chat from "./Chat"
import SideMenu from "./SideMenu"

import debug from "../../utils/debug"

import { Dropdown } from "antd"
import styles from './styles/sideMenu.module.css'

export const ContextMenu = ({ authState, children }) => {
    const [chatVisible, setChatVisible] = useState(false)
    const [sideMenuVisible, setSideMenuVisible] = useState(false)
    const navigate = useNavigate()

    // Hide components when anotherone is choosen
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
                debug.log(chatVisible ? "Chat hidden" : "Chat visible")
                setChatVisible(!chatVisible)
                break;
            case '3':
                debug.log(sideMenuVisible ? "Menu hidden" : "Menu visible")
                setSideMenuVisible(!sideMenuVisible)
                break;
            case '4':
                const serverUrl = import.meta.env.VITE_ENV === 'production'
                    ? 'https://volmed-backend.onrender.com/api/dashboard'
                    : 'http://localhost:5000/api/dashboard';
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
            label: chatVisible ? 'Закрыть чат' : 'Чат',
            key: '2',
        },
        {
            label: sideMenuVisible ? 'Закрыть боковое меню' : 'Боковое меню',
            key: '3',
        },
        {
            label: 'Страница сервера',
            key: '4',
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
                    <Chat />
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
