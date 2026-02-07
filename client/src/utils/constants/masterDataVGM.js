export const CONTAINER_SIZES = [
  { value: "1X20", label: "20Ft" },
  { value: "1X40", label: "40Ft" },
  { value: "1X45", label: "45Ft" },
];

export const CARGO_TYPES = [
  { value: "GEN", label: "General (GEN)" },
  { value: "HAZ", label: "Hazardous (HAZ)" },
  { value: "REF", label: "Reefer (REF)" },
  { value: "ONION", label: "Onion (ONION)" },
  { value: "ODC", label: "ODC" },
];

export const VGM_METHODS = [
  { value: "M1", label: "Method 1" },
  { value: "M2", label: "Method 2" },
];

export const SHIPPER_TYPES = [
  { value: "S", label: "Self" },
  { value: "O", label: "Other" },
];

export const WEIGHT_UOMS = [
  { value: "KG", label: "KG" },
  { value: "MT", label: "MT" },
];

export const REGISTRATION_TYPES = [
  { value: "IEC No", label: "IEC No" },
  { value: "CIN No", label: "CIN No" },
  { value: "PAN No", label: "PAN No" },
  { value: "Aadhaar No", label: "Aadhaar No" },
  { value: "Passport No", label: "Passport No" },
];

export const ATTACHMENT_TITLES = [
  { value: "WT_DECLARATION", label: "Weight Declaration - Annexure 1" },
  { value: "DG_DECLARATION", label: "DG Declaration / Weighbridge Slip" },
  { value: "AUTH_LETTER", label: "Authorization Letter by Shipper" },
];

export const PORTS = [
  { value: "INMUN1", label: "Mundra" },
  { value: "INPAV1", label: "Pipavav" },
  { value: "INHZA1", label: "Hazira" },
  { value: "INNSA1", label: "Nhava Sheva" },
  { value: "INNML1", label: "Mangalore" },
  { value: "INTUT1", label: "Tuticorin" },
  { value: "INCCU1", label: "Kolkata" },
  { value: "INMRM1", label: "Marmagoa" },
  { value: "INCOK1", label: "Cochin" },
  { value: "INMAA1", label: "Chennai" },
  { value: "INVTZ1", label: "Vishakapatnam" },
  { value: "INHAL1", label: "Haldia" },
  { value: "INKRI1", label: "Krishnapatnam" },
  { value: "INKAT1", label: "Kattupalli" },
  { value: "INPRT1", label: "Paradip" },
  { value: "INIXY1", label: "Kandla" },
  { value: "INKAK1", label: "Kakinada" },
];

export const LINERS = [
  { value: "ASAP", label: "ABLE SHIPPING AGENCIES (INDIA) PVT LTD" },
  { value: "AMPL", label: "AISSA MARITIME PVT.LTD." },
  { value: "ASPL", label: "Aiyer Shipping Agency Pvt. Ltd." },
  { value: "CMAA", label: "ANL INDIA CMA CGM AGENCIES INDIA PVT LTD" },
  { value: "APLL", label: "APL India Pvt. Ltd." },
  { value: "BLAP", label: "BEN LINE AGENCIES (INDIA) PVT.LTD" },
  { value: "BSSL", label: "BHAVANI SHIPPING SERVICES (I) PVT.LTD." },
  { value: "BFSP", label: "BSL FREIGHT SOLUTIONS PVT LTD." },
  { value: "CAPL", label: "CA LOGISTICS PVT. LTD" },
  { value: "CLPL", label: "CARAVEL LOGISTICS PVT LTD" },
  { value: "CSSP", label: "CEYLINE SHIPPING SERVICES PVT LTD" },
  { value: "CMDU", label: "CMA CGM AGENCIES INDIA PVT LTD" },
  { value: "CCPL", label: "Continental Carriers (Pvt) Ltd" },
  { value: "COSU", label: "COSCO SHIPPING LINES INDIA PRIVATE LIMITED" },
  { value: "CULL", label: "CUL" },
  { value: "NULL", label: "EA_LINER" },
  { value: "EMPL", label: "Econship Marine Pvt Ltd." },
  { value: "ESAI", label: "EMIRATES SHIPPING AGENCIES INDIA PVT LTD" },
  { value: "ELPL", label: "EMU LINES PVT LTD" },
  { value: "ESGL", label: "E-SHIP GLOBAL LOGISTICS" },
  { value: "EGSL", label: "EVERGREEN SHIPPING AGENCY INDIA PVT. LTD." },
  { value: "FCIL", label: "FREIGHT CONNECTION INDIA PVT. LTD" },
  { value: "GMPL", label: "GOODRICH MARITIME PVT. LTD." },
  { value: "GLMA", label: "GREEN LINK MARITIME AGENCIES" },
  { value: "GMLP", label: "GREENWICH MERIDIAN LOGISTICS (INDIA) PVT.LTD" },
  { value: "SUDU", label: "HAMBURG SUD INDIA PVT LTD" },
  { value: "HJSC", label: "HANJIN SHIPPING INDIA PVT. LTD." },
  { value: "HPLY", label: "HAPAG LLOYD INDIA PVT LTD" },
  { value: "HMMI", label: "HYUNDAI MERCHANT MARINE INDIA PVT LTD" },
  { value: "ILIL", label: "IAL LOGISTICS INDIA LTD" },
  { value: "ILSI", label: "INTERASIA SHIPPING LINES INDIA PRIVATE LIMITED" },
  { value: "IIPL", label: "IRISL INDIA PVT LTD" },
  { value: "JCMP", label: "JEDIV CARGO MANAGEMENT PVT LTD" },
  { value: "KKLU", label: "K-LINE India Private Limited" },
  { value: "KMTC", label: "KMTC (India) PVT. LTD." },
  { value: "LCLL", label: "LANCER CONTAINER LINES LTD" },
  { value: "LMSL", label: "LOGISTIC MARITIME SERVICES LLP" },
  { value: "MSPL", label: "M/S.MARITIME SERVICES PVT LTD." },
  { value: "MAEU", label: "MAERSK LINE INDIA PRIVATE LIMITED" },
  { value: "MMPL", label: "MAJESTIC MARITIME PVT. LTD" },
  { value: "MSSP", label: "MAK SHIPPING SERVICES PVT LTD" },
  { value: "MCSL", label: "MARINE CONTAINER SERVICES (I) PVT. LTD." },
  { value: "MSSL", label: "MERCHANT SHIPPING SERVICES PVT LTD" },
  { value: "MOLP", label: "Mitsui O.S.K. Lines India Private Limited" },
  { value: "MLPL", label: "MOONSTAR LINES PVT LTD" },
  { value: "MSCU", label: "MSC AGENCY INDIA PVT LTD" },
  { value: "NSPL", label: "NAVIO SHIPPING PRIVATE LIMITED" },
  { value: "NCLL", label: "NEPTUNE CONTAINER LINE & LOGISTICS PVT . LTD." },
  { value: "NYKS", label: "NYK LINE INDIA PVT LTD" },
  { value: "OSPN", label: "OASIS SHIPPING PVT LTD NILEDUTCH" },
  { value: "OSAL", label: "OMEGA SHIPPING AGENCIES PVT. LTD." },
  { value: "ONEL", label: "ONE Ocean Network Express Line India Pvt. Ltd." },
  { value: "OOCL", label: "OOCL India Pvt Ltd" },
  { value: "PALI", label: "PAN ASIA LOGISTICS INDIA PVT LTD" },
  { value: "PSLP", label: "PERMA SHIPPING LINE I PVT LTD." },
  { value: "PABV", label: "PIL Pacific International Lines" },
  { value: "PSAL", label: "POSEIDON SHIPPING AGENCY PVT.LTD." },
  { value: "RMPL", label: "RADIANT MARITIME INDIA PRIVATE LIMITED" },
  { value: "RAPL", label: "RAJA AGENCIES" },
  { value: "RSSP", label: "RASHI SHIPPING SERVICES PVT LTD" },
  { value: "RAIL", label: "RCL AGENCIES INDIA PRIVATE LIMITED" },
  { value: "RCLP", label: "REGIONAL CONTAINER LINE" },
  { value: "RSAL", label: "RELAY SHIPPING AGENCY LTD" },
  { value: "RRPL", label: "RR SHIPPING PRIVATE LIMITED" },
  { value: "SMCL", label: "S M CONTAINER LINES PRIVATE LIMITED" },
  { value: "SHPE", label: "SAMSARA SHIPPING PVT LTD ( ESL )" },
  { value: "SHPH", label: "SAMSARA SHIPPING PVT LTD ( HEUNG-A LINE )" },
  { value: "SSLP", label: "Samudera Shipping Line I Pvt.Ltd" },
  { value: "SCLP", label: "SARJAK CONTAINER LINES PVT. LTD" },
  { value: "SCSP", label: "SEA CONSORTIUM SHIPPING INDIA PRIVATE LIMITED" },
  { value: "SSAP", label: "SEAHORSE SHIP AGENCIES PVT.LTD." },
  { value: "SLIP", label: "SEAPORT LINES INDIA PVT LTD" },
  { value: "SEFS", label: "Seastar (Freight Connect)" },
  { value: "SSID", label: "SEATRADE SHIPPING INDIA PVT LTD DAL" },
  { value: "SSIQ", label: "SEATRADE SHIPPING INDIA PVT LTD QNL" },
  { value: "SSIR", label: "SEATRADE SHIPPING INDIA PVT LTD RCL" },
  { value: "SLAL", label: "Seaways Liner Agency Maxicon Shipping" },
  { value: "SCIL", label: "Shipping Corporation of India Ltd. (SCI)" },
  { value: "SRSL", label: "SHREYAS RELAY SYSTEMS LTD" },
  { value: "SMPL", label: "SIMA MARINE INDIA PRIVATE LIMITED" },
  { value: "SLCI", label: "SM LINE CORPORATION INDIA PVT LTD" },
  { value: "SMSP", label: "SMART MARINE SERVICES PVT LTD" },
  { value: "STFS", label: "ST. JOHN FREIGHT SYSTESM LTD" },
  { value: "SSIG", label: "STAR SHIPPING SERVICES (INDIA) PVT.LTD- GOLDSTAR" },
  { value: "SSIL", label: "STAR SHIPPING SERVICES (INDIA) PVT.LTD- Laurel" },
  { value: "SGLP", label: "SWIFTLINE GLOBAL LOGISTICS PVT.LTD." },
  { value: "TSLL", label: "T.S. LINES ( INDIA ) PVT. LTD." },
  { value: "TSLP", label: "TLPL SHIPPING & LOGISTICS PVT LTD" },
  { value: "TASP", label: "Trans Asian Shipping Services Pvt. Ltd." },
  { value: "TIPL", label: "TRANSLINER INDIA PVT LTD" },
  { value: "TMPL", label: "TRANSLINER MARITIME PRIVATE LIMITED" },
  {
    value: "TGLP",
    label: "Transworld Global Logistics Solutions India Private Limited",
  },
  { value: "TSAL", label: "TRANSWORLD SHIPPING AND LOGISTICS LTD" },
  {
    value: "UASP",
    label: "UNITED ARAB SHIPPING AGENCY COMPANY INDIA PVT.LTD.",
  },
  { value: "WLPL", label: "Westship Logistics Pvt Ltd" },
  { value: "YMLP", label: "YANG MING LINE I PVT. LTD." },
  { value: "ZIMU", label: "ZIM INTEGRATED SHIPPING SERVICES INDIA PVT.LTD" },
  { value: "IGSL", label: "INTERGULF SHIPPING LINE PVT LTD" },
  { value: "SBA1", label: "SEABRIDGE MARINE AGENCIES PVT LTD SBA1" },
];

export const IMO_NUMBERS = [
  { value: "0", label: "0 - Hazardous" },
  { value: "1.1", label: "1.1 - Explosives" },
  { value: "1.2", label: "1.2 - Explosives" },
  { value: "1.3", label: "1.3 - Explosives" },
  { value: "1.4", label: "1.4 - Explosives" },
  { value: "1.5", label: "1.5 - Explosives" },
  { value: "2.1", label: "2.1 - Inflammable gases" },
  { value: "2.2", label: "2.2 - Non-flammable gases" },
  { value: "2.3", label: "2.3 - Poisonous gases" },
  { value: "3", label: "3 - Flammable liquids" },
  { value: "3.1", label: "3.1 - Inflammable liquids" },
  { value: "3.2", label: "3.2 - Inflammable liquids" },
  { value: "3.3", label: "3.3 - Inflammable liquids" },
  { value: "4.1", label: "4.1 - Inflammable solids" },
  { value: "4.2", label: "4.2 - Spontaneously combustible" },
  { value: "4.3", label: "4.3 - Dangerous when wet" },
  { value: "5.1", label: "5.1 - Oxidizing substances" },
  { value: "5.2", label: "5.2 - Organic peroxides" },
  { value: "6.1", label: "6.1 - Poisonous(toxic) substances" },
  { value: "6.2", label: "6.2 - Infectious substances" },
  { value: "7", label: "7 - Radioactive substances" },
  { value: "8", label: "8 - Corrosives" },
  { value: "8.1", label: "8.1 - Hazardous" },
  { value: "9", label: "9 - Miscellaneous dangerous substances" },
  { value: "ONI", label: "ONI - Onion" },
]

export const HANDOVER_LOCATIONS = [
  { value: "INNSA1", label: "Nhava Sheva" },
  { value: "INMUN1", label: "Mundra" },
  { value: "INNML1", label: "Mangalore" },
  { value: "INTUT1", label: "Tuticorin" },
  { value: "INCCU1", label: "Kolkata" },
  { value: "INPAV1", label: "Pipavav" },
  { value: "INHZA1", label: "Hazira" },
  { value: "INMRM1", label: "Marmagoa" },
  { value: "INCOK1", label: "Cochin" },
  { value: "INMAA1", label: "Chennai" },
  { value: "INVTZ1", label: "Vishakapatnam" },
  { value: "INHAL1", label: "Haldia" },
  { value: "INKRI1", label: "Krishnapatnam" },
  { value: "INKAT1", label: "Kattupalli" },
  { value: "INPRT1", label: "Paradip" },
  { value: "INIXY1", label: "Kandla" },
  { value: "INKAK1", label: "Kakinada" },
];

export const TERMINAL_CODES = [
  // Nhava Sheva
  { value: "JNPCT", label: "JNPCT - NSFTPL", portId: "INNSA1" },
  { value: "GTI", label: "GTI - GTI", portId: "INNSA1" },
  { value: "NSICT", label: "NSICT - NSICT", portId: "INNSA1" },
  { value: "BMCT", label: "BMCT - BMCT", portId: "INNSA1" },
  { value: "NSIGT", label: "NSIGT - NSIGT", portId: "INNSA1" },

  // Mundra
  { value: "MICT", label: "MICT - MICT", portId: "INMUN1" },
  { value: "AMCT", label: "AMCT - AMCT", portId: "INMUN1" },
  { value: "AICTPL", label: "AICTPL - AICTPL", portId: "INMUN1" },
  { value: "ACMTPL", label: "ACMTPL - ACMTPL", portId: "INMUN1" },
  { value: "ADANI", label: "ADANI - ADANI", portId: "INMUN1" },
  { value: "AMCT2", label: "AMCT2 - AMCT2", portId: "INMUN1" },

  // Mangalore
  {
    value: "JMCT",
    label: "JMCT - JSW MANGALORE CONTAINER TERMINAL PVT LTD",
    portId: "INNML1",
  },
  { value: "IXE", label: "IXE - IXE", portId: "INNML1" },
  { value: "NML01", label: "NML01 - NML01", portId: "INNML1" },
  { value: "INNML1", label: "INNML1 - INNML1", portId: "INNML1" },
  { value: "NMPT", label: "NMPT - NMPT", portId: "INNML1" },

  // Tuticorin
  { value: "TUT01", label: "TUT01 - TUT01", portId: "INTUT1" },
  { value: "INTUT1", label: "INTUT1 - INTUT1", portId: "INTUT1" },
  { value: "TUT", label: "TUT - TUT", portId: "INTUT1" },
  { value: "TICT", label: "TICT - TICT", portId: "INTUT1" },
  { value: "DBGT", label: "DBGT - DBGT", portId: "INTUT1" },
  { value: "PSA", label: "PSA - PSA", portId: "INTUT1" },

  // Kolkata
  { value: "AHPPL", label: "AHPPL - AHPPL", portId: "INCCU1" },
  { value: "INCCU1", label: "INCCU1 - Kolkata Port Trust", portId: "INCCU1" },

  // Pipavav
  { value: "PAV01", label: "PAV01 - PAV01", portId: "INPAV1" },
  {
    value: "APM Terminal - GPPL",
    label: "APM Terminal - GPPL",
    portId: "INPAV1",
  },
  { value: "INPAV1", label: "INPAV1 - INPAV1", portId: "INPAV1" },

  // Hazira
  { value: "ADANI", label: "ADANI - ADANI", portId: "INHZA1" },
  { value: "INPAV1", label: "INPAV1 - INPAV1", portId: "INHZA1" },
  { value: "HAZ1", label: "HAZ1 - HAZ1", portId: "INHZA1" },
  { value: "AHPPL", label: "AHPPL - AHPPL", portId: "INHZA1" },
  { value: "INHZA", label: "INHZA - INHZA", portId: "INHZA1" },

  // Marmagoa
  { value: "MRM01", label: "MRM01 - Terminal", portId: "INMRM1" },
  { value: "MARMAGOA", label: "MARMAGOA - MRM01", portId: "INMRM1" },
  { value: "MPT", label: "MPT - MPT", portId: "INMRM1" },

  // Cochin
  { value: "INCOK1", label: "INCOK1 - INCOK1", portId: "INCOK1" },
  { value: "COPT", label: "COPT - COPT", portId: "INCOK1" },
  { value: "COK03", label: "COK03 - COK03", portId: "INCOK1" },

  // Chennai
  { value: "CCTL", label: "CCTL - CCTL", portId: "INMAA1" },
  { value: "CITPL", label: "CITPL - CITPL", portId: "INMAA1" },
  { value: "INMAA1", label: "INMAA1 - INMAA1", portId: "INMAA1" },

  // Vishakapatnam
  { value: "VIZAG", label: "VIZAG - INVTZ1", portId: "INVTZ1" },

  // Haldia
  { value: "HALDIA", label: "HALDIA - HALDIA", portId: "INHAL1" },
  { value: "INHAL1", label: "INHAL1 - Haldia Dock complex", portId: "INHAL1" },
  { value: "HAL", label: "HAL - HAL", portId: "INHAL1" },
  { value: "HICT", label: "HICT - HICT", portId: "INHAL1" },

  // Krishnapatnam
  {
    value: "KRISHNPPATNAM",
    label: "KRISHNPPATNAM - KRISHNPPATNAM",
    portId: "INKRI1",
  },
  { value: "INKRI1", label: "INKRI1 - INKRI1", portId: "INKRI1" },
  { value: "INKRI", label: "INKRI - INKRI", portId: "INKRI1" },

  // Kattupalli
  { value: "KICT", label: "KICT - KICT", portId: "INKAT1" },
  { value: "KATTUPALLI", label: "KATTUPALLI - KATTUPALLI", portId: "INKAT1" },
  { value: "KTP01", label: "KTP01 - KTP01", portId: "INKAT1" },

  // Paradip
  {
    value: "INPRT1PPT1",
    label: "INPRT1PPT1 - Paradip International Cargo Terminal Pvt Ltd",
    portId: "INPRT1",
  },

  // Kandla
  { value: "KICT", label: "KICT - KICT", portId: "INIXY1" },

  // Kakinada
  {
    value: "INKAK1KSP1",
    label: "INKAK1KSP1 - Kakinada Container Terminal Private Limited(KCTPL)",
    portId: "INKAK1",
  },

  // NCR
  { value: "NCR", label: "NCR - NCR", portId: "NCR" },

  // Mumbai
  { value: "INBOM", label: "INBOM - MUMBAI TERMINAL", portId: "INBOM" },

  // Gangavaram Port
  { value: "INGGV1", label: "INGGV1 - Gangavaram", portId: "INGGV1" },

  // Ennore
  { value: "INENR1AEC1", label: "INENR1AEC1 - ADANI ENNORE", portId: "INENR1" },
  { value: "AECTPL", label: "AECTPL - AECTPL", portId: "INENR1" },

  // Vizhinjam Port
  { value: "AVPPL", label: "AVPPL - AVPPL", portId: "AVPPL" },
];

// Helper function to get terminal codes by port
export const getTerminalCodesByPort = (portId) => {
  return TERMINAL_CODES.filter((terminal) => terminal.portId === portId);
};

// Helper function to get all unique port IDs from terminal codes
export const getPortsFromTerminals = () => {
  const portIds = [
    ...new Set(TERMINAL_CODES.map((terminal) => terminal.portId)),
  ];
  return portIds.map((portId) => {
    const port = PORTS.find((p) => p.value === portId);
    return port || { value: portId, label: portId };
  });
};
// src/utils/constants/masterData.js
// Add this to your existing constants
export const CONTAINER_TYPES = [
  { value: "GPC", label: "General Purpose Container" },
  { value: "RC", label: "Refrigerated Container" },
  { value: "OTP", label: "Open Top Container" },
  { value: "FRC", label: "Flat Rack Container" },
  { value: "TC", label: "Tank Container" },
  { value: "HC", label: "High Cube" },
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
  { value: "45G0", label: "HCgeneral container high cube (9,6)" },
  { value: "45R1", label: "HCRFintegral reefer container high cube (9,6)" },
  { value: "48U1", label: "Half height open top container" },
  { value: "48P0", label: "Platform flat" },
  {
    value: "42T0",
    label: "Tank container for non-dangerous liquids - Minimum pressure 45 kPa",
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
];

export const QUICK_RESPONSE_OPTIONS = [
  {
    value: "Y",
    label: "Yes - Immediate response (fail if weighment not available)",
  },
  { value: "N", label: "No - Wait for weighment details" },
];

export const AUTHORIZED_PERSONS = [
  {
    exporter: "AB TRADELINK PRIVATE LIMITED",
    authPerson: "Mr. ABHILASH KAMALKUMAR S",
    designation: "DIRECTOR",
    contactNo: "079-26409085/23",
  },
  {
    exporter: "AIA ENGINEERING LTD.",
    authPerson: "Mr. Nandkishore Reddy",
    designation: "Logistic Manager",
    contactNo: "9824031007",
  },
  {
    exporter: "SHRI ALKA INDUSTRIES",
    authPerson: "Mr. TANMAY PATEL",
    designation: "MANAGING PARTNER",
    contactNo: "9712928989",
  },
  {
    exporter: "AMMANN INDIA PVT. LTD",
    authPerson: "Mr. VIJISH KUMAR",
    designation: "Assistant General Manager - EXIM",
    contactNo: "9099045858",
  },
  {
    exporter: "ANEETA TECHNOPACK PVT. LTD.",
    authPerson: "Mr. Parthesh Trivedi",
    designation: "Export Executive",
    contactNo: "9904807483",
  },
  {
    exporter: "ANEETA PLASTPACK LLP.",
    authPerson: "Mr. MITIN JAIN",
    designation: "MANAGER",
    contactNo: "7940009302",
  },
  {
    exporter: "ANEETA PACKAGING PRIVATE LIMITED",
    authPerson: "Mr. Parthesh Trivedi",
    designation: "Export Executive",
    contactNo: "9904807483",
  },
  {
    exporter: "ARA SCRAP RECYCLERS LLP",
    authPerson: "Mr. MANISH SHAH",
    designation: "Director",
    contactNo: "9998472003",
  },
  {
    exporter: "BAHETI RECYCLING INDUSTRIES LIMITED.",
    authPerson: "Mr. SHANKERLAL B. SHAH",
    designation: "DIRECTOR",
    contactNo: "9879106332",
  },
  {
    exporter: "BHAVYA MACHINE TOOLS LLP",
    authPerson: "HINAL PANCHAL",
    designation: "Assit. Manager",
    contactNo: "6353700614",
  },
  {
    exporter: "G.R. METALLOYS PRIVATE LIMITED",
    authPerson: "Mr. Ronak Patel",
    designation: "AGM- Business Development",
    contactNo: "7925624681",
  },
  {
    exporter: "GURU RAJENDRA METALLOYS INDIA PVT. LTD.",
    authPerson: "Mr. SHAILESH JAIN",
    designation: "DIRECTOR",
    contactNo: "9879222432",
  },
  {
    exporter: "GEMCORP RECYCLING & TECHNOLOGIES PVT LTD.",
    authPerson: "Mr. HARISH YADAV",
    designation: "MANAGER",
    contactNo: "9510550907",
  },
  {
    exporter: "LAXCON STEELS LIMITED",
    authPerson: "Mr. DEEPAK AGRAWAL",
    designation: "ACCOUNTS MANAGER",
    contactNo: "9327142410",
  },
  {
    exporter: "MODERN INSULATORS LIMITED",
    authPerson: "Mr. PRASANNA KUMAR",
    designation: "MANAGER",
    contactNo: "9799716448",
  },
  {
    exporter: "NANDESHWARI STEEL LIMITED",
    authPerson: "Mr. LALITBHAI NATVERBHAI PATEL",
    designation: "Director",
    contactNo: "271626944",
  },
  {
    exporter: "SAKAR INDUSTRIES PVT LIMITED",
    authPerson: "Mr. Ramesh R Shah",
    designation: "Director",
    contactNo: "7925624681",
  },
  {
    exporter: "SHREE HANS ALLOYS LIMITED",
    authPerson: "KAJAL THAKKAR",
    designation: "ACCOUNTANT",
    contactNo: "9824250056",
  },
];
