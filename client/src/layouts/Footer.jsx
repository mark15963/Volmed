import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';

import Chat from '../components/admin/Chat/UserChat';
import AdminChat from '../components/admin/Chat/AdminChat';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext'

import styles from './styles/footer.module.scss'


export const Footer = () => {
  const year = new Date().getFullYear()
  const navigate = useNavigate();
  const location = useLocation();
  const [chatVisible, setChatVisible] = useState(false)
  const chatRef = useRef(null)
  const buttonRef = useRef(null)
  const clickOutsideEnabled = useRef(false)

  const { authState } = useAuth()

  const yearText = year > 2025
    ? `Volmed 2025 - ${year}`
    : `Volmed ${year}`

  const handleChatToggle = () => {
    setChatVisible(prev => !prev)
    // Disable click outside detection briefly after opening
    clickOutsideEnabled.current = false
    setTimeout(() => {
      clickOutsideEnabled.current = true
    }, 300)
  }

  // Close chat when clicking outside (but not on the button)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!clickOutsideEnabled.current) return

      if (chatRef.current &&
        !chatRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)) {
        setChatVisible(false)
      }
    }

    if (chatVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside);
    }
  }, [chatVisible])


  return (
    <footer>
      <div className={styles.content}>
        © {yearText}
      </div>

      {authState.isAuthenticated &&
        <div ref={buttonRef}>
          <Button
            onClick={handleChatToggle}
            text='Чат'
            style={{
              height: 'fit-content',
              padding: '5px 10px'
            }}
          />
        </div>
      }

      {authState.isAuthenticated && chatVisible && createPortal(
        <div
          ref={chatRef}
          style={{
            display: 'flex',
            position: 'fixed',
            transform: 'none',
            bottom: '70px',
            right: '10px',
            zIndex: 1000
          }}
        >

          {authState.user.status === "Администратор"
            ? <AdminChat />
            : <Chat />
          }

        </div>,
        document.body
      )}

    </footer>
  )
}

export default Footer
