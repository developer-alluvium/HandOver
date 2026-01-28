// src/components/Form13/Form13HeaderSection.jsx

import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { masterData, getCFSCodes } from "../../data/masterData";
import { isFieldRequired, isFieldVisible } from "../../utils/form13Validations";

const Form13HeaderSection = ({
  formData,
  vessels,
  pods,
  masterDataLoaded,
  loading,
  onFormDataChange,
  validationErrors = {},
}) => {
  const {
    cargoTypes,
    originTypes,
    containerStatuses,
    formTypes,
    portIds
  } = masterData;

  // --- CASCADING DROPDOWN LOGIC ---

  // 1. All Vessels (Removed strict time check to ensure all master data is visible)
  const allActiveVessels = React.useMemo(() => {
    return vessels || [];
  }, [vessels]);

  // 2. Shipping Line Options
  const slOptions = React.useMemo(() => {
    return [...new Set(allActiveVessels.map(v => v.bnfCode))].sort();
  }, [allActiveVessels]);

  // 3. Location Options (Filtered by Shipping Line)
  const locOptions = React.useMemo(() => {
    const locIds = [...new Set(
      allActiveVessels
        .filter(v => !formData.bnfCode || v.bnfCode === formData.bnfCode)
        .map(v => v.locId)
    )];
    return locIds.map(id => {
      const port = portIds.find(p => p.value === id);
      return { value: id, label: port ? port.label : id };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [allActiveVessels, formData.bnfCode, portIds]);

  // 4. Vessel Options (Filtered by SL + Loc)
  const vslOptions = React.useMemo(() => {
    return [...new Set(
      allActiveVessels
        .filter(v =>
          (!formData.bnfCode || v.bnfCode === formData.bnfCode) &&
          (!formData.locId || v.locId === formData.locId)
        )
        .map(v => v.vesselNm)
    )].sort();
  }, [allActiveVessels, formData.bnfCode, formData.locId]);

  // 5. VIA Options (Filtered by SL + Loc + Vessel)
  const viaOptions = React.useMemo(() => {
    return [...new Set(
      allActiveVessels
        .filter(v =>
          (!formData.bnfCode || v.bnfCode === formData.bnfCode) &&
          (!formData.locId || v.locId === formData.locId) &&
          (!formData.vesselNm || v.vesselNm === formData.vesselNm)
        )
        .map(v => v.viaNo)
    )].filter(Boolean).sort();
  }, [allActiveVessels, formData.bnfCode, formData.locId, formData.vesselNm]);

  // 6. Terminal Options (Filtered by SL + Loc + Vessel + VIA)
  const trmOptions = React.useMemo(() => {
    return [...new Set(
      allActiveVessels
        .filter(v =>
          (!formData.bnfCode || v.bnfCode === formData.bnfCode) &&
          (!formData.locId || v.locId === formData.locId) &&
          (!formData.vesselNm || v.vesselNm === formData.vesselNm) &&
          (!formData.viaNo || v.viaNo === formData.viaNo)
        )
        .map(v => v.terminalCode)
    )].filter(Boolean).sort();
  }, [allActiveVessels, formData.bnfCode, formData.locId, formData.vesselNm, formData.viaNo]);

  // 7. Service Options (Filtered by SL + Loc + Vessel + VIA + Terminal)
  const srvOptions = React.useMemo(() => {
    return [...new Set(
      allActiveVessels
        .filter(v =>
          (!formData.bnfCode || v.bnfCode === formData.bnfCode) &&
          (!formData.locId || v.locId === formData.locId) &&
          (!formData.vesselNm || v.vesselNm === formData.vesselNm) &&
          (!formData.viaNo || v.viaNo === formData.viaNo) &&
          (!formData.terminalCode || v.terminalCode === formData.terminalCode)
        )
        .map(v => v.service)
    )].filter(Boolean).sort();
  }, [allActiveVessels, formData.bnfCode, formData.locId, formData.vesselNm, formData.viaNo, formData.terminalCode]);

  // 8. POD Options (Cascading from pods master data)
  const cascadingPods = React.useMemo(() => {
    if (!pods || !formData.locId) return [];
    const locationData = pods.find(p => p.locId === formData.locId);
    if (!locationData) return [];

    let filteredPods = [];
    locationData.terminal?.forEach(term => {
      // Match Terminal
      if (!formData.terminalCode || term.terminalId === formData.terminalCode) {
        term.service?.forEach(serv => {
          // Match Service
          if (!formData.service || serv.serviceNm === formData.service) {
            if (serv.pod) filteredPods.push(...serv.pod);
          }
        });
      }
    });

    // Unique by podCd
    return [...new Map(filteredPods.map(p => [p.podCd, p])).values()]
      .sort((a, b) => a.podNm.localeCompare(b.podNm));
  }, [pods, formData.locId, formData.terminalCode, formData.service]);

  // 9. CFS Options (Filtered by Location)
  const cfsOptions = React.useMemo(() => {
    if (!formData.locId) return [];
    return getCFSCodes(formData.locId).map(code => ({ value: code, label: code }));
  }, [formData.locId]);

  // --- RENDERING HELPERS ---

  const SectionHeader = ({ title, showRedBar }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
      {showRedBar && <Box sx={{ width: 4, height: 24, bgcolor: '#d32f2f', mr: 1.5, borderRadius: '2px' }} />}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a237e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </Typography>
    </Box>
  );

  const FormLabelCustom = ({ label, required }) => (
    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', mb: 0.5, fontWeight: 500 }}>
      {label} {required && <span style={{ color: '#d32f2f', marginLeft: '4px' }}>*</span>}
    </Typography>
  );

  const renderField = (fieldName, label, md = 3) => {
    if (!isFieldVisible(fieldName, formData)) return null;

    const required = isFieldRequired(fieldName, formData);

    let selectOptions = [];
    let isSelect = true;

    // Map field names to their respective filtered options
    switch (fieldName) {
      case "bnfCode":
        selectOptions = slOptions.map(opt => ({ value: opt, label: opt }));
        break;
      case "locId":
        selectOptions = locOptions;
        break;
      case "formType":
        selectOptions = formTypes;
        break;
      case "origin":
        selectOptions = originTypes;
        break;
      case "vesselNm":
        selectOptions = vslOptions.map(opt => ({ value: opt, label: opt }));
        break;
      case "viaNo":
        selectOptions = viaOptions.map(opt => ({ value: opt, label: opt || "N/A" }));
        break;
      case "terminalCode":
        selectOptions = trmOptions.map(opt => ({ value: opt, label: opt }));
        break;
      case "service":
        selectOptions = srvOptions.map(opt => ({ value: opt, label: opt }));
        break;
      case "pod":
      case "fpod":
        selectOptions = cascadingPods.map(p => ({ value: p.podCd, label: `${p.podNm} (${p.podCd})` }));
        break;
      case "cargoTp":
        selectOptions = cargoTypes;
        break;
      case "cntnrStatus":
        selectOptions = containerStatuses;
        break;
      case "IsEarlyGateIn":
        selectOptions = [
          { value: "Y", label: "Yes" },
          { value: "N", label: "No" }
        ];
        break;
      case "cfsCode":
        selectOptions = cfsOptions;
        break;
      default:
        isSelect = false;
    }

    const isDisabled = loading || (
      (fieldName === "locId" && !formData.bnfCode) ||
      (fieldName === "vesselNm" && !formData.locId) ||
      (fieldName === "viaNo" && !formData.vesselNm) ||
      (fieldName === "terminalCode" && !formData.vesselNm) ||
      (fieldName === "service" && !formData.terminalCode) ||
      ((fieldName === "pod" || fieldName === "fpod") && !formData.locId) ||
      (fieldName === "cfsCode" && !formData.locId)
    );

    if (isSelect) {
      return (
        <Grid item xs={12} sm={6} md={md}>
          <FormLabelCustom label={label} required={required} />
          <FormControl fullWidth size="small" variant="standard" error={!!validationErrors[fieldName]}>
            <Select
              value={formData[fieldName] || ""}
              onChange={(e) => onFormDataChange("header", fieldName, e.target.value)}
              disabled={isDisabled}
            >
              {selectOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      );
    }

    // Default to TextField
    return (
      <Grid item xs={12} sm={6} md={md}>
        <FormLabelCustom label={label} required={required} />
        <TextField
          fullWidth size="small" variant="standard"
          value={formData[fieldName] || ""}
          onChange={(e) => onFormDataChange("header", fieldName, e.target.value)}
          error={!!validationErrors[fieldName]}
          multiline={fieldName === "cargoDesc" || fieldName === "Notify_TO"}
          rows={1}
        />
      </Grid>
    );
  };

  return (
    <Box>
      <SectionHeader title="Basic Information" showRedBar />
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: '#fafafa' }}>
        <Grid container spacing={3}>
          {renderField("bnfCode", "Shipping Line")}
          {renderField("locId", "Location")}
          {renderField("formType", "Form Type")}
          {renderField("origin", "Origin")}

          {renderField("vesselNm", "Vessel Name")}
          {renderField("viaNo", "VIA No.")}
          {renderField("terminalCode", "Terminal")}
          {renderField("service", "Service")}

          {renderField("pod", "POD")}
          {renderField("fpod", "FPOD")}
          {renderField("cargoTp", "Cargo Type")}
          {renderField("bookNo", "Booking No")}
          {renderField("shpInstructNo", "Shipping Instruction No")}
          {renderField("cntnrStatus", "Container Status")}
          {renderField("bookCopyBlNo", "Booking/BL No")}

          {renderField("mobileNo", "Mobile No")}
          {renderField("email_Id", "Email IDs")}
          {renderField("issueTo", "Issue To")}
          {renderField("IsEarlyGateIn", "Early Gate In")}
        </Grid>
      </Paper>

      <SectionHeader title="Stakeholder & Additional Info" showRedBar />
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: '#fafafa', mb: 3 }}>
        <Grid container spacing={3}>
          {renderField("shipperNm", "Shipper Name", 4)}
          {renderField("consigneeNm", "Consignee Name", 4)}
          {renderField("consigneeAddr", "Consignee Address", 4)}

          {renderField("CHACode", "CHA Code")}
          {renderField("FFCode", "FF Code")}
          {renderField("IECode", "IE Code")}
          {renderField("terminalLoginId", "Terminal Login ID")}

          {renderField("cargoDesc", "Cargo Description", 6)}
          {renderField("Notify_TO", "Notify To", 6)}

          {renderField("ShipperCity", "Shipper City", 4)}
          {renderField("cfsCode", "CFS Code", 4)}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Form13HeaderSection;