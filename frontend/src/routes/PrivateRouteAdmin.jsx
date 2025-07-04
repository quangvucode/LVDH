import { Navigate } from "react-router-dom";

const PrivateRouteAdmin = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRouteAdmin;
