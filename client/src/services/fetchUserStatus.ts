// Used in:
// - AuthContext.jsx
// - LoginPage.jsx

import { UserStatus } from "@interfaces/UserInterface";
import api from "@services/api/index";

/**
 * FETCH USER STATUS
 * -----------------
 * This helper checks whether the user is authenticated and returns
 * session details (username, role, admin privileges, etc).
 * Makes the frontend code cleaner, safer, and easier to maintain by abstracting away axios, error handling, and normalization.
 *
 * @example
 * ```js
 *   import { fetchUserStatus } from "../api/fetchUserStatus";
 *
 *   const res = await fetchUserStatus();
 *   if (res.ok && res.isAuthenticated) {
 *     console.log("Logged in as:", res.user.username);
 *   }
 * ```
 *
 * @example
 * ```js
 * const checkAuthStatus = useCallback(async (redirectIfUnauth = true) => {
 * const res = await fetchUserStatus();
 * if (!res.ok || !res.isAuthenticated) {...}
 * ```
 *
 * @example
 * ```js
 * useEffect(() => {
 *   const checkAuth = async () => {
 *     const res = await fetchUserStatus()
 *     debug.log("Auth check:", res.message)
 *     ...
 * ```
 *
 * @returns {Promise<UserStatus>} Normalized user status object
 */
export async function fetchUserStatus(): Promise<UserStatus> {
  const res = await api.status();
  return {
    ok: res.ok,
    offline: res.offline === true,
    isAuthenticated: res.ok
      ? ((res as any).data?.isAuthenticated ?? false)
      : false,
    isAdmin: res.ok
      ? ["admin"].includes((res as any).data?.user?.status)
      : false,
    user: res.ok ? ((res as any).data?.user ?? null) : null,
    message: res.message,
  };
}
