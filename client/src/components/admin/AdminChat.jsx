import { useEffect, useState } from "react";
import { io } from 'socket.io-client'
import Button from '../Button'
import Input from '../Input'
import { SpinLoader } from "../Loading/SpinLoader";

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

  useEffect(() => {
    if (!socket.connected) socket.connect()

    // load active chats from backend
    const loadActiveChats = () => {
      fetch(`${backendUrl}/chat/active-rooms`)
        .then((res) => res.json())
        .then((data) => setActiveChats(data.rooms))
        .catch(err => console.error("Error loading active chatcs:", err))
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

  const fetchMessages = async (room) => {
    if (!room) return
    try {
      const res = await fetch(`${backendUrl}/chat/room/${room}/messages`)
      const data = await res.json()
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

    await fetch(`${backendUrl}/chat/save-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: currentRoom,
        sender: 'admin',
        senderName: 'Админ',
        message,
        timestamp,
      }),
    })

    setMessage('')
  }

  return (
    <div style={{ display: "flex" }}>
      {/* Left: list of chats */}
      <div
        style={{
          background: '#bbb',
          width: 'fit-content',
          borderRight: '1px solid #ccc',
          borderRadius: '8px 0 0 8px',
          padding: '10px'
        }}
      >
        <div
          style={{
            fontSize: '1em',
            fontWeight: '700',
            marginBottom: '10px'
          }}
        >
          Активные чаты
        </div>
        {activeChats.map((room) => (
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
        ))}
      </div>

      {/* Right: current chat */}
      {showChat && (
        <div
          style={{
            background: '#bbb',
            width: 'fit-content',
            maxWidth: '400px',
            borderRadius: '0 8px 8px 0',
            padding: '10px'
          }}
        >
          <div
            style={{
              fontSize: '1em',
              fontWeight: '700',
              marginBottom: '10px',
              width: 'fit-content',
            }}
          >
            {currentRoom || 'Выбрать чат'}
          </div>
          <div
            style={{
              fontSize: '0.8em',
              marginBottom: '10px',
              background: !currentRoom ? '#bbb' : '#fff',
              padding: '2px 5px',
              minHeight: '200px',
              borderRadius: '6px'
            }}
          >
            {isLoading ? (
              <SpinLoader color="blue" size='30px' />
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    margin: '5px 0',
                    wordBreak: 'break-word'
                  }}
                >
                  <strong>{m.senderName}:</strong> {m.text} ({formatTime(m.timestamp)})
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