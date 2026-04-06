import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { form13API } from "../../services/form13API";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import AppbarComponent from "../AppbarComponent";
import { useNavigate } from "react-router-dom";
import "../../styles/Form13.scss";

// Inline Icons
const Icons = {
  Filter: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  ),
  Refresh: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Eye: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  Cancel: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  )
};

const TrackF13 = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [cancelModalData, setCancelModalData] = useState(null);
  const [chaRemark, setChaRemark] = useState("");
  const [statusResult, setStatusResult] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    status: "",
    containerNo: "",
    bookNo: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchF13Requests = async (page = 1) => {
    setLoading(true);
    try {
      const filterParams = { page, limit: pagination.limit, ...filters };
      Object.keys(filterParams).forEach(
        (k) => !filterParams[k] && delete filterParams[k]
      );

      const response = await form13API.getRequests(filterParams);
      const { requests: data, pagination: meta } = response.data;
      setRequests(data);
      setPagination((prev) => ({
        ...prev,
        page: meta.page,
        total: meta.total,
        pages: meta.pages,
      }));
    } catch (error) {
      enqueueSnackbar("Failed to load requests", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = (request) => {
    navigate("/form13", { state: { editMode: true, f13Id: request._id } });
  };

  const downloadBase64PDF = (base64String, fileName) => {
    if (!base64String) return;
    const linkSource = `data:application/pdf;base64,${base64String}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  const handleGetStatus = async (request) => {
    try {
      setLoading(true);
      const payload = {
        odexRefNo: request.odexRefNo,
        pyrCode: request.pyrCode,
        bookNo: request.bookNo
      };
      if (!payload.odexRefNo || !payload.pyrCode || !payload.bookNo) {
        enqueueSnackbar("Missing required fields (odexRefNo, pyrCode, bookNo) on this record.", { variant: "warning" });
        return;
      }
      const response = await form13API.getForm13Status(payload);
      
      // The interceptor might have unwrapped the data to be the array [ { ... } ]
      const responseData = response.data;
      const statusObj = Array.isArray(responseData) ? responseData[0] : responseData;
      
      // Look for status in all possible locations
      const getStatusFromData = (obj) => {
        if (!obj) return null;
        if (obj.status) return obj.status;
        if (obj.currentStatus) return obj.currentStatus;
        if (obj.cntrList && obj.cntrList.length > 0) return obj.cntrList[0].status;
        return null;
      };

      const rawStatus = response.updatedStatus || getStatusFromData(statusObj) || "SUBMITTED";
      const newStatus = String(rawStatus).toUpperCase();
      
      enqueueSnackbar(`Status Synced: ${newStatus.replace(/_/g, " ")}`, { variant: "success" });

      // Handle PDF download if status is CONFIRMED
      if (newStatus === "CONFIRMED") {
        const pdfBase64 = statusObj?.confirmedpdf || (Array.isArray(responseData) && responseData[0]?.confirmedpdf);
        
        if (pdfBase64) {
          enqueueSnackbar("Downloading Confirmation PDF...", { variant: "info" });
          downloadBase64PDF(pdfBase64, `Form13_Confirmation_${request.bookNo}.pdf`);
        } else {
          console.warn("Status is CONFIRMED but confirmedpdf field is missing in response:", responseData);
        }
      }

      fetchF13Requests(pagination.page);
    } catch (err) {
      enqueueSnackbar(err.message || "Failed to get status", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!chaRemark.trim()) {
      enqueueSnackbar("Please add a remark", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const containerSource = cancelModalData.cntrList || cancelModalData.containers || [];
      const payload = {
        odexRefNo: cancelModalData.odexRefNo,
        form13ReqCntnrVoList: containerSource.map(c => ({
          cntnrNo: c.cntnrNo,
          chaRemarks: chaRemark
        }))
      };
      
      const res = await form13API.cancelForm13(payload);
      enqueueSnackbar("Cancellation requested successfully!", { variant: "success" });
      setCancelModalData(null);
      setChaRemark("");
      fetchF13Requests(pagination.page);
    } catch (err) {
      enqueueSnackbar(err.message || "Failed to cancel form", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: "",
      containerNo: "",
      bookNo: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(clearedFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchF13Requests(1);
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchF13Requests(1);
  };

  const getStatusBadgeClass = (status) => {
    const s = status?.toUpperCase();
    if (s === "SUBMITTED" || s === "SUCCESS") return "badge-success";
    if (s === "FAILED" || s === "ERROR") return "badge-danger";
    if (s?.includes("CANCEL")) return "badge-danger";
    return "badge-warning";
  };

  // Initial load
  useEffect(() => {
    fetchF13Requests(1);
  }, []);

  return (
    <div className="form13-container">
      <AppbarComponent />
      <div className="page-header" style={{ marginBottom: '1.25rem', padding: '0 0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Form 13 Tracking</h2>
      </div>

      {/* Filters */}
      <div className="panel" sx={{ mb: 2, p: 2 }}>
        <div className="d-flex mb-3 gap-2" style={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>
          <Icons.Filter /> SEARCH FILTERS
        </div>
        <div
          className="form-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem"
          }}
        >
          <div className="form-group">
            <label>Status</label>
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div className="form-group">
            <label>Container No</label>
            <input
              className="form-control"
              placeholder="e.g. ABCD1234567"
              value={filters.containerNo}
              onChange={(e) =>
                setFilters({ ...filters, containerNo: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Booking No</label>
            <input
              className="form-control"
              placeholder="e.g. BK001"
              value={filters.bookNo}
              onChange={(e) =>
                setFilters({ ...filters, bookNo: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>From Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}
          >
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={handleApplyFilters}
            >
              Search
            </button>
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={handleClearFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="panel">
        <div className="d-flex justify-between mb-4">
          <h3>Requests ({pagination.total})</h3>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/form13")}
            >
              + New Form 13
            </button>
            <button
              className="btn btn-outline"
              onClick={() => fetchF13Requests(pagination.page)}
            >
              <Icons.Refresh /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="alert alert-info">No records found.</div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Actions</th>
                    <th>Booking No</th>
                    <th>Vessel</th>
                    <th style={{ width: '150px' }}>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>Containers</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, i) => (
                    <tr key={i} className="hover-row">
                      <td className="actions-cell">
                        <div className="d-flex gap-1">
                          <button
                            className="btn-icon btn-view"
                            title="View Details"
                            onClick={() => setSelectedRequest(req)}
                          >
                            <Icons.Eye />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            title="Edit / Resubmit"
                            onClick={() => handleEditRequest(req)}
                          >
                            <Icons.Edit />
                          </button>
                          <button
                            className="btn-icon btn-status"
                            title="Sync Status from ODeX"
                            onClick={() => handleGetStatus(req)}
                          >
                            <Icons.Refresh />
                          </button>
                          <button
                            className="btn-icon btn-cancel text-danger"
                            title="Request Cancellation"
                            onClick={() => {
                              setCancelModalData(req);
                              setChaRemark("");
                            }}
                          >
                            <Icons.Cancel />
                          </button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#1a237e' }}>{req.bookNo}</td>
                      <td>{req.vesselNm}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>
                          {req.status?.replace(/_/g, ' ') || 'PENDING'}
                        </span>
                      </td>
                      <td className="text-muted">{dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}</td>
                      <td style={{ textAlign: 'center' }}>
                         <span className="count-circle">
                           {req.cntrList?.length || req.containers?.length || 0}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-between mt-4">
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={pagination.page === 1}
                    onClick={() => fetchF13Requests(pagination.page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchF13Requests(pagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Details: {selectedRequest.bookNo}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                <div className="detail-item">
                  <label className="text-muted" style={{ fontSize: '10px', display: 'block', mb: '4px' }}>CURRENT STATUS</label>
                  <span className={`status-badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="detail-item">
                  <label className="text-muted" style={{ fontSize: '10px', display: 'block', mb: '4px' }}>VESSEL / VOYAGE</label>
                  <div style={{ fontWeight: 600 }}>{selectedRequest.vesselNm}</div>
                </div>
                <div className="detail-item">
                  <label className="text-muted" style={{ fontSize: '10px', display: 'block', mb: '4px' }}>BOOKING NUMBER</label>
                  <div style={{ fontWeight: 600 }}>{selectedRequest.bookNo}</div>
                </div>
                <div className="detail-item">
                  <label className="text-muted" style={{ fontSize: '10px', display: 'block', mb: '4px' }}>PORT LOCATION</label>
                  <div style={{ fontWeight: 600 }}>{selectedRequest.locId}</div>
                </div>
                <div className="detail-item">
                  <label className="text-muted" style={{ fontSize: '10px', display: 'block', mb: '4px' }}>ODEX REF NO</label>
                  <div style={{ fontWeight: 700, color: '#2563eb' }}>
                    {selectedRequest.odexRefNo || "PENDING"}
                  </div>
                </div>
                <div className="detail-item">
                  <label className="text-muted" style={{ fontSize: '10px', display: 'block', mb: '4px' }}>CONTAINER COUNT</label>
                  <div style={{ fontWeight: 600 }}>{selectedRequest.cntrList?.length || selectedRequest.containers?.length || 0}</div>
                </div>
              </div>

              <div className="mt-4 p-3" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div className="d-flex gap-2 mb-2" style={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                  <Icons.Info /> API FEEDBACK
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  lineHeight: 1.6,
                  color: selectedRequest.status === "FAILED" ? "#ef4444" : "#334155"
                }}>
                  {selectedRequest.form13ApiResponse?.responseMessage || "Processing complete. No specific remarks from ODeX."}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setSelectedRequest(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Form Modal */}
      {cancelModalData && (
        <div className="modal-overlay" onClick={() => setCancelModalData(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3>Cancel Request</h3>
              <button
                className="close-btn"
                onClick={() => setCancelModalData(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: '#fef2f2', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <Icons.Cancel style={{ color: '#ef4444', width: '24px', height: '24px' }} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Are you sure?</h4>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  You are about to request cancellation for <strong>{cancelModalData.bookNo}</strong>. 
                  This action requires approval from the liner.
                </p>
              </div>

              <div className="form-group">
                <label>REASON FOR CANCELLATION <span className="required">*</span></label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={chaRemark}
                  onChange={(e) => setChaRemark(e.target.value)}
                  placeholder="e.g. Incorrect container details, Booking cancelled..."
                  style={{ resize: 'none' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setCancelModalData(null)}
                disabled={loading}
              >
                Dismiss
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancelSubmit}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrackF13;
