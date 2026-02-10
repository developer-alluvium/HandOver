// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import VGMForm from "./components/VGMForm";
import VGMStatus from "./components/VGMStatus";
import { CircularProgress, Box } from "@mui/material";
import Form13 from "./components/Form13/Form13";
import "./App.css";
import TrackF13 from "./components/Form13/TrackF13";
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Use isAuthenticated (boolean)

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// PublicRoute - redirects authenticated users away from login
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If authenticated, redirect to vgm-status
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Login is now optional - redirect to vgm-status if authenticated */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vgm"
                element={
                  <ProtectedRoute>
                    <VGMForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vgm-status"
                element={
                  <ProtectedRoute>
                    <VGMStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/form13"
                element={
                  <ProtectedRoute>
                    <Form13 />
                  </ProtectedRoute>
                }
              />
              <Route path="/track-f13" element={
                <ProtectedRoute>
                  <TrackF13 />
                </ProtectedRoute>
              } />
              {/* Default route - go directly to VGM status */}
              <Route path="/" element={<Navigate to="/dashboard" />} />

            </Routes>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
