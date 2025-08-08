import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../../context/AuthContext'
import Button from '../Buttons'
import Input from '../Input'
import debug from '../../utils/debug'

let socket

export const Chat = () => {
    const backendUrl = import.meta.env.VITE_API_URL
    const debugMode = import.meta.env.VITE_DEBUG

    if (!socket) {
        socket = io(backendUrl)
    }

    const { authState } = useAuth()

    const [roomInput, setRoomInput] = useState('')
    const [room, setRoom] = useState('general')
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
        : socket.id

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }
        setSocketId(socket.id)
        socket.emit('join_room', room)
        loadMessages(room)

        const handleConnect = () => {
            debug.log(`Connected to Socket.IO with ID: ${socket.id}`)
            setSocketId(socket.id)
        }

        const handleReceiveMessage = (data) => {
            setMessages(prev => [...prev, {
                text: data.message,
                sender: data.sender,
                senderName: data.senderName,
                timestamp: data.timestamp
            }])
        }

        socket.on('connect', handleConnect)
        socket.on('recieve_message', handleReceiveMessage)

        return () => {
            socket.off('connect', handleConnect);
            socket.off('receive_message', handleReceiveMessage)
        }
    }, [room])

    useEffect(() => {
        if (messages.length === 0) {
            loadMessages(room)
        }
    }, [room])

    const loadMessages = async (roomName) => {
        try {
            const res = await fetch(`${backendUrl}/chat/room/${roomName}/messages`)
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
            setMessages([{
                text: `Failed to load messages for room "${roomName}"`,
                type: 'system'
            }])
        }
    }

    const joinRoom = async () => {
        if (roomInput !== '') {
            if (room) {
                socket.emit('leave_room', room)
            }
            socket.emit('join_room', roomInput)
            console.log("Set room", roomInput)

            setRoom(roomInput)
            setRoomInput('')
            setMessages([
                {
                    text: `Joined room: ${roomInput}`,
                    type: 'system'
                }
            ])
            await loadMessages(roomInput)
        }
    }

    const leaveRoom = async () => {
        if (room) {
            socket.emit('leave_room', room);
            setMessages([
                {
                    text: `Left room: ${room}`,
                    type: 'system'
                }
            ]);
            setRoom('general');
            socket.emit('join_room', 'general');
            await loadMessages('general')
        }
    }

    const sendMessage = async () => {
        if (!message.trim()) return

        const timestamp = new Date().toISOString()
        const newMessage = {
            text: message,
            sender: userId,
            senderName: displayName,
            timestamp: new Date().toLocaleTimeString()
        }
        console.log("Sending as:", userId)

        setMessages(prev => [...prev, newMessage])

        socket.emit('send_message', {
            message,
            room,
            sender: userId,
            senderName: displayName,
            timestamp,
        })
        try {

            await fetch(`${backendUrl}/chat/save-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room,
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
        <div
            style={{
                border: '1px solid black',
                height: '350px',
                width: '200px',
                position: 'relative',
                background: '#ffffffaa',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                padding: '5px'
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'aliceblue',
                    border: '1px solid black',
                    borderRadius: '3px',
                    marginBottom: '5px',
                    overflowY: 'scroll'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <span
                        style={{
                            fontSize: '0.5em',
                            width: '100%',
                            overflowWrap: 'break-word'
                        }}
                    >
                        {displayName}
                    </span>

                    <span
                        style={{
                            fontSize: '0.5em',
                            width: '100%',
                            overflowWrap: 'break-word',
                            marginTop: '5px'
                        }}
                    >
                        Room: {room}
                    </span>

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{
                                fontSize: '0.6em',
                                marginTop: '5px',
                                textAlign: msg.sender === userId ? 'right' : 'left',
                                color: msg.type === 'system' ? 'gray' : 'inherit',
                                backgroundColor: msg.sender === userId ? '#68eb269e' : '#bfbfbf9e',
                                alignSelf: msg.sender === userId ? 'flex-end' : 'flex-start',
                                padding: '3px',
                                borderRadius: '4px'
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

            <div
                style={{ display: 'flex' }}
            >
                <Input
                    placeholder='Message'
                    style={{
                        height: '25px',
                        fontSize: '0.7em'
                    }}
                    value={message}
                    onChange={
                        (e) => {
                            setMessage(e.target.value)
                        }
                    }
                />
                <Button
                    text='Send'
                    style={{
                        width: '40px',
                        height: '20px',
                        padding: '0 3px',
                        fontSize: '0.6em',
                        margin: '3px'
                    }}
                    onClick={sendMessage}
                />
            </div>
            <div
                style={{ display: 'flex', marginTop: '5px' }}
            >
                <Input
                    placeholder='Room'
                    style={{
                        height: '25px',
                        fontSize: '0.7em'
                    }}
                    value={roomInput}
                    onChange={
                        (e) => {
                            setRoomInput(e.target.value)
                        }
                    }
                />
                {room === 'general' || room === '' ? (
                    <Button
                        text='Join'
                        style={{
                            width: '40px',
                            height: '20px',
                            padding: '0 3px',
                            fontSize: '0.6em',
                            margin: '3px'
                        }}
                        onClick={joinRoom}
                    />
                ) : (
                    <Button
                        text='Leave room'
                        style={{
                            width: 'fit-content',
                            height: '20px',
                            padding: '0 3px',
                            fontSize: '0.6em',
                            margin: '3px'
                        }}
                        onClick={leaveRoom}
                    />
                )}
            </div>
        </div>
    )
}

export default Chat