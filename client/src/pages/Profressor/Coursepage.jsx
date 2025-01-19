import React, { useState } from "react";
import Navber from "../../components/Profressor/Course/Navbar";
import Sidebar from "../../components/Profressor/Course/Sidebar";
import Createcourse from "../../components/Profressor/Course/Createcourse";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../../assets/Styles/Course/Coursepage.css";
import Getcourse from "../../components/Profressor/Course/Getcourse";
import { useAuth } from "../../routes/AuthContext";

function Coursepage() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

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
              {user && user.role === "professor" && (
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
      {user && user.role === "professor" && (
        <Createcourse show={showModal} handleClose={handleCloseModal} />
      )}
    </div>
  );
}

export default Coursepage;
