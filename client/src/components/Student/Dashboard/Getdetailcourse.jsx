import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import "../../../assets/Styles/Course/Getcourse.css";
import SegmentIcon from "@mui/icons-material/Segment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TuneIcon from "@mui/icons-material/Tune";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoIcon from "@mui/icons-material/Info";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
// Import styled components
import {
  StyledButton,
  ViewButton,
  GroupButton,
  VisuallyHiddenInput,
  GroupIcon,
} from "../Assessment/components/StyledComponents";

// Import components for assessment submissions
import GroupSubmitModal from "../Assessment/components/GroupSubmitModal";
import EditSubmissionModal from "../Assessment/components/EditsubmissionModal";

// Import custom hook for assessment data handling
import useAssessmentData from "../Assessment/hooks/useAssessmentData";

const ScoreBar = ({ score, maxScore = 100, label }) => {
  const percentage = (score / maxScore) * 100;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span>{label}</span>
        <span>{score}</span>
      </div>
      <div
        className="score-bar-container"
        style={{
          width: "100%",
          height: "20px",
          backgroundColor: "#e9ecef",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: label === "My Score" ? "#FF6B6B" : "#8B5F34",
            transition: "width 0.3s ease-in-out",
          }}
        />
      </div>
    </div>
  );
};

const CardOptionsMenu = ({
  title,
  cardType,
  onRefresh,
  onExport,
  onFullscreen,
  onFilter,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleClose();
    switch (action) {
      case "refresh":
        onRefresh();
        break;
      case "export":
        onExport();
        break;
      case "fullscreen":
        onFullscreen();
        break;
      case "filter":
        onFilter();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Tooltip title="Options">
        <IconButton
          id={`${cardType}-menu-button`}
          aria-controls={open ? `${cardType}-menu` : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          sx={{ minWidth: "auto", p: 1, color: "black" }}
        >
          <SegmentIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id={`${cardType}-menu`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": `${cardType}-menu-button`,
        }}
      >
        <MenuItem disabled sx={{ fontWeight: "bold" }}>
          {title}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction("refresh")}>
          <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
          Refresh data
        </MenuItem>
        {cardType === "assessment" && (
          <MenuItem onClick={() => handleAction("filter")}>
            <TuneIcon fontSize="small" sx={{ mr: 1 }} />
            Filter by status
          </MenuItem>
        )}
        {(cardType === "score" || cardType === "assessment") && (
          <MenuItem onClick={() => handleAction("export")}>
            <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Export data
          </MenuItem>
        )}
        <MenuItem onClick={() => handleAction("fullscreen")}>
          <FullscreenIcon fontSize="small" sx={{ mr: 1 }} />
          Expand view
        </MenuItem>
        <MenuItem onClick={() => handleAction("info")}>
          <InfoIcon fontSize="small" sx={{ mr: 1 }} />
          Help
        </MenuItem>
      </Menu>
    </>
  );
};

export default function CourseDetail() {
  const { id: sectionId } = useParams();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedAssessments, setSelectedAssessments] = useState([]);
  const [displayedAssessments, setDisplayedAssessments] = useState([]);
  const [progressData, setProgressData] = useState({
    total_assessments: 0,
    completed_assessments: 0,
    remaining_assessments: 0,
  });
  const [overallStatistics, setOverallStatistics] = useState({
    max_score: 0,
    min_score: 0,
    mean_score: 0,
    Myscore: 0,
  });
  const [scoreData, setScoreData] = useState([]);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalAssessment, setGroupModalAssessment] = useState(null);
  const [groupFile, setGroupFile] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Use the custom hook for assessment data handling
  const {
    courseDetails,
    assessments,
    loading,
    error: errorMessage,
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
    refreshAssessments,
  } = useAssessmentData(sectionId);

  useEffect(() => {
    fetchProgressData();
    fetchOverallStatistics();
    fetchScoreData();
  }, [sectionId]);

  useEffect(() => {
    setDisplayedAssessments(
      selectedAssessments.length > 0
        ? selectedAssessments.slice(0, 2)
        : assessments.slice(0, 2)
    );
  }, [selectedAssessments, assessments]);

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUrl}/assessment/progress/${sectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgressData(response.data);
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  const fetchOverallStatistics = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUrl}/assessment/statistics/${sectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOverallStatistics({
        ...response.data.overall_statistics,
        Myscore: response.data.Myscore,
      });
    } catch (error) {
      console.error("Error fetching overall statistics:", error);
    }
  };

  const fetchScoreData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${apiUrl}/assessment/scores/${sectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScoreData(response.data);
    } catch (error) {
      console.error("Error fetching score data:", error);
    }
  };

  // Handle opening the group modal
  const onOpenGroupModal = async (assessment) => {
    setGroupModalAssessment(assessment);
    setGroupFile(null);
    setGroupModalOpen(true);

    try {
      const token = localStorage.getItem("authToken");
      const membersRes = await axios.get(
        `${apiUrl}/section/students/${sectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroupModalAssessment(membersRes.data);
    } catch (error) {
      console.error("Error fetching group members:", error);
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
      fetchProgressData();
    }
  };

  // Handle update submission from edit modal
  const onUpdateSubmission = async (submissionId, file, groupName = "") => {
    const success = await handleUpdateSubmission(submissionId, file, groupName);
    if (success) {
      setEditModalOpen(false);
      fetchProgressData();
    }
  };

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);

  const handleAssessmentSelect = (assessment) => {
    setSelectedAssessments((prev) => {
      const isSelected = prev.find((a) => a._id === assessment._id);
      if (isSelected) {
        return prev.filter((a) => a._id !== assessment._id);
      } else {
        return [...prev, assessment];
      }
    });
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
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

  if (errorMessage) {
    return <div className="text-center mt-5 text-danger">{errorMessage}</div>;
  }

  // Calculate the gauge value based on completed assessments
  const gaugeValue = progressData.completed_assessments;
  const gaugeMax = progressData.total_assessments;

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: "#8B5F34", zIndex: theme.zIndex.drawer + 1 })}
        open={uploading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container className="mt-2">
        <Row className="g-4">
          {/* Attendance Card */}
          <Col md={3}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <h5 className="card-title">Complete Assessments</h5>
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "150px" }}
                >
                  <div
                    className="position-relative"
                    style={{
                      width: "150px",
                      height: "150px",
                      marginTop: "20px",
                    }}
                  >
                    <Gauge
                      width={150}
                      height={150}
                      value={gaugeValue}
                      min={0}
                      max={gaugeMax}
                      valueMin={0}
                      valueMax={gaugeMax}
                      cornerRadius="50%"
                      sx={(theme) => ({
                        [`& .${gaugeClasses.valueText}`]: {
                          fontSize: 30,
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                          fill: "#52b202",
                        },
                        [`& .${gaugeClasses.referenceArc}`]: {
                          fill: theme.palette.text.disabled,
                        },
                      })}
                    />
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-muted">
                    {progressData.completed_assessments} of{" "}
                    {progressData.total_assessments} completed
                  </span>
                </div>
              </div>
            </div>
          </Col>

          {/* Overall Score Card */}
          <Col md={3}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <h5 className="card-title">Overall Score</h5>
                <div className="mt-3 ">
                  <ScoreBar
                    score={overallStatistics.Myscore}
                    label="My Score"
                  />
                  <ScoreBar
                    score={overallStatistics.overall_mean}
                    label="Mean Score"
                  />
                </div>
                <div className="text-center mt-4 text-muted">
                  {overallStatistics.Myscore >
                  overallStatistics.overall_mean ? (
                    <span>
                      Your score is {overallStatistics.Myscore}, which is{" "}
                      <span className="text-success">higher</span> than the
                      average by{" "}
                      {(
                        overallStatistics.Myscore -
                        overallStatistics.overall_mean
                      ).toFixed(2)}{" "}
                      points or (
                      <span className="text-success">
                        {(
                          ((overallStatistics.Myscore -
                            overallStatistics.overall_mean) /
                            overallStatistics.overall_mean) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                      ).
                    </span>
                  ) : overallStatistics.Myscore <
                    overallStatistics.overall_mean ? (
                    <span>
                      Your score is {overallStatistics.Myscore}, which is{" "}
                      <span className="text-warning">lower</span> than the
                      average by{" "}
                      {(
                        overallStatistics.overall_mean -
                        overallStatistics.Myscore
                      ).toFixed(2)}{" "}
                      points or (
                      <span className="text-warning">
                        {(
                          ((overallStatistics.overall_mean -
                            overallStatistics.Myscore) /
                            overallStatistics.overall_mean) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                      ).
                    </span>
                  ) : (
                    <span>
                      Your score is {overallStatistics.Myscore}, which is{" "}
                      <span className="text-info">equal</span> to the average.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* Assessment Card */}
          <Col md={6}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title">Assessment</h5>
                  <CardOptionsMenu
                    title="Assessment Options"
                    cardType="assessment"
                    onRefresh={() => refreshAssessments()}
                    onExport={() => console.log("Export assessments")}
                    onFullscreen={() => console.log("Fullscreen assessments")}
                    onFilter={() => handleModalOpen()}
                  />
                </div>

                <div className="text-muted mb-3">
                  Progress: {progressData.completed_assessments}/
                  {progressData.total_assessments} assessments completed
                </div>
                {displayedAssessments.length > 0 ? (
                  displayedAssessments.map((assessment) => (
                    <div key={assessment._id} className="mt-3">
                      <div className="mb-3 p-3 bg-white rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="small text-muted">
                            {assessment.assessment_name}
                          </span>
                          {submittedAssessments[assessment._id] ? (
                            <div>
                              <StyledButton
                                variant="contained"
                                isSubmitted={true}
                                onClick={() => onEditSubmission(assessment._id)}
                                sx={{ mr: 1 }}
                              >
                                Edit
                              </StyledButton>
                              <ViewButton
                                variant="contained"
                                onClick={() =>
                                  handleViewSubmission(assessment._id)
                                }
                              >
                                {loadingPreview === assessment._id ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <VisibilityIcon fontSize="small" />
                                )}
                              </ViewButton>
                            </div>
                          ) : assessment.assignment_type === "group" ? (
                            <GroupButton
                              variant="contained"
                              disabled={uploading}
                              onClick={() => onOpenGroupModal(assessment)}
                            >
                              <GroupIcon />
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
                                onChange={(e) =>
                                  handleFileChange(e, assessment._id)
                                }
                                accept=".pdf"
                              />
                            </StyledButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-50">
                    <span className="text-muted">No assessments available</span>
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Score Card */}
          <Col md={6}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Score</h5>
                  <CardOptionsMenu
                    title="Score Options"
                    cardType="score"
                    onRefresh={() => fetchScoreData()}
                    onExport={() => console.log("Export scores")}
                    onFullscreen={() => console.log("Fullscreen scores")}
                  />
                </div>
                <div className="mt-3">
                  {scoreData.length > 0 ? (
                    scoreData.slice(0, 3).map((score) => (
                      <div
                        key={score.assessment_id}
                        className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white rounded"
                      >
                        <span>{score.assessment_name}</span>
                        <span className="badge bg-light text-dark">
                          {score.student_score !== null
                            ? `${score.student_score}/${score.max_score}`
                            : "-/" + score.max_score}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <span className="text-muted">No scores available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* Feedback Card */}
          <Col md={6}>
            <div className="card border-secondary h-100 background-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Feedback</h5>
                  <CardOptionsMenu
                    title="Feedback Options"
                    cardType="feedback"
                    onRefresh={() => refreshAssessments(false)}
                    onFullscreen={() => console.log("Fullscreen feedback")}
                  />
                </div>
                <div className="mt-3">
                  {scoreData.length > 0 ? (
                    scoreData.slice(0, 3).map((score) => {
                      // Find matching submission from submissionData
                      const submission =
                        submittedAssessments[score.assessment_id];
                      return (
                        <div
                          key={score.assessment_id}
                          className="d-flex justify-content-between align-items-center mb-3 p-2 bg-white rounded"
                        >
                          <span>{score.assessment_name}</span>
                          {submission ? (
                            <DescriptionIcon
                              onClick={() =>
                                navigate(
                                  `/student/view-pdf/${sectionId}/${encodeURIComponent(
                                    submission.file_url.split("/").pop()
                                  )}/${score.assessment_id}`
                                )
                              }
                            />
                          ) : (
                            <span className="text-muted">No file</span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <span className="text-muted">No feedback available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* Modal for Assessment Selection */}
          <Modal
            open={openModal}
            onClose={handleModalClose}
            aria-labelledby="assessment-selection-modal"
          >
            <Box sx={modalStyle}>
              <h4 className="mb-3">Select Assessments</h4>
              <List sx={{ width: "100%", maxHeight: 400, overflow: "auto" }}>
                {assessments.map((assessment) => (
                  <ListItem
                    key={assessment._id}
                    dense
                    button
                    onClick={() => handleAssessmentSelect(assessment)}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedAssessments.some(
                        (a) => a._id === assessment._id
                      )}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={assessment.assessment_name} />
                  </ListItem>
                ))}
              </List>
              <div className="d-flex justify-content-end mt-3">
                <Button onClick={handleModalClose} variant="contained">
                  Close
                </Button>
              </div>
            </Box>
          </Modal>
        </Row>
      </Container>

      {/* Group submission modal */}
      {groupModalOpen && (
        <GroupSubmitModal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          assessment={groupModalAssessment}
          file={groupFile}
          groupName={groupName}
          setGroupName={setGroupName}
          groupMembersData={groupModalAssessment}
          uploading={uploading}
          onSubmit={onGroupSubmit}
          setGroupFile={setGroupFile}
        />
      )}

      {/* Edit submission modal */}
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
    </>
  );
}
