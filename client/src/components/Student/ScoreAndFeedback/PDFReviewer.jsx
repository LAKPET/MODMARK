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
  isFirstSubmission,
  isLastSubmission,
}) => {
  const [highlights, setHighlights] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [comments, setComments] = useState({});
  const [submissionData, setSubmissionData] = useState(null);
  const [rubricData, setRubricData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [showScorePanel, setShowScorePanel] = useState(false);
  const [activePanel, setActivePanel] = useState("scores");

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRubricData = async () => {
      try {
        if (!submissionInfo?.assessment_id) {
          console.log("No assessment ID available");
          return;
        }

        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${apiUrl}/rubric/${submissionInfo.assessment_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRubricData(response.data);
      } catch (err) {
        console.error("Error fetching rubric:", err);
        setError("Error loading rubric data");
      } finally {
        setLoading(false);
      }
    };

    fetchRubricData();
  }, [submissionInfo?.assessment_id, apiUrl]);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        if (!submissionId) {
          console.log("No submission ID available");
          return;
        }

        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${apiUrl}/annotation/submission/${submissionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const formattedHighlights = response.data.map((annotation) => ({
          id: annotation._id,
          content: { text: annotation.content },
          pageIndex: annotation.page_index,
          comment: annotation.comment,
          highlight_color: annotation.highlight_color || "#ffeb3b",
          professor: annotation.professor,
        }));

        setHighlights(formattedHighlights);
      } catch (err) {
        console.error("Error fetching annotations:", err);
        setError("Error loading annotations");
      }
    };

    fetchAnnotations();
  }, [submissionId, apiUrl]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!fileUrl) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>No PDF file available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <NavigationBar
        currentPage={currentPage}
        onNext={onNext}
        onPrevious={onPrevious}
        submissionId={submissionId}
        assessmentId={assessmentId}
        isFirstSubmission={isFirstSubmission}
        isLastSubmission={isLastSubmission}
        studentName={
          submissionInfo?.student_info
            ? `${submissionInfo.student_info.first_name} ${submissionInfo.student_info.last_name}`
            : null
        }
      />

      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <PDFViewer
          fileUrl={fileUrl}
          currentPage={currentPage}
          scale={scale}
          onPageChange={setCurrentPage}
          onHighlightClick={setSelectedHighlight}
          highlights={highlights}
          showCommentsPanel={showCommentsPanel}
          showScorePanel={showScorePanel}
          onPanelChange={setActivePanel}
        />

        {showCommentsPanel && (
          <CommentsPanel
            highlights={highlights}
            selectedHighlight={selectedHighlight}
            onHighlightClick={setSelectedHighlight}
          />
        )}

        {showScorePanel && (
          <ScorePanel
            submissionId={submissionId}
            assessmentId={assessmentId}
            rubric={rubricData}
            submissionInfo={submissionInfo}
          />
        )}
      </Box>
    </Box>
  );
};

export default PDFReviewer;
