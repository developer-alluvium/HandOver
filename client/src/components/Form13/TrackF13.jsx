import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { form13API } from "../../services/form13API";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import TopNavDropdown from "../TopNavDropdown";
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
};

const TrackF13 = () => {
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
    switch (status?.toUpperCase()) {
      case "SUBMITTED":
        return "badge-success";
      case "FAILED":
        return "badge-danger";
      default:
        return "badge-warning";
    }
  };

  // Initial load
  useEffect(() => {
    fetchF13Requests(1);
  }, []);

  return (
    <div className="form13-container">
      <TopNavDropdown />
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h2>Form 13 Tracking</h2>
      </div>

      {/* Filters */}
      <div className="panel">
        <div className="d-flex mb-4 gap-2" style={{ fontWeight: 600 }}>
          <Icons.Filter /> Filters
        </div>
        <div
          className="form-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
              <option value="">All</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div className="form-group">
            <label>Container No</label>
            <input
              className="form-control"
              placeholder="ABCD1234567"
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
              placeholder="BK001"
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
              className="btn btn-primary w-full"
              onClick={handleApplyFilters}
            >
              Apply
            </button>
            <button
              className="btn btn-outline w-full"
              onClick={handleClearFilters}
            >
              Clear
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
                    <th>Actions</th>
                    <th>Booking No</th>
                    <th>Vessel</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Containers</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, i) => (
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
                            className="btn btn-sm btn-outline"
                            title="Edit"
                            onClick={() => handleEditRequest(req)}
                          >
                            <Icons.Edit />
                          </button>
                        </div>
                      </td>
                      <td>{req.bookNo}</td>
                      <td>{req.vesselNm}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>{dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}</td>
                      <td>{req.containers?.length || 0}</td>
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
              <h3>Details: {selectedRequest.bookNo}</h3>
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
                  <label className="text-muted">Status</label>
                  <div>{selectedRequest.status}</div>
                </div>
                <div>
                  <label className="text-muted">Vessel</label>
                  <div>{selectedRequest.vesselNm}</div>
                </div>
                <div>
                  <label className="text-muted">Booking No</label>
                  <div>{selectedRequest.bookNo}</div>
                </div>
                <div>
                  <label className="text-muted">Location</label>
                  <div>{selectedRequest.locId}</div>
                </div>
                <div>
                  <label className="text-muted">ODeX Ref No</label>
                  <div style={{ fontWeight: 600 }}>
                    {selectedRequest.odexRefNo || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-muted">Containers</label>
                  <div>{selectedRequest.containers?.length || 0}</div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-muted">API Response Remarks</label>
                <div style={{
                  background: "#f1f5f9",
                  padding: "1rem",
                  borderRadius: "4px",
                  color: selectedRequest.status === "FAILED" ? "#dc2626" : "inherit"
                }}>
                  {selectedRequest.form13ApiResponse?.responseMessage || "No remarks available"}
                </div>
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

export default TrackF13;
