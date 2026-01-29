// Used in Content.jsx

import React, { useState, useEffect, useRef } from "react";

import styles from "./networkNotification.module.scss";

type ConnectionStatus =
  | "online"
  | "offline"
  | "server-error"
  | "timeout"
  | "reconnecting";

interface OfflineFallbackProps {
  status?: ConnectionStatus;
}

/**
 * Usage
 * -----
 * For costum messages of connection error use:
 * ```jsx
 * if (!res.ok) {
 *   window.dispatchEvent(
 *     new CustomEvent('connection-status', { detail: 'server-error' })
 *   )
 * }
 * ```
 *
 */
const OfflineFallback: React.FC<OfflineFallbackProps> = ({
  status: forceStatus,
}) => {
  const [status, setStatus] = useState<ConnectionStatus>(
    navigator.onLine ? "online" : "offline",
  );
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);
  const [animation, setAnimation] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showStatus = (newStatus: ConnectionStatus) => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus(newStatus);
    setIsOffline(
      newStatus === "offline" ||
        newStatus === "server-error" ||
        newStatus === "timeout",
    );
    setIsVisible(true);
    setAnimation(styles.slideIn);

    let displayDuration = 3000;
    if (
      newStatus === "offline" ||
      newStatus === "server-error" ||
      newStatus === "timeout"
    )
      displayDuration = Infinity; // never auto-hide offline
    if (newStatus === "online") displayDuration = 2000; // fade out online quickly

    // Auto-hide for transient statuses (not offline)
    if (displayDuration !== Infinity) {
      timeoutRef.current = setTimeout(() => {
        setAnimation(styles.slideOut);
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          setAnimation("");
        }, 400); // animation duration
      }, displayDuration);
    }
  };

  /** React to prop changes (optional forced status) */
  useEffect(() => {
    if (forceStatus) showStatus(forceStatus);
  }, [forceStatus]);

  /** listen to window events */
  useEffect(() => {
    const handleOffline = () => showStatus("offline");
    const handleOnline = () => showStatus("online");
    const handleServerError = (e: CustomEvent) => {
      const detail = e.detail as ConnectionStatus;
      showStatus(detail);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener(
      "connection-status",
      handleServerError as EventListener,
    );

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener(
        "connection-status",
        handleServerError as EventListener,
      );
    };
  }, []);

  if (!isVisible) return null;

  const messageMap: Record<ConnectionStatus, string> = {
    online: "✅ В сети",
    offline: "⚠️ Отключен от сети",
    "server-error": "❌ Ошибка сервера",
    timeout: "⏱️ Тайм-аут соединения",
    reconnecting: "🔄 Попытка переподключения",
  };

  return (
    <div className={`${styles.container} ${animation}`} data-status={status}>
      {messageMap[status]}
    </div>
  );
};

export default OfflineFallback;
