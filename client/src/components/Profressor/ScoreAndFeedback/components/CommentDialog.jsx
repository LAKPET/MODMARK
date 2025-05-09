import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Box,
  IconButton,
} from "@mui/material";
import { Button } from "react-bootstrap";

import { MDBBtn } from "mdb-react-ui-kit";
const CommentDialog = ({
  open,
  onClose,
  selectedText,
  comment,
  onCommentChange,
  onAddComment,
  highlightColors,
  selectedColor,
  onColorSelect,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Comment</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Selected Text:
        </Typography>
        <Typography
          variant="body2"
          sx={{
            backgroundColor: selectedColor,
            p: 1,
            borderRadius: 1,
            mb: 2,
          }}
        >
          {selectedText}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Highlight Color:
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {highlightColors.map((color) => (
              <IconButton
                key={color.value}
                onClick={() => onColorSelect(color.value)}
                sx={{
                  backgroundColor: color.value,
                  borderRadius: "50%",
                  border:
                    selectedColor === color.value
                      ? "2px solid rgb(116, 115, 115)"
                      : "none",
                  "&:hover": {
                    backgroundColor: color.value,
                  },
                  width: 36,
                  height: 36,
                }}
              >
                <div style={{ width: 24, height: 24 }} />
              </IconButton>
            ))}
          </Box>
        </Box>
        <TextField
          autoFocus
          margin="dense"
          label="Comment"
          fullWidth
          multiline
          rows={3}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <MDBBtn
          outline
          onClick={onClose}
          style={{
            color: "#CDC9C9",
            borderColor: "#CDC9C9",
          }}
        >
          Cancel
        </MDBBtn>
        <Button
          onClick={onAddComment}
          // variant="contained"
          // disabled={!comment.trim()}
          className="custom-btn"
        >
          Add Comment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;
