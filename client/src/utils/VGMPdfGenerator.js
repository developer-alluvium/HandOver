/**
 * VGM PDF Generator for Individual Exporters
 * Generates PDF with exporter-specific header, footer, and signature images
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============ STATIC IMAGE IMPORTS ============
// AIA
import aiaHead from "../assets/aia/head.png";
import aiaSign from "../assets/aia/sign.png";

// Alka
import alkaHead from "../assets/alka/head.png";
import alkaSign from "../assets/alka/sign.png";

// Amman
import ammanHead from "../assets/amman/heaad.png";
import ammanSign from "../assets/amman/sign.png";
import ammanFoot from "../assets/amman/foot.png";

// Aneeta Packing
import aneetaPackingHead from "../assets/aneeta packing/head.png";
import aneetaPackingSign from "../assets/aneeta packing/sign.png";
import aneetaPackingFoot from "../assets/aneeta packing/foot.png";

// Aneeta Techno Pack
import aneetaTechnoHead from "../assets/aneeta techno pack/head.png";
import aneetaTechnoSign from "../assets/aneeta techno pack/sign.png";
import aneetaTechnoFoot from "../assets/aneeta techno pack/foot.png";

// Aneeta Plast Pack
import aneetaPlastHead from "../assets/aneeta plast pack/head.png";
import aneetaPlastSign from "../assets/aneeta plast pack/sign.png";
import aneetaPlastFoot from "../assets/aneeta plast pack/foot.png";

// ARA
import araHead from "../assets/ara/head.png";
import araSign from "../assets/ara/sign.png";

// Baheti
import bahetiHead from "../assets/baheti/head.png";
import bahetiSign from "../assets/baheti/sign.png";
import bahetiFoot from "../assets/baheti/foot.png";

// Bhavya
import bhavyaHead from "../assets/bhavya/head.png";
import bhavyaSign from "../assets/bhavya/sign.png";

// Extrusions
import extrusionsHead from "../assets/extrusions/head.png";
import extrusionsSign from "../assets/extrusions/sign.png";

// Gemcorp
import gemcorpHead from "../assets/gemcorp/head.png";
import gemcorpSign from "../assets/gemcorp/sign.png";

// GR Metalloys
import grMetalloysHead from "../assets/gr metalloys/head.png";
import grMetalloysSign from "../assets/gr metalloys/sign.png";
import grMetalloysFoot from "../assets/gr metalloys/foot.png";

// Guru Rajendra
import guruRajendraHead from "../assets/guru rajendra/head.png";
import guruRajendraSign from "../assets/guru rajendra/sign.png";
import guruRajendraFoot from "../assets/guru rajendra/footer.png";

// Hans
import hansHead from "../assets/hans/head.png";
import hansSign from "../assets/hans/sign.png";

// Metal Aloy
import metalAloyHead from "../assets/metal aloy/head.png";
import metalAloySign from "../assets/metal aloy/sign.png";

// Mordern
import mordernHead from "../assets/mordern/head.png";
import mordernSign from "../assets/mordern/sign.png";
import mordernFoot from "../assets/mordern/foot.png";

// Nandeshwary
import nandeshwaryHead from "../assets/nandeshwary/head.png";
import nandeshwarySign from "../assets/nandeshwary/sign.png";

// Sakar
import sakarHead from "../assets/sakar/head.png";
import sakarSign from "../assets/sakar/sign.png";
import sakarFoot from "../assets/sakar/foot.png";

// ============ EXPORTER CONFIGURATIONS ============
export const EXPORTERS = [
    {
        key: "aia",
        label: "AIA",
        head: aiaHead,
        sign: aiaSign,
        foot: null
    },
    {
        key: "alka",
        label: "Alka",
        head: alkaHead,
        sign: alkaSign,
        foot: null
    },
    {
        key: "amman",
        label: "Amman",
        head: ammanHead,
        sign: ammanSign,
        foot: ammanFoot
    },
    {
        key: "aneeta_packing",
        label: "Aneeta Packing",
        head: aneetaPackingHead,
        sign: aneetaPackingSign,
        foot: aneetaPackingFoot
    },
    {
        key: "aneeta_techno_pack",
        label: "Aneeta Techno Pack",
        head: aneetaTechnoHead,
        sign: aneetaTechnoSign,
        foot: aneetaTechnoFoot
    },
    {
        key: "aneeta_plast_pack",
        label: "Aneeta Plast Pack",
        head: aneetaPlastHead,
        sign: aneetaPlastSign,
        foot: aneetaPlastFoot
    },
    {
        key: "ara",
        label: "ARA",
        head: araHead,
        sign: araSign,
        foot: null
    },
    {
        key: "baheti",
        label: "Baheti",
        head: bahetiHead,
        sign: bahetiSign,
        foot: bahetiFoot
    },
    {
        key: "bhavya",
        label: "Bhavya Machine Tools LLP",
        head: bhavyaHead,
        sign: bhavyaSign,
        foot: null
    },
    {
        key: "extrusions",
        label: "Extrusions",
        head: extrusionsHead,
        sign: extrusionsSign,
        foot: null
    },
    {
        key: "gemcorp",
        label: "Gemcorp",
        head: gemcorpHead,
        sign: gemcorpSign,
        foot: null
    },
    {
        key: "gr_metalloys",
        label: "GR Metalloys",
        head: grMetalloysHead,
        sign: grMetalloysSign,
        foot: grMetalloysFoot
    },
    {
        key: "guru_rajendra",
        label: "Guru Rajendra",
        head: guruRajendraHead,
        sign: guruRajendraSign,
        foot: guruRajendraFoot
    },
    {
        key: "hans",
        label: "Hans",
        head: hansHead,
        sign: hansSign,
        foot: null
    },
    {
        key: "metal_aloy",
        label: "Metal Aloy",
        head: metalAloyHead,
        sign: metalAloySign,
        foot: null
    },
    {
        key: "mordern",
        label: "Mordern",
        head: mordernHead,
        sign: mordernSign,
        foot: mordernFoot
    },
    {
        key: "nandeshwary",
        label: "Nandeshwary",
        head: nandeshwaryHead,
        sign: nandeshwarySign,
        foot: null
    },
    {
        key: "sakar",
        label: "Sakar",
        head: sakarHead,
        sign: sakarSign,
        foot: sakarFoot
    },
];

/**
 * Convert image URL to base64 for jsPDF and get dimensions
 * @param {string} url - Image URL
 * @returns {Promise<{base64: string, width: number, height: number}>} - Base64 data and dimensions
 */
const getImageData = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve({
                base64: canvas.toDataURL("image/png"),
                width: img.width,
                height: img.height
            });
        };
        img.onerror = (err) => {
            console.error("Image load error:", err);
            reject(err);
        };
        img.src = url;
    });
};

/**
 * Calculate scaled dimensions to fit within max bounds while preserving aspect ratio
 * @param {number} origWidth - Original width
 * @param {number} origHeight - Original height
 * @param {number} maxWidth - Maximum width allowed
 * @param {number} maxHeight - Maximum height allowed (optional)
 * @returns {{width: number, height: number}} - Scaled dimensions
 */
const getScaledDimensions = (origWidth, origHeight, maxWidth, maxHeight = null) => {
    // Convert pixels to mm (approximate: 1px ≈ 0.264583mm at 96dpi)
    const pxToMm = 0.264583;
    let width = origWidth * pxToMm;
    let height = origHeight * pxToMm;

    // Scale down if wider than maxWidth
    if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
    }

    // Scale down if taller than maxHeight (if specified)
    if (maxHeight && height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
    }

    return { width, height };
};

/**
 * Generate VGM PDF for a specific exporter
 * @param {Object} vgmData - VGM form data
 * @param {Object} exporter - Exporter configuration
 */
export const generateVGMPdf = async (vgmData, exporter) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let currentY = 10;

    // ============ ADD HEADER IMAGE ============
    if (exporter.head) {
        try {
            const headerData = await getImageData(exporter.head);
            // Calculate dimensions preserving aspect ratio, max width = page width - margins
            const maxWidth = pageWidth - 20;
            const dims = getScaledDimensions(headerData.width, headerData.height, maxWidth, 40);
            // Center the header
            const headerX = (pageWidth - dims.width) / 2;
            doc.addImage(headerData.base64, "PNG", headerX, currentY, dims.width, dims.height);
            currentY += dims.height + 7;
        } catch (error) {
            console.warn("Header image failed for:", exporter.label, error);
            currentY += 10;
        }
    } else {
        currentY += 10;
    }

    // ============ TITLE ============
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const title = "INFORMATION ABOUT VERIFIED GROSS MASS OF CONTAINER";
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, currentY);

    // Underline for title
    doc.setLineWidth(0.5);
    doc.line(titleX, currentY + 1, titleX + titleWidth, currentY + 1);
    currentY += 15;

    // ============ BUILD TABLE DATA ============
    const values = vgmData;
    const weighBridgeFullAddress = [
        values.weighBridgeAddrLn1,
        values.weighBridgeAddrLn2,
        values.weighBridgeAddrLn3,
    ].filter(Boolean).join(", ");

    // Format weighbridge address with registration
    const weighBridgeInfo = `${values.weighBridgeRegNo || ""}\n${weighBridgeFullAddress}`;

    // Format VGM with method
    const vgmMethod = values.vgmEvalMethod === "M1" ? "METHOD-1" : "METHOD-2";
    const cargoWtInfo = values.cargoWt ? `${values.cargoWt} ${values.cargoWtUom || "KGS"}` : "";
    const tareWtInfo = values.tareWt ? `TARE WT : ${values.tareWt} ${values.tareWtUom || "KGS"}` : "";
    const vgmInfo = `${vgmMethod}, ${values.totWt || ""}.000 KGS${cargoWtInfo ? ` (CARGO WT: ${cargoWtInfo}${tareWtInfo ? ` + ${tareWtInfo}` : ""})` : ""}`;

    // Format weighing date/time
    const weighingDateTime = values.weighBridgeWtTs || "";

    // Cargo type mapping
    const cargoTypeMap = {
        "GEN": "NORMAL",
        "HAZ": "HAZARDOUS",
        "REE": "REEFER",
        "OTH": "OTHERS"
    };
    const cargoTypeDisplay = cargoTypeMap[values.cargoTp] || values.cargoTp || "NORMAL";

    // Hazardous info
    const hazInfo = values.cargoTp === "HAZ"
        ? `${values.unNo1 || ""} / ${values.imoNo1 || ""}`
        : "...N. A...";

    const tableData = [
        ["1*", "Name of the shipper", values.shipperNm || "-"],
        ["2*", "Shipper Registration /License no.( IEC No/CIN No)**", `IEC Code No : ${values.shipRegNo || "-"}`],
        ["3*", "Name and designation of official of the shipper authorized\nto sign document", `${values.authPrsnNm || ""}\nDesignation : ${values.authDesignation || ""}`],
        ["4*", "24 x 7 contact details of authorized official of shipper", values.authMobNo ? `+91 ${values.authMobNo}` : "-"],
        ["5*", "Container No. (If container more than one then Provide\nVGM Details Container wise)", values.cntnrNo || "-"],
        ["6*", "Container Size ( TEU/FEU/other)", `${values.cntnrSize || ""} TEU`],
        ["7*", "Maximum permissible weight of container as per the CSC\nplate", `${values.cscPlateMaxWtLimit || ""} ${values.cscPlateMaxWtUom || "KGS"}`],
        ["8*", "Weighbridge registration no. & Address of Weighbridge", weighBridgeInfo],
        ["9*", "Verified gross mass of container (method-1/method-2)", vgmInfo],
        ["10*", "Date and time of weighing", weighingDateTime],
        ["11*", "Weighing slip no.", values.weighBridgeSlipNo || "-"],
        ["12", "Type (Normal/Reefer/Hazardous/others)", cargoTypeDisplay],
        ["13", "If Hazardous  UN NO.IMDG class", hazInfo],
    ];

    // ============ GENERATE TABLE ============
    autoTable(doc, {
        startY: currentY,
        head: [["Sr\nNo.", "Details of information", "Particulars"]],
        body: tableData,
        theme: "grid",
        styles: {
            fontSize: 9,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            textColor: [0, 0, 0],
            halign: "left",
            valign: "middle",
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "center",
            lineWidth: 0.3,
        },
        columnStyles: {
            0: { cellWidth: 15, halign: "center" },
            1: { cellWidth: 90 },
            2: { cellWidth: "auto" },
        },
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Calculate space needed for signature section (approximately 60mm)
    const signatureSectionHeight = 55;
    // Check if we need a new page for signature section
    if (currentY + signatureSectionHeight > pageHeight - 30) {
        doc.addPage();
        currentY = 20;
    }

    // ============ SIGNATURE SECTION ============
    const signatureX = pageWidth - 75;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Signature of authorized person of shipper", signatureX, currentY);
    currentY += 6;

    doc.text(`Name – ${values.authPrsnNm || ""}`, signatureX, currentY);
    currentY += 4;

    // ============ ADD SIGNATURE IMAGE ============
    if (exporter.sign) {
        try {
            const signData = await getImageData(exporter.sign);
            // Calculate dimensions preserving aspect ratio, max width = 50mm, max height = 25mm (smaller)
            const signDims = getScaledDimensions(signData.width, signData.height, 50, 25);
            doc.addImage(signData.base64, "PNG", signatureX, currentY, signDims.width, signDims.height);
            currentY += signDims.height + 3;
        } catch (error) {
            console.warn("Signature image failed for:", exporter.label, error);
            currentY += 15;
        }
    } else {
        currentY += 15;
    }

    // Date
    const currentDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).replace(/\//g, "-");
    doc.text(`Date – ${currentDate}`, signatureX, currentY);
    currentY += 10;

    // Check if remarks section needs new page
    if (currentY + 35 > pageHeight - 30) {
        doc.addPage();
        currentY = 20;
    }

    // ============ REMARKS SECTION ============
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Remarks:", 14, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.text("*Indicates mandatory fields", 14, currentY);
    currentY += 4;
    doc.text("**Shippers not having IEC no. CIN No. may provide information as follows:", 14, currentY);
    currentY += 4;
    doc.text("Company - PAN NO.", 14, currentY);
    currentY += 4;
    doc.text("Individuals", 14, currentY);
    currentY += 4;
    doc.text("Indian National - AADHAR No", 14, currentY);
    currentY += 4;
    doc.text("Foreign National - PASSPORT No & Country of issue of passport.", 14, currentY);

    // ============ ADD FOOTER IMAGE ============
    if (exporter.foot) {
        try {
            const footerData = await getImageData(exporter.foot);
            // Calculate dimensions preserving aspect ratio, max height = 20mm
            const maxFooterWidth = pageWidth - 20;
            const footerDims = getScaledDimensions(footerData.width, footerData.height, maxFooterWidth, 20);
            // Position footer at bottom of page, centered
            const footerX = (pageWidth - footerDims.width) / 2;
            const footerY = pageHeight - footerDims.height - 5;
            doc.addImage(footerData.base64, "PNG", footerX, footerY, footerDims.width, footerDims.height);
        } catch (error) {
            console.warn("Footer image failed for:", exporter.label, error);
        }
    }

    // ============ SAVE PDF ============
    const filename = `VGM_${exporter.label.replace(/\s+/g, "_")}_${values.cntnrNo || "draft"}.pdf`;
    doc.save(filename);

    return filename;
};

export default { generateVGMPdf, EXPORTERS };
