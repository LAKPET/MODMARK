import React from "react";
import { Container } from "react-bootstrap";
import Viewassessmentfile from "../../components/Profressor/Alluserassessment/Viewassessmentfile";
import Navber from "../../components/Profressor/Alluserassessment/Navbar";
import "../../styles/Main.css";

export default function Viewassessmentpage() {
  return (
    <div>
      <Navber />
      <div className="main-content-feedback">
        <Container
          fluid
          className="mt-2"
          style={{ paddingLeft: 0, height: "100%" }}
        >
          <Viewassessmentfile />
        </Container>
      </div>
    </div>
  );
}
