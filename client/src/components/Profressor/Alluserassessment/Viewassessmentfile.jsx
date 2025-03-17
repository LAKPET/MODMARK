import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, ListGroup } from "react-bootstrap";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import axios from "axios";
import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
  Tip,
} from "react-pdf-highlighter";
import "../../../assets/Styles/Viewassessment/Viewassessment.css";

export default function ViewAssessmentFile() {
  const { id, fileUrl } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [commentText, setCommentText] = useState("");

  const thumbnailsPluginInstance = thumbnailPlugin();
  const { Thumbnails } = thumbnailsPluginInstance;

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${apiUrl}/submission/pdf/${fileUrl}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          }
        );
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        setPdfUrl(URL.createObjectURL(pdfBlob));
      } catch (err) {
        setError("Error loading PDF.");
      }
    };
    fetchPdf();
  }, [id, fileUrl, apiUrl]);

  const addHighlight = (position, content, comment) => {
    if (!comment.trim()) return;
    setHighlights([...highlights, { position, content, comment }]);
  };

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <Container fluid className="mt-4 text-start">
      {pdfUrl ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
          <div className="container-flex">
            <div className="thumbnails-container">
              <Thumbnails />
            </div>
            <div className="pdf-viewer-container">
              <PdfLoader url={pdfUrl}>
                {(pdfDocument) => (
                  <PdfHighlighter
                    pdfDocument={pdfDocument}
                    enableAreaSelection={() => true}
                    onSelectionFinished={(position, content, hideTip) => (
                      <Tip>
                        <input
                          type="text"
                          placeholder="เพิ่มความคิดเห็น..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            addHighlight(position, content, commentText);
                            setCommentText("");
                            hideTip();
                          }}
                        >
                          บันทึก
                        </button>
                      </Tip>
                    )}
                    highlightTransform={(highlight, index, setTip, hideTip) => (
                      <Popup
                        popupContent={<div>{highlight.comment}</div>}
                        onMouseOver={(popupContent) => setTip(popupContent)}
                        onMouseOut={hideTip}
                      >
                        <Highlight
                          key={index}
                          position={highlight.position}
                          comment={highlight.comment}
                        />
                      </Popup>
                    )}
                    highlights={highlights}
                  />
                )}
              </PdfLoader>
              <Viewer fileUrl={pdfUrl} plugins={[thumbnailsPluginInstance]} />
            </div>
            <div className="comments-section">
              <h5>Review & Comments</h5>
              <ListGroup className="mt-3">
                {highlights.map((highlight, index) => (
                  <ListGroup.Item key={index}>
                    <strong>"{highlight.content.text}"</strong>
                    <p>{highlight.comment}</p>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        </Worker>
      ) : (
        <div>Loading PDF...</div>
      )}
    </Container>
  );
}
