import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../../components/Student/Dashboard/Sidebar";
import Navber from "../../components/Student/Dashboard/Navbar";
import GetDetailCourse from "../../components/Student/Dashboard/Getdetailcourse";
import "../../styles/Main.css";
export default function Dashboardpage_stu() {
  const { id } = useParams();
  return (
    <div>
      <Sidebar />
      <Navber />
      <div className="main-content">
        <Container className="mt-2">
          <Row className="align-items-center">
            <Col className="d-flex justify-content-start">
              <h3 className="fw-bold">My Dashboard</h3>
            </Col>
          </Row>
          <Row>
            <Col className="space"></Col>
          </Row>
          <Row>
            <Col>
              <GetDetailCourse id={id} />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
