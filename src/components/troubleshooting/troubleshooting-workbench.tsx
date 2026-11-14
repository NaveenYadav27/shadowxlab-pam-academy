import React, { useState } from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Terminal,
  Server,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Check,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";
import type { PamState, PamIncident } from "../../lib/pam-engine";

interface TroubleshootingWorkbenchProps {
  state: PamState;
  onRemediateIncident: (incidentId: string) => { error?: string };
}

export function TroubleshootingWorkbench({
  state,
  onRemediateIncident,
}: TroubleshootingWorkbenchProps) {
  const incidents = state.incidents || [];
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || "");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRemediating, setIsRemediating] = useState(false);
  const [remediationSuccess, setRemediationSuccess] = useState(false);
  const [filterComponent, setFilterComponent] = useState<string>("ALL");

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  const filteredIncidents = incidents.filter((i) => {
    return filterComponent === "ALL" || i.component === filterComponent;
  });

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setCurrentStep(1);
    setRemediationSuccess(false);
  };

  const handleExecuteRemediation = () => {
    if (!selectedIncident) return;
    setIsRemediating(true);
    setTimeout(() => {
      const res = onRemediateIncident(selectedIncident.id);
      setIsRemediating(false);
      if (!res.error) {
        setRemediationSuccess(true);
        setCurrentStep(5);
      } else {
        alert(res.error);
      }
    }, 700);
  };

  const openCount = incidents.filter((i) => i.status === "Open").length;
  const criticalCount = incidents.filter(
    (i) => i.severity === "Critical" && i.status === "Open",
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
            <span style={{ color: "#0078D4", fontWeight: 700 }}>TROUBLESHOOTING</span>
            <span>&gt;</span>
            <span>Diagnostic Workbench</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            CPM & PSM Diagnostic Workbench & Incident Remediation
          </h1>
          <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0 0" }}>
            Investigate password rotation failures, target connectivity timeouts, session handshake
            errors, and perform automated remediation.
          </p>
        </div>
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
            Critical Incidents
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#C5221F", marginTop: 4 }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Impacting password automation
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
            Open Tickets
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#B06000", marginTop: 4 }}>
            {openCount}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Requiring operator diagnosis
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
            Resolved Incidents
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#107C41", marginTop: 4 }}>
            {incidents.filter((i) => i.status === "Resolved").length}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            Remediated with audit evidence
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
            Automated Resolvers
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0078D4", marginTop: 6 }}>
            Reconciliation Engine
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
            One-click credential repair
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Incident Queue vs Guided Workbench */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        {/* Left: Incident Queue */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #CBD5E1",
              background: "#F8FAFC",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
              Incident Queue ({filteredIncidents.length})
            </h3>
            <select
              value={filterComponent}
              onChange={(e) => setFilterComponent(e.target.value)}
              style={{
                padding: "3px 8px",
                fontSize: 11,
                border: "1px solid #CBD5E1",
                borderRadius: 2,
                background: "#FFFFFF",
              }}
            >
              <option value="ALL">All Components</option>
              <option value="CPM">CPM Engine</option>
              <option value="PSM">PSM Proxy</option>
              <option value="Vault">Digital Vault</option>
            </select>
          </div>

          <div style={{ overflowY: "auto", maxHeight: 600 }}>
            {filteredIncidents.map((incident) => {
              const isSelected = incident.id === selectedIncidentId;
              return (
                <div
                  key={incident.id}
                  onClick={() => handleSelectIncident(incident.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #E2E8F0",
                    borderLeft: isSelected ? "4px solid #0078D4" : "4px solid transparent",
                    background: isSelected ? "#EFF6FF" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "1px 6px",
                        borderRadius: 2,
                        background:
                          incident.severity === "Critical"
                            ? "#FEE2E2"
                            : incident.severity === "Warning"
                              ? "#FEF3C7"
                              : "#E0F2FE",
                        color:
                          incident.severity === "Critical"
                            ? "#991B1B"
                            : incident.severity === "Warning"
                              ? "#92400E"
                              : "#0369A1",
                      }}
                    >
                      {incident.component} · {incident.severity}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: incident.status === "Resolved" ? "#107C41" : "#B06000",
                      }}
                    >
                      {incident.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>
                    {incident.accountUsername}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#475569",
                      fontFamily: "monospace",
                      marginBottom: 4,
                    }}
                  >
                    Target: {incident.targetHost}
                  </div>
                  <div style={{ fontSize: 11, color: "#C5221F", fontWeight: 600 }}>
                    <code>{incident.errorCode}</code>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Diagnostic Workbench */}
        {selectedIncident ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 2,
              padding: "16px 20px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid #E2E8F0",
                paddingBottom: 14,
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
                    Diagnostic Case #{selectedIncident.id}
                  </h2>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 2,
                      background: selectedIncident.status === "Resolved" ? "#E8F5E9" : "#FEE2E2",
                      color: selectedIncident.status === "Resolved" ? "#107C41" : "#991B1B",
                    }}
                  >
                    {selectedIncident.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                  Account: <b>{selectedIncident.accountUsername}</b> on host{" "}
                  <code>{selectedIncident.targetHost}</code> · Reported at{" "}
                  {selectedIncident.createdTime}
                </div>
              </div>

              {selectedIncident.status !== "Resolved" && (
                <button
                  type="button"
                  onClick={handleExecuteRemediation}
                  disabled={isRemediating}
                  className="pvwa-btn pvwa-btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                  }}
                >
                  <RefreshCw size={14} className={isRemediating ? "animate-spin" : ""} />
                  {isRemediating ? "Applying Fix..." : "Execute Remediation"}
                </button>
              )}
            </div>

            {/* Step Wizard Indicator */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 20,
                background: "#F8FAFC",
                padding: "10px 14px",
                borderRadius: 2,
              }}
            >
              {[
                { num: 1, label: "1. Telemetry & Log" },
                { num: 2, label: "2. Root Cause" },
                { num: 3, label: "3. Target Probe" },
                { num: 4, label: "4. Remediation" },
                { num: 5, label: "5. Audit Seal" },
              ].map((step) => {
                const isPassed = currentStep > step.num || selectedIncident.status === "Resolved";
                const isCurrent =
                  currentStep === step.num && selectedIncident.status !== "Resolved";
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setCurrentStep(step.num)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 11,
                      fontWeight: 700,
                      color: isPassed ? "#107C41" : isCurrent ? "#0078D4" : "#94A3B8",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer",
                    }}
                  >
                    {isPassed ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: isCurrent ? "#0078D4" : "#CBD5E1",
                          color: "#FFFFFF",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                        }}
                      >
                        {step.num}
                      </span>
                    )}
                    {step.label}
                  </button>
                );
              })}
            </div>

            {/* STEP 1: OBSERVE ERROR */}
            {currentStep === 1 && (
              <div>
                <h4
                  style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: 700, color: "#0F172A" }}
                >
                  Phase 1: Component Telemetry & Exception Log
                </h4>
                <div
                  style={{
                    background: "#0F172A",
                    color: "#F8FAFC",
                    padding: "12px 16px",
                    borderRadius: 4,
                    fontFamily: "monospace",
                    fontSize: 11,
                    lineHeight: 1.6,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ color: "#F87171" }}>
                    [ERROR] {selectedIncident.createdTime} - Error Code:{" "}
                    {selectedIncident.errorCode}
                  </div>
                  <div style={{ color: "#E2E8F0" }}>
                    Component: {selectedIncident.component} Plugin Engine
                  </div>
                  <div style={{ color: "#E2E8F0" }}>
                    Target Host: {selectedIncident.targetHost} (Port 445 / SMB)
                  </div>
                  <div style={{ color: "#FBBF24" }}>
                    Exception Detail: {selectedIncident.errorDetail}
                  </div>
                  <div style={{ color: "#94A3B8" }}>
                    Stack Trace: CyberArk.CPM.Plugin.WindowsNet.ExecutePasswordChange() line 412
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    Proceed to Root Cause Analysis <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ROOT CAUSE */}
            {currentStep === 2 && (
              <div>
                <h4
                  style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: 700, color: "#0F172A" }}
                >
                  Phase 2: Root Cause Identification
                </h4>
                <div
                  style={{
                    background: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    padding: "12px 16px",
                    borderRadius: 2,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#92400E", fontSize: 12, marginBottom: 4 }}>
                    Identified Vulnerability / Failure Mode:
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#78350F", lineHeight: 1.5 }}>
                    {selectedIncident.errorCode === "CACPM250E" &&
                      "The target account password has become out-of-sync with the Vault secret store. The remote Windows SAM database rejects previous credentials."}
                    {selectedIncident.errorCode === "CACPM072E" &&
                      "Active Directory Kerberos authentication failed due to account lockout following multiple invalid reconciliation attempts."}
                    {selectedIncident.errorCode === "PSMSR037E" &&
                      "PSM remote desktop connection broker timed out attempting TCP handshake with target port 3389. Network security group or local firewall is blocking."}
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    Perform Target Diagnostic Probe <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: TARGET PROBE */}
            {currentStep === 3 && (
              <div>
                <h4
                  style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: 700, color: "#0F172A" }}
                >
                  Phase 3: Real-Time Diagnostic Probe
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      padding: "10px 14px",
                      borderRadius: 2,
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
                      ICMP Reachability
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#107C41", marginTop: 2 }}>
                      ONLINE (0.42ms RTT)
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      padding: "10px 14px",
                      borderRadius: 2,
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
                      Management Port (445 / SMB)
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#107C41", marginTop: 2 }}>
                      LISTENING (Open)
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      padding: "10px 14px",
                      borderRadius: 2,
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
                      Reconcile Account Status
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0078D4", marginTop: 2 }}>
                      ATTACHED (DOMAIN-RECON)
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      padding: "10px 14px",
                      borderRadius: 2,
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
                      Suggested Remediation
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#B06000", marginTop: 2 }}>
                      {selectedIncident.remediationAction}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    Open Remediation Action <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REMEDIATION */}
            {currentStep === 4 && (
              <div>
                <h4
                  style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: 700, color: "#0F172A" }}
                >
                  Phase 4: Execute Automated Remediation
                </h4>
                <div
                  style={{
                    background: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    padding: "14px 18px",
                    borderRadius: 2,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#1E40AF", fontSize: 13, marginBottom: 6 }}>
                    Remediation Strategy: {selectedIncident.remediationAction}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#1E3A8A", lineHeight: 1.5 }}>
                    Executing this action triggers the CPM to deploy the associated reconcile key,
                    reset the target account credentials, update the Vault safe record, and
                    re-enable automated password management.
                  </p>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                  >
                    Back
                  </button>
                  {selectedIncident.status === "Resolved" ? (
                    <span style={{ color: "#107C41", fontWeight: 700, fontSize: 12 }}>
                      ✓ Case Already Resolved
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleExecuteRemediation}
                      disabled={isRemediating}
                      className="pvwa-btn pvwa-btn-primary"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <RefreshCw size={14} className={isRemediating ? "animate-spin" : ""} />
                      {isRemediating
                        ? "Running Automated Remediation..."
                        : "Execute Automated Remediation"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: AUDIT SEAL */}
            {currentStep === 5 && (
              <div>
                <h4
                  style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: 700, color: "#0F172A" }}
                >
                  Phase 5: Incident Resolution & Cryptographic Audit Seal
                </h4>
                <div
                  style={{
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    padding: "14px 18px",
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
                      fontWeight: 700,
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Incident Remediated & Verified Successfully
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#047857", lineHeight: 1.5 }}>
                    The CPM has verified connectivity, reset credentials using the Reconcile
                    Account, and updated the Digital Vault. The account status is restored to
                    Compliant.
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                  >
                    Review Case Telemetry
                  </button>
                  <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>
                    Audit Log Entry Created
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 2,
              padding: 32,
              textAlign: "center",
              color: "#64748B",
            }}
          >
            Select an incident from the queue to open diagnostic workbench.
          </div>
        )}
      </div>
    </div>
  );
}
