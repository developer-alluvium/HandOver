// src/components/Form13/Form13HeaderSection.jsx

import React from "react";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Paper,
  Autocomplete,
  createFilterOptions,
} from "@mui/material";
import { masterData, getCFSCodes } from "../../data/masterData";
import { getCFSCodesForLocation } from "../../data/cfsMasterData";
import { isFieldRequired, isFieldVisible } from "../../utils/form13Validations";
import { masterAPI } from "../../services/api";
import CustomAutocomplete from "../common/CustomAutocomplete";

const defaultFilterOptions = createFilterOptions();

const Form13HeaderSection = ({
  formData,
  vessels,
  pods,
  shippingLines = [],
  cfsCodes = [],
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
    portIds,
    issueToOptions
  } = masterData;

  const [fpodOptions, setFpodOptions] = React.useState([]);
  const [fpodLoading, setFpodLoading] = React.useState(false);
  const [fpodSearch, setFpodSearch] = React.useState("");

  const [shipperOptions, setShipperOptions] = React.useState([]);
  const [shipperLoading, setShipperLoading] = React.useState(false);
  const [shipperSearch, setShipperSearch] = React.useState("");

  React.useEffect(() => {
    let active = true;
    const fetchFpods = async (searchTerm) => {
      try {
        setFpodLoading(true);
        const res = await masterAPI.getFpodCodes(searchTerm);
        if (active) {
          const options = (res.data || []).map(item => ({
            value: item.PORT_CODE,
            label: `${item.PORT_CODE} - ${item.PORT_NAME}`
          }));
          setFpodOptions(options);
        }
      } catch (err) {
        console.error("Failed to load FPOD codes:", err);
      } finally {
        if (active) setFpodLoading(false);
      }
    };

    if (fpodSearch === "") {
      fetchFpods("");
    } else {
      const timer = setTimeout(() => {
        fetchFpods(fpodSearch);
      }, 1000);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    }

    return () => {
      active = false;
    };
  }, [fpodSearch]);

  React.useEffect(() => {
    let active = true;
    const fetchShippers = async (searchTerm, locCode, termCode) => {
      try {
        setShipperLoading(true);
        const res = await masterAPI.getShippers(searchTerm, locCode, termCode);
        if (active) {
          let options = (res.data || []).map(item => ({
            value: item.shipperNm,
            code: item.shipperCd,
            portCd: item.portCd,
            terminal: item.terminal,
            label: item.terminal
              ? `${item.shipperNm} (${item.shipperCd}) [Port: ${item.portCd}, Term: ${item.terminal}]`
              : item.portCd
              ? `${item.shipperNm} (${item.shipperCd}) [Port: ${item.portCd}]`
              : `${item.shipperNm} (${item.shipperCd})`
          }));

          const hasOther = options.some(o => (o.code || "").toUpperCase() === "OTHR" || (o.value || "").toUpperCase() === "OTHER SHIPPER");
          if (!hasOther) {
            options.push({
              value: "OTHER SHIPPER",
              code: "OTHR",
              portCd: locCode || "",
              label: "OTHER SHIPPER (OTHR)"
            });
          }

          setShipperOptions(options);
        }
      } catch (err) {
        console.error("Failed to load Shipper Master:", err);
      } finally {
        if (active) setShipperLoading(false);
      }
    };

    if (shipperSearch === "") {
      fetchShippers("", formData.locId, formData.terminalCode);
    } else {
      const timer = setTimeout(() => {
        fetchShippers(shipperSearch, formData.locId, formData.terminalCode);
      }, 500);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    }

    return () => {
      active = false;
    };
  }, [shipperSearch, formData.locId, formData.terminalCode]);

  React.useEffect(() => {
    if (formData.shipperNm) {
      const normNm = formData.shipperNm.trim().toUpperCase();
      const matched = shipperOptions.find(o => (o.value || "").toUpperCase() === normNm);
      if (matched) {
        const targetCd = matched.code !== undefined && matched.code !== null ? matched.code : "";
        if (formData.shipperCd !== targetCd) {
          onFormDataChange("header", "shipperCd", targetCd);
        }
      } else {
        if (formData.shipperCd !== "OTHR") {
          onFormDataChange("header", "shipperCd", "OTHR");
        }
      }
    }
  }, [formData.shipperNm, shipperOptions]);

  // --- DYNAMIC POD / FPOD OPTIONS FROM local master data ---
  // Managed locally via cascadingPods using the pre-loaded master data.

  // --- CASCADING DROPDOWN LOGIC ---

  // 1. All Vessels (Removed strict time check to ensure all master data is visible)
  const allActiveVessels = React.useMemo(() => {
    return vessels || [];
  }, [vessels]);

  // 2. Shipping Line Options (vessel codes + all master shipping line codes)
  const slOptions = React.useMemo(() => {
    const vesselCodes = allActiveVessels
      .filter(v => !formData.locId || v.locId === formData.locId)
      .map(v => v.bnfCode)
      .filter(Boolean);

    const masterCodes = Array.isArray(shippingLines)
      ? shippingLines.map(sl => sl.value || sl.code).filter(Boolean)
      : [];

    return [...new Set([...vesselCodes, ...masterCodes])].sort((a, b) => (a || "").localeCompare(b || ""));
  }, [allActiveVessels, formData.locId, shippingLines]);

  // 3. Location Options (Filtered by Shipping Line if selected, defaults to all portIds)
  const locOptions = React.useMemo(() => {
    if (formData.bnfCode) {
      const locIds = [...new Set(
        allActiveVessels
          .filter(v => v.bnfCode === formData.bnfCode)
          .map(v => v.locId)
      )];
      if (locIds.length > 0) {
        return locIds.map(id => {
          const port = portIds.find(p => p.value === id);
          return { value: id, label: port ? `${id} - ${port.label}` : id };
        }).sort((a, b) => a.label.localeCompare(b.label));
      }
    }
    // Fallback: return all portIds
    return portIds.map(p => ({
      value: p.value,
      label: `${p.value} - ${p.label}`
    })).sort((a, b) => a.label.localeCompare(b.label));
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

    // Normalize location ID for comparison
    const targetLocId = formData.locId.trim().toUpperCase();
    const locationData = pods.find(p => (p.locId || "").trim().toUpperCase() === targetLocId);

    if (!locationData) return [];

    let filteredPods = [];
    let allLocationPods = [];

    locationData.terminal?.forEach(term => {
      const termId = (term.terminalId || "").trim().toUpperCase();
      const termNm = (term.terminalNm || "").trim().toUpperCase();
      const selectedTerm = (formData.terminalCode || "").trim().toUpperCase();

      // Collect all pods for this location for fallback
      term.service?.forEach(serv => {
        if (serv.pod) allLocationPods.push(...serv.pod);
      });

      // Match Terminal (by ID or Name)
      if (!selectedTerm || termId === selectedTerm || termNm === selectedTerm) {
        term.service?.forEach(serv => {
          const servNm = (serv.serviceNm || "").trim().toUpperCase();
          const selectedServ = (formData.service || "").trim().toUpperCase();

          // Match Service
          if (!selectedServ || servNm === selectedServ) {
            if (serv.pod) filteredPods.push(...serv.pod);
          }
        });
      }
    });

    // Fallback 1: If terminal/service filter returned nothing, try matching only terminal
    if (filteredPods.length === 0 && formData.terminalCode) {
      const selectedTerm = formData.terminalCode.trim().toUpperCase();
      locationData.terminal?.forEach(term => {
        const termId = (term.terminalId || "").trim().toUpperCase();
        const termNm = (term.terminalNm || "").trim().toUpperCase();
        if (termId === selectedTerm || termNm === selectedTerm) {
          term.service?.forEach(serv => {
            if (serv.pod) filteredPods.push(...serv.pod);
          });
        }
      });
    }

    // Fallback 2: If still no pods found but we have some for this location, show all
    const podsToUse = filteredPods.length > 0 ? filteredPods : allLocationPods;

    // Unique by podCd and sort
    const uniqueMap = new Map(podsToUse.map(p => [p.podCd, p]));
    if (formData.pod && !uniqueMap.has(formData.pod)) {
      uniqueMap.set(formData.pod, { podCd: formData.pod, podNm: formData.pod });
    }
    return [...uniqueMap.values()]
      .sort((a, b) => (a.podNm || "").localeCompare(b.podNm || ""));
  }, [pods, formData.locId, formData.terminalCode, formData.service, formData.pod]);

  // 9. CFS Options with location filtering from cfs-loc-code.xlsx and strict deduplication
  const cfsOptionsMapped = React.useMemo(() => {
    const masterItems = getCFSCodesForLocation(formData.locId);

    if (formData.locId) {
      const locPrefix = formData.locId.toUpperCase().trim().substring(0, 5);
      const filtered = masterItems.filter((c) => {
        const val = (c.value || c.cfsCode || "").toUpperCase();
        return val.startsWith(locPrefix);
      });
      return (filtered.length > 0 ? filtered : masterItems).sort((a, b) =>
        (a.label || "").localeCompare(b.label || "")
      );
    }

    const unique = [];
    const seen = new Set();
    for (const item of masterItems) {
      const key = (item.value || item.cfsCode || "").trim().toUpperCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    return unique.sort((a, b) => (a.label || "").localeCompare(b.label || ""));
  }, [formData.locId]);
  
  // 10. Selected Vessel Details (for Cut-off display)
  const selectedVesselData = React.useMemo(() => {
    if (!formData.vesselNm) return null;
    return allActiveVessels.find(v => 
      v.vesselNm === formData.vesselNm &&
      (!formData.locId || v.locId === formData.locId) &&
      (!formData.viaNo || v.viaNo === formData.viaNo)
    );
  }, [allActiveVessels, formData.vesselNm, formData.locId, formData.viaNo]);

  // --- RENDERING HELPERS ---

  const SectionHeader = ({ title }) => (
    <div className="panel-title">
      {title}
    </div>
  );

  const FormLabelCustom = ({ label, required }) => (
    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', mb: 0.35, fontWeight: 500 }}>
      {label} {required && <span style={{ color: '#d32f2f', marginLeft: '4px' }}>*</span>}
    </Typography>
  );

  const renderField = (fieldName, label, md = 3) => {
    if (!isFieldVisible(fieldName, formData)) return null;

    const required = isFieldRequired(fieldName, formData);

    if (fieldName === "shipperNm") {
      return (
        <Grid item xs={12} sm={6} md={md}>
          <FormLabelCustom label={label} required={required} />
          <CustomAutocomplete
            options={shipperOptions}
            value={formData.shipperNm}
            onChange={(val, rawOpt) => {
              if (!val) {
                onFormDataChange("header", "shipperNm", "");
                onFormDataChange("header", "shipperCd", "");
              } else if (typeof rawOpt === "object" && rawOpt.code) {
                onFormDataChange("header", "shipperNm", rawOpt.value || val);
                onFormDataChange("header", "shipperCd", rawOpt.code);
              } else {
                onFormDataChange("header", "shipperNm", val);
                const matched = shipperOptions.find(o => (o.value || "").toUpperCase() === String(val).toUpperCase());
                onFormDataChange("header", "shipperCd", matched ? (matched.code ?? "OTHR") : "OTHR");
              }
            }}
            onInputChange={(newText) => {
              setShipperSearch(newText);
              onFormDataChange("header", "shipperNm", newText);
              const matched = shipperOptions.find(o => (o.value || "").toUpperCase() === String(newText).toUpperCase());
              onFormDataChange("header", "shipperCd", matched ? (matched.code ?? "OTHR") : "OTHR");
            }}
            freeSolo
            error={!!validationErrors.shipperNm}
            noOptionsText="Shipper is not present"
            loading={shipperLoading}
          />
        </Grid>
      );
    }

    if (fieldName === "fpod") {
      return (
        <Grid item xs={12} sm={6} md={md}>
          <FormLabelCustom label={label} required={required} />
          <Autocomplete
            size="small"
            options={fpodOptions}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.label || "";
            }}
            value={
              fpodOptions.find(opt => opt.value === formData.fpod) || 
              (formData.fpod ? { value: formData.fpod, label: formData.fpod } : null)
            }
            onChange={(e, newValue) => {
              const val = newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : "";
              onFormDataChange("header", fieldName, val);
            }}
            onInputChange={(e, newInputValue, reason) => {
              if (reason === 'input') {
                setFpodSearch(newInputValue);
              } else if (reason === 'clear') {
                setFpodSearch("");
              }
            }}
            loading={fpodLoading}
            disabled={loading || !formData.locId}
            noOptionsText={fpodLoading ? "Loading..." : `${label} is not present`}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder={`Search ${label}...`}
                fullWidth
                error={!!validationErrors[fieldName]}
              />
            )}
          />
        </Grid>
      );
    }

    let selectOptions = [];
    let isSelect = true;

    // Map field names to their respective filtered options
    switch (fieldName) {
      case "bnfCode":
        selectOptions = slOptions.map(opt => {
          const match = shippingLines.find(sl =>
            (sl.value || sl.code || "") === opt ||
            (sl.label || "") === opt
          );
          return { value: match ? (match.value || match.code || opt) : opt, label: match ? match.label : opt };
        });
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
        selectOptions = cascadingPods.map(p => ({
          value: p.podCd,
          label: `${p.podCd} - ${p.podNm}`
        }));
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
        selectOptions = cfsOptionsMapped;
        break;
      case "issueTo":
        selectOptions = issueToOptions || [];
        break;
      case "shipperNm":
        selectOptions = shipperOptions;
        break;
      default:
        isSelect = false;
    }

    const isDisabled = loading || (
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
          <CustomAutocomplete
            options={selectOptions}
            value={formData[fieldName]}
            onChange={(val, rawOpt) => {
              onFormDataChange("header", fieldName, val);
              if (fieldName === "shipperNm" && rawOpt && rawOpt.code) {
                onFormDataChange("header", "shipperCd", rawOpt.code);
              }
            }}
            onInputChange={(newText) => {
              if (fieldName === "shipperNm") {
                setShipperSearch(newText);
                onFormDataChange("header", fieldName, newText);
              }
            }}
            placeholder={`Search ${label}...`}
            disabled={isDisabled}
            freeSolo={fieldName === "cfsCode" || fieldName === "shipperNm" || fieldName === "pod"}
            error={!!validationErrors[fieldName]}
            noOptionsText={`${label} is not present`}
            loading={fieldName === "shipperNm" ? shipperLoading : false}
          />
          {fieldName === "vesselNm" && selectedVesselData?.chaValidTo && (
            <Typography 
              variant="caption" 
              sx={{ color: "#d32f2f", fontWeight: "bold", display: "block", mt: 0.5 }}
            >
              Cut-off: {selectedVesselData.chaValidTo}
            </Typography>
          )}
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
      <div className="panel">
        <SectionHeader title="Basic Information" />
        <Grid container spacing={2}>
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
          {renderField("bookCopyBlNo", "BL No")}

          {renderField("mobileNo", "Mobile No")}
          {renderField("emailId", "Email IDs")}
          {renderField("issueTo", "Issue To")}
          {renderField("IsEarlyGateIn", "Early Gate In")}
        </Grid>
      </div>

      <div className="panel">
        <SectionHeader title="Stakeholder & Additional Info" />
        <Grid container spacing={2}>
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
      </div>
    </Box>
  );
};

export default Form13HeaderSection;
