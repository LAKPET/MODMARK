import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import "../../../assets/Styles/Course/Getcourse.css";

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

const StyledButton = styled(Button)(({ isSubmitted }) => ({
  color: "white",
  backgroundColor: isSubmitted ? "#71F275" : "#F27171",
  fontSize: "0.875rem",
  textTransform: "none",
  "&:hover": {
    backgroundColor: isSubmitted ? "#60d164" : "#d16060",
  },
}));

export default function CourseDetail() {
  const { id: sectionId } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submittedAssessments, setSubmittedAssessments] = useState({});
  const [uploadingAssessmentId, setUploadingAssessmentId] = useState(null);

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
      fetchSubmittedAssessments();
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

  const fetchSubmittedAssessments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUrl}/submission/student/${sectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const submitted = response.data.reduce((acc, submission) => {
        acc[submission.assessment_id] = true;
        return acc;
      }, {});
      setSubmittedAssessments(submitted);
    } catch (error) {
      console.error("Error fetching submitted assessments:", error);
    }
  };

  // Function to get the next unsubmitted assessment
  const getCurrentAssessment = () => {
    return assessments.find(
      (assessment) => !submittedAssessments[assessment._id]
    );
  };

  const handleFileChange = async (event, assessmentId) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      setUploading(true);
      setUploadingAssessmentId(assessmentId);
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("UserId");
      const formData = new FormData();
      formData.append("file", file);
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
        if (response.ok) {
          setSubmittedAssessments((prev) => ({
            ...prev,
            [assessmentId]: true,
          }));
        } else {
          alert(result.message || "File upload failed.");
        }
      } catch (error) {
        console.error("File upload error:", error);
        alert("An error occurred during file upload.");
      } finally {
        setUploading(false);
        setUploadingAssessmentId(null);
      }
    }
  };

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

  if (errorMessage) {
    return <div className="text-center mt-5 text-danger">{errorMessage}</div>;
  }

  const currentAssessment = getCurrentAssessment();
  const completedCount = Object.keys(submittedAssessments).length;
  const totalAssessments = assessments.length;

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: "#8B5F34", zIndex: theme.zIndex.drawer + 1 })}
        open={uploading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container className="mt-4">
        <Row className="g-4">
          {/* Attendance Card */}
          <Col md={3}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <h5 className="card-title">ส่งงานกี่เปอร์เซ็นต์แล้ว</h5>
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "150px" }}
                >
                  <div
                    className="position-relative"
                    style={{
                      width: "150px",
                      height: "150px",
                      marginTop: "20px",
                    }}
                  >
                    <Gauge
                      width={150}
                      height={150}
                      value={50}
                      cornerRadius="50%"
                      sx={(theme) => ({
                        [`& .${gaugeClasses.valueText}`]: {
                          fontSize: 30,
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                          fill: "#52b202",
                        },
                        [`& .${gaugeClasses.referenceArc}`]: {
                          fill: theme.palette.text.disabled,
                        },
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Overall Score Card */}
          <Col md={3}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <h5 className="card-title">Overall Score</h5>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>max</span>
                    <span>74</span>
                  </div>
                  <hr className="bg-white my-2" style={{ opacity: 0.5 }} />
                  <div className="d-flex justify-content-between mb-2">
                    <span>min</span>
                    <span>30</span>
                  </div>
                  <hr className="bg-white my-2" style={{ opacity: 0.5 }} />
                  <div className="d-flex justify-content-between mb-2">
                    <span>mean</span>
                    <span>52</span>
                  </div>
                  <hr className="bg-white my-2" style={{ opacity: 0.5 }} />
                  <div className="d-flex justify-content-between mb-2">
                    <span>My score</span>
                    <span style={{ color: "#FF6B6B" }}>56</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Assessment Card */}
          <Col md={6}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <h5 className="card-title">Assessment</h5>
                <div className="text-muted mb-3">
                  Progress: {completedCount}/{totalAssessments} assessments
                  completed
                </div>
                {currentAssessment ? (
                  <div className="mt-3">
                    <div className="mb-3 p-3 bg-white rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">
                          {currentAssessment.assessment_name}
                        </span>
                        <StyledButton
                          component="label"
                          role={undefined}
                          variant="contained"
                          tabIndex={-1}
                          isSubmitted={
                            submittedAssessments[currentAssessment._id]
                          }
                          disabled={uploading}
                        >
                          {uploadingAssessmentId === currentAssessment._id
                            ? "Uploading..."
                            : "Un-submit"}
                          <VisuallyHiddenInput
                            type="file"
                            onChange={(e) =>
                              handleFileChange(e, currentAssessment._id)
                            }
                          />
                        </StyledButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">All assessments completed!</p>
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Score Card */}
          <Col md={6}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <h5 className="card-title">Score</h5>
                <div className="mt-3">
                  {assessments.slice(0, 3).map((assessment, index) => (
                    <div
                      key={assessment._id}
                      className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white rounded"
                    >
                      <span>{assessment.assessment_name}</span>
                      <span className="badge bg-light text-dark">-/10</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>

          {/* Feedback Card */}
          <Col md={6}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <h5 className="card-title">Feedback</h5>
                <div className="mt-3">
                  {assessments.slice(0, 3).map((assessment, index) => (
                    <div
                      key={assessment._id}
                      className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white rounded"
                    >
                      <span>{assessment.assessment_name}</span>
                      <i className="fas fa-file-alt"></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
