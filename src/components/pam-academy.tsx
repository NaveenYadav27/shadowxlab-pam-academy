import { ACADEMY_CLASSES, SHADOWXLAB_CORE_VISION } from "@/lib/academy-curriculum";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookText,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Command,
  Database,
  Eye,
  FileClock,
  Filter,
  Fingerprint,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Menu,
  MonitorPlay,
  Network,
  PanelLeftClose,
  Play,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Search,
  SearchCheck,
  Server,
  Shield,
  SlidersHorizontal,
  Terminal,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import {
  SAFE_PERMISSIONS,
  LEARNERS,
  SUPPORTED_PLATFORMS,
  ALLOWED_TERMINAL_COMMANDS,
  addAccount,
  addSafe,
  appendSessionCommand,
  canSafeMemberPerform,
  completeLab,
  evaluateLabObjectives,
  evaluatePermission,
  launchPsmSession,
  makeInitialPamState,
  permissionDependencies,
  repairCpmFailure,
  resetPamState,
  runCpmOperation,
  setSafeMember,
  type CpmOperation,
  type PamAccount,
  type PamSafe,
  type PamSession,
  type PamState,
  type SafePermission,
  type LabEvaluationResult,
  type LabObjective,
} from "@/lib/pam-engine";
import { toast } from "sonner";

type SectionId =
  | "overview"
  | "academy"
  | "environment"
  | "safes"
  | "accounts"
  | "access"
  | "cpm"
  | "psm"
  | "policies"
  | "discovery"
  | "audit"
  | "troubleshooting"
  | "assessments"
  | "knowledge"
  | "instructor";

const NAV_GROUPS: {
  label: string;
  items: { id: SectionId; title: string; icon: typeof Activity }[];
}[] = [
  {
    label: "WORKSPACE",
    items: [
      { id: "overview", title: "Overview", icon: LayoutDashboard },
      { id: "academy", title: "Learning Academy", icon: BookOpen },
      { id: "environment", title: "PAM Environment", icon: Network },
    ],
  },
  {
    label: "PRIVILEGED ACCESS",
    items: [
      { id: "safes", title: "Safes", icon: Boxes },
      { id: "accounts", title: "Accounts", icon: KeyRound },
      { id: "access", title: "Access Management", icon: UsersRound },
    ],
  },
  {
    label: "SESSION MANAGEMENT",
    items: [{ id: "psm", title: "PSM Operations", icon: MonitorPlay }],
  },
  {
    label: "PASSWORD MANAGEMENT",
    items: [
      { id: "cpm", title: "CPM Operations", icon: Activity },
      { id: "policies", title: "Password Policies", icon: SlidersHorizontal },
    ],
  },
  {
    label: "GOVERNANCE",
    items: [
      { id: "discovery", title: "Discovery", icon: SearchCheck },
      { id: "audit", title: "Audit & Reports", icon: FileClock },
      { id: "assessments", title: "Assessments", icon: ClipboardCheck },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { id: "troubleshooting", title: "Troubleshooting", icon: LifeBuoy },
      { id: "knowledge", title: "Knowledge Base", icon: BookText },
      { id: "instructor", title: "Instructor Console", icon: GraduationCap },
    ],
  },
];

const CLASSES = [
  {
    id: "class-01",
    label: "CLASS 01",
    title: "PAM foundations & administrator role",
    subtitle: "Architecture, credential risk and the enterprise PAM workflow",
    labs: ["Lab 01 · Trace the PAM architecture"],
  },
  {
    id: "class-02",
    label: "CLASS 02",
    title: "Safe administration & access management",
    subtitle: "Safe structure, permission boundaries and least privilege",
    labs: ["Lab 02 · Provision DBA-SAFE access"],
  },
  {
    id: "class-03",
    label: "CLASS 03",
    title: "Privileged account onboarding",
    subtitle: "Platform selection, account properties and onboarding validation",
    labs: ["Lab 03 · Onboard WIN-SRV-01 Administrator"],
  },
  {
    id: "class-04",
    label: "CLASS 04",
    title: "Identity & privileged account security",
    subtitle: "Human and non-human identities, classification and lifecycle",
    labs: ["Lab 04 · Classify the enterprise inventory"],
  },
  {
    id: "class-05",
    label: "CLASS 05",
    title: "CPM operations & password management",
    subtitle: "Verify, change, reconcile and evidence-led incident recovery",
    labs: ["Lab 05A · Rotate a managed credential", "Lab 05B · Recover a failed rotation"],
  },
  {
    id: "class-06",
    label: "CLASS 06",
    title: "PSM operations & session management",
    subtitle: "Approval, credential injection, recording and session audit",
    labs: ["Lab 06A · Launch an approved session", "Lab 06B · Diagnose a PSM launch failure"],
  },
];

const CLASS_TOPICS: Record<string, string[]> = {
  "class-01": [
    "Privileged access risk & lateral movement",
    "Credential lifecycle and accountability",
    "Vault, PVWA, CPM and PSM responsibilities",
    "Authentication versus privileged authentication",
    "Password vaulting, rotation and session brokering",
    "PAM request-to-audit operational flow",
  ],
  "class-02": [
    "Safe ownership, members and boundaries",
    "Permission dependencies and least privilege",
    "Separation of duties and dual control",
    "Windows, Linux, DBA and application Safe design",
    "Access reviews, audit and Safe lifecycle",
    "Permission denials and systematic troubleshooting",
  ],
  "class-03": [
    "Account types: local, domain, SSH, database and service",
    "Ownership, business purpose and dependencies",
    "Platform selection and onboarding properties",
    "Verify before enabling management",
    "Safe inventory and account lifecycle",
    "Address, username, platform and connectivity failures",
  ],
  "class-04": [
    "Human versus non-human identity",
    "Technical custodian and business owner",
    "Shared account attribution and accountability",
    "Risk classification and privilege boundaries",
    "Service dependency and rotation readiness",
    "Discovery through recertification and retirement",
  ],
  "class-05": [
    "CPM architecture and platform plugin responsibilities",
    "Verify: test Vault credential against target",
    "Change: rotate target and update the Vault safely",
    "Reconcile: restore synchronization after divergence",
    "Rotation schedules, complexity and dependencies",
    "Connectivity, privilege, lockout and plugin failure analysis",
    "Operation logs, retry gates and recovery evidence",
  ],
  "class-06": [
    "PSM broker and connection component flow",
    "Credential injection without learner exposure",
    "Approval gates, tickets and session policies",
    "Session recording, monitoring and termination",
    "Authorization, target, connector and network failures",
    "Event timeline and incident evidence",
  ],
};

const COMPONENTS = [
  {
    id: "Administrator",
    x: "8%",
    y: "45%",
    purpose: "Starts an approved privileged workflow from an authenticated operator identity.",
    responsibilities:
      "Request access, specify business justification, select an eligible account and review the resulting audit evidence.",
    inputs: "Authenticated identity, ticket reference, business reason.",
    outputs: "Audited request and attributed administrative intent.",
    dependency: "Identity provider, authorization policy and correct Safe membership.",
    failure:
      "Access denied when membership is missing, ticket is invalid or approval has not been granted.",
    task: "Review the request context before granting the shortest access needed.",
    ticket: "INC-40218 · Request blocked after team transfer",
  },
  {
    id: "PVWA",
    x: "29%",
    y: "20%",
    purpose: "The web access layer for safe, account and session workflows.",
    responsibilities:
      "Applies user-facing authorization, surfaces account inventory and initiates approved CPM or PSM actions.",
    inputs: "Authenticated requests and approved operational intent.",
    outputs: "Vault operations, CPM requests and PSM connection requests.",
    dependency: "Vault availability, identity services and correct permissions.",
    failure: "Login can succeed while a Safe-level operation still returns denied.",
    task: "Separate authentication success from authorization success in the investigation.",
    ticket: "INC-40192 · Vault reachable, Safe access denied",
  },
  {
    id: "Vault",
    x: "50%",
    y: "45%",
    purpose: "Protected storage for privileged credentials, Safes, policy and operational audit.",
    responsibilities:
      "Enforces Safe boundaries, stores account records and provides controlled credential operations.",
    inputs: "PVWA account queries, CPM actions, PSM requests and policy checks.",
    outputs: "Authorized records, controlled credential delivery and audit evidence.",
    dependency: "Healthy authorization policies, storage and trusted component connections.",
    failure:
      "A mis-scoped permission can deny list, retrieval, management or session access independently.",
    task: "Check the affected Safe policy and audit event before changing an account.",
    ticket: "INC-40403 · Account hidden by a Safe membership boundary",
  },
  {
    id: "CPM",
    x: "70%",
    y: "20%",
    purpose: "Manages target credential verification, password changes and reconciliation.",
    responsibilities:
      "Runs platform-specific operations, tracks schedule state and records evidence and failure context.",
    inputs:
      "Managed account properties, target connectivity, platform policy and account permissions.",
    outputs: "Verified, rotated or reconciled credential state and operation logs.",
    dependency:
      "Correct platform, reachable target, valid credential and adequate target account rights.",
    failure: "Lockout, complexity mismatch, target outage, dependency or plugin mismatch.",
    task: "Inspect account details and CPM result before deciding whether to reconcile or retry.",
    ticket: "INC-40511 · Password change failed; service account locked",
  },
  {
    id: "PSM",
    x: "70%",
    y: "70%",
    purpose: "Brokers privileged sessions through an approved connection component.",
    responsibilities:
      "Validates session access, injects credentials, records activity and supports termination.",
    inputs: "Authorized Safe account, target, connection component, approval and ticket.",
    outputs: "Isolated session, timestamped recording and termination event.",
    dependency: "PSM connector health, target connectivity and session authorization.",
    failure: "A missing approval, wrong component or unhealthy connector prevents launch.",
    task: "Inspect the authorization decision and connector status before retrying.",
    ticket: "INC-40602 · RDP connection rejected by connector",
  },
  {
    id: "Target System",
    x: "91%",
    y: "45%",
    purpose:
      "The Windows, Linux, database or application endpoint receiving a controlled operation.",
    responsibilities:
      "Applies its own authentication, password rules, availability and platform behavior.",
    inputs: "A CPM operation or PSM session delivered through an authorized component.",
    outputs: "Target response, resulting account state and activity visible to managed components.",
    dependency: "Network path, target account state, platform support and target-side rights.",
    failure: "Unreachable host, invalid account, lockout or target policy rejection.",
    task: "Distinguish a target failure from a Vault authorization or component failure.",
    ticket: "INC-40684 · Target accepts operator login but rejects managed account",
  },
];

const LIFECYCLE = [
  [
    "Discovery",
    "Identify privileged identities from approved inventory or discovery signals.",
    "Evidence: discovered target, identity, source and timestamp.",
    "Gate: owner unknown or duplicate target record.",
    "Register a named candidate before onboarding.",
  ],
  [
    "Classification",
    "Identify human, service, shared, database or application account type.",
    "Evidence: account type, privilege scope and risk tier.",
    "Gate: type or privilege is unverified.",
    "Select control requirements that match the account function.",
  ],
  [
    "Ownership",
    "Assign technical custodian and business owner for the identity.",
    "Evidence: accountable owner and business purpose.",
    "Gate: ownership gap or stale contact.",
    "Resolve ownership before granting operational access.",
  ],
  [
    "Approval",
    "Obtain risk-appropriate approval for onboarding and access.",
    "Evidence: approver, ticket and scope.",
    "Gate: approval absent or broader than the task.",
    "Use a bounded request with an expiry or review date.",
  ],
  [
    "Onboarding",
    "Create the account record in the correct Safe and platform.",
    "Evidence: target, username, platform, Safe and validation result.",
    "Gate: target unreachable or incorrect platform.",
    "Verify account identity before enabling management.",
  ],
  [
    "Security controls",
    "Apply rotation policy, access boundaries and dependency handling.",
    "Evidence: policy assignment and management health.",
    "Gate: dependency or target permissions are not ready.",
    "Validate control behavior before production-like use.",
  ],
  [
    "Access",
    "Grant only the operations needed for a user's role and task.",
    "Evidence: Safe membership and permission review.",
    "Gate: retrieve/use/manage permissions are conflated.",
    "Separate session use from direct credential retrieval.",
  ],
  [
    "Monitoring",
    "Review operation outcomes, privileged sessions and exceptions.",
    "Evidence: CPM and session events.",
    "Gate: failures are not assigned to an owner.",
    "Investigate failures in component-to-target order.",
  ],
  [
    "Recertification",
    "Reconfirm business need, owner and current Safe membership.",
    "Evidence: reviewer, decision and next review date.",
    "Gate: no reviewer or access not validated.",
    "Remove access that no longer supports a documented need.",
  ],
  [
    "Rotation",
    "Verify and rotate on schedule or after a risk event.",
    "Evidence: successful CPM change and follow-up verification.",
    "Gate: unresolved target state or service dependency.",
    "Reconcile only after understanding the divergence.",
  ],
  [
    "Retirement",
    "Remove access, dependencies and obsolete credential inventory.",
    "Evidence: owner approval and decommission record.",
    "Gate: active workload still depends on the identity.",
    "Confirm no dependency remains before retirement.",
  ],
].map(([name, description, evidence, gate, action]) => ({
  name: name ?? "",
  description: description ?? "",
  evidence: evidence ?? "",
  gate: gate ?? "",
  action: action ?? "",
}));

const TERMINAL_COMMANDS = [
  "help",
  "hostname",
  "whoami",
  "ipconfig",
  "systeminfo",
  "net user",
  "Get-Service",
  "Get-Process",
  "exit",
];

const ASSESSMENT_QUESTIONS = [
  {
    prompt:
      "A user authenticates to PVWA but cannot see a database account. Where do you verify first?",
    options: ["Browser cache", "Safe membership and List accounts permission", "CPM schedule only"],
    answer: 1,
    rationale:
      "Authentication proves identity, not Safe authorization. Start with the account Safe and its membership.",
  },
  {
    prompt:
      "CPM change fails because the target account is locked. Which recovery order is safest?",
    options: [
      "Repeatedly retry change",
      "Inspect details, restore valid target state, reconcile if needed, then retry and verify",
      "Disable recording",
    ],
    answer: 1,
    rationale:
      "Repeated changes can deepen credential divergence. Repair the specific target condition before reconciliation and retry.",
  },
  {
    prompt: "What does PSM add to an approved privileged connection?",
    options: [
      "A copy of the password in the browser",
      "Credential brokering, recording and attributable session events",
      "A permanent admin grant",
    ],
    answer: 1,
    rationale:
      "A controlled session can inject a credential without exposing it and produces reviewable evidence.",
  },
  {
    prompt:
      "Which permission should not be granted automatically when a team only needs mediated sessions?",
    options: ["List accounts", "Initiate privileged sessions", "Retrieve accounts"],
    answer: 2,
    rationale: "Session use through PSM and direct secret retrieval are distinct privileges.",
  },
  {
    prompt: "A PSM RDP request is denied before a session starts. Which checks are relevant?",
    options: [
      "Approval, Safe permission, target, component and connector health",
      "Password length only",
      "The local learner computer's shell",
    ],
    answer: 0,
    rationale:
      "Diagnose the controlled session path across authorization, approval, component, connector and target.",
  },
];

const PRACTICES: Record<string, string> = {
  "Lab 01 · Trace the PAM architecture":
    "Identify each component, then trace three independent flows: onboarding, password rotation and a recorded PSM session. Predict where the first failure appears when target connectivity is lost.",
  "Lab 02 · Provision DBA-SAFE access":
    "Create or inspect DBA-SAFE, confirm dba_user as owner, give the database team list/use/session access, keep direct retrieval withheld, then test both allowed and denied actions.",
  "Lab 03 · Onboard WIN-SRV-01 Administrator":
    "Select Windows Server Local, WIN-SRV-01, WIN-SAFE and windows_admin. Submit the record, verify the target and review the resulting account and audit row.",
  "Lab 04 · Classify the enterprise inventory":
    "Classify each inventory record by identity type, owner, dependency and risk. Flag the failed managed account and the unmanaged database account for remediation.",
  "Lab 05A · Rotate a managed credential":
    "Open Administrator on WIN-SRV-01. Verify the account, run Change, run Verify again and inspect the operation log plus audit evidence.",
  "Lab 05B · Recover a failed rotation":
    "Inspect the svc_backup failure details. Repair its account lockout, reconcile to restore Vault/target alignment, retry Change, verify, then close with evidence.",
  "Lab 06A · Launch an approved session":
    "Choose WIN-SRV-01 and Administrator. Request approval, provide a change ticket and reason, launch the session, run safe inspection commands, review events and terminate.",
  "Lab 06B · Diagnose a PSM launch failure":
    "Inspect session authorization, the RDP component and connector health. Restore the failing control and retry only after the approval and permission checks pass.",
};

const EMPTY_ACCOUNT: PamAccount = {
  id: "",
  name: "",
  username: "",
  address: "",
  platform: "Windows Server Local",
  safe: "WIN-SAFE",
  type: "Human administrator",
  owner: "windows_admin",
  purpose: "",
  dependency: "",
  status: "Unmanaged",
  policy: "Windows-90d",
  lastVerify: "Not verified",
  lastChange: "Never",
  lastReconcile: "Never",
};

export const PVWA_NAV_ITEMS: { id: SectionId; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "accounts", label: "Accounts", icon: KeyRound },
  { id: "safes", label: "Safes", icon: Boxes },
  { id: "cpm", label: "CPM Operations", icon: Activity },
  { id: "psm", label: "PSM Operations", icon: MonitorPlay },
  { id: "policies", label: "Policies", icon: SlidersHorizontal },
  { id: "access", label: "Administration", icon: UsersRound },
  { id: "audit", label: "Reports & Audit", icon: FileClock },
  { id: "discovery", label: "Discovery", icon: SearchCheck },
  { id: "academy", label: "Learning Academy", icon: GraduationCap },
  { id: "troubleshooting", label: "Troubleshooting", icon: LifeBuoy },
];

function titleFor(section: SectionId): string {
  return (
    NAV_GROUPS.flatMap((group) => group.items).find((item) => item.id === section)?.title ??
    "Overview"
  );
}

function breadcrumbFor(section: SectionId): { group: string; title: string } {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.id === section);
    if (item) {
      return { group: group.label, title: item.title };
    }
  }
  return { group: "WORKSPACE", title: titleFor(section) };
}
function initials(email: string): string {
  return (email.split("@")[0] ?? "learner").slice(0, 2).toUpperCase();
}
function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "good" | "warn" | "bad" | "blue" | "neutral";
}) {
  return (
    <span className={`status status-${tone}`}>
      <i />
      {children}
    </span>
  );
}
function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="subheading">{description}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}
function Metric({
  label,
  value,
  note,
  icon: Icon,
  accent = "cyan",
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Activity;
  accent?: string;
}) {
  return (
    <div className="metric-row">
      <span className={`metric-icon metric-${accent}`}>
        <Icon size={17} />
      </span>
      <div className="metric-copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}
function Panel({
  title,
  note,
  action,
  children,
  className,
}: {
  title?: string;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("panel", className)}>
      {(title || note || action) && (
        <div className="panel-head">
          <div>
            {title && <h2>{title}</h2>}
            {note && <p>{note}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
function EmptyState({
  title,
  detail,
  icon: Icon = Search,
}: {
  title: string;
  detail: string;
  icon?: typeof Activity;
}) {
  return (
    <div className="empty-state">
      <Icon size={21} />
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

export const IS_PAM_DEMO_MODE: boolean =
  import.meta.env["VITE_PAM_DEMO_MODE"] === "true" ||
  (typeof window !== "undefined" && window.localStorage.getItem("pam_demo_mode") === "true");

export const DEMO_LEARNER_USER = {
  id: "demo-learner-session-uuid",
  email: "demo.learner@shadowxlab.internal",
  name: "Demo Operator",
  role: "PAM Security Engineer (Demo)",
} as const;

const DEMO_STORAGE_KEY = "shadowxlab_pam_demo_state";

export const demoStorageAdapter = {
  load(): PamState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        Array.isArray(parsed.safes) &&
        Array.isArray(parsed.accounts)
      ) {
        return parsed as PamState;
      }
    } catch {
      // Ignore corrupted local state and return null
    }
    return null;
  },
  save(state: PamState): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write errors
    }
  },
  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      // Ignore clear errors
    }
  },
};

const VALID_SECTIONS: SectionId[] = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => item.id),
);

function getInitialSection(): SectionId {
  if (typeof window === "undefined") return "accounts";
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("section") as SectionId;
    if (fromQuery && VALID_SECTIONS.includes(fromQuery)) return fromQuery;
    const fromHash = window.location.hash.replace("#", "") as SectionId;
    if (fromHash && VALID_SECTIONS.includes(fromHash)) return fromHash;
  } catch {
    // Ignore URL parse error in non-browser environments
  }
  return "accounts";
}

export function PamAcademy() {
  const [sessionUser, setSessionUser] = useState<{ id: string; email: string } | null>(() =>
    IS_PAM_DEMO_MODE ? { id: DEMO_LEARNER_USER.id, email: DEMO_LEARNER_USER.email } : null,
  );
  const [authReady, setAuthReady] = useState(IS_PAM_DEMO_MODE);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [active, setActiveState] = useState<SectionId>(getInitialSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const setActive = (section: SectionId, push = true) => {
    setActiveState(section);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined" && push) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("section", section);
        window.history.pushState({ section }, "", url.toString());
      } catch {
        // Ignore pushState failure
      }
    }
  };

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (event.state?.section && VALID_SECTIONS.includes(event.state.section)) {
        setActiveState(event.state.section);
      } else {
        setActiveState(getInitialSection());
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const [learner, setLearner] = useState("pam_admin");
  const [state, setState] = useState<PamState>(() => makeInitialPamState());
  const [stateLoaded, setStateLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSafe, setSelectedSafe] = useState("DBA-SAFE");
  const [selectedAccount, setSelectedAccount] = useState("account-1");
  const [selectedMember, setSelectedMember] = useState("dba_user");
  const [memberPermissions, setMemberPermissions] = useState<SafePermission[]>([
    "List accounts",
    "Use accounts",
    "Initiate privileged sessions",
  ]);
  const [accessResult, setAccessResult] = useState<{ allowed: boolean; message: string } | null>(
    null,
  );
  const [newSafe, setNewSafe] = useState({ name: "", description: "", owner: "dba_user" });
  const [accountDraft, setAccountDraft] = useState({ ...EMPTY_ACCOUNT });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState("class-01");
  const [selectedComponent, setSelectedComponent] = useState("Vault");
  const [lifecycleIndex, setLifecycleIndex] = useState(0);
  const [labId, setLabId] = useState(CLASSES[0]?.labs[0] ?? "");
  const [labFeedback, setLabFeedback] = useState("");
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, number>>({});
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    correct: number;
  } | null>(null);
  const [terminalCommand, setTerminalCommand] = useState("");
  const [authIssue, setAuthIssue] = useState("");
  const [showLearnerPicker, setShowLearnerPicker] = useState(false);
  const terminalEnd = useRef<HTMLDivElement>(null);
  const activeSession = state.sessions.find((item) => item.status === "Active");

  useEffect(() => {
    if (IS_PAM_DEMO_MODE) {
      // Demo Mode: Rehydrate state from localStorage or initialize baseline
      const cached = demoStorageAdapter.load();
      if (cached) {
        setState(cached);
      } else {
        setState(makeInitialPamState());
      }
      setSessionUser({ id: DEMO_LEARNER_USER.id, email: DEMO_LEARNER_USER.email });
      setAuthReady(true);
      setStateLoaded(true);
      return;
    }

    let alive = true;
    const loadForUser = async (userId: string) => {
      setStateLoaded(false);
      setState(makeInitialPamState());
      const { data, error } = await supabase
        .from("pam_training_state")
        .select("state")
        .eq("user_id", userId)
        .maybeSingle();
      if (!alive) return;
      if (error) {
        setAuthIssue(
          "Your sign-in is active, but training progress could not be loaded. Please refresh and try again.",
        );
        setState(makeInitialPamState());
      } else if (data?.state && typeof data.state === "object" && !Array.isArray(data.state)) {
        setState(data.state as unknown as PamState);
      }
      setStateLoaded(true);
    };
    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const user = data.session?.user;
      setSessionUser(user?.email ? { id: user.id, email: user.email } : null);
      setAuthReady(true);
      if (user?.id) void loadForUser(user.id);
      else setStateLoaded(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!alive) return;
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        const user = nextSession?.user;
        if (user?.email) {
          setSessionUser({ id: user.id, email: user.email });
          setAuthIssue("");
          void loadForUser(user.id);
        }
      }
      if (event === "SIGNED_OUT") {
        setSessionUser(null);
        setState(makeInitialPamState());
        setStateLoaded(false);
      }
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!stateLoaded) return;

    if (IS_PAM_DEMO_MODE) {
      setSaving(true);
      const timeout = window.setTimeout(() => {
        demoStorageAdapter.save(state);
        setSaving(false);
      }, 300);
      return () => window.clearTimeout(timeout);
    }

    if (!sessionUser?.id) return;
    setSaving(true);
    const timeout = window.setTimeout(() => {
      void supabase
        .from("pam_training_state")
        .upsert(
          {
            user_id: sessionUser.id,
            state: state as unknown as import("@/integrations/supabase/types").Json,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
        .then(({ error }) => {
          setSaving(false);
          if (error) {
            setAuthIssue(
              "Your recent changes could not be saved. Check your connection and retry.",
            );
          } else setAuthIssue("");
        });
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [state, sessionUser, stateLoaded]);

  useEffect(() => {
    terminalEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.sessions]);

  const completionCount = state.completedLabs.length;
  const percent = Math.round((completionCount / 8) * 100);
  const managedCount = state.accounts.filter((account) => account.status === "Managed").length;
  const failedCount = state.accounts.filter(
    (account) => account.status === "Rotation failed",
  ).length;
  const filteredAccounts = useMemo(
    () =>
      state.accounts.filter((account) => {
        const query = search.toLowerCase().trim();
        const matchesQuery =
          !query ||
          [account.name, account.username, account.address, account.safe, account.owner].some(
            (value) => value.toLowerCase().includes(query),
          );
        return matchesQuery && (statusFilter === "all" || account.status === statusFilter);
      }),
    [state.accounts, search, statusFilter],
  );
  const currentSafe = state.safes.find((safe) => safe.name === selectedSafe);
  const selectedCpmAccount =
    state.accounts.find((account) => account.id === selectedAccount) ?? state.accounts[0];
  const selectedCpmOperations = state.cpmOperations.filter(
    (operation) => operation.accountId === selectedCpmAccount?.id,
  );
  const activeClass = CLASSES.find((item) => item.id === selectedClass) ?? CLASSES[0];
  const currentComponent =
    COMPONENTS.find((item) => item.id === selectedComponent) ?? COMPONENTS[2];
  const userDisplay = IS_PAM_DEMO_MODE
    ? "demo.learner"
    : (sessionUser?.email.split("@")[0] ?? "learner");

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");
    setAuthIssue("");
    const result =
      authMode === "signup"
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: window.location.origin },
          })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthBusy(false);
    if (result.error) {
      setAuthIssue(result.error.message);
    } else if (authMode === "signup" && !result.data.session) {
      setAuthMessage(
        "Check your email to confirm your account. Your saved training workspace will be ready after confirmation.",
      );
    } else {
      setAuthMessage(
        authMode === "signup"
          ? "Account created. Loading your training workspace…"
          : "Signed in. Loading your training workspace…",
      );
    }
  }

  async function handleSocialAuth(provider: "google" | "lovable") {
    if (IS_PAM_DEMO_MODE) {
      toast.info("Authentication bypass active: Google/Lovable OAuth is disabled in Demo Mode.");
      return;
    }
    setAuthIssue("");
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) setAuthIssue(result.error.message);
  }

  async function handleSignOut() {
    if (IS_PAM_DEMO_MODE) {
      demoStorageAdapter.clear();
      setState(makeInitialPamState());
      setActive("overview");
      setAuthMessage("");
      toast.info("Demo session reset to baseline initial state.");
      return;
    }
    await supabase.auth.signOut();
    setActive("overview");
    setAuthMessage("");
  }

  function updateState(next: PamState) {
    setState(next);
  }

  function handleCreateSafe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = addSafe(state, newSafe);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.state !== state) {
      updateState(result.state);
      setSelectedSafe(newSafe.name.trim());
      setNewSafe({ name: "", description: "", owner: "dba_user" });
      toast.success("Safe created and recorded in the audit trail.");
    }
  }

  function handleSaveMember() {
    const result = setSafeMember(
      state,
      selectedSafe,
      { username: selectedMember, permissions: memberPermissions },
      learner,
    );
    if (result.error) {
      setAccessResult({ allowed: false, message: result.error });
      toast.error(result.error);
      return;
    }
    updateState(result.state);
    setAccessResult({
      allowed: true,
      message: `${selectedMember} access updated for ${selectedSafe}.`,
    });
    toast.success("Safe membership updated.");
  }

  function handleAccountAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = addAccount(state, accountDraft, learner);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    updateState(result.state);
    setSelectedAccount(result.state.accounts[0]?.id ?? "");
    setAccountDraft({ ...EMPTY_ACCOUNT });
    toast.success("Account onboarded. It is now visible in Safes, CPM and reports.");
  }

  function handleCpm(operation: CpmOperation) {
    if (!selectedCpmAccount) return;
    const result = runCpmOperation(state, selectedCpmAccount.id, operation, learner);
    updateState(result.state);
    if (result.error) toast.error(result.error);
    else {
      const latest = result.state.cpmOperations[0];
      if (latest?.result === "Failed") toast.error(latest.detail);
      else toast.success(`${operation} completed for ${selectedCpmAccount.username}.`);
    }
  }

  function handleRepair(repair: "unlock" | "reconcile-access" | "target-connectivity") {
    if (!selectedCpmAccount) return;
    const result = repairCpmFailure(state, selectedCpmAccount.id, repair, learner);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    updateState(result.state);
    toast.success("CPM incident action recorded. Review the audit evidence and retry.");
  }

  function handlePsmLaunch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target =
      (event.currentTarget.elements.namedItem("psm-target") as HTMLInputElement | null)?.value ??
      "WIN-SRV-01";
    const ticket =
      (event.currentTarget.elements.namedItem("psm-ticket") as HTMLInputElement | null)?.value ??
      "";
    const reason =
      (event.currentTarget.elements.namedItem("psm-reason") as HTMLTextAreaElement | null)?.value ??
      "";
    const account = state.accounts.find(
      (item) => item.name === "Administrator" && item.address === target,
    );
    if (!account) {
      toast.error("No managed Administrator account is available on that target.");
      return;
    }
    const result = launchPsmSession(state, { target, account, ticket, reason }, learner);
    if (result.error) {
      toast.error(result.error);
      setLabFeedback(result.error);
      return;
    }
    updateState(result.state);
    toast.success("PSM session launched. Commands run only in this training simulation.");
    setLabFeedback(
      "Session started. Use the controlled command list, review the event timeline and terminate when finished.",
    );
  }

  function toggleApproval() {
    const approved = !state.approvalGranted;
    updateState({
      ...state,
      approvalGranted: approved,
      audit: [
        {
          id: `audit-${Date.now()}`,
          time: new Date().toLocaleTimeString("en-US", { hour12: false }),
          actor: learner,
          action: approved ? "Approve session request" : "Withdraw session approval",
          target: "WIN-SRV-01 · Administrator",
          result: approved ? "Success" : "Warning",
          detail: approved
            ? "Training approval granted for current PSM scenario"
            : "Training approval withdrawn",
        },
        ...state.audit,
      ],
    });
  }

  function executeTerminalCommand(cmdToRun: string) {
    if (!activeSession) {
      toast.error("An active PSM session is required to run commands.");
      return;
    }
    const clean = cmdToRun.trim();
    if (!clean) return;
    const nextState = appendSessionCommand(state, activeSession.id, clean, learner);
    updateState(nextState);
    setTerminalCommand("");
  }

  function runTerminal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    executeTerminalCommand(terminalCommand);
  }

  function closeSession() {
    executeTerminalCommand("exit");
    toast.success("Session terminated. Recording events remain in the audit trail.");
  }

  function markLabComplete(score = 100) {
    updateState(completeLab(state, labId, score));
    setLabFeedback(
      `Lab evidence saved. Score: ${score}/100. The workspace audit trail reflects your actions.`,
    );
    toast.success("Lab completion saved to your learner record.");
  }

  function resetLab() {
    updateState(resetPamState());
    setLabFeedback(
      "Training environment reset to the enterprise starting state. Saved lab completion and operation evidence have been cleared.",
    );
    setAccessResult(null);
    setAssessmentResult(null);
    toast.success("Simulation state reset.");
  }

  function renderAuthGate() {
    return (
      <div className="auth-screen">
        <div className="auth-brand">
          <span className="brand-mark">
            <Shield size={22} />
          </span>
          <div>
            <strong>SHADOWXLAB</strong>
            <span>PAM ADMINISTRATOR ACADEMY</span>
          </div>
        </div>
        <div className="auth-layout">
          <div className="auth-intro">
            <div className="live-pill">
              <span /> TRAINING ENVIRONMENT · ONLINE
            </div>
            <p className="eyebrow">PRIVILEGED ACCESS MANAGEMENT</p>
            <h1>
              Operate the <em>control plane.</em>
            </h1>
            <p className="auth-lead">
              A hands-on administrator academy built around the workflows that protect enterprise
              credentials and privileged sessions.
            </p>
            <div className="auth-facts">
              <div>
                <span>06</span>
                <small>in-depth classes</small>
              </div>
              <div>
                <span>08</span>
                <small>operational labs</small>
              </div>
              <div>
                <span>01</span>
                <small>shared simulation</small>
              </div>
            </div>
            <div className="auth-assurance">
              <LockKeyhole size={16} />
              <span>
                Progress is saved privately to your learner account. Every PAM operation is
                simulated.
              </span>
            </div>
          </div>
          <div className="auth-form-panel">
            <p className="eyebrow">LEARNER ACCESS</p>
            <h2>{authMode === "signin" ? "Sign in to continue" : "Create learner access"}</h2>
            <p className="muted-copy">
              Use your account to save and resume your training environment.
            </p>
            <div className="auth-switch">
              <Button
                type="button"
                size="sm"
                variant={authMode === "signin" ? "default" : "ghost"}
                onClick={() => {
                  setAuthMode("signin");
                  setAuthIssue("");
                  setAuthMessage("");
                }}
              >
                Sign in
              </Button>
              <Button
                type="button"
                size="sm"
                variant={authMode === "signup" ? "default" : "ghost"}
                onClick={() => {
                  setAuthMode("signup");
                  setAuthIssue("");
                  setAuthMessage("");
                }}
              >
                Create account
              </Button>
            </div>
            <form className="auth-fields" onSubmit={handleEmailAuth}>
              <div className="field">
                <Label htmlFor="auth-email">Email address</Label>
                <Input
                  id="auth-email"
                  autoComplete="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div className="field">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                  type="password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <Button type="submit" disabled={authBusy || !authReady} className="auth-submit">
                {authBusy ? "Please wait…" : authMode === "signin" ? "Sign in" : "Create account"}
                <ArrowRight size={16} />
              </Button>
            </form>
            <div className="auth-divider">
              <span>OR CONTINUE WITH</span>
            </div>
            <div className="social-buttons">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSocialAuth("google")}
                className="social-button"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSocialAuth("lovable")}
                className="social-button lovable-button"
              >
                <Command size={17} />
                Continue with Lovable
              </Button>
            </div>
            {authMessage && (
              <p className="auth-success">
                <CheckCircle2 size={16} />
                {authMessage}
              </p>
            )}
            {authIssue && (
              <p className="auth-error">
                <AlertTriangle size={16} />
                {authIssue}
              </p>
            )}
            <p className="terms-note">
              By continuing, you agree to use this environment for training only. Never enter real
              production credentials.
            </p>
          </div>
        </div>
        <div className="auth-footer">
          <span>SHADOWXLAB · PAM OPERATIONS ACADEMY</span>
          <span>GLOBAL FINANCIAL SERVICES · CORP-PAM-LAB</span>
        </div>
      </div>
    );
  }

  function renderWorkspace() {
    if (active === "overview")
      return (
        <OverviewView
          state={state}
          percent={percent}
          completionCount={completionCount}
          managedCount={managedCount}
          failedCount={failedCount}
          setActive={setActive}
          setLabId={setLabId}
        />
      );
    if (active === "academy")
      return (
        <AcademyView
          classes={CLASSES}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          activeClass={activeClass}
          state={state}
          selectedLabId={labId}
          setSelectedLabId={setLabId}
          markLabComplete={markLabComplete}
          resetLab={resetLab}
          labFeedback={labFeedback}
          setActive={setActive}
        />
      );
    if (active === "environment")
      return (
        <EnvironmentView
          selectedComponent={selectedComponent}
          setSelectedComponent={setSelectedComponent}
          currentComponent={currentComponent}
        />
      );
    if (active === "safes")
      return (
        <SafesView
          state={state}
          selectedSafe={selectedSafe}
          setSelectedSafe={setSelectedSafe}
          currentSafe={currentSafe}
          newSafe={newSafe}
          setNewSafe={setNewSafe}
          onCreateSafe={handleCreateSafe}
          learner={learner}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          memberPermissions={memberPermissions}
          setMemberPermissions={setMemberPermissions}
          onSaveMember={handleSaveMember}
          accessResult={accessResult}
          setAccessResult={setAccessResult}
          updateState={updateState}
          setActive={setActive}
          setSelectedAccount={setSelectedAccount}
        />
      );
    if (active === "accounts")
      return (
        <AccountsView
          state={state}
          filteredAccounts={filteredAccounts}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          draft={accountDraft}
          setDraft={setAccountDraft}
          onAdd={handleAccountAdd}
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          learner={learner}
          onCpmOperation={handleCpm}
          onRepairCpm={handleRepair}
          onConnectPsm={(account) => {
            setSelectedAccount(account.id);
            setActive("psm");
            toast.info(`Configured PSM target for ${account.username} on ${account.address}`);
          }}
          setActive={setActive}
        />
      );
    if (active === "access")
      return (
        <AccessView
          state={state}
          selectedSafe={selectedSafe}
          setSelectedSafe={setSelectedSafe}
          learner={learner}
          accessResult={accessResult}
          setAccessResult={setAccessResult}
        />
      );
    if (active === "cpm")
      return (
        <CpmView
          state={state}
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          selectedCpmAccount={selectedCpmAccount}
          operations={selectedCpmOperations}
          onRun={handleCpm}
          onRepair={handleRepair}
        />
      );
    if (active === "psm")
      return (
        <PsmView
          state={state}
          onLaunch={handlePsmLaunch}
          onApproval={toggleApproval}
          onClose={closeSession}
          onCommand={runTerminal}
          onExecuteCommand={executeTerminalCommand}
          session={activeSession}
          command={terminalCommand}
          setCommand={setTerminalCommand}
          terminalEnd={terminalEnd}
        />
      );
    if (active === "policies") return <PoliciesView state={state} />;
    if (active === "discovery")
      return (
        <DiscoveryView
          state={state}
          onOnboard={() => {
            setActive("accounts");
            toast.message(
              "Choose a discovered identity to onboard it into the shared account inventory.",
            );
          }}
        />
      );
    if (active === "audit")
      return <AuditView state={state} search={search} setSearch={setSearch} />;
    if (active === "troubleshooting")
      return (
        <TroubleshootingView
          state={state}
          setActive={setActive}
          setSelectedAccount={setSelectedAccount}
        />
      );
    if (active === "assessments")
      return (
        <AssessmentView
          answers={assessmentAnswers}
          setAnswers={setAssessmentAnswers}
          result={assessmentResult}
          setResult={setAssessmentResult}
          markLabComplete={markLabComplete}
        />
      );
    if (active === "knowledge")
      return <KnowledgeView setActive={setActive} setSelectedClass={setSelectedClass} />;
    return (
      <InstructorView
        state={state}
        learner={learner}
        setLearner={setLearner}
        setActive={setActive}
        resetLab={resetLab}
      />
    );
  }

  if (!authReady)
    return (
      <div className="auth-loading">
        <span className="brand-mark">
          <Shield size={22} />
        </span>
        <span>SECURING TRAINING WORKSPACE</span>
      </div>
    );
  if (!sessionUser) return renderAuthGate();
  return (
    <div className="pvwa-app">
      {/* CLASSIC PVWA TOP HEADER (44px) */}
      <header className="pvwa-top-header">
        <div className="pvwa-brand">
          <Shield size={16} color="#00A8E8" />
          <span className="pvwa-brand-title">SHADOWXLAB PAM ACADEMY</span>
          <span className="pvwa-brand-sub">PVWA CLASSIC v12.6</span>
        </div>
        <div className="pvwa-top-stats">
          <span className="pvwa-vault-pill">
            <span className="pvwa-vault-dot" />
            VAULT: CORP-PAM-VAULT01 (ONLINE)
          </span>
          <span className="pvwa-vault-pill">CPM: ACTIVE</span>
          <span className="pvwa-vault-pill">PSM: CONNECTED</span>
        </div>
        <div className="pvwa-top-user">
          {IS_PAM_DEMO_MODE && (
            <span className="pvwa-demo-badge">
              <span className="pvwa-demo-pulse" />
              DEMO MODE
            </span>
          )}
          <span className="pvwa-user-id">{userDisplay}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="pvwa-btn-sm"
            onClick={() => void handleSignOut()}
            title={IS_PAM_DEMO_MODE ? "Reset demo session" : "Sign out"}
          >
            <LogOut size={13} style={{ marginRight: 4 }} />
            {IS_PAM_DEMO_MODE ? "Reset" : "Sign out"}
          </Button>
        </div>
      </header>

      {/* CLASSIC PVWA HORIZONTAL NAVIGATION BAR (38px) */}
      <nav className="pvwa-nav-bar" aria-label="PVWA Primary Navigation">
        {PVWA_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={cx("pvwa-nav-tab", isActive && "active")}
              onClick={() => setActive(item.id)}
            >
              <Icon size={14} />
              <span>{item.label}</span>
              {item.id === "cpm" && failedCount > 0 && (
                <span className="pvwa-tab-alert">{failedCount}</span>
              )}
              {item.id === "academy" && completionCount > 0 && (
                <span className="pvwa-tab-count">{completionCount}/8</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* CLASSIC PVWA SUBNAV / BREADCRUMB STRIP (34px) */}
      <div className="pvwa-subnav-bar">
        <div className="pvwa-breadcrumbs">
          <span>PAM Administration</span>
          <span className="pvwa-breadcrumb-sep">&gt;</span>
          <span>{breadcrumbFor(active).group}</span>
          <span className="pvwa-breadcrumb-sep">&gt;</span>
          <span className="pvwa-breadcrumb-current">{breadcrumbFor(active).title}</span>
        </div>
        <div className="pvwa-subnav-actions">
          <span className="pvwa-subnav-info">
            Vault Engine: 10 Accounts · {state.safes.length} Safes · {state.sessions.length}{" "}
            Recorded Sessions
          </span>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
            onClick={() => {
              updateState(resetPamState());
              toast.success("Simulator reset to baseline");
            }}
            title="Reset simulation data to default training baseline"
          >
            Reset Simulator
          </button>
        </div>
      </div>

      {/* PVWA MAIN CONTENT AREA */}
      <main className="pvwa-main-content">
        {authIssue && (
          <div className="inline-warning" style={{ margin: "12px 16px 0 16px" }}>
            <AlertTriangle size={16} />
            <span>{authIssue}</span>
            <Button size="sm" variant="ghost" onClick={() => setAuthIssue("")}>
              Dismiss
            </Button>
          </div>
        )}
        <div style={{ padding: 16 }}>{renderWorkspace()}</div>
        <footer className="app-footer">
          <span>SHADOWXLAB PAM ADMINISTRATOR ACADEMY</span>
          <span>SIMULATED ENVIRONMENT · NO PRODUCTION ACCESS</span>
        </footer>
      </main>
    </div>
  );
}

function OverviewView({
  state,
  percent,
  completionCount,
  managedCount,
  failedCount,
  setActive,
  setLabId,
}: {
  state: PamState;
  percent: number;
  completionCount: number;
  managedCount: number;
  failedCount: number;
  setActive: (section: SectionId) => void;
  setLabId: (labId: string) => void;
}) {
  const outstanding = state.accounts.filter(
    (account) =>
      account.status === "Verify required" ||
      account.status === "Rotation failed" ||
      account.status === "Unmanaged",
  );
  const nextLab =
    CLASSES.flatMap((course) => course.labs).find((lab) => !state.completedLabs.includes(lab)) ??
    CLASSES[0]?.labs[0] ??
    "";
  return (
    <>
      <SectionHeading
        eyebrow="ENTERPRISE SECURITY TRAINING"
        title="Operations overview"
        description="GLOBAL FINANCIAL SERVICES · Enterprise privileged access simulation"
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => setActive("audit")}>
              <FileClock size={15} />
              View audit
            </Button>
            <Button
              type="button"
              onClick={() => {
                setActive("academy");
              }}
            >
              {completionCount ? "Resume academy" : "Start learning"}
              <ArrowRight size={15} />
            </Button>
          </>
        }
      />
      <div className="overview-banner">
        <div className="banner-icon">
          <Shield size={25} />
        </div>
        <div className="banner-copy">
          <p>ENTERPRISE SECURITY OPERATIONS · CORP-PAM-LAB</p>
          <h2>Privileged access, under control.</h2>
          <span>
            GLOBAL FINANCIAL SERVICES <b>·</b> corp.gfs.local <b>·</b> 9 connected targets
          </span>
        </div>
        <div className="banner-status">
          <span>
            <i />
            SIMULATION ACTIVE
          </span>
          <small>TRAINING ONLY · NO LIVE SYSTEMS</small>
        </div>
        <div className="banner-grid" />
      </div>
      <div className="metrics-strip">
        <Metric
          label="Managed accounts"
          value={managedCount}
          note={`${state.accounts.length} in inventory`}
          icon={KeyRound}
        />
        <Metric
          label="Rotation exceptions"
          value={failedCount}
          note={failedCount ? "Requires investigation" : "No open failures"}
          icon={AlertTriangle}
          accent={failedCount ? "amber" : "green"}
        />
        <Metric
          label="Active sessions"
          value={state.sessions.filter((session) => session.status === "Active").length}
          note={`${state.sessions.length} recorded sessions`}
          icon={MonitorPlay}
          accent="blue"
        />
        <Metric
          label="Academy progress"
          value={`${completionCount}/8`}
          note={`${percent}% completion`}
          icon={GraduationCap}
          accent="green"
        />
      </div>
      <div className="overview-grid">
        <Panel className="learning-panel">
          <div className="learning-heading">
            <div>
              <p className="eyebrow">YOUR NEXT MISSION</p>
              <h2>{nextLab}</h2>
              <p>
                Practice the same sequence an administrator follows during a controlled enterprise
                operation.
              </p>
            </div>
            <div
              className="radial-progress"
              style={{ "--progress": `${percent}%` } as React.CSSProperties}
            >
              <strong>
                {percent}
                <small>%</small>
              </strong>
              <span>COMPLETE</span>
            </div>
          </div>
          <div className="learning-footer">
            <span>
              <BookOpen size={15} /> Six classes · eight operational labs
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setLabId(nextLab);
                setActive("academy");
              }}
            >
              Open next lab
              <ArrowRight size={14} />
            </Button>
          </div>
        </Panel>
        <Panel title="Platform health" note="Simulated services · current lab state">
          <div className="health-list">
            {[
              { name: "Digital Vault", detail: "Credential services", latency: "18 ms" },
              { name: "Web Access (PVWA)", detail: "Operator portal", latency: "42 ms" },
              {
                name: "Password Manager (CPM)",
                detail: failedCount ? `${failedCount} account exception` : "Rotation queue healthy",
                latency: "3 jobs",
              },
              { name: "Session Manager (PSM)", detail: "Recording enabled", latency: "1 node" },
            ].map((service) => (
              <div className="health-row" key={service.name}>
                <span className="health-check">
                  <Check size={12} />
                </span>
                <div>
                  <strong>{service.name}</strong>
                  <small>{service.detail}</small>
                </div>
                <span className="health-time">{service.latency}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="overview-lower">
        <Panel
          title="Attention required"
          note="Account operations that need review"
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActive("troubleshooting")}
            >
              Open queue
              <ArrowRight size={14} />
            </Button>
          }
        >
          <div className="attention-list">
            {outstanding.slice(0, 4).map((account) => (
              <div className="attention-row" key={account.id}>
                <span
                  className={
                    account.status === "Rotation failed"
                      ? "attention-icon critical"
                      : "attention-icon"
                  }
                >
                  {account.status === "Rotation failed" ? (
                    <AlertTriangle size={15} />
                  ) : (
                    <Clock3 size={15} />
                  )}
                </span>
                <div>
                  <strong>{account.username}</strong>
                  <small>
                    {account.address} ·{" "}
                    {account.status === "Rotation failed" ? account.failureCause : account.status}
                  </small>
                </div>
                <Badge
                  variant="outline"
                  className={
                    account.status === "Rotation failed" ? "badge-danger" : "badge-warning"
                  }
                >
                  {account.status === "Rotation failed"
                    ? "FAILED"
                    : account.status === "Unmanaged"
                      ? "UNMANAGED"
                      : "VERIFY"}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Inspect ${account.username}`}
                  onClick={() => setActive("cpm")}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            ))}
            {outstanding.length === 0 && (
              <EmptyState
                title="No account exceptions"
                detail="All inventory is in a healthy state."
                icon={CheckCircle2}
              />
            )}
          </div>
        </Panel>
        <Panel
          title="Recent audit activity"
          note="Latest simulated control-plane events"
          action={
            <Button type="button" variant="ghost" size="sm" onClick={() => setActive("audit")}>
              View all
              <ArrowRight size={14} />
            </Button>
          }
        >
          <div className="compact-audit">
            {state.audit.slice(0, 4).map((event) => (
              <div className="compact-audit-row" key={event.id}>
                <span className={`audit-marker audit-${event.result.toLowerCase()}`} />
                <div>
                  <strong>{event.action}</strong>
                  <small>
                    {event.actor} · {event.target}
                  </small>
                </div>
                <span>{event.time}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <QuickActions setActive={setActive} />
    </>
  );
}

function QuickActions({ setActive }: { setActive: (section: SectionId) => void }) {
  const items: { section: SectionId; title: string; copy: string; icon: typeof Activity }[] = [
    { section: "safes", title: "Review Safe access", copy: "Members & permissions", icon: Boxes },
    {
      section: "accounts",
      title: "Onboard an account",
      copy: "Inventory & platform",
      icon: KeyRound,
    },
    {
      section: "cpm",
      title: "Run a CPM operation",
      copy: "Verify · change · reconcile",
      icon: Activity,
    },
    { section: "psm", title: "Launch a session", copy: "Approval · recording", icon: MonitorPlay },
  ];
  return (
    <div className="quick-actions">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            type="button"
            variant="outline"
            className="quick-action"
            key={item.title}
            onClick={() => setActive(item.section)}
          >
            <span>
              <Icon size={17} />
            </span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.copy}</small>
            </div>
            <ArrowUpRight size={14} />
          </Button>
        );
      })}
    </div>
  );
}

function topicDetail(classId: string, idx: number): string {
  const descriptions: Record<string, string[]> = {
    "class-01": [
      "Vault server architecture, CPM/PSM component roles, and tamper-resistant storage.",
      "Privileged credential risks, lateral movement vectors, and attack path mitigation.",
      "Enterprise operational workflow: request, approve, connect, record, and rotate.",
    ],
    "class-02": [
      "Safe segregation strategies: environment, department, system tiers, and sensitivity.",
      "RBAC model, granular Safe permissions, and delegation hierarchy.",
      "Applying least privilege access principles to administrative groups and individuals.",
    ],
    "class-03": [
      "Target platform selection (Windows, Linux, DB) and authentication protocols.",
      "Account properties: address, username, platform ID, and Safe assignment.",
      "Pre-onboarding verification, credential validation, and health checks.",
    ],
    "class-04": [
      "Distinguishing human users from service, application, and cloud identities.",
      "Account tiering, privileged vs non-privileged classification, and risk scoring.",
      "Identity lifecycle management from provisioning to automated offboarding.",
    ],
    "class-05": [
      "Central Policy Manager architecture, heartbeat verification, and policy schedules.",
      "Automated and manual password rotation workflows across platforms.",
      "Diagnosing rotation failures, desynchronized credentials, and reconciliation.",
    ],
    "class-06": [
      "Privileged Session Manager gateway architecture and protocol isolation.",
      "Dual-control approval workflows, ticketing integration, and preflight checks.",
      "Transparent credential injection, keystroke recording, and session termination.",
    ],
  };
  return (
    descriptions[classId]?.[idx] ??
    "Comprehensive technical mastery, operational lab exercises, and practical assessment."
  );
}

function AcademyView({
  classes,
  selectedClass,
  setSelectedClass,
  activeClass,
  state,
  selectedLabId,
  setSelectedLabId,
  markLabComplete,
  resetLab,
  labFeedback,
  setActive,
}: {
  classes: typeof CLASSES;
  selectedClass: string;
  setSelectedClass: (id: string) => void;
  activeClass: (typeof CLASSES)[number] | undefined;
  state: PamState;
  selectedLabId: string;
  setSelectedLabId: (labId: string) => void;
  markLabComplete: (score?: number) => void;
  resetLab: () => void;
  labFeedback: string;
  setActive?: (section: SectionId) => void;
}) {
  const [activeTab, setActiveTab] = useState<"concepts" | "lab" | "roles" | "interview" | "vision">(
    "concepts",
  );
  const current = activeClass ?? classes[0];
  const curriculum = ACADEMY_CLASSES.find((c) => c.id === current?.id) ?? ACADEMY_CLASSES[0];
  const currentLab = selectedLabId || (current?.labs[0] ?? "");

  const evaluation: LabEvaluationResult = useMemo(
    () => evaluateLabObjectives(state, currentLab),
    [state, currentLab],
  );

  function handleValidateLab() {
    if (evaluation.completed) {
      markLabComplete(evaluation.score);
      toast.success(`Lab objectives verified! Score: ${evaluation.score}/100.`);
    } else {
      toast.error(`Objectives incomplete: ${evaluation.feedback}`);
    }
  }

  return (
    <>
      {/* Academy Header */}
      <div className="pvwa-page-header">
        <div className="pvwa-page-title-block">
          <h1>
            <GraduationCap size={20} className="text-[#0078D4]" />
            Learning Academy
          </h1>
          <p>SHADOWXLAB PAM ADMINISTRATOR ACADEMY · Six-Class Enterprise Operations Curriculum</p>
        </div>
        <div className="pvwa-toolbar">
          <span style={{ fontSize: 12, color: "#64748B", marginRight: 8 }}>
            Curriculum Progress: <strong>{state.completedLabs.length}/8</strong> Labs Complete
          </span>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
            onClick={resetLab}
            title="Reset training simulation state"
          >
            <RotateCcw size={13} />
            Reset State
          </button>
        </div>
      </div>

      {/* Two-Column Dedicated Academy Layout */}
      <div className="pvwa-academy-layout">
        {/* Left Class Navigator - Sequential C01 through C06 */}
        <div className="pvwa-academy-classes">
          <div className="pvwa-academy-classes-head">
            <h3>Training Curriculum</h3>
          </div>
          {ACADEMY_CLASSES.map((course) => {
            const classObj = classes.find((c) => c.id === course.id);
            const classLabs = classObj?.labs ?? [];
            const completedCount = classLabs.filter((l) => state.completedLabs.includes(l)).length;
            const isSelected = (selectedClass || "class-01") === course.id;
            return (
              <button
                key={course.id}
                type="button"
                className={cx("pvwa-class-item", isSelected && "active")}
                onClick={() => {
                  setSelectedClass(course.id);
                  const first = classLabs[0];
                  if (first) setSelectedLabId(first);
                }}
              >
                <div className="pvwa-class-copy">
                  <small>
                    {course.label} · {course.duration}
                  </small>
                  <strong>{course.title}</strong>
                  <span>
                    {completedCount}/{classLabs.length} labs complete
                  </span>
                </div>
                {classLabs.length > 0 && completedCount === classLabs.length && (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Active Class & Multi-Tab Content Area */}
        <div className="pvwa-academy-main">
          {/* Active Class Header Card */}
          <div className="pvwa-academy-card" style={{ marginBottom: 12 }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#0078D4",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {curriculum.label} · {curriculum.level.toUpperCase()} MODULE
                </span>
                <h2
                  style={{ margin: "4px 0 2px 0", fontSize: 16, fontWeight: 700, color: "#1E293B" }}
                >
                  {curriculum.title}
                </h2>
                <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{curriculum.subtitle}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="pvwa-status-pill managed">DETERMINISTIC SIM ACTIVE</span>
                <span className="pvwa-status-pill managed">ZERO LEAKAGE</span>
              </div>
            </div>

            {/* Quick jump to relevant PAM console */}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                borderTop: "1px solid #E2E8F0",
                paddingTop: 8,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                Jump to Operations Console:
              </span>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                onClick={() => setActive?.("safes")}
              >
                Safes Console
              </button>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                onClick={() => setActive?.("accounts")}
              >
                Accounts Console
              </button>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                onClick={() => setActive?.("cpm")}
              >
                CPM Console
              </button>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                onClick={() => setActive?.("psm")}
              >
                PSM Console
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="pvwa-academy-tab-bar">
            <button
              type="button"
              className={cx("pvwa-academy-tab", activeTab === "concepts" && "active")}
              onClick={() => setActiveTab("concepts")}
            >
              <BookOpen size={14} /> 1. Concepts & Architecture
            </button>
            <button
              type="button"
              className={cx("pvwa-academy-tab", activeTab === "lab" && "active")}
              onClick={() => setActiveTab("lab")}
            >
              <Terminal size={14} /> 2. Hands-on Lab & Objectives
            </button>
            <button
              type="button"
              className={cx("pvwa-academy-tab", activeTab === "roles" && "active")}
              onClick={() => setActiveTab("roles")}
            >
              <UsersRound size={14} /> 3. Enterprise Job Roles
            </button>
            <button
              type="button"
              className={cx("pvwa-academy-tab", activeTab === "interview" && "active")}
              onClick={() => setActiveTab("interview")}
            >
              <Shield size={14} /> 4. Interview Preparation
            </button>
            <button
              type="button"
              className={cx("pvwa-academy-tab", activeTab === "vision" && "active")}
              onClick={() => setActiveTab("vision")}
            >
              <Fingerprint size={14} /> 5. ShadowXLab Vision & Values
            </button>
          </div>

          {/* TAB 1: CONCEPTS & ARCHITECTURE */}
          {activeTab === "concepts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {curriculum.concepts.map((concept, idx) => (
                <div key={concept.title} className="pvwa-concept-card">
                  <div className="pvwa-concept-title">
                    <span style={{ color: "#0078D4", fontSize: 13, fontWeight: 800 }}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span>{concept.title}</span>
                  </div>
                  <p className="pvwa-concept-summary">{concept.summary}</p>
                  <ul className="pvwa-concept-points">
                    {concept.keyPoints.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                  {concept.architectureDiagram && (
                    <pre className="pvwa-arch-box">{concept.architectureDiagram}</pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: HANDS-ON LAB & OBJECTIVES */}
          {activeTab === "lab" && (
            <div>
              {/* If multiple labs exist in class, show lab switcher */}
              {current?.labs && current.labs.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {current.labs.map((labName) => (
                    <button
                      key={labName}
                      type="button"
                      className={cx(
                        "pvwa-btn pvwa-btn-sm",
                        currentLab === labName ? "pvwa-btn-primary" : "pvwa-btn-secondary",
                      )}
                      onClick={() => setSelectedLabId(labName)}
                    >
                      {labName}
                    </button>
                  ))}
                </div>
              )}

              {/* Lab Scenario Card */}
              <div className="pvwa-academy-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1E293B",
                      }}
                    >
                      Lab Scenario: {curriculum.labGuide.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                      {curriculum.labGuide.scenario}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    marginTop: 8,
                    borderTop: "1px solid #E2E8F0",
                    paddingTop: 6,
                  }}
                >
                  <strong>Prerequisites:</strong> {curriculum.labGuide.prerequisites.join(" · ")}
                </div>
              </div>

              {/* Step-by-Step Guided Procedure */}
              <div className="pvwa-academy-card">
                <strong
                  style={{ fontSize: 13, color: "#1E293B", display: "block", marginBottom: 8 }}
                >
                  Step-by-Step Guided Procedure
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {curriculum.labGuide.steps.map((st) => (
                    <div
                      key={st.number}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "8px 10px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 2,
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "#0078D4",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {st.number}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 2,
                          }}
                        >
                          <strong style={{ fontSize: 12, color: "#1E293B" }}>{st.title}</strong>
                          {st.consoleSection && (
                            <button
                              type="button"
                              className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                              style={{ padding: "1px 6px", fontSize: 10 }}
                              onClick={() => setActive?.(st.consoleSection as SectionId)}
                            >
                              Go to {st.consoleSection}
                            </button>
                          )}
                        </div>
                        <p style={{ margin: "0 0 2px 0", fontSize: 11, color: "#334155" }}>
                          <b>Action Required:</b> {st.action}
                        </p>
                        <small style={{ fontSize: 11, color: "#64748B" }}>
                          <b>Expected Result:</b> {st.expectedResult}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Lab Validation Engine Card */}
              <div className="pvwa-academy-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13, color: "#1E293B" }}>
                      Objective-Driven Validation Engine
                    </strong>
                    <span className="block text-[11px] text-[#64748B]">
                      Active Target: {currentLab}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: evaluation.completed ? "#137333" : "#B06000",
                      }}
                    >
                      Score: {evaluation.score}/100
                    </span>
                    <button
                      type="button"
                      className={cx(
                        "pvwa-btn pvwa-btn-sm",
                        evaluation.completed ? "pvwa-btn-primary" : "pvwa-btn-secondary",
                      )}
                      onClick={handleValidateLab}
                    >
                      <ClipboardCheck size={13} />
                      Validate & Complete Lab
                    </button>
                  </div>
                </div>

                {/* Checklist of objectives */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                  {evaluation.objectives.map((obj: LabObjective) => (
                    <div
                      key={obj.id}
                      className={cx("pvwa-objective-item", obj.done ? "done" : "pending")}
                    >
                      <span style={{ color: obj.done ? "#137333" : "#B06000", marginTop: 2 }}>
                        {obj.done ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
                      </span>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: "#1E293B", fontSize: 12 }}>
                          {obj.description}
                        </strong>
                        {obj.evidence && (
                          <small style={{ display: "block", color: "#64748B", fontSize: 11 }}>
                            {obj.evidence}
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {evaluation.feedback && (
                  <div
                    style={{
                      padding: 8,
                      borderRadius: 2,
                      background: evaluation.completed ? "#E6F4EA" : "#FEF7E0",
                      border: evaluation.completed ? "1px solid #CEEAD6" : "1px solid #FEEFC3",
                      color: evaluation.completed ? "#137333" : "#B06000",
                      fontSize: 12,
                    }}
                  >
                    {evaluation.feedback}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ENTERPRISE JOB ROLES */}
          {activeTab === "roles" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="pvwa-academy-card" style={{ marginBottom: 4 }}>
                <h3
                  style={{ margin: "0 0 2px 0", fontSize: 13, fontWeight: 700, color: "#1E293B" }}
                >
                  Real-World Enterprise Career Mappings
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
                  The skills trained in {curriculum.label} directly qualify you for these enterprise
                  security roles:
                </p>
              </div>
              {curriculum.jobRoles.map((role) => (
                <div key={role.title} className="pvwa-job-card">
                  <div className="pvwa-job-header">
                    <div>
                      <div className="pvwa-job-title">{role.title}</div>
                      <span style={{ fontSize: 11, color: "#64748B" }}>
                        Enterprise PAM Practitioner
                      </span>
                    </div>
                    <div className="pvwa-job-badges">
                      <span className="pvwa-job-badge-level">{role.level}</span>
                      <span className="pvwa-job-badge-salary">{role.salaryRange}</span>
                    </div>
                  </div>
                  <p
                    style={{
                      margin: "4px 0 8px 0",
                      fontSize: 12,
                      color: "#334155",
                      lineHeight: 1.5,
                    }}
                  >
                    {role.overview}
                  </p>
                  <strong
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      color: "#64748B",
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    Typical Daily Operations:
                  </strong>
                  <ul className="pvwa-job-tasks">
                    {role.dailyWorkflows.map((t, tIdx) => (
                      <li key={tIdx}>{t}</li>
                    ))}
                  </ul>
                  <strong
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      color: "#64748B",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Core Technical Competencies:
                  </strong>
                  <div className="pvwa-job-skills">
                    {role.requiredSkills.map((c, cIdx) => (
                      <span key={cIdx} className="pvwa-job-skill-tag">
                        {c}
                      </span>
                    ))}
                  </div>
                  {role.certifications && role.certifications.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid #E2E8F0" }}>
                      <strong
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          color: "#64748B",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Recommended Industry Certifications:
                      </strong>
                      <div className="pvwa-job-skills">
                        {role.certifications.map((cert, certIdx) => (
                          <span
                            key={certIdx}
                            className="pvwa-job-badge-level"
                            style={{ fontSize: 10 }}
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: TECHNICAL INTERVIEW PREPARATION */}
          {activeTab === "interview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="pvwa-academy-card" style={{ marginBottom: 4 }}>
                <h3
                  style={{ margin: "0 0 2px 0", fontSize: 13, fontWeight: 700, color: "#1E293B" }}
                >
                  Enterprise PAM Technical Interview Question Bank
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
                  High-frequency questions asked by security leads, architects, and hiring managers
                  for {curriculum.label}:
                </p>
              </div>
              {curriculum.interviewPrep.map((item, idx) => (
                <div key={item.question} className="pvwa-interview-card">
                  <div className="pvwa-interview-q">
                    <span>
                      Q{idx + 1}: {item.question}
                    </span>
                    <span
                      className={cx(
                        "pvwa-diff-badge",
                        `pvwa-diff-${item.difficulty.toLowerCase()}`,
                      )}
                    >
                      {item.difficulty}
                    </span>
                  </div>
                  <div className="pvwa-interview-answer">
                    <strong style={{ color: "#0078D4", display: "block", marginBottom: 4 }}>
                      Suggested Enterprise Response:
                    </strong>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>{item.answer}</p>
                  </div>
                  <div className="pvwa-interview-lens">
                    <Eye size={12} />
                    <span>
                      <b>Interviewer Evaluation Lens:</b> {item.interviewerInsight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: SHADOWXLAB VISION & VALUES */}
          {activeTab === "vision" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="pvwa-vision-card">
                <div className="pvwa-vision-pillar">ShadowXLab Core Vision & Mission</div>
                <div className="pvwa-vision-quote">"{curriculum.visionMission.vision}"</div>
                <div style={{ marginBottom: 10 }}>
                  <strong
                    style={{ fontSize: 12, color: "#1E293B", display: "block", marginBottom: 2 }}
                  >
                    Institutional Mission:
                  </strong>
                  <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                    {curriculum.visionMission.mission}
                  </p>
                </div>
              </div>

              <div className="pvwa-academy-card">
                <h3
                  style={{ margin: "0 0 10px 0", fontSize: 13, fontWeight: 700, color: "#1E293B" }}
                >
                  ShadowXLab Core Institutional Pillars
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 10,
                  }}
                >
                  {curriculum.visionMission.values.map((v) => (
                    <div
                      key={v.name}
                      style={{
                        padding: 10,
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 2,
                      }}
                    >
                      <strong
                        style={{
                          color: "#0078D4",
                          fontSize: 12,
                          display: "block",
                          marginBottom: 2,
                        }}
                      >
                        {v.name}
                      </strong>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: 11,
                          fontStyle: "italic",
                          color: "#334155",
                        }}
                      >
                        "{v.principle}"
                      </p>
                      <small
                        style={{
                          fontSize: 11,
                          color: "#64748B",
                          display: "block",
                          lineHeight: 1.4,
                        }}
                      >
                        {v.application}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
function EnvironmentView({
  selectedComponent,
  setSelectedComponent,
  currentComponent,
}: {
  selectedComponent: string;
  setSelectedComponent: (id: string) => void;
  currentComponent: (typeof COMPONENTS)[number] | undefined;
}) {
  const [trace, setTrace] = useState("onboarding");
  const fallback = COMPONENTS[0];
  const selected = currentComponent ?? COMPONENTS[2] ?? fallback;
  if (!selected) return null;
  const traceSteps =
    trace === "rotation"
      ? ["Administrator", "PVWA", "Vault", "CPM", "Target System"]
      : trace === "session"
        ? ["Administrator", "PVWA", "Vault", "PSM", "Target System"]
        : ["Administrator", "PVWA", "Vault", "CPM", "Target System"];
  return (
    <>
      <SectionHeading
        eyebrow="CONTROL PLANE · COMPONENT MAP"
        title="PAM environment"
        description="Explore the component responsibilities and trace administrator workflows through the CORP-PAM-LAB topology."
        actions={<StatusBadge tone="good">ALL COMPONENTS SIMULATED</StatusBadge>}
      />
      <div className="environment-meta">
        <div>
          <Server size={16} />
          <span>
            <b>9</b> enterprise targets
          </span>
        </div>
        <div>
          <UsersRound size={16} />
          <span>
            <b>8</b> simulated identities
          </span>
        </div>
        <div>
          <Boxes size={16} />
          <span>
            <b>7</b> protection Safes
          </span>
        </div>
        <div>
          <Activity size={16} />
          <span>
            Training network <b>isolated</b>
          </span>
        </div>
      </div>
      <Panel
        title="Enterprise PAM architecture"
        note="Select a component for its operational remit. All service calls shown here are conceptual and simulated."
      >
        <div className="architecture-toolbar">
          <div className="flow-tabs">
            <Button
              type="button"
              size="sm"
              variant={trace === "onboarding" ? "default" : "ghost"}
              onClick={() => setTrace("onboarding")}
            >
              Account onboarding
            </Button>
            <Button
              type="button"
              size="sm"
              variant={trace === "rotation" ? "default" : "ghost"}
              onClick={() => setTrace("rotation")}
            >
              Password rotation
            </Button>
            <Button
              type="button"
              size="sm"
              variant={trace === "session" ? "default" : "ghost"}
              onClick={() => setTrace("session")}
            >
              Privileged session
            </Button>
          </div>
          <span>SELECT A NODE TO INSPECT RESPONSIBILITIES</span>
        </div>
        <div className="architecture-map">
          <div className="architecture-lines">
            <div className="line line-admin-pvwa" />
            <div className="line line-pvwa-vault" />
            <div className="line line-vault-cpm" />
            <div className="line line-cpm-target" />
            <div className="line line-vault-psm" />
            <div className="line line-psm-target" />
          </div>
          {COMPONENTS.map((component, index) => {
            const active = component.id === selectedComponent;
            const nodeIcons = [Fingerprint, Network, Shield, Activity, MonitorPlay, Server];
            const Icon = nodeIcons[index] ?? Server;
            return (
              <Button
                key={component.id}
                type="button"
                variant="ghost"
                style={{ left: component.x, top: component.y }}
                className={cx(
                  "architecture-node",
                  active && "architecture-node-active",
                  traceSteps.includes(component.id) && "architecture-node-onpath",
                )}
                onClick={() => setSelectedComponent(component.id)}
              >
                <span>
                  <Icon size={19} />
                </span>
                <strong>{component.id}</strong>
                <small>
                  {index === 0
                    ? "Operator"
                    : index === 2
                      ? "Credential boundary"
                      : index === 5
                        ? "Managed endpoint"
                        : "Control service"}
                </small>
              </Button>
            );
          })}
          <div className="flow-label label-one">REQUEST · POLICY · ACCOUNT</div>
          <div className="flow-label label-two">CONTROLLED CREDENTIAL OPERATION</div>
          <div className="flow-label label-three">APPROVED · RECORDED SESSION</div>
        </div>
        <div className="flow-legend">
          <span>
            <i className="legend-cyan" />
            Account & credential flow
          </span>
          <span>
            <i className="legend-blue" />
            Brokered session flow
          </span>
          <span>
            <i className="legend-dashed" />
            Audit & policy signals
          </span>
        </div>
      </Panel>
      <div className="component-detail-grid">
        <Panel title={selected.id} note="COMPONENT RESPONSIBILITY">
          <p className="component-purpose">{selected.purpose}</p>
          <div className="detail-facts">
            <Detail label="ADMINISTRATOR RESPONSIBILITIES" value={selected.responsibilities} />
            <Detail label="INPUTS" value={selected.inputs} />
            <Detail label="OUTPUTS" value={selected.outputs} />
            <Detail label="DEPENDENCIES" value={selected.dependency} />
            <Detail label="COMMON FAILURE" value={selected.failure} />
            <Detail label="ADMINISTRATOR TASK" value={selected.task} />
          </div>
        </Panel>
        <Panel title="Example operational ticket" note="FIELD SCENARIO">
          <div className="ticket-ref">
            <span>INCIDENT</span>
            <b>{selected.ticket.split(" · ")[0]}</b>
            <StatusBadge tone="warn">IN PROGRESS</StatusBadge>
          </div>
          <h3 className="ticket-title">{selected.ticket.split(" · ")[1] ?? selected.ticket}</h3>
          <p className="ticket-body">
            Trace the failure to the component that owns the failed responsibility. Compare the
            operator's expected workflow with the recorded inputs, outputs and dependent health
            before retrying.
          </p>
          <div className="ticket-action">
            <span>FIRST INVESTIGATION STEP</span>
            <p>{selected.task}</p>
          </div>
        </Panel>
      </div>
      <Panel
        title={`${trace === "session" ? "PSM session" : trace === "rotation" ? "CPM rotation" : "Account onboarding"} · sequence trace`}
        note="Follow the active control flow from request to target."
      >
        <div className="trace-strip">
          {traceSteps.map((step, index) => (
            <div className="trace-step" key={`${step}-${index}`}>
              <span className={step === selectedComponent ? "trace-node selected" : "trace-node"}>
                {index + 1}
              </span>
              <div>
                <strong>{step}</strong>
                <small>{traceStepDetail(trace, step)}</small>
              </div>
              {index < traceSteps.length - 1 && <ArrowRight className="trace-arrow" size={16} />}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function traceStepDetail(flow: string, step: string): string {
  if (step === "Administrator") return "Authenticated request";
  if (step === "PVWA") return "Workflow & access";
  if (step === "Vault") return "Safe policy check";
  if (step === "CPM")
    return flow === "rotation" ? "Verify · change · reconcile" : "Account onboarding";
  if (step === "PSM") return "Credential injection & recording";
  return "Target response";
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-fact">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function SafesView({
  state,
  selectedSafe,
  setSelectedSafe,
  currentSafe,
  newSafe,
  setNewSafe,
  onCreateSafe,
  learner,
  selectedMember,
  setSelectedMember,
  memberPermissions,
  setMemberPermissions,
  onSaveMember,
  accessResult,
  setAccessResult,
  updateState,
  setActive,
  setSelectedAccount,
}: {
  state: PamState;
  selectedSafe: string;
  setSelectedSafe: (safe: string) => void;
  currentSafe: PamSafe | undefined;
  newSafe: { name: string; description: string; owner: string };
  setNewSafe: (draft: { name: string; description: string; owner: string }) => void;
  onCreateSafe: (event: FormEvent<HTMLFormElement>) => void;
  learner: string;
  selectedMember: string;
  setSelectedMember: (username: string) => void;
  memberPermissions: SafePermission[];
  setMemberPermissions: (permissions: SafePermission[]) => void;
  onSaveMember: () => void;
  accessResult: { allowed: boolean; message: string } | null;
  setAccessResult: (result: { allowed: boolean; message: string } | null) => void;
  updateState: (state: PamState) => void;
  setActive?: (section: SectionId) => void;
  setSelectedAccount?: (id: string) => void;
}) {
  const [safeSearch, setSafeSearch] = useState("");
  const [testPermission, setTestPermission] = useState<SafePermission>("Use accounts");
  const [safeTab, setSafeTab] = useState<
    "general" | "accounts" | "members" | "permissions" | "activities"
  >("general");
  const [showAddSafeModal, setShowAddSafeModal] = useState(false);

  const visibleSafes = state.safes.filter(
    (safe) =>
      safe.name.toLowerCase().includes(safeSearch.toLowerCase()) ||
      safe.description.toLowerCase().includes(safeSearch.toLowerCase()),
  );
  const safeAccounts = state.accounts.filter((account) => account.safe === selectedSafe);
  const safeAudits = state.audit.filter(
    (a) =>
      a.target.includes(selectedSafe) ||
      a.detail.includes(selectedSafe) ||
      safeAccounts.some((acc) => a.target.includes(acc.username)),
  );
  const deps = permissionDependencies(memberPermissions);

  function testLearnerAccess() {
    setAccessResult(evaluatePermission(state, selectedSafe, learner, testPermission));
  }

  function togglePermission(permission: SafePermission, checked: boolean) {
    setMemberPermissions(
      checked
        ? [...memberPermissions, permission]
        : memberPermissions.filter((item) => item !== permission),
    );
  }

  return (
    <>
      {/* Page Title & Context Toolbar */}
      <div className="pvwa-page-header">
        <div className="pvwa-page-title-block">
          <h1>
            <Boxes size={20} className="text-[#00A8E8]" />
            Safes
          </h1>
          <p>
            CyberArk PVWA Classic Safe boundaries, member authorizations, and least-privilege matrix
          </p>
        </div>
        <div className="pvwa-toolbar">
          <button
            type="button"
            className="pvwa-btn pvwa-btn-primary"
            onClick={() => setShowAddSafeModal(true)}
          >
            <Plus size={14} />
            Add Safe
          </button>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-secondary"
            onClick={() => {
              setAccessResult({
                allowed: true,
                message: `${currentSafe?.name ?? selectedSafe} boundary reviewed. ${currentSafe?.members.length ?? 0} members · ${safeAccounts.length} accounts enrolled.`,
              });
              setSafeTab("permissions");
            }}
          >
            <ClipboardCheck size={14} />
            Review Access
          </button>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="pvwa-metrics-strip">
        <div className="pvwa-metric-card">
          <span>CONFIGURED SAFES</span>
          <strong>{state.safes.length}</strong>
          <small>Vault boundaries</small>
        </div>
        <div className="pvwa-metric-card">
          <span>STORED ACCOUNTS</span>
          <strong>{state.accounts.length}</strong>
          <small>Privileged identities</small>
        </div>
        <div className="pvwa-metric-card">
          <span>SAFE ADMINISTRATORS</span>
          <strong>
            {state.safes.reduce(
              (acc, s) =>
                acc + s.members.filter((m) => m.permissions.includes("Manage Safe")).length,
              0,
            )}
          </strong>
          <small>Full administrative delegates</small>
        </div>
        <div className="pvwa-metric-card">
          <span>POLICY ENFORCEMENT</span>
          <strong style={{ color: "#34D399" }}>LEAST PRIVILEGE</strong>
          <small>Dual-control ready</small>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="pvwa-filter-strip">
        <div className="pvwa-search-box">
          <Search size={14} className="text-[#6F8094]" />
          <input
            type="text"
            aria-label="Search Safes"
            placeholder="Search Safes by name or description..."
            value={safeSearch}
            onChange={(e) => setSafeSearch(e.target.value)}
          />
        </div>
        <span className="pvwa-record-count">{visibleSafes.length} SAFES</span>
      </div>

      {/* Dense PVWA Safes Data Grid */}
      <div className="pvwa-grid-wrap">
        <table className="pvwa-grid">
          <thead>
            <tr>
              <th>SAFE NAME</th>
              <th>DESCRIPTION</th>
              <th>ACCOUNTS</th>
              <th>MEMBERS</th>
              <th>SAFE OWNER</th>
              <th>RETENTION</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visibleSafes.map((safe) => {
              const isSelected = (currentSafe?.name ?? selectedSafe) === safe.name;
              const accountsInSafe = state.accounts.filter((a) => a.safe === safe.name).length;
              return (
                <tr
                  key={safe.name}
                  onClick={() => {
                    setSelectedSafe(safe.name);
                    setAccessResult(null);
                  }}
                  className={isSelected ? "selected" : ""}
                >
                  <td>
                    <strong>{safe.name}</strong>
                  </td>
                  <td>
                    <span className="text-[#8E9EB2]">{safe.description}</span>
                  </td>
                  <td>
                    <strong>{accountsInSafe}</strong>
                  </td>
                  <td>{safe.members.length} operators</td>
                  <td>{safe.owner}</td>
                  <td>7 days</td>
                  <td>
                    <span className="pvwa-status-pill managed">
                      <i className="pvwa-pulse-dot" />
                      ACTIVE
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSafe(safe.name);
                        setSafeTab("permissions");
                      }}
                    >
                      Permissions
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Classic Safe Details Panel (Lower Master-Detail) */}
      {currentSafe && (
        <div className="pvwa-detail-panel">
          <div className="pvwa-detail-header">
            <div className="pvwa-detail-title">
              <Boxes size={16} className="text-[#00A8E8]" />
              <h3>Safe Details: {currentSafe.name}</h3>
              <span>· Owned by {currentSafe.owner}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="pvwa-status-pill managed">ACTIVE VAULT SAFE</span>
            </div>
          </div>

          {/* Master-Detail Tabs */}
          <div className="pvwa-detail-tabs">
            <button
              type="button"
              className={cx("pvwa-tab-btn", safeTab === "general" && "active")}
              onClick={() => setSafeTab("general")}
            >
              General
            </button>
            <button
              type="button"
              className={cx("pvwa-tab-btn", safeTab === "accounts" && "active")}
              onClick={() => setSafeTab("accounts")}
            >
              Accounts ({safeAccounts.length})
            </button>
            <button
              type="button"
              className={cx("pvwa-tab-btn", safeTab === "members" && "active")}
              onClick={() => setSafeTab("members")}
            >
              Members ({currentSafe.members.length})
            </button>
            <button
              type="button"
              className={cx("pvwa-tab-btn", safeTab === "permissions" && "active")}
              onClick={() => setSafeTab("permissions")}
            >
              Permission Matrix
            </button>
            <button
              type="button"
              className={cx("pvwa-tab-btn", safeTab === "activities" && "active")}
              onClick={() => setSafeTab("activities")}
            >
              Activities ({safeAudits.length})
            </button>
          </div>

          <div className="pvwa-detail-body">
            {safeTab === "general" && (
              <div className="pvwa-facts-grid">
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">SAFE NAME</span>
                  <span className="pvwa-fact-value">{currentSafe.name}</span>
                </div>
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">SAFE OWNER</span>
                  <span className="pvwa-fact-value">{currentSafe.owner}</span>
                </div>
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">ACCOUNTS STORED</span>
                  <span className="pvwa-fact-value">{safeAccounts.length} accounts</span>
                </div>
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">ASSIGNED MEMBERS</span>
                  <span className="pvwa-fact-value">{currentSafe.members.length} identities</span>
                </div>
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">RETENTION POLICY</span>
                  <span className="pvwa-fact-value">7 days object history</span>
                </div>
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">SECURITY BOUNDARY</span>
                  <span className="pvwa-fact-value">Least-privilege isolation</span>
                </div>
                <div className="pvwa-fact span-2">
                  <span className="pvwa-fact-label">DESCRIPTION</span>
                  <span className="pvwa-fact-value">{currentSafe.description}</span>
                </div>
              </div>
            )}

            {safeTab === "accounts" && (
              <div className="pvwa-grid-wrap">
                <table className="pvwa-grid">
                  <thead>
                    <tr>
                      <th>IDENTITY</th>
                      <th>TARGET</th>
                      <th>PLATFORM</th>
                      <th>TYPE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeAccounts.map((acc) => (
                      <tr key={acc.id}>
                        <td>
                          <strong>{acc.username}</strong>
                        </td>
                        <td>{acc.address}</td>
                        <td>{acc.platform}</td>
                        <td>{acc.type}</td>
                        <td>
                          <span
                            className={cx(
                              "pvwa-status-pill",
                              acc.status === "Managed"
                                ? "managed"
                                : acc.status === "Rotation failed"
                                  ? "failed"
                                  : "verify",
                            )}
                          >
                            {acc.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                            onClick={() => {
                              setSelectedAccount?.(acc.id);
                              setActive?.("accounts");
                            }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {safeAccounts.length === 0 && (
                  <p
                    style={{
                      padding: 16,
                      textAlign: "center",
                      color: "#6F8094",
                      margin: 0,
                      fontSize: 12,
                    }}
                  >
                    No accounts currently enrolled in this Safe.
                  </p>
                )}
              </div>
            )}

            {safeTab === "members" && (
              <div className="pvwa-grid-wrap">
                <table className="pvwa-grid">
                  <thead>
                    <tr>
                      <th>MEMBER IDENTITY</th>
                      <th>ROLE</th>
                      <th>PERMISSIONS COUNT</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSafe.members.map((member) => (
                      <tr key={member.username}>
                        <td>
                          <strong>{member.username}</strong>
                        </td>
                        <td>
                          <span className="text-[11px] text-[#8E9EB2]">
                            {member.username === currentSafe.owner
                              ? "Safe Owner"
                              : member.username === "auditor"
                                ? "Auditor"
                                : "Operator"}
                          </span>
                        </td>
                        <td>{member.permissions.length} permissions granted</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                              onClick={() => {
                                setSelectedMember(member.username);
                                setMemberPermissions(member.permissions);
                                setSafeTab("permissions");
                              }}
                            >
                              Edit Permissions
                            </button>
                            {member.username !== currentSafe.owner && (
                              <button
                                type="button"
                                className="pvwa-btn pvwa-btn-sm pvwa-btn-danger"
                                onClick={() => {
                                  const result = setSafeMember(state, selectedSafe, null, learner);
                                  if (result.error) {
                                    toast.error(result.error);
                                    return;
                                  }
                                  updateState(result.state);
                                  toast.success(`${member.username} removed from ${selectedSafe}.`);
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {safeTab === "permissions" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13, color: "#FFFFFF" }}>
                      CyberArk Classic Safe Permission Matrix
                    </strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#8E9EB2" }}>
                      Configure administrative authorizations and dependency controls.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label style={{ fontSize: 11, color: "#8E9EB2" }}>Member:</label>
                    <Select
                      value={selectedMember}
                      onValueChange={(value) => {
                        setSelectedMember(value);
                        const found = currentSafe.members.find((m) => m.username === value);
                        if (found) setMemberPermissions(found.permissions);
                      }}
                    >
                      <SelectTrigger className="pvwa-select h-7 text-xs w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEARNERS.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <table className="pvwa-perm-matrix">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>GRANT</th>
                      <th>PERMISSION</th>
                      <th>AUTHORIZATION SCOPE</th>
                      <th>DEPENDENCY RULES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAFE_PERMISSIONS.map((permission) => (
                      <tr key={permission}>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={memberPermissions.includes(permission)}
                            onChange={(e) => togglePermission(permission, e.target.checked)}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td>
                          <strong>{permission}</strong>
                        </td>
                        <td>
                          <small className="text-[#8E9EB2]">
                            {permission === "List accounts" &&
                              "Enables viewing account existence in inventory"}
                            {permission === "Retrieve accounts" &&
                              "Enables fetching credential content from Safe"}
                            {permission === "Use accounts" &&
                              "Enables utilizing credential via PSM or client"}
                            {permission === "Manage Safe" &&
                              "Full administrative ownership and configuration of Safe"}
                            {permission === "Manage accounts" &&
                              "Enables changing and reconciling account credentials"}
                            {permission === "Add accounts" &&
                              "Enables creating new account objects in this Safe"}
                            {permission === "Update account properties" &&
                              "Enables editing metadata, address, and platforms"}
                            {permission === "Delete accounts" &&
                              "Enables removing account records from Safe"}
                            {permission === "Initiate privileged sessions" &&
                              "Enables launching brokered PSM sessions"}
                          </small>
                        </td>
                        <td>
                          <small
                            style={{
                              color:
                                permission === "Initiate privileged sessions"
                                  ? "#FBBF24"
                                  : "#6F8094",
                            }}
                          >
                            {permission === "Initiate privileged sessions" &&
                              "Requires Use accounts"}
                            {permission === "Update account properties" && "Enables metadata edit"}
                            {permission === "Manage Safe" && "Admin control"}
                            {permission !== "Initiate privileged sessions" &&
                              permission !== "Update account properties" &&
                              permission !== "Manage Safe" &&
                              "Standard Safe rule"}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {deps.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 8,
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: 4,
                      color: "#FBBF24",
                      fontSize: 12,
                    }}
                  >
                    <strong>Missing required permission dependencies:</strong>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      {deps.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="pvwa-btn pvwa-btn-primary"
                    onClick={onSaveMember}
                  >
                    Save Permissions
                  </button>
                  <button
                    type="button"
                    className="pvwa-btn pvwa-btn-secondary"
                    onClick={() => {
                      const found = currentSafe.members.find((m) => m.username === selectedMember);
                      setMemberPermissions(found?.permissions ?? []);
                    }}
                  >
                    Reset
                  </button>
                </div>

                {/* Interactive Access Evaluation Sandbox */}
                <div
                  style={{
                    marginTop: 18,
                    padding: 12,
                    background: "#0B0F14",
                    border: "1px solid #263241",
                    borderRadius: 4,
                  }}
                >
                  <strong style={{ fontSize: 12, color: "#FFFFFF" }}>
                    Interactive Access Evaluation Simulator
                  </strong>
                  <p style={{ margin: "2px 0 8px 0", fontSize: 11, color: "#8E9EB2" }}>
                    Simulate whether identity <strong>{learner}</strong> can execute a target PAM
                    action in <strong>{selectedSafe}</strong>.
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Select
                      value={testPermission}
                      onValueChange={(val) => setTestPermission(val as SafePermission)}
                    >
                      <SelectTrigger className="pvwa-select h-7 text-xs w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SAFE_PERMISSIONS.map((perm) => (
                          <SelectItem key={perm} value={perm}>
                            {perm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                      onClick={testLearnerAccess}
                    >
                      Evaluate Access
                    </button>
                  </div>
                  {accessResult && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        borderRadius: 4,
                        background: accessResult.allowed
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(239, 68, 68, 0.12)",
                        border: accessResult.allowed
                          ? "1px solid rgba(16, 185, 129, 0.3)"
                          : "1px solid rgba(239, 68, 68, 0.3)",
                        color: accessResult.allowed ? "#34D399" : "#F87171",
                        fontSize: 12,
                      }}
                    >
                      <strong>
                        {accessResult.allowed ? "ACCESS PERMITTED: " : "ACCESS DENIED: "}
                      </strong>
                      {accessResult.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {safeTab === "activities" && (
              <div className="pvwa-grid-wrap">
                <table className="pvwa-grid">
                  <thead>
                    <tr>
                      <th>TIME</th>
                      <th>ACTOR</th>
                      <th>ACTION</th>
                      <th>TARGET</th>
                      <th>RESULT</th>
                      <th>DETAIL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeAudits.map((a) => (
                      <tr key={a.id}>
                        <td>{a.time}</td>
                        <td>
                          <strong>{a.actor}</strong>
                        </td>
                        <td>{a.action}</td>
                        <td>{a.target}</td>
                        <td>
                          <span
                            className={cx(
                              "pvwa-status-pill",
                              a.result === "Success"
                                ? "managed"
                                : a.result === "Warning"
                                  ? "verify"
                                  : "failed",
                            )}
                          >
                            {a.result}
                          </span>
                        </td>
                        <td>
                          <small className="text-[#8E9EB2]">{a.detail}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Safe Modal */}
      {showAddSafeModal && (
        <div className="pvwa-modal-backdrop" onClick={() => setShowAddSafeModal(false)}>
          <div className="pvwa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pvwa-modal-header">
              <h3>Create Safe Boundary</h3>
              <button
                type="button"
                className="text-[#8E9EB2] hover:text-white"
                onClick={() => setShowAddSafeModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                onCreateSafe(e);
                setShowAddSafeModal(false);
              }}
            >
              <div className="pvwa-modal-body">
                <div className="pvwa-form-grid">
                  <div className="pvwa-field span-2">
                    <label>Safe Name</label>
                    <input
                      required
                      className="pvwa-input"
                      value={newSafe.name}
                      onChange={(e) =>
                        setNewSafe({ ...newSafe, name: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. PAYMENT-GATEWAY-SAFE"
                    />
                  </div>
                  <div className="pvwa-field span-2">
                    <label>Safe Owner</label>
                    <Select
                      value={newSafe.owner}
                      onValueChange={(owner) => setNewSafe({ ...newSafe, owner })}
                    >
                      <SelectTrigger className="pvwa-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEARNERS.map((owner) => (
                          <SelectItem key={owner} value={owner}>
                            {owner}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pvwa-field span-2">
                    <label>Description & Scope</label>
                    <textarea
                      required
                      rows={3}
                      className="pvwa-textarea"
                      value={newSafe.description}
                      onChange={(e) => setNewSafe({ ...newSafe, description: e.target.value })}
                      placeholder="Enterprise responsibility and system scope for this Safe"
                    />
                  </div>
                </div>
              </div>
              <div className="pvwa-modal-footer">
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary"
                  onClick={() => setShowAddSafeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pvwa-btn pvwa-btn-primary">
                  <Plus size={14} />
                  Create Safe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function AccountsView({
  state,
  filteredAccounts: initialFilteredAccounts,
  search: externalSearch,
  setSearch: setExternalSearch,
  statusFilter: externalStatusFilter,
  setStatusFilter: setExternalStatusFilter,
  draft,
  setDraft,
  onAdd,
  selectedAccount,
  setSelectedAccount,
  learner,
  onCpmOperation,
  onRepairCpm,
  onConnectPsm,
  setActive,
}: {
  state: PamState;
  filteredAccounts?: PamAccount[];
  search?: string;
  setSearch?: (value: string) => void;
  statusFilter?: string;
  setStatusFilter?: (value: string) => void;
  draft: PamAccount;
  setDraft: (draft: PamAccount) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
  selectedAccount: string;
  setSelectedAccount: (id: string) => void;
  learner: string;
  onCpmOperation?: (operation: CpmOperation) => void;
  onRepairCpm?: (repair: "unlock" | "reconcile-access" | "target-connectivity") => void;
  onConnectPsm?: (account: PamAccount) => void;
  setActive?: (section: SectionId) => void;
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalStatusFilter, setInternalStatusFilter] = useState("all");
  const [safeFilter, setSafeFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [treeFilter, setTreeFilter] = useState<string>("all");

  const handleTreeFilter = (id: string) => {
    setTreeFilter(id);
    if (id === "all") {
      setSafeFilter("all");
      setPlatformFilter("all");
      setTypeFilter("all");
      setFilterStatus("all");
      setFilterSearch("");
    } else if (id === "windows") {
      setPlatformFilter("Windows Server Local");
      setSafeFilter("all");
      setFilterStatus("all");
    } else if (id === "linux") {
      setPlatformFilter("Unix SSH");
      setSafeFilter("all");
      setFilterStatus("all");
    } else if (id === "database") {
      setTypeFilter("Database account");
      setSafeFilter("all");
      setFilterStatus("all");
    } else if (id === "service") {
      setTypeFilter("Service account");
      setSafeFilter("all");
      setFilterStatus("all");
    } else if (id === "managed") {
      setFilterStatus("Managed");
      setSafeFilter("all");
      setPlatformFilter("all");
    } else if (id === "verify") {
      setFilterStatus("Verify required");
      setSafeFilter("all");
      setPlatformFilter("all");
    } else if (id === "failed") {
      setFilterStatus("Rotation failed");
      setSafeFilter("all");
      setPlatformFilter("all");
    } else if (id.startsWith("safe:")) {
      setSafeFilter(id.replace("safe:", ""));
      setPlatformFilter("all");
      setFilterStatus("all");
    }
  };
  const [accountTab, setAccountTab] = useState<
    "general" | "management" | "activities" | "sessions"
  >("general");
  const [showAddModal, setShowAddModal] = useState(false);

  const searchVal = externalSearch !== undefined ? externalSearch : internalSearch;
  const setFilterSearch = setExternalSearch ?? setInternalSearch;
  const statusVal =
    externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;
  const setFilterStatus = setExternalStatusFilter ?? setInternalStatusFilter;

  const accounts = state.accounts.filter((acc) => {
    const matchesSearch =
      !searchVal.trim() ||
      acc.username.toLowerCase().includes(searchVal.toLowerCase()) ||
      acc.address.toLowerCase().includes(searchVal.toLowerCase()) ||
      acc.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      acc.safe.toLowerCase().includes(searchVal.toLowerCase()) ||
      acc.platform.toLowerCase().includes(searchVal.toLowerCase()) ||
      acc.owner.toLowerCase().includes(searchVal.toLowerCase());
    const matchesStatus = statusVal === "all" || acc.status === statusVal;
    const matchesSafe = safeFilter === "all" || acc.safe === safeFilter;
    const matchesPlatform = platformFilter === "all" || acc.platform === platformFilter;
    const matchesType = typeFilter === "all" || acc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesSafe && matchesPlatform && matchesType;
  });

  const focused =
    state.accounts.find((account) => account.id === selectedAccount) ??
    accounts[0] ??
    state.accounts[0];

  const owners = [...new Set(state.accounts.map((account) => account.owner))];
  const allSafes = [...new Set(state.safes.map((s) => s.name))];
  const allPlatforms = [...SUPPORTED_PLATFORMS];
  const allTypes = [...new Set(state.accounts.map((a) => a.type))];

  const accountAudits = state.audit.filter(
    (a) =>
      focused &&
      (a.target.includes(focused.username) ||
        a.target.includes(focused.address) ||
        a.detail.includes(focused.username) ||
        a.target.includes(focused.safe)),
  );

  const accountSessions = state.sessions.filter(
    (s) => focused && (s.target === focused.address || s.account === focused.username),
  );

  return (
    <div className="pvwa-accounts-layout">
      {/* CyberArk PVWA Classic Left-Hand Accounts Navigation Tree */}
      <div className="pvwa-accounts-tree">
        <div className="pvwa-tree-section">
          <div className="pvwa-tree-heading">ACCOUNT VIEWS</div>
          <button
            type="button"
            className={cx("pvwa-tree-item", treeFilter === "all" && "active")}
            onClick={() => handleTreeFilter("all")}
          >
            <span>All Accounts</span>
            <span className="pvwa-tree-count">{state.accounts.length}</span>
          </button>
          <button
            type="button"
            className={cx("pvwa-tree-item", treeFilter === "windows" && "active")}
            onClick={() => handleTreeFilter("windows")}
          >
            <span>Windows Accounts</span>
            <span className="pvwa-tree-count">
              {state.accounts.filter((a) => a.platform.includes("Windows")).length}
            </span>
          </button>
          <button
            type="button"
            className={cx("pvwa-tree-item", treeFilter === "linux" && "active")}
            onClick={() => handleTreeFilter("linux")}
          >
            <span>Unix / Linux Accounts</span>
            <span className="pvwa-tree-count">
              {
                state.accounts.filter(
                  (a) => a.platform.includes("Unix") || a.platform.includes("Linux"),
                ).length
              }
            </span>
          </button>
          <button
            type="button"
            className={cx("pvwa-tree-item", treeFilter === "database" && "active")}
            onClick={() => handleTreeFilter("database")}
          >
            <span>Database Accounts</span>
            <span className="pvwa-tree-count">
              {
                state.accounts.filter(
                  (a) =>
                    a.platform.includes("Oracle") ||
                    a.platform.includes("SQL") ||
                    a.platform.includes("Postgre") ||
                    a.type.includes("Database"),
                ).length
              }
            </span>
          </button>
          <button
            type="button"
            className={cx("pvwa-tree-item", treeFilter === "service" && "active")}
            onClick={() => handleTreeFilter("service")}
          >
            <span>Service Accounts</span>
            <span className="pvwa-tree-count">
              {state.accounts.filter((a) => a.type.includes("Service")).length}
            </span>
          </button>
        </div>

        <div className="pvwa-tree-section">
          <div className="pvwa-tree-heading">CPM STATUS</div>
          <button
            type="button"
            className={cx("pvwa-tree-item", treeFilter === "managed" && "active")}
            onClick={() => handleTreeFilter("managed")}
          >
            <span>In Compliance</span>
            <span className="pvwa-tree-count" style={{ color: "#03543F" }}>
              {state.accounts.filter((a) => a.status === "Managed").length}
            </span>
          </button>
          <button
            type="button"
            className={cx("pvwa-tree-item", treeFilter === "verify" && "active")}
            onClick={() => handleTreeFilter("verify")}
          >
            <span>Verify Required</span>
            <span className="pvwa-tree-count" style={{ color: "#713F12" }}>
              {state.accounts.filter((a) => a.status === "Verify required").length}
            </span>
          </button>
          <button
            type="button"
            className={cx("pvwa-tree-item", treeFilter === "failed" && "active")}
            onClick={() => handleTreeFilter("failed")}
          >
            <span>Rotation Failed</span>
            <span className="pvwa-tree-count" style={{ color: "#9B1C1C", fontWeight: 700 }}>
              {state.accounts.filter((a) => a.status === "Rotation failed").length}
            </span>
          </button>
        </div>

        <div className="pvwa-tree-section">
          <div className="pvwa-tree-heading">SAFES</div>
          {state.safes.map((s) => {
            const count = state.accounts.filter((a) => a.safe === s.name).length;
            return (
              <button
                key={s.name}
                type="button"
                className={cx("pvwa-tree-item", treeFilter === "safe:" + s.name && "active")}
                onClick={() => handleTreeFilter("safe:" + s.name)}
              >
                <span className="truncate">{s.name}</span>
                <span className="pvwa-tree-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Accounts Area */}
      <div className="pvwa-accounts-main">
        {/* Page Title & Context Toolbar */}
        <div className="pvwa-page-header">
          <div className="pvwa-page-title-block">
            <h1>
              <KeyRound size={20} className="text-[#00A8E8]" />
              Accounts
            </h1>
            <p>CyberArk PVWA Classic privileged account administration and lifecycle operations</p>
          </div>
          <div className="pvwa-toolbar">
            <button
              type="button"
              className="pvwa-btn pvwa-btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} />
              Add Account
            </button>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-connect"
              disabled={!focused}
              onClick={() => {
                if (focused) {
                  if (onConnectPsm) onConnectPsm(focused);
                  else if (setActive) {
                    setActive("psm");
                    toast.info(`Connecting to ${focused.username} on ${focused.address}`);
                  }
                }
              }}
            >
              <MonitorPlay size={14} />
              Connect (PSM)
            </button>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-secondary"
              disabled={!focused}
              onClick={() => onCpmOperation?.("Verify")}
            >
              <SearchCheck size={14} />
              Verify
            </button>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-secondary"
              disabled={!focused}
              onClick={() => onCpmOperation?.("Change")}
            >
              <RotateCcw size={14} />
              Change
            </button>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-secondary"
              disabled={!focused}
              onClick={() => onCpmOperation?.("Reconcile")}
            >
              <Activity size={14} />
              Reconcile
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="pvwa-filter-strip">
          <div className="pvwa-search-box">
            <Search size={14} className="text-[#6F8094]" />
            <input
              type="text"
              aria-label="Search accounts"
              placeholder="Search username, target, safe, platform, owner..."
              value={searchVal}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>
          <div className="pvwa-filter-dropdowns">
            <Select value={safeFilter} onValueChange={setSafeFilter}>
              <SelectTrigger className="pvwa-select h-7 text-xs w-[130px]">
                <SelectValue placeholder="All Safes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Safes</SelectItem>
                {allSafes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="pvwa-select h-7 text-xs w-[140px]">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {allPlatforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="pvwa-select h-7 text-xs w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Account Types</SelectItem>
                {allTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusVal} onValueChange={setFilterStatus}>
              <SelectTrigger className="pvwa-select h-7 text-xs w-[150px]">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Management States</SelectItem>
                {["Managed", "Verify required", "Rotation failed", "Unmanaged"].map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(safeFilter !== "all" ||
              platformFilter !== "all" ||
              typeFilter !== "all" ||
              statusVal !== "all" ||
              searchVal) && (
              <button
                type="button"
                className="text-xs text-[#00A8E8] hover:underline px-2 py-1"
                onClick={() => {
                  setSafeFilter("all");
                  setPlatformFilter("all");
                  setTypeFilter("all");
                  setFilterStatus("all");
                  setFilterSearch("");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
          <span className="pvwa-record-count">{accounts.length} ACCOUNTS</span>
        </div>

        {/* Dense PVWA Accounts Data Grid */}
        <div className="pvwa-grid-wrap">
          <table className="pvwa-grid">
            <thead>
              <tr>
                <th>USERNAME</th>
                <th>TARGET SYSTEM</th>
                <th>PLATFORM</th>
                <th>SAFE</th>
                <th>ACCOUNT TYPE</th>
                <th>OWNER</th>
                <th>CPM STATUS</th>
                <th>LAST VERIFIED</th>
                <th>LAST CHANGE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const isSelected = focused?.id === account.id;
                return (
                  <tr
                    key={account.id}
                    onClick={() => setSelectedAccount(account.id)}
                    className={isSelected ? "selected" : ""}
                  >
                    <td>
                      <strong>{account.username}</strong>
                      {account.name && account.name !== account.username && (
                        <span className="block text-[11px] text-[#8E9EB2]">{account.name}</span>
                      )}
                    </td>
                    <td>{account.address}</td>
                    <td>
                      <span className="text-[11px] text-[#9AA9BA] bg-[#141C26] px-1.5 py-0.5 rounded border border-[#263241]">
                        {account.platform}
                      </span>
                    </td>
                    <td>
                      <span className="pvwa-code-cell">{account.safe}</span>
                    </td>
                    <td>
                      <span className="text-[#9AA9BA]">{account.type}</span>
                    </td>
                    <td>{account.owner}</td>
                    <td>
                      <span
                        className={cx(
                          "pvwa-status-pill",
                          account.status === "Managed"
                            ? "managed"
                            : account.status === "Verify required"
                              ? "verify"
                              : account.status === "Rotation failed"
                                ? "failed"
                                : "unmanaged",
                        )}
                      >
                        <i className="pvwa-pulse-dot" />
                        {account.status}
                      </span>
                    </td>
                    <td>
                      <small className="text-[#8E9EB2]">{account.lastVerify}</small>
                    </td>
                    <td>
                      <small className="text-[#8E9EB2]">{account.lastChange}</small>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="pvwa-btn pvwa-btn-sm pvwa-btn-connect"
                          title="Connect with PSM"
                          onClick={() => {
                            setSelectedAccount(account.id);
                            if (onConnectPsm) onConnectPsm(account);
                            else if (setActive) {
                              setActive("psm");
                              toast.info(`Connecting to ${account.username} on ${account.address}`);
                            }
                          }}
                        >
                          Connect
                        </button>
                        <button
                          type="button"
                          className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                          title="Verify credential"
                          onClick={() => {
                            setSelectedAccount(account.id);
                            onCpmOperation?.("Verify");
                          }}
                        >
                          Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {accounts.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "#8E9EB2" }}>
              <KeyRound size={28} className="mx-auto mb-2 text-[#6F8094]" />
              <strong className="block text-sm text-[#E8EEF5]">No matching accounts found</strong>
              <p className="text-xs text-[#6F8094] m-0">
                Adjust the search filter or onboarding criteria.
              </p>
            </div>
          )}
        </div>

        {/* Classic Account Details Panel (Lower Master-Detail) */}
        {focused && (
          <div className="pvwa-detail-panel">
            <div className="pvwa-detail-header">
              <div className="pvwa-detail-title">
                <KeyRound size={16} className="text-[#00A8E8]" />
                <h3>Account Details: {focused.username}</h3>
                <span>
                  · {focused.address} ({focused.platform})
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className={cx(
                    "pvwa-status-pill",
                    focused.status === "Managed"
                      ? "managed"
                      : focused.status === "Verify required"
                        ? "verify"
                        : focused.status === "Rotation failed"
                          ? "failed"
                          : "unmanaged",
                  )}
                >
                  {focused.status}
                </span>
              </div>
            </div>

            {/* Master-Detail Tabs */}
            <div className="pvwa-detail-tabs">
              <button
                type="button"
                className={cx("pvwa-tab-btn", accountTab === "general" && "active")}
                onClick={() => setAccountTab("general")}
              >
                General
              </button>
              <button
                type="button"
                className={cx("pvwa-tab-btn", accountTab === "management" && "active")}
                onClick={() => setAccountTab("management")}
              >
                Management (CPM)
              </button>
              <button
                type="button"
                className={cx("pvwa-tab-btn", accountTab === "activities" && "active")}
                onClick={() => setAccountTab("activities")}
              >
                Activities ({accountAudits.length})
              </button>
              <button
                type="button"
                className={cx("pvwa-tab-btn", accountTab === "sessions" && "active")}
                onClick={() => setAccountTab("sessions")}
              >
                Sessions ({accountSessions.length})
              </button>
            </div>

            <div className="pvwa-detail-body">
              {accountTab === "general" && (
                <div>
                  <div className="pvwa-facts-grid">
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">USERNAME</span>
                      <span className="pvwa-fact-value">{focused.username}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">ACCOUNT NAME</span>
                      <span className="pvwa-fact-value">{focused.name}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">TARGET SYSTEM</span>
                      <span className="pvwa-fact-value">{focused.address}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">SAFE</span>
                      <span className="pvwa-fact-value">{focused.safe}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">PLATFORM</span>
                      <span className="pvwa-fact-value">{focused.platform}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">ACCOUNT TYPE</span>
                      <span className="pvwa-fact-value">{focused.type}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">OWNER</span>
                      <span className="pvwa-fact-value">{focused.owner}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">DEFAULT PORT</span>
                      <span className="pvwa-fact-value">
                        {focused.platform.includes("Windows")
                          ? "3389 (RDP)"
                          : focused.platform.includes("Unix") || focused.platform.includes("Linux")
                            ? "22 (SSH)"
                            : focused.platform.includes("Oracle")
                              ? "1521 (TNS)"
                              : focused.platform.includes("SQL")
                                ? "1433 (TDS)"
                                : "443 (HTTPS)"}
                      </span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">BUSINESS PURPOSE</span>
                      <span className="pvwa-fact-value">{focused.purpose}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">DEPENDENCY</span>
                      <span className="pvwa-fact-value">
                        {focused.dependency || "None recorded"}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      padding: 10,
                      background: "#0B0F14",
                      border: "1px solid #1C2633",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#6F8094",
                        textTransform: "uppercase",
                      }}
                    >
                      LEAST-PRIVILEGE SAFE MEMBERSHIP VERIFICATION
                    </span>
                    <p style={{ margin: "4px 0 0 0", color: "#E8EEF5" }}>
                      Operating identity <strong>{learner}</strong>{" "}
                      {canSafeMemberPerform(
                        state.safes.find((s) => s.name === focused.safe),
                        learner,
                        "List accounts",
                      )
                        ? "is authorized to list accounts in this Safe."
                        : "does not have List accounts permission in this Safe."}
                    </p>
                  </div>
                </div>
              )}

              {accountTab === "management" && (
                <div>
                  <div className="pvwa-facts-grid">
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">CPM MANAGEMENT STATE</span>
                      <span className="pvwa-fact-value">{focused.status}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">ROTATION POLICY</span>
                      <span className="pvwa-fact-value">{focused.policy}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">LAST VERIFY OPERATION</span>
                      <span className="pvwa-fact-value">{focused.lastVerify}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">LAST PASSWORD CHANGE</span>
                      <span className="pvwa-fact-value">{focused.lastChange}</span>
                    </div>
                    <div className="pvwa-fact">
                      <span className="pvwa-fact-label">LAST RECONCILE OPERATION</span>
                      <span className="pvwa-fact-value">{focused.lastReconcile}</span>
                    </div>
                  </div>

                  {focused.failureCause && (
                    <div className="pvwa-failure-box">
                      <AlertTriangle size={18} />
                      <div>
                        <strong>CPM Operation Exception Detected</strong>
                        <p>{focused.failureCause}</p>
                      </div>
                    </div>
                  )}

                  {focused.failureCause && onRepairCpm && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 12,
                        background: "#0B0F14",
                        border: "1px solid #263241",
                        borderRadius: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#F87171",
                          textTransform: "uppercase",
                          display: "block",
                          marginBottom: 8,
                        }}
                      >
                        ONE-CLICK INCIDENT RECOVERY ACTIONS
                      </span>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                          onClick={() => onRepairCpm("unlock")}
                        >
                          <Power size={13} />
                          Unlock Target Account
                        </button>
                        <button
                          type="button"
                          className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                          onClick={() => onRepairCpm("reconcile-access")}
                        >
                          <KeyRound size={13} />
                          Restore Reconcile Access
                        </button>
                        <button
                          type="button"
                          className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                          onClick={() => onRepairCpm("target-connectivity")}
                        >
                          <Network size={13} />
                          Repair Target Connectivity
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-secondary"
                      onClick={() => onCpmOperation?.("Verify")}
                    >
                      <SearchCheck size={14} />
                      Run Verify Now
                    </button>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-primary"
                      onClick={() => onCpmOperation?.("Change")}
                    >
                      <RotateCcw size={14} />
                      Run Change Now
                    </button>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-secondary"
                      onClick={() => onCpmOperation?.("Reconcile")}
                    >
                      <Activity size={14} />
                      Run Reconcile Now
                    </button>
                  </div>
                </div>
              )}

              {accountTab === "activities" && (
                <div className="pvwa-grid-wrap">
                  <table className="pvwa-grid">
                    <thead>
                      <tr>
                        <th>TIME</th>
                        <th>ACTOR</th>
                        <th>ACTION</th>
                        <th>RESULT</th>
                        <th>DETAIL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountAudits.map((a) => (
                        <tr key={a.id}>
                          <td>{a.time}</td>
                          <td>
                            <strong>{a.actor}</strong>
                          </td>
                          <td>{a.action}</td>
                          <td>
                            <span
                              className={cx(
                                "pvwa-status-pill",
                                a.result === "Success"
                                  ? "managed"
                                  : a.result === "Warning"
                                    ? "verify"
                                    : "failed",
                              )}
                            >
                              {a.result}
                            </span>
                          </td>
                          <td>
                            <small className="text-[#8E9EB2]">{a.detail}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {accountAudits.length === 0 && (
                    <p
                      style={{
                        padding: 16,
                        textAlign: "center",
                        color: "#6F8094",
                        margin: 0,
                        fontSize: 12,
                      }}
                    >
                      No audit activities recorded for this account.
                    </p>
                  )}
                </div>
              )}

              {accountTab === "sessions" && (
                <div className="pvwa-grid-wrap">
                  <table className="pvwa-grid">
                    <thead>
                      <tr>
                        <th>TARGET</th>
                        <th>COMPONENT</th>
                        <th>TICKET</th>
                        <th>STARTED</th>
                        <th>COMMANDS</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountSessions.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.target}</strong>
                          </td>
                          <td>{s.component}</td>
                          <td>
                            <span className="pvwa-code-cell">{s.ticket}</span>
                          </td>
                          <td>{s.started}</td>
                          <td>{s.commands.length} executed</td>
                          <td>
                            <span
                              className={cx(
                                "pvwa-status-pill",
                                s.status === "Active" ? "managed" : "unmanaged",
                              )}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {accountSessions.length === 0 && (
                    <p
                      style={{
                        padding: 16,
                        textAlign: "center",
                        color: "#6F8094",
                        margin: 0,
                        fontSize: 12,
                      }}
                    >
                      No recorded PSM sessions for this target system.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Account Modal */}
        {showAddModal && (
          <div className="pvwa-modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="pvwa-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pvwa-modal-header">
                <h3>Onboard Privileged Account</h3>
                <button
                  type="button"
                  className="text-[#8E9EB2] hover:text-white"
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  onAdd(e);
                  setShowAddModal(false);
                }}
              >
                <div className="pvwa-modal-body">
                  <div className="pvwa-form-grid">
                    <div className="pvwa-field">
                      <label>Account Name</label>
                      <input
                        required
                        className="pvwa-input"
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder="e.g. Administrator"
                      />
                    </div>
                    <div className="pvwa-field">
                      <label>Username</label>
                      <input
                        required
                        className="pvwa-input"
                        value={draft.username}
                        onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                        placeholder="e.g. Administrator"
                      />
                    </div>
                    <div className="pvwa-field">
                      <label>Target Address / Hostname</label>
                      <input
                        required
                        className="pvwa-input"
                        value={draft.address}
                        onChange={(e) =>
                          setDraft({ ...draft, address: e.target.value.toUpperCase() })
                        }
                        placeholder="e.g. WIN-SRV-01"
                      />
                    </div>
                    <div className="pvwa-field">
                      <label>Platform</label>
                      <Select
                        value={draft.platform}
                        onValueChange={(platform) => setDraft({ ...draft, platform })}
                      >
                        <SelectTrigger className="pvwa-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...SUPPORTED_PLATFORMS, "Unsupported platform"].map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pvwa-field">
                      <label>Safe</label>
                      <Select
                        value={draft.safe}
                        onValueChange={(safe) => setDraft({ ...draft, safe })}
                      >
                        <SelectTrigger className="pvwa-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {state.safes.map((s) => (
                            <SelectItem key={s.name} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pvwa-field">
                      <label>Account Type</label>
                      <Select
                        value={draft.type}
                        onValueChange={(type) => setDraft({ ...draft, type })}
                      >
                        <SelectTrigger className="pvwa-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Human administrator",
                            "Domain administrator",
                            "Service account",
                            "Database account",
                            "Application account",
                            "Shared privileged",
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pvwa-field">
                      <label>Account Owner</label>
                      <Select
                        value={draft.owner}
                        onValueChange={(owner) => setDraft({ ...draft, owner })}
                      >
                        <SelectTrigger className="pvwa-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...new Set([...LEARNERS, ...owners])].map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pvwa-field">
                      <label>Rotation Policy</label>
                      <input
                        disabled
                        className="pvwa-input text-[#6F8094]"
                        value="Enterprise · verify before change"
                      />
                    </div>
                    <div className="pvwa-field span-2">
                      <label>Business Purpose</label>
                      <textarea
                        required
                        rows={2}
                        className="pvwa-textarea"
                        value={draft.purpose}
                        onChange={(e) => setDraft({ ...draft, purpose: e.target.value })}
                        placeholder="Administrative responsibility and operational scope"
                      />
                    </div>
                    <div className="pvwa-field span-2">
                      <label>Application Dependency (Optional)</label>
                      <input
                        className="pvwa-input"
                        value={draft.dependency}
                        onChange={(e) => setDraft({ ...draft, dependency: e.target.value })}
                        placeholder="e.g. Core Banking Service"
                      />
                    </div>
                  </div>
                </div>
                <div className="pvwa-modal-footer">
                  <button
                    type="button"
                    className="pvwa-btn pvwa-btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="pvwa-btn pvwa-btn-primary">
                    <Plus size={14} />
                    Onboard Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AccessView({
  state,
  selectedSafe,
  setSelectedSafe,
  learner,
  accessResult,
  setAccessResult,
}: {
  state: PamState;
  selectedSafe: string;
  setSelectedSafe: (safe: string) => void;
  learner: string;
  accessResult: { allowed: boolean; message: string } | null;
  setAccessResult: (result: { allowed: boolean; message: string } | null) => void;
}) {
  const [identity, setIdentity] = useState(learner);
  const [permission, setPermission] = useState<SafePermission>("Retrieve accounts");
  const safe = state.safes.find((item) => item.name === selectedSafe);
  const selectedMember = safe?.members.find((member) => member.username === identity);
  return (
    <>
      <SectionHeading
        eyebrow="AUTHORIZATION · LEAST-PRIVILEGE TESTING"
        title="Access management"
        description="Inspect Safe membership and verify whether a specific simulated operator may perform an operation."
      />
      <div className="access-workspace">
        <Panel
          title="Permission decision test"
          note="Authorization is evaluated from the shared Safe membership state"
        >
          <div className="form-grid">
            <div className="field">
              <Label>Safe</Label>
              <Select value={selectedSafe} onValueChange={setSelectedSafe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {state.safes.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="field">
              <Label>Simulated identity</Label>
              <Select value={identity} onValueChange={setIdentity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEARNERS.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="field span-two">
              <Label>Operation</Label>
              <Select
                value={permission}
                onValueChange={(value) => setPermission(value as SafePermission)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAFE_PERMISSIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="policy-summary">
            <span>MEMBER PERMISSIONS</span>
            <p>
              {selectedMember?.permissions.join(" · ") || "No active membership for this identity."}
            </p>
          </div>
          <Button
            type="button"
            onClick={() =>
              setAccessResult(evaluatePermission(state, selectedSafe, identity, permission))
            }
          >
            Evaluate authorization
            <ArrowRight size={14} />
          </Button>
          {accessResult && (
            <div
              className={cx(
                "access-result",
                accessResult.allowed ? "access-result-ok" : "access-result-denied",
              )}
            >
              <span>
                {accessResult.allowed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              </span>
              <p>{accessResult.message}</p>
            </div>
          )}
        </Panel>
        <Panel title="Permission boundary" note="What is checked">
          <div className="boundary-list">
            {[
              {
                name: "Safe membership",
                detail: "Identity must be an active member of the selected Safe.",
              },
              {
                name: "Exact operation",
                detail:
                  "List, retrieve, use, manage and session initiation are evaluated separately.",
              },
              {
                name: "Dependencies",
                detail: "Permission setup validates prerequisite capabilities before saving.",
              },
              {
                name: "Audit evidence",
                detail: "Denied tests produce a denied event and do not change access.",
              },
            ].map((item, index) => (
              <div className="boundary-row" key={item.name}>
                <span>0{index + 1}</span>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="small-note">
            Current workspace actor: <b>{learner}</b>. This is a simulation identity, not a real
            platform role.
          </div>
        </Panel>
      </div>
    </>
  );
}

function CpmView({
  state,
  selectedAccount,
  setSelectedAccount,
  selectedCpmAccount,
  operations,
  onRun,
  onRepair,
}: {
  state: PamState;
  selectedAccount: string;
  setSelectedAccount: (id: string) => void;
  selectedCpmAccount: PamAccount | undefined;
  operations: PamState["cpmOperations"];
  onRun: (operation: CpmOperation) => void;
  onRepair: (repair: "unlock" | "reconcile-access" | "target-connectivity") => void;
}) {
  const queue = state.accounts;
  const targetAccount =
    selectedCpmAccount ?? state.accounts.find((a) => a.id === selectedAccount) ?? state.accounts[0];

  return (
    <>
      {/* Page Title & Context Toolbar */}
      <div className="pvwa-page-header">
        <div className="pvwa-page-title-block">
          <h1>
            <Activity size={20} className="text-[#00A8E8]" />
            CPM Operations
          </h1>
          <p>
            CyberArk Central Policy Manager deterministic credential verification, rotation and
            reconciliation
          </p>
        </div>
        <div className="pvwa-toolbar">
          <button
            type="button"
            className="pvwa-btn pvwa-btn-secondary"
            onClick={() => onRun("Verify")}
          >
            <SearchCheck size={14} />
            Verify
          </button>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-primary"
            onClick={() => onRun("Change")}
          >
            <RotateCcw size={14} />
            Change Password
          </button>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-secondary"
            onClick={() => onRun("Reconcile")}
          >
            <Activity size={14} />
            Reconcile
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="pvwa-metrics-strip">
        <div className="pvwa-metric-card">
          <span>MANAGED ACCOUNTS</span>
          <strong>{state.accounts.filter((a) => a.status === "Managed").length}</strong>
          <small>Eligible for automated schedule</small>
        </div>
        <div className="pvwa-metric-card">
          <span>VERIFY REQUIRED</span>
          <strong>{state.accounts.filter((a) => a.status === "Verify required").length}</strong>
          <small>Pending initial credential test</small>
        </div>
        <div
          className={cx(
            "pvwa-metric-card",
            state.accounts.some((a) => a.status === "Rotation failed") && "pvwa-metric-danger",
          )}
        >
          <span>ROTATION FAILED</span>
          <strong>{state.accounts.filter((a) => a.status === "Rotation failed").length}</strong>
          <small>Requires diagnosis & repair</small>
        </div>
        <div className="pvwa-metric-card">
          <span>PENDING RECONCILE</span>
          <strong>{state.accounts.filter((a) => a.status === "Rotation failed").length}</strong>
          <small>Review evidence before retry</small>
        </div>
      </div>

      {/* CPM Accounts Grid */}
      <div className="pvwa-grid-wrap">
        <table className="pvwa-grid">
          <thead>
            <tr>
              <th>ACCOUNT · TARGET</th>
              <th>PLATFORM · SAFE</th>
              <th>CPM STATUS</th>
              <th>LAST VERIFY</th>
              <th>LAST CHANGE</th>
              <th>LAST RECONCILE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((account) => {
              const isSelected = targetAccount?.id === account.id || selectedAccount === account.id;
              return (
                <tr
                  key={account.id}
                  onClick={() => setSelectedAccount(account.id)}
                  className={isSelected ? "selected" : ""}
                >
                  <td>
                    <strong>{account.username}</strong>
                    <small className="block text-[#8E9EB2]">{account.address}</small>
                  </td>
                  <td>
                    {account.platform}
                    <small className="block text-[#00A8E8]">{account.safe}</small>
                  </td>
                  <td>
                    <span
                      className={cx(
                        "pvwa-status-pill",
                        account.status === "Managed"
                          ? "managed"
                          : account.status === "Rotation failed"
                            ? "failed"
                            : "verify",
                      )}
                    >
                      <i className="pvwa-pulse-dot" />
                      {account.status}
                    </span>
                  </td>
                  <td>
                    <small className="text-[#8E9EB2]">{account.lastVerify}</small>
                  </td>
                  <td>
                    <small className="text-[#8E9EB2]">{account.lastChange}</small>
                  </td>
                  <td>
                    <small className="text-[#8E9EB2]">{account.lastReconcile}</small>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                        onClick={() => {
                          setSelectedAccount(account.id);
                          onRun("Verify");
                        }}
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        className="pvwa-btn pvwa-btn-sm pvwa-btn-primary"
                        onClick={() => {
                          setSelectedAccount(account.id);
                          onRun("Change");
                        }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                        onClick={() => {
                          setSelectedAccount(account.id);
                          onRun("Reconcile");
                        }}
                      >
                        Reconcile
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Account Incident & Operations Detail */}
      {targetAccount && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div className="pvwa-detail-panel" style={{ marginTop: 0 }}>
            <div className="pvwa-detail-header">
              <div className="pvwa-detail-title">
                <Activity size={16} className="text-[#00A8E8]" />
                <h3>CPM Operation History: {targetAccount.username}</h3>
              </div>
            </div>
            <div className="pvwa-detail-body" style={{ maxHeight: 320, overflowY: "auto" }}>
              {operations.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {operations.map((op) => (
                    <div
                      key={op.id}
                      style={{
                        padding: 8,
                        background: "#0B0F14",
                        border: "1px solid #1C2633",
                        borderRadius: 3,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          color: op.result === "Completed" ? "#34D399" : "#F87171",
                          marginTop: 2,
                        }}
                      >
                        {op.result === "Completed" ? (
                          <Check size={14} />
                        ) : (
                          <AlertTriangle size={14} />
                        )}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>
                            {op.operation} · {op.result}
                          </strong>
                          <span style={{ fontSize: 11, color: "#6F8094" }}>{op.time}</span>
                        </div>
                        <p style={{ margin: "2px 0 0 0", color: "#8E9EB2", fontSize: 11 }}>
                          {op.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{ textAlign: "center", color: "#6F8094", fontSize: 12, margin: "20px 0" }}
                >
                  No operations recorded for this account. Run Verify or Change to generate
                  evidence.
                </p>
              )}
            </div>
          </div>

          <div className="pvwa-detail-panel" style={{ marginTop: 0 }}>
            <div className="pvwa-detail-header">
              <div className="pvwa-detail-title">
                <KeyRound size={16} className="text-[#00A8E8]" />
                <h3>Diagnostic Console: {targetAccount.address}</h3>
              </div>
            </div>
            <div className="pvwa-detail-body">
              <div className="pvwa-facts-grid">
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">PLATFORM</span>
                  <span className="pvwa-fact-value">{targetAccount.platform}</span>
                </div>
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">SAFE</span>
                  <span className="pvwa-fact-value">{targetAccount.safe}</span>
                </div>
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">STATUS</span>
                  <span className="pvwa-fact-value">{targetAccount.status}</span>
                </div>
                <div className="pvwa-fact">
                  <span className="pvwa-fact-label">POLICY</span>
                  <span className="pvwa-fact-value">{targetAccount.policy}</span>
                </div>
              </div>

              {targetAccount.failureCause && (
                <div className="pvwa-failure-box" style={{ marginTop: 12 }}>
                  <AlertTriangle size={16} />
                  <div>
                    <strong>Failure Root Cause</strong>
                    <p>{targetAccount.failureCause}</p>
                  </div>
                </div>
              )}

              {targetAccount.failureCause && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    background: "#0B0F14",
                    border: "1px solid #263241",
                    borderRadius: 4,
                  }}
                >
                  <strong
                    style={{
                      fontSize: 11,
                      color: "#F87171",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    One-Click Incident Recovery
                  </strong>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                      onClick={() => onRepair("unlock")}
                    >
                      <Power size={13} />
                      Unlock Target Account
                    </button>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                      onClick={() => onRepair("reconcile-access")}
                    >
                      <KeyRound size={13} />
                      Restore Reconcile Access
                    </button>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                      onClick={() => onRepair("target-connectivity")}
                    >
                      <Network size={13} />
                      Repair Connectivity
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-primary"
                  onClick={() => onRun("Change")}
                >
                  <RotateCcw size={14} />
                  Retry Password Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PsmView({
  state,
  onLaunch,
  onApproval,
  onClose,
  onCommand,
  onExecuteCommand,
  session,
  command,
  setCommand,
  terminalEnd,
}: {
  state: PamState;
  onLaunch: (event: FormEvent<HTMLFormElement>) => void;
  onApproval: () => void;
  onClose: () => void;
  onCommand: (event: FormEvent<HTMLFormElement>) => void;
  onExecuteCommand: (command: string) => void;
  session: PamState["sessions"][number] | undefined;
  command: string;
  setCommand: (command: string) => void;
  terminalEnd: React.RefObject<HTMLDivElement | null>;
}) {
  const [psmTab, setPsmTab] = useState<"launch" | "console" | "recordings">(
    session ? "console" : "launch",
  );
  const recent = state.sessions;

  return (
    <>
      {/* Page Title & Context Toolbar */}
      <div className="pvwa-page-header">
        <div className="pvwa-page-title-block">
          <h1>
            <MonitorPlay size={20} className="text-[#00A8E8]" />
            PSM Operations
          </h1>
          <p>
            CyberArk Privileged Session Manager brokered access, recording controls and session
            telemetry
          </p>
        </div>
      </div>

      {/* Top Status Strip */}
      <div className="pvwa-metrics-strip">
        <div className="pvwa-metric-card">
          <span>PSM GATEWAY STATUS</span>
          <strong style={{ color: "#34D399" }}>HEALTHY</strong>
          <small>RDP/SSH proxy port 3389 active</small>
        </div>
        <div className="pvwa-metric-card">
          <span>ACTIVE SESSIONS</span>
          <strong>{state.sessions.filter((s) => s.status === "Active").length}</strong>
          <small>Monitored live in isolation</small>
        </div>
        <div className="pvwa-metric-card">
          <span>RECORDED ARCHIVE</span>
          <strong>{state.sessions.length}</strong>
          <small>Retained for audit evidence</small>
        </div>
        <div className="pvwa-metric-card">
          <span>RECORDING POLICY</span>
          <strong style={{ color: "#00A8E8" }}>100% CAPTURED</strong>
          <small>Full keystroke and screen telemetry</small>
        </div>
      </div>

      {/* Subnav Tabs */}
      <div className="pvwa-detail-tabs" style={{ marginBottom: 14 }}>
        <button
          type="button"
          className={cx("pvwa-tab-btn", psmTab === "launch" && "active")}
          onClick={() => setPsmTab("launch")}
        >
          Launch Privileged Session
        </button>
        <button
          type="button"
          className={cx("pvwa-tab-btn", psmTab === "console" && "active")}
          onClick={() => setPsmTab("console")}
        >
          Active Console {session ? "(LIVE)" : ""}
        </button>
        <button
          type="button"
          className={cx("pvwa-tab-btn", psmTab === "recordings" && "active")}
          onClick={() => setPsmTab("recordings")}
        >
          Session Monitoring & Recordings ({recent.length})
        </button>
      </div>

      {psmTab === "launch" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
          <div className="pvwa-detail-panel" style={{ marginTop: 0 }}>
            <div className="pvwa-detail-header">
              <div className="pvwa-detail-title">
                <Play size={16} className="text-[#00A8E8]" />
                <h3>Launch Brokered Session</h3>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                onLaunch(e);
                setPsmTab("console");
              }}
            >
              <div className="pvwa-detail-body">
                <div className="pvwa-form-grid">
                  <div className="pvwa-field">
                    <label>Target Server</label>
                    <Select name="psm-target" defaultValue="WIN-SRV-01">
                      <SelectTrigger className="pvwa-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["WIN-SRV-01", "WIN-SRV-02", "WIN-DC-01", "WIN-APP-01"].map((target) => (
                          <SelectItem value={target} key={target}>
                            {target}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pvwa-field">
                    <label>Target Account</label>
                    <input disabled className="pvwa-input text-[#6F8094]" value="Administrator" />
                  </div>
                  <div className="pvwa-field">
                    <label>Connection Protocol / Component</label>
                    <input disabled className="pvwa-input text-[#6F8094]" value="RDP through PSM" />
                  </div>
                  <div className="pvwa-field">
                    <label>Ticket Reference</label>
                    <input
                      required
                      name="psm-ticket"
                      className="pvwa-input"
                      defaultValue="CHG-89042"
                    />
                  </div>
                  <div className="pvwa-field span-2">
                    <label>Business Justification (12+ characters)</label>
                    <textarea
                      required
                      name="psm-reason"
                      rows={2}
                      className="pvwa-textarea"
                      defaultValue="Emergency diagnostic verification and performance telemetry audit"
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    background: "#0B0F14",
                    border: "1px solid #1C2633",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 12, color: "#FFFFFF" }}>
                      Dual Control & Operator Approval
                    </strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#8E9EB2" }}>
                      {state.approvalGranted
                        ? "Approval verified for this session"
                        : "Session launch requires operator authorization"}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      className={cx(
                        "pvwa-status-pill",
                        state.approvalGranted ? "managed" : "verify",
                      )}
                    >
                      {state.approvalGranted ? "APPROVED" : "PENDING APPROVAL"}
                    </span>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                      onClick={onApproval}
                    >
                      {state.approvalGranted ? "Withdraw" : "Grant Approval"}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="pvwa-btn pvwa-btn-primary"
                    disabled={!state.psmConnectorHealthy || Boolean(session)}
                  >
                    <Play size={14} />
                    Launch Through PSM
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="pvwa-detail-panel" style={{ marginTop: 0 }}>
            <div className="pvwa-detail-header">
              <div className="pvwa-detail-title">
                <ClipboardCheck size={16} className="text-[#00A8E8]" />
                <h3>Access Preflight Gate</h3>
              </div>
            </div>
            <div className="pvwa-detail-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  {
                    label: "Safe Session Permission",
                    ok: true,
                    detail: "WIN-SAFE · Initiate privileged sessions",
                  },
                  {
                    label: "Operator Approval",
                    ok: state.approvalGranted,
                    detail: state.approvalGranted ? "Verified" : "Pending request",
                  },
                  {
                    label: "PSM Connector",
                    ok: state.psmConnectorHealthy,
                    detail: "Port 3389 reachable",
                  },
                  { label: "Audit Recording Policy", ok: true, detail: "100% captured" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}
                  >
                    <span style={{ color: item.ok ? "#34D399" : "#FBBF24" }}>
                      {item.ok ? <Check size={14} /> : <Clock3 size={14} />}
                    </span>
                    <div>
                      <strong className="block text-[#E8EEF5]">{item.label}</strong>
                      <small className="text-[#8E9EB2]">{item.detail}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {psmTab === "console" && (
        <div className="pvwa-detail-panel" style={{ marginTop: 0 }}>
          <div className="pvwa-detail-header">
            <div className="pvwa-detail-title">
              <Terminal size={16} className="text-[#00A8E8]" />
              <h3>Controlled Session Console</h3>
              <span>
                ·{" "}
                {session
                  ? `${session.target} (${session.account}) · ${session.ticket}`
                  : "Standby — Launch an approved session"}
              </span>
            </div>
            {session && (
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-danger"
                onClick={onClose}
              >
                <Power size={13} />
                Terminate Session
              </button>
            )}
          </div>
          <div className="pvwa-detail-body">
            <div className="pvwa-terminal">
              <div className="pvwa-terminal-titlebar">
                <span>
                  {session
                    ? `psm-session://${session.target}/${session.account}`
                    : "psm-session://awaiting-launch"}
                </span>
                <span style={{ color: session ? "#34D399" : "#6F8094", fontWeight: 700 }}>
                  {session ? "● SESSION ACTIVE · RECORDING" : "STANDBY"}
                </span>
              </div>
              <div className="pvwa-terminal-body">
                <div>
                  ShadowXLab Controlled Enterprise Shell
                  <br />
                  Target System: {session?.target ?? "not connected"}
                  <br />
                  Privileged Identity: {session?.account ?? "not authenticated"}
                  <br />
                  Type <strong>help</strong> to list allowed simulator commands.
                </div>
                {session?.commands.map((entry, index) => {
                  const [cmd, ...output] = entry.split("\n");
                  return (
                    <div key={`${session.id}-${index}`} style={{ marginTop: 8 }}>
                      <div>
                        <span style={{ color: "#38BDF8" }}>PS&gt;</span> {cmd}
                      </div>
                      {output.map((line, idx) => (
                        <pre
                          key={idx}
                          style={{ margin: 0, color: "#E8EEF5", fontFamily: "inherit" }}
                        >
                          {line}
                        </pre>
                      ))}
                    </div>
                  );
                })}
                <div ref={terminalEnd} />
              </div>
              <form className="pvwa-terminal-input-row" onSubmit={onCommand}>
                <span style={{ color: "#38BDF8", fontWeight: 700 }}>PS&gt;</span>
                <input
                  aria-label="Simulated terminal command"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  disabled={!session || session.status !== "Active"}
                  placeholder={
                    session
                      ? "Enter command (e.g. whoami, hostname, Get-Service)..."
                      : "Launch an approved session to start"
                  }
                />
                <button
                  type="submit"
                  className="pvwa-btn pvwa-btn-sm pvwa-btn-primary"
                  disabled={!session || session.status !== "Active" || !command.trim()}
                >
                  <ArrowRight size={13} />
                </button>
              </form>
            </div>

            {/* Command Shortcut Chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {TERMINAL_COMMANDS.map((cmdItem) => (
                <button
                  key={cmdItem}
                  type="button"
                  className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                  disabled={!session || session.status !== "Active"}
                  onClick={() => onExecuteCommand(cmdItem)}
                >
                  {cmdItem}
                </button>
              ))}
            </div>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: 11,
                color: "#6F8094",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Shield size={12} />
              Commands return deterministic simulated telemetry and never execute on the host OS.
            </p>
          </div>
        </div>
      )}

      {psmTab === "recordings" && (
        <div className="pvwa-grid-wrap">
          <table className="pvwa-grid">
            <thead>
              <tr>
                <th>TARGET SYSTEM</th>
                <th>ACCOUNT</th>
                <th>COMPONENT</th>
                <th>TICKET</th>
                <th>STARTED</th>
                <th>COMMANDS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.target}</strong>
                  </td>
                  <td>{item.account}</td>
                  <td>{item.component}</td>
                  <td>
                    <span className="pvwa-code-cell">{item.ticket}</span>
                  </td>
                  <td>{item.started}</td>
                  <td>{item.commands.length} executed</td>
                  <td>
                    <span
                      className={cx(
                        "pvwa-status-pill",
                        item.status === "Active" ? "managed" : "unmanaged",
                      )}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function PoliciesView({ state }: { state: PamState }) {
  const policies = [
    {
      name: "Windows-90d",
      platform: "Windows Server Local / Domain",
      interval: "90 days",
      minLength: 24,
      complexity: "Upper, lower, digits, symbols",
      dualControl: true,
      accounts: state.accounts.filter((a) => a.platform.includes("Windows")).length,
    },
    {
      name: "Unix-SSH-60d",
      platform: "Unix SSH",
      interval: "60 days",
      minLength: 32,
      complexity: "High-entropy alphanumeric + key rotation",
      dualControl: false,
      accounts: state.accounts.filter((a) => a.platform.includes("Unix")).length,
    },
    {
      name: "DBA-Strong-30d",
      platform: "SQL Server / Oracle Database",
      interval: "30 days",
      minLength: 28,
      complexity: "Database compliant, no repeated characters",
      dualControl: true,
      accounts: state.accounts.filter(
        (a) => a.platform.includes("SQL") || a.platform.includes("Oracle"),
      ).length,
    },
    {
      name: "App-Static-Managed",
      platform: "Application Account",
      interval: "180 days",
      minLength: 30,
      complexity: "Service token & secret rotation",
      dualControl: true,
      accounts: state.accounts.filter((a) => a.platform.includes("Application")).length,
    },
  ];

  return (
    <>
      <SectionHeading
        eyebrow="GOVERNANCE · ROTATION POLICIES"
        title="PAM security policies"
        description="Inspect enterprise password rotation profiles, dual-control enforcement, and complexity constraints applied across target platforms."
      />
      <div className="policies-grid">
        {policies.map((pol) => (
          <Panel key={pol.name} title={pol.name} note={pol.platform}>
            <div className="detail-facts">
              <Detail label="ROTATION FREQUENCY" value={pol.interval} />
              <Detail label="MINIMUM LENGTH" value={`${pol.minLength} characters`} />
              <Detail label="COMPLEXITY RULES" value={pol.complexity} />
              <Detail
                label="DUAL CONTROL GATE"
                value={
                  pol.dualControl ? "Enforced (Requires Ticket & Approval)" : "Standard Access"
                }
              />
              <Detail label="ASSIGNED ACCOUNTS" value={`${pol.accounts} accounts in inventory`} />
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}

function DiscoveryView({ state, onOnboard }: { state: PamState; onOnboard: () => void }) {
  const candidates = [
    {
      username: "svc_etl_sync",
      target: "SQL-PROD-01",
      platform: "SQL Server Account",
      source: "Active Directory ServiceScan",
      risk: "High",
      reason: "Unmanaged privileged service account with database admin rights",
    },
    {
      username: "deploy_runner",
      target: "WIN-APP-01",
      platform: "Windows Server Local",
      source: "Host Credential Discovery",
      risk: "Medium",
      reason: "Interactive local admin account outside Safe protection",
    },
    {
      username: "oracle_sys_ro",
      target: "DB-FIN-01",
      platform: "Oracle Database",
      source: "DBA Inventory Reconciler",
      risk: "Critical",
      reason: "Standing SYSDBA role detected without automated rotation",
    },
    {
      username: "ops_backup",
      target: "WIN-DC-01",
      platform: "Windows Domain Account",
      source: "Domain Controller Crawler",
      risk: "Critical",
      reason: "Domain Admins member with unmonitored password age > 180 days",
    },
  ];

  return (
    <>
      <SectionHeading
        eyebrow="CONTINUOUS DISCOVERY · IDENTITY AUDIT"
        title="Discovered candidate identities"
        description="Review unmanaged privileged identities detected by network discovery crawlers and onboard them into managed Safes."
        actions={
          <Button type="button" onClick={onOnboard}>
            <Plus size={14} />
            Onboard Discovered Identity
          </Button>
        }
      />
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>DISCOVERED IDENTITY</th>
              <th>TARGET HOST</th>
              <th>PLATFORM</th>
              <th>DETECTION SOURCE</th>
              <th>RISK TIER</th>
              <th>FINDING DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((cand) => (
              <tr key={`${cand.target}-${cand.username}`}>
                <td>
                  <strong>{cand.username}</strong>
                </td>
                <td>{cand.target}</td>
                <td>{cand.platform}</td>
                <td>
                  <span className="code-cell">{cand.source}</span>
                </td>
                <td>
                  <Badge
                    variant="outline"
                    className={cand.risk === "Critical" ? "badge-danger" : "badge-warning"}
                  >
                    {cand.risk}
                  </Badge>
                </td>
                <td>{cand.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AuditView({
  state,
  search,
  setSearch,
}: {
  state: PamState;
  search: string;
  setSearch: (v: string) => void;
}) {
  const [filterResult, setFilterResult] = useState<string>("all");
  const filtered = useMemo(() => {
    return state.audit.filter((event) => {
      const matchSearch =
        !search ||
        [event.actor, event.action, event.target, event.detail].some((v) =>
          v.toLowerCase().includes(search.toLowerCase()),
        );
      const matchResult =
        filterResult === "all" || event.result.toLowerCase() === filterResult.toLowerCase();
      return matchSearch && matchResult;
    });
  }, [state.audit, search, filterResult]);

  return (
    <>
      <SectionHeading
        eyebrow="IMMUTABLE AUDIT TRAIL · COMPLIANCE"
        title="Audit and operational evidence"
        description="Review end-to-end evidence generated by Safe changes, CPM password operations, and PSM brokered sessions."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.success("Audit evidence exported to compliance bundle.")}
          >
            <FileClock size={14} />
            Export Audit Log
          </Button>
        }
      />
      <div className="table-toolbar">
        <div className="search-field">
          <Search size={14} />
          <Input
            aria-label="Search audit"
            placeholder="Search actor, action, target or detail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterResult} onValueChange={setFilterResult}>
          <SelectTrigger className="filter-select">
            <SlidersHorizontal size={14} />
            <SelectValue placeholder="All results" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All event outcomes</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <span className="result-count">{filtered.length} AUDIT EVENTS</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>ACTOR</th>
              <th>ACTION</th>
              <th>TARGET</th>
              <th>OUTCOME</th>
              <th>EVENT EVIDENCE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.time}</td>
                <td>
                  <strong>{item.actor}</strong>
                </td>
                <td>{item.action}</td>
                <td>
                  <span className="code-cell">{item.target}</span>
                </td>
                <td>
                  <StatusBadge
                    tone={
                      item.result === "Success" ? "good" : item.result === "Denied" ? "bad" : "warn"
                    }
                  >
                    {item.result}
                  </StatusBadge>
                </td>
                <td>{item.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TroubleshootingView({
  state,
  setActive,
  setSelectedAccount,
}: {
  state: PamState;
  setActive: (v: SectionId) => void;
  setSelectedAccount: (id: string) => void;
}) {
  const failedAccounts = state.accounts.filter(
    (a) => a.status === "Rotation failed" || a.status === "Verify required" || a.failureCause,
  );

  return (
    <>
      <SectionHeading
        eyebrow="INCIDENT TRIAGE · ROOT-CAUSE ANALYSIS"
        title="PAM incident troubleshooting"
        description="Diagnose authentication divergence, lockout conditions and connector failures following the systematic recovery playbook."
      />
      <div className="troubleshooting-grid">
        <Panel
          title="Open incident queue"
          note={`${failedAccounts.length} accounts requiring administrative remediation`}
        >
          <div className="attention-list">
            {failedAccounts.map((account) => (
              <div key={account.id} className="attention-row">
                <span className="attention-icon critical">
                  <AlertTriangle size={15} />
                </span>
                <div>
                  <strong>
                    {account.username} · {account.address}
                  </strong>
                  <small>Failure: {account.failureCause ?? "Verification required"}</small>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedAccount(account.id);
                    setActive("cpm");
                  }}
                >
                  Triage in CPM <ArrowRight size={14} />
                </Button>
              </div>
            ))}
            {failedAccounts.length === 0 && (
              <EmptyState
                title="No open incidents"
                detail="All credentials and targets are in a verified state."
                icon={CheckCircle2}
              />
            )}
          </div>
        </Panel>

        <Panel title="Remediation playbook" note="STANDARDIZED OPERATIONAL WORKFLOW">
          <div className="boundary-list">
            <div className="boundary-row">
              <span>01</span>
              <div>
                <strong>Identify root cause</strong>
                <p>
                  Differentiate between target lockout, network unreachable, and reconciliation
                  permission deficiency.
                </p>
              </div>
            </div>
            <div className="boundary-row">
              <span>02</span>
              <div>
                <strong>Execute distinct repair action</strong>
                <p>
                  Run the specific repair matching the target fault (unlock target, verify
                  connectivity, or restore reconcile access).
                </p>
              </div>
            </div>
            <div className="boundary-row">
              <span>03</span>
              <div>
                <strong>Reconcile credential synchronization</strong>
                <p>
                  When Vault and target passwords diverge, invoke Reconcile to restore credential
                  synchronization.
                </p>
              </div>
            </div>
            <div className="boundary-row">
              <span>04</span>
              <div>
                <strong>Retry password change and verify</strong>
                <p>
                  Perform a controlled CPM Change followed by immediate Verify to confirm healthy
                  operational state.
                </p>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function AssessmentView({
  answers,
  setAnswers,
  result,
  setResult,
  markLabComplete,
}: {
  answers: Record<number, number>;
  setAnswers: (ans: Record<number, number>) => void;
  result: { score: number; correct: number } | null;
  setResult: (res: { score: number; correct: number } | null) => void;
  markLabComplete: (score?: number) => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    let correct = 0;
    ASSESSMENT_QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.answer) correct++;
    });
    const calculatedScore = Math.round((correct / ASSESSMENT_QUESTIONS.length) * 100);
    const res = { score: calculatedScore, correct };
    setResult(res);
    setSubmitted(true);
    if (calculatedScore >= 80) {
      markLabComplete(calculatedScore);
      toast.success(`Assessment passed! Score: ${calculatedScore}%.`);
    } else {
      toast.error(`Assessment score: ${calculatedScore}%. Review the rationales and retry.`);
    }
  }

  return (
    <>
      <SectionHeading
        eyebrow="KNOWLEDGE VERIFICATION · CERTIFICATION"
        title="PAM operational assessment"
        description="Test your operational comprehension of Safe boundaries, CPM state transitions, and brokered session security."
      />
      <div className="assessment-container">
        {ASSESSMENT_QUESTIONS.map((q, idx) => (
          <Panel
            key={q.prompt}
            title={`Question ${idx + 1}`}
            note={
              submitted
                ? answers[idx] === q.answer
                  ? "CORRECT"
                  : "INCORRECT"
                : "Select the best answer"
            }
          >
            <p className="assessment-prompt">{q.prompt}</p>
            <div className="assessment-options">
              {q.options.map((opt, optIdx) => (
                <label
                  key={opt}
                  className={cx(
                    "assessment-option",
                    answers[idx] === optIdx && "option-selected",
                    submitted && optIdx === q.answer && "option-correct",
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    checked={answers[idx] === optIdx}
                    onChange={() => setAnswers({ ...answers, [idx]: optIdx })}
                    disabled={submitted}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {submitted && (
              <div className="assessment-rationale">
                <strong>Rationale:</strong> <span>{q.rationale}</span>
              </div>
            )}
          </Panel>
        ))}

        <div className="flex gap-4 items-center mt-6">
          <Button
            type="button"
            onClick={
              submitted
                ? () => {
                    setSubmitted(false);
                    setResult(null);
                  }
                : handleSubmit
            }
          >
            {submitted ? "Retake Assessment" : "Submit Assessment"}
          </Button>
          {result && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={result.score >= 80 ? "badge-complete" : "badge-danger"}
              >
                Score: {result.score}% ({result.correct} / {ASSESSMENT_QUESTIONS.length} correct)
              </Badge>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function KnowledgeView({
  setActive,
  setSelectedClass,
}: {
  setActive: (s: SectionId) => void;
  setSelectedClass: (c: string) => void;
}) {
  return (
    <>
      <SectionHeading
        eyebrow="CONTROL PLANE ARCHITECTURE · REFERENCE"
        title="PAM knowledge base"
        description="Core technical reference for Digital Vault, Web Access, CPM rotation engine, PSM session proxy, and least-privilege security boundaries."
      />
      <div className="knowledge-grid">
        <Panel title="The 5 PAM Control Plane Pillars" note="ARCHITECTURAL FOUNDATION">
          <div className="detail-facts">
            <Detail
              label="DIGITAL VAULT"
              value="Hardened, encrypted central repository enforcing Safe boundary access control lists and immutable audit storage."
            />
            <Detail
              label="PVWA GATEWAY"
              value="Unified web interface providing operator workflows, request authorizations, and inventory visibility."
            />
            <Detail
              label="CPM ENGINE"
              value="Central Policy Manager executing automated verify, change, and reconcile operations across enterprise targets."
            />
            <Detail
              label="PSM BROKER"
              value="Privileged Session Manager injecting credentials dynamically into recorded, monitored, and isolable RDP/SSH sessions."
            />
            <Detail
              label="TARGET ENDPOINTS"
              value="Enterprise Windows servers, Linux hosts, SQL Server instances, and Oracle databases under PAM governance."
            />
          </div>
        </Panel>

        <Panel title="Academy Curriculum Quick Links" note="JUMP TO HANDS-ON CLASS">
          <div className="attention-list">
            {CLASSES.map((cls) => (
              <div key={cls.id} className="attention-row">
                <div>
                  <strong>
                    {cls.label} · {cls.title}
                  </strong>
                  <small>{cls.subtitle}</small>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedClass(cls.id);
                    setActive("academy");
                  }}
                >
                  Start <ArrowRight size={14} />
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function InstructorView({
  state,
  learner,
  setLearner,
  setActive,
  resetLab,
}: {
  state: PamState;
  learner: string;
  setLearner: (l: string) => void;
  setActive: (s: SectionId) => void;
  resetLab: () => void;
}) {
  return (
    <>
      <SectionHeading
        eyebrow="ADMINISTRATIVE CONSOLE · SIMULATION GOVERNANCE"
        title="Instructor console"
        description="Switch simulated operator identities, inspect student progress rubrics, and reset simulation state."
      />
      <div className="overview-grid">
        <Panel title="Simulated Operator Context" note="ACTIVE EXPERIMENTAL IDENTITY">
          <p className="muted-copy">
            Select an operator persona to evaluate permission isolation and Safe membership
            boundaries.
          </p>
          <div className="permission-grid mt-4">
            {LEARNERS.map((id) => (
              <Button
                key={id}
                type="button"
                variant={learner === id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setLearner(id);
                  toast.success(`Switched identity to ${id}`);
                }}
              >
                {learner === id && <Check size={14} />} {id}
              </Button>
            ))}
          </div>
        </Panel>

        <Panel title="Simulation State Management" note="LAB REINITIALIZATION">
          <p className="muted-copy">
            Reset the entire simulation workspace back to the initial baseline for reproducible
            testing and objective re-evaluation.
          </p>
          <div className="mt-4">
            <Button type="button" variant="destructive" onClick={resetLab}>
              <RotateCcw size={14} />
              Reset All Simulation Data
            </Button>
          </div>
        </Panel>
      </div>

      <Panel
        title="Student Lab Progress Rubric"
        note="OPERATIONAL READINESS STATUS"
        className="mt-6"
      >
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>CLASS</th>
                <th>LAB NAME</th>
                <th>OBJECTIVE CRITERIA</th>
                <th>STATUS</th>
                <th>SCORE</th>
              </tr>
            </thead>
            <tbody>
              {CLASSES.flatMap((cls) =>
                cls.labs.map((lab) => {
                  const completed = state.completedLabs.includes(lab);
                  const score = state.scores[lab] ?? 0;
                  return (
                    <tr key={lab}>
                      <td>
                        <strong>{cls.label}</strong>
                      </td>
                      <td>{lab}</td>
                      <td>{PRACTICES[lab] ?? "Meet explicit criteria."}</td>
                      <td>
                        <StatusBadge tone={completed ? "good" : "warn"}>
                          {completed ? "PASSED" : "PENDING"}
                        </StatusBadge>
                      </td>
                      <td>{completed ? `${score} / 100` : "—"}</td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
