import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../assets/Styles/Assessment/Getassessment.css";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { formatDateTime } from "../../../utils/FormatDateTime"; // นำเข้า formatDateTime

export default function GetStudentScoreAndFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState([]);
  const [statisticsData, setStatisticsData] = useState([]);
  const [submissionData, setSubmissionData] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null); // State สำหรับเก็บข้อมูล submission ที่เลือก

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        // Fetch scores
        const scoresResponse = await axios.get(
          `${apiUrl}/assessment/scores/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch statistics
        const statisticsResponse = await axios.get(
          `${apiUrl}/assessment/statistics/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch submissions for each assessment_id
        const submissionsData = await Promise.all(
          scoresResponse.data.map(async (score) => {
            const submissionResponse = await axios.get(
              `${apiUrl}/submission/assessment/${score.assessment_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return submissionResponse.data;
          })
        );

        setScoreData(scoresResponse.data);
        setStatisticsData(statisticsResponse.data.assessments_statistics);
        setSubmissionData(submissionsData.flat()); // Flatten the array of submissions
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  // Combine scoreData, statisticsData, and submissionData
  const combinedData = scoreData.map((score) => {
    const stats = statisticsData.find(
      (stat) => stat.assessment_id === score.assessment_id
    );
    const submission = submissionData.find(
      (sub) => sub.assessment_id._id === score.assessment_id
    );
    return {
      ...score,
      max_score: stats?.max_score || 0,
      min_score: stats?.min_score || 0,
      mean_score: stats?.mean_score || 0,
      submission_date: submission?.submitted_at
        ? formatDateTime(submission.submitted_at) // ใช้ formatDateTime
        : "N/A",
      pdf_link: submission?.file_url
        ? `${apiUrl}/files/${submission.file_url}`
        : null,
    };
  });

  const handleViewPDF = (submission) => {
    setSelectedSubmission(submission); // เก็บข้อมูล submission ที่เลือก
  };

  const handleClosePDF = () => {
    setSelectedSubmission(null); // ปิด PDF Viewer
  };

  return (
    <Container className="mt-4">
      <Row className="pb-3 mb-4">
        <Col md={8}>
          <h2 className="mb-0 fw-semibold">Score and Feedback</h2>
        </Col>
      </Row>
      {selectedSubmission ? (
        <PDFReviewer
          fileUrl={selectedSubmission.pdf_link}
          submissionId={selectedSubmission._id}
          assessmentId={selectedSubmission.assessment_id}
          rubricId={selectedSubmission.rubric_id} // ใช้ rubric_id
          onClose={handleClosePDF}
        />
      ) : (
        <MDBTable className="table-hover">
          <MDBTableHead>
            <tr className="fw-bold">
              <th>Assessment Name</th>
              <th>Score Received</th>
              <th>Max</th>
              <th>Min</th>
              <th>Mean</th>
              <th>Submission Date</th>
              <th>Actions</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {combinedData.length > 0 ? (
              combinedData.map((data) => (
                <tr key={data.assessment_id}>
                  <td>{data.assessment_name}</td>
                  <td>
                    {data.student_score !== null
                      ? data.student_score
                      : "Not graded"}
                  </td>
                  <td>{data.max_score}</td>
                  <td>{data.min_score}</td>
                  <td>{data.mean_score}</td>
                  <td>{data.submission_date}</td>
                  <td>
                    {data.pdf_link ? (
                      <Button
                        onClick={() =>
                          navigate(
                            `/student/view-pdf/${id}/${encodeURIComponent(
                              data.pdf_link.split("/").pop()
                            )}/${data.assessment_id}`
                          )
                        }
                        className="custom-btn"
                      >
                        View PDF
                      </Button>
                    ) : (
                      "No file"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </MDBTableBody>
        </MDBTable>
      )}
    </Container>
  );
}
