import React from "react";

interface SvgIconProps {
  size?: number | string;
  className?: string;
  highlighted?: boolean;
  status?: "online" | "active" | "warning" | "error" | "default";
}

export const VaultServerSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
  status = "online",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    <defs>
      <linearGradient
        id="vaultChassis"
        x1="8"
        y1="6"
        x2="56"
        y2="58"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="vaultDoor" x1="14" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#334155" />
        <stop offset="1" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="vaultGlow" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0078D4" />
        <stop offset="1" stopColor="#004C87" />
      </linearGradient>
    </defs>
    {/* Server Chassis Base */}
    <rect
      x="6"
      y="8"
      width="52"
      height="48"
      rx="4"
      fill="url(#vaultChassis)"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="2"
    />
    {/* Hardened Vault Door Frame */}
    <rect
      x="12"
      y="14"
      width="40"
      height="36"
      rx="3"
      fill="url(#vaultDoor)"
      stroke="#64748B"
      strokeWidth="1.5"
    />
    {/* Cryptographic Combination Wheel */}
    <circle cx="32" cy="32" r="12" fill="url(#vaultGlow)" stroke="#94A3B8" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
    {/* Vault Dial Spokes */}
    <line
      x1="32"
      y1="20"
      x2="32"
      y2="24"
      stroke="#CBD5E1"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="40"
      x2="32"
      y2="44"
      stroke="#CBD5E1"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="20"
      y1="32"
      x2="24"
      y2="32"
      stroke="#CBD5E1"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="40"
      y1="32"
      x2="44"
      y2="32"
      stroke="#CBD5E1"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Port 1858 Protocol Indicator */}
    <rect x="14" y="44" width="16" height="5" rx="1" fill="#0F172A" />
    <circle cx="18" cy="46.5" r="1.5" fill={status === "online" ? "#10B981" : "#F59E0B"} />
    <text x="21" y="48" fill="#94A3B8" fontSize="4" fontFamily="monospace" fontWeight="700">
      1858
    </text>
    {/* Status LED */}
    <circle cx="50" cy="12" r="2" fill="#10B981" />
  </svg>
);

export const PvwaPortalSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    <defs>
      <linearGradient id="pvwaScreen" x1="8" y1="10" x2="56" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="1" stopColor="#1E293B" />
      </linearGradient>
    </defs>
    {/* Web Console Outer Frame */}
    <rect
      x="6"
      y="10"
      width="52"
      height="42"
      rx="4"
      fill="url(#pvwaScreen)"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="2"
    />
    {/* Browser Tab Header */}
    <path
      d="M6 14C6 11.7909 7.79086 10 10 10H54C56.2091 10 58 11.7909 58 14V18H6V14Z"
      fill="#334155"
    />
    <circle cx="11" cy="14" r="1.5" fill="#EF4444" />
    <circle cx="15" cy="14" r="1.5" fill="#F59E0B" />
    <circle cx="19" cy="14" r="1.5" fill="#10B981" />
    <rect x="24" y="12" width="22" height="4" rx="2" fill="#1E293B" />
    <text x="26" y="15" fill="#38BDF8" fontSize="3" fontFamily="monospace" fontWeight="700">
      https://pvwa:443
    </text>
    {/* PVWA Navigation Strip */}
    <rect x="8" y="21" width="10" height="28" fill="#1E293B" rx="1" />
    <rect x="10" y="24" width="6" height="2" fill="#0078D4" rx="0.5" />
    <rect x="10" y="28" width="6" height="2" fill="#64748B" rx="0.5" />
    <rect x="10" y="32" width="6" height="2" fill="#64748B" rx="0.5" />
    {/* Accounts Table Layout */}
    <rect x="21" y="21" width="34" height="6" fill="#334155" rx="1" />
    <rect x="23" y="23" width="12" height="2" fill="#E2E8F0" rx="0.5" />
    <rect
      x="21"
      y="29"
      width="34"
      height="4"
      fill="#1E293B"
      rx="0.5"
      stroke="#475569"
      strokeWidth="0.5"
    />
    <rect
      x="21"
      y="35"
      width="34"
      height="4"
      fill="#1E293B"
      rx="0.5"
      stroke="#475569"
      strokeWidth="0.5"
    />
    <rect
      x="21"
      y="41"
      width="34"
      height="4"
      fill="#1E293B"
      rx="0.5"
      stroke="#475569"
      strokeWidth="0.5"
    />
    {/* Stand */}
    <path d="M26 52H38V56H26V52Z" fill="#475569" />
    <rect x="20" y="56" width="24" height="2" rx="1" fill="#64748B" />
  </svg>
);

export const CpmEngineSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    <defs>
      <linearGradient id="cpmBody" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
    </defs>
    {/* Background Chassis */}
    <rect
      x="8"
      y="10"
      width="48"
      height="44"
      rx="4"
      fill="url(#cpmBody)"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="2"
    />
    {/* Large Central Rotation Gear */}
    <circle cx="32" cy="30" r="13" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 2" />
    <circle cx="32" cy="30" r="6" fill="#334155" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Small Intermeshing Secondary Gear */}
    <circle cx="44" cy="40" r="7" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 1.5" />
    <circle cx="44" cy="40" r="3" fill="#1E293B" />
    {/* Verification Key Emblem */}
    <path
      d="M22 28L28 22M28 22H25M28 22V25"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Operational Status Label */}
    <rect x="12" y="45" width="24" height="6" rx="1" fill="#0F172A" />
    <text x="14" y="49.5" fill="#F59E0B" fontSize="4" fontFamily="monospace" fontWeight="700">
      CPM: ROTATE
    </text>
    {/* Target Protocol Indicator (SMB/SSH) */}
    <circle cx="50" cy="16" r="2" fill="#10B981" />
  </svg>
);

export const PsmProxySvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    <defs>
      <linearGradient id="psmChassis" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
    </defs>
    {/* Session Broker Chassis */}
    <rect
      x="6"
      y="10"
      width="52"
      height="44"
      rx="4"
      fill="url(#psmChassis)"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="2"
    />
    {/* Dual-Channel Isolation Wall */}
    <line
      x1="32"
      y1="12"
      x2="32"
      y2="52"
      stroke="#475569"
      strokeWidth="1.5"
      strokeDasharray="2 2"
    />
    {/* Left Side: Client Workstation Ingress (RDP 3389) */}
    <rect
      x="10"
      y="18"
      width="18"
      height="14"
      rx="2"
      fill="#334155"
      stroke="#38BDF8"
      strokeWidth="1"
    />
    <text x="12" y="26" fill="#38BDF8" fontSize="4" fontFamily="sans-serif" fontWeight="700">
      RDP
    </text>
    {/* Right Side: Target Egress with Credential Injection */}
    <rect
      x="36"
      y="18"
      width="18"
      height="14"
      rx="2"
      fill="#334155"
      stroke="#10B981"
      strokeWidth="1"
    />
    <text x="39" y="26" fill="#10B981" fontSize="4" fontFamily="sans-serif" fontWeight="700">
      TARGET
    </text>
    {/* Live Recording Tape Reel Visual */}
    <circle cx="24" cy="42" r="5" fill="#0F172A" stroke="#EF4444" strokeWidth="1.5" />
    <circle cx="40" cy="42" r="5" fill="#0F172A" stroke="#EF4444" strokeWidth="1.5" />
    <line x1="24" y1="47" x2="40" y2="47" stroke="#EF4444" strokeWidth="1" />
    {/* Live Recording Red Indicator */}
    <circle cx="50" cy="15" r="2" fill="#EF4444" />
    <text x="14" y="52" fill="#94A3B8" fontSize="3" fontFamily="monospace">
      REC LIVE
    </text>
  </svg>
);

export const SafeContainerSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    <defs>
      <linearGradient id="safeGrad" x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0369A1" />
        <stop offset="1" stopColor="#0C4A6E" />
      </linearGradient>
    </defs>
    {/* Safe Outer Vault Shell */}
    <path
      d="M32 6L54 18V46L32 58L10 46V18L32 6Z"
      fill="url(#safeGrad)"
      stroke={highlighted ? "#38BDF8" : "#0284C7"}
      strokeWidth="2"
    />
    {/* Safe Front Face */}
    <path
      d="M32 18L44 25V39L32 46L20 39V25L32 18Z"
      fill="#0F172A"
      stroke="#38BDF8"
      strokeWidth="1.5"
    />
    {/* Central Safe Dial Keyhole */}
    <circle cx="32" cy="32" r="6" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="2" fill="#F59E0B" />
    {/* ACL Boundary Permission Shield Badge */}
    <path d="M42 40L48 43V49C48 53 45 56 42 57C39 56 36 53 36 49V43L42 40Z" fill="#10B981" />
    <path d="M40 48L41.5 49.5L44.5 46.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export const PrivilegedAccountSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    <defs>
      <linearGradient
        id="accountCard"
        x1="8"
        y1="12"
        x2="56"
        y2="52"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
    </defs>
    {/* Privileged Identity Card */}
    <rect
      x="8"
      y="12"
      width="48"
      height="40"
      rx="4"
      fill="url(#accountCard)"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="2"
    />
    {/* Identity Avatar / Badge */}
    <circle cx="22" cy="28" r="7" fill="#334155" stroke="#38BDF8" strokeWidth="1.5" />
    <path
      d="M16 39C16 36 19 34 22 34C25 34 28 36 28 39"
      stroke="#38BDF8"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Crown / Elevation Indicator */}
    <path d="M18 20L20 23L22 19L24 23L26 20V24H18V20Z" fill="#F59E0B" />
    {/* Account Properties */}
    <rect x="33" y="22" width="18" height="3" rx="1" fill="#E2E8F0" />
    <rect x="33" y="28" width="14" height="2" rx="0.5" fill="#94A3B8" />
    <rect x="33" y="33" width="16" height="2" rx="0.5" fill="#94A3B8" />
    {/* Secret Mask Indicator (••••••••) */}
    <rect
      x="12"
      y="44"
      width="40"
      height="5"
      rx="1"
      fill="#0F172A"
      stroke="#475569"
      strokeWidth="0.5"
    />
    <circle cx="16" cy="46.5" r="1" fill="#10B981" />
    <circle cx="20" cy="46.5" r="1" fill="#10B981" />
    <circle cx="24" cy="46.5" r="1" fill="#10B981" />
    <circle cx="28" cy="46.5" r="1" fill="#10B981" />
    <circle cx="32" cy="46.5" r="1" fill="#10B981" />
    <text x="36" y="48" fill="#64748B" fontSize="3" fontFamily="monospace">
      VAULTED
    </text>
  </svg>
);

export const WindowsServerSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    {/* Rackmount Chassis */}
    <rect
      x="8"
      y="14"
      width="48"
      height="36"
      rx="3"
      fill="#1E293B"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="2"
    />
    <line x1="8" y1="26" x2="56" y2="26" stroke="#334155" strokeWidth="1" />
    <line x1="8" y1="38" x2="56" y2="38" stroke="#334155" strokeWidth="1" />
    {/* Windows Emblem */}
    <rect x="14" y="17" width="3.5" height="3.5" fill="#0078D4" />
    <rect x="18.5" y="17" width="3.5" height="3.5" fill="#0078D4" />
    <rect x="14" y="21.5" width="3.5" height="3.5" fill="#0078D4" />
    <rect x="18.5" y="21.5" width="3.5" height="3.5" fill="#0078D4" />
    <text x="25" y="22" fill="#E2E8F0" fontSize="4" fontFamily="sans-serif" fontWeight="700">
      WIN-SRV
    </text>
    {/* Drive Bays & LEDs */}
    <rect x="14" y="29" width="30" height="5" rx="1" fill="#0F172A" />
    <circle cx="48" cy="31.5" r="1.5" fill="#10B981" />
    <circle cx="52" cy="31.5" r="1.5" fill="#38BDF8" />
    <rect x="14" y="41" width="30" height="5" rx="1" fill="#0F172A" />
    <circle cx="48" cy="43.5" r="1.5" fill="#10B981" />
    <circle cx="52" cy="43.5" r="1.5" fill="#64748B" />
  </svg>
);

export const LinuxServerSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    {/* Rackmount Chassis */}
    <rect
      x="8"
      y="14"
      width="48"
      height="36"
      rx="3"
      fill="#1E293B"
      stroke={highlighted ? "#F59E0B" : "#475569"}
      strokeWidth="2"
    />
    <line x1="8" y1="26" x2="56" y2="26" stroke="#334155" strokeWidth="1" />
    <line x1="8" y1="38" x2="56" y2="38" stroke="#334155" strokeWidth="1" />
    {/* Terminal Prompt Emblem */}
    <rect x="13" y="17" width="10" height="7" rx="1" fill="#0F172A" />
    <text x="14.5" y="22.5" fill="#10B981" fontSize="4" fontFamily="monospace" fontWeight="700">
      &gt;_
    </text>
    <text x="26" y="22" fill="#E2E8F0" fontSize="4" fontFamily="sans-serif" fontWeight="700">
      RHEL/SSH
    </text>
    {/* Drive Bays & LEDs */}
    <rect x="14" y="29" width="30" height="5" rx="1" fill="#0F172A" />
    <circle cx="48" cy="31.5" r="1.5" fill="#F59E0B" />
    <circle cx="52" cy="31.5" r="1.5" fill="#10B981" />
    <rect x="14" y="41" width="30" height="5" rx="1" fill="#0F172A" />
    <circle cx="48" cy="43.5" r="1.5" fill="#10B981" />
    <circle cx="52" cy="43.5" r="1.5" fill="#64748B" />
  </svg>
);

export const DatabaseServerSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    <defs>
      <linearGradient
        id="dbCylinder"
        x1="12"
        y1="12"
        x2="52"
        y2="52"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
    </defs>
    {/* Bottom Cylinder */}
    <path
      d="M16 38C16 34.6863 23.1634 32 32 32C40.8366 32 48 34.6863 48 38V46C48 49.3137 40.8366 52 32 52C23.1634 52 16 49.3137 16 46V38Z"
      fill="url(#dbCylinder)"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="1.5"
    />
    {/* Middle Cylinder */}
    <path
      d="M16 26C16 22.6863 23.1634 20 32 20C40.8366 20 48 22.6863 48 26V34C48 37.3137 40.8366 40 32 40C23.1634 40 16 37.3137 16 34V26Z"
      fill="url(#dbCylinder)"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="1.5"
    />
    {/* Top Cylinder & Cap */}
    <path
      d="M16 14C16 10.6863 23.1634 8 32 8C40.8366 8 48 10.6863 48 14V22C48 25.3137 40.8366 28 32 28C23.1634 28 16 25.3137 16 22V14Z"
      fill="url(#dbCylinder)"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="1.5"
    />
    <ellipse cx="32" cy="14" rx="16" ry="6" fill="#334155" stroke="#38BDF8" strokeWidth="1.5" />
    {/* Encryption Lock on Data Layer */}
    <rect x="29" y="39" width="6" height="5" rx="1" fill="#F59E0B" />
    <path
      d="M30 39V37C30 35.8954 30.8954 35 32 35C33.1046 35 34 35.8954 34 37V39"
      stroke="#F59E0B"
      strokeWidth="1"
    />
  </svg>
);

export const DomainControllerSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    {/* Main Pillar Server */}
    <rect
      x="18"
      y="10"
      width="28"
      height="44"
      rx="3"
      fill="#0F172A"
      stroke={highlighted ? "#38BDF8" : "#475569"}
      strokeWidth="2"
    />
    {/* Active Directory Forest Nodes */}
    <circle cx="32" cy="18" r="4" fill="#0078D4" stroke="#93C5FD" strokeWidth="1" />
    <circle cx="24" cy="30" r="3.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
    <circle cx="40" cy="30" r="3.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
    <line x1="32" y1="22" x2="24" y2="26.5" stroke="#38BDF8" strokeWidth="1.5" />
    <line x1="32" y1="22" x2="40" y2="26.5" stroke="#38BDF8" strokeWidth="1.5" />
    {/* Kerberos KDC Ticket Emblem */}
    <rect
      x="23"
      y="38"
      width="18"
      height="6"
      rx="1"
      fill="#1E293B"
      stroke="#F59E0B"
      strokeWidth="1"
    />
    <text x="25" y="42.5" fill="#F59E0B" fontSize="3.5" fontFamily="monospace" fontWeight="700">
      KERBEROS
    </text>
    <circle cx="42" cy="13" r="1.5" fill="#10B981" />
  </svg>
);

export const AdminWorkstationSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    {/* Monitor Screen */}
    <rect
      x="10"
      y="12"
      width="44"
      height="30"
      rx="3"
      fill="#0F172A"
      stroke={highlighted ? "#0078D4" : "#475569"}
      strokeWidth="2"
    />
    <rect x="14" y="16" width="36" height="22" fill="#1E293B" rx="1" />
    {/* Operator Console Elements */}
    <rect x="17" y="19" width="14" height="3" fill="#0078D4" rx="0.5" />
    <rect x="17" y="24" width="22" height="2" fill="#64748B" rx="0.5" />
    <rect x="17" y="28" width="18" height="2" fill="#64748B" rx="0.5" />
    <circle cx="44" cy="22" r="2.5" fill="#10B981" />
    {/* Monitor Stand */}
    <path d="M28 42H36V48H28V42Z" fill="#475569" />
    <rect x="22" y="48" width="20" height="3" rx="1.5" fill="#64748B" />
  </svg>
);

export const IdentityGovernanceSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    {/* Outer Identity Ring */}
    <circle cx="32" cy="32" r="24" stroke="#475569" strokeWidth="2" strokeDasharray="6 3" />
    {/* Central Vault Identity Badge */}
    <circle
      cx="32"
      cy="32"
      r="12"
      fill="#0F172A"
      stroke={highlighted ? "#0078D4" : "#38BDF8"}
      strokeWidth="2"
    />
    <path
      d="M28 29C28 26.7909 29.7909 25 32 25C34.2091 25 36 26.7909 36 29C36 31.2091 34.2091 33 32 33C29.7909 33 28 31.2091 28 29Z"
      fill="#38BDF8"
    />
    <path
      d="M26 38C26 35.5 28.5 34 32 34C35.5 34 38 35.5 38 38"
      stroke="#38BDF8"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Orbiting Satellite Personas: Human Admin & Service Account */}
    <circle cx="32" cy="8" r="4.5" fill="#0078D4" />
    <circle cx="56" cy="32" r="4.5" fill="#10B981" />
    <circle cx="32" cy="56" r="4.5" fill="#F59E0B" />
    <circle cx="8" cy="32" r="4.5" fill="#8B5CF6" />
  </svg>
);

export const PasswordRotationSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    {/* Rotating Triangular Cycle Path */}
    <circle cx="32" cy="32" r="22" stroke="#475569" strokeWidth="2" />
    <path
      d="M32 10C44.1503 10 54 19.8497 54 32"
      stroke="#0078D4"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M54 32L58 26M54 32L49 27" stroke="#0078D4" strokeWidth="2" strokeLinecap="round" />
    {/* Three States: Verify, Change, Reconcile */}
    <circle cx="32" cy="10" r="5" fill="#0078D4" />
    <circle cx="51" cy="42" r="5" fill="#F59E0B" />
    <circle cx="13" cy="42" r="5" fill="#10B981" />
    {/* Central Key */}
    <circle cx="32" cy="32" r="6" fill="#1E293B" stroke="#F8FAFC" strokeWidth="1.5" />
    <line x1="32" y1="35" x2="32" y2="43" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" />
    <line
      x1="32"
      y1="40"
      x2="35"
      y2="40"
      stroke="#F8FAFC"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const PrivilegedSessionSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    {/* Active Session Frame */}
    <rect
      x="8"
      y="10"
      width="48"
      height="44"
      rx="4"
      fill="#0F172A"
      stroke={highlighted ? "#EF4444" : "#475569"}
      strokeWidth="2"
    />
    {/* Live Status Bar */}
    <rect x="12" y="14" width="40" height="6" fill="#1E293B" rx="1" />
    <circle cx="16" cy="17" r="2" fill="#EF4444" />
    <text x="21" y="19" fill="#EF4444" fontSize="4" fontFamily="monospace" fontWeight="700">
      RECORDING
    </text>
    {/* Transparent Injection Keyhole */}
    <circle cx="32" cy="32" r="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
    <path
      d="M30 32C30 30.8954 30.8954 30 32 30C33.1046 30 34 30.8954 34 32V36H30V32Z"
      fill="#38BDF8"
    />
    {/* Dual Control Authorization Stamp */}
    <rect x="12" y="44" width="22" height="6" rx="1" fill="#10B981" />
    <text x="14" y="48.5" fill="#FFFFFF" fontSize="3.5" fontFamily="sans-serif" fontWeight="700">
      CHG-12345
    </text>
    <circle cx="48" cy="47" r="3" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
  </svg>
);

export const AuditComplianceSvg: React.FC<SvgIconProps> = ({
  size = 56,
  className = "",
  highlighted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pam-svg-icon ${highlighted ? "highlighted" : ""} ${className}`}
  >
    {/* Ledger Document */}
    <rect
      x="12"
      y="8"
      width="40"
      height="48"
      rx="3"
      fill="#1E293B"
      stroke={highlighted ? "#10B981" : "#475569"}
      strokeWidth="2"
    />
    {/* Audit Lines */}
    <line x1="18" y1="16" x2="38" y2="16" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line
      x1="18"
      y1="22"
      x2="46"
      y2="22"
      stroke="#64748B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="28"
      x2="42"
      y2="28"
      stroke="#64748B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="34"
      x2="46"
      y2="34"
      stroke="#64748B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Immutable Hash Stamp */}
    <circle cx="38" cy="44" r="7" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
    <path
      d="M35 44L37 46L41 42"
      stroke="#10B981"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
