import React from "react";
import { Row, Col } from "react-bootstrap";

const AssessmentHeader = ({ courseDetails }) => {
  if (!courseDetails) return null;

  return (
    <Row className="pb-3 mb-4">
      <Col md={8}>
        <h2 className="mb-0 fw-semibold d-flex align-items-center">
          {courseDetails.course_number}
          <span className="vertical-line bg-dark mx-3"></span>
          <span className="fw-normal fs-5">
            {courseDetails.semester_term} / {courseDetails.semester_year}
          </span>
        </h2>
        <div className="d-flex align-items-center">
          <p className="text-muted p-1 mb-0">{courseDetails.course_name}</p>
          <span className="text-muted p-1">{`Section ${courseDetails.section_number}`}</span>
        </div>
      </Col>
    </Row>
  );
};

export default AssessmentHeader;
