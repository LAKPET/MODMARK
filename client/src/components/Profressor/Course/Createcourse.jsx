import React, { useState } from "react";
import axios from "axios";
import { Modal, Form } from "react-bootstrap";
import { MDBBtn, MDBInput } from "mdb-react-ui-kit";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ModalComponent from "../../../controls/Modal";
import { validateCreateCourseForm } from "../../../utils/FormValidation";
import "../../../assets/Styles/Course/Createcourse.css";

export default function Createcourse({
  show,
  handleClose,
  role,
  onCourseCreated,
}) {
  const [courseNumber, setCourseNumber] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [section, setSection] = useState("");
  const [term, setTerm] = useState("");
  const [year, setYear] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      courseNumber,
      courseName,
      courseDescription,
      section,
      term,
      year,
    };

    const { isValid, errors: validationErrors } =
      validateCreateCourseForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    const courseData = {
      course_number: courseNumber,
      course_name: courseName,
      course_description: courseDescription,
      section_number: section,
      section_term: term,
      section_year: year,
      role: role,
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
      handleClose();
      setShowSuccessModal(true);
      if (onCourseCreated) {
        onCourseCreated();
      }
    } catch (error) {
      console.error(
        "Error creating course:",
        error.response?.data || error.message
      );

      setErrorModal({
        open: true,
        message:
          error.response?.data?.message ||
          "Failed to create course. Please try again.",
      });
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: "" });
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
                placeholder="e.g. CPE 123"
                id="courseNumber"
                type="text"
                size="lg"
                value={courseNumber}
                onChange={(e) => setCourseNumber(e.target.value)}
                invalid={!!errors.courseNumber}
                className={errors.courseNumber ? "border-danger" : ""}
              />
              {errors.courseNumber && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.courseNumber}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="courseName">
              <MDBInput
                label="Enter course name"
                placeholder="e.g. Computer Engineering"
                id="courseName"
                type="text"
                size="lg"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                invalid={!!errors.courseName}
                className={errors.courseName ? "border-danger" : ""}
              />
              {errors.courseName && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.courseName}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="courseDescription">
              <MDBInput
                label="Enter course description"
                placeholder="Description must be at least 10 characters"
                id="courseDescription"
                type="textarea"
                size="lg"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                invalid={!!errors.courseDescription}
                className={errors.courseDescription ? "border-danger" : ""}
              />
              {errors.courseDescription && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.courseDescription}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="section">
              <MDBInput
                label="Enter section"
                placeholder="e.g. 1 or 2"
                id="section"
                type="text"
                size="lg"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                invalid={!!errors.section}
                className={errors.section ? "border-danger" : ""}
              />
              {errors.section && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.section}
                </div>
              )}
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
                  error={!!errors.term}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                </Select>
                {errors.term && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.term}
                  </div>
                )}
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
                  error={!!errors.year}
                >
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                  <MenuItem value="2026">2026</MenuItem>
                  <MenuItem value="2027">2027</MenuItem>
                </Select>
                {errors.year && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.year}
                  </div>
                )}
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
        handleClose={handleSuccessModalClose}
        title="Create Course"
        description="The course has been successfully created."
        type="success"
      />

      <ModalComponent
        open={errorModal.open}
        handleClose={handleErrorModalClose}
        title="Create Course Error"
        description={errorModal.message}
        type="error"
      />
    </>
  );
}
