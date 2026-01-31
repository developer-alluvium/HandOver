// src/data/masterData.js

export const masterData = {
  // Container Sizes and ISO Codes from the document
  containerSizes: [
    { value: "1X20", label: "20Ft" },
    { value: "1X40", label: "40Ft" },
    { value: "1X45", label: "45Ft" },
  ],

  isoCodes: [
    { value: "2000", label: "2000 - 20FT DRY CTR." },
    { value: "2054", label: "2054 - 20 Ft ODC Ctr" },
    { value: "2200", label: "2200 - 20 X 8 6 Gen Closed ctr" },
    { value: "2210", label: "2210 - 20 X 8 6 Ventilated ctr" },
    { value: "2220", label: "2220 - 20 hi cube container" },
    { value: "2230", label: "2230 - 20 X 86 Reffer ctr" },
    { value: "2250", label: "2250 - 20 X 8 6 Open Top ctr" },
    { value: "2260", label: "2260 - 20 X 8 6 Open Sides ctr" },
    { value: "2270", label: "2270 - 20 X 8 6 Tank for Liquids" },
    { value: "2276", label: "2276 - 20 X 8 6 Tank HAZARDOUS LIQUIDE" },
    { value: "2263", label: "2263 - 20 X 8 6 HIGH FLAT" },
    { value: "2510", label: "2510 - 20 X 9 6 Normal Hi_cube ctr" },
    { value: "2530", label: "2530 - 20 ft Hicube Reefer Container" },
    { value: "2550", label: "2550 - 20 FT (O/TOP, H/C)" },
    { value: "4210", label: "4210 - 40 X 8 6 Ventilated Ctr" },
    { value: "4230", label: "4230 - 40 X 8 6 Refeer Ctr" },
    { value: "4250", label: "4250 - 40 X 8 6 Open Top Ctr" },
    { value: "4260", label: "4260 - 40 X 8 6 Open Sided Ctr" },
    { value: "4270", label: "4270 - 40 X 8 6 Tank for Liquids" },
    { value: "4310", label: "4310 - 40 X 8 6 general closed container" },
    { value: "4351", label: "4351 - Open Top Removal from both ends" },
    { value: "4500", label: "4500 - 40 X 9 6 Dry Gen Closed Ctr" },
    { value: "4510", label: "4510 - 40 X 9 6 Ventilated H/C Ctr." },
    { value: "4530", label: "4530 - 40 X 9 6 Reefer Ctr" },
    { value: "4532", label: "4532 - 40 X 8 6 Reefer Ctr" },
    { value: "4550", label: "4550 X 40 - High Cube Open Top" },
    { value: "9500", label: "9500 - 45 X 9 6 Dry Gen Closed Ctr" },
    { value: "9510", label: "9510 - 45 X 9 6 Ventilated H/C Ctr" },
    { value: "9530", label: "9530 - 45 X 9 6 Reefer Ctr" },
  ],

  // Cargo Types from VGM API document
  cargoTypes: [
    { value: "GEN", label: "General" },
    { value: "HAZ", label: "Hazardous" },
    { value: "REF", label: "Reefer" },
    { value: "ONION", label: "Onion" },
    { value: "ODC", label: "ODC" },
    { value: "ODC(HAZ)", label: "ODC Hazardous" },
    { value: "FLT", label: "Flat" },
    { value: "REF(HAZ)", label: "Reefer Hazardous" },
    { value: "FLT(HAZ)", label: "Flat Hazardous" },
    { value: "PERISH", label: "Perishable" },
  ],

  // Container Types from VGM API document
  containerTypes: [
    { value: "DRY CONTENT", label: "DRY CONTENT" },
    { value: "LIQUID CONTENT", label: "LIQUID CONTENT" },
    { value: "20G0", label: "General container" },
    { value: "20G1", label: "General container with ventilation holes" },
    { value: "20H1", label: "Port hole reefer container" },
    { value: "20T0", label: "Tank container" },
    { value: "22G0", label: "GCgeneral container" },
    { value: "22G1", label: "General container with ventilation holes" },
    { value: "22V0", label: "Highly ventilated container" },
    { value: "22RO", label: "RFintegral reefer container" },
    { value: "22R1", label: "Integral reefer/heated container" },
    { value: "22H2", label: "Thermal insulated external container" },
    { value: "22U0", label: "OTopen top container" },
    { value: "22U1", label: "OTopen top container - removable top" },
    { value: "22P1", label: "FLATflat rack with fixed ends" },
    { value: "22P2", label: "Flat with fixed corner posts only" },
    { value: "22P3", label: "Flat with collapsible ends" },
    { value: "22P5", label: "Open sided container" },
    { value: "22T0", label: "Tank container - non dangerous liquid" },
    { value: "22T5", label: "Tank container" },
    { value: "22B0", label: "BULKdry bulk container" },
    { value: "25G0", label: "HCgeneral high cube container (9,6)" },
    { value: "25R1", label: "HCRFintegral high cube reefer container (9,6)" },
    { value: "28U1", label: "Half height open top container" },
    { value: "26T0", label: "Half height tank container" },
    { value: "28P0", label: "Platform flat" },
    { value: "42G0", label: "GCgeneral container" },
    { value: "42G1", label: "General container with ventilation holes" },
    { value: "42V0", label: "Highly ventilated container" },
    { value: "42RO", label: "RFintegral reefer container" },
    { value: "42U1", label: "OTopen top container with removable top parts" },
    { value: "42P1", label: "FLATflat rack with fixed ends" },
    { value: "42P2", label: "Flat with corners posts only" },
    { value: "42P3", label: "Flat with collapsible ends" },
    { value: "42P5", label: "Open sided container" },
    { value: "42B0", label: "BULKdry bulk container" },
    {
      value: "42T0",
      label:
        "Tank container for non-dangerous liquids - Minimum pressure 45 kPa",
    },
    {
      value: "42T1",
      label:
        "Tank container for non-dangerous liquids - Minimum pressure 150 kPa",
    },
    {
      value: "42T2",
      label:
        "Tank container for non-dangerous liquids - Minimum pressure 265 kPa",
    },
    {
      value: "42T3",
      label: "Tank container for dangerous liquids - Minimum pressure 150 kPa",
    },
    {
      value: "42T4",
      label: "Tank container for dangerous liquids - Minimum pressure 265 kPa",
    },
    {
      value: "42T5",
      label: "Tank container for dangerous liquids - Minimum pressure 400 kPa",
    },
    {
      value: "42T6",
      label: "Tank container for dangerous liquids - Minimum pressure 600 kPa",
    },
    {
      value: "42T7",
      label: "Tank container for gases - Minimum pressure 910 kPa",
    },
    {
      value: "42T8",
      label: "Tank container for gases - Minimum pressure 2 200 kPa",
    },
    {
      value: "42T9",
      label: "Tank container for gases - Minimum pressure (yet to be assigned)",
    },
    { value: "45G0", label: "HCgeneral container high cube (9,6)" },
    { value: "45R1", label: "HCRFintegral reefer container high cube (9,6)" },
    { value: "48U1", label: "Half height open top container" },
    { value: "48P0", label: "Platform flat" },
    { value: "GPC", label: "General Purpose Container" },
    { value: "RC", label: "Refrigerated Container" },
    { value: "OTP", label: "Open Top Container" },
    { value: "FRC", label: "Flat Rack Container" },
    { value: "TC", label: "Tank Container" },
    { value: "HC", label: "High Cube" },
  ],

  // Weight Units from VGM API document
  weightUnits: [
    { value: "KG", label: "KGs" },
    { value: "MT", label: "MT" },
  ],

  // VGM Evaluation Methods from VGM API document
  vgmEvalMethods: [
    { value: "M1", label: "Method 1" },
    { value: "M2", label: "Method 2" },
  ],

  // Shipper Types from VGM API document
  shipperTypes: [
    { value: "S", label: "Self" },
    { value: "O", label: "Other" },
  ],

  // IMO Numbers for Hazardous Cargo from VGM API document
  imoNumbers: [
    { value: "0", label: "Hazardous" },
    { value: "1.1", label: "Explosives" },
    { value: "1.2", label: "Explosives" },
    { value: "1.3", label: "Explosives" },
    { value: "1.4", label: "Explosives" },
    { value: "1.5", label: "Explosives" },
    { value: "2.1", label: "Inflammable gases" },
    { value: "2.2", label: "Non-flammable gases" },
    { value: "2.3", label: "Poisonous gases" },
    { value: "3", label: "Flammable liquids" },
    { value: "3.1", label: "Inflammable liquids" },
    { value: "3.2", label: "Inflammable liquids" },
    { value: "3.3", label: "Inflammable liquids" },
    { value: "4.1", label: "Inflammable solids" },
    { value: "4.2", label: "Spontaneously combustible" },
    { value: "4.3", label: "Dangerous when wet" },
    { value: "5.1", label: "Oxidizing substances" },
    { value: "5.2", label: "Organic peroxides" },
    { value: "6.1", label: "Poisonous(toxic) substances" },
    { value: "6.2", label: "Infectious substances" },
    { value: "7", label: "Radioactive substances" },
    { value: "8", label: "Corrosives" },
    { value: "8.1", label: "Hazardous" },
    { value: "9", label: "Miscellaneous dangerous substances" },
    { value: "ONI", label: "Onion" },
  ],

  // Shipper Registration Types from VGM API document
  shipperRegTypes: [
    { value: "IEC No", label: "IEC No" },
    { value: "CIN No", label: "CIN No" },
    { value: "PAN No", label: "PAN No" },
    { value: "Aadhaar No", label: "Aadhaar No" },
    { value: "Passport No", label: "Passport No" },
  ],

  // Port IDs from VGM API document
  portIds: [
    { value: "INNSA1", label: "Nhava Sheva" },
    { value: "INMUN1", label: "Mundra" },
    { value: "INNML1", label: "Namal" },
    { value: "INTUT1", label: "Tuticorin" },
    { value: "INCCU1", label: "Kolkata" },
    { value: "INPAV1", label: "Pipavav" },
    { value: "INHZA1", label: "Hazira" },
    { value: "INMRM1", label: "Mormugao" },
    { value: "INCOK1", label: "Cochin" },
    { value: "INMAA1", label: "Chennai" },
    { value: "INVTZ1", label: "Visakhapatnam" },
    { value: "INHAL1", label: "Haldia" },
    { value: "INKRI1", label: "Krishnapatnam" },
    { value: "INKAT1", label: "Kattupalli" },
    { value: "INPRT1", label: "Paradip" },
    { value: "INIXY1", label: "Siliguri" },
    { value: "INKAK1", label: "Kakinada" },
    { value: "INPNV6", label: "Panvel" },
    { value: "INAMG6", label: "Ahmedabad" },
    { value: "INATQ4", label: "Amritsar" },
    { value: "INBOM4", label: "Mumbai" },
    { value: "INCJB4", label: "Coimbatore" },
    { value: "INDEL4", label: "Delhi" },
    { value: "INDR4", label: "Indore" },
    { value: "INGHR6", label: "Ghaziabad" },
    { value: "INGOI4", label: "Goa" },
    { value: "INLDH6", label: "Ludhiana" },
    { value: "INLON6", label: "Loni" },
    { value: "INMDG6", label: "Madgaon" },
  ],

  // Special Stow Options
  specialStowOptions: [
    { value: "UN", label: "UN - Under Deck Stowage" },
    { value: "DO", label: "DO - Open Door" },
    { value: "AD", label: "AD - Above Deck" },
    { value: "BD", label: "BD - Below Deck" },
    { value: "AF", label: "AF - Above Fore" },
    { value: "BF", label: "BF - Below Fore" },
    { value: "AA", label: "AA - Above Aft" },
    { value: "BA", label: "BA - Below Aft" },
    { value: "WS", label: "WS - Winter Storage" },
    { value: "AH", label: "AH - Away From Heat/Boiler" },
    { value: "AS", label: "AS - Above Deck Away From Heat/Boiler/Sunlight" },
    { value: "BH", label: "BH - Below Deck Away From Heat/Boiler/Sunlight" },
    { value: "AT", label: "AT - Above Deck Top Tier Stowage" },
    { value: "BT", label: "BT - Below Deck Top Tier Stowage" },
    { value: "BW", label: "BW - Below Water Line Stowage" },
    { value: "OD", label: "OD - On Deck For One Door Open" },
  ],

  // ODC Units
  odcUnits: [
    { value: "CM", label: "CM" },
    { value: "FT", label: "FT" },
    { value: "IN", label: "IN" },
    { value: "M", label: "M" },
  ],

  // Origin Types
  originTypes: [
    { value: "B", label: "BUFFER" },
    { value: "C", label: "DOCK STUFFED" },
    { value: "F", label: "FACTORY STUFFED" },
    { value: "R", label: "ICD BY ROAD" },
    { value: "W", label: "ON WHEEL CONTAINER" },
    { value: "F_CFS", label: "Factory Stuffed Via CFS" },
    { value: "E_TANK", label: "Empty Tank" },
  ],

  // Container Statuses
  containerStatuses: [
    { value: "Full", label: "Full" },
    { value: "Empty", label: "Empty" },
  ],

  // Form Types
  formTypes: [
    { value: "F13", label: "F13" },
    { value: "F11", label: "F11" },
    { value: "CIO", label: "CIO" },
  ],

  // Issue To Options (Blank for NSICT/NSIGT/CCTL/ICT terminals)
  issueToOptions: [
    { value: "Shipper", label: "Shipper" },
    { value: "CHA Name", label: "CHA Name" },
  ],

  // Terminal Codes for different ports
  terminalCodes: {
    INNSA1: ["NSICT", "NSIGT", "BMCT", "GTI"],
    INMUN1: ["AMCT", "MICT", "GCT"],
    INCOK1: [
      "AST1",
      "CIF1",
      "CON1",
      "CPC1",
      "FAL1",
      "GDK1",
      "IGT1",
      "MLP1",
      "PET1",
    ],
    // Add other ports as needed
  },

  // CFS Codes mapped by Port ID
  cfsCodes: {
    INPNV6: ["INPNV6"],
    INAMG6: ["INAMG6CON1"],
    INATQ4: ["INATQ4AAI1"],
    INBOM4: ["INBOM4AAI1", "INBOM4MIA1", "INBOM4AIN1"],
    INBOM1: ["INBOM1MUM1"],
    INCCU1: ["INCCU1ALL1", "INCCU1BLC1", "INCCU1CPL1", "INCCU1CPL2", "INCCU1CWC1", "INCCU1HDC1", "INCCU1KKP1", "INCCU1PLP1", "INCCU1MSA1", "INCCU1AGL1", "INCCU1CON1"],
    INCCU4: ["INCCU4AAI1"],
    INCJB4: ["INCJB4AAI1"],
    INCOK1: ["INCOK1AST1", "INCOK1CPT1", "INCOK1FAL1", "INCOK1IGT1", "INCOK1PET1", "INCOK1GDK1", "INCOK1CPC1", "INCOK1CON1", "INCOK1CIF1", "INCOK1GDL1", "INCOK1MLP1"],
    INCOK4: ["INCOK4CAC1", "INCOK4CIA1"],
    INDEL4: ["INDEL4DIA1"],
    INDR4: ["INDR4GSE1"],
    INGHR6: ["INGHR6GDL1"],
    INGOI4: ["INGOI4CWC1"],
    INIXY1: ["INIXY1ABG1", "INIXY1ACP1", "INIXY1AVJ1", "INIXY1CON1", "INIXY1CWC1", "INIXY1CWC2", "INIXY1CWC3", "INIXY1KPT1"],
    INKAK1: ["INKAK1KSP1"],
    INLDH6: ["INLDH6CON1", "INLDH6GRF1", "INLDH6KCM1", "INLDH6OWP1", "INLDH6PSW1"],
    INLON6: ["INLON6CWC1"],
    INMAA1: ["INMAA1AGL1", "INMAA1ASS1", "INMAA1BNL1", "INMAA1CCT1", "INMAA1CIT1", "INMAA1CON1", "INMAA1COW1", "INMAA1COW2", "INMAA1CTO1", "INMAA1CWC1", "INMAA1CWC2", "INMAA1CWC3", "INMAA1CWC4", "INMAA1DRL1", "INMAA1ECC1", "INMAA1GDL1", "INMAA1GES1", "INMAA1GLO1", "INMAA1ICB1", "INMAA1KSS1", "INMAA1MRK1", "INMAA1SDL1", "INMAA1SDL11", "INMAA1SGL1", "INMAA1SHC1", "INMAA1SLP1", "INMAA1STL1", "INMAA1TCF1", "INMAA1TRL1", "INMAA1VIK1", "INMAA1VLT1", "INMAA1OYC1", "INMAA1SPL1", "INMAA1CXC1", "INMAA1SUL1", "INMAA1STP1", "INMAA1NDR1", "INMAA1LNT1", "INMAA1AWC1", "INMAA1SCL1", "INMAA1SMR1"],
    INMAA4: ["INMAA4AAI1"],
    INMDG6: ["INMDG6CWC1"],
    INMRM1: ["INMRM1MPT1"],
    INMUN1: ["INMUN1ACS1", "INMUN1CGL1", "INMUN1FCL1", "INMUN1HCL1", "INMUN1MCC1", "INMUN1MCF1", "INMUN1MCT1", "INMUN1MSA1", "INMUN1MSE1", "INMUN1MSE2", "INMUN1MSA2", "INMUN1SMS1", "INMUN1AGL1", "INMUN1AEY1", "INMUN1HTP1", "INMUN1HTP2", "INMUN1HMT1", "INMUN1SCP1", "INMUN1LCP1", "INMUN1EMP1", "INMUN1CWC1", "INMUN1RCF1"],
    INNML1: ["INNML1NMP1"],
    INTUT1: ["INTUT1ASS1", "INTUT1ILP1", "INTUT1CON1", "INTUT1CWC1", "INTUT1DCP1", "INTUT1HAR1", "INTUT1KNP1", "INTUT1RAC1", "INTUT1SEC1", "INTUT1TPT1", "INTUT1VIL1", "INTUT1PTP1", "INTUT1ALT1", "INTUT1CLP1", "INTUT1SDL1", "INTUT1COW1", "INTUT1COC1", "INTUT1SAL1"],
    INVTZ1: ["INVTZ1CON1", "INVTZ1CON2", "INVTZ1SSS1", "INVTZ1SSS2", "INVTZ1CWC1", "INVTZ1VCT1", "INVTZ1VCT2", "INVTZ1GEI1", "INVTZ1VPL1", "INVTZ1SMR1", "INVTZ1VCL1", "INVTZ1VLP1"],
    INNSA1: [
      "INNSA1JNPT", "INNSA1CON1", "INNSA1CWC1", "INNSA1CWC2", "INNSA1CWC3", "INNSA1CWC4", "INNSA1CWC5", "INNSA1GDL1", "INNSA1SMS1", "INNSA1MSW1", "INNSA1MRK1", "INNSA1MRK2", "INNSA1ASL1", "INNSA1NCL1", "INNSA1NCL2", "INNSA1NCL3", "INNSA1JLP1", "INNSA1ALS1", "INNSA1ILP1", "INNSA1OGC1", "INNSA1AGL1", "INNSA1JWL1", "INNSA1ELP1", "INNSA1SML1", "INNSA1JNP1", "INNSA1SBW1", "INNSA1TCL1", "INNSA1FCL1", "INNSA1ICT1"
    ]
  }
};

// Helper function to get terminal codes by port
export const getTerminalCodes = (portId) => {
  return masterData.terminalCodes[portId] || [];
};

// Helper function to get CFS codes by port
export const getCFSCodes = (portId) => {
  // Check direct match
  let codes = masterData.cfsCodes[portId] || [];

  // Also check cross-prefix (e.g. INBOM1 vs INBOM4, INCCU1 vs INCCU4, INMAA1 vs INMAA4)
  // This ensures a selection like "Chennai (INMAA1)" can show codes starting with INMAA4
  const prefix = portId.substring(0, 5); // e.g. "INMAA"
  Object.keys(masterData.cfsCodes).forEach(key => {
    if (key.startsWith(prefix) && key !== portId) {
      codes = [...codes, ...masterData.cfsCodes[key]];
    }
  });

  return [...new Set(codes)].sort();
};

// Helper function to get ISO codes by container size
export const getIsoCodesBySize = (containerSize) => {
  if (containerSize === "1X20") {
    return masterData.isoCodes.filter(
      (iso) => iso.value.startsWith("2") || iso.value === "2550"
    );
  } else if (containerSize === "1X40") {
    return masterData.isoCodes.filter(
      (iso) =>
        iso.value.startsWith("4") ||
        ["4500", "4510", "4530", "4550"].includes(iso.value)
    );
  } else if (containerSize === "1X45") {
    return masterData.isoCodes.filter(
      (iso) =>
        iso.value.startsWith("9") ||
        ["4550", "9510", "9530"].includes(iso.value)
    );
  }
  return masterData.isoCodes;
};

export default masterData;
