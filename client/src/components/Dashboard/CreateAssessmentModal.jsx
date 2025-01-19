import React, { useState } from "react";
import { Modal, Form, Button, Nav, Row, Col } from "react-bootstrap";
import "../../assets/Styles/Dashboard/CreateAssessment.css";
export default function CreateAssessmentModal({ show, handleClose }) {
  const [activeTab, setActiveTab] = useState("detail");
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState("Individual");
  const [gradingType, setGradingType] = useState("Individual");
  const [publishDate, setPublishDate] = useState("");
  const [dueDate, setDueDate] = useState("");

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

    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
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
            <Button variant="primary" className="mt-3" onClick={handleNext}>
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
          onClick={handleClose}
          className="custom-btn"
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
