import React from "react";
import Navber from "../../components/Profressor/Dashboard/Navbar";
import Sidebar from "../../components/Profressor/Dashboard/Sidebar";
import { Container } from "react-bootstrap";
import StudentScores from "../../components/Profressor/Score/StudentScores";
import "../../styles/Main.css";
export default function Scorepage() {
  return (
    <div>
      <Navber />
      <Sidebar />
      <div className="main-content">
        <Container className="mt-2">
          <StudentScores />
        </Container>
      </div>
    </div>
  );
}
