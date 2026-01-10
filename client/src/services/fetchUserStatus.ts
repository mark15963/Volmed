// Used in:
// - AuthContext.jsx
// - LoginPage.jsx

export interface UserStatus{
  ok: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: object | null;
  message?: string;
}

import api from "../services/api";
import { debug } from "../utils/debug";

/**
           * @typedef {Object} UserStatus
            * @property {boolean} ok
             * @property {boolean} isAuthenticated
              * @property {boolean} isAdmin
               * @property {Object|null} user
                * @property {string} [message]
                 */

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
                                      const res = await fetchUserStatus();
                                        if (!res.ok || !res.isAuthenticated) {...}
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
    message: res.message,
  };
}
                                                                                                                                 