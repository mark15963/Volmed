/**
 * Normalize API responses into a consistent shape.
 *
 * Always returns:
 *   {
 *     ok: boolean,
 *     data: any,
 *     message: string | null,
 *     status?: number
 *   }
 */

export function parseApiResponse(res) {
  try {
    const status = res?.status ?? 200;
    const data = res?.data ?? {};
    const message = data?.message || data?.error;

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
