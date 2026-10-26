import { Navigate } from "react-router-dom";
import { useDriverAuth } from "../context/DriverAuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useDriverAuth();
  if (!isAuthenticated) {
    return <Navigate to="/driver/login" replace />;
  }
  if (user && user.isActive === false) {
    return <Navigate to="/driver/apply" replace state={{ tab: "track", email: user.email }} />;
  }
  return children;
};

export default ProtectedRoute;
