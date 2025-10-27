//#region ===== USAGE =====
//
// <ProtectedRoute roles={["nurse", "Сестра"]}> {/* Mentioned users and admins */}
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

import { Navigate, useLocation } from "react-router";

import { useAuth } from "../context";
import Loader from "../components/Loader";
import Button from "../components/Button";

import { enhancedDebug as debug } from "../utils/debug";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { authState } = useAuth();
  const location = useLocation();

  const adminRoles = ["admin"]

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

    const hasAdminRole = adminRoles.includes(userRole)
    const hasRequiredRole = roles.includes(userRole)

    const displayUserRoles = authState.user?.status

    if (!hasAdminRole && !hasRequiredRole) {
      return (
        <div>
          <div style={{ padding: '20px', border: '2px solid black', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center' }}>Доступ запрещен</h2>
            <br />
            <p>
              У вас недостаточно прав для просмотра этой страницы.
            </p>
            <p>
              <br />
              Требуемые роли: {roles.join(", ")}
              <br />
              Ваша роль: {displayUserRoles || "Не определена"}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                navigateTo='INDEX'
                text="Назад"
              />
            </div>
          </div>
        </div>
      )
    }
  }

  // Access granted
  debug.log('Access GRANTED');
  return children;
};

export default ProtectedRoute;
