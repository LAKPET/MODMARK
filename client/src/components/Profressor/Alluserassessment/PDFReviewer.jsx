import React, { useState, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { highlightPlugin } from "@react-pdf-viewer/highlight";
import { selectionModePlugin } from "@react-pdf-viewer/selection-mode";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CommentIcon from "@mui/icons-material/Comment";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

const PDFReviewer = ({ fileUrl, submissionId, onNext, onPrevious }) => {
  const [highlights, setHighlights] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [comment, setComment] = useState("");
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [commentIcons, setCommentIcons] = useState([]);
  const [pageHeight, setPageHeight] = useState(0);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Extract filename from fileUrl
  const fileName = fileUrl.split("/").pop().split(".")[0];

  const handleContextMenu = (event) => {
    event.preventDefault();
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setMousePosition({ x: event.clientX, y: event.clientY });
      setContextMenu(true);
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleAddHighlight = async () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    try {
      const token = localStorage.getItem("authToken");
      const professorId = localStorage.getItem("UserId");

      const annotation = {
        submission_id: submissionId,
        file_url: fileUrl,
        page_number: currentPage,
        highlight_text: selection.toString(),
        bounding_box: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
        professor_id: professorId,
      };

      console.log("Creating annotation:", annotation);

      const response = await axios.post(
        `${apiUrl}/api/annotation/create`,
        annotation,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Annotation created:", response.data);
      setSelectedText(selection.toString());
      setShowCommentDialog(true);
      handleCloseContextMenu();
    } catch (error) {
      console.error("Error creating annotation:", error);
    }
  };

  const highlightPluginInstance = highlightPlugin({
    onHighlightClick: (highlight) => {
      setSelectedHighlight(highlight);
      console.log("Clicked highlight:", highlight);
    },
    onHighlightDelete: async (highlight) => {
      try {
        const token = localStorage.getItem("authToken");
        await axios.delete(`${apiUrl}/api/annotation/${highlight.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHighlights(highlights.filter((h) => h.id !== highlight.id));
        setCommentIcons(
          commentIcons.filter((icon) => icon.id !== highlight.id)
        );
      } catch (error) {
        console.error("Error deleting annotation:", error);
      }
    },
    renderHighlightContent: (props) => (
      <div
        style={{
          background: "#ffeb3b",
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
            handleDeleteHighlight(props.highlight);
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
        setSelectedText(selectedText);
        setShowCommentDialog(true);
      }
    },
  });

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        console.log("Fetching annotations for submission:", submissionId);
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await axios.get(
          `${apiUrl}/api/annotation/submission/${submissionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Annotations response:", response.data);

        // Show all annotations, not just those with comments
        const formattedHighlights = response.data.map((annotation) => ({
          id: annotation._id,
          content: {
            text: annotation.highlight_text,
            boundingBox: annotation.bounding_box,
          },
          pageIndex: annotation.page_number - 1,
          comment: annotation.comment,
        }));

        // Set highlights
        setHighlights(formattedHighlights);

        // Set comment icons for all annotations
        const formattedCommentIcons = response.data.map((annotation) => ({
          id: annotation._id,
          pageIndex: annotation.page_number - 1,
          position: annotation.bounding_box,
          comment: annotation.comment || annotation.highlight_text,
        }));
        setCommentIcons(formattedCommentIcons);
      } catch (error) {
        console.error("Error fetching annotations:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          console.error("Error status:", error.response.status);
        }
        setHighlights([]);
        setCommentIcons([]);
      }
    };

    if (submissionId) {
      fetchAnnotations();
    }
  }, [submissionId]);

  const calculatePageHeight = () => {
    const pdfPage = document.querySelector(".rpv-core__page-layer");
    if (pdfPage) {
      const container = document.querySelector(".rpv-core__viewer");
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        // Calculate scale to fit one page
        const scale = Math.min(
          containerWidth / pdfPage.clientWidth,
          containerHeight / pdfPage.clientHeight
        );
        setScale(scale);
        setPageHeight(pdfPage.clientHeight * scale);
      }
    }
  };

  useEffect(() => {
    const handleDocumentLoad = () => {
      calculatePageHeight();
    };

    window.addEventListener("resize", calculatePageHeight);
    return () => window.removeEventListener("resize", calculatePageHeight);
  }, []);

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem("authToken");
      const professorId = localStorage.getItem("UserId");

      // Get the selection position relative to the PDF viewer
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const pdfPage = document.querySelector(".rpv-core__page-layer");
      const pdfPageRect = pdfPage.getBoundingClientRect();

      // Calculate position relative to the PDF page
      const relativeX = rect.x - pdfPageRect.left;
      const relativeY = rect.y - pdfPageRect.top;

      // Create new annotation with comment
      const annotation = {
        submission_id: submissionId,
        file_url: fileUrl,
        page_number: currentPage,
        highlight_text: selectedText,
        bounding_box: {
          x: relativeX,
          y: relativeY,
          width: rect.width,
          height: rect.height,
        },
        professor_id: professorId,
        comment: comment.trim(),
      };

      console.log("Creating annotation:", annotation);

      const response = await axios.post(
        `${apiUrl}/api/annotation/create`,
        annotation,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Annotation created:", response.data);

      // Add comment icon to the list with the original selection position
      const newCommentIcon = {
        id: response.data._id,
        pageIndex: currentPage - 1,
        position: {
          x: relativeX,
          y: relativeY,
        },
        comment: comment.trim(),
      };
      setCommentIcons([...commentIcons, newCommentIcon]);

      // Add to highlights list
      const newHighlight = {
        id: response.data._id,
        content: {
          text: selectedText,
          boundingBox: {
            x: relativeX,
            y: relativeY,
            width: rect.width,
            height: rect.height,
          },
        },
        pageIndex: currentPage - 1,
        comment: comment.trim(),
      };
      setHighlights([...highlights, newHighlight]);

      setComment("");
      setShowCommentDialog(false);
      setSelectedText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    }
  };

  const handleDeleteHighlight = async (highlight) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${apiUrl}/api/annotation/${highlight.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHighlights(highlights.filter((h) => h.id !== highlight.id));
      setCommentIcons(commentIcons.filter((icon) => icon.id !== highlight.id));
      if (selectedHighlight?.id === highlight.id) {
        setSelectedHighlight(null);
      }
    } catch (error) {
      console.error("Error deleting highlight:", error);
    }
  };

  const renderCommentIcons = () => {
    return commentIcons
      .filter((icon) => icon.pageIndex === currentPage - 1)
      .map((icon) => {
        const pdfPage = document.querySelector(".rpv-core__page-layer");
        const pdfPageRect = pdfPage?.getBoundingClientRect();
        const iconX = pdfPageRect ? pdfPageRect.right - 50 : 0; // Position icon 50px from right edge
        const iconY = icon.position.y;

        return (
          <React.Fragment key={icon.id}>
            {/* Connecting line */}
            <svg
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 999,
              }}
            >
              <line
                x1={icon.position.x}
                y1={icon.position.y}
                x2={iconX}
                y2={iconY}
                stroke="#1976d2"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>

            {/* Comment icon */}
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
                  transform: "translate(0, -50%)", // Center vertically only
                }}
                onClick={() => {
                  setSelectedHighlight({
                    id: icon.id,
                    content: { text: "", boundingBox: icon.position },
                    pageIndex: icon.pageIndex,
                    comment: icon.comment,
                  });
                }}
              >
                <CommentIcon sx={{ color: "#1976d2" }} />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        );
      });
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation Bar */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f5f5f5",
          borderRadius: 0,
        }}
      >
        {/* Center - Page info and controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            margin: "0 auto",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Page {currentPage}
          </Typography>
          {selectedText && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                backgroundColor: "#fff",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              Selected: {selectedText}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOutIcon />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                display: "flex",
                alignItems: "center",
                minWidth: "60px",
                justifyContent: "center",
              }}
            >
              {Math.round(scale * 100)}%
            </Typography>
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomInIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Right side - Navigation arrows */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={onPrevious}
            sx={{
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            onClick={onNext}
            sx={{
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* PDF Viewer */}
        <Paper
          elevation={3}
          sx={{
            flex: "0 0 75%",
            overflow: "hidden",
            backgroundColor: "#fff",
            position: "relative",
            borderRadius: 0,
          }}
          onContextMenu={handleContextMenu}
        >
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
              <Viewer
                fileUrl={fileUrl}
                plugins={[highlightPluginInstance, selectionModePluginInstance]}
                onPageChange={(e) => setCurrentPage(e.currentPage)}
                defaultScale={scale}
                theme={{
                  theme: "light",
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
                      calculatePageHeight();
                    });
                  }
                }}
                scrollMode={1}
              />
            </Worker>
            {renderCommentIcons()}
          </Box>
        </Paper>

        {/* Comments Panel */}
        <Paper
          elevation={3}
          sx={{
            flex: "0 0 25%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            borderRadius: 0,
            borderLeft: "1px solid #e0e0e0",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <Typography variant="h6">Comments</Typography>
          </Box>
          <List sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {highlights.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No comments yet"
                  secondary="Select text in the PDF to add a comment"
                />
              </ListItem>
            ) : (
              highlights.map((highlight) => (
                <React.Fragment key={highlight.id}>
                  <ListItem
                    button
                    selected={selectedHighlight?.id === highlight.id}
                    onClick={() => setSelectedHighlight(highlight)}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHighlight(highlight);
                        }}
                        sx={{
                          color: "error.main",
                          "&:hover": {
                            backgroundColor: "error.light",
                            color: "error.contrastText",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={highlight.content.text}
                      secondary={
                        highlight.comment ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {highlight.comment}
                          </Typography>
                        ) : null
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Box>

      {/* Menus and Dialogs */}
      <Menu
        open={contextMenu}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: mousePosition.y, left: mousePosition.x }
            : undefined
        }
      >
        <MenuItem onClick={handleAddHighlight}>
          <CommentIcon sx={{ mr: 1 }} />
          Add Comment
        </MenuItem>
      </Menu>

      <Dialog
        open={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
      >
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Selected Text:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              backgroundColor: "#f5f5f5",
              p: 1,
              borderRadius: 1,
              mb: 2,
            }}
          >
            {selectedText}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCommentDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddComment}
            variant="contained"
            disabled={!comment.trim()}
            sx={{ backgroundColor: "#8B5F34" }}
          >
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PDFReviewer;
