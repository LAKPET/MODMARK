import React, { useState, useEffect, useRef } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { highlightPlugin } from "@react-pdf-viewer/highlight";
import { selectionModePlugin } from "@react-pdf-viewer/selection-mode";
import {
  Box,
  IconButton,
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
  isFirstSubmission,
  isLastSubmission,
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
  const [selectedColor, setSelectedColor] = useState("#ffeb3b"); // Default color
  const [replyInputs, setReplyInputs] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [activePanel, setActivePanel] = useState("scores");
  const [rubric, setRubric] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [selectionPosition, setSelectionPosition] = useState(null);
  const [gradingStatus, setGradingStatus] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const pollingIntervalRef = useRef(null);
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

  // Get student name from submissionInfo
  const studentName = submissionInfo?.student_info
    ? `${submissionInfo.student_info.first_name} ${submissionInfo.student_info.last_name}`
    : null;

  const handleContextMenu = (event) => {
    event.preventDefault();

    const userRole = localStorage.getItem("UserRole"); // Get user role

    // Prevent context menu for students
    if (userRole === "student") {
      console.warn("Students are not allowed to add comments.");
      return; // Exit the function
    }

    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setMousePosition({ x: event.clientX, y: event.clientY });
      setContextMenu({
        mouseX: event.clientX,
        mouseY: event.clientY,
      });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddHighlight = async () => {
    const userRole = localStorage.getItem("UserRole");

    // Prevent students from adding comments
    if (userRole === "student") {
      console.warn("Students are not allowed to add comments.");
      return;
    }

    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Get all PDF pages using react-pdf's class naming
    const pdfPages = document.querySelectorAll(".pdf-page");

    if (!pdfPages || pdfPages.length === 0) {
      console.warn("No PDF pages found. Check selector or PDF loading.");
      // Use fallback positioning
      setSelectionPosition({
        x: 100,
        y: 100,
        width: rect.width,
        height: rect.height,
      });
      setSelectedText(selection.toString());
      setShowCommentDialog(true);
      handleCloseContextMenu();
      return;
    }

    // Find the current page element by checking which one contains the selection
    let currentPageElement = null;
    let currentPageNumber = currentPage;

    for (let i = 0; i < pdfPages.length; i++) {
      const pageRect = pdfPages[i].getBoundingClientRect();
      if (
        rect.top >= pageRect.top &&
        rect.top <= pageRect.bottom &&
        rect.left >= pageRect.left &&
        rect.left <= pageRect.right
      ) {
        currentPageElement = pdfPages[i];
        // Extract page number from the class name (page-X)
        const className = pdfPages[i].className;
        const match = className.match(/page-(\d+)/);
        if (match && match[1]) {
          currentPageNumber = parseInt(match[1], 10);
        }
        break;
      }
    }

    // If we couldn't find the page element, use the current page number
    if (!currentPageElement && pdfPages.length > 0) {
      currentPageElement = document.querySelector(`.page-${currentPage}`);
      if (!currentPageElement) {
        currentPageElement = pdfPages[0];
      }
    }

    // Get the actual PDF content element within the page
    const pdfContent = currentPageElement?.querySelector(".react-pdf__Page");

    // Get bounding rect for the page content, with fallback to page container
    const pdfPageRect =
      pdfContent?.getBoundingClientRect() ||
      currentPageElement?.getBoundingClientRect();

    if (!pdfPageRect) {
      console.warn("Could not get bounding rectangle for PDF page");
      // Use fallback positioning
      setSelectionPosition({
        x: 100,
        y: 100,
        width: rect.width,
        height: rect.height,
        pageNumber: currentPageNumber,
      });
      setSelectedText(selection.toString());
      setShowCommentDialog(true);
      handleCloseContextMenu();
      return;
    }

    // Calculate position relative to the current PDF page
    const relativeX = rect.left - pdfPageRect.left;
    const relativeY = rect.top - pdfPageRect.top;

    console.log("Selection position:", {
      x: relativeX,
      y: relativeY,
      width: rect.width,
      height: rect.height,
      pageRect: {
        left: pdfPageRect.left,
        top: pdfPageRect.top,
        width: pdfPageRect.width,
        height: pdfPageRect.height,
      },
    });

    // Update current page if it changed
    if (currentPageNumber !== currentPage) {
      setCurrentPage(currentPageNumber);
    }

    setSelectionPosition({
      x: relativeX,
      y: relativeY,
      width: rect.width,
      height: rect.height,
      pageNumber: currentPageNumber,
    });
    setSelectedText(selection.toString());
    setShowCommentDialog(true);
    handleCloseContextMenu();
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

  // (old code)useEffect(() => {
  //   const fetchAnnotations = async () => {
  //     try {
  //       console.log("Fetching annotations for submission:", submissionId);
  //       const token = localStorage.getItem("authToken");
  //       if (!token) {
  //         console.error("No authentication token found");
  //         return;
  //       }

  //       const response = await axios.get(
  //         `${apiUrl}/annotation/submission/${submissionId}`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       console.log("Annotations response:", response.data);

  //       const formattedHighlights = response.data.map((annotation) => {
  //         // Get the first comment if it exists
  //         const firstComment =
  //           annotation.comments && annotation.comments.length > 0
  //             ? annotation.comments[0].comment_text
  //             : "";

  //         return {
  //           id: annotation._id,
  //           content: {
  //             text: annotation.highlight_text,
  //             boundingBox: annotation.bounding_box,
  //           },
  //           pageIndex: annotation.page_number - 1,
  //           comment: firstComment,
  //           highlight_color: annotation.highlight_color || "#ffeb3b",
  //           professor: {
  //             username: annotation.professor_id?.username,
  //           },
  //           comments: annotation.comments || [],
  //         };
  //       });

  //       setHighlights(formattedHighlights);

  //       const formattedCommentIcons = response.data.map((annotation) => {
  //         // Get the first comment if it exists
  //         const firstComment =
  //           annotation.comments && annotation.comments.length > 0
  //             ? annotation.comments[0].comment_text
  //             : annotation.highlight_text;

  //         return {
  //           id: annotation._id,
  //           pageIndex: annotation.page_number - 1, // Store pageIndex as 0-based
  //           position: annotation.bounding_box,
  //           comment: firstComment,
  //           highlight_color: annotation.highlight_color || "#ffeb3b",
  //         };
  //       });
  //       setCommentIcons(formattedCommentIcons);
  //     } catch (error) {
  //       console.error("Error fetching annotations:", error);
  //       if (error.response) {
  //         console.error("Error response:", error.response.data);
  //         console.error("Error status:", error.response.status);
  //       }
  //       setHighlights([]);
  //       setCommentIcons([]);
  //     }
  //   };

  //   if (submissionId) {
  //     fetchAnnotations();
  //   }
  // }, [submissionId]);

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

        // Check grading status
        const currentUserId = localStorage.getItem("UserId");
        const userStatus = submission.grading_status_by?.find(
          (status) => status.grader_id === currentUserId
        );
        const status = userStatus ? userStatus.status : "pending";
        setGradingStatus(status);

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

        // If grading status is "already", fetch existing scores
        if (status === "already") {
          try {
            const rawScoreResponse = await axios.get(
              `${apiUrl}/score/assessment/rawscore/${submissionId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (
              rawScoreResponse.data &&
              rawScoreResponse.data.rawScore &&
              rawScoreResponse.data.rawScore.score
            ) {
              // Update scores with existing values
              setScores(rawScoreResponse.data.rawScore.score);
            }
          } catch (scoreErr) {
            console.error("Error fetching existing scores:", scoreErr);
          }
        }
      } catch (err) {
        console.error("Error fetching rubric:", err);
        setError("Error loading rubric data");
      } finally {
        setLoading(false);
      }
    };

    fetchRubricData();
  }, [submissionId, assessmentId, apiUrl]);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${apiUrl}/submission/${submissionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched submission data:", response.data);
        setSubmissionData(response.data);
      } catch (err) {
        console.error("Error fetching submission data:", err);
      }
    };

    if (submissionId) {
      fetchSubmissionData();
    }
  }, [submissionId, apiUrl]);

  const calculatePageHeight = () => {
    // Get all PDF pages
    const pdfPages = document.querySelectorAll(".rpv-core__page-layer");
    if (pdfPages.length > 0) {
      const container = document.querySelector(".rpv-core__viewer");
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate scale to fit one page
        const scale = Math.min(
          containerWidth / pdfPages[0].clientWidth,
          containerHeight / pdfPages[0].clientHeight
        );
        setScale(scale);
        setPageHeight(pdfPages[0].clientHeight * scale);
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

  const handleAddComment = async () => {
    if (!comment.trim() || !selectionPosition) return;

    try {
      const token = localStorage.getItem("authToken");
      const professorId = localStorage.getItem("UserId");
      const professorUsername = localStorage.getItem("Username");

      // Ensure we have the correct page number
      const pageNumber = selectionPosition.pageNumber || currentPage;

      // Create new annotation with comment using stored position
      const annotation = {
        submission_id: submissionId,
        file_url: fileUrl,
        page_number: pageNumber,
        highlight_text: selectedText,
        bounding_box: {
          x: selectionPosition.x,
          y: selectionPosition.y,
          width: selectionPosition.width,
          height: selectionPosition.height,
        },
        professor_id: professorId,
        highlight_color: selectedColor || "#ffeb3b",
        comment_text: comment.trim(),
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

      // Add new comment icon to the list with correct page index
      const newCommentIcon = {
        id: response.data.annotation._id,
        pageIndex: pageNumber - 1, // Store pageIndex as 0-based
        position: {
          x: selectionPosition.x,
          y: selectionPosition.y,
          width: selectionPosition.width,
          height: selectionPosition.height,
        },
        comment: comment.trim(),
        highlight_color: selectedColor || "#ffeb3b",
      };

      setCommentIcons((prevIcons) => [...prevIcons, newCommentIcon]);

      // Add new highlight to the list
      const newHighlight = {
        id: response.data.annotation._id,
        content: {
          text: selectedText,
          boundingBox: {
            x: selectionPosition.x,
            y: selectionPosition.y,
            width: selectionPosition.width,
            height: selectionPosition.height,
          },
        },
        pageIndex: pageNumber - 1, // Store pageIndex as 0-based
        comment: comment.trim(),
        highlight_color: selectedColor || "#ffeb3b",
        professor: {
          username: professorUsername || "Unknown",
        },
      };

      setHighlights((prevHighlights) => [...prevHighlights, newHighlight]);

      // Immediately fetch comments for this highlight
      await fetchCommentsForHighlight(response.data.annotation._id);

      // Reset states
      setComment("");
      setShowCommentDialog(false);
      setSelectedText("");
      setSelectionPosition(null);
      setSelectedColor("#ffeb3b"); // Reset color for next comment
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
        // Get all PDF pages and find the current page
        const pdfPages = document.querySelectorAll(".pdf-page");

        // Get the specific page container for the current page
        const currentPageElement = document.querySelector(
          `.page-${currentPage}`
        );

        // Calculate icon position based on highlight position
        // Position icon at the end of the highlighted text (x + width)
        let iconX = (icon.position?.x || 0) + (icon.position?.width || 0);
        let iconY = icon.position?.y || 100;

        // Only try to access page elements if they exist
        if (currentPageElement) {
          const pageRect = currentPageElement.getBoundingClientRect();

          return (
            <Tooltip key={icon.id} title={icon.comment} placement="left" arrow>
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  left: `${iconX}px`, // Position icons at the end of highlighted text
                  top: `${iconY}px`,
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                  zIndex: 1000,
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
                    color: icon.highlight_color || "#1976d2",
                  }}
                />
              </IconButton>
            </Tooltip>
          );
        }

        // If no currentPageElement was found, still render an icon but with default positioning
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
                  color: icon.highlight_color || "#1976d2",
                }}
              />
            </IconButton>
          </Tooltip>
        );
      });
  };

  const toggleReplyInput = (highlightId) => {
    // If the reply input doesn't exist yet, initialize it as false (closed)
    setReplyInputs((prev) => ({
      ...prev,
      [highlightId]:
        prev[highlightId] === undefined ? true : !prev[highlightId],
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

        // First, ensure we have the latest comments
        await fetchCommentsForHighlight(highlightId);

        // Get the comment from our comments state
        const highlightComments = comments[highlightId];

        if (!highlightComments || highlightComments.length === 0) {
          console.error("No comments found for this highlight");
          return;
        }

        // Use the first comment as parent
        const commentId = highlightComments[0]._id;

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

        // Reset the reply text
        setReplyTexts((prev) => ({
          ...prev,
          [highlightId]: "",
        }));

        // Wait a short moment to ensure the server has processed the reply
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch updated comments
        await fetchCommentsForHighlight(highlightId);
      } catch (error) {
        console.error("Error sending reply:", error);
      }
    }
  };

  const handleSaveEdit = async (
    highlightId,
    commentId,
    replyId,
    editReplyText
  ) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `${apiUrl}/comment/reply/update/${replyId}`,
        {
          comment_text: editReplyText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch updated comments
      await fetchCommentsForHighlight(highlightId);
    } catch (error) {
      console.error("Error updating reply:", error);
    }
  };

  const handleDeleteReply = async (highlightId, replyId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${apiUrl}/comment/reply/delete/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch updated comments
      await fetchCommentsForHighlight(highlightId);
    } catch (error) {
      console.error("Error deleting reply:", error);
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
        `${apiUrl}/score/assessment/submit`,
        {
          assessment_id: submissionInfo.assessment_id,
          submission_id: submissionId,
          student_id: submissionInfo.student_id,
          group_id: submissionInfo.group_id,
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
      setGradingStatus("already");
    } catch (err) {
      console.error("Error submitting scores:", err);
      // Handle error (e.g., show success message)
    }
  };
  const fetchLatestAnnotations = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token || !submissionId) return;

      const response = await axios.get(
        `${apiUrl}/annotation/submission/${submissionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedHighlights = response.data.map((annotation) => {
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
          comment: firstComment,
          highlight_color: annotation.highlight_color || "#ffeb3b",
          professor: {
            username: annotation.professor_id?.username,
          },
          comments: annotation.comments || [],
        };
      });

      setHighlights(formattedHighlights);

      const formattedCommentIcons = response.data.map((annotation) => {
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

      // Update comments for currently selected highlight if any
      if (selectedHighlight) {
        await fetchCommentsForHighlight(selectedHighlight.id);
      }
    } catch (error) {
      console.error("Error fetching latest annotations:", error);
    }
  };
  // Add useEffect to fetch comments when selectedHighlight changes
  useEffect(() => {
    if (selectedHighlight) {
      fetchCommentsForHighlight(selectedHighlight.id);
    }
  }, [selectedHighlight]);

  // Add useEffect to fetch comments when replyInputs changes
  useEffect(() => {
    const activeHighlightIds = Object.keys(replyInputs).filter(
      (id) => replyInputs[id]
    );

    if (activeHighlightIds.length > 0) {
      const commentsInterval = setInterval(() => {
        activeHighlightIds.forEach((id) => {
          fetchCommentsForHighlight(id);
        });
      }, 2000);

      return () => {
        clearInterval(commentsInterval);
      };
    }
  }, [replyInputs]);

  // Add polling mechanism for active reply threads
  // Set up polling for annotations when submissionId is available
  useEffect(() => {
    if (!submissionId) return;

    // Initial fetch
    fetchLatestAnnotations();

    // Start polling every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchLatestAnnotations();
    }, 5000);

    // Cleanup on unmount or when submissionId changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [submissionId]);

  useEffect(() => {
    const fetchAllComments = async () => {
      try {
        // Fetch comments for all highlights to ensure reply counts are always available
        for (const highlight of highlights) {
          await fetchCommentsForHighlight(highlight.id);
        }
      } catch (error) {
        console.error("Error fetching all comments:", error);
      }
    };

    if (highlights.length > 0) {
      fetchAllComments();
    }
  }, [highlights]);

  // Handler for navigating to the next submission
  const handleNextSubmission = async () => {
    try {
      // Save any pending changes before navigating
      if (Object.keys(scores).length > 0 && gradingStatus !== "already") {
        await handleSubmitScores();
      }

      // Clear local state
      setHighlights([]);
      setCommentIcons([]);
      setSelectedHighlight(null);
      setSelectedText("");
      setComment("");
      setSelectionPosition(null);

      // Navigate to next submission
      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error("Error while navigating to next submission:", error);
    }
  };

  // Handler for navigating to the previous submission
  const handlePreviousSubmission = async () => {
    try {
      // Save any pending changes before navigating
      if (Object.keys(scores).length > 0 && gradingStatus !== "already") {
        await handleSubmitScores();
      }

      // Clear local state
      setHighlights([]);
      setCommentIcons([]);
      setSelectedHighlight(null);
      setSelectedText("");
      setComment("");
      setSelectionPosition(null);

      // Navigate to previous submission
      if (onPrevious) {
        onPrevious();
      }
    } catch (error) {
      console.error("Error while navigating to previous submission:", error);
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
        onNext={handleNextSubmission}
        onPrevious={handlePreviousSubmission}
        submissionId={submissionId}
        assessmentId={assessmentId}
        isFirstSubmission={isFirstSubmission}
        isLastSubmission={isLastSubmission}
        studentName={studentName}
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
              submissionInfo={submissionData || submissionInfo}
              gradingStatus={gradingStatus}
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
              comments={comments}
              onSaveEdit={handleSaveEdit}
              onDeleteReply={handleDeleteReply}
            />
          )}
        </Box>
      </Box>

      <Menu
        open={Boolean(contextMenu)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        sx={{
          "& .MuiPaper-root": {
            maxHeight: "300px",
          },
        }}
      >
        <MenuItem onClick={handleAddHighlight}>
          <CommentIcon sx={{ mr: 1 }} />
          Add Comment
        </MenuItem>
      </Menu>

      <CommentDialog
        open={Boolean(showCommentDialog)}
        onClose={() => {
          setShowCommentDialog(false);
          setSelectedText("");
          setComment("");
          setSelectionPosition(null);
        }}
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
