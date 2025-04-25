import React, { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const authToken = localStorage.getItem("authToken");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a small delay to show the loading backdrop
    const timer = setTimeout(() => {
      setIsLoading(false);

      // If we have a stored path and ID, navigate to it
      const lastPath = localStorage.getItem("lastPath");
      const lastPathId = localStorage.getItem("lastPathId");

      if (lastPath && lastPathId && location.pathname !== lastPath) {
        // Replace the :id placeholder with the actual ID
        const pathWithId = lastPath.replace(":id", lastPathId);
        if (location.pathname !== pathWithId) {
          navigate(pathWithId, { replace: true });
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  if (isLoading) {
    return (
      <Backdrop
        sx={(theme) => ({ color: "#8B5F34", zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!authToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
