import axios from "axios";
import { Modal, Button } from "react-bootstrap";

function DeleteAssessment({
  show,
  handleClose,
  assessmentId,
  refreshAssessments,
}) {
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    try {
      console.log("Attempting to delete assessment with ID:", assessmentId); // Add this line
      const token = localStorage.getItem("authToken");
      await axios.delete(`${apiUrl}/assessment/delete/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Assessment deleted successfully"); // Add this line
      handleClose();
      refreshAssessments();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        console.error(
          "Failed to delete assessment:",
          err.response.data.message
        );
      } else {
        console.error("Failed to delete assessment", err);
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Assessment</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this assessment?</Modal.Body>
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

export default DeleteAssessment;
