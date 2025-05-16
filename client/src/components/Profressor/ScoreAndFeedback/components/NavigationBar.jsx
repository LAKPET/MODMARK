import React from "react";
import { Paper, Typography, IconButton, Box, Tooltip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate, useParams } from "react-router-dom";

const NavigationBar = ({
  currentPage,
  selectedText,
  onNext,
  onPrevious,
  submissionId,
  assessmentId,
  isFirstSubmission,
  isLastSubmission,
  studentName,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isStudent = localStorage.getItem("UserRole") === "student"; // ตรวจสอบ UserRole

  const handleHome = () => {
    if (isStudent) {
      navigate(`/student/score-feedback/${id}`);
    } else {
      navigate(`/assessment/${id}/allassessmentuser/${assessmentId}`);
    }
  };

  const handlePreviousSubmission = () => {
    if (onPrevious && !isFirstSubmission) {
      // Save any pending changes before navigation
      console.log("Navigating to previous submission...");
      onPrevious();
    }
  };

  const handleNextSubmission = () => {
    if (onNext && !isLastSubmission) {
      // Save any pending changes before navigation
      console.log("Navigating to next submission...");
      onNext();
    }
  };

  return (
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

      {/* Center - Page info and student name */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          margin: "0 auto",
        }}
      >
        {studentName && (
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            Name: {studentName}
          </Typography>
        )}
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
      {!isStudent && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip
            title={
              isFirstSubmission ? "First submission" : "Previous submission"
            }
          >
            <span>
              <IconButton
                onClick={handlePreviousSubmission}
                size="small"
                disabled={isFirstSubmission}
                sx={{
                  color: isFirstSubmission
                    ? "rgba(255, 255, 255, 0.3)"
                    : "#fff",
                  p: 0.5,
                  "&:hover": {
                    backgroundColor: isFirstSubmission
                      ? "transparent"
                      : "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <ArrowBackIosIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            title={isLastSubmission ? "Last submission" : "Next submission"}
          >
            <span>
              <IconButton
                onClick={handleNextSubmission}
                size="small"
                disabled={isLastSubmission}
                sx={{
                  color: isLastSubmission ? "rgba(255, 255, 255, 0.3)" : "#fff",
                  p: 0.5,
                  "&:hover": {
                    backgroundColor: isLastSubmission
                      ? "transparent"
                      : "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
};

export default NavigationBar;
