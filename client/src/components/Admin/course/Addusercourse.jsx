import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBFile } from "mdb-react-ui-kit";
import axios from "axios";
import * as XLSX from "xlsx";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export default function AddUserCourse({
  show,
  handleClose,
  Id,
  refreshCourses,
}) {
  const [userId, setUserId] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [role, setRole] = useState("");
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

    if (excelData.length > 0) {
      const studentsOrInstructors = excelData.map((row) => ({
        personal_num: Number(row.personal_number),
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
      }));

      let payload, apiEndpoint;

      if (role === "student") {
        apiEndpoint = `${apiUrl}/enrollment/enroll`;
        payload = {
          section_id: Id,
          students: studentsOrInstructors,
        };
      } else if (role === "professor") {
        apiEndpoint = `${apiUrl}/course-instructor/register-instructor`;
        payload = {
          section_id: Id,
          professors: studentsOrInstructors,
        };
      } else {
        console.error("Invalid role selected.");
        return;
      }
      console.log("Payload:", payload);
      try {
        const response = await axios.post(apiEndpoint, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Success:", response.data);
        handleClose();
        refreshCourses();
      } catch (error) {
        console.error("Request failed:", error);
      }
    } else {
      console.error("No data found in Excel file.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add User </Modal.Title>
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
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            {role && (
              <>
                <InputLabel className="mt-3 mb-2" id="file-upload-label">
                  You can import users <span className=" fw-bold">{role}</span>{" "}
                  by CSV or Excel file
                </InputLabel>
                <MDBFile
                  className="mb-4"
                  id="customFile"
                  onChange={handleFileUpload}
                />
              </>
            )}
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button className="custom-btn" type="submit">
              Add User
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
