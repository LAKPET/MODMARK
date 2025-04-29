import React from "react";
import Navber from "../../components/Student/Dashboard/Navbar";
import Sidebar from "../../components/Student/Dashboard/Sidebar";
import { Container } from "react-bootstrap";
import GetStudentScoreAndFeedback from "../../components/Student/ScoreAndFeedback/GetStudentScoreAndFeedback";
import "../../styles/Main.css";

export default function ScoreAndFeedbackpage() {
  return (
    <div>
      <Navber />
      <Sidebar />
      <div className="main-content">
        <Container className="mt-2">
          <GetStudentScoreAndFeedback />
        </Container>
      </div>
    </div>
  );
}
