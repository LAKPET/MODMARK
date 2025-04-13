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

import CommentIcon from "@mui/icons-material/Comment";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import PDFViewer from "./components/PDFViewer";
import CommentsPanel from "./components/CommentsPanel";
import ScorePanel from "./components/ScorePanel";
import CommentDialog from "./components/CommentDialog";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

const PDFReviewer = ({
  fileUrl,
  submissionId,
  onNext,
  onPrevious,
  assessmentId,
  submissionInfo,
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
  const [activePanel, setActivePanel] = useState("scores");
  const [rubric, setRubric] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
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
    const pdfPage = document.querySelector(".rpv-core__page-layer");
    const pdfPageRect = pdfPage.getBoundingClientRect();

    // Calculate position relative to the PDF page
    const relativeX = rect.x - pdfPageRect.left;
    const relativeY = rect.y - pdfPageRect.top;

    try {
      const token = localStorage.getItem("authToken");
      const professorId = localStorage.getItem("UserId");
      const professorUsername = localStorage.getItem("Username");

      // Create annotation with both highlight and comment data
      const annotation = {
        submission_id: submissionId,
        file_url: fileUrl,
        page_number: currentPage,
        highlight_text: selection.toString(),
        bounding_box: {
          x: relativeX,
          y: relativeY,
          width: rect.width,
          height: rect.height,
        },
        professor_id: professorId,
        highlight_color: selectedColor,
        comment_text: comment.trim(), // Include comment text in the same request
      };

      console.log("Creating annotation with comment:", annotation);

      const response = await axios.post(
        `${apiUrl}/annotation/create`,
        annotation,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Annotation created:", response.data);

      // Add new comment icon to the list
      const newCommentIcon = {
        id: response.data.annotation._id,
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
        id: response.data.annotation._id,
        content: {
          text: selection.toString(),
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
          username: professorUsername || "Unknown",
        },
      };
      setHighlights([...highlights, newHighlight]);

      // Reset states
      setComment("");
      setSelectedText("");
      handleCloseContextMenu();
    } catch (error) {
      console.error("Error creating annotation:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
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
        await axios.delete(`${apiUrl}/annotation/${highlight.id}`, {
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
          `${apiUrl}/annotation/submission/${submissionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Annotations response:", response.data);

        const formattedHighlights = response.data.map((annotation) => {
          // Get the first comment if it exists
          const firstComment =
            annotation.comments && annotation.comments.length > 0
              ? annotation.comments[0].comment_text
              : "";

          return {
            id: annotation._id,
            content: {
              text: annotation.highlight_text,
              boundingBox: annotation.bounding_box,
            },
            pageIndex: annotation.page_number - 1,
            comment: firstComment, // ใช้ comment แรกถ้ามี
            highlight_color: annotation.highlight_color || "#ffeb3b",
            professor: {
              username: annotation.professor_id?.username, // เพิ่ม username
            },
            comments: annotation.comments || [], // เก็บ comments ทั้งหมด
          };
        });

        setHighlights(formattedHighlights);

        const formattedCommentIcons = response.data.map((annotation) => {
          // Get the first comment if it exists
          const firstComment =
            annotation.comments && annotation.comments.length > 0
              ? annotation.comments[0].comment_text
              : annotation.highlight_text;

          return {
            id: annotation._id,
            pageIndex: annotation.page_number - 1,
            position: annotation.bounding_box,
            comment: firstComment,
            highlight_color: annotation.highlight_color || "#ffeb3b",
          };
        });
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

  useEffect(() => {
    const fetchRubricData = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // First, get the assessment data to get the rubric_id
        const assessmentResponse = await axios.get(
          `${apiUrl}/submission/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const submission = assessmentResponse.data.find(
          (sub) => sub._id === submissionId
        );

        if (!submission || !submission.assessment_id.rubric_id) {
          throw new Error("Rubric not found for this assessment");
        }

        // Then fetch the rubric data
        const rubricResponse = await axios.get(
          `${apiUrl}/rubric/${submission.assessment_id.rubric_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRubric(rubricResponse.data);

        // Initialize scores object with empty values
        const initialScores = {};
        rubricResponse.data.criteria.forEach((criterion) => {
          initialScores[criterion._id] = "";
        });
        setScores(initialScores);
      } catch (err) {
        console.error("Error fetching rubric:", err);
        setError("Error loading rubric data");
      } finally {
        setLoading(false);
      }
    };

    fetchRubricData();
  }, [submissionId, assessmentId, apiUrl]);

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
        highlight_color: selectedColor,
        comment_text: comment.trim(), // ส่ง comment_text แยกต่างหาก
      };

      console.log("Creating annotation with comment:", annotation);

      const response = await axios.post(
        `${apiUrl}/annotation/create`,
        annotation,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Annotation created:", response.data);

      // Add new comment icon to the list
      const newCommentIcon = {
        id: response.data.annotation._id,
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
        id: response.data.annotation._id,
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
        comment: comment.trim(), // ยังคงใช้ comment นี้เพื่อแสดงผล
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
      await axios.delete(`${apiUrl}/annotation/delete/${highlight.id}`, {
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

    // If opening the reply input and we don't have comments yet, fetch them
    if (!replyInputs[highlightId] && !comments[highlightId]) {
      fetchCommentsForHighlight(highlightId);
    }
  };

  const handleReplyTextChange = (highlightId, text) => {
    setReplyTexts((prev) => ({
      ...prev,
      [highlightId]: text,
    }));
  };

  const handleSendReply = async (highlightId) => {
    const replyText = replyTexts[highlightId];
    if (replyText && replyText.trim()) {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("UserId");

        // Find the comment ID for this highlight
        const highlight = highlights.find((h) => h.id === highlightId);
        if (
          !highlight ||
          !highlight.comments ||
          highlight.comments.length === 0
        ) {
          console.error("No comment found for this highlight");
          return;
        }

        const commentId = highlight.comments[0]._id; // Use the first comment as parent

        // Send the reply
        const response = await axios.post(
          `${apiUrl}/comment/reply/${commentId}`,
          {
            user_id: userId,
            comment_text: replyText.trim(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Reply sent:", response.data);

        // Fetch updated comments for this highlight
        await fetchCommentsForHighlight(highlightId);

        // Reset the reply input
        setReplyTexts((prev) => ({
          ...prev,
          [highlightId]: "",
        }));
        setReplyInputs((prev) => ({
          ...prev,
          [highlightId]: false,
        }));
      } catch (error) {
        console.error("Error sending reply:", error);
      }
    }
  };

  const fetchCommentsForHighlight = async (highlightId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUrl}/comment/annotation/${highlightId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Fetched comments:", response.data);

      // Update the comments state with the fetched data
      setComments((prev) => ({
        ...prev,
        [highlightId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleScoreChange = (criterionId, score) => {
    setScores((prev) => ({
      ...prev,
      [criterionId]: score,
    }));
  };

  const handleSubmitScores = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${apiUrl}/submission/score/${submissionId}`,
        {
          scores: Object.entries(scores).map(([criterionId, score]) => ({
            criterion_id: criterionId,
            score: parseFloat(score),
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Handle success (e.g., show success message, redirect)
    } catch (err) {
      console.error("Error submitting scores:", err);
      // Handle error (e.g., show success message)
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
      <NavigationBar
        currentPage={currentPage}
        selectedText={selectedText}
        onNext={onNext}
        onPrevious={onPrevious}
        submissionId={submissionId}
        assessmentId={assessmentId}
      />

      <Box
        sx={{ flex: 1, display: "flex", overflow: "hidden", m: 0, p: 0, pl: 0 }}
      >
        <PDFViewer
          fileUrl={fileUrl}
          currentPage={currentPage}
          scale={scale}
          onPageChange={setCurrentPage}
          onHighlightClick={setSelectedHighlight}
          onHighlightDelete={handleDeleteHighlight}
          commentIcons={commentIcons}
          onCommentIconClick={setSelectedHighlight}
          onDeleteHighlight={handleDeleteHighlight}
          onContextMenu={handleContextMenu}
          onPanelChange={setActivePanel}
          showHoverIcons={true}
          activePanel={activePanel}
        />

        <Box sx={{ width: "30%" }}>
          {activePanel === "scores" ? (
            <ScorePanel
              submissionId={submissionId}
              assessmentId={assessmentId}
              rubric={rubric}
              scores={scores}
              onScoreChange={handleScoreChange}
              onSubmitScores={handleSubmitScores}
              apiUrl={apiUrl}
              submissionInfo={submissionInfo}
            />
          ) : (
            <CommentsPanel
              highlights={highlights}
              currentPage={currentPage}
              onDeleteHighlight={handleDeleteHighlight}
              replyInputs={replyInputs}
              replyTexts={replyTexts}
              onReplyTextChange={handleReplyTextChange}
              onSendReply={handleSendReply}
              onToggleReplyInput={toggleReplyInput}
              selectedHighlight={selectedHighlight}
            />
          )}
        </Box>
      </Box>

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

      <CommentDialog
        open={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        selectedText={selectedText}
        comment={comment}
        onCommentChange={setComment}
        onAddComment={handleAddComment}
        highlightColors={highlightColors}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
      />
    </Box>
  );
};

export default PDFReviewer;
