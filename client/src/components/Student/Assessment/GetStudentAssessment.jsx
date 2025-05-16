import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import "../../../assets/Styles/Assessment/Getassessment.css";
import { formatDateTime } from "../../../utils/FormatDateTime";
import { sortAssessments } from "../../../utils/SortAssessment";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import GroupSubmitModal from "../Dashboard/GroupSubmitModal";
import EditSubmissionModal from "../Assessment/components/EditsubmissionModal";

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
  backgroundColor: isSubmitted ? "#8b5f34" : "#5c90d2",
  fontSize: "0.875rem",
  textTransform: "none",
  minWidth: "140px",
  "&:hover": {
    backgroundColor: isSubmitted ? "#6f4f2f" : "#4a7ab0",
  },
}));

const ViewButton = styled(Button)({
  color: "white",
  backgroundColor: "#FF9800",
  fontSize: "0.875rem",
  textTransform: "none",
  height: "37px",
  minWidth: "40px",
  marginLeft: "6px",
  // marginRight: "8px",
  "&:hover": {
    backgroundColor: "#F57C00",
  },
});

const GroupButton = styled(Button)({
  color: "white",
  backgroundColor: "#5c90d2",
  fontSize: "0.875rem",
  textTransform: "none",
  minWidth: "140px",
  "&:hover": {
    backgroundColor: "#4a7ab0",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
  },
});

const GroupIcon = styled(PeopleAltIcon)({
  fontSize: "1.1rem",
  marginRight: "6px",
  color: "#5c90d2",
});

export default function GetStudentAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submittedAssessments, setSubmittedAssessments] = useState({});
  const [uploadingAssessmentId, setUploadingAssessmentId] = useState(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalAssessment, setGroupModalAssessment] = useState(null);
  const [groupFile, setGroupFile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupMembersData, setGroupMembersData] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [submissionPreviews, setSubmissionPreviews] = useState({});
  const [loadingPreview, setLoadingPreview] = useState(null);

  // เพิ่มสถานะสำหรับ Edit Submission Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (column) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);
  };

  const sortedAssessments = sortAssessments(assessments, sortColumn, sortOrder);

  // Fetch submitted assessments function (updated to NOT fetch preview URLs)
  const fetchSubmittedAssessments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("UserId");
      if (!token || !userId) {
        console.error("No auth token or user ID found");
        return;
      }

      // Use the endpoint that fetches direct and group submissions
      const response = await axios.get(
        `${apiUrl}/submission/student/with-groups/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched submissions:", response.data);

      // Process submissions and create an object with assessment_id as keys
      const submitted = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((submission) => {
          if (submission && submission.assessment_id) {
            // Store submission with assessment ID as key
            const assessmentId =
              submission.assessment_id._id || submission.assessment_id;
            submitted[assessmentId] = submission;
          }
        });
      }

      console.log("Updated submissions:", submitted);
      setSubmittedAssessments(submitted);

      // No longer automatically fetching preview URLs here
    } catch (error) {
      console.error("Error fetching submitted assessments:", error);
    }
  };

  // Function to get a preview URL on demand
  const fetchPreviewUrl = async (assessmentId) => {
    try {
      setLoadingPreview(assessmentId);
      const token = localStorage.getItem("authToken");
      const submission = submittedAssessments[assessmentId];

      if (!submission || !submission.file_url) {
        alert("No file available for preview");
        return null;
      }

      const fileResponse = await axios.post(
        `${apiUrl}/submission/pdf/file`,
        { filename: submission.file_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (fileResponse.data && fileResponse.data.fileUrl) {
        // Store the URL in state
        setSubmissionPreviews((prev) => ({
          ...prev,
          [assessmentId]: fileResponse.data.fileUrl,
        }));
        return fileResponse.data.fileUrl;
      }
      return null;
    } catch (err) {
      console.error("Error getting preview URL:", err);
      alert("Could not load file preview");
      return null;
    } finally {
      setLoadingPreview(null);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (!id) {
      setError("No section ID found in the URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // Get course details and assessments
        const [courseResponse, assessmentResponse] = await Promise.all([
          axios.get(`${apiUrl}/course/details/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/assessment/section/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourseDetails(courseResponse.data);
        setAssessments(assessmentResponse.data);

        // Fetch submissions after getting assessments
        await fetchSubmittedAssessments();
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // File upload handler
  const handleFileChange = async (event, assessmentId) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }
    setUploading(true);
    setUploadingAssessmentId(assessmentId);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        return;
      }

      const userId = localStorage.getItem("UserId");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assessment_id", assessmentId);
      formData.append("group_name", "individual");
      formData.append("members", JSON.stringify([{ user_id: userId }]));
      formData.append("file_type", "pdf");
      formData.append("section_id", id);

      const uploadRes = await fetch(`${apiUrl}/submission/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await uploadRes.json();

      if (uploadRes.ok) {
        // Update local state with the new submission
        const newSubmission = {
          ...result.submission,
          assessment_id: assessmentId,
        };

        setSubmittedAssessments((prev) => ({
          ...prev,
          [assessmentId]: newSubmission,
        }));

        alert("File uploaded successfully!");
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
  };

  // Group submission handler
  const handleGroupSubmit = async (selectedMembers) => {
    if (!groupFile || !groupModalAssessment) return;

    try {
      setGroupLoading(true);
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", groupFile);
      formData.append("assessment_id", groupModalAssessment._id);
      formData.append("group_name", groupName);
      formData.append(
        "members",
        JSON.stringify(selectedMembers.map((id) => ({ user_id: id })))
      );
      formData.append("file_type", "pdf");
      formData.append("section_id", id);

      const uploadRes = await fetch(`${apiUrl}/submission/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await uploadRes.json();

      if (uploadRes.ok) {
        // Update local state with the new submission
        const newSubmission = {
          ...result.submission,
          assessment_id: groupModalAssessment._id,
        };

        setSubmittedAssessments((prev) => ({
          ...prev,
          [groupModalAssessment._id]: newSubmission,
        }));

        alert("Group submission successful!");
        setGroupModalOpen(false);
      } else {
        alert(result.message || "File upload failed.");
      }
    } catch (error) {
      console.error("Group submission error:", error);
      alert("An error occurred during group submission.");
    } finally {
      setGroupLoading(false);
    }
  };

  // Refresh assessments function
  const refreshAssessments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("authToken");
      const assessmentResponse = await axios.get(
        `${apiUrl}/assessment/section/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssessments(assessmentResponse.data);

      // Also refresh submission data
      await fetchSubmittedAssessments();
    } catch (err) {
      setError("Error loading data.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Edit submission handler - Modified to fetch preview URL on demand
  const handleEditSubmission = async (assessmentId) => {
    try {
      const submission = submittedAssessments[assessmentId];
      const assessment = assessments.find((a) => a._id === assessmentId);

      if (submission && assessment) {
        // Fetch the preview URL if needed for the edit modal
        let previewUrl = submissionPreviews[assessmentId];
        if (!previewUrl && submission.file_url) {
          previewUrl = await fetchPreviewUrl(assessmentId);
        }

        if (previewUrl) {
          submission.previewUrl = previewUrl;
        }

        setCurrentSubmission(submission);
        setCurrentAssessment(assessment);
        setEditModalOpen(true);
      }
    } catch (err) {
      alert("ไม่สามารถโหลดข้อมูล submission ได้");
    }
  };

  // Update submission handler
  const handleUpdateSubmission = async (submissionId, file, groupName = "") => {
    try {
      setUploading(true);
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      if (file) formData.append("file", file);
      formData.append("file_type", "pdf");
      if (groupName) formData.append("group_name", groupName);

      const res = await fetch(`${apiUrl}/submission/update/${submissionId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        // Update local state with the updated submission
        const updatedSubmission = result.submission;

        if (updatedSubmission) {
          setSubmittedAssessments((prev) => ({
            ...prev,
            [updatedSubmission.assessment_id]: updatedSubmission,
          }));

          // Clear any existing preview URL since the file has changed
          if (file) {
            setSubmissionPreviews((prev) => {
              const newPreviews = { ...prev };
              delete newPreviews[updatedSubmission.assessment_id];
              return newPreviews;
            });
          }
        }

        setEditModalOpen(false);
        alert("แก้ไขงานสำเร็จ");
      } else {
        alert(result.message || "เกิดข้อผิดพลาดขณะอัปเดตงาน");
      }
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถอัปเดต submission ได้");
    } finally {
      setUploading(false);
    }
  };

  // View submission handler - Modified to fetch preview URL on demand
  const handleViewSubmission = async (assessmentId) => {
    // Check if we already have the preview URL
    let previewUrl = submissionPreviews[assessmentId];

    // If not, fetch it
    if (!previewUrl) {
      previewUrl = await fetchPreviewUrl(assessmentId);
    }

    if (previewUrl) {
      window.open(previewUrl, "_blank");
    } else {
      alert("ไม่พบไฟล์ PDF สำหรับงานนี้");
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
            <th onClick={() => handleSort("publish_date")} className="sortable">
              Publish Date <SwapVertIcon />
            </th>
            <th onClick={() => handleSort("due_date")} className="sortable">
              Due Date <SwapVertIcon />
            </th>
            <th>Action</th>
          </tr>
        </MDBTableHead>

        <MDBTableBody>
          {sortedAssessments.length > 0 ? (
            sortedAssessments.map((assessment) => {
              // Check if this assessment has a submission
              const hasSubmission =
                submittedAssessments[assessment._id] !== undefined;

              // Check if this is a group member's submission
              const isGroupMemberSubmission =
                hasSubmission &&
                submittedAssessments[assessment._id].isGroupMemberSubmission;

              return (
                <tr key={assessment._id}>
                  <td
                    className="clickable"
                    onClick={() =>
                      navigate(
                        `/student/assessment/${id}/assessment-details/${assessment._id}`
                      )
                    }
                  >
                    <div className="d-flex align-items-center">
                      {assessment.assessment_name}
                      {isGroupMemberSubmission && (
                        <Tooltip
                          title={`Submitted by ${submittedAssessments[assessment._id].student_id.first_name} ${submittedAssessments[assessment._id].student_id.last_name}`}
                        >
                          <GroupIcon className="ms-1  text-secondary" />
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td>{formatDateTime(assessment.publish_date)}</td>
                  <td>{formatDateTime(assessment.due_date)}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {hasSubmission ? (
                        <>
                          <StyledButton
                            variant="contained"
                            isSubmitted={true}
                            onClick={() => handleEditSubmission(assessment._id)}
                            disabled={uploading}
                          >
                            {isGroupMemberSubmission
                              ? "Edit Submission"
                              : "Edit Submission"}
                          </StyledButton>

                          {/* View button with on-demand preview URL fetching */}
                          <ViewButton
                            variant="contained"
                            onClick={() => handleViewSubmission(assessment._id)}
                            disabled={
                              loadingPreview === assessment._id || uploading
                            }
                          >
                            {loadingPreview === assessment._id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <VisibilityIcon fontSize="small" />
                            )}
                          </ViewButton>
                        </>
                      ) : assessment.assignment_type === "group" ? (
                        <GroupButton
                          variant="contained"
                          disabled={uploading}
                          onClick={async () => {
                            setGroupModalAssessment(assessment);
                            setGroupFile(null);
                            setGroupModalOpen(true);
                            setGroupLoading(true);
                            const token = localStorage.getItem("authToken");
                            const membersRes = await axios.get(
                              `${apiUrl}/section/students/${id}`,
                              {
                                headers: { Authorization: `Bearer ${token}` },
                              }
                            );
                            setGroupMembersData(membersRes.data);
                            setGroupLoading(false);
                          }}
                        >
                          Create Group
                        </GroupButton>
                      ) : (
                        <StyledButton
                          component="label"
                          role={undefined}
                          variant="contained"
                          tabIndex={-1}
                          isSubmitted={false}
                          disabled={uploading}
                        >
                          {uploadingAssessmentId === assessment._id
                            ? "Uploading..."
                            : "Submission"}
                          <VisuallyHiddenInput
                            type="file"
                            onChange={(e) =>
                              handleFileChange(e, assessment._id)
                            }
                            accept=".pdf"
                          />
                        </StyledButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No assessments found
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>

      {groupModalOpen && (
        <GroupSubmitModal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          assessment={groupModalAssessment}
          file={groupFile}
          groupName={groupName}
          setGroupName={setGroupName}
          groupMembersData={groupMembersData}
          uploading={uploading}
          onSubmit={handleGroupSubmit}
          setGroupFile={setGroupFile}
        />
      )}

      {editModalOpen && currentSubmission && currentAssessment && (
        <EditSubmissionModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          submission={currentSubmission}
          assessment={currentAssessment}
          uploading={uploading}
          onSubmit={handleUpdateSubmission}
          previewUrl={currentSubmission.previewUrl}
        />
      )}
    </Container>
  );
}
