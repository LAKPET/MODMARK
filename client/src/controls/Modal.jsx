import * as React from "react";
import Box from "@mui/material/Box";
import { Button } from "react-bootstrap";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import HighlightOffIcon from "@mui/icons-material/HighlightOff"; // Icon สำหรับ error
import TaskAltIcon from "@mui/icons-material/TaskAlt"; // Icon สำหรับ success
import "../styles/Modal.css";

export default function ModalComponent({
  open,
  handleClose,
  title,
  description,
  type, // เพิ่ม prop สำหรับกำหนดประเภท (error หรือ success)
}) {
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
      <Box className="modal-box">
        {/* แสดง Icon ตามประเภท */}
        <div className="text-center mb-3">
          {type === "error" ? (
            <HighlightOffIcon style={{ fontSize: "5.5rem", color: "red" }} />
          ) : (
            <TaskAltIcon style={{ fontSize: "6rem", color: "green" }} />
          )}
        </div>
        <Typography
          id="modal-title"
          variant="h5"
          component="h2"
          className="text-center "
        >
          {title}
        </Typography>
        <Typography sx={{ mt: 2 }} className="text-center">
          {description}
        </Typography>
        <div className="button-layout">
          <Button className="mt-3 custom-btn" onClick={handleClose}>
            done
          </Button>
        </div>
      </Box>
    </Modal>
  );
}
