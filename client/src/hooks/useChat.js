// Used for UserChat and AdminChat components

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { getLocalISOTime } from "../utils/time";

export const useChat = (initialRoomName, currentUserId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Admin states
  const [showChat, setShowChat] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(initialRoomName);
  const [message, setMessage] = useState("");

  const socketRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Load active chats
  useEffect(() => {
    const loadActiveChats = async () => {
      try {
        const response = await api.getActiveRooms();
        setActiveChats(response.data.rooms || []);
      } catch (error) {
        console.error("Error loading active chats:", error);
      }
    };

    loadActiveChats();
    const interval = setInterval(loadActiveChats, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async (room = currentRoom) => {
    if (!room) return;
    try {
      setIsLoading(true);
      const res = await api.getChatHistory(room);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentRoom) return;
    // Initialize socket
    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;

    socket.connect();
    socket.emit("join_room", currentRoom);
    loadMessages(currentRoom);

    // Socket listener for incoming messages
    const handleReceiveMessage = (data) => {
      const newMsg = { ...data };

      const isOwnRecentMessage =
        data.sender === currentUserId &&
        lastMessageRef.current &&
        lastMessageRef.current.text === data.message &&
        Math.abs(
          new Date(lastMessageRef.current.timestamp) - new Date(data.timestamp)
        ) < 5000;

      if (!isOwnRecentMessage) setMessages([...prev, newMsg]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.disconnect();
    };
  }, [currentRoom, currentUserId]);

  const sendMessage = async (messageText, senderName) => {
    if (!messageText.trim() || !socketRef.current) return;

    if (
      lastMessageRef.current?.text === messageText &&
      Date.now() - lastMessageRef.current.originalTimestamp < 3000
    ) {
      console.log("🟡 Preventing duplicate send");
      return;
    }

    const timestamp = getLocalISOTime();
    const optimisticTimestamp = new Date().toString();

    const newMessage = {
      text: messageText,
      sender: currentUserId,
      senderName,
      timestamp: optimisticTimestamp,
      originalTimestamp: Date.now(),
    };
    lastMessageRef.current = newMessage;

    // Optimistically add the message to the UI
    setMessages((prev) => [...prev, newMessage]);

    // Emit to server
    socketRef.current.emit("send_message", {
      message: messageText,
      room: currentRoom,
      sender: currentUserId,
      senderName,
      timestamp,
    });

    // Save to backend
    try {
      await api.saveMessage({
        room: currentRoom,
        sender: currentUserId,
        senderName,
        message: messageText,
        timestamp,
      });
    } catch (err) {
      console.error("Failed to send message", err);
      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter(
          (msg) =>
            !(
              msg.text === messageText &&
              msg.sender === currentUserId &&
              msg.originalTimestamp === newMessage.originalTimestamp
            )
        )
      );
    }

    // Clear the last message reference after a short delay
    setTimeout(() => {
      lastMessageRef.current = null;
    }, 5000);
  };

  // ADMIN-ONLY: load active chats
  useEffect(() => {
    if (currentUserId !== "admin") return;

    const loadActiveChats = async () => {
      try {
        const res = await api.getActiveRooms();
        setActiveChats(res.data.rooms || []);
      } catch (err) {
        console.error("Error loading active chats:", err);
      }
    };
    loadActiveChats();

    const interval = setInterval(loadActiveChats, 3000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  // ADMIN-ONLY: join a chat
  const joinRoom = async (room) => {
    if (currentUserId !== "admin") return;
    setIsLoading(true);
    setShowChat(true);
    setCurrentRoom(room);
    await new Promise((res) => setTimeout(res, 300));
    setIsLoading(false);
  };

  const handleSendMessage = async (senderName = "Админ") => {
    if (!message.trim() || !currentRoom) return;
    let cachedMsg = message;
    setMessage("");
    await sendMessage(cachedMsg, senderName);
  };

  // ADMIN-ONLY: delete chat
  const deleteChat = async (room) => {
    if (currentUserId !== "admin") return;
    if (!window.confirm("Удалить чат?")) return;

    try {
      await api.deleteChatRoom(room);
      // Update UI state
      setActiveChats((prev) => prev.filter((r) => r !== room));

      // If we're currently viewing the deleted chat, clear it
      if (currentRoom == room) {
        setCurrentRoom(null);
        setShowChat(false);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Ошибка при удалении");
    }
  };

  return {
    // Shared
    messages,
    sendMessage,
    isLoading,

    // Admin
    activeChats,
    currentRoom,
    showChat,
    message,
    setMessage,
    joinRoom,
    handleSendMessage,
    deleteChat,
  };
};
