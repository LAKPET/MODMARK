import React from "react";
import Nav from "react-bootstrap/Nav";
import Logo from "../../../assets/Picture/Logo.png";
import { NavLink, useLocation } from "react-router-dom"; // Import useLocation hook
import SchoolIcon from "@mui/icons-material/School";
import HelpIcon from "@mui/icons-material/Help";
import "../../../assets/Styles/Sidebar.css";

function Sidebar() {
  const location = useLocation(); // Get the current route

  // Helper function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div
      className="d-flex flex-column text-black fw-normal p-3"
      style={{
        height: "100vh",
        width: "230px",
        position: "fixed",
        top: 0, // Sidebar starts from the top
        left: 0,
        zIndex: 10, // Sidebar is on top of Navbar
        backgroundColor: "#8B5F34", // Updated background color
      }}
    >
      {/* Logo */}
      <div className="mb-4 mt-2 text-center">
        <NavLink to="/professor/course">
          <img src={Logo} alt="Logo" width="140" height="100" />
        </NavLink>
        <h5 className="mt-4 text-white fw-bold">
          <span style={{ color: "#F49427" }}>Mod</span>mark
        </h5>
        <hr className="line" />
      </div>

      {/* Sidebar Links */}
      <Nav className="flex-column mt-4">
        <Nav.Link
          href="/professor/course"
          className={`text-white mb-3 sidebar-link d-flex align-items-center ${
            isActive("/professor/course") ? "active" : ""
          }`}
        >
          <SchoolIcon className="me-2" />
          <span>Course</span>
        </Nav.Link>
        <Nav.Link
          href="/support"
          className={`text-white mb-3 sidebar-link d-flex align-items-center ${
            isActive("/support") ? "active" : ""
          }`}
        >
          <HelpIcon className="me-2" />
          <span>Support</span>
        </Nav.Link>
      </Nav>

      {/* Language Switcher */}
      <div className="mt-auto">
        <p className="text-white">Language</p>
        <div className="d-flex justify-content-center align-items-center">
          <button className="btn btn-sm btn-light me-1">TH</button>
          <button className="btn btn-sm btn-warning">ENG</button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
