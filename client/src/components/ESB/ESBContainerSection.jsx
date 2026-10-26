// client/src/components/ESB/ESBContainerSection.jsx
import React, { useRef } from "react";
import {
  CARGO_TYPE_LOV,
  SHIP_BILL_TYPE_LOV,
  PACKAGE_TYPE_LOV,
} from "../../utils/esbValidations";
import CustomAutocomplete from "../common/CustomAutocomplete";

const ESBDateField = ({
  value,
  onChange,
  className,
  placeholder = "DD-MM-YYYY",
  disabled = false,
}) => {
  const dateInputRef = useRef(null);

  const formatToISO = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[2].length === 4) {
      const [d, m, y] = parts;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return "";
  };

  const handlePickerChange = (e) => {
    const isoVal = e.target.value;
    if (!isoVal) return;
    const [y, m, d] = isoVal.split("-");
    onChange(`${d}-${m}-${y}`);
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        try {
          dateInputRef.current.showPicker();
        } catch (err) {
          dateInputRef.current.click();
        }
      } else {
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        className={className}
        value={value || ""}
        disabled={disabled}
        placeholder={placeholder}
        onDoubleClick={handleDoubleClick}
        onChange={(e) => onChange(e.target.value)}
        title="Double click to open date picker"
      />
      <input
        ref={dateInputRef}
        type="date"
        value={formatToISO(value)}
        onChange={handlePickerChange}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
    </div>
  );
};

const ESBContainerSection = ({
  containers = [],
  onChange,
  onAddContainer,
  onRemoveContainer,
  onCopyContainer,
  errors = {},
  readOnly = false,
  headerPol = "",
  headerPod = "",
}) => {
  const handleContainerChange = (index, field, value) => {
    onChange(index, field, value);
  };

  return (
    <div className="esb-panel">
      <div className="panel-header-bar">
        <h2 className="section-title">2. Container Details ({containers.length})</h2>
        {!readOnly && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onAddContainer}
          >
            + Add Container
          </button>
        )}
      </div>

      {containers.map((container, index) => {
        const cntErrors = errors[index] || {};

        return (
          <div key={index} className="container-card">
            <div className="card-header-bar">
              <div className="card-title">
                <span>
                  Container #{index + 1}:{" "}
                  {container.cntNo ? container.cntNo.toUpperCase() : "New Container"}
                </span>
                {container.shipBillNo && (
                  <span className="badge badge-blue">
                    SB: {container.shipBillNo}
                  </span>
                )}
              </div>
              {!readOnly && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {onCopyContainer && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      title="Copy Container Data"
                      onClick={() => onCopyContainer(index)}
                    >
                      Copy
                    </button>
                  )}
                  {containers.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      title="Remove Container"
                      onClick={() => onRemoveContainer(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="card-body">
              <div className="container-form-grid">
                {/* Container No */}
                <div className="form-group">
                  <label>
                    Container No. <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.cntNo ? "error" : ""}`}
                    value={container.cntNo || ""}
                    maxLength={11}
                    disabled={readOnly}
                    placeholder="e.g. YNZE1000001"
                    onChange={(e) =>
                      handleContainerChange(
                        index,
                        "cntNo",
                        e.target.value.toUpperCase()
                      )
                    }
                  />
                  {cntErrors.cntNo && (
                    <span className="error-text">{cntErrors.cntNo}</span>
                  )}
                </div>

                {/* Shipping Bill No */}
                <div className="form-group">
                  <label>
                    Shipping Bill No. <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.shipBillNo ? "error" : ""}`}
                    value={container.shipBillNo || ""}
                    maxLength={7}
                    disabled={readOnly}
                    placeholder="e.g. SB74533"
                    onChange={(e) =>
                      handleContainerChange(index, "shipBillNo", e.target.value)
                    }
                  />
                  {cntErrors.shipBillNo && (
                    <span className="error-text">{cntErrors.shipBillNo}</span>
                  )}
                </div>

                {/* Shipping Bill Date */}
                <div className="form-group">
                  <label>
                    Shipping Bill Date (DD-MM-YYYY) <span className="required">*</span>
                  </label>
                  <ESBDateField
                    className={`form-control ${cntErrors.shipBillDt ? "error" : ""}`}
                    value={container.shipBillDt || ""}
                    disabled={readOnly}
                    placeholder="DD-MM-YYYY (Double-click for picker)"
                    onChange={(val) =>
                      handleContainerChange(index, "shipBillDt", val)
                    }
                  />
                  {cntErrors.shipBillDt && (
                    <span className="error-text">{cntErrors.shipBillDt}</span>
                  )}
                </div>

                {/* LEO Date */}
                <div className="form-group">
                  <label>LEO Date (DD-MM-YYYY)</label>
                  <ESBDateField
                    className={`form-control ${cntErrors.leoDt ? "error" : ""}`}
                    value={container.leoDt || ""}
                    disabled={readOnly}
                    placeholder="DD-MM-YYYY (Double-click for picker)"
                    onChange={(val) =>
                      handleContainerChange(index, "leoDt", val)
                    }
                  />
                  {cntErrors.leoDt && (
                    <span className="error-text">{cntErrors.leoDt}</span>
                  )}
                </div>

                {/* PCIN Number */}
                <div className="form-group">
                  <label>PCIN Number</label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.pcinNo ? "error" : ""}`}
                    value={container.pcinNo || ""}
                    maxLength={20}
                    disabled={readOnly}
                    placeholder="MANUAL / SEZ allowed"
                    onChange={(e) =>
                      handleContainerChange(index, "pcinNo", e.target.value)
                    }
                  />
                  {cntErrors.pcinNo ? (
                    <span className="error-text">{cntErrors.pcinNo}</span>
                  ) : (
                    <span className="help-text">MANUAL or SEZ allowed</span>
                  )}
                </div>

                {/* POL */}
                <div className="form-group">
                  <label>
                    POL (SB Processed Loc) <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.pol ? "error" : ""}`}
                    value={container.pol || headerPol || ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "pol", e.target.value)
                    }
                  />
                  {cntErrors.pol && (
                    <span className="error-text">{cntErrors.pol}</span>
                  )}
                </div>

                {/* POD */}
                <div className="form-group">
                  <label>
                    POD (FPOD) <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.pod ? "error" : ""}`}
                    value={container.pod || headerPod || ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "pod", e.target.value)
                    }
                  />
                  {cntErrors.pod && (
                    <span className="error-text">{cntErrors.pod}</span>
                  )}
                </div>

                {/* Gross Weight */}
                <div className="form-group">
                  <label>
                    Cargo + Packaging Gross Wt (KG) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`form-control ${cntErrors.grossWt ? "error" : ""}`}
                    value={container.grossWt || ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "grossWt", e.target.value)
                    }
                  />
                  {cntErrors.grossWt && (
                    <span className="error-text">{cntErrors.grossWt}</span>
                  )}
                </div>

                {/* Net Cargo Weight */}
                <div className="form-group">
                  <label>
                    Cargo Net Weight (KG) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`form-control ${cntErrors.cargoWt ? "error" : ""}`}
                    value={container.cargoWt || ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "cargoWt", e.target.value)
                    }
                  />
                  {cntErrors.cargoWt && (
                    <span className="error-text">{cntErrors.cargoWt}</span>
                  )}
                </div>

                {/* No of Packages */}
                <div className="form-group">
                  <label>
                    No. of Packages <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${cntErrors.noOfPkg ? "error" : ""}`}
                    value={container.noOfPkg || ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "noOfPkg", e.target.value)
                    }
                  />
                  {cntErrors.noOfPkg && (
                    <span className="error-text">{cntErrors.noOfPkg}</span>
                  )}
                </div>

                {/* Package Type */}
                <div className="form-group">
                  <label>
                    Package Type <span className="required">*</span>
                  </label>
                  <CustomAutocomplete
                    variant="boxed"
                    options={PACKAGE_TYPE_LOV}
                    value={container.typOfPackages || "BOX"}
                    placeholder="Select Package Type"
                    disabled={readOnly}
                    error={!!cntErrors.typOfPackages}
                    onChange={(val) =>
                      handleContainerChange(index, "typOfPackages", val || "BOX")
                    }
                  />
                  {cntErrors.typOfPackages && (
                    <span className="error-text">{cntErrors.typOfPackages}</span>
                  )}
                </div>

                {/* Cargo Type */}
                <div className="form-group">
                  <label>
                    Cargo Type <span className="required">*</span>
                  </label>
                  <CustomAutocomplete
                    variant="boxed"
                    options={CARGO_TYPE_LOV}
                    value={container.cargoTp || "GEN"}
                    placeholder="Select Cargo Type"
                    disabled={readOnly}
                    error={!!cntErrors.cargoTp}
                    onChange={(val) =>
                      handleContainerChange(index, "cargoTp", val || "GEN")
                    }
                  />
                  {cntErrors.cargoTp && (
                    <span className="error-text">{cntErrors.cargoTp}</span>
                  )}
                </div>

                {/* Shipping Bill Type */}
                <div className="form-group">
                  <label>
                    Type of Shipping Bill <span className="required">*</span>
                  </label>
                  <CustomAutocomplete
                    variant="boxed"
                    options={SHIP_BILL_TYPE_LOV}
                    value={container.shipBillTp || "DFS"}
                    placeholder="Select Shipping Bill Type"
                    disabled={readOnly}
                    error={!!cntErrors.shipBillTp}
                    onChange={(val) =>
                      handleContainerChange(index, "shipBillTp", val || "DFS")
                    }
                  />
                  {cntErrors.shipBillTp && (
                    <span className="error-text">{cntErrors.shipBillTp}</span>
                  )}
                </div>

                {/* Exporter Name */}
                <div className="form-group">
                  <label>
                    Exporter Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.exporterNm ? "error" : ""}`}
                    value={container.exporterNm || ""}
                    maxLength={100}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "exporterNm", e.target.value)
                    }
                  />
                  {cntErrors.exporterNm && (
                    <span className="error-text">{cntErrors.exporterNm}</span>
                  )}
                </div>

                {/* Exporter IEC */}
                <div className="form-group">
                  <label>
                    Exporter IEC <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.iec ? "error" : ""}`}
                    value={container.iec || ""}
                    maxLength={10}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "iec", e.target.value)
                    }
                  />
                  {cntErrors.iec && (
                    <span className="error-text">{cntErrors.iec}</span>
                  )}
                </div>

                {/* Consignee Name */}
                <div className="form-group">
                  <label>
                    Consignee Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.consigneeNm ? "error" : ""}`}
                    value={container.consigneeNm || ""}
                    maxLength={100}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "consigneeNm", e.target.value)
                    }
                  />
                  {cntErrors.consigneeNm && (
                    <span className="error-text">{cntErrors.consigneeNm}</span>
                  )}
                </div>

                {/* Container Agent Code */}
                <div className="form-group">
                  <label>
                    Container Agent Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.cntnrAgentCode ? "error" : ""}`}
                    value={container.cntnrAgentCode || ""}
                    maxLength={10}
                    disabled={readOnly}
                    placeholder="e.g. AABCH7319B"
                    onChange={(e) =>
                      handleContainerChange(
                        index,
                        "cntnrAgentCode",
                        e.target.value.toUpperCase()
                      )
                    }
                  />
                  {cntErrors.cntnrAgentCode ? (
                    <span className="error-text">{cntErrors.cntnrAgentCode}</span>
                  ) : (
                    <span className="help-text">Format: 5 Alpha + 4 Num + 1 Alpha</span>
                  )}
                </div>

                {/* SOC Flag */}
                <div className="form-group">
                  <label>
                    Shipper Owned Container (SOC) <span className="required">*</span>
                  </label>
                  <CustomAutocomplete
                    variant="boxed"
                    options={[
                      { value: "N", label: "No (Liner Owned)" },
                      { value: "Y", label: "Yes (SOC)" },
                    ]}
                    value={container.socFlag || "N"}
                    placeholder="Select SOC"
                    disabled={readOnly}
                    onChange={(val) =>
                      handleContainerChange(index, "socFlag", val || "N")
                    }
                  />
                </div>

                {/* HSN Code */}
                <div className="form-group">
                  <label>
                    HSN Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${cntErrors.hsnCode ? "error" : ""}`}
                    value={container.hsnCode || ""}
                    disabled={readOnly}
                    placeholder="e.g. 84211910"
                    onChange={(e) =>
                      handleContainerChange(index, "hsnCode", e.target.value)
                    }
                  />
                  {cntErrors.hsnCode && (
                    <span className="error-text">{cntErrors.hsnCode}</span>
                  )}
                </div>

                {/* Marks & Numbers */}
                <div className="form-group grid-span-2">
                  <label>
                    Marks & Numbers <span className="required">*</span>
                  </label>
                  <textarea
                    rows={2}
                    className={`form-control ${cntErrors.markNum ? "error" : ""}`}
                    value={container.markNum || ""}
                    maxLength={300}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "markNum", e.target.value)
                    }
                  />
                  {cntErrors.markNum && (
                    <span className="error-text">{cntErrors.markNum}</span>
                  )}
                </div>

                {/* Cargo Description */}
                <div className="form-group grid-span-2">
                  <label>
                    Cargo Description <span className="required">*</span>
                  </label>
                  <textarea
                    rows={2}
                    className={`form-control ${cntErrors.cargoDesc ? "error" : ""}`}
                    value={container.cargoDesc || ""}
                    maxLength={250}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleContainerChange(index, "cargoDesc", e.target.value)
                    }
                  />
                  {cntErrors.cargoDesc && (
                    <span className="error-text">{cntErrors.cargoDesc}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ESBContainerSection;
