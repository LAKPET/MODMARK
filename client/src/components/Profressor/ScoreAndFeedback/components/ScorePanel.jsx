import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import Selection from "../../../../controls/Selection";
import ModalComponent from "../../../../controls/Modal";
import { useNavigate, useParams } from "react-router-dom";

const ScorePanel = ({
  submissionId,
  assessmentId,
  rubric,
  scores,
  onScoreChange,
  onSubmitScores,
  apiUrl,
  submissionInfo,
  gradingStatus,
}) => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const currentProfessorId = localStorage.getItem("UserId");

  // Add useEffect to log the comparison
  useEffect(() => {
    console.log("Current Professor ID:", currentProfessorId);
    console.log("Submission Info:", submissionInfo);
    console.log("Grading Status By:", submissionInfo?.grading_status_by);

    if (submissionInfo?.grading_status_by) {
      const hasPermission = submissionInfo.grading_status_by.some(
        (status) => status.professor_id === currentProfessorId
      );
      console.log("Has Grading Permission:", hasPermission);

      // Log each professor ID in the array for comparison
      submissionInfo.grading_status_by.forEach((status, index) => {
        console.log(`Professor ${index + 1} ID:`, status.professor_id);
        console.log(
          `Matches current user:`,
          status.professor_id === currentProfessorId
        );
        console.log(
          `Type comparison:`,
          typeof status.professor_id,
          typeof currentProfessorId
        );
      });
    } else {
      console.log("No grading_status_by array found in submissionInfo");
    }
  }, [currentProfessorId, submissionInfo]);

  // Check if the current professor has permission to grade
  const hasGradingPermission = submissionInfo?.grading_status_by?.some(
    (status) => status.professor_id === currentProfessorId
  );

  const handleScoreChange = (criterionId, levelId) => {
    const selectedLevel = rubric.criteria
      .find((c) => c._id === criterionId)
      .levels.find((l) => l._id === levelId);

    onScoreChange(criterionId, selectedLevel.score);
  };
  const { id } = useParams();
  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate(`/assessment/${id}/allassessmentuser/${assessmentId}`);
  };

  const handleSubmitScores = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${apiUrl}/score/assessment/submit`,
        {
          assessment_id: submissionInfo.assessment_id,
          submission_id: submissionId,
          student_id: submissionInfo.student_id,
          group_id: submissionInfo.group_id,
          scores: scores,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error submitting scores:", err);
      // Handle error (e.g., show error message)
    }
  };

  // Calculate total score
  const calculateTotalScore = () => {
    if (!rubric || !scores) return { total: 0, maxPossible: 0 };

    let total = 0;
    let maxPossible = 0;

    rubric.criteria.forEach((criterion) => {
      maxPossible += criterion.weight;
      if (scores[criterion._id]) {
        total += parseFloat(scores[criterion._id]);
      }
    });

    return { total, maxPossible };
  };

  const { total, maxPossible } = calculateTotalScore();

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
          borderRadius: 0,
          m: 0,
          p: 2,
          overflow: "auto",
          borderLeft: "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "#8B5F34" }}>
            Scoring
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#666" }}>
            Assessment: {submissionInfo?.assessment_name}
          </Typography>
        </Box>

        {gradingStatus === "already" && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This assessment has already been graded. You can update the scores
            if needed.
          </Alert>
        )}

        {!hasGradingPermission && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You don't have permission to grade this assessment.
          </Alert>
        )}

        {rubric?.criteria.map((criterion) => (
          <Box key={criterion._id} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
              {criterion.name} (Weight: {criterion.weight})
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: "#666" }}>
              {criterion.description}
            </Typography>

            <Selection
              options={criterion.levels}
              value={
                scores[criterion._id]
                  ? criterion.levels.find(
                      (l) => l.score === scores[criterion._id]
                    )?._id
                  : ""
              }
              onChange={(event, newValue) =>
                handleScoreChange(criterion._id, newValue)
              }
              getOptionLabel={(level) =>
                `Level ${level.level} (${level.score} points)`
              }
              getOptionValue={(level) => level._id}
              getOptionDescription={(level) => level.description}
              sortBy={(a, b) => b.score - a.score}
            />

            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "#8B5F34" }}>
            Total Score: {total} / {maxPossible}
          </Typography>
          {hasGradingPermission && (
            <IconButton
              onClick={handleSubmitScores}
              sx={{
                backgroundColor: "#8B5F34",
                color: "white",
                "&:hover": {
                  backgroundColor: "#6B4A2A",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      <ModalComponent
        open={showSuccessModal}
        handleClose={handleModalClose}
        title="Success"
        description="Scores submitted successfully."
      />
    </>
  );
};

export default ScorePanel;
