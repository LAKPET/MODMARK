import React, { useState } from "react";
import axios from "axios";
import { Modal, Form } from "react-bootstrap";
import { MDBBtn, MDBInput } from "mdb-react-ui-kit";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ModalComponent from "../../../controls/modal"; // Import ModalComponent
import "../../../assets/Styles/Course/Createcourse.css";

export default function Createcourse({ show, handleClose, role }) {
  const [courseNumber, setCourseNumber] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [section, setSection] = useState("");
  const [term, setTerm] = useState("");
  const [year, setYear] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all fields are filled
    if (
      !courseNumber ||
      !courseName ||
      !courseDescription ||
      !section ||
      !term ||
      !year
    ) {
      alert("Please fill all the fields.");
      return; // Stop if any field is empty
    }

    const courseData = {
      course_number: courseNumber,
      course_name: courseName,
      course_description: courseDescription,
      section_number: section,
      section_term: term,
      section_year: year,
      role: role, // Include the role in the course data
    };

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(`${apiUrl}/course/create`, courseData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Course created successfully:", response.data);
      handleClose(); // Close the modal after success
      setShowSuccessModal(true); // Show success modal
    } catch (error) {
      console.error(
        "Error creating course:",
        error.response?.data || error.message
      );

      // If the backend returns an error, handle it appropriately
      if (error.response && error.response.data) {
        alert(error.response.data.message); // Display the backend error message
      }
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="courseNumber">
              <MDBInput
                label="Enter course number"
                id="courseNumber"
                type="text"
                size="lg"
                value={courseNumber}
                onChange={(e) => setCourseNumber(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="courseName">
              <MDBInput
                label="Enter course name"
                id="courseName"
                type="text"
                size="lg"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="courseDescription">
              <MDBInput
                label="Enter course description"
                id="courseDescription"
                type="textarea"
                size="lg"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="section">
              <MDBInput
                label="Enter section"
                id="section"
                type="text"
                size="lg"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </Form.Group>
            <Box className="mb-3">
              <FormControl fullWidth>
                <InputLabel id="term-select-label">Term</InputLabel>
                <Select
                  labelId="term-select-label"
                  id="term-select"
                  value={term}
                  label="Term"
                  onChange={(e) => setTerm(e.target.value)}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box className="mb-3">
              <FormControl fullWidth>
                <InputLabel id="year-select-label">Year</InputLabel>
                <Select
                  labelId="year-select-label"
                  id="year-select"
                  value={year}
                  label="Year"
                  onChange={(e) => setYear(e.target.value)}
                >
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                  <MenuItem value="2026">2026</MenuItem>
                  <MenuItem value="2027">2027</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <div className="d-flex justify-content-end">
              <MDBBtn className="btn-create-course" type="submit">
                Create Course
              </MDBBtn>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ModalComponent
        open={showSuccessModal}
        handleClose={() => setShowSuccessModal(false)}
        title="Create Course"
        description="The course has been successfully created."
      />
    </>
  );
}
