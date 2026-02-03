import * as Yup from "yup";
import { getTerminalCodesByPort } from "./constants/masterDataVGM.js";

export const containerNoRegex = /^[A-Z]{4}\d{7}$/;
export const panNoRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;

export const vgmValidationSchema = Yup.object({
  // Basic Details - Mandatory for all Shipper/FF
  linerId: Yup.string()
    .required("Liner ID is required")
    .max(10, "Max 10 characters allowed"),
  bookNo: Yup.string()
    .required("Booking Number is required")
    .max(20, "Max 20 characters allowed"),
  locId: Yup.string()
    .required("Port ID is required")
    .max(10, "Max 10 characters allowed"),

  authPrsnNm: Yup.string()
    .required("Authorized Person Name is required")
    .max(200, "Max 200 characters allowed"),
  authDesignation: Yup.string()
    .required("Designation is required")
    .max(200, "Max 200 characters allowed"),
  authMobNo: Yup.string()
    .required("Mobile Number is required")
    .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .max(10, "Max 10 characters allowed"),

  // VGM & Container Details
  vgmEvalMethod: Yup.string()
    .required("VGM Evaluation Method is required")
    .max(2, "Max 2 characters allowed")
    .oneOf(["M1", "M2"], "Must be M1 or M2"),
  cntnrNo: Yup.string()
    .required("Container Number is required")
    .matches(
      containerNoRegex,
      "Container No. format should be 4 uppercase letters and 7 digits (e.g., ABCD1234567)"
    )
    .length(11, "Must be exactly 11 characters"),
  cntnrSize: Yup.string()
    .required("Container Size is required")
    .max(20, "Max 20 characters allowed")
    .oneOf(["1X20", "1X40", "1X45"], "Must be 1X20, 1X40, or 1X45"),
  cargoTp: Yup.string()
    .required("Cargo Type is required")
    .max(3, "Max 3 characters allowed")
    .oneOf(["GEN", "HAZ"], "Must be GEN or HAZ"),
  cscPlateMaxWtLimit: Yup.mixed()
    .required("CSC Plate Max Weight Limit is required")
    .test("is-number", "Must be a valid number", (value) => {
      if (value === "" || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && isFinite(num);
    })
    .test("is-positive", "Must be positive", (value) => {
      const num = Number(value);
      return num > 0;
    })
    .test("max-value", "Value too large", (value) => {
      const num = Number(value);
      return num <= 99999999.99;
    }),
  cscPlateMaxWtUom: Yup.string()
    .required("CSC Plate Max Weight UOM is required")
    .max(2, "Max 2 characters allowed")
    .oneOf(["KG", "LB"], "Must be KG or LB")
    .default("KG"),

  // Quick Response Flag - MANDATORY
  // isQuickResponse: Yup.string()
  //   .required("Quick Response flag is required")
  //   .max(1, "Max 1 character allowed")
  //   .oneOf(["Y", "N"], "Must be Y or N"),

  // Weight Details - More flexible validation
  totWt: Yup.mixed()
    .required("Total Weight is required")
    .test("is-number", "Must be a valid number", (value) => {
      if (value === "" || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && isFinite(num);
    })
    .test("is-positive", "Must be positive", (value) => {
      const num = Number(value);
      return num > 0;
    })
    .test(
      "realistic-weight",
      "Weight must be realistic for container",
      (value) => {
        const num = Number(value);
        return num >= 1000 && num <= 100000; // 1,000 KG to 100,000 KG range
      }
    )
    .test(
      "max-weight",
      "Total Weight should be less than or equal to CSC Plate Max Weight Limit",
      function (value) {
        const { cscPlateMaxWtLimit } = this.parent;
        if (!value || !cscPlateMaxWtLimit) return true;

        const totalWeight = Number(value);
        const maxLimit = Number(cscPlateMaxWtLimit);
        return totalWeight <= maxLimit;
      }
    ),
  totWtUom: Yup.string()
    .required("Total Weight UOM is required")
    .max(2, "Max 2 characters allowed")
    .oneOf(["KG", "LB"], "Must be KG or LB")
    .default("KG"),

  // Weighbridge Details - MANDATORY
  weighBridgeRegNo: Yup.string()
    .required("Weigh Bridge Registration No. is required")
    .max(100, "Max 100 characters allowed"),
  weighBridgeAddrLn1: Yup.string()
    .required("Weigh Bridge Address Line 1 is required")
    .max(35, "Max 35 characters allowed"),
  weighBridgeSlipNo: Yup.string()
    .required("Weigh Bridge Slip No. is required")
    .max(100, "Max 100 characters allowed"),
  weighBridgeWtTs: Yup.string()
    .required("Weigh Bridge Time Stamp is required")
    .test(
      "format",
      "Timestamp must be in format: YYYY-MM-DD HH:MM or DD-MM-YYYY HH:MM",
      (value) => {
        if (!value) return false;
        // Allows YYYY-MM-DD HH:mm(:ss) or DD-MM-YYYY HH:mm(:ss)
        const yyyyMMdd = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/;
        const ddMMyyyy = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}(:\d{2})?$/;
        return yyyyMMdd.test(value) || ddMMyyyy.test(value);
      }
    )
    .test(
      "date-not-future",
      "Weighing date cannot be in the future",
      function (value) {
        if (!value) return false;

        let inputDate;
        const ddMMyyyyPattern = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})(?::(\d{2}))?$/;
        const match = value.match(ddMMyyyyPattern);

        if (match) {
          const [, day, month, year, hour, minute, second] = match;
          inputDate = new Date(year, month - 1, day, hour, minute, second || 0);
        } else {
          inputDate = new Date(value);
        }

        const now = new Date();
        return inputDate <= now;
      }
    )
    .test(
      "date-not-too-old",
      "Weighing date cannot be older than 2 months",
      function (value) {
        if (!value) return false;

        let inputDate;
        const ddMMyyyyPattern = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})(?::(\d{2}))?$/;
        const match = value.match(ddMMyyyyPattern);

        if (match) {
          const [, day, month, year, hour, minute, second] = match;
          inputDate = new Date(year, month - 1, day, hour, minute, second || 0);
        } else {
          inputDate = new Date(value);
        }

        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        return inputDate >= twoMonthsAgo;
      }
    ),

  // System Fields
  odexRefNo: Yup.string()
    .required("ODeX Reference Number is required")
    .max(100, "Max 100 characters allowed"),

  // Optional Fields with proper defaults
  vesselNm: Yup.string().max(50, "Max 50 characters allowed").default(""),
  voyageNo: Yup.string().max(20, "Max 20 characters allowed").default(""),
  handoverLoc: Yup.string().max(10, "Max 10 characters allowed").default(""),
  cntnrTp: Yup.string().max(50, "Max 50 characters allowed").default(""),
  weighBridgeAddrLn2: Yup.string()
    .max(35, "Max 35 characters allowed")
    .default(""),
  weighBridgeAddrLn3: Yup.string()
    .max(35, "Max 35 characters allowed")
    .default(""),

  // Terminal Code - Conditional
  terminalCode: Yup.string()
    .when("locId", {
      is: "INTUT1",
      then: (schema) =>
        schema.required("Terminal code is required for Tuticorin"),
      otherwise: (schema) => schema.notRequired(),
    })
    .max(10, "Max 10 characters allowed"),

  // Hazardous Cargo Fields - Conditional
  imoNo1: Yup.string().when("cargoTp", {
    is: "HAZ",
    then: (schema) =>
      schema
        .required("IMO Number is required for hazardous cargo")
        .max(10, "Max 10 characters allowed"),
    otherwise: (schema) => schema.notRequired(),
  }),
  unNo1: Yup.string().when("cargoTp", {
    is: "HAZ",
    then: (schema) =>
      schema
        .required("UN Number is required for hazardous cargo")
        .max(10, "Max 10 characters allowed"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Method 2 Specific Fields - FIXED: Simplified conditional validation
  cargoWt: Yup.mixed().test(
    "method2-cargo-weight",
    "Cargo Weight is required for Method 2",
    function (value) {
      const { vgmEvalMethod } = this.parent;
      if (vgmEvalMethod === "M2") {
        if (value === "" || value === null || value === undefined) return false;
        const num = Number(value);
        return !isNaN(num) && isFinite(num) && num > 0;
      }
      return true;
    }
  ),

  cargoWtUom: Yup.string().test(
    "method2-cargo-uom",
    "Cargo Weight UOM is required for Method 2",
    function (value) {
      const { vgmEvalMethod } = this.parent;
      if (vgmEvalMethod === "M2") {
        return value && ["KG", "LB"].includes(value);
      }
      return true;
    }
  ),

  tareWt: Yup.mixed().test(
    "method2-tare-weight",
    "Tare Weight is required for Method 2",
    function (value) {
      const { vgmEvalMethod } = this.parent;
      if (vgmEvalMethod === "M2") {
        if (value === "" || value === null || value === undefined) return false;
        const num = Number(value);
        return !isNaN(num) && isFinite(num) && num > 0;
      }
      return true;
    }
  ),

  tareWtUom: Yup.string().test(
    "method2-tare-uom",
    "Tare Weight UOM is required for Method 2",
    function (value) {
      const { vgmEvalMethod } = this.parent;
      if (vgmEvalMethod === "M2") {
        return value && ["KG", "LB"].includes(value);
      }
      return true;
    }
  ),

  // Third Party Shipper Details - FIXED: Simplified conditional validation
  shipId: Yup.string().max(10, "Max 10 characters allowed"),

  shipperNm: Yup.string()
    .test(
      "third-party-shipper-name",
      "Shipper Name is required for third party without Shipper ID",
      function (value) {
        const { shipId } = this.parent;
        if (!shipId) {
          return value && value.length > 0;
        }
        return true;
      }
    )
    .max(100, "Max 100 characters allowed"),

  shipRegTP: Yup.string()
    .test(
      "third-party-reg-type",
      "Registration Type is required for third party without Shipper ID",
      function (value) {
        const { shipId } = this.parent;
        if (!shipId) {
          return (
            value &&
            [
              "IEC No",
              "CIN No",
              "PAN No",
              "Aadhaar No",
              "Passport No",
            ].includes(value)
          );
        }
        return true;
      }
    )
    .max(100, "Max 100 characters allowed"),

  shipRegNo: Yup.string()
    .test(
      "third-party-reg-number",
      "Registration Number is required for third party without Shipper ID",
      function (value) {
        const { shipId, shipRegTP } = this.parent;

        if (!shipId) {
          if (!value || value.length === 0) return false;

          // PAN number validation
          if (shipRegTP === "PAN No") {
            return panNoRegex.test(value);
          }

          return true;
        }
        return true;
      }
    )
    .max(100, "Max 100 characters allowed"),
});

// Context validation for login (unchanged)
export const loginValidationSchema = Yup.object({
  pyrCode: Yup.string()
    .required("CHA Name is required")
    .max(200, "Max 200 characters allowed"),
});
