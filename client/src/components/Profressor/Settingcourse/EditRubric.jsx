import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import { fetchRubricById, updateRubric } from "../../../services/rubricAPI"; // Update path as needed
import { validateRubricForm } from "../../../utils/FormValidation";
import ModalComponent from "../../../controls/Modal"; // Import the ModalComponent

export default function EditRubric({ show, handleClose, rubricId, onUpdate }) {
  const [rubric, setRubric] = useState({
    rubric_name: "",
    description: "",
    score: 0,
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
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  useEffect(() => {
    if (rubricId && show) {
      const fetchRubricData = async () => {
        try {
          const data = await fetchRubricById(rubricId);
          console.log("Rubric data:", data);
          setRubric({
            rubric_name: data.rubric_name,
            description: data.description,
            score: data.score,
          });
          setColumns(
            data.criteria[0]?.levels
              .slice()
              .sort((a, b) => b.level - a.level)
              .map((level) => ({
                score: level.score,
                level: level.level,
              })) || [{ score: "", level: 1 }]
          );
          setRows(
            data.criteria.map((criterion) => ({
              score: criterion.weight,
              criteria: criterion.name,
              criteria_weight: criterion.weight,
              details: criterion.levels
                .slice()
                .sort((a, b) => b.level - a.level)
                .map((level) => ({
                  description: level.description,
                  score: level.score,
                })),
            }))
          );
        } catch (err) {
          console.error("Error fetching rubric:", err);
          setErrorModal({
            open: true,
            message: "Failed to fetch rubric data. Please try again.",
          });
        }
      };

      fetchRubricData();
    }
  }, [rubricId, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRubric((prev) => ({ ...prev, [name]: value }));
  };

  const addColumn = () => {
    setColumns((prev) => {
      const newLevel = prev.length + 1;
      return [{ score: "", level: newLevel }, ...prev];
    });

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        details: [{ description: "", score: "" }, ...row.details],
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

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onUpdate();
    handleClose();
  };

  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: rubric.rubric_name,
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
      title: rubric.rubric_name,
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
    };

    try {
      await updateRubric(rubricId, formattedRubric);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error updating rubric:", err);
      setErrorModal({
        open: true,
        message: "Failed to update rubric. Please try again.",
      });
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Edit Rubric</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formRubricName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="rubric_name"
                value={rubric.rubric_name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                placeholder="at least 3 characters"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={rubric.description}
                onChange={handleChange}
                isInvalid={!!errors.description}
                placeholder="at least 10 characters"
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formScore">
              <Form.Label>Score</Form.Label>
              <Form.Control
                type="number"
                name="score"
                value={rubric.score}
                onChange={handleChange}
                isInvalid={!!errors.score}
                placeholder="Max score"
              />
              <Form.Control.Feedback type="invalid">
                {errors.score}
              </Form.Control.Feedback>
            </Form.Group>

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
                          onChange={(e) =>
                            updateCriteria(rowIndex, e.target.value)
                          }
                          className={`criteria-input ${errors[`criteria_${rowIndex}`] ? "error" : ""}`}
                        />
                        {errors[`criteria_${rowIndex}`] && (
                          <div
                            className="text-danger"
                            style={{
                              fontSize: "0.875rem",
                              marginTop: "0.25rem",
                            }}
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
                                updateCellScore(
                                  rowIndex,
                                  colIndex,
                                  e.target.value
                                )
                              }
                              size="small"
                              inputProps={{ style: { textAlign: "center" } }}
                              error={!!errors[`score_${rowIndex}_${colIndex}`]}
                              helperText={
                                errors[`score_${rowIndex}_${colIndex}`]
                              }
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
                              style={{
                                fontSize: "0.875rem",
                                marginTop: "0.25rem",
                              }}
                            >
                              {errors[`detail_${rowIndex}_${colIndex}`]}
                            </div>
                          )}
                        </td>
                      ))}
                      <td>
                        <IconButton
                          onClick={() => removeRow(rowIndex)}
                          size="small"
                        >
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
              {rows.map(
                (row, rowIndex) =>
                  errors[`score_order_${rowIndex}`] && (
                    <div
                      key={`order_${rowIndex}`}
                      className="text-danger text-center mt-2"
                      style={{ fontSize: "0.875rem" }}
                    >
                      {errors[`score_order_${rowIndex}`]}
                    </div>
                  )
              )}
            </div>

            <div className="d-flex justify-content-end">
              <Button className="custom-btn" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Success Modal */}
      <ModalComponent
        open={showSuccessModal}
        handleClose={handleSuccessModalClose}
        title="Edit Rubric"
        description="The rubric has been successfully updated."
        type="success"
      />

      {/* Error Modal */}
      <ModalComponent
        open={errorModal.open}
        handleClose={handleErrorModalClose}
        title="Edit Rubric Error"
        description={errorModal.message}
        type="error"
      />
    </>
  );
}
