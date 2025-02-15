import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Button } from "react-bootstrap";
import RubricMain from "./Rubriccourse";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import "../../../assets/Styles/Settingcourse/Listrubric.css";

export default function Listrubric() {
  const { id } = useParams();
  const [rubrics, setRubrics] = useState([]);
  const [expandedRubric, setExpandedRubric] = useState(null);
  const [showRubricMain, setShowRubricMain] = useState(false);

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
      }
    };

    fetchRubrics();
  }, [id]);

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
                  <div
                    className="rubric-content"
                    onClick={() =>
                      setExpandedRubric(
                        expandedRubric === rubric._id ? null : rubric._id
                      )
                    }
                  >
                    <div className="rubric-info">
                      <div className="rubric-row">
                        <div className="rubric-title">Name:</div>
                        <span className="rubric-value">
                          {rubric.rubric_name}
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
                      className={`rubric-icon ${expandedRubric === rubric._id ? "open" : ""}`}
                    >
                      <ArrowDropDownIcon />
                    </div>
                  </div>

                  {/* แสดง table เฉพาะ rubric ที่ถูกเลือก */}
                  {expandedRubric === rubric._id && rubric.criteria && (
                    <div className="rubric-container">
                      <table className="rubric-table">
                        <thead>
                          <tr>
                            <th className="rubric-table__header">Criteria</th>
                            {rubric.criteria[0]?.levels.map((level, index) => (
                              <th key={index} className="rubric-table__header">
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
                  )}
                </div>
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
