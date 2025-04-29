import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../assets/Styles/Assessment/Getassessment.css";
import { formatDateTime } from "../../../utils/FormatDateTime";
import { sortAssessments } from "../../../utils/SortAssessment";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { Alert } from "@mui/material";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function GetStudentScoreAndFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const currentProfessorId = localStorage.getItem("UserId");

  const handleSort = (column) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);
  };

  const sortedAssessments = sortAssessments(assessments, sortColumn, sortOrder);

  const refreshAssessments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("authToken");
      const assessmentResponse = await axios.get(
        `${apiUrl}/assessment/section/${id}/student-submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssessments(assessmentResponse.data);
    } catch (err) {
      setError("Error loading data.");
    } finally {
      if (showLoading) setLoading(false);
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
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <Container className="mt-4">
      <Row className="pb-3 mb-4">
        <Col md={8}>
          <h2 className="mb-0 fw-semibold d-flex align-items-center">
            {courseDetails?.course_number}
            <span className="vertical-line bg-dark mx-3"></span>
            <span className="fw-normal fs-5">
              {courseDetails?.semester_term} / {courseDetails?.semester_year}
            </span>
          </h2>
          <div className="d-flex align-items-center">
            <p className="text-muted p-1 mb-0">{courseDetails?.course_name}</p>
            <span className="text-muted p-1">{`Section ${courseDetails?.section_number}`}</span>
          </div>
        </Col>
      </Row>
      <MDBTable className="table-hover">
        <MDBTableHead>
          <tr className="fw-bold">
            <th
              onClick={() => handleSort("assessment_name")}
              className="sortable"
            >
              Assessment Name <SwapVertIcon />
            </th>
            <th
              onClick={() => handleSort("submission_date")}
              className="sortable"
            >
              Submission Date <SwapVertIcon />
            </th>
            <th onClick={() => handleSort("score")} className="sortable">
              Score <SwapVertIcon />
            </th>
            <th>Feedback</th>
          </tr>
        </MDBTableHead>

        <MDBTableBody>
          {sortedAssessments.length > 0 ? (
            sortedAssessments.map((assessment, index) => {
              const hasGradingPermission = assessment.grading_status_by?.some(
                (status) => status.professor_id === currentProfessorId
              );
              return (
                <tr key={assessment._id || index}>
                  <td>
                    <div className="align-status">
                      <span className="assessment-name">
                        {assessment.assessment_name}
                      </span>
                      <span className="assignment_type-status">
                        {assessment.assignment_type}
                      </span>
                    </div>
                  </td>
                  <td>{formatDateTime(assessment.submission_date)}</td>
                  <td>{assessment.score || "Not graded"}</td>
                  <td>{assessment.feedback || "No feedback yet"}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No submissions found
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>
      {!hasGradingPermission && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You don't have permission to grade this assessment.
        </Alert>
      )}
      {hasGradingPermission && (
        <IconButton
          onClick={handleSubmitScores}
          sx={{
            backgroundColor: "#8B5F34",
            color: "white",
            "&:hover": {
              backgroundColor: "#6B4A2A",
            },
          }}
        >
          <SendIcon />
        </IconButton>
      )}
    </Container>
  );
}
