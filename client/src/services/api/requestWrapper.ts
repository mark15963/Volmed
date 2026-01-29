import { parseApiResponse, parseApiError, debug } from "../../utils";
import apiInstance from "./axiosInstance";

/**
 * requestWrapper()
 * ----------------
 * Generic helper for all HTTP methods.
 * Automatically handles:
 *  - missing payloads (avoids sending `null` which breaks Express)
 *  - consistent error handling
 *  - development logs
 */
export async function requestWrapper(
  method: "get" | "post" | "put" | "delete", 
  url: string, 
  data: any = null, 
  config = {}
) {
  try {
    // Ensure `null` isn't sent to the backend
    const payload =
      data === null
        ? ["post", "put"].includes(method)
          ? {}
          : undefined
        : data;

    // Perform the HTTP request
    const response = await apiInstance[method](url, payload, config);
    // Parse unified format: { ok, data, status, message }
    return parseApiResponse(response);
    

  } catch (error: any) {
    // Normalize network or parsing errors
    const parsedError = parseApiError(error);

    // Dispatch connection status events for OfflineFallback
    if (error.code === "ECONNABORTED" || parsedError.status === 408) {
      // Axios timeout
      window.dispatchEvent(new CustomEvent("connection-status", { detail: "timeout" }));
    } else if (!error.response) {
      // Network error (no response at all)
      window.dispatchEvent(new CustomEvent("connection-status", { detail: "offline" }));
      debug.error(`No response. Error code: ${error.code}`)
    } else {
      // Backend responded with error status
      window.dispatchEvent(new CustomEvent("connection-status", { detail: "server-error" }));
      debug.error(`${error.message}`)
    }

    debug.error(`Error code: ${error.code}`);
    return parsedError;
  }
}