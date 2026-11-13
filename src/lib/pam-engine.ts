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
  failureCause?: string;
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
}

export interface PamState {
  safes: PamSafe[];
  accounts: PamAccount[];
  audit: PamAuditEvent[];
  cpmOperations: PamCpmOperation[];
  sessions: PamSession[];
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
  ["Administrator", "Administrator", "WIN-SRV-01", "Windows Server Local", "WIN-SAFE", "Human administrator", "windows_admin", "Windows server administration", "", "Managed", "Windows-90d", "Verified 08:42", "Changed Nov 06", "Reconciled Nov 06"],
  ["DomainAdmin-GFS", "gfs\u005cDomainAdmin-GFS", "WIN-DC-01", "Active Directory", "DOMAIN-SAFE", "Domain administrator", "windows_admin", "Directory operations", "", "Managed", "Domain-30d", "Verified 08:14", "Changed Nov 01", "Reconciled Nov 01"],
  ["svc_backup", "svc_backup", "WIN-SRV-02", "Windows Domain Account", "SERVICE-SAFE", "Service account", "windows_admin", "Enterprise backup agent", "Backup Agent", "Rotation failed", "Service-60d", "Failed Nov 12", "Failed Nov 12", "Pending", "Account locked"],
  ["svc_sql", "svc_sql", "DB-SQL-01", "SQL Server Account", "SERVICE-SAFE", "Service account", "dba_user", "Database maintenance jobs", "SQL Agent", "Managed", "Service-60d", "Verified 07:48", "Changed Nov 09", "Reconciled Nov 09"],
  ["svc_payment", "svc_payment", "APP-PAYMENT-01", "Windows Domain Account", "SERVICE-SAFE", "Service account", "app_owner", "Payment processing service", "Payment API", "Verify required", "Service-60d", "Due Nov 12", "Changed Oct 12", "Reconciled Oct 12"],
  ["app_integrator", "app_integrator", "APP-PAYMENT-01", "Application Account", "APP-SAFE", "Application account", "app_owner", "Payment gateway connector", "Payment API", "Managed", "Application-30d", "Verified 07:32", "Changed Nov 02", "Reconciled Nov 02"],
  ["root", "root", "LNX-SRV-01", "Unix SSH", "UNIX-SAFE", "Unix root", "linux_admin", "Linux platform administration", "", "Managed", "Unix-30d", "Verified 06:54", "Changed Nov 03", "Reconciled Nov 03"],
  ["oracle", "oracle", "DB-ORA-01", "Oracle Database", "DBA-SAFE", "Database account", "dba_user", "Oracle database administration", "Oracle Listener", "Unmanaged", "Oracle-30d", "Not verified", "Never", "Never"],
  ["db_admin", "db_admin", "DB-SQL-01", "SQL Server Account", "DBA-SAFE", "Database account", "dba_user", "SQL database administration", "", "Managed", "SQL-30d", "Verified 06:12", "Changed Nov 08", "Reconciled Nov 08"],
  ["shared_ops", "shared_ops", "WIN-SRV-01", "Windows Local Shared", "EMERGENCY-SAFE", "Shared privileged", "pam_admin", "Emergency operations", "", "Managed", "Emergency-7d", "Verified Nov 11", "Changed Nov 11", "Reconciled Nov 11"],
];

const fullAdmin: SafePermission[] = [...SAFE_PERMISSIONS];

function makeAccount(row: string[], index: number): PamAccount {
  const [name, username, address, platform, safe, type, owner, purpose, dependency, status, policy, lastVerify, lastChange, lastReconcile, failureCause] = row;
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
    ...(failureCause ? { failureCause } : {}),
  };
}

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
          username: name === "DBA-SAFE" ? "dba_user" : name === "UNIX-SAFE" ? "linux_admin" : "windows_admin",
          permissions: ["List accounts", "Use accounts", "Initiate privileged sessions"],
        },
        { username: "auditor", permissions: ["List accounts"] },
      ],
    })),
    accounts: seedAccounts.map(makeAccount),
    audit: [
      { id: "audit-1", time: "08:42:16", actor: "pam_operator", action: "Verify", target: "Administrator · WIN-SRV-01", result: "Success", detail: "Credential verified by CPM" },
      { id: "audit-2", time: "08:31:05", actor: "soc_analyst", action: "Access review", target: "DOMAIN-SAFE", result: "Success", detail: "Quarterly access review opened" },
      { id: "audit-3", time: "08:18:47", actor: "pam_operator", action: "Change", target: "svc_backup · WIN-SRV-02", result: "Warning", detail: "CPM operation failed: account locked" },
      { id: "audit-4", time: "07:56:12", actor: "windows_admin", action: "PSM session", target: "WIN-SRV-01", result: "Success", detail: "RDP session terminated · recording retained" },
    ],
    cpmOperations: [
      { id: "op-1", accountId: "account-3", operation: "Change", result: "Failed", detail: "Account locked on target; check target reachability and reconcile access.", time: "08:18:47" },
    ],
    sessions: [],
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
  return safe.members.some((member) => member.username === username && member.permissions.includes(permission));
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

export function canAccessAccount(state: PamState, safeName: string, username: string, permission: SafePermission): boolean {
  return canSafeMemberPerform(state.safes.find((safe) => safe.name === safeName), username, permission);
}

export function evaluatePermission(state: PamState, safeName: string, username: string, permission: SafePermission): {
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

function auditEvent(actor: string, action: string, target: string, result: PamAuditEvent["result"], detail: string): PamAuditEvent {
  return { id: `audit-${Date.now()}`, time: stamp(), actor, action, target, result, detail };
}

export function addSafe(state: PamState, input: { name: string; description: string; owner: string }): {
  state: PamState;
  error?: string;
} {
  const name = input.name.trim();
  if (!/^[A-Z][A-Z0-9-]{2,29}$/.test(name)) return { state, error: "Use 3–30 uppercase letters, numbers, or hyphens; begin with a letter." };
  if (state.safes.some((safe) => safe.name === name)) return { state, error: "A Safe with that name already exists." };
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
      audit: [auditEvent(input.owner, "Create Safe", name, "Success", "Safe created with owner-only access") , ...state.audit],
    },
  };
}

export function setSafeMember(state: PamState, safeName: string, member: SafeMember | null, actor: string): {
  state: PamState;
  error?: string;
} {
  const target = state.safes.find((safe) => safe.name === safeName);
  if (!target) return { state, error: "Safe not found." };
  if (member) {
    const validation = validateMemberPermissions(member.permissions);
    if (validation) return { state, error: validation };
    if (!LEARNERS.includes(member.username)) return { state, error: "Select a learner in the training directory." };
  }
  const safes = state.safes.map((safe) => {
    if (safe.name !== safeName) return safe;
    const filtered = safe.members.filter((entry) => entry.username !== (member?.username ?? ""));
    if (member) filtered.push(member);
    return { ...safe, members: filtered };
  });
  const audit = auditEvent(actor, member ? "Update Safe member" : "Remove Safe member", `${member?.username ?? "member"} · ${safeName}`, "Success", member ? `Permissions: ${member.permissions.join(", ")}` : "Safe membership removed");
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

export function addAccount(state: PamState, input: NewAccountInput, actor: string): { state: PamState; error?: string } {
  const accountName = input.name.trim();
  if (!accountName || !input.username.trim()) return { state, error: "Account name and username are required." };
  if (!input.address.trim() || !/^[A-Z0-9][A-Z0-9.-]{2,63}$/i.test(input.address.trim())) return { state, error: "Target address must be a valid system name, such as WIN-SRV-01." };
  if (!input.platform || !input.platform.includes("Windows")) return { state, error: "This onboarding scenario requires a supported Windows platform." };
  if (!state.safes.some((safe) => safe.name === input.safe)) return { state, error: "Select an existing Safe." };
  if (state.accounts.some((account) => account.address === input.address && account.username === input.username)) return { state, error: "That username is already onboarded for this target." };
  const account: PamAccount = {
    id: `account-${Date.now()}`,
    name: accountName,
    username: input.username.trim(),
    address: input.address.trim().toUpperCase(),
    platform: input.platform,
    safe: input.safe,
    type: input.type,
    owner: input.owner,
    purpose: input.purpose.trim(),
    dependency: input.dependency.trim(),
    status: "Verify required",
    policy: "Windows-90d",
    lastVerify: "Pending verification",
    lastChange: "Not changed",
    lastReconcile: "Not reconciled",
  };
  return {
    state: {
      ...state,
      accounts: [account, ...state.accounts],
      audit: [auditEvent(actor, "Onboard account", `${account.username} · ${account.address}`, "Success", `Added to ${account.safe} on ${account.platform}`), ...state.audit],
    },
  };
}

export function runCpmOperation(state: PamState, accountId: string, operation: CpmOperation, actor: string): {
  state: PamState;
  error?: string;
} {
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return { state, error: "Account not found." };
  const targetSafe = state.safes.find((safe) => safe.name === account.safe);
  if (!canSafeMemberPerform(targetSafe, actor, "Manage accounts")) {
    const detail = `Denied: ${actor} lacks Manage accounts in ${account.safe}.`;
    const op: PamCpmOperation = { id: `op-${Date.now()}`, accountId, operation, result: "Failed", detail, time: stamp() };
    return { state: { ...state, cpmOperations: [op, ...state.cpmOperations], audit: [auditEvent(actor, `CPM ${operation}`, account.name, "Denied", detail), ...state.audit] }, error: detail };
  }
  let result: PamCpmOperation["result"] = "Completed";
  let detail = `${operation} completed. Credential management state is current.`;
  let status: AccountStatus = account.status === "Unmanaged" ? "Managed" : account.status;
  if (operation === "Change" && account.failureCause) {
    result = "Failed";
    detail = `${account.failureCause} prevents the password change. Inspect target access and reconcile credentials before retrying.`;
    status = "Rotation failed";
  } else if (operation === "Reconcile") {
    detail = "Reconcile account authenticated; managed credential synchronized with the target.";
    status = "Managed";
  } else if (operation === "Verify") {
    detail = "Verify completed: the stored credential authenticated successfully on the target.";
    status = "Managed";
  } else if (operation === "Change") {
    detail = "Change completed: CPM rotated the managed credential and updated the Vault record.";
    status = "Managed";
  }
  const time = stamp();
  const updatedAccount: PamAccount = {
    ...account,
    status,
    lastVerify: operation === "Verify" ? `Verified ${time}` : account.lastVerify,
    lastChange: operation === "Change" && result === "Completed" ? `Changed ${time}` : account.lastChange,
    lastReconcile: operation === "Reconcile" ? `Reconciled ${time}` : account.lastReconcile,
  };
  const op: PamCpmOperation = { id: `op-${Date.now()}`, accountId, operation, result, detail, time };
  return {
    state: {
      ...state,
      accounts: state.accounts.map((item) => item.id === accountId ? updatedAccount : item),
      cpmOperations: [op, ...state.cpmOperations],
      audit: [auditEvent(actor, `CPM ${operation}`, `${account.username} · ${account.address}`, result === "Completed" ? "Success" : "Warning", detail), ...state.audit],
    },
  };
}

export function repairCpmFailure(state: PamState, accountId: string, repair: "unlock" | "reconcile-access" | "target-connectivity", actor: string): {
  state: PamState;
  error?: string;
} {
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return { state, error: "Account not found." };
  if (!canSafeMemberPerform(state.safes.find((safe) => safe.name === account.safe), actor, "Manage accounts")) {
    return { state, error: `${actor} lacks Manage accounts in ${account.safe}.` };
  }
  const repairLabel = repair === "unlock" ? "target account unlocked" : repair === "reconcile-access" ? "reconcile access verified" : "target connectivity restored";
  const updated: PamAccount = { ...account, failureCause: undefined, status: "Managed" };
  return {
    state: {
      ...state,
      accounts: state.accounts.map((item) => item.id === accountId ? updated : item),
      audit: [auditEvent(actor, "Resolve CPM incident", `${account.username} · ${account.address}`, "Success", repairLabel), ...state.audit],
    },
  };
}

export function resetPamState(): PamState {
  return makeInitialPamState();
}

export function launchPsmSession(state: PamState, input: { target: string; account: PamAccount; ticket: string; reason: string }, actor: string): {
  state: PamState;
  error?: string;
} {
  if (!state.psmConnectorHealthy) return { state, error: "PSM connector unavailable. Restore connector health and retry." };
  if (!state.approvalGranted) return { state, error: "Approval required before launching this privileged session." };
  if (!input.ticket.trim() || !/^CHG-\d{4,8}$/.test(input.ticket.trim())) return { state, error: "Enter a change reference in CHG-12345 format." };
  if (input.reason.trim().length < 12) return { state, error: "Provide an operational reason of at least 12 characters." };
  if (!LEARNERS.includes(actor)) return { state, error: "Learner identity is not recognized." };
  if (!canSafeMemberPerform(state.safes.find((safe) => safe.name === input.account.safe), actor, "Initiate privileged sessions")) {
    return { state, error: `${actor} lacks session permission in ${input.account.safe}.` };
  }
  const session: PamSession = {
    id: `session-${Date.now()}`,
    target: input.target,
    account: input.account.username,
    component: "RDP through PSM",
    ticket: input.ticket.trim(),
    reason: input.reason.trim(),
    status: "Active",
    commands: [],
    started: stamp(),
  };
  return { state: { ...state, sessions: [session, ...state.sessions], audit: [auditEvent(actor, "Launch PSM session", `${input.target} · ${input.account.username}`, "Success", `${session.component} · ${session.ticket}`), ...state.audit] } };
}

const TERMINAL_OUTPUT: Record<string, string> = {
  hostname: "WIN-SRV-01",
  whoami: "corp\\administrator",
  ipconfig: "Ethernet adapter CorpNet: 10.24.18.21 · Gateway 10.24.18.1 · DNS 10.24.0.10",
  systeminfo: "OS: Windows Server 2022 Datacenter · Build 20348 · Domain: corp.gfs.local",
  "net user": "Administrator  svc_backup  svc_sql  Guest  WDAGUtilityAccount",
  "get-service": "Status  Name\nRunning  EventLog\nRunning  LanmanServer\nRunning  WinDefend\nStopped  Spooler",
  "get-process": "Handles  NPM(K)  PM(M)  Name\n692  54  128  lsass\n431  32  86  services\n284  19  62  sqlservr",
  help: "Available commands: hostname, whoami, ipconfig, systeminfo, net user, Get-Service, Get-Process, exit",
};

export function simulateTerminalCommand(command: string): { output: string; exit: boolean } {
  const normalized = command.trim().replace(/\s+/g, " ").toLowerCase();
  if (normalized === "exit") return { output: "Session closed by operator.", exit: true };
  if (!normalized) return { output: "", exit: false };
  return { output: TERMINAL_OUTPUT[normalized] ?? `'${command.trim()}' is not available in this controlled training shell. Type help for supported commands.`, exit: false };
}

export function appendSessionCommand(state: PamState, sessionId: string, command: string, actor: string): PamState {
  const result = simulateTerminalCommand(command);
  const sessions = state.sessions.map((session) => session.id === sessionId
    ? { ...session, commands: [...session.commands, `${command.trim()}\n${result.output}`], ...(result.exit ? { status: "Terminated" as const } : {}) }
    : session);
  return { ...state, sessions, audit: [auditEvent(actor, result.exit ? "Terminate PSM session" : "Execute session command", sessionId, "Success", command.trim() || "Empty command"), ...state.audit] };
}

export function completeLab(state: PamState, labId: string, score: number): PamState {
  return {
    ...state,
    completedLabs: state.completedLabs.includes(labId) ? state.completedLabs : [...state.completedLabs, labId],
    scores: { ...state.scores, [labId]: Math.max(state.scores[labId] ?? 0, score) },
  };
}
