import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppRoutes from "./routes/route";
import ViewStudentPDF from "./components/Student/ScoreAndFeedback/ViewStudentPDF";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AuthProvider } from "./routes/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/student/viewpdf/:id/:fileUrl/:assessmentId"
            element={<ViewStudentPDF />}
          />
        </Routes>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
