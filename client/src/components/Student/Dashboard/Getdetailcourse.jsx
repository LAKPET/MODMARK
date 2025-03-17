import React, { useState, useEffect } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import InputFileUpload from "../../../controls/InputFileUpload";

export default function CourseDetail() {
  const { id: sectionId } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!sectionId) {
      setErrorMessage("No section ID found in the URL.");
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

        const courseResponse = await axios.get(
          `${apiUrl}/course/details/${sectionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourseDetails(courseResponse.data);
      } catch (error) {
        setErrorMessage("An error occurred while loading course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [sectionId, navigate]);

  useEffect(() => {
    if (sectionId) {
      fetchAssessments();
    }
  }, [sectionId]);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUrl}/assessment/section/${sectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssessments(response.data);
    } catch (error) {
      setErrorMessage("An error occurred while retrieving assessments.");
    }
  };

  const handleFileChange = (event, assessmentId) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      setSelectedFiles((prevFiles) => ({
        ...prevFiles,
        [assessmentId]: file,
      }));
    }
  };

  const handleSubmit = async (assessmentId) => {
    if (!selectedFiles[assessmentId]) return;

    setUploading(true);
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("UserId");
    const formData = new FormData();
    formData.append("file", selectedFiles[assessmentId]);
    formData.append("assessment_id", assessmentId);
    formData.append("group_name", "Group1");
    formData.append("members", JSON.stringify([{ user_id: userId }]));
    formData.append("file_type", "pdf");
    formData.append("section_id", sectionId);

    try {
      const response = await fetch(`${apiUrl}/submission/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      console.log("Upload response:", result);
      if (response.ok) {
        alert("File uploaded successfully!");
        setSelectedFiles((prevFiles) => ({
          ...prevFiles,
          [assessmentId]: null,
        }));
      } else {
        alert(result.message || "File upload failed.");
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("An error occurred during file upload.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (errorMessage) {
    return <div className="text-center mt-5 text-danger">{errorMessage}</div>;
  }

  return (
    <Container className="mt-4">
      <Row className="pb-3 mb-4">
        <Col md={8}>
          <h4>Course Overview</h4>
        </Col>
      </Row>

      <Row className="mb-4 text-dark">
        <Col md={8}>
          <h5>Overall Score</h5>
        </Col>
        <Col md={4}>
          {assessments.length > 0 ? (
            assessments.map((assessment) => (
              <div key={assessment._id} className="mb-3">
                <span>{assessment.assessment_name}</span>
                <InputFileUpload
                  onChange={(event) => handleFileChange(event, assessment._id)}
                />
                <Button
                  variant="primary"
                  className="mt-2"
                  onClick={() => handleSubmit(assessment._id)}
                  disabled={!selectedFiles[assessment._id] || uploading}
                >
                  {uploading ? "Uploading..." : "Submit File"}
                </Button>
              </div>
            ))
          ) : (
            <p>No assessments available.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}
