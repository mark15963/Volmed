//#region ===== IMPORTS ===== 
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

import UserChatWindow from './components/UserChatWindow'
import useChat from '../../hooks/useChat'

import debug from '../../utils/debug'
import api from '../../services/api'

import styles from './styles/Chat.module.scss'
//#endregion

const UserChat = () => {
  const { authState } = useAuth()
  const isAuthenticated = authState.isAuthenticated

  const displayName = isAuthenticated
    ? `${authState.user?.lastName || ''} ${authState.user?.firstName || ''} ${authState.user?.patr || ''}`.trim()
    : "Unauthorized person";

  const currentUserId = authState.user?.id || displayName
  const roomName = `chat_${currentUserId}_admin`;

  const [message, setMessage] = useState('')
  const { messages, sendMessage } = useChat(roomName, currentUserId)

  const handleSend = async () => {
    if (!message.trim()) return
    await sendMessage(message, displayName)
    setMessage("")
  }

  return (
    <UserChatWindow
      messages={messages}
      onSendMessage={handleSend}
      message={message}
      setMessage={setMessage}
      currentUserId={currentUserId}
      displayName={displayName}
    />
  )
}

export default UserChat