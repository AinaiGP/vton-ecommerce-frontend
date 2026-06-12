import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "./common/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { getRedirectPathByRole } from "../utils/authFunctions";

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const { isLoading, isAuthenticated, userRole } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // If user is authenticated but has wrong role, send them to their role-based home
    return <Navigate to={getRedirectPathByRole(userRole)} replace />;
  }

  return children;
}

/**
 * CustomerRoute wrapper:
 * 1. Redirects unauthenticated to /auth with state.from
 * 2. Redirects wrong-role users to their respective dashboard
 * 3. Renders children only for 'customer' role
 */
export function CustomerRoute({ children }) {
  const location = useLocation();
  const { isLoading, isAuthenticated, userRole } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (userRole !== "customer") {
    return <Navigate to={getRedirectPathByRole(userRole)} replace />;
  }

  return children;
}
