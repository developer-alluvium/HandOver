// server/seeders/shippingLineSeeder.js
import mongoose from "mongoose";
import ShippingLine from "../models/ShippingLine.js";
import dotenv from "dotenv";
dotenv.config();

const LINERS = [
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
    { value: "ESAI", label: "EMU LINES PVT LTD" }, // Wait, check duplicates
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
    { value: "TGLP", label: "Transworld Global Logistics Solutions India Private Limited" },
    { value: "TSAL", label: "TRANSWORLD SHIPPING AND LOGISTICS LTD" },
    { value: "UASP", label: "UNITED ARAB SHIPPING AGENCY COMPANY INDIA PVT.LTD." },
    { value: "WLPL", label: "Westship Logistics Pvt Ltd" },
    { value: "YMLP", label: "YANG MING LINE I PVT. LTD." },
    { value: "ZIMU", label: "ZIM INTEGRATED SHIPPING SERVICES INDIA PVT.LTD" },
    { value: "IGSL", label: "INTERGULF SHIPPING LINE PVT LTD" },
    { value: "SBA1", label: "SEABRIDGE MARINE AGENCIES PVT LTD SBA1" },
];

const MONGODB_URI = process.env.DEV_MONGODB_URI || "mongodb://localhost:27017/handover";

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        const operations = LINERS.map(line => ({
            updateOne: {
                filter: { value: line.value },
                update: { label: line.label },
                upsert: true
            }
        }));

        await ShippingLine.bulkWrite(operations);
        console.log("Shipping lines seeded successfully!");

        await mongoose.connection.close();
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seed();
