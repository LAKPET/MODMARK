import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import "../../../assets/Styles/Navbar.css";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../../controls/Avatar";

function Navber() {
  const username = localStorage.getItem("Username");
  const navigate = useNavigate(); // Use navigate for redirection

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("Username");
    localStorage.removeItem("authToken");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <Navbar className="custom-navbar">
      <Container>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-start">
          {/* Breadcrumb Navigation */}
          <nav
            style={{
              "--bs-breadcrumb-divider": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='currentColor'/%3E%3C/svg%3E")`,
            }}
            aria-label="breadcrumb"
          >
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/course">My Course</a>
              </li>
            </ol>
          </nav>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className="d-flex align-items-center">
            <span>Signed in as: </span>
            <Avatar {...stringAvatar(username || "Guest")} className="ms-2" />
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
