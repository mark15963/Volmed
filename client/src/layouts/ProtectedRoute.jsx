//#region ===== USAGE =====
//
// <ProtectedRoute roles={["nurse"]}> {/* Mentioned users and admins */}
//   <TestRoute />
// </ProtectedRoute>
//
//- - - - - - - - - - - - - - - - - - -  
//
// <ProtectedRoute roles={[]}>  {/* Empty array = only admins */}
//   <TestRoute />
// </ProtectedRoute> 
//
//- - - - - - - - - - - - - - - - - - -
// 
// <ProtectedRoute>  {/* No roles prop = all authenticated users */}
//   <TestRoute />
// </ProtectedRoute>
//
// ------------------------------------
//
// roles={[ ... ]} <-- 
// 
// Entered roles are checked if are the same as the user from authState.
// Admin has access to all routes. 
// If the roles are empty - access for all AUTHORIZED users.
// If the roles filled - only mentioned users and admin
//
//#endregion

import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuth } from "../context";
import Loader from "../components/Loader";
import Button from "../components/Button";

import { enhancedDebug as debug } from "../utils/debug";
import { AccessDenied } from "./AccessDenied";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { authState, checkAuthStatus } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Refresh authState on route change
    checkAuthStatus(false);
  }, [checkAuthStatus, location.pathname]);

  if (authState.isLoading) return <Loader />

  // Redirect if not auth
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user roles are defined, check if matches
  if (roles.length > 0) {
    const hasAccess =
      authState.isAdmin ||                   // Admin access
      roles.includes(authState.user?.status) // Access to specified role

    if (!hasAccess) {
      return (
        <AccessDenied roles={roles} userRole={authState.user?.displayStatus} />
      )
    }
  }

  // Access granted
  return children;
};

export default ProtectedRoute;
