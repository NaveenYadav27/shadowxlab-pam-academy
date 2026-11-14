import React, { useState } from "react";
import {
  VaultServerSvg,
  PvwaPortalSvg,
  CpmEngineSvg,
  PsmProxySvg,
  AdminWorkstationSvg,
  WindowsServerSvg,
  LinuxServerSvg,
  DatabaseServerSvg,
  DomainControllerSvg,
  SafeContainerSvg,
} from "./pam-svg-icons";
import { ComponentInspector, ARCHITECTURE_COMPONENTS } from "./ComponentInspector";
import { Layers, Info, Filter, CheckCircle2 } from "lucide-react";

interface ArchitectureExplorerProps {
  initialComponent?: string;
  onJumpConsole?: (section: "accounts" | "safes" | "cpm" | "psm" | "audit") => void;
}

export const ArchitectureExplorer: React.FC<ArchitectureExplorerProps> = ({
  initialComponent = "vault",
  onJumpConsole,
}) => {
  const [selectedComp, setSelectedComp] = useState<string>(initialComponent);
  const [filterMode, setFilterMode] = useState<"all" | "vault" | "pvwa" | "cpm" | "psm" | "target">(
    "all",
  );

  function handleFilterSelect(mode: "all" | "vault" | "pvwa" | "cpm" | "psm" | "target") {
    setFilterMode(mode);
    if (mode === "vault") setSelectedComp("vault");
    else if (mode === "pvwa") setSelectedComp("pvwa");
    else if (mode === "cpm") setSelectedComp("cpm");
    else if (mode === "psm") setSelectedComp("psm");
    else if (mode === "target") setSelectedComp("target");
  }

  // Active highlight state checks
  const isVaultHighlighted =
    selectedComp === "vault" || filterMode === "vault" || filterMode === "all";
  const isPvwaHighlighted =
    selectedComp === "pvwa" || filterMode === "pvwa" || filterMode === "all";
  const isCpmHighlighted = selectedComp === "cpm" || filterMode === "cpm" || filterMode === "all";
  const isPsmHighlighted = selectedComp === "psm" || filterMode === "psm" || filterMode === "all";
  const isTargetHighlighted =
    selectedComp === "target" || filterMode === "target" || filterMode === "all";
  const isWorkstationHighlighted = selectedComp === "workstation" || filterMode === "all";

  return (
    <div className="architecture-explorer-container" style={{ marginBottom: 24 }}>
      {/* Topology Toolbar */}
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
          <Layers size={16} className="text-[#0078D4]" />
          <span
            style={{ fontSize: 12, fontWeight: 700, color: "#1E293B", textTransform: "uppercase" }}
          >
            Interactive Enterprise PAM Topology Explorer
          </span>
          <span style={{ fontSize: 11, color: "#64748B" }}>
            (Click any component to inspect protocols, boundaries & runbooks)
          </span>
        </div>

        {/* Filter Presets */}
        <div style={{ display: "flex", gap: 4 }}>
          {(
            [
              { id: "all", label: "Full Topology" },
              { id: "vault", label: "Digital Vault" },
              { id: "pvwa", label: "PVWA Portal" },
              { id: "cpm", label: "CPM Engine" },
              { id: "psm", label: "PSM Proxy" },
              { id: "target", label: "Targets" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFilterSelect(tab.id)}
              className={`pvwa-btn pvwa-btn-sm ${
                filterMode === tab.id ? "pvwa-btn-primary" : "pvwa-btn-secondary"
              }`}
              style={{ fontSize: 10.5, padding: "3px 8px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive SVG Architecture Canvas */}
      <div
        className="architecture-canvas-wrapper"
        style={{
          background: "#0F172A",
          border: "1px solid #D1D5DB",
          position: "relative",
          overflowX: "auto",
        }}
      >
        <svg
          viewBox="0 0 940 440"
          style={{ width: "100%", height: "auto", minWidth: 780, display: "block" }}
        >
          <defs>
            <linearGradient
              id="zoneGrad1"
              x1="0"
              y1="0"
              x2="0"
              y2="440"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1E293B" stopOpacity="0.6" />
              <stop offset="1" stopColor="#0F172A" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient
              id="zoneGrad2"
              x1="0"
              y1="0"
              x2="0"
              y2="440"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0369A1" stopOpacity="0.12" />
              <stop offset="1" stopColor="#0F172A" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient
              id="zoneGrad3"
              x1="0"
              y1="0"
              x2="0"
              y2="440"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#10B981" stopOpacity="0.08" />
              <stop offset="1" stopColor="#0F172A" stopOpacity="0.8" />
            </linearGradient>
            <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 Z" fill="#38BDF8" />
            </marker>
            <marker
              id="arrowGreen"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 Z" fill="#10B981" />
            </marker>
            <marker
              id="arrowOrange"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 Z" fill="#F59E0B" />
            </marker>
          </defs>

          {/* ZONE 1: Client & Operator Zone (X: 10 -> 210) */}
          <rect
            x="10"
            y="10"
            width="200"
            height="420"
            rx="4"
            fill="url(#zoneGrad1)"
            stroke="#334155"
            strokeWidth="1"
          />
          <text x="24" y="32" fill="#94A3B8" fontSize="10" fontWeight="700" letterSpacing="0.8">
            ZONE 1: OPERATOR NETWORK (TIER-2)
          </text>
          <text x="24" y="46" fill="#64748B" fontSize="8.5">
            Untrusted Client Workstations
          </text>

          {/* ZONE 2: Hardened CyberArk PAS DMZ (X: 230 -> 640) */}
          <rect
            x="230"
            y="10"
            width="410"
            height="420"
            rx="4"
            fill="url(#zoneGrad2)"
            stroke="#0284C7"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="246" y="32" fill="#38BDF8" fontSize="10" fontWeight="700" letterSpacing="0.8">
            ZONE 2: HARDENED PAM ISOLATION BOUNDARY (TIER-0 / TIER-1)
          </text>
          <text x="246" y="46" fill="#93C5FD" fontSize="8.5">
            Air-Gapped Vault Protocol (1858) · Server-Side Credential Injection
          </text>

          {/* ZONE 3: Target Enterprise Infrastructure (X: 660 -> 930) */}
          <rect
            x="660"
            y="10"
            width="270"
            height="420"
            rx="4"
            fill="url(#zoneGrad3)"
            stroke="#059669"
            strokeWidth="1"
          />
          <text x="676" y="32" fill="#34D399" fontSize="10" fontWeight="700" letterSpacing="0.8">
            ZONE 3: TARGET INFRASTRUCTURE (TIER-0 / TIER-1)
          </text>
          <text x="676" y="46" fill="#6EE7B7" fontSize="8.5">
            corp.gfs.local Active Directory, Servers & DBs
          </text>

          {/* ================================================================= */}
          {/* INTERCONNECTING VECTOR PATHS & PROTOCOL LABELS */}
          {/* ================================================================= */}

          {/* Workstation -> PVWA (HTTPS 443) */}
          <path
            d="M170 120 L270 120"
            stroke={isPvwaHighlighted ? "#38BDF8" : "#475569"}
            strokeWidth={isPvwaHighlighted ? "2.5" : "1.5"}
            strokeDasharray="4 3"
            markerEnd="url(#arrowBlue)"
          />
          <rect
            x="186"
            y="108"
            width="68"
            height="15"
            rx="2"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="0.5"
          />
          <text x="190" y="119" fill="#38BDF8" fontSize="8" fontWeight="700">
            HTTPS 443
          </text>

          {/* Workstation -> PSM (RDP 3389 / HTML5) */}
          <path
            d="M170 290 L270 290"
            stroke={isPsmHighlighted ? "#38BDF8" : "#475569"}
            strokeWidth={isPsmHighlighted ? "2.5" : "1.5"}
            strokeDasharray="4 3"
            markerEnd="url(#arrowBlue)"
          />
          <rect
            x="186"
            y="278"
            width="68"
            height="15"
            rx="2"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="0.5"
          />
          <text x="190" y="289" fill="#38BDF8" fontSize="8" fontWeight="700">
            RDP 3389
          </text>

          {/* PVWA -> Digital Vault (TCP 1858) */}
          <path
            d="M390 120 L480 170"
            stroke={isVaultHighlighted ? "#38BDF8" : "#475569"}
            strokeWidth={isVaultHighlighted ? "2.5" : "1.5"}
            markerEnd="url(#arrowBlue)"
          />
          <rect
            x="408"
            y="132"
            width="64"
            height="15"
            rx="2"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="0.5"
          />
          <text x="412" y="143" fill="#38BDF8" fontSize="8" fontWeight="700">
            TCP 1858
          </text>

          {/* CPM -> Digital Vault (TCP 1858) */}
          <path
            d="M390 205 L480 205"
            stroke={isVaultHighlighted ? "#F59E0B" : "#475569"}
            strokeWidth={isCpmHighlighted ? "2.5" : "1.5"}
            markerEnd="url(#arrowOrange)"
          />
          <rect
            x="408"
            y="197"
            width="64"
            height="15"
            rx="2"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="0.5"
          />
          <text x="412" y="208" fill="#F59E0B" fontSize="8" fontWeight="700">
            TCP 1858
          </text>

          {/* PSM -> Digital Vault (TCP 1858) */}
          <path
            d="M390 290 L480 240"
            stroke={isVaultHighlighted ? "#38BDF8" : "#475569"}
            strokeWidth={isPsmHighlighted ? "2.5" : "1.5"}
            markerEnd="url(#arrowBlue)"
          />
          <rect
            x="408"
            y="260"
            width="64"
            height="15"
            rx="2"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="0.5"
          />
          <text x="412" y="271" fill="#38BDF8" fontSize="8" fontWeight="700">
            TCP 1858
          </text>

          {/* CPM -> Targets (SMB 445 / SSH 22 / SQL) */}
          <path
            d="M390 215 C 440 215, 620 200, 700 200"
            stroke={isCpmHighlighted ? "#F59E0B" : "#475569"}
            strokeWidth={isCpmHighlighted ? "2.5" : "1.5"}
            strokeDasharray="3 2"
            fill="none"
            markerEnd="url(#arrowOrange)"
          />
          <rect
            x="580"
            y="195"
            width="80"
            height="15"
            rx="2"
            fill="#0F172A"
            stroke="#F59E0B"
            strokeWidth="0.5"
          />
          <text x="584" y="206" fill="#F59E0B" fontSize="7.5" fontWeight="700">
            SMB 445/SSH 22
          </text>

          {/* PSM -> Targets (Brokered RDP / SSH Session) */}
          <path
            d="M390 310 C 460 310, 620 310, 700 310"
            stroke={isPsmHighlighted ? "#10B981" : "#475569"}
            strokeWidth={isPsmHighlighted ? "2.5" : "1.5"}
            fill="none"
            markerEnd="url(#arrowGreen)"
          />
          <rect
            x="580"
            y="302"
            width="76"
            height="15"
            rx="2"
            fill="#0F172A"
            stroke="#10B981"
            strokeWidth="0.5"
          />
          <text x="584" y="313" fill="#10B981" fontSize="7.5" fontWeight="700">
            INJECTED PROXY
          </text>

          {/* ================================================================= */}
          {/* COMPONENT INTERACTIVE NODES */}
          {/* ================================================================= */}

          {/* 1. Administrator Workstation Node */}
          <g
            transform="translate(40, 160)"
            onClick={() => setSelectedComp("workstation")}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="0"
              y="0"
              width="130"
              height="100"
              rx="6"
              fill={selectedComp === "workstation" ? "#1E293B" : "#0F172A"}
              stroke={selectedComp === "workstation" ? "#0078D4" : "#334155"}
              strokeWidth={selectedComp === "workstation" ? "2.5" : "1"}
            />
            <foreignObject x="37" y="8" width="56" height="56">
              <AdminWorkstationSvg size={56} highlighted={selectedComp === "workstation"} />
            </foreignObject>
            <text x="65" y="76" fill="#E2E8F0" fontSize="10" fontWeight="700" textAnchor="middle">
              Operator Station
            </text>
            <text x="65" y="89" fill="#94A3B8" fontSize="8" textAnchor="middle">
              Tier-2 Corporate LAN
            </text>
          </g>

          {/* 2. PVWA Node */}
          <g
            transform="translate(260, 70)"
            onClick={() => setSelectedComp("pvwa")}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="0"
              y="0"
              width="130"
              height="95"
              rx="6"
              fill={selectedComp === "pvwa" ? "#1E293B" : "#0F172A"}
              stroke={selectedComp === "pvwa" ? "#0078D4" : "#334155"}
              strokeWidth={selectedComp === "pvwa" ? "2.5" : "1"}
            />
            <foreignObject x="37" y="6" width="56" height="56">
              <PvwaPortalSvg size={56} highlighted={selectedComp === "pvwa"} />
            </foreignObject>
            <text x="65" y="73" fill="#E2E8F0" fontSize="10" fontWeight="700" textAnchor="middle">
              PVWA Web Portal
            </text>
            <text x="65" y="85" fill="#38BDF8" fontSize="8" textAnchor="middle">
              HTTPS 443 Ingress
            </text>
          </g>

          {/* 3. CPM Node */}
          <g
            transform="translate(260, 175)"
            onClick={() => setSelectedComp("cpm")}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="0"
              y="0"
              width="130"
              height="95"
              rx="6"
              fill={selectedComp === "cpm" ? "#1E293B" : "#0F172A"}
              stroke={selectedComp === "cpm" ? "#F59E0B" : "#334155"}
              strokeWidth={selectedComp === "cpm" ? "2.5" : "1"}
            />
            <foreignObject x="37" y="6" width="56" height="56">
              <CpmEngineSvg size={56} highlighted={selectedComp === "cpm"} />
            </foreignObject>
            <text x="65" y="73" fill="#E2E8F0" fontSize="10" fontWeight="700" textAnchor="middle">
              CPM Worker
            </text>
            <text x="65" y="85" fill="#F59E0B" fontSize="8" textAnchor="middle">
              Password Rotation
            </text>
          </g>

          {/* 4. PSM Node */}
          <g
            transform="translate(260, 280)"
            onClick={() => setSelectedComp("psm")}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="0"
              y="0"
              width="130"
              height="95"
              rx="6"
              fill={selectedComp === "psm" ? "#1E293B" : "#0F172A"}
              stroke={selectedComp === "psm" ? "#10B981" : "#334155"}
              strokeWidth={selectedComp === "psm" ? "2.5" : "1"}
            />
            <foreignObject x="37" y="6" width="56" height="56">
              <PsmProxySvg size={56} highlighted={selectedComp === "psm"} />
            </foreignObject>
            <text x="65" y="73" fill="#E2E8F0" fontSize="10" fontWeight="700" textAnchor="middle">
              PSM Jump Proxy
            </text>
            <text x="65" y="85" fill="#10B981" fontSize="8" textAnchor="middle">
              Session Isolation / REC
            </text>
          </g>

          {/* 5. Central Digital Vault Node */}
          <g
            transform="translate(480, 140)"
            onClick={() => setSelectedComp("vault")}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="0"
              y="0"
              width="140"
              height="140"
              rx="8"
              fill={selectedComp === "vault" ? "#0F2847" : "#0A192F"}
              stroke={selectedComp === "vault" ? "#38BDF8" : "#0284C7"}
              strokeWidth={selectedComp === "vault" ? "3" : "1.5"}
            />
            <foreignObject x="42" y="12" width="56" height="56">
              <VaultServerSvg size={56} highlighted={selectedComp === "vault"} />
            </foreignObject>
            <text x="70" y="82" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
              Digital Vault
            </text>
            <text x="70" y="96" fill="#38BDF8" fontSize="8.5" fontWeight="600" textAnchor="middle">
              TIER-0 IDENTITY ROOT
            </text>
            <rect
              x="20"
              y="106"
              width="100"
              height="20"
              rx="3"
              fill="#0F172A"
              stroke="#334155"
              strokeWidth="0.5"
            />
            <text
              x="70"
              y="119"
              fill="#10B981"
              fontSize="8"
              fontFamily="monospace"
              textAnchor="middle"
            >
              SAFES · AES-256
            </text>
          </g>

          {/* 6. Target Fleet Cluster */}
          <g
            transform="translate(700, 70)"
            onClick={() => setSelectedComp("target")}
            style={{ cursor: "pointer" }}
          >
            {/* Target 1: Domain Controller */}
            <g transform="translate(0, 0)">
              <rect
                x="0"
                y="0"
                width="200"
                height="65"
                rx="4"
                fill="#0F172A"
                stroke={selectedComp === "target" ? "#10B981" : "#334155"}
                strokeWidth="1"
              />
              <foreignObject x="8" y="10" width="45" height="45">
                <DomainControllerSvg size={45} />
              </foreignObject>
              <text x="60" y="28" fill="#E2E8F0" fontSize="10" fontWeight="700">
                DC-01 (corp.gfs.local)
              </text>
              <text x="60" y="42" fill="#94A3B8" fontSize="8">
                Active Directory / Kerberos KDC
              </text>
            </g>

            {/* Target 2: Windows Server */}
            <g transform="translate(0, 80)">
              <rect
                x="0"
                y="0"
                width="200"
                height="65"
                rx="4"
                fill="#0F172A"
                stroke={selectedComp === "target" ? "#10B981" : "#334155"}
                strokeWidth="1"
              />
              <foreignObject x="8" y="10" width="45" height="45">
                <WindowsServerSvg size={45} />
              </foreignObject>
              <text x="60" y="28" fill="#E2E8F0" fontSize="10" fontWeight="700">
                WIN-SRV-01 &amp; 02
              </text>
              <text x="60" y="42" fill="#94A3B8" fontSize="8">
                Application Hosts (SMB 445 / RDP)
              </text>
            </g>

            {/* Target 3: Linux & Database */}
            <g transform="translate(0, 160)">
              <rect
                x="0"
                y="0"
                width="200"
                height="65"
                rx="4"
                fill="#0F172A"
                stroke={selectedComp === "target" ? "#10B981" : "#334155"}
                strokeWidth="1"
              />
              <foreignObject x="8" y="10" width="45" height="45">
                <DatabaseServerSvg size={45} />
              </foreignObject>
              <text x="60" y="28" fill="#E2E8F0" fontSize="10" fontWeight="700">
                DB-PROD-01 (SQL SA)
              </text>
              <text x="60" y="42" fill="#94A3B8" fontSize="8">
                Financial Database Server (TCP 1433)
              </text>
            </g>

            {/* Target 4: Linux Host */}
            <g transform="translate(0, 240)">
              <rect
                x="0"
                y="0"
                width="200"
                height="65"
                rx="4"
                fill="#0F172A"
                stroke={selectedComp === "target" ? "#10B981" : "#334155"}
                strokeWidth="1"
              />
              <foreignObject x="8" y="10" width="45" height="45">
                <LinuxServerSvg size={45} />
              </foreignObject>
              <text x="60" y="28" fill="#E2E8F0" fontSize="10" fontWeight="700">
                LNX-BASTION-01
              </text>
              <text x="60" y="42" fill="#94A3B8" fontSize="8">
                RHEL 9 Web / SSH Host (TCP 22)
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Selected Component Deep Inspector */}
      <ComponentInspector
        componentId={selectedComp}
        onSelectComponent={setSelectedComp}
        onJumpConsole={onJumpConsole}
      />
    </div>
  );
};
