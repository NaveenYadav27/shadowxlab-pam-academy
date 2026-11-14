import React from "react";
import {
  ShieldAlert,
  Network,
  Lock,
  ArrowRight,
  ExternalLink,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export interface ComponentDetails {
  id: string;
  name: string;
  category: "Vault" | "PVWA" | "CPM" | "PSM" | "Workstation" | "Target" | "Safe";
  tier:
    "Tier-0 (Core Identity)" | "Tier-1 (Enterprise Infrastructure)" | "Tier-2 (Operator Endpoints)";
  role: string;
  networkProtocols: {
    direction: "Inbound" | "Outbound";
    protocol: string;
    port: string;
    peer: string;
    purpose: string;
  }[];
  securityBoundary: string;
  authMechanisms: string;
  failureScenarios: {
    errorCode: string;
    description: string;
    remediation: string;
  }[];
  consoleJumpTarget?: "accounts" | "safes" | "cpm" | "psm" | "audit";
}

export const ARCHITECTURE_COMPONENTS: Record<string, ComponentDetails> = {
  vault: {
    id: "vault",
    name: "CyberArk Digital Vault",
    category: "Vault",
    tier: "Tier-0 (Core Identity)",
    role: "Hardened cryptographic repository maintaining encrypted Safes, AES-256 encrypted credential records, user entitlements, and tamper-evident audit logs.",
    networkProtocols: [
      {
        direction: "Inbound",
        protocol: "Encrypted Vault Protocol",
        port: "TCP 1858",
        peer: "PVWA, CPM, PSM",
        purpose:
          "Authentication, secret retrieval, policy synchronizations, and audit event writes.",
      },
    ],
    securityBoundary:
      "Isolated on dedicated server with locked-down Windows firewall. No external administrative ports (RDP, SMB) permitted. Out-of-band management only.",
    authMechanisms:
      "Vault-internal cryptographic keys, PKI certificates, or Kerberos ticket authentication with granular Safe Access Control Lists (ACLs).",
    failureScenarios: [
      {
        errorCode: "ITATS006E",
        description: "Station is not authenticated. Vault cannot verify component identity.",
        remediation: "Verify component certificate or credential file on PVWA/CPM/PSM server.",
      },
      {
        errorCode: "ITATS020E",
        description: "Safe is locked or user has insufficient rights to access Safe.",
        remediation:
          "Audit Safe permissions in Safes console to grant UseAccounts/RetrieveAccounts.",
      },
    ],
    consoleJumpTarget: "safes",
  },
  pvwa: {
    id: "pvwa",
    name: "Privileged Vault Web Access (PVWA)",
    category: "PVWA",
    tier: "Tier-1 (Enterprise Infrastructure)",
    role: "Administrative web console for account onboarding, Safe management, privileged session requests, dual-control approvals, and reporting.",
    networkProtocols: [
      {
        direction: "Inbound",
        protocol: "HTTPS / TLS 1.3",
        port: "TCP 443",
        peer: "Operator Workstations",
        purpose: "Browser-based administrative session interaction and REST API access.",
      },
      {
        direction: "Outbound",
        protocol: "Encrypted Vault Protocol",
        port: "TCP 1858",
        peer: "Digital Vault",
        purpose: "Query accounts, authenticate users, submit approvals, write audit logs.",
      },
    ],
    securityBoundary:
      "Hosted on hardened IIS web servers in enterprise DMZ or Management VLAN. Protected by Web Application Firewall (WAF) and MFA enforcement.",
    authMechanisms:
      "SAML 2.0 / OIDC Identity Provider integration, RADIUS multi-factor authentication, or Active Directory Kerberos.",
    failureScenarios: [
      {
        errorCode: "CASGS041E",
        description: "Communication failure between PVWA and Vault server on port 1858.",
        remediation:
          "Check network connectivity and verify Vault Server Service (PrivateArk) is RUNNING.",
      },
    ],
    consoleJumpTarget: "accounts",
  },
  cpm: {
    id: "cpm",
    name: "Central Policy Manager (CPM)",
    category: "CPM",
    tier: "Tier-1 (Enterprise Infrastructure)",
    role: "Automated password management service executing scheduled and ad-hoc Verify, Change, and Reconcile operations on managed target accounts.",
    networkProtocols: [
      {
        direction: "Inbound",
        protocol: "None (Worker Poller)",
        port: "N/A",
        peer: "None",
        purpose: "CPM does not listen on inbound ports; it initiates outbound connections.",
      },
      {
        direction: "Outbound",
        protocol: "Encrypted Vault Protocol",
        port: "TCP 1858",
        peer: "Digital Vault",
        purpose: "Pulls rotation tasks, fetches current passwords, stores rotated passwords.",
      },
      {
        direction: "Outbound",
        protocol: "SMB / RPC / SSH / SQL",
        port: "TCP 445 / 22 / 1433",
        peer: "Target Systems",
        purpose: "Connects to target endpoints to test credentials and reset password hashes.",
      },
    ],
    securityBoundary:
      "Hardened Windows service running with dedicated service account. Bound to specific Safes and rotation platforms.",
    authMechanisms:
      "Vault AppID authentication for Vault access; domain/local service credentials and Reconcile accounts for target updates.",
    failureScenarios: [
      {
        errorCode: "CACPM072E",
        description: "Network path was not found when connecting to target endpoint.",
        remediation:
          "Inspect target firewall; ensure TCP 445 (SMB) or TCP 22 (SSH) is reachable from CPM host.",
      },
      {
        errorCode: "CACPM250E",
        description: "Failed to perform reconcile: Target account is locked out.",
        remediation:
          "Unlock target account on Active Directory / local SAM before running reconcile.",
      },
    ],
    consoleJumpTarget: "cpm",
  },
  psm: {
    id: "psm",
    name: "Privileged Session Manager (PSM)",
    category: "PSM",
    tier: "Tier-1 (Enterprise Infrastructure)",
    role: "Security jump proxy and isolation bastion. Transparently retrieves target credentials from Vault and injects them server-side into RDP/SSH sessions while recording video and keystrokes.",
    networkProtocols: [
      {
        direction: "Inbound",
        protocol: "RDP / SSH / HTML5 Gateway",
        port: "TCP 3389 / 22 / 443",
        peer: "Operator Workstations",
        purpose: "Accepts client connection requests initiated from PVWA.",
      },
      {
        direction: "Outbound",
        protocol: "Encrypted Vault Protocol",
        port: "TCP 1858",
        peer: "Digital Vault",
        purpose: "Retrieves credentials dynamically for memory-only injection.",
      },
      {
        direction: "Outbound",
        protocol: "RDP / SSH / SQL Net",
        port: "TCP 3389 / 22 / 1521",
        peer: "Target Systems",
        purpose: "Brokers transparent privileged session to target machine.",
      },
    ],
    securityBoundary:
      "Hardened Remote Desktop Session Host (RDSH) with AppLocker restrictions prohibiting arbitrary software execution.",
    authMechanisms:
      "Vault-issued dynamic session tickets; server-side credential injection without exposing credentials to operator workstation.",
    failureScenarios: [
      {
        errorCode: "PSMSR037E",
        description: "Privileged Session Manager failed to launch connection component.",
        remediation:
          "Verify target platform connection component settings and AppLocker rules on PSM server.",
      },
    ],
    consoleJumpTarget: "psm",
  },
  workstation: {
    id: "workstation",
    name: "Operator Workstation",
    category: "Workstation",
    tier: "Tier-2 (Operator Endpoints)",
    role: "Standard administrative desktop or laptop. Operators access PVWA via browser and establish RDP/SSH sessions via PSM without ever seeing plaintext credentials.",
    networkProtocols: [
      {
        direction: "Outbound",
        protocol: "HTTPS (PVWA)",
        port: "TCP 443",
        peer: "PVWA Portal",
        purpose: "Account discovery, session requests, Safe administration.",
      },
      {
        direction: "Outbound",
        protocol: "RDP / HTML5",
        port: "TCP 3389 / 443",
        peer: "PSM Proxy",
        purpose: "Connects to PSM proxy server for isolated administrative session.",
      },
    ],
    securityBoundary:
      "Untrusted client zone. Credentials must never touch this host memory to prevent LSASS harvesting attacks (Mimikatz).",
    authMechanisms: "Corporate SSO, Smart Card (PIV/CAC), or FIDO2 WebAuthn token.",
    failureScenarios: [
      {
        errorCode: "CLIENT_RDP_DROP",
        description: "Local RDP client cannot establish connection to PSM proxy.",
        remediation:
          "Verify corporate firewall allows TCP 3389 or route traffic through PVWA HTML5 Gateway.",
      },
    ],
    consoleJumpTarget: "accounts",
  },
  target: {
    id: "target",
    name: "Target Systems (DC, Windows, Linux, DB)",
    category: "Target",
    tier: "Tier-1 (Enterprise Infrastructure)",
    role: "Managed enterprise infrastructure hosting sensitive business applications, databases, and Active Directory domains.",
    networkProtocols: [
      {
        direction: "Inbound",
        protocol: "SMB / RPC / SSH / SQL",
        port: "TCP 445 / 22 / 1433",
        peer: "CPM",
        purpose: "Password rotation and verification.",
      },
      {
        direction: "Inbound",
        protocol: "RDP / SSH / SQL",
        port: "TCP 3389 / 22 / 1521",
        peer: "PSM",
        purpose: "Transparent brokered session execution.",
      },
    ],
    securityBoundary:
      "Isolated in production server VLANs. Direct incoming administrative access from client workstations is blocked.",
    authMechanisms:
      "Local SAM, Active Directory Kerberos, PAM (/etc/shadow), or Database SA logins.",
    failureScenarios: [
      {
        errorCode: "SEC_AUTH_DESYNC",
        description: "Target password diverges from Vault record due to manual technician change.",
        remediation:
          "Trigger CPM Reconcile in Accounts Console to reset target hash with Reconcile Account.",
      },
    ],
    consoleJumpTarget: "accounts",
  },
};

interface ComponentInspectorProps {
  componentId: string;
  onSelectComponent: (id: string) => void;
  onJumpConsole?: (section: "accounts" | "safes" | "cpm" | "psm" | "audit") => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  componentId,
  onSelectComponent,
  onJumpConsole,
}) => {
  const comp = ARCHITECTURE_COMPONENTS[componentId] || ARCHITECTURE_COMPONENTS.vault;

  return (
    <div className="component-inspector-panel">
      {/* Header */}
      <div className="component-inspector-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Cpu size={20} className="text-[#0078D4]" />
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1E293B" }}>
              {comp.name}
            </h3>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#0078D4" }}>
              {comp.tier} · {comp.category}
            </span>
          </div>
        </div>

        {comp.consoleJumpTarget && onJumpConsole && (
          <button
            type="button"
            className="pvwa-btn pvwa-btn-sm pvwa-btn-primary"
            onClick={() => onJumpConsole(comp.consoleJumpTarget!)}
            style={{ fontSize: 11 }}
          >
            Open {comp.category} Console
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Operational Role */}
      <div style={{ marginTop: 12 }}>
        <p style={{ margin: 0, fontSize: 12.5, color: "#334155", lineHeight: 1.55 }}>{comp.role}</p>
      </div>

      {/* Network Protocol Specifications */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Network size={14} className="text-[#0078D4]" />
          <span
            style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}
          >
            Network Protocols & Connectivity Matrix
          </span>
        </div>
        <table className="academy-table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ width: "16%" }}>Flow</th>
              <th style={{ width: "24%" }}>Protocol & Port</th>
              <th style={{ width: "26%" }}>Connected Peer</th>
              <th style={{ width: "34%" }}>Operational Purpose</th>
            </tr>
          </thead>
          <tbody>
            {comp.networkProtocols.map((p, idx) => (
              <tr key={idx}>
                <td>
                  <span
                    className={`pvwa-badge ${
                      p.direction === "Inbound" ? "pvwa-badge-info" : "pvwa-badge-default"
                    }`}
                    style={{ fontSize: 10 }}
                  >
                    {p.direction}
                  </span>
                </td>
                <td>
                  <strong>{p.protocol}</strong> ({p.port})
                </td>
                <td>{p.peer}</td>
                <td>{p.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security Boundary & Authentication Matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 2,
            padding: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Lock size={13} className="text-[#0078D4]" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#1E293B" }}>
              Security Boundary
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11.5, color: "#475569", lineHeight: 1.45 }}>
            {comp.securityBoundary}
          </p>
        </div>

        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 2,
            padding: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <CheckCircle2 size={13} className="text-[#10B981]" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#1E293B" }}>
              Authentication Mechanics
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11.5, color: "#475569", lineHeight: 1.45 }}>
            {comp.authMechanisms}
          </p>
        </div>
      </div>

      {/* Failure Taxonomy & Runbook */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <AlertTriangle size={14} className="text-[#F59E0B]" />
          <span
            style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}
          >
            Component Failure Scenarios & Troubleshooting
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {comp.failureScenarios.map((f, idx) => (
            <div
              key={idx}
              style={{
                background: "#FEF7E0",
                border: "1px solid #FEEFC3",
                borderRadius: 2,
                padding: "8px 12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#B06000" }}>
                  [{f.errorCode}]
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#1E293B" }}>
                  {f.description}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                <strong>Remediation:</strong> {f.remediation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
