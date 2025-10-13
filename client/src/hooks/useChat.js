// Used for UserChat component

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

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

    // Initial load
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

  // Auto-refresh messages every 3 seconds as a fallback
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [roomName]);

  const sendMessage = async (messageText, senderName) => {
    if (!messageText.trim() || !socketRef.current) return;

    const timestamp = new Date().toISOString();
    const newMessage = {
      text: messageText,
      sender: currentUserId,
      senderName,
      timestamp,
    };
    lastMessageRef.current = newMessage;

    // Add message locally
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
    }

    // Clear the last message reference after a short delay
    setTimeout(() => {
      lastMessageRef.current = null;
    }, 2000);
  };

  return { messages, sendMessage };
};
