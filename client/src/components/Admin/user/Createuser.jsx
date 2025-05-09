import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBInput, MDBFile } from "mdb-react-ui-kit";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    } catch (err) {
      setErrorModal({
        open: true,
        message:
          err.response?.data?.message ||
          "Failed to create user. Please try again.",
      });
    }
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

            <MDBFile
              className="mb-4"
              label="You can import user by csv file"
              id="customFile"
            />
            <div className="d-flex justify-content-end">
              <Button className="custom-btn" type="submit">
                Create User
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ModalComponent
        open={showSuccessModal}
        handleClose={handleSuccessModalClose}
        title="Create User"
        description="The user has been successfully created."
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
