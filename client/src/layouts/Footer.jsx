import { useLocation, useNavigate } from 'react-router';
import Chat from '../components/admin/Chat';
import Button from '../components/Button';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext'

import styles from './styles/footer.module.scss'
import AdminChat from '../components/admin/AdminChat';

export const Footer = () => {
    const year = new Date().getFullYear()
    const navigate = useNavigate();
    const location = useLocation();
    const [chatVisible, setChatVisible] = useState(false)

    const { authState } = useAuth()

    const yearText = year > 2025
        ? `Volmed 2025 - ${year}`
        : `Volmed ${year}`

    const handleClick = (e) => {
        setChatVisible(!chatVisible)
    }

    return (
        <footer>
            <div className={styles.content}>
                © {yearText}
            </div>
            {authState.isAuthenticated &&
                <Button
                    onClick={handleClick}
                    text='Чат'
                    style={{
                        height: 'fit-content',
                        padding: '5px 10px'
                    }}
                />
            }
            {authState.isAuthenticated && chatVisible && createPortal(
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
        </footer>
    )
}

export default Footer