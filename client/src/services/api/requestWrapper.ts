import { dispatchConnectionStatus } from "../../components/ui/utils/connectionEvent";
import { parseApiResponse, parseApiError, debug } from "../../utils";
import apiInstance from "./axiosInstance";

const RETRY_DELAYS = [3000, 3000, 3000, 3000, 3000];

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
  config = {},
) {
  const payload =
    data === null ? (["post", "put"].includes(method) ? {} : undefined) : data;

  for (let attempt = 0; ; attempt++) {
    try {
      // Perform the HTTP request
      const response = await apiInstance[method](url, payload, config);

      dispatchConnectionStatus("online");

      // Parse unified format: { ok, data, status, message }
      return parseApiResponse(response);
    } catch (error: any) {
      const isNetworkError = !error.response;
      const isLastAttempt = attempt >= RETRY_DELAYS.length;

      if (isNetworkError && !isLastAttempt) {
        dispatchConnectionStatus("reconnecting");

        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS[attempt]),
        );

        continue;
      }

      // Normalize network or parsing errors
      const parsedError = parseApiError(error);

      // Dispatch connection status events for OfflineFallback
      if (error.code === "ECONNABORTED" || parsedError.status === 408) {
        // Axios timeout
        dispatchConnectionStatus("timeout");
      } else if (isNetworkError) {
        // Network error (no response at all)
        dispatchConnectionStatus("offline");
        debug.error(`No response. Error code: ${error.code}`);
      } else if ((error.response?.status ?? 0) >= 500) {
        // Backend responded with error status
        dispatchConnectionStatus("server-error");
        debug.error(`Server error ${error.response.status}: ${error.message}`);
      }

      return parsedError;
    }
  }
}
