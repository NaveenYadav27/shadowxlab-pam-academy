import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Workflow,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";

export type WorkflowType = "onboarding" | "rotation" | "session" | "safe-auth";

interface WorkflowStep {
  stepNumber: number;
  label: string;
  title: string;
  actor: string;
  component: string;
  protocolOrChannel: string;
  actionSummary: string;
  securityControl: string;
  stateTransition: string;
}

interface WorkflowDefinition {
  id: WorkflowType;
  title: string;
  description: string;
  steps: WorkflowStep[];
}

export const WORKFLOWS: Record<WorkflowType, WorkflowDefinition> = {
  onboarding: {
    id: "onboarding",
    title: "Privileged Account Onboarding Lifecycle",
    description:
      "Stepwise control flow from raw unmanaged endpoint discovery to Vault cryptographic isolation and automated CPM management.",
    steps: [
      {
        stepNumber: 1,
        label: "Discovery",
        title: "Unmanaged Credential Discovery",
        actor: "CyberArk Discovery Scanner",
        component: "Discovery Engine",
        protocolOrChannel: "LDAP / SMB 445 / RPC",
        actionSummary:
          "Discovery engine scans network subnets and Active Directory OUs to identify privileged local Administrator and domain accounts.",
        securityControl: "Detects unmanaged rogue accounts and shadow administrator access.",
        stateTransition: "Account status: 'Unmanaged / Discovered'.",
      },
      {
        stepNumber: 2,
        label: "Account Creation",
        title: "Vault Object Instantiation",
        actor: "PAM Administrator",
        component: "PVWA / Vault",
        protocolOrChannel: "HTTPS 443 -> TCP 1858",
        actionSummary:
          "Administrator creates privileged account object in PVWA with username, target address, and initial credential secret.",
        securityControl: "Account metadata encapsulated in Vault with AES-256 encryption.",
        stateTransition: "Account object stored in Vault database.",
      },
      {
        stepNumber: 3,
        label: "Safe Assignment",
        title: "Cryptographic Safe Containment",
        actor: "PAM Engine",
        component: "Digital Vault",
        protocolOrChannel: "Internal Vault Bus",
        actionSummary:
          "Account is bound to a dedicated Safe (e.g., WIN-SAFE or DBA-SAFE) inheriting Safe access control lists and retention rules.",
        securityControl:
          "Enforces least-privilege boundary; limits access to authorized team members.",
        stateTransition: "Account linked to Safe ACL container.",
      },
      {
        stepNumber: 4,
        label: "Platform Binding",
        title: "Platform Policy Association",
        actor: "PAM Administrator",
        component: "PVWA Platform Manager",
        protocolOrChannel: "HTTPS 443",
        actionSummary:
          "Account is bound to a Platform blueprint (e.g., WinDomain or UnixSSH) specifying rotation frequency, password length, and connection components.",
        securityControl: "Enforces password complexity rules and automated rotation timers.",
        stateTransition: "Platform policy rules attached to account object.",
      },
      {
        stepNumber: 5,
        label: "Verification",
        title: "Initial CPM Credential Verification",
        actor: "CPM Service",
        component: "Central Policy Manager",
        protocolOrChannel: "SMB 445 / SSH 22",
        actionSummary:
          "CPM connects directly to the target host and performs a non-intrusive read test using vaulted credentials.",
        securityControl:
          "Confirms vaulted secret matches live target hash before operational handoff.",
        stateTransition: "Account status updated to 'Managed (Verified)'.",
      },
      {
        stepNumber: 6,
        label: "Managed State",
        title: "Active Governance & Controlled Access",
        actor: "PAM System",
        component: "Full PAS Suite",
        protocolOrChannel: "Continuous Monitoring",
        actionSummary:
          "Account enters continuous governance. Password is now managed by CPM and accessible only via transparent PSM brokering.",
        securityControl:
          "Zero plain-text password exposure; full session recording and rotation enabled.",
        stateTransition: "Status: 'Managed / In-Policy Compliance'.",
      },
    ],
  },
  rotation: {
    id: "rotation",
    title: "CPM Automated Password Rotation Lifecycle",
    description:
      "The deterministic 3-state lifecycle executed by Central Policy Manager to synchronize Vault and target credentials.",
    steps: [
      {
        stepNumber: 1,
        label: "Schedule / Trigger",
        title: "Rotation Trigger Evaluation",
        actor: "CPM Scheduler",
        component: "CPM Engine",
        protocolOrChannel: "Periodic Poller / Vault TCP 1858",
        actionSummary:
          "CPM detects that an account's rotation interval (e.g. 30 days) has expired or an immediate ad-hoc Change was requested in PVWA.",
        securityControl:
          "Enforces policy-mandated credential rotation without human operator intervention.",
        stateTransition: "Account flagged with task 'Change Immediate'.",
      },
      {
        stepNumber: 2,
        label: "Pre-Change Verify",
        title: "Current Credential Validation",
        actor: "CPM Worker",
        component: "CPM Plug-in (TPC)",
        protocolOrChannel: "SMB 445 / RPC 135 / SSH 22",
        actionSummary:
          "CPM logs into target host using existing known vaulted password to verify current synchronization.",
        securityControl: "Prevents rotation collisions if target credentials were out of sync.",
        stateTransition: "Target authentication verified.",
      },
      {
        stepNumber: 3,
        label: "Secret Generation",
        title: "Cryptographic Password Generation",
        actor: "Vault RNG",
        component: "Digital Vault",
        protocolOrChannel: "FIPS 140-2 Cryptographic Engine",
        actionSummary:
          "Vault generates a high-entropy randomized password (e.g., 32 characters, alphanumeric and symbols) meeting platform policy.",
        securityControl: "Eliminates human password predictability and dictionary attack vectors.",
        stateTransition: "New secret generated in Vault memory buffer.",
      },
      {
        stepNumber: 4,
        label: "Target Push",
        title: "Remote Target Secret Update",
        actor: "CPM Worker",
        component: "Target Operating System",
        protocolOrChannel: "Remote SAM API / SSH /etc/shadow",
        actionSummary:
          "CPM authenticates with old password and executes remote password change command on target operating system.",
        securityControl: "Target system updates internal credential store with new password.",
        stateTransition: "Target password changed successfully.",
      },
      {
        stepNumber: 5,
        label: "Vault Commit",
        title: "Vault Versioning & Storage",
        actor: "CPM -> Vault",
        component: "Digital Vault",
        protocolOrChannel: "Encrypted Vault Protocol TCP 1858",
        actionSummary:
          "Target confirms successful update; CPM writes new password into Vault Safe, creating a new secret version while archiving the previous version.",
        securityControl: "Maintains full password version history for rollback and forensic audit.",
        stateTransition: "Account status: 'Managed (Synchronized)'.",
      },
      {
        stepNumber: 6,
        label: "Audit Log",
        title: "Immutable Audit Event Registration",
        actor: "Vault Audit Daemon",
        component: "Vault Database & SIEM",
        protocolOrChannel: "Syslog (CEF / RFC 5424)",
        actionSummary:
          "Vault writes tamper-evident audit log event: 'Password Changed Successfully by CPM' and emits syslog alert to enterprise SOC/SIEM.",
        securityControl:
          "Complete non-repudiation audit trail for regulatory compliance (SOX, PCI-DSS).",
        stateTransition: "Audit event committed to immutable log.",
      },
    ],
  },
  session: {
    id: "session",
    title: "PSM Privileged Session Brokering & Credential Injection",
    description:
      "End-to-end privileged access workflow: transparent memory injection, keystroke capture, and live session isolation.",
    steps: [
      {
        stepNumber: 1,
        label: "Access Request",
        title: "Operator Connection Request",
        actor: "System Administrator",
        component: "PVWA Web Console",
        protocolOrChannel: "HTTPS 443",
        actionSummary:
          "Administrator selects target server in PVWA and clicks 'Connect'. System prompts for reason and change ticket reference.",
        securityControl: "Requires authenticated operator session with 'Use accounts' permission.",
        stateTransition: "Connection request initiated.",
      },
      {
        stepNumber: 2,
        label: "Authorization",
        title: "Change Ticket & Dual Control Check",
        actor: "PVWA Authorization Engine",
        component: "Ticketing / Dual-Control Module",
        protocolOrChannel: "ServiceNow API / Internal Approval",
        actionSummary:
          "System verifies change ticket format (e.g. CHG-12345) and checks if dual-control supervisor approval is required.",
        securityControl:
          "Enforces four-eyes principle and organizational change management alignment.",
        stateTransition: "Request approved and authorized.",
      },
      {
        stepNumber: 3,
        label: "Proxy Tunnel",
        title: "Client-to-PSM Session Establishment",
        actor: "Operator Workstation",
        component: "PSM Proxy Server",
        protocolOrChannel: "RDP 3389 / HTML5 443",
        actionSummary:
          "PVWA generates dynamic `.rdp` file. Operator workstation connects to PSM jump server rather than the target host.",
        securityControl: "Air-gaps operator laptop from sensitive target network VLAN.",
        stateTransition: "Client connected to PSM isolation proxy.",
      },
      {
        stepNumber: 4,
        label: "Credential Injection",
        title: "Transparent Server-Side Injection",
        actor: "PSM Connection Component",
        component: "PSM Memory / Target Protocol",
        protocolOrChannel: "Vault TCP 1858 -> Target RDP/SSH",
        actionSummary:
          "PSM retrieves target password from Vault and injects it in memory into target authentication handshake. Operator never sees or receives the password.",
        securityControl:
          "Zero plain-text credential exposure; eliminates client-side memory dump threats (Mimikatz).",
        stateTransition: "Privileged target session established.",
      },
      {
        stepNumber: 5,
        label: "Recording & Audit",
        title: "Live Video & Keystroke Recording",
        actor: "PSM Recorder Agent",
        component: "PSM Storage / Vault",
        protocolOrChannel: "Encrypted Recording Stream",
        actionSummary:
          "PSM records full-motion video of operator screen, captures keystrokes, and indexes executed shell commands in real time.",
        securityControl:
          "Provides complete forensic non-repudiation for audit and security analysis.",
        stateTransition: "Session status: 'Active (Recording)'.",
      },
      {
        stepNumber: 6,
        label: "Termination & OTP",
        title: "Session Termination & One-Time Rotation",
        actor: "Operator / Admin / CPM",
        component: "PSM / CPM Engine",
        protocolOrChannel: "Session Teardown -> CPM Task",
        actionSummary:
          "Operator disconnects or administrator forcibly terminates session in PVWA. CPM immediately rotates target password (One-Time Password policy).",
        securityControl:
          "Prevents credential replay even if an attacker hijacked the terminal session.",
        stateTransition: "Session closed; password rotated in compliance.",
      },
    ],
  },
  "safe-auth": {
    id: "safe-auth",
    title: "Safe Authorization & Least-Privilege Evaluation",
    description:
      "Granular evaluation matrix determining whether an administrator is permitted to Connect via proxy, Retrieve secrets, or Manage Safe members.",
    steps: [
      {
        stepNumber: 1,
        label: "User Request",
        title: "User Authenticates to PAM Portal",
        actor: "End User / Operator",
        component: "PVWA Gateway",
        protocolOrChannel: "HTTPS 443 / SAML SSO",
        actionSummary:
          "Operator logs into PVWA using corporate credentials and requests access to an account stored in a Safe.",
        securityControl:
          "Enforces multi-factor authentication before permitting Safe directory lookups.",
        stateTransition: "User authenticated; claims evaluated.",
      },
      {
        stepNumber: 2,
        label: "Group Membership",
        title: "Directory Group Mapping",
        actor: "Vault Directory Service",
        component: "Digital Vault",
        protocolOrChannel: "LDAP / Internal Vault Security DB",
        actionSummary:
          "Vault checks user's Active Directory security group memberships and maps them against Safe member assignments.",
        securityControl:
          "Role-Based Access Control (RBAC) avoids granting permissions to individual users.",
        stateTransition: "Safe memberships identified.",
      },
      {
        stepNumber: 3,
        label: "Permission Matrix",
        title: "Granular Permission Check",
        actor: "Vault Policy Evaluator",
        component: "Digital Vault",
        protocolOrChannel: "Internal ACL Engine",
        actionSummary:
          "Vault evaluates specific granular permissions: 'List accounts', 'Use accounts', and 'Retrieve accounts'.",
        securityControl: "Separates connection rights (Use) from secret viewing rights (Retrieve).",
        stateTransition: "Access decision formulated.",
      },
      {
        stepNumber: 4,
        label: "Access Decision",
        title: "Enforce Least-Privilege Execution",
        actor: "PAM Policy Enforcement Point",
        component: "PVWA & Vault",
        protocolOrChannel: "Application Logic",
        actionSummary:
          "If user only has 'Use accounts', system enables the 'Connect' button but hides the 'Show Password' and 'Copy' actions.",
        securityControl: "Enforces strict operational least-privilege; prevents data exfiltration.",
        stateTransition: "Action permitted or denied.",
      },
      {
        stepNumber: 5,
        label: "Audit Event",
        title: "Immutable Access Audit Event",
        actor: "Vault Audit Logger",
        component: "Digital Vault Database",
        protocolOrChannel: "Tamper-Evident Ledger",
        actionSummary:
          "Vault writes immutable audit record detailing exact user, client IP, Safe name, target account, and permission utilized.",
        securityControl:
          "Full auditability for internal compliance and external regulatory inquiries.",
        stateTransition: "Audit logged: 'User accessed Safe object'.",
      },
    ],
  },
};

interface WorkflowVisualizerProps {
  workflowId: WorkflowType;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ workflowId }) => {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowType>(workflowId);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const wf = WORKFLOWS[activeWorkflow] || WORKFLOWS.onboarding;
  const currentStep = wf.steps[activeStepIndex] || wf.steps[0];

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % wf.steps.length);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, wf.steps.length]);

  function handleSelectWorkflow(wId: WorkflowType) {
    setActiveWorkflow(wId);
    setActiveStepIndex(0);
    setIsPlaying(false);
  }

  function handleNext() {
    setActiveStepIndex((prev) => (prev < wf.steps.length - 1 ? prev + 1 : 0));
  }

  function handlePrev() {
    setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : wf.steps.length - 1));
  }

  function handleReset() {
    setActiveStepIndex(0);
    setIsPlaying(false);
  }

  return (
    <div className="workflow-visualizer-container" style={{ marginBottom: 24 }}>
      {/* Workflow Header & Selector */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#F8FAFC",
          padding: "10px 14px",
          border: "1px solid #D1D5DB",
          borderBottom: "none",
          borderRadius: "2px 2px 0 0",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Workflow size={16} className="text-[#0078D4]" />
          <span
            style={{ fontSize: 12, fontWeight: 700, color: "#1E293B", textTransform: "uppercase" }}
          >
            Operational Workflow Engine Visualizer
          </span>
        </div>

        {/* Workflow Switcher Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {(
            [
              { id: "onboarding", label: "Onboarding" },
              { id: "rotation", label: "CPM Rotation" },
              { id: "session", label: "PSM Session" },
              { id: "safe-auth", label: "Safe Access" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectWorkflow(t.id)}
              className={`pvwa-btn pvwa-btn-sm ${
                activeWorkflow === t.id ? "pvwa-btn-primary" : "pvwa-btn-secondary"
              }`}
              style={{ fontSize: 10.5, padding: "3px 8px" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workflow Stage Canvas */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #D1D5DB",
          padding: "16px 18px",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
            {wf.title}
          </h4>
          <p style={{ margin: 0, fontSize: 11.5, color: "#64748B" }}>{wf.description}</p>
        </div>

        {/* Step Progress Chain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 10,
            marginBottom: 16,
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          {wf.steps.map((st, idx) => {
            const isActive = idx === activeStepIndex;
            const isPassed = idx < activeStepIndex;
            return (
              <React.Fragment key={idx}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStepIndex(idx);
                    setIsPlaying(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    background: isActive ? "#0078D4" : isPassed ? "#E6F4EA" : "#F8FAFC",
                    border: `1px solid ${isActive ? "#0078D4" : isPassed ? "#CEEAD6" : "#E2E8F0"}`,
                    borderRadius: 2,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: isActive ? "#FFFFFF" : isPassed ? "#137333" : "#64748B",
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isPassed ? "✓" : st.stepNumber}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "#FFFFFF" : isPassed ? "#137333" : "#334155",
                    }}
                  >
                    {st.label}
                  </span>
                </button>
                {idx < wf.steps.length - 1 && (
                  <ArrowRight
                    size={14}
                    style={{ color: isPassed ? "#137333" : "#CBD5E1", flexShrink: 0 }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Detailed Step Breakdown Card */}
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderLeft: "4px solid #0078D4",
            borderRadius: 2,
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#0078D4",
                  textTransform: "uppercase",
                }}
              >
                Step {currentStep.stepNumber} of {wf.steps.length} · {currentStep.component}
              </span>
              <h3 style={{ margin: "2px 0 0 0", fontSize: 15, fontWeight: 700, color: "#1E293B" }}>
                {currentStep.title}
              </h3>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span className="pvwa-badge pvwa-badge-info" style={{ fontSize: 10.5 }}>
                Actor: {currentStep.actor}
              </span>
              <span className="pvwa-badge pvwa-badge-default" style={{ fontSize: 10.5 }}>
                {currentStep.protocolOrChannel}
              </span>
            </div>
          </div>

          <p style={{ margin: "0 0 12px 0", fontSize: 12.5, color: "#334155", lineHeight: 1.55 }}>
            {currentStep.actionSummary}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                padding: "8px 10px",
                borderRadius: 2,
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#0078D4",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                Security Control Enforced:
              </span>
              <span style={{ fontSize: 11.5, color: "#475569" }}>
                {currentStep.securityControl}
              </span>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                padding: "8px 10px",
                borderRadius: 2,
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#10B981",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                State Transition:
              </span>
              <span style={{ fontSize: 11.5, color: "#475569" }}>
                {currentStep.stateTransition}
              </span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 14,
            paddingTop: 10,
            borderTop: "1px solid #F1F5F9",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
              onClick={handlePrev}
              title="Previous Step"
            >
              <ChevronLeft size={13} />
              Previous Step
            </button>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-sm pvwa-btn-primary"
              onClick={handleNext}
              title="Next Step"
            >
              Next Step
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className={`pvwa-btn pvwa-btn-sm ${isPlaying ? "pvwa-btn-danger" : "pvwa-btn-secondary"}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              {isPlaying ? "Pause Auto-Step" : "Play Animation"}
            </button>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
              onClick={handleReset}
              title="Reset to Step 1"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
