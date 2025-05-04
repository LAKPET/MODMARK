import React from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";

const ScorePanel = ({ submissionInfo, rubricData }) => {
  if (!submissionInfo) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        overflow: "auto",
        backgroundColor: "#fff",
        borderRadius: 0,
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: "#8B5F34" }}>
        Score & Feedback
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {submissionInfo.assessment_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Submission Date:{" "}
          {new Date(submissionInfo.submitted_at).toLocaleDateString()}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Total Score
        </Typography>
        <Chip
          label={`${submissionInfo.score || "Not graded"}`}
          color="primary"
          sx={{
            backgroundColor: "#8B5F34",
            color: "white",
            fontSize: "1.2rem",
            padding: "0.5rem",
          }}
        />
      </Box>

      {submissionInfo.feedback && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Feedback
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {submissionInfo.feedback}
          </Typography>
        </Box>
      )}

      {rubricData && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Rubric Assessment
          </Typography>
          <List>
            {rubricData.criteria.map((criterion) => {
              const selectedLevel = criterion.levels.find(
                (level) =>
                  level._id === submissionInfo.rubric_scores?.[criterion._id]
              );

              return (
                <React.Fragment key={criterion._id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#8B5F34", fontWeight: "bold" }}
                        >
                          {criterion.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {criterion.description}
                          </Typography>
                          {selectedLevel && (
                            <Chip
                              label={`${selectedLevel.name} (${selectedLevel.score} points)`}
                              color="primary"
                              sx={{
                                backgroundColor: "#8B5F34",
                                color: "white",
                              }}
                            />
                          )}
                          {selectedLevel?.feedback && (
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, color: "text.secondary" }}
                            >
                              {selectedLevel.feedback}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default ScorePanel;
