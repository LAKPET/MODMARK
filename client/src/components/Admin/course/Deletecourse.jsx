import axios from "axios";
import { Modal, Button } from "react-bootstrap";

function DeleteCourse({ show, handleClose, Id, refreshCourses }) {
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${apiUrl}/section/delete/${Id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleClose();
      refreshCourses();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        console.error("Failed to delete course:", err.response.data.message);
      } else {
        console.error("Failed to delete course", err);
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Course</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this course?</Modal.Body>
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

export default DeleteCourse;
