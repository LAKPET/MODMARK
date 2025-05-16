import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

// Hidden input for file uploads
export const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// Main submit/edit button
export const StyledButton = styled(Button)(({ isSubmitted }) => ({
  color: "white",
  backgroundColor: isSubmitted ? "#8b5f34" : "#5c90d2",
  fontSize: "0.875rem",
  textTransform: "none",
  minWidth: "140px",
  "&:hover": {
    backgroundColor: isSubmitted ? "#6f4f2f" : "#4a7ab0",
  },
}));

// View button for previewing submissions
export const ViewButton = styled(Button)({
  color: "white",
  backgroundColor: "#FF9800",
  fontSize: "0.875rem",
  textTransform: "none",
  height: "37px",
  minWidth: "40px",
  marginLeft: "6px",
  "&:hover": {
    backgroundColor: "#F57C00",
  },
});

// Group submission button
export const GroupButton = styled(Button)({
  color: "white",
  backgroundColor: "#5c90d2",
  fontSize: "0.875rem",
  textTransform: "none",
  minWidth: "140px",
  "&:hover": {
    backgroundColor: "#4a7ab0",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
  },
});

// Icon for group submissions
export const GroupIcon = styled(PeopleAltIcon)({
  fontSize: "1.1rem",
  marginRight: "6px",
  color: "#5c90d2",
});
