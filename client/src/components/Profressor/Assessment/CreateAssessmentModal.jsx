import React, { useState, useEffect } from "react";
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
import { useParams } from "react-router-dom";
import ModalComponent from "../../../controls/modal"; // Import ModalComponent
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
export default function CreateAssessmentModal({
  show,
  handleClose,
  refreshAssessments,
  courseDetails,
}) {
  const { id } = useParams();
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState("individual");
  const [gradingType, setGradingType] = useState(false);
  const [rows, setRows] = useState([]);
  const [publishDate, setPublishDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [weights, setWeights] = useState({});
  const [activeTab, setActiveTab] = useState("assessmentDetail");
  const [rubrics, setRubrics] = useState([]);
  const [rubric, setRubric] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleWeightChange = (id, value) => {
    setWeights((prev) => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const resetForm = () => {
    setAssessmentName("");
    setAssessmentDescription("");
    setAssessmentType("individual");
    setGradingType(false);
    setPublishDate("");
    setDueDate("");
    setWeights({});
    setRubric("");
    setActiveTab("assessmentDetail");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    const requestData = {
      course_id: courseDetails.course_id,
      section_id: courseDetails.section_id,
      assessment_name: assessmentName,
      assessment_description: assessmentDescription,
      assignment_type: assessmentType,
      teamgrading_type: gradingType,
      publish_date: publishDate,
      due_date: dueDate,
      rubric_id: rubrics[0]._id,
      graders: rows
        .filter(
          (row) => weights[row.p_id] !== undefined && weights[row.p_id] !== null
        )
        .map((row) => ({
          user_id: row.p_id,
          role: row.role,
          weight: weights[row.p_id] / 100,
        })),
    };

    console.log("Sending data:", requestData);

    axios
      .post(`${apiUrl}/assessment/create`, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        handleClose();
        resetForm();
        setShowSuccessModal(true); // Show success modal
      })
      .catch((err) => {
        console.error(
          "Error occurred:",
          err.response ? err.response.data : err
        );
      });
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
    { field: "role", headerName: "Role", width: 100 },
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
          value={weights[params.row.p_id] || ""}
          onChange={(e) => handleWeightChange(params.row.p_id, e.target.value)}
        />
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken"); // ดึง token ก่อน
        if (!token) throw new Error("No auth token found");

        const response = await axios.get(
          `http://localhost:5001/section/professors/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = response.data;

        // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
        const formattedData = data.map((user, index) => ({
          p_id: user.professor_id,
          id: user.personal_num || index + 1,
          firstName: user.first_name || "N/A",
          lastName: user.last_name || "N/A",
          email: user.email || "N/A",
          role: user.role, // Add role field
        }));

        setRows(formattedData);
        console.log(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchRubrics = async () => {
      try {
        const token = localStorage.getItem("authToken"); // ดึง token อีกครั้ง
        if (!token) throw new Error("No auth token found");

        const response = await axios.get(
          `http://localhost:5001/rubric/section/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRubrics(response.data);
      } catch (error) {
        console.error("Error fetching rubrics:", error);
      }
    };

    fetchData();
    fetchRubrics();
  }, [id]); // เพิ่ม `id` เป็น dependency

  return (
    <>
      <Modal show={show} onHide={handleClose} className="custom-modal">
        <Modal.Header onClick={resetForm} closeButton>
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

              <Form.Group
                className="mb-4"
                controlId="formAssessmentDescription"
              >
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
            <>
              <Form.Group className="mt-2 mb-4" controlId="formRubric">
                <FormControl fullWidth className="mt-2 mb-4">
                  <InputLabel id="rubric-select-label">
                    Select Rubric
                  </InputLabel>
                  <Select
                    labelId="rubric-select-label"
                    id="rubric-select"
                    label="Select Rubric"
                    value={rubric}
                    onChange={(e) => setRubric(e.target.value)}
                  >
                    {rubrics.map((r) => (
                      <MenuItem key={r._id} value={r._id}>
                        {r.rubric_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Form.Group>

              {/* ดึง rubric ที่ถูกเลือก */}
              {rubric &&
                (() => {
                  const selectedRubric = rubrics.find((r) => r._id === rubric);
                  return selectedRubric ? (
                    <div className="rubric-container">
                      <table className="rubric-table mb-5">
                        <thead>
                          <tr>
                            <th className="rubric-table__header">Criteria</th>
                            {selectedRubric.criteria[0]?.levels.map(
                              (level, index) => (
                                <th
                                  key={index}
                                  className="rubric-table__header"
                                >
                                  Level {level.level}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRubric.criteria.map((criterion, index) => (
                            <tr key={index}>
                              <td className="rubric-table__cell">
                                {criterion.weight}{" "}
                                <span className="pts-label"> pts</span>
                                <br />
                                {criterion.name}
                              </td>
                              {criterion.levels.map((level, levelIndex) => (
                                <td
                                  key={levelIndex}
                                  className="rubric-table__cell"
                                >
                                  {level.score}{" "}
                                  <span className="pts-label"> pts</span>
                                  <br />
                                  {level.description}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null;
                })()}
            </>
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
              <Button className="custom-btn me-2" onClick={handleNextTab}>
                Next
              </Button>
            )}
            {activeTab === "createRubric" && (
              <Button className="custom-btn" onClick={handleSubmit}>
                Create Assessment
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <ModalComponent
        open={showSuccessModal}
        handleClose={() => setShowSuccessModal(false)}
        title="Create Assessment"
        description="The assessment has been successfully created."
      />
    </>
  );
}
