// src/components/Dashboard/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppbarComponent from "./AppbarComponent";
import "../styles/Dashboard.scss";

// --- Inline SVG Icons ---
const Icons = {
  VGM: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14h6" />
      <path d="M9 10h6" />
      <path d="M9 18h6" />
    </svg>
  ),
  Form: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M12 18v-6" />
      <path d="M8 15l4 3 4-3" />
    </svg>
  ),
  Status: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Logout: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Stats: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Ship: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Business: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4 8 4v14" />
      <path d="M17 21v-8H7v8" />
      <line x1="17" y1="17" x2="17" y2="17.01" />
      <line x1="17" y1="13" x2="17" y2="13.01" />
      <line x1="7" y1="13" x2="7" y2="13.01" />
      <line x1="7" y1="17" x2="7" y2="17.01" />
      <line x1="12" y1="13" x2="12" y2="13.01" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </svg>
  ),
  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, shippers, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const StatCard = ({ icon, value, label, variant = "blue" }) => (
    <div className={`stat-card variant-${variant}`}>
      <div className="stat-icon-wrapper">{icon}</div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );

  const FeatureCard = ({
    icon,
    title,
    description,
    buttonText,
    onClick,
    disabled = false,
  }) => (
    <div className={`feature-card ${disabled ? "disabled" : ""}`}>
      <div className="card-body">
        <div className="card-header">
          <div className="card-icon">{icon}</div>
          <h3>{title}</h3>
        </div>
        <p>{description}</p>
      </div>
      <div className="card-footer">
        <button onClick={onClick} disabled={disabled} className="btn-primary">
          {buttonText}
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <AppbarComponent />

      <main className="main-content">
        {/* Welcome Section */}
        <section className="welcome-banner">
          <div className="banner-content">
            <h2>Dashboard Overview</h2>
            <p>
              Manage your VGM & Form 13 submissions. Monitor status and
              authorized shippers.
            </p>

            <div className="banner-badges">
              <div className="badge">
                <Icons.Ship />
                <span>Line: {userData?.bnfCode || "All"}</span>
              </div>
              <div className="badge">
                <Icons.Business />
                <span>Port: {userData?.locId || "Multiple"}</span>
              </div>
            </div>
          </div>
          <div className="banner-decoration"></div>
        </section>

        {/* KPI / Stats Section */}
        {/* <section className="stats-grid">
          <StatCard
            icon={<Icons.VGM />}
            value="0"
            label="Today's VGM"
            variant="blue"
          />
          <StatCard
            icon={<Icons.Form />}
            value="0"
            label="Form 13 Today"
            variant="cyan"
          />
          <StatCard
            icon={<Icons.Status />}
            value="0"
            label="Pending Status"
            variant="orange"
          />
          <StatCard
            icon={<Icons.Stats />}
            value="0"
            label="Total Submissions"
            variant="green"
          />
        </section> */}

        {/* Main Features */}
        <section className="features-grid">
          <FeatureCard
            icon={<Icons.VGM />}
            title="VGM Submission"
            description="Submit Verified Gross Mass declarations per SOLAS requirements. Ensure compliance with shipping regulations."
            buttonText="Submit VGM"
            onClick={() => navigate("/vgm")}
          />
          <FeatureCard
            icon={<Icons.Form />}
            title="Form 13 Submission"
            description="Generate Export Gate Pass (Form 13) for container authorization. Direct API submission to lines."
            buttonText="Submit Form 13"
            onClick={() => navigate("/form13")}
          />
          <FeatureCard
            icon={<Icons.Status />}
            title="Track Requests"
            description="Monitor real-time status of your containers. View history and download confirmation reports."
            buttonText="Check Status"
            onClick={() => navigate("/vgm-status")}
          />
        </section>

        {/* Lower Section: Shippers & Quick Actions */}
        <div className="lower-grid">
          {/* Authorized Shippers */}
          {shippers.length > 0 && (
            <div className="panel shippers-panel">
              <div className="panel-header">
                <h3>
                  <Icons.Business /> Authorized Shippers
                </h3>
                <span className="counter-badge">{shippers.length} Active</span>
              </div>
              <div className="panel-body">
                <div className="shipper-list">
                  {shippers.map((shipper, index) => (
                    <div key={index} className="shipper-item">
                      <span className="status-dot"></span>
                      <span className="shipper-name">{shipper.shipperNm}</span>
                      <span className="shipper-reg">
                        {shipper.shipperRegNo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sidebar / Quick Actions */}
          <div className="sidebar-column">
            <div className="panel quick-actions-panel">
              <div className="panel-header">
                <h3>Quick Shortcuts</h3>
              </div>
              <div className="action-list">
                <button
                  onClick={() => navigate("/vgm")}
                  className="action-link"
                >
                  New VGM Submission <span>&rarr;</span>
                </button>
                <button
                  onClick={() => navigate("/form13")}
                  className="action-link"
                >
                  New Form 13 <span>&rarr;</span>
                </button>
                <button
                  onClick={() => navigate("/vgm-status")}
                  className="action-link"
                >
                  View All Submissions <span>&rarr;</span>
                </button>
              </div>
            </div>

            <div className="system-status-card">
              <div className="status-indicator">
                <span className="pulse-dot"></span>
                <span>System Operational</span>
              </div>
              <p>ODeX API Connection: Stable</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
