import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const TopNavDropdown = ({ sx = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const pathToLabel = (pathname) => {
    if (pathname === "/" || pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/form13")) return "Form 13";
    if (pathname.startsWith("/track-f13")) return "Track F13 request";
    if (pathname.startsWith("/vgm-status")) return "VGM Status";
    if (pathname.startsWith("/vgm")) return "VGM Submission";
    return "Dashboard";
  };

  const currentLabel = pathToLabel(location.pathname);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNav = (path) => {
    if (location.pathname === path) {
      // Force a full reset state
      navigate(path, { state: { reset: Date.now() }, replace: true });
    } else {
      navigate(path);
    }
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", ...sx }}>
      <Button
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          minWidth: 220,
          justifyContent: "space-between",
          textTransform: "none",
          height: "38px",
          backgroundColor: "#fff",
          color: "#1e293b",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "8px",
          fontSize: "0.9rem",
          fontWeight: 500,
          px: 1.5,
          "&:hover": {
            backgroundColor: "#f8fafc",
            borderColor: "rgba(0,0,0,0.2)",
          },
        }}
      >
        {currentLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 220,
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          },
        }}
      >
        <MenuItem onClick={() => handleNav("/dashboard")}>Dashboard</MenuItem>
        <MenuItem onClick={() => handleNav("/vgm")}>VGM Submission</MenuItem>
        <MenuItem onClick={() => handleNav("/vgm-status")}>VGM Status</MenuItem>
        <MenuItem onClick={() => handleNav("/form13")}>Form 13</MenuItem>
        <MenuItem onClick={() => handleNav("/track-f13")}>Track F13 request</MenuItem>
      </Menu>
    </Box>
  );
};

export default TopNavDropdown;
