// src/components/Form13/Form13.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Fab,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Save as SaveIcon, Send as SendIcon } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { form13API } from "../../services/form13API";
import { vgmAPI, masterAPI } from "../../services/api";
import Form13HeaderSection from "./Form13HeaderSection";
import Form13ContainerSection from "./Form13ContainerSection";
import Form13ShippingBillSection from "./Form13ShippingBillSection";
import Form13AttachmentSection from "./Form13AttachmentSection";

import AppbarComponent from "../AppbarComponent";
import "../../styles/Form13.scss";

const Form13 = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [previousEntry, setPreviousEntry] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [isCheckingPrevious, setIsCheckingPrevious] = useState(false);

  // Master Data States
  const [vessels, setVessels] = useState([]);
  const [pods, setPods] = useState([]);
  const [shippingLines, setShippingLines] = useState([]);
  const [hauliers, setHauliers] = useState([]);
  const [cfsCodes, setCfsCodes] = useState([]);
  const [masterDataLoaded, setMasterDataLoaded] = useState(false);

  // Form Data State - Complete structure matching API requirements
  // HARDCODE YOUR HASHKEY HERE

  const initialFormData = {
    // Header Section
    odexRefNo: "",
    reqId: "",
    pyrCode: userData?.pyrCode || "",
    bnfCode: "",
    locId: "",
    vesselNm: "",
    viaNo: "",
    terminalCode: "",
    service: "",
    pod: "",
    fpod: "",
    cargoTp: "",
    origin: "",
    shpInstructNo: "",
    bookNo: "",
    mobileNo: "",
    cfsCode: "",
    issueTo: "",
    shipperNm: "",
    consigneeNm: "",
    consigneeAddr: "",
    cargoDesc: "",
    terminalLoginId: "ALL_CHA",
    emailId: "",
    bookCopyBlNo: "",
    cntnrStatus: "Full",
    formType: "F13",
    IsEarlyGateIn: "N",
    ShipperCity: "",
    shipperCd: "",
    FFCode: "",
    IECode: "",
    CHACode: "",
    Notify_TO: "",
    stuffTp: "",
    icdLoadingPort: "",
    voyageNo: "",
    haulageTp: "",
    railOperator: "",
    bookLinId: "",
    placeOfDel: "",
    contactPerson: "",
    outsideWindowIssue: false,

    // Container Section (cntrList in API)
    containers: [
      {
        cntnrReqId: "",
        cntnrNo: "",
        cntnrSize: "",
        iso: "",
        agentSealNo: "",
        customSealNo: "",
        vgmWt: "",
        vgmViaODeX: "N",
        doNo: "",
        temp: "0",
        volt: "0",
        imoNo1: "",
        unNo1: "",
        imoNo2: "",
        unNo2: "",
        imoNo3: "",
        unNo3: "",
        imoNo4: "",
        unNo4: "",
        rightDimensions: "0.00",
        topDimensions: "0.00",
        backDimensions: "0.00",
        leftDimensions: "0.00",
        frontDimensions: "0.00",
        odcUnits: "",
        chaRemarks: "",
        vehicleNo: "",
        driverLicNo: "",
        driverNm: "",
        haulier: "",
        spclStow: "",
        spclStowRemark: "",
        status: "REQUESTED",
        shpInstructNo: "",
        cntnrTareWgt: 0,
        cargoVal: 0,
        commodityName: "",
        hsnCode: "",
        // Shipping Bill Details embedded in container
        sbDtlsVo: [
          {
            shipBillInvNo: "",
            shipBillDt: "",
            leoNo: "",
            leoDt: "",
            chaNm: userData?.pyrName || "",
            chaPan: "",
            exporterNm: "",
            exporterIec: "",
            noOfPkg: 0,
          },
        ],
      },
    ],

    // Attachments Section (attList in API)
    attachments: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSaved, setIsSaved] = useState(false);

  // Load Master Data on component mount
  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      setError("");

      const pyrCode = userData?.pyrCode;

      if (!pyrCode) {
        throw new Error("Payor code not found. Please login again.");
      }

      // This sets the timestamp to the exact current time (e.g., "2026-04-16 14:45:30")
      // This sets the timestamp to today at midnight (e.g., "2026-04-16 00:00:00")
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0] + " 00:00:00";



      // Get hashkey
      const hashKeyResponse = await form13API.getHashKey({
        pyrCode: pyrCode,
        timestamp,
      });

      const hashKey = hashKeyResponse.data.hashKey;

      // Load Vessel Master Data
      const vesselRequest = {
        pyrCode: pyrCode,
        fromTs: timestamp,
        hashKey,
      };

      const vesselResponse = await form13API.getVesselMaster(vesselRequest);
      setVessels(vesselResponse.data || []);

      // Load POD Master Data
      const past2Days = new Date(now);
      past2Days.setDate(past2Days.getDate() - 2);
      const podTimestamp = past2Days.toISOString().split('T')[0] + " 00:00:00";

      const podRequest = {
        pyrCode: pyrCode,
        fromTs: podTimestamp,
        hashKey,
      };

      const podResponse = await form13API.getPODMaster(podRequest);
      setPods(podResponse.data || []);

      // Load Shipping Lines from Master Data
      try {
        const slResponse = await masterAPI.getShippingLines();
        setShippingLines(slResponse.data || []);
      } catch (slErr) {
        console.warn("Failed to load shipping lines mapping:", slErr);
      }

      // Load Hauliers from Master Data
      try {
        const hResponse = await masterAPI.getHauliers();
        setHauliers(hResponse.data || []);
      } catch (hErr) {
        console.warn("Failed to load hauliers mapping:", hErr);
      }

      // Load CFS Codes from Master Data
      try {
        const cfsResponse = await masterAPI.getCFSCodes();
        setCfsCodes(cfsResponse.data || []);
      } catch (cfsErr) {
        console.warn("Failed to load CFS codes mapping:", cfsErr);
      }

      setMasterDataLoaded(true);
      setSuccess("Master data loaded successfully");
    } catch (err) {
      console.error("Master data loading error:", err);
      setError(
        `Failed to load master data: ${err.response?.data?.error || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVGMAutoFill = async (bookNo) => {
    if (!bookNo || bookNo.length < 3) return;

    try {
      const response = await vgmAPI.getRequests({ bookingNo: bookNo, exactMatch: true });
      const vgmRequests = response.data?.requests || [];

      if (vgmRequests.length > 0) {
        // Map VGM records to Form 13 container structure
        const vgmContainers = vgmRequests.map(vgm => {
          // Convert weight from KGS to MTS (if exists)
          let convertedWt = "";
          if (vgm.totWt) {
            const wtInKgs = parseFloat(vgm.totWt);
            if (!isNaN(wtInKgs)) {
              convertedWt = (wtInKgs / 1000).toFixed(3); // 1000 KGS = 1 MTS
            }
          }

          return {
            ...initialFormData.containers[0],
            cntnrNo: vgm.cntnrNo || "",
            cntnrSize: vgm.cntnrSize || "",
            vgmWt: convertedWt,
            vgmViaODeX: "Y",
            sbDtlsVo: [
              {
                ...initialFormData.containers[0].sbDtlsVo[0],
                exporterNm: vgm.shipperNm || "",
              }
            ]
          };
        });

        // Get uniquely identified containers (by number)
        const uniqueVgmContainers = [];
        const seen = new Set();
        vgmContainers.forEach(c => {
          if (c.cntnrNo && !seen.has(c.cntnrNo)) {
            uniqueVgmContainers.push(c);
            seen.add(c.cntnrNo);
          }
        });

        // Check which containers are already in the form
        const existingNos = formData.containers.map(c => (c.cntnrNo || "").trim()).filter(Boolean);
        const newVgmContainers = uniqueVgmContainers.filter(c => !existingNos.includes(c.cntnrNo.trim()));


        if (newVgmContainers.length > 0) {
          setFormData(prev => {
            const isFirstEmpty = prev.containers.length === 1 && !prev.containers[0].cntnrNo;
            const finalContainers = isFirstEmpty ? newVgmContainers : [...prev.containers, ...newVgmContainers];
            
            // Also populate header-level shipperNm if it's empty, using the first VGM record found
            const headerShipperNm = prev.shipperNm || vgmRequests[0]?.shipperNm || "";

            return {
              ...prev,
              shipperNm: headerShipperNm,
              containers: finalContainers
            };
          });
          setSuccess(`Auto-filled ${newVgmContainers.length} container(s) and Shipper Name from VGM data`);
        }
      } else {
      }
    } catch (err) {
      console.error("[VGM-AUTOFILL] Error:", err);
    }
  };

  // Trigger VGM Auto-fill when booking number is entered (Debounced)
  useEffect(() => {
    if (formData.bookNo && formData.bookNo.length >= 3 && !isEditMode) {
      const timer = setTimeout(() => {
        handleVGMAutoFill(formData.bookNo);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [formData.bookNo, isEditMode]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      // Check for reset signal first
      if (location.state?.reset) {
        setIsEditMode(false);
        setRequestId(null);
        setFormData(initialFormData);
        setError("");
        setSuccess("");
        setValidationErrors({});
        setIsSaved(false);
        window.scrollTo(0, 0);
        return;
      }

      if (location.state?.editMode && location.state?.f13Id) {
        setIsEditMode(true);
        setRequestId(location.state.f13Id);
        await fetchRequestDetails(location.state.f13Id);
      } else {
        // Reset form for fresh request
        setIsEditMode(false);
        setRequestId(null);
        setFormData(initialFormData);
        setError("");
        setSuccess("");
        setValidationErrors({});
        setIsSaved(false);
      }
    };
    loadInitialData();
  }, [location.state]);

  const fetchRequestDetails = async (f13Id) => {
    try {
      setLoading(true);
      const response = await form13API.getRequestById(f13Id);
      if (response.data) {
        prefillForm(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch request details:", err);
      setError("Failed to load request details for editing");
    } finally {
      setLoading(false);
    }
  };

  const prefillForm = (data) => {

    // Basic fields mapping
    const newFormData = { ...formData };

    // Header fields mapping (Case-insensitive to handle DB vs State naming differences)
    const stateKeys = Object.keys(newFormData);
    Object.keys(data).forEach((key) => {
      // Find matching key in state (case-insensitive)
      const matchingKey = stateKeys.find(sk => sk.toLowerCase() === key.toLowerCase());

      if (
        matchingKey &&
        !["containers", "attachments", "cntrlist", "attlist"].includes(matchingKey.toLowerCase())
      ) {
        newFormData[matchingKey] = data[key] !== null && data[key] !== undefined ? data[key] : "";
      }
    });

    // Special handling for Container List (stored as cntrList in DB)
    const sourceContainers = data.cntrList || data.containers || [];
    if (sourceContainers.length > 0) {
      newFormData.containers = sourceContainers.map((c, idx) => {
        return {
          ...c,
          // Ensure nesting for shipping bills is preserved
          sbDtlsVo: c.sbDtlsVo || [{
            shipBillInvNo: "", shipBillDt: "", leoNo: "", leoDt: "",
            chaNm: "", chaPan: "", exporterNm: "", exporterIec: "", noOfPkg: 0
          }]
        };
      });
    } else {
    }

    // Special handling for Attachment List (stored as attList in DB)
    const sourceAttachments = data.attList || data.attachments || [];
    if (sourceAttachments.length > 0) {
      newFormData.attachments = sourceAttachments;
    }

    setFormData(newFormData);
    setSuccess("Form pre-filled with existing data");
  };

  // Feature: Copy Data from Previous Entry
  useEffect(() => {
    const checkPreviousEntry = async () => {
      // Don't check for previous entries if we are in edit mode
      if (isEditMode) return;

      // Only check if we have shipping line and booking no
      if (formData.bnfCode && formData.bookNo && formData.bookNo.length >= 3) {
        try {
          setIsCheckingPrevious(true);
          const response = await form13API.getPreviousEntry({
            bnfCode: formData.bnfCode,
            bookNo: formData.bookNo
          });

          if (response.data && response.data._id) {
            // Found a previous entry
            setPreviousEntry(response.data);
            setShowCopyPopup(true);
          }
        } catch (err) {
          console.error("Error checking previous entry:", err);
        } finally {
          setIsCheckingPrevious(false);
        }
      }
    };

    // Only trigger if we aren't currently loading a previous entry
    if (!loading && masterDataLoaded && !isEditMode) {
      const timer = setTimeout(checkPreviousEntry, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.bnfCode, formData.bookNo, isEditMode]);

  const handleCopyFromPrevious = () => {
    if (previousEntry) {
      // Create a clean copy of the previous data
      const {
        _id, createdAt, updatedAt, __v, odexRefNo, status,
        vesselApiResponse, podApiResponse, form13ApiResponse,
        timestamp, hashKey,
        cntrList, attList, // Destructure new names
        ...cleanData
      } = previousEntry;

      // Determine container source
      const sourceContainers = previousEntry.cntrList || previousEntry.containers || [];

      // Deep copy containers with their sbDtlsVo (shipping bill details)
      let copiedContainers = [];
      if (sourceContainers.length > 0) {
        copiedContainers = sourceContainers.map(container => {
          // Remove MongoDB-specific fields from container
          const { _id: cId, ...containerData } = container;

          // Deep copy sbDtlsVo if it exists
          let copiedSbDtls = [];
          if (container.sbDtlsVo && container.sbDtlsVo.length > 0) {
            copiedSbDtls = container.sbDtlsVo.map(sb => {
              const { _id: sbId, ...sbData } = sb;
              return { ...sbData };
            });
          } else {
            // Provide default shipping bill structure if missing
            copiedSbDtls = [{
              shipBillInvNo: "",
              shipBillDt: "",
              leoNo: "",
              leoDt: "",
              chaNm: "",
              chaPan: "",
              exporterNm: "",
              exporterIec: "",
              noOfPkg: 0,
            }];
          }

          return {
            ...containerData,
            sbDtlsVo: copiedSbDtls,
            // Reset status for new entry
            status: "REQUESTED",
            cntnrReqId: "",
          };
        });
      }

      // Determine attachment source
      const sourceAttachments = previousEntry.attList || previousEntry.attachments || [];

      // Deep copy attachments (without file data for now, just metadata)
      let copiedAttachments = [];
      if (sourceAttachments.length > 0) {
        copiedAttachments = sourceAttachments.map(att => {
          const { _id: attId, ...attData } = att;
          return { ...attData };
        });
      }

      setFormData(prev => ({
        ...prev,
        ...cleanData,
        // Keep current pyrCode
        pyrCode: prev.pyrCode,
        // Explicitly set containers and attachments
        containers: copiedContainers.length > 0 ? copiedContainers : prev.containers,
        attachments: copiedAttachments,
      }));
      setSuccess("Previous entry data copied successfully (containers, shipping details & attachments included)");
    }
    setShowCopyPopup(false);
    setPreviousEntry(null);
  };


  // Comprehensive Validation Function
  const validateForm = () => {
    const errors = {};

    // Header Validations - Mandatory Fields
    if (!formData.bnfCode) errors.bnfCode = "Shipping Line is required";
    if (!formData.locId) errors.locId = "Location is required";
    if (!formData.vesselNm) errors.vesselNm = "Vessel Name is required";
    if (!formData.terminalCode)
      errors.terminalCode = "Terminal Code is required";
    if (!formData.service) errors.service = "Service is required";
    if (!formData.pod) errors.pod = "POD is required";
    if (!formData.cargoTp) errors.cargoTp = "Cargo Type is required";
    if (!formData.origin) errors.origin = "Origin is required";
    if (!formData.shipperNm) errors.shipperNm = "Shipper Name is required";
    if (!formData.bookNo) errors.bookNo = "Booking No. is required";
    if (!formData.cntnrStatus)
      errors.cntnrStatus = "Container Status is required";
    if (!formData.formType) errors.formType = "Form Type is required";

    // Mobile Number Validation (10-12 digits, ignore spaces)
    const cleanMobile = (formData.mobileNo || "").toString().replace(/\s+/g, "");
    if (!cleanMobile) {
      errors.mobileNo = "Mobile No. is required";
    } else if (!/^\d{10,12}$/.test(cleanMobile)) {
      errors.mobileNo = "Mobile No. must be 10-12 digits";
    }

    // Location-Specific Validations
    const locationSpecificLocs = [
      "INMAA1", // Chennai
      "INPRT1", // Paradip
      "INKAT1", // Kattupalli
      "INCCU1", // Kolkata
      "INENN1", // Ennore
      "INMUN1", // Mundra
    ];

    if (locationSpecificLocs.includes(formData.locId)) {
      if (!formData.consigneeNm)
        errors.consigneeNm = "Consignee Name is required for this location";
      if (!formData.consigneeAddr)
        errors.consigneeAddr = "Consignee Address is required for this location";
      if (!formData.cargoDesc)
        errors.cargoDesc = "Cargo Description is required for this location";
      if (!formData.terminalLoginId)
        errors.terminalLoginId = "Terminal Login ID is required for this location";
    }

    // FPOD Validation
    if (
      ["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INTUT1"].includes(
        formData.locId
      ) &&
      !formData.fpod
    ) {
      errors.fpod = "FPOD is required for this location";
    }

    // Nhavasheva (INNSA1) - One of CHA/FF/IE Code required
    if (formData.locId === "INNSA1") {
      if (!formData.CHACode && !formData.FFCode && !formData.IECode) {
        errors.CHACode = "One of CHA Code, FF Code, or IE Code is required for Nhavasheva";
      }
    }

    // Tuticorin Specific (INTUT1)
    if (formData.locId === "INTUT1" && formData.terminalCode === "DBGT") {
      if (!formData.ShipperCity) {
        errors.ShipperCity = "Shipper City is required for Tuticorin DBGT terminal";
      }
    }

    // MSC Specific (removed mandatory booking no because it's now mandatory for all)

    // Hapag Lloyd Specific
    if (
      formData.bnfCode === "Hapag Llyod" &&
      formData.cargoTp !== "REF" &&
      !formData.bookCopyBlNo
    ) {
      errors.bookCopyBlNo = "BL Number is required for Hapag Lloyd (non-reefer cargo)";
    }

    // Origin-Based Validations
    // Dock Destuff requires CFS
    if (formData.origin === "C" && !formData.cfsCode) {
      errors.cfsCode = "CFS is required when Origin is Dock Destuff";
    }

    // Factory Stuffed or ICD by Road requires Vehicle No for Mundra
    if (
      formData.locId === "INMUN1" &&
      (formData.origin === "F" || formData.origin === "R")
    ) {
      formData.containers.forEach((container, index) => {
        if (!container.vehicleNo) {
          errors[`container_${index}_vehicleNo`] =
            `Container ${index + 1}: Vehicle No is required for Factory Stuffed/ICD by Road at Mundra`;
        }
      });
    }

    // VIA No Validation
    if (!formData.viaNo) {
      errors.viaNo = "VIA No. is required";
    }

    // Container Validations
    formData.containers.forEach((container, index) => {
      // Mandatory container fields
      if (!container.cntnrNo) {
        errors[`container_${index}_cntnrNo`] =
          `Container ${index + 1}: Container No is required`;
      } else if (!/^[A-Z]{4}\d{7}$/.test(container.cntnrNo.toUpperCase())) {
        errors[`container_${index}_cntnrNo`] =
          `Container ${index + 1}: Invalid format (4 letters + 7 numbers)`;
      }

      if (!container.cntnrSize) {
        errors[`container_${index}_cntnrSize`] =
          `Container ${index + 1}: Container Size is required`;
      }

      if (!container.iso) {
        errors[`container_${index}_iso`] =
          `Container ${index + 1}: ISO Code is required`;
      }

      if (!container.agentSealNo) {
        errors[`container_${index}_agentSealNo`] =
          `Container ${index + 1}: Agent Seal No is required`;
      }

      if (!container.customSealNo) {
        errors[`container_${index}_customSealNo`] =
          `Container ${index + 1}: Custom Seal No is required`;
      }

      if (!container.driverNm) {
        errors[`container_${index}_driverNm`] =
          `Container ${index + 1}: Driver Name is required`;
      }

      // VGM Validation
      if (container.vgmViaODeX === "N") {
        if (!container.vgmWt) {
          errors[`container_${index}_vgmWt`] =
            `Container ${index + 1}: VGM Weight is required when not via ODeX`;
        } else {
          const vgmNum = parseFloat(container.vgmWt);
          if (isNaN(vgmNum)) {
            errors[`container_${index}_vgmWt`] = `Container ${index + 1}: VGM Weight must be a valid number`;
          } else if (vgmNum > 999.99) {
            errors[`container_${index}_vgmWt`] = `Container ${index + 1}: VGM Weight exceeds maximum allowed (999.99 MT). Please enter weight in Metric Tons (e.g., 25.50 instead of 25500).`;
          }
        }
      }

      // Cargo Type Specific Validations
      // Hazardous Cargo
      if (formData.cargoTp === "HAZ" || formData.cargoTp.includes("HAZ")) {
        if (!container.imoNo1) {
          errors[`container_${index}_imoNo1`] =
            `Container ${index + 1}: IMO No 1 is required for hazardous cargo`;
        }
        if (!container.unNo1) {
          errors[`container_${index}_unNo1`] =
            `Container ${index + 1}: UN No 1 is required for hazardous cargo`;
        }
      }

      // Reefer Cargo
      if (formData.cargoTp === "REF" || formData.cargoTp.includes("REF")) {
        if (!container.temp || container.temp === "0") {
          errors[`container_${index}_temp`] =
            `Container ${index + 1}: Temperature is required for reefer cargo`;
        }
      }

      // ODC Cargo
      if (formData.cargoTp === "ODC" || formData.cargoTp.includes("ODC")) {
        if (!container.rightDimensions || container.rightDimensions === "0.00") {
          errors[`container_${index}_rightDimensions`] =
            `Container ${index + 1}: Right Dimensions required for ODC`;
        }
        if (!container.topDimensions || container.topDimensions === "0.00") {
          errors[`container_${index}_topDimensions`] =
            `Container ${index + 1}: Top Dimensions required for ODC`;
        }
        if (!container.backDimensions || container.backDimensions === "0.00") {
          errors[`container_${index}_backDimensions`] =
            `Container ${index + 1}: Back Dimensions required for ODC`;
        }
        if (!container.leftDimensions || container.leftDimensions === "0.00") {
          errors[`container_${index}_leftDimensions`] =
            `Container ${index + 1}: Left Dimensions required for ODC`;
        }
        if (!container.frontDimensions || container.frontDimensions === "0.00") {
          errors[`container_${index}_frontDimensions`] =
            `Container ${index + 1}: Front Dimensions required for ODC`;
        }
        if (!container.odcUnits) {
          errors[`container_${index}_odcUnits`] =
            `Container ${index + 1}: ODC Units required for ODC`;
        }
      }

      // Special Stow for NSICT/NSIGT/BMCT/CCTL/ICT terminals
      if (
        formData.locId === "INNSA1" &&
        ["NSICT", "NSIGT", "BMCT", "CCTL", "ICT"].includes(formData.terminalCode)
      ) {
        if (!container.spclStow) {
          errors[`container_${index}_spclStow`] =
            `Container ${index + 1}: Special Stow is required for this terminal`;
        }
        if (!container.spclStowRemark) {
          errors[`container_${index}_spclStowRemark`] =
            `Container ${index + 1}: Special Stow Remark is required for this terminal`;
        }
      }

      // MSC Shipping Instruction Number validation removed (made optional)

      // Shipping Bill Validations (embedded in container)
      const sbDetails = container.sbDtlsVo && container.sbDtlsVo[0];
      if (sbDetails) {
        if (!sbDetails.shipBillInvNo) {
          errors[`container_${index}_shipBillInvNo`] =
            `Container ${index + 1}: Shipping Bill No is required`;
        }
        if (!sbDetails.shipBillDt) {
          errors[`container_${index}_shipBillDt`] =
            `Container ${index + 1}: Shipping Bill Date is required`;
        }
        if (sbDetails.leoNo && !sbDetails.leoDt) {
          errors[`container_${index}_leoDt`] =
            `Container ${index + 1}: LEO Date is required when LEO No is provided`;
        }
        if (!sbDetails.chaNm) {
          errors[`container_${index}_chaNm`] =
            `Container ${index + 1}: CHA Name is required`;
        }
        if (!sbDetails.chaPan) {
          errors[`container_${index}_chaPan`] =
            `Container ${index + 1}: CHA PAN is required`;
        } else if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(sbDetails.chaPan)) {
          errors[`container_${index}_chaPan`] =
            `Container ${index + 1}: Invalid CHA PAN format (5 letters + 4 digits + 1 letter)`;
        }
        if (!sbDetails.exporterNm) {
          errors[`container_${index}_exporterNm`] =
            `Container ${index + 1}: Exporter Name is required`;
        }
        if (!sbDetails.exporterIec) {
          errors[`container_${index}_exporterIec`] =
            `Container ${index + 1}: Exporter IEC is required`;
        } else if (!/^\d{10}$/.test(sbDetails.exporterIec)) {
          errors[`container_${index}_exporterIec`] =
            `Container ${index + 1}: Exporter IEC must be 10 digits`;
        }
        if (!sbDetails.noOfPkg || sbDetails.noOfPkg <= 0) {
          errors[`container_${index}_noOfPkg`] =
            `Container ${index + 1}: Number of Packages is required`;
        }
      }
    });

    // Attachment Validations
    const requiredAttachments = getRequiredAttachments();
    requiredAttachments.forEach((reqAtt) => {
      const hasAttachment = formData.attachments.some(
        (att) => (att.title === reqAtt.code || att.attTitle === reqAtt.code)
      );
      if (reqAtt.required && !hasAttachment) {
        errors[`attachment_${reqAtt.code}`] = `${reqAtt.name} is required`;
      }
    });

    return errors;
  };


  // Get Required Attachments based on location, cargo type, and origin as per images
  const getRequiredAttachments = () => {
    const required = [];
    const { locId, cargoTp, origin, cntnrStatus, containers } = formData;

    const normCargoTp = (cargoTp || "").toUpperCase();
    const normOrigin = (origin || "").toUpperCase();
    const normCntnrStatus = (cntnrStatus || "").toUpperCase();

    // Port Lists from Excel
    // ListA: Nhava Sheva to Kandla (Major Ports)
    const ListA = ["INNSA1", "INMUN1", "INNML1", "INTUT1", "INCCU1", "INPAV1", "INHZA1", "INMRM1", "INCOK1", "INVTZ1", "INHAL1", "INKRI1", "INIXY1"];
    // ListChennaiGroup: Chennai, Kattupalli, Ennore
    const ListChennaiGroup = ["INMAA1", "INKAT1", "INENN1"];
    // ListExtended: ListA + ListChennaiGroup + Paradip + Kakinada
    const ListExtended = [...ListA, ...ListChennaiGroup, "INPRT1", "INKAK1"];

    // Helper to check cargo types
    const isHazCargo = normCargoTp.includes("HAZ");
    const isOdcCargo = normCargoTp.includes("ODC");
    // ODC Hazardous specifically matches the dropdown value ODC(HAZ) or if both flags are present
    const isOdcHazCargo = normCargoTp === "ODC(HAZ)" || normCargoTp === "ODC HAZARDOUS" || (isHazCargo && isOdcCargo);

    // For docs referencing "HAZ ODC" or "HAZ & ODC", it usually means either or the combination
    const isHazOrOdc = isHazCargo || isOdcCargo || isOdcHazCargo;

    // 0. BOOKING_COPY (Mandatory For All Locations)
    required.push({ code: "BOOKING_COPY", name: "Booking Copy", required: true });

    // 1. PRE_EGM (Chennai only, Optional/N)
    if (locId === "INMAA1") {
      required.push({ code: "PRE_EGM", name: "Pre-EGM", required: false });
    }

    // 2. BOOK_CNFRM_CPY (Chennai Group, Cargo: HAZ, ODC, GEN, ONION, REF)
    if (ListChennaiGroup.includes(locId) && ["HAZ", "ODC", "GEN", "ONION", "REF", "ODC(HAZ)"].some(tp => normCargoTp.includes(tp))) {
      required.push({ code: "BOOK_CNFRM_CPY", name: "Booking Confirmation Copy", required: true });
    }

    // 3. BOOKING_CONF_COPY (Vizag, Origin: C, F, W, E_TANK)
    if (locId === "INVTZ1" && ["C", "F", "W", "E_TANK"].includes(normOrigin)) {
      required.push({ code: "BOOKING_CONF_COPY", name: "Booking confirmation copy", required: true });
    }

    // 4. CHK_LIST (Chennai Group, Cargo: HAZ, ODC, GEN, ONION, REF)
    if (ListChennaiGroup.includes(locId) && ["HAZ", "ODC", "GEN", "ONION", "REF", "ODC(HAZ)"].some(tp => normCargoTp.includes(tp))) {
      required.push({ code: "CHK_LIST", name: "Check List", required: true });
    }

    // 5. CLN_CRTFCT (ListA, Cargo: HAZ, Status: Empty)
    if (ListA.includes(locId) && isHazCargo && normCntnrStatus === "EMPTY") {
      required.push({ code: "CLN_CRTFCT", name: "Cleaning certificate", required: true });
    }

    // 6. CNTNR_LOAD_PLAN (ListA, Origin: Dock Stuff)
    if (ListA.includes(locId) && normOrigin === "C") {
      required.push({ code: "CNTNR_LOAD_PLAN", name: "Container Load Plan", required: true });
    }

    // 7. CUSTOMS_EXAM_REPORT (ListA, Origin: ON WHEEL)
    if (ListA.includes(locId) && normOrigin === "W") {
      required.push({ code: "CUSTOMS_EXAM_REPORT", name: "Customs Examination Report", required: true });
    }

    // 8. DG_DCLRTION (ListA + Chennai + Kattupalli, Cargo: HAZ, ODC)
    if ((ListA.includes(locId) || locId === "INMAA1" || locId === "INKAT1") && isHazOrOdc) {
      required.push({ code: "DG_DCLRTION", name: "DG Declaration", required: true });
    }

    // 9. DLVRY_ORDER (ListA + Chennai + Kattupalli, Origin: F, C, E_TANK)
    if ((ListA.includes(locId) || locId === "INMAA1" || locId === "INKAT1") && ["F", "C", "E_TANK"].includes(normOrigin)) {
      required.push({ code: "DLVRY_ORDER", name: "Delivery Order", required: true });
    }

    // 10. FIRE_OFC_CRTFCT (ListChennaiGroup, Cargo: HAZ, ODC)
    if (ListChennaiGroup.includes(locId) && isOdcHazCargo) {
      required.push({ code: "FIRE_OFC_CRTFCT", name: "Fire Office Certificate", required: true });
    }

    // 11. HAZ_DG_DECLARATION (ListExtended, Cargo: ODC HAZ)
    if (ListExtended.includes(locId) && isOdcHazCargo) {
      required.push({ code: "HAZ_DG_DECLARATION", name: "HAZ DG DECLARATION", required: true });
    }

    // 12. INVOICE (ListExtended, Origin: F, E_TANK)
    if (ListExtended.includes(locId) && ["F", "E_TANK"].includes(normOrigin)) {
      required.push({ code: "INVOICE", name: "Invoice", required: true });
    }

    // 13. LASHING_CERTIFICATE (ListExtended, Cargo: ODC & HAZ)
    if (ListExtended.includes(locId) && isOdcHazCargo) {
      required.push({ code: "LASHING_CERTIFICATE", name: "LASHING CERTIFICATE", required: true });
    }

    // 14. MMD_APPRVL (ListChennaiGroup, Cargo: HAZ, ODC)
    if (ListChennaiGroup.includes(locId) && isOdcHazCargo) {
      required.push({ code: "MMD_APPRVL", name: "MMD Approval", required: true });
    }

    // 15. MSDS (ListExtended, Cargo: ODC HAZ)
    if (ListExtended.includes(locId) && isOdcHazCargo) {
      required.push({ code: "MSDS", name: "MSDS", required: true });
    }

    // 16. MSDS_SHEET (ListChennaiGroup, Cargo: HAZ, ODC)
    if (ListChennaiGroup.includes(locId) && isOdcHazCargo) {
      required.push({ code: "MSDS_SHEET", name: "MSDS Sheet", required: true });
    }

    // 17. ODC_SURVEYOR_REPORT_PHOTOS (ListExtended, Cargo: ODC HAZ)
    if (ListExtended.includes(locId) && isOdcHazCargo) {
      required.push({ code: "ODC_SURVEYOR_REPORT_PHOTOS", name: "ODC SURVEYOR REPORT + PHOTOS", required: true });
    }

    // 18. PACK_LIST (ListA, Origin: Factory Stuff)
    if (ListA.includes(locId) && normOrigin === "F") {
      required.push({ code: "PACK_LIST", name: "Packing List", required: true });
    }

    // 19. SHIP_BILL (ListA, Origin: C, F, W, E_TANK)
    if (ListA.includes(locId) && ["C", "F", "W", "E_TANK"].includes(normOrigin)) {
      required.push({ code: "SHIP_BILL", name: "Shipping Bill", required: true });
    }

    // 20. SHIPPING_INSTRUCTION (Vizag, Origin: C, F, W, E_TANK)
    if (locId === "INVTZ1" && ["C", "F", "W", "E_TANK"].includes(normOrigin)) {
      required.push({ code: "SHIPPING_INSTRUCTION", name: "Shipping instruction (SI)", required: true });
    }

    // 21. SURVY_RPRT (ListChennaiGroup, Cargo: HAZ, ODC)
    if (ListChennaiGroup.includes(locId) && isOdcHazCargo) {
      required.push({ code: "SURVY_RPRT", name: "Survey Report", required: true });
    }

    // 22. VGM_ANXR1 (ListExtended, Origin: C, F, W, E_TANK)
    if (ListExtended.includes(locId) && ["C", "F", "W", "E_TANK"].includes(normOrigin)) {
      required.push({ code: "VGM_ANXR1", name: "VGM-Annexure 1", required: true });
    }

    return required;
  };

  // Form Data Change Handler
  const handleFormDataChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      let newData = { ...prev };

      if (section === "header") {
        newData[field] = value;

        // --- AUTO-FILL LOGIC FOR VESSEL -> VIA -> TERMINAL -> SERVICE ---
        if (["vesselNm", "viaNo", "terminalCode"].includes(field)) {
          // Find matching vessels based on current (potentially new) selections
          const matches = vessels.filter(v =>
            (!newData.bnfCode || v.bnfCode === newData.bnfCode) &&
            (!newData.locId || v.locId === newData.locId) &&
            (!newData.vesselNm || v.vesselNm === newData.vesselNm) &&
            (!newData.viaNo || v.viaNo === newData.viaNo) &&
            (!newData.terminalCode || v.terminalCode === newData.terminalCode)
          );

          // 1. Auto-fill VIA No.
          if (field === "vesselNm") {
            const uniqueVias = [...new Set(matches.map(m => m.viaNo))].filter(Boolean);
            if (uniqueVias.length === 1) {
              newData.viaNo = uniqueVias[0];
              // Recalculate matches for next steps
              const viaMatches = matches.filter(m => m.viaNo === newData.viaNo);

              const uniqueTerms = [...new Set(viaMatches.map(m => m.terminalCode))].filter(Boolean);
              if (uniqueTerms.length === 1) {
                newData.terminalCode = uniqueTerms[0];
                const termMatches = viaMatches.filter(m => m.terminalCode === newData.terminalCode);

                const uniqueServices = [...new Set(termMatches.map(m => m.service))].filter(Boolean);
                if (uniqueServices.length === 1) {
                  newData.service = uniqueServices[0];
                }
              }
            }
          }
          // 2. Auto-fill Terminal if VIA is selected
          else if (field === "viaNo") {
            const uniqueTerms = [...new Set(matches.map(m => m.terminalCode))].filter(Boolean);
            if (uniqueTerms.length === 1) {
              newData.terminalCode = uniqueTerms[0];
              const termMatches = matches.filter(m => m.terminalCode === newData.terminalCode);

              const uniqueServices = [...new Set(termMatches.map(m => m.service))].filter(Boolean);
              if (uniqueServices.length === 1) {
                newData.service = uniqueServices[0];
              }
            }
          }
          // 3. Auto-fill Service if Terminal is selected
          else if (field === "terminalCode") {
            const uniqueServices = [...new Set(matches.map(m => m.service))].filter(Boolean);
            if (uniqueServices.length === 1) {
              newData.service = uniqueServices[0];
            }
          }
        }
        // --- END AUTO-FILL LOGIC ---

        return newData;
      } else if (section === "containers") {
        const newContainers = [...prev.containers];
        if (index !== null) {
          newContainers[index] = { ...newContainers[index], [field]: value };
        }
        return { ...prev, containers: newContainers };
      } else if (section === "shippingBills") {
        const newShippingBills = [...prev.containers];
        if (index !== null && newShippingBills[index].sbDtlsVo) {
          newShippingBills[index].sbDtlsVo[0] = {
            ...newShippingBills[index].sbDtlsVo[0],
            [field]: value,
          };
        }
        return { ...prev, containers: newShippingBills };
      } else if (section === "attachments") {
        return { ...prev, attachments: value };
      }
      return prev;
    });
  };

  // Add Container
  const handleAddContainer = () => {
    setFormData((prev) => ({
      ...prev,
      containers: [
        ...prev.containers,
        {
          cntnrReqId: "",
          cntnrNo: "",
          cntnrSize: "",
          iso: "",
          agentSealNo: "",
          customSealNo: "",
          vgmWt: "",
          vgmViaODeX: "N",
          doNo: "",
          temp: "0",
          volt: "0",
          imoNo1: "",
          unNo1: "",
          imoNo2: "",
          unNo2: "",
          imoNo3: "",
          unNo3: "",
          imoNo4: "",
          unNo4: "",
          rightDimensions: "0.00",
          topDimensions: "0.00",
          backDimensions: "0.00",
          leftDimensions: "0.00",
          frontDimensions: "0.00",
          odcUnits: "",
          chaRemarks: "",
          vehicleNo: "",
          driverLicNo: "",
          driverNm: "",
          haulier: "",
          spclStow: "",
          spclStowRemark: "",
          status: "REQUESTED",
          shpInstructNo: "",
          cntnrTareWgt: 0,
          cargoVal: 0,
          commodityName: "",
          hsnCode: "",
          sbDtlsVo: [
            {
              shipBillInvNo: "",
              shipBillDt: "",
              leoNo: "",
              leoDt: "",
              chaNm: userData?.pyrName || "",
              chaPan: "",
              exporterNm: "",
              exporterIec: "",
              noOfPkg: 0,
            },
          ],
        },
      ],
    }));
  };

  const fieldToLabel = (fieldName) => {
    const labelMap = {
      vesselNm: "Vessel Name",
      viaNo: "VIA No",
      cntnrStatus: "Container Status",
      pod: "POD",
      issueTo: "Issue To",
      cfsCode: "CFS Code",
      CHACode: "CHA Code",
      // Add more mappings as needed
    };

    return labelMap[fieldName] || fieldName;
  }

  // Remove Container
  const handleRemoveContainer = (index) => {
    if (formData.containers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        containers: prev.containers.filter((_, i) => i !== index),
      }));
    }
  };
  const formatBusinessErrors = (businessErrors) => {
    const errors = {};

    if (!businessErrors) return errors;


    // Split by number pattern like "1 -", "2 -", etc.
    const errorLines = businessErrors.split(/\d+\s*-\s*/).filter(line => line.trim());


    errorLines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Map specific error messages to form fields
      if (trimmedLine.includes("Vessel Name or Via No. is invalid")) {
        errors.vesselNm = "Vessel Name or Via No. is invalid";
        errors.viaNo = "Vessel Name or Via No. is invalid";
      }

      if (trimmedLine.includes("Container status is invalid")) {
        errors.cntnrStatus = "Container status is invalid for the selected vessel";
      }

      if (trimmedLine.includes("POD is Invalid")) {
        errors.pod = "POD is invalid for the provided Booking No";
      }

      if (trimmedLine.includes("Issue To is required")) {
        errors.issueTo = "Issue To is required";
      }

      if (trimmedLine.includes("CFS is required")) {
        errors.cfsCode = "CFS is required";
      }

      if (trimmedLine.includes("CFS code is invalid")) {
        errors.cfsCode = "CFS code is invalid. Please match with master data.";
      }

      if (trimmedLine.includes("IMO code is invalid") || trimmedLine.includes("IMO No. 1 code is invalid")) {
        errors.imoNo1 = "IMO code is invalid for the selected cargo";
      }

      if (trimmedLine.includes("Attachment title is invalid")) {
        errors.attachments = "One or more attachment titles are invalid";
      }

      if (trimmedLine.includes("Enter valid Email Id")) {
        errors.emailId = "Please enter a valid email address";
      }

      if (trimmedLine.includes("invalid CHA code")) {
        errors.CHACode = "Invalid CHA code";
      }

      // If no specific field mapping found, add as generic error
      if (Object.keys(errors).length === 0 && index === 0) {
        errors.generic = businessErrors;
      }
    });

    // If we still have no errors, add the raw business errors
    if (Object.keys(errors).length === 0) {
      errors.generic = businessErrors;
    }

    return errors;
  };

  // ADD THE MISSING FUNCTION - formatSchemaErrors
  const formatSchemaErrors = (schemaErrors) => {
    const errors = {};

    if (!schemaErrors) return errors;


    try {
      if (typeof schemaErrors === 'string') {
        // Try to parse as JSON if it's a string
        try {
          const parsedErrors = JSON.parse(schemaErrors);
          Object.keys(parsedErrors).forEach(key => {
            errors[key] = parsedErrors[key];
          });
        } catch (e) {
          // If it's not JSON, treat it as a generic error message
          errors.generic = schemaErrors;
        }
      } else if (typeof schemaErrors === 'object') {
        Object.keys(schemaErrors).forEach(key => {
          errors[key] = schemaErrors[key];
        });
      }
    } catch (e) {
      console.warn('Could not parse schema errors:', e);
      errors.generic = "Schema validation failed";
    }

    return errors;
  };
  // Convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:application/pdf;base64, prefix
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Submit Form
  // src/components/Form13/Form13.jsx

  // Update the handleSubmit function with proper error handling
  // src/components/Form13/Form13.jsx

  // src/components/Form13/Form13.jsx

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setValidationErrors({});

      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError(
          `Please fix ${Object.keys(errors).length} validation error(s) before submitting`
        );
        setLoading(false);
        return;
      }

      // --- DUPLICATE CHECK ---
      // Check if any of the containers already exist for this Booking No
      try {
        const bookNo = formData.bookNo;
        const bnfCode = formData.bnfCode;

        // Search for existing requests with same booking and shipping line
        const response = await form13API.getRequests({ bookNo, bnfCode });
        const existingRequests = response.data?.requests || [];

        // Check if any container in the current form matches an existing (non-cancelled) request
        const duplicateContainers = [];
        formData.containers.forEach(currCont => {
          const isDuplicate = existingRequests.some(extReq => {
            // Find container in existing request's cntrList
            const containersInExt = extReq.cntrList || extReq.containers || [];
            return containersInExt.some(extCont =>
              extCont.cntnrNo === currCont.cntnrNo &&
              extReq.status !== 'CANCELLED' &&
              extReq._id !== requestId // Allow current request if editing
            );
          });
          if (isDuplicate) duplicateContainers.push(currCont.cntnrNo);
        });

        if (duplicateContainers.length > 0) {
          setError(`Duplicate submission detected: Container(s) ${duplicateContainers.join(', ')} already have a request for Booking No ${bookNo}.`);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Duplicate check failed, proceeding with submission:", err);
      }
      // --- END DUPLICATE CHECK ---

      // Prepare attachments with base64 encoding
      const attList = await Promise.all(
        formData.attachments.map(async (file) => {
          // If it's already from the DB, it will have attData and no name property (likely)
          // or it will be an object with attData.
          if (file.attData) {
            return {
              attReqId: file.attReqId || "",
              attNm: file.attNm,
              attData: file.attData,
              attTitle: file.attTitle,
            };
          }

          // It's a new File object from the frontend
          const attName = (file.title || "BOOKING_COPY").toLowerCase() + ".pdf";
          return {
            attReqId: "",
            attNm: attName,
            attData: await fileToBase64(file),
            attTitle: file.title || "BOOKING_COPY",
          };
        })
      );

      let backendHashKey = "";
      try {
        const hashKeyRes = await form13API.getHashKey({});
        if (hashKeyRes?.data?.data?.hashKey) {
          backendHashKey = hashKeyRes.data.data.hashKey;
        } else if (hashKeyRes?.data?.hashKey) {
          backendHashKey = hashKeyRes.data.hashKey;
        }
      } catch (err) {
        console.error("Failed to fetch hashKey from backend:", err);
      }

      // Helper function to remove empty fields from payload and trim strings
      const cleanPayload = (obj) => {
        const cleaned = {};
        Object.keys(obj).forEach((key) => {
          let value = obj[key];

          // Trim strings
          if (typeof value === "string") {
            value = value.trim();
          }

          // shipperCity and shipperCd should go even if empty
          const alwaysInclude = ["shipperCity", "shipperCd"];

          if (alwaysInclude.includes(key) || (value !== null && value !== undefined && value !== "")) {
            if (Array.isArray(value)) {
              cleaned[key] = value.map(item => (typeof item === 'object' && item !== null) ? cleanPayload(item) : (typeof item === "string" ? item.trim() : item));
            } else if (typeof value === "object" && value !== null) {
              cleaned[key] = cleanPayload(value);
            } else {
              cleaned[key] = value;
            }
          }
        });
        return cleaned;
      };

      // Prepare API payload
      const rawPayload = {
        hashKey: backendHashKey,
        formType: "F13",
        odexRefNo: formData.odexRefNo,
        reqId: formData.reqId,
        bookNo: formData.bookNo,
        bnfCode: formData.bnfCode,
        locId: formData.locId,
        vesselNm: formData.vesselNm,
        viaNo: formData.viaNo,
        terminalCode: formData.terminalCode,
        service: formData.service,
        pod: formData.pod,
        fpod: formData.fpod,
        cargoTp: formData.cargoTp,
        origin: formData.origin,
        shpInstructNo: formData.shpInstructNo,
        cntnrStatus: (formData.cntnrStatus || "").toUpperCase(),
        mobileNo: formData.mobileNo,
        issueTo: formData.issueTo,
        shipperNm: formData.shipperNm,
        pyrCode: formData.pyrCode,
        consigneeNm: formData.consigneeNm,
        consigneeAddr: formData.consigneeAddr,
        cargoDesc: formData.cargoDesc,
        terminalLoginId: formData.terminalLoginId,
        stuffTp: formData.stuffTp,
        icdLoadingPort: formData.icdLoadingPort,
        voyageNo: formData.voyageNo,
        haulageTp: formData.haulageTp,
        isEarlyGateIn: formData.IsEarlyGateIn,
        shipperCd: formData.shipperCd,
        railOperator: formData.railOperator,
        shipperCity: formData.ShipperCity,
        ffCode: formData.FFCode,
        ieCode: formData.IECode,
        bookLinId: formData.bookLinId,
        notifyTo: formData.Notify_TO,
        chaCode: formData.CHACode,
        placeOfDel: formData.placeOfDel,
        contactPerson: formData.contactPerson,
        outsideWindowIssue: formData.outsideWindowIssue,
        cfsCode: formData.cfsCode,
        emailId: formData.emailId,
        cntrList: formData.containers.map((container) => {
          // vgmWt formatting: if no decimal then add two decimal from frontend
          let formattedVgmWt = container.vgmWt;
          if (formattedVgmWt) {
            const num = parseFloat(formattedVgmWt);
            if (!isNaN(num)) {
              formattedVgmWt = num.toFixed(2);
            }
          }

          return {

            cntnrReqId: container.cntnrReqId,
            cntnrNo: container.cntnrNo,
            cntnrSize: container.cntnrSize,
            iso: container.iso,
            agentSealNo: container.agentSealNo,
            customSealNo: container.customSealNo,
            vgmWt: formattedVgmWt,
            vgmViaODeX: container.vgmViaODeX,
            doNo: container.doNo,
            temp: container.temp,
            volt: container.volt,
            chaRemarks: container.chaRemarks,
            vehicleNo: container.vehicleNo,
            driverLicNo: container.driverLicNo,
            driverNm: container.driverNm,
            haulier: container.haulier,
            imoNo1: container.imoNo1,
            unNo1: container.unNo1,
            imoNo2: container.imoNo2,
            unNo2: container.unNo2,
            imoNo3: container.imoNo3,
            unNo3: container.unNo3,
            imoNo4: container.imoNo4,
            unNo4: container.unNo4,
            rightDimensions: container.rightDimensions,
            topDimensions: container.topDimensions,
            backDimensions: container.backDimensions,
            leftDimensions: container.leftDimensions,
            frontDimensions: container.frontDimensions,
            odcUnits: container.odcUnits,
            status: container.status,
            spclStow: container.spclStow,
            spclStowRemark: container.spclStowRemark,
            cntnrTareWgt: Number(container.cntnrTareWgt || 0),
            cargoVal: Number(container.cargoVal || 0),
            commodityName: container.commodityName,
            shpInstructNo: container.shpInstructNo,
            sbDtlsVo: (container.sbDtlsVo || []).map(sb => ({
              ...sb,
              noOfPkg: Number(sb.noOfPkg || 0),
            })),
          };
        }),
        attList: attList,
      };

      const payload = cleanPayload(rawPayload);


      // Call API
      let response;
      // Use update if we have a requestId (either from initial load OR from a 'Save' action)
      if (requestId) {
        response = await form13API.updateRequest(requestId, payload);
      } else {
        response = await form13API.submitForm13(payload);
      }

      const respData = response?.data || {};

      const businessFlag = respData.business_validation || respData["business validation"] || respData.data?.["business validation"] || respData.data?.business_validation;
      const businessErrors = respData.business_validations || respData.data?.business_validations;

      if (businessFlag === "FAIL" && businessErrors) {
        const formattedErrors = formatBusinessErrors(businessErrors);
        setValidationErrors(formattedErrors);
        setError("Business Validation Failed");
        setLoading(false);
        return;
      }

      // Handle Schema Validation Failures
      const schemaFlag = respData.schema_validation || respData["schema validation"] || respData.data?.["schema validation"] || respData.data?.schema_validation;
      const schemaErrors = respData.schema_validations || respData.data?.schema_validations;

      if (schemaFlag === "FAIL" && schemaErrors) {
        const formattedSchemaErrors = formatSchemaErrors(schemaErrors);
        setError("Schema Validation Failed");
        setValidationErrors(formattedSchemaErrors);
        setLoading(false);
        return;
      }

      const odexRefNo = respData.odexRefNo || respData.data?.odexRefNo || response.odexRefNo;

      if (odexRefNo) {
        setSuccess(
          `Form 13 ${isEditMode ? "updated" : "submitted"} successfully! Reference No: ${odexRefNo}`
        );
        if (isEditMode) {
          setTimeout(() => navigate("/track-f13"), 2000);
        }
      } else {
        setError("Form submission failed. Please check your inputs and try again.");
      }
    } catch (err) {
      console.error("💥 Form submission error:", err);
      console.error("💥 Error response:", err.response);

      let errorMessage = err.response?.data?.error || err.message;

      if (errorMessage.includes("Form type is required")) {
        errorMessage = "Form Type is required. Please contact support.";
      } else if (errorMessage.includes("ODeX Error:")) {
        errorMessage = errorMessage.replace("ODeX Error: ", "");
      } else if (errorMessage.includes("Network Error") || errorMessage.includes("timeout")) {
        errorMessage = "Network connection issue. Please check your internet and try again.";
      } else if (errorMessage.includes("500")) {
        errorMessage = "Server error. Please try again in a few moments.";
      }

      setError(`Failed to submit form: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{ py: { xs: 2, md: 2.5 }, pt: { xs: 10, md: 11 } }}
    >
      <AppbarComponent />
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            FORM 13 - Export Gate Pass
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Submit Form 13 for export container gate-in authorization at Indian
            ports
          </Typography>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError("")}>
            <Typography variant="subtitle1" fontWeight="bold">
              {error}
            </Typography>
            {error.includes("Validation") && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please check the highlighted fields below for details.
              </Typography>
            )}
          </Alert>
        )}

        {isSaved && !success && (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Form data is saved to DB. Don't forget to <strong>Submit to ODeX</strong> once finalized.
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 1.5 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* API Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              API Validation Errors ({Object.keys(validationErrors).length} found)
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
              {Object.entries(validationErrors).map(([field, message]) => (
                <li key={field}>
                  <Typography variant="body2">
                    {field !== 'generic' ? (
                      <>
                        <strong>{fieldToLabel(field)}:</strong> {message}
                      </>
                    ) : (
                      message
                    )}
                  </Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}



        {/* Master Data Loading Status */}
        {!masterDataLoaded && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography>
              Loading master data (Vessels, PODs, Terminals)...
            </Typography>
          </Box>
        )}

        {/* Continuous Scroll Form */}
        <Box>
          {/* Section 1: Header Information */}
          <Form13HeaderSection
            formData={formData}
            vessels={vessels}
            pods={pods}
            shippingLines={shippingLines}
            hauliers={hauliers}
            cfsCodes={cfsCodes}
            masterDataLoaded={masterDataLoaded}
            loading={loading}
            onFormDataChange={handleFormDataChange}
            onReloadMasterData={loadMasterData}
            validationErrors={validationErrors}
          />

          {/* Container Information */}
          <Form13ContainerSection
            formData={formData}
            hauliers={hauliers}
            onFormDataChange={handleFormDataChange}
            onAddContainer={handleAddContainer}
            onRemoveContainer={handleRemoveContainer}
            validationErrors={validationErrors}
            submitted={loading || Object.keys(validationErrors).length > 0}
          />

          {/* Attachments */}
          <Form13AttachmentSection
            formData={formData}
            onFormDataChange={handleFormDataChange}
            requiredAttachments={getRequiredAttachments()}
            validationErrors={validationErrors}
          />

          {/* Bottom Action Bar */}
          <Box sx={{
            mt: 3,
            py: 2,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap"
          }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/track-f13")}
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={async () => {
                try {
                  setLoading(true);
                  setError("");
                  // Prepare data (simplified save to DB only)
                  let response;
                  if (requestId) {
                    response = await form13API.updateRequest(requestId, { ...formData, status: "SAVED" });
                  } else {
                    // For first save, we might want a simple endpoint or just /submit with a flag
                    // Using current submit logic but marking as saved
                    response = await form13API.submitForm13({ ...formData, status: "SAVED", skipOdex: true });
                  }

                  if (response.data?._id || response.data?.internalRef) {
                    const newId = response.data?._id || response.data?.internalRef;
                    setRequestId(newId);
                    setIsEditMode(true); // Switch to edit mode so subsequent submits update this record
                    setIsSaved(true);
                    setSuccess("Form saved successfully to database.");
                  }
                } catch (err) {
                  setError("Failed to save draft: " + (err.response?.data?.error || err.message));
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !masterDataLoaded}
              startIcon={<SaveIcon />}
              sx={{ minWidth: 150, bgcolor: "#0d6efd" }}
            >
              {loading ? "Saving..." : "Save"}
            </Button>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !masterDataLoaded}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{
                minWidth: 180,
                bgcolor: (loading || !masterDataLoaded) ? "rgba(0,0,0,0.12)" : "#1976d2",
                '&:hover': { bgcolor: "#1565c0" }
              }}
            >
              {loading ? (isEditMode ? "Updating..." : "Submitting...") : (isEditMode ? "Submit to ODeX" : "Submit to ODeX")}
            </Button>
          </Box>
        </Box>

        {/* Removed Fab as requested */}

        {/* Copy From Previous Dialog */}
        <Dialog
          open={showCopyPopup}
          onClose={() => setShowCopyPopup(false)}
          aria-labelledby="copy-dialog-title"
          aria-describedby="copy-dialog-description"
        >
          <DialogTitle id="copy-dialog-title">
            {"Copy from Previous Entry?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="copy-dialog-description">
              A previous Form 13 entry was found for Shipping Line: <strong>{formData.bnfCode}</strong> and Booking No: <strong>{formData.bookNo}</strong>.
              Would you like to copy all details from that entry?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setShowCopyPopup(false); setPreviousEntry(null); }} color="inherit">
              No, Thank you
            </Button>
            <Button onClick={handleCopyFromPrevious} variant="contained" color="primary" autoFocus>
              Yes, Copy Data
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};


export default Form13;
