// ===== USAGE =====
//
// <ProtectedRoute roles={["admin", "Администратор"]}>
//   <TestRoute />
// </ProtectedRoute>
//
// -----------------
//
// roles={[ ... ]} <-- 
// 
// Entered roles are checked if are the same as the user from authState. 
// If the roles are empty - access for all AUTHORIZED users
// If the roles filled - only those users have access to route
//
// =================

import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState.isLoading) {
    return <Loader />;
  }
  // Redirect if not auth
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user roles are defined, check if matches
  if (roles.length > 0) {
    const userRole = authState.user?.status;
    if (!roles.includes(userRole)) {
      // Redirect unauthorized roles
      return <Navigate to="/" replace />;
    }
  }

  // Access granted
  return children;
};

export default ProtectedRoute;
