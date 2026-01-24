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

const environment = import.meta.env.VITE_ENV as string | undefined;

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
    const parsed = parseApiResponse(response);

    return parsed;
  } catch (error) {
    // Normalize network or parsing errors
    const parsedError = parseApiError(error);
    return parsedError;
  }
}