import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button, Modal, Form, Nav } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/Styles/DashboardPage.css";

export default function GetDetailCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("detail"); // Default to Assessment Detail tab
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState("Individual");
  const [gradingType, setGradingType] = useState("Individual");
  const [publishDate, setPublishDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No section ID found in the URL.");
      setLoading(false);
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5001/course/details/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCourseDetails(response.data);
      } catch (error) {
        setError("Error loading course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, navigate]);

  const handleNext = () => {
    setActiveTab("rubric");
  };

  const handleCreateAssessment = () => {
    console.log({
      assessmentName,
      assessmentDescription,
      assessmentType,
      gradingType,
      publishDate,
      dueDate,
    });

    setShowModal(false);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <Container className="mt-4">
      <Row className="pb-3 mb-4">
        <Col md={8}>
          <h2 className="mb-0 fw-semibold d-flex align-items-center">
            {courseDetails.course_number}
            <span className="vertical-line bg-dark mx-3"></span>
            <span className="fw-normal fs-5">
              {courseDetails.section_term} / {courseDetails.section_year}
            </span>
          </h2>
          <div className="d-flex align-items-center">
            <p className="text-muted p-1 mb-0">{courseDetails.course_name}</p>
            <span className="text-muted p-1">{`Section ${courseDetails.section_name}`}</span>
          </div>
        </Col>
      </Row>

      <Row className="mb-4 text-dark">
        <Col md={8}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Description</h5>
          <p>{courseDetails.course_description}</p>
        </Col>
        <Col md={4}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Team</h5>
          <p className="text-muted">No team information available.</p>
        </Col>
      </Row>

      <Row className="text-center mt-5">
        <Col>
          <h3 className="mb-4 fw-semibold fs-2">No Assessments Available</h3>
          <h3 className="mb-4 fw-normal">Create an assessment to get started</h3>
          <Button className="custom-btn mt-2" onClick={() => setShowModal(true)}>
            Create Assessment
          </Button>
        </Col>
      </Row>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Assessment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={(selectedKey) => setActiveTab(selectedKey)}
            className="mb-4"
          >
            <Nav.Item>
              <Nav.Link eventKey="detail">1 ASSESSMENT DETAIL</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="rubric">2 CREATE RUBRIC</Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === "detail" && (
            <Form>
              <div className="mb-4">
                <Form.Label>Assessment Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., CPE XXX"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <Form.Label>Assessment Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add description here"
                  value={assessmentDescription}
                  onChange={(e) => setAssessmentDescription(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <Form.Label>Assessment Type</Form.Label>
                <Form.Select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                >
                  <option>Individual</option>
                  <option>Group</option>
                </Form.Select>
              </div>

              <div className="mb-4">
                <Form.Label>Grading Type</Form.Label>
                <Form.Select
                  value={gradingType}
                  onChange={(e) => setGradingType(e.target.value)}
                >
                  <option>Individual</option>
                  <option>Team</option>
                </Form.Select>
              </div>

              <Row>
                <Col>
                  <Form.Label>Publish Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </Col>
              </Row>
              <Button
                variant="primary"
                className="mt-3"
                onClick={handleNext}
              >
                Next
              </Button>
            </Form>
          )}

          {activeTab === "rubric" && (
            <div>
              <Form.Group className="mb-4">
                <Form.Label>Select Your Rubric</Form.Label>
                <Form.Select>
                  <option>Rubric 1</option>
                  <option>Rubric 2</option>
                  <option>Rubric 3</option>
                </Form.Select>
              </Form.Group>

              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>20 pts</th>
                    <th>10 pts</th>
                    <th>0 pts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>20 pts</strong>
                      <p>Lorem ipsum dolor sit amet.</p>
                      <p>Advanced: ipsum dolor sit amet consectetur.</p>
                    </td>
                    <td>
                      <strong>10 pts</strong>
                      <p>Proficient: ipsum dolor sit amet consectetur.</p>
                    </td>
                    <td>
                      <strong>0 pts</strong>
                      <p>No Evidence: ipsum dolor sit amet consectetur.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <Button
                variant="primary"
                className="mt-3"
                onClick={handleCreateAssessment}
              >
                Create Assessment
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            className="custom-btn"
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
