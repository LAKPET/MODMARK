import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import "../../../assets/Styles/Dashboard/GetDetail.css";
import { formatDateTime } from "../../../utils/FormatDateTime";

export default function GetAssessmentDetail() {
  const { id, assessmentId } = useParams(); // Assessment ID from the route

  const navigate = useNavigate();
  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${apiUrl}/assessment/${assessmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAssessmentDetails(response.data);
      } catch (err) {
        console.error("Error fetching assessment details:", err);
        setError("Failed to load assessment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [id, apiUrl, navigate]);

  if (loading) {
    return (
      <Backdrop
        sx={(theme) => ({ color: "#8B5F34", zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <Container className="mt-4">
      <Row className="pb-3 mb-4">
        <Col md={8}>
          <h2 className="mb-0 fw-semibold d-flex align-items-center">
            {assessmentDetails.course_id.course_name}
            <span className="vertical-line bg-dark mx-3"></span>
            <span className="fw-normal fs-5">
              {assessmentDetails.section_id.semester_term} /{" "}
              {assessmentDetails.section_id.semester_year}
            </span>
          </h2>
          <div className="d-flex align-items-center">
            <p className="text-muted p-1 mb-0">
              Section {assessmentDetails.section_id.section_number}
            </p>
          </div>
        </Col>
        <Col md={4} className="text-end">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/student/submit-assessment/${id}`)}
          >
            ส่งงาน
          </button>
        </Col>
      </Row>

      <Row className="mb-4 text-dark">
        <Col md={6}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Assessment</h5>
          <p>
            <strong>Name:</strong> {assessmentDetails.assessment_name}
          </p>
          <p>
            <strong>Description:</strong>{" "}
            {assessmentDetails.assessment_description}
          </p>
          <p>
            <strong>Type:</strong> {assessmentDetails.assignment_type}
          </p>
          <p>
            <strong>Publish Date:</strong>{" "}
            {formatDateTime(assessmentDetails.publish_date)}
          </p>
          <p>
            <strong>Due Date:</strong>{" "}
            {formatDateTime(assessmentDetails.due_date)}
          </p>
        </Col>
        <Col md={6}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Grader</h5>
          {assessmentDetails.graders.map((grader) => (
            <p key={grader._id}>
              <strong>Name:</strong> {grader.user_id.first_name}{" "}
              {grader.user_id.last_name} <br />
              <strong>Email:</strong> {grader.user_id.email} <br />
              <strong>Role:</strong> {grader.user_id.role} <br />
              <strong>Weight:</strong> {grader.weight * 100}%
            </p>
          ))}
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h5 className="pb-3 mb-4 short-border fw-semibold">
            Rubric Criteria
          </h5>
          <MDBTable>
            <MDBTableHead>
              <tr className="fw-bold">
                <th>Criteria</th>
                <th>Weight</th>
                <th>Levels</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {assessmentDetails.rubric_id.criteria.map((criterion) => (
                <tr key={criterion._id}>
                  <td>{criterion.name}</td>
                  <td>{criterion.weight}%</td>
                  <td>
                    {criterion.levels.map((level) => (
                      <div key={level._id}>
                        <strong>Level {level.level}:</strong>{" "}
                        {level.description} (Score: {level.score})
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </Col>
      </Row>
    </Container>
  );
}
