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
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
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
