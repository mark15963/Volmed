import api from "../services/api";
import { debug } from "../utils/debug";

/**
 * ================================================================
 * 📘 FETCH USER STATUS
 * ---------------------------------------------------------------
 * This helper checks whether the user is authenticated and returns
 * session details (username, role, admin privileges, etc).
 *
 * ✅ HOW TO USE:
 *   import { fetchUserStatus } from "../api/fetchUserStatus";
 *
 *   const res = await fetchUserStatus();
 *   if (res.ok && res.isAuthenticated) {
 *     console.log("Logged in as:", res.user.username);
 *   }
 *
 * ---------------------------------------------------------------
 * Returns an object:
 * {
 *   ok: boolean,
 *   isAuthenticated: boolean,
 *   isAdmin: boolean,
 *   user: object | null,
 *   message?: string
 * }
 * ================================================================
 */

/**
 * Checks authentication status
 * @returns {Promise<{ ok: boolean, isAuthenticated: boolean, user: object|null, isAdmin: boolean, message?: string }>}
 */
export async function fetchUserStatus() {
  const res = await api.status();

  if (!res.ok) {
    debug.error("Error checking user status:", res.message);
    return {
      ok: false,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      message: res.message,
    };
  }

  const user = res.data?.user || null;
  const isAdmin = ["admin"].includes(user?.status);

  return {
    ok: true,
    isAuthenticated: res.data?.isAuthenticated ?? false,
    isAdmin,
    user,
  };
}
