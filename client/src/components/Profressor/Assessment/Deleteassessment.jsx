import { Modal, Button } from "react-bootstrap";
import { MDBBtn } from "mdb-react-ui-kit";
import assessmentAPI from "../../../services/assessmentAPI";

function DeleteAssessment({
  show,
  handleClose,
  assessmentId,
  refreshAssessments,
}) {
  const handleDelete = async () => {
    try {
      console.log("Attempting to delete assessment with ID:", assessmentId);
      await assessmentAPI.deleteAssessment(assessmentId);
      console.log("Assessment deleted successfully");
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

export default DeleteAssessment;
