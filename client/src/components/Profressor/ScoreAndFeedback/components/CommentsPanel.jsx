import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  Box,
  IconButton,
  TextField,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import TurnRightIcon from "@mui/icons-material/TurnRight";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../../../controls/Avatar";

const CommentsPanel = ({
  highlights,
  currentPage,
  onDeleteHighlight,
  replyInputs,
  replyTexts,
  onReplyTextChange,
  onSendReply,
  onToggleReplyInput,
  selectedHighlight,
}) => {
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

  return (
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
                  onClick={() => onDeleteHighlight(highlight)}
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
                  onClick={() => onToggleReplyInput(highlight.id)}
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

                {replyInputs[highlight.id] && (
                  <>
                    {mockupHighlight.replies.map((reply, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mt: 1,
                          pl: 2,
                          borderLeft: "2px solid #ddd",
                        }}
                      >
                        <TurnRightIcon
                          sx={{
                            fontSize: 16,
                            color: "#666",
                            mr: 1,
                            transform: "scaleY(-1)",
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

                    <Box sx={{ mt: 2, width: "100%" }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Reply"
                        value={replyTexts[highlight.id] || ""}
                        onChange={(e) =>
                          onReplyTextChange(highlight.id, e.target.value)
                        }
                        sx={{ mb: 1 }}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              size="small"
                              onClick={() => onSendReply(highlight.id)}
                              sx={{
                                color: "#666",
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
  );
};

export default CommentsPanel;
