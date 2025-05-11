import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBInput, MDBFile } from "mdb-react-ui-kit";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import * as XLSX from "xlsx";
import ModalComponent from "../../../controls/Modal";
import { validateCreateUserForm } from "../../../utils/FormValidation";
import { userApi } from "../../../services/userAPI"; // Import the userApi service
import "../../../assets/Styles/Admin/Createuser.css";

export default function Createuser({ show, handleClose, refreshUsers }) {
  const [personalNum, setPersonalNum] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({});

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

    // If we have excel data, process it
    if (excelData.length > 0) {
      try {
        const promises = excelData.map(async (user) => {
          const userData = {
            personalNum: user["Personal Number"] || user.personal_number,
            firstname: user["First Name"] || user.first_name,
            lastname: user["Last Name"] || user.last_name,
            username: user.Username || user.username,
            email: user.Email || user.email,
            role: user.Role || user.role,
            password: user.Password || "password123", // Default password
          };

          // Validate each user from Excel
          const { isValid, errors: validationErrors } =
            validateCreateUserForm(userData);

          if (!isValid) {
            throw new Error(
              `Validation failed for user ${userData.username}: ${JSON.stringify(validationErrors)}`
            );
          }

          // Create user
          return userApi.createUser(userData);
        });

        await Promise.all(promises);
        handleClose();
        refreshUsers();
        setShowSuccessModal(true);
        resetForm();
      } catch (err) {
        setErrorModal({
          open: true,
          message:
            err.message ||
            err.response?.data?.message ||
            "Failed to create users from Excel. Please check your file format.",
        });
      }
      return;
    }

    // Manual form submission (single user)
    const formData = {
      personalNum,
      firstname,
      lastname,
      email,
      username,
      password,
      role,
    };

    const { isValid, errors: validationErrors } =
      validateCreateUserForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      await userApi.createUser(formData);
      handleClose();
      refreshUsers();
      setShowSuccessModal(true);
      resetForm();
    } catch (err) {
      setErrorModal({
        open: true,
        message:
          err.response?.data?.message ||
          "Failed to create user. Please try again.",
      });
    }
  };

  const resetForm = () => {
    setPersonalNum("");
    setFirstname("");
    setLastname("");
    setEmail("");
    setUsername("");
    setPassword("");
    setRole("");
    setExcelData([]);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: "" });
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mt-2 mb-4" controlId="formPersonalNum">
              <MDBInput
                label="Personal Number"
                placeholder="e.g. 234"
                id="formPersonalNum"
                type="text"
                value={personalNum}
                onChange={(e) => setPersonalNum(e.target.value)}
                invalid={!!errors.personalNum}
                className={errors.personalNum ? "border-danger" : ""}
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
                placeholder="Firstname must be at least 3 characters"
                id="formFirstname"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                invalid={!!errors.firstname}
                className={errors.firstname ? "border-danger" : ""}
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
                placeholder="Lastname must be at least 3 characters"
                id="formLastname"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                invalid={!!errors.lastname}
                className={errors.lastname ? "border-danger" : ""}
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
                placeholder="e.g. exemple@exemple.com"
                id="formEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!!errors.email}
                className={errors.email ? "border-danger" : ""}
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

            <Form.Group className="mb-4" controlId="formUsername">
              <MDBInput
                label="Username"
                placeholder="Username must be at least 3 characters"
                id="formUsername"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                invalid={!!errors.username}
                className={errors.username ? "border-danger" : ""}
              />
              {errors.username && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.username}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <MDBInput
                label="Password"
                placeholder="Password must be at least 6 characters"
                id="formPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!!errors.password}
                className={errors.password ? "border-danger" : ""}
              />
              {errors.password && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.password}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4" controlId="formRole">
              <FormControl fullWidth>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                  error={!!errors.role}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="professor">Professor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                {errors.role && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.role}
                  </div>
                )}
              </FormControl>
            </Form.Group>

            <div className="mb-3 line-with-text">
              <span>or</span>
            </div>

            <InputLabel className="mt-3 mb-2" id="file-upload-label">
              You can import users by CSV or Excel file
              <div className="small text-muted mt-1">
                Expected columns: Personal Number, First Name, Last Name,
                <br />
                Username, Email, Role (student/professor/admin)
              </div>
            </InputLabel>
            <MDBFile
              className="mb-4"
              id="customFile"
              onChange={handleFileUpload}
            />
            {excelData.length > 0 && (
              <div className="alert alert-info" role="alert">
                Excel file loaded successfully. {excelData.length} users ready
                to be created.
              </div>
            )}

            <div className="d-flex justify-content-end">
              <Button className="custom-btn" type="submit">
                {excelData.length > 0
                  ? `Create ${excelData.length} Users`
                  : "Create User"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ModalComponent
        open={showSuccessModal}
        handleClose={handleSuccessModalClose}
        title="Create User"
        description={
          excelData.length > 1
            ? `${excelData.length} users have been successfully created.`
            : "The user has been successfully created."
        }
        type="success"
      />

      <ModalComponent
        open={errorModal.open}
        handleClose={handleErrorModalClose}
        title="Create User Error"
        description={errorModal.message}
        type="error"
      />
    </>
  );
}
