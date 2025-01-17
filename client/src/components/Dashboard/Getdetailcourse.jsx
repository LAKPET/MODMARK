import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/Styles/DashboardPage.css";

export default function Getdetailcourse() {
  const { id } = useParams(); // Section ID from URL
  const navigate = useNavigate(); // For redirection
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Store error messages

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
          // Redirect to login if no token is found
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
        console.error(
          "Error fetching course details:",
          error.response?.data || error.message
        );
        setError("Error loading course details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, navigate]);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  if (!courseDetails) {
    return (
      <div className="text-center mt-5 text-danger">
        No course details found.
      </div>
    );
  }

  return (
    <Container className="mt-4">
      {/* Course Header */}
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

      {/* Course Description */}
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

      {/* Assessment Section */}
      <Row className="text-center mt-5">
        <Col>
          <h3 className="mb-4 fw-semibold fs-2">
            You Currently have no Assessments.
          </h3>
          <h3 className="mb-4 fw-normal">
            Create an assessment to get started
          </h3>
          <Button className="custom-btn mt-2">Create Assessment</Button>
        </Col>
      </Row>
    </Container>
  );
}
