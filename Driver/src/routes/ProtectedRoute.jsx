import { Navigate } from "react-router-dom";
import { useDriverAuth } from "../context/DriverAuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useDriverAuth();
  if (!isAuthenticated) {
    return <Navigate to="/driver/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
