import React from "react";
import Navber from "../../components/Student/Course/Navbar";
import Sidebar from "../../components/Student/Course/Sidebar";
import { Container, Row, Col } from "react-bootstrap";
import "../../assets/Styles/Course/Coursepage.css";
import Getcourse from "../../components/Student/Course/Getcourse";

function Coursepage() {
  return (
    <div>
      {/* Sidebar */}
      <Sidebar />

      {/* Navbar */}
      <Navber />

      {/* Main Content */}
      <div className="main-content">
        <Container className="mt-2">
          <Row className="align-items-center">
            <Col className="d-flex justify-content-start">
              <h3 className="fw-bold">My Course</h3>
            </Col>
          </Row>
          <Row>
            <Col className="space"></Col>
          </Row>
          <Row>
            <Col>
              <Getcourse />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default Coursepage;
