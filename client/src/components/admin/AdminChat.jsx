import { useEffect, useState } from "react";
import { io } from 'socket.io-client'
import Button from '../Button'
import Input from '../Input'

let socket

const AdminChat = () => {
  const backendUrl = import.meta.env.VITE_API_URL

  if (!socket) socket = io(backendUrl)

  const [activeChats, setActiveChats] = useState([]) // list of userIds
  const [currentRoom, setCurrentRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!socket.connected) socket.connect()

    // load active chats from backend
    fetch(`${backendUrl}/chat/active-rooms`)
      .then((res) => res.json())
      .then((data) => setActiveChats(data.rooms))

    socket.on('receive_message', (data) => {
      if (data.room === currentRoom) {
        setMessages((prev) => [...prev, data])
      }
    })
    return () => {
      socket.off('receive_message')
    }
  }, [currentRoom])

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const fetchMessages = async (room) => {
    if (!room) return
    const res = await fetch(`${backendUrl}/chat/room/${room}/messages`)
    const data = await res.json()
    setMessages(
      data.map((msg) => ({
        text: msg.message,
        sender: msg.sender,
        senderName: msg.sender === 'admin' ? 'Админ' : msg.sender_name,
        timestamp: formatTime(msg.timestamp),
      }))
    )
  }

  const joinRoom = async (room) => {
    if (currentRoom) socket.emit('leave_room', currentRoom)
    socket.emit('join_room', room)
    setCurrentRoom(room)
    // load chat history
    await fetchMessages(room)
  }

  const sendMessage = async () => {
    if (!message.trim() || !currentRoom) return
    const timestamp = new Date().toISOString()

    const newMsg = {
      text: message,
      sender: 'admin',
      senderName: 'Админ',
      timestamp: formatTime(timestamp),
    }
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

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(currentRoom)
    }, 3000)

    return () => clearInterval(interval)
  }, [currentRoom])

  return (
    <div
      style={{
        display: "flex",
      }}
    >
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
            onClick={() => {
              joinRoom(room)
            }}
          />
        ))}

      </div>

      {/* Right: current chat */}
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
            marginBottom: '10px'
          }}
        >
          {currentRoom || 'Выбрать чат'}
        </div>
        <div
          style={{
            fontSize: '0.8em',
            marginBottom: '10px',
            background: !currentRoom ? '#bbb' : '#fff',
            padding: '5px',
            minHeight: 'fit-content',
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                margin: '5px 0',
                wordBreak: 'break-word'
              }}
            >
              <strong>{m.senderName}:</strong> {m.text} ({m.timestamp})
            </div>
          ))}
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
    </div>
  )
}

export default AdminChat