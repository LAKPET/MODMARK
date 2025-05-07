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
import ModalComponent from "../../../controls/Modal"; // Import ModalComponent
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { validateCreateAssessmentForm } from "../../../utils/FormValidation";

export default function EditAssessmentModal({
  show,
  handleClose,
  refreshAssessments,
  courseDetails,
  assessmentId,
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
  const [loading, setLoading] = useState(true); // State for loading
  const [errors, setErrors] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  const formatDateTimeLocal = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (assessmentId && show) {
      const fetchAssessmentDetails = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.get(
            `${apiUrl}/assessment/${assessmentId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = response.data;
          console.log("Assessment details:", data);
          setAssessmentName(data.assessment_name);
          setAssessmentDescription(data.assessment_description);
          setAssessmentType(data.assignment_type);
          setGradingType(data.teamgrading_type);
          setPublishDate(formatDateTimeLocal(data.publish_date));
          setDueDate(formatDateTimeLocal(data.due_date));
          setWeights(
            data.graders.reduce((acc, grader) => {
              acc[grader.user_id._id] = grader.weight * 100;
              return acc;
            }, {})
          );
          console.log("Graders:", data.graders);
          setRubric(data.rubric_id._id);
        } catch (error) {
          console.error("Error fetching assessment details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAssessmentDetails();
    }
  }, [assessmentId, show, apiUrl]);

  const handleWeightChange = (id, value) => {
    setWeights((prev) => ({ ...prev, [id]: parseFloat(value) || 0 }));
    // Clear weight error when updating
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.weights;
      return newErrors;
    });
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
      rubric_id: rubric,
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

    axios
      .put(`${apiUrl}/assessment/update/${assessmentId}`, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        handleClose();
        resetForm();
        refreshAssessments();
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
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        if (!id) {
          console.warn("Section ID is missing");
          return;
        }

        console.log("Fetching professors for section:", id);

        const response = await axios.get(`${apiUrl}/section/professors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;

        const formattedData = data.map((user, index) => ({
          p_id: user.professor_id,
          id: user.personal_num || index + 1,
          firstName: user.first_name || "N/A",
          lastName: user.last_name || "N/A",
          role: user.role || "N/A",
          email: user.email || "N/A",
        }));

        console.log("Professors Data:", formattedData);
        setRows(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchRubrics = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const response = await axios.get(`${apiUrl}/rubric/section/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRubrics(response.data);
      } catch (error) {
        console.error("Error fetching rubrics:", error);
      }
    };

    if (id && apiUrl) {
      fetchData();
      fetchRubrics();
    }
  }, [id, apiUrl, courseDetails?.section_id]);

  // if (loading) {
  //   return (
  //     <Backdrop
  //       sx={(theme) => ({ color: "#8B5F34", zIndex: theme.zIndex.drawer + 1 })}
  //       open={loading}
  //     >
  //       <CircularProgress color="inherit" />
  //     </Backdrop>
  //   );
  // }

  return (
    <>
      <Modal show={show} onHide={handleClose} className="custom-modal">
        <Modal.Header onClick={resetForm} closeButton>
          <Modal.Title>Edit Assessment</Modal.Title>
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
                  invalid={!!errors.assessmentName}
                  placeholder="at least 3 characters"
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
                  placeholder="at least 10 characters"
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
                  <Paper sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      pageSize={5}
                      // checkboxSelection
                      sx={{ border: 0 }}
                    />
                  </Paper>
                  {errors.weights && (
                    <div
                      className="text-danger text-center mt-2"
                      style={{ fontSize: "0.875rem" }}
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
                Save
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <ModalComponent
        open={showSuccessModal}
        handleClose={() => setShowSuccessModal(false)}
        title="Edit Assessment"
        description="The assessment has been successfully edited."
      />
    </>
  );
}
