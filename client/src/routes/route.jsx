import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Loginpage";
import Register from "../pages/Registerpage";
import Coursepage from "../pages/Coursepage";
import Dashboardpage from "../pages/Dashboardpage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/course" element={<Coursepage />} />
        <Route path="/dashboard" element={<Dashboardpage />} />
      </Routes>
    </BrowserRouter>
  );
}
