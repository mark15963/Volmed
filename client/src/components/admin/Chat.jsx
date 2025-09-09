import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../../context/AuthContext'
import Button from '../Button'
import Input from '../Input'
import debug from '../../utils/debug'

import styles from './styles/Chat.module.scss'

let socket

const Chat = () => {
  const backendUrl = import.meta.env.VITE_API_URL

  if (!socket) {
    socket = io(backendUrl)
  }

  const { authState } = useAuth()

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [socketId, setSocketId] = useState('')
  const messagesEndRef = useRef(null);

  const isAuthenticated = authState.isAuthenticated
  const displayName = isAuthenticated
    ? `${authState.user?.lastName || ''} ${authState.user?.firstName || ''} ${authState.user?.patr || ''}`.trim()
    : "Unauthorized person";
  const userId = isAuthenticated
    ? `${authState.user?.lastName}_${authState.user?.firstName}_${authState.user?.patr}` || socket.id
    : socket.id;

  const roomName = `chat_${userId}_admin`;

  useEffect(() => {
    if (!socket.connected) socket.connect()
    setSocketId(socket.id)

    socket.emit('join_room', roomName)
    loadMessages(roomName)

    const handleConnect = () => {
      debug.log(`Connected to Socket.IO with ID: ${socket.id}`)
      setSocketId(socket.id)
    }

    const handleReceiveMessage = (data) => {
      setMessages(prev => [
        ...prev,
        {
          text: data.message,
          sender: data.sender,
          senderName: data.senderName,
          timestamp: data.timestamp
        },
      ])
    }

    socket.on('connect', handleConnect)
    socket.on('receive_message', handleReceiveMessage)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('receive_message', handleReceiveMessage)
    }
  }, [roomName])

  const loadMessages = async (room) => {
    try {
      const res = await fetch(`${backendUrl}/chat/room/${room}/messages`)
      const data = await res.json()
      const formatted = data.map(msg => ({
        text: msg.message,
        sender: msg.sender,
        senderName: msg.sender_name || 'Unknown',
        timestamp: new Date(msg.timestamp).toLocaleTimeString()
      }))
      if (formatted) debug.log("Messages loaded")
      setMessages(formatted)
    } catch (err) {
      console.error("Failed to load messages:", err)
      setMessages([
        {
          text: `Failed to load messages for room "${room}"`,
          type: 'system'
        },
      ])
    }
  }
  useEffect(() => {
    if (messages.length === 0) {
      loadMessages(roomName)
    }
  }, [roomName])

  const sendMessage = async () => {
    if (!message.trim()) return

    const timestamp = new Date().toISOString()
    const newMessage = {
      text: message,
      sender: userId,
      senderName: displayName,
      timestamp: new Date().toLocaleTimeString()
    }
    debug.log("Sending as:", userId)

    setMessages(prev => [...prev, newMessage])

    socket.emit('send_message', {
      message,
      room: roomName,
      sender: userId,
      senderName: displayName,
      timestamp,
    })

    try {
      await fetch(`${backendUrl}/chat/save-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: roomName,
          sender: userId,
          senderName: displayName,
          message,
          timestamp,
        })
      })
    } catch (error) {
      console.error('Failed to send message', error)
    }
    setMessage('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.screen}>
        <div className={styles.messageRows}>
          <div className={styles.generalInfo}>
            <span className={styles.info}>{displayName}</span>
            <span className={styles.info}>Room: {roomName}</span>
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
                <div style={{ fontSize: '0.8em' }}>
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
          placeholder='Message'
          className={styles.input}
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <Button
          text='Send'
          size='s'
          className={styles.button}
          onClick={sendMessage}
        />
      </div>
    </div>
  )
}

export default Chat