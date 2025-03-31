import React from "react";
import { Container } from "react-bootstrap";
import Viewassessmentfile from "../../components/Profressor/Alluserassessment/Viewassessmentfile";
import Navber from "../../components/Profressor/Alluserassessment/Navbar";
import "../../styles/Main.css";

export default function Viewassessmentpage() {
  return (
    <>
      {/* <Navber /> */}
      <div className="main-content-feedback">
        <Container fluid className="p-0 m-0" style={{ height: "100%" }}>
          <Viewassessmentfile />
        </Container>
      </div>
    </>
  );
}
