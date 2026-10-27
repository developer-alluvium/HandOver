// client/src/components/ESB/ESBHeaderSection.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  CONTAINER_STATUS_LOV,
  NATURE_OF_CARGO_LOV,
  CARGO_TYPE_LOV,
  SHIPPING_LINE_LOV,
} from "../../utils/esbValidations";
import { masterData } from "../../data/masterData";
import { masterAPI } from "../../services/api";
import CustomAutocomplete from "../common/CustomAutocomplete";

const ESBHeaderSection = ({
  formData,
  onChange,
  errors = {},
  vessels = [],
  shippingLines = [],
  readOnly = false,
  totalGrossWt = 0,
  totalPkgs = 0,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const ports = masterData.portIds || [];

  const portOptions = useMemo(() => {
    return ports.map((p) => ({
      value: p.value,
      label: `${p.value} - ${p.label}`,
    }));
  }, [ports]);

  // Dynamic FPOD options via API search
  const [fpodOptions, setFpodOptions] = useState([]);
  const [fpodLoading, setFpodLoading] = useState(false);
  const [fpodSearch, setFpodSearch] = useState("");

  useEffect(() => {
    let active = true;
    const fetchFpods = async (searchTerm) => {
      try {
        setFpodLoading(true);
        const res = await masterAPI.getFpodCodes(searchTerm);
        if (active && res && res.data) {
          const options = (res.data || []).map((item) => ({
            value: item.PORT_CODE,
            label: `${item.PORT_CODE} - ${item.PORT_NAME}`,
          }));
          setFpodOptions(options);
        }
      } catch (e) {
        // Fallback silently
      } finally {
        if (active) setFpodLoading(false);
      }
    };
    fetchFpods(fpodSearch);
    return () => {
      active = false;
    };
  }, [fpodSearch]);

  const allFpodOptions = useMemo(() => {
    const combined = [...fpodOptions];
    const seen = new Set(combined.map((o) => o.value));
    for (const p of portOptions) {
      if (!seen.has(p.value)) {
        seen.add(p.value);
        combined.push(p);
      }
    }
    return combined;
  }, [fpodOptions, portOptions]);

  // 1. Dynamically Filter Shipping Line Options according to Selected Vessel
  const filteredLineOptions = useMemo(() => {
    const rawLines =
      Array.isArray(shippingLines) && shippingLines.length > 0
        ? shippingLines.map((sl) => ({
            value: sl.code || sl.bnfCode || sl.value,
            label: `${sl.code || sl.bnfCode || sl.value} - ${sl.name || sl.bnfName || sl.label || sl.code}`,
          }))
        : SHIPPING_LINE_LOV;

    // Build combined list ensuring default LOVs (e.g. ARKU, MSCU) are available
    const combined = [...rawLines];
    const seen = new Set(combined.map((l) => (l.value || "").toUpperCase().trim()));
    for (const def of SHIPPING_LINE_LOV) {
      const defVal = (def.value || "").toUpperCase().trim();
      if (!seen.has(defVal)) {
        seen.add(defVal);
        combined.push(def);
      }
    }

    // Ensure currently selected or prefilled formData.bnfCode is always preserved
    if (formData.bnfCode) {
      const bnf = formData.bnfCode.toUpperCase().trim();
      if (!seen.has(bnf)) {
        seen.add(bnf);
        combined.unshift({
          value: formData.bnfCode,
          label: `${formData.bnfCode} - ${formData.bnfCode}`,
        });
      }
    }

    if (formData.vesselNm && Array.isArray(vessels) && vessels.length > 0) {
      const selectedV = (formData.vesselNm || "").toUpperCase().trim();
      const matchingVesselObjs = vessels.filter(
        (v) => (v.vesselNm || v.vesselName || "").toUpperCase().trim() === selectedV
      );

      const validBnfCodes = new Set(
        matchingVesselObjs
          .map((v) => (v.bnfCode || "").toUpperCase().trim())
          .filter(Boolean)
      );

      if (validBnfCodes.size > 0) {
        const matchedLines = combined.filter((l) => {
          const val = (l.value || "").toUpperCase().trim();
          return validBnfCodes.has(val) || (formData.bnfCode && val === formData.bnfCode.toUpperCase().trim());
        });
        if (matchedLines.length > 0) {
          return matchedLines;
        }
      }
    }

    return combined;
  }, [shippingLines, vessels, formData.vesselNm, formData.bnfCode]);

  // 2. Dynamically Filter Vessel Options according to Selected Shipping Line & Port Location
  const filteredVessels = useMemo(() => {
    if (!Array.isArray(vessels) || vessels.length === 0) return [];
    let list = vessels;

    if (formData.locCode) {
      const loc = formData.locCode.toUpperCase().trim();
      const locMatched = list.filter(
        (v) => !v.locId || v.locId.toUpperCase().trim() === loc
      );
      if (locMatched.length > 0) {
        list = locMatched;
      }
    }

    if (formData.bnfCode) {
      const bnf = formData.bnfCode.toUpperCase().trim();
      const bnfMatched = list.filter(
        (v) => !v.bnfCode || v.bnfCode.toUpperCase().trim() === bnf
      );
      if (bnfMatched.length > 0) {
        list = bnfMatched;
      }
    }

    const unique = [];
    const seen = new Set();
    for (const v of list) {
      const name = (v.vesselNm || v.vesselName || "").trim();
      const via = (v.viaNo || "").trim();
      const key = `${name.toUpperCase()}_${via.toUpperCase()}`;
      if (name && !seen.has(key)) {
        seen.add(key);
        unique.push(v);
      }
    }

    return unique.sort((a, b) =>
      (a.vesselNm || a.vesselName || "").localeCompare(b.vesselNm || b.vesselName || "")
    );
  }, [vessels, formData.locCode, formData.bnfCode]);

  const vesselOptions = useMemo(() => {
    return filteredVessels.map((v) => ({
      value: v.vesselNm || v.vesselName,
      label: `${v.vesselNm || v.vesselName}${v.viaNo ? ` (Via: ${v.viaNo})` : ""}${v.bnfCode ? ` [${v.bnfCode}]` : ""}`,
      raw: v,
    }));
  }, [filteredVessels]);

  return (
    <div className="esb-panel">
      {/* Header Bar with Title and Summary Counters */}
      <div className="panel-header-bar">
        <h2 className="section-title">1. Header Information (General Details)</h2>
        <div className="summary-counters">
          <div className="counter-item">
            <span className="counter-label">Total Gross Wt(Kgs)</span>
            <span className="counter-value">{Number(totalGrossWt).toFixed(2)}</span>
          </div>
          <div className="counter-item">
            <span className="counter-label">Total Packages</span>
            <span className="counter-value">{totalPkgs}</span>
          </div>
        </div>
      </div>

      {/* Upload Helper Banner */}
      <div className="odex-upload-helper">
        <button type="button" className="btn-upload-sb">
          📁 Upload SB/LEO file
        </button>
        <span className="upload-note-link">
          Click Here to Upload .SB/LEO Copy to reduce Manual Data Entry
        </span>
      </div>

      {/* 3-Column Compact Form Grid */}
      <div className="header-form-grid">
        {/* COLUMN 1 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Sea / Port */}
          <div className="form-group">
            <label>
              Sea / Port Code <span className="required">*</span>
            </label>
            <CustomAutocomplete
              variant="boxed"
              options={portOptions}
              value={formData.locCode || ""}
              placeholder="-- Select Port --"
              disabled={readOnly}
              error={!!errors.locCode}
              onChange={(val) => {
                onChange("locCode", val);
                if (!formData.icdLocCode) onChange("icdLocCode", val);
                if (!formData.portOfSBFiled) onChange("portOfSBFiled", val);
              }}
            />
            {errors.locCode && <span className="error-text">{errors.locCode}</span>}
          </div>

          {/* BL No. */}
          <div className="form-group">
            <label>
              BL No. <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.blNo ? "error" : ""}`}
              name="blNo"
              value={formData.blNo || ""}
              maxLength={20}
              disabled={readOnly}
              onChange={handleChange}
              placeholder="e.g. AMD/EXP/SEA/01058/26"
            />
            {errors.blNo && <span className="error-text">{errors.blNo}</span>}
          </div>

          {/* SB Processed Location */}
          <div className="form-group">
            <label>
              SB Processed Location <span className="required">*</span>
            </label>
            <CustomAutocomplete
              variant="boxed"
              options={portOptions}
              value={formData.portOfSBFiled || ""}
              placeholder="-- Select Location --"
              disabled={readOnly}
              error={!!errors.portOfSBFiled}
              onChange={(val) => onChange("portOfSBFiled", val)}
            />
            {errors.portOfSBFiled && <span className="error-text">{errors.portOfSBFiled}</span>}
          </div>

          {/* Via No. */}
          <div className="form-group">
            <label>
              Via No. / Voyage <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.viaNo ? "error" : ""}`}
              name="viaNo"
              value={formData.viaNo || ""}
              disabled={readOnly}
              onChange={handleChange}
              placeholder="e.g. 001"
            />
            {errors.viaNo && <span className="error-text">{errors.viaNo}</span>}
          </div>
        </div>

        {/* COLUMN 2 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Shipping Line */}
          <div className="form-group">
            <label>
              Shipping Line (Beneficiary) <span className="required">*</span>
            </label>
            <CustomAutocomplete
              variant="boxed"
              options={filteredLineOptions}
              value={formData.bnfCode || ""}
              placeholder="-- Select Shipping Line --"
              freeSolo={true}
              disabled={readOnly}
              error={!!errors.bnfCode}
              onChange={(selectedBnf) => {
                onChange("bnfCode", selectedBnf);
                onChange("bookLine", selectedBnf);

                if (selectedBnf && formData.vesselNm && Array.isArray(vessels)) {
                  const isVesselValidForLine = vessels.some(
                    (v) =>
                      (v.vesselNm || v.vesselName) === formData.vesselNm &&
                      (!v.bnfCode || v.bnfCode.toUpperCase() === selectedBnf.toUpperCase())
                  );
                  if (!isVesselValidForLine) {
                    onChange("vesselNm", "");
                    onChange("viaNo", "");
                  }
                }
              }}
            />
            {errors.bnfCode && <span className="error-text">{errors.bnfCode}</span>}
          </div>

          {/* Is HBL Involved? */}
          <div className="form-group">
            <label>
              Is HBL Involved? <span className="required">*</span>
            </label>
            <CustomAutocomplete
              variant="boxed"
              options={[
                { value: "N", label: "No (Straight/Direct MBL)" },
                { value: "Y", label: "Yes (House BL Involved)" },
              ]}
              value={formData.isHBLInvolved || "N"}
              placeholder="Is HBL Involved?"
              disabled={readOnly}
              onChange={(val) => onChange("isHBLInvolved", val || "N")}
            />
          </div>

          {/* Booking Office Location */}
          <div className="form-group">
            <label>
              Booking Office Location {formData.bnfCode === "MSCU" && <span className="required">*</span>}
            </label>
            <input
              type="text"
              className={`form-control ${errors.gatewayLocCode ? "error" : ""}`}
              name="gatewayLocCode"
              value={formData.gatewayLocCode || ""}
              disabled={readOnly}
              onChange={handleChange}
              placeholder="Mandatory for MSC (e.g. INNSA1)"
            />
            {errors.gatewayLocCode && <span className="error-text">{errors.gatewayLocCode}</span>}
          </div>

          {/* Container Status */}
          <div className="form-group">
            <label>
              Container Status <span className="required">*</span>
            </label>
            <CustomAutocomplete
              variant="boxed"
              options={CONTAINER_STATUS_LOV}
              value={formData.cntStatus || "FCL"}
              placeholder="Select Container Status"
              disabled={readOnly}
              error={!!errors.cntStatus}
              onChange={(val) => onChange("cntStatus", val || "FCL")}
            />
            {errors.cntStatus && <span className="error-text">{errors.cntStatus}</span>}
          </div>
        </div>

        {/* COLUMN 3 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Booking No. */}
          <div className="form-group">
            <label>
              Booking No. <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.bookNo ? "error" : ""}`}
              name="bookNo"
              value={formData.bookNo || ""}
              maxLength={20}
              disabled={readOnly}
              onChange={handleChange}
              placeholder="e.g. BOOK015"
            />
            {errors.bookNo && <span className="error-text">{errors.bookNo}</span>}
          </div>

          {/* Booking Origin (ICD/Port) */}
          <div className="form-group">
            <label>
              Booking Origin (ICD/Port) <span className="required">*</span>
            </label>
            <CustomAutocomplete
              variant="boxed"
              options={portOptions}
              value={formData.icdLocCode || ""}
              placeholder="-- Select Origin --"
              disabled={readOnly}
              error={!!errors.icdLocCode}
              onChange={(val) => onChange("icdLocCode", val)}
            />
            {errors.icdLocCode && <span className="error-text">{errors.icdLocCode}</span>}
          </div>

          {/* Vessel Name */}
          <div className="form-group">
            <label>
              Vessel Name <span className="required">*</span>
              <span
                className="sub-link"
                onClick={() => {
                  onChange("vesselNm", "");
                  onChange("viaNo", "");
                }}
              >
                Click here if Vessel Not Found
              </span>
            </label>
            <CustomAutocomplete
              variant="boxed"
              options={vesselOptions}
              value={formData.vesselNm || ""}
              placeholder="Search or enter vessel name..."
              disabled={readOnly}
              error={!!errors.vesselNm}
              freeSolo={true}
              onChange={(selectedVal, rawOpt) => {
                onChange("vesselNm", selectedVal);
                if (rawOpt && rawOpt.raw) {
                  const matchedV = rawOpt.raw;
                  if (matchedV.viaNo) onChange("viaNo", matchedV.viaNo);
                  if (matchedV.bnfCode && !formData.bnfCode) {
                    onChange("bnfCode", matchedV.bnfCode.toUpperCase());
                    onChange("bookLine", matchedV.bnfCode.toUpperCase());
                  }
                } else if (selectedVal && Array.isArray(vessels)) {
                  const matchedVessels = vessels.filter(
                    (v) => (v.vesselNm || v.vesselName) === selectedVal
                  );
                  if (matchedVessels.length > 0) {
                    const matchedV =
                      matchedVessels.find(
                        (v) =>
                          formData.bnfCode &&
                          v.bnfCode &&
                          v.bnfCode.toUpperCase() === formData.bnfCode.toUpperCase()
                      ) || matchedVessels[0];

                    if (matchedV.viaNo) onChange("viaNo", matchedV.viaNo);
                    if (matchedV.bnfCode && !formData.bnfCode) {
                      onChange("bnfCode", matchedV.bnfCode.toUpperCase());
                      onChange("bookLine", matchedV.bnfCode.toUpperCase());
                    }
                  }
                }
              }}
            />
            {errors.vesselNm && <span className="error-text">{errors.vesselNm}</span>}
          </div>

          {/* FPOD */}
          <div className="form-group">
            <label>
              FPOD (Final Port of Discharge) <span className="required">*</span>
            </label>
            <CustomAutocomplete
              variant="boxed"
              options={allFpodOptions}
              value={formData.pod || ""}
              placeholder="Search or enter FPOD (e.g. AOBDD, AQABA)..."
              disabled={readOnly}
              error={!!errors.pod}
              freeSolo={true}
              loading={fpodLoading}
              onInputChange={(txt) => setFpodSearch(txt)}
              onChange={(val) => onChange("pod", val)}
            />
            {errors.pod && <span className="error-text">{errors.pod}</span>}
          </div>

          {/* Nature of Cargo */}
          <div className="form-group">
            <label>
              Nature of Cargo <span className="required">*</span>
            </label>
            <CustomAutocomplete
              variant="boxed"
              options={NATURE_OF_CARGO_LOV}
              value={formData.natureOfCargo || "C"}
              placeholder="Select Nature of Cargo"
              disabled={readOnly}
              error={!!errors.natureOfCargo}
              onChange={(val) => onChange("natureOfCargo", val || "C")}
            />
            {errors.natureOfCargo && <span className="error-text">{errors.natureOfCargo}</span>}
          </div>
        </div>
      </div>

      {/* Red Guidance Notice Box */}
      <div className="odex-notice-box">
        Requesting customers to update the MBL Number in the BL Number Field if shipment has straight/Direct BL . In case of HBL Involved requesting to add the HBL Number in the BL Number Field.
      </div>
    </div>
  );
};

export default ESBHeaderSection;

