import React, { useState } from "react";
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
