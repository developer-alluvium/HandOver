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
import { useNavigate } from "react-router-dom";
import { Save as SaveIcon, Send as SendIcon } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { form13API } from "../../services/form13API";
import Form13HeaderSection from "./Form13HeaderSection";
import Form13ContainerSection from "./Form13ContainerSection";
import Form13ShippingBillSection from "./Form13ShippingBillSection";
import Form13AttachmentSection from "./Form13AttachmentSection";

import TopNavDropdown from "../TopNavDropdown";

const Form13 = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [previousEntry, setPreviousEntry] = useState(null);
  const [isCheckingPrevious, setIsCheckingPrevious] = useState(false);

  // Master Data States
  const [vessels, setVessels] = useState([]);
  const [pods, setPods] = useState([]);
  const [masterDataLoaded, setMasterDataLoaded] = useState(false);

  // Form Data State - Complete structure matching API requirements
  // HARDCODE YOUR HASHKEY HERE

  const [formData, setFormData] = useState({
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
    terminalLoginId: "",
    email_Id: "",
    bookCopyBlNo: "",
    cntnrStatus: "",
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
  });

  // Load Master Data on component mount
  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      setError("");

      const userData = JSON.parse(localStorage.getItem("odex_auth"));
      const pyrCode = userData?.userData?.pyrCode;

      if (!pyrCode) {
        throw new Error("Payor code not found. Please login again.");
      }

      const timestamp = new Date()
        .toISOString()
        .replace("T", " ")
        .split(".")[0];

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
      const podRequest = {
        pyrCode: pyrCode,
        fromTs: timestamp,
        hashKey,
      };

      const podResponse = await form13API.getPODMaster(podRequest);
      setPods(podResponse.data || []);

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

  // Feature: Copy Data from Previous Entry
  useEffect(() => {
    const checkPreviousEntry = async () => {
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
    if (!loading && masterDataLoaded) {
      const timer = setTimeout(checkPreviousEntry, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.bnfCode, formData.bookNo]);

  const handleCopyFromPrevious = () => {
    if (previousEntry) {
      // Create a clean copy of the previous data
      const {
        _id, createdAt, updatedAt, __v, odexRefNo, status,
        vesselApiResponse, podApiResponse, form13ApiResponse,
        timestamp, hashKey,
        ...cleanData
      } = previousEntry;

      setFormData(prev => ({
        ...prev,
        ...cleanData,
        // Keep current pyrCode
        pyrCode: prev.pyrCode,
      }));
      setSuccess("Previous entry data copied successfully");
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
      ["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1"].includes(
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

      // MSC Shipping Instruction Number validation
      if (formData.bnfCode === "MSCU" && !container.shpInstructNo) {
        errors[`container_${index}_shpInstructNo`] =
          `Container ${index + 1}: Shipping Instruction No is mandatory for MSC`;
      }

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
        (att) => att.title === reqAtt.code
      );
      if (reqAtt.required && !hasAttachment) {
        errors[`attachment_${reqAtt.code}`] = `${reqAtt.name} is required`;
      }
    });

    return errors;
  };

  useEffect(() => { console.log(validationErrors); }, [validationErrors]);

  // Get Required Attachments based on location, cargo type, and origin
  const getRequiredAttachments = () => {
    const required = [];
    const { locId, cargoTp, origin, terminalCode } = formData;

    // BOOKING_COPY - Mandatory for all locations
    required.push({
      code: "BOOKING_COPY",
      name: "Booking Copy",
      required: true,
    });

    // Location-specific mandatory attachments
    const chennaiKattupalli_EnoreLocations = ["INMAA1", "INKAT1", "INENN1"];
    if (
      chennaiKattupalli_EnoreLocations.includes(locId) &&
      ["HAZ", "ODC", "GEN", "ONION", "REF"].includes(cargoTp)
    ) {
      required.push({
        code: "BOOK_CNFRM_CPY",
        name: "Booking Confirmation Copy",
        required: true,
      });
      required.push({ code: "CHK_LIST", name: "Check List", required: true });
      if (["HAZ", "ODC"].includes(cargoTp)) {
        required.push({
          code: "FIRE_OFC_CRTFCT",
          name: "Fire Office Certificate",
          required: true,
        });
        required.push({
          code: "MMD_APPRVL",
          name: "MMD Approval",
          required: true,
        });
        required.push({
          code: "MSDS_SHEET",
          name: "MSDS Sheet",
          required: true,
        });
        required.push({
          code: "SURVY_RPRT",
          name: "Survey Report",
          required: true,
        });
      }
    }

    // Nhava Sheva, Mundra, and other major port requirements
    const majorPorts = [
      "INNSA1",
      "INMUN1",
      "INMAA5",
      "INTUT1",
      "INCCU1",
      "INPAV1",
      "INHZR1",
      "INMRM1",
      "INCOK1",
      "INVTZ1",
      "INHLD1",
      "INKRI1",
      "INKND1",
    ];

    if (majorPorts.includes(locId)) {
      // Clean Certificate for HAZ + Empty container
      if (cargoTp === "HAZ" && formData.cntnrStatus === "EMPTY") {
        required.push({
          code: "CLN_CRTFCT",
          name: "Cleaning Certificate",
          required: true,
        });
      }

      // Container Load Plan for Dock Stuff
      if (origin === "D") {
        required.push({
          code: "CNTNR_LOAD_PLAN",
          name: "Container Load Plan",
          required: true,
        });
      }

      // Customs Examination Report for On Wheel
      if (origin === "W") {
        required.push({
          code: "CUSTOMS_EXAM_REPORT",
          name: "Customs Examination Report",
          required: true,
        });
      }

      // DG Declaration for HAZ/ODC
      if (["HAZ", "ODC"].includes(cargoTp)) {
        required.push({
          code: "DG_DCLRTION",
          name: "DG Declaration",
          required: true,
        });
        required.push({
          code: "HAZ_DG_DECLARATION",
          name: "HAZ DG Declaration",
          required: true,
        });
        required.push({
          code: "LASHING_CERTIFICATE",
          name: "Lashing Certificate",
          required: true,
        });
        required.push({ code: "MSDS", name: "MSDS", required: true });
        required.push({
          code: "ODC_SURVEYOR_REPORT_PHOTOS",
          name: "ODC Surveyor Report + Photos",
          required: true,
        });
      }

      // Delivery Order for Factory Stuff, Dock Stuff, Empty Tank
      if (["F", "D", "E"].includes(origin)) {
        required.push({
          code: "DLVRY_ORDER",
          name: "Delivery Order",
          required: true,
        });
      }

      // Invoice for Factory Stuff, Empty Tank
      if (["F", "E"].includes(origin)) {
        required.push({ code: "INVOICE", name: "Invoice", required: true });
      }

      // Packing List for Factory Stuff
      if (origin === "F") {
        required.push({
          code: "PACK_LIST",
          name: "Packing List",
          required: true,
        });
      }

      // Shipping Bill for Dock Stuff, Factory Stuff, On Wheel, Empty Tank
      if (["D", "F", "W", "E"].includes(origin)) {
        required.push({
          code: "SHIP_BILL",
          name: "Shipping Bill",
          required: true,
        });
      }

      // VGM Annexure 1
      if (["D", "F", "W", "E"].includes(origin)) {
        required.push({
          code: "VGM_ANXR1",
          name: "VGM-Annexure 1",
          required: true,
        });
      }
    }

    // Vishakapatnam specific
    if (locId === "INVTZ1") {
      if (["D", "F"].includes(origin) && origin === "W") {
        required.push({
          code: "BOOKING_CONF_COPY",
          name: "Booking Confirmation Copy",
          required: true,
        });
      }
      if (["D", "F", "W", "E"].includes(origin)) {
        required.push({
          code: "SHIPPING_INSTRUCTION",
          name: "Shipping Instruction (SI)",
          required: true,
        });
      }
    }

    // Chennai specific
    if (locId === "INMAA1") {
      required.push({
        code: "PRE_EGM",
        name: "Pre-EGM",
        required: false,
      });
    }

    return required;
  };

  // Form Data Change Handler
  const handleFormDataChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      if (section === "header") {
        return { ...prev, [field]: value };
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

    console.log("🔧 Raw business errors:", businessErrors);

    // Split by number pattern like "1 -", "2 -", etc.
    const errorLines = businessErrors.split(/\d+\s*-\s*/).filter(line => line.trim());

    console.log("🔧 Parsed error lines:", errorLines);

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

    console.log("🔧 Formatted errors:", errors);
    return errors;
  };

  // ADD THE MISSING FUNCTION - formatSchemaErrors
  const formatSchemaErrors = (schemaErrors) => {
    const errors = {};

    if (!schemaErrors) return errors;

    console.log("🔧 Raw schema errors:", schemaErrors);

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

    console.log("🔧 Formatted schema errors:", errors);
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

      // Prepare attachments with base64 encoding
      const attList = await Promise.all(
        formData.attachments.map(async (file) => {
          // shipper name is mandatory booking name is mandatory attached copy attNm should be by default booking_copy 
          // also if selected SHIPPING INSTRUCTION for attachment then attNm will be shipping_instruction
          let attName = "booking_copy.pdf";
          if (file.title === "SHIPPING_INSTRUCTION") {
            attName = "shipping_instruction.pdf";
          }

          return {
            attReqId: "",
            attNm: attName,
            attData: await fileToBase64(file),
            attTitle: file.title || "BOOKING_COPY",
          };
        })
      );

      const hardcodedHashKey = "5XRMN8PVXKQT";

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
        formType: "F13",
        hashKey: hardcodedHashKey,
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

      console.log("📤 Sending payload:", payload);

      // Call API
      const response = await form13API.submitForm13(payload);

      console.log("📥 Raw API Response:", response);
      console.log("📥 Response data:", response?.data);

      // FIXED: The response data is directly at response.data level
      const respData = response?.data || {};

      console.log("🔍 Parsed response data:", respData);
      console.log("🔍 Business validation:", respData.business_validation);
      console.log("🔍 Business errors:", respData.business_validations);

      // Handle Business Validation Failures - Check directly in respData

      // Handle Schema Validation Failures
      const schemaFlag = respData.schema_validation;
      const schemaErrors = respData.schema_validations;

      if (schemaFlag === "FAIL" && schemaErrors) {
        console.log("🚨 Schema validation failed");
        const formattedSchemaErrors = formatSchemaErrors(schemaErrors);
        setError("Schema Validation Failed");
        setValidationErrors(formattedSchemaErrors);
        setLoading(false);
        return;
      }

      // Check if the form was actually successful
      // Since your API returns success: true even with business validation failures,
      // we need to check the business_validation flag instead
      const odexRefNo = respData.odexRefNo;

      if (odexRefNo && businessFlag !== "FAIL") {
        console.log("✅ Form submitted successfully");
        setSuccess(
          `Form 13 submitted successfully! Reference No: ${odexRefNo}`
        );
      } else {
        console.log("❌ Form submission failed or has validation errors");
        // Show generic error if we didn't catch specific validation errors
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            FORM 13 - Export Gate Pass
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Submit Form 13 for export container gate-in authorization at Indian
            ports
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
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

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* API Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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
            masterDataLoaded={masterDataLoaded}
            loading={loading}
            onFormDataChange={handleFormDataChange}
            onReloadMasterData={loadMasterData}
            validationErrors={validationErrors}
          />

          {/* Container Information */}
          <Form13ContainerSection
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onAddContainer={handleAddContainer}
            onRemoveContainer={handleRemoveContainer}
            validationErrors={validationErrors}
          />

          {/* Attachments */}
          <Form13AttachmentSection
            formData={formData}
            onFormDataChange={handleFormDataChange}
            requiredAttachments={getRequiredAttachments()}
            validationErrors={validationErrors}
          />

          {/* Submit Button */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !masterDataLoaded}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{ minWidth: 200 }}
            >
              {loading ? "Submitting..." : "Submit Form 13"}
            </Button>
          </Box>
        </Box>

        <Fab
          color="primary"
          aria-label="submit"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
          onClick={handleSubmit}
          disabled={loading || !masterDataLoaded}
        >
          <SendIcon />
        </Fab>

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