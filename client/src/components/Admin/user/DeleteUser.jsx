import React from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";

export default function DeleteUser({
  show,
  handleClose,
  userId,
  refreshUsers,
}) {
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${apiUrl}/users/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
