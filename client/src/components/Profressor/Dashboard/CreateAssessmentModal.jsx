import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { MDBInput } from "mdb-react-ui-kit";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import axios from "axios";
import "../../../assets/Styles/Dashboard/CreateAssessment.css";
import picturetab1 from "../../../assets/Picture/mdi_number-1-box.png";
import picturetab2 from "../../../assets/Picture/mdi_number-2-box.png";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

export default function CreateAssessmentModal({
  show,
  handleClose,
  refreshAssessments,
  courseDetails,
}) {
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState("individual");
  const [gradingType, setGradingType] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rubric, setRubric] = useState("");
  const [weights, setWeights] = useState({}); // State to track weights for each row
  const [activeTab, setActiveTab] = useState("assessmentDetail");
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleWeightChange = (id, value) => {
    setWeights((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    axios
      .post(
        `${apiUrl}/assessment/create`,
        {
          course_id: courseDetails.course_id,
          section_id: courseDetails.section_id,
          professor_id: courseDetails.professor_id,
          assessment_name: assessmentName,
          assessment_description: assessmentDescription,
          assignment_type: assessmentType,
          teamgrading_type: gradingType,
          publish_date: publishDate,
          due_date: dueDate,
          weights, // Pass weights object
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        handleClose();
        refreshAssessments();
      })
      .catch((err) => console.error(err));
  };

  const handleNextTab = () => {
    if (activeTab === "assessmentDetail") {
      setActiveTab("createRubric");
    }
  };

  const handlePreviousTab = () => {
    if (activeTab === "createRubric") {
      setActiveTab("assessmentDetail");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstName", headerName: "First name", width: 130 },
    { field: "lastName", headerName: "Last name", width: 130 },
    { field: "email", headerName: "Email", width: 180 },
    {
      field: "weight",
      headerName: "Weight (%)",
      width: 100,
      renderCell: (params) => (
        <MDBInput
          className="mt-2  w-100"
          type="number"
          min="0"
          max="100"
          value={weights[params.row.id] || ""}
          onChange={(e) => handleWeightChange(params.row.id, e.target.value)}
        />
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      firstName: "Jon",
      lastName: "Snow",
      email: "jon.snow@example.com",
    },
    {
      id: 2,
      firstName: "Cersei",
      lastName: "Lannister",
      email: "cersei.lannister@example.com",
    },
    {
      id: 3,
      firstName: "Jaime",
      lastName: "Lannister",
      email: "jaime.lannister@example.com",
    },
    {
      id: 4,
      firstName: "Arya",
      lastName: "Stark",
      email: "arya.stark@example.com",
    },
    {
      id: 5,
      firstName: "Daenerys",
      lastName: "Targaryen",
      email: "daenerys.targaryen@example.com",
    },
  ];

  return (
    <Modal show={show} onHide={handleClose} className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Create Assessment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="custom-tab-container">
          <button
            className={`custom-tab ${activeTab === "assessmentDetail" ? "active" : ""}`}
            onClick={() => setActiveTab("assessmentDetail")}
          >
            <img
              src={picturetab1}
              alt="Assessment Detail"
              className="tab-icon"
            />
            Assessment Detail
          </button>
          <button
            className={`custom-tab ${activeTab === "createRubric" ? "active" : ""}`}
            onClick={() => setActiveTab("createRubric")}
          >
            <img src={picturetab2} alt="Create Rubric" className="tab-icon" />
            Create Rubric
          </button>
        </div>

        {activeTab === "assessmentDetail" && (
          <Form>
            <Form.Group className="mt-2 mb-4" controlId="formAssessmentName">
              <MDBInput
                label="Assessment Name"
                id="formAssessmentName"
                type="text"
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formAssessmentDescription">
              <MDBInput
                label="Assessment Description"
                id="formAssessmentDescription"
                type="text"
                value={assessmentDescription}
                onChange={(e) => setAssessmentDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formAssessmentType">
              <FormControl fullWidth>
                <InputLabel id="assessment-type-select-label">
                  Assessment Type
                </InputLabel>
                <Select
                  labelId="assessment-type-select-label"
                  id="assessment-type-select"
                  value={assessmentType}
                  label="Assessment Type"
                  onChange={(e) => setAssessmentType(e.target.value)}
                >
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="group">Group</MenuItem>
                </Select>
              </FormControl>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formGradingType">
              <FormControl fullWidth>
                <InputLabel id="grading-type-select-label">
                  Grading Type
                </InputLabel>
                <Select
                  labelId="grading-type-select-label"
                  id="grading-type-select"
                  value={gradingType}
                  label="Grading Type"
                  onChange={(e) => setGradingType(e.target.value)}
                >
                  <MenuItem value={false}>Individual</MenuItem>
                  <MenuItem value={true}>Team</MenuItem>
                </Select>
              </FormControl>
            </Form.Group>

            {gradingType && (
              <div className="mb-4">
                <Paper sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    checkboxSelection
                    sx={{ border: 0 }}
                  />
                </Paper>
              </div>
            )}

            <Row className="mb-4">
              <Col>
                <Form.Group controlId="formPublishDate">
                  <MDBInput
                    label="Publish Date"
                    id="formPublishDate"
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formDueDate">
                  <MDBInput
                    label="Due Date"
                    id="formDueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}

        {activeTab === "createRubric" && (
          <Form.Group className="mt-2 mb-4" controlId="formRubric">
            <FormControl fullWidth>
              <InputLabel id="rubric-select-label">
                Select Your Rubric
              </InputLabel>
              <Select
                labelId="rubric-select-label"
                id="rubric-select"
                value={rubric}
                label="Rubric"
                onChange={(e) => setRubric(e.target.value)}
              >
                <MenuItem value="Rubric 1">Rubric 1</MenuItem>
                <MenuItem value="Rubric 2">Rubric 2</MenuItem>
                <MenuItem value="Rubric 3">Rubric 3</MenuItem>
              </Select>
            </FormControl>
          </Form.Group>
        )}

        <div className="d-flex justify-content-end">
          {activeTab === "createRubric" && (
            <Button
              variant="secondary"
              className="me-2"
              onClick={handlePreviousTab}
            >
              Back
            </Button>
          )}
          {activeTab === "assessmentDetail" && (
            <Button
              variant="secondary"
              className="me-2"
              onClick={handleNextTab}
            >
              Next
            </Button>
          )}
          {activeTab === "createRubric" && (
            <Button variant="success" onClick={handleSubmit}>
              Save
            </Button>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
