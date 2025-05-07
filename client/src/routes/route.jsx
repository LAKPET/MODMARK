import React from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Login from "../pages/Auth/Loginpage";
import Register from "../pages/Auth/Registerpage";
import ProfessorCoursepage from "../pages/Profressor/Coursepage";
import StudentCoursepage from "../pages/Student/Coursepage";
import Dashboardpage from "../pages/Profressor/Dashboardpage_Pro";
import Dashboardpage_Admin from "../pages/Admin/Dashboardpage_Admin";
import Unauthorized from "./Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import Settingcoursepage from "../pages/Profressor/Settingcoursepage";
import Assessmentpage from "../pages/Profressor/Assessmentpage";
import Alluserassessmentpage from "../pages/Profressor/Alluserassessmentpage";
import Teampage from "../pages/Profressor/Teampage";
import Dashboardpage_stu from "../pages/Student/Dashboardpage_stu";
import Viewassessmentpage from "../pages/Profressor/Viewassessmentpage";
import StudentAssessmentpage from "../pages/Student/Assessmentpage";
import StudentScoreAndFeedbackpage from "../pages/Student/ScoreAndFeedbackpage";
import RoutePreserver from "./RoutePreserver";
import Viewassessmentfile from "../components/Profressor/ScoreAndFeedback/Viewassessmentfile"; // นำเข้า Viewassessmentfile
import AssessmentDetailPage from "../pages/Student/AssessmentDetailPage";
import Scorepage from "../pages/Profressor/Scorepage";
import Scorestudentpage from "../pages/Profressor/Scorestudentpage";

function AppRoutes() {
  const navigate = useNavigate();
  const { sectionId, assessmentId } = useParams();
  console.log("sectionId:", sectionId, "assessmentId:", assessmentId);
  return (
    <>
      <RoutePreserver />
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
          path="/score/:id"
          element={
            <ProtectedRoute requiredRole={["professor", "ta"]}>
              <Scorepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/score/:id/student-scores/:assessmentId"
          element={
            <ProtectedRoute requiredRole={["professor", "ta"]}>
              <Scorestudentpage />
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
          path="/student/assessment/:id"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAssessmentpage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assessment/:id/assessment-details/:assessmentId"
          element={
            <ProtectedRoute requiredRole="student">
              <AssessmentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/score-feedback/:id"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentScoreAndFeedbackpage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/view-pdf/:id/:fileUrl/:assessmentId"
          element={
            <ProtectedRoute requiredRole="student">
              <Viewassessmentfile />
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
    </>
  );
}

export default AppRoutes;
