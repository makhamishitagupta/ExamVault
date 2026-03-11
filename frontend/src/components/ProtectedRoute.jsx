import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuthUser } from "../utils/auth";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const authUser = await getAuthUser(); // backend check
      setUser(authUser);
    };
    checkAuth();
  }, []);

  if (user === undefined) {
    return <div>Checking authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
