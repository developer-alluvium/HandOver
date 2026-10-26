// client/src/components/ESB/TrackESB.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { esbAPI } from "../../services/esbAPI";
import AppbarComponent from "../AppbarComponent";
import { useAuth } from "../../context/AuthContext";
import CustomAutocomplete from "../common/CustomAutocomplete";
import "../../styles/ESB.scss";

const TrackESB = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    bookNo: "",
    containerNo: "",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [amendModalOpen, setAmendModalOpen] = useState(false);
  const [amendmentRemarks, setAmendmentRemarks] = useState("");
  const [amendLoading, setAmendLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await esbAPI.getRequests(filters);
      const dataObj = res.data?.requests ? res.data : (res.data?.data || res.data);
      if (dataObj && (dataObj.requests || Array.isArray(dataObj))) {
        setRequests(dataObj.requests || (Array.isArray(dataObj) ? dataObj : []));
        setPagination(
          dataObj.pagination || { total: 0, pages: 1, page: 1 }
        );
      }
    } catch (err) {
      setError(err.message || "Failed to fetch e-SB requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters.page, filters.status, filters.bookNo, filters.containerNo]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleRefreshStatus = async (reqItem) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await esbAPI.getESBStatus({
        bookNo: reqItem.bookNo,
        bnfCode: reqItem.bnfCode,
        pyrCode: reqItem.pyrCode || userData?.pyrCode || "ODeX/MH/SHP/2503/00019",
        gatewayLocCode: reqItem.gatewayLocCode || reqItem.locCode || "INNSA1",
      });

      setSuccess(
        `Live status updated: ${res.data?.updatedStatus || res.data?.data?.iEgmRequestVo?.status || "Success"}`
      );
      fetchRequests();
    } catch (err) {
      setError(err.message || "Failed to check status with ODeX.");
    } finally {
      setLoading(false);
    }
  };

  const handleAmendDirect = async (reqItem) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await esbAPI.amendESB({
        ...reqItem,
        odexRefNo: reqItem.odexRefNo || "ODEX_TEMP_REF",
        bookNo: reqItem.bookNo,
        pyrCode: reqItem.pyrCode || userData?.pyrCode || "ODeX/MH/SHP/2503/00019",
        bnfCode: reqItem.bnfCode,
        remarks: `Updating Shipping Bill details for ${reqItem.bookNo}`,
      });

      setSuccess(`Shipping Bill Amendment request sent to ODeX for Booking #${reqItem.bookNo}!`);
      setAmendModalOpen(false);
      fetchRequests();
    } catch (err) {
      setError(err.message || "Failed to submit Shipping Bill amendment.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAmendment = (reqItem) => {
    setSelectedRequest(reqItem);
    setAmendmentRemarks(`Updating Shipping Bill details for ${reqItem.bookNo}`);
    setAmendModalOpen(true);
  };

  const handleConfirmAmendment = async () => {
    if (!selectedRequest) return;
    await handleAmendDirect(selectedRequest);
  };

  const renderBadge = (status) => {
    const s = (status || "PENDING").toUpperCase();
    let badgeClass = "badge-blue";
    if (s.includes("VERIFIED") || s.includes("CONFIRMED")) badgeClass = "badge-green";
    if (s.includes("REJECTED") || s.includes("FAILED")) badgeClass = "badge-red";
    if (s.includes("AMENDMENT")) badgeClass = "badge-orange";

    return <span className={`badge ${badgeClass}`}>{s}</span>;
  };

  return (
    <div className="esb-page">
      <AppbarComponent />

      {/* Header Banner */}
      <div className="esb-header-banner">
        <div className="banner-title">
          <h1>Track e-SB Requests</h1>
          <p>View history, refresh live ODeX status, and issue Shipping Bill amendments</p>
        </div>

        <div className="banner-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/esb")}
          >
            + Create New e-SB
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="esb-panel">
        <div className="panel-header">
          <span>Search & Filter Declarations</span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Booking No.</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search Booking No..."
              value={filters.bookNo}
              onChange={(e) => handleFilterChange("bookNo", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Container No.</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search Container No..."
              value={filters.containerNo}
              onChange={(e) => handleFilterChange("containerNo", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <CustomAutocomplete
              variant="boxed"
              options={[
                { value: "", label: "All Statuses" },
                { value: "SUBMITTED", label: "SUBMITTED" },
                { value: "VERIFIED", label: "VERIFIED" },
                { value: "CONFIRMED", label: "CONFIRMED" },
                { value: "REJECTED", label: "REJECTED" },
                { value: "AMENDMENT", label: "AMENDMENT REQUESTED" },
              ]}
              value={filters.status}
              onChange={(val) => handleFilterChange("status", val)}
              placeholder="All Statuses"
            />
          </div>

          <div className="form-group" style={{ justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchRequests}
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => setError("")}>
            &times;
          </button>
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

      {/* Requests Table */}
      <div className="esb-panel">
        <div className="table-responsive">
          <table className="esb-table">
            <thead>
              <tr>
                <th>Submitted Date</th>
                <th>ODeX Ref No</th>
                <th>Booking No / BL</th>
                <th>Line</th>
                <th>Vessel / Via</th>
                <th>Containers</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                    Loading e-SB requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                    No e-SB declarations found matching criteria.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>
                      <strong style={{ color: "#1e3a8a" }}>
                        {req.odexRefNo || "Pending Ref"}
                      </strong>
                    </td>
                    <td>
                      <div><strong>{req.bookNo}</strong></div>
                      <small style={{ color: "#64748b" }}>BL: {req.blNo}</small>
                    </td>
                    <td>{req.bnfCode}</td>
                    <td>
                      {req.vesselNm} / {req.viaNo}
                    </td>
                    <td>
                      {(req.egmRequestcntnrVoList || req.containers || []).length} cntr(s)
                    </td>
                    <td>{renderBadge(req.status)}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center" }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          title="View Details"
                          onClick={() => {
                            setSelectedRequest(req);
                            setViewModalOpen(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="Refresh ODeX Status"
                          onClick={() => handleRefreshStatus(req)}
                        >
                          Status
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          title="Edit Full Form"
                          onClick={() => navigate("/esb", { state: { editData: req } })}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          title="Submit Amendment API to ODeX"
                          onClick={() => handleAmendDirect(req)}
                        >
                          Amend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              className="btn btn-outline btn-sm"
              disabled={filters.page <= 1}
              onClick={() => handleFilterChange("page", filters.page - 1)}
            >
              Previous
            </button>
            <span style={{ alignSelf: "center", fontSize: "13px" }}>
              Page {filters.page} of {pagination.pages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={filters.page >= pagination.pages}
              onClick={() => handleFilterChange("page", filters.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {viewModalOpen && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>e-SB Declaration Details</h3>
              <button className="close-btn" onClick={() => setViewModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ marginBottom: "1rem" }}>
                <div>
                  <small style={{ color: "#64748b" }}>ODeX Ref No</small>
                  <div><strong>{selectedRequest.odexRefNo || "-"}</strong></div>
                </div>
                <div>
                  <small style={{ color: "#64748b" }}>Booking No</small>
                  <div><strong>{selectedRequest.bookNo}</strong></div>
                </div>
                <div>
                  <small style={{ color: "#64748b" }}>BL No</small>
                  <div><strong>{selectedRequest.blNo}</strong></div>
                </div>
                <div>
                  <small style={{ color: "#64748b" }}>Shipping Line</small>
                  <div><strong>{selectedRequest.bnfCode}</strong></div>
                </div>
              </div>

              <h4 style={{ margin: "1rem 0 0.5rem 0", color: "#1e3a8a" }}>
                Container List ({(selectedRequest.egmRequestcntnrVoList || selectedRequest.containers || []).length})
              </h4>
              <div className="table-responsive">
                <table className="esb-table">
                  <thead>
                    <tr>
                      <th>Container No</th>
                      <th>SB No & Date</th>
                      <th>Exporter</th>
                      <th>Gross Wt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedRequest.egmRequestcntnrVoList || selectedRequest.containers || []).map(
                      (cnt, idx) => (
                        <tr key={idx}>
                          <td><strong>{cnt.cntNo}</strong></td>
                          <td>{cnt.shipBillNo} ({cnt.shipBillDt})</td>
                          <td>{cnt.exporterNm}</td>
                          <td>{cnt.grossWt} KG</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amendment Modal */}
      {amendModalOpen && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Request Shipping Bill Amendment</h3>
              <button className="close-btn" onClick={() => setAmendModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: "0 0 1rem 0", color: "#64748b" }}>
                Initiate an official Shipping Bill Amendment request to ODeX and Shipping Line for Booking #{selectedRequest.bookNo}.
              </p>
              <div className="form-group">
                <label>Amendment Reason / Remarks *</label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={amendmentRemarks}
                  onChange={(e) => setAmendmentRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setAmendModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-warning"
                disabled={amendLoading || !amendmentRemarks.trim()}
                onClick={handleConfirmAmendment}
              >
                {amendLoading ? "Submitting..." : "Submit Amendment Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackESB;
