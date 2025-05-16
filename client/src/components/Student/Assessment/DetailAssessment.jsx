import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "../../../assets/Styles/Dashboard/GetDetail.css";
import { formatDateTime } from "../../../utils/FormatDateTime";
import GroupSubmitModal from "../Dashboard/GroupSubmitModal";
import EditSubmissionModal from "../Assessment/components/EditsubmissionModal";
import Tooltip from "@mui/material/Tooltip";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

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
  minWidth: "40px",
  marginRight: "8px",
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

export default function GetAssessmentDetail() {
  const { id, assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupFile, setGroupFile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupMembersData, setGroupMembersData] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [uploadingAssessmentId, setUploadingAssessmentId] = useState(null);

  // Add states for submission management
  const [submittedAssessment, setSubmittedAssessment] = useState(null);
  const [submissionPreview, setSubmissionPreview] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch assessment details and submission information
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("UserId");

        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch assessment details
        const assessmentResponse = await axios.get(
          `${apiUrl}/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAssessmentDetails(assessmentResponse.data);

        // Fetch submission information
        try {
          const submissionResponse = await axios.get(
            `${apiUrl}/submission/student/with-groups/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // Find submission for this assessment
          if (
            submissionResponse.data &&
            Array.isArray(submissionResponse.data)
          ) {
            const submission = submissionResponse.data.find(
              (sub) =>
                sub.assessment_id &&
                (sub.assessment_id._id === assessmentId ||
                  sub.assessment_id === assessmentId)
            );

            if (submission) {
              setSubmittedAssessment(submission);

              // Get preview URL for the file
              if (submission.file_url) {
                try {
                  const fileResponse = await axios.post(
                    `${apiUrl}/submission/pdf/file`,
                    { filename: submission.file_url },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  if (fileResponse.data && fileResponse.data.fileUrl) {
                    setSubmissionPreview(fileResponse.data.fileUrl);
                  }
                } catch (err) {
                  console.error("Error getting preview URL:", err);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error fetching submission data:", err);
        }
      } catch (err) {
        console.error("Error fetching assessment details:", err);
        setError("Failed to load assessment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, assessmentId, apiUrl, navigate]);

  // Handle individual file submission
  const handleFileChange = async (event) => {
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

        setSubmittedAssessment(newSubmission);

        // Get preview URL for the uploaded file
        if (newSubmission.file_url) {
          try {
            const fileResponse = await axios.post(
              `${apiUrl}/submission/pdf/file`,
              { filename: newSubmission.file_url },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (fileResponse.data && fileResponse.data.fileUrl) {
              setSubmissionPreview(fileResponse.data.fileUrl);
            }
          } catch (err) {
            console.error("Error getting preview URL:", err);
          }
        }

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

  // Handle group submission
  const handleGroupSubmit = async (selectedMembers) => {
    if (!groupFile || !groupName) {
      alert("Please provide a group name and select a file.");
      return;
    }

    try {
      setGroupLoading(true);
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("file", groupFile);
      formData.append("assessment_id", assessmentId);
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
          assessment_id: assessmentId,
        };

        setSubmittedAssessment(newSubmission);

        // Get preview URL for the uploaded file
        if (newSubmission.file_url) {
          try {
            const fileResponse = await axios.post(
              `${apiUrl}/submission/pdf/file`,
              { filename: newSubmission.file_url },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (fileResponse.data && fileResponse.data.fileUrl) {
              setSubmissionPreview(fileResponse.data.fileUrl);
            }
          } catch (err) {
            console.error("Error getting preview URL:", err);
          }
        }

        alert("Group submission successful!");
        setGroupModalOpen(false);
      } else {
        alert(result.message || "Group submission failed.");
      }
    } catch (error) {
      console.error("Group submission error:", error);
      alert("An error occurred during group submission.");
    } finally {
      setGroupLoading(false);
    }
  };

  // Handle edit submission
  const handleEditSubmission = () => {
    try {
      if (submittedAssessment && assessmentDetails) {
        // Get file preview URL if available
        const submission = {
          ...submittedAssessment,
          previewUrl: submissionPreview,
        };
        setCurrentSubmission(submission);
        setEditModalOpen(true);
      }
    } catch (err) {
      alert("Unable to load submission data");
    }
  };

  // Handle update submission
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
          setSubmittedAssessment(updatedSubmission);

          // Update preview URL if there's a new file
          if (file && updatedSubmission.file_url) {
            try {
              const fileResponse = await axios.post(
                `${apiUrl}/submission/pdf/file`,
                { filename: updatedSubmission.file_url },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (fileResponse.data && fileResponse.data.fileUrl) {
                setSubmissionPreview(fileResponse.data.fileUrl);
              }
            } catch (err) {
              console.error("Error getting updated preview URL:", err);
            }
          }
        }

        setEditModalOpen(false);
        alert("Submission updated successfully");
      } else {
        alert(result.message || "Error updating submission");
      }
    } catch (error) {
      console.error(error);
      alert("Unable to update submission");
    } finally {
      setUploading(false);
    }
  };

  // View submission handler
  const handleViewSubmission = () => {
    if (submissionPreview) {
      window.open(submissionPreview, "_blank");
    } else {
      alert("No PDF file found for this submission");
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

  // Check if this is a group member's submission
  const isGroupMemberSubmission =
    submittedAssessment && submittedAssessment.isGroupMemberSubmission;

  return (
    <Container className="mt-4">
      <Row className="pb-3 mb-4">
        <Col md={8}>
          <h2 className="mb-0 fw-semibold d-flex align-items-center">
            {assessmentDetails.course_id.course_name}
            <span className="vertical-line bg-dark mx-3"></span>
            <span className="fw-normal fs-5">
              {assessmentDetails.section_id.semester_term} /{" "}
              {assessmentDetails.section_id.semester_year}
            </span>
          </h2>
          <div className="d-flex align-items-center">
            <p className="text-muted p-1 mb-0">
              Section {assessmentDetails.section_id.section_number}
            </p>
          </div>
        </Col>
        <Col
          md={4}
          className="text-end d-flex flex-column gap-2 align-items-end"
        >
          <div className="d-flex align-items-center">
            {submittedAssessment ? (
              <>
                {/* Show view button if we have a preview URL
                {submissionPreview && (
                  <ViewButton
                    variant="contained"
                    onClick={handleViewSubmission}
                    disabled={uploading}
                  >
                    <VisibilityIcon fontSize="small" />
                  </ViewButton>
                )} */}
                <StyledButton
                  variant="contained"
                  isSubmitted={true}
                  onClick={handleEditSubmission}
                  disabled={uploading}
                >
                  {isGroupMemberSubmission
                    ? "Edit Submission"
                    : "Edit Submission"}
                </StyledButton>
              </>
            ) : assessmentDetails.assignment_type === "group" ? (
              <GroupButton
                variant="contained"
                disabled={uploading || groupLoading}
                onClick={async () => {
                  setGroupModalOpen(true);
                  setGroupFile(null);
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
                {uploadingAssessmentId === assessmentId
                  ? "Uploading..."
                  : "Submission"}
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                />
              </StyledButton>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mb-4 text-dark">
        <Col md={6}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Assessment</h5>
          <p>
            <strong>Name:</strong> {assessmentDetails.assessment_name}
          </p>
          <p>
            <strong>Description:</strong>{" "}
            {assessmentDetails.assessment_description}
          </p>
          <p>
            <strong>Type:</strong> {assessmentDetails.assignment_type}
          </p>
          <p>
            <strong>Publish Date:</strong>{" "}
            {formatDateTime(assessmentDetails.publish_date)}
          </p>
          <p>
            <strong>Due Date:</strong>{" "}
            {formatDateTime(assessmentDetails.due_date)}
          </p>
        </Col>
        <Col md={6}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Grader</h5>
          {assessmentDetails.graders.map((grader) => (
            <p key={grader._id}>
              <strong>Name:</strong> {grader.user_id.first_name}{" "}
              {grader.user_id.last_name} <br />
              <strong>Email:</strong> {grader.user_id.email} <br />
              <strong>Role:</strong> {grader.user_id.role} <br />
              <strong>Weight:</strong> {grader.weight * 100}%
            </p>
          ))}
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h5 className="pb-3 mb-4 short-border fw-semibold">
            Rubric Criteria
          </h5>
          <MDBTable>
            <MDBTableHead>
              <tr className="fw-bold">
                <th>Criteria</th>
                <th>Weight</th>
                <th>Levels</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {assessmentDetails.rubric_id.criteria.map((criterion) => (
                <tr key={criterion._id}>
                  <td>{criterion.name}</td>
                  <td>{criterion.weight}%</td>
                  <td>
                    {criterion.levels.map((level) => (
                      <div key={level._id}>
                        <strong>Level {level.level}:</strong>{" "}
                        {level.description} (Score: {level.score})
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </Col>
      </Row>

      {/* Group submission modal */}
      {groupModalOpen && (
        <GroupSubmitModal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          assessment={assessmentDetails}
          file={groupFile}
          groupName={groupName}
          setGroupName={setGroupName}
          groupMembersData={groupMembersData}
          uploading={groupLoading}
          onSubmit={handleGroupSubmit}
          setGroupFile={setGroupFile}
        />
      )}

      {/* Edit Submission Modal */}
      {editModalOpen && currentSubmission && assessmentDetails && (
        <EditSubmissionModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          submission={currentSubmission}
          assessment={assessmentDetails}
          uploading={uploading}
          onSubmit={handleUpdateSubmission}
          previewUrl={currentSubmission.previewUrl}
        />
      )}
    </Container>
  );
}
