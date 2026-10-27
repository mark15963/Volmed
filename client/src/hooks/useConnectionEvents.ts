import { useEffect } from "react";

import type { ConnectionStatus } from "@custom-types";
import debug from "@utils/debug";

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
 * Listens for browser and application connection-status events.
 *
 * @example
 * useConnectionEvents({
 *   onStatusChange: showStatus,
 * });
 */
export const useConnectionEvents = ({
  onStatusChange,
}: UseConnectionEventsOptions) => {
  useEffect(() => {
    const handleOffline = () => {
      debug.warn("Browser event: offline");
      onStatusChange("offline");
    };
    const handleOnline = () => {
      debug.success("Browser event: online");
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
};
