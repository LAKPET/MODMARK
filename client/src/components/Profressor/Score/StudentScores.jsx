import React, { useState, useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useParams } from "react-router-dom";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import * as XLSX from "xlsx";

export default function StudentScores() {
  const { id, assessmentId } = useParams();
  const [studentScores, setStudentScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudentScores = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await axios.get(
          `${apiUrl}/assessment/student_score/${id}/${assessmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStudentScores(response.data);
      } catch (err) {
        console.error("Error fetching student scores:", err);
        setError("Failed to load student scores.");
      } finally {
        setLoading(false);
      }
    };

    if (id && assessmentId) {
      fetchStudentScores();
    }
  }, [id, assessmentId, apiUrl]);

  const handleSort = (column) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);

    const sortedData = [...studentScores].sort((a, b) => {
      let valueA, valueB;

      switch (column) {
        case "personal_num":
          valueA = a.student_id.personal_num;
          valueB = b.student_id.personal_num;
          break;
        case "first_name":
          valueA = a.student_id.first_name;
          valueB = b.student_id.first_name;
          break;
        case "last_name":
          valueA = a.student_id.last_name;
          valueB = b.student_id.last_name;
          break;
        case "email":
          valueA = a.student_id.email;
          valueB = b.student_id.email;
          break;
        case "score":
          valueA = a.score;
          valueB = b.score;
          break;
        default:
          valueA = a[column];
          valueB = b[column];
      }

      if (newOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setStudentScores(sortedData);
  };

  const handleExportToExcel = () => {
    // Get assessment name from the first student score entry
    const assessmentName =
      studentScores[0]?.assessment_id?.assessment_name || "assessment";

    // Prepare data for Excel
    const excelData = studentScores.map((student) => ({
      "Student ID": student.student_id.personal_num,
      "First Name": student.student_id.first_name,
      "Last Name": student.student_id.last_name,
      Email: student.student_id.email,
      Score: student.score,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Scores");

    // Generate Excel file with assessment name
    const fileName = `${assessmentName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_scores.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Scores</h2>
        <Button
          className="custom-btn"
          onClick={handleExportToExcel}
          disabled={studentScores.length === 0}
        >
          <FileDownloadIcon />
          Export to Excel
        </Button>
      </div>
      <MDBTable className="table-hover">
        <MDBTableHead>
          <tr className="fw-bold">
            <th onClick={() => handleSort("personal_num")} className="sortable">
              Student ID <SwapVertIcon />
            </th>
            <th onClick={() => handleSort("first_name")} className="sortable">
              First Name <SwapVertIcon />
            </th>
            <th onClick={() => handleSort("last_name")} className="sortable">
              Last Name <SwapVertIcon />
            </th>
            <th onClick={() => handleSort("email")} className="sortable">
              Email <SwapVertIcon />
            </th>
            <th onClick={() => handleSort("score")} className="sortable">
              Score <SwapVertIcon />
            </th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {studentScores.length > 0 ? (
            studentScores.map((student) => (
              <tr key={student._id}>
                <td>{student.student_id.personal_num}</td>
                <td>{student.student_id.first_name}</td>
                <td>{student.student_id.last_name}</td>
                <td>{student.student_id.email}</td>
                <td>{student.score}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No scores available
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>
    </Container>
  );
}
