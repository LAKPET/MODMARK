import React from "react";
import { NavLink } from "react-router-dom"; // Use NavLink for active class
import Nav from "react-bootstrap/Nav";
import Logo from "../../../assets/Picture/Logo.png";
import SchoolIcon from "@mui/icons-material/School";
import HelpIcon from "@mui/icons-material/Help";
import "../../../assets/Styles/Sidebar.css";

function Sidebar() {
  return (
    <div
      className="d-flex flex-column text-black fw-normal p-3"
      style={{
        height: "100vh",
        width: "230px",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 10,
        backgroundColor: "#8B5F34",
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
      <Nav className="flex-column mt-4">
        <Nav.Link
          as={NavLink}
          to="/student/course"
          className="text-white mb-3 sidebar-link d-flex align-items-center"
          activeClassName="active" // Automatically adds 'active' class
        >
          <SchoolIcon className="me-2" />
          <span>Course</span>
        </Nav.Link>
        <Nav.Link
          as={NavLink}
          to="/support"
          className="text-white mb-3 sidebar-link d-flex align-items-center"
          activeClassName="active" // Automatically adds 'active' class
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
