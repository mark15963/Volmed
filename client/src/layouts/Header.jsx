import { useLocation, useNavigate } from "react-router";
import { useCallback, memo, useEffect, useState } from "react";

import { useAuth, useConfig } from "../context"

import Button from "../components/Button"
import { ContextMenu } from "../components/admin/ContextMenu";

import styles from './styles/header.module.scss'

import debug from "../utils/debug";

export const Header = memo(() => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { title, color, logo, isLoading } = useConfig()
  const location = useLocation()
  const [isButtonLoading, setIsButtonLoading] = useState(false)

  const handleClick = useCallback(() => {
    debug.log("Clicked on logo")
    navigate('/');
  }, [navigate])

  const handleLogout = useCallback(async () => {
    setIsButtonLoading(true)
    await logout()
    setIsButtonLoading(false)
    navigate('/')
  }, [logout, navigate])

  const handleLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const userContainerClass = `${styles.userContainer} ${!authState.isAuthenticated ? styles.userContainerHidden : ''}`.trim()

  const logoSource = logo || null

  useEffect(() => {
    if (logoSource) {
      const img = new Image()
      img.src = logoSource
    }
  }, [logoSource])

  return (
    <header>
      <div
        style={{
          backgroundColor: color.header,
        }}
        className={styles.content}
      >
        <img
          src={logoSource}
          alt="Logo"
          className={styles.logo}
          onClick={handleClick}
          loading='eager'
          draggable='false'
          onError={(e) => {
            console.log("Can not load logo")
          }}
        />
        <div
          className={styles.title}
          onClick={handleClick}
        >
          {title.title}
        </div>
        {/* ===== Title on print ===== */}
        {/* <div
          className={styles.titlePrint}
        >
          <span className={styles.titlePrintText}>
            {title.top}
          </span>
          <span className={styles.titlePrintText}>
            {title.bottom}
          </span>
          <br />
          <span className={styles.titleStreetPrint}>Волноваха, Железнодорожный переулок</span>
        </div> */}
        {/* ========================== */}

        <div style={{ width: "100%" }} />
        <div className={userContainerClass}>
          {authState.isAuthenticated && (
            <>
              {/* Context menu access for admin */}
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
              {/* Disable access to context menu for non-admin users */}
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
                  onClick={handleLogout}
                  loading={isButtonLoading}
                  loadingText='Выход...'
                />
              ) : (
                <Button
                  text="Вход"
                  icon="login"
                  onClick={handleLogin}
                />
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
})

export default Header
