import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import { TextField, IconButton } from "@mui/material";

import "../../../assets/Styles/Settingcourse/Rubrictable.css";

const DynamicRubricTable = () => {
  const [columns, setColumns] = useState([{ score: "" }]);
  const [rows, setRows] = useState([{ criteria: "", details: [""] }]);

  const addColumn = () => {
    setColumns((prev) => [...prev, { score: "" }]);
    setRows((prev) =>
      prev.map((row) => ({ ...row, details: [...row.details, ""] }))
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { criteria: "", details: Array(columns.length).fill("") },
    ]);
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

  const removeRow = (rowIndex) => {
    setRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  const updateScore = (colIndex, value) => {
    setColumns((prev) => {
      const updated = [...prev];
      updated[colIndex].score = value;
      return updated;
    });
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

  return (
    <div className="rubric-container">
      <table className="rubric-table">
        <thead>
          <tr>
            <th></th>
            {columns.map((col, colIndex) => (
              <th key={colIndex} className="rubric-header">
                {columns.length > 1 && (
                  <IconButton
                    className="remove-btn d-flex align-items-center justify-content-center ms-auto"
                    onClick={() => removeColumn(colIndex)}
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                <div className="score-container">
                  <span>
                    <TextField
                      variant="standard"
                      value={col.score}
                      onChange={(e) => updateScore(colIndex, e.target.value)}
                      className="score-input"
                      size="small"
                      inputProps={{ style: { textAlign: "center" } }}
                    />
                  </span>
                  <span className="pts-label"> pts</span>
                </div>
              </th>
            ))}
            <button className="add-btn mt-2 " onClick={addColumn}>
              <AddIcon />
            </button>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="criteria-cell">
                <span>
                  <TextField
                    variant="standard"
                    onChange={(e) => updateScore(colIndex, e.target.value)}
                    className="score-input"
                    size="small"
                    inputProps={{ style: { textAlign: "center" } }}
                  />
                </span>
                <span className="pts-label"> pts</span>
                <textarea
                  placeholder="Placeholder"
                  rows={3}
                  value={row.criteria}
                  onChange={(e) => updateCriteria(rowIndex, e.target.value)}
                  className="criteria-input"
                />
              </td>
              {row.details.map((cell, colIndex) => (
                <td key={colIndex} className="rubric-cell">
                  <textarea
                    placeholder="Placeholder"
                    rows={3}
                    value={cell}
                    onChange={(e) =>
                      updateCell(rowIndex, colIndex, e.target.value)
                    }
                    className="rubric-input"
                  />
                </td>
              ))}
              <td>
                {rows.length > 1 && (
                  <IconButton
                    className="remove-btn"
                    onClick={() => removeRow(rowIndex)}
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td className="add-row-cell">
              <button className="add-btn" onClick={addRow}>
                <AddIcon />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DynamicRubricTable;
