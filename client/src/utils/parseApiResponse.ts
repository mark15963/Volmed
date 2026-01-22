import { AxiosResponse } from "axios";

/**
 * Normalize API responses into a consistent shape.
 *
 * Always returns an object with the following structure:
 * {
 *   ok: boolean         - Success/failure indicator
 *   data?: T            - Payload (generic type)
 *   message?: string    - User-readable message
 *   status?: number     - HTTP status code
 *   [key: string]: any  - Additional fields if present
 * }
 *
 * @param res - Axios response object (or any object with status/data)
 * @returns Normalized API response
 *
 * @example
 * const res = await api.logout();
 * const parsed = parseApiResponse(res);
 *
 * if (!parsed.ok) {
 *   console.error("Logout failed:", parsed.message);
 *   return { ok: false, message: parsed.message };
 * }
 */
export interface ApiResponse<T = unknown>{
  ok: boolean;
  data?: T;
  message?: string;
  status?: number;
  [key: string]: unknown;
}

/**
 * Parse and normalize an API response (usually from axios).
 *
 * @param res - The raw response object (typically axios response)
 * @returns Normalized response object
 */
export function parseApiResponse<T = unknown>(
  res:  AxiosResponse | unknown
): ApiResponse<T> {
  if(!res || typeof res !== 'object'){
    return {
      ok: false,
      data: null as T,
      message: "Invalid response format",
      status: 0,
    };
  }
  const status = 'status' in res ? (res as AxiosResponse).status : 200;
  const data = 'data' in res ? (res as AxiosResponse).data : {};

    // Pull message from multiple possible sources
    const message =
      (data as any)?.message ||
      (data as any)?.error ||
      (status >= 200 && status < 300
        ? "Request successful"
        : `Request failed with status ${status}`);

    // Trust backend's ok flag if present
    const ok =
      typeof (data as any)?.ok === "boolean"
        ? (data as any).ok
        : status >= 200 && status < 300 && !(data as any)?.error;

    return {
      ok,
      data: data as T,
      message,
      status,
    };
}

/**
 * Normalize an axios-style error object into our consistent response shape.
 *
 * @param error - Error object (usually from axios catch block)
 * @returns Normalized error response
 */
export function parseApiError(error: unknown): ApiResponse<never> {
  const status = (error as any)?.response?.status ?? 0;
  
  const message =
    (error as any)?.response?.data?.message ||
    (error as any)?.response?.data?.error ||
    (status === 401
      ? "Invalid username or password"
      : "Request failed. Try again.");
  return {
    ok: false,
    data: undefined,
    message,
    status,
  };
}
