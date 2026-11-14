import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Clock,
  KeyRound,
  FileText,
  Sliders,
  AlertCircle,
  X,
  Edit2,
  Server,
  Layers,
} from "lucide-react";
import type { PamState, PamPolicy } from "../../lib/pam-engine";

interface PoliciesManagementViewProps {
  state: PamState;
  onAddPolicy: (input: {
    name: string;
    platform: string;
    description: string;
    rotationIntervalDays: number;
    minPasswordLength: number;
    passwordComplexity: string;
    requireDualControl: boolean;
    requireTicket: boolean;
    cpmId?: string;
  }) => { error?: string };
  onUpdatePolicy: (policyId: string, updates: Partial<PamPolicy>) => { error?: string };
}

export function PoliciesManagementView({
  state,
  onAddPolicy,
  onUpdatePolicy,
}: PoliciesManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [selectedPolicy, setSelectedPolicy] = useState<PamPolicy | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");

  // Add form state
  const [newPolicyName, setNewPolicyName] = useState("");
  const [newPlatform, setNewPlatform] = useState("Windows Server Local");
  const [newDescription, setNewDescription] = useState("");
  const [newInterval, setNewInterval] = useState(90);
  const [newMinLength, setNewMinLength] = useState(24);
  const [newComplexity, setNewComplexity] = useState("Upper, lower, digits, symbols");
  const [newDualControl, setNewDualControl] = useState(false);
  const [newRequireTicket, setNewRequireTicket] = useState(false);

  // Edit form state
  const [editInterval, setEditInterval] = useState(90);
  const [editMinLength, setEditMinLength] = useState(24);
  const [editComplexity, setEditComplexity] = useState("");
  const [editDualControl, setEditDualControl] = useState(false);
  const [editRequireTicket, setEditRequireTicket] = useState(false);
  const [editStatus, setEditStatus] = useState<"Active" | "Draft" | "Disabled">("Active");

  const policies = state.policies || [];

  // Filtered policies
  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.platform.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform =
      platformFilter === "ALL" || p.platform.toLowerCase().includes(platformFilter.toLowerCase());
    return matchesSearch && matchesPlatform;
  });

  // Calculate accounts mapped to each policy
  const getAccountCountForPolicy = (policyName: string) => {
    return state.accounts.filter((a) => a.policy.toLowerCase() === policyName.toLowerCase()).length;
  };

  const handleOpenAdd = () => {
    setNewPolicyName("");
    setNewPlatform("Windows Server Local");
    setNewDescription("");
    setNewInterval(90);
    setNewMinLength(24);
    setNewComplexity("Upper, lower, digits, symbols");
    setNewDualControl(false);
    setNewRequireTicket(false);
    setModalError("");
    setIsAddModalOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    const res = onAddPolicy({
      name: newPolicyName,
      platform: newPlatform,
      description: newDescription,
      rotationIntervalDays: Number(newInterval),
      minPasswordLength: Number(newMinLength),
      passwordComplexity: newComplexity,
      requireDualControl: newDualControl,
      requireTicket: newRequireTicket,
      cpmId: "CPM-PROD-01",
    });
    if (res.error) {
      setModalError(res.error);
    } else {
      setIsAddModalOpen(false);
    }
  };

  const handleOpenEdit = (policy: PamPolicy) => {
    setSelectedPolicy(policy);
    setEditInterval(policy.rotationIntervalDays);
    setEditMinLength(policy.minPasswordLength);
    setEditComplexity(policy.passwordComplexity);
    setEditDualControl(policy.requireDualControl);
    setEditRequireTicket(policy.requireTicket);
    setEditStatus(policy.status);
    setModalError("");
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    setModalError("");
    const res = onUpdatePolicy(selectedPolicy.id, {
      rotationIntervalDays: Number(editInterval),
      minPasswordLength: Number(editMinLength),
      passwordComplexity: editComplexity,
      requireDualControl: editDualControl,
      requireTicket: editRequireTicket,
      status: editStatus,
    });
    if (res.error) {
      setModalError(res.error);
    } else {
      setIsEditModalOpen(false);
      setSelectedPolicy(null);
    }
  };

  // Metrics
  const totalPolicies = policies.length;
  const dualControlCount = policies.filter((p) => p.requireDualControl).length;
  const highFrequencyCount = policies.filter((p) => p.rotationIntervalDays <= 30).length;

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
            <span style={{ color: "#0078D4", fontWeight: 700 }}>POLICIES</span>
            <span>&gt;</span>
            <span>Platform Governance</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            Master Policy & Platform Rules Engine
          </h1>
          <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0 0" }}>
            Enforce automated credential rotation cycles, complexity requirements, dual-control
            approvals, and ticketing workflows.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="pvwa-btn pvwa-btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Plus size={16} />
          Create Policy
        </button>
      </div>

      {/* Metrics Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderLeft: "4px solid #0078D4",
            padding: "12px 16px",
            borderRadius: 2,
          }}
        >
          <div
            style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}
          >
            Total Master Policies
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
            {totalPolicies}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Platforms configured in Vault
          </div>
        </div>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderLeft: "4px solid #107C41",
            padding: "12px 16px",
            borderRadius: 2,
          }}
        >
          <div
            style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}
          >
            Dual-Control Enforced
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#107C41", marginTop: 4 }}>
            {dualControlCount}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Require authorized sign-off
          </div>
        </div>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderLeft: "4px solid #B06000",
            padding: "12px 16px",
            borderRadius: 2,
          }}
        >
          <div
            style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}
          >
            High Frequency (≤30 Days)
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#B06000", marginTop: 4 }}>
            {highFrequencyCount}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Strict domain/financial accounts
          </div>
        </div>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderLeft: "4px solid #5C2D91",
            padding: "12px 16px",
            borderRadius: 2,
          }}
        >
          <div
            style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}
          >
            Assigned CPM Target
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#5C2D91", marginTop: 6 }}>
            CPM-PROD-01
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
            Primary password manager online
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
          <div style={{ position: "relative", width: 280 }}>
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
              placeholder="Search policies or platforms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <Filter size={14} style={{ color: "#64748B" }} />
            <span style={{ color: "#475569", fontWeight: 600 }}>Platform:</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
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
              <option value="ALL">All Platforms ({policies.length})</option>
              <option value="Windows">Windows Server</option>
              <option value="Domain">Active Directory Domain</option>
              <option value="Linux">Linux / Unix SSH</option>
              <option value="Database">Database Engine</option>
              <option value="Service">Windows Service</option>
            </select>
          </div>
        </div>

        <span style={{ fontSize: 12, color: "#64748B" }}>
          Showing <b>{filteredPolicies.length}</b> of <b>{policies.length}</b> policies
        </span>
      </div>

      {/* PVWA Classic Policy Inventory Table */}
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
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "20%" }}>Policy Name</th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "18%" }}>Platform Type</th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "12%" }}>
                Rotation Cycle
              </th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "12%" }}>
                Password Rules
              </th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "12%" }}>Dual Control</th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "10%" }}>Accounts</th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "8%" }}>Status</th>
              <th style={{ padding: "10px 14px", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPolicies.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#64748B" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Sliders size={24} style={{ color: "#94A3B8" }} />
                    <span>No policies match the selected filter criteria.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPolicies.map((policy) => {
                const assignedAccounts = getAccountCountForPolicy(policy.name);
                return (
                  <tr
                    key={policy.id}
                    style={{
                      borderBottom: "1px solid #E2E8F0",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "10px 14px" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0078D4",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Lock size={13} style={{ color: "#0078D4" }} />
                        {policy.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                        {policy.description}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6, color: "#1E293B" }}
                      >
                        <Server size={13} style={{ color: "#64748B" }} />
                        <span>{policy.platform}</span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#64748B",
                          background: "#F1F5F9",
                          padding: "1px 6px",
                          borderRadius: 2,
                        }}
                      >
                        {policy.cpmId}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontWeight: 600,
                          color: policy.rotationIntervalDays <= 30 ? "#B06000" : "#1E293B",
                        }}
                      >
                        <Clock size={13} />
                        {policy.rotationIntervalDays} days
                      </div>
                      <span style={{ fontSize: 10, color: "#64748B" }}>Automatic CPM cycle</span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 600, color: "#1E293B" }}>
                        Min: {policy.minPasswordLength} chars
                      </div>
                      <span style={{ fontSize: 10, color: "#64748B" }}>
                        {policy.passwordComplexity}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {policy.requireDualControl ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#107C41",
                            background: "#E8F5E9",
                            padding: "2px 8px",
                            borderRadius: 2,
                          }}
                        >
                          <CheckCircle2 size={12} /> REQUIRED
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#64748B",
                            background: "#F1F5F9",
                            padding: "2px 8px",
                            borderRadius: 2,
                          }}
                        >
                          Direct Access
                        </span>
                      )}
                      {policy.requireTicket && (
                        <span
                          style={{ display: "block", fontSize: 10, color: "#0078D4", marginTop: 3 }}
                        >
                          + Ticket Validation
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontWeight: 700,
                          color: "#1E293B",
                          background: "#F1F5F9",
                          padding: "2px 8px",
                          borderRadius: 2,
                        }}
                      >
                        <KeyRound size={12} style={{ color: "#64748B" }} />
                        {assignedAccounts} accounts
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 2,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            policy.status === "Active"
                              ? "#E8F5E9"
                              : policy.status === "Draft"
                                ? "#FFF8E1"
                                : "#FFEBEE",
                          color:
                            policy.status === "Active"
                              ? "#107C41"
                              : policy.status === "Draft"
                                ? "#B06000"
                                : "#C5221F",
                        }}
                      >
                        {policy.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(policy)}
                        className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Edit2 size={12} />
                        Configure
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE POLICY MODAL */}
      {isAddModalOpen && (
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
              maxWidth: 540,
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
                  Define Enterprise Master Policy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
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

            <form onSubmit={handleSubmitAdd} style={{ padding: 20 }}>
              {modalError && (
                <div
                  style={{
                    background: "#FEE2E2",
                    border: "1px solid #F87171",
                    color: "#991B1B",
                    padding: "8px 12px",
                    borderRadius: 2,
                    fontSize: 12,
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{modalError}</span>
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Policy Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Windows-DomainAdmin-30d"
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Platform Target *
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                    background: "#FFFFFF",
                  }}
                >
                  <option value="Windows Server Local">Windows Server Local (Win-Admin)</option>
                  <option value="Active Directory Domain">
                    Active Directory Domain (Domain-Admin)
                  </option>
                  <option value="Linux Unix SSH">Linux / Unix SSH (Root / Sudo)</option>
                  <option value="Database Oracle / MSSQL">Database Oracle / MSSQL (DBA)</option>
                  <option value="Windows Service Accounts">Windows Service Accounts</option>
                  <option value="Cloud IAM AWS/Azure">Cloud IAM AWS/Azure Admin</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Enforces 30-day rotation on all domain-level admin accounts."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: 4,
                    }}
                  >
                    Rotation Interval: <span style={{ color: "#0078D4" }}>{newInterval} Days</span>
                  </label>
                  <input
                    type="range"
                    min="7"
                    max="180"
                    step="1"
                    value={newInterval}
                    onChange={(e) => setNewInterval(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: 4,
                    }}
                  >
                    Min Password Length:{" "}
                    <span style={{ color: "#0078D4" }}>{newMinLength} Chars</span>
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="64"
                    step="1"
                    value={newMinLength}
                    onChange={(e) => setNewMinLength(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Complexity Requirement
                </label>
                <select
                  value={newComplexity}
                  onChange={(e) => setNewComplexity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                    background: "#FFFFFF",
                  }}
                >
                  <option value="Upper, lower, digits, symbols">
                    Upper, Lower, Digits, Symbols (Strict)
                  </option>
                  <option value="Alphanumeric with symbols">
                    Alphanumeric with Symbols (Standard)
                  </option>
                  <option value="Alpha + digits only (Legacy)">
                    Alpha + Digits Only (Legacy Targets)
                  </option>
                </select>
              </div>

              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  padding: "10px 14px",
                  borderRadius: 2,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Governance & Access Controls
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#1E293B",
                    marginBottom: 6,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newDualControl}
                    onChange={(e) => setNewDualControl(e.target.checked)}
                  />
                  <span>Require Dual-Control Approval (Four-Eyes Principle)</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#1E293B",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newRequireTicket}
                    onChange={(e) => setNewRequireTicket(e.target.checked)}
                  />
                  <span>Require ITSM / ServiceNow Ticket ID prior to check-out</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="pvwa-btn pvwa-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="pvwa-btn pvwa-btn-primary">
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIGURE / EDIT POLICY MODAL */}
      {isEditModalOpen && selectedPolicy && (
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
              maxWidth: 540,
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
                <Edit2 size={18} style={{ color: "#38BDF8" }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  Configure Policy: {selectedPolicy.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
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

            <form onSubmit={handleSubmitEdit} style={{ padding: 20 }}>
              {modalError && (
                <div
                  style={{
                    background: "#FEE2E2",
                    border: "1px solid #F87171",
                    color: "#991B1B",
                    padding: "8px 12px",
                    borderRadius: 2,
                    fontSize: 12,
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{modalError}</span>
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Platform
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                  {selectedPolicy.platform}
                </div>
                <div style={{ fontSize: 11, color: "#475569" }}>{selectedPolicy.description}</div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: 4,
                    }}
                  >
                    Rotation Cycle: <span style={{ color: "#0078D4" }}>{editInterval} Days</span>
                  </label>
                  <input
                    type="range"
                    min="7"
                    max="180"
                    step="1"
                    value={editInterval}
                    onChange={(e) => setEditInterval(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: 4,
                    }}
                  >
                    Min Password Length:{" "}
                    <span style={{ color: "#0078D4" }}>{editMinLength} Chars</span>
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="64"
                    step="1"
                    value={editMinLength}
                    onChange={(e) => setEditMinLength(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Password Complexity
                </label>
                <input
                  type="text"
                  value={editComplexity}
                  onChange={(e) => setEditComplexity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Policy Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as "Active" | "Draft" | "Disabled")}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                    background: "#FFFFFF",
                  }}
                >
                  <option value="Active">Active (CPM Automated Rotation Enabled)</option>
                  <option value="Draft">Draft (Inactive / Staging Mode)</option>
                  <option value="Disabled">Disabled (Suspended Policy)</option>
                </select>
              </div>

              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  padding: "10px 14px",
                  borderRadius: 2,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Governance & Access Controls
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#1E293B",
                    marginBottom: 6,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editDualControl}
                    onChange={(e) => setEditDualControl(e.target.checked)}
                  />
                  <span>Require Dual-Control Approval (Four-Eyes Principle)</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#1E293B",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editRequireTicket}
                    onChange={(e) => setEditRequireTicket(e.target.checked)}
                  />
                  <span>Require ITSM / ServiceNow Ticket ID prior to check-out</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="pvwa-btn pvwa-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="pvwa-btn pvwa-btn-primary">
                  Update Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
