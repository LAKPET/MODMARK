import { Modal, Button } from "react-bootstrap";
import { MDBBtn } from "mdb-react-ui-kit";
import courseAPI from "../../../services/courseAPI";

function DeleteCourse({ show, handleClose, Id, refreshCourses }) {
  const handleDelete = async () => {
    try {
      await courseAPI.deleteCourse(Id);
      handleClose();
      refreshCourses();
    } catch (err) {
      if (err.response?.data?.message) {
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

export default DeleteCourse;
