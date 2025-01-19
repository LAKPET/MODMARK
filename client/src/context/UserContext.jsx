import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const user = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        setUserRole(user.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ userRole }}>{children}</UserContext.Provider>
  );
};
