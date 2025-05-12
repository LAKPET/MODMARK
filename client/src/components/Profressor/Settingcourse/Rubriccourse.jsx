import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { TextField, IconButton } from "@mui/material";
import ListRubric from "./Listrubric";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import ModalComponent from "../../../controls/Modal";
import InputFileUpload from "../../../controls/InputFileUpload";
import "../../../assets/Styles/Settingcourse/Rubrictable.css";
import * as XLSX from "xlsx";
import { validateRubricForm } from "../../../utils/FormValidation";
import { createRubric } from "../../../services/rubricAPI";
const RubricMain = () => {
  const id = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(id);

  const [showListRubric, setShowListRubric] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleListRubric = () => {
    setShowListRubric(true);
  };

  const [rubric, setRubric] = useState({
    name: "",
    description: "",
    score: "",
  });

  const [columns, setColumns] = useState([{ score: "", level: 1 }]);
  const [rows, setRows] = useState([
    {
      score: "",
      criteria: "",
      criteria_weight: "",
      details: [{ description: "", score: "" }],
    },
  ]);

  const handleChange = (e) => {
    setRubric({ ...rubric, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const addColumn = () => {
    setColumns((prev) => {
      const newLevel = prev.length + 1;
      return [...prev, { score: "", level: newLevel }];
    });

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        details: [...row.details, { description: "", score: "" }],
      }))
    );
  };

  const removeColumn = (colIndex) => {
    setColumns((prev) => prev.filter((_, idx) => idx !== colIndex));

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        details: row.details.filter((_, idx) => idx !== colIndex),
      }))
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        criteria: "",
        criteria_weight: "",
        details: Array(columns.length).fill({ description: "", score: "" }),
      },
    ]);
  };

  const removeRow = (rowIndex) => {
    setRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  const updateColumnScore = (colIndex, value) => {
    setColumns((prev) =>
      prev.map((col, index) =>
        index === colIndex ? { ...col, score: value } : col
      )
    );
  };

  const updateRowScore = (rowIndex, value) => {
    setRows((prev) =>
      prev.map((row, index) =>
        index === rowIndex ? { ...row, score: value } : row
      )
    );
  };

  const updateCell = (rowIndex, colIndex, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex].details[colIndex] = {
        ...updated[rowIndex].details[colIndex],
        description: value,
      };
      return updated;
    });
    // Clear error when updating
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`detail_${rowIndex}_${colIndex}`];
      return newErrors;
    });
  };

  const updateCellScore = (rowIndex, colIndex, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex].details[colIndex] = {
        ...updated[rowIndex].details[colIndex],
        score: value,
      };
      return updated;
    });
    // Clear error when updating
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`score_${rowIndex}_${colIndex}`];
      delete newErrors[`score_order_${rowIndex}`];
      return newErrors;
    });
  };

  const updateCriteria = (rowIndex, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex].criteria = value;
      return updated;
    });
    // Clear error when updating
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`criteria_${rowIndex}`];
      return newErrors;
    });
  };

  const updateCriteriaWeight = (rowIndex, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex].criteria_weight = value;
      return updated;
    });
    // Clear error when updating
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`weight_${rowIndex}`];
      delete newErrors.total_weight;
      return newErrors;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });

      // Parse the worksheet data
      const [header, ...rowsData] = worksheet;
      const parsedColumns = [];
      const parsedRows = [];

      rowsData.forEach((row) => {
        const [
          rubricTitle,
          description,
          totalScore,
          criterionWeight,
          criterionName,
          ...levels
        ] = row;
        const details = [];
        for (let i = 0; i < levels.length; i += 2) {
          details.push({ description: levels[i + 1], score: levels[i] });
        }
        details.sort((a, b) => b.score - a.score); // Sort details by score in descending order
        parsedRows.push({
          criteria: criterionName,
          criteria_weight: criterionWeight,
          score: totalScore,
          details,
        });
      });

      for (let i = 0; i < parsedRows[0].details.length; i++) {
        parsedColumns.push({
          score: "",
          level: parsedRows[0].details.length - i,
        });
      }

      setRubric({
        name: rowsData[0][0],
        description: rowsData[0][1],
        score: rowsData[0][2],
      });
      setColumns(parsedColumns);
      setRows(parsedRows);
    };
    reader.readAsArrayBuffer(file);
  };

  // In Rubriccourse.jsx, update the handleSubmit function

  const handleSubmit = async () => {
    const formData = {
      name: rubric.name,
      description: rubric.description,
      score: rubric.score,
      rows: rows,
    };

    const { isValid, errors: validationErrors } = validateRubricForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    const formattedRubric = {
      title: rubric.name,
      description: rubric.description,
      score: Number(rubric.score),
      criteria: rows.map((row) => ({
        name: row.criteria,
        weight: Number(row.criteria_weight) || 0,
        levels: row.details
          .map((detail, index) => ({
            level: row.details.length - index,
            description: detail.description,
            score: Number(detail.score) || 0,
          }))
          .reverse(),
      })),
      section_id: id.id,
    };

    try {
      const response = await createRubric(formattedRubric);
      const data = await response.json();

      // Check if the response contains a success message or the rubric data
      if (
        (data.message && data.message.includes("successfully")) ||
        data.rubric
      ) {
        setShowSuccessModal(true);

        // Clear all fields
        setRubric({
          name: "",
          description: "",
          score: "",
        });
        setColumns([{ score: "", level: 1 }]);
        setRows([
          {
            score: "",
            criteria: "",
            criteria_weight: "",
            details: [{ description: "", score: "" }],
          },
        ]);
        setErrors({});

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        // If there's no success message or rubric data, show error
        throw new Error(
          data.message || "Failed to create rubric. Please try again."
        );
      }
    } catch (error) {
      setErrorModal({
        open: true,
        message: error.message || "Failed to create rubric. Please try again.",
      });
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: "" });
  };

  return showListRubric ? (
    <ListRubric />
  ) : (
    <Container fluid className="mt-1">
      <Row className="align-items-center">
        <Col>
          <h3>Rubric Details</h3>
        </Col>
        <Col className="d-flex justify-content-end gap-2">
          <Button className="custom-btn" onClick={handleListRubric}>
            List Rubric
          </Button>
          <Button className="custom-btn" onClick={handleSubmit}>
            + Add Rubric
          </Button>
        </Col>
      </Row>

      {/* 🟢 Rubric Name */}
      <Row className="mb-3 mt-4">
        <Col md={6}>
          <Form.Group controlId="rubricName">
            <Form.Label>Rubric Name :</Form.Label>
            <TextField
              variant="standard"
              name="name"
              value={rubric.name}
              onChange={handleChange}
              inputProps={{ style: { textAlign: "center" } }}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="at least 3 characters"
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
              variant="standard"
              name="description"
              value={rubric.description}
              onChange={handleChange}
              inputProps={{ style: { textAlign: "center" } }}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="at least 10 characters"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* 🟢 Score */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="rubricScore">
            <Form.Label>Score :</Form.Label>
            <TextField
              variant="standard"
              name="score"
              value={rubric.score}
              onChange={handleChange}
              inputProps={{ style: { textAlign: "center" } }}
              error={!!errors.score}
              helperText={errors.score}
              placeholder="Max score"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* 🟢 Rubric Table */}

      <div className="text-end">
        <InputFileUpload onChange={handleFileUpload} />
      </div>
      <div className="rubric-container">
        <table className="rubric-table">
          <thead>
            <tr>
              <th>
                {errors.total_weight && (
                  <div className="text-danger">{errors.total_weight}</div>
                )}
              </th>
              {columns.map((col, colIndex) => (
                <th key={colIndex} className="rubric-header">
                  {columns.length > 1 && (
                    <IconButton
                      onClick={() => removeColumn(colIndex)}
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                  <div className="level-label">Level {col.level}</div>
                </th>
              ))}
              <th>
                <button className="add-btn mt-2" onClick={addColumn}>
                  <AddIcon />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="criteria-cell">
                  <div className="score-container">
                    <TextField
                      variant="standard"
                      value={row.criteria_weight}
                      onChange={(e) =>
                        updateCriteriaWeight(rowIndex, e.target.value)
                      }
                      size="small"
                      inputProps={{ style: { textAlign: "center" } }}
                      error={!!errors[`weight_${rowIndex}`]}
                      helperText={errors[`weight_${rowIndex}`]}
                      placeholder="Weight"
                    />
                    <span className="pts-label"> pts</span>
                  </div>
                  <textarea
                    rows={3}
                    value={row.criteria}
                    placeholder="Criteria (min 3 chars)"
                    onChange={(e) => updateCriteria(rowIndex, e.target.value)}
                    className={`criteria-input ${errors[`criteria_${rowIndex}`] ? "error" : ""}`}
                  />
                  {errors[`criteria_${rowIndex}`] && (
                    <div
                      className="text-danger"
                      style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                    >
                      {errors[`criteria_${rowIndex}`]}
                    </div>
                  )}
                </td>
                {row.details.map((cell, colIndex) => (
                  <td key={colIndex} className="rubric-cell">
                    <div className="score-container">
                      <TextField
                        variant="standard"
                        value={cell.score}
                        onChange={(e) =>
                          updateCellScore(rowIndex, colIndex, e.target.value)
                        }
                        size="small"
                        inputProps={{ style: { textAlign: "center" } }}
                        error={!!errors[`score_${rowIndex}_${colIndex}`]}
                        helperText={errors[`score_${rowIndex}_${colIndex}`]}
                        placeholder="Score"
                      />
                      <span className="pts-label"> pts</span>
                    </div>
                    <textarea
                      rows={3}
                      value={cell.description}
                      placeholder="Description (min 3 chars)"
                      onChange={(e) =>
                        updateCell(rowIndex, colIndex, e.target.value)
                      }
                      className={`rubric-input ${errors[`detail_${rowIndex}_${colIndex}`] ? "error" : ""}`}
                    />
                    {errors[`detail_${rowIndex}_${colIndex}`] && (
                      <div
                        className="text-danger"
                        style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                      >
                        {errors[`detail_${rowIndex}_${colIndex}`]}
                      </div>
                    )}
                  </td>
                ))}
                <td>
                  <IconButton onClick={() => removeRow(rowIndex)} size="small">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={columns.length + 2} className="text-center">
                <button className="add-btn" onClick={addRow}>
                  <AddIcon />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-2">
          {rows
            .map((_, rowIndex) => errors[`score_order_${rowIndex}`])
            .filter(Boolean)
            .map((errorMessage, idx) => (
              <div
                key={`order_error_${idx}`}
                className="text-danger text-center"
                style={{
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem",
                }}
              >
                {errorMessage}
              </div>
            ))}
        </div>
      </div>

      <ModalComponent
        open={showSuccessModal}
        handleClose={handleSuccessModalClose}
        title="Add Rubric"
        description="The rubric has been successfully added."
        type="success"
      />

      <ModalComponent
        open={errorModal.open}
        handleClose={handleErrorModalClose}
        title="Add Rubric Error"
        description={errorModal.message}
        type="error"
      />
    </Container>
  );
};

export default RubricMain;
