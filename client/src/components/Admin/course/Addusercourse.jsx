import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBFile, MDBInput } from "mdb-react-ui-kit";
import axios from "axios";
import * as XLSX from "xlsx";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import ModalComponent from "../../../controls/Modal"; // Import ModalComponent

export default function AddUserCourse({
  show,
  handleClose,
  Id,
  refreshCourses,
  onSuccess, // Add onSuccess prop
}) {
  const [userId, setUserId] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [role, setRole] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [personalNum, setPersonalNum] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        setExcelData(parsedData);
        console.log(parsedData);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    let usersToAdd = [];

    // Add manually entered user if fields are filled
    if (personalNum && firstname && lastname && email) {
      usersToAdd.push({
        personal_num: Number(personalNum),
        first_name: firstname,
        last_name: lastname,
        email: email,
      });
    }

    // Add users from Excel file if any
    if (excelData.length > 0) {
      const excelUsers = excelData.map((row) => ({
        personal_num: Number(row.personal_number),
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
      }));
      usersToAdd = [...usersToAdd, ...excelUsers];
    }

    if (usersToAdd.length > 0) {
      let payload, apiEndpoint;

      if (role === "student") {
        apiEndpoint = `${apiUrl}/enrollment/enroll`;
        payload = {
          section_id: Id,
          students: usersToAdd,
        };
      } else if (role === "professor" || role === "ta") {
        apiEndpoint = `${apiUrl}/course-instructor/register-instructor`;
        payload = {
          section_id: Id,
          professors: usersToAdd,
        };
      } else {
        console.error("Invalid role selected.");
        return;
      }

      try {
        const response = await axios.post(apiEndpoint, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Success:", response.data);
        handleClose();
        refreshCourses();
        onSuccess(); // Call onSuccess function
        setShowSuccessModal(true); // Show success modal
        // Reset form fields
        setPersonalNum("");
        setFirstname("");
        setLastname("");
        setEmail("");
        setExcelData([]);
      } catch (error) {
        console.error("Request failed:", error);
      }
    } else {
      console.error("No data provided.");
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;
      setFirstname(user.first_name);
      setLastname(user.last_name);
      setEmail(user.email);
      setUsername(user.username);
      setRole(user.role);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="formUserId">
              <InputLabel className="mb-2" id="role-select-label">
                User Role
              </InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={role}
                onChange={handleRoleChange}
                fullWidth
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="professor">Professor</MenuItem>
                <MenuItem value="ta">TA</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </Form.Group>

            <Form.Group className="mt-2 mb-4" controlId="formPersonalNum">
              <MDBInput
                label="Personal Number"
                id="formPersonalNum"
                type="text"
                value={personalNum}
                onChange={(e) => setPersonalNum(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mt-2 mb-4" controlId="formFirstname">
              <MDBInput
                label="Firstname"
                id="formFirstname"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formLastname">
              <MDBInput
                label="Lastname"
                id="formLastname"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formEmail">
              <MDBInput
                label="Email"
                id="formEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <div className="mb-3 line-with-text">
              <span>or</span>
            </div>

            {role && (
              <>
                <InputLabel className="mt-3 mb-2" id="file-upload-label">
                  You can import users <span className="fw-bold">{role}</span>{" "}
                  by CSV or Excel file
                </InputLabel>
                <MDBFile
                  className="mb-4"
                  id="customFile"
                  onChange={handleFileUpload}
                />
              </>
            )}

            <div className="d-flex justify-content-end">
              <Button className="custom-btn" type="submit">
                Add User
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ModalComponent
        open={showSuccessModal}
        handleClose={() => setShowSuccessModal(false)}
        title="Add User"
        description="The user has been successfully added."
      />
    </>
  );
}
