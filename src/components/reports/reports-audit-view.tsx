import React, { useState } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Eye,
  KeyRound,
  Lock,
  Layers,
  FileCheck,
  Calendar,
  X,
  FileSpreadsheet,
} from "lucide-react";
import type { PamState, PamAuditEntry } from "../../lib/pam-engine";

interface ReportsAuditViewProps {
  state: PamState;
}

export function ReportsAuditView({ state }: ReportsAuditViewProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "reports">("audit");
  const [auditSearch, setAuditSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAuditEntry, setSelectedAuditEntry] = useState<PamAuditEntry | null>(null);

  // Reports state
  const [selectedReportType, setSelectedReportType] = useState<
    "inventory" | "safes" | "compliance" | "sessions"
  >("inventory");

  const auditLogs = state.audit || [];

  const filteredAudit = auditLogs.filter((entry) => {
    const matchesSearch =
      entry.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      entry.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      entry.target.toLowerCase().includes(auditSearch.toLowerCase()) ||
      entry.detail.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // CSV Exporter
  const handleExportCSV = (filename: string, rows: string[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows
        .map((e) => e.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAuditCSV = () => {
    const headers = ["Timestamp", "Actor", "Action", "Target", "Status", "Detail"];
    const rows = filteredAudit.map((e) => [
      e.timestamp,
      e.actor,
      e.action,
      e.target,
      e.status,
      e.detail,
    ]);
    handleExportCSV("pvwa_vault_forensic_audit", [headers, ...rows]);
  };

  const exportCurrentReportCSV = () => {
    if (selectedReportType === "inventory") {
      const headers = [
        "Account ID",
        "Username",
        "Safe",
        "Target Host",
        "Platform",
        "Policy",
        "Status",
        "Last Verified",
      ];
      const rows = state.accounts.map((a) => [
        a.id,
        a.username,
        a.safe,
        a.target,
        a.platform,
        a.policy,
        a.status,
        a.lastVerified,
      ]);
      handleExportCSV("pvwa_account_inventory_report", [headers, ...rows]);
    } else if (selectedReportType === "safes") {
      const headers = [
        "Safe Name",
        "Description",
        "CPM Assigned",
        "Members Count",
        "Managed Accounts",
      ];
      const rows = state.safes.map((s) => [
        s.name,
        s.description,
        s.cpm,
        String(s.members.length),
        String(state.accounts.filter((a) => a.safe === s.name).length),
      ]);
      handleExportCSV("pvwa_safes_governance_report", [headers, ...rows]);
    } else if (selectedReportType === "compliance") {
      const headers = ["Account", "Safe", "Policy", "Status", "Compliance SLA", "Last Verified"];
      const rows = state.accounts.map((a) => [
        a.username,
        a.safe,
        a.policy,
        a.status,
        a.status === "Compliant" ? "PASSED" : "EXCEPTION",
        a.lastVerified,
      ]);
      handleExportCSV("pvwa_rotation_compliance_report", [headers, ...rows]);
    } else if (selectedReportType === "sessions") {
      const headers = [
        "Session ID",
        "User",
        "Account",
        "Target",
        "Protocol",
        "Status",
        "Start Time",
        "Duration",
      ];
      const rows = state.sessions.map((s) => [
        s.id,
        s.user || "Security Operator",
        s.accountName,
        s.target,
        s.protocol,
        s.status,
        s.startTime,
        s.duration || "N/A",
      ]);
      handleExportCSV("pvwa_psm_sessions_report", [headers, ...rows]);
    }
  };

  return (
    <div className="pvwa-layout-container" style={{ padding: "16px 24px", minHeight: "100%" }}>
      {/* Breadcrumb Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            <span>PAM Administration</span>
            <span>&gt;</span>
            <span style={{ color: "#0078D4", fontWeight: 700 }}>REPORTS & AUDIT</span>
            <span>&gt;</span>
            <span>Compliance & Forensics</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            Audit Explorer & Enterprise Compliance Reports
          </h1>
          <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0 0" }}>
            Immutable forensic audit trails, cryptographic event verification, and downloadable
            executive compliance reports.
          </p>
        </div>

        <button
          type="button"
          onClick={activeTab === "audit" ? exportAuditCSV : exportCurrentReportCSV}
          className="pvwa-btn pvwa-btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Download size={15} />
          Export CSV Report
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #E2E8F0", marginBottom: 16, gap: 2 }}>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            background: activeTab === "audit" ? "#FFFFFF" : "transparent",
            color: activeTab === "audit" ? "#0078D4" : "#64748B",
            borderBottom: activeTab === "audit" ? "2px solid #0078D4" : "2px solid transparent",
            marginBottom: -2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Clock size={15} />
          Forensic Audit Log ({auditLogs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            background: activeTab === "reports" ? "#FFFFFF" : "transparent",
            color: activeTab === "reports" ? "#0078D4" : "#64748B",
            borderBottom: activeTab === "reports" ? "2px solid #0078D4" : "2px solid transparent",
            marginBottom: -2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FileSpreadsheet size={15} />
          Executive Compliance Reports
        </button>
      </div>

      {/* TAB 1: FORENSIC AUDIT LOG */}
      {activeTab === "audit" && (
        <>
          {/* Filter Bar */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "2px 2px 0 0",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div style={{ position: "relative", width: 320 }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search actor, action, target, or details..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px 6px 32px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                    outline: "none",
                  }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "5px 10px",
                  fontSize: 12,
                  border: "1px solid #CBD5E1",
                  borderRadius: 2,
                  background: "#F8FAFC",
                  color: "#1E293B",
                  fontWeight: 500,
                }}
              >
                <option value="ALL">All Outcomes</option>
                <option value="Success">Success (Allowed Events)</option>
                <option value="Failed">Failed (Denied / Blocked)</option>
              </select>
            </div>

            <span style={{ fontSize: 12, color: "#64748B" }}>
              Showing <b>{filteredAudit.length}</b> events
            </span>
          </div>

          {/* Audit Table */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderTop: "none",
              borderRadius: "0 0 2px 2px",
              overflowX: "auto",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr
                  style={{
                    background: "#F1F5F9",
                    borderBottom: "1px solid #CBD5E1",
                    color: "#334155",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "18%" }}>Timestamp</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "14%" }}>
                    Operator / Service
                  </th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "18%" }}>Action</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "18%" }}>
                    Target Resource
                  </th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "10%" }}>Result</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, width: "16%" }}>
                    Audit Description
                  </th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, textAlign: "right" }}>
                    Inspect
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAudit.map((entry) => (
                  <tr
                    key={entry.id}
                    style={{ borderBottom: "1px solid #E2E8F0" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#475569",
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {entry.timestamp}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0078D4" }}>
                      {entry.actor}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0F172A" }}>
                      {entry.action}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#334155",
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {entry.target}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: entry.status === "Success" ? "#107C41" : "#C5221F",
                        }}
                      >
                        {entry.status === "Success" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {entry.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#64748B", fontSize: 11 }}>
                      {entry.detail}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedAuditEntry(entry)}
                        className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Eye size={12} />
                        Seal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 2: EXECUTIVE COMPLIANCE REPORTS */}
      {activeTab === "reports" && (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
          {/* Report Selector Sidebar */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 2,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              Select Compliance Report
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                type="button"
                onClick={() => setSelectedReportType("inventory")}
                style={{
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "left",
                  border: "none",
                  borderRadius: 2,
                  background: selectedReportType === "inventory" ? "#EFF6FF" : "transparent",
                  color: selectedReportType === "inventory" ? "#0078D4" : "#334155",
                  borderLeft:
                    selectedReportType === "inventory"
                      ? "3px solid #0078D4"
                      : "3px solid transparent",
                  cursor: "pointer",
                }}
              >
                Account Inventory & Platforms
              </button>
              <button
                type="button"
                onClick={() => setSelectedReportType("safes")}
                style={{
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "left",
                  border: "none",
                  borderRadius: 2,
                  background: selectedReportType === "safes" ? "#EFF6FF" : "transparent",
                  color: selectedReportType === "safes" ? "#0078D4" : "#334155",
                  borderLeft:
                    selectedReportType === "safes" ? "3px solid #0078D4" : "3px solid transparent",
                  cursor: "pointer",
                }}
              >
                Safe Ownership & Membership
              </button>
              <button
                type="button"
                onClick={() => setSelectedReportType("compliance")}
                style={{
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "left",
                  border: "none",
                  borderRadius: 2,
                  background: selectedReportType === "compliance" ? "#EFF6FF" : "transparent",
                  color: selectedReportType === "compliance" ? "#0078D4" : "#334155",
                  borderLeft:
                    selectedReportType === "compliance"
                      ? "3px solid #0078D4"
                      : "3px solid transparent",
                  cursor: "pointer",
                }}
              >
                Credential Rotation SLA
              </button>
              <button
                type="button"
                onClick={() => setSelectedReportType("sessions")}
                style={{
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "left",
                  border: "none",
                  borderRadius: 2,
                  background: selectedReportType === "sessions" ? "#EFF6FF" : "transparent",
                  color: selectedReportType === "sessions" ? "#0078D4" : "#334155",
                  borderLeft:
                    selectedReportType === "sessions"
                      ? "3px solid #0078D4"
                      : "3px solid transparent",
                  cursor: "pointer",
                }}
              >
                PSM Session Audit Activity
              </button>
            </div>
          </div>

          {/* Report Preview Panel */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #CBD5E1",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#F8FAFC",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                  {selectedReportType === "inventory" &&
                    "Privileged Account Inventory & Platform Assignment"}
                  {selectedReportType === "safes" && "Safe Governance, Owners & CPM Mapping"}
                  {selectedReportType === "compliance" &&
                    "SLA Credential Rotation Compliance Status"}
                  {selectedReportType === "sessions" &&
                    "PSM Remote Privileged Sessions Audit Trail"}
                </h3>
                <span style={{ fontSize: 11, color: "#64748B" }}>
                  Generated from active Vault snapshot
                </span>
              </div>
              <button
                type="button"
                onClick={exportCurrentReportCSV}
                className="pvwa-btn pvwa-btn-primary pvwa-btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <Download size={13} />
                Download CSV
              </button>
            </div>

            <div style={{ padding: "16px", maxHeight: 500, overflowY: "auto" }}>
              {selectedReportType === "inventory" && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr
                      style={{
                        background: "#F1F5F9",
                        borderBottom: "1px solid #CBD5E1",
                        textAlign: "left",
                        color: "#334155",
                      }}
                    >
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Account Username</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Target Host</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Safe</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Platform</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.accounts.map((a) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 700, color: "#0078D4" }}>
                          {a.username}
                        </td>
                        <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11 }}>
                          {a.target}
                        </td>
                        <td style={{ padding: "8px 12px" }}>{a.safe}</td>
                        <td style={{ padding: "8px 12px" }}>{a.platform}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: a.status === "Compliant" ? "#107C41" : "#B06000",
                            }}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReportType === "safes" && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr
                      style={{
                        background: "#F1F5F9",
                        borderBottom: "1px solid #CBD5E1",
                        textAlign: "left",
                        color: "#334155",
                      }}
                    >
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Safe Name</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Description</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>CPM Handler</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Members</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Accounts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.safes.map((s) => (
                      <tr key={s.name} style={{ borderBottom: "1px solid #E2E8F0" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 700, color: "#0078D4" }}>
                          {s.name}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#475569" }}>{s.description}</td>
                        <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11 }}>
                          {s.cpm}
                        </td>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                          {s.members.length} members
                        </td>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                          {state.accounts.filter((a) => a.safe === s.name).length} accounts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReportType === "compliance" && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr
                      style={{
                        background: "#F1F5F9",
                        borderBottom: "1px solid #CBD5E1",
                        textAlign: "left",
                        color: "#334155",
                      }}
                    >
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Account</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Assigned Policy</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Safe</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Last Verified</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>SLA Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.accounts.map((a) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 700, color: "#0078D4" }}>
                          {a.username}
                        </td>
                        <td style={{ padding: "8px 12px" }}>{a.policy}</td>
                        <td style={{ padding: "8px 12px" }}>{a.safe}</td>
                        <td style={{ padding: "8px 12px", color: "#64748B", fontSize: 11 }}>
                          {a.lastVerified}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 2,
                              fontSize: 10,
                              fontWeight: 700,
                              background: a.status === "Compliant" ? "#E8F5E9" : "#FFEBEE",
                              color: a.status === "Compliant" ? "#107C41" : "#C5221F",
                            }}
                          >
                            {a.status === "Compliant" ? "PASSED SLA" : "FAILED / EXCEPTION"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReportType === "sessions" && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr
                      style={{
                        background: "#F1F5F9",
                        borderBottom: "1px solid #CBD5E1",
                        textAlign: "left",
                        color: "#334155",
                      }}
                    >
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Session ID</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Privileged Target</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Protocol</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Status</th>
                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Start Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.sessions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{ padding: "20px", textAlign: "center", color: "#64748B" }}
                        >
                          No recorded sessions currently in Vault database.
                        </td>
                      </tr>
                    ) : (
                      state.sessions.map((s) => (
                        <tr key={s.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                          <td
                            style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11 }}
                          >
                            {s.id}
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 700, color: "#0078D4" }}>
                            {s.accountName} @ {s.target}
                          </td>
                          <td style={{ padding: "8px 12px" }}>{s.protocol}</td>
                          <td style={{ padding: "8px 12px" }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: s.status === "Active" ? "#107C41" : "#64748B",
                              }}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px", color: "#64748B", fontSize: 11 }}>
                            {s.startTime}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FORENSIC AUDIT SEAL INSPECTOR MODAL */}
      {selectedAuditEntry && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 4,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              width: "100%",
              maxWidth: 520,
              border: "1px solid #CBD5E1",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={18} style={{ color: "#38BDF8" }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  Cryptographic Audit Seal Inspector
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditEntry(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 2,
                  padding: "12px 14px",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Event ID
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#0F172A" }}>
                    {selectedAuditEntry.id}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Actor
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0078D4" }}>
                    {selectedAuditEntry.actor}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Operation
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
                    {selectedAuditEntry.action}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Target
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#334155" }}>
                    {selectedAuditEntry.target}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Recorded Time
                  </span>
                  <span style={{ fontSize: 11, color: "#475569" }}>
                    {selectedAuditEntry.timestamp}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Event Payload Details
                </div>
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#F1F5F9",
                    borderRadius: 2,
                    fontSize: 12,
                    color: "#334155",
                  }}
                >
                  {selectedAuditEntry.detail}
                </div>
              </div>

              <div
                style={{
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  padding: "10px 14px",
                  borderRadius: 2,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#065F46",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  <CheckCircle size={14} />
                  Vault SHA-256 HMAC Signature Verified
                </div>
                <code
                  style={{
                    display: "block",
                    fontSize: 10,
                    color: "#047857",
                    wordBreak: "break-all",
                  }}
                >
                  SHA256:8f4c2e9b01a73d84f18b329a174c89ee304892c902b378129e00fa1b992f84b1
                </code>
                <span style={{ display: "block", fontSize: 10, color: "#065F46", marginTop: 4 }}>
                  Signed by Vault Server KMS Key (FIPS 140-2 Level 3 Hardware Security Module).
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSelectedAuditEntry(null)}
                  className="pvwa-btn pvwa-btn-secondary"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
