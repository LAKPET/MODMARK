import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PDFReviewer from "./PDFReviewer";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { Alert } from "@mui/material";

export default function ViewStudentPDF() {
  const { id, fileUrl, assessmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [rubricData, setRubricData] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // First, fetch the submission data
        const submissionResponse = await axios.get(
          `${apiUrl}/submission/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const submission = submissionResponse.data.find(
          (sub) => sub.student_id._id === localStorage.getItem("UserId")
        );

        if (!submission) {
          throw new Error("Submission not found");
        }

        // Get the rubric ID from submission's assessment data
        const rubricId = submission.assessment_id.rubric_id;
        if (!rubricId) {
          throw new Error("No rubric found for this assessment");
        }

        // Fetch rubric data using the rubric ID
        const rubricResponse = await axios.get(`${apiUrl}/rubric/${rubricId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRubricData(rubricResponse.data);

        setSubmissionInfo({
          submission_id: submission._id,
          assessment_id: assessmentId,
          file_url: fileUrl,
          student_id: submission.student_id,
          assessment: submission.assessment_id,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, fileUrl, assessmentId, navigate]);

  if (loading) {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!submissionInfo) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No submission data available
      </Alert>
    );
  }

  return (
    <PDFReviewer
      fileUrl={fileUrl}
      submissionId={submissionInfo.submission_id}
      submissionInfo={submissionInfo}
      rubricData={rubricData}
      onClose={() => navigate(-1)}
    />
  );
}
