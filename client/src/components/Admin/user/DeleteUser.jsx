import React from "react";
import { Modal, Button } from "react-bootstrap";
import { MDBBtn } from "mdb-react-ui-kit";
import { userApi } from "../../../services/userAPI"; // Import the userApi service

export default function DeleteUser({
  show,
  handleClose,
  userId,
  refreshUsers,
}) {
  const handleDelete = async () => {
    try {
      await userApi.deleteUser(userId);
      handleClose();
      refreshUsers();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        console.error("Failed to delete user:", err.response.data.message);
      } else {
        console.error("Failed to delete user", err);
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete User</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
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
