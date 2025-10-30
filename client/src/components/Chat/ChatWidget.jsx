import { useState, useRef, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import UserChat from "./UserChat";
import AdminChat from "./AdminChat";
import Button from "../Button";
import { useAuth } from "../../context";

import styles from './styles/chatWidget.module.scss'
import debug from "../../utils/debug";

export const ChatWidget = memo(() => {
  const [chatVisible, setChatVisible] = useState(false)
  const chatRef = useRef(null)
  const buttonRef = useRef(null)
  const clickOutsideEnabled = useRef(false)

  const { authState } = useAuth()

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
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }

    debug.log(`Chat visible: ${chatVisible}`)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside);
    }
  }, [chatVisible])

  if (!authState.isAuthenticated) return null

  return (
    <>
      <div ref={buttonRef}>
        <Button
          onClick={handleChatToggle}
          onTouchEnd={handleChatToggle}
          text='Чат'
          className={styles.chatButton}
        />
      </div>

      {chatVisible && createPortal(
        <div
          ref={chatRef}
          className={styles.chatContainer}
        >
          {authState.user.status === "admin"
            ? <AdminChat />
            : <UserChat />
          }
        </div>,
        document.body
      )}
    </>
  )
})

export default ChatWidget