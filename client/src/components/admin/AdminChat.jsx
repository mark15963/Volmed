import { useEffect, useState } from "react";
import { io } from 'socket.io-client'

import api from "../../services/api";

import Button from '../Button'
import Input from '../Input'
import { SpinLoader } from "../Loading/SpinLoader";

import styles from './styles/Chat.module.scss'

let socket

const AdminChat = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [activeChats, setActiveChats] = useState([]) // list of userIds
  const [currentRoom, setCurrentRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const backendUrl = import.meta.env.VITE_API_URL

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!socket) socket = io(backendUrl)

  // Load active chats
  useEffect(() => {
    if (!socket.connected) socket.connect()

    const loadActiveChats = async () => {
      await api.getActiveRooms()
        .then((response) => setActiveChats(response.data.rooms))
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
      setMessages(
        data.map((msg) => ({
          text: msg.message,
          sender: msg.sender,
          senderName: msg.sender === 'admin' ? 'Админ' : msg.sender_name,
          timestamp: msg.timestamp,
        }))
      )
    } catch (err) {
      console.error("Messages fetching error:", err)
    }
  }

  // Update messages
  useEffect(() => {
    if (!currentRoom) return

    // Set up interval for refreshing messages for the current room
    const messagesInterval = setInterval(() => {
      fetchMessages(currentRoom)
    }, 3000)

    return () => clearInterval(messagesInterval)
  }, [currentRoom])

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
    const timestamp = new Date().toISOString()

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

  return (
    <div className={styles.adminContainer}>
      {/* Left: list of chats */}
      <div className={styles.leftSide}>
        <div className={styles.title}>
          Активные чаты
        </div>
        {activeChats.map((room) => (
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Button
              key={room}
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
                userSelect: 'none'
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
              <SpinLoader color="blue" size='30px' />
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={styles.message}
                // style={{
                //   left: m.senderName !== "Админ" ? '0' : '10px',
                //   right: m.senderName === "Админ" ? '0' : '10px'
                // }}
                >
                  <strong>{m.senderName}:</strong> {m.text} <span className={styles.time}>({formatTime(m.timestamp)})</span>
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