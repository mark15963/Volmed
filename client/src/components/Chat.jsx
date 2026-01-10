import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Input from "./Input";
import Button from "./Button";

const socket = io.connect(import.meta.env.VITE_API_URL_SOCKET)

export default function Chat() {
  const [msg, setMsg] = useState('')
  const [serverMsg, setServerMsg] = useState('')
  const [room, setRoom] = useState('')
  const [joinedRoom, setJoinedRoom] = useState('')

  const sendMessage = () => {
    socket.emit('send_message', {
      message: msg,
      room: joinedRoom
    })
    setMsg('')
    console.log(`Message: ${msg}`)
  }

  const joinRoom = () => {
    if (!room) return
    socket.emit("join_room", room)
    setJoinedRoom(room)
    console.log(`Room: ${room}`)
  }

  useEffect(() => {
    socket.on("connect", () => console.log("Connected:", socket.id));
    socket.on("disconnect", () => console.log("Disconnected"));
    socket.on("connect_error", (err) => console.error("Socket error:", err));
    socket.on("receive_message", (data) => {
      console.log("Received message:", data);
      setServerMsg(data)
    })
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off('reveive_message')
    }
  }, [socket])

  return (
    <div>
      <input
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Room"
        value={room}
      />
      <Button
        onClick={joinRoom}
        text="Join"
      />

      <input
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Message"
        value={msg} />
      <Button
        onClick={sendMessage}
        text="Send"
      />

      <h1>{serverMsg?.message ? `Received: ${serverMsg.message}` : null}</h1>
    </div>
  )
} 