import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Tooltip from "@mui/material/Tooltip";
import {
  StyledButton,
  ViewButton,
  GroupButton,
  VisuallyHiddenInput,
  GroupIcon,
} from "./StyledComponents";

const SubmissionActions = ({
  assessment,
  hasSubmission,
  isGroupMemberSubmission,
  uploading,
  uploadingAssessmentId,
  loadingPreview,
  onEditSubmission,
  onViewSubmission,
  onOpenGroupModal,
  onFileChange,
}) => {
  return (
    <div className="d-flex align-items-center">
      {hasSubmission ? (
        <>
          <StyledButton
            variant="contained"
            isSubmitted={true}
            onClick={() => onEditSubmission(assessment._id)}
            disabled={uploading}
          >
            {isGroupMemberSubmission ? "Edit Submission" : "Edit Submission"}
          </StyledButton>

          <ViewButton
            variant="contained"
            onClick={() => onViewSubmission(assessment._id)}
            disabled={loadingPreview === assessment._id || uploading}
          >
            {loadingPreview === assessment._id ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </ViewButton>
        </>
      ) : assessment.assignment_type === "group" ? (
        <GroupButton
          variant="contained"
          disabled={uploading}
          onClick={() => onOpenGroupModal(assessment)}
        >
          Create Group
        </GroupButton>
      ) : (
        <StyledButton
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          isSubmitted={false}
          disabled={uploading}
        >
          {uploadingAssessmentId === assessment._id
            ? "Uploading..."
            : "Submission"}
          <VisuallyHiddenInput
            type="file"
            onChange={(e) => onFileChange(e, assessment._id)}
            accept=".pdf"
          />
        </StyledButton>
      )}
    </div>
  );
};

export default SubmissionActions;
