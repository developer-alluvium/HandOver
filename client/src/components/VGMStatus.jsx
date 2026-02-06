import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSnackbar } from "notistack";
import { vgmAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import TopNavDropdown from "./TopNavDropdown";
import { useNavigate } from "react-router-dom";
import "../styles/VGM.scss";

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
  Search: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
};

// Port mapping for display
const PORT_MAP = {
  "INMUN1": "Mundra",
  "INPAV1": "Pipavav",
  "INHZA1": "Hazira",
  "INNSA1": "Nhava Sheva",
  "INNML1": "Mangalore",
  "INTUT1": "Tuticorin",
  "INCCU1": "Kolkata",
  "INMRM1": "Marmagoa",
  "INCOK1": "Cochin",
  "INMAA1": "Chennai",
  "INVTZ1": "Vishakapatnam",
  "INHAL1": "Haldia",
  "INKRI1": "Krishnapatnam",
  "INKAT1": "Kattupalli",
  "INPRT1": "Paradip",
  "INIXY1": "Kandla",
  "INKAK1": "Kakinada",
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return dayjs().format("YYYY-MM-DD");
};

const VGMStatus = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters with date defaults - From Date defaults to today
  const [containerSearch, setContainerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState(getTodayDate());
  const [dateTo, setDateTo] = useState(getTodayDate());
  const debounceTimerRef = useRef(null);

  const fetchVGMRequests = useCallback(async (page = 1, containerNo = "", status = "", fromDate = "", toDate = "") => {
    setLoading(true);
    try {
      const filterParams = { page, limit: pagination.limit };
      if (containerNo) filterParams.search = containerNo; // Use 'search' param for generic container/booking search
      if (status) filterParams.status = status;
      if (fromDate) filterParams.dateFrom = fromDate;
      if (toDate) filterParams.dateTo = toDate;

      const response = await vgmAPI.getRequests(filterParams);
      const { requests: data, pagination: meta } = response.data;
      setRequests(data);
      setPagination((prev) => ({
        ...prev,
        page: meta.page,
        total: meta.total,
        pages: meta.pages,
      }));
    } catch (error) {
      setRequests([]); // Clear data on error to avoid showing stale results
      enqueueSnackbar("Failed to load requests", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, enqueueSnackbar]);

  // Debounced search handler - 2 seconds delay
  const handleContainerSearchChange = (value) => {
    setContainerSearch(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer with 2 second delay
    debounceTimerRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchVGMRequests(1, value, statusFilter, dateFrom, dateTo);
    }, 2000);
  };

  // Status filter change - immediate search
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchVGMRequests(1, containerSearch, value, dateFrom, dateTo);
  };

  // Date filter change - immediate search
  const handleDateFromChange = (value) => {
    setDateFrom(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchVGMRequests(1, containerSearch, statusFilter, value, dateTo);
  };

  const handleDateToChange = (value) => {
    setDateTo(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchVGMRequests(1, containerSearch, statusFilter, dateFrom, value);
  };

  // Check if request is verified - disable edit if verified
  const isVerified = (req) => {
    const displayStatus = getDisplayStatus(req);
    return displayStatus === "Verified";
  };

  const handleEditRequest = (request) => {
    if (isVerified(request)) {
      enqueueSnackbar("Cannot edit a verified request", { variant: "warning" });
      return;
    }
    navigate("/vgm", { state: { editMode: true, vgmId: request.vgmId } });
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setContainerSearch("");
    setStatusFilter("");
    setDateFrom(getTodayDate()); // Reset to today
    setDateTo(getTodayDate()); // Reset to today
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchVGMRequests(1, "", "", getTodayDate(), getTodayDate());
  };

  // --- Logic 1: Determine Display Status ---
  const getDisplayStatus = (req) => {
    // Handle string responses (errors)
    if (
      typeof req.response === "string" &&
      req.response.trim().toUpperCase().startsWith("ERROR")
    ) {
      return "Pending";
    }

    // Check cntnrStatus from the request object directly (not nested in response)
    if (req.cntnrStatus) {
      const s = req.cntnrStatus.toLowerCase();
      if (s.includes("verified")) return "Verified";
      if (s.includes("success")) return "Verified"; // If status is "success", treat as Verified
    }

    // Handle object responses - check if cntnrStatus exists in response
    if (
      req.response &&
      typeof req.response === "object" &&
      req.response.cntnrStatus
    ) {
      const s = req.response.cntnrStatus.toLowerCase();
      if (s.includes("verified")) return "Verified";
      if (s.includes("success")) return "Verified";
    }

    return "Pending";
  };

  const getStatusBadgeClass = (displayStatus) => {
    return displayStatus === "Verified" ? "badge-success" : "badge-warning";
  };

  // --- Logic 2: Get Remarks ---
  const getRemarks = (req) => {
    // If response is a string (error or success message)
    if (typeof req.response === "string") {
      // Check if it's an error
      if (req.response.trim().toUpperCase().startsWith("ERROR")) {
        return req.response;
      }
      // Check if it's SUCCESS and cntnrStatus is verified
      if (
        req.response === "SUCCESS" &&
        req.cntnrStatus &&
        req.cntnrStatus.toLowerCase().includes("verified")
      ) {
        return "Submitted Successfully";
      }
    }

    const status = getDisplayStatus(req);
    if (status === "Verified") return "Submitted Successfully";

    return "Processing / Awaiting Confirmation";
  };

  // Get port name from port code
  const getPortName = (portCode) => {
    return PORT_MAP[portCode] || portCode || "N/A";
  };

  // Initial load - with today's date as From Date and To Date
  useEffect(() => {
    fetchVGMRequests(1, "", "", getTodayDate(), getTodayDate());
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="vgm-container">
      <TopNavDropdown />
      <div className="page-header">
        <h2>VGM Management</h2>
      </div>

      {/* Filters */}
      <div className="panel">
        <div className="d-flex mb-4 gap-2" style={{ fontWeight: 600 }}>
          <Icons.Filter /> Filters
        </div>
        <div
          className="form-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          <div className="form-group">
            <label>Status</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="">All</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="form-group">
            <label>Container / Booking</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-control"
                placeholder="Search Container or Booking..."
                value={containerSearch}
                onChange={(e) => handleContainerSearchChange(e.target.value)}
                style={{ paddingRight: "35px" }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              >
                <Icons.Search />
              </span>
            </div>
            <small style={{ color: "#6b7280", fontSize: "0.75rem" }}>
              Auto-searches after 2 seconds
            </small>
          </div>
          <div className="form-group">
            <label>From Date</label>
            <input
              type="date"
              className="form-control"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input
              type="date"
              className="form-control"
              value={dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
            />
          </div>
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}
          >
            <button
              className="btn btn-outline w-full"
              onClick={handleClearFilters}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="panel">
        <div className="d-flex justify-between mb-4">
          <h3>Requests ({pagination.total})</h3>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/vgm")}
            >
              + New VGM
            </button>
            <button
              className="btn btn-outline"
              onClick={() => fetchVGMRequests(pagination.page, containerSearch, statusFilter, dateFrom, dateTo)}
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
                    <th>Actions</th>
                    <th>Shipping Line</th>
                    <th>Container</th>
                    <th>Booking</th>
                    <th>Status</th>
                    <th>Port</th>
                    <th>VGM Weight</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, i) => {
                    const displayStatus = getDisplayStatus(req);
                    const remarks = getRemarks(req);
                    const verified = isVerified(req);

                    return (
                      <tr key={i}>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline"
                              title="View"
                              onClick={() => setSelectedRequest(req)}
                            >
                              <Icons.Eye />
                            </button>
                            <button
                              className={`btn btn-sm btn-outline ${verified ? "btn-disabled" : ""}`}
                              title={verified ? "Cannot edit verified request" : "Edit"}
                              onClick={() => handleEditRequest(req)}
                              disabled={verified}
                              style={verified ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                            >
                              <Icons.Edit />
                            </button>
                          </div>
                        </td>
                        <td>{req.linerId || "N/A"}</td>
                        <td>{req.cntnrNo}</td>
                        <td>{req.bookNo}</td>
                        <td>
                          <span
                            className={`badge ${getStatusBadgeClass(
                              displayStatus
                            )}`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td>{getPortName(req.locId)}</td>
                        <td>
                          {req.totWt ? `${req.totWt} ${req.totWtUom}` : "N/A"}
                        </td>
                        <td>
                          {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
                        </td>
                      </tr>
                    );
                  })}
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
                    onClick={() => fetchVGMRequests(pagination.page - 1, containerSearch, statusFilter, dateFrom, dateTo)}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchVGMRequests(pagination.page + 1, containerSearch, statusFilter, dateFrom, dateTo)}
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
              <h3>Details: {selectedRequest.vgmId}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div>
                  <label className="text-muted">Shipping Line</label>
                  <div>{selectedRequest.linerId || "N/A"}</div>
                </div>
                <div>
                  <label className="text-muted">Container</label>
                  <div>{selectedRequest.cntnrNo}</div>
                </div>
                <div>
                  <label className="text-muted">Status</label>
                  <div>{getDisplayStatus(selectedRequest)}</div>
                </div>
                <div>
                  <label className="text-muted">Port</label>
                  <div>{getPortName(selectedRequest.locId)}</div>
                </div>
                <div>
                  <label className="text-muted">VGM Weight</label>
                  <div>
                    {selectedRequest.totWt} {selectedRequest.totWtUom}
                  </div>
                </div>
                <div>
                  <label className="text-muted">Booking</label>
                  <div>{selectedRequest.bookNo}</div>
                </div>
                <div>
                  <label className="text-muted">Remarks</label>
                  <div style={{ color: "#dc2626", fontWeight: 600 }}>
                    {getRemarks(selectedRequest)}
                  </div>
                </div>
                <div>
                  <label className="text-muted">Time</label>
                  <div>{selectedRequest.weighBridgeWtTs || "N/A"}</div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-muted">Full API Response</label>
                <pre
                  style={{
                    background: "#f1f5f9",
                    padding: "1rem",
                    borderRadius: "4px",
                    overflowX: "auto",
                    maxHeight: "200px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {typeof selectedRequest.response === "string"
                    ? selectedRequest.response
                    : JSON.stringify(selectedRequest.response || {}, null, 2)}
                </pre>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VGMStatus;
