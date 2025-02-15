import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";

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

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("Fetching course with ID:", courseId);
      const response = await axios.get(`${apiUrl}/course/details/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(response.data);
      console.log("Data fetched:", response.data);
    } catch (err) {
      console.error("Failed to fetch course details:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${apiUrl}/section/update/${courseId}`, course, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
    } catch (err) {
      console.error("Failed to update course:", err);
 
    }
  };

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
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Course Name</Form.Label>
          <Form.Control
            type="text"
            name="course_name"
            value={course.course_name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Course Description</Form.Label>
          <Form.Control
            as="textarea"
            name="course_description"
            value={course.course_description}
            onChange={handleChange}
            rows={3}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Section Name</Form.Label>
          <Form.Control
            type="text"
            name="section_number"
            value={course.section_number}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Semester Term</Form.Label>
              <Form.Control
                type="text"
                name="semester_term"
                value={course.section_term}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Semester Year</Form.Label>
              <Form.Control
                type="text"
                name="semester_year"
                value={course.section_year}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="text-end">
          <Button type="submit" className="custom-btn ">
            Update Course
          </Button>
        </div>
      </Form>
    </Container>
  );
}
