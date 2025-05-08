import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import "../../../assets/Styles/Dashboard/GetDetail.css";
import { formatDateTime } from "../../../utils/FormatDateTime";
import GroupSubmitModal from "../Dashboard/GroupSubmitModal";

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

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${apiUrl}/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAssessmentDetails(response.data);
      } catch (err) {
        console.error("Error fetching assessment details:", err);
        setError("Failed to load assessment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [id, apiUrl, navigate]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assessment_id", assessmentId);
      formData.append("group_name", "individual"); // Fix group name to "individual"
      formData.append(
        "members",
        JSON.stringify([{ user_id: localStorage.getItem("UserId") }])
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
        alert("File uploaded successfully!");
      } else {
        alert(result.message || "File upload failed.");
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("An error occurred during file upload.");
    } finally {
      setUploading(false);
    }
  };

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

      if (uploadRes.ok) {
        setGroupModalOpen(false); // ปิด Modal ทันทีหลังจากส่งสำเร็จ
      } else {
        const result = await uploadRes.json();
        console.error(result.message || "Group file upload failed.");
      }
    } catch (error) {
      console.error("Group submission error:", error);
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

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

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
          <StyledButton
            component="label"
            disabled={uploading || groupLoading}
            onClick={async () => {
              if (assessmentDetails.assignment_type === "group") {
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
              }
            }}
          >
            {uploading || groupLoading
              ? "Processing..."
              : assessmentDetails.assignment_type === "group"
                ? "Create Group"
                : "Submission"}
          </StyledButton>
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
    </Container>
  );
}
