import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Button } from "react-bootstrap";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { formatDateTime } from "../../../utils/FormatDateTime";
import { getStatusColor } from "../../../utils/StatusColor";
import { sortSubmissions } from "../../../utils/SortSubmission";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import "../../../assets/Styles/Assessment/Getassessment.css";

export default function Getassessmentuser() {
  const { id, assessmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [assessmentType, setAssessmentType] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSort = (column) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);
  };

  const sortedSubmissions = sortSubmissions(submissions, sortColumn, sortOrder);

  useEffect(() => {
    // Get user ID from localStorage
    const userId = localStorage.getItem("UserId");
    if (userId) {
      setCurrentUserId(userId);
      console.log("Current user ID from localStorage:", userId);
    }
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${apiUrl}/submission/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Submissions data:", response.data);
        setSubmissions(response.data);

        // Fetch assessment type
        const assessmentResponse = await axios.get(
          `${apiUrl}/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAssessmentType(assessmentResponse.data.assignment_type);
      } catch (err) {
        setError("Error loading submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assessmentId]);

  const handleViewPdf = (fileUrl) => {
    navigate(`/professor/viewassessment/${id}/${fileUrl}/${assessmentId}`);
  };

  const getUserGradingStatus = (submission) => {
    if (!currentUserId || !submission.grading_status_by) return "pending";

    console.log("Checking submission:", submission._id);
    console.log("Current user ID:", currentUserId);
    console.log("Grading status by:", submission.grading_status_by);

    // Find the status for the current user
    const userStatus = submission.grading_status_by.find(
      (status) => status.grader_id === currentUserId
    );

    console.log("Found status:", userStatus);

    return userStatus ? userStatus.status : "pending";
  };

  const formatGroupMemberNames = (members) => {
    if (!members || members.length === 0) return "No members";
    return members
      .map(
        (member) => `${member.user_id.first_name} ${member.user_id.last_name}`
      )
      .join("\n");
  };

  const formatGroupMemberEmails = (members) => {
    if (!members || members.length === 0) return "No members";
    return members.map((member) => member.user_id.email).join("\n");
  };

  const formatGroupMemberPersonalNums = (members) => {
    if (!members || members.length === 0) return "No members";
    return members.map((member) => member.user_id.personal_num).join("\n");
  };

  // Add this function to calculate submission status
  const getSubmissionStatus = (submissionDate, dueDate) => {
    return new Date(submissionDate) > new Date(dueDate) ? "late" : "on time";
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

  return (
    <Container className="mt-4">
      <Row className="pb-3 mb-4">
        <Col md={8}>
          <h3 className="mb-0 fw-semibold d-flex align-items-center">
            Assessment Submissions
          </h3>
        </Col>
      </Row>
      <MDBTable className="table-hover">
        <MDBTableHead>
          <tr className="fw-bold">
            {assessmentType === "group" ? (
              <>
                <th
                  onClick={() => handleSort("group_name")}
                  className="sortable"
                >
                  Group Name <SwapVertIcon />
                </th>
                <th>Personal Num</th>
                <th>Group Members</th>
                <th>Emails</th>
                <th
                  onClick={() => handleSort("submitted_at")}
                  className="sortable"
                >
                  Submission Date <SwapVertIcon />
                </th>
                <th>Grading Status</th>
                <th></th>
              </>
            ) : (
              <>
                <th
                  onClick={() => handleSort("personal_num")}
                  className="sortable"
                >
                  User ID <SwapVertIcon />
                </th>
                <th
                  onClick={() => handleSort("first_name")}
                  className="sortable"
                >
                  First Name <SwapVertIcon />
                </th>
                <th
                  onClick={() => handleSort("last_name")}
                  className="sortable"
                >
                  Last Name <SwapVertIcon />
                </th>
                <th onClick={() => handleSort("email")} className="sortable">
                  Email <SwapVertIcon />
                </th>
                <th
                  onClick={() => handleSort("submitted_at")}
                  className="sortable"
                >
                  Submission Date <SwapVertIcon />
                </th>
                <th
                  onClick={() => handleSort("grading_status")}
                  className="sortable"
                >
                  Grading Status <SwapVertIcon />
                </th>
                <th></th>
              </>
            )}
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {sortedSubmissions.length > 0 ? (
            sortedSubmissions.map((submission) => (
              <tr key={submission._id}>
                {assessmentType === "group" ? (
                  <>
                    <td>{submission.group_id?.group_name || "N/A"}</td>
                    <td style={{ whiteSpace: "pre-line" }}>
                      {formatGroupMemberPersonalNums(
                        submission.group_members || []
                      )}
                    </td>
                    <td style={{ whiteSpace: "pre-line" }}>
                      {formatGroupMemberNames(submission.group_members || [])}
                    </td>
                    <td style={{ whiteSpace: "pre-line" }}>
                      {formatGroupMemberEmails(submission.group_members || [])}
                    </td>
                    <td>
                      {formatDateTime(submission.submitted_at)}{" "}
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: "transparent", // ไม่มีพื้นหลัง
                          color:
                            getSubmissionStatus(
                              submission.submitted_at,
                              submission.assessment_id.due_date
                            ) === "late"
                              ? "#FFA500" // สีส้ม
                              : "#3b82f6",
                          border:
                            getSubmissionStatus(
                              submission.submitted_at,
                              submission.assessment_id.due_date
                            ) === "late"
                              ? "1px solid #FFA500" // สีส้ม
                              : "1px solid #3b82f6",
                          padding: "1px 4px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: "600",
                          display: "inline-block",
                          textTransform: "capitalize",
                          marginLeft: "8px",
                          minWidth: "50px", // กำหนดความกว้างขั้นต่ำให้เท่ากัน
                          textAlign: "center", // จัดข้อความให้อยู่ตรงกลาง
                        }}
                      >
                        {getSubmissionStatus(
                          submission.submitted_at,
                          submission.assessment_id.due_date
                        )}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(
                            getUserGradingStatus(submission)
                          ),
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "inline-block",
                          textTransform: "capitalize",
                          marginLeft: " 18px",
                        }}
                      >
                        {getUserGradingStatus(submission)}
                      </span>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleViewPdf(submission.file_url)}
                        className="custom-btn"
                      >
                        View PDF
                      </Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{submission.student_id.personal_num}</td>
                    <td>{submission.student_id.first_name}</td>
                    <td>{submission.student_id.last_name}</td>
                    <td>{submission.student_id.email}</td>
                    <td>
                      {formatDateTime(submission.submitted_at)}{" "}
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: "transparent", // ไม่มีพื้นหลัง
                          color:
                            getSubmissionStatus(
                              submission.submitted_at,
                              submission.assessment_id.due_date
                            ) === "late"
                              ? "#FFA500" // สีส้ม
                              : "#3b82f6",
                          border:
                            getSubmissionStatus(
                              submission.submitted_at,
                              submission.assessment_id.due_date
                            ) === "late"
                              ? "1px solid #FFA500" // สีส้ม
                              : "1px solid #3b82f6",
                          padding: "1px 4px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: "600",
                          display: "inline-block",
                          textTransform: "capitalize",
                          marginLeft: "8px",
                          minWidth: "50px", // กำหนดความกว้างขั้นต่ำให้เท่ากัน
                          textAlign: "center", // จัดข้อความให้อยู่ตรงกลาง
                        }}
                      >
                        {getSubmissionStatus(
                          submission.submitted_at,
                          submission.assessment_id.due_date
                        )}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(
                            getUserGradingStatus(submission)
                          ),
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "inline-block",
                          textTransform: "capitalize",
                          marginLeft: " 18px",
                        }}
                      >
                        {getUserGradingStatus(submission)}
                      </span>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleViewPdf(submission.file_url)}
                        className="custom-btn"
                      >
                        View PDF
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={assessmentType === "group" ? 7 : 7}
                className="text-center"
              >
                No submissions found
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>
    </Container>
  );
}
