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
//#region ===== IMPORTS =====
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuth } from "../../../context";
import Loader from "../../../components/ui/loaders/Loader";
import Button from "../../../components/Button";

import { debug } from "../../../utils/debug";
import { AccessDenied } from "../AccessDenied";
//#endregion

/**
 * ProtectedRoute Component
 * ------------------------
 * A higher-order route guard for protecting React Router routes based on authentication
 * and user roles. It checks the current user's authentication state and role before
 * rendering the requested route component.
 *
 * If the user is not authenticated, they are redirected to the `/login` page.
 * If the user's role is not permitted, an `<AccessDenied />` page is shown.
 * Otherwise, the wrapped children are rendered.
 *
 * @component
 *
 * @example
 * // ✅ Accessible only to NURSES and ADMINS
 * <ProtectedRoute roles={["nurse"]}>
 *   <NurseDashboard />
 * </ProtectedRoute>
 *
 * @example
 * // ✅ Accessible only to ADMINS
 * <ProtectedRoute roles={[]}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * @example
 * // ✅ Accessible to ALL authenticated users (no specific role check)
 * <ProtectedRoute>
 *   <UserHome />
 * </ProtectedRoute>
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The component(s) to render if access is granted.
 * @param {string[]} [props.roles=[]] - List of allowed user roles.
 *   - If role specified in `[]`: users with **matching roles** or **admin** access are allowed. 
 *   - If empty `[]`: only **admins** can access.
 *   - If not added `[]`: all **authenticated** users can access.
 *
 * @returns {JSX.Element} The protected route component, or redirect/loader/denied message.
 *
 * @description
 * - Uses the `useAuth()` context to determine the authentication state and user role.
 * - Uses `useEffect` to revalidate the auth status on each route change.
 * - Displays `<Loader />` while checking auth status.
 * - Redirects unauthenticated users to `/login`.
 * - Displays `<AccessDenied />` if the user’s role is not permitted.
 * - Renders children if access is granted.
 */
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
