import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../../context";
import { ContextMenu } from "../../../components/admin/ContextMenu";

import styles from '../../styles/header.module.scss'
import Button from "../../../components/Button";
import { useCallback, useState } from "react";

const UserContainer = () => {
  const { authState, logout } = useAuth();
  const location = useLocation()
  const navigate = useNavigate();

  const [isButtonLoading, setIsButtonLoading] = useState(false)

  const userContainerClass = `${styles.userContainer} ${!authState.isAuthenticated ? styles.userContainerHidden : ''}`.trim()

  const handleLogout = useCallback(async () => {
    setIsButtonLoading(true)
    await logout()
    setIsButtonLoading(false)
    navigate('/')
  }, [logout, navigate])

  const handleLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  return (
    <>
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
    </>
  )
}

export default UserContainer