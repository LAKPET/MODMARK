import * as React from "react";
import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
import { Button } from "react-bootstrap";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import "../styles/Modal.css";

export default function ModalComponent({
  open,
  handleClose,
  title,
  description,
}) {
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
      <Box className="modal-box">
        <Typography id="modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Typography sx={{ mt: 2 }}>{description}</Typography>
        <div className="button-layout">
          <Button className="mt-3 custom-btn" onClick={handleClose}>
            ตกลง
          </Button>
        </div>
      </Box>
    </Modal>
  );
}
