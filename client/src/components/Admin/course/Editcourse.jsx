import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBInput } from "mdb-react-ui-kit";
import axios from "axios";
import ModalComponent from "../../../controls/Modal";
import { validateEditCourseForm } from "../../../utils/FormValidation";

export default function EditCourse({ show, handleClose, Id, refreshCourses }) {
  const [courseNumber, setCourseNumber] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [semesterTerm, setSemesterTerm] = useState("");
  const [semesterYear, setSemesterYear] = useState("");
  const [courseName, setCourseName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (Id) {
      fetchCourseDetails();
    }
  }, [Id]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${apiUrl}/section/${Id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const course = response.data;
      setCourseNumber(course.course_number);
      setSectionName(course.section_number);
      setSemesterTerm(course.semester_term);
      setSemesterYear(course.semester_year);
      setCourseName(course.course_name);
    } catch (err) {
      setErrorModal({
        open: true,
        message: "Failed to fetch course details. Please try again.",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      courseNumber,
      sectionName,
      semesterTerm,
      semesterYear,
      courseName,
    };

    const { isValid, errors: validationErrors } =
      validateEditCourseForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    const token = localStorage.getItem("authToken");
    axios
      .put(
        `${apiUrl}/section/update/${Id}`,
        {
          course_number: courseNumber,
          section_number: sectionName,
          semester_term: semesterTerm,
          semester_year: semesterYear,
          course_name: courseName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        handleClose();
        refreshCourses();
        setShowSuccessModal(true);
      })
      .catch((err) => {
        setErrorModal({
          open: true,
          message:
            err.response?.data?.message ||
            "Failed to update course. Please try again.",
        });
      });
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: "" });
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="formCourseNumber">
              <MDBInput
                label="Course Number"
                id="formCourseNumber"
                type="text"
                value={courseNumber}
                onChange={(e) => setCourseNumber(e.target.value)}
                invalid={!!errors.courseNumber}
                className={errors.courseNumber ? "border-danger" : ""}
                placeholder="e.g. CPE 123"
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

            <Form.Group className="mb-4" controlId="formSectionName">
              <MDBInput
                label="Section Name"
                id="formSectionName"
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                invalid={!!errors.sectionName}
                className={errors.sectionName ? "border-danger" : ""}
                placeholder="e.g. 1"
              />
              {errors.sectionName && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.sectionName}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4" controlId="formSemesterTerm">
              <MDBInput
                label="Semester Term"
                id="formSemesterTerm"
                type="text"
                value={semesterTerm}
                onChange={(e) => setSemesterTerm(e.target.value)}
                invalid={!!errors.semesterTerm}
                className={errors.semesterTerm ? "border-danger" : ""}
                placeholder="1 or 2"
              />
              {errors.semesterTerm && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.semesterTerm}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4" controlId="formSemesterYear">
              <MDBInput
                label="Semester Year"
                id="formSemesterYear"
                type="text"
                value={semesterYear}
                onChange={(e) => setSemesterYear(e.target.value)}
                invalid={!!errors.semesterYear}
                className={errors.semesterYear ? "border-danger" : ""}
                placeholder="e.g. 2024"
              />
              {errors.semesterYear && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.semesterYear}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4" controlId="formCourseName">
              <MDBInput
                label="Course Name"
                id="formCourseName"
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                invalid={!!errors.courseName}
                className={errors.courseName ? "border-danger" : ""}
                placeholder="Course name must be at least 3 characters"
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

            <div className="d-flex justify-content-end">
              <Button className="custom-btn" type="submit">
                Update Course
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

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
    </>
  );
}
