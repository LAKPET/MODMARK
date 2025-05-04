import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Import NavLink for navigation
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import axios from "axios"; // Import axios for making HTTP requests
import "../../../assets/Styles/Navbar.css";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../../controls/Avatar";

function Navber() {
  const username = localStorage.getItem("Username");
  const firstName = localStorage.getItem("FirstName");
  const lastName = localStorage.getItem("LastName");
  const role = localStorage.getItem("UserRole");
  const navigate = useNavigate(); // Use navigate for redirection

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear user data from localStorage
      localStorage.removeItem("Username");
      localStorage.removeItem("authToken");

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleClick = (event) => {
    event.preventDefault();
    console.info("You clicked a breadcrumb.");
  };

  return (
    <Navbar className="custom-navbar">
      <Container>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-start">
          {/* Breadcrumb Navigation */}
          <div role="presentation" onClick={handleClick}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                component={NavLink}
                to="/professor/course"
                underline="hover"
                color="inherit"
              >
                My Course
              </Link>
            </Breadcrumbs>
          </div>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className="d-flex align-items-center">
            {/* <span>Signed in as: </span> */}
            <Avatar {...stringAvatar(username || "Guest")} className="ms-2" />
            <div className="ms-2">
              User: {firstName} {lastName}
              <br />
              role: {role}
            </div>
            <HorizontalRuleIcon className="icon-line" />
          </Navbar.Text>
          <Navbar.Text>
            <button
              onClick={handleLogout}
              className="btn btn-secondary mt-1 fw-bold rounded-pill"
            >
              Logout
            </button>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navber;
