import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children, roles }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth" replace state={{ from: location }} />;
  if (roles?.length && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
