//#region  ===== IMPORTS =====
import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
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
    if (!room) {
      debug.log("loadMessages: No room provided");
      return;
    }

    debug.log(`loadMessages: Loading history for room: ${room}`);
    setIsLoading(true);

    try {
      const res = await api.getChatHistory(room);
      debug.log(`loadMessages: Received ${(res.data || []).length} messages`);

      const normalized = (res.data || []).map((m) => ({
        text: m.message,
        sender: m.sender,
        senderName: m.sender_name ?? "Unknown",
        timestamp: m.timestamp,
        type: m.type ?? "user",
      }));

      setMessages(normalized);
      debug.log("loadMessages: Messages set successfully");
    } catch (err) {
      console.error("Failed to load messages:", err);
      debug.log("loadMessages: Error loading messages", err);
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
        } else {
          debug.log("Message ignored - not for current room");
        }
      } catch (err) {
        debug.error("handleReceiveMessage error:", err);
      }
    };

    const handleChatDeleted = (deletedRoom) => {
      debug.log(`Chat deleted notification received: ${deletedRoom}`);

      // If this user is in the deleted room, clear their messages
      if (currentRoomRef.current === deletedRoom) {
        debug.log(`Clearing messages for deleted room: ${deletedRoom}`);
        // Add a system message before clearing
        const systemMessage = {
          text: "Чат был удален администратором",
          sender: "system",
          senderName: "Система",
          timestamp: new Date().toISOString(),
          room: deletedRoom,
          type: "system",
        };

        setMessages([systemMessage]);

        // Clear the room after a delay
        setTimeout(() => {
          setMessages([]);
          if (currentUserIdRef.current !== "admin") {
            setCurrentRoom(null);
          }
        }, 3000); // Show system message for 3 seconds
      }

      // Update active chats list for admin
      if (currentUserIdRef.current === "admin") {
        setActiveChats((prev) => prev.filter((room) => room !== deletedRoom));
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("chat_deleted", handleChatDeleted);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("chat_deleted", handleChatDeleted);
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

    const setupInitialRoom = async () => {
      if (currentRoom && messages.length === 0 && mounted) {
        await loadMessages(currentRoom);
      }
    };

    setupInitialRoom();

    return () => {
      mounted = false;
    };
  }, []);
  //#endregion

  //#region === MESSAGE SENDING ===
  const sendMessage = useCallback(async (text, senderName) => {
    if (!text?.trim()) return;

    const socket = socketRef.current;
    const room = currentRoomRef.current;
    const sender = currentUserIdRef.current;
    const timestamp = new Date().toISOString(); // DB

    if (!socket || !room) {
      debug.log("Socket or room missing, abort send");
      return;
    }

    // Prevent rapid duplicates
    const localTimestamp = Date.now();
    const last = lastMessageRef.current;
    if (
      last &&
      last.text === text &&
      localTimestamp - (last.originalTimestamp || 0) < 3000
    ) {
      debug.log("Preventing duplicate send");
      return;
    }

    // Optimistic UI
    const optimistic = {
      text,
      sender,
      senderName,
      timestamp, // ISO for DB/display
      room,
      originalTimestamp: localTimestamp, // ms for dup check
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
      timestamp, // ISO for DB
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
  const joinRoom = useCallback(
    (room) => {
      if (currentUserIdRef.current !== "admin") return;

      debug.log(
        `joinRoom called with: ${room}, currentRoom: ${currentRoomRef.current}`
      );

      setIsLoading(true);
      const prevRoom = currentRoomRef.current;
      setCurrentRoom(room);
      currentRoomRef.current = room;

      setShowChat(true);

      const socket = socketRef.current;
      if (!socket) {
        setIsLoading(false);
        return;
      }

      const performRoomChange = async () => {
        try {
          // Leave previous room if it exists
          if (prevRoom) {
            socket.emit("leave_room", prevRoom);
            debug.log(`Left room: ${prevRoom}`);
          }

          // Join new room
          socket.emit("join_room", room);
          debug.log(`Joined room: ${room}`);

          // Load messages for the new room
          await loadMessages(room);
        } catch (error) {
          console.error("Error changing rooms:", error);
        } finally {
          setIsLoading(false);
        }
      };

      if (socket.connected) {
        performRoomChange();
      } else {
        const handleConnect = () => {
          performRoomChange();
          socket.off("connect", handleConnect); // cleanup
        };
        socket.on("connect", handleConnect);
      }
    },
    [loadMessages]
  );

  const deleteChat = useCallback(
    async (room) => {
      if (currentUserIdRef.current !== "admin") return;
      if (!window.confirm("Удалить чат?")) return;

      try {
        await api.deleteChatRoom(room);

        const socket = socketRef.current;
        if (socket) {
          socket.emit("chat_deleted", room);
          debug.log(`Emitted chat_deleted event for room: ${room}`);
        }

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
