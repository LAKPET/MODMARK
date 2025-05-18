import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  Box,
  IconButton,
  TextField,
  Divider,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";
import TurnRightIcon from "@mui/icons-material/TurnRight";
import EditIcon from "@mui/icons-material/Edit";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../../../controls/Avatar";
import axios from "axios";
import { formatDateTime } from "../../../../utils/FormatDateTime";

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
  comments,
  onSaveEdit,
  onDeleteReply,
}) => {
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  const currentUserId = localStorage.getItem("UserId");
  const userRole = localStorage.getItem("UserRole"); // Get user role
  const currentUsername = localStorage.getItem("Username"); // Get the logged-in user's username

  const handleEditReply = (reply) => {
    setEditingReply(reply._id);
    setEditReplyText(reply.comment_text);
  };

  const handleCancelEdit = () => {
    setEditingReply(null);
    setEditReplyText("");
  };

  const handleSaveEdit = async (highlightId, commentId, replyId) => {
    if (!editReplyText.trim()) return;

    try {
      await onSaveEdit(highlightId, commentId, replyId, editReplyText.trim());

      // Reset editing state
      setEditingReply(null);
      setEditReplyText("");
    } catch (error) {
      console.error("Error updating reply:", error);
    }
  };

  const handleDeleteReply = async (highlightId, replyId) => {
    try {
      await onDeleteReply(highlightId, replyId);
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  const isCurrentUserReply = (reply) => {
    return reply.user_id?._id === currentUserId;
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
                <Box
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    display: "flex",
                    gap: 1, // Add spacing between icons
                  }}
                >
                  {/* Reply icon - always visible */}
                  <IconButton
                    size="small"
                    onClick={() => onToggleReplyInput(highlight.id)}
                    sx={{
                      color: "#666",
                      "&:hover": {
                        color: "#1976d2",
                      },
                    }}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>

                  {/* Delete icon - visible only if the logged-in user is the creator */}
                  {highlight.professor?.username === currentUsername && (
                    <IconButton
                      size="small"
                      onClick={() => onDeleteHighlight(highlight)}
                      sx={{
                        color: "#666",
                        "&:hover": {
                          color: "#d32f2f",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
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
                    sx={{
                      ...stringAvatar(
                        highlight.professor?.username || "Unknown"
                      ).sx,
                      width: 32,
                      height: 32,
                      fontSize: "0.875rem",
                    }}
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
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <span>{highlight.professor?.username}</span>
                        {/* Always show reply count badge if there are replies */}
                        {comments[highlight.id] &&
                          comments[highlight.id][0]?.replies &&
                          comments[highlight.id][0].replies.length > 0 && (
                            <Box
                              sx={{
                                ml: 1,
                                backgroundColor: "#e0e0e0",
                                borderRadius: "10px",
                                px: 1,
                                py: 0.2,
                                fontSize: "0.75rem",
                                color: "#666",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              +{comments[highlight.id][0].replies.length}
                            </Box>
                          )}
                      </Box>
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

                {/* Only show replies section if replyInputs[highlight.id] is explicitly true */}
                {replyInputs[highlight.id] === true && (
                  <>
                    {comments[highlight.id] &&
                      comments[highlight.id].map((comment) => (
                        <React.Fragment key={comment._id}>
                          {/* Only display replies, not the parent comment text */}
                          {comment.replies && comment.replies.length > 0 && (
                            <Box sx={{ mt: 2, mb: 1 }}>
                              {comment.replies.map((reply) => (
                                <Box
                                  key={reply._id}
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    mt: 1,
                                    pl: 2,
                                    borderLeft: "2px solid #ddd",
                                    opacity: reply.isTemp ? 0.7 : 1,
                                    position: "relative",
                                    "&:hover .reply-actions": {
                                      opacity: 1,
                                    },
                                  }}
                                >
                                  {reply.isTemp && (
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        top: -8,
                                        right: -8,
                                        backgroundColor: "#f0f0f0",
                                        borderRadius: "50%",
                                        width: 16,
                                        height: 16,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.6rem",
                                        color: "#666",
                                        border: "1px solid #ddd",
                                      }}
                                    >
                                      P
                                    </Box>
                                  )}
                                  <TurnRightIcon
                                    sx={{
                                      fontSize: 16,
                                      color: "#666",
                                      mr: 1,
                                      transform: "scaleY(-1)",
                                      mt: 0.5,
                                    }}
                                  />
                                  <Box sx={{ width: "100%" }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 0.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          width: "100%",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Avatar
                                            {...stringAvatar(
                                              reply.user_id?.username ||
                                                "Unknown"
                                            )}
                                            sx={{
                                              ...stringAvatar(
                                                reply.user_id?.username ||
                                                  "Unknown"
                                              ).sx,
                                              width: 24,
                                              height: 24,
                                              fontSize: "0.75rem",
                                              mr: 1,
                                            }}
                                          />
                                          <Typography
                                            variant="subtitle2"
                                            sx={{
                                              fontWeight: "bold",
                                              color: "#666",
                                              mr: 1,
                                            }}
                                          >
                                            {reply.user_id?.username ||
                                              "Unknown"}
                                          </Typography>
                                        </Box>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              color: "#999",
                                              mr: 1,
                                            }}
                                          >
                                            {formatDateTime(reply.created_at)}
                                          </Typography>

                                          {/* Edit and Delete icons - only visible for current user's replies */}
                                          {isCurrentUserReply(reply) && (
                                            <Box
                                              className="reply-actions"
                                              sx={{
                                                display: "flex",
                                                opacity: 0,
                                                transition: "opacity 0.2s",
                                              }}
                                            >
                                              <Tooltip title="Edit reply">
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    handleEditReply(reply)
                                                  }
                                                  sx={{
                                                    color: "#666",
                                                    p: 0.5,
                                                    "&:hover": {
                                                      color: "#1976d2",
                                                    },
                                                  }}
                                                >
                                                  <EditIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Delete reply">
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    handleDeleteReply(
                                                      highlight.id,
                                                      reply._id
                                                    )
                                                  }
                                                  sx={{
                                                    color: "#666",
                                                    p: 0.5,
                                                    "&:hover": {
                                                      color: "#d32f2f",
                                                    },
                                                  }}
                                                >
                                                  <DeleteIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    </Box>

                                    {/* Show edit field or reply text */}
                                    {editingReply === reply._id ? (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          mb: 1,
                                        }}
                                      >
                                        <TextField
                                          fullWidth
                                          size="small"
                                          value={editReplyText}
                                          onChange={(e) =>
                                            setEditReplyText(e.target.value)
                                          }
                                          sx={{ mr: 1 }}
                                          InputProps={{
                                            endAdornment: (
                                              <Box sx={{ display: "flex" }}>
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    handleSaveEdit(
                                                      highlight.id,
                                                      comment._id,
                                                      reply._id
                                                    )
                                                  }
                                                  sx={{
                                                    color: "#1976d2",
                                                  }}
                                                >
                                                  <SendIcon fontSize="small" />
                                                </IconButton>
                                              </Box>
                                            ),
                                          }}
                                        />
                                      </Box>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "#666",
                                          mb: 1,
                                        }}
                                      >
                                        {reply.comment_text}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </React.Fragment>
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
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSendReply(highlight.id);
                              }}
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
