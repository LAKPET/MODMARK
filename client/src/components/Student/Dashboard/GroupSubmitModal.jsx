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
import { MDBBtn } from "mdb-react-ui-kit";
const SubmitButton = styled(Button)(({ theme }) => ({
  color: "white",
  backgroundColor: "#754D25",
  fontSize: "0.875rem",
  textTransform: "none",
  borderRadius: "5px",
  padding: "6px 20px",
  "&:hover": {
    backgroundColor: "#754D25",
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
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const inputRef = useRef();

  useEffect(() => {
    // Reset selected members and search query when modal opens
    if (open) {
      setSelectedMembers([]);
      setSearchQuery("");
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

  const handleSubmit = () => {
    if (onSubmit && localFile && selectedMembers.length > 0) {
      onSubmit(selectedMembers);
    } else if (selectedMembers.length === 0) {
      alert("Please select at least one member.");
    }
  };

  // Filter members based on search query
  const filteredMembers = groupMembersData.filter((m) => {
    const personalNum = m.personal_num ? String(m.personal_num) : ""; // แปลง personal_num เป็น string
    const studentId = m.student_id ? String(m.student_id) : ""; // แปลง student_id เป็น string
    return (
      m.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      personalNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
                size="small"
                margin="dense"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{ flex: 1, marginTop: 0 }}
              />
              <TextField
                label="Type"
                fullWidth
                size="small"
                margin="dense"
                value="Group"
                disabled
                style={{ flex: 1, marginTop: 0 }}
              />
            </div>
            <div
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <TextField
                label="Search Member"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "50%" }}
              />
            </div>
            <div style={{ fontWeight: 600, marginTop: 10 }}>Member</div>
            <TableContainer style={{ maxHeight: 200, marginTop: 8 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      padding="checkbox"
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    ></TableCell>
                    <TableCell
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      ID
                    </TableCell>
                    <TableCell
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      Email
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.map((m, idx) => (
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
        <MDBBtn
          outline
          onClick={onClose}
          disabled={uploading}
          style={{
            color: "#CDC9C9",
            borderColor: "#CDC9C9",
          }}
        >
          Cancel
        </MDBBtn>
        <SubmitButton onClick={handleSubmit} disabled={uploading || !localFile}>
          Submit
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
};

export default GroupSubmitModal;
