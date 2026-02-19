/**
 * VGM Download Component
 * Displays exporter dropdown and allows downloading VGM PDF for individual exporters
 */
import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { generateVGMPdf, EXPORTERS } from "../utils/VGMPdfGenerator";
import "../styles/VGMDownload.scss";

const VGMDownload = ({ vgmData, onClose }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [selectedExporter, setSelectedExporter] = useState("");
    const [generating, setGenerating] = useState(false);

    const handleExporterSelect = async (exporterKey) => {
        if (!exporterKey) return;

        const exporter = EXPORTERS.find((e) => e.key === exporterKey);
        if (!exporter) {
            enqueueSnackbar("Invalid exporter selected", { variant: "error" });
            return;
        }

        setSelectedExporter(exporterKey);
        setGenerating(true);

        try {
            const filename = await generateVGMPdf(vgmData, exporter);
            enqueueSnackbar(`PDF generated: ${filename}`, { variant: "success" });
        } catch (error) {
            console.error("PDF generation error:", error);
            enqueueSnackbar("Failed to generate PDF. Please try again.", { variant: "error" });
        } finally {
            setGenerating(false);
            setSelectedExporter("");
        }
    };

    return (
        <div className="vgm-download-container">
            <div className="vgm-download-card">
                <div className="vgm-download-header">
                    <div className="success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h2>VGM Submitted Successfully!</h2>
                    <p>Download VGM Letter for individual exporters</p>
                </div>

                <div className="vgm-download-content">
                    <label className="dropdown-label">Select Exporter to Download VGM PDF</label>

                    <div className="exporter-dropdown-wrapper">
                        <select
                            className="exporter-dropdown"
                            value={selectedExporter}
                            onChange={(e) => handleExporterSelect(e.target.value)}
                            disabled={generating}
                        >
                            <option value="">-- Select an Exporter --</option>
                            {EXPORTERS.map((exporter) => (
                                <option key={exporter.key} value={exporter.key}>
                                    {exporter.label}
                                </option>
                            ))}
                        </select>

                        {generating && (
                            <div className="spinner-overlay">
                                <div className="spinner"></div>
                            </div>
                        )}
                    </div>

                    <div className="exporter-list">
                        <p className="list-title">Available Exporters:</p>
                        <div className="exporter-grid">
                            {EXPORTERS.map((exporter) => (
                                <button
                                    type="button"
                                    key={exporter.key}
                                    className="exporter-btn"
                                    onClick={() => handleExporterSelect(exporter.key)}
                                    disabled={generating}
                                >
                                    <span className="exporter-icon">📄</span>
                                    <span className="exporter-name">{exporter.label}</span>
                                    <span className="download-icon">⬇️</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="vgm-download-footer">
                    <button type="button" className="btn-close" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VGMDownload;
