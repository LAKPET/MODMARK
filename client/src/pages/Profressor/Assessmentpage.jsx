import React from "react";
import Navber from "../../components/Profressor/Dashboard/Navbar";
import Sidebar from "../../components/Profressor/Dashboard/Sidebar";
import { Container } from "react-bootstrap";
import Getassessment from "../../components/Profressor/Assessment/Getassessment";
export default function Assessmentpage() {
  return (
    <div>
      <Navber />
      <Sidebar />
      <div className="main-content">
        <Container className="mt-2">
          <Getassessment />
        </Container>
      </div>
    </div>
  );
}
