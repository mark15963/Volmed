//#region  ===== IMPORTS =====
import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { getLocalISOTime } from "../utils/time";
import debug from "../utils/debug";
//#endregion

export const useChat = (initialRoomName, currentUserId) => {
  //#region === STATES & REFS ===
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(initialRoomName);
  const [messages, setMessages] = useState([]); // UI
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false); // Admin only
  const [activeChats, setActiveChats] = useState([]);

  const socketRef = useRef(null);
  const lastMessageRef = useRef(null);
  const currentRoomRef = useRef(currentRoom);
  const currentUserIdRef = useRef(currentUserId);
  //#endregion

  //#region === REFS SYNC ===
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);
  //#endregion

  //#region === HELPERS ===
  //normalize incoming payload for UI
  const normalizeIncoming = (data) => ({
    text: data.message ?? data.text ?? "",
    sender: data.sender,
    senderName: data.senderName ?? data.sender_name ?? "Unknown",
    timestamp: data.timestamp ?? new Date().toISOString(),
    room: data.room,
    type: data.type ?? "user",
  });
  //#endregion

  //#region === API LOADERS
  // ADMIN: Load active chats periodically
  useEffect(() => {
    if (currentUserId !== "admin") return undefined;

    let mounted = true;
    const loadActiveChats = async () => {
      try {
        const res = await api.getActiveRooms();
        if (!mounted) return;
        setActiveChats(res.data.rooms || []);
      } catch (err) {
        console.error("Error loading active chats:", err);
      }
    };

    loadActiveChats();
    const interval = setInterval(loadActiveChats, 1000 * 5);

    const cleanup = () => {
      mounted = false;
      clearInterval(interval);
    };

    return cleanup;
  }, [currentUserId]);

  // Load chat history
  const loadMessages = useCallback(async (room = currentRoomRef.current) => {
    if (!room) return;

    setIsLoading(true);
    try {
      const res = await api.getChatHistory(room);
      const normalized = (res.data || []).map((m) => ({
        text: m.message,
        sender: m.sender,
        senderName: m.sender_name ?? "Unknown",
        timestamp: m.timestamp,
        type: m.type ?? "user",
      }));

      setMessages(normalized);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  //#endregion

  //#region === SOCKET SETUP ===
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL_SOCKET, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      debug.log("Socket connected:", socket.id);
      if (currentRoomRef.current) {
        socket.emit("join_room", currentRoomRef.current, (ack) =>
          debug.log("join_room ack:", ack)
        );
      }
    });
    socket.on("disconnect", (reason) =>
      debug.log("Socket disconnected:", reason)
    );

    // Handle received message
    const handleReceiveMessage = (payload) => {
      try {
        const msg = normalizeIncoming(payload);

        // Admin: refresh active chats list
        if (currentUserIdRef.current === "admin") {
          api
            .getActiveRooms()
            .then((res) => setActiveChats(res.data.rooms || []))
            .catch((err) =>
              console.error("Error refreshing active chats:", err)
            );
        }

        // Only add message if it's for the current room
        if (msg.room && msg.room === currentRoomRef.current) {
          const last = lastMessageRef.current;
          if (
            last &&
            last.sender === msg.sender &&
            last.text === msg.text &&
            Math.abs(new Date(last.timestamp) - new Date(msg.timestamp)) < 5000
          ) {
            setMessages((prev) => {
              const idx = prev.findIndex(
                (m) =>
                  m.originalTimestamp &&
                  last.originalTimestamp &&
                  m.originalTimestamp === last.originalTimestamp
              );
              if (idx === -1) return [...prev, msg];
              const copy = [...prev];
              copy[idx] = msg;
              return copy;
            });
          } else {
            setMessages((prev) => [...prev, msg]);
          }
        }
      } catch (err) {
        console.error("handleReceiveMessage error:", err);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.offAny();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);
  //#endregion

  //#region === ROOM CHANGE ===
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    let mounted = true;

    const changeRoom = async () => {
      const newRoom = currentRoom;
      const prevRoom = currentRoomRef.current;

      if (prevRoom === newRoom) {
        if (newRoom && messages.length === 0 && mounted) {
          await loadMessages(newRoom);
        }
        return;
      }

      if (prevRoom) socket.emit("leave_room", prevRoom);

      if (newRoom) {
        socket.emit("join_room", newRoom);
        if (mounted) await loadMessages(newRoom);
      } else {
        if (mounted) setMessages([]);
      }

      currentRoomRef.current = newRoom;
    };

    changeRoom();

    return () => {
      mounted = false;
    };
  }, [currentRoom]);
  //#endregion

  //#region === MESSAGE SENDING ===
  const sendMessage = useCallback(async (text, senderName) => {
    if (!text?.trim()) return;

    const socket = socketRef.current;
    const room = currentRoomRef.current;
    const sender = currentUserIdRef.current;
    const timestamp = getLocalISOTime();

    if (!socket || !room) {
      debug.log("Socket or room missing, abort send");
      return;
    }

    // Prevent rapid duplicates
    const last = lastMessageRef.current;
    if (
      last &&
      last.text === text &&
      Date.now() - (last.originalTimestamp || 0) < 3000
    ) {
      debug.log("Preventing duplicate send");
      return;
    }

    // Optimistic UI
    const optimistic = {
      text,
      sender,
      senderName,
      timestamp,
      room,
      originalTimestamp: Date.now(),
      type: "user",
    };
    lastMessageRef.current = optimistic;
    setMessages((prev) => [...prev, optimistic]); // sets UI obj

    // Emit to socket
    const socketData = {
      message: text,
      room,
      sender,
      senderName,
      timestamp,
    };
    socket.emit("send_message", socketData);

    try {
      // Save to backend
      const res = await api.saveMessage(socketData);
      if (!res.ok) throw new Error(res.message || "Failed to save message");
    } catch (err) {
      console.error("Failed to send message:", err.message || err);
      setMessages((prev) =>
        prev.filter(
          (m) =>
            !(
              m.text === text &&
              m.sender === sender &&
              m.originalTimestamp === optimistic.originalTimestamp
            )
        )
      );
    }

    // Clear lastMessageRef after 5s
    setTimeout(() => (lastMessageRef.current = null), 5000);
  }, []);

  // Handle send message (UI)
  const handleSendMessage = useCallback(
    async (senderName = "Админ") => {
      if (!message?.trim()) return; // Empty?
      const cached = message; // Store current msg
      setMessage(""); // clear input
      await sendMessage(cached, senderName); // Send stores msg
    },
    [message, sendMessage]
  );
  //#endregion

  //#region === ADMIN HELPERS ===
  const joinRoom = useCallback((room) => {
    if (currentUserIdRef.current !== "admin") return;

    setIsLoading(true);
    setCurrentRoom(room);
    setShowChat(true);

    const socket = socketRef.current;
    if (!socket) return;

    if (socket.connected) {
      socket.emit("join_room", room);
    } else {
      const handleConnect = () => {
        socket.emit("join_room", room);
        socket.off("connect", handleConnect); // cleanup
      };
      socket.on("connect", handleConnect);
    }
    setIsLoading(false);
  }, []);

  const deleteChat = useCallback(
    async (room) => {
      if (currentUserIdRef.current !== "admin") return;
      if (!window.confirm("Удалить чат?")) return;

      try {
        await api.deleteChatRoom(room);
        setActiveChats((prev) => prev.filter((r) => r !== room));
        if (currentRoom === room) {
          setCurrentRoom(null);
          setShowChat(false);
          setMessages([]);
        }
      } catch (err) {
        console.error("Error deleting chat:", err);
        alert("Ошибка при удалении");
      }
    },
    [currentRoom]
  );
  //#endregion

  return {
    messages, // UI
    sendMessage, // Socket + DB
    handleSendMessage, // UI clear & -> sendMessage
    isLoading,
    message,
    setMessage,
    currentRoom,
    activeChats,
    showChat,
    joinRoom,
    deleteChat,
  };
};

export default useChat;
