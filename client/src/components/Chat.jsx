import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import Button from './Buttons'
import Input from './Input'

let socket

export const Chat = () => {
    if (!socket) {
        socket = io('http://localhost:5000')
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
        ? `${authState.lastName} ${authState.firstName} ${authState.patr}`
        : "Unauthorized person";
    const userId = isAuthenticated
        ? `${authState.lastName}_${authState.firstName}_${authState.patr}`
        : socket.id

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log(`Connected to Socket.IO with ID: ${socket.id}`)
            setSocketId(socket.id)
            socket.emit('join_room', 'general')
            loadMessages('general')
        })

        socket.on('receive_message', (data) => {
            setMessages(prev => [...prev, {
                text: data.message,
                sender: data.sender,
                senderName: data.senderName,
                timestamp: data.timestamp
            }])
        })

        return () => {
            socket.off('connect');
            socket.off('receive_message')
        }
    }, [])

    const loadMessages = async (roomName) => {
        try {
            const res = await fetch(`http://localhost:5000/api/chat/room/${roomName}/messages`)
            const data = await res.json()
            const formatted = data.map(msg => ({
                text: msg.message,
                sender: msg.sender,
                senderName: msg.sender_name || 'Unknown',
                timestamp: new Date(msg.timestamp).toLocaleTimeString()
            }))
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
        if (!message || message == '') return

        const timestamp = new Date().toISOString()
        const localTimestamp = new Date().toLocaleTimeString()

        const newMessage = {
            text: message,
            sender: userId,
            senderName: displayName,
            timestamp: localTimestamp
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

            await fetch('http://localhost:5000/api/chat/save-message', {
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
                height: '170px',
                width: '150px',
                position: 'relative',
                left: 0,
                background: '#ffffffaa',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                top: '50%',
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
            </div>
            <div>
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
            </div>
        </div>
    )
}

export default Chat