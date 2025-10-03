// const { isLoading: authLoading, isAuthenticated } = useRedirectIfAuth()
//
//   // Loading state + checking if auth
//   if (authLoading) return <Loader />
//   if (isAuthenticated) return null

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context";

export default function useRedirectIfAuth(redirectPath = "/") {
  const navigate = useNavigate();
  const { authState } = useAuth();

  // Return to main if already auth
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [authState.isAuthenticated, navigate, redirectPath]);

  return {
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
  };
}
