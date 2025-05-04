import React from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const CommentsPanel = ({
  highlights,
  currentPage,
  selectedHighlight,
  comments,
}) => {
  const filteredHighlights = highlights.filter(
    (highlight) => highlight.pageIndex === currentPage - 1
  );

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
        Comments
      </Typography>
      {filteredHighlights.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No comments on this page
        </Typography>
      ) : (
        <List>
          {filteredHighlights.map((highlight) => (
            <React.Fragment key={highlight.id}>
              <ListItem
                sx={{
                  backgroundColor:
                    selectedHighlight?.id === highlight.id
                      ? "rgba(139, 95, 52, 0.1)"
                      : "transparent",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#8B5F34", fontWeight: "bold" }}
                    >
                      {highlight.professor?.username || "Professor"}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          backgroundColor: highlight.highlight_color,
                          p: 0.5,
                          borderRadius: 0.5,
                          mb: 1,
                        }}
                      >
                        {highlight.content.text}
                      </Typography>
                      {highlight.comments.length > 0 && (
                        <List sx={{ pl: 2 }}>
                          {highlight.comments.map((comment, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "text.secondary" }}
                                  >
                                    {comment.comment_text}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default CommentsPanel;
