import { useEffect } from "react";
import { io } from "socket.io-client";

import type { ConnectionStatus } from "@custom-types";
import debug from "@utils/debug";
import { dispatchConnectionStatus } from "@/utils/connectionEvent";

interface UseConnectionEventsOptions {
  onStatusChange: (status: ConnectionStatus) => void;
}

const VALID_STATUSES: readonly ConnectionStatus[] = [
  "online",
  "offline",
  "server-error",
  "timeout",
  "reconnecting",
];

/**
 * useConnectionEvents()
 * ---------------------
 * Monitors browser connectivity, application connection events,
 * and the backend's Socket.IO connection.
 * @example
 * useConnectionEvents({
 *   onStatusChange: showStatus,
 * });
 */
export const useConnectionEvents = ({
  onStatusChange,
}: UseConnectionEventsOptions) => {
  // Browser and application connection-status events.
  useEffect(() => {
    const handleOffline = () => {
      debug.warn("[Connection] Browser offline");
      onStatusChange("offline");
    };
    const handleOnline = () => {
      debug.success("[Connection] Browser online");
      onStatusChange("online");
    };

    const handleConnectionStatus = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;

      if (
        typeof detail !== "string" ||
        !VALID_STATUSES.includes(detail as ConnectionStatus)
      ) {
        debug.warn("[useConnectionEvents] Unknown connection status:", detail);
        return;
      }

      onStatusChange(detail as ConnectionStatus); // the showStatus from requestWrapper.ts. Same as "showStatus("...")"
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("connection-status", handleConnectionStatus);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("connection-status", handleConnectionStatus);
    };
  }, [onStatusChange]); // It tells React to rerun the effect if the onStatusChange function changes identity.

  useEffect(() => {
    const socket = io("/", {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket"],
      reconnection: true,
    });

    const reportStatus = (status: ConnectionStatus) => {
      if (!navigator.onLine && status !== "offline") return;

      debug.log(`[Connection] Socket.IO status: ${status}`);
      dispatchConnectionStatus(status);
    };

    const handleConnect = () => {
      debug.success("[Connection] Socket.IO connected:", socket.id);
      reportStatus("online");
    };

    const handleDisconnect = (reason: string) => {
      debug.warn("[Connection] Socket.IO disconnected:", reason);
      if (reason === "io client disconnect") return;

      reportStatus("reconnecting");

      if (reason === "io server disconnect") {
        socket.connect();
      }
    };

    const handleConnectError = (error: Error) => {
      debug.warn("[Connection] Socket.IO connection error:", error.message);
      reportStatus("server-error");
    };

    const handleReconnectAttempt = (attempt: number) => {
      debug.log(`[Connection] Reconnection attempt #${attempt}`);
      reportStatus("reconnecting");
    };

    const handleReconnectError = (error: Error) => {
      debug.warn("[Connection] Reconnection error:", error.message);
      reportStatus("reconnecting");
    };

    const handleReconnectFailed = () => {
      debug.error("[Connection] Socket.IO reconnection failed");
      reportStatus("server-error");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect_error", handleReconnectError);
    socket.io.on("reconnect_failed", handleReconnectFailed);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect_error", handleReconnectError);
      socket.io.off("reconnect_failed", handleReconnectFailed);

      socket.disconnect();
    };
  }, []);
};
