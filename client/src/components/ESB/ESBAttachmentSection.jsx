// client/src/components/ESB/ESBAttachmentSection.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  ESB_ATTACHMENT_CONFIG,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_RECOMMENDED_TOTAL_MB,
} from "../../utils/esbValidations";
import { esbAPI } from "../../services/esbAPI";

const ESBAttachmentSection = ({
  attachments = [],
  onAttachmentsChange,
  onAddAttachment,
  onRemoveAttachment,
  bnfCode = "",
  locCode = "",
  cntStatus = "FCL",
  pyrCode = "",
  errors = {},
  setAttachmentErrors,
  readOnly = false,
  docConfigs: propDocConfigs,
  onDocConfigsChange,
}) => {
  const [docConfigs, setDocConfigs] = useState(propDocConfigs || ESB_ATTACHMENT_CONFIG);
  const [uploadError, setUploadError] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);
  const fileInputRefs = useRef({});

  // Sync with propDocConfigs if passed from parent
  useEffect(() => {
    if (propDocConfigs && propDocConfigs.length > 0) {
      setDocConfigs(propDocConfigs);
    }
  }, [propDocConfigs]);

  // Dynamic fetch of attachment requirements if Liner/Port/ContainerStatus is provided
  useEffect(() => {
    let isMounted = true;
    const fetchAttachmentMaster = async () => {
      const cleanBnf = (bnfCode || "").trim().split(/[\s-]+/)[0].toUpperCase();
      const cleanLoc = (locCode || "").trim().split(/[\s-]+/)[0].toUpperCase();
      if (!cleanBnf || !cleanLoc) return;

      try {
        setLoadingConfig(true);
        const res = await esbAPI.getAttachmentMaster({
          pyrCode: pyrCode || undefined,
          bnfId: cleanBnf,
          locId: cleanLoc,
          cntStatus: cntStatus || "FCL",
        });

        if (isMounted && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiList = res.data;
          const newConfigs = apiList.map((item) => {
            const code = (item.codeId || "").toUpperCase().trim();
            const isReq = Boolean(item.isReq);
            const known = ESB_ATTACHMENT_CONFIG.find((c) => c.code === code) || {};
            return {
              code,
              title: item.codeDesc || known.title || code,
              subtitle: known.subtitle || `${item.codeDesc || code} document`,
              required: isReq,
              category: isReq ? "mandatory" : "optional",
              defaultDesc: known.defaultDesc || item.codeDesc || `${code} Document`,
              hint: known.hint || `${item.codeDesc || code} document`,
            };
          });

          // Ensure 'O' (Other) is available if not in API response
          if (!newConfigs.some((c) => c.code === "O")) {
            const otherCfg = ESB_ATTACHMENT_CONFIG.find((c) => c.code === "O");
            if (otherCfg) newConfigs.push(otherCfg);
          }

          setDocConfigs(newConfigs);
          if (onDocConfigsChange) {
            onDocConfigsChange(newConfigs);
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic attachment master, using spec defaults:", err.message);
      } finally {
        if (isMounted) setLoadingConfig(false);
      }
    };

    fetchAttachmentMaster();
    return () => {
      isMounted = false;
    };
  }, [bnfCode, locCode, cntStatus, pyrCode]);

  // Sync / update attachments list helper
  const updateAttachments = (newAttachments) => {
    if (onAttachmentsChange) {
      onAttachmentsChange(newAttachments);
    } else if (onAddAttachment) {
      onAddAttachment(newAttachments, true);
    }
  };

  // Handle single file upload for a specific attachment slot
  const handleSlotFileUpload = (file, docType) => {
    if (!file) return;
    setUploadError("");

    // Condition 1: Only PDF format is accepted
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");
    const isPdfMime = !file.type || file.type === "application/pdf";
    if (!isPdfExt || !isPdfMime) {
      setUploadError(`Invalid file format: "${file.name}". ODeX strictly accepts only PDF files (.pdf).`);
      return;
    }

    // Condition 2: Max 5 MB (5,242,880 bytes) per file
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(
        `File "${file.name}" (${sizeMB} MB) exceeds maximum allowed limit of 5.0 MB (5,242,880 bytes) as per ODeX specifications.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result.split(",")[1];
      const existing = attachments.filter((a) => a.attTitle !== docType.code);

      const newAtt = {
        attNm: file.name,
        attTitle: docType.code,
        attDesc: docType.defaultDesc || `${docType.title} document`,
        attData: base64String,
        sizeBytes: file.size,
      };

      const updated = [...existing, newAtt];
      updateAttachments(updated);

      // Clear any validation error on this slot
      if (setAttachmentErrors && errors[docType.code]) {
        setAttachmentErrors((prev) => {
          const clone = { ...prev };
          delete clone[docType.code];
          return clone;
        });
      }
    };

    reader.onerror = () => {
      setUploadError(`Failed to read file "${file.name}". Please try again.`);
    };

    reader.readAsDataURL(file);
  };

  // Remove attachment for a specific slot
  const handleRemoveSlot = (docCode) => {
    const updated = attachments.filter((a) => a.attTitle !== docCode);
    updateAttachments(updated);
    if (fileInputRefs.current[docCode]) {
      fileInputRefs.current[docCode].value = null;
    }
  };

  // Update attachment description
  const handleDescriptionChange = (docCode, desc) => {
    const updated = attachments.map((a) => {
      if (a.attTitle === docCode) {
        return { ...a, attDesc: desc.substring(0, 200) };
      }
      return a;
    });
    updateAttachments(updated);
  };

  // Preview uploaded PDF in a new tab
  const handlePreviewPdf = (att) => {
    if (!att || !att.attData) return;
    try {
      const byteCharacters = atob(att.attData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (e) {
      console.error("Preview PDF error:", e);
      const win = window.open();
      win.document.write(
        `<iframe src="data:application/pdf;base64,${att.attData}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }
  };

  // Total size calculation
  const calculateTotalSizeMB = () => {
    const totalBytes = attachments.reduce((acc, curr) => {
      if (curr.sizeBytes) return acc + curr.sizeBytes;
      if (curr.attData) return acc + (curr.attData.length * 3) / 4;
      return acc;
    }, 0);
    return (totalBytes / (1024 * 1024)).toFixed(2);
  };

  const totalSizeMB = calculateTotalSizeMB();
  const mandatoryConfigs = docConfigs.filter((cfg) => cfg.required);
  const optionalConfigs = docConfigs.filter((cfg) => !cfg.required);

  const mandatoryUploadedCount = mandatoryConfigs.filter((cfg) =>
    attachments.some((a) => a.attTitle === cfg.code && a.attData)
  ).length;

  const optionalUploadedCount = optionalConfigs.filter((cfg) =>
    attachments.some((a) => a.attTitle === cfg.code && a.attData)
  ).length;

  // Render individual attachment card
  const renderAttachmentCard = (docType) => {
    const attachedFile = attachments.find((a) => a.attTitle === docType.code);
    const hasError = Boolean(errors && errors[docType.code]);
    const isAttached = Boolean(attachedFile);

    const fileSizeFormatted = attachedFile
      ? attachedFile.sizeBytes
        ? (attachedFile.sizeBytes / 1024).toFixed(1) + " KB"
        : attachedFile.attData
        ? ((attachedFile.attData.length * 3) / 4 / 1024).toFixed(1) + " KB"
        : ""
      : "";

    return (
      <div
        key={docType.code}
        className={`attachment-card ${
          docType.required ? "card-mandatory" : "card-optional"
        } ${isAttached ? "card-attached" : ""} ${hasError ? "card-has-error" : ""}`}
      >
        <div className="card-top">
          <div className="card-title-row">
            <h4 className="doc-name">{docType.title}</h4>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span className="badge badge-blue">{docType.code}</span>
              {docType.required ? (
                <span className="badge badge-red" title={docType.hint}>
                  Mandatory *
                </span>
              ) : (
                <span className="badge" style={{ background: "#e2e8f0", color: "#475569" }}>
                  Optional
                </span>
              )}
            </div>
          </div>
          <p className="doc-subtitle">{docType.subtitle}</p>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={(el) => (fileInputRefs.current[docType.code] = el)}
          hidden
          accept="application/pdf"
          disabled={readOnly}
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            if (f) handleSlotFileUpload(f, docType);
            e.target.value = null;
          }}
        />

        {/* Upload State */}
        {!isAttached ? (
          <div>
            <div
              className="card-dropzone"
              onClick={() => {
                if (!readOnly && fileInputRefs.current[docType.code]) {
                  fileInputRefs.current[docType.code].click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("drag-over");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("drag-over");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("drag-over");
                if (readOnly) return;
                const f = e.dataTransfer.files && e.dataTransfer.files[0];
                if (f) handleSlotFileUpload(f, docType);
              }}
            >
              <div className="dropzone-icon">📄</div>
              <div className="dropzone-label">
                {!readOnly ? `+ Upload ${docType.code} Document` : "No Document Attached"}
              </div>
              <div className="dropzone-hint">Only PDF format • Max 5.0 MB</div>
            </div>

            {hasError && (
              <div className="card-slot-error">
                <span>⚠️ {errors[docType.code]}</span>
              </div>
            )}
          </div>
        ) : (
          /* Attached State */
          <div className="card-attached-content">
            <div className="file-meta-row">
              <span className="pdf-icon-badge">PDF</span>
              <div className="file-info">
                <span className="file-name" title={attachedFile.attNm}>
                  {attachedFile.attNm}
                </span>
                <span className="file-size">{fileSizeFormatted}</span>
              </div>
              <span className="file-status-badge">✓ Attached</span>
            </div>

            <div className="card-desc-group">
              <label>Description (AN-200):</label>
              <input
                type="text"
                className="card-desc-input"
                placeholder={docType.defaultDesc || "Document description"}
                value={attachedFile.attDesc || ""}
                disabled={readOnly}
                maxLength={200}
                onChange={(e) => handleDescriptionChange(docType.code, e.target.value)}
              />
            </div>

            <div className="card-actions-row">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handlePreviewPdf(attachedFile)}
                title="View uploaded PDF"
              >
                👁 Preview
              </button>

              {!readOnly && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (fileInputRefs.current[docType.code]) {
                        fileInputRefs.current[docType.code].click();
                      }
                    }}
                    title="Replace with another PDF file"
                  >
                    Replace
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveSlot(docType.code)}
                    title="Remove this attachment"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="esb-panel">
      {/* Panel Header */}
      <div className="panel-header-bar">
        <h2 className="section-title">3. Mandatory & Optional Attachments</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {loadingConfig && (
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Updating requirements from ODeX...
            </span>
          )}
        </div>
      </div>

      {/* Top Summary Status Bar */}
      <div className="attachment-summary-bar">
        <div className="attachment-metrics">
          <div
            className={`metric-chip ${
              mandatoryUploadedCount === mandatoryConfigs.length && mandatoryConfigs.length > 0
                ? "metric-success"
                : "metric-warning"
            }`}
          >
            <span>Mandatory:</span>
            <strong>
              {mandatoryUploadedCount} / {mandatoryConfigs.length} Uploaded
            </strong>
          </div>

          <div className="metric-chip metric-info">
            <span>Optional:</span>
            <strong>{optionalUploadedCount} Uploaded</strong>
          </div>

          <div
            className={`metric-chip ${
              Number(totalSizeMB) > MAX_RECOMMENDED_TOTAL_MB ? "metric-warning" : "metric-success"
            }`}
          >
            <span>Total Payload:</span>
            <strong>
              {totalSizeMB} MB / {MAX_RECOMMENDED_TOTAL_MB} MB max recommended
            </strong>
          </div>
        </div>

        <div className="attachment-rules-hint">
          <span>ℹ️ <b>ODeX Spec:</b> Only PDF (.pdf) • Max 5MB per document • Max 4MB total</span>
        </div>
      </div>

      {/* Error alert */}
      {uploadError && (
        <div className="alert alert-error">
          <span>{uploadError}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => setUploadError("")}
          >
            &times;
          </button>
        </div>
      )}

      {/* Warning if total size exceeds 4MB */}
      {Number(totalSizeMB) > MAX_RECOMMENDED_TOTAL_MB && (
        <div className="alert alert-warning">
          <span>
            ⚠️ Total attachment size is <b>{totalSizeMB} MB</b>. ODeX recommends keeping total attachment size under <b>4.0 MB</b> to prevent gateway timeouts or rejection.
          </span>
        </div>
      )}

      {/* Section A: Mandatory Attachments */}
      <div className="attachment-group">
        <div className="attachment-group-title">
          <span>Mandatory Documents (Required by ODeX & Shipping Line)</span>
          <span className="group-count">
            {mandatoryUploadedCount} of {mandatoryConfigs.length} attached
          </span>
        </div>
        <div className="attachment-cards-grid">
          {mandatoryConfigs.map((cfg) => renderAttachmentCard(cfg))}
        </div>
      </div>

      {/* Section B: Optional Attachments */}
      <div className="attachment-group" style={{ marginBottom: "0.5rem" }}>
        <div className="attachment-group-title">
          <span>Optional Supporting Documents</span>
          <span className="group-count">{optionalUploadedCount} attached</span>
        </div>
        <div className="attachment-cards-grid">
          {optionalConfigs.map((cfg) => renderAttachmentCard(cfg))}
        </div>
      </div>
    </div>
  );
};

export default ESBAttachmentSection;
