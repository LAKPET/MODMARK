import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBInput } from "mdb-react-ui-kit";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ModalComponent from "../../../controls/Modal";
import { userApi } from "../../../services/userAPI"; // Import the userApi service

export default function Edituser({ show, handleClose, userId, refreshUsers }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const user = await userApi.getUserProfile(userId);
      setFirstname(user.first_name);
      setLastname(user.last_name);
      setEmail(user.email);
      setUsername(user.username);
      setRole(user.role);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await userApi.updateUser(userId, {
        firstname,
        lastname,
        email,
        username,
        role,
      });
      handleClose();
      refreshUsers();
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
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

            <Form.Group className="mb-4" controlId="formUsername">
              <MDBInput
                label="Username"
                id="formUsername"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
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
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="professor">Professor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button className="custom-btn" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ModalComponent
        open={showSuccessModal}
        handleClose={() => setShowSuccessModal(false)}
        title="Update User"
        description="The user details have been successfully updated."
      />
    </>
  );
}
