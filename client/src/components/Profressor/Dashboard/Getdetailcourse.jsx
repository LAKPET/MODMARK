import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../assets/Styles/Dashboard/GetDetail.css";
import CreateAssessmentModal from "./CreateAssessmentModal";

export default function GetDetailCourse() {
  const { id } = useParams();

  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [showModal, setShowModal] = useState(false);

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

        const response = await axios.get(`${apiUrl}/course/details/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCourseDetails(response.data);
        console.log(response.data);
      } catch (error) {
        setError("Error loading course details.");
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
            <span className="text-muted p-1">{`Section ${courseDetails.section_number}`}</span>
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
          <p className="text-muted">
            {courseDetails.professors && courseDetails.professors.length > 0
              ? courseDetails.professors.map((professor, index) => (
                  <span key={index}>
                    {index > 0 && ", "}
                    Prof. {professor.first_name} {professor.last_name}
                  </span>
                ))
              : "No professor assigned"}
          </p>
        </Col>
      </Row>

      <Row className="text-center mt-5">
        <Col className="mt-5">
          <h3 className="mb-4 fw-semibold fs-2">No Assessments Available</h3>
          <h3 className="mb-4 fw-normal">
            Create an assessment to get started
          </h3>
          <Button
            className="custom-btn mt-2"
            onClick={() => setShowModal(true)}
          >
            Create Assessment
          </Button>
        </Col>
      </Row>

      <CreateAssessmentModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        courseDetails={courseDetails}
      />
    </Container>
  );
}
