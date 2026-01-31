// client/src/components/Login/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { loginValidationSchema } from "../utils/validation";

import bgImage from "../assets/login-bg.png"; // Import the background image
import { Fade, Grow } from "@mui/material"; // Import Transitions

const Login = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      pyrCode: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          pyrCode: values.pyrCode,
      
        };

        const response = await authAPI.login(payload);

        if (response.data && Array.isArray(response.data)) {
          login({ pyrCode: values.pyrCode }, response.data);
          enqueueSnackbar("Login successful!", { variant: "success" });
          navigate("/dashboard");
        } else {
          const shippersData = response.data?.data || response.data;
          if (Array.isArray(shippersData)) {
            login({ pyrCode: values.pyrCode }, shippersData);
            enqueueSnackbar("Login successful!", { variant: "success" });
            navigate("/dashboard");
          } else {
            throw new Error("Invalid response format from server");
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        const errorMessage =
          error.response?.data?.message || error.message || "Login failed.";
        enqueueSnackbar(errorMessage, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle redirect in useEffect
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{
          background: `url(${bgImage}) no-repeat center center fixed`,
          backgroundSize: "cover",
        }}
      >
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `url(${bgImage}) no-repeat center center fixed`,
        backgroundSize: "cover",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)", // Overlay for readability
          backdropFilter: "blur(2px)",
          zIndex: 1,
        },
      }}
    >
      <Grow in={true} timeout={800}>
        <Container component="main" maxWidth="xs" sx={{ position: "relative", zIndex: 2 }}>
          <Paper
            elevation={24}
            sx={{
              padding: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.85)", // Glass effect
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <Fade in={true} timeout={1200}>
              <Box sx={{ width: "100%", textAlign: "center" }}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#1565c0",
                    mb: 1,
                    letterSpacing: "-0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  ODeX VGM
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="textSecondary"
                  sx={{ mb: 3, fontWeight: 500 }}
                >
                  Secure Logistics Portal
                </Typography>

                <Box
                  component="form"
                  onSubmit={formik.handleSubmit}
                  sx={{ mt: 1, width: "100%" }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="pyrCode"
                    label="Payor Code / CHA Name"
                    name="pyrCode"
                    autoComplete="username"
                    autoFocus
                    value={formik.values.pyrCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.pyrCode && Boolean(formik.errors.pyrCode)}
                    helperText={formik.touched.pyrCode && formik.errors.pyrCode}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                        "&:hover fieldset": {
                          borderColor: "#1565c0",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1565c0",
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 4,
                      mb: 2,
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: "bold",
                      borderRadius: "12px",
                      textTransform: "none",
                      backgroundImage: "linear-gradient(45deg, #1565c0 30%, #42a5f5 90%)",
                      boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                      transition: "transform 0.2s",
                      "&:hover": {
                        backgroundImage: "linear-gradient(45deg, #0d47a1 30%, #1976d2 90%)",
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Paper>
        </Container>
      </Grow>
    </Box>
  );
};

export default Login;
