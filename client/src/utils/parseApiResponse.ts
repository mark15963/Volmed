import { AxiosError, AxiosResponse } from "axios";

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
 * Parse and normalize a successful or mocked API response.
 *
 * @param res - Raw axios response or any object with status/data
 */
export interface ApiError<T = unknown>{
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
 * - Error was made from { code, config, event, message, name, request }
 * - Now { data, message, ok, status}
 *
 * @param error - Error object (usually from axios catch block)
 * @returns Normalized error response
 */
export function parseApiError(error: unknown): ApiError<never> {
  let status = 0
  let message = "Request failed. Try again."

  if (error instanceof AxiosError){
    status = error.response?.status ?? 0;
  
    message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error.message ||
    message;
    
    if (status === 401){
      message = "Invalid username or password";
    }
  } else if (error instanceof Error){
    message = error.message
  }


  return {
    ok: false,
    data: undefined,
    message,
    status,
  };
}
