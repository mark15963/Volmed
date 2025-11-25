// Use in components to get state & login/logout

//#region ===== IMPORTS =====
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";

import api from "../services/api";

import debug from "../utils/debug";
import { parseApiError, parseApiResponse } from "../utils/parseApiResponse";
import { fetchUserStatus } from "../services/fetchUserStatus";
//#endregion

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    user: null
  });
  const navigate = useNavigate()

  // Check if user is authenticated. Always returns the same shape
  const checkAuthStatus = useCallback(async (redirectIfUnauth = true) => {
    const res = await fetchUserStatus();

    const isAuthenticated = res.ok && res.isAuthenticated
    const user = isAuthenticated ? res.user : null
    const isAdmin = isAuthenticated ? res.isAdmin : false
    const error = !isAuthenticated ? res.message : undefined

    // Update local auth state
    setAuthState({
      isAuthenticated,
      isAdmin,
      user,
      isLoading: false
    })

    // Redirect to login if unauthenticated
    if (!isAuthenticated && redirectIfUnauth && window.location.pathname !== '/login') {
      navigate('/login')
    }

    // If auth success
    return {
      ok: isAuthenticated,
      user,
      isAdmin,
      error
    }
  }, [navigate])

  useEffect(() => {
    const checkAndRedirect = async () => {
      const result = await checkAuthStatus(false)
      if (!result.ok && window.location.pathname !== '/login') {
        navigate('/login');
      }
    }
    checkAndRedirect();
  }, [checkAuthStatus, navigate]);

  // Login function
  const login = useCallback(async (credentials) => {
    debug.log("Trying to login...")
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const res = await api.postLogin(credentials);
      // error from backend
      const parsed = parseApiResponse(res)

      if (!parsed.ok) {
        return {
          error: true,
          message: parsed.message,
          status: parsed.status
        }
      }

      // Refresh authState and automatically redirect if unauthenticated
      const authRes = await checkAuthStatus();
      if (!authRes.ok) {
        return {
          error: true,
          message: "Authentication failed after login"
        }
      }

      debug.log(`${authRes.user.lastName} ${authRes.user.firstName} ${authRes.user.patr} logged as ${authRes.user.status}`)

      navigate('/')

      // Return successful result to parent
      return {
        error: false,
        data: parsed.data
      }
    } catch (error) {
      const parsed = parseApiError(error)
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
      const parsed = parseApiResponse(res)

      if (!parsed.ok) {
        debug.error("Logout failed:", parsed.message)
        return { ok: false, message: parsed.message }
      }

      // Clear authState locally
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        user: null,
      });
      document.cookie = "";

      navigate('/login');
      debug.log(parsed.message) // From backend
      return { ok: true, message: "Logged out" }
    } catch (error) {
      const parsed = parseApiError(error)
      debug.error("Logout error:", parsed.message, "Status:", parsed.status)
      return { ok: false, message: parsed.message }
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [navigate])

  // Auth check every 10 min
  useEffect(() => {
    const interval = setInterval(checkAuthStatus, 1000 * 60 * 10);
    return () => clearInterval(interval);
  }, [checkAuthStatus]);

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