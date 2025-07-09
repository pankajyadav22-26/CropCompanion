import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.farmer.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;