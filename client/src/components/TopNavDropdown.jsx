import React, { useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { masterData } from "../data/masterData";

const TopNavDropdown = ({ sx = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // --- Location Dialog State ---
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [selectedLocId, setSelectedLocId] = useState("");

  const handleLocationDialogClose = () => {
    setLocationDialogOpen(false);
  };

  const handleLocationConfirm = () => {
    setLocationDialogOpen(false);
    const stateObj = { presetLocId: selectedLocId || null };
    if (location.pathname === "/form13") {
      stateObj.reset = Date.now();
      navigate("/form13", { state: stateObj, replace: true });
    } else {
      navigate("/form13", { state: stateObj });
    }
  };

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

  const handleForm13Click = () => {
    handleClose();
    setLocationDialogOpen(true);
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
        <MenuItem onClick={handleForm13Click}>Form 13</MenuItem>
        <MenuItem onClick={() => handleNav("/track-f13")}>Track F13 request</MenuItem>
      </Menu>

      {/* Location Selection Dialog */}
      <Dialog
        open={locationDialogOpen}
        onClose={handleLocationDialogClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0.5 }}>
          <LocationOnIcon sx={{ color: "#1976d2" }} />
          <Typography variant="h6" fontWeight="bold">
            Select Port / Location
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose the port for this Form 13 submission. Shipping lines will be
            filtered based on your selection.
          </Typography>
          <Autocomplete
            fullWidth
            size="small"
            options={masterData.portIds}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.label ? `${option.value} - ${option.label}` : "";
            }}
            value={masterData.portIds.find(p => p.value === selectedLocId) || null}
            onChange={(e, newValue) => {
              const val = newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : "";
              setSelectedLocId(val);
            }}
            noOptionsText="Location is not present"
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Search location..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleLocationDialogClose}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLocationConfirm}
            variant="contained"
            color="primary"
            sx={{ borderRadius: "8px", textTransform: "none", minWidth: 120 }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopNavDropdown;
