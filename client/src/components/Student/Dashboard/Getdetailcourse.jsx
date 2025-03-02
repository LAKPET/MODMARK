import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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
                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  style={{
                    marginLeft: "10px",
                    backgroundColor: "green",
                  }}
                >
                  Upload files
                  <VisuallyHiddenInput
                    type="file"
                    onChange={(event) => console.log(event.target.files)}
                    multiple
                  />
                </Button>
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
