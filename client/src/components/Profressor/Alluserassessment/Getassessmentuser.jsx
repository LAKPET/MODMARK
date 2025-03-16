import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Modal } from "react-bootstrap";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";

export default function Getassessmentuser() {
  const { id, assessmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

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
    setPdfUrl(`${apiUrl}/submission/pdf/${fileUrl.replace("/uploads/", "")}`);
    setShowModal(true);
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
            <th>Username</th>
            <th>Submission Date</th>
            <th>File</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <tr key={submission._id}>
                <td>{submission.user_id}</td>
                <td>{submission.username}</td>
                <td>{new Date(submission.submission_date).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => handleViewPdf(submission.file_url)}
                    className="btn btn-link"
                  >
                    View PDF
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No submissions found
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>View PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfUrl && (
            <Worker
              workerUrl={`https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js`}
            >
              <Viewer fileUrl={pdfUrl} />
            </Worker>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
