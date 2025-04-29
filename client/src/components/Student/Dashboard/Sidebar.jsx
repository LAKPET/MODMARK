import React from "react";
import Nav from "react-bootstrap/Nav";
import Logo from "../../../assets/Picture/Logo.png";
import { NavLink, useLocation, useParams } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GradeIcon from "@mui/icons-material/Grade";
import "../../../assets/Styles/Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const { id } = useParams();

  const isActive = (path) => location.pathname === path;

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
      <div className="mb-4 mt-2 text-center">
        <NavLink to="/student/course">
          <img src={Logo} alt="Logo" width="140" height="100" />
        </NavLink>
        <h5 className="mt-4 text-white fw-bold">
          <span style={{ color: "#F49427" }}>Mod</span>mark
        </h5>
        <hr className="line" />
      </div>

      <Nav className="flex-column mt-4">
        <Nav.Link
          as={NavLink}
          to={`/student/dashboard/${id}`}
          className={`text-white mb-3 sidebar-link d-flex align-items-center ${
            isActive(`/student/dashboard/${id}`) ? "active" : ""
          }`}
        >
          <DashboardIcon className="me-2" />
          <span>Dashboard</span>
        </Nav.Link>
        <Nav.Link
          as={NavLink}
          to={`/student/assessment/${id}`}
          className={`text-white mb-3 sidebar-link d-flex align-items-center ${
            isActive(`/student/assessment/${id}`) ? "active" : ""
          }`}
        >
          <AssessmentIcon className="me-2" />
          <span>Assessment</span>
        </Nav.Link>
        <Nav.Link
          as={NavLink}
          to={`/student/score-feedback/${id}`}
          className={`text-white mb-3 sidebar-link d-flex align-items-center ${
            isActive(`/student/score-feedback/${id}`) ? "active" : ""
          }`}
        >
          <GradeIcon className="me-2" />
          <span>Score & Feedback</span>
        </Nav.Link>
      </Nav>

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
