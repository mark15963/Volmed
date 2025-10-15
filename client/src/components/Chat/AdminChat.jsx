import { useEffect, useState } from "react";
import { io } from 'socket.io-client'


import Button from '../Button'
import Input from "../Input";
import { SpinLoader } from "../Loading/SpinLoader";

import api from "../../services/api";
import { formatChatTime, getLocalISOTime } from "../../utils/time";

import styles from './styles/Chat.module.scss'

let socket

const AdminChat = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [activeChats, setActiveChats] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const backendUrl = import.meta.env.VITE_API_URL

  if (!socket) socket = io(backendUrl)

  // Load active chats
  useEffect(() => {
    if (!socket.connected) socket.connect()

    const loadActiveChats = async () => {
      try {
        const response = await api.getActiveRooms()
        setActiveChats(response.data.rooms)
      } catch (error) {
        console.error("Error loading active chats:", error)
      }
    }
    loadActiveChats()

    // Socket event listener for new messages
    const handleReceiveMessage = (data) => {
      if (data.room === currentRoom) {
        setMessages((prev) => [...prev, {
          text: data.message,
          sender: data.sender,
          senderName: data.senderName,
          timestamp: data.timestamp,
        }])
      }
    }
    socket.on('receive_message', handleReceiveMessage)

    // Set up interval for refreshing active chats
    const activeChatsInterval = setInterval(loadActiveChats, 3000)
    return () => {
      socket.off('receive_message', handleReceiveMessage)
      clearInterval(activeChatsInterval)
    }
  }, [currentRoom, backendUrl])

  // Fetch messages
  const fetchMessages = async (room) => {
    if (!room) return
    try {
      const response = await api.getChatHistory(room)
      const data = response.data

      const formated = data.map((msg) => ({
        text: msg.message,
        sender: msg.sender,
        senderName: msg.sender === 'admin' ? 'Админ' : msg.sender_name,
        timestamp: msg.timestamp,
      }))

      setMessages(formated)
    } catch (err) {
      console.error("Messages fetching error:", err)
    }
  }

  const joinRoom = async (room) => {
    setIsLoading(true)
    try {
      if (currentRoom) socket.emit('leave_room', currentRoom)
      socket.emit('join_room', room)
      setCurrentRoom(room)
      // Load chat history
      await fetchMessages(room)
    } catch (err) {
      console.error("Error joining room:", err)
    } finally {
      setIsLoading(false)
      setShowChat(true)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !currentRoom) return
    const timestamp = getLocalISOTime()

    const newMsg = {
      text: message,
      sender: 'admin',
      senderName: 'Админ',
      timestamp: timestamp,
    }

    // Optimistically add the message to the UI
    setMessages((prev) => [...prev, newMsg])

    socket.emit('send_message', {
      message,
      room: currentRoom,
      sender: 'admin',
      senderName: 'Админ',
      timestamp,
    })

    await api.saveMessage({
      room: currentRoom,
      sender: 'admin',
      senderName: 'Админ',
      message,
      timestamp,
    })

    setMessage('')
  }

  const deleteChat = async (room) => {
    if (!window.confirm("Удалить чат?")) return

    try {
      await api.deleteChatRoom(room)
      // Update UI state
      setActiveChats(prev => prev.filter(chatRoom => chatRoom !== room))

      //Emit socket event to notify the user
      socket.emit('chat_deleted', { room })

      // If we're currently viewing the deleted chat, clear it
      if (currentRoom == room) {
        setCurrentRoom(null)
        setMessages([])
        setShowChat(false)
        socket.emit('leave_room', room)
      }
    } catch (err) {
      console.error("Error deleting chat:", err)
      alert("Ошибка при удалении")
    }
  }


  // Update messages
  useEffect(() => {
    if (!currentRoom) return

    const messagesInterval = setInterval(() => {
      fetchMessages(currentRoom)
    }, 3000)

    return () => clearInterval(messagesInterval)
  }, [currentRoom])

  return (
    <div className={styles.adminContainer}>
      {/* Left: list of chats */}
      <div className={styles.leftSide}>
        <div className={styles.title}>
          Активные чаты
        </div>
        {activeChats.map((room) => (
          <div key={room} style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Button
              text={room}
              style={{
                maxWidth: '100px',
                fontSize: '0.5em',
                wordBreak: 'break-word'
              }}
              onClick={() => joinRoom(room)}
            />
            <div
              style={{
                fontSize: '0.8em',
                fontWeight: '700',
                color: 'red',
                userSelect: 'none',
                cursor: 'pointer'
              }}
              onClick={() => deleteChat(room)}
              title="Удалить чат"
            >
              X
            </div>
          </div>
        ))}
      </div>

      {/* Right: current chat */}
      {showChat && (
        <div className={styles.rightSide}>
          <div className={styles.title}>
            {currentRoom || 'Выбрать чат'}
          </div>
          <div
            className={styles.screen}
            style={{
              background: !currentRoom ? '#bbb' : '#fff',
            }}
          >
            {isLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%'
              }}>
                <SpinLoader color="blue" size='30px' />
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={styles.message}
                  style={{
                    textAlign: m.senderName !== "Админ" ? 'left' : 'right',
                  }}
                >
                  <strong>{m.senderName}:</strong> {m.text} <span className={styles.time}>({formatChatTime(m.timestamp)})</span>
                </div>
              ))
            )}
          </div>

          {currentRoom && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage()
                  }
                }}
              />
              <Button
                text="Send"
                onClick={sendMessage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminChat