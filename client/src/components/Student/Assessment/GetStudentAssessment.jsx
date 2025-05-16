import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

// Import custom components
import AssessmentHeader from "./components/AssessmentHeader";
import AssessmentTable from "./components/AssessmentTable";
import GroupSubmitModal from "./components/GroupSubmitModal";
import EditSubmissionModal from "./components/EditsubmissionModal";

// Import custom hook for data handling
import useAssessmentData from "../Assessment/hooks/useAssessmentData";

export default function GetStudentAssessment() {
  const { id: sectionId } = useParams();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalAssessment, setGroupModalAssessment] = useState(null);
  const [groupFile, setGroupFile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupMembersData, setGroupMembersData] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);

  // Use the custom hook to handle all data and actions
  const {
    courseDetails,
    assessments,
    loading,
    error,
    uploading,
    submittedAssessments,
    uploadingAssessmentId,
    loadingPreview,
    sortColumn,
    sortOrder,
    handleSort,
    handleFileChange,
    handleGroupSubmit: submitGroup,
    handleEditSubmission,
    handleUpdateSubmission,
    handleViewSubmission,
    fetchPreviewUrl,
  } = useAssessmentData(sectionId);

  // Handle opening the group modal and fetching members
  const onOpenGroupModal = async (assessment) => {
    setGroupModalAssessment(assessment);
    setGroupFile(null);
    setGroupModalOpen(true);

    try {
      setGroupLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}/section/students/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setGroupMembersData(data);
    } catch (error) {
      console.error("Error fetching group members:", error);
    } finally {
      setGroupLoading(false);
    }
  };

  // Handle opening the edit submission modal
  const onEditSubmission = async (assessmentId) => {
    const result = await handleEditSubmission(assessmentId);
    if (result) {
      setCurrentSubmission(result.submission);
      setCurrentAssessment(result.assessment);
      setEditModalOpen(true);
    }
  };

  // Handle group submission
  const onGroupSubmit = async (selectedMembers) => {
    const success = await submitGroup(
      groupFile,
      groupName,
      selectedMembers,
      groupModalAssessment
    );

    if (success) {
      setGroupModalOpen(false);
    }
  };

  // Handle update submission from edit modal
  const onUpdateSubmission = async (submissionId, file, groupName = "") => {
    const success = await handleUpdateSubmission(submissionId, file, groupName);
    if (success) {
      setEditModalOpen(false);
    }
  };

  if (loading) {
    return (
      <Backdrop
        sx={(theme) => ({ color: "#8B5F34", zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <Container className="mt-4">
      <AssessmentHeader courseDetails={courseDetails} />

      <AssessmentTable
        assessments={assessments}
        sectionId={sectionId}
        submittedAssessments={submittedAssessments}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        handleSort={handleSort}
        onFileChange={handleFileChange}
        onEditSubmission={onEditSubmission}
        onViewSubmission={handleViewSubmission}
        onOpenGroupModal={onOpenGroupModal}
        uploading={uploading}
        uploadingAssessmentId={uploadingAssessmentId}
        loadingPreview={loadingPreview}
      />

      {groupModalOpen && (
        <GroupSubmitModal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          assessment={groupModalAssessment}
          file={groupFile}
          groupName={groupName}
          setGroupName={setGroupName}
          groupMembersData={groupMembersData}
          uploading={uploading}
          onSubmit={onGroupSubmit}
          setGroupFile={setGroupFile}
        />
      )}

      {editModalOpen && currentSubmission && currentAssessment && (
        <EditSubmissionModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          submission={currentSubmission}
          assessment={currentAssessment}
          uploading={uploading}
          onSubmit={onUpdateSubmission}
          previewUrl={currentSubmission.previewUrl}
        />
      )}
    </Container>
  );
}
