import React from "react";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Tooltip from "@mui/material/Tooltip";
import { formatDateTime } from "../../../../utils/FormatDateTime";
import { sortAssessments } from "../../../../utils/SortAssessment";
import SubmissionActions from "./SubmissionActions";
import { GroupIcon } from "./StyledComponents";

const AssessmentTable = ({
  assessments,
  sectionId,
  submittedAssessments,
  sortColumn,
  sortOrder,
  handleSort,
  onFileChange,
  onEditSubmission,
  onViewSubmission,
  onOpenGroupModal,
  uploading,
  uploadingAssessmentId,
  loadingPreview,
}) => {
  const navigate = useNavigate();
  const sortedAssessments = sortAssessments(assessments, sortColumn, sortOrder);

  return (
    <MDBTable className="table-hover">
      <MDBTableHead>
        <tr className="fw-bold">
          <th
            onClick={() => handleSort("assessment_name")}
            className="sortable"
          >
            Assessment Name <SwapVertIcon />
          </th>
          <th onClick={() => handleSort("publish_date")} className="sortable">
            Publish Date <SwapVertIcon />
          </th>
          <th onClick={() => handleSort("due_date")} className="sortable">
            Due Date <SwapVertIcon />
          </th>
          <th>Action</th>
        </tr>
      </MDBTableHead>

      <MDBTableBody>
        {sortedAssessments.length > 0 ? (
          sortedAssessments.map((assessment) => {
            // Check if this assessment has a submission
            const hasSubmission =
              submittedAssessments[assessment._id] !== undefined;

            // Check if this is a group member's submission
            const isGroupMemberSubmission =
              hasSubmission &&
              submittedAssessments[assessment._id].isGroupMemberSubmission;

            return (
              <tr key={assessment._id}>
                <td
                  className="clickable"
                  onClick={() =>
                    navigate(
                      `/student/assessment/${sectionId}/assessment-details/${assessment._id}`
                    )
                  }
                >
                  <div className="d-flex align-items-center">
                    {assessment.assessment_name}
                    {isGroupMemberSubmission && (
                      <Tooltip
                        title={`Submitted by ${submittedAssessments[assessment._id].student_id.first_name} ${submittedAssessments[assessment._id].student_id.last_name}`}
                      >
                        <GroupIcon className="ms-1 text-secondary" />
                      </Tooltip>
                    )}
                  </div>
                </td>
                <td>{formatDateTime(assessment.publish_date)}</td>
                <td>{formatDateTime(assessment.due_date)}</td>
                <td>
                  <SubmissionActions
                    assessment={assessment}
                    hasSubmission={hasSubmission}
                    isGroupMemberSubmission={isGroupMemberSubmission}
                    uploading={uploading}
                    uploadingAssessmentId={uploadingAssessmentId}
                    loadingPreview={loadingPreview}
                    onEditSubmission={onEditSubmission}
                    onViewSubmission={onViewSubmission}
                    onOpenGroupModal={onOpenGroupModal}
                    onFileChange={onFileChange}
                  />
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="4" className="text-center">
              No assessments found
            </td>
          </tr>
        )}
      </MDBTableBody>
    </MDBTable>
  );
};

export default AssessmentTable;
