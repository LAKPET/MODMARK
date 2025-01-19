import React, { useState, useEffect } from "react";
import Navber from "../components/Course/Navbar";
import Sidebar from "../components/Course/Sidebar";
import Createcourse from "../components/Course/Createcourse";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../assets/Styles/Course/Coursepage.css";
import Getcourse from "../components/Course/Getcourse";

function Coursepage() {
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Fetch the role from localStorage or context
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const user = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        setUserRole(user.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

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
            <Col className="d-flex justify-content-end">
              {/* Conditionally render Create Course button */}
              {userRole !== "student" && (
                <Button className="mb-4 custom-btn" onClick={handleShowModal}>
                  Create Course
                </Button>
              )}
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

      {/* Create Course Modal */}
      <Createcourse show={showModal} handleClose={handleCloseModal} />
    </div>
  );
}

export default Coursepage;
