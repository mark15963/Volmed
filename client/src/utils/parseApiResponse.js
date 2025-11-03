// /**
//  * @typedef {Object} ParsedApiResponse
//  * @property {boolean} ok - Success/failure
//  * @property {any} data - Payload
//  * @property {string} message - User-readable message
//  * @property {number} [status] - HTTP status code
//  */

/**
 * Normalize API responses into a consistent shape.
 *
 * Always returns:
 * {
 *   ok: boolean,         - Success/failure
 *   data: any,           - Payload
 *   message: string,     - User-readable message
 *   status?: number      - HTTP status code
 * }
 *
 * @param {object} res - Axios response object
 * @returns {{
 *   ok: boolean,
 *   data: any,
 *   message: string,
 *   status?: number
 * }} Normalized API response
 *
 * @example
 * // Example:
 * const res = await api.logout();
 * const parsed = parseApiResponse(res);
 *
 * if (!parsed.ok) {
 *   debug.error("Logout failed:", parsed.message);
 *   return {
 *     ok: false,
 *     message: parsed.message
 *   };
 * };
 */
export function parseApiResponse(res) {
  try {
    const status = res?.status ?? 200;
    const data = res?.data ?? {};

    // Pull message from multiple possible sources
    const message =
      data?.message ||
      data?.error ||
      (status >= 200 && status < 300
        ? "Request successfull"
        : `Request failed with status ${status}`);

    // Trust backend's ok flag if present
    const ok =
      typeof data?.ok === "boolean"
        ? data.ok
        : status >= 200 && status < 300 && !data?.error;

    return {
      ok,
      data,
      message,
      status,
    };
  } catch (err) {
    return {
      ok: false,
      data: null,
      message: "Invalid response format",
      status: 0,
    };
  }
}

/**
 * Normalize an axios-style error object.
 *
 * @param {any} error - Axios error object
 * @returns {{
 *   ok: boolean,
 *   data: any,
 *   message: string,
 *   status: number
 * }} Normalized error response
 */
export function parseApiError(error) {
  const status = error?.response?.status ?? 0;
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (status === 401
      ? "Invalid username or password"
      : "Request failed. Try again.");
  return {
    ok: false,
    data: null,
    message,
    status,
  };
}
