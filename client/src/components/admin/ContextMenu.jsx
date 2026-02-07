//#region ===== IMPORTS =====
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { createPortal } from "react-dom"

import UserChat from "../Chat/components/UserChat"
import AdminChat from "../Chat/components/AdminChat"
import SideMenu from "./SideMenu"

import debug from "../../utils/debug"

import { Dropdown } from "antd"
import styles from './styles/sideMenu.module.css'
//#endregion

const apiUrl = import.meta.env.VITE_API_URL

export const ContextMenu = ({ authState, children }) => {
  const [sideMenuVisible, setSideMenuVisible] = useState(false)
  const navigate = useNavigate()

  // Hide components when another one is choosen
  useEffect(() => {
    if (sideMenuVisible) {
      // setChatVisible(false)
    }
  }, [sideMenuVisible])

  const handleMenuClick = (e) => {
    switch (e.key) {
      case '1':
        navigate('/dashboard')
        break;
      case '2':
        debug.log("Goto nurses' (admin) menu")
        navigate('/nurse-menu')
        break;
      case '3':
        debug.log(sideMenuVisible ? "Menu hidden" : "Menu visible")
        setSideMenuVisible(!sideMenuVisible)
        break;
      case '4':
        const serverUrl = `${apiUrl}/dashboard`
        window.location.href = serverUrl; // Server dashboard
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
      label: sideMenuVisible ? 'Скрыть боковое меню' : 'Боковое меню',
      key: '3',
    },
    {
      label: 'Страница сервера',
      key: '4',
    },
  ];

  return (
    <>
      {/* SIDE MENU */}
      {sideMenuVisible && createPortal(
        <div style={{ position: 'absolute', top: '50%', left: 0, zIndex: 1000 }}>
          <SideMenu />
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
