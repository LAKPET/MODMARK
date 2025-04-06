import React from "react";
import { Paper, Typography, IconButton, Box } from "@mui/material";
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
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const handleHome = () => {
    navigate(`/assessment/${id}/allassessmentuser/${assessmentId}`);
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
  );
};

export default NavigationBar;
