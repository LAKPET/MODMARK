import React from "react";
import Navber from "../../components/Profressor/Dashboard/Navbar";
import Sidebar from "../../components/Profressor/Dashboard/Sidebar";
import { Container } from "react-bootstrap";
import Getassessmentuser from "../../components/Profressor/Alluserassessment/Getassessmentuser";
import "../../styles/Main.css";
export default function Alluserassessmentpage() {
  return (
    <div>
      <Navber />
      <Sidebar />
      <div className="main-content">
        <Container className="mt-2">
          <Getassessmentuser />
        </Container>
      </div>
    </div>
  );
}
