import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { highlightPlugin } from "@react-pdf-viewer/highlight";
import { Box, Paper, IconButton } from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

const PDFViewer = ({
  fileUrl,
  currentPage,
  scale,
  onPageChange,
  onHighlightClick,
  highlights,
  onPanelChange,
  activePanel,
}) => {
  const highlightPluginInstance = highlightPlugin({
    renderHighlights: (props) => {
      return highlights.map((highlight) => ({
        ...highlight,
        highlight_color: highlight.highlight_color || "#ffeb3b",
      }));
    },
  });

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
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
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
        <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
          <Viewer
            fileUrl={fileUrl}
            plugins={[highlightPluginInstance]}
            onPageChange={(e) => onPageChange(e.currentPage + 1)}
            defaultScale={scale}
            theme={{
              theme: "dark",
            }}
            onDocumentLoad={(e) => {
              if (e.doc) {
                e.doc.getPage(1).then((page) => {
                  const textLayer = document.querySelector(
                    ".rpv-core__text-layer"
                  );
                  if (textLayer) {
                    textLayer.style.opacity = "1";
                  }
                });
              }
            }}
            scrollMode={1}
            layoutMode={1}
          />
        </Worker>
      </Box>
    </Paper>
  );
};

export default PDFViewer;
