import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../../../assets/Styles/Assessment/Getassessment.css";

// CircularProgressWithLabel component
function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: "text.secondary" }}
        >
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

const SubmitButton = styled(Button)(({ theme }) => ({
  color: "white",
  backgroundColor: "#8b5f34",
  fontSize: "0.875rem",
  textTransform: "none",
  borderRadius: "5px",
  padding: "6px 20px",
  "&:hover": {
    backgroundColor: "#6f4f2f",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
  },
}));

const ViewButton = styled(Button)({
  color: "white",
  backgroundColor: "#FF9800",
  fontSize: "0.875rem",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#F57C00",
  },
  marginRight: "8px",
});

export default function EditSubmissionModal({
  open,
  onClose,
  submission,
  assessment,
  uploading,
  onSubmit,
  previewUrl,
}) {
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Add state for loading
  const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress
  const [currentFileName, setCurrentFileName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef();

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (submission) {
      fetchSubmissionDetails();

      // Set group name if available
      if (assessment.assignment_type === "group") {
        setGroupName(submission.group_id?.group_name || "");
      }
    }

    // Use provided previewUrl or fetch new one
    if (previewUrl) {
      setLocalPreviewUrl(previewUrl);
    }
  }, [submission, previewUrl]);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      // Get file information
      if (submission.file_url) {
        // Extract filename from URL
        const fileNameFromUrl = submission.file_url.split("/").pop();
        setCurrentFileName(fileNameFromUrl || "Current submission");

        // Fetch preview URL if not provided
        if (!previewUrl) {
          const response = await axios.post(
            `${apiUrl}/submission/pdf/file`,
            { filename: submission.file_url },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data && response.data.fileUrl) {
            setLocalPreviewUrl(response.data.fileUrl);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching file details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      setNewFile(droppedFile);
      simulateUpload(); // Start simulated upload
    }
  };

  const handleBrowse = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      setNewFile(selectedFile);
      simulateUpload(); // Start simulated upload
    }
  };

  const handleDeleteFile = async () => {
    if (!submission || !submission._id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `${apiUrl}/submission/delete/${submission._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("File deleted successfully!");
        setLocalPreviewUrl(""); // ลบ preview URL
        setCurrentFileName(""); // ลบชื่อไฟล์
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete the file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (
      submission &&
      (newFile || (assessment.assignment_type === "group" && groupName))
    ) {
      onSubmit(submission._id, newFile, groupName);
    } else if (
      !newFile &&
      assessment.assignment_type === "group" &&
      !groupName
    ) {
      alert("Please provide a new file or update the group name");
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300); // Simulate upload progress
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <span className="fw-bold fs-4">Edit Submission</span>:{" "}
        <span>{assessment?.assessment_name}</span>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ display: "flex", gap: 32, minHeight: 320 }}>
            {/* File upload area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current && inputRef.current.click()}
              style={{
                flex: 1,
                border: dragActive ? "2px solid #5c90d2" : "1px dashed #ccc",
                background: dragActive ? "#f0f5fa" : "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 250,
                cursor: "pointer",
                transition: "border 0.2s, background 0.2s",
                padding: "20px",
                position: "relative",
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={handleBrowse}
              />

              {localPreviewUrl && !newFile && (
                <div style={{ position: "absolute", top: 10, right: 10 }}>
                  <ViewButton
                    variant="contained"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(localPreviewUrl, "_blank");
                    }}
                  >
                    View File
                  </ViewButton>
                </div>
              )}

              {isUploading ? (
                <CircularProgressWithLabel value={uploadProgress} /> // Show progress with percentage
              ) : newFile ? (
                <div
                  style={{
                    color: "#5c90d2",
                    fontWeight: 500,
                    marginBottom: 8,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  {newFile.name}
                </div>
              ) : currentFileName ? (
                <div
                  style={{
                    color: "#5c90d2",
                    fontWeight: 500,
                    marginBottom: 8,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  {currentFileName}{" "}
                  <DeleteIcon
                    variant="text"
                    color="error"
                    size="small"
                    // startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile();
                    }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: "center", width: "100%" }}>
                  Drag and Drop here
                  <br />
                  or{" "}
                  <div
                    style={{ color: "#5c90d2", textDecoration: "underline" }}
                  >
                    Browse files
                  </div>
                </div>
              )}

              <div
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  marginTop: 8,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Accepted File: PDF file
              </div>
            </div>

            {/* Group info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 20,
                  marginBottom: 16,
                }}
              >
                {assessment?.assessment_name}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                {assessment.assignment_type === "group" && (
                  <TextField
                    label="Group Name"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    style={{ flex: 1, marginTop: 0 }}
                  />
                )}

                <TextField
                  label="Type"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={
                    assessment.assignment_type === "group"
                      ? "Group"
                      : "Individual"
                  }
                  disabled
                  style={{ flex: 1, marginTop: 0 }}
                />
              </div>

              {newFile && (
                <div style={{ marginTop: 20 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    New File Selected:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                    }}
                  >
                    <Typography>{newFile.name}</Typography>
                  </Box>
                </div>
              )}

              <Typography
                variant="body2"
                sx={{ mt: 3, color: "text.secondary" }}
              >
                {assessment.assignment_type === "group"
                  ? "You can update your group name or upload a new file"
                  : "Upload a new file to replace your current submission"}
              </Typography>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isUploading}
          sx={{
            color: "#CDC9C9",
            borderColor: "#CDC9C9",
          }}
        >
          Cancel
        </Button>
        <SubmitButton
          onClick={handleSubmit}
          disabled={
            isUploading ||
            (!newFile &&
              (!groupName || groupName === submission?.group_id?.group_name))
          }
        >
          {isUploading ? "Uploading..." : "Update Submission"}
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
}
