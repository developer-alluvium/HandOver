// src/components/Form13/Form13ReviewSection.jsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { masterData } from "../../data/masterData";

const Form13ReviewSection = ({ formData, vessels, pods }) => {
  const getVesselName = (vesselCode) => {
    const vessel = vessels.find((v) => v.vesselNm === vesselCode);
    return vessel ? `${vessel.vesselNm} (${vessel.service})` : vesselCode;
  };

  const getPODName = (podCode) => {
    const pod = pods.find((p) => p.podCd === podCode);
    return pod ? `${pod.podNm} (${pod.podCd})` : podCode;
  };

  const getCargoTypeLabel = (cargoType) => {
    const cargo = masterData.cargoTypes.find((ct) => ct.value === cargoType);
    return cargo ? cargo.label : cargoType;
  };

  const getIsoCodeLabel = (isoCode) => {
    const iso = masterData.isoCodes.find((ic) => ic.value === isoCode);
    return iso ? iso.label : isoCode;
  };

  const validateForm = () => {
    const errors = [];

    // Header validation
    if (!formData.bnfCode) errors.push("Shipping Line is required");
    if (!formData.vesselNm) errors.push("Vessel Name is required");
    if (!formData.pod) errors.push("POD is required");
    if (!formData.cargoTp) errors.push("Cargo Type is required");
    if (!formData.origin) errors.push("Origin is required");
    if (!formData.mobileNo) errors.push("Mobile No is required");

    // Container validation
    formData.containers.forEach((container, index) => {
      if (!container.cntnrNo)
        errors.push(`Container ${index + 1}: Container No is required`);
      if (!container.cntnrSize)
        errors.push(`Container ${index + 1}: Container Size is required`);
      if (!container.iso)
        errors.push(`Container ${index + 1}: ISO Code is required`);
      if (!container.agentSealNo)
        errors.push(`Container ${index + 1}: Agent Seal No is required`);
      if (!container.customSealNo)
        errors.push(`Container ${index + 1}: Custom Seal No is required`);
      if (!container.driverNm)
        errors.push(`Container ${index + 1}: Driver Name is required`);

      // Conditional validations
      if (formData.cargoTp.includes("HAZ")) {
        if (!container.imoNo1)
          errors.push(
            `Container ${index + 1}: IMO No 1 is required for hazardous cargo`
          );
        if (!container.unNo1)
          errors.push(
            `Container ${index + 1}: UN No 1 is required for hazardous cargo`
          );
      }

      if (formData.cargoTp.includes("REF")) {
        if (!container.temp)
          errors.push(
            `Container ${index + 1}: Temperature is required for reefer cargo`
          );
        if (!container.volt)
          errors.push(
            `Container ${index + 1}: Voltage is required for reefer cargo`
          );
      }
    });

    // Shipping Bill validation
    const shippingBill = formData.shippingBills[0];
    if (!shippingBill?.shipBillInvNo)
      errors.push("Shipping Bill No is required");
    if (!shippingBill?.shipBillDt)
      errors.push("Shipping Bill Date is required");
    if (!shippingBill?.leoNo) errors.push("LEO No is required");
    if (!shippingBill?.leoDt) errors.push("LEO Date is required");
    if (!shippingBill?.chaNm) errors.push("CHA Name is required");
    if (!shippingBill?.chaPan) errors.push("CHA PAN is required");
    if (!shippingBill?.exporterNm) errors.push("Exporter Name is required");
    if (!shippingBill?.exporterIec) errors.push("Exporter IEC is required");
    if (!shippingBill?.noOfPkg) errors.push("Number of Packages is required");

    return errors;
  };

  const validationErrors = validateForm();
  const isValid = validationErrors.length === 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Review & Submit
        </Typography>

        {/* Validation Status */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: isValid ? "success.light" : "warning.light",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            {isValid ? (
              <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
            ) : (
              <WarningIcon sx={{ mr: 1, color: "warning.main" }} />
            )}
            <Typography variant="h6">
              {isValid ? "Ready to Submit" : "Form Validation Required"}
            </Typography>
          </Box>
          <Typography variant="body2">
            {isValid
              ? "All required fields are filled. You can submit Form 13."
              : `Please fix ${validationErrors.length} issue(s) before submission.`}
          </Typography>
        </Box>

        {/* Header Information */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Header Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Shipping Line:</strong> {formData.bnfCode}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Vessel:</strong> {getVesselName(formData.vesselNm)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>POD:</strong> {getPODName(formData.pod)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Cargo Type:</strong>{" "}
                  {getCargoTypeLabel(formData.cargoTp)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Origin:</strong> {formData.origin}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Form Type:</strong> {formData.formType}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Container Information */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Container Information ({formData.containers.length} container(s))
            </Typography>
            {formData.containers.map((container, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Container {index + 1}: {container.cntnrNo}
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2">
                      <strong>Size:</strong> {container.cntnrSize}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2">
                      <strong>ISO:</strong> {getIsoCodeLabel(container.iso)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2">
                      <strong>Driver:</strong> {container.driverNm}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Shipping Bill Information */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shipping Bill Information
            </Typography>
            {formData.shippingBills[0] && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Bill No:</strong>{" "}
                    {formData.shippingBills[0].shipBillInvNo}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>LEO No:</strong> {formData.shippingBills[0].leoNo}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Exporter:</strong>{" "}
                    {formData.shippingBills[0].exporterNm}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Packages:</strong>{" "}
                    {formData.shippingBills[0].noOfPkg}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Document Attachments ({formData.attachments.length} file(s))
            </Typography>
            <List dense>
              {formData.attachments.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {!isValid && (
          <Card variant="outlined" sx={{ mt: 2, borderColor: "error.main" }}>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Validation Errors
              </Typography>
              <List dense>
                {validationErrors.map((error, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default Form13ReviewSection;
