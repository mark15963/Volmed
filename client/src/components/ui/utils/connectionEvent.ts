import debug from "../../../utils/debug";
import type { ConnectionStatus } from "../../../custom-types";

/**
 * dispatchConnectionStatus(status)
 * --------------------------
 * Sends a custom event to browser's window object.
 * *
 * @param status - The connection status to dispatch:
 * - `"online"` — Connection is available.
 * - `"offline"` — No network connection.
 * - `"server-error"` — The server returned an error.
 * - `"timeout"` — The request timed out.
 * - `"reconnecting"` — Attempting to reconnect.
 * @description See {@link ConnectionStatus} for the accepted values.
 *
 * @example
 * // Valid
 * dispatchConnectionStatus("server-error");
 * dispatchConnectionStatus("online");
 *
 * // Invalid: TypeScript will report a type error.
 * dispatchConnectionStatus("something-else");
 *
 */
export const dispatchConnectionStatus = (status: ConnectionStatus): void => {
  window.dispatchEvent(
    new CustomEvent<ConnectionStatus>("connection-status", {
      detail: status,
    }),
  );
};
