// src/components/Form13/Form13HeaderSection.jsx

import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { masterData, getTerminalCodes } from "../../data/masterData";

const Form13HeaderSection = ({
  formData,
  vessels,
  pods,
  masterDataLoaded,
  loading,
  onFormDataChange,
  onReloadMasterData,
  validationErrors = {},
}) => {
  const {
    cargoTypes,
    originTypes,
    containerStatuses,
    formTypes,
    portIds
  } = masterData;

  const getVesselOptions = () => {
    return vessels.filter(
      (vessel) =>
        vessel.chaValidFrm &&
        vessel.chaValidTo &&
        new Date() >= new Date(vessel.chaValidFrm) &&
        new Date() <= new Date(vessel.chaValidTo)
    );
  };

  const getPODOptions = () => {
    if (!pods || !Array.isArray(pods) || !formData.locId || !formData.terminalCode) return [];
    
    const location = pods.find(location => location.locId === formData.locId);
    if (!location || !location.terminal || !Array.isArray(location.terminal)) return [];
    
    const terminal = location.terminal.find(
      terminal => terminal.terminalId === formData.terminalCode
    );
    
    if (!terminal || !terminal.service || !Array.isArray(terminal.service)) return [];
    
    const allPods = [];
    terminal.service.forEach(service => {
      if (service.pod && Array.isArray(service.pod)) {
        allPods.push(...service.pod);
      }
    });
    
    return allPods;
  };

  const getAllPods = () => {
    if (!pods || !Array.isArray(pods)) return [];
    
    const allPods = [];
    pods.forEach(location => {
      if (location.terminal && Array.isArray(location.terminal)) {
        location.terminal.forEach(terminal => {
          if (terminal.service && Array.isArray(terminal.service)) {
            terminal.service.forEach(service => {
              if (service.pod && Array.isArray(service.pod)) {
                allPods.push(...service.pod);
              }
            });
          }
        });
      }
    });
    return allPods;
  };

  const availableTerminalCodes = getTerminalCodes(formData.locId);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
          <InfoIcon sx={{ mr: 1 }} />
          Header Section - Vessel & Basic Information
          {Object.keys(validationErrors).length > 0 && (
            <Chip 
              label={`${Object.keys(validationErrors).length} errors`} 
              color="error" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
        </Typography>

        <Grid container spacing={3}>
          {/* Shipping Line */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.bnfCode}>
              <InputLabel>Shipping Line</InputLabel>
              <Select
                value={formData.bnfCode}
                label="Shipping Line"
                onChange={(e) =>
                  onFormDataChange("header", "bnfCode", e.target.value)
                }
                disabled={!masterDataLoaded || loading}
              >
                {[...new Set(vessels.map((v) => v.bnfCode))].map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.bnfCode && (
                <Typography variant="caption" color="error">
                  {validationErrors.bnfCode}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Location */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.locId}>
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.locId}
                label="Location"
                onChange={(e) =>
                  onFormDataChange("header", "locId", e.target.value)
                }
                disabled={!masterDataLoaded || loading}
              >
                {portIds.map((port) => (
                  <MenuItem key={port.value} value={port.value}>
                    {port.label}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.locId && (
                <Typography variant="caption" color="error">
                  {validationErrors.locId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Vessel Name */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.vesselNm}>
              <InputLabel>Vessel Name</InputLabel>
              <Select
                value={formData.vesselNm}
                label="Vessel Name"
                onChange={(e) =>
                  onFormDataChange("header", "vesselNm", e.target.value)
                }
                disabled={
                  !masterDataLoaded ||
                  loading ||
                  !formData.bnfCode ||
                  !formData.locId
                }
              >
                {getVesselOptions().map((vessel) => (
                  <MenuItem key={vessel.vesselNm} value={vessel.vesselNm}>
                    {vessel.vesselNm}
                    {vessel.viaNo && ` (VIA: ${vessel.viaNo})`}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.vesselNm && (
                <Typography variant="caption" color="error">
                  {validationErrors.vesselNm}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* VIA No */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.viaNo}>
              <InputLabel>VIA No.</InputLabel>
              <Select
                value={formData.viaNo}
                label="VIA No."
                onChange={(e) =>
                  onFormDataChange("header", "viaNo", e.target.value)
                }
                disabled={!masterDataLoaded || loading}
              >
                {[...new Set(vessels.map((v) => v.viaNo))].map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.viaNo && (
                <Typography variant="caption" color="error">
                  {validationErrors.viaNo}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Terminal Code */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.terminalCode}>
              <InputLabel>Terminal Code</InputLabel>
              <Select
                value={formData.terminalCode}
                label="Terminal Code"
                onChange={(e) =>
                  onFormDataChange("header", "terminalCode", e.target.value)
                }
                disabled={!masterDataLoaded || loading}
              >
                {[...new Set(vessels.map((v) => v.terminalCode))].map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.terminalCode && (
                <Typography variant="caption" color="error">
                  {validationErrors.terminalCode}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Service */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.service}>
              <InputLabel>Service</InputLabel>
              <Select
                value={formData.service}
                label="Service"
                onChange={(e) =>
                  onFormDataChange("header", "service", e.target.value)
                }
                disabled={!masterDataLoaded || loading || !formData.vesselNm}
              >
                {vessels
                  .filter((v) => v.vesselNm === formData.vesselNm)
                  .map((vessel) => (
                    <MenuItem key={vessel.service} value={vessel.service}>
                      {vessel.service}
                    </MenuItem>
                  ))}
              </Select>
              {validationErrors.service && (
                <Typography variant="caption" color="error">
                  {validationErrors.service}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* POD */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.pod}>
              <InputLabel>POD</InputLabel>
              <Select
                value={formData.pod}
                label="POD"
                onChange={(e) =>
                  onFormDataChange("header", "pod", e.target.value)
                }
                disabled={!masterDataLoaded || loading}
              >
                {getAllPods().map((pod) => (
                  <MenuItem key={pod.podCd} value={pod.podCd}>
                    {pod.podNm} ({pod.podCd})
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.pod && (
                <Typography variant="caption" color="error">
                  {validationErrors.pod}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* FPOD */}
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              required={["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1"].includes(formData.locId)} 
              error={!!validationErrors.fpod}
              disabled={!["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1"].includes(formData.locId)}
            >
              <InputLabel>FPOD</InputLabel>
              <Select
                value={formData.fpod}
                label="FPOD"
                onChange={(e) =>
                  onFormDataChange("header", "fpod", e.target.value)
                }
              >
                {getAllPods().map((pod) => (
                  <MenuItem key={pod.podCd} value={pod.podCd}>
                    {pod.podNm} ({pod.podCd})
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color={!["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1"].includes(formData.locId) ? "text.secondary" : "error"}>
                {validationErrors.fpod || "Required for Chennai, Paradip, Kattupalli, Kolkata, Ennore"}
              </Typography>
            </FormControl>
          </Grid>

          {/* Cargo Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.cargoTp}>
              <InputLabel>Cargo Type</InputLabel>
              <Select
                value={formData.cargoTp}
                label="Cargo Type"
                onChange={(e) =>
                  onFormDataChange("header", "cargoTp", e.target.value)
                }
              >
                {cargoTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.cargoTp && (
                <Typography variant="caption" color="error">
                  {validationErrors.cargoTp}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Origin */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.origin}>
              <InputLabel>Origin</InputLabel>
              <Select
                value={formData.origin}
                label="Origin"
                onChange={(e) =>
                  onFormDataChange("header", "origin", e.target.value)
                }
              >
                {originTypes.map((origin) => (
                  <MenuItem key={origin.value} value={origin.value}>
                    {origin.label}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.origin && (
                <Typography variant="caption" color="error">
                  {validationErrors.origin}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Form Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.formType}>
              <InputLabel>Form Type</InputLabel>
              <Select
                value={formData.formType}
                label="Form Type"
                onChange={(e) =>
                  onFormDataChange("header", "formType", e.target.value)
                }
              >
                {formTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.formType && (
                <Typography variant="caption" color="error">
                  {validationErrors.formType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Container Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!validationErrors.cntnrStatus}>
              <InputLabel>Container Status</InputLabel>
              <Select
                value={formData.cntnrStatus}
                label="Container Status"
                onChange={(e) =>
                  onFormDataChange("header", "cntnrStatus", e.target.value)
                }
              >
                {containerStatuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.cntnrStatus && (
                <Typography variant="caption" color="error">
                  {validationErrors.cntnrStatus}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Booking No */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Booking No *"
              value={formData.bookNo}
              onChange={(e) =>
                onFormDataChange("header", "bookNo", e.target.value)
              }
              required
              error={!!validationErrors.bookNo}
              helperText={validationErrors.bookNo}
            />
          </Grid>

          {/* BL Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="BL Number"
              value={formData.bookCopyBlNo}
              onChange={(e) =>
                onFormDataChange("header", "bookCopyBlNo", e.target.value)
              }
              disabled={!(formData.bnfCode === "Hapag Llyod" && formData.cargoTp !== "REF")}
              required={formData.bnfCode === "Hapag Llyod" && formData.cargoTp !== "REF"}
              error={!!validationErrors.bookCopyBlNo}
              helperText={validationErrors.bookCopyBlNo || "Required for Hapag Lloyd non-reefer cargo"}
            />
          </Grid>

          {/* Mobile No with validation */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile No *"
              value={formData.mobileNo}
              onChange={(e) =>
                onFormDataChange("header", "mobileNo", e.target.value)
              }
              type="tel"
              inputProps={{ maxLength: 12 }}
              required
              error={!!validationErrors.mobileNo}
              helperText={validationErrors.mobileNo || "10-12 digit mobile number"}
            />
          </Grid>

          {/* CFS Code */}
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              required={formData.origin === "C"} 
              error={!!validationErrors.cfsCode}
              disabled={formData.origin !== "C"}
            >
              <InputLabel>CFS Code</InputLabel>
              <Select
                value={formData.cfsCode}
                label="CFS Code"
                onChange={(e) =>
                  onFormDataChange("header", "cfsCode", e.target.value)
                }
              >
                <MenuItem value="CFS1">CFS 1</MenuItem>
                <MenuItem value="CFS2">CFS 2</MenuItem>
              </Select>
              <Typography variant="caption" color={formData.origin !== "C" ? "text.secondary" : "error"}>
                {validationErrors.cfsCode || "Required when Origin is Dock Destuff"}
              </Typography>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shipper Name *"
              value={formData.shipperNm}
              onChange={(e) =>
                onFormDataChange("header", "shipperNm", e.target.value)
              }
              required
              error={!!validationErrors.shipperNm}
              helperText={validationErrors.shipperNm}
            />
          </Grid>

          {/* Consignee Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Consignee Name"
              value={formData.consigneeNm}
              onChange={(e) =>
                onFormDataChange("header", "consigneeNm", e.target.value)
              }
              disabled={!["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INMUN1"].includes(formData.locId)}
              required={["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INMUN1"].includes(formData.locId)}
              error={!!validationErrors.consigneeNm}
              helperText={validationErrors.consigneeNm || "Required for selected port locations"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Consignee Address"
              value={formData.consigneeAddr}
              onChange={(e) =>
                onFormDataChange("header", "consigneeAddr", e.target.value)
              }
              disabled={!["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INMUN1"].includes(formData.locId)}
              required={["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INMUN1"].includes(formData.locId)}
              error={!!validationErrors.consigneeAddr}
              helperText={validationErrors.consigneeAddr || "Required for selected port locations"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cargo Description"
              value={formData.cargoDesc}
              onChange={(e) =>
                onFormDataChange("header", "cargoDesc", e.target.value)
              }
              disabled={!["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INMUN1"].includes(formData.locId)}
              required={["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INMUN1"].includes(formData.locId)}
              error={!!validationErrors.cargoDesc}
              helperText={validationErrors.cargoDesc || "Required for selected port locations"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Terminal Login ID"
              value={formData.terminalLoginId}
              onChange={(e) =>
                onFormDataChange("header", "terminalLoginId", e.target.value)
              }
              disabled={!["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INMUN1"].includes(formData.locId)}
              required={["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INMUN1"].includes(formData.locId)}
              error={!!validationErrors.terminalLoginId}
              helperText={validationErrors.terminalLoginId || "Required for selected port locations"}
            />
          </Grid>

          {/* Nhavasheva terminals conditional fields */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom color={formData.locId !== "INNSA1" ? "text.disabled" : "text.primary"}>
              Nhavasheva Requirements (One of the following is required):
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="FF Code"
                  value={formData.FFCode}
                  onChange={(e) =>
                    onFormDataChange("header", "FFCode", e.target.value)
                  }
                  disabled={formData.locId !== "INNSA1"}
                  error={!!validationErrors.CHACode}
                  helperText={formData.locId !== "INNSA1" ? "Required for Nhavasheva" : validationErrors.CHACode}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="IE Code"
                  value={formData.IECode}
                  onChange={(e) =>
                    onFormDataChange("header", "IECode", e.target.value)
                  }
                  disabled={formData.locId !== "INNSA1"}
                  helperText={formData.locId !== "INNSA1" ? "Required for Nhavasheva" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="CHA Code"
                  value={formData.CHACode}
                  onChange={(e) =>
                    onFormDataChange("header", "CHACode", e.target.value)
                  }
                  disabled={formData.locId !== "INNSA1"}
                  helperText={formData.locId !== "INNSA1" ? "Required for Nhavasheva" : ""}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Shipper City */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shipper City"
              value={formData.ShipperCity}
              onChange={(e) =>
                onFormDataChange("header", "ShipperCity", e.target.value)
              }
              disabled={!(formData.locId === "INTUT1" && formData.terminalCode === "DBGT")}
              required={formData.locId === "INTUT1" && formData.terminalCode === "DBGT"}
              error={!!validationErrors.ShipperCity}
              helperText={validationErrors.ShipperCity || "Required for Tuticorin DBGT terminal"}
            />
          </Grid>

          {/* Early Gate In */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={!(formData.bnfCode === "CMA" && formData.locId === "INMUN1")}>
              <InputLabel>Early Gate In</InputLabel>
              <Select
                value={formData.IsEarlyGateIn}
                label="Early Gate In"
                onChange={(e) =>
                  onFormDataChange("header", "IsEarlyGateIn", e.target.value)
                }
              >
                <MenuItem value="Y">Yes</MenuItem>
                <MenuItem value="N">No</MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary">
                {"Only for CMA Mundra"}
              </Typography>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email IDs (comma separated)"
              value={formData.email_Id}
              onChange={(e) =>
                onFormDataChange("header", "email_Id", e.target.value)
              }
              helperText="For notifications, comma separated with no spaces"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Notify To"
              value={formData.Notify_TO}
              onChange={(e) =>
                onFormDataChange("header", "Notify_TO", e.target.value)
              }
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Form13HeaderSection;