import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";

export default function EditRubric({ show, handleClose, rubricId, onUpdate }) {
  const [rubric, setRubric] = useState({
    rubric_name: "",
    description: "",
    score: 0,
  });
  const [columns, setColumns] = useState([{ score: "", level: 1 }]);
  const [rows, setRows] = useState([
    { score: "", criteria: "", details: [""] },
  ]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (rubricId) {
      const fetchRubric = async () => {
        const token = localStorage.getItem("authToken");
        try {
          const response = await axios.get(`${apiUrl}/rubric/${rubricId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = response.data;
          console.log("Rubric data:", data);
          setRubric({
            rubric_name: data.rubric_name,
            description: data.description,
            score: data.score,
          });
          setColumns(
            data.criteria[0]?.levels.map((level, index) => ({
              score: level.score,
              level: index + 1,
            })) || [{ score: "", level: 1 }]
          );
          setRows(
            data.criteria.map((criterion) => ({
              score: criterion.weight,
              criteria: criterion.name,
              details: criterion.levels.map((level) => level.description),
            }))
          );
        } catch (err) {
          console.error("Error fetching rubric:", err);
        }
      };

      fetchRubric();
    }
  }, [rubricId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRubric((prev) => ({ ...prev, [name]: value }));
  };

  const addColumn = () => {
    setColumns((prev) => {
      const newLevel = prev.length + 1;
      return [...prev, { score: "", level: newLevel }];
    });

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        details: [...row.details, ""],
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
      { criteria: "", details: Array(columns.length).fill("") },
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
      updated[rowIndex].details[colIndex] = value;
      return updated;
    });
  };

  const updateCriteria = (rowIndex, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex].criteria = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedRubric = {
      title: rubric.rubric_name,
      description: rubric.description,
      score: Number(rubric.score),
      criteria: rows.map((row) => ({
        name: row.criteria,
        weight: Number(row.score) || 0,
        levels: columns.map((col, colIndex) => ({
          level: col.level,
          description: row.details?.[colIndex] || "",
          score: Number(col.score) || 0,
        })),
      })),
    };

    const token = localStorage.getItem("authToken");
    try {
      await axios.put(`${apiUrl}/rubric/update/${rubricId}`, formattedRubric, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
      handleClose();
    } catch (err) {
      console.error("Error updating rubric:", err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
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
              required
            />
          </Form.Group>
          <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={rubric.description}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formScore">
            <Form.Label>Score</Form.Label>
            <Form.Control
              type="number"
              name="score"
              value={rubric.score}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="rubric-container">
            <table className="rubric-table">
              <thead>
                <tr>
                  <th></th>
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
                      {/* <TextField
                        variant="standard"
                        value={col.score}
                        onChange={(e) =>
                          updateColumnScore(colIndex, e.target.value)
                        }
                        size="small"
                        inputProps={{ style: { textAlign: "center" } }}
                      /> */}
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
                          value={row.score}
                          onChange={(e) =>
                            updateRowScore(rowIndex, e.target.value)
                          }
                          size="small"
                          inputProps={{ style: { textAlign: "center" } }}
                        />
                        <span className="pts-label"> pts</span>
                      </div>
                      <textarea
                        rows={3}
                        value={row.criteria}
                        placeholder="Criteria"
                        onChange={(e) =>
                          updateCriteria(rowIndex, e.target.value)
                        }
                        className="criteria-input"
                      />
                    </td>
                    {row.details.map((cell, colIndex) => (
                      <td key={colIndex} className="rubric-cell">
                        <TextField
                          variant="standard"
                          onChange={(e) =>
                            updateRowScore(colIndex, e.target.value)
                          }
                          size="small"
                          inputProps={{ style: { textAlign: "center" } }}
                        />
                        <span className="pts-label"> pts</span>
                        <textarea
                          rows={3}
                          value={cell}
                          placeholder="Description"
                          onChange={(e) =>
                            updateCell(rowIndex, colIndex, e.target.value)
                          }
                          className="rubric-input"
                        />
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
          </div>

          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
