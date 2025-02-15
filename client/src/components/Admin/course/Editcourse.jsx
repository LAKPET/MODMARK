import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MDBInput } from "mdb-react-ui-kit";
import axios from "axios";

export default function EditCourse({ show, handleClose, Id, refreshCourses }) {
  const [courseNumber, setCourseNumber] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [semesterTerm, setSemesterTerm] = useState("");
  const [semesterYear, setSemesterYear] = useState("");
  const [courseName, setCourseName] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (Id) {
      fetchCourseDetails();
    }
  }, [Id]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(`${apiUrl}/section/update/${Id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const course = response.data;
      setCourseNumber(course.course_number);
      setSectionName(course.section_number);
      setSemesterTerm(course.semester_term);
      setSemesterYear(course.semester_year);
      // setCourseName(course.course_name);
    } catch (err) {
      console.error("Failed to fetch course details:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    axios
      .put(
        `${apiUrl}/section/update/${Id}`,
        {
          course_number: courseNumber,
          section_number: sectionName,
          semester_term: semesterTerm,
          semester_year: semesterYear,
          // course_name: courseName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        handleClose();
        refreshCourses();
      })
      .catch((err) => console.error("Failed to update course:", err));
  };

  return (
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
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formSectionName">
            <MDBInput
              label="Section Name"
              id="formSectionName"
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formSemesterTerm">
            <MDBInput
              label="Semester Term"
              id="formSemesterTerm"
              type="text"
              value={semesterTerm}
              onChange={(e) => setSemesterTerm(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formSemesterYear">
            <MDBInput
              label="Semester Year"
              id="formSemesterYear"
              type="text"
              value={semesterYear}
              onChange={(e) => setSemesterYear(e.target.value)}
            />
          </Form.Group>

          {/* <Form.Group className="mb-4" controlId="formCourseName">
            <MDBInput
              label="Course Name"
              id="formCourseName"
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </Form.Group> */}

          <div className="d-flex justify-content-end">
            <Button className="custom-btn" type="submit">
              Update Course
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
