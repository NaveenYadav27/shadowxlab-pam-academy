import React, { useState } from "react";
import {
  Compass,
  Radar,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Clock,
  Server,
  KeyRound,
  ShieldAlert,
  X,
  Play,
  Layers,
  ArrowRight,
  Database,
} from "lucide-react";
import type { PamState, PamDiscoveredAccount, PamDiscoveryJob } from "../../lib/pam-engine";

interface DiscoveryViewProps {
  state: PamState;
  onRunScan: (subnet: string, source: string) => { error?: string };
  onOnboardAccount: (
    candidateId: string,
    safeName: string,
    policyName: string,
    owner?: string,
  ) => { error?: string };
}

export function DiscoveryView({ state, onRunScan, onOnboardAccount }: DiscoveryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<PamDiscoveredAccount | null>(null);
  const [modalError, setModalError] = useState("");

  // Scan Modal State
  const [scanSubnet, setScanSubnet] = useState("10.100.4.0/24");
  const [scanSource, setScanSource] = useState("Active Directory Domain Services");

  // Onboard Modal State
  const [targetSafe, setTargetSafe] = useState(state.safes[0]?.name || "PROD-WIN-ADMINS");
  const [targetPolicy, setTargetPolicy] = useState(state.policies[0]?.name || "Windows-90d");
  const [targetOwner, setTargetOwner] = useState("infosec_ops");

  const discovered = state.discoveredAccounts || [];
  const jobs = state.discoveryJobs || [];

  const filteredDiscovered = discovered.filter((account) => {
    const matchesSearch =
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === "ALL" || account.risk === riskFilter;
    const matchesStatus = statusFilter === "ALL" || account.status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const handleOpenScan = () => {
    setScanSubnet("10.100.4.0/24");
    setScanSource("Active Directory Domain Services");
    setModalError("");
    setIsScanModalOpen(true);
  };

  const handleTriggerScan = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    const res = onRunScan(scanSubnet, scanSource);
    if (res.error) {
      setModalError(res.error);
    } else {
      setIsScanModalOpen(false);
    }
  };

  const handleOpenOnboard = (candidate: PamDiscoveredAccount) => {
    setSelectedCandidate(candidate);
    setTargetSafe(state.safes[0]?.name || "PROD-WIN-ADMINS");
    setTargetPolicy(state.policies[0]?.name || "Windows-90d");
    setTargetOwner("infosec_ops");
    setModalError("");
  };

  const handleSubmitOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setModalError("");
    const res = onOnboardAccount(selectedCandidate.id, targetSafe, targetPolicy, targetOwner);
    if (res.error) {
      setModalError(res.error);
    } else {
      setSelectedCandidate(null);
    }
  };

  const unmanagedCount = discovered.filter((a) => a.status === "Unmanaged").length;
  const criticalRiskCount = discovered.filter(
    (a) => a.status === "Unmanaged" && (a.risk === "Critical" || a.risk === "High"),
  ).length;

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
            <span style={{ color: "#0078D4", fontWeight: 700 }}>DISCOVERY</span>
            <span>&gt;</span>
            <span>Unmanaged Account Discovery</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            Account Discovery & Automated Onboarding Feeder
          </h1>
          <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0 0" }}>
            Identify unmanaged shadow administrator credentials, active directory sprawl, and
            unauthorized service keys across the corporate estate.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenScan}
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
          <Radar size={16} />
          Execute Discovery Scan
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
            borderLeft: "4px solid #C5221F",
            padding: "12px 16px",
            borderRadius: 2,
          }}
        >
          <div
            style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}
          >
            Critical Unmanaged Risks
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#C5221F", marginTop: 4 }}>
            {criticalRiskCount}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Domain & Local root keys
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
            Total Unmanaged Feeder
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#B06000", marginTop: 4 }}>
            {unmanagedCount}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Awaiting Vault onboarding
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
            Protected in Vault
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#107C41", marginTop: 4 }}>
            {state.accounts.length}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Managed under active CPM
          </div>
        </div>
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
            Discovery Feeder Jobs
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0078D4", marginTop: 4 }}>
            {jobs.length}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Subnets & AD scanned</div>
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
          <div style={{ position: "relative", width: 300 }}>
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
              placeholder="Search account, target, or reason..."
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

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
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
            <option value="ALL">All Risk Levels</option>
            <option value="Critical">Critical Risk</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

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
            <option value="ALL">All Statuses</option>
            <option value="Unmanaged">Unmanaged (Pending Action)</option>
            <option value="Onboarded">Onboarded into Vault</option>
          </select>
        </div>

        <span style={{ fontSize: 12, color: "#64748B" }}>
          Showing <b>{filteredDiscovered.length}</b> candidates
        </span>
      </div>

      {/* Discovery Candidates Table */}
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
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "18%" }}>
                Account Candidate
              </th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "16%" }}>
                Target Host / Subnet
              </th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "16%" }}>Platform</th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "12%" }}>Risk Rating</th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "20%" }}>
                Discovery Reason
              </th>
              <th style={{ padding: "10px 14px", fontWeight: 700, width: "8%" }}>Status</th>
              <th style={{ padding: "10px 14px", fontWeight: 700, textAlign: "right" }}>
                Vault Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDiscovered.map((account) => (
              <tr
                key={account.id}
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
                    <KeyRound size={13} style={{ color: "#0078D4" }} />
                    {account.username}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                    Source: {account.source}
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#1E293B" }}>
                    {account.target}
                  </div>
                </td>
                <td style={{ padding: "10px 14px", color: "#334155" }}>{account.platform}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 2,
                      fontSize: 10,
                      fontWeight: 700,
                      background:
                        account.risk === "Critical"
                          ? "#FEE2E2"
                          : account.risk === "High"
                            ? "#FEF3C7"
                            : "#F1F5F9",
                      color:
                        account.risk === "Critical"
                          ? "#991B1B"
                          : account.risk === "High"
                            ? "#92400E"
                            : "#475569",
                    }}
                  >
                    {account.risk.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", color: "#475569", fontSize: 11 }}>
                  {account.reason}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: account.status === "Onboarded" ? "#107C41" : "#B06000",
                    }}
                  >
                    {account.status === "Onboarded" ? (
                      <CheckCircle size={12} />
                    ) : (
                      <AlertTriangle size={12} />
                    )}
                    {account.status}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                  {account.status === "Unmanaged" ? (
                    <button
                      type="button"
                      onClick={() => handleOpenOnboard(account)}
                      className="pvwa-btn pvwa-btn-primary pvwa-btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <PlusCircle size={12} />
                      Onboard
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: "#107C41", fontWeight: 600 }}>
                      Protected in Safe
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EXECUTE DISCOVERY SCAN MODAL */}
      {isScanModalOpen && (
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
              maxWidth: 480,
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
                <Radar size={18} style={{ color: "#38BDF8" }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  Execute Network & AD Discovery Scan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScanModalOpen(false)}
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

            <form onSubmit={handleTriggerScan} style={{ padding: 20 }}>
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
                  }}
                >
                  {modalError}
                </div>
              )}

              <p style={{ fontSize: 12, color: "#475569", margin: "0 0 14px 0" }}>
                Initiates an automated sweep across network endpoints or Active Directory directory
                services to identify unmanaged administrative credentials.
              </p>

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
                  Discovery Feeder Source *
                </label>
                <select
                  value={scanSource}
                  onChange={(e) => setScanSource(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                    background: "#FFFFFF",
                  }}
                >
                  <option value="Active Directory Domain Services">
                    Active Directory Domain Services (LDAP)
                  </option>
                  <option value="Subnet Network Scanner">
                    Subnet Endpoint Scanner (WMI / SSH)
                  </option>
                  <option value="AWS IAM / Cloud Accounts">AWS IAM / Cloud Service Provider</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Target Subnet / Scope *
                </label>
                <input
                  type="text"
                  required
                  value={scanSubnet}
                  onChange={(e) => setScanSubnet(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                  }}
                />
                <span style={{ fontSize: 11, color: "#64748B" }}>
                  e.g., <code>10.100.4.0/24</code> (Tier-1 Servers) or <code>10.100.12.0/24</code>{" "}
                  (Database Farm)
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(false)}
                  className="pvwa-btn pvwa-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="pvwa-btn pvwa-btn-primary">
                  Start Scan Sweeper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARD ACCOUNT MODAL */}
      {selectedCandidate && (
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
              maxWidth: 480,
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
                <KeyRound size={18} style={{ color: "#38BDF8" }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  Onboard Account into Digital Vault
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
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

            <form onSubmit={handleSubmitOnboard} style={{ padding: 20 }}>
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
                  }}
                >
                  {modalError}
                </div>
              )}

              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  padding: "10px 14px",
                  borderRadius: 2,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Candidate Identity
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                  {selectedCandidate.username}
                </div>
                <div style={{ fontSize: 11, color: "#475569" }}>
                  Target: <code>{selectedCandidate.target}</code> · Platform:{" "}
                  {selectedCandidate.platform}
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
                  Destination Vault Safe *
                </label>
                <select
                  value={targetSafe}
                  onChange={(e) => setTargetSafe(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                    background: "#FFFFFF",
                  }}
                >
                  {state.safes.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.description})
                    </option>
                  ))}
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
                  Assigned Master Policy *
                </label>
                <select
                  value={targetPolicy}
                  onChange={(e) => setTargetPolicy(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                    background: "#FFFFFF",
                  }}
                >
                  {state.policies.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.rotationIntervalDays}d rotation, {p.platform})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 4,
                  }}
                >
                  Business Account Owner
                </label>
                <input
                  type="text"
                  value={targetOwner}
                  onChange={(e) => setTargetOwner(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 12,
                    border: "1px solid #CBD5E1",
                    borderRadius: 2,
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="pvwa-btn pvwa-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="pvwa-btn pvwa-btn-primary">
                  Vault & Protect Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
