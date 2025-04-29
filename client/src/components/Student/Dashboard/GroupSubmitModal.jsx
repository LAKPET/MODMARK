import React, { useRef, useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const SubmitButton = styled(Button)(({ theme }) => ({
  color: "white",
  backgroundColor: "#F27171",
  fontSize: "0.875rem",
  textTransform: "none",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "#d16060",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
  },
}));

const GroupSubmitModal = ({
  open,
  onClose,
  assessment,
  file,
  groupName,
  setGroupName,
  groupMembersData,
  uploading,
  onSubmit,
  setGroupFile,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [localFile, setLocalFile] = useState(file || null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    // Reset selected members when modal opens
    if (open) {
      setSelectedMembers([]);
    }
  }, [open]);

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
      setLocalFile(droppedFile);
      setGroupFile && setGroupFile(droppedFile);
    }
  };
  const handleBrowse = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      setLocalFile(selectedFile);
      setGroupFile && setGroupFile(selectedFile);
    }
  };

  const handleCheck = (student_id) => {
    setSelectedMembers((prev) =>
      prev.includes(student_id)
        ? prev.filter((id) => id !== student_id)
        : [...prev, student_id]
    );
  };

  // ส่งเฉพาะ user_id ที่เลือกไปตอน submit
  const handleSubmit = () => {
    if (onSubmit && localFile && selectedMembers.length > 0) {
      onSubmit(selectedMembers);
    } else if (selectedMembers.length === 0) {
      alert("Please select at least one member.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Submit Assessment</DialogTitle>
      <DialogContent>
        <div style={{ display: "flex", gap: 32, minHeight: 320 }}>
          {/* File upload area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current && inputRef.current.click()}
            style={{
              flex: 1,
              border: dragActive ? "2px solid #8B5F34" : "1px dashed #ccc",
              background: dragActive ? "#f7f3ef" : "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 250,
              cursor: "pointer",
              transition: "border 0.2s, background 0.2s",
              padding: "20px",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={handleBrowse}
            />
            <span style={{ fontSize: 80, marginBottom: 16 }}>
              <FileUploadIcon sx={{ fontSize: 100 }} />
            </span>
            {localFile ? (
              <div
                style={{
                  color: "#8B5F34",
                  fontWeight: 500,
                  marginBottom: 8,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                {localFile.name}
              </div>
            ) : (
              <div style={{ textAlign: "center", width: "100%" }}>
                Drag and Drop here
                <br />
                or{" "}
                <div style={{ color: "#8B5F34", textDecoration: "underline" }}>
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
              Accepted File : PDF file
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
              <TextField
                label="Group Name"
                fullWidth
                margin="dense"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{ flex: 1, marginTop: 0 }}
              />
              <TextField
                label="Type"
                fullWidth
                margin="dense"
                value="Group"
                disabled
                style={{ flex: 1, marginTop: 0 }}
              />
            </div>
            <div style={{ marginTop: 8, fontWeight: 600 }}>Member</div>
            <TableContainer style={{ maxHeight: 120, marginTop: 8 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupMembersData.map((m, idx) => (
                    <TableRow key={m.student_id || idx}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedMembers.includes(m.student_id)}
                          onChange={() => handleCheck(m.student_id)}
                        />
                      </TableCell>
                      <TableCell>{m.personal_num || "-"}</TableCell>
                      <TableCell>
                        {m.first_name} {m.last_name}
                      </TableCell>
                      <TableCell>{m.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={uploading}>
          Cancel
        </Button>
        <SubmitButton onClick={handleSubmit} disabled={uploading || !localFile}>
          Submit
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
};

export default GroupSubmitModal;
