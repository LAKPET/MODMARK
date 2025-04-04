import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import PDFReviewer from "./PDFReviewer";

export default function ViewAssessmentFile() {
  const { id, fileUrl, assessmentId } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionInfo, setSubmissionInfo] = useState(null);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("Fetching data with params:", {
          id,
          fileUrl,
          assessmentId,
        });

        // First, fetch the submission data from the assessment endpoint
        const submissionsResponse = await axios.get(
          `${apiUrl}/submission/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("All submissions testtt:", submissionsResponse.data);
        console.log("Looking for submission with fileUrl:", fileUrl);

        // Find the specific submission that matches our fileUrl
        const submission = submissionsResponse.data.find(
          (sub) => sub.file_url === fileUrl
        );

        console.log("Found submission:", submission);

        if (!submission) {
          throw new Error("Submission not found");
        }

        // Now fetch the PDF using the submission data
        const pdfRequestData = {
          assessment_id: submission.assessment_id._id,
          submission_id: submission._id,
          group_id: submission.group_id._id,
          student_id: submission.student_id._id,
          file_url: submission.file_url,
        };
        console.log("PDF request data:", pdfRequestData);

        // Fetch PDF directly from the uploads directory
        const pdfResponse = await axios.get(
          `${apiUrl}/submission/pdf/${submission.file_url}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "arraybuffer",
          }
        );

        if (!pdfResponse.data || pdfResponse.data.byteLength === 0) {
          throw new Error("Empty PDF file received.");
        }

        // Create a blob from the array buffer
        const pdfBlob = new Blob([pdfResponse.data], {
          type: "application/pdf",
        });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);

        // Set the submission info with the complete data
        const submissionData = {
          assessment_id: submission.assessment_id._id,
          assessment_name: submission.assessment_id.assessment_name,
          submission_id: submission._id,
          group_id: submission.group_id._id,
          group_name: submission.group_id.group_name,
          student_id: submission.student_id._id,
          student_info: {
            personal_num: submission.student_id.personal_num,
            email: submission.student_id.email,
            first_name: submission.student_id.first_name,
            last_name: submission.student_id.last_name,
          },
          file_url: submission.file_url,
          file_type: submission.file_type,
          status: submission.status,
          grading_status: submission.grading_status,
          submitted_at: submission.submitted_at,
        };
        console.log("Setting submission info:", submissionData);
        setSubmissionInfo(submissionData);
      } catch (err) {
        console.error("Error fetching data:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError("Error loading submission data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [id, assessmentId, apiUrl, fileUrl]);

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

  if (!pdfUrl) {
    return <div className="text-center mt-5">Loading PDF...</div>;
  }

  return (
    <Container fluid className="p-0 " style={{ height: "100vh" }}>
      <PDFReviewer
        fileUrl={pdfUrl}
        submissionId={submissionInfo.submission_id}
        assessmentId={assessmentId}
        submissionInfo={submissionInfo}
      />
    </Container>
  );
}
