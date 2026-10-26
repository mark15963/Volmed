// Use in components to get state & login/logout

//#region ===== IMPORTS =====
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";

import api from "../services/api/index";

import debug from "../utils/debug";
import { parseApiError, parseApiResponse } from "../utils";
import { fetchUserStatus } from "../services/fetchUserStatus";
import { useSafeMessage } from "../hooks/useSafeMessage";
//#endregion

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    isOffline: false,
    isLoading: true,
    user: null
  });
  const navigate = useNavigate()
  const safeMessage = useSafeMessage();

  // Check if user is authenticated. Always returns the same shape
  const checkAuthStatus = useCallback(async (redirectIfUnauth = true) => {
    const safetyTimer = setTimeout(() => {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }, 15000);

    try {
      const res = await fetchUserStatus();
      if (res.offline) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isOffline: true
        }))
        return {
          ok: false,
          offline: true,
          user: null,
          isAdmin: false,
          error: res.message
        }
      }

      const isAuthenticated = res.ok && res.isAuthenticated
      const user = isAuthenticated ? res.user : null
      const isAdmin = isAuthenticated ? res.isAdmin : false
      const error = !isAuthenticated ? res.message : undefined

      // Update local auth state
      setAuthState({
        isAuthenticated,
        isAdmin,
        isOffline: false,
        user,
        isLoading: false
      })

      // Redirect to login if unauthenticated AND online
      if (
        !isAuthenticated &&
        redirectIfUnauth &&
        window.location.pathname !== '/login'
      ) {
        navigate('/login')
      }

      // If auth success
      return {
        ok: isAuthenticated,
        offline: false,
        user,
        isAdmin,
        error
      }
    } catch (err) {
      debug.error("[AuthProvider] checkStatus threw:", err)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        isOffline: true
      }))
      return {
        ok: false,
        offline: true,
        user: null,
        isAdmin: false,
        error: err instanceof Error ? err.message : "Auth check failed"
      }
    } finally {
      clearTimeout(safetyTimer)
    }
  }, [navigate])

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function
  const login = useCallback(async (credentials) => {
    debug.log("Trying to login...")
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const res = await api.postLogin(credentials);
      debug.warn(JSON.stringify(res, null, 2))
      if (!res.ok) {
        return {
          error: true,
          message: res.message,
          status: res.status
        }
      }

      // Refresh authState and automatically redirect if unauthenticated
      const authRes = await checkAuthStatus(false);
      if (!authRes.ok) {
        return {
          error: true,
          message: "Authentication failed after login"
        }
      }

      debug.success(`${authRes.user.lastName} ${authRes.user.firstName} ${authRes.user.patr} logged as ${authRes.user.status}`)

      navigate('/')

      // Return successful result to parent
      return {
        error: false,
        data: authRes.user
      }
    } catch (err) {
      const parsed = parseApiError(err)
      debug.error(`Login error:`, parsed.message)
      return {
        error: true,
        message: parsed.message,
        status: parsed.status
      }
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [checkAuthStatus, navigate]);

  // Logout function
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      debug.log("Logging out...")

      // Call backend logout
      const res = await api.logout()
      if (!result.ok) {
        safeMessage("error", "Не удалось выйти. Проверьте соединение.");
      }

      const parsed = parseApiResponse(res)
      if (!parsed.ok) {
        debug.error("Logout failed:", parsed.message)
        return {
          ok: false,
          message: parsed.message
        }
      }

      // Clear authState locally
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        isOffline: false,
        isLoading: false,
        user: null,
      });
      // document.cookie = "";

      navigate('/login');
      debug.log(parsed.message) // From backend
      return {
        ok: true,
        message: "Logged out"
      }
    } catch (err) {
      const parsed = parseApiError(err)
      debug.error("Logout error:", parsed.message, "Status:", parsed.status)
      return {
        ok: false,
        message: parsed.message
      }
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [navigate, safeMessage])

  // Auth check every 10/30 min
  useEffect(() => {
    const BASE_INTERVAL = 1000 * 60 * 10  // 10 min when online
    const FAST_INTERVAL = 1000 * 30       // 30 sec when offline

    let timer
    let cancelled = false;

    const schedule = (delay) => {
      timer = setTimeout(run, delay)
    }

    const run = async () => {
      if (cancelled) return
      if (document.hidden) {
        // Tab hidden — skip the network call, try again later
        return schedule(BASE_INTERVAL)
      }
      const res = await checkAuthStatus(false)
      if (cancelled) return
      schedule(res.offline ? FAST_INTERVAL : BASE_INTERVAL)
    }

    // When the tab becomes visible again, check immediately
    const onVisible = () => {
      if (!document.hidden) {
        clearTimeout(timer)
        run()
      }
    }

    const onNetworkChange = () => {
      clearTimeout(timer)
      run()
    }

    schedule(BASE_INTERVAL)
    document.addEventListener("visibilitychange", onVisible)
    document.addEventListener("online", onNetworkChange)
    document.addEventListener("offline", onNetworkChange)

    return () => {
      cancelled = true;
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisible)
      document.removeEventListener("online", onNetworkChange)
      document.removeEventListener("offline", onNetworkChange)
    }
  }, [checkAuthStatus])

  return (
    <AuthContext.Provider value={{
      authState,
      checkAuthStatus,
      logout,
      login
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export default AuthProvider