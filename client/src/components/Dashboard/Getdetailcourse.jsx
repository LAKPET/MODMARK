import React, { useState, useEffect } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import "../../assets/Styles/DashboardPage.css";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
export default function Getdetailcourse() {
  const [courseDetails, setCourseDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching data
    setTimeout(() => {
      const mockData = {
        course_name: "CPE XXX",
        course_description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        section_term: 1,
        section_year: 2024,
        team: ["Prof. John Doe", "Prof. Jane Smith", "Prof. Alan Brown"],
      };
      setCourseDetails(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-4">
      {/* Course Header */}
      <Row className="pb-3 mb-4">
        <Col md={8}>
          <h2 className="mb-0 fw-semibold d-flex align-items-center">
            {courseDetails.course_name}
            <span className="vertical-line bg-dark mx-3"></span>
            <span className="fw-normal fs-5">
              {courseDetails.section_term} / {courseDetails.section_year}
            </span>
          </h2>
          <p className="text-muted p-1">Computer Engineer</p>
        </Col>
      </Row>

      {/* Course Description and Team */}
      <Row className="mb-4 text-dark">
        <Col md={8}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Description</h5>
          <p>{courseDetails.course_description}</p>
        </Col>
        <Col md={4}>
          <h5 className="pb-3 mb-4 short-border fw-semibold">Team</h5>
          <ul className="list-unstyled">
            {courseDetails.team.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>
        </Col>
      </Row>

      {/* Assessment Section */}
      <Row className="text-center mt-5">
        <Col>
          <h3 className="mb-4 fw-semibold fs-2">
            You Currently have no Assessments.
          </h3>
          <h3 className="mb-4 fw-normal">
            Create an assessment to get started
          </h3>
          <Button className="custom-btn mt-2">Create Assessment</Button>
        </Col>
      </Row>
    </Container>
  );
}
