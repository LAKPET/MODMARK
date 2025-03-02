import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { TextField, IconButton } from "@mui/material";
import ListRubric from "./Listrubric";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import ModalComponent from "../../../controls/modal"; // Import ModalComponent
import "../../../assets/Styles/Settingcourse/Rubrictable.css";

const RubricMain = () => {
  const id = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(id);

  const [showListRubric, setShowListRubric] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal

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
    { score: "", criteria: "", details: [""] },
  ]);

  const handleChange = (e) => {
    setRubric({ ...rubric, [e.target.name]: e.target.value });
  };

  const addColumn = () => {
    setColumns((prev) => {
      const newLevel = prev.length + 1;
      return [{ score: "", level: newLevel }, ...prev]; // เพิ่มที่ index 0
    });

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        details: ["", ...row.details], // เพิ่มค่าที่ตำแหน่งแรกของ array
      }))
    );
  };

  const removeColumn = (colIndex) => {
    setColumns((prev) =>
      prev
        .filter((_, idx) => idx !== colIndex)
        .map((col, index) => ({
          ...col,
          level: prev.length - index - 1, // อัปเดต level ใหม่
        }))
    );

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

  const handleSubmit = async () => {
    const formattedRubric = {
      title: rubric.name,
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
      section_id: id.id,
    };

    console.log(
      "Formatted Rubric Data:",
      JSON.stringify(formattedRubric, null, 2)
    );
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${apiUrl}/rubric/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedRubric),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Success:", data);
      setShowSuccessModal(true); // Show success modal
    } catch (error) {
      console.error("Error:", error);
    }
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
            />
          </Form.Group>
        </Col>
      </Row>

      {/* 🟢 Rubric Table */}
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
                      onChange={(e) => updateRowScore(rowIndex, e.target.value)}
                      size="small"
                      inputProps={{ style: { textAlign: "center" } }}
                    />
                    <span className="pts-label"> pts</span>
                  </div>
                  <textarea
                    rows={3}
                    value={row.criteria}
                    placeholder="Criteria"
                    onChange={(e) => updateCriteria(rowIndex, e.target.value)}
                    className="criteria-input"
                  />
                </td>
                {row.details.map((cell, colIndex) => (
                  <td key={colIndex} className="rubric-cell">
                    <div className="score-container">
                      <TextField
                        variant="standard"
                        onChange={(e) =>
                          updateColumnScore(colIndex, e.target.value)
                        }
                        size="small"
                        inputProps={{ style: { textAlign: "center" } }}
                      />
                      <span className="pts-label"> pts</span>
                    </div>
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
      </div>

      <ModalComponent
        open={showSuccessModal}
        handleClose={() => setShowSuccessModal(false)}
        title="Add Rubric"
        description="The rubric has been successfully added."
      />
    </Container>
  );
};

export default RubricMain;
