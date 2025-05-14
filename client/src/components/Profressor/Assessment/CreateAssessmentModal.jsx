import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { MDBInput, MDBBtn } from "mdb-react-ui-kit";
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
import ModalComponent from "../../../controls/Modal";
import assessmentAPI from "../../../services/assessmentAPI";
import { fetchRubricBysectionId } from "../../../services/rubricAPI";
import courseAPI from "../../../services/courseAPI";

import { validateCreateAssessmentForm } from "../../../utils/FormValidation";

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
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

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
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      assessmentName,
      assessmentDescription,
      assessmentType,
      gradingType,
      publishDate,
      dueDate,
      rubric,
      weights,
    };

    const { isValid, errors: validationErrors } =
      validateCreateAssessmentForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

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

    assessmentAPI
      .createAssessment(requestData)
      .then((response) => {
        handleClose();
        resetForm();
        setShowSuccessModal(true); // แก้ไขตรงนี้ให้เป็น true
        if (refreshAssessments) {
          refreshAssessments();
        }
      })
      .catch((err) => {
        setErrorModal({
          open: true,
          message:
            err.response?.data?.message ||
            "Failed to create assessment. Please try again.",
        });
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

  const handlePaginationModelChange = (newModel) => {
    setPaginationModel(newModel);
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

        const response = await courseAPI.getSectionProfessors(id);
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

        const response = await fetchRubricBysectionId(id);
        setRubrics(response.data);
      } catch (error) {
        console.error("Error fetching rubrics:", error);
      }
    };

    fetchData();
    fetchRubrics();
  }, [id]); // เพิ่ม `id` เป็น dependency

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: "" });
  };

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
              Select Rubric
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
                  invalid={!!errors.assessmentName}
                  className={errors.assessmentName ? "border-danger" : ""}
                  placeholder="Assessment name must be at least 3 characters"
                />
                {errors.assessmentName && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.assessmentName}
                  </div>
                )}
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
                  invalid={!!errors.assessmentDescription}
                  className={
                    errors.assessmentDescription ? "border-danger" : ""
                  }
                  placeholder="Description must be at least 10 characters"
                />
                {errors.assessmentDescription && (
                  <div
                    className="text-danger"
                    style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                  >
                    {errors.assessmentDescription}
                  </div>
                )}
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
                    error={!!errors.assessmentType}
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="group">Group</MenuItem>
                  </Select>
                  {errors.assessmentType && (
                    <div
                      className="text-danger"
                      style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                    >
                      {errors.assessmentType}
                    </div>
                  )}
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
                    error={!!errors.gradingType}
                  >
                    <MenuItem value={false}>Individual</MenuItem>
                    <MenuItem value={true}>Team</MenuItem>
                  </Select>
                  {errors.gradingType && (
                    <div
                      className="text-danger"
                      style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                    >
                      {errors.gradingType}
                    </div>
                  )}
                </FormControl>
              </Form.Group>

              {gradingType && (
                <div className="mb-4">
                  <Paper sx={{ height: 350, width: "100%" }}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      paginationModel={paginationModel}
                      onPaginationModelChange={handlePaginationModelChange}
                      pageSizeOptions={[5, 10, { value: -1, label: "All" }]}
                      sx={{
                        border: 0,
                        "& .MuiTablePagination-root": {
                          marginTop: "auto",
                          marginBottom: "auto",
                        },
                        "& .MuiTablePagination-selectLabel": {
                          marginTop: "auto",
                          marginBottom: "auto",
                        },
                        "& .MuiTablePagination-displayedRows": {
                          marginTop: "auto",
                          marginBottom: "auto",
                        },
                        "& .MuiTablePagination-select": {
                          marginTop: "auto",
                          marginBottom: "auto",
                        },
                      }}
                    />
                  </Paper>
                  {errors.weights && (
                    <div
                      className="text-danger"
                      style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                    >
                      {errors.weights}
                    </div>
                  )}
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
                      invalid={!!errors.publishDate}
                      className={errors.publishDate ? "border-danger" : ""}
                    />
                    {errors.publishDate && (
                      <div
                        className="text-danger"
                        style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                      >
                        {errors.publishDate}
                      </div>
                    )}
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
                      invalid={!!errors.dueDate}
                      className={errors.dueDate ? "border-danger" : ""}
                    />
                    {errors.dueDate && (
                      <div
                        className="text-danger"
                        style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                      >
                        {errors.dueDate}
                      </div>
                    )}
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
                    error={!!errors.rubric}
                  >
                    {rubrics.map((r) => (
                      <MenuItem key={r._id} value={r._id}>
                        {r.rubric_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.rubric && (
                    <div
                      className="text-danger"
                      style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                    >
                      {errors.rubric}
                    </div>
                  )}
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
              <MDBBtn
                outline
                className="me-2"
                onClick={handlePreviousTab}
                style={{
                  color: "#CDC9C9",
                  borderColor: "#CDC9C9",
                }}
              >
                Back
              </MDBBtn>
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

      {/* แก้ไข ModalComponent ให้ถูกต้อง */}
      <ModalComponent
        open={showSuccessModal}
        handleClose={handleSuccessModalClose}
        title="Create Assessment"
        description="The assessment has been successfully created."
        type="success"
      />

      <ModalComponent
        open={errorModal.open}
        handleClose={handleErrorModalClose}
        title="Create Assessment Error"
        description={errorModal.message}
        type="error"
      />
    </>
  );
}
