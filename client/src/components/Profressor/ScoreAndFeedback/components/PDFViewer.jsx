import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { highlightPlugin } from "@react-pdf-viewer/highlight";
import { selectionModePlugin } from "@react-pdf-viewer/selection-mode";
import {
  Box,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import DeleteIcon from "@mui/icons-material/Delete";
import CreditScoreIcon from "@mui/icons-material/CreditScore";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

const PDFViewer = ({
  fileUrl,
  currentPage,
  scale,
  onPageChange,
  onHighlightClick,
  onHighlightDelete,
  commentIcons,
  onCommentIconClick,
  onDeleteHighlight,
  onContextMenu,
  onPanelChange,
  showHoverIcons = true,
  activePanel = "scores",
}) => {
  const highlightPluginInstance = highlightPlugin({
    onHighlightClick,
    onHighlightDelete,
    renderHighlightContent: (props) => (
      <div
        style={{
          background: props.highlight.highlight_color || "#ffeb3b",
          padding: "2px 4px",
          borderRadius: "2px",
          position: "relative",
        }}
      >
        {props.highlight.content.text}
        <IconButton
          size="small"
          style={{
            position: "absolute",
            right: -8,
            top: -8,
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteHighlight(props.highlight);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </div>
    ),
    onTextLayerRender: (e) => {
      if (e.textLayer) {
        e.textLayer.style.opacity = "1";
      }
    },
    shouldHandleEvent: (event) => {
      return event.type === "mouseup";
    },
  });

  const selectionModePluginInstance = selectionModePlugin({
    onTextSelection: (selectedText) => {
      if (selectedText && selectedText.trim()) {
        // Handle text selection
      }
    },
  });

  const renderCommentIcons = () => {
    return commentIcons
      .filter((icon) => icon.pageIndex === currentPage - 1)
      .map((icon) => {
        const pdfPages = document.querySelectorAll(".rpv-core__page-layer");
        const currentPageElement = pdfPages[currentPage - 1];
        const pdfPageRect = currentPageElement?.getBoundingClientRect();

        const iconX = pdfPageRect ? pdfPageRect.right - 50 : 0;
        const iconY = icon.position.y;

        return (
          <Tooltip key={icon.id} title={icon.comment} placement="left" arrow>
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                left: `${iconX}px`,
                top: `${iconY}px`,
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
        );
      });
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
        <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
          <Viewer
            fileUrl={fileUrl}
            plugins={[highlightPluginInstance, selectionModePluginInstance]}
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
            renderLoader={(percentages) => (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </div>
            )}
          />
        </Worker>
        {renderCommentIcons()}
      </Box>
    </Paper>
  );
};

export default PDFViewer;
