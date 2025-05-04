import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import axios from "axios"; // Import axios for making HTTP requests
import "../../assets/Styles/Navbar.css";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../controls/Avatar";

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
                <a href="/dashboard/admin">Dashboard Admin</a>
              </li>
            </ol>
          </nav>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className="d-flex align-items-center">
            {/* <span>Signed in as: </span>  */}
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
