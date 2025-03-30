import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import PDFReviewer from "./PDFReviewer";

export default function ViewAssessmentFile() {
  const { id, fileUrl } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${apiUrl}/submission/pdf/${fileUrl}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "arraybuffer",
          }
        );

        if (!response.data || response.data.byteLength === 0) {
          throw new Error("Empty PDF file received.");
        }

        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        setPdfUrl(URL.createObjectURL(pdfBlob));
      } catch (err) {
        console.error("Error fetching PDF:", err);
        setError("Error loading PDF.");
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
  }, [id, fileUrl, apiUrl]);

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

  if (!pdfUrl) {
    return <div className="text-center mt-5">Loading PDF...</div>;
  }

  return (
    <Container fluid className="mt-4">
      <PDFReviewer fileUrl={pdfUrl} submissionId={id} />
    </Container>
  );
}
