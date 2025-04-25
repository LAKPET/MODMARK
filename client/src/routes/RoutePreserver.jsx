import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RoutePreserver = () => {
  const location = useLocation();

  useEffect(() => {
    // Store the current path in localStorage when the component mounts or location changes
    localStorage.setItem("lastPath", location.pathname);

    // Check if we're on a page with an ID parameter
    const pathParts = location.pathname.split("/");
    const idIndex = pathParts.findIndex((part) => part === ":id");

    if (idIndex !== -1 && pathParts.length > idIndex + 1) {
      const id = pathParts[idIndex + 1];
      localStorage.setItem("lastPathId", id);
    }
  }, [location]);

  return null; // This component doesn't render anything
};

export default RoutePreserver;
