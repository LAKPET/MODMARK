import React, { useState } from "react";
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
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
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
  const pdfOptions = {
    cMapUrl: "https://unpkg.com/pdfjs-dist@3.4.120/cmaps/",
    cMapPacked: true,
    httpHeaders: {
      "Access-Control-Allow-Origin": "*",
    },
  };
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
        backgroundColor: "#fff",
        position: "relative",
        borderRadius: 0,
        m: 0,
        p: 0,
        pl: 0,
        width: "70%",
      }}
      onContextMenu={onContextMenu}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          m: 0,
          p: 0,
          pl: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 15,
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
                backgroundColor:
                  activePanel === "scores" ? "#6B4A2A" : "#f5f5f5",
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
          file={{
            url: fileUrl,
            httpHeaders: {
              "Access-Control-Allow-Origin": "*",
            },
          }}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<CircularProgress />}
          error={<div>Error loading PDF. Please try again.</div>}
          options={pdfOptions}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            onLoadSuccess={() => setLoading(false)}
            error={<div>Error loading page {currentPage}</div>}
          />
        </Document>
        {renderCommentIcons()}
      </Box>
    </Paper>
  );
};

export default PDFViewer;
