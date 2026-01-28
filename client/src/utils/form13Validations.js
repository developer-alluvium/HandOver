// src/utils/form13Validations.js

/**
 * Form 13 Conditional Validation Rules based on API Documentation
 *
 * This file contains all conditional validation rules for Form 13 submission
 * based on the ODeX API documentation version 4.0 (28-06-2025)
 */

// ==============================================
// 1. LOCATION-SPECIFIC VALIDATION RULES
// ==============================================

/**
 * Location-specific field requirements based on Section 5.3 of API doc
 * Each location has different mandatory fields and conditions
 */
export const LOCATION_SPECIFIC_RULES = {
  INMAA1: {
    // Chennai
    name: "Chennai",
    requires: [
      "consigneeNm",
      "consigneeAddr",
      "cargoDesc",
      "terminalLoginId",
      "fpod",
    ],
    optional: [],
    terminalCodes: ["DBGT", "CT1", "CT2", "CT3"],
    specialNotes: "FPOD is mandatory for Chennai location",
    cargoTypeRules: {
      HAZ: [
        "imoNo1",
        "unNo1",
        "fireOfficeCertificate",
        "mmdApproval",
        "msdsSheet",
        "surveyReport",
      ],
      ODC: [
        "rightDimensions",
        "topDimensions",
        "backDimensions",
        "leftDimensions",
        "frontDimensions",
        "odcUnits",
      ],
      REF: ["temp"],
    },
  },

  INPRT1: {
    // Paradip
    name: "Paradip",
    requires: [
      "consigneeNm",
      "consigneeAddr",
      "cargoDesc",
      "terminalLoginId",
      "fpod",
    ],
    optional: [],
    specialNotes: "FPOD is mandatory for Paradip location",
  },

  INKAT1: {
    // Kattupalli
    name: "Kattupalli",
    requires: [
      "consigneeNm",
      "consigneeAddr",
      "cargoDesc",
      "terminalLoginId",
      "fpod",
    ],
    optional: [],
    specialNotes: "FPOD is mandatory for Kattupalli location",
  },

  INCCU1: {
    // Kolkata
    name: "Kolkata",
    requires: [
      "consigneeNm",
      "consigneeAddr",
      "cargoDesc",
      "terminalLoginId",
      "fpod",
    ],
    optional: [],
    specialNotes: "FPOD is mandatory for Kolkata location",
  },

  INENN1: {
    // Ennore
    name: "Ennore",
    requires: [
      "consigneeNm",
      "consigneeAddr",
      "cargoDesc",
      "terminalLoginId",
      "fpod",
    ],
    optional: [],
    specialNotes: "FPOD is mandatory for Ennore location",
  },

  INMUN1: {
    // Mundra
    name: "Mundra",
    requires: ["consigneeNm", "consigneeAddr", "cargoDesc", "terminalLoginId"],
    optional: ["fpod"],
    earlyGateIn: {
      enabled: true,
      shippingLines: ["CMA"],
      note: "Early gate-in available for CMA line only, storage and line charges applicable",
    },
    originRules: {
      F: ["vehicleNo"], // Factory Stuffed requires vehicle number
      R: ["vehicleNo"], // ICD by Road requires vehicle number
    },
    terminalCodes: ["AMCT", "MICT", "GCT", "ACMTPL"],
  },

  INTUT1: {
    // Tuticorin
    name: "Tuticorin",
    requires: [],
    optional: ["ShipperCity"],
    terminalSpecific: {
      DBGT: {
        requires: ["ShipperCity"],
        note: "Shipper City is mandatory for DBGT terminal",
      },
    },
    specialNotes: "For DBGT terminal only, Shipper City is mandatory",
  },

  INNSA1: {
    // Nhava Sheva
    name: "Nhava Sheva",
    requiresChaFfIe: true, // One of CHA Code, FF Code or IE Code is required
    optional: [],
    terminalCodes: ["NSICT", "NSIGT", "BMCT", "CCTL", "ICT", "JNPCT", "GTI"],
    terminalRules: {
      NSICT: ["spclStow", "spclStowRemark"],
      NSIGT: ["spclStow", "spclStowRemark"],
      BMCT: ["spclStow", "spclStowRemark"],
      CCTL: ["spclStow", "spclStowRemark"],
      ICT: ["spclStow", "spclStowRemark"],
    },
    specialNotes:
      "For NSICT/NSIGT/BMCT/CCTL/ICT terminals, Special Stow and Remark are required",
  },

  INNML1: {
    // Mangalore
    name: "Mangalore",
    requires: [],
    optional: [],
  },

  INPAV1: {
    // Pipavav
    name: "Pipavav",
    requires: [],
    optional: [],
  },

  INHZA1: {
    // Hazira
    name: "Hazira",
    requires: [],
    optional: [],
  },

  INMRM1: {
    // Marmagoa
    name: "Marmagoa",
    requires: [],
    optional: [],
  },

  INCOK1: {
    // Cochin
    name: "Cochin",
    requires: [],
    optional: [],
  },

  INVTZ1: {
    // Vishakapatnam
    name: "Vishakapatnam",
    requires: [],
    optional: [],
    attachmentRules: {
      origins: ["C", "F", "W"], // Dock, Factory, On Wheel
      requires: ["BOOKING_CONF_COPY", "SHIPPING_INSTRUCTION"],
    },
  },

  INHAL1: {
    // Haldia
    name: "Haldia",
    requires: [],
    optional: [],
  },

  INKRI1: {
    // Krishnapatnam
    name: "Krishnapatnam",
    requires: [],
    optional: [],
  },

  INIXY1: {
    // Kandla
    name: "Kandla",
    requires: [],
    optional: [],
  },

  INKAK1: {
    // Kakinada
    name: "Kakinada",
    requires: [],
    optional: [],
  },
};

// ==============================================
// 2. SHIPPING LINE SPECIFIC RULES
// ==============================================

/**
 * Shipping line specific validation rules
 * Based on Section 7.2 of API documentation
 */
export const SHIPPING_LINE_RULES = {
  MSCU: {
    name: "MSC",
    requires: ["bookNo", "shpInstructNo"],
    containerRequires: ["shpInstructNo"],
    specialNotes:
      "Booking No and Shipping Instruction No are mandatory for MSC",
    errorCodes: {
      bookNo: "Mandatory for MSC shipping line",
      shpInstructNo: "Shipping Instruction No is mandatory for MSC",
    },
  },

  HapagLlyod: {
    name: "Hapag Lloyd",
    blNumberRule: {
      requires: ["bookCopyBlNo"],
      condition: (cargoTp) => cargoTp !== "REF", // BL No required for non-reefer cargo
      note: 'BL Number is required when cargo type is not "Reefer"',
    },
    siCheck: {
      enabled: true,
      note: 'If SI check is "N", Form13 will remain in not submitted status',
    },
    specialNotes: "For Hapag Lloyd, BL number is required for non-reefer cargo",
  },

  CMA: {
    name: "CMA CGM",
    earlyGateIn: {
      enabled: true,
      location: "INMUN1", // Only for Mundra
      note: "Early gate-in available for Mundra location only",
    },
  },

  MAEU: {
    name: "Maersk",
    requires: [],
    specialNotes: "",
  },

  CMDU: {
    name: "CMA CGM",
    requires: [],
    specialNotes: "",
  },

  // Add more shipping lines as needed
};

// ==============================================
// 3. CARGO TYPE SPECIFIC RULES
// ==============================================

/**
 * Cargo type specific validation rules
 * Based on Section 6 (MASTER DATA) of API documentation
 */
export const CARGO_TYPE_RULES = {
  GEN: {
    name: "General",
    requires: [],
    optional: [],
    specialNotes: "Standard general cargo",
  },

  HAZ: {
    name: "Hazardous",
    requires: ["imoNo1", "unNo1"],
    canHaveMultipleIMO: true,
    maxIMOFields: 4,
    attachmentRequirements: {
      mandatory: [
        "DG_DCLRTION",
        "HAZ_DG_DECLARATION",
        "MSDS",
        "LASHING_CERTIFICATE",
      ],
      conditional: {
        emptyContainer: ["CLN_CRTFCT"],
      },
    },
    specialNotes: "Hazardous cargo requires IMO and UN numbers",
  },

  REF: {
    name: "Reefer",
    requires: ["temp"],
    optional: ["volt"],
    attachmentRequirements: {
      mandatory: [],
      conditional: {},
    },
    specialNotes: "Temperature must be provided for reefer cargo",
  },

  ONION: {
    name: "Onion",
    requires: [],
    optional: [],
    specialNotes: "",
  },

  ODC: {
    name: "Over-Dimensional Cargo",
    requires: [
      "rightDimensions",
      "topDimensions",
      "backDimensions",
      "leftDimensions",
      "frontDimensions",
      "odcUnits",
    ],
    attachmentRequirements: {
      mandatory: ["ODC_SURVEYOR_REPORT_PHOTOS", "LASHING_CERTIFICATE"],
      conditional: {},
    },
    specialNotes: "All dimension fields and ODC units are required",
  },

  "ODC(HAZ)": {
    name: "ODC Hazardous",
    requires: [
      "imoNo1",
      "unNo1",
      "rightDimensions",
      "topDimensions",
      "backDimensions",
      "leftDimensions",
      "frontDimensions",
      "odcUnits",
    ],
    canHaveMultipleIMO: true,
    maxIMOFields: 4,
    specialNotes: "Combination of ODC and Hazardous requirements",
  },

  FLT: {
    name: "Flat",
    requires: [],
    optional: [],
    specialNotes: "",
  },

  "REF(HAZ)": {
    name: "Reefer Hazardous",
    requires: ["temp", "imoNo1", "unNo1"],
    canHaveMultipleIMO: true,
    maxIMOFields: 4,
    specialNotes: "Combination of Reefer and Hazardous requirements",
  },

  "FLT(HAZ)": {
    name: "Flat Hazardous",
    requires: ["imoNo1", "unNo1"],
    canHaveMultipleIMO: true,
    maxIMOFields: 4,
    specialNotes: "Combination of Flat and Hazardous requirements",
  },

  PERISH: {
    name: "Perishable",
    requires: [],
    optional: [],
    specialNotes: "",
  },
};

// ==============================================
// 4. ORIGIN SPECIFIC RULES
// ==============================================

/**
 * Origin specific validation rules
 * Based on Section 6.3 of API documentation
 */
export const ORIGIN_RULES = {
  B: {
    // BUFFER
    name: "Buffer",
    requires: [],
    optional: [],
    specialNotes: "",
  },

  C: {
    // DOCK STUFFED
    name: "Dock Stuffed",
    requires: ["cfsCode"],
    optional: [],
    attachmentRequirements: {
      mandatory: ["CNTNR_LOAD_PLAN", "DLVRY_ORDER", "SHIP_BILL", "VGM_ANXR1"],
      conditional: {},
    },
    specialNotes: "CFS Code is required when origin is Dock Stuffed",
  },

  F: {
    // FACTORY STUFFED
    name: "Factory Stuffed",
    requires: [],
    optional: [],
    attachmentRequirements: {
      mandatory: [
        "DLVRY_ORDER",
        "INVOICE",
        "PACK_LIST",
        "SHIP_BILL",
        "VGM_ANXR1",
      ],
      conditional: {},
    },
    locationSpecific: {
      INMUN1: ["vehicleNo"], // Vehicle No required for Mundra
    },
    specialNotes: "For Mundra location, Vehicle No is required",
  },

  R: {
    // ICD BY ROAD
    name: "ICD by Road",
    requires: [],
    optional: [],
    locationSpecific: {
      INMUN1: ["vehicleNo"], // Vehicle No required for Mundra
    },
    specialNotes: "For Mundra location, Vehicle No is required",
  },

  W: {
    // ON WHEEL CONTAINER
    name: "On Wheel Container",
    requires: [],
    optional: [],
    attachmentRequirements: {
      mandatory: ["CUSTOMS_EXAM_REPORT", "SHIP_BILL", "VGM_ANXR1"],
      conditional: {},
    },
    specialNotes: "",
  },

  F_CFS: {
    // Factory Stuffed Via CFS
    name: "Factory Stuffed Via CFS",
    requires: ["cfsCode"],
    optional: [],
    specialNotes: "CFS Code is required",
  },

  E_TANK: {
    // Empty Tank
    name: "Empty Tank",
    requires: [],
    optional: [],
    attachmentRequirements: {
      mandatory: ["DLVRY_ORDER", "INVOICE", "SHIP_BILL", "VGM_ANXR1"],
      conditional: {},
    },
    specialNotes: "",
  },
};

// ==============================================
// 5. ATTACHMENT REQUIREMENTS
// ==============================================

/**
 * Attachment requirements based on location, cargo type, origin, and container status
 * Based on Section 5.3.1 of API documentation
 */
export const ATTACHMENT_REQUIREMENTS = {
  // Always mandatory for all locations
  ALWAYS_REQUIRED: ["BOOKING_COPY"],

  // Attachment titles mapping from images
  ATTACHMENT_TITLES: {
    BOOKING_COPY: "Booking Copy",
    PRE_EGM: "Pre-EGM",
    SHIP_BILL: "Shipping Bill",
    SHIPPING_INSTRUCTION: "Shipping instruction (SI)",
    SURVY_RPRT: "Survey Report",
    VGM_ANXR1: "VGM-Annexure 1",
    MSDS: "MSDS",
    MSDS_SHEET: "MSDS Sheet",
    ODC_SURVEYOR_REPORT_PHOTOS: "ODC SURVEYOR REPORT + PHOTOS",
    PACK_LIST: "Packing List",
    HAZ_DG_DECLARATION: "HAZ DG DECLARATION",
    INVOICE: "Invoice",
    LASHING_CERTIFICATE: "LASHING CERTIFICATE",
    MMD_APPRVL: "MMD Approval",
    CUSTOMS_EXAM_REPORT: "Customs Examination Report",
    DG_DCLRTION: "DG Declaration",
    DLVRY_ORDER: "Delivery Order",
    FIRE_OFC_CRTFCT: "Fire Office Certificate",
    BOOK_CNFRM_CPY: "Booking Confirmation Copy",
    BOOKING_CONF_COPY: "Booking confirmation copy",
    CHK_LIST: "Check List",
    CLN_CRTFCT: "Cleaning certificate",
    CNTNR_LOAD_PLAN: "Container Load Plan",
  },
};

// ==============================================
// 6. VALIDATION HELPER FUNCTIONS
// ==============================================

/**
 * Check if a field is required based on all conditions
 * @param {string} fieldName - Field to check
 * @param {Object} formData - Complete form data
 * @param {number} containerIndex - Container index (for container fields)
 * @returns {boolean} - True if field is required
 */
// In your validation utils (form13Validations.js)
export const isFieldRequired = (fieldName, formData, containerIndex = null) => {
  const alwaysRequired = [
    'locId', 'bnfCode', 'vesselNm', 'viaNo', 'terminalCode', 'service', 'pod', 'cargoTp', 'origin',
    'bookNo', 'cntnrStatus', 'mobileNo', 'shipperNm', 'consigneeNm', 'cntnrNo', 'cntnrSize', 'vgmWt'
  ];

  if (alwaysRequired.includes(fieldName)) {
    return true;
  }

  // Conditional requirements
  switch (fieldName) {
    case 'driverNm':
      return formData.origin === 'CFS';

    case 'temp':
      return formData.cargoTp === 'REEFER';

    case 'shipBillInvNo':
    case 'shipBillDt':
    case 'chaNm':
    case 'chaPan':
    case 'exporterNm':
    case 'exporterIec':
    case 'noOfPkg':
      return true; // Usually mandatory for all exports

    case 'leoDt':
      return !!formData.containers?.[containerIndex]?.sbDtlsVo?.[0]?.leoNo;

    case 'cfsCode':
      return ['B', 'C', 'F_CFS'].includes(formData.origin);

    default:
      return false;
  }
};

/**
 * Get all required attachments for current form data
 * @param {Object} formData - Complete form data
 * @returns {Array} - Array of required attachment objects
 */
export const getRequiredAttachments = (formData) => {
  const { locId, cargoTp, origin, cntnrStatus } = formData;
  const required = [];

  // Always mandatory for all locations
  ATTACHMENT_REQUIREMENTS.ALWAYS_REQUIRED.forEach((code) => {
    required.push({
      code,
      name: ATTACHMENT_REQUIREMENTS.ATTACHMENT_TITLES[code],
      required: true,
    });
  });

  const normCargoTp = (cargoTp || "").toUpperCase();
  const normOrigin = (origin || "").toUpperCase();
  const normCntnrStatus = (cntnrStatus || "").toUpperCase();

  // Port Lists from Images
  const ListA = ["INNSA1", "INMUN1", "INNML1", "INTUT1", "INCCU1", "INPAV1", "INHZA1", "INMRM1", "INCOK1", "INVTZ1", "INHAL1", "INKRI1", "INIXY1"];
  const ListChennaiGroup = ["INMAA1", "INKAT1", "INENN1"];
  const ListVGM = [...ListA, ...ListChennaiGroup, "INPRT1", "INKAK1"];
  const ListInvoice = [...ListA, "INMAA1"];
  const ListDG = [...ListA, "INMAA1", "INKAT1"];

  const addReq = (code, isMandatory = true) => {
    if (!required.some(att => att.code === code)) {
      required.push({
        code,
        name: ATTACHMENT_REQUIREMENTS.ATTACHMENT_TITLES[code] || code,
        required: isMandatory,
      });
    }
  };

  // 1. PRE_EGM (Mandatory: N, Chennai)
  if (locId === "INMAA1") addReq("PRE_EGM", false);

  // 2. SHIP_BILL (Mandatory for ListA, Origin: C, F, W, E_TANK)
  if (ListA.includes(locId) && ["C", "F", "W", "E_TANK"].includes(normOrigin)) addReq("SHIP_BILL");

  // 3. SHIPPING_INSTRUCTION (Mandatory for VTZ, Origin: C, F, W, E_TANK)
  if (locId === "INVTZ1" && ["C", "F", "W", "E_TANK"].includes(normOrigin)) addReq("SHIPPING_INSTRUCTION");

  // 4. SURVY_RPRT (Mandatory for Chennai Group, Cargo: HAZ & ODC)
  if (ListChennaiGroup.includes(locId) && (normCargoTp.includes("HAZ") || normCargoTp.includes("ODC"))) addReq("SURVY_RPRT");

  // 5. VGM_ANXR1 (Mandatory for ListVGM, Origin: B, C, F, W, E_TANK)
  if (ListVGM.includes(locId) && ["B", "C", "F", "W", "E_TANK"].includes(normOrigin)) addReq("VGM_ANXR1");

  // 6. MSDS (Mandatory for ListVGM, Cargo: ODC HAZ)
  if (ListVGM.includes(locId) && (normCargoTp.includes("HAZ") || normCargoTp.includes("ODC"))) addReq("MSDS");

  // 7. MSDS_SHEET (Mandatory for Chennai Group, Cargo: HAZ & ODC)
  if (ListChennaiGroup.includes(locId) && (normCargoTp.includes("HAZ") || normCargoTp.includes("ODC"))) addReq("MSDS_SHEET");

  // 8. ODC_SURVEYOR_REPORT_PHOTOS (Mandatory for ListVGM, Cargo: ODC HAZ)
  if (ListVGM.includes(locId) && (normCargoTp.includes("HAZ") || normCargoTp.includes("ODC"))) addReq("ODC_SURVEYOR_REPORT_PHOTOS");

  // 9. PACK_LIST (Mandatory for ListA, Origin: Factory Stuff)
  if (ListA.includes(locId) && normOrigin === "F") addReq("PACK_LIST");

  // 10. HAZ_DG_DECLARATION (Mandatory for ListVGM, Cargo: ODC HAZ)
  if (ListVGM.includes(locId) && (normCargoTp.includes("HAZ") || normCargoTp.includes("ODC"))) addReq("HAZ_DG_DECLARATION");

  // 11. INVOICE (Mandatory for ListInvoice, Origin: F, E_TANK)
  if (ListInvoice.includes(locId) && ["F", "E_TANK"].includes(normOrigin)) addReq("INVOICE");

  // 12. LASHING_CERTIFICATE (Mandatory for ListVGM, Cargo: ODC & HAZ)
  if (ListVGM.includes(locId) && (normCargoTp.includes("HAZ") || normCargoTp.includes("ODC"))) addReq("LASHING_CERTIFICATE");

  // 13. MMD_APPRVL (Mandatory for Chennai Group, Cargo: HAZ & ODC)
  if (ListChennaiGroup.includes(locId) && (normCargoTp.includes("HAZ") || normCargoTp.includes("ODC"))) addReq("MMD_APPRVL");

  // 14. CUSTOMS_EXAM_REPORT (Mandatory for ListA, Origin: ON WHEEL)
  if (ListA.includes(locId) && normOrigin === "W") addReq("CUSTOMS_EXAM_REPORT");

  // 15. DG_DCLRTION (Mandatory for ListDG, Cargo: HAZ ODC)
  if (ListDG.includes(locId) && (normCargoTp.includes("HAZ") || normCargoTp.includes("ODC"))) addReq("DG_DCLRTION");

  // 16. DLVRY_ORDER (Mandatory for ListInvoice, Origin: B, F, C, W, E_TANK)
  if (ListInvoice.includes(locId) && ["B", "F", "C", "W", "E_TANK"].includes(normOrigin)) addReq("DLVRY_ORDER");

  // 17. FIRE_OFC_CRTFCT (Mandatory for Chennai Group, Cargo: HAZ & ODC)
  if (ListChennaiGroup.includes(locId) && (normCargoTp.includes("HAZ") || normCargoTp.includes("ODC"))) addReq("FIRE_OFC_CRTFCT");

  // 18. BOOK_CNFRM_CPY (Mandatory for Chennai Group, Cargo: HAZ, ODC, GEN, ONION, REF)
  if (ListChennaiGroup.includes(locId) && ["HAZ", "ODC", "GEN", "ONION", "REF"].some(tp => normCargoTp.includes(tp))) addReq("BOOK_CNFRM_CPY");

  // 19. BOOKING_CONF_COPY (Mandatory for VTZ, Origin: C, F, W, E_TANK)
  if (locId === "INVTZ1" && ["C", "F", "W", "E_TANK"].includes(normOrigin)) addReq("BOOKING_CONF_COPY");

  // 20. CHK_LIST (Mandatory for Chennai Group, Cargo: HAZ, ODC, GEN, ONION, REF)
  if (ListChennaiGroup.includes(locId) && ["HAZ", "ODC", "GEN", "ONION", "REF"].some(tp => normCargoTp.includes(tp))) addReq("CHK_LIST");

  // 21. CLN_CRTFCT (Mandatory for ListA, Cargo: HAZ, Container: Empty)
  if (ListA.includes(locId) && normCargoTp.includes("HAZ") && normCntnrStatus === "EMPTY") addReq("CLN_CRTFCT");

  // 22. CNTNR_LOAD_PLAN (Mandatory for ListA, Origin: B, C)
  if (ListA.includes(locId) && ["B", "C"].includes(normOrigin)) addReq("CNTNR_LOAD_PLAN");

  return required;
};

/**
 * Validate form data comprehensively
 * @param {Object} formData - Complete form data
 * @returns {Object} - Validation errors object
 */
// In form13Validations.js, add or update:
export const validateFormData = (formData) => {
  const errors = {};

  // Basic required fields (always required)
  if (!formData.locId?.trim()) errors.locId = "Location is required";
  if (!formData.bnfCode?.trim()) errors.bnfCode = "Shipping Line is required";
  if (!formData.vesselNm?.trim()) errors.vesselNm = "Vessel Name is required";
  if (!formData.pod?.trim()) errors.pod = "POD is required";
  if (!formData.cargoTp?.trim()) errors.cargoTp = "Cargo Type is required";
  if (!formData.origin?.trim()) errors.origin = "Origin is required";
  if (!formData.cntnrStatus?.trim())
    errors.cntnrStatus = "Container Status is required";
  if (!formData.mobileNo?.trim()) errors.mobileNo = "Mobile No is required";
  if (!formData.consigneeNm?.trim())
    errors.consigneeNm = "Consignee Name is required";

  // Validate each container
  formData.containers.forEach((container, index) => {
    // Always required container fields
    if (!container.cntnrNo?.trim()) {
      errors[`container_${index}_cntnrNo`] = `Container ${index + 1
        }: Container No is required`;
    }
    if (!container.cntnrSize?.trim()) {
      errors[`container_${index}_cntnrSize`] = `Container ${index + 1
        }: Container Size is required`;
    }
    if (!container.vgmWt || isNaN(parseFloat(container.vgmWt))) {
      errors[`container_${index}_vgmWt`] = `Container ${index + 1
        }: VGM Weight is required`;
    } else if (parseFloat(container.vgmWt) > 999.99) {
      errors[`container_${index}_vgmWt`] = `Container ${index + 1
        }: VGM Weight exceeds maximum allowed (999.99 MT). Please enter weight in Metric Tons.`;
    }

    // Conditionally required fields
    // Driver Name - only if origin is CFS
    if (formData.origin === "CFS" && !container.driverNm?.trim()) {
      errors[`container_${index}_driverNm`] = `Container ${index + 1}: Driver Name is required`;
    }

    // Shipping Instruction No - only for MSC
    if (formData.bnfCode?.toUpperCase() === "MSCU" && !container.shpInstructNo?.trim()) {
      errors[`container_${index}_shpInstructNo`] = `Container ${index + 1}: Shipping Instruction No is required for MSC`;
    }

    // Hazardous fields
    const isHaz = formData.cargoTp?.includes("HAZ") || formData.cargoTp === "HAZ";
    if (isHaz) {
      if (!container.imoNo1?.trim()) errors[`container_${index}_imoNo1`] = `Container ${index + 1}: IMO No 1 is required for hazardous cargo`;
      if (!container.unNo1?.trim()) errors[`container_${index}_unNo1`] = `Container ${index + 1}: UN No 1 is required for hazardous cargo`;
    }

    // Temperature - only for reefer cargo
    const isRef = formData.cargoTp?.includes("REF") || formData.cargoTp === "REF";
    if (isRef && !container.temp?.trim()) {
      errors[`container_${index}_temp`] = `Container ${index + 1}: Temperature is required for reefer cargo`;
    }

    // ODC dimensions
    const isOdc = formData.cargoTp?.includes("ODC") || formData.cargoTp === "ODC";
    if (isOdc) {
      const dimFields = ["topDimensions", "frontDimensions", "backDimensions", "leftDimensions", "rightDimensions", "odcUnits"];
      dimFields.forEach(f => {
        if (!container[f]?.trim()) {
          errors[`container_${index}_${f}`] = `Container ${index + 1}: ${getFieldLabel(f)} is required for ODC cargo`;
        }
      });
    }

    // Special Stow for Nhava Sheva terminals
    if (isSpecialStowRequired(formData.locId, formData.terminalCode)) {
      if (!container.spclStow?.trim()) errors[`container_${index}_spclStow`] = `Container ${index + 1}: Special Stow is required`;
      if (!container.spclStowRemark?.trim()) errors[`container_${index}_spclStowRemark`] = `Container ${index + 1}: Special Stow Remark is required`;
    }

    // Shipping Bill fields - mandatory if present
    if (container.sbDtlsVo?.[0]) {
      const sbDetails = container.sbDtlsVo[0];
      if (!sbDetails.shipBillInvNo?.trim()) errors[`container_${index}_shipBillInvNo`] = `Container ${index + 1}: Shipping Bill No is required`;
      if (!sbDetails.shipBillDt) errors[`container_${index}_shipBillDt`] = `Container ${index + 1}: Shipping Bill Date is required`;
      if (!sbDetails.exporterNm?.trim()) errors[`container_${index}_exporterNm`] = `Container ${index + 1}: Exporter Name is required`;
      if (!sbDetails.exporterIec?.trim()) errors[`container_${index}_exporterIec`] = `Container ${index + 1}: Exporter IEC is required`;
      if (!sbDetails.chaNm?.trim()) errors[`container_${index}_chaNm`] = `Container ${index + 1}: CHA Name is required`;
      if (!sbDetails.chaPan?.trim()) {
        errors[`container_${index}_chaPan`] = `Container ${index + 1}: CHA PAN is required`;
      } else if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(sbDetails.chaPan)) {
        errors[`container_${index}_chaPan`] = `Container ${index + 1}: Invalid CHA PAN format`;
      }
      if (sbDetails.leoNo && !sbDetails.leoDt) {
        errors[`container_${index}_leoDt`] = `Container ${index + 1}: LEO Date is required when LEO No is provided`;
      }
    }
  });

  return errors;
};

/**
 * Get field display label
 * @param {string} fieldName - API field name
 * @returns {string} - Display label
 */
export const getFieldLabel = (fieldName) => {
  const labelMap = {
    // Header fields
    bnfCode: "Shipping Line",
    locId: "Location",
    vesselNm: "Vessel Name",
    viaNo: "VIA No",
    terminalCode: "Terminal",
    service: "Service",
    pod: "POD",
    fpod: "Final POD",
    cargoTp: "Cargo Type",
    origin: "Origin",
    shpInstructNo: "Shipping Instruction No",
    bookNo: "Booking No",
    mobileNo: "Mobile No",
    cfsCode: "CFS Code",
    issueTo: "Issue To",
    shipperNm: "Shipper Name",
    consigneeNm: "Consignee Name",
    consigneeAddr: "Consignee Address",
    cargoDesc: "Cargo Description",
    terminalLoginId: "Terminal Login ID",
    email_Id: "Email ID",
    bookCopyBlNo: "BL Number",
    cntnrStatus: "Container Status",
    formType: "Form Type",
    IsEarlyGateIn: "Early Gate In",
    ShipperCity: "Shipper City",
    shipperCd: "Shipper Code",
    FFCode: "FF Code",
    IECode: "IE Code",
    CHACode: "CHA Code",
    Notify_TO: "Notify To",

    // Container fields
    cntnrNo: "Container No",
    cntnrSize: "Container Size",
    iso: "ISO Code",
    agentSealNo: "Agent Seal No",
    customSealNo: "Custom Seal No",
    vgmWt: "VGM Weight (MT)",
    vgmViaODeX: "VGM via ODeX",
    doNo: "DO No",
    temp: "Temperature (°C)",
    volt: "Voltage",
    imoNo1: "IMO No 1",
    unNo1: "UN No 1",
    imoNo2: "IMO No 2",
    unNo2: "UN No 2",
    imoNo3: "IMO No 3",
    unNo3: "UN No 3",
    imoNo4: "IMO No 4",
    unNo4: "UN No 4",
    rightDimensions: "Right Dimensions",
    topDimensions: "Top Dimensions",
    backDimensions: "Back Dimensions",
    leftDimensions: "Left Dimensions",
    frontDimensions: "Front Dimensions",
    odcUnits: "ODC Units",
    chaRemarks: "Remarks",
    vehicleNo: "Vehicle No",
    driverLicNo: "Driver Licence No",
    driverNm: "Driver Name",
    haulier: "Haulier",
    spclStow: "Special Stow",
    spclStowRemark: "Special Stow Remarks",
    status: "Status",
    hsnCode: "HSN Code",
    commodityName: "Commodity Name",

    // Shipping Bill fields
    shipBillInvNo: "Shipping Bill No",
    shipBillDt: "Shipping Bill Date",
    leoNo: "LEO No",
    leoDt: "LEO Date",
    chaNm: "CHA Name",
    chaPan: "CHA PAN",
    exporterNm: "Exporter Name",
    exporterIec: "Exporter IEC",
    noOfPkg: "No of Packages",
  };

  return (
    labelMap[fieldName] ||
    fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/Id$/, "ID")
      .replace(/No$/, "No.")
      .replace(/Mt$/i, "MT")
  );
};

/**
 * Get field description/help text
 * @param {string} fieldName - API field name
 * @returns {string} - Field description
 */
export const getFieldDescription = (fieldName) => {
  const descriptions = {
    viaNo: "Unique voyage reference associated with the vessel",
    terminalCode: "Terminal at the port (e.g., NSICT, CCTL)",
    fpod: "Final Port of Discharge - end destination in case of transshipment",
    cfsCode: 'Required only when Origin is "Dock Destuff"',
    issueTo: "Options: Shipper or CHA Name",
    cntnrStatus: "Indicates if container is Full or Empty",
    vgmViaODeX: "If Yes, ODeX will fetch VGM details internally",
    spclStow: "Required only for NSICT/NSIGT/BMCT terminals",
    chaPan: "Format: 5 letters + 4 digits + 1 letter (e.g., AAECP7212C)",
    exporterIec: "10-digit numeric Import Export Code",
  };

  return descriptions[fieldName] || "";
};

/**
 * Check if field should be visible based on conditions
 * @param {string} fieldName - Field to check
 * @param {Object} formData - Complete form data
 * @returns {boolean} - True if field should be visible
 */
export const isFieldVisible = (fieldName, formData) => {
  const { locId, bnfCode, cargoTp, origin, terminalCode } = formData;

  // Fields that are always visible
  const ALWAYS_VISIBLE = [
    "bnfCode",
    "locId",
    "vesselNm",
    "viaNo",
    "terminalCode",
    "service",
    "pod",
    "cargoTp",
    "origin",
    "bookNo",
    "shipperNm",
    "consigneeNm",
    "consigneeAddr",
    "cntnrStatus",
    "mobileNo",
    "formType",
    "cargoDesc",
    "terminalLoginId"
  ];

  if (ALWAYS_VISIBLE.includes(fieldName)) {
    return true;
  }

  // Conditional visibility rules

  // FPOD - Only for specific locations
  if (fieldName === "fpod") {
    return ["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1"].includes(locId);
  }

  // CFS Code - Visible for Buffer and Dock Stuff/CFS origins
  if (fieldName === "cfsCode") {
    return ["B", "C", "F_CFS"].includes(origin);
  }

  // Shipping Instruction No - Only for MSC
  if (fieldName === "shpInstructNo") {
    return bnfCode?.toUpperCase() === "MSCU";
  }

  // Booking No - Broadly visible
  if (fieldName === "bookNo") {
    return true;
  }

  // BL Number - Hapag Lloyd for non-reefer
  if (fieldName === "bookCopyBlNo") {
    return bnfCode?.toUpperCase().includes("HAPAG") && cargoTp !== "REF";
  }

  // Early Gate In - CMA at Mundra
  if (fieldName === "IsEarlyGateIn") {
    return locId === "INMUN1" && bnfCode?.toUpperCase() === "CMA";
  }

  // Shipper City - Tuticorin DBGT terminal
  if (fieldName === "ShipperCity") {
    return locId === "INTUT1" && terminalCode === "DBGT";
  }

  // CHA/FF/IE Code - Nhavasheva
  if (["CHACode", "FFCode", "IECode"].includes(fieldName)) {
    return locId === "INNSA1";
  }

  // Stakeholder details - Always visible to ensure mandatory fields are not hidden
  return true;

  // For container-specific fields, we handle in the container component
  return true;
};

/**
 * Get validation error message for a field
 * @param {string} fieldName - Field name
 * @param {Object} formData - Form data
 * @returns {string} - Error message
 */
export const getValidationMessage = (fieldName, formData) => {
  const { cargoTp, origin } = formData;

  const messages = {
    cntnrNo: "Container No must be in format: 4 letters + 7 numbers",
    mobileNo: "Mobile No must be 10-12 digits",
    chaPan: "PAN must be in format: 5 letters + 4 digits + 1 letter",
    exporterIec: "IEC must be 10 digits",
    vgmWt: "VGM Weight is required when VGM via ODeX is No",
    imoNo1: "IMO No is required for hazardous cargo",
    unNo1: "UN No is required for hazardous cargo",
    temp: "Temperature is required for reefer cargo",
    rightDimensions: "Dimensions are required for ODC cargo",
    spclStow: "Special Stow is required for NSICT/NSIGT/BMCT terminals",
    vehicleNo:
      "Vehicle No is required for Factory Stuffed/ICD by Road at Mundra",
  };

  return messages[fieldName] || "";
};

/**
 * Check if NHava Sheva requires CHA/FF/IE code validation
 * @param {Object} formData - Form data
 * @returns {boolean} - True if validation is needed
 */
export const needsNhavashevaCodeValidation = (formData) => {
  const { locId, CHACode, FFCode, IECode } = formData;
  return locId === "INNSA1" && !CHACode && !FFCode && !IECode;
};

/**
 * Check if Early Gate In is applicable
 * @param {Object} formData - Form data
 * @returns {boolean} - True if early gate in is applicable
 */
export const isEarlyGateInApplicable = (formData) => {
  const { locId, bnfCode } = formData;
  return locId === "INMUN1" && bnfCode?.toUpperCase() === "CMA";
};

/**
 * Get terminal codes for a specific location
 * @param {string} locId - Location ID
 * @returns {Array} - Array of terminal codes
 */
export const getTerminalCodesForLocation = (locId) => {
  const locationRules = LOCATION_SPECIFIC_RULES[locId];
  return locationRules?.terminalCodes || [];
};

/**
 * Check if special stow is required
 * @param {string} locId - Location ID
 * @param {string} terminalCode - Terminal code
 * @returns {boolean} - True if special stow is required
 */
export const isSpecialStowRequired = (locId, terminalCode) => {
  return (
    locId === "INNSA1" &&
    ["NSICT", "NSIGT", "BMCT", "CCTL", "ICT"].includes(terminalCode)
  );
};

export default {
  LOCATION_SPECIFIC_RULES,
  SHIPPING_LINE_RULES,
  CARGO_TYPE_RULES,
  ORIGIN_RULES,
  ATTACHMENT_REQUIREMENTS,
  isFieldRequired,
  getRequiredAttachments,
  validateFormData,
  getFieldLabel,
  getFieldDescription,
  isFieldVisible,
  getValidationMessage,
  needsNhavashevaCodeValidation,
  isEarlyGateInApplicable,
  getTerminalCodesForLocation,
  isSpecialStowRequired,
};
