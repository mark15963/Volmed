import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children, adminOnly = false, nurse = false }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState.isLoading) {
    return <Loader />;
  }
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !authState.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (nurse && authState.user.status!=='Сестра') {
    return <Navigate to="/" replace />
  }
  
  return children;
};

export default ProtectedRoute
