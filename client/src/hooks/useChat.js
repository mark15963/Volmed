// Used for UserChat component

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { formatChatTime, getLocalISOTime } from "../utils/time";

export const useChat = (roomName, currentUserId) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const lastMessageRef = useRef(null);

  const loadMessages = async () => {
    try {
      const res = await api.getChatHistory(roomName);
      setMessages(
        res.data.map((msg) => ({
          text: msg.message,
          sender: msg.sender,
          senderName: msg.sender_name || "Unknown",
          timestamp: msg.timestamp,
        }))
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    // Initialize socket
    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;

    socket.connect();
    socket.emit("join_room", roomName);
    loadMessages();

    // Socket listener for incoming messages
    const handleReceiveMessage = (data) => {
      const newMsg = { ...data };

      const isOwnRecentMessage =
        data.sender === currentUserId &&
        lastMessageRef.current &&
        lastMessageRef.current.text === data.message &&
        Math.abs(
          new Date(lastMessageRef.current.timestamp) - new Date(data.timestamp)
        ) < 1000;

      setMessages((prev) => (isOwnRecentMessage ? prev : [...prev, newMsg]));
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.disconnect();
    };
  }, [roomName, currentUserId]);

  const sendMessage = async (messageText, senderName) => {
    if (!messageText.trim() || !socketRef.current) return;

    const timestamp = getLocalISOTime();
    const optimisticTimestamp = new Date().toString();

    const newMessage = {
      text: messageText,
      sender: currentUserId,
      senderName,
      timestamp: optimisticTimestamp,
    };
    lastMessageRef.current = newMessage;

    // Optimistically add the message to the UI
    setMessages((prev) => [...prev, newMessage]);

    // Emit to server
    socketRef.current.emit("send_message", {
      message: messageText,
      room: roomName,
      sender: currentUserId,
      senderName,
      timestamp,
    });

    // Save to backend
    try {
      await api.saveMessage({
        room: roomName,
        sender: currentUserId,
        senderName,
        message: messageText,
        timestamp,
      });
    } catch (error) {
      console.error("Failed to send message", error);
      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            !(
              msg.text === messageText &&
              msg.sender === currentUserId &&
              Math.abs(new Date(msg.timestamp) - new Date(timestamp)) < 1000
            )
        )
      );
    }

    // Clear the last message reference after a short delay
    setTimeout(() => {
      lastMessageRef.current = null;
    }, 2000);
  };

  return { messages, sendMessage };
};
