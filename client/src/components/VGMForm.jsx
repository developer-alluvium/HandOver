import React, { useState, useEffect, useRef, useMemo } from "react";
import { Autocomplete, TextField, InputAdornment, Button, Box, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import axios from "axios";
import { useFormik, FormikProvider, useFormikContext } from "formik";
import { useSnackbar } from "notistack";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AppbarComponent from "./AppbarComponent";
import { vgmAPI, masterAPI } from "../services/api.js";
import { vgmValidationSchema } from "../utils/validation.js";
import { validateFile, fileToBase64 } from "../utils/fileUtils.js";
import {
  CONTAINER_SIZES,
  CARGO_TYPES,
  VGM_METHODS,
  SHIPPER_TYPES,
  WEIGHT_UOMS,
  REGISTRATION_TYPES,
  ATTACHMENT_TITLES,
  PORTS,
  IMO_NUMBERS,
  CONTAINER_TYPES,
  getTerminalCodesByPort,
  AUTHORIZED_PERSONS,
} from "../utils/constants/masterDataVGM.js";
import "../styles/VGM.scss";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ImagePreview from "../gallery/ImagePreview.jsx";
import VGMDownload from "./VGMDownload.jsx";
import { generateVGMPdf, EXPORTERS } from "../utils/VGMPdfGenerator.js";


// --- Helper Components ---
const InputField = ({
  label,
  name,
  type = "text",
  required = false,
  ...props
}) => {
  const formik = useFormikContext();
  return (
    <div className="form-group">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        name={name}
        className={`form-control ${formik.touched[name] && formik.errors[name] ? "error" : ""
          }`}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        {...props}
      />
      {formik.touched[name] && formik.errors[name] && (
        <span className="error-text">{formik.errors[name]}</span>
      )}
    </div>
  );
};

const filterOptions = (options, { inputValue }) => {
  const query = (inputValue || "").toLowerCase().trim();
  if (!query) return options;

  return options
    .filter((option) => {
      const searchLabel = (option.searchLabel || "").toLowerCase();
      const searchValue = (option.searchValue || "").toLowerCase();

      // Use includes for flexibility
      return searchLabel.includes(query) || searchValue.includes(query);
    })
    .sort((a, b) => {
      // Prioritize results that start with the query
      const aLabel = (a.searchLabel || "").toLowerCase();
      const bLabel = (b.searchLabel || "").toLowerCase();
      const aStarts = aLabel.startsWith(query);
      const bStarts = bLabel.startsWith(query);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Secondary sort: length (shorter names first for more exact matches)
      if (aLabel.length !== bLabel.length) {
        return aLabel.length - bLabel.length;
      }

      return aLabel.localeCompare(bLabel);
    });
};

const CustomSearchSelect = ({ options, value, onChange, placeholder, showValue, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Synchronize searchTerm with selected value only when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      const selected = options.find(opt => String(opt.value) === String(value));
      setSearchTerm(selected ? selected.label : "");
    }
  }, [value, isOpen, options]);

  const filteredOptions = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return options;

    return options
      .filter((option) => {
        const sLabel = (option.label || "").toLowerCase();
        const sValue = (option.value || "").toLowerCase();
        return sLabel.includes(query) || sValue.includes(query);
      })
      .sort((a, b) => {
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();
        const aStarts = aLabel.startsWith(query);
        const bStarts = bLabel.startsWith(query);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        if (aLabel.length !== bLabel.length) return aLabel.length - bLabel.length;
        return aLabel.localeCompare(bLabel);
      });
  }, [options, searchTerm]);

  return (
    <div className="custom-select-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="form-control"
          autoComplete="off"
          placeholder={placeholder || `Select ${label}`}
          value={searchTerm}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm(""); // Clear on focus for easier searching
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filteredOptions.length > 0) {
              onChange(filteredOptions[0]);
              setIsOpen(false);
              e.preventDefault();
            }
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
        />
        <span className={`dropdown-arrow ${isOpen ? "open" : ""}`}>▼</span>
      </div>

      {isOpen && (
        <ul className="dropdown-list">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                className={`dropdown-item ${String(option.value) === String(value) ? "selected" : ""}`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="dropdown-item no-matches">No matches found</li>
          )}
        </ul>
      )}
    </div>
  );
};

const SelectField = ({ label, name, options, required = false, showValue = false, ...props }) => {
  const formik = useFormikContext();

  // Normalize options to ensure consistent label/value structure
  const normalizedOptions = useMemo(() => {
    const uniqueOptions = new Map();
    (options || []).forEach((opt) => {
      if (!opt) return;

      const rawLabel = String(opt.label || opt.lable || opt.shipperNm || opt.name || (typeof opt === 'string' ? opt : "")).trim();
      const value = String(opt.value || opt.shipperId || opt.code || (typeof opt === 'string' ? opt : "")).trim();

      // Optionally show value in label (e.g., "GPC : General Purpose Container")
      const displayLabel = (showValue && value && value !== rawLabel)
        ? `${value} : ${rawLabel}`
        : rawLabel;

      if (value && !uniqueOptions.has(value)) {
        uniqueOptions.set(value, {
          label: displayLabel,
          value,
        });
      }
    });

    // Sort matches alphabetically by label
    return Array.from(uniqueOptions.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [options, showValue]);

  return (
    <div className="form-group">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      <CustomSearchSelect
        label={label}
        options={normalizedOptions}
        value={formik.values[name]}
        onChange={(newValue) => {
          formik.setFieldValue(name, newValue ? newValue.value : "");
        }}
        {...props}
      />
      {formik.touched[name] && formik.errors[name] && (
        <span className="error-text">{formik.errors[name]}</span>
      )}
    </div>
  );
};

// --- Main Component ---

const VGMForm = ({
  editMode = false,
  existingRequest = null,
  onSuccess,
  onCancel,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { "*": urlJobNo } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { userData, shippers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingLines, setShippingLines] = useState([]);
  const [jobNoSearch, setJobNoSearch] = useState("");
  const [loadingJob, setLoadingJob] = useState(false);
  const [fetchedJobData, setFetchedJobData] = useState(null);
  const [containersList, setContainersList] = useState([]);
  const [selectedContainerNo, setSelectedContainerNo] = useState("");

  const [attachments, setAttachments] = useState([]);
  const [isEditMode, setIsEditMode] = useState(editMode);
  const [requestData, setRequestData] = useState(existingRequest);
  const [isPdfDownloaded, setIsPdfDownloaded] = useState(false);
  const [showVGMDownload, setShowVGMDownload] = useState(false);
  const [submittedVGMData, setSubmittedVGMData] = useState(null);
  const [selectedExporter, setSelectedExporter] = useState("");
  const [generatingExporterPdf, setGeneratingExporterPdf] = useState(false);
  const checkingBookingRef = useRef(false);
  const lastCheckedBookingRef = useRef({ bookNo: "", linerId: "" });
  const bookingCheckTimerRef = useRef(null);

  const VGM_INITIAL_VALUES = useMemo(() => ({
    linerId: "",
    vesselNm: "",
    voyageNo: "",
    bookNo: "",
    locId: "",
    handoverLoc: "",
    shipperTp: "O",
    authPrsnNm: "",
    authDesignation: "",
    authMobNo: "",
    odexRefNo: userData?.pyrCode,
    vgmEvalMethod: "M1",
    cntnrNo: "",
    cntnrSize: "",
    cntnrTp: "",
    cargoTp: "GEN",
    cscPlateMaxWtLimit: "",
    cscPlateMaxWtUom: "KG",
    cargoWt: "",
    cargoWtUom: "KG",
    tareWt: "",
    tareWtUom: "KG",
    totWt: "",
    totWtUom: "KG",
    imoNo1: "",
    unNo1: "",
    shipId: "",
    shipperNm: "",
    shipRegTP: "",
    shipRegNo: "",
    weighBridgeRegNo: "",
    weighBridgeAddrLn1: "",
    weighBridgeAddrLn2: "",
    weighBridgeAddrLn3: "",
    weighBridgeSlipNo: "",
    weighBridgeWtTs: "",
    terminalCode: "",
  }), [userData]);

  const [formValues, setFormValues] = useState(VGM_INITIAL_VALUES);
  // --- Initialize Formik ---
  const formik = useFormik({
    initialValues: formValues,
    enableReinitialize: true,
    validationSchema: vgmValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Filter payload to only include fields defined in initial values
        // This prevents unrecognized field errors from ODeX (like sealNo, sealTp)
        const payload = {};
        Object.keys(VGM_INITIAL_VALUES).forEach((key) => {
          if (values[key] !== undefined) {
            payload[key] = values[key];
          }
        });

        // Manual Transformations
        payload.cscPlateMaxWtLimit = values.cscPlateMaxWtLimit?.toString();
        payload.totWt = values.totWt?.toString();

        if (values.cargoTp === "HAZ") {
          payload.imoNo1 = values.imoNo1;
          payload.unNo1 = values.unNo1;
        }

        if (values.vgmEvalMethod === "M2") {
          payload.cargoWt = values.cargoWt?.toString();
          payload.tareWt = values.tareWt?.toString();
        }


        // --- DUPLICATE CHECK ---
        const { bookNo, cntnrNo, linerId } = values;
        if (!isEditMode) {
          try {
            const dupResponse = await vgmAPI.getRequests({
              bookingNo: bookNo,
              containerNo: cntnrNo,
              linerId: linerId,
              exactMatch: true
            });

            const existing = (dupResponse.data?.requests || []).filter(r => r.status !== 'CANCELLED');
            if (existing.length > 0) {
              enqueueSnackbar(`Duplicate submission detected: A VGM request for Container ${cntnrNo} and Booking ${bookNo} already exists.`, { variant: "error" });
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("Duplicate check failed, proceeding:", err);
          }
        }
        // --- END DUPLICATE CHECK ---

        if (values.shipId) payload.shipId = values.shipId;
        else {
          payload.shipperNm = values.shipperNm;
          payload.shipRegTP = values.shipRegTP;
          payload.shipRegNo = values.shipRegNo;
        }

        // Convert to YYYY-MM-DD HH:mm:ss format for backend, ensure seconds are present
        if (values.weighBridgeWtTs && values.weighBridgeWtTs.trim() !== "") {
          let dateTimeStr = values.weighBridgeWtTs.trim();

          // Pattern: DD-MM-YYYY HH:mm(:ss)
          const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})(?::(\d{2}))?$/;
          const ddmmMatch = dateTimeStr.match(ddmmyyyyPattern);

          if (ddmmMatch) {
            const [, day, month, year, hour, minute, second] = ddmmMatch;
            const paddedSecond = second || "00";
            payload.weighBridgeWtTs = `${year}-${month}-${day} ${hour}:${minute}:${paddedSecond}`;
          } else {
            // Pattern: YYYY-MM-DD HH:mm(:ss) or YYYY-MM-DDTHH:mm(:ss)
            const yyyymmddPattern = /^(\d{4})-(\d{2})-(\d{2})[T ]?(\d{2}):(\d{2})(?::(\d{2}))?$/;
            const yyyyMatch = dateTimeStr.match(yyyymmddPattern);

            if (yyyyMatch) {
              const [, year, month, day, hour, minute, second] = yyyyMatch;
              const paddedSecond = second || "00";
              payload.weighBridgeWtTs = `${year}-${month}-${day} ${hour}:${minute}:${paddedSecond}`;
            } else {
              // Fallback: keep as-is but try to append seconds if missing
              if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateTimeStr)) {
                payload.weighBridgeWtTs = dateTimeStr + ":00";
              } else {
                payload.weighBridgeWtTs = dateTimeStr;
              }
            }
          }
        } else {
          // If empty, don't send or keep empty
          payload.weighBridgeWtTs = "";
        }


        if (attachments.length > 0) payload.vgmWbAttList = attachments;

        let response;

        // --- FIX 1: Strict Edit Mode Logic to prevent Duplicate Requests ---
        if (isEditMode) {
          const vgmId = requestData?._id || requestData?.vgmId;
          if (!vgmId) {
            throw new Error("Unable to update: VGM ID is missing.");
          }
          response = await vgmAPI.updateRequest(vgmId, payload);
        } else {
          response = await vgmAPI.submit(payload);
        }

        const responseBody = response.data; // The whole response object

        if (responseBody) {
          // --- FIX 2: Check for logical errors inside the success response ---
          // const innerResponse = responseBody.data?.response; // "ERROR: 1 - Shipping Line..."
          const innerResponse = responseBody.data?.remarks;
          const isLogicalError =
            typeof innerResponse === "string" &&
            innerResponse.trim().toUpperCase().startsWith("ERROR");

          if (responseBody.logId) {
            setIsEditMode(true);
            setRequestData({ _id: responseBody.logId, vgmId: responseBody.logId, ...payload });
          }

          if (isLogicalError) {
            // Case: Server accepted (200 OK) but business logic failed (Pending/Error)
            // ACTION: Show warning, DO NOT CLEAR FORM
            enqueueSnackbar(`${innerResponse}`, {
              variant: "warning",
              autoHideDuration: 6000,
            });
          } else {
            // Case: Pure Success (Verified)
            enqueueSnackbar(
              isEditMode
                ? "VGM Updated Successfully"
                : "VGM Submitted Successfully",
              { variant: "success" }
            );

            // Store VGM data and show download modal for new submissions
            if (!isEditMode) {
              setSubmittedVGMData(values);
              setShowVGMDownload(true);
            }
          }
        }
      } catch (error) {
        const msg =
          error.response?.data?.message || error.message || "Submission Failed";
        enqueueSnackbar(msg, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch Shipping Lines from Master API
  useEffect(() => {
    const fetchShippingLines = async () => {
      try {
        const response = await masterAPI.getShippingLines();
        // API returns { success: true, data: [...] }, and interceptor extracts data
        const rawData = response.data;
        let lines = [];

        // Robust extraction logic
        if (Array.isArray(rawData)) {
          lines = rawData;
        } else if (rawData?.data && Array.isArray(rawData.data)) {
          lines = rawData.data;
        } else if (rawData?.success && Array.isArray(rawData.data)) {
          lines = rawData.data;
        }


        if (lines.length > 0) {
          setShippingLines(lines);
        } else {
          console.warn("[VGM] API returned 0 lines. Response:", rawData);
          enqueueSnackbar("No shipping lines found in API response", { variant: "warning" });
        }
      } catch (error) {
        console.error("Error fetching shipping lines:", error);
        enqueueSnackbar("Failed to fetch shipping lines from API", { variant: "error" });
      }
    };
    fetchShippingLines();
  }, []);

  // --- Consolidated Initialization & Reset Logic ---
  useEffect(() => {
    const initializeMode = async () => {
      // 1. Check for reset signal from TopNavDropdown
      if (location.state?.reset) {
        setIsEditMode(false);
        setRequestData(null);
        setFormValues(VGM_INITIAL_VALUES);
        formik.resetForm({ values: VGM_INITIAL_VALUES });
        setJobNoSearch("");
        setFetchedJobData(null);
        setContainersList([]);
        setSelectedContainerNo("");
        setAttachments([]);
        window.scrollTo(0, 0);
        return;
      }

      // 2. Normal Initialization (Edit / New)
      if (location.state?.editMode && location.state?.vgmId) {
        setIsEditMode(true);
        await fetchRequestDetails(location.state.vgmId);
      } else if (editMode && existingRequest) {
        setIsEditMode(true);
        setRequestData(existingRequest);
        prefillForm(existingRequest);
      } else {
        // Fresh request
        setIsEditMode(false);
        setFormValues(VGM_INITIAL_VALUES);
      }
    };
    initializeMode();
  }, [location.state, editMode, existingRequest, VGM_INITIAL_VALUES]);

  // Handle Job No from URL
  useEffect(() => {
    if (urlJobNo && shippingLines.length > 0 && !isEditMode && !fetchedJobData && !loadingJob) {
      setJobNoSearch(urlJobNo);
      handleJobSearch(urlJobNo);
    }
  }, [urlJobNo, shippingLines.length, isEditMode]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (bookingCheckTimerRef.current) {
        clearTimeout(bookingCheckTimerRef.current);
      }
    };
  }, []);



  const fetchRequestDetails = async (vgmId) => {
    try {
      setLoading(true);
      const response = await vgmAPI.getRequestById(vgmId);
      setRequestData(response.data);
      prefillForm(response.data);
    } catch (error) {
      enqueueSnackbar("Failed to load request details", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const prefillForm = (request) => {
    if (!request) return;
    const requestBody = request.request?.body || request;

    const newValues = {
      linerId: requestBody.linerId || "",
      vesselNm: requestBody.vesselNm || "",
      voyageNo: requestBody.voyageNo || "",
      bookNo: requestBody.bookNo || "",
      locId: requestBody.locId || "",
      handoverLoc: requestBody.handoverLoc || "",
      shipperTp: requestBody.shipperTp || "O",
      authPrsnNm: requestBody.authPrsnNm || "",
      authDesignation: requestBody.authDesignation || "",
      authMobNo: requestBody.authMobNo || "",
      odexRefNo: userData?.pyrCode,
      vgmEvalMethod: requestBody.vgmEvalMethod || "M1",
      cntnrNo: requestBody.cntnrNo || "",
      cntnrSize: requestBody.cntnrSize || "",
      cntnrTp: requestBody.cntnrTp || "",
      cargoTp: requestBody.cargoTp || "GEN",
      cscPlateMaxWtLimit: requestBody.cscPlateMaxWtLimit || "",
      cscPlateMaxWtUom: requestBody.cscPlateMaxWtUom || "KG",
      cargoWt: requestBody.cargoWt || "",
      cargoWtUom: requestBody.cargoWtUom || "KG",
      tareWt: requestBody.tareWt || "",
      tareWtUom: requestBody.tareWtUom || "KG",
      totWt: requestBody.totWt || "",
      totWtUom: requestBody.totWtUom || "KG",
      imoNo1: requestBody.imoNo1 || "",
      unNo1: requestBody.unNo1 || "",
      shipId: requestBody.shipId || "",
      shipperNm: requestBody.shipperNm || "",
      shipRegTP: requestBody.shipRegTP || "",
      shipRegNo: requestBody.shipRegNo || "",
      weighBridgeRegNo: requestBody.weighBridgeRegNo || "",
      weighBridgeAddrLn1: requestBody.weighBridgeAddrLn1 || "",
      weighBridgeAddrLn2: requestBody.weighBridgeAddrLn2 || "",
      weighBridgeAddrLn3: requestBody.weighBridgeAddrLn3 || "",
      weighBridgeSlipNo: requestBody.weighBridgeSlipNo || "",
      weighBridgeWtTs: requestBody.weighBridgeWtTs || "",
      terminalCode: requestBody.terminalCode || "",
    };

    formik.setValues(newValues);
    setFormValues(newValues);

    if (requestBody.vgmWbAttList) setAttachments(requestBody.vgmWbAttList);
    enqueueSnackbar("Form pre-filled with existing data", { variant: "info" });
  };

  const loadExistingBooking = async (vgmId) => {
    try {
      setLoading(true);
      const response = await vgmAPI.getRequestById(vgmId);

      // Determine the object to modify (handle potential nested structure)
      // We modify the data in memory before passing to prefillForm
      const responseData = response.data;
      const targetBody = responseData.request?.body || responseData;

      // Clear specific fields as requested
      targetBody.cntnrNo = "";
      targetBody.cscPlateMaxWtLimit = "";
      targetBody.tareWt = "";
      targetBody.totWt = "";
      // Clear additional fields when copying
      targetBody.weighBridgeSlipNo = "";
      targetBody.weighBridgeWtTs = "";
      targetBody.vgmWbAttList = []; // Clear attachments

      // Clear attachments state
      setAttachments([]);

      prefillForm(responseData);
      enqueueSnackbar("Form data copied from existing booking.", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Failed to load existing booking details", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounced booking check that triggers while typing
  const debouncedCheckBooking = (bookNo, linerId) => {
    // Clear existing timer
    if (bookingCheckTimerRef.current) {
      clearTimeout(bookingCheckTimerRef.current);
    }

    // Set new timer - check after 800ms of no typing
    bookingCheckTimerRef.current = setTimeout(() => {
      checkBookingExists(bookNo, linerId);
    }, 800);
  };

  const checkBookingExists = async (bookNo, linerId) => {
    const currentBookNo = bookNo || formik.values.bookNo;
    const currentLinerId = linerId || formik.values.linerId;

    // Early returns for invalid state
    if (!currentBookNo || !currentLinerId) {
      return;
    }

    // Prevent duplicate checks if already checking
    if (checkingBookingRef.current) {
      return;
    }

    // Skip if we already checked this exact combination
    if (
      lastCheckedBookingRef.current.bookNo === currentBookNo &&
      lastCheckedBookingRef.current.linerId === currentLinerId
    ) {
      return;
    }

    try {
      checkingBookingRef.current = true;
      lastCheckedBookingRef.current = { bookNo: currentBookNo, linerId: currentLinerId };

      const startTime = performance.now();

      // Use exact matching to prevent partial matches
      const response = await vgmAPI.getRequests({
        bookingNo: currentBookNo,
        linerId: currentLinerId,
        limit: 5,
        exactMatch: true, // Only match exact booking numbers
      });

      const endTime = performance.now();

      if (response.data && response.data.requests && response.data.requests.length > 0) {
        // Filter out current ID if in edit mode
        const validRequests = response.data.requests.filter(r =>
          !isEditMode || (requestData && (r.vgmId !== requestData._id && r.vgmId !== requestData.vgmId))
        );

        if (validRequests.length > 0) {
          const match = validRequests[0];
          // Close any existing persistent snackbars to prevent maxSnack warning
          closeSnackbar();

          // Show notification immediately (removed delay)
          enqueueSnackbar(
            "Booking information for this Shipping Line and Booking No. exists. Do you wish to copy here?",
            {
              variant: "default",
              persist: true,
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
              content: (key, message) => (
                <div style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12)',
                  maxWidth: '600px',
                  fontSize: '0.95rem'
                }}>
                  <div style={{ flex: 1 }}>{message}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        closeSnackbar(key);
                        loadExistingBooking(match.vgmId);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#90caf9',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => closeSnackbar(key)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f48fb1',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        textTransform: 'uppercase'
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              )
            }
          );
        } else {
          console.log('[BOOKING CHECK] No valid requests after filtering');
        }
      } else {
        console.log('[BOOKING CHECK] No matching requests found');
      }
    } catch (error) {
      console.error("[BOOKING CHECK] Error:", error);
    } finally {
      checkingBookingRef.current = false;
    }
  };

  const hasShipperAuth = shippers.some(
    (shipper) =>
      shipper.shipperId === formik.values.shipId && shipper.serviceNm === "VGM"
  );

  const handleFileUpload = async (event, attTitle) => {
    const file = event.target.files[0];
    if (!file) return;
    const errors = validateFile(file);
    if (errors.length > 0) {
      enqueueSnackbar(errors.join(", "), { variant: "error" });
      return;
    }
    try {
      const base64Data = await fileToBase64(file);
      const newAttachment = { attNm: file.name, attData: base64Data, attTitle };
      setAttachments((prev) => [
        ...prev.filter((att) => att.attTitle !== attTitle),
        newAttachment,
      ]);
      enqueueSnackbar("File uploaded", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Error processing file", { variant: "error" });
    }
  };

  const removeAttachment = (attTitle) => {
    setAttachments((prev) => prev.filter((att) => att.attTitle !== attTitle));
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate("/dashboard");
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const values = formik.values;

    // Header
    doc.setFontSize(14);
    doc.text("INFORMATION ABOUT VERIFIED GROSS MASS OF CONTAINER", 105, 20, { align: "center" });
    doc.setFontSize(10);
    // Find the selected shipping line name
    const selectedLiner = shippingLines.find(line =>
      String(line.value || line.code) === String(values.linerId)
    );
    const linerName = selectedLiner?.label || selectedLiner?.name || "SHIPPING LINE";

    doc.text(`To ${linerName},`, 14, 30);
    doc.text("Annexure-1", 180, 15, { align: "right" });

    const tableData = [
      ["1", "Name of the Shipper", values.shipperNm || "-"],
      [
        "2",
        "Shipper Registration/License No. (IEC No./CIN No.)",
        values.shipRegNo || "-",
      ],
      [
        "3",
        "Name and designation of official of the shipper authorised to sign document",
        `${values.authPrsnNm || ""} - ${values.authDesignation || ""}`,
      ],
      [
        "4",
        "24 x 7 contact details of authorised official of shipper",
        values.authMobNo || "-",
      ],
      ["5", "Container No.", values.cntnrNo || "-"],
      [
        "6",
        "Container Size (TEU/FEU/Other)",
        (() => {
          if (!values.cntnrSize) return "-";
          const size = values.cntnrSize;
          const type = (values.cntnrTp || "").toUpperCase();
          const is20 = size.includes("20");
          const is40 = size.includes("40") || size.includes("45");

          if (type.includes("OPEN TOP") || type.includes("OTP") || type.includes("22U") || type.includes("42U") || type.includes("48U")) {
            return `${size} OT`;
          }
          if (type.includes("FLAT RACK") || type.includes("FRC") || type.includes("22P") || type.includes("42P") || type.includes("28P") || type.includes("48P")) {
            return `${size} FR`;
          }
          if (is20) return `${size} TEU`;
          if (is40) return `${size} FEU`;
          return `${size} TEU`;
        })()
      ],
      [
        "7",
        "Maximum permissible weight of container as per the CSC plate",
        `${values.cscPlateMaxWtLimit || ""} ${values.cscPlateMaxWtUom || ""}`,
      ],
      [
        "8",
        "Weighbridge registration no. & Address of Weighbridge",
        `${values.weighBridgeRegNo || ""}\n${values.weighBridgeAddrLn1 || ""
        }, ${values.weighBridgeAddrLn2 || ""}, ${values.weighBridgeAddrLn3 || ""
        }`,
      ],
      [
        "9",
        "Verified gross mass of container (Method-1/Method-2)",
        `${values.totWt || ""} ${values.totWtUom || ""} (${values.vgmEvalMethod === "M1" ? "METHOD-1" : "METHOD-2"
        })`,
      ],
      [
        "10",
        "Date and time of weighing",
        values.weighBridgeWtTs?.replace("T", " ").slice(0, 16) || "-",
      ],
      ["11", "Weighing slip no.", values.weighBridgeSlipNo || "-"],
      [
        "12",
        "Type (Normal/Reefer/Hazardous/Others)",
        values.cargoTp === "GEN" ? "Normal" : values.cargoTp || "-",
      ],
      [
        "13",
        "If Hazardous, UN No., IMDG class",
        values.cargoTp === "HAZ"
          ? `${values.unNo1 || ""} / ${values.imoNo1 || ""}`
          : "-",
      ],
    ];

    autoTable(doc, {
      startY: 40,
      head: [["Sr. No.", "Details of Information", "Particulars"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [255, 255, 255], textColor: 0, lineWidth: 0.1 },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 100 },
        2: { cellWidth: "auto" },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 20;

    doc.text("Signature of authorised person of shipper", 120, finalY);
    doc.text(`Name - ${values.authPrsnNm || ""}`, 120, finalY + 10);
    doc.text(
      `Date - ${new Date().toLocaleDateString("en-GB")}`,
      120,
      finalY + 20
    );

    doc.save(`VGM_Annexure1_${values.cntnrNo || "draft"}.pdf`);
    setIsPdfDownloaded(true);
    enqueueSnackbar("PDF Downloaded. You can now submit.", {
      variant: "success",
    });
  };

  // Handle exporter-specific PDF download
  const handleExporterPdfDownload = async (exporterKey) => {
    if (!exporterKey) return;

    const exporter = EXPORTERS.find((e) => e.key === exporterKey);
    if (!exporter) {
      enqueueSnackbar("Invalid exporter selected", { variant: "error" });
      return;
    }

    setSelectedExporter(exporterKey);
    setGeneratingExporterPdf(true);

    try {
      const filename = await generateVGMPdf(formik.values, exporter);
      enqueueSnackbar(`PDF generated: ${filename}`, { variant: "success" });
      setIsPdfDownloaded(true);
    } catch (error) {
      console.error("PDF generation error:", error);
      enqueueSnackbar("Failed to generate PDF. Please try again.", { variant: "error" });
    } finally {
      setGeneratingExporterPdf(false);
      setSelectedExporter("");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = formik.values;
      // Filter payload to only include fields defined in initial values
      const payload = {};
      Object.keys(VGM_INITIAL_VALUES).forEach((key) => {
        if (values[key] !== undefined) {
          payload[key] = values[key];
        }
      });

      // Manual Transformations
      payload.cscPlateMaxWtLimit = values.cscPlateMaxWtLimit?.toString();
      payload.totWt = values.totWt?.toString();

      if (values.cargoTp === "HAZ") {
        payload.imoNo1 = values.imoNo1;
        payload.unNo1 = values.unNo1;
      }

      if (values.vgmEvalMethod === "M2") {
        payload.cargoWt = values.cargoWt?.toString();
        payload.tareWt = values.tareWt?.toString();
      }

      if (values.shipId) payload.shipId = values.shipId;
      else {
        payload.shipperNm = values.shipperNm;
        payload.shipRegTP = values.shipRegTP;
        payload.shipRegNo = values.shipRegNo;
      }

      // Convert to YYYY-MM-DD HH:mm:ss format for backend, ensure seconds are present
      if (values.weighBridgeWtTs && values.weighBridgeWtTs.trim() !== "") {
        let dateTimeStr = values.weighBridgeWtTs.trim();

        // Pattern: DD-MM-YYYY HH:mm(:ss)
        const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})(?::(\d{2}))?$/;
        const ddmmMatch = dateTimeStr.match(ddmmyyyyPattern);

        if (ddmmMatch) {
          const [, day, month, year, hour, minute, second] = ddmmMatch;
          const paddedSecond = second || "00";
          payload.weighBridgeWtTs = `${year}-${month}-${day} ${hour}:${minute}:${paddedSecond}`;
        } else {
          // Pattern: YYYY-MM-DD HH:mm(:ss) or YYYY-MM-DDTHH:mm(:ss)
          const yyyymmddPattern = /^(\d{4})-(\d{2})-(\d{2})[T ]?(\d{2}):(\d{2})(?::(\d{2}))?$/;
          const yyyyMatch = dateTimeStr.match(yyyymmddPattern);

          if (yyyyMatch) {
            const [, year, month, day, hour, minute, second] = yyyyMatch;
            const paddedSecond = second || "00";
            payload.weighBridgeWtTs = `${year}-${month}-${day} ${hour}:${minute}:${paddedSecond}`;
          } else {
            // Fallback: keep as-is but try to append seconds if missing
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateTimeStr)) {
              payload.weighBridgeWtTs = dateTimeStr + ":00";
            } else {
              payload.weighBridgeWtTs = dateTimeStr;
            }
          }
        }
      } else {
        payload.weighBridgeWtTs = "";
      }

      if (attachments.length > 0) payload.vgmWbAttList = attachments;

      const response = await vgmAPI.save(payload);

      // Interceptor handles extracting .data from { success: true, data: ... }
      // So if we get here without error, and have response.data, it's successful.
      if (response && response.status === 200) {
        enqueueSnackbar("VGM Saved as Draft", { variant: "success" });

        // transition to edit mode so subsequent "Submission" updates THIS record
        // response.data contains the extracted 'data' field from the server JSON
        if (response.data?.logId) {
          setIsEditMode(true);
          setRequestData({ _id: response.data.logId, vgmId: response.data.logId, ...payload });
        }
      } else {
        // Fallback for unexpected status codes
        throw new Error("Failed to save draft.");
      }
    } catch (error) {
      console.error("Save Draft Error:", error);
      enqueueSnackbar("Failed to save draft", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleJobSearch = async (forcedJobNo) => {
    const searchVal = typeof forcedJobNo === "string" ? forcedJobNo : jobNoSearch;
    if (!searchVal) {
      enqueueSnackbar("Please enter a Job No", { variant: "warning" });
      return;
    }

    setLoadingJob(true);
    try {
      const response = await axios.get(
        "https://eximbot.alvision.in/export/api/exports",
        {
          params: {
            status: "Pending",
            search: searchVal,
            page: 1,
            limit: 20,
          },
        }
      );

      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        response.data.data.jobs &&
        response.data.data.jobs.length > 0
      ) {
        const job = response.data.data.jobs[0];
        const updates = { ...formik.values };

        // --- Helper to normalize company names for matching ---
        const normalizeCompanyName = (name) => {
          if (!name) return "";
          return name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .replace(/\bpvt\.?\b/g, "private")
            .replace(/\bltd\.?\b/g, "limited")
            .replace(/\bllp\.?\b/g, "llp")
            .replace(/[.,]/g, "");
        };

        // --- Helper to Robustly extract field from object ---
        const getField = (obj, ...fields) => {
          if (!obj) return "";
          for (const f of fields) {
            if (obj[f] !== undefined) return obj[f];
            const lowerF = f.toLowerCase();
            if (obj[lowerF] !== undefined) return obj[lowerF];
          }
          return "";
        };

        // --- Helper to format Date-Time to DD-MM-YYYY HH:mm ---
        const formatDateTimeForVGM = (dtStr) => {
          if (!dtStr) return "";
          try {
            // Check if already in DD-MM-YYYY HH:mm format
            if (/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}/.test(dtStr)) return dtStr;

            const dateObj = new Date(dtStr.replace(" ", "T"));
            if (isNaN(dateObj.getTime())) return dtStr; // Fallback to raw string

            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');

            return `${day}-${month}-${year} ${hours}:${minutes}`;
          } catch (e) {
            return dtStr;
          }
        };

        // --- Helper to find port by value prefix (e.g., INMUN1) ---
        const findPortByPrefix = (portString) => {
          if (!portString) return "";
          // Extract port code from "(CODE) NAME" or "CODE - NAME"
          let portCode = "";
          const parenMatch = portString.match(/\(([^)]+)\)/);
          if (parenMatch) {
            portCode = parenMatch[1];
          } else {
            portCode = portString.split(" - ")[0].trim();
          }

          // Take first 5 chars for matching (e.g., INMUN, INSBI)
          const normalizedSearch = portCode.substring(0, 5).toLowerCase();

          const match = PORTS.find((p) =>
            p.value.toLowerCase().startsWith(normalizedSearch) ||
            p.label.toLowerCase().includes(normalizedSearch)
          );
          return match ? match.value : "";
        };

        // --- Helper to find shipping line (Robust token-based exact match) ---
        const findShippingLine = (shippingLineName) => {
          if (!shippingLineName || !shippingLines || shippingLines.length === 0) {
            return "";
          }

          const apiStr = shippingLineName.toLowerCase().trim();

          // 1. Try exact match of the whole string against code or label
          let match = shippingLines.find((sl) => {
            const val = (sl.value || "").toLowerCase().trim();
            const lab = (sl.label || sl.lable || sl.name || "").toLowerCase().trim();
            return val === apiStr || lab === apiStr;
          });
          if (match) return match.value;

          // 2. Split by " - " and try exact matches for each part
          const parts = shippingLineName.split(" - ").map(s => s.trim().toLowerCase()).filter(s => s.length > 0);

          for (const part of parts) {
            match = shippingLines.find((sl) => {
              const val = (sl.value || "").toLowerCase().trim();
              const lab = (sl.label || sl.lable || sl.name || "").toLowerCase().trim();
              // Check if the part exactly matches either the master code or the master name
              return val === part || lab === part;
            });
            if (match) {
              return match.value;
            }
          }

          // 3. Stricter boundary match for longer names (prevents "MARINE" false positives)
          // We only do this if the master name is distinctive (>= 8 chars)
          match = shippingLines.find((sl) => {
            const lab = (sl.label || sl.lable || sl.name || "").toLowerCase().trim();
            if (lab.length < 8) return false;

            // Escaping for regex and checking for whole word/phrase match
            const escapedLab = lab.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            const regex = new RegExp(`\\b${escapedLab}\\b`, "i");
            return regex.test(apiStr);
          });

          if (match) {
            return match.value;
          }

          return "";
        };

        // --- 1. Container Details ---
        // Robust extraction of container data
        const containers = Array.isArray(job.containers) ? job.containers : (job.operations?.[0]?.containerdetails || job.operations?.[0]?.containerDetails || []);

        const mapContainerToVGM = (c) => {
          const cNo = getField(c, "containerNo", "cntnrNo", "containerno");
          const fullType = String(getField(c, "type", "containerType", "containerSize", "size")).toUpperCase();
          let sz = "", tp = "";

          if (fullType) {
            const sizeMatch = fullType.match(/\d{2}/);
            if (sizeMatch) {
              const szOpt = CONTAINER_SIZES.find(s => String(s.label).includes(sizeMatch[0]));
              if (szOpt) sz = szOpt.value;
            }
            const typeMatch = CONTAINER_TYPES.find(t =>
              fullType.includes(String(t.label || "").toUpperCase()) ||
              fullType.includes(String(t.value || "").toUpperCase())
            );
            if (typeMatch) tp = typeMatch.value;
          }

          const weighmentDetails = getField(job, "weighmentdetails", "weighmentDetails") || [];
          const wMatch = (Array.isArray(weighmentDetails) ? weighmentDetails.find(w => getField(w, "containerNo", "containerno") === cNo) : null) || {};

          const fullAddr = String(getField(c, "weighmentAddress", "address") || getField(wMatch, "weighmentAddress", "address") || "");

          return {
            ...c,
            containerNo: cNo,
            cntnrNo: cNo,
            cntnrSize: sz,
            cntnrTp: tp,
            cscPlateMaxWtLimit: getField(c, "maxGrossWeightKgs", "grossWeight", "grossweight", "maxgrossweightkgs"),
            tareWt: getField(c, "tareWeightKgs", "tareweightkgs", "tareWt"),
            totWt: getField(c, "vgmWtInvoice", "vgmwtinvoice", "totWt"),
            sealNo: getField(c, "sealNo", "sealno", "seal_no"),
            sealTp: getField(c, "sealType", "sealtype", "seal_tp"),
            weighBridgeRegNo: getField(c, "weighBridgeName", "weighbridgeName") || getField(wMatch, "weighBridgeName", "weighbridgeName") || "",
            weighBridgeSlipNo: getField(c, "weighmentRegNo", "weighmentSlipNo", "slipNo", "regNo") || getField(wMatch, "weighmentRegNo", "weighmentSlipNo", "slipNo", "regNo") || "",
            weighBridgeAddrLn1: fullAddr.substring(0, 20).trim(),
            weighBridgeAddrLn2: fullAddr.substring(20, 40).trim(),
            weighBridgeAddrLn3: fullAddr.substring(40, 60).trim(),
            weighBridgeWtTs: formatDateTimeForVGM(getField(c, "weighmentDateTime", "weighmentdatetime") || getField(wMatch, "weighmentDateTime", "weighmentdatetime") || "")
          };
        };

        const allContainers = containers.map(mapContainerToVGM);

        // --- 3. Booking / Liner / Port ---
        updates.bookNo = getField(job, "booking_no", "bookingNo");

        // Liner
        if (job.shipping_line_airline) {
          const linerMatch = findShippingLine(job.shipping_line_airline);
          if (linerMatch) updates.linerId = linerMatch;
        } else if (job.operations?.[0]?.bookingDetails?.[0]?.shippingLineName) {
          const linerMatch = findShippingLine(job.operations[0].bookingDetails[0].shippingLineName);
          if (linerMatch) updates.linerId = linerMatch;
        }

        // Port
        const portName = job.port_of_loading || job.custom_house || job.operations?.[0]?.containerDetails?.[0]?.portOfLoading || "";
        if (portName) {
          const portMatch = findPortByPrefix(portName);
          if (portMatch) updates.locId = portMatch;
        }

        // --- 4. Shipper ---
        updates.shipperNm = job.exporter || "";
        updates.shipRegTP = "IEC No";
        updates.shipRegNo = job.ieCode || "";
        updates.shipperTp = "O";

        // --- 5. Authorized Person ---
        const normalizedExporter = normalizeCompanyName(job.exporter);
        const authMatch = AUTHORIZED_PERSONS.find((ap) => normalizeCompanyName(ap.exporter) === normalizedExporter);
        if (authMatch) {
          updates.authPrsnNm = authMatch.authPerson;
          updates.authDesignation = authMatch.designation;
          updates.authMobNo = authMatch.contactNo;
        }

        // --- Store containers for selection if multiple ---
        const uniqueContainers = allContainers.filter(
          (c, idx, self) => c.containerNo && self.findIndex(x => x.containerNo === c.containerNo) === idx
        );

        if (uniqueContainers.length >= 1) {
          const firstVGM = uniqueContainers[0];
          Object.assign(updates, {
            cntnrNo: firstVGM.cntnrNo,
            cntnrSize: firstVGM.cntnrSize,
            cntnrTp: firstVGM.cntnrTp,
            cscPlateMaxWtLimit: firstVGM.cscPlateMaxWtLimit,
            tareWt: firstVGM.tareWt,
            totWt: firstVGM.totWt,
            weighBridgeRegNo: firstVGM.weighBridgeRegNo,
            weighBridgeSlipNo: firstVGM.weighBridgeSlipNo,
            weighBridgeAddrLn1: firstVGM.weighBridgeAddrLn1,
            weighBridgeAddrLn2: firstVGM.weighBridgeAddrLn2,
            weighBridgeAddrLn3: firstVGM.weighBridgeAddrLn3,
            weighBridgeWtTs: firstVGM.weighBridgeWtTs
          });

          if (uniqueContainers.length > 1) {
            setFetchedJobData(job);
            setContainersList(uniqueContainers);
            setSelectedContainerNo(firstVGM.containerNo);
            enqueueSnackbar(`Found ${uniqueContainers.length} containers. Please select one.`, { variant: "info" });
          } else {
            setFetchedJobData(null);
            setContainersList([]);
            setSelectedContainerNo("");
          }
        }

        formik.setValues(updates);
        setFormValues(updates);
        enqueueSnackbar("Details auto-filled from Job No", { variant: "success" });

      } else {
        enqueueSnackbar("No details found for this Job No", { variant: "info" });
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      enqueueSnackbar("Failed to fetch job details", { variant: "error" });
    } finally {
      setLoadingJob(false);
    }
  };

  // Handler for container selection change
  const handleContainerSelect = (containerNo) => {
    if (!containerNo || containersList.length === 0) return;

    // We can rely on containersList since we normalize it in handleJobSearch
    const container = containersList.find(c => c.containerNo === containerNo);

    if (container) {
      setSelectedContainerNo(containerNo);

      const updates = { ...formValues }; // Use current form state as base

      // Update container-specific fields
      updates.cntnrNo = container.containerNo || "";
      updates.cscPlateMaxWtLimit = container.cscPlateMaxWtLimit || "";
      updates.tareWt = container.tareWt || "";
      updates.totWt = container.totWt || "";
      updates.cntnrSize = container.cntnrSize || "";
      updates.cntnrTp = container.cntnrTp || "";

      // Seal Details if available
      updates.sealNo = container.sealNo || "";
      updates.sealTp = container.sealType || "";

      // Weighbridge details for this container
      updates.weighBridgeRegNo = container.weighBridgeRegNo || "";
      updates.weighBridgeSlipNo = container.weighBridgeSlipNo || "";
      updates.weighBridgeAddrLn1 = container.weighBridgeAddrLn1 || "";
      updates.weighBridgeAddrLn2 = container.weighBridgeAddrLn2 || "";
      updates.weighBridgeAddrLn3 = container.weighBridgeAddrLn3 || "";
      updates.weighBridgeWtTs = container.weighBridgeWtTs || "";

      formik.setValues(updates);
      setFormValues(updates);
      enqueueSnackbar(`Switched to container ${containerNo}`, { variant: "success" });
    }
  };

  return (
    <FormikProvider value={formik}>
      <div className="vgm-container">
        <AppbarComponent />

        {/* Job No Search Panel - Redesigned for better UI */}
        <Box className="panel" sx={{ mb: 2, mt: 0, py: 1.5, bgcolor: '#fff !important' }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <TextField
              sx={{
                flex: 1,
                maxWidth: 550,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  height: "38px", // Matches global input height
                  backgroundColor: "#f8fafc",
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                }
              }}
              size="small"
              placeholder="Auto-fill from Job No (e.g. GIM/00003...)"
              value={jobNoSearch}
              onChange={(e) => setJobNoSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleJobSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#94a3b8", fontSize: '1.1rem' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              className="btn-primary"
              onClick={handleJobSearch}
              disabled={loadingJob}
              startIcon={loadingJob ? null : <CloudDownloadIcon sx={{ fontSize: '1.2rem !important', color: 'white' }} />}
              sx={{
                height: '38px',
                minWidth: '140px',
                textTransform: 'none',
                boxShadow: 'none !important',
                fontSize: '0.875rem',
                color: 'white !important', // Explicit color fix
                '& .MuiButton-startIcon': { color: 'white' },
                borderRadius: "8px",
              }}
            >
              {loadingJob ? "Fetching..." : "Fetch Data"}
            </Button>
          </Box>
        </Box>

        {/* Container Selection Dropdown (only if multiple containers) */}
        {containersList.length > 1 && (
          <Box sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            mb: 2,
            backgroundColor: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "8px",
            gap: 2
          }}>
            <Typography sx={{ fontWeight: 600, color: "#92400e", display: "flex", alignItems: "center", gap: 1 }}>
              <span style={{ fontSize: "1.2rem" }}>⚠️</span> Multiple containers found. Select container:
            </Typography>
            <Box sx={{ minWidth: 200 }}>
              <select
                className="form-control"
                style={{
                  height: "38px",
                  borderRadius: "6px",
                  borderColor: "#fcd34d",
                  backgroundColor: "#fff"
                }}
                value={selectedContainerNo}
                onChange={(e) => handleContainerSelect(e.target.value)}
              >
                {containersList.map((c) => (
                  <option key={c.containerNo} value={c.containerNo}>
                    {c.containerNo} ({c.containerSize})
                  </option>
                ))}
              </select>
            </Box>
          </Box>
        )}

        <form onSubmit={formik.handleSubmit}>
          {/* Section 1: Shipper & Booking */}
          <div className="panel">
            <div className="panel-title">Shipper / Booking Details</div>
            <div className="form-grid">
              <SelectField
                label="Shipping Line"
                name="linerId"
                options={shippingLines}
                required
              />
              {/* <InputField label="Vessel Name" name="vesselNm" />
              <InputField label="Voyage Number" name="voyageNo" /> */}
              <InputField
                label="Booking Number"
                name="bookNo"
                required
                onChange={(e) => {
                  formik.handleChange(e);
                  // Trigger debounced check while typing
                  debouncedCheckBooking(e.target.value, formik.values.linerId);
                }}
              />
              <SelectField label="Port" name="locId" options={PORTS} required />
              {/* <SelectField
                label="Handover Location"
                name="handoverLoc"
                options={HANDOVER_LOCATIONS}
              /> */}

              {/* Terminal Code */}
              <SelectField
                label="Terminal Code"
                name="terminalCode"
                options={getTerminalCodesByPort(formik.values.locId) || []}
                placeholder={getTerminalCodesByPort(formik.values.locId)?.length ? "Select Terminal" : "No terminals for this port"}
              />
            </div>

            <div
              className="mt-4"
              style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}
            ></div>

            <div className="form-grid">
              <SelectField
                label="Shipper Type"
                name="shipperTp"
                options={SHIPPER_TYPES}
                required
              />


              <>
                <>
                  <InputField
                    label="Shipper Name"
                    name="shipperNm"
                    required
                    disabled={formik.values.shipperTp === "S"}

                  />
                  <SelectField
                    label="Reg Type"
                    name="shipRegTP"
                    options={REGISTRATION_TYPES}
                    required
                    disabled={formik.values.shipperTp === "S"}

                  />
                  <InputField
                    label="Reg Number"
                    name="shipRegNo"
                    required
                    disabled={formik.values.shipperTp === "S"}

                  />
                </>
              </>

            </div>

            <div className="form-grid mt-4">
              <InputField label="Auth Person Name" name="authPrsnNm" required />
              <InputField label="Designation" name="authDesignation" required />
              <InputField label="Mobile Number" name="authMobNo" required />
            </div>
          </div>

          {/* Section 2: Container Details */}
          <div className="panel">
            <div className="panel-title">Container Details</div>
            <div className="alert alert-info" style={{ fontSize: "0.85rem" }}>
              {formik.values.vgmEvalMethod === "M1"
                ? "Method 1: Weighing the packed container."
                : "Method 2: Adding weight of packages + cargo + tare."}
            </div>

            <div className="form-grid mb-4">
              <SelectField
                label="Evaluation Method"
                name="vgmEvalMethod"
                options={VGM_METHODS}
                required
              />
            </div>

            <div className="form-grid">
              <InputField
                label="Container No"
                name="cntnrNo"
                placeholder=""
                required
              />
              <SelectField
                label="Size"
                name="cntnrSize"
                options={CONTAINER_SIZES}
                required
                showValue
              />
              <SelectField
                label="Type"
                name="cntnrTp"
                options={CONTAINER_TYPES}
                showValue
              />
              <SelectField
                label="Cargo Type"
                name="cargoTp"
                options={CARGO_TYPES}
                required
              />
              <InputField
                label="CSC Max wt. (Gross Wt.)"
                name="cscPlateMaxWtLimit"
                type="number"
                step="0.01"
                required
              />
              <SelectField
                label="Max Wt UOM"
                name="cscPlateMaxWtUom"
                options={WEIGHT_UOMS}
                required
              />

            </div>

            {/* Method 2 Specifics */}
            {formik.values.vgmEvalMethod === "M2" && (
              <div
                className="panel mt-4"
                style={{ backgroundColor: "#f1f5f9" }}
              >
                <h4 style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Method 2 Calculation
                </h4>
                <div className="form-grid">
                  <InputField
                    label="Cargo Weight"
                    name="cargoWt"
                    type="number"
                    step="0.01"
                    required
                  />
                  <SelectField
                    label="Cargo UOM"
                    name="cargoWtUom"
                    options={WEIGHT_UOMS}
                    required
                  />
                  <InputField
                    label="Tare Weight"
                    name="tareWt"
                    type="number"
                    step="0.01"
                    required
                  />
                  <SelectField
                    label="Tare UOM"
                    name="tareWtUom"
                    options={WEIGHT_UOMS}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-grid mt-4">
              <InputField
                label="VGM (Total Weight)"
                name="totWt"
                type="number"
                step="0.01"
                required
              />
              <SelectField
                label="VGM UOM"
                name="totWtUom"
                options={WEIGHT_UOMS}
                required
              />
            </div>

            {formik.values.cargoTp === "HAZ" && (
              <div className="form-grid mt-2">
                <SelectField
                  label="IMO Number"
                  name="imoNo1"
                  options={IMO_NUMBERS}
                  required
                />
                <InputField label="UN Number" name="unNo1" required />
              </div>
            )}
          </div>

          {/* Section 3: Weighbridge */}
          <div className="panel">
            <div className="panel-title">Weighbridge Details</div>
            <div className="form-grid">
              <InputField
                label="Weighbridge No"
                name="weighBridgeRegNo"
                required
              />
              <InputField
                label="Address Line 1"
                name="weighBridgeAddrLn1"
                required
              />
              <InputField label="Address Line 2" name="weighBridgeAddrLn2" />
              <InputField label="Address Line 3" name="weighBridgeAddrLn3" />

              <InputField label="Weighbridge Slip No." name="weighBridgeSlipNo" required />


              {/* DateTime Input */}
              <div className="form-group">
                <label>
                  Date & Time of Weighing <span className="required">*</span>
                </label>


                <input
                  type="text"
                  name="weighBridgeWtTs"
                  className={`form-control ${formik.touched.weighBridgeWtTs &&
                    formik.errors.weighBridgeWtTs
                    ? "error"
                    : ""
                    }`}
                  onBlur={formik.handleBlur}
                  value={formik.values.weighBridgeWtTs || ""}
                  onChange={(e) => {
                    // Just store the value as-is, no conversion
                    formik.setFieldValue("weighBridgeWtTs", e.target.value);
                  }}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData('text').trim();

                    // Support specialized format: 31.03.2026/Time:19:34
                    const specialFormatMatch = pastedText.match(/^(\d{2})\.(\d{2})\.(\d{4})\/Time:(\d{2}):(\d{2})/);

                    if (specialFormatMatch) {
                      e.preventDefault();
                      const [, d, m, y, h, min] = specialFormatMatch;
                      const transformed = `${d}-${m}-${y} ${h}:${min}`;
                      formik.setFieldValue("weighBridgeWtTs", transformed);
                      return;
                    }

                    setTimeout(() => {
                      let val = e.target.value.trim();

                      // Format standard DD-MM-YYYY HH:mm
                      if (val && val.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/)) {
                        formik.setFieldValue("weighBridgeWtTs", val);
                      }
                      // Auto-fix dots to dashes: 31.03.2026 19:34
                      else if (val && val.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/)) {
                        formik.setFieldValue("weighBridgeWtTs", val.replace(/\./g, '-'));
                      }
                    }, 0);
                  }}
                />

                {/* 4. ERROR MESSAGE: Display the text in red below the input */}
                {formik.touched.weighBridgeWtTs &&
                  formik.errors.weighBridgeWtTs && (
                    <div
                      className="invalid-feedback d-block"
                      style={{ color: "#dc3545" }}
                    >
                      {formik.errors.weighBridgeWtTs}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Section 4: Attachments */}
          <div className="panel">
            <div className="panel-title">Attachments</div>
            <div className="alert alert-info">
              PDF only. Max 5MB. DG Declaration required for HAZ cargo.
            </div>

            {ATTACHMENT_TITLES.map((type) => (
              <div
                key={type.value}
                className="file-upload-wrapper"
                style={{ marginBottom: "15px" }}
              >
                {/* LABEL SECTION */}
                <div
                  style={{
                    marginBottom: "5px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {type.label}
                </div>

                {/* CONTROLS SECTION */}
                <div className="d-flex align-items-center">

                  {/* 2. Choose File Button (Hide if file exists to rely on ImagePreview delete for clearing) */}
                  {!attachments.find((a) => a.attTitle === type.value) && (
                    <label
                      className="btn btn-sm btn-outline"
                      style={{ marginBottom: 0, marginRight: "10px" }}
                    >
                      Choose File
                      <input
                        type="file"
                        accept=".pdf"
                        hidden
                        onChange={(e) => handleFileUpload(e, type.value)}
                      />
                    </label>
                  )}

                  {/* 3. Image Preview with Delete Dialog */}
                  {attachments.find((a) => a.attTitle === type.value) && (
                    <div style={{ flex: 1 }}>
                      <ImagePreview
                        images={[
                          {
                            url: (() => {
                              const att = attachments.find((a) => a.attTitle === type.value);
                              if (!att) return "";

                              // Check for common URL fields if attData is base64 or missing
                              const possibleUrl = att.url || att.path || att.s3Url || att.link;
                              if (possibleUrl && (possibleUrl.startsWith("http") || possibleUrl.startsWith("/"))) {
                                return possibleUrl;
                              }

                              // Strict check: if attData is a URL
                              if (att.attData && (att.attData.startsWith("http") || att.attData.startsWith("https"))) {
                                return att.attData;
                              }
                              // Otherwise behave as base64 (local upload)
                              return `data:application/pdf;base64,${att.attData}`;
                            })(),
                            name: attachments.find(
                              (a) => a.attTitle === type.value
                            ).attNm,
                          },
                        ]}
                        onDeleteImage={() => removeAttachment(type.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="panel">
            {/* Exporter Dropdown for VGM Letter Download */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "10px", color: "#374151" }}>
                Download VGM Letter for Exporter
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                <select
                  className="form-control"
                  style={{
                    maxWidth: "300px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                    fontSize: "0.95rem",
                    cursor: "pointer"
                  }}
                  value={selectedExporter}
                  onChange={(e) => handleExporterPdfDownload(e.target.value)}
                  disabled={generatingExporterPdf || loading}
                >
                  <option value="">-- Select Exporter --</option>
                  {EXPORTERS.map((exporter) => (
                    <option key={exporter.key} value={exporter.key}>
                      {exporter.label}
                    </option>
                  ))}
                </select>
                {generatingExporterPdf && (
                  <span style={{ color: "#10b981", fontSize: "0.9rem" }}>
                    ⏳ Generating PDF...
                  </span>
                )}
              </div>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "8px" }}>
                Select an exporter to download VGM letter with their company letterhead
              </p>
            </div>

            {/* Action Buttons */}
            <div
              className="d-flex"
              style={{ justifyContent: "center", gap: "15px", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
                style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}
              >
                Save
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={generatePDF}
                disabled={loading}
              >
                Download PDF
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !isPdfDownloaded}
              >
                {loading
                  ? "Processing..."
                  : isEditMode
                    ? "Update VGM"
                    : "Submit VGM"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* VGM Download Modal for Individual Exporters */}
      {showVGMDownload && submittedVGMData && (
        <VGMDownload
          vgmData={submittedVGMData}
          onClose={() => {
            setShowVGMDownload(false);
            setSubmittedVGMData(null);
            formik.resetForm();
            setAttachments([]);
            setIsPdfDownloaded(false);
          }}
        />
      )}
    </FormikProvider>
  );
};

export default VGMForm;
