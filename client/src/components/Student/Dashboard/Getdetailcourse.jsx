import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import InputFileUpload from "../../../controls/InputFileUpload"; // Import InputFileUpload component

export default function GetDetailCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const refreshAssessments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const assessmentResponse = await axios.get(
        `${apiUrl}/assessment/section/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssessments(assessmentResponse.data);
    } catch (err) {
      setError("Error loading data.");
    }
  };

  useEffect(() => {
    if (!id) {
      setError("No section ID found in the URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }
        const courseResponse = await axios.get(
          `${apiUrl}/course/details/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourseDetails(courseResponse.data);
        await refreshAssessments();
      } catch (err) {
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleFileUpload = async (event, assessmentId) => {
    const file = event.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("UserId"); // Retrieve user ID from local storage
    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("assessment_id", assessmentId);
    formdata.append("group_name", "Group1");
    formdata.append("members", JSON.stringify([{ user_id: userId }]));
    formdata.append("file_type", "pdf"); // Use the correct file type value
    formdata.append("section_id", id); // Add section ID to the form data

    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `${apiUrl}/submission/submit`,
        requestOptions
      );
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <Container className="mt-4">
      <Row className="pb-3 mb-4">
        <Col md={8}>dash1</Col>
      </Row>

      <Row className="mb-4 text-dark">
        <Col md={8}>Overall Score</Col>
        <Col md={4}>
          {assessments.length > 0 ? (
            assessments.map((assessment) => (
              <div key={assessment._id}>
                {assessment.assessment_name}
                <InputFileUpload
                  onChange={(event) => handleFileUpload(event, assessment._id)}
                />
              </div>
            ))
          ) : (
            <div>No assessments found</div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
