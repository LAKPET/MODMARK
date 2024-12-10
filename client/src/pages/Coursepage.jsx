import React from "react";
import Navber from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../assets/Styles/Coursepage.css";

function Coursepage() {
  return (
    <div>
      {/* Sidebar */}
      <Sidebar />

      {/* Navbar */}
      <Navber />

      {/* Main Content */}
      <div className="main-content">
        <Container>
          <Row className="align-items-center">
            <Col className="d-flex justify-content-start">
              <h3>My Course</h3>
            </Col>
            <Col className="d-flex justify-content-end">
              <Button className="mb-4 custom-btn">Create Course</Button>
            </Col>
          </Row>
          <Row>
            <Col className="space"></Col>
          </Row>
          <Row>
            <Col>
              <div className="content-box">
                <p>Welcome to System</p>
                <p>for collaborative grading and delivery feedback</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default Coursepage;
