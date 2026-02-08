// Used in:
// - AuthContext.jsx
// - LoginPage.jsx

import { UserStatus } from "../interfaces/UserInterface";
import api from "../services/api/index";

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
  try {
    const res = await api.status();
    if (!res.ok) {
      // Inform OfflineFallback that the server is unreachable
      window.dispatchEvent(
        new CustomEvent("connection-status", { detail: "server-error" }),
      );

      return {
        ok: false,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        message: res.message,
      };
    }

    const user = (res as any).data?.user || null;
    const isAdmin = ["admin"].includes(user?.status);

    return {
      ok: true,
      isAuthenticated: (res as any).data?.isAuthenticated ?? false,
      isAdmin,
      user,
      message: res.message,
    };
  } catch (err: any) {
    // Network error (VPN/offline)
    window.dispatchEvent(
      new CustomEvent("connection-status", { detail: "offline" }),
    );

    return {
      ok: false,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      message: err.message,
    };
  }
}
