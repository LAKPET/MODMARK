import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import SwapVertIcon from "@mui/icons-material/SwapVert";

export default function Getoverviewscore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [statisticsData, setStatisticsData] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        // Fetch course details
        const courseResponse = await axios.get(
          `${apiUrl}/course/details/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourseDetails(courseResponse.data);

        // Fetch statistics data
        const statisticsResponse = await axios.get(
          `${apiUrl}/assessment/statistics/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStatisticsData(statisticsResponse.data.assessments_statistics);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, apiUrl]);

  const handleSort = (column) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);

    const sortedData = [...statisticsData].sort((a, b) => {
      if (newOrder === "asc") {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });

    setStatisticsData(sortedData);
  };

  const handleRowClick = (assessmentId) => {
    navigate(`/score/${id}/student-scores/${assessmentId}`);
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

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <Container className="mt-4">
      <Row className="pb-3 mb-4">
        <Col md={8}>
          <h2 className="mb-0 fw-semibold d-flex align-items-center">
            {courseDetails?.course_number}
            <span className="vertical-line bg-dark mx-3"></span>
            <span className="fw-normal fs-5">
              {courseDetails?.semester_term} / {courseDetails?.semester_year}
            </span>
          </h2>
          <div className="d-flex align-items-center">
            <p className="text-muted p-1 mb-0">{courseDetails?.course_name}</p>
            <span className="text-muted p-1">{`Section ${courseDetails?.section_number}`}</span>
          </div>
        </Col>
      </Row>
      <MDBTable className="table-hover">
        <MDBTableHead>
          <tr className="fw-bold">
            <th
              onClick={() => handleSort("assessment_name")}
              className="sortable"
            >
              Assessment Name <SwapVertIcon />
            </th>
            <th onClick={() => handleSort("max_score")} className="sortable">
              Max Score <SwapVertIcon />
            </th>
            <th onClick={() => handleSort("min_score")} className="sortable">
              Min Score <SwapVertIcon />
            </th>
            <th onClick={() => handleSort("mean_score")} className="sortable">
              Mean Score <SwapVertIcon />
            </th>
            <th
              onClick={() => handleSort("grading_complete")}
              className="sortable"
            >
              Grading Complete <SwapVertIcon />
            </th>
            <th
              onClick={() => handleSort("submissions_complete")}
              className="sortable"
            >
              Submissions Complete <SwapVertIcon />
            </th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {statisticsData.length > 0 ? (
            statisticsData.map((stat) => (
              <tr
                key={stat.assessment_id}
                onClick={() => handleRowClick(stat.assessment_id)}
                style={{ cursor: "pointer" }}
                className="hover-row"
              >
                <td>{stat.assessment_name}</td>
                <td>{stat.max_score}</td>
                <td>{stat.min_score}</td>
                <td>{stat.mean_score}</td>
                <td>{stat.graded_by_professor}</td>
                <td>{stat.submission_count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No data available
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>
    </Container>
  );
}
