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
  CircularProgress,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import CommentIcon from "@mui/icons-material/Comment";
import DeleteIcon from "@mui/icons-material/Delete";
import TurnRightIcon from "@mui/icons-material/TurnRight";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import HomeIcon from "@mui/icons-material/Home";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../../controls/Avatar";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

const PDFReviewer = ({
  fileUrl,
  submissionId,
  onNext,
  onPrevious,
  assessmentId,
}) => {
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
  const [selectedColor, setSelectedColor] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const highlightColors = [
    { name: "Yellow", value: "#ffeb3b" },
    { name: "Green", value: "#a5d6a7" },
    { name: "Blue", value: "#90caf9" },
    { name: "Red", value: "#ef9a9a" },
    { name: "Purple", value: "#ce93d8" },
  ];

  // Extract filename from fileUrl
  const fileName = fileUrl.split("/").pop().split(".")[0];
  const mockupHighlight = {
    id: "1",
    content: { text: "This is a highlighted text" },
    comment: "This is a comment",
    highlight_color: "#ffeb3b",
    professor: { username: "John Doe" },
    replies: [
      { username: "Jane Smith", text: "This is a reply" },
      { username: "Alice Johnson", text: "Another reply" },
    ],
  };
  const handleHome = () => {
    navigate(`/assessment/${submissionId}/allassessmentuser/${assessmentId}`);
  };

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
        highlight_color: selectedColor,
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
        if (selectedHighlight?.id === highlight.id) {
          setSelectedHighlight(null);
        }
      } catch (error) {
        console.error("Error deleting annotation:", error);
      }
    },
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

        const formattedHighlights = response.data.map((annotation) => ({
          id: annotation._id,
          content: {
            text: annotation.highlight_text,
            boundingBox: annotation.bounding_box,
          },
          pageIndex: annotation.page_number - 1,
          comment: annotation.comment,
          highlight_color: annotation.highlight_color || "#ffeb3b",
          professor: {
            username: annotation.professor_id?.username, // เพิ่ม username
          },
        }));

        setHighlights(formattedHighlights);

        const formattedCommentIcons = response.data.map((annotation) => ({
          id: annotation._id,
          pageIndex: annotation.page_number - 1,
          position: annotation.bounding_box,
          comment: annotation.comment || annotation.highlight_text,
          highlight_color: annotation.highlight_color || "#ffeb3b",
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
      const professorUsername = localStorage.getItem("Username"); // ดึง username จาก localStorage

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
        highlight_color: selectedColor,
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

      // Add new comment icon to the list
      const newCommentIcon = {
        id: response.data._id,
        pageIndex: currentPage - 1,
        position: {
          x: relativeX,
          y: relativeY,
        },
        comment: comment.trim(),
        highlight_color: selectedColor,
      };
      setCommentIcons([...commentIcons, newCommentIcon]);

      // Add new highlight to the list
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
        highlight_color: selectedColor,
        professor: {
          username: professorUsername || "Unknown", // ใช้ username จาก localStorage
        },
      };
      setHighlights([...highlights, newHighlight]);

      // Reset states
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

      // Remove highlight from highlights array
      setHighlights(highlights.filter((h) => h.id !== highlight.id));

      // Remove comment icon from commentIcons array
      setCommentIcons(commentIcons.filter((icon) => icon.id !== highlight.id));

      // Clear selected highlight if it's the one being deleted
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
        const iconX = pdfPageRect ? pdfPageRect.right - 50 : 0;
        const iconY = icon.position.y;

        return (
          <React.Fragment key={icon.id}>
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
                onClick={() => {
                  setSelectedHighlight({
                    id: icon.id,
                    content: { text: "", boundingBox: icon.position },
                    pageIndex: icon.pageIndex,
                    comment: icon.comment,
                  });
                }}
              >
                <CommentIcon
                  sx={{
                    color: icon.highlight_color || "#1976d2", // ใช้สีของ highlight_color
                  }}
                />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        );
      });
  };

  const toggleReplyInput = (highlightId) => {
    setReplyInputs((prev) => ({
      ...prev,
      [highlightId]: !prev[highlightId],
    }));
  };

  const handleReplyTextChange = (highlightId, text) => {
    setReplyTexts((prev) => ({
      ...prev,
      [highlightId]: text,
    }));
  };

  const handleSendReply = (highlightId) => {
    const replyText = replyTexts[highlightId];
    if (replyText && replyText.trim()) {
      console.log(`Sending reply for highlight ${highlightId}: ${replyText}`);
      // Add your logic to send the reply here
      // Reset the reply input
      setReplyTexts((prev) => ({
        ...prev,
        [highlightId]: "",
      }));
      setReplyInputs((prev) => ({
        ...prev,
        [highlightId]: false,
      }));
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        m: 0,
        p: 0,
      }}
    >
      {/* Navigation Bar */}
      <Paper
        elevation={3}
        sx={{
          py: 1,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#8B5F34",
          borderRadius: 0,
          minHeight: "48px",
        }}
      >
        {/* Left side - Home button */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={handleHome}
            size="small"
            sx={{
              color: "#fff",
              p: 0.5,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <HomeIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Center - Page info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            margin: "0 auto",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#fff" }}
          >
            Page {currentPage}
          </Typography>
          {selectedText && (
            <Typography
              variant="caption"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              Selected: {selectedText}
            </Typography>
          )}
        </Box>

        {/* Right side - Navigation arrows */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={onPrevious}
            size="small"
            sx={{
              color: "#fff",
              p: 0.5,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ArrowBackIosIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={onNext}
            size="small"
            sx={{
              color: "#fff",
              p: 0.5,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box
        sx={{ flex: 1, display: "flex", overflow: "hidden", m: 0, p: 0, pl: 0 }}
      >
        {/* PDF Viewer - Left Side */}
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
          onContextMenu={handleContextMenu}
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
            <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
              <Viewer
                fileUrl={fileUrl}
                plugins={[highlightPluginInstance, selectionModePluginInstance]}
                onPageChange={(e) => setCurrentPage(e.currentPage + 1)}
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

        {/* Comments Panel - Right Side */}
        <Paper
          elevation={3}
          sx={{
            width: "30%",
            backgroundColor: "#fff",
            borderRadius: 0,
            m: 0,
            p: 2,
            overflow: "auto",
            borderLeft: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#8B5F34" }}>
            Comments
          </Typography>
          <List>
            {highlights
              .filter(
                (highlight) =>
                  highlight.pageIndex === currentPage - 1 && highlight.comment
              )
              .map((highlight) => (
                <React.Fragment key={highlight.id}>
                  <ListItem
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      mb: 2,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                      p: 2,
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "5px",
                        backgroundColor: highlight.highlight_color || "#ffeb3b",
                        borderTopLeftRadius: "4px",
                        borderBottomLeftRadius: "4px",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteHighlight(highlight)}
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: "#666",
                        "&:hover": {
                          color: "#d32f2f",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => toggleReplyInput(highlight.id)} // เรียกฟังก์ชัน toggleReplyInput
                      sx={{
                        position: "absolute",
                        right: 40,
                        top: 8,
                        color: "#666",
                        "&:hover": {
                          color: "#1976d2",
                        },
                      }}
                    >
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        mb: 1,
                      }}
                    >
                      <Avatar
                        {...stringAvatar(
                          highlight.professor?.username || "Unknown"
                        )}
                      />
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <span>{highlight.professor?.username}</span>
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: highlight.highlight_color || "#ffeb3b",
                        p: 1,
                        borderRadius: 1,
                        mb: 1,
                        width: "100%",
                      }}
                    >
                      {highlight.content.text}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: "#ffffff",
                        p: 1,
                        borderRadius: 1,
                        color: "#666",
                        width: "100%",
                      }}
                    >
                      {highlight.comment}
                    </Typography>

                    {/* Mockup Data สำหรับ Reply */}
                    {replyInputs[highlight.id] && (
                      <>
                        {mockupHighlight.replies.map((reply, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 1,
                              pl: 2, // เพิ่ม padding ซ้ายเพื่อให้ Reply อยู่ลึกกว่า Comment หลัก
                              borderLeft: "2px solid #ddd", // เส้นคั่นระหว่าง Reply
                            }}
                          >
                            <TurnRightIcon
                              sx={{
                                fontSize: 16,
                                color: "#666",
                                mr: 1,
                                transform: "scaleY(-1)", // หมุนกลับด้านซ้ายขวา
                              }}
                            />
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: "bold",
                                  color: "#666",
                                }}
                              >
                                {reply.username}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#666",
                                }}
                              >
                                {reply.text}
                              </Typography>
                            </Box>
                          </Box>
                        ))}

                        {/* Input สำหรับ Reply */}
                        <Box sx={{ mt: 2, width: "100%" }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Reply"
                            value={replyTexts[highlight.id] || ""}
                            onChange={(e) =>
                              handleReplyTextChange(
                                highlight.id,
                                e.target.value
                              )
                            }
                            sx={{ mb: 1 }}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  size="small"
                                  onClick={() => handleSendReply(highlight.id)}
                                  sx={{
                                    color: "#666", // สีของไอคอน
                                  }}
                                >
                                  <SendIcon />
                                </IconButton>
                              ),
                            }}
                          />
                        </Box>
                      </>
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
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
        maxWidth="sm" // ปรับขนาดความกว้าง เช่น "sm", "md", "lg", "xl"
        fullWidth
      >
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Selected Text:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              backgroundColor: selectedColor,
              p: 1,
              borderRadius: 1,
              mb: 2,
            }}
          >
            {selectedText}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Highlight Color:
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {highlightColors.map((color) => (
                <IconButton
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  sx={{
                    backgroundColor: color.value,
                    borderRadius: "50%", // ทำให้ IconButton เป็นทรงกลม
                    border:
                      selectedColor === color.value
                        ? "2px solid rgb(116, 115, 115)"
                        : "none",
                    "&:hover": {
                      backgroundColor: color.value,
                    },
                    width: 36, // กำหนดขนาดความกว้าง
                    height: 36, // กำหนดขนาดความสูง
                  }}
                >
                  <div style={{ width: 24, height: 24 }} />
                </IconButton>
              ))}
            </Box>
          </Box>
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
            // sx={{ backgroundColor: "#8B5F34" }}
            className="custom-btn"
          >
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PDFReviewer;
