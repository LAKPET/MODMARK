import * as React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Box, Typography } from "@mui/material";

const Selection = ({
  options,
  value,
  onChange,
  disabled,
  getOptionLabel = (option) => option.label,
  getOptionValue = (option) => option.value,
  getOptionDescription = (option) => option.description,
  sortBy = null,
  renderOption = null,
}) => {
  // Sort options if sortBy function is provided
  const sortedOptions = sortBy ? [...options].sort(sortBy) : options;

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={onChange}
      aria-label="selection"
      disabled={disabled}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: "100%",
      }}
    >
      {sortedOptions.map((option) => (
        <ToggleButton
          key={getOptionValue(option)}
          value={getOptionValue(option)}
          aria-label={getOptionLabel(option)}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            textAlign: "left",
            p: 2,
            border: "1px solid #e0e0e0",
            "&.Mui-selected": {
              backgroundColor: "#8B5F34",
              color: "white",
              "&:hover": {
                backgroundColor: "#6B4A2A",
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {renderOption ? (
              renderOption(option)
            ) : (
              <>
                <Typography variant="subtitle2">
                  {getOptionLabel(option)}
                </Typography>
                {getOptionDescription(option) && (
                  <Typography
                    variant="body2"
                    sx={{ color: "inherit", opacity: 0.8 }}
                  >
                    {getOptionDescription(option)}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default Selection;
