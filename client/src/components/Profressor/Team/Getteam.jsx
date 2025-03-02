import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddUserCourse from "../../Admin/course/Addusercourse"; // Import AddUserCourse component
import DeleteUser from "../../Profressor/Team/DeleteUser";
import "../../../assets/Styles/Team/Getteam.css";
import CircularProgress from "@mui/material/CircularProgress";

export default function Getteam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseError, setCourseError] = useState(null);
  const [studentsError, setStudentsError] = useState(null);
  const [professorsError, setProfessorsError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showStudentsTable, setShowStudentsTable] = useState(false);
  const [showProfessorsTable, setShowProfessorsTable] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (column, setMembers) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);
    setMembers((prevMembers) =>
      [...prevMembers].sort((a, b) => {
        const valueA = a[column] ? a[column].toString() : "";
        const valueB = b[column] ? b[column].toString() : "";
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      })
    );
  };

  const refreshMembers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const studentsResponse = await axios.get(
        `${apiUrl}/section/students/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(studentsResponse.data);
      setStudentsError(null);
    } catch (err) {
      setStudentsError("Error loading students data.");
    }

    try {
      const token = localStorage.getItem("authToken");
      const professorsResponse = await axios.get(
        `${apiUrl}/section/professors/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfessors(professorsResponse.data);
      setProfessorsError(null);
    } catch (err) {
      setProfessorsError("Error loading professors data.");
    }
  };

  useEffect(() => {
    if (!id) {
      setCourseError("No section ID found in the URL.");
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
        setCourseError(null);
        await refreshMembers();
      } catch (err) {
        setCourseError("Error loading course data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="text-center mt-5 spinner">
        <CircularProgress color="inherit" />
      </div>
    );
  }
  if (courseError)
    return <div className="text-center mt-5 text-danger">{courseError}</div>;

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
            Add Member
          </Button>
        </Col>
      </Row>
      <h5
        className="pb-3 mb-4 short-border fw-semibold d-flex justify-content-between align-items-center"
        onClick={() => setShowStudentsTable(!showStudentsTable)}
        style={{ cursor: "pointer" }}
      >
        Students
        <KeyboardArrowDownIcon />
      </h5>
      {showStudentsTable && (
        <MDBTable>
          <MDBTableHead>
            <tr className="fw-bold">
              <th
                onClick={() => handleSort("personal_num", setStudents)}
                className="sortable"
              >
                Personal Number <SwapVertIcon />
              </th>
              <th
                onClick={() => handleSort("first_name", setStudents)}
                className="sortable"
              >
                First Name <SwapVertIcon />
              </th>
              <th
                onClick={() => handleSort("last_name", setStudents)}
                className="sortable"
              >
                Last Name <SwapVertIcon />
              </th>
              <th
                onClick={() => handleSort("email", setStudents)}
                className="sortable"
              >
                Email <SwapVertIcon />
              </th>
              <th>Action</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {students.length > 0 ? (
              students.map((student, index) => (
                <tr key={student.student_id || index}>
                  <td>{student.personal_num}</td>
                  <td>{student.first_name}</td>
                  <td>{student.last_name}</td>
                  <td>{student.email}</td>
                  <td>
                    <DeleteIcon
                      className="icon-style"
                      onClick={() => {
                        setSelectedMemberId(student.student_id);
                        setShowDeleteModal(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No students found
                </td>
              </tr>
            )}
          </MDBTableBody>
        </MDBTable>
      )}

      <h5
        className="mt-5 pb-3 mb-4 short-border fw-semibold d-flex justify-content-between align-items-center"
        onClick={() => setShowProfessorsTable(!showProfessorsTable)}
        style={{ cursor: "pointer" }}
      >
        Professors <KeyboardArrowDownIcon />
      </h5>
      {showProfessorsTable && (
        <MDBTable>
          <MDBTableHead>
            <tr className="fw-bold">
              <th
                onClick={() => handleSort("personal_num", setProfessors)}
                className="sortable"
              >
                Personal Number <SwapVertIcon />
              </th>
              <th
                onClick={() => handleSort("first_name", setProfessors)}
                className="sortable"
              >
                First Name <SwapVertIcon />
              </th>
              <th
                onClick={() => handleSort("last_name", setProfessors)}
                className="sortable"
              >
                Last Name <SwapVertIcon />
              </th>
              <th
                onClick={() => handleSort("email", setProfessors)}
                className="sortable"
              >
                Email <SwapVertIcon />
              </th>
              <th>Action</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {professors.length > 0 ? (
              professors.map((professor, index) => (
                <tr key={professor.professor_id || index}>
                  <td>{professor.personal_num}</td>
                  <td>{professor.first_name}</td>
                  <td>{professor.last_name}</td>
                  <td>{professor.email}</td>
                  <td>
                    <DeleteIcon
                      className="icon-style"
                      onClick={() => {
                        setSelectedMemberId(professor.professor_id);
                        setShowDeleteModal(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No professors found
                </td>
              </tr>
            )}
          </MDBTableBody>
        </MDBTable>
      )}

      {/* Add modals for creating, editing, and deleting members here */}
      <AddUserCourse
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        Id={id}
        refreshCourses={refreshMembers}
        onSuccess={() => setShowSuccessModal(true)} // Show success modal on success
      />

      <DeleteUser
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        Id={id}
        userId={selectedMemberId}
        refreshUsers={refreshMembers}
      />
    </Container>
  );
}
