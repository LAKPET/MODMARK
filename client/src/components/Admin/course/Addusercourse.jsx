import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBFile, MDBInput } from "mdb-react-ui-kit";
import * as XLSX from "xlsx";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import ModalComponent from "../../../controls/Modal";
import { validateAddUserCourseForm } from "../../../utils/FormValidation";
import {
  userApi,
  enrollmentApi,
  instructorApi,
} from "../../../services/userAPI";

export default function AddUserCourse({
  show,
  handleClose,
  Id,
  refreshCourses,
  onSuccess,
}) {
  const [userId, setUserId] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [role, setRole] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({});
  const [personalNum, setPersonalNum] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

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

    const formData = {
      role,
      personalNum,
      firstname,
      lastname,
      email,
    };

    const { isValid, errors: validationErrors } =
      validateAddUserCourseForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

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
      try {
        if (role === "student") {
          await enrollmentApi.enrollStudents(Id, usersToAdd);
        } else if (role === "professor" || role === "ta") {
          await instructorApi.registerInstructors(Id, usersToAdd);
        } else {
          setErrorModal({
            open: true,
            message: "Invalid role selected.",
          });
          return;
        }

        handleClose();
        refreshCourses();
        onSuccess();
        setShowSuccessModal(true);
        // Reset form fields
        resetForm();
      } catch (error) {
        console.error("Error adding user(s):", error);

        // Extract error message from backend response
        let errorMessage = "Error adding user(s)";

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          // Extract the specific error message from the API response
          errorMessage = error.response.data.message;
        }

        setErrorModal({
          open: true,
          message: errorMessage,
        });
      }
    } else {
      setErrorModal({
        open: true,
        message:
          "No data provided. Please enter user details or upload a file.",
      });
    }
  };

  const resetForm = () => {
    setPersonalNum("");
    setFirstname("");
    setLastname("");
    setEmail("");
    setUsername("");
    setExcelData([]);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: "" });
  };

  const fetchUserData = async () => {
    try {
      const userData = await userApi.getUserProfile(userId);
      setFirstname(userData.first_name);
      setLastname(userData.last_name);
      setEmail(userData.email);
      setUsername(userData.username);
      setRole(userData.role);
    } catch (err) {
      console.error("Failed to fetch user data", err);

      // Extract error message from backend response
      let errorMessage = "Failed to fetch user data";

      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      setErrorModal({
        open: true,
        message: errorMessage,
      });
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
                error={!!errors.role}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="professor">Professor</MenuItem>
                <MenuItem value="ta">TA</MenuItem>
                {/* <MenuItem value="admin">Admin</MenuItem> */}
              </Select>
              {errors.role && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.role}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mt-2 mb-4" controlId="formPersonalNum">
              <MDBInput
                label="Personal Number"
                id="formPersonalNum"
                type="text"
                value={personalNum}
                onChange={(e) => setPersonalNum(e.target.value)}
                invalid={!!errors.personalNum}
                className={errors.personalNum ? "border-danger" : ""}
                placeholder="e.g. 234"
              />
              {errors.personalNum && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.personalNum}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mt-2 mb-4" controlId="formFirstname">
              <MDBInput
                label="Firstname"
                id="formFirstname"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                invalid={!!errors.firstname}
                className={errors.firstname ? "border-danger" : ""}
                placeholder="Firstname must be at least 3 characters"
              />
              {errors.firstname && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.firstname}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4" controlId="formLastname">
              <MDBInput
                label="Lastname"
                id="formLastname"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                invalid={!!errors.lastname}
                className={errors.lastname ? "border-danger" : ""}
                placeholder="Lastname must be at least 3 characters"
              />
              {errors.lastname && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.lastname}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4" controlId="formEmail">
              <MDBInput
                label="Email"
                id="formEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!!errors.email}
                className={errors.email ? "border-danger" : ""}
                placeholder="e.g. example@example.com"
              />
              {errors.email && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.email}
                </div>
              )}
            </Form.Group>

            <div className="mb-3 line-with-text">
              <span>or</span>
            </div>

            {role && (
              <>
                <InputLabel className="mt-3 mb-2" id="file-upload-label">
                  You can import users <span className="fw-bold">{role}</span>{" "}
                  by CSV or Excel file
                  <div className="small text-muted mt-1">
                    Expected columns: Personal Number, First Name, Last Name,
                    Email
                  </div>
                </InputLabel>
                <MDBFile
                  className="mb-4"
                  id="customFile"
                  onChange={handleFileUpload}
                />
                {excelData.length > 0 && (
                  <div className="alert alert-info" role="alert">
                    Excel file loaded successfully. {excelData.length} users
                    ready to be created.
                  </div>
                )}
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
        handleClose={handleSuccessModalClose}
        title="Add User"
        description="The user has been successfully added."
        type="success"
      />

      <ModalComponent
        open={errorModal.open}
        handleClose={handleErrorModalClose}
        title="Add User Error"
        description={errorModal.message}
        type="error"
      />
    </>
  );
}
