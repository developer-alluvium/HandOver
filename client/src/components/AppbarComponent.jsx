import React from "react";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Typography } from "@mui/material";
import TopNavDropdown from "./TopNavDropdown";
import { useAuth } from "../context/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import Tooltip from "@mui/material/Tooltip";

const AppbarComponent = (props) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <AppBar
            position="fixed"
            sx={{
                width: "100%",
                ml: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(12px) !important",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                zIndex: (theme) => theme.zIndex.drawer + 1,
                color: "#000",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
        >
            <Toolbar sx={{ minHeight: "64px !important" }}>
                {/* <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={() => props.setMobileOpen(!props.mobileOpen)}
                    sx={{ mr: 2, display: { lg: "none" } }}
                >
                    <MenuIcon sx={{ color: "#000" }} />
                </IconButton> */}

                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={() => window.history.back()}
                    sx={{ mr: 1 }}
                >
                    <ArrowBackIcon sx={{ color: "#000" }} />
                </IconButton>
                <Box
                    sx={{
                        height: 40,
                        width: "auto",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        px: 1,
                        transition: "transform 0.2s",
                        "&:hover": {
                            transform: "scale(1.04)",
                            filter: "brightness(1.08)",
                        },
                    }}
                    onClick={() => navigate("/")}
                >
                    <img
                        src={new URL("../assets/images/logo.jpg", import.meta.url).href}
                        alt="logo"
                        style={{
                            height: 44,
                            width: "auto",
                            objectFit: "contain",
                            display: "block",
                        }}
                    />
                </Box>

                {/* Navigation Dropdown */}
                <Box sx={{ ml: 3, display: "flex", alignItems: "center" }}>
                    <TopNavDropdown />
                </Box>

                {/* Spacer to push the version text to the extreme right */}
                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ textAlign: "right" }}>
                    <Typography
                        variant="caption"
                        sx={{ fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}
                    >
                        Version: {import.meta.env.VITE_VERSION || "01.00.00"}
                    </Typography>
                </Box>

                <Tooltip title="Logout">
                    <IconButton
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        sx={{
                            ml: 2,
                            color: '#ef4444',
                            "&:hover": { backgroundColor: "#fee2e2" }
                        }}
                    >
                        <LogoutIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
}

export default AppbarComponent;
