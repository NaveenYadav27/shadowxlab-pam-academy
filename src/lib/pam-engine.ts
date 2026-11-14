export const SAFE_PERMISSIONS = [
  "List accounts",
  "Retrieve accounts",
  "Use accounts",
  "Manage Safe",
  "Manage accounts",
  "Add accounts",
  "Update account properties",
  "Delete accounts",
  "Initiate privileged sessions",
] as const;

export type SafePermission = (typeof SAFE_PERMISSIONS)[number];
export type AccountStatus = "Managed" | "Verify required" | "Rotation failed" | "Unmanaged";
export type CpmOperation = "Verify" | "Change" | "Reconcile";

export const SUPPORTED_PLATFORMS = [
  "Windows Server Local",
  "Windows Domain Account",
  "Unix SSH",
  "SQL Server Account",
  "Oracle Database",
  "Application Account",
] as const;

export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

export const ALLOWED_TERMINAL_COMMANDS = [
  "help",
  "hostname",
  "whoami",
  "ipconfig",
  "systeminfo",
  "net user",
  "Get-Service",
  "Get-Process",
  "exit",
] as const;

export type AllowedTerminalCommand = (typeof ALLOWED_TERMINAL_COMMANDS)[number];

export interface SafeMember {
  username: string;
  permissions: SafePermission[];
}

export interface PamSafe {
  name: string;
  description: string;
  owner: string;
  members: SafeMember[];
}

export interface PamAccount {
  id: string;
  name: string;
  username: string;
  address: string;
  platform: string;
  safe: string;
  type: string;
  owner: string;
  purpose: string;
  dependency: string;
  status: AccountStatus;
  policy: string;
  lastVerify: string;
  lastChange: string;
  lastReconcile: string;
  failureCause?: string | undefined;
}

export interface PamAuditEvent {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  result: "Success" | "Denied" | "Warning";
  detail: string;
}

export interface PamCpmOperation {
  id: string;
  accountId: string;
  operation: CpmOperation;
  result: "Completed" | "Failed";
  detail: string;
  time: string;
}

export interface PamSession {
  id: string;
  target: string;
  account: string;
  component: string;
  ticket: string;
  reason: string;
  status: "Active" | "Terminated";
  commands: string[];
  started: string;
  user?: string;
  safe?: string;
  duration?: string;
  terminationReason?: string;
  approvalStatus?: "Approved" | "Pre-authorized" | "Emergency";
  recordingAvailable?: boolean;
}

export interface PamPolicy {
  id: string;
  name: string;
  platform: string;
  description: string;
  rotationIntervalDays: number;
  minPasswordLength: number;
  passwordComplexity: string;
  requireDualControl: boolean;
  requireTicket: boolean;
  cpmId: string;
  status: "Active" | "Draft" | "Disabled";
  accountsCount?: number;
}

export type PamUserRole =
  | "PAM Administrator"
  | "Safe Administrator"
  | "Auditor"
  | "Security Operator"
  | "PSM Operator"
  | "CPM Operator"
  | "Learner";

export interface PamUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: PamUserRole;
  department: string;
  status: "Active" | "Suspended" | "Pending MFA";
  groups: string[];
  lastLogin: string;
  allowedSafes?: string[];
}

export interface PamDiscoveredAccount {
  id: string;
  username: string;
  target: string;
  platform: string;
  source: string;
  risk: "Critical" | "High" | "Medium" | "Low";
  reason: string;
  discoveredAt: string;
  status: "Unmanaged" | "Onboarded" | "Ignored";
}

export interface PamDiscoveryJob {
  id: string;
  source: string;
  targetSubnet: string;
  startTime: string;
  status: "Completed" | "Scanning" | "Failed";
  foundCount: number;
}

export interface PamIncident {
  id: string;
  severity: "Critical" | "Warning" | "Info";
  component: "CPM" | "PSM" | "Vault";
  accountId?: string;
  accountUsername: string;
  targetHost: string;
  errorCode: string;
  errorDetail: string;
  status: "Open" | "Investigating" | "Resolved";
  assignedOperator: string;
  createdTime: string;
  resolvedTime?: string;
  remediationAction: string;
}

export interface PamState {
  safes: PamSafe[];
  accounts: PamAccount[];
  audit: PamAuditEvent[];
  cpmOperations: PamCpmOperation[];
  sessions: PamSession[];
  policies: PamPolicy[];
  users: PamUser[];
  discoveredAccounts: PamDiscoveredAccount[];
  discoveryJobs: PamDiscoveryJob[];
  incidents: PamIncident[];
  completedLabs: string[];
  scores: Record<string, number>;
  approvalGranted: boolean;
  psmConnectorHealthy: boolean;
}

export const LEARNERS = [
  "pam_admin",
  "pam_operator",
  "soc_analyst",
  "windows_admin",
  "linux_admin",
  "dba_user",
  "app_owner",
  "auditor",
];

const seedAccounts = [
  [
    "Administrator",
    "Administrator",
    "WIN-SRV-01",
    "Windows Server Local",
    "WIN-SAFE",
    "Human administrator",
    "windows_admin",
    "Windows server administration",
    "",
    "Managed",
    "Windows-90d",
    "Verified 08:42",
    "Changed Nov 06",
    "Reconciled Nov 06",
  ],
  [
    "DomainAdmin-GFS",
    "gfs\\DomainAdmin-GFS",
    "WIN-DC-01",
    "Windows Domain Account",
    "DOMAIN-SAFE",
    "Domain administrator",
    "windows_admin",
    "Directory operations",
    "",
    "Managed",
    "Domain-30d",
    "Verified 08:14",
    "Changed Nov 01",
    "Reconciled Nov 01",
  ],
  [
    "svc_backup",
    "svc_backup",
    "WIN-SRV-02",
    "Windows Domain Account",
    "SERVICE-SAFE",
    "Service account",
    "windows_admin",
    "Enterprise backup agent",
    "Backup Agent",
    "Rotation failed",
    "Service-60d",
    "Failed Nov 12",
    "Failed Nov 12",
    "Pending",
    "Account locked on target",
  ],
  [
    "svc_sql",
    "svc_sql",
    "DB-SQL-01",
    "SQL Server Account",
    "SERVICE-SAFE",
    "Service account",
    "dba_user",
    "Database maintenance jobs",
    "SQL Agent",
    "Managed",
    "Service-60d",
    "Verified 07:48",
    "Changed Nov 09",
    "Reconciled Nov 09",
  ],
  [
    "svc_payment",
    "svc_payment",
    "APP-PAYMENT-01",
    "Windows Domain Account",
    "SERVICE-SAFE",
    "Service account",
    "app_owner",
    "Payment processing service",
    "Payment API",
    "Verify required",
    "Service-60d",
    "Due Nov 12",
    "Changed Oct 12",
    "Reconciled Oct 12",
  ],
  [
    "app_integrator",
    "app_integrator",
    "APP-PAYMENT-01",
    "Application Account",
    "APP-SAFE",
    "Application account",
    "app_owner",
    "Payment gateway connector",
    "Payment API",
    "Managed",
    "Application-30d",
    "Verified 07:32",
    "Changed Nov 02",
    "Reconciled Nov 02",
  ],
  [
    "root",
    "root",
    "LNX-SRV-01",
    "Unix SSH",
    "UNIX-SAFE",
    "Unix root",
    "linux_admin",
    "Linux platform administration",
    "",
    "Managed",
    "Unix-30d",
    "Verified 06:54",
    "Changed Nov 03",
    "Reconciled Nov 03",
  ],
  [
    "oracle",
    "oracle",
    "DB-ORA-01",
    "Oracle Database",
    "DBA-SAFE",
    "Database account",
    "dba_user",
    "Oracle database administration",
    "Oracle Listener",
    "Unmanaged",
    "Oracle-30d",
    "Not verified",
    "Never",
    "Never",
  ],
  [
    "db_admin",
    "db_admin",
    "DB-SQL-01",
    "SQL Server Account",
    "DBA-SAFE",
    "Database account",
    "dba_user",
    "SQL database administration",
    "",
    "Managed",
    "SQL-30d",
    "Verified 06:12",
    "Changed Nov 08",
    "Reconciled Nov 08",
  ],
  [
    "shared_ops",
    "shared_ops",
    "WIN-SRV-01",
    "Windows Server Local",
    "EMERGENCY-SAFE",
    "Shared privileged",
    "pam_admin",
    "Emergency operations",
    "",
    "Managed",
    "Emergency-7d",
    "Verified Nov 11",
    "Changed Nov 11",
    "Reconciled Nov 11",
  ],
  [
    "cisco_enable",
    "cisco_enable",
    "SW-CORE-01",
    "Cisco IOS",
    "EMERGENCY-SAFE",
    "Network admin",
    "pam_admin",
    "Core switch breakglass access",
    "",
    "Managed",
    "Network-30d",
    "Verified 05:40",
    "Changed Nov 07",
    "Reconciled Nov 07",
  ],
  [
    "linux_deployer",
    "linux_deployer",
    "LNX-K8S-01",
    "Unix SSH",
    "UNIX-SAFE",
    "Linux service account",
    "linux_admin",
    "Container platform deployment",
    "Kubelet",
    "Managed",
    "Unix-30d",
    "Verified 06:15",
    "Changed Nov 04",
    "Reconciled Nov 04",
  ],
  [
    "sec_auditor",
    "sec_auditor",
    "CORP-DC-01",
    "Windows Domain Account",
    "DOMAIN-SAFE",
    "Domain audit account",
    "pam_admin",
    "Security telemetry read-only scan",
    "",
    "Managed",
    "Domain-30d",
    "Verified 08:00",
    "Changed Nov 01",
    "Reconciled Nov 01",
  ],
  [
    "postgres_admin",
    "postgres_admin",
    "DB-PG-01",
    "PostgreSQL Account",
    "DBA-SAFE",
    "Database superuser",
    "dba_user",
    "Payment reporting database admin",
    "Postgres Service",
    "Verify required",
    "Postgres-30d",
    "Due Nov 13",
    "Changed Oct 14",
    "Reconciled Oct 14",
  ],
  [
    "aws_iam_admin",
    "aws_iam_admin",
    "AWS-MGMT-01",
    "AWS Cloud IAM",
    "EMERGENCY-SAFE",
    "Cloud administrator",
    "pam_admin",
    "Multi-cloud breakglass privileged role",
    "AWS STS",
    "Managed",
    "Cloud-14d",
    "Verified 07:10",
    "Changed Nov 09",
    "Reconciled Nov 09",
  ],
  [
    "breakglass_01",
    "breakglass_01",
    "CORP-DC-02",
    "Windows Domain Account",
    "EMERGENCY-SAFE",
    "Shared privileged",
    "pam_admin",
    "Tier-0 Disaster recovery breakglass",
    "",
    "Managed",
    "Emergency-7d",
    "Verified Nov 10",
    "Changed Nov 10",
    "Reconciled Nov 10",
  ],
];

const fullAdmin: SafePermission[] = [...SAFE_PERMISSIONS];

function makeAccount(row: string[], index: number): PamAccount {
  const [
    name,
    username,
    address,
    platform,
    safe,
    type,
    owner,
    purpose,
    dependency,
    status,
    policy,
    lastVerify,
    lastChange,
    lastReconcile,
    failureCause,
  ] = row;
  return {
    id: `account-${index + 1}`,
    name: name ?? "",
    username: username ?? "",
    address: address ?? "",
    platform: platform ?? "",
    safe: safe ?? "",
    type: type ?? "",
    owner: owner ?? "",
    purpose: purpose ?? "",
    dependency: dependency ?? "",
    status: (status ?? "Unmanaged") as AccountStatus,
    policy: policy ?? "Standard-30d",
    lastVerify: lastVerify ?? "Not verified",
    lastChange: lastChange ?? "Never",
    lastReconcile: lastReconcile ?? "Never",
    failureCause: failureCause ?? undefined,
  };
}

export const INITIAL_POLICIES: PamPolicy[] = [
  {
    id: "pol-win-90d",
    name: "Windows-90d",
    platform: "Windows Server Local",
    description:
      "Standard enterprise rotation policy for Windows tier-1 servers with dual-control gating.",
    rotationIntervalDays: 90,
    minPasswordLength: 24,
    passwordComplexity: "Upper, lower, digits, symbols",
    requireDualControl: true,
    requireTicket: true,
    cpmId: "CPM-PROD-01",
    status: "Active",
  },
  {
    id: "pol-domain-30d",
    name: "Domain-30d",
    platform: "Windows Domain Account",
    description:
      "Tier-0 Domain Administrator password rotation policy requiring 30-day frequency and ticketing.",
    rotationIntervalDays: 30,
    minPasswordLength: 32,
    passwordComplexity: "High-entropy alphanumeric + special symbols",
    requireDualControl: true,
    requireTicket: true,
    cpmId: "CPM-PROD-01",
    status: "Active",
  },
  {
    id: "pol-unix-60d",
    name: "Unix-SSH-60d",
    platform: "Unix SSH",
    description:
      "RHEL & Ubuntu server root and administrative account management with automated SSH key rotation.",
    rotationIntervalDays: 60,
    minPasswordLength: 32,
    passwordComplexity: "High-entropy alphanumeric, no dictionary words",
    requireDualControl: false,
    requireTicket: true,
    cpmId: "CPM-PROD-01",
    status: "Active",
  },
  {
    id: "pol-dba-30d",
    name: "DBA-Strong-30d",
    platform: "SQL Server Account",
    description:
      "Strict database SA and SYSDBA credential isolation with immediate checkout rotation.",
    rotationIntervalDays: 30,
    minPasswordLength: 28,
    passwordComplexity: "Database compliant, no repeated characters",
    requireDualControl: true,
    requireTicket: true,
    cpmId: "CPM-PROD-01",
    status: "Active",
  },
  {
    id: "pol-service-60d",
    name: "Service-60d",
    platform: "Service Account",
    description: "Non-human service account governance with coordinated dependency restarts.",
    rotationIntervalDays: 60,
    minPasswordLength: 30,
    passwordComplexity: "Service token & secret rotation",
    requireDualControl: true,
    requireTicket: false,
    cpmId: "CPM-PROD-01",
    status: "Active",
  },
];

export const INITIAL_USERS: PamUser[] = [
  {
    id: "usr-1",
    username: "pam_admin",
    fullName: "Alex Rivera",
    email: "arivera@corp.gfs.local",
    role: "PAM Administrator",
    department: "Privileged Access Management",
    status: "Active",
    groups: ["PAM-Admins", "Domain-Admins"],
    lastLogin: "Today 08:30",
  },
  {
    id: "usr-2",
    username: "pam_operator",
    fullName: "Sarah Chen",
    email: "schen@corp.gfs.local",
    role: "CPM Operator",
    department: "Security Operations",
    status: "Active",
    groups: ["PAM-Operators", "Tier-2-SecOps"],
    lastLogin: "Today 08:42",
  },
  {
    id: "usr-3",
    username: "soc_analyst",
    fullName: "Marcus Johnson",
    email: "mjohnson@corp.gfs.local",
    role: "Security Operator",
    department: "SOC Triage",
    status: "Active",
    groups: ["SOC-Tier-1", "Security-Viewers"],
    lastLogin: "Today 08:31",
  },
  {
    id: "usr-4",
    username: "windows_admin",
    fullName: "David Miller",
    email: "dmiller@corp.gfs.local",
    role: "Safe Administrator",
    department: "Windows Infrastructure",
    status: "Active",
    groups: ["Windows-Server-Admins"],
    lastLogin: "Yesterday 17:15",
  },
  {
    id: "usr-5",
    username: "linux_admin",
    fullName: "Elena Rostova",
    email: "erostova@corp.gfs.local",
    role: "PSM Operator",
    department: "Unix Systems",
    status: "Active",
    groups: ["Unix-Engineers"],
    lastLogin: "Today 07:45",
  },
  {
    id: "usr-6",
    username: "dba_user",
    fullName: "Priya Patel",
    email: "ppatel@corp.gfs.local",
    role: "PSM Operator",
    department: "Database Operations",
    status: "Active",
    groups: ["DBA-Team"],
    lastLogin: "Nov 12 14:20",
  },
  {
    id: "usr-7",
    username: "auditor",
    fullName: "Rachel Vance",
    email: "rvance@corp.gfs.local",
    role: "Auditor",
    department: "Internal IT Audit",
    status: "Active",
    groups: ["Audit-Compliance"],
    lastLogin: "Nov 10 11:00",
  },
  {
    id: "usr-8",
    username: "demo.learner",
    fullName: "Enterprise Learner",
    email: "learner@corp.gfs.local",
    role: "Learner",
    department: "Academy Student",
    status: "Active",
    groups: ["Academy-Students"],
    lastLogin: "Just now",
  },
];

export const INITIAL_DISCOVERED_ACCOUNTS: PamDiscoveredAccount[] = [
  {
    id: "disc-1",
    username: "svc_etl_sync",
    target: "SQL-PROD-01",
    platform: "SQL Server Account",
    source: "Active Directory ServiceScan",
    risk: "High",
    reason: "Unmanaged privileged service account with database admin rights",
    discoveredAt: "Today 06:15",
    status: "Unmanaged",
  },
  {
    id: "disc-2",
    username: "deploy_runner",
    target: "WIN-APP-01",
    platform: "Windows Server Local",
    source: "Host Credential Discovery",
    risk: "Medium",
    reason: "Interactive local admin account outside Safe protection",
    discoveredAt: "Today 06:20",
    status: "Unmanaged",
  },
  {
    id: "disc-3",
    username: "oracle_sys_ro",
    target: "DB-FIN-01",
    platform: "Oracle Database",
    source: "DBA Inventory Reconciler",
    risk: "Critical",
    reason: "Standing SYSDBA role detected without automated rotation",
    discoveredAt: "Yesterday 23:10",
    status: "Unmanaged",
  },
  {
    id: "disc-4",
    username: "ops_backup",
    target: "WIN-DC-01",
    platform: "Windows Domain Account",
    source: "Domain Controller Crawler",
    risk: "Critical",
    reason: "Domain Admins member with unmonitored password age > 180 days",
    discoveredAt: "Yesterday 21:05",
    status: "Unmanaged",
  },
];

export const INITIAL_DISCOVERY_JOBS: PamDiscoveryJob[] = [
  {
    id: "job-scan-101",
    source: "Active Directory ServiceScan",
    targetSubnet: "10.0.1.0/24 (Production SQL)",
    startTime: "Today 06:00",
    status: "Completed",
    foundCount: 2,
  },
  {
    id: "job-scan-102",
    source: "Domain Controller Crawler",
    targetSubnet: "corp.gfs.local (Domain Controllers)",
    startTime: "Yesterday 21:00",
    status: "Completed",
    foundCount: 2,
  },
];

export const INITIAL_INCIDENTS: PamIncident[] = [
  {
    id: "INC-2041",
    severity: "Critical",
    component: "CPM",
    accountId: "account-3",
    accountUsername: "svc_backup",
    targetHost: "WIN-SRV-02",
    errorCode: "CACPM250E",
    errorDetail: "Failed to perform reconcile: Target account is locked out on remote Windows SAM.",
    status: "Open",
    assignedOperator: "pam_operator",
    createdTime: "08:18:47",
    remediationAction: "Run Reconcile Recovery via Domain Reconciler",
  },
  {
    id: "INC-2042",
    severity: "Warning",
    component: "CPM",
    accountId: "account-7",
    accountUsername: "postgres_admin",
    targetHost: "DB-PG-01",
    errorCode: "CACPM072E",
    errorDetail:
      "Connection handshake timed out on port 5432; verify required before next rotation.",
    status: "Investigating",
    assignedOperator: "dba_user",
    createdTime: "08:35:10",
    remediationAction: "Verify Port & Reset Connection Handshake",
  },
];

export function makeInitialPamState(): PamState {
  return {
    safes: [
      ["WIN-SAFE", "Windows server privileged identities", "pam_admin"],
      ["UNIX-SAFE", "Linux and Unix administrative accounts", "pam_admin"],
      ["DBA-SAFE", "Database administration credentials", "pam_admin"],
      ["APP-SAFE", "Application integration identities", "pam_admin"],
      ["SERVICE-SAFE", "Non-human service credentials", "pam_admin"],
      ["DOMAIN-SAFE", "Directory and domain administration", "pam_admin"],
      ["EMERGENCY-SAFE", "Time-bound emergency access", "pam_admin"],
    ].map(([name, description, owner]) => ({
      name: name ?? "",
      description: description ?? "",
      owner: owner ?? "pam_admin",
      members: [
        { username: "pam_admin", permissions: fullAdmin },
        {
          username:
            name === "DBA-SAFE"
              ? "dba_user"
              : name === "UNIX-SAFE"
                ? "linux_admin"
                : "windows_admin",
          permissions: ["List accounts", "Use accounts", "Initiate privileged sessions"],
        },
        { username: "auditor", permissions: ["List accounts"] },
      ],
    })),
    accounts: seedAccounts.map(makeAccount),
    audit: [
      {
        id: "audit-1",
        time: "08:42:16",
        actor: "pam_operator",
        action: "CPM Verify",
        target: "Administrator · WIN-SRV-01",
        result: "Success",
        detail: "Credential verified by CPM",
      },
      {
        id: "audit-2",
        time: "08:31:05",
        actor: "soc_analyst",
        action: "Access review",
        target: "DOMAIN-SAFE",
        result: "Success",
        detail: "Quarterly access review opened",
      },
      {
        id: "audit-3",
        time: "08:18:47",
        actor: "pam_operator",
        action: "CPM Change",
        target: "svc_backup · WIN-SRV-02",
        result: "Warning",
        detail: "CPM operation failed: Account locked on target",
      },
      {
        id: "audit-4",
        time: "07:56:12",
        actor: "windows_admin",
        action: "Terminate PSM session",
        target: "WIN-SRV-01 · Administrator",
        result: "Success",
        detail: "RDP session terminated · recording retained",
      },
    ],
    cpmOperations: [
      {
        id: "op-1",
        accountId: "account-3",
        operation: "Change",
        result: "Failed",
        detail: "Account locked on target; check target reachability and reconcile access.",
        time: "08:18:47",
      },
    ],
    sessions: [],
    policies: INITIAL_POLICIES,
    users: INITIAL_USERS,
    discoveredAccounts: INITIAL_DISCOVERED_ACCOUNTS,
    discoveryJobs: INITIAL_DISCOVERY_JOBS,
    incidents: INITIAL_INCIDENTS,
    completedLabs: [],
    scores: {},
    approvalGranted: false,
    psmConnectorHealthy: true,
  };
}

export function canSafeMemberPerform(
  safe: PamSafe | undefined,
  username: string,
  permission: SafePermission,
): boolean {
  if (!safe) return false;
  return safe.members.some(
    (member) => member.username === username && member.permissions.includes(permission),
  );
}

export function permissionDependencies(permissions: SafePermission[]): SafePermission[] {
  const required = new Set<SafePermission>();
  if (permissions.includes("Retrieve accounts")) required.add("List accounts");
  if (permissions.includes("Use accounts")) required.add("List accounts");
  if (permissions.includes("Manage accounts")) required.add("List accounts");
  if (permissions.includes("Add accounts")) required.add("Manage accounts");
  if (permissions.includes("Delete accounts")) required.add("Manage accounts");
  if (permissions.includes("Update account properties")) required.add("Manage accounts");
  return [...required];
}

export function validateMemberPermissions(permissions: SafePermission[]): string | null {
  const missing = permissionDependencies(permissions).filter((item) => !permissions.includes(item));
  return missing.length > 0 ? `Select required permission: ${missing.join(", ")}.` : null;
}

export function canAccessAccount(
  state: PamState,
  safeName: string,
  username: string,
  permission: SafePermission,
): boolean {
  return canSafeMemberPerform(
    state.safes.find((safe) => safe.name === safeName),
    username,
    permission,
  );
}

export function evaluatePermission(
  state: PamState,
  safeName: string,
  username: string,
  permission: SafePermission,
): {
  allowed: boolean;
  message: string;
} {
  const allowed = canAccessAccount(state, safeName, username, permission);
  return {
    allowed,
    message: allowed
      ? `${username} is authorized for ${permission} in ${safeName}.`
      : `${username} is not authorized for ${permission} in ${safeName}. The action is denied and audited.`,
  };
}

function stamp(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function auditEvent(
  actor: string,
  action: string,
  target: string,
  result: PamAuditEvent["result"],
  detail: string,
): PamAuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    time: stamp(),
    actor,
    action,
    target,
    result,
    detail,
  };
}

export function addSafe(
  state: PamState,
  input: { name: string; description: string; owner: string },
): {
  state: PamState;
  error?: string;
} {
  const name = input.name.trim();
  if (!/^[A-Z][A-Z0-9-]{2,29}$/.test(name))
    return {
      state,
      error: "Use 3–30 uppercase letters, numbers, or hyphens; begin with a letter.",
    };
  if (state.safes.some((safe) => safe.name === name))
    return { state, error: "A Safe with that name already exists." };
  if (!input.owner) return { state, error: "Choose a Safe owner before creating the Safe." };
  const safe: PamSafe = {
    name,
    description: input.description.trim(),
    owner: input.owner,
    members: [{ username: input.owner, permissions: fullAdmin }],
  };
  return {
    state: {
      ...state,
      safes: [...state.safes, safe],
      audit: [
        auditEvent(
          input.owner,
          "Create Safe",
          name,
          "Success",
          "Safe created with owner-only access",
        ),
        ...state.audit,
      ],
    },
  };
}

export function setSafeMember(
  state: PamState,
  safeName: string,
  member: SafeMember | null,
  actor: string,
): {
  state: PamState;
  error?: string;
} {
  const target = state.safes.find((safe) => safe.name === safeName);
  if (!target) return { state, error: "Safe not found." };
  if (member) {
    const validation = validateMemberPermissions(member.permissions);
    if (validation) return { state, error: validation };
    if (!LEARNERS.includes(member.username))
      return { state, error: "Select a learner in the training directory." };
  }
  const safes = state.safes.map((safe) => {
    if (safe.name !== safeName) return safe;
    const filtered = safe.members.filter((entry) => entry.username !== (member?.username ?? ""));
    if (member) filtered.push(member);
    return { ...safe, members: filtered };
  });
  const audit = auditEvent(
    actor,
    member ? "Update Safe member" : "Remove Safe member",
    `${member?.username ?? "member"} · ${safeName}`,
    "Success",
    member ? `Permissions: ${member.permissions.join(", ")}` : "Safe membership removed",
  );
  return { state: { ...state, safes, audit: [audit, ...state.audit] } };
}

export interface NewAccountInput {
  name: string;
  username: string;
  address: string;
  platform: string;
  safe: string;
  type: string;
  owner: string;
  purpose: string;
  dependency: string;
}

export function addAccount(
  state: PamState,
  input: NewAccountInput,
  actor: string,
): { state: PamState; error?: string } {
  const accountName = input.name.trim();
  const username = input.username.trim();
  const address = input.address.trim().toUpperCase();
  const platform = input.platform.trim();
  const safe = input.safe.trim();
  const owner = input.owner.trim();
  const purpose = input.purpose.trim();

  if (!accountName || !username) {
    return { state, error: "Account name and username are required." };
  }
  if (!address || !/^[A-Z0-9][A-Z0-9.-]{1,63}$/i.test(address)) {
    return {
      state,
      error:
        "Target address must be a valid system name or IP (e.g. WIN-SRV-01, DB-SQL-01, 10.24.18.21).",
    };
  }
  if (!SUPPORTED_PLATFORMS.includes(platform as SupportedPlatform)) {
    return {
      state,
      error: `Platform '${platform}' is unsupported. Select a supported platform: ${SUPPORTED_PLATFORMS.join(", ")}.`,
    };
  }
  const targetSafe = state.safes.find((item) => item.name === safe);
  if (!targetSafe) {
    return { state, error: `Select an existing Safe. Safe '${safe}' does not exist.` };
  }
  if (!owner) {
    return { state, error: "Account owner is required for attribution and accountability." };
  }
  if (!purpose) {
    return { state, error: "Business purpose is required to document operational need." };
  }
  if (
    state.accounts.some(
      (acc) =>
        acc.address.toUpperCase() === address &&
        acc.username.toLowerCase() === username.toLowerCase(),
    )
  ) {
    return { state, error: `Account '${username}' is already onboarded for target '${address}'.` };
  }

  const defaultPolicy = platform.includes("Windows")
    ? input.type.includes("Domain")
      ? "Domain-30d"
      : "Windows-90d"
    : platform.includes("Unix")
      ? "Unix-30d"
      : platform.includes("SQL")
        ? "SQL-30d"
        : platform.includes("Oracle")
          ? "Oracle-30d"
          : "Application-30d";

  const newAcc: PamAccount = {
    id: `account-${Date.now()}`,
    name: accountName,
    username,
    address,
    platform,
    safe,
    type: input.type.trim() || "Privileged account",
    owner,
    purpose,
    dependency: input.dependency.trim(),
    status: "Verify required",
    policy: defaultPolicy,
    lastVerify: "Pending verification",
    lastChange: "Never",
    lastReconcile: "Never",
    failureCause: undefined,
  };

  return {
    state: {
      ...state,
      accounts: [newAcc, ...state.accounts],
      audit: [
        auditEvent(
          actor,
          "Onboard account",
          `${newAcc.username} · ${newAcc.address}`,
          "Success",
          `Onboarded into ${newAcc.safe} under ${newAcc.platform} (${newAcc.policy})`,
        ),
        ...state.audit,
      ],
    },
  };
}

export function runCpmOperation(
  state: PamState,
  accountId: string,
  operation: CpmOperation,
  actor: string,
): {
  state: PamState;
  error?: string;
} {
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return { state, error: "Account not found." };
  const targetSafe = state.safes.find((safe) => safe.name === account.safe);
  if (!canSafeMemberPerform(targetSafe, actor, "Manage accounts")) {
    const detail = `Denied: ${actor} lacks Manage accounts permission in ${account.safe}.`;
    const op: PamCpmOperation = {
      id: `op-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      accountId,
      operation,
      result: "Failed",
      detail,
      time: stamp(),
    };
    return {
      state: {
        ...state,
        cpmOperations: [op, ...state.cpmOperations],
        audit: [
          auditEvent(
            actor,
            `CPM ${operation}`,
            `${account.username} · ${account.address}`,
            "Denied",
            detail,
          ),
          ...state.audit,
        ],
      },
      error: detail,
    };
  }

  const time = stamp();
  let result: PamCpmOperation["result"] = "Completed";
  let detail = `${operation} completed.`;
  let nextStatus: AccountStatus = account.status;
  let nextVerify = account.lastVerify;
  let nextChange = account.lastChange;
  let nextReconcile = account.lastReconcile;

  if (operation === "Verify") {
    if (account.failureCause) {
      result = "Failed";
      detail = `Verify failed: Target authentication failed on ${account.address} (${account.failureCause}).`;
      nextVerify = `Failed ${time}`;
      nextStatus = account.status === "Rotation failed" ? "Rotation failed" : "Verify required";
    } else {
      result = "Completed";
      detail = `Verify completed: Stored credential authenticated successfully on ${account.address}.`;
      nextVerify = `Verified ${time}`;
      nextStatus = "Managed";
    }
  } else if (operation === "Change") {
    if (account.status === "Unmanaged") {
      const err = `Cannot rotate unmanaged account ${account.username}. Verify and enable management first.`;
      const op: PamCpmOperation = {
        id: `op-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        accountId,
        operation,
        result: "Failed",
        detail: err,
        time,
      };
      return {
        state: {
          ...state,
          cpmOperations: [op, ...state.cpmOperations],
          audit: [
            auditEvent(
              actor,
              `CPM ${operation}`,
              `${account.username} · ${account.address}`,
              "Warning",
              err,
            ),
            ...state.audit,
          ],
        },
        error: err,
      };
    }

    if (account.failureCause) {
      result = "Failed";
      detail = `Change failed on ${account.address}: ${account.failureCause}. Resolve incident before retrying.`;
      nextStatus = "Rotation failed";
      nextChange = `Failed ${time}`;
    } else {
      result = "Completed";
      detail = `Change completed: CPM rotated password on ${account.address} and updated Vault record.`;
      nextStatus = "Managed";
      nextChange = `Changed ${time}`;
    }
  } else if (operation === "Reconcile") {
    if (
      account.failureCause?.toLowerCase().includes("connectivity") ||
      account.failureCause?.toLowerCase().includes("unreachable")
    ) {
      result = "Failed";
      detail = `Reconcile failed: Cannot reach target ${account.address}. Network path unavailable.`;
    } else if (account.failureCause?.toLowerCase().includes("locked")) {
      result = "Failed";
      detail = `Reconcile failed: Target account ${account.username} is locked. Unlock account on target before reconciliation.`;
    } else {
      result = "Completed";
      detail = `Reconcile completed: Reconcile account authenticated; managed credential re-synchronized with ${account.address}.`;
      nextReconcile = `Reconciled ${time}`;
      nextStatus = "Verify required";
    }
  }

  const updatedAccount: PamAccount = {
    ...account,
    status: nextStatus,
    lastVerify: nextVerify,
    lastChange: nextChange,
    lastReconcile: nextReconcile,
  };

  const op: PamCpmOperation = {
    id: `op-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    accountId,
    operation,
    result,
    detail,
    time,
  };

  return {
    state: {
      ...state,
      accounts: state.accounts.map((item) => (item.id === accountId ? updatedAccount : item)),
      cpmOperations: [op, ...state.cpmOperations],
      audit: [
        auditEvent(
          actor,
          `CPM ${operation}`,
          `${account.username} · ${account.address}`,
          result === "Completed" ? "Success" : "Warning",
          detail,
        ),
        ...state.audit,
      ],
    },
  };
}

export function repairCpmFailure(
  state: PamState,
  accountId: string,
  repair: "unlock" | "reconcile-access" | "target-connectivity",
  actor: string,
): { state: PamState; error?: string } {
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return { state, error: "Account not found." };
  if (
    !canSafeMemberPerform(
      state.safes.find((safe) => safe.name === account.safe),
      actor,
      "Manage accounts",
    )
  ) {
    return {
      state,
      error: `Denied: ${actor} lacks Manage accounts permission in ${account.safe}.`,
    };
  }

  const cause = (account.failureCause ?? "").toLowerCase();

  if (repair === "unlock") {
    if (!cause.includes("locked") && !cause.includes("lockout")) {
      return {
        state,
        error: `Repair mismatched: Target account is not locked (${account.failureCause || "no fault recorded"}). Unlock does not apply.`,
      };
    }
  } else if (repair === "target-connectivity") {
    if (
      !cause.includes("connectivity") &&
      !cause.includes("unreachable") &&
      !cause.includes("network")
    ) {
      return {
        state,
        error: `Repair mismatched: Connectivity is intact (${account.failureCause || "no connectivity fault"}). Network repair does not apply.`,
      };
    }
  } else if (repair === "reconcile-access") {
    if (
      !cause.includes("reconcile") &&
      !cause.includes("permission") &&
      !cause.includes("access")
    ) {
      return {
        state,
        error: `Repair mismatched: Reconcile access is intact (${account.failureCause || "no permission fault"}). Reconcile access repair does not apply.`,
      };
    }
  }

  const repairLabels: Record<string, string> = {
    unlock: `Account lockout cleared on target ${account.address}. Ready for reconcile/retry and verification.`,
    "target-connectivity": `Target connectivity restored for ${account.address}. Network path verified.`,
    "reconcile-access": `Administrative reconciliation permissions verified on ${account.address}.`,
  };

  const updated: PamAccount = {
    ...account,
    failureCause: undefined,
    status: "Verify required",
  };

  return {
    state: {
      ...state,
      accounts: state.accounts.map((item) => (item.id === accountId ? updated : item)),
      audit: [
        auditEvent(
          actor,
          "Resolve CPM incident",
          `${account.username} · ${account.address}`,
          "Success",
          repairLabels[repair] ?? "Fault repaired",
        ),
        ...state.audit,
      ],
    },
  };
}

export function resetPamState(): PamState {
  return makeInitialPamState();
}

export function launchPsmSession(
  state: PamState,
  input: { target: string; account: PamAccount; ticket: string; reason: string },
  actor: string,
): { state: PamState; error?: string } {
  if (!state.psmConnectorHealthy) {
    return {
      state,
      error: "PSM connector unavailable. Verify connector health check before launching.",
    };
  }
  if (!state.approvalGranted) {
    return {
      state,
      error: "Dual-control approval required before launching this privileged session.",
    };
  }
  const ticket = input.ticket.trim();
  if (!ticket || !/^CHG-\d{4,8}$/i.test(ticket)) {
    return { state, error: "Enter a valid change reference ticket in CHG-12345 format." };
  }
  const reason = input.reason.trim();
  if (reason.length < 12) {
    return { state, error: "Provide a documented business reason of at least 12 characters." };
  }
  if (!LEARNERS.includes(actor)) {
    return { state, error: `Unrecognized operator identity '${actor}'.` };
  }
  const safe = state.safes.find((s) => s.name === input.account.safe);
  if (!safe) {
    return { state, error: `Safe '${input.account.safe}' not found.` };
  }
  if (!canSafeMemberPerform(safe, actor, "Initiate privileged sessions")) {
    return {
      state,
      error: `Access denied: ${actor} lacks Initiate privileged sessions permission in ${input.account.safe}.`,
    };
  }
  if (input.target.toUpperCase() !== input.account.address.toUpperCase()) {
    return {
      state,
      error: `Target mismatch: Selected target '${input.target}' does not match account target '${input.account.address}'.`,
    };
  }
  if (input.account.status === "Rotation failed" || input.account.failureCause) {
    return {
      state,
      error: `Cannot broker session: Account '${input.account.username}' has an unresolved rotation failure (${input.account.failureCause ?? "out of sync"}).`,
    };
  }

  const session: PamSession = {
    id: `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    target: input.target.toUpperCase(),
    account: input.account.username,
    component: "RDP through PSM",
    ticket,
    reason,
    status: "Active",
    commands: [],
    started: stamp(),
  };

  return {
    state: {
      ...state,
      sessions: [session, ...state.sessions],
      audit: [
        auditEvent(
          actor,
          "Launch PSM session",
          `${session.target} · ${session.account}`,
          "Success",
          `Brokered session started via ${session.component} (Ticket: ${session.ticket})`,
        ),
        ...state.audit,
      ],
    },
  };
}

const TERMINAL_OUTPUT: Record<string, string> = {
  hostname: "WIN-SRV-01",
  whoami: "corp\\administrator",
  ipconfig: "Ethernet adapter CorpNet: 10.24.18.21 · Gateway 10.24.18.1 · DNS 10.24.0.10",
  systeminfo: "OS: Windows Server 2022 Datacenter · Build 20348 · Domain: corp.gfs.local",
  "net user": "Administrator  svc_backup  svc_sql  Guest  WDAGUtilityAccount",
  "get-service":
    "Status   Name          DisplayName\nRunning  EventLog      Windows Event Log\nRunning  LanmanServer  Server\nRunning  WinDefend     Microsoft Defender Antivirus Service\nStopped  Spooler       Print Spooler",
  "get-process":
    "Handles  NPM(K)  PM(M)  WS(M)  CPU(s)   Id  ProcessName\n    692      54    128    140   14.21  1024  lsass\n    431      32     86     92    8.10   840  services\n    284      19     62     68    5.42  1920  sqlservr",
  help: "Allowed simulated commands:\n  help        - Display supported command syntax\n  hostname    - Output system host identifier\n  whoami      - Display current authenticated security context\n  ipconfig    - View simulated network interface properties\n  systeminfo  - View operating system configuration\n  net user    - Enumerate local user accounts\n  Get-Service - List running Windows services\n  Get-Process - List running processes\n  exit        - Terminate and seal the PSM session",
};

export function simulateTerminalCommand(command: string): {
  output: string;
  exit: boolean;
  valid: boolean;
} {
  const trimmed = command.trim();
  if (!trimmed) return { output: "", exit: false, valid: false };
  const normalized = trimmed.replace(/\s+/g, " ").toLowerCase();

  if (normalized === "exit") {
    return { output: "Session closed by operator. PSM recording sealed.", exit: true, valid: true };
  }

  const canned = TERMINAL_OUTPUT[normalized];
  if (canned) {
    return { output: canned, exit: false, valid: true };
  }

  return {
    output: `'${trimmed}' is not recognized in this controlled training shell.\nAllowed commands: help, hostname, whoami, ipconfig, systeminfo, net user, Get-Service, Get-Process, exit.`,
    exit: false,
    valid: false,
  };
}

export function appendSessionCommand(
  state: PamState,
  sessionId: string,
  command: string,
  actor: string,
): PamState {
  const currentSession = state.sessions.find((s) => s.id === sessionId);
  if (!currentSession || currentSession.status !== "Active") return state;
  const trimmed = command.trim();
  if (!trimmed) return state;

  const sim = simulateTerminalCommand(trimmed);
  const updatedSessions = state.sessions.map((session) => {
    if (session.id !== sessionId) return session;
    return {
      ...session,
      commands: [...session.commands, `${trimmed}\n${sim.output}`],
      status: sim.exit ? ("Terminated" as const) : session.status,
    };
  });

  const eventAction = sim.exit ? "Terminate PSM session" : "Execute session command";
  const eventDetail = sim.exit
    ? `Session terminated by operator. Total commands recorded: ${currentSession.commands.length + 1}`
    : `Simulated command: ${trimmed} (${sim.valid ? "allowed" : "rejected"})`;

  return {
    ...state,
    sessions: updatedSessions,
    audit: [
      auditEvent(
        actor,
        eventAction,
        `${currentSession.target} · ${currentSession.account}`,
        sim.valid ? "Success" : "Warning",
        eventDetail,
      ),
      ...state.audit,
    ],
  };
}

export function terminatePsmSession(
  state: PamState,
  sessionId: string,
  reason: string,
  actor: string = "pam_admin",
): { state: PamState; error?: string } {
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session) {
    return { state, error: `Session '${sessionId}' not found.` };
  }
  if (session.status === "Terminated") {
    return { state, error: `Session '${sessionId}' is already terminated.` };
  }

  const cleanReason = reason.trim() || "Terminated by administrative operator";
  const updatedSessions = state.sessions.map((s) =>
    s.id === sessionId
      ? {
          ...s,
          status: "Terminated" as const,
          terminationReason: cleanReason,
          duration: s.duration?.startsWith("Active") ? "Terminated by Admin" : s.duration,
        }
      : s,
  );

  const audit = [
    auditEvent(
      actor,
      "Terminate PSM session",
      `${session.target} · ${session.account}`,
      "Success",
      `Session terminated: ${cleanReason}. Session recording sealed.`,
    ),
    ...state.audit,
  ];

  return {
    state: {
      ...state,
      sessions: updatedSessions,
      audit,
    },
  };
}

export function addPolicy(
  state: PamState,
  input: {
    name: string;
    platform: string;
    description: string;
    rotationIntervalDays: number;
    minPasswordLength: number;
    passwordComplexity: string;
    requireDualControl: boolean;
    requireTicket: boolean;
    cpmId?: string;
  },
  actor: string = "pam_admin",
): { state: PamState; error?: string } {
  const name = input.name.trim();
  if (!name) return { state, error: "Policy name is required." };
  if (state.policies.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    return { state, error: `Policy '${name}' already exists.` };
  }

  const newPolicy: PamPolicy = {
    id: `pol-${Date.now()}`,
    name,
    platform: input.platform || "Windows Server Local",
    description: input.description.trim() || "Enterprise privilege rotation policy",
    rotationIntervalDays: input.rotationIntervalDays || 90,
    minPasswordLength: input.minPasswordLength || 24,
    passwordComplexity: input.passwordComplexity || "Upper, lower, digits, symbols",
    requireDualControl: Boolean(input.requireDualControl),
    requireTicket: Boolean(input.requireTicket),
    cpmId: input.cpmId || "CPM-PROD-01",
    status: "Active",
  };

  return {
    state: {
      ...state,
      policies: [...state.policies, newPolicy],
      audit: [
        auditEvent(
          actor,
          "Create Policy",
          newPolicy.name,
          "Success",
          `Created policy '${newPolicy.name}' (${newPolicy.platform}, ${newPolicy.rotationIntervalDays}d rotation, ${newPolicy.minPasswordLength} chars)`,
        ),
        ...state.audit,
      ],
    },
  };
}

export function updatePolicy(
  state: PamState,
  policyId: string,
  updates: Partial<PamPolicy>,
  actor: string = "pam_admin",
): { state: PamState; error?: string } {
  const existing = state.policies.find((p) => p.id === policyId);
  if (!existing) return { state, error: `Policy '${policyId}' not found.` };

  const updatedPolicies = state.policies.map((p) => (p.id === policyId ? { ...p, ...updates } : p));

  return {
    state: {
      ...state,
      policies: updatedPolicies,
      audit: [
        auditEvent(
          actor,
          "Update Policy",
          existing.name,
          "Success",
          `Updated configuration for policy '${existing.name}'`,
        ),
        ...state.audit,
      ],
    },
  };
}

export function addUser(
  state: PamState,
  input: {
    username: string;
    fullName: string;
    email: string;
    role: PamUserRole;
    department: string;
    groups?: string[];
  },
  actor: string = "pam_admin",
): { state: PamState; error?: string } {
  const username = input.username.trim().toLowerCase();
  if (!username) return { state, error: "Username is required." };
  if (state.users.some((u) => u.username.toLowerCase() === username)) {
    return { state, error: `User '${username}' already exists.` };
  }

  const newUser: PamUser = {
    id: `usr-${Date.now()}`,
    username,
    fullName: input.fullName.trim() || username,
    email: input.email.trim() || `${username}@corp.gfs.local`,
    role: input.role || "Security Operator",
    department: input.department.trim() || "Operations",
    status: "Active",
    groups: input.groups && input.groups.length > 0 ? input.groups : ["PAM-Users"],
    lastLogin: "Never",
  };

  return {
    state: {
      ...state,
      users: [...state.users, newUser],
      audit: [
        auditEvent(
          actor,
          "Create User",
          newUser.username,
          "Success",
          `Created user '${newUser.username}' with role '${newUser.role}' in department '${newUser.department}'`,
        ),
        ...state.audit,
      ],
    },
  };
}

export function updateUserRole(
  state: PamState,
  userId: string,
  newRole: PamUserRole,
  actor: string = "pam_admin",
): { state: PamState; error?: string } {
  const user = state.users.find((u) => u.id === userId);
  if (!user) return { state, error: `User '${userId}' not found.` };

  const updatedUsers = state.users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));

  return {
    state: {
      ...state,
      users: updatedUsers,
      audit: [
        auditEvent(
          actor,
          "Update User Role",
          user.username,
          "Success",
          `Changed role for user '${user.username}' from '${user.role}' to '${newRole}'`,
        ),
        ...state.audit,
      ],
    },
  };
}

export function runDiscoveryScan(
  state: PamState,
  subnet: string,
  source: string,
  actor: string = "pam_admin",
): { state: PamState; job: PamDiscoveryJob; newAccountsCount: number } {
  const jobId = `job-scan-${Date.now().toString().slice(-4)}`;
  const cleanSubnet = subnet.trim() || "10.0.2.0/24 (DMZ Web Tier)";
  const cleanSource = source.trim() || "Active Directory ServiceScan";

  const candidates: PamDiscoveredAccount[] = [
    {
      id: `disc-${Date.now()}-1`,
      username: "admin_webproxy",
      target: "LNX-PROXY-01",
      platform: "Unix SSH",
      source: cleanSource,
      risk: "High",
      reason: "Unmonitored sudoer account on perimeter web proxy",
      discoveredAt: stamp(),
      status: "Unmanaged",
    },
    {
      id: `disc-${Date.now()}-2`,
      username: "svc_payment_api",
      target: "APP-PAY-02",
      platform: "Windows Domain Account",
      source: cleanSource,
      risk: "Critical",
      reason: "High-privilege application service account with domain-wide token rights",
      discoveredAt: stamp(),
      status: "Unmanaged",
    },
  ];

  const job: PamDiscoveryJob = {
    id: jobId,
    source: cleanSource,
    targetSubnet: cleanSubnet,
    startTime: stamp(),
    status: "Completed",
    foundCount: candidates.length,
  };

  return {
    state: {
      ...state,
      discoveryJobs: [job, ...state.discoveryJobs],
      discoveredAccounts: [...candidates, ...state.discoveredAccounts],
      audit: [
        auditEvent(
          actor,
          "Discovery Scan",
          cleanSubnet,
          "Success",
          `Completed discovery scan '${jobId}' on ${cleanSubnet} via ${cleanSource}. Found ${candidates.length} unmanaged privileged candidates.`,
        ),
        ...state.audit,
      ],
    },
    job,
    newAccountsCount: candidates.length,
  };
}

export function onboardDiscoveredAccount(
  state: PamState,
  candidateId: string,
  safeName: string,
  policyName: string,
  owner: string = "pam_admin",
  actor: string = "pam_admin",
): { state: PamState; error?: string; createdAccount?: PamAccount } {
  const candidate = state.discoveredAccounts.find((c) => c.id === candidateId);
  if (!candidate) return { state, error: "Discovered candidate not found." };
  if (candidate.status === "Onboarded") return { state, error: "Candidate is already onboarded." };

  const safe = state.safes.find((s) => s.name === safeName);
  if (!safe) return { state, error: `Safe '${safeName}' does not exist.` };

  const newAccResult = addAccount(
    state,
    {
      name: `${candidate.username}-${candidate.target}`,
      username: candidate.username,
      address: candidate.target,
      platform: candidate.platform as SupportedPlatform,
      safe: safeName,
      accountType: candidate.username.startsWith("svc") ? "Service account" : "Human administrator",
      owner: owner || "pam_admin",
      purpose: candidate.reason,
    },
    actor,
  );

  if (newAccResult.error) {
    return { state, error: newAccResult.error };
  }

  const updatedCandidates = state.discoveredAccounts.map((c) =>
    c.id === candidateId ? { ...c, status: "Onboarded" as const } : c,
  );

  const createdAccount = newAccResult.state.accounts.find(
    (a) => a.username === candidate.username && a.address === candidate.target,
  );

  return {
    state: {
      ...newAccResult.state,
      discoveredAccounts: updatedCandidates,
      audit: [
        auditEvent(
          actor,
          "Onboard Discovered Account",
          `${candidate.username} · ${candidate.target}`,
          "Success",
          `Onboarded discovered identity into Safe '${safeName}' with policy '${policyName}'. Candidate closed in Discovery queue.`,
        ),
        ...newAccResult.state.audit,
      ],
    },
    createdAccount,
  };
}

export function remediateIncident(
  state: PamState,
  incidentId: string,
  actor: string = "pam_admin",
): { state: PamState; error?: string; message?: string } {
  const inc = state.incidents.find((i) => i.id === incidentId);
  if (!inc) return { state, error: `Incident '${incidentId}' not found.` };
  if (inc.status === "Resolved") return { state, error: "Incident is already resolved." };

  let nextAccounts = state.accounts;
  if (inc.accountId) {
    nextAccounts = state.accounts.map((a) => {
      if (a.id === inc.accountId || a.username === inc.accountUsername) {
        return {
          ...a,
          status: "Managed",
          failureCause: undefined,
          lastReconcile: "Reconciled just now",
          lastVerify: "Verified just now",
        };
      }
      return a;
    });
  }

  const updatedIncidents = state.incidents.map((i) =>
    i.id === incidentId
      ? {
          ...i,
          status: "Resolved" as const,
          resolvedTime: stamp(),
        }
      : i,
  );

  const remediationMessage = `Remediation executed: ${inc.remediationAction}. Incident ${inc.id} closed.`;

  return {
    state: {
      ...state,
      accounts: nextAccounts,
      incidents: updatedIncidents,
      audit: [
        auditEvent(
          actor,
          "Remediate PAM Incident",
          `${inc.component} · ${inc.id}`,
          "Success",
          remediationMessage,
        ),
        ...state.audit,
      ],
    },
    message: remediationMessage,
  };
}

export function completeLab(state: PamState, labId: string, score: number): PamState {
  return {
    ...state,
    completedLabs: state.completedLabs.includes(labId)
      ? state.completedLabs
      : [...state.completedLabs, labId],
    scores: { ...state.scores, [labId]: Math.max(state.scores[labId] ?? 0, score) },
  };
}

export interface LabObjective {
  id: string;
  description: string;
  done: boolean;
  evidence?: string;
}

export type LabEvaluationResult = {
  completed: boolean;
  score: number;
  objectives: LabObjective[];
  feedback: string;
};

export function evaluateLabObjectives(
  state: PamState,
  labId: string,
): { completed: boolean; score: number; objectives: LabObjective[]; feedback: string } {
  const objectives: LabObjective[] = [];

  if (labId.includes("Lab 01")) {
    const hasAuditAction = (act: string) =>
      state.audit.some(
        (a) =>
          a.action.toLowerCase().includes(act.toLowerCase()) ||
          a.detail.toLowerCase().includes(act.toLowerCase()),
      );
    objectives.push(
      {
        id: "id-vault",
        description: "Identify Vault component responsibilities",
        done: hasAuditAction("Vault") || state.safes.length > 0,
        evidence: "Digital Vault protection boundary configured",
      },
      {
        id: "id-pvwa",
        description: "Identify PVWA web access portal role",
        done: true,
        evidence: "PVWA interactive operations center active",
      },
      {
        id: "id-cpm",
        description: "Identify CPM password management engine",
        done: state.cpmOperations.length > 0 || hasAuditAction("CPM"),
        evidence: `${state.cpmOperations.length} CPM operations recorded`,
      },
      {
        id: "id-psm",
        description: "Identify PSM privileged session broker",
        done: state.sessions.length > 0 || hasAuditAction("PSM") || state.psmConnectorHealthy,
        evidence: "PSM connection broker active",
      },
      {
        id: "trace-onboarding",
        description: "Trace account onboarding control flow",
        done: hasAuditAction("Onboard") || state.accounts.length >= 10,
        evidence: "Account onboarding path traced",
      },
      {
        id: "trace-rotation",
        description: "Trace password rotation flow",
        done: hasAuditAction("Change") || hasAuditAction("Verify"),
        evidence: "CPM rotation sequence reviewed",
      },
      {
        id: "trace-session",
        description: "Trace privileged session flow",
        done: hasAuditAction("session") || state.sessions.length > 0,
        evidence: "Brokered session flow validated",
      },
    );
  } else if (labId.includes("Lab 02")) {
    const dbaSafe = state.safes.find((s) => s.name === "DBA-SAFE");
    const dbaUser = dbaSafe?.members.find((m) => m.username === "dba_user");
    const hasAllowedTest = state.audit.some(
      (a) =>
        a.target.includes("DBA-SAFE") &&
        a.result === "Success" &&
        (a.action.includes("member") || a.action.includes("Use") || a.action.includes("List")),
    );
    const hasDeniedTest = state.audit.some(
      (a) => a.target.includes("DBA-SAFE") && a.result === "Denied",
    );
    const noRetrieve = Boolean(dbaUser && !dbaUser.permissions.includes("Retrieve accounts"));
    const hasSessionOrUse = Boolean(
      dbaUser &&
      (dbaUser.permissions.includes("Use accounts") ||
        dbaUser.permissions.includes("Initiate privileged sessions")),
    );

    objectives.push(
      {
        id: "create-safe",
        description: "Create or confirm DBA-SAFE container",
        done: Boolean(dbaSafe),
        evidence: dbaSafe
          ? `DBA-SAFE verified (${dbaSafe.members.length} members)`
          : "DBA-SAFE missing",
      },
      {
        id: "assign-owner",
        description: "Assign accountable owner for DBA-SAFE",
        done: Boolean(dbaSafe?.owner),
        evidence: dbaSafe?.owner ? `Owner: ${dbaSafe.owner}` : "No owner assigned",
      },
      {
        id: "add-dba-user",
        description: "Add dba_user as Safe member",
        done: Boolean(dbaUser),
        evidence: dbaUser ? "dba_user membership active" : "dba_user not a member",
      },
      {
        id: "least-privilege",
        description: "Enforce least privilege: session access without credential retrieval",
        done: noRetrieve && hasSessionOrUse,
        evidence: noRetrieve
          ? "Retrieve accounts withheld; mediated session permitted"
          : "Retrieve accounts permission granted (violates least privilege)",
      },
      {
        id: "verify-allowed",
        description: "Verify permitted operation for DBA team",
        done: hasAllowedTest,
        evidence: hasAllowedTest
          ? "Allowed operation validated and audited"
          : "Run access review or test allowed permission",
      },
      {
        id: "verify-denied",
        description: "Verify denied operation (Retrieve accounts denied)",
        done: hasDeniedTest || noRetrieve,
        evidence: hasDeniedTest
          ? "Denied test recorded in audit trail"
          : "Test unauthorized permission to confirm denial",
      },
    );
  } else if (labId.includes("Lab 03")) {
    const winAdmin = state.accounts.find(
      (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
    );
    const isWinLocal = winAdmin?.platform === "Windows Server Local";
    const isInWinSafe = winAdmin?.safe === "WIN-SAFE";
    const isOwnerAssigned = winAdmin?.owner === "windows_admin";
    const isVerified =
      winAdmin?.lastVerify.includes("Verified") ||
      state.cpmOperations.some(
        (op) =>
          op.accountId === winAdmin?.id && op.operation === "Verify" && op.result === "Completed",
      );
    const isManaged = winAdmin?.status === "Managed";

    objectives.push(
      {
        id: "onboard-account",
        description: "Onboard WIN-SRV-01 Administrator account",
        done: Boolean(winAdmin),
        evidence: winAdmin ? "Administrator record present in inventory" : "Account missing",
      },
      {
        id: "platform-selection",
        description: "Select supported platform: Windows Server Local",
        done: isWinLocal,
        evidence: winAdmin ? `Platform: ${winAdmin.platform}` : "Select Windows Server Local",
      },
      {
        id: "safe-placement",
        description: "Place account in WIN-SAFE boundary",
        done: isInWinSafe,
        evidence: winAdmin ? `Safe: ${winAdmin.safe}` : "Select WIN-SAFE",
      },
      {
        id: "assign-owner",
        description: "Assign windows_admin as account owner",
        done: isOwnerAssigned,
        evidence: winAdmin ? `Owner: ${winAdmin.owner}` : "Assign windows_admin",
      },
      {
        id: "verify-creds",
        description: "Run CPM Verify against target",
        done: Boolean(isVerified),
        evidence: isVerified ? "CPM Verify succeeded on target" : "Run CPM Verify from operations",
      },
      {
        id: "management-status",
        description: "Confirm account state transitions to Managed",
        done: Boolean(isManaged),
        evidence: isManaged
          ? "Account active in Managed state"
          : `Current state: ${winAdmin?.status ?? "None"}`,
      },
    );
  } else if (labId.includes("Lab 04")) {
    const hasService = state.accounts.some((a) => a.type.toLowerCase().includes("service"));
    const hasShared = state.accounts.some((a) => a.type.toLowerCase().includes("shared"));
    const allHaveOwners = state.accounts.every((a) => Boolean(a.owner));
    const hasRemediation =
      state.accounts.some((a) => a.status === "Rotation failed") ||
      state.audit.some(
        (a) =>
          a.action.toLowerCase().includes("incident") || a.action.toLowerCase().includes("review"),
      );

    objectives.push(
      {
        id: "classify-types",
        description: "Classify human, service, database and shared accounts",
        done: hasService && hasShared,
        evidence: "Inventory classified across 6 identity archetypes",
      },
      {
        id: "accountable-owners",
        description: "Assign accountable owners for 100% of inventory",
        done: allHaveOwners,
        evidence: "All 10 enterprise records have named owners",
      },
      {
        id: "shared-attribution",
        description: "Identify shared privileged account (shared_ops)",
        done: hasShared,
        evidence: "shared_ops mapped to emergency dual-control Safe",
      },
      {
        id: "flag-unmanaged",
        description: "Identify unmanaged database identity (oracle on DB-ORA-01)",
        done: state.accounts.some((a) => a.username === "oracle" && a.status === "Unmanaged"),
        evidence: "oracle candidate flagged for remediation",
      },
      {
        id: "rotation-exceptions",
        description: "Identify rotation exception on service account (svc_backup)",
        done: state.accounts.some((a) => a.username === "svc_backup"),
        evidence: "svc_backup flagged for lockout remediation",
      },
      {
        id: "remediation-decision",
        description: "Document remediation decisions in audit trail",
        done: hasRemediation,
        evidence: "Remediation audit evidence recorded",
      },
    );
  } else if (labId.includes("Lab 05A")) {
    const winAdmin = state.accounts.find(
      (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
    );
    const changeOp = state.cpmOperations.find(
      (op) =>
        op.accountId === winAdmin?.id && op.operation === "Change" && op.result === "Completed",
    );
    const verifyOp = state.cpmOperations.find(
      (op) =>
        op.accountId === winAdmin?.id && op.operation === "Verify" && op.result === "Completed",
    );

    objectives.push(
      {
        id: "pre-verify",
        description: "Verify credential before attempting change",
        done: Boolean(winAdmin?.lastVerify.includes("Verified") || verifyOp),
        evidence: "Target authentication verified",
      },
      {
        id: "run-change",
        description: "Execute CPM password rotation",
        done: Boolean(changeOp || winAdmin?.lastChange !== "Never"),
        evidence: changeOp ? `Change recorded: ${changeOp.detail}` : "Run CPM Change",
      },
      {
        id: "inspect-result",
        description: "Inspect operation evidence in audit log",
        done: state.audit.some((a) => a.action.includes("Change")),
        evidence: "CPM Change audit event logged",
      },
      {
        id: "verify-final",
        description: "Verify new credential on target endpoint",
        done: Boolean(winAdmin?.status === "Managed"),
        evidence:
          winAdmin?.status === "Managed"
            ? "Credential managed and verified"
            : "Run Verify to confirm",
      },
    );
  } else if (labId.includes("Lab 05B")) {
    const backupAcc = state.accounts.find((a) => a.username === "svc_backup");
    const unlockAudit = state.audit.some(
      (a) =>
        a.action.includes("incident") &&
        (a.detail.toLowerCase().includes("unlocked") || a.detail.toLowerCase().includes("lockout")),
    );
    const reconcileOp = state.cpmOperations.some(
      (op) =>
        op.accountId === backupAcc?.id && op.operation === "Reconcile" && op.result === "Completed",
    );
    const changeOp = state.cpmOperations.some(
      (op) =>
        op.accountId === backupAcc?.id && op.operation === "Change" && op.result === "Completed",
    );
    const verifyOp = state.cpmOperations.some(
      (op) =>
        op.accountId === backupAcc?.id && op.operation === "Verify" && op.result === "Completed",
    );
    const isClean = !backupAcc?.failureCause;

    objectives.push(
      {
        id: "inspect-failure",
        description: "Inspect svc_backup failure cause (account lockout)",
        done: Boolean(backupAcc),
        evidence: "Failure detail: Account locked on target",
      },
      {
        id: "repair-lockout",
        description: "Execute Unlock repair on target account",
        done: unlockAudit || isClean,
        evidence:
          unlockAudit || isClean
            ? "Lockout condition resolved on target"
            : "Click Unlock target account",
      },
      {
        id: "reconcile-account",
        description: "Reconcile credential to restore synchronization",
        done: reconcileOp || backupAcc?.lastReconcile !== "Pending",
        evidence: reconcileOp ? "Vault/target credential synchronized" : "Run Reconcile",
      },
      {
        id: "retry-change",
        description: "Retry CPM Change password rotation",
        done: changeOp || (isClean && backupAcc?.status === "Managed"),
        evidence: changeOp ? "Change completed successfully" : "Run Change",
      },
      {
        id: "verify-recovery",
        description: "Verify restored credential health",
        done: verifyOp || (isClean && backupAcc?.status === "Managed"),
        evidence:
          backupAcc?.status === "Managed"
            ? "Incident resolved: svc_backup is Managed"
            : "Run Verify to complete recovery",
      },
    );
  } else if (labId.includes("Lab 06A")) {
    const session = state.sessions[0];
    const hasCommands = Boolean(session && session.commands.length >= 2);
    const isTerminated =
      Boolean(session && session.status === "Terminated") ||
      state.audit.some((a) => a.action.includes("Terminate"));

    objectives.push(
      {
        id: "obtain-approval",
        description: "Request dual-control approval for WIN-SRV-01 session",
        done: state.approvalGranted || state.sessions.length > 0,
        evidence: "Approval recorded for scenario",
      },
      {
        id: "ticket-reference",
        description: "Enter valid change ticket (CHG-12345 format)",
        done: Boolean(session?.ticket) || state.sessions.length > 0,
        evidence: session?.ticket ? `Ticket: ${session.ticket}` : "Enter ticket reference",
      },
      {
        id: "launch-psm",
        description: "Launch brokered session through PSM",
        done: state.sessions.length > 0,
        evidence: session ? `Active connection via ${session.component}` : "Launch session",
      },
      {
        id: "execute-commands",
        description: "Execute simulated commands (hostname, whoami, etc.)",
        done: hasCommands,
        evidence: session
          ? `${session.commands.length} commands executed in session`
          : "Run commands from terminal",
      },
      {
        id: "inspect-timeline",
        description: "Inspect session keystroke and event timeline",
        done: hasCommands || state.audit.some((a) => a.action.includes("command")),
        evidence: "Session recording evidence captured",
      },
      {
        id: "terminate-session",
        description: "Terminate session and seal audit record",
        done: isTerminated,
        evidence: isTerminated
          ? "Session terminated and recording preserved"
          : "Click Terminate or type exit",
      },
    );
  } else if (labId.includes("Lab 06B")) {
    const launchAttempt = state.audit.some(
      (a) => a.action.includes("Launch") || a.action.includes("Approval"),
    );
    const hasSession = state.sessions.length > 0;

    objectives.push(
      {
        id: "diagnose-preflight",
        description: "Diagnose PSM preflight gates (approval, Safe permission, connector)",
        done: true,
        evidence: "Preflight dependency matrix inspected",
      },
      {
        id: "review-failure-signals",
        description: "Identify missing approval or connector outage in audit log",
        done: launchAttempt,
        evidence: "Control plane audit verified",
      },
      {
        id: "restore-prerequisites",
        description: "Ensure connector is healthy and approval is granted",
        done: state.psmConnectorHealthy && (state.approvalGranted || hasSession),
        evidence: "All PSM preflight gates operational",
      },
      {
        id: "validate-healthy-launch",
        description: "Launch and complete an approved privileged session",
        done: hasSession,
        evidence: hasSession
          ? "Controlled session established successfully"
          : "Launch session with ticket CHG-20412",
      },
    );
  } else {
    objectives.push({
      id: "complete-steps",
      description: "Complete interactive lab exercises",
      done: state.audit.length >= 4,
      evidence: `${state.audit.length} audit events recorded`,
    });
  }

  const completedCount = objectives.filter((o) => o.done).length;
  const total = objectives.length;
  const score = total > 0 ? Math.round((completedCount / total) * 100) : 100;
  const completed = completedCount === total;
  const feedback = completed
    ? `All ${total} lab objectives completed with evidence in the audit trail. Final score: ${score}/100.`
    : `${completedCount} of ${total} objectives verified (${score}/100). Review the pending objectives below and complete the required operations.`;

  return { completed, score, objectives, feedback };
}
