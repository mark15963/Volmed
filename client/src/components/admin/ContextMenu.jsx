import { Dropdown } from "antd"
import { useState, useEffect } from "react"

import debug from "../../utils/debug"

import Chat from "./Chat"
import SideMenu from "./SideMenu"

import styles from './styles/sideMenu.module.css'
import { useNavigate } from "react-router"

export const ContextMenu = ({ authState, children }) => {
    const [chatVisible, setChatVisible] = useState(false)
    const [sideMenuVisible, setSideMenuVisible] = useState(false)
    const navigate = useNavigate()

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
        if (e.key === '1') {
            navigate('/dashboard')
        }
        if (e.key === '2') {
            debug.log(chatVisible ? "Chat hidden" : "Chat visible")
            setChatVisible(!chatVisible)
        }
        if (e.key === '3') {
            debug.log(sideMenuVisible ? "Menu hidden" : "Menu visible")
            setSideMenuVisible(!sideMenuVisible)
        }
    }

    const items = [
        {
            label: 'Dashboard',
            key: '1',
        },
        {
            label: chatVisible ? 'Close chat' : 'Show chat',
            key: '2',
        },
        {
            label: sideMenuVisible ? 'Close side menu' : 'Show side menu',
            key: '3',
        },
    ];

    return (
        <>
            {sideMenuVisible && !chatVisible && (
                <div style={{ position: 'absolute', top: '130px', left: 0 }}>
                    <SideMenu />
                </div>
            )}

            {chatVisible && !sideMenuVisible && (
                <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', marginRight: '20px' }}>
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
                {children}
            </Dropdown>
        </>
    )
}