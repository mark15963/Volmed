import { Dropdown } from "antd";

import Chat from "./components/Chat";
import SideMenu from "./components/admin/SideMenu";

import { Header, Content, Footer } from './layouts/Structure'
import { AuthProvider, useAuth } from './context/AuthContext'

import './App.css'
import { useEffect, useState } from "react";
import debug from "./utils/debug";


export const App = () => {
  const { authState } = useAuth()
  const [chatVisible, setChatVisible] = useState(false)
  const [sideMenuVisible, setSideMenuVisible] = useState(false)

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
      setChatVisible(!chatVisible)
      debug.log("Chat visible")
    }
    if (e.key === '2') {
      setSideMenuVisible(!sideMenuVisible)
      debug.log("Menu visible")
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
      <AuthProvider>
        <header>
          <Header />
        </header>

        {sideMenuVisible && (
          !chatVisible && (
            <div style={{ position: 'absolute', top: '130px', left: 0 }}>
              <SideMenu />
            </div>
          )
        )}

        {chatVisible && (
          !sideMenuVisible && (
            <div style={{ position: 'fixed', left: 0, top: '100px', marginRight: '20px' }}>
              <Chat />
            </div>
          )
        )}
        <Dropdown
          menu={{
            items,
            onClick: handleMenuClick,
          }}
          trigger={['contextMenu']}
        >
          <main>
            <Content />
          </main>
        </Dropdown>

        <footer>
          <Footer />
        </footer>

      </AuthProvider>
    </>
  )
}

export default App