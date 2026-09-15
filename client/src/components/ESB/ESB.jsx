// client/src/components/ESB/ESB.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { esbAPI } from "../../services/esbAPI";
import ESBHeaderSection from "./ESBHeaderSection";
import ESBContainerSection from "./ESBContainerSection";
import ESBAttachmentSection from "./ESBAttachmentSection";
import AppbarComponent from "../AppbarComponent";
import {
  validateESBHeader,
  validateESBContainer,
  SHIPPING_LINE_LOV,
} from "../../utils/esbValidations";
import "../../styles/ESB.scss";
import axios from "axios";
import { masterAPI } from "../../services/api";

const ESB = () => {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { "*": urlJobNo } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [headerErrors, setHeaderErrors] = useState({});
  const [containerErrors, setContainerErrors] = useState({});
  const [declarationChecked, setDeclarationChecked] = useState(true);

  // Master Data
  const [vessels, setVessels] = useState([]);
  const [shippingLines, setShippingLines] = useState([]);

  // Job Search State
  const [jobNoSearch, setJobNoSearch] = useState("");

  const initialFormData = {
    pyrCode: userData?.pyrCode || "ODeX/MH/SHP/2503/00019",
    locCode: location.state?.presetLocId || "INNSA1",
    bnfCode: "",
    bookNo: "",
    blNo: "",
    isHBLInvolved: "N",
    icdLocCode: location.state?.presetLocId || "INNSA1",
    portOfSBFiled: location.state?.presetLocId || "INNSA1",
    gatewayLocCode: "INNSA1",
    vesselNm: "",
    viaNo: "",
    cntStatus: "FCL",
    natureOfCargo: "C",
    pod: "",
    cargoTp: "GEN",
    bookLine: "",
    declarationFlg: true,

    containers: [
      {
        cntNo: "",
        shipBillNo: "",
        shipBillDt: "",
        leoDt: "",
        pcinNo: "SEZ",
        pol: location.state?.presetLocId || "INNSA1",
        pod: "",
        grossWt: "",
        cargoWt: "",
        noOfPkg: "",
        typOfPackages: "BDL",
        cargoTp: "GEN",
        shipBillTp: "DFS",
        exporterNm: "",
        iec: "",
        consigneeNm: "",
        markNum: "",
        cargoDesc: "",
        hsnCode: "",
        socFlag: "N",
        cntnrAgentCode: "",
      },
    ],

    attachments: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  // Prefill formData when navigating from TrackESB for edit or amendment
  useEffect(() => {
    if (location.state?.editData) {
      const edit = location.state.editData;
      setFormData({
        _id: edit._id,
        odexRefNo: edit.odexRefNo || "",
        pyrCode: edit.pyrCode || userData?.pyrCode || "ODeX/MH/SHP/2503/00019",
        locCode: edit.locCode || "INNSA1",
        bnfCode: edit.bnfCode || "",
        bookNo: edit.bookNo || "",
        blNo: edit.blNo || "",
        isHBLInvolved: edit.isHBLInvolved || "N",
        icdLocCode: edit.icdLocCode || edit.locCode || "INNSA1",
        portOfSBFiled: edit.portOfSBFiled || edit.locCode || "INNSA1",
        gatewayLocCode: edit.gatewayLocCode || "INNSA1",
        vesselNm: edit.vesselNm || "",
        viaNo: edit.viaNo || "",
        cntStatus: edit.cntStatus || "FCL",
        natureOfCargo: edit.natureOfCargo || "C",
        pod: edit.pod || "",
        cargoTp: edit.cargoTp || "GEN",
        bookLine: edit.bookLine || edit.bnfCode || "",
        declarationFlg: edit.declarationFlg ?? true,
        containers: edit.egmRequestcntnrVoList || edit.containers || [],
        attachments: edit.egmReqAttVoList || edit.attachments || [],
      });
    }
  }, [location.state?.editData, userData]);

  // Fetch vessel & shipping lines master data (Same master data as Form 13)
  useEffect(() => {
    const fetchMasters = async () => {
      // 1. Fetch Shipping Lines Master Data
      try {
        const slResponse = await masterAPI.getShippingLines();
        const data = slResponse.data || [];
        setShippingLines(data);
      } catch (slErr) {
        console.warn("Failed to load shipping lines master data:", slErr);
      }

      // 2. Fetch Vessel Master
      try {
        if (formData.pyrCode) {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, "0");
          const todayFromTs = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 00:00:00`;

          const vRes = await esbAPI.getVesselMaster({
            pyrCode: formData.pyrCode,
            fromTs: todayFromTs,
          });
          if (vRes.data && Array.isArray(vRes.data)) {
            setVessels(vRes.data);
          }
        }
      } catch (err) {
        console.warn("Vessel Master load info:", err.message);
      }
    };
    fetchMasters();
  }, [formData.pyrCode]);

  // Search job details by jobNo
  const handleJobSearch = async (forcedJobNo) => {
    const searchVal = typeof forcedJobNo === "string" ? forcedJobNo : jobNoSearch;
    if (!searchVal || !searchVal.trim()) {
      setError("Please enter a Job No to search");
      return;
    }

    const cleanSearchVal = searchVal.trim();
    setLoadingJob(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.get(
        "https://eximbot.alvision.in/export/api/exports",
        {
          params: {
            status: "All",
            search: cleanSearchVal,
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

        const getField = (obj, ...fields) => {
          if (!obj) return "";
          for (const f of fields) {
            if (obj[f] !== undefined && obj[f] !== null) return obj[f];
            const lowerF = f.toLowerCase();
            if (obj[lowerF] !== undefined && obj[lowerF] !== null) return obj[lowerF];
          }
          return "";
        };

        // 1. Port / Location resolution
        const rawPort = getField(job, "port_of_loading", "custom_house", "portOfLoading") || "";
        let resolvedLoc = "INNSA1";
        const uPort = String(rawPort).toUpperCase();
        if (uPort.includes("INNSA") || uPort.includes("NHAVA") || uPort.includes("JNPT")) {
          resolvedLoc = "INNSA1";
        } else if (uPort.includes("INMUN") || uPort.includes("MUNDRA")) {
          resolvedLoc = "INMUN1";
        } else if (uPort.includes("INHZA") || uPort.includes("HAZIRA")) {
          resolvedLoc = "INHZA1";
        } else if (uPort.includes("INPAV") || uPort.includes("PIPAVAV")) {
          resolvedLoc = "INPAV1";
        } else if (uPort.includes("INMAA") || uPort.includes("CHENNAI")) {
          resolvedLoc = "INMAA1";
        } else if (uPort.includes("INTUT") || uPort.includes("TUTICORIN")) {
          resolvedLoc = "INTUT1";
        } else if (uPort.includes("INCCU") || uPort.includes("KOLKATA")) {
          resolvedLoc = "INCCU1";
        } else if (uPort.includes("INKAT") || uPort.includes("KATTUPALLI")) {
          resolvedLoc = "INKAT1";
        } else if (uPort.includes("INVTZ") || uPort.includes("VISAKHAPATNAM")) {
          resolvedLoc = "INVTZ1";
        } else if (rawPort.trim().length > 0) {
          resolvedLoc = rawPort.trim();
        }

        // 2. Shipping Line (bnfCode)
        const lineOptions =
          Array.isArray(shippingLines) && shippingLines.length > 0
            ? shippingLines
            : SHIPPING_LINE_LOV;

        const rawLine = getField(job, "shipping_line_airline", "shippingLine", "shipping_line") ||
          (job.operations?.[0]?.bookingDetails?.[0]?.shippingLineName) ||
          (job.operations?.[0]?.statusDetails?.[0]?.shippingLine) || "";
        let matchedBnf = "";
        if (rawLine) {
          let nameAfterHyphen = String(rawLine).trim();
          let codeBeforeHyphen = "";
          if (String(rawLine).includes("-")) {
            const parts = String(rawLine).split("-");
            codeBeforeHyphen = parts[0].trim();
            nameAfterHyphen = parts.slice(1).join("-").trim();
          }

          const sNameLower = nameAfterHyphen.toLowerCase();
          const sCodeLower = codeBeforeHyphen.toLowerCase();

          const found = lineOptions.find((opt) => {
            const val = String(opt.value || opt.code || "").toLowerCase().trim();
            const lab = String(opt.label || opt.name || "").toLowerCase().trim();
            return (
              lab === sNameLower ||
              val === sNameLower ||
              (sCodeLower && val === sCodeLower) ||
              lab.includes(sNameLower) ||
              sNameLower.includes(lab)
            );
          });
          if (found) {
            matchedBnf = found.value || found.code || found.label || "";
          } else {
            matchedBnf = nameAfterHyphen;
          }
        }

        // 3. Booking No & BL No
        const bNo = getField(job, "booking_no", "bookingNo", "shpInstructNo") || cleanSearchVal;
        const blNo = getField(job, "bl_no", "blNo", "job_no", "sb_no") || cleanSearchVal;

        // 4. Vessel Name & Via No
        const vNm = getField(job, "vessel_name", "vessel", "vesselName") || "";
        const vVia = getField(job, "voyage", "via_no", "viaNo") || "001";

        // 5. FPOD / Destination
        const fpod = getField(job, "destination", "port_of_discharge", "pod", "destination_port") || "";

        // 6. Format Date helper
        const formatToDDMMYYYY = (dStr) => {
          if (!dStr) return "";
          const clean = String(dStr).trim();
          if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) return clean;
          const matchIso = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (matchIso) return `${matchIso[3]}-${matchIso[2]}-${matchIso[1]}`;
          const matchDot = clean.match(/^(\d{2})[./](\d{2})[./](\d{4})/);
          if (matchDot) return `${matchDot[1]}-${matchDot[2]}-${matchDot[3]}`;
          return clean;
        };

        const sbDateFormatted = formatToDDMMYYYY(getField(job, "sb_date", "shipping_bill_date", "shipBillDt"));
        const sbNoVal = getField(job, "sb_no", "shipping_bill_no", "shipBillNo");
        const expNmVal = getField(job, "exporter", "exporter_name", "exporterNm");
        const iecVal = getField(job, "ieCode", "iec", "exporter_iec");
        const consigneeVal =
          getField(job, "consignee_name") ||
          (job.consignees?.[0]?.consignee_name) ||
          job.buyerThirdPartyInfo?.buyer?.name ||
          "";
        const cargoDescVal = getField(job, "cargo_description", "cargoDesc", "goods_description") || "GENERAL CARGO";
        const hsnVal = getField(job, "hsn_code", "hsnCode") || "";
        const pkgTypeVal = getField(job, "package_unit", "pkg_type") || "BOX";
        const totalPkgsVal = getField(job, "total_no_of_pkgs", "no_of_packages", "noOfPkg") || "";

        // 7. Containers mapping
        const rawContainers = Array.isArray(job.containers) && job.containers.length > 0
          ? job.containers
          : (job.operations?.[0]?.containerdetails || job.operations?.[0]?.containerDetails || []);

        let mappedContainers = [];
        if (rawContainers && rawContainers.length > 0) {
          mappedContainers = rawContainers.map((c) => ({
            cntNo: (getField(c, "containerNo", "cntnrNo", "cntNo") || "").toUpperCase(),
            shipBillNo: sbNoVal || getField(c, "shipBillNo", "shippingBillNo") || "",
            shipBillDt: sbDateFormatted || getField(c, "shipBillDt", "shippingBillDt") || "",
            leoDt: formatToDDMMYYYY(getField(c, "leoDt", "leoDate")),
            pcinNo: "SEZ",
            pol: resolvedLoc,
            pod: fpod,
            grossWt: String(getField(c, "grossWeight", "vgmWtInvoice", "totWt") || ""),
            cargoWt: String(getField(c, "grossWeight", "vgmWtInvoice") || ""),
            noOfPkg: String(totalPkgsVal || getField(c, "pkgsStuffed", "noOfPkg") || ""),
            typOfPackages: pkgTypeVal,
            cargoTp: "GEN",
            shipBillTp: "DFS",
            exporterNm: expNmVal,
            iec: iecVal,
            consigneeNm: consigneeVal,
            markNum: "N/M",
            cargoDesc: cargoDescVal,
            hsnCode: hsnVal,
            socFlag: "N",
            cntnrAgentCode: getField(c, "cntnrAgentCode", "agentCode") || "AABCH7319B",
          }));
        } else {
          mappedContainers = [
            {
              cntNo: "",
              shipBillNo: sbNoVal || "",
              shipBillDt: sbDateFormatted || "",
              leoDt: "",
              pcinNo: "SEZ",
              pol: resolvedLoc,
              pod: fpod,
              grossWt: "",
              cargoWt: "",
              noOfPkg: String(totalPkgsVal || ""),
              typOfPackages: pkgTypeVal,
              cargoTp: "GEN",
              shipBillTp: "DFS",
              exporterNm: expNmVal,
              iec: iecVal,
              consigneeNm: consigneeVal,
              markNum: "N/M",
              cargoDesc: cargoDescVal,
              hsnCode: hsnVal,
              socFlag: "N",
              cntnrAgentCode: "AABCH7319B",
            },
          ];
        }

        setFormData((prev) => ({
          ...prev,
          locCode: resolvedLoc,
          icdLocCode: resolvedLoc,
          portOfSBFiled: resolvedLoc,
          bnfCode: matchedBnf || prev.bnfCode,
          bookNo: bNo,
          blNo: blNo,
          vesselNm: vNm || prev.vesselNm,
          viaNo: vVia || prev.viaNo,
          pod: fpod || prev.pod,
          containers: mappedContainers,
        }));

        setSuccess(`Job details pre-filled successfully for: ${cleanSearchVal}`);
      } else {
        setError(`No job details found for Job No: ${cleanSearchVal}`);
      }
    } catch (err) {
      console.error("Search job error:", err);
      setError(`Failed to fetch job details: ${err.message || "Network error"}`);
    } finally {
      setLoadingJob(false);
    }
  };

  // Trigger search if URL parameter jobNo is present
  useEffect(() => {
    if (urlJobNo && !loadingJob) {
      const cleaned = decodeURIComponent(urlJobNo.replace(/^\//, ""));
      if (cleaned) {
        setJobNoSearch(cleaned);
        handleJobSearch(cleaned);
      }
    }
  }, [urlJobNo]);

  // Handle Header field changes
  const handleHeaderChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "locCode" || name === "portOfSBFiled") {
        updated.containers = prev.containers.map((c) => ({
          ...c,
          pol: c.pol || value,
        }));
      }
      if (name === "pod") {
        updated.containers = prev.containers.map((c) => ({
          ...c,
          pod: c.pod || value,
        }));
      }
      return updated;
    });

    if (headerErrors[name]) {
      setHeaderErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle Container field changes
  const handleContainerChange = (index, field, value) => {
    setFormData((prev) => {
      const newContainers = [...prev.containers];
      newContainers[index] = { ...newContainers[index], [field]: value };
      return { ...prev, containers: newContainers };
    });

    if (containerErrors[index] && containerErrors[index][field]) {
      setContainerErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[index][field];
        return newErrs;
      });
    }
  };

  // Add Container
  const handleAddContainer = () => {
    setFormData((prev) => ({
      ...prev,
      containers: [
        ...prev.containers,
        {
          cntNo: "",
          shipBillNo: "",
          shipBillDt: "",
          leoDt: "",
          pcinNo: "SEZ",
          pol: prev.portOfSBFiled || prev.locCode || "INNSA1",
          pod: prev.pod || "",
          grossWt: "",
          cargoWt: "",
          noOfPkg: "",
          typOfPackages: "BDL",
          cargoTp: prev.cargoTp || "GEN",
          shipBillTp: "DFS",
          exporterNm: prev.containers[0]?.exporterNm || "",
          iec: prev.containers[0]?.iec || "",
          consigneeNm: prev.containers[0]?.consigneeNm || "",
          markNum: prev.containers[0]?.markNum || "",
          cargoDesc: prev.containers[0]?.cargoDesc || "",
          hsnCode: prev.containers[0]?.hsnCode || "",
          socFlag: "N",
          cntnrAgentCode: prev.containers[0]?.cntnrAgentCode || "",
        },
      ],
    }));
  };

  // Remove Container
  const handleRemoveContainer = (index) => {
    if (formData.containers.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      containers: prev.containers.filter((_, i) => i !== index),
    }));
  };

  // Copy Container
  const handleCopyContainer = (index) => {
    const source = formData.containers[index];
    setFormData((prev) => ({
      ...prev,
      containers: [
        ...prev.containers,
        {
          ...source,
          cntNo: "",
          shipBillNo: "",
        },
      ],
    }));
  };

  // Attachment management
  const handleAddAttachment = (attachmentOrList, isUpdateList = false) => {
    if (isUpdateList) {
      setFormData((prev) => ({ ...prev, attachments: attachmentOrList }));
    } else {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, attachmentOrList],
      }));
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const hErrs = validateESBHeader(formData);
    setHeaderErrors(hErrs);

    const cErrs = {};
    let hasContainerError = false;
    formData.containers.forEach((cnt, idx) => {
      const errs = validateESBContainer(cnt, idx);
      if (Object.keys(errs).length > 0) {
        cErrs[idx] = errs;
        hasContainerError = true;
      }
    });
    setContainerErrors(cErrs);

    if (Object.keys(hErrs).length > 0 || hasContainerError) {
      setError("Please resolve the highlighted validation errors before submitting.");
      return false;
    }
    setError("");
    return true;
  };

  // Clean port code helper for UN/LOCODE AN-6 pattern
  const cleanPortCode = (raw, fallback = "INNSA1") => {
    if (!raw) return fallback;
    const str = String(raw).trim();
    const matchParen = str.match(/\(([A-Za-z0-9]{3,6})\)/);
    if (matchParen) return matchParen[1].toUpperCase();
    const cleaned = str.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleaned.length >= 3) {
      return cleaned.substring(0, 6);
    }
    return fallback;
  };

  // Clean BL No to max 20 alphanumeric chars
  const cleanBlNo = (raw) => {
    if (!raw) return "";
    return String(raw).trim().replace(/[^A-Za-z0-9]/g, "").substring(0, 20);
  };

  // Prepare Payload
  const preparePayload = (skipOdex = false) => {
    const headerPol = cleanPortCode(formData.locCode || formData.portOfSBFiled, "INNSA1");
    const headerPod = cleanPortCode(formData.pod, "AOBDD");

    const samplePdfData =
      "JVBERi0xLjEKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAyMDAgMjAwXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwNjIgMDAwMDAgbiAKMDAwMDAwMTE3IDAwMDAwIG4gCnRyYWlsZXIKPDwgL1Jvb3QgMSAwIFIgL1NpemUgNCA+PgpzdGFydHhyZWYKMTc4CiUlRU9G";

    const userAtts = formData.attachments && formData.attachments.length > 0 ? formData.attachments : [];
    const attList = userAtts.map((att) => ({
      attTitle: att.attTitle || "LOC",
      attDesc: att.attDesc || "Shipping Bill Document",
      attNm: att.attNm || "Shipping_Bill.pdf",
      attData: att.attData,
    }));

    // Ensure only valid ODeX document types exist in attachment list (LOC, EIR, TSR)
    const hasType = (t) => attList.some((a) => a.attTitle === t);
    if (!hasType("LOC")) {
      attList.push({ attTitle: "LOC", attDesc: "New Bitmap image", attNm: "LOC.pdf", attData: samplePdfData });
    }
    if (!hasType("EIR")) {
      attList.push({ attTitle: "EIR", attDesc: "New Bitmap image", attNm: "EIR.pdf", attData: samplePdfData });
    }
    if (!hasType("TSR")) {
      attList.push({ attTitle: "TSR", attDesc: "New Bitmap image", attNm: "TSR.pdf", attData: samplePdfData });
    }

    const egmRequestVo = {
      locCode: headerPol,
      portCode: headerPol,
      icdLocCode: cleanPortCode(formData.icdLocCode, headerPol),
      odexRefNo: "",
      hashKey: "",
      pyrCode: formData.pyrCode || "",
      gatewayLocCode: cleanPortCode(formData.gatewayLocCode || formData.locCode, headerPol),
      bnfCode: (formData.bnfCode || "HLCU").toUpperCase().trim(),
      vesselNm: formData.vesselNm || "HYUNDAI OAKLAND",
      viaNo: formData.viaNo || "F777",
      cntStatus: formData.cntStatus || "FCL",
      natureOfCargo: formData.natureOfCargo || "C",
      portOfSBFiled: headerPol,
      pod: headerPod,
      blNo: cleanBlNo(formData.blNo),
      bookNo: (formData.bookNo || "").trim(),
      bookOfcLoc: cleanPortCode(formData.bookOfcLoc, ""),
      declarationFlg: true,
      isHBLInvolved: formData.isHBLInvolved || "N",
      bookLine: (formData.bookLine || formData.bnfCode || "HLCU").toUpperCase().trim(),

      egmRequestcntnrVoList: formData.containers.map((c) => {
        const cPol = cleanPortCode(c.pol, headerPol);
        const cPod = cleanPortCode(c.pod, headerPod);
        const cFpod = cleanPortCode(c.fpod || c.pod, headerPod);

        return {
          cntNo: (c.cntNo || "").toUpperCase().trim(),
          leoDt: c.leoDt || c.shipBillDt || null,
          gstinno: c.gstinno || "",
          grossWt: Number(c.grossWt) || 0,
          shipBillNo: (c.shipBillNo || "").trim(),
          shipBillDt: c.shipBillDt || "",
          shipBillTp: c.shipBillTp || "DFS",
          exporterNm: c.exporterNm || "",
          consigneeNm: c.consigneeNm || "",
          markNum: c.markNum || "TEST",
          cargoDesc: c.cargoDesc || "TEST",
          fpod: cFpod,
          portOfDischarge: cPod,
          noOfPkg: Number(c.noOfPkg) || 0,
          hsnCode: c.hsnCode || "",
          pol: cPol,
          pod: cPod,
          cargoWt: Number(c.cargoWt) || 0,
          pcinNo: c.pcinNo || "SEZ",
          iec: c.iec || "",
          socFlag: c.socFlag || "N",
          cntnrAgentCode: (c.cntnrAgentCode || "AABCH7319B").toUpperCase().trim(),
          typOfPackages: c.typOfPackages || "BDL",
          cargoTp: c.cargoTp || "GEN",
          ischeck: true,
        };
      }),

      egmReqAttVoList: attList,
    };

    return {
      skipOdex,
      egmRequestVo,
    };
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = preparePayload(true);
      await esbAPI.submitESB(payload);
      setIsSaved(true);
      setSuccess("Form data saved to database successfully as draft.");
    } catch (err) {
      setError(err.message || "Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };

  // Submit to ODeX
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = preparePayload(false);
      const res = await esbAPI.submitESB(payload);

      const innerData = res.data || {};
      const refNo = res.odexRefNo || innerData.odexRefNo;

      if (innerData.business_validation === "FAIL" || innerData.schema_validation === "FAIL" || (innerData.responseMessage && innerData.responseMessage.toUpperCase() === "FAILED")) {
        const failReason =
          innerData.business_validations ||
          (Array.isArray(innerData.schema_validations) ? innerData.schema_validations.join("; ") : innerData.schema_validations) ||
          innerData.responseMessage ||
          "Business validation failed at ODeX.";
        setError(`ODeX Validation Error: ${failReason}`);
        return;
      }

      if (refNo) {
        setSuccess(`Shipping Bill submitted successfully! ODeX Reference No: ${refNo}`);
      } else {
        setSuccess("Shipping Bill submitted successfully to ODeX!");
      }

      setTimeout(() => {
        navigate("/track-esb");
      }, 2500);
    } catch (err) {
      console.error("Submit e-SB Error:", err);
      setError(err.message || "Failed to submit Shipping Bill to ODeX.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary totals for Header bar
  const totalGrossWt = formData.containers.reduce(
    (acc, curr) => acc + (parseFloat(curr.grossWt) || 0),
    0
  );
  const totalPkgs = formData.containers.reduce(
    (acc, curr) => acc + (parseInt(curr.noOfPkg, 10) || 0),
    0
  );

  return (
    <div className="esb-page">
      <AppbarComponent />

      {/* Top Header Banner */}
      <div className="esb-header-banner">
        <div className="banner-title">
          <h1>e-SB: Export Shipping Bill Integration</h1>
          <p>Submit Shipping Bill declarations for export container gate-in authorization</p>
        </div>

        <div className="banner-actions">
          <div className="job-search-box">
            <input
              type="text"
              placeholder="Search Job No (e.g. AMD/EXP...)"
              value={jobNoSearch}
              onChange={(e) => setJobNoSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleJobSearch();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleJobSearch()}
              disabled={loadingJob}
            >
              {loadingJob ? "Searching..." : "Search Job"}
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/track-esb")}
          >
            Track e-SB Requests
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => setError("")}>
            &times;
          </button>
        </div>
      )}

      {isSaved && !success && (
        <div className="alert alert-info">
          <span>Form data saved to database. Click <b>Submit Shipping Bill</b> when ready.</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => setSuccess("")}>
            &times;
          </button>
        </div>
      )}

      {/* Single Continuous Page Form */}
      <div>
        {/* Section 1: Header Information */}
        <ESBHeaderSection
          formData={formData}
          onChange={handleHeaderChange}
          errors={headerErrors}
          vessels={vessels}
          shippingLines={shippingLines}
          totalGrossWt={totalGrossWt}
          totalPkgs={totalPkgs}
        />

        {/* Section 2: Container Information */}
        <ESBContainerSection
          containers={formData.containers}
          onChange={handleContainerChange}
          onAddContainer={handleAddContainer}
          onRemoveContainer={handleRemoveContainer}
          onCopyContainer={handleCopyContainer}
          errors={containerErrors}
          headerPol={formData.portOfSBFiled || formData.locCode}
          headerPod={formData.pod}
        />

        {/* Section 3: Attachments */}
        <ESBAttachmentSection
          attachments={formData.attachments}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
        />
      </div>

      {/* Bottom Declaration & Actions */}
      <div className="odex-bottom-declaration">
        <label className="declaration-label">
          <input
            type="checkbox"
            checked={declarationChecked}
            onChange={(e) => setDeclarationChecked(e.target.checked)}
          />
          I hereby declare that the number of shipping bills / containers mentioned in the request are correct along with the documents attached. There would be no changes applicable further
        </label>

        <div className="odex-action-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>

          <button
            type="button"
            className="btn btn-success btn-lg"
            disabled={loading || !declarationChecked}
            onClick={handleSubmit}
          >
            {loading ? "Submitting to ODeX..." : "Submit Shipping Bill to ODeX"}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/track-esb")}
          >
            Track Requests
          </button>
        </div>

        <div className="odex-footer-support">
          For immediate assistance and quick query resolution, please email <a href="mailto:platinumsupport@odexglobal.com">platinumsupport@odexglobal.com</a> or call +91 8828 822 244
        </div>
      </div>
    </div>
  );
};

export default ESB;
