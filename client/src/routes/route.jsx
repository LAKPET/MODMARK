import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Loginpage";
import Register from "../pages/Registerpage";
import ProfessorCoursepage from "../pages/Profressor/Coursepage";
import StudentCoursepage from "../pages/Student/Coursepage";
import Dashboardpage from "../pages/Dashboardpage";
import Dashboardpage_Admin from "../pages/Admin/Dashboardpage_Admin";
import Unauthorized from "./Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider, useAuth } from "./AuthContext";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/course"
            requiredRole="profressor"
            element={<ProfessorCoursepage />}
          />
          <Route
            path="/course"
            requiredRole="student"
            element={<StudentCoursepage />}
          />
          <Route
            path="/dashboard/:id"
            element={
              <ProtectedRoute>
                <Dashboardpage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Dashboardpage_Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
