import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation, useParams } from "react-router-dom"; // Import useLocation and useParams for getting the current path and id
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import axios from "axios"; // Import axios for making HTTP requests
import "../../../assets/Styles/Navbar_feedback.css";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Logo from "../../../assets/Picture/Logo.png"; // Import the logo

function Navber() {
  const username = localStorage.getItem("Username");
  const navigate = useNavigate(); // Use navigate for redirection
  const location = useLocation(); // Get the current path
  const { id, assessmentId, fileUrl, submissionId } = useParams(); // Get the id, assessmentId, fileUrl, and submissionId from the URL
  const [courseDetails, setCourseDetails] = useState(null);
  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);

  useEffect(() => {
    console.log("Current params:", { id, assessmentId, fileUrl, submissionId });
    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/course/details/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCourseDetails(response.data); // Set course details in state
      } catch (error) {
        console.error("Error loading course details:", error);
      }
    };

    const fetchAssessmentDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/assessment/${assessmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAssessmentDetails(response.data); // Set assessment details in state
      } catch (error) {
        console.error("Error loading assessment details:", error);
      }
    };

    const fetchSubmissionDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/submission/${submissionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSubmissionDetails(response.data);
      } catch (error) {
        console.error("Error loading submission details:", error);
      }
    };

    fetchCourseDetails();
    if (assessmentId) {
      fetchAssessmentDetails();
    }
    if (submissionId) {
      fetchSubmissionDetails();
    }
  }, [id, assessmentId, submissionId, navigate]);

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

  // Determine the current page based on the path
  const getCurrentPage = () => {
    if (location.pathname.includes("/dashboard")) {
      return "Dashboard";
    } else if (location.pathname.includes("/assessment")) {
      return "Assessment";
    } else if (location.pathname.includes("/team")) {
      return "Team";
    } else if (location.pathname.includes("/setting")) {
      return "Setting Course";
    } else if (location.pathname.includes("/viewassessment")) {
      return "View Assessment";
    } else {
      return "My Dashboard";
    }
  };

  return (
    <Navbar className="custom-navbar-feedback">
      <Container>
        <Navbar.Brand className="navbar-brand">
          <NavLink to="/professor/course">
            <img
              src={Logo}
              className="navbar-logo me-3"
              alt="Logo"
              width="120"
              height="70"
            />
          </NavLink>
        </Navbar.Brand>
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
              {courseDetails && (
                <>
                  <Link
                    component={NavLink}
                    to={`/dashboard/${id}`}
                    underline="hover"
                    color="inherit"
                  >
                    {courseDetails.course_number}-{courseDetails.section_number}
                  </Link>
                </>
              )}
              {courseDetails && (
                <Link
                  component={NavLink}
                  to={`/assessment/${id}`}
                  underline="hover"
                  color="inherit"
                >
                  {getCurrentPage()}
                </Link>
              )}
              {location.pathname.includes("/allassessmentuser") &&
                assessmentDetails && (
                  <Typography sx={{ color: "text.primary" }}>
                    {assessmentDetails.assessment_name}
                  </Typography>
                )}
              {location.pathname.includes("/viewassessment") && (
                <Typography sx={{ color: "text.primary" }}>{id}</Typography>
              )}
            </Breadcrumbs>
          </div>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            Signed in as: <a href="#profile">{username || "Guest"}</a>
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
