import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import PDFReviewer from "./PDFReviewer";

export default function Viewassessmentfile() {
  const { id, fileUrl, assessmentId } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(-1);

  // มีการเพิ่ม dependency ใน useEffect เพื่อให้โหลดข้อมูลใหม่เมื่อ parameters เปลี่ยน
  useEffect(() => {
    // Reset states when params change
    setPdfUrl(null);
    setError(null);
    setLoading(true);
    setSubmissionInfo(null);

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

        console.log("All submissions:", submissionsResponse.data);

        // Store all submissions
        setAllSubmissions(submissionsResponse.data);

        // ปรับปรุงการค้นหา submission ที่ตรงกับ fileUrl ที่ส่งมา
        // Check if fileUrl already contains the 'PDF/' prefix
        const normalizedFileUrl = fileUrl.startsWith("PDF/")
          ? fileUrl
          : `PDF/${fileUrl}`;
        const decodedFileUrl = decodeURIComponent(normalizedFileUrl);
        console.log("Searching for file URL:", decodedFileUrl);

        // หา submission ที่ตรงกับ fileUrl
        let submission = submissionsResponse.data.find(
          (sub) => decodeURIComponent(sub.file_url) === decodedFileUrl
        );

        // หากไม่พบ ลองตัด PDF/ ออกและค้นหาอีกครั้ง
        if (!submission) {
          const alternativeFileUrl = decodedFileUrl.replace(/^PDF\//, "");
          console.log("Trying alternative URL:", alternativeFileUrl);
          submission = submissionsResponse.data.find((sub) =>
            sub.file_url.includes(alternativeFileUrl)
          );
        }

        if (!submission) {
          console.error("Submission not found. File URL:", fileUrl);
          throw new Error("Submission not found. Please check the file URL.");
        }

        console.log("Found submission:", submission);

        // Find the index of the current submission
        const submissionIndex = submissionsResponse.data.findIndex(
          (sub) => sub._id === submission._id
        );
        setCurrentSubmissionIndex(submissionIndex);

        // ดึงข้อมูล PDF
        // Extract filename from file_url
        const filename = submission.file_url;
        console.log("Extracted filename:", filename);

        // Send filename to the new API to get the file URL
        const fileResponse = await axios.post(
          "http://localhost:5001/submission/pdf/file",
          { filename },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!fileResponse.data || !fileResponse.data.fileUrl) {
          throw new Error("Failed to retrieve file URL.");
        }

        const pdfUrl = fileResponse.data.fileUrl;
        console.log("Retrieved PDF URL:", pdfUrl);
        setPdfUrl(pdfUrl);

        // Set the submission info with the complete data
        const submissionData = {
          assessment_id: submission.assessment_id._id,
          assessment_name: submission.assessment_id.assessment_name,
          submission_id: submission._id,
          group_id: submission.group_id?._id,
          group_name: submission.group_id?.group_name,
          student_id: submission.student_id?._id,
          student_info: submission.student_id
            ? {
                personal_num: submission.student_id.personal_num,
                email: submission.student_id.email,
                first_name: submission.student_id.first_name,
                last_name: submission.student_id.last_name,
              }
            : null,
          file_url: submission.file_url,
          file_type: submission.file_type,
          status: submission.status,
          grading_status: submission.grading_status,
          submitted_at: submission.submitted_at,
        };
        console.log("Setting submission info:", submissionData);
        setSubmissionInfo(submissionData);

        // Important: Set loading to false after everything is loaded
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError("Error loading submission data.");
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [id, assessmentId, apiUrl, fileUrl]); // fileUrl added as dependency to reload on navigation

  const handlePrevious = () => {
    if (currentSubmissionIndex > 0) {
      const prevSubmission = allSubmissions[currentSubmissionIndex - 1];
      // แสดงสถานะ loading ก่อนเปลี่ยนหน้า
      setLoading(true);

      // ดึงเอาเฉพาะชื่อไฟล์จาก file_url โดยตัด PDF/ ออกถ้ามี
      const rawFileUrl = prevSubmission.file_url;
      const fileUrlParam = rawFileUrl.startsWith("PDF/")
        ? rawFileUrl.substring(4)
        : rawFileUrl;

      console.log("Navigating to previous submission:", fileUrlParam);

      // สร้าง URL สำหรับ navigate
      const newRoute = `/professor/viewassessment/${id}/PDF/${encodeURIComponent(fileUrlParam)}/${assessmentId}`;
      console.log("New route:", newRoute);

      // นำทางไปยังหน้าใหม่
      navigate(newRoute);
    }
  };

  const handleNext = () => {
    if (currentSubmissionIndex < allSubmissions.length - 1) {
      const nextSubmission = allSubmissions[currentSubmissionIndex + 1];
      // แสดงสถานะ loading ก่อนเปลี่ยนหน้า
      setLoading(true);

      // ดึงเอาเฉพาะชื่อไฟล์จาก file_url โดยตัด PDF/ ออกถ้ามี
      const rawFileUrl = nextSubmission.file_url;
      const fileUrlParam = rawFileUrl.startsWith("PDF/")
        ? rawFileUrl.substring(4)
        : rawFileUrl;

      console.log("Navigating to next submission:", fileUrlParam);

      // สร้าง URL สำหรับ navigate
      const newRoute = `/professor/viewassessment/${id}/PDF/${encodeURIComponent(fileUrlParam)}/${assessmentId}`;
      console.log("New route:", newRoute);

      // นำทางไปยังหน้าใหม่
      navigate(newRoute);
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
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirstSubmission={currentSubmissionIndex === 0}
        isLastSubmission={currentSubmissionIndex === allSubmissions.length - 1}
      />
    </Container>
  );
}
