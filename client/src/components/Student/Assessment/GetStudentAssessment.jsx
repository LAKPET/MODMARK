import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import "../../../assets/Styles/Assessment/Getassessment.css";
import { formatDateTime } from "../../../utils/FormatDateTime";
import { sortAssessments } from "../../../utils/SortAssessment";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import GroupSubmitModal from "../Dashboard/GroupSubmitModal";

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
  backgroundColor: isSubmitted ? "#71F275" : "#5c90d2",
  fontSize: "0.875rem",
  textTransform: "none",
  minWidth: "140px",
  "&:hover": {
    backgroundColor: isSubmitted ? "#60d164" : "#4a7ab0",
  },
}));

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
    } catch (err) {
      setError("Error loading data.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchSubmittedAssessments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${apiUrl}/submission/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const submitted = response.data.reduce((acc, submission) => {
        acc[submission.assessment_id] = true;
        return acc;
      }, {});
      setSubmittedAssessments(submitted);
    } catch (error) {
      console.error("Error fetching submitted assessments:", error);
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
        await fetchSubmittedAssessments();
      } catch (err) {
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleFileChange = async (event, assessmentId) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${apiUrl}/assessment/section/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const assessment = response.data.find((a) => a._id === assessmentId);
      if (!assessment) throw new Error("Assessment not found");
      if (assessment.assignment_type === "group") {
        setGroupModalAssessment(assessment);
        setGroupFile(file);
        setGroupModalOpen(true);
        setGroupLoading(true);
        // Fetch group members
        const membersRes = await axios.get(`${apiUrl}/section/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroupMembersData(membersRes.data);
        setGroupLoading(false);
      } else {
        // For individual submissions
        setUploadingAssessmentId(assessmentId);
        const userId = localStorage.getItem("UserId");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("assessment_id", assessmentId);
        formData.append("group_name", "individual"); // Fix group name to "individual"
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
          setSubmittedAssessments((prev) => ({
            ...prev,
            [assessmentId]: true,
          }));
          await refreshAssessments(false);
        } else {
          alert(result.message || "File upload failed.");
        }
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("An error occurred during file upload.");
    } finally {
      setUploading(false);
      setUploadingAssessmentId(null);
    }
  };

  const handleGroupSubmit = async (selectedMembers) => {
    if (!groupFile || !groupModalAssessment) return;

    try {
      setGroupLoading(true);
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", groupFile);
      formData.append("assessment_id", groupModalAssessment._id);
      formData.append("group_name", groupName); // ใช้ groupName ที่กรอกใน Modal
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
        setSubmittedAssessments((prev) => ({
          ...prev,
          [groupModalAssessment._id]: true,
        }));
        await refreshAssessments(false);
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
            sortedAssessments.map((assessment) => (
              <tr key={assessment._id}>
                <td
                  className="clickable"
                  onClick={() =>
                    navigate(
                      `/student/assessment/${id}/assessment-details/${assessment._id}`
                    )
                  }
                >
                  {assessment.assessment_name}
                </td>
                <td>{formatDateTime(assessment.publish_date)}</td>
                <td>{formatDateTime(assessment.due_date)}</td>
                <td>
                  <div className="d-flex align-items-center">
                    {submittedAssessments[assessment._id] ? (
                      <StyledButton
                        variant="contained"
                        isSubmitted={true}
                        disabled
                      >
                        Edit Submission
                      </StyledButton>
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
                        isSubmitted={submittedAssessments[assessment._id]}
                        disabled={uploading}
                      >
                        {uploadingAssessmentId === assessment._id
                          ? "Uploading..."
                          : "Submission"}
                        <VisuallyHiddenInput
                          type="file"
                          onChange={(e) => handleFileChange(e, assessment._id)}
                          accept=".pdf"
                        />
                      </StyledButton>
                    )}
                  </div>
                </td>
              </tr>
            ))
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
    </Container>
  );
}
