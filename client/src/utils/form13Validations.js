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
      "terminalLoginId",
      "fpod",
    ],
    optional: [],
    specialNotes: "FPOD is mandatory for Ennore location",
  },

  INMUN1: {
    // Mundra
    name: "Mundra",
    requires: ["terminalLoginId"],
    optional: ["fpod"],
    earlyGateIn: {
      enabled: true,
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
    requires: ["fpod"],
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
  // MSC Agency India
  MSCU: {
    name: "MSC",
    requires: ["bookNo", "shpInstructNo"],
    containerRequires: [],
    specialNotes:
      "Booking No and Shipping Instruction No are mandatory for MSC",
    errorCodes: {
      bookNo: "Mandatory for MSC shipping line",
      shpInstructNo: "Shipping Instruction No is mandatory for MSC",
    },
  },
  // MSC Mediterranean Shipping Company S.A
  MSCME: {
    name: "MSC",
    requires: ["bookNo", "shpInstructNo"],
    specialNotes: "Booking No and Shipping Instruction No are mandatory for MSC",
  },

  // Hapag Lloyd India Pvt Ltd
  HLCU: {
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
  // HAPAG LLOYD AG
  HAPAG: {
    name: "Hapag Lloyd",
    blNumberRule: {
      requires: ["bookCopyBlNo"],
      condition: (cargoTp) => cargoTp !== "REF",
      note: 'BL Number is required when cargo type is not "Reefer"',
    },
    siCheck: {
      enabled: true,
    },
    specialNotes: "For Hapag Lloyd, BL number is required for non-reefer cargo",
  },

  // CMA CGM Agencies
  CMDU: {
    name: "CMA CGM",
    earlyGateIn: {
      enabled: true,
    },
  },
  // CMA CGM LOGISTICS PARK
  CMACG: {
    name: "CMA CGM",
    earlyGateIn: {
      enabled: true,
    },
  },
  // CMA (Legacy/Generic)
  CMA: {
    name: "CMA CGM",
    earlyGateIn: {
      enabled: true,
    },
  },

  // MAERSK LINE INDIA
  MAEU: {
    name: "Maersk",
    requires: [],
    specialNotes: "",
  },
  // Maersk A/S
  MAERS: {
    name: "Maersk",
    requires: [],
    specialNotes: "",
  },
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
    'locId', 'bnfCode', 'vesselNm', 'terminalCode', 'service', 'pod', 'cargoTp', 'origin',
    'cntnrStatus', 'mobileNo', 'shipperNm', 'cntnrNo', 'cntnrSize', 'iso', 'agentSealNo',
    'customSealNo', 'vgmViaODeX', 'formType'
  ];

  if (alwaysRequired.includes(fieldName)) {
    return true;
  }

  // 1. Location-specific checks
  const locRules = LOCATION_SPECIFIC_RULES[formData.locId];
  if (locRules) {
    if (locRules.requires?.includes(fieldName)) return true;
    if (locRules.terminalRules?.[formData.terminalCode]?.includes(fieldName)) return true;
    if (locRules.terminalSpecific?.[formData.terminalCode]?.requires?.includes(fieldName)) return true;
  }

  // 2. Shipping Line checks
  const lineRules = SHIPPING_LINE_RULES[formData.bnfCode];
  if (lineRules) {
    if (lineRules.requires?.includes(fieldName)) return true;
    if (lineRules.containerRequires?.includes(fieldName)) return true;
    if (lineRules.blNumberRule?.requires?.includes(fieldName) && lineRules.blNumberRule.condition(formData.cargoTp)) return true;
  }

  // 3. Cargo Type checks
  const cargoRules = CARGO_TYPE_RULES[formData.cargoTp];
  if (cargoRules) {
    if (cargoRules.requires?.includes(fieldName)) return true;
  }

  // 4. Origin checks
  const originRules = ORIGIN_RULES[formData.origin];
  if (originRules) {
    if (originRules.requires?.includes(fieldName)) return true;
    if (originRules.locationSpecific?.[formData.locId]?.includes(fieldName)) return true;
  }

  // 5. Special manual checks
  switch (fieldName) {
    case 'driverNm':
      // Driver name is mandatory ONLY if terminal is MICT
      return formData.terminalCode === "MICT";

    case 'haulier':
      // Haulier is mandatory if terminal is NOT MICT
      return formData.terminalCode !== "MICT";

    case 'vgmWt':
      return formData.vgmViaODeX === 'N';

    case 'viaNo':
      return false;

    case 'IsEarlyGateIn':
      return false; // Always visible but not mandatory by default

    case 'FFCode':
    case 'IECode':
    case 'CHACode':
      // At least one of FF Code, IE code, or CHA code is required for Nhava Sheva
      if (formData.locId === "INNSA1") {
        const hasAny = !!formData.FFCode || !!formData.IECode || !!formData.CHACode;
        return !hasAny;
      }
      return false;

    case 'shipBillInvNo':
    case 'shipBillDt':
    case 'chaPan':
    case 'exporterNm':
    case 'exporterIec':
    case 'noOfPkg':
      return true; // Usually mandatory for all exports

    case 'chaNm':
      const hiddenChaTerminals = ["NSICT", "NSIGT", "CCTL", "ICT"];
      return !hiddenChaTerminals.includes(formData.terminalCode);

    case 'issueTo':
      const hiddenTerminals = ["NSICT", "NSIGT", "CCTL", "ICT"];
      return !hiddenTerminals.includes(formData.terminalCode);

    case 'leoDt':
      return !!formData.containers?.[containerIndex]?.sbDtlsVo?.[0]?.leoNo;

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

  const normCargoTp = (cargoTp || "").toUpperCase();
  const normOrigin = (origin || "").toUpperCase();
  const normCntnrStatus = (cntnrStatus || "").toUpperCase();

  // Port Lists from Excel
  const ListA = ["INNSA1", "INMUN1", "INNML1", "INTUT1", "INCCU1", "INPAV1", "INHZA1", "INMRM1", "INCOK1", "INVTZ1", "INHAL1", "INKRI1", "INIXY1"];
  const ListChennaiGroup = ["INMAA1", "INKAT1", "INENN1"];
  const ListExtended = [...ListA, ...ListChennaiGroup, "INPRT1", "INKAK1"];

  // Helper to check cargo types
  const isHazCargo = normCargoTp.includes("HAZ");
  const isOdcCargo = normCargoTp.includes("ODC");
  // ODC Hazardous specifically matches the dropdown value ODC(HAZ) or if both HAZ and ODC are present
  const isOdcHazCargo = normCargoTp === "ODC(HAZ)" || normCargoTp === "ODC HAZARDOUS" || (isHazCargo && isOdcCargo);
  const isHazOrOdc = isHazCargo || isOdcCargo || isOdcHazCargo;

  const addReq = (code) => {
    if (!required.some((r) => r.code === code)) {
      required.push({
        code,
        name: ATTACHMENT_REQUIREMENTS.ATTACHMENT_TITLES[code] || code,
        required: true,
      });
    }
  };

  // 1. Always mandatory
  addReq("BOOKING_COPY");

  // 2. PRE_EGM - Optional for Chennai
  if (locId === "INMAA1") {
    required.push({
      code: "PRE_EGM",
      name: ATTACHMENT_REQUIREMENTS.ATTACHMENT_TITLES["PRE_EGM"],
      required: false
    });
  }

  // 3. BOOK_CNFRM_CPY - Chennai Group, Cargo: HAZ, ODC, GEN, ONION, REF
  if (ListChennaiGroup.includes(locId) && ["HAZ", "ODC", "GEN", "ONION", "REF", "ODC(HAZ)"].some(tp => normCargoTp.includes(tp))) {
    addReq("BOOK_CNFRM_CPY");
  }

  // 4. BOOKING_CONF_COPY - VTZ, Origin: C, F, W, E_TANK
  if (locId === "INVTZ1" && ["C", "F", "W", "E_TANK"].includes(normOrigin)) {
    addReq("BOOKING_CONF_COPY");
  }

  // 5. CHK_LIST - Chennai Group, Cargo: HAZ, ODC, GEN, ONION, REF
  if (ListChennaiGroup.includes(locId) && ["HAZ", "ODC", "GEN", "ONION", "REF", "ODC(HAZ)"].some(tp => normCargoTp.includes(tp))) {
    addReq("CHK_LIST");
  }

  // 6. CLN_CRTFCT - ListA, Cargo: HAZ, Status: Empty
  if (ListA.includes(locId) && isHazCargo && normCntnrStatus === "EMPTY") {
    addReq("CLN_CRTFCT");
  }

  // 7. CNTNR_LOAD_PLAN - ListA, Origin: C
  if (ListA.includes(locId) && normOrigin === "C") {
    addReq("CNTNR_LOAD_PLAN");
  }

  // 8. CUSTOMS_EXAM_REPORT - ListA, Origin: W
  if (ListA.includes(locId) && normOrigin === "W") {
    addReq("CUSTOMS_EXAM_REPORT");
  }

  // 9. DG_DCLRTION - ListA + Chennai + Kattupalli, Cargo: HAZ, ODC
  if ((ListA.includes(locId) || locId === "INMAA1" || locId === "INKAT1") && isHazOrOdc) {
    addReq("DG_DCLRTION");
  }

  // 10. DLVRY_ORDER - ListA + Chennai + Kattupalli, Origin: F, C, E_TANK
  if ((ListA.includes(locId) || locId === "INMAA1" || locId === "INKAT1") && ["F", "C", "E_TANK"].includes(normOrigin)) {
    addReq("DLVRY_ORDER");
  }

  // 11. FIRE_OFC_CRTFCT - ListChennaiGroup, Cargo: HAZ, ODC
  if (ListChennaiGroup.includes(locId) && isHazOrOdc) {
    addReq("FIRE_OFC_CRTFCT");
  }

  // 12. HAZ_DG_DECLARATION - ListExtended, Cargo: ODC HAZ
  if (ListExtended.includes(locId) && isOdcHazCargo) {
    addReq("HAZ_DG_DECLARATION");
  }

  // 13. INVOICE - ListExtended, Origin: F, E_TANK
  if (ListExtended.includes(locId) && ["F", "E_TANK"].includes(normOrigin)) {
    addReq("INVOICE");
  }

  // 14. LASHING_CERTIFICATE - ListExtended, Cargo: ODC & HAZ
  if (ListExtended.includes(locId) && isOdcHazCargo) {
    addReq("LASHING_CERTIFICATE");
  }

  // 15. MMD_APPRVL - ListChennaiGroup, Cargo: HAZ, ODC
  if (ListChennaiGroup.includes(locId) && isHazOrOdc) {
    addReq("MMD_APPRVL");
  }

  // 16. MSDS - ListExtended, Cargo: ODC HAZ
  if (ListExtended.includes(locId) && isOdcHazCargo) {
    addReq("MSDS");
  }

  // 17. MSDS_SHEET - ListChennaiGroup, Cargo: HAZ, ODC
  if (ListChennaiGroup.includes(locId) && isHazOrOdc) {
    addReq("MSDS_SHEET");
  }

  // 18. ODC_SURVEYOR_REPORT_PHOTOS - ListExtended, Cargo: ODC HAZ
  if (ListExtended.includes(locId) && isOdcHazCargo) {
    addReq("ODC_SURVEYOR_REPORT_PHOTOS");
  }

  // 19. PACK_LIST - ListA, Origin: F
  if (ListA.includes(locId) && normOrigin === "F") {
    addReq("PACK_LIST");
  }

  // 20. SHIP_BILL - ListA, Origin: C, F, W, E_TANK (Exclude Mundra)
  if (locId !== "INMUN1" && ListA.includes(locId) && ["C", "F", "W", "E_TANK"].includes(normOrigin)) {
    addReq("SHIP_BILL");
  }

  // 21. SHIPPING_INSTRUCTION - VTZ, Origin: C, F, W, E_TANK
  if (locId === "INVTZ1" && ["C", "F", "W", "E_TANK"].includes(normOrigin)) {
    addReq("SHIPPING_INSTRUCTION");
  }

  // 22. SURVY_RPRT - ListChennaiGroup, Cargo: HAZ, ODC
  if (ListChennaiGroup.includes(locId) && isHazOrOdc) {
    addReq("SURVY_RPRT");
  }

  // 23. VGM_ANXR1 - ListExtended, Origin: C, F, W, E_TANK (Exclude Mundra)
  if (locId !== "INMUN1" && ListExtended.includes(locId) && ["C", "F", "W", "E_TANK"].includes(normOrigin)) {
    addReq("VGM_ANXR1");
  }

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
  
  if (isFieldRequired('consigneeNm', formData) && !formData.consigneeNm?.trim())
    errors.consigneeNm = "Consignee Name is required";
    
  if (isFieldRequired('consigneeAddr', formData) && !formData.consigneeAddr?.trim())
    errors.consigneeAddr = "Consignee Address is required";
    
  if (isFieldRequired('cargoDesc', formData) && !formData.cargoDesc?.trim())
    errors.cargoDesc = "Cargo Description is required";
    
  if (isFieldRequired('terminalLoginId', formData) && !formData.terminalLoginId?.trim())
    errors.terminalLoginId = "Terminal Login ID is required";


  // Conditional Header Field Validations
  if (isFieldRequired('ShipperCity', formData) && !formData.ShipperCity?.trim()) {
    errors.ShipperCity = "Shipper City is required";
  }

  if (isFieldRequired('IsEarlyGateIn', formData) && !formData.IsEarlyGateIn?.trim()) {
    errors.IsEarlyGateIn = "Early Gate In selection is required";
  }


  // Conditional Header Field Validations
  if (isFieldRequired('cfsCode', formData) && !formData.cfsCode?.trim()) {
    errors.cfsCode = "CFS Code is required";
  }

  if (isFieldRequired('issueTo', formData) && !formData.issueTo?.trim()) {
    errors.issueTo = "Issue To is required";
  }

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

    // Driver Name & Haulier conditional mandatory validation
    if (isFieldRequired('driverNm', formData, index) && !container.driverNm?.trim()) {
      errors[`container_${index}_driverNm`] = `Container ${index + 1}: Driver Name is required for ${formData.terminalCode}`;
    }

    if (isFieldRequired('haulier', formData, index) && !container.haulier?.trim()) {
      errors[`container_${index}_haulier`] = `Container ${index + 1}: Haulier is required`;
    }

    // MSC Shipping Instruction Number validation removed (made optional)

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
    emailId: "Email ID",
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
    "cntnrStatus",
    "mobileNo",
    "formType",
    "terminalLoginId",
    "IsEarlyGateIn"
  ];

  if (ALWAYS_VISIBLE.includes(fieldName)) {
    return true;
  }

  // Hide consignee details and cargo description if not mandatory
  if (["consigneeNm", "consigneeAddr", "cargoDesc"].includes(fieldName)) {
    return isFieldRequired(fieldName, formData);
  }

  // Conditional visibility rules

  // FPOD - Always visible
  if (fieldName === "fpod") {
    return true;
  }

  // CFS Code - Visible for Buffer and Dock Stuff/CFS origins
  if (fieldName === "cfsCode") {
    return ["B", "C", "F_CFS"].includes(origin);
  }

  // Shipping Instruction No - Always visible
  if (fieldName === "shpInstructNo") {
    return true;
  }

  // Booking No - Broadly visible
  if (fieldName === "bookNo") {
    return true;
  }

  // BL Number - Hapag Lloyd for non-reefer
  if (fieldName === "bookCopyBlNo") {
    const hapagCodes = ["HAPAG", "HLCU"];
    return hapagCodes.includes(bnfCode?.toUpperCase()) && cargoTp !== "REF";
  }

  // Shipper City - Tuticorin DBGT terminal
  if (fieldName === "ShipperCity") {
    return locId === "INTUT1" && terminalCode === "DBGT";
  }

  // CHA/FF/IE Code - Nhavasheva
  if (["CHACode", "FFCode", "IECode"].includes(fieldName)) {
    return locId === "INNSA1";
  }

  // Issue To - Hidden/Blank for NSICT/NSIGT/CCTL/ICT terminals
  if (fieldName === "issueTo") {
    const hiddenTerminals = ["NSICT", "NSIGT", "CCTL", "ICT"];
    return !hiddenTerminals.includes(terminalCode);
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
  return true; // Always applicable as per request
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
