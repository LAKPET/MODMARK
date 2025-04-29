import React from "react";
import Navber from "../../components/Student/Dashboard/Navbar";
import Sidebar from "../../components/Student/Dashboard/Sidebar";
import { Container } from "react-bootstrap";
import GetStudentAssessment from "../../components/Student/Assessment/GetStudentAssessment";
import "../../styles/Main.css";

export default function Assessmentpage() {
  return (
    <div>
      <Navber />
      <Sidebar />
      <div className="main-content">
        <Container className="mt-2">
          <GetStudentAssessment />
        </Container>
      </div>
    </div>
  );
}
