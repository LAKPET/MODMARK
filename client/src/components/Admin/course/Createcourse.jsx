import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBInput } from "mdb-react-ui-kit";
import courseAPI from "../../../services/courseAPI";
import { validateEditCourseForm } from "../../../utils/FormValidation";

const Createcourse = ({ show, handleClose, role, onCourseCreated }) => {
  const [courseName, setCourseName] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [semesterTerm, setSemesterTerm] = useState("");
  const [semesterYear, setSemesterYear] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      courseNumber,
      sectionName,
      semesterTerm,
      semesterYear,
      courseName,
    };

    // Using the same validation function as EditCourse since the fields are the same
    const { isValid, errors: validationErrors } =
      validateEditCourseForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await courseAPI.createCourse({
        course_name: courseName,
        course_number: courseNumber,
        section_name: sectionName,
        semester_term: semesterTerm,
        semester_year: semesterYear,
      });

      if (response.status === 201) {
        toast.success("Course created successfully!");
        handleClose();
        if (onCourseCreated) {
          onCourseCreated();
        }

        // Reset form
        setCourseName("");
        setCourseNumber("");
        setSectionName("");
        setSemesterTerm("");
        setSemesterYear("");
        setErrors({});
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.message || "Error creating course");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Course</Modal.Title>
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
              Create Course
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Createcourse;
