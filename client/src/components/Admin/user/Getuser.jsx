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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../../assets/Styles/Admin/Getuser.css";
import { Button } from "react-bootstrap";
import Createuser from "../user/Createuser";
import Edituser from "../user/Edituser";
import DeleteUser from "../user/DeleteUser";
import TablePaginationActions from "../TablePaginationActions"; // Import the component

const columns = [
  { id: "first_name", label: "First Name", minWidth: 150 },
  { id: "last_name", label: "Last Name", minWidth: 150 },
  { id: "username", label: "Username", minWidth: 150 },
  { id: "email", label: "Email", minWidth: 150 },
  { id: "role", label: "Role", minWidth: 100 },
  { id: "actions", label: "Actions", minWidth: 50, align: "center" },
];

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [courseNumber, setCourseNumber] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [semesterTerm, setSemesterTerm] = useState("");
  const [semesterYear, setSemesterYear] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (params = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.post(`${apiUrl}/users/all`, params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setError(null);
    const params = {
      course_number: courseNumber,
      section_name: sectionName,
      semester_term: semesterTerm,
      semester_year: semesterYear,
    };
    fetchUsers(params);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = (userId) => {
    setSelectedUserId(userId);
    setShowEditModal(true);
  };

  const handleDelete = (userId) => {
    console.log("Deleting user with ID:", userId); // Debugging log
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);
  const handleCloseEditModal = () => setShowEditModal(false);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="mb-4">
        <h3 className="fw-bold">User Management</h3>
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
            {error && <span className="text-danger ms-2">{error}</span>}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <Button className="fw-bold custom-btn" onClick={handleShowCreateModal}>
          Create User
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
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={user.username}
                  >
                    {columns.map((column) => {
                      const value = user[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.id === "actions" ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <EditIcon
                                style={{ cursor: "pointer", marginRight: 8 }}
                                onClick={() => handleEdit(user._id)}
                              />
                              <DeleteIcon
                                style={{ cursor: "pointer" }}
                                onClick={() => handleDelete(user._id)}
                              />
                            </div>
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, { value: -1, label: "All" }]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions} // Use the component
        />
      </Paper>

      <Createuser
        show={showCreateModal}
        handleClose={handleCloseCreateModal}
        refreshUsers={fetchUsers}
      />

      <Edituser
        show={showEditModal}
        handleClose={handleCloseEditModal}
        userId={selectedUserId}
        refreshUsers={fetchUsers}
      />

      <DeleteUser
        show={showDeleteModal}
        handleClose={handleCloseDeleteModal}
        userId={selectedUserId}
        refreshUsers={fetchUsers}
      />
    </>
  );
}
