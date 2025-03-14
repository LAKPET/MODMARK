import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../assets/Styles/Dashboard/GetDetail.css";
import CreateAssessmentModal from "../Assessment/CreateAssessmentModal";
import EditAssessmentModal from "../Assessment/Editassessment";
import DeleteAssessment from "../Assessment/Deleteassessment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { formatDateTime } from "../../../utils/FormatDateTime";
import { sortAssessments } from "../../../utils/SortAssessment";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

export default function GetDetailCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    if (!id) {
      setError("No section ID found in the URL.");
      setLoading(false);
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${apiUrl}/course/details/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCourseDetails(response.data);
        console.log("co", response.data);
      } catch (error) {
        setError("Error loading course details.");
      } finally {
        setLoading(false);
      }
    };

    const fetchAssessments = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const assessmentResponse = await axios.get(
          `${apiUrl}/assessment/section/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAssessments(assessmentResponse.data);
      } catch (err) {
        setError("Error loading assessments.");
      }
    };

    fetchCourseDetails();
    fetchAssessments();
  }, [id, navigate]);

  const handleSort = (column) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);
  };

  const sortedAssessments = sortAssessments(assessments, sortColumn, sortOrder);

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
            {courseDetails.course_number}
            <span className="vertical-line bg-dark mx-3"></span>
            <span className="fw-normal fs-5">
              {courseDetails.semester_term} / {courseDetails.semester_year}
            </span>
          </h2>
          <div className="d-flex align-items-center">
            <p className="text-muted p-1 mb-0">{courseDetails.course_name}</p>
            <span className="text-muted p-1">{`Section ${courseDetails.section_number}`}</span>
          </div>
        </Col>
      </Row>

      <Row className="mb-4 text-dark">
        <Col md={6}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Description</h5>
          <p>{courseDetails.course_description}</p>
        </Col>
        <Col md={6}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Team</h5>
          <Row>
            <Col md={6}>
              <div className="text-muted">
                {courseDetails.professors && courseDetails.professors.length > 0
                  ? courseDetails.professors
                      .filter((professor) => professor.role === "professor")
                      .map((professor, index) => (
                        <div key={index}>
                          Prof. {professor.first_name} {professor.last_name}
                        </div>
                      ))
                  : "No professor assigned"}
              </div>
            </Col>
            <Col md={6}>
              <div className="text-muted">
                {courseDetails.professors && courseDetails.professors.length > 0
                  ? courseDetails.professors
                      .filter((professor) => professor.role === "ta")
                      .map((professor, index) => (
                        <div key={index}>
                          TA. {professor.first_name} {professor.last_name}
                        </div>
                      ))
                  : "No TA assigned"}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      {assessments.length > 0 ? (
        <MDBTable>
          <MDBTableHead>
            <tr className="fw-bold">
              <th
                onClick={() => handleSort("assessment_name")}
                className="sortable"
              >
                Assessment Name <SwapVertIcon />
              </th>
              <th
                onClick={() => handleSort("publish_date")}
                className="sortable"
              >
                Publish Date <SwapVertIcon />
              </th>
              <th onClick={() => handleSort("due_date")} className="sortable">
                Due Date <SwapVertIcon />
              </th>
              <th>Action</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {sortedAssessments.map((assessment, index) => (
              <tr key={assessment._id || index}>
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
                  <EditIcon
                    className="icon-style"
                    onClick={() => {
                      setSelectedAssessmentId(assessment._id);
                      setShowEditModal(true);
                    }}
                  />
                  <DeleteIcon
                    className="icon-style"
                    onClick={() => {
                      setSelectedAssessmentId(assessment._id);
                      setShowDeleteModal(true);
                    }}
                  />
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      ) : (
        <Row className="text-center mt-5">
          <Col className="mt-5">
            <h3 className="mb-4 fw-semibold fs-2">No Assessments Available</h3>
            <h3 className="mb-4 fw-normal">
              Create an assessment to get started
            </h3>
            <Button
              className="custom-btn mt-2"
              onClick={() => setShowModal(true)}
            >
              Create Assessment
            </Button>
          </Col>
        </Row>
      )}

      <CreateAssessmentModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        courseDetails={courseDetails}
      />
      {selectedAssessmentId && (
        <EditAssessmentModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          assessmentId={selectedAssessmentId}
          courseDetails={courseDetails}
        />
      )}
      {selectedAssessmentId && (
        <DeleteAssessment
          show={showDeleteModal}
          handleClose={() => setShowDeleteModal(false)}
          assessmentId={selectedAssessmentId}
        />
      )}
    </Container>
  );
}
