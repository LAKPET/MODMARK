import React, { useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Box,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import CreditScoreIcon from "@mui/icons-material/CreditScore";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({
  fileUrl,
  currentPage,
  scale,
  onPageChange,
  commentIcons,
  onCommentIconClick,
  onContextMenu,
  onPanelChange,
  activePanel = "scores",
}) => {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize the options object
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: "https://unpkg.com/pdfjs-dist@3.4.120/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  // Memoize the file object
  const file = useMemo(
    () => ({
      url: `http://localhost:5001/pdf?url=${encodeURIComponent(fileUrl)}`,
    }),
    [fileUrl]
  );

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    onPageChange(1); // Set the initial page to 1
  };

  const renderCommentIcons = () => {
    return commentIcons
      .filter((icon) => icon.pageIndex === currentPage - 1)
      .map((icon) => (
        <Tooltip key={icon.id} title={icon.comment} placement="left" arrow>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              left: `${icon.position.x}px`,
              top: `${icon.position.y}px`,
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              zIndex: 1000,
              transform: "translate(0, -50%)",
            }}
            onClick={() => onCommentIconClick(icon)}
          >
            <CommentIcon
              sx={{
                color: icon.highlight_color || "#1976d2",
              }}
            />
          </IconButton>
        </Tooltip>
      ));
  };

  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        overflow: "hidden",
        backgroundColor: "#000000", // Set background color for the entire container
        position: "relative",
        borderRadius: 0,
        m: "auto", // Center horizontally and vertically
        p: 0,
        width: "70%", // Set width to 70% of the container
        height: "100%", // Adjust height as needed
        display: "flex",
        justifyContent: "center", // Center content horizontally
        alignItems: "center", // Center content vertically
      }}
      onContextMenu={onContextMenu}
    >
      {/* Icon Box */}
      <Box
        sx={{
          position: "absolute", // ตำแหน่งแบบ absolute ภายใน Paper
          top: 0, // ชิดบนสุด
          right: 0, // ชิดขวาสุด
          display: "flex",
          flexDirection: "column",
          gap: 1,
          zIndex: 1000,
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          borderRadius: 0,
          p: 1,
          width: "50px",
        }}
      >
        <IconButton
          size="small"
          onClick={() => onPanelChange("scores")}
          sx={{
            backgroundColor:
              activePanel === "scores" ? "#8B5F34" : "transparent",
            color: activePanel === "scores" ? "white" : "inherit",
            borderRadius: 0,
            width: "100%",
            height: "40px",
            "&:hover": {
              backgroundColor: activePanel === "scores" ? "#6B4A2A" : "#f5f5f5",
            },
          }}
        >
          <CreditScoreIcon />
        </IconButton>
        <IconButton
          onClick={() => onPanelChange("comments")}
          sx={{
            backgroundColor:
              activePanel === "comments" ? "#8B5F34" : "transparent",
            color: activePanel === "comments" ? "white" : "inherit",
            borderRadius: 0,
            width: "100%",
            height: "40px",
            "&:hover": {
              backgroundColor:
                activePanel === "comments" ? "#6B4A2A" : "#f5f5f5",
            },
          }}
        >
          <CommentIcon />
        </IconButton>
      </Box>

      {/* PDF Viewer */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflowY: "auto", // Enable vertical scrolling
          display: "flex",
          justifyContent: "center", // Center PDF horizontally
          alignItems: "flex-start", // Align PDF at the top
        }}
      >
        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<CircularProgress />}
          error={<div>Error loading PDF. Please try again.</div>}
          options={pdfOptions}
        >
          {/* Render all pages */}
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
              onLoadSuccess={() => setLoading(false)}
              error={<div>Error loading page {index + 1}</div>}
            />
          ))}
        </Document>
        {renderCommentIcons()}
      </Box>
    </Paper>
  );
};

export default PDFViewer;
