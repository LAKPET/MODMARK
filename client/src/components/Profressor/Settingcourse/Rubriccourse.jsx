import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import TextField from "@mui/material/TextField";
import DynamicRubricTable from "./Rubrictable";

const RubricMain = () => {
  const [rubric, setRubric] = useState({
    name: "",
    description: "",
    score: "",
  });

  const [criteria, setCriteria] = useState([]);

  const handleChange = (e) => {
    setRubric({ ...rubric, [e.target.name]: e.target.value });
  };

  const addCriterion = () => {
    setCriteria([...criteria, { score: 0, description: "รายละเอียดเกณฑ์" }]);
  };

  return (
    <Container fluid className="mt-1">
      <Row className="align-items-center">
        <Col>
          <h3>Rubric Details</h3>
        </Col>
        <Col className="d-flex justify-content-end gap-2">
          <Button className="custom-btn ">List Rubric</Button>
          <Button className="custom-btn " onClick={addCriterion}>
            + Add Criterion
          </Button>
        </Col>
      </Row>

      {/* 🟢 Rubric Name */}
      <Row className="mb-3 mt-4">
        <Col md={6}>
          <Form.Group controlId="rubricName">
            <Form.Label>Rubric Name :</Form.Label>
            <TextField
              id="standard-multiline-flexible"
              multiline
              maxRows={4}
              variant="standard"
              inputProps={{ style: { textAlign: "center" } }}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* 🟢 Rubric Description */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="rubricDescription">
            <Form.Label>Rubric Description :</Form.Label>
            <TextField
              id="standard-multiline-flexible"
              multiline
              maxRows={4}
              variant="standard"
              inputProps={{ style: { textAlign: "center" } }}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* 🟢 Score และ Add Criterion Button */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="rubricScore">
            <Form.Label>Score :</Form.Label>
            <TextField
              id="standard-multiline-flexible"
              multiline
              maxRows={4}
              variant="standard"
              inputProps={{ style: { textAlign: "center" } }}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-4">
        <DynamicRubricTable />
      </Row>
    </Container>
  );
};

export default RubricMain;
