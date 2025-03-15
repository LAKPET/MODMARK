import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

const VisuallyHiddenInput = styled("input")({
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

const StyledButton = styled(Button)({
  color: "gray",
  fontSize: "1rem",
  textTransform: "none",
  "&:hover": {
    color: "#8b5f34",
    textDecoration: "underline",
    backgroundColor: "transparent",
  },
});

export default function InputFileUpload({ onChange }) {
  return (
    <StyledButton
      component="label"
      role={undefined}
      variant="text"
      tabIndex={-1}
    >
      Upload files
      <VisuallyHiddenInput type="file" onChange={onChange} />
    </StyledButton>
  );
}
