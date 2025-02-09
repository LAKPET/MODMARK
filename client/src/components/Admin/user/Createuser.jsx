import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBInput, MDBFile } from "mdb-react-ui-kit";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import axios from "axios";
import "../../../assets/Styles/Admin/Createuser.css";

export default function Createuser({ show, handleClose, refreshUsers }) {
  const [personalNum, setPersonalNum] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    axios
      .post(
        `${apiUrl}/users/create`,
        {
          personal_num: parseInt(personalNum, 10), // Convert to integer
          first_name: firstname,
          last_name: lastname,
          username,
          email,
          password,
          role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        handleClose();
        refreshUsers();
      })
      .catch((err) => console.error(err));
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
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

          <Form.Group className="mb-4" controlId="formUsername">
            <MDBInput
              label="Username"
              id="formUsername"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formPassword">
            <MDBInput
              label="Password"
              id="formPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formRole">
            <Form.Control
              as="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="professor">Professor</option>
              <option value="admin">Admin</option>
            </Form.Control>
          </Form.Group>
          <div className=" mb-3  line-with-text">
            <span>or</span>
          </div>

          <MDBFile
            className=" mb-4"
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
  );
}
