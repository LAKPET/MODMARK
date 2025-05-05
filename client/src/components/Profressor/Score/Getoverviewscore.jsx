import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams } from "react-router-dom";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import SwapVertIcon from "@mui/icons-material/SwapVert";

export default function Getoverviewscore() {
  const { id } = useParams(); // Get the section ID from the route
  const [statisticsData, setStatisticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken"); // Get the token from localStorage
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await axios.get(
          `${apiUrl}/assessment/statistics/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request headers
            },
          }
        );

        setStatisticsData(response.data.assessments_statistics);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
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
      <h2 className="mb-4">Overview of Scores</h2>
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
            <th onClick={() => handleSort("count")} className="sortable">
              Grading Complete <SwapVertIcon />
            </th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {statisticsData.length > 0 ? (
            statisticsData.map((stat) => (
              <tr key={stat.assessment_id}>
                <td>{stat.assessment_name}</td>
                <td>{stat.max_score}</td>
                <td>{stat.min_score}</td>
                <td>{stat.mean_score}</td>
                <td>{stat.count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No data available
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>
    </Container>
  );
}
