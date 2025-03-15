import React from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { MDBBtn } from "mdb-react-ui-kit";
export default function DeleteRubric({
  show,
  handleClose,
  rubricId,
  onDelete,
}) {
  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`http://localhost:5001/rubric/delete/${rubricId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete();
      handleClose();
    } catch (err) {
      console.error("Error deleting rubric:", err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Rubric</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this rubric?</Modal.Body>
      <Modal.Footer>
        <MDBBtn
          outline
          onClick={handleClose}
          style={{
            color: "#CDC9C9",
            borderColor: "#CDC9C9",
          }}
        >
          Cancel
        </MDBBtn>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
