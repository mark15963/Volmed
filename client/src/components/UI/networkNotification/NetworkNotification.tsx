// Used in Content.jsx
import { useState, useEffect, useRef, useCallback } from "react";

import styles from "./NetworkNotification.module.scss";

import type { ConnectionStatus } from "@custom-types";
import type { OfflineFallbackProps } from "@interfaces";

import { useConnectionEvents } from "@hooks/useConnectionEvents";

const OFFLINE_FAMILY: readonly ConnectionStatus[] = [
  "offline",
  "server-error",
  "timeout",
  "reconnecting",
];

const MESSAGES: Record<ConnectionStatus, string> = {
  online: "✅ В сети",
  offline: "⚠️ Отключен от сети",
  "server-error": "❌ Ошибка сервера",
  timeout: "⏱️ Тайм-аут соединения",
  reconnecting: "🔄 Попытка переподключения",
};

const NOTIFICATION_DURATION = 2000;

/**
 * NetworkNotification
 * -------------------
 * Manages notification state, timers, animations, and rendering.
 */
const NetworkNotification: React.FC<OfflineFallbackProps> = ({
  status: forceStatus,
}) => {
  const [status, setStatus] = useState<ConnectionStatus>(
    navigator.onLine ? "online" : "offline",
  );

  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animation, setAnimation] = useState("");

  const statusRef = useRef<ConnectionStatus>(status);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStatusRef = useRef<ConnectionStatus | null>(null);

  /**
   * Clears all pending notification timers.
   */
  const clearTimers = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  /**
   * Updates the connection status and controls the notification.
   */
  const showStatus = useCallback(
    (newStatus: ConnectionStatus) => {
      // f the status hasn't changed, the function returns without doing anything.
      if (newStatus === statusRef.current) return;

      // Existing notification timers are cleared.
      clearTimers();

      // The new status is stored in statusRef
      statusRef.current = newStatus;

      if (isVisible) {
        pendingStatusRef.current = newStatus;
        setIsTransitioning(true);
        setAnimation(styles.transitionOut);
        return;
      }

      setStatus(newStatus);
      setIsVisible(true);
      setAnimation(styles.slideIn);
    },
    [clearTimers, isVisible],
  );

  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;

      const isSlideIn =
        animation === styles.slideIn || animation === styles.transitionIn;

      const isSlideOut =
        animation === styles.slideOut || animation === styles.transitionOut;

      if (isSlideIn) {
        if (isTransitioning) {
          setIsTransitioning(false);
        }

        if (!OFFLINE_FAMILY.includes(status)) {
          hideTimerRef.current = setTimeout(() => {
            setAnimation(styles.slideOut);
            hideTimerRef.current = null;
          }, NOTIFICATION_DURATION);
        }

        return;
      }

      if (isSlideOut) {
        const nextStatus = pendingStatusRef.current;

        if (nextStatus !== null) {
          pendingStatusRef.current = null;
          setStatus(nextStatus);
          setAnimation(styles.transitionIn);
        } else {
          setIsVisible(false);
          setAnimation("");
        }
      }
    },
    [animation, isTransitioning, status],
  );

  /**
   * Subscribe to browser connectivity and custom connection events.
   */
  useConnectionEvents({
    onStatusChange: showStatus,
  });

  /** React to prop changes (optional forced status) */
  useEffect(() => {
    if (forceStatus) showStatus(forceStatus);
  }, [forceStatus, showStatus]);

  /**
   * Clear pending timers when the component unmounts.
   */
  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.container} ${animation}`}
      data-status={status}
      onAnimationEnd={handleAnimationEnd}
    >
      {MESSAGES[status]}
    </div>
  );
};

export default NetworkNotification;
