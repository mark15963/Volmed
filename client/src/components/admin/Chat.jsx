import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../../context/AuthContext'
import Button from '../Button'
import Input from '../Input'
import debug from '../../utils/debug'

import styles from './styles/Chat.module.scss'
import api from '../../services/api'

let socket

const Chat = () => {
  const backendUrl = import.meta.env.VITE_API_URL

  const { authState } = useAuth()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [socketId, setSocketId] = useState('')
  const messagesEndRef = useRef(null);
  const lastMessageRef = useRef(null)

  const isAuthenticated = authState.isAuthenticated
  const displayName = isAuthenticated
    ? `${authState.user?.lastName || ''} ${authState.user?.firstName || ''} ${authState.user?.patr || ''}`.trim()
    : "Unauthorized person";
  const userId = isAuthenticated
    ? `${authState.user?.lastName}_${authState.user?.firstName}_${authState.user?.patr}` || socket.id
    : socket.id || '';

  const userIdRef = useRef(userId)
  const roomName = `chat_${userId}_admin`;

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  const loadMessages = async (room) => {
    try {
      const response = await api.getChatHistory(room)
      const data = response.data

      const formatted = data.map(msg => ({
        text: msg.message,
        sender: msg.sender,
        senderName: msg.sender_name || 'Unknown',
        timestamp: formatTime(msg.timestamp),
        dbTimestamp: msg.timestamp
      }))

      setMessages(formatted)
    } catch (err) {
      console.error("Failed to load messages:", err)
    }
  }

  const isDuplicateMessage = (newMsg, existingMessages) => {
    return existingMessages.some(existingMsg =>
      existingMsg.text === newMsg.text &&
      existingMsg.sender === newMsg.sender &&
      Math.abs(new Date(existingMsg.dbTimestamp || existingMsg.timestamp) - new Date(newMsg.timestamp)) < 2000
    )
  }

  useEffect(() => {
    if (!socket) socket = io(backendUrl)
    if (!socket.connected) socket.connect()

    socket.emit('join_room', roomName)
    loadMessages(roomName) // Initial load

    const handleConnect = () => {
      debug.log(`Connected to Socket.IO with ID: ${socket.id}`)
      setSocketId(socket.id)
      if (!userIdRef.current) {
        userIdRef.current = socket.id
      }
    }

    const handleReceiveMessage = (data) => {
      const newMessage = {
        text: data.message,
        sender: data.sender,
        senderName: data.senderName,
        timestamp: formatTime(data.timestamp),
        dbTimestamp: data.timestamp
      }

      // Check if this is the same as our last sent message
      const isOwnRecentMessage =
        data.sender === userId &&
        lastMessageRef.current &&
        lastMessageRef.current.text === data.message &&
        Math.abs(new Date(lastMessageRef.current.timestamp) - new Date(data.timestamp)) < 1000

      setMessages(prev => {
        if (!isDuplicateMessage(newMessage, prev) && !isOwnRecentMessage) {
          return [...prev, newMessage]
        }
        return prev
      })
    }

    const handleChatDeleted = (data) => {
      if (data.room === roomName) {
        setMessages([{
          text: "Чат удален администратором.",
          type: 'system',
          timestamp: formatTime(new Date())
        }])
      }
    }

    socket.on('connect', handleConnect)
    socket.on('receive_message', handleReceiveMessage)
    socket.on('chat_deleted', handleChatDeleted)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('receive_message', handleReceiveMessage)
      socket.off('chat_deleted', handleChatDeleted)
    }
  }, [roomName, backendUrl, userId])

  const sendMessage = async () => {
    if (!message.trim()) return

    const timestamp = new Date().toISOString()
    const newMessage = {
      text: message,
      sender: userId,
      senderName: displayName,
      timestamp: formatTime(timestamp),
      dbTimestamp: timestamp
    }

    lastMessageRef.current = newMessage

    // Add message locally
    setMessages(prev => [...prev, newMessage])
    setMessage('')

    // Emit to server
    socket.emit('send_message', {
      message,
      room: roomName,
      sender: userId,
      senderName: displayName,
      timestamp,
    })

    // Save to backend
    try {
      await api.saveMessage({
        room: roomName,
        sender: userId,
        senderName: displayName,
        message,
        timestamp,
      })
    } catch (error) {
      console.error('Failed to send message', error)
    }

    // Clear the last message reference after a short delay
    setTimeout(() => {
      lastMessageRef.current = null
    }, 2000)
  }

  // // Auto-refresh messages every 3 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadMessages(roomName)
  //   }, 3000)
  //   return () => clearInterval(interval)
  // }, [roomName])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={styles.container}>
      <div className={styles.screen}>
        <div className={styles.messageRows}>
          <div className={styles.generalInfo}>
            <span className={styles.info}>
              Служба поддержки
            </span>
          </div>

          {messages.map((msg, i) => (
            <div
              key={i}
              className={styles.messageBox}
              style={{
                textAlign: msg.sender === userId
                  ? 'right'
                  : 'left',
                color: msg.type === 'system'
                  ? 'gray'
                  : 'inherit',
                backgroundColor: msg.sender === userId
                  ? '#68eb269e'
                  : '#bfbfbf9e',
                alignSelf: msg.sender === userId
                  ? 'flex-end'
                  : 'flex-start',
              }}
            >
              {msg.type !== 'system' && (
                <div
                  style={{
                    fontSize: '0.8em'
                  }}
                >
                  {msg.sender === userId
                    ? displayName
                    : msg.senderName || "Unknown"} - {msg.timestamp}
                </div>
              )}
              <div>{msg.text}</div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.messageInputs}>
        <Input
          placeholder='Сообщение'
          className={styles.input}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage()
            }
          }}
        />
        <Button
          text='Отправить'
          style={{
            width: 'fit-content'
          }}
          size='s'
          className={styles.button}
          onClick={sendMessage}
        />
      </div>
    </div>
  )
}

export default Chat