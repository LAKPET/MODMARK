import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Loginpage";
import Register from "../pages/Registerpage";
import ProfessorCoursepage from "../pages/Profressor/Coursepage";
import StudentCoursepage from "../pages/Student/Coursepage";
import Dashboardpage from "../pages/Profressor/Dashboardpage_Pro";
import Dashboardpage_Admin from "../pages/Admin/Dashboardpage_Admin";
import Unauthorized from "./Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";
import Settingcoursepage from "../pages/Profressor/Settingcoursepage";

function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/professor/course"
            element={
              <ProtectedRoute requiredRole="professor">
                <ProfessorCoursepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/course"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentCoursepage />
              </ProtectedRoute>
            }
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
            path="/setting/"
            element={
              //<ProtectedRoute requiredRole="professor">
              <Settingcoursepage />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <Dashboardpage_Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppRoutes;
