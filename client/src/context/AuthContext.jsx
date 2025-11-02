//#region ===== IMPORTS =====
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";

import api from "../services/api";

import debug from "../utils/debug";
import { parseApiResponse, parseApiError } from "../utils/parseApiResponse";
import { fetchUserStatus } from "../api";
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


  // Check if user authenticated. If not => login page
  const checkAuthStatus = useCallback(async () => {
    const res = await fetchUserStatus();

    if (!res.ok || !res.isAuthenticated) {
      debug.error("Auth check failed:", res.message)
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        user: null
      });
      return {
        ok: false,
        error: res.message
      }
    }

    setAuthState({
      isAuthenticated: true,
      isAdmin: res.isAdmin,
      isLoading: false,
      user: res.user
    });

    return {
      ok: true,
      user: res.user,
      isAdmin: res.isAdmin
    }
  }, [])

  useEffect(() => {
    const checkAndRedirect = async () => {
      const result = await checkAuthStatus()
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
      // posting creds and getting response
      const res = await api.postLogin(credentials);

      // error from backend to parent
      const parsed = parseApiResponse(res)
      if (!parsed.ok) {
        return {
          error: true,
          message: parsed.message,
          status: parsed.status
        }
      }

      const authRes = await checkAuthStatus();
      if (!authRes.ok) {
        return {
          error: true,
          message: "Authentication failed after login"
        }
      }

      // return data to parent
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
  }, [checkAuthStatus]);

  // Logout function
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await api.logout()
      console.log("Logout result:", res);
      if (!res.ok) {
        debug.error("Logout failed:", res.message)
        return { ok: false, message: res.message }
      }

      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        user: null,
      });

      document.cookie = "";

      navigate('/login');
      return { ok: true }
    } catch (error) {
      debug.error("Logout error:", error)
      return { ok: false, error }
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
