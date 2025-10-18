import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import api from "../../services/api";
import { getLocalISOTime } from "../../utils/time";
import debug from "../../utils/debug";

export const useChat = (initialRoomName, currentUserId) => {
  // === STATES ===
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(initialRoomName);
  const [message, setMessage] = useState("");

  // Admin-specific
  const [showChat, setShowChat] = useState(false);
  const [activeChats, setActiveChats] = useState([]);

  // === REFS ===
  const socketRef = useRef(null);
  const lastMessageRef = useRef(null);
  const currentRoomRef = useRef(currentRoom);
  const currentUserIdRef = useRef(currentUserId);

  // keep refs in sync without creating new effects
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // helper: normalize incoming payload
  const normalizeIncoming = (data) => ({
    text: data.message ?? data.text ?? "",
    sender: data.sender,
    senderName: data.senderName ?? data.sender_name ?? "Unknown",
    timestamp: data.timestamp ?? new Date().toISOString(),
    room: data.room,
    type: data.type ?? "user",
  });

  // === ADMIN: Load active chats periodically ===
  useEffect(() => {
    if (currentUserId !== "admin") return;
    let mounted = true;
    const loadActiveChats = async () => {
      try {
        const res = await api.getActiveRooms();
        if (mounted) setActiveChats(res.data.rooms || []);
      } catch (err) {
        console.error("Error loading active chats:", err);
      }
    };

    loadActiveChats();
    const interval = setInterval(loadActiveChats, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [currentUserId]);

  // === LOAD CHAT HISTORY ===
  const loadMessages = useCallback(async (room = currentRoomRef.current) => {
    if (!room) return;
    setIsLoading(true);
    try {
      debug.log(`Loading chat for room: ${room}`);
      const res = await api.getChatHistory(room);
      const normalized = (res.data || []).map((m) => ({
        text: m.message,
        sender: m.sender,
        senderName: m.sender_name || "Unknown",
        timestamp: m.timestamp,
        type: m.type || "user",
      }));
      setMessages(normalized);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // === SOCKET SETUP ===
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.onAny((event, ...args) => {
      debug.log("Socket event:", event, ...activeChats(args || []));
    });

    socket.on("connect", () => {
      debug.log("Socket connected:", socket.id);
      if (currentRoomRef.current) {
        socket.emit("join_room", currentRoomRef.current, (ack) => {
          debug.log("join_room ack:", ack);
        });
      }
      const room = currentRoomRef.current;
      if (room) {
        debug.log("Rejoining current room:", room);
        socket.emit("join_room", room, (ack) =>
          debug.log("join_room ack:", ack)
        );
      }
    });

    socket.on("disconnect", (reason) => {
      debug.log("Socket disconnected:", reason);
    });

    // === HANDLE RECEIVED MESSAGE ===
    const handleReceiveMessage = (payload) => {
      try {
        debug.log("receive_message payload:", payload);
        const normalized = normalizeIncoming(payload);

        // Admin: refresh active chats list
        if (currentUserIdRef.current === "admin") {
          api
            .getActiveRooms()
            .then((res) => setActiveChats(res.data.rooms || []))
            .catch(console.error);
        }

        // Only add message if it's for the current room
        if (normalized.room && normalized.room === currentRoomRef.current) {
          if (
            lastMessageRef.current &&
            lastMessageRef.current.sender === normalized.sender &&
            lastMessageRef.current.text === normalized.text &&
            Math.abs(
              new Date(lastMessageRef.current.timestamp) -
                new Date(normalized.timestamp)
            ) < 5000
          ) {
            sendMessages((prev) => {
              const idx = prev.findIndex(
                (m) =>
                  m.originalTimestamp &&
                  lastMessageRef.current.originalTimestamp &&
                  m.originalTimestamp ===
                    lastMessageRef.current.originalTimestamp
              );
              if (idx === -1) return [...prev, normalized];
              const copy = [...prev];
              copy[idx] = normalized;
              return copy;
            });
          } else {
            setMessages((prev) => [...prev, normalized]);
          }
        }
      } catch (err) {
        console.error("handleReceiveMessage error:", err);
      }
    };

    socket.on("receive_message", (data) => {
      debug.log("🔥 receive_message payload:", data);
      handleReceiveMessage(data);
    });

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.offAny();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loadMessages]);

  // === ROOM CHANGE HANDLER ===
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const newRoom = currentRoom;
    const prevRoom = currentRoomRef.current;

    if (prevRoom === newRoom) {
      if (newRoom && messages.length === 0) loadMessages(newRoom);
      return;
    }

    if (prevRoom) {
      socket.emit("leave_room", prevRoom, (ack) => {
        debug.log("Left room ack:", ack);
      });
    }

    if (newRoom) {
      socket.emit("join_room", newRoom, (ack) => {
        debug.log("Joined room:", ack);
      });
      loadMessages(newRoom);
    } else {
      setMessages([]);
    }

    currentRoomRef.current = newRoom;
  }, [currentRoom, loadMessages, messages.length]);

  // === SEND MESSAGE ===
  const sendMessage = useCallback(async (messageText, senderName) => {
    if (!messageText?.trim()) return;
    const socket = socketRef.current;
    const room = currentRoomRef.current;

    if (!socket || !room) {
      debug.log("Socket or room missing, about send");
      return;
    }

    const timestamp = getLocalISOTime();
    const sender = currentUserIdRef.current;

    // Prevent rapid duplicates
    if (
      lastMessageRef.current &&
      lastMessageRef.current.text === messageText &&
      Date.now() - (lastMessageRef.current.originalTimestamp || 0) < 3000
    ) {
      debug.log("Preventing duplicate send");
      return;
    }

    // Optimistic UI
    const optimistic = {
      text: messageText,
      sender,
      senderName,
      timestamp,
      room,
      originalTimestamp: Date.now(),
      type: "user",
    };
    lastMessageRef.current = optimistic;
    setMessages((prev) => [...prev, optimistic]);

    // Emit to server
    socket.emit("send_message", {
      message: messageText,
      room,
      sender,
      senderName,
      timestamp,
    });

    // Save to backend
    try {
      await api.saveMessage({
        room,
        sender,
        senderName,
        message: messageText,
        timestamp,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) =>
        prev.filter(
          (m) =>
            !(
              m.text === messageText &&
              m.sender === currentUserNow &&
              m.originalTimestamp === optimistic.originalTimestamp
            )
        )
      );
    }

    // Clear lastMessageRef after 5s
    setTimeout(() => {
      lastMessageRef.current = null;
    }, 5000);
  }, []);

  // === HANDLE SEND MESSAGE (UI) ===
  const handleSendMessage = useCallback(
    async (senderName = "Админ") => {
      if (!message?.trim()) return;
      const cached = message;
      setMessage("");
      await sendMessage(cached, senderName);
      debug.log("Message sent:", cached);
    },
    [message, sendMessage]
  );

  // === ADMIN: JOIN ROOM HELPER ===
  const joinRoom = useCallback((room) => {
    debug.log("Joining room:", JSON.stringify(room));

    if (currentUserIdRef.current !== "admin") return;

    debug.log("Admin joining room:", room);
    setIsLoading(true);
    setCurrentRoom(room);
    setShowChat(true);

    const socket = socketRef.current;
    if (socket) {
      if (socket.connected) {
        debug.log("Emitting join_room immediately:", room);
        socket.emit("join_room", room, (ack) =>
          debug.log("join_room ack:", ack)
        );
      } else {
        debug.log("Socket not ready, will join after connect:", room);
        const handleConnect = () => {
          debug.log("Joining room after connect:", room);
          socket.emit("join_room", room, (ack) =>
            debug.log("join_room ack (after connect):", ack)
          );
          socket.off("connect", handleConnect); // cleanup
        };
        socket?.on("connect", handleConnect);
      }
    }
    setIsLoading(false);
  }, []);

  // === ADMIN: DELETE ROOM ===
  const deleteChat = async (room) => {
    if (currentUserId !== "admin") return;
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
  };

  return {
    messages,
    sendMessage,
    handleSendMessage,
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
