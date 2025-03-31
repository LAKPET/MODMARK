import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Button } from "react-bootstrap";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { formatDateTime } from "../../../utils/FormatDateTime";
import { getStatusColor } from "../../../utils/StatusColor";
export default function Getassessmentuser() {
  const { id, assessmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${apiUrl}/submission/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSubmissions(response.data);
      } catch (err) {
        setError("Error loading submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assessmentId]);

  const handleViewPdf = (fileUrl) => {
    navigate(`/professor/viewassessment/${id}/${fileUrl}/${assessmentId}`);
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
          <h3 className="mb-0 fw-semibold d-flex align-items-center">
            Assessment Submissions
          </h3>
        </Col>
      </Row>
      <MDBTable className="table-hover">
        <MDBTableHead>
          <tr className="fw-bold">
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
            <th>Submission Date</th>
            <th>Grading Status</th>
            <th></th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <tr key={submission._id}>
                <td>{submission.student_id._id}</td>
                <td>{submission.student_id.first_name}</td>
                <td>{submission.student_id.last_name}</td>
                <td>{submission.student_id.email}</td>
                <td>{formatDateTime(submission.submitted_at)}</td>
                <td
                  style={{ color: getStatusColor(submission.grading_status) }}
                >
                  {submission.grading_status}
                </td>
                <td>
                  <Button
                    onClick={() => handleViewPdf(submission.file_url)}
                    className="custom-btn"
                  >
                    View PDF
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No submissions found
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>
    </Container>
  );
}
