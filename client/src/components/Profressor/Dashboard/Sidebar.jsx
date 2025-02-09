import React from "react";
import Nav from "react-bootstrap/Nav";
import Logo from "../../../assets/Picture/Logo.png";
import { useLocation } from "react-router-dom"; // Import useLocation hook
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
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
        <img src={Logo} alt="Logo" width="140" height="100" />
        <h5 className="mt-4 text-white fw-bold">
          <span style={{ color: "#F49427" }}>Mod</span>mark
        </h5>
        <hr className="line" />
      </div>

      {/* Sidebar Links */}
      <Nav className="flex-column">
        <Nav.Link
          href="/dashboard"
          className={`text-white mb-3 sidebar-link d-flex align-items-center ${
            isActive("/dashboard") ? "active" : ""
          }`}
        >
          <DashboardIcon className="me-2" />
          <span>Dashboard</span>
        </Nav.Link>
        <Nav.Link
          href="/assessment"
          className={`text-white mb-3 sidebar-link d-flex align-items-center ${
            isActive("/assessment") ? "active" : ""
          }`}
        >
          <AssessmentIcon className="me-2" />
          <span>Assessment</span>
        </Nav.Link>
        <Nav.Link
          href="/team"
          className={`text-white mb-3 sidebar-link d-flex align-items-center ${
            isActive("/team") ? "active" : ""
          }`}
        >
          <GroupIcon className="me-2" />
          <span>Team</span>
        </Nav.Link>
        <Nav.Link
          href="/setting"
          className={`text-white mb-3 sidebar-link d-flex align-items-center ${
            isActive("/setting") ? "active" : ""
          }`}
        >
          <SettingsIcon className="me-2" />
          <span>Setting Course</span>
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
