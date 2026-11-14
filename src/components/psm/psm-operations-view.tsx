import React, { useState, useMemo, type FormEvent } from "react";
import {
  MonitorPlay,
  Terminal,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  XCircle,
  FileText,
  Search,
  Key,
  Layers,
  ArrowRight,
  Video,
  SlidersHorizontal,
} from "lucide-react";
import type { PamState, PamSession } from "@/lib/pam-engine";
import {
  PsmProxySvg,
  AdminWorkstationSvg,
  VaultServerSvg,
  WindowsServerSvg,
} from "../academy/visual/pam-svg-icons";
import { toast } from "sonner";

interface PsmOperationsViewProps {
  state: PamState;
  onLaunch: (event: FormEvent<HTMLFormElement>) => void;
  onApproval: () => void;
  onClose: () => void;
  onCommand: (event: FormEvent<HTMLFormElement>) => void;
  onExecuteCommand: (command: string) => void;
  onTerminateSession: (sessionId: string, reason: string) => void;
  session: PamSession | undefined;
  command: string;
  setCommand: (command: string) => void;
  terminalEnd: React.RefObject<HTMLDivElement | null>;
}

export const PsmOperationsView: React.FC<PsmOperationsViewProps> = ({
  state,
  onLaunch,
  onApproval,
  onClose,
  onCommand,
  onExecuteCommand,
  onTerminateSession,
  session,
  command,
  setCommand,
  terminalEnd,
}) => {
  const [activeTab, setActiveTab] = useState<"inventory" | "console" | "launch" | "lifecycle">(
    session ? "console" : "inventory",
  );
  const [filterStatus, setFilterStatus] = useState<"all" | "Active" | "Terminated">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectingSession, setInspectingSession] = useState<PamSession | null>(null);
  const [terminatingSession, setTerminatingSession] = useState<PamSession | null>(null);
  const [terminationReason, setTerminationReason] = useState("");

  // Target accounts eligible for session launch
  const eligibleAccounts = useMemo(() => {
    return state.accounts.filter((a) => a.status === "Managed" || a.status === "Verify required");
  }, [state.accounts]);

  // Filtered session inventory
  const filteredSessions = useMemo(() => {
    return state.sessions.filter((s) => {
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      const matchSearch =
        !searchTerm ||
        [s.id, s.target, s.account, s.ticket, s.user ?? "", s.safe ?? ""].some((v) =>
          v.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      return matchStatus && matchSearch;
    });
  }, [state.sessions, filterStatus, searchTerm]);

  const activeCount = state.sessions.filter((s) => s.status === "Active").length;
  const terminatedCount = state.sessions.filter((s) => s.status === "Terminated").length;

  function handleConfirmTerminate(e: FormEvent) {
    e.preventDefault();
    if (!terminatingSession) return;
    const reason = terminationReason.trim() || "Administrative operator terminated session";
    onTerminateSession(terminatingSession.id, reason);
    setTerminatingSession(null);
    setTerminationReason("");
    toast.success(`Session ${terminatingSession.id} terminated. Recording sealed.`);
  }

  return (
    <>
      {/* PVWA Header Bar */}
      <div className="pvwa-page-header">
        <div className="pvwa-page-title-block">
          <h1>
            <MonitorPlay size={20} className="text-[#0078D4]" />
            PSM Operations &amp; Session Management
          </h1>
          <p>
            CyberArk Privileged Session Manager brokered access, server-side credential injection,
            and immutable session recording
          </p>
        </div>
      </div>

      {/* Top Status Metrics Strip */}
      <div className="pvwa-metrics-strip">
        <div className="pvwa-metric-card">
          <span>PSM GATEWAY STATUS</span>
          <strong style={{ color: "#10B981" }}>HEALTHY</strong>
          <small>RDP/SSH proxy port 3389 listening</small>
        </div>
        <div className="pvwa-metric-card">
          <span>ACTIVE SESSIONS</span>
          <strong style={{ color: activeCount > 0 ? "#0078D4" : "#1E293B" }}>{activeCount}</strong>
          <small>Monitored live in isolation proxy</small>
        </div>
        <div className="pvwa-metric-card">
          <span>TOTAL RECORDED ARCHIVE</span>
          <strong>{state.sessions.length}</strong>
          <small>Sealed forensic video &amp; keystrokes</small>
        </div>
        <div className="pvwa-metric-card">
          <span>CREDENTIAL ISOLATION</span>
          <strong style={{ color: "#10B981" }}>100% INJECTED</strong>
          <small>Zero client-side password exposure</small>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="pvwa-detail-tabs" style={{ marginBottom: 14 }}>
        <button
          type="button"
          className={`pvwa-tab-btn ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          Session Inventory ({state.sessions.length})
        </button>
        <button
          type="button"
          className={`pvwa-tab-btn ${activeTab === "console" ? "active" : ""}`}
          onClick={() => setActiveTab("console")}
        >
          Controlled Console {session ? "(LIVE)" : ""}
        </button>
        <button
          type="button"
          className={`pvwa-tab-btn ${activeTab === "launch" ? "active" : ""}`}
          onClick={() => setActiveTab("launch")}
        >
          Launch Session Form
        </button>
        <button
          type="button"
          className={`pvwa-tab-btn ${activeTab === "lifecycle" ? "active" : ""}`}
          onClick={() => setActiveTab("lifecycle")}
        >
          Session Brokering Lifecycle Diagram
        </button>
      </div>

      {/* TAB 1: SESSION INVENTORY TABLE */}
      {activeTab === "inventory" && (
        <div className="pvwa-grid" style={{ marginBottom: 20 }}>
          <div className="pvwa-table-container">
            {/* Toolbar */}
            <div className="pvwa-table-toolbar">
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div className="pvwa-search-box">
                  <Search size={14} className="text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="Search session ID, target, account, user or ticket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className={`pvwa-btn pvwa-btn-sm ${filterStatus === "all" ? "pvwa-btn-primary" : "pvwa-btn-secondary"}`}
                    onClick={() => setFilterStatus("all")}
                    style={{ fontSize: 11 }}
                  >
                    All ({state.sessions.length})
                  </button>
                  <button
                    type="button"
                    className={`pvwa-btn pvwa-btn-sm ${filterStatus === "Active" ? "pvwa-btn-primary" : "pvwa-btn-secondary"}`}
                    onClick={() => setFilterStatus("Active")}
                    style={{ fontSize: 11 }}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    type="button"
                    className={`pvwa-btn pvwa-btn-sm ${filterStatus === "Terminated" ? "pvwa-btn-primary" : "pvwa-btn-secondary"}`}
                    onClick={() => setFilterStatus("Terminated")}
                    style={{ fontSize: 11 }}
                  >
                    Terminated ({terminatedCount})
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-primary"
                onClick={() => setActiveTab("launch")}
              >
                <Play size={13} />
                Connect to Target
              </button>
            </div>

            {/* Table */}
            <table className="pvwa-table">
              <thead>
                <tr>
                  <th style={{ width: "12%" }}>SESSION ID</th>
                  <th style={{ width: "10%" }}>STATUS</th>
                  <th style={{ width: "12%" }}>OPERATOR</th>
                  <th style={{ width: "14%" }}>ACCOUNT &amp; SAFE</th>
                  <th style={{ width: "14%" }}>TARGET HOST</th>
                  <th style={{ width: "12%" }}>COMPONENT</th>
                  <th style={{ width: "10%" }}>TICKET</th>
                  <th style={{ width: "16%" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <code style={{ fontSize: 11, fontWeight: 700, color: "#0078D4" }}>
                        {s.id}
                      </code>
                    </td>
                    <td>
                      <span
                        className={`pvwa-badge ${s.status === "Active" ? "pvwa-badge-success" : "pvwa-badge-default"}`}
                      >
                        {s.status === "Active" ? "● Active" : "Terminated"}
                      </span>
                    </td>
                    <td>
                      <strong>{s.user ?? "windows_admin"}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{s.account}</strong>
                        <div style={{ fontSize: 10, color: "#64748B" }}>{s.safe ?? "WIN-SAFE"}</div>
                      </div>
                    </td>
                    <td>
                      <strong>{s.target}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: "#475569" }}>{s.component}</span>
                    </td>
                    <td>
                      <span className="pvwa-badge pvwa-badge-info" style={{ fontSize: 10.5 }}>
                        {s.ticket}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                          onClick={() => setInspectingSession(s)}
                          style={{ fontSize: 10.5, padding: "2px 8px" }}
                        >
                          Details
                        </button>
                        {s.status === "Active" && (
                          <button
                            type="button"
                            className="pvwa-btn pvwa-btn-sm pvwa-btn-danger"
                            onClick={() => setTerminatingSession(s)}
                            style={{ fontSize: 10.5, padding: "2px 8px" }}
                          >
                            Terminate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: "center", padding: "24px 0", color: "#64748B" }}
                    >
                      No sessions match current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTROLLED SESSION TERMINAL CONSOLE */}
      {activeTab === "console" && (
        <div className="pvwa-detail-panel" style={{ marginTop: 0 }}>
          <div className="pvwa-detail-header">
            <div className="pvwa-detail-title">
              <Terminal size={16} className="text-[#0078D4]" />
              <h3>Controlled Session Console</h3>
              <span>
                ·{" "}
                {session
                  ? `${session.target} (${session.account}) · ${session.ticket} · Port 3389 Isolated`
                  : "Standby — Launch an approved session from the Session Inventory or Launch Form"}
              </span>
            </div>
            {session && (
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-danger"
                onClick={() => setTerminatingSession(session)}
              >
                <XCircle size={13} />
                Terminate Session
              </button>
            )}
          </div>

          <div className="pvwa-detail-body">
            {session ? (
              <>
                <div className="pvwa-terminal-body" style={{ minHeight: 280, maxHeight: 420 }}>
                  <div className="pvwa-terminal-line system">
                    [CYBERARK PSM ISOLATION PROXY v12.6]
                  </div>
                  <div className="pvwa-terminal-line system">
                    Session ID: {session.id} | Target: {session.target} | User: {session.account}
                  </div>
                  <div className="pvwa-terminal-line system">
                    Change Ticket: {session.ticket} | Reason: {session.reason}
                  </div>
                  <div className="pvwa-terminal-line system">
                    Server-Side Credential Injected from Digital Vault. Keystrokes recorded.
                  </div>
                  <div className="pvwa-terminal-line system">
                    ------------------------------------------------------------------------
                  </div>

                  {session.commands.map((cmd, idx) => (
                    <div key={idx} className="pvwa-terminal-line command">
                      <span className="prompt">PS C:\Users\{session.account}&gt;</span> {cmd}
                    </div>
                  ))}
                  <div ref={terminalEnd} />
                </div>

                {/* Command Bar */}
                <form onSubmit={onCommand} className="pvwa-terminal-input-bar">
                  <span className="prompt">PS C:\&gt;</span>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Type command ('whoami', 'hostname', 'net user', 'exit')..."
                    disabled={session.status === "Terminated"}
                  />
                  <button type="submit" className="pvwa-btn pvwa-btn-sm pvwa-btn-primary">
                    Send
                  </button>
                </form>

                {/* Quick Shortcuts */}
                <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>
                    Quick Simulated Commands:
                  </span>
                  {["whoami", "hostname", "net user", "ipconfig", "Get-Service", "exit"].map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                        style={{ fontSize: 10.5, padding: "2px 8px" }}
                        onClick={() => onExecuteCommand(c)}
                      >
                        {c}
                      </button>
                    ),
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <MonitorPlay
                  size={40}
                  className="text-[#64748B]"
                  style={{ margin: "0 auto 12px auto" }}
                />
                <h4 style={{ margin: "0 0 4px 0", color: "#1E293B" }}>
                  No Active Controlled Session
                </h4>
                <p style={{ margin: "0 0 16px 0", fontSize: 12, color: "#64748B" }}>
                  Select an account from inventory and launch an approved proxy session.
                </p>
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-primary"
                  onClick={() => setActiveTab("launch")}
                >
                  <Play size={14} />
                  Open Launch Session Form
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LAUNCH SESSION FORM */}
      {activeTab === "launch" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
          <div className="pvwa-detail-panel" style={{ marginTop: 0 }}>
            <div className="pvwa-detail-header">
              <div className="pvwa-detail-title">
                <Play size={16} className="text-[#0078D4]" />
                <h3>Launch Privileged Connection</h3>
              </div>
            </div>

            <form onSubmit={onLaunch} className="pvwa-detail-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#475569",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    TARGET ACCOUNT &amp; HOST
                  </label>
                  <select
                    name="accountId"
                    className="pvwa-search-box"
                    style={{ width: "100%", padding: "7px 10px" }}
                    required
                  >
                    {eligibleAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.username} · {a.address} ({a.safe} · {a.platform})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#475569",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    CONNECTION COMPONENT
                  </label>
                  <select
                    name="component"
                    className="pvwa-search-box"
                    style={{ width: "100%", padding: "7px 10px" }}
                  >
                    <option value="PSM-RDP">PSM-RDP (Windows Remote Desktop Proxy)</option>
                    <option value="PSM-SSH">PSM-SSH (Unix Bastion Shell)</option>
                    <option value="PSM-SQLPlus">PSM-SQLPlus (Database Management)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#475569",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    AUTHORIZED CHANGE TICKET REFERENCE (CHG-12345 format)
                  </label>
                  <input
                    type="text"
                    name="ticket"
                    placeholder="e.g. CHG-10294"
                    defaultValue="CHG-10294"
                    className="pvwa-search-box"
                    style={{ width: "100%", padding: "7px 10px" }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#475569",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    DOCUMENTED BUSINESS REASON (Min. 12 characters)
                  </label>
                  <textarea
                    name="reason"
                    rows={3}
                    placeholder="Explain operational necessity for audit verification..."
                    defaultValue="Emergency maintenance inspection and diagnostic telemetry"
                    className="pvwa-search-box"
                    style={{ width: "100%", padding: "7px 10px" }}
                    required
                  />
                </div>

                {/* Preflight Approval Gate */}
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    padding: 12,
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 12, color: "#1E293B" }}>Dual-Control Gate:</strong>
                      <span style={{ fontSize: 11, color: "#64748B", display: "block" }}>
                        Supervisor authorization required before injection.
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`pvwa-btn pvwa-btn-sm ${state.approvalGranted ? "pvwa-btn-danger" : "pvwa-btn-primary"}`}
                      onClick={onApproval}
                    >
                      {state.approvalGranted ? "Revoke Approval" : "Grant Dual-Control Approval"}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    type="submit"
                    className="pvwa-btn pvwa-btn-primary"
                    disabled={!state.approvalGranted || Boolean(session)}
                  >
                    <Play size={14} />
                    Launch PSM Brokered Session
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Access Preflight Status Panel */}
          <div className="pvwa-detail-panel" style={{ marginTop: 0 }}>
            <div className="pvwa-detail-header">
              <div className="pvwa-detail-title">
                <Shield size={16} className="text-[#0078D4]" />
                <h3>PSM Access Gate Preflight</h3>
              </div>
            </div>
            <div className="pvwa-detail-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  {
                    label: "Safe Session Rights",
                    ok: true,
                    detail: "Initiate privileged sessions granted",
                  },
                  {
                    label: "Dual-Control Approval",
                    ok: state.approvalGranted,
                    detail: state.approvalGranted ? "Verified" : "Pending supervisor grant",
                  },
                  {
                    label: "PSM Proxy Health",
                    ok: state.psmConnectorHealthy,
                    detail: "Port 3389 reachable",
                  },
                  { label: "Recording Policy", ok: true, detail: "100% video & text telemetry" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: item.ok ? "#10B981" : "#F59E0B" }}>
                      {item.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    </span>
                    <div>
                      <strong style={{ fontSize: 12, color: "#1E293B", display: "block" }}>
                        {item.label}
                      </strong>
                      <small style={{ color: "#64748B" }}>{item.detail}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SESSION BROKERING LIFECYCLE SVG DIAGRAM */}
      {activeTab === "lifecycle" && (
        <div className="pvwa-detail-panel" style={{ marginTop: 0 }}>
          <div className="pvwa-detail-header">
            <div className="pvwa-detail-title">
              <Layers size={16} className="text-[#0078D4]" />
              <h3>Graphical Privileged Session Brokering &amp; Injection Lifecycle</h3>
            </div>
          </div>
          <div
            className="pvwa-detail-body"
            style={{ padding: 20, background: "#0F172A", overflowX: "auto" }}
          >
            <svg
              viewBox="0 0 880 280"
              style={{ width: "100%", height: "auto", minWidth: 740, display: "block" }}
            >
              <defs>
                <marker
                  id="psmArrow"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L6,3 Z" fill="#38BDF8" />
                </marker>
                <marker
                  id="recArrow"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L6,3 Z" fill="#EF4444" />
                </marker>
              </defs>

              {/* Node 1: Operator Workstation */}
              <g transform="translate(40, 70)">
                <rect
                  x="0"
                  y="0"
                  width="120"
                  height="90"
                  rx="4"
                  fill="#1E293B"
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                <foreignObject x="35" y="8" width="50" height="50">
                  <AdminWorkstationSvg size={50} />
                </foreignObject>
                <text
                  x="60"
                  y="72"
                  fill="#E2E8F0"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Operator Client
                </text>
                <text x="60" y="83" fill="#94A3B8" fontSize="8" textAnchor="middle">
                  Tier-2 Desktop
                </text>
              </g>

              {/* Arrow 1 -> 2: RDP Ingress */}
              <path
                d="M160 115 L260 115"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#psmArrow)"
              />
              <rect
                x="175"
                y="98"
                width="70"
                height="15"
                rx="2"
                fill="#0F172A"
                stroke="#334155"
                strokeWidth="0.5"
              />
              <text x="180" y="109" fill="#38BDF8" fontSize="8" fontWeight="700">
                RDP 3389
              </text>

              {/* Node 2: PSM Jump Proxy */}
              <g transform="translate(260, 50)">
                <rect
                  x="0"
                  y="0"
                  width="150"
                  height="130"
                  rx="6"
                  fill="#1E293B"
                  stroke="#0078D4"
                  strokeWidth="2"
                />
                <foreignObject x="48" y="10" width="54" height="54">
                  <PsmProxySvg size={54} highlighted />
                </foreignObject>
                <text
                  x="75"
                  y="78"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  PSM Jump Server
                </text>
                <text x="75" y="92" fill="#38BDF8" fontSize="8" textAnchor="middle">
                  ISOLATION BOUNDARY
                </text>
                <rect x="15" y="100" width="120" height="20" rx="2" fill="#0F172A" />
                <text
                  x="75"
                  y="113"
                  fill="#10B981"
                  fontSize="8"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  CREDENTIAL INJECTION
                </text>
              </g>

              {/* Node 3: Digital Vault (Above PSM) */}
              <g transform="translate(480, 20)">
                <rect
                  x="0"
                  y="0"
                  width="130"
                  height="80"
                  rx="4"
                  fill="#0A192F"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                />
                <foreignObject x="40" y="6" width="48" height="48">
                  <VaultServerSvg size={48} highlighted />
                </foreignObject>
                <text
                  x="65"
                  y="64"
                  fill="#E2E8F0"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Digital Vault
                </text>
                <text x="65" y="74" fill="#38BDF8" fontSize="8" textAnchor="middle">
                  TCP 1858 AES-256
                </text>
              </g>

              {/* Arrow Vault -> PSM: Password Fetch */}
              <path
                d="M480 60 L410 80"
                stroke="#38BDF8"
                strokeWidth="1.5"
                markerEnd="url(#psmArrow)"
              />
              <text x="420" y="66" fill="#93C5FD" fontSize="7.5">
                Secret Fetch
              </text>

              {/* Arrow PSM -> Target: Injected Connection */}
              <path
                d="M410 135 L660 135"
                stroke="#10B981"
                strokeWidth="2.5"
                markerEnd="url(#psmArrow)"
              />
              <rect
                x="470"
                y="125"
                width="140"
                height="18"
                rx="2"
                fill="#0F172A"
                stroke="#10B981"
                strokeWidth="0.5"
              />
              <text x="476" y="137" fill="#10B981" fontSize="8" fontWeight="700">
                TRANSPARENT INJECTION (PORT 3389)
              </text>

              {/* Node 4: Target System */}
              <g transform="translate(660, 70)">
                <rect
                  x="0"
                  y="0"
                  width="150"
                  height="90"
                  rx="4"
                  fill="#1E293B"
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                <foreignObject x="50" y="8" width="50" height="50">
                  <WindowsServerSvg size={50} />
                </foreignObject>
                <text
                  x="75"
                  y="72"
                  fill="#E2E8F0"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Target Infrastructure
                </text>
                <text x="75" y="83" fill="#94A3B8" fontSize="8" textAnchor="middle">
                  WIN-SRV-01 · 10.0.1.5
                </text>
              </g>

              {/* Recording Path Line */}
              <path
                d="M335 180 L335 230 L550 230"
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                markerEnd="url(#recArrow)"
              />
              <rect
                x="350"
                y="220"
                width="160"
                height="18"
                rx="2"
                fill="#0F172A"
                stroke="#EF4444"
                strokeWidth="0.5"
              />
              <text x="356" y="232" fill="#EF4444" fontSize="8" fontWeight="700">
                VIDEO &amp; KEYSTROKE RECORDING PATH
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* MODAL: SESSION DETAILS INSPECTOR */}
      {inspectingSession && (
        <div className="pvwa-modal-backdrop" onClick={() => setInspectingSession(null)}>
          <div
            className="pvwa-modal-card"
            style={{ maxWidth: 620 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pvwa-modal-header">
              <h3>Session Audit Evidence — {inspectingSession.id}</h3>
              <button
                type="button"
                className="pvwa-modal-close"
                onClick={() => setInspectingSession(null)}
              >
                &times;
              </button>
            </div>
            <div className="pvwa-modal-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>
                    OPERATOR
                  </label>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1E293B" }}>
                    {inspectingSession.user ?? "windows_admin"}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>STATUS</label>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      color: inspectingSession.status === "Active" ? "#10B981" : "#64748B",
                    }}
                  >
                    {inspectingSession.status}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>
                    TARGET &amp; ACCOUNT
                  </label>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1E293B" }}>
                    {inspectingSession.target} ({inspectingSession.account})
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>
                    SAFE &amp; PLATFORM
                  </label>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1E293B" }}>
                    {inspectingSession.safe ?? "WIN-SAFE"} ({inspectingSession.component})
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>
                    CHANGE TICKET
                  </label>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#0078D4" }}>
                    {inspectingSession.ticket}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>
                    DURATION / TIMELINE
                  </label>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1E293B" }}>
                    Started {inspectingSession.started} · {inspectingSession.duration ?? "Active"}
                  </p>
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#64748B",
                    display: "block",
                    marginBottom: 2,
                  }}
                >
                  BUSINESS REASON
                </label>
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    padding: "8px 10px",
                    fontSize: 11.5,
                    color: "#334155",
                  }}
                >
                  {inspectingSession.reason}
                </div>
              </div>

              {inspectingSession.terminationReason && (
                <div style={{ marginTop: 10 }}>
                  <label
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#B06000",
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    TERMINATION AUDIT REASON
                  </label>
                  <div
                    style={{
                      background: "#FEF7E0",
                      border: "1px solid #FEEFC3",
                      padding: "8px 10px",
                      fontSize: 11.5,
                      color: "#B06000",
                    }}
                  >
                    {inspectingSession.terminationReason}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#64748B",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  COMMAND EXECUTION AUDIT HISTORY ({inspectingSession.commands.length} events
                  recorded)
                </label>
                <div
                  style={{
                    background: "#0F172A",
                    padding: 10,
                    borderRadius: 2,
                    maxHeight: 140,
                    overflowY: "auto",
                  }}
                >
                  {inspectingSession.commands.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: "#38BDF8",
                        marginBottom: 2,
                      }}
                    >
                      &gt; {c}
                    </div>
                  ))}
                  {inspectingSession.commands.length === 0 && (
                    <div style={{ fontSize: 11, color: "#64748B" }}>
                      No command executions recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pvwa-modal-footer">
              <button
                type="button"
                className="pvwa-btn pvwa-btn-secondary"
                onClick={() => setInspectingSession(null)}
              >
                Close Evidence Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TERMINATE SESSION PROMPT */}
      {terminatingSession && (
        <div className="pvwa-modal-backdrop" onClick={() => setTerminatingSession(null)}>
          <div
            className="pvwa-modal-card"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleConfirmTerminate}>
              <div className="pvwa-modal-header">
                <h3>Forcible Session Termination</h3>
                <button
                  type="button"
                  className="pvwa-modal-close"
                  onClick={() => setTerminatingSession(null)}
                >
                  &times;
                </button>
              </div>
              <div className="pvwa-modal-body">
                <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "#334155" }}>
                  Are you sure you want to forcibly terminate active session{" "}
                  <strong>{terminatingSession.id}</strong> on{" "}
                  <strong>{terminatingSession.target}</strong>? This action will close the isolation
                  tunnel, seal the video recording, and log a critical audit event.
                </p>

                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#475569",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    DOCUMENT TERMINATION REASON (Required for audit compliance)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Scheduled window closed, operator finished maintenance, anomalous command triage..."
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value)}
                    className="pvwa-search-box"
                    style={{ width: "100%", padding: "7px 10px" }}
                    required
                  />
                </div>
              </div>
              <div className="pvwa-modal-footer">
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary"
                  onClick={() => setTerminatingSession(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="pvwa-btn pvwa-btn-danger">
                  <XCircle size={13} />
                  Terminate &amp; Seal Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
