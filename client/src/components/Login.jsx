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
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { loginValidationSchema } from "../utils/validation";
import { generateLoginHash } from "../utils/hashUtils";

const Login = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      pyrCode: "",
      fromTs: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      hashKey: "",
      useEncryption: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          pyrCode: values.pyrCode,
          fromTs: values.fromTs,
        };

        if (values.useEncryption) {
          const secretKey =
            import.meta.env.VITE_ODEX_SECRET_KEY || "test-secret-key";
          payload.hashKey = generateLoginHash(
            values.pyrCode,
            values.fromTs,
            secretKey
          );
        }


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
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            ODeX VGM System
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="textSecondary"
            gutterBottom
          >
            Sign In
          </Typography>

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="pyrCode"
              label="CHA Name / Payor Code"
              name="pyrCode"
              value={formik.values.pyrCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.pyrCode && Boolean(formik.errors.pyrCode)}
              helperText={formik.touched.pyrCode && formik.errors.pyrCode}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="fromTs"
              label="Time Stamp"
              name="fromTs"
              value={formik.values.fromTs}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fromTs && Boolean(formik.errors.fromTs)}
              helperText={formik.touched.fromTs && formik.errors.fromTs}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="useEncryption"
                  checked={formik.values.useEncryption}
                  onChange={formik.handleChange}
                />
              }
              label="Use Encryption"
            />

            {formik.values.useEncryption && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="hashKey"
                label="Hash Key"
                value={formik.values.hashKey}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.hashKey && Boolean(formik.errors.hashKey)}
                helperText={formik.touched.hashKey && formik.errors.hashKey}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
