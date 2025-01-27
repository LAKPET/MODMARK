import React, { useState, useEffect } from "react";
import axios from "axios";
import { MDBInput } from "mdb-react-ui-kit";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../../assets/Styles/Course/Getcourse.css";
import { Button } from "react-bootstrap";
import Createcourse from "../../Profressor/Course/Createcourse";
import TablePaginationActions from "../TablePaginationActions";
import { useAuth } from "../../../routes/AuthContext";
import DeleteCourse from "../course/Deletecourse";
import AddUserCourse from "../course/Addusercourse"; // Import AddUserCourse component
import EditCourse from "../course/Editcourse";

const columns = [
  { id: "course_number", label: "Course Number", minWidth: 150 },
  { id: "section_name", label: "Section Name", minWidth: 150 },
  { id: "semester_term", label: "Semester Term", minWidth: 150 },
  { id: "semester_year", label: "Semester Year", minWidth: 150 },
  {
    id: "actions",
    label: "Actions",
    minWidth: 50,
    align: "start",
    className: "actions-header",
  },
];

export default function CourseTable() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // Add state for create modal
  const [showAddUserModal, setShowAddUserModal] = useState(false); // Add state for add user modal
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseNumber, setCourseNumber] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [semesterTerm, setSemesterTerm] = useState("");
  const [semesterYear, setSemesterYear] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false); // Add this state variable
  const apiUrl = import.meta.env.VITE_API_URL;
  const { user } = useAuth(); // Use the useAuth hook

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (params = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.post(`${apiUrl}/section/all`, params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
      setSearchPerformed(true); // Set searchPerformed to true after fetching courses
    } catch (err) {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = {
      course_number: courseNumber,
      section_name: sectionName,
      semester_term: semesterTerm,
      semester_year: semesterYear,
    };
    fetchCourses(params);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = (courseId) => {
    setSelectedCourseId(courseId);
    setShowEditModal(true);
  };

  const handleDelete = (courseId) => {
    console.log("Deleting course with ID:", courseId); // Debugging log
    setSelectedCourseId(courseId);
    setShowDeleteModal(true);
  };

  const handleAddUser = (courseId) => {
    setSelectedCourseId(courseId);
    setShowAddUserModal(true);
  };

  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);
  const handleCloseEditModal = () => setShowEditModal(false);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className="mb-4">
        <h3 className="fw-bold">Course Management</h3>
      </div>

      <div className="mb-4">
        <div className="row">
          <div className="col-md-3">
            <MDBInput
              label="Course Number"
              id="form1"
              type="text"
              value={courseNumber}
              onChange={(e) => setCourseNumber(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <MDBInput
              label="Section"
              id="form2"
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <MDBInput
              label="Term"
              id="form3"
              type="text"
              value={semesterTerm}
              onChange={(e) => setSemesterTerm(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <MDBInput
              label="Year"
              id="form4"
              type="text"
              value={semesterYear}
              onChange={(e) => setSemesterYear(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <SearchIcon className="rotate-90" onClick={handleSearch} />
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end">
        <Button className="fw-bold custom-btn" onClick={handleShowCreateModal}>
          Create Course
        </Button>
      </div>
      <Paper sx={{ width: "100%", overflow: "hidden", marginTop: "20px" }}>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    className={column.className}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.length > 0
                ? courses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((course) => (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={course._id}
                      >
                        {columns.map((column) => {
                          const value = course[column.id];
                          return (
                            <TableCell
                              key={column.id}
                              align={column.align}
                              className={
                                column.id === "actions" ? "actions-cell" : ""
                              }
                            >
                              {column.id === "actions" ? (
                                <div className="actions-cell">
                                  <PersonAddIcon
                                    className="icon-style"
                                    onClick={() =>
                                      handleAddUser(course.course_id)
                                    }
                                  />
                                  <EditIcon
                                    className="icon-style"
                                    onClick={() => handleEdit(course.course_id)}
                                  />
                                  <DeleteIcon
                                    className="icon-style"
                                    onClick={() =>
                                      handleDelete(course.course_id)
                                    }
                                  />
                                </div>
                              ) : (
                                value
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                : searchPerformed && (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        ไม่มี course ใน section นี้
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, { value: -1, label: "All" }]}
          component="div"
          count={courses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions} // Use the component
        />
      </Paper>

      <Createcourse
        show={showCreateModal}
        handleClose={handleCloseCreateModal}
      />
      <DeleteCourse
        show={showDeleteModal}
        handleClose={handleCloseDeleteModal}
        courseId={selectedCourseId}
        refreshCourses={fetchCourses}
      />
      <AddUserCourse
        show={showAddUserModal}
        handleClose={handleCloseAddUserModal}
        courseId={selectedCourseId}
        refreshCourses={fetchCourses}
      />
      <EditCourse
        show={showEditModal}
        handleClose={handleCloseEditModal}
        courseId={selectedCourseId}
        refreshCourses={fetchCourses}
      />
    </>
  );
}
