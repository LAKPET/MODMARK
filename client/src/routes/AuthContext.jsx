import React, { createContext, useContext, useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem("user");
    const authToken = localStorage.getItem("authToken");
    const username = localStorage.getItem("Username");
    const userRole = localStorage.getItem("UserRole");
    const userId = localStorage.getItem("UserId");

    if (storedUser && authToken && username && userRole && userId) {
      setUser({
        ...JSON.parse(storedUser),
        username,
        role: userRole,
        id: userId,
      });
    }

    // Add a small delay to ensure the loading state is visible
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("Username");
    localStorage.removeItem("UserRole");
    localStorage.removeItem("UserId");
  };

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

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
