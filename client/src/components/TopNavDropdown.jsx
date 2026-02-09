import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const TopNavDropdown = ({ sx = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToValue = (pathname) => {
    if (pathname.startsWith("/form13")) return "form13";
    if (pathname.startsWith("/track-f13")) return "trackf13";
    if (pathname.startsWith("/vgm-status")) return "status";
    // default submission
    return "submission";
  };

  const value = pathToValue(location.pathname);

  const handleChange = (event) => {
    const v = event.target.value;
    if (v === "submission") navigate("/vgm");
    if (v === "status") navigate("/vgm-status");
    if (v === "form13") navigate("/form13");
    if (v === "trackf13") navigate("/track-f13");
    if (v === "dashboard") navigate("/dashboard");
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", ...sx }}>
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <Select
          id="top-nav-select"
          value={value}
          onChange={handleChange}
          displayEmpty
          sx={{
            height: "38px",
            backgroundColor: "#fff",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0,0,0,0.1)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0,0,0,0.2)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2563eb",
            },
            fontSize: "0.9rem",
            fontWeight: 500
          }}
        >
          <MenuItem value="dashboard">Dashboard</MenuItem>
          <MenuItem value="submission">VGM Submission</MenuItem>
          <MenuItem value="status">VGM Status</MenuItem>
          <MenuItem value="form13">Form 13</MenuItem>
          <MenuItem value="trackf13">Track F13 request</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default TopNavDropdown;
