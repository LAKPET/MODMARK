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
import Assessmentpage from "../pages/Profressor/Assessmentpage";
import Alluserassessmentpage from "../pages/Profressor/Alluserassessmentpage";
import Teampage from "../pages/Profressor/Teampage";
import Dashboardpage_stu from "../pages/Student/Dashboardpage_stu";
import Viewassessmentpage from "../pages/Profressor/Viewassessmentpage";

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
              <ProtectedRoute requiredRole={["professor", "ta"]}>
                <ProfessorCoursepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:id"
            element={
              <ProtectedRoute requiredRole={["professor", "ta"]}>
                <Dashboardpage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting/:id"
            element={
              <ProtectedRoute requiredRole={["professor", "ta"]}>
                <Settingcoursepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/:id"
            element={
              <ProtectedRoute requiredRole={["professor", "ta"]}>
                <Assessmentpage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/:id/allassessmentuser/:assessmentId"
            element={
              <ProtectedRoute requiredRole={["professor", "ta"]}>
                <Alluserassessmentpage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/viewassessment/:id/:fileUrl/:assessmentId"
            element={
              <ProtectedRoute requiredRole={["professor", "ta"]}>
                <Viewassessmentpage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/:id"
            element={
              <ProtectedRoute requiredRole={["professor", "ta"]}>
                <Teampage />
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
            path="/student/dashboard/:id"
            element={
              <ProtectedRoute requiredRole="student">
                <Dashboardpage_stu />
              </ProtectedRoute>
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
