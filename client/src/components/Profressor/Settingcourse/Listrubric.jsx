import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Button } from "react-bootstrap";
import RubricMain from "./Rubriccourse";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import "../../../assets/Styles/Settingcourse/Listrubric.css";
import EditRubric from "./EditRubric"; // Import the EditRubric component
import DeleteRubric from "./Deleterubric"; // Import the DeleteRubric component

export default function Listrubric() {
  const { id } = useParams();
  const [rubrics, setRubrics] = useState([]);
  const [expandedRubrics, setExpandedRubrics] = useState([]);
  const [showRubricMain, setShowRubricMain] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRubricId, setSelectedRubricId] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchRubrics = async () => {
      try {
        const response = await axios.get(`${apiUrl}/rubric/section/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRubrics(response.data);
        console.log("rubric", response.data);
      } catch (err) {
        console.error("Error fetching rubrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRubrics();
  }, [id]);

  const handleEditClick = (rubricId) => {
    setSelectedRubricId(rubricId);
    setShowEditModal(true);
  };

  const handleDeleteClick = (rubricId) => {
    setSelectedRubricId(rubricId);
    setShowDeleteModal(true);
  };

  const handleUpdate = () => {
    const token = localStorage.getItem("authToken");

    const fetchRubrics = async () => {
      try {
        const response = await axios.get(`${apiUrl}/rubric/section/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRubrics(response.data);
      } catch (err) {
        console.error("Error fetching rubrics:", err);
      }
    };

    fetchRubrics();
  };

  const handleExpandClick = (rubricId) => {
    setExpandedRubrics((prevExpandedRubrics) =>
      prevExpandedRubrics.includes(rubricId)
        ? prevExpandedRubrics.filter((id) => id !== rubricId)
        : [...prevExpandedRubrics, rubricId]
    );
  };

  if (loading) {
    return (
      <Backdrop
        sx={(theme) => ({ color: "#8B5F34", zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (showRubricMain) {
    return <RubricMain />;
  }

  return (
    <Container>
      <Row className="align-items-center">
        <Col>
          <h3>Rubric List</h3>
        </Col>
        <Col className="d-flex justify-content-end gap-2">
          <Button
            className="custom-btn"
            onClick={() => setShowRubricMain(true)}
          >
            Create Rubric
          </Button>
        </Col>
      </Row>

      <Row className="mb-4 mt-4">
        <Col>
          {rubrics.length === 0 ? (
            <p className="text-muted">ยังไม่มี Rubric ในรายการ</p>
          ) : (
            <div>
              {rubrics.map((rubric) => (
                <div key={rubric._id} className="rubric-card">
                  <div className="rubric-content">
                    <div className="rubric-info">
                      <div className="rubric-row">
                        <div className="rubric-title">Name:</div>
                        <span className="rubric-value">
                          {rubric.rubric_name}
                        </span>
                        <span className="edit-delete-icon">
                          <EditIcon
                            onClick={() => handleEditClick(rubric._id)}
                          />
                          <DeleteIcon
                            onClick={() => handleDeleteClick(rubric._id)}
                          />
                        </span>
                      </div>
                      <div className="rubric-row">
                        <div className="rubric-title">Description:</div>
                        <span className="rubric-value">
                          {rubric.description}
                        </span>
                      </div>
                      <div className="rubric-row">
                        <div className="rubric-title">Score:</div>
                        <span className="rubric-value">{rubric.score}</span>
                      </div>
                    </div>
                    <div
                      className={`rubric-icon ${expandedRubrics.includes(rubric._id) ? "open" : ""}`}
                      onClick={() => handleExpandClick(rubric._id)}
                    >
                      <ArrowDropDownIcon />
                    </div>
                  </div>

                  {/* แสดง table เฉพาะ rubric ที่ถูกเลือก */}
                  {expandedRubrics.includes(rubric._id) && rubric.criteria && (
                    <div className="rubric-container">
                      <table className="rubric-table">
                        <thead>
                          <tr>
                            <th className="rubric-table__header">Criteria</th>
                            {rubric.criteria[0]?.levels
                              .slice()
                              .sort((a, b) => b.level - a.level)
                              .map((level, index) => (
                                <th
                                  key={index}
                                  className="rubric-table__header"
                                >
                                  Level {level.level}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rubric.criteria.map((criterion, index) => (
                            <tr key={index}>
                              <td className="rubric-table__cell">
                                {criterion.weight}{" "}
                                <span className="pts-label"> pts</span>
                                <br />
                                {criterion.name}
                              </td>
                              {criterion.levels
                                .slice()
                                .sort((a, b) => b.level - a.level)
                                .map((level, levelIndex) => (
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
                  )}
                </div>
              ))}
            </div>
          )}
        </Col>
      </Row>

      <EditRubric
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        rubricId={selectedRubricId}
        onUpdate={handleUpdate}
      />

      <DeleteRubric
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        rubricId={selectedRubricId}
        onDelete={handleUpdate}
      />
    </Container>
  );
}
