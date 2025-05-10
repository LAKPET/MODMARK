import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import ModalComponent from "../../../controls/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { validateDetailCourseForm } from "../../../utils/FormValidation";

export default function DetailCourse({ Id }) {
  const { id: paramId } = useParams();
  const courseId = Id || paramId;
  const [course, setCourse] = useState({
    course_number: "",
    section_number: "",
    course_name: "",
    course_description: "",
    semester_term: "",
    semester_year: "",
  });
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${apiUrl}/course/details/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(response.data);
    } catch (err) {
      setErrorModal({
        open: true,
        message:
          err.response?.data?.message ||
          "Failed to fetch course details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } =
      validateDetailCourseForm(course);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${apiUrl}/section/update/${courseId}`, course, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowSuccessModal(true);
      setErrors({});
    } catch (err) {
      setErrorModal({
        open: true,
        message:
          err.response?.data?.message ||
          "Failed to update course. Please try again.",
      });
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: "" });
  };

  if (loading) {
    return (
      <Backdrop
        sx={(theme) => ({ color: "#8B5F34", zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <Container className="mt-3 mx-3 text-start" style={{ width: "1000px" }}>
      <h3 className="mb-3">Edit Course Details</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Course Number</Form.Label>
          <Form.Control
            type="text"
            name="course_number"
            value={course.course_number}
            onChange={handleChange}
            isInvalid={!!errors.course_number}
            placeholder="Enter course number (e.g., ABC 123)"
          />
          <Form.Control.Feedback type="invalid">
            {errors.course_number}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Course Name</Form.Label>
          <Form.Control
            type="text"
            name="course_name"
            value={course.course_name}
            onChange={handleChange}
            isInvalid={!!errors.course_name}
            placeholder="Enter course name (minimum 3 characters)"
          />
          <Form.Control.Feedback type="invalid">
            {errors.course_name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Course Description</Form.Label>
          <Form.Control
            as="textarea"
            name="course_description"
            value={course.course_description}
            onChange={handleChange}
            rows={3}
            isInvalid={!!errors.course_description}
            placeholder="Enter course description (minimum 10 characters)"
          />
          <Form.Control.Feedback type="invalid">
            {errors.course_description}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Section Number</Form.Label>
          <Form.Control
            type="text"
            name="section_number"
            value={course.section_number}
            onChange={handleChange}
            isInvalid={!!errors.section_number}
            placeholder="Enter section number"
          />
          <Form.Control.Feedback type="invalid">
            {errors.section_number}
          </Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Semester Term</Form.Label>
              <Form.Control
                type="text"
                name="semester_term"
                value={course.semester_term}
                onChange={handleChange}
                isInvalid={!!errors.semester_term}
                placeholder="Enter semester term (1 or 2)"
              />
              <Form.Control.Feedback type="invalid">
                {errors.semester_term}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Semester Year</Form.Label>
              <Form.Control
                type="text"
                name="semester_year"
                value={course.semester_year}
                onChange={handleChange}
                isInvalid={!!errors.semester_year}
                placeholder="Enter semester year (YYYY)"
              />
              <Form.Control.Feedback type="invalid">
                {errors.semester_year}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <div className="text-end">
          <Button type="submit" className="custom-btn">
            Update Course
          </Button>
        </div>
      </Form>

      <ModalComponent
        open={showSuccessModal}
        handleClose={handleSuccessModalClose}
        title="Update Course"
        description="The course details have been successfully updated."
        type="success"
      />

      <ModalComponent
        open={errorModal.open}
        handleClose={handleErrorModalClose}
        title="Update Course Error"
        description={errorModal.message}
        type="error"
      />
    </Container>
  );
}
