import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import CreateAssessmentModal from "./CreateAssessmentModal";
import EditAssessmentModal from "./Editassessment";
import DeleteAssessment from "./Deleteassessment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import "../../../assets/Styles/Assessment/Getassessment.css";
import { formatDateTime } from "../../../utils/FormatDateTime";
import { sortAssessments } from "../../../utils/SortAssessment";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import courseAPI from "../../../services/courseAPI";
import assessmentAPI from "../../../services/assessmentAPI";

export default function Getassessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

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
      const assessmentResponse = await assessmentAPI.getSectionAssessments(id);
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
        const courseResponse = await courseAPI.getCourseDetails(id);
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
        <Col className="text-end me-3">
          <Button
            className="custom-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Create Assessment
          </Button>
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
            sortedAssessments.map((assessment, index) => (
              <tr
                key={assessment._id || index}
                onClick={(e) => {
                  if (e.target.closest(".action-icons")) return;
                  navigate(
                    `/assessment/${id}/allassessmentuser/${assessment._id}`
                  );
                }}
                style={{ cursor: "pointer" }}
              >
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
                <td>{formatDateTime(assessment.publish_date)}</td>
                <td>{formatDateTime(assessment.due_date)}</td>
                <td>
                  <div className="action-icons">
                    <EditIcon
                      className="icon-style"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssessmentId(assessment._id);
                        setShowEditModal(true);
                      }}
                    />
                    <DeleteIcon
                      className="icon-style"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssessmentId(assessment._id);
                        setShowDeleteModal(true);
                      }}
                    />
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
      <CreateAssessmentModal
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        courseDetails={courseDetails}
        refreshAssessments={refreshAssessments}
      />
      {selectedAssessmentId && (
        <EditAssessmentModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          assessmentId={selectedAssessmentId}
          courseDetails={courseDetails}
          refreshAssessments={refreshAssessments}
        />
      )}
      {selectedAssessmentId && (
        <DeleteAssessment
          show={showDeleteModal}
          handleClose={() => setShowDeleteModal(false)}
          assessmentId={selectedAssessmentId}
          refreshAssessments={refreshAssessments}
        />
      )}
    </Container>
  );
}
