import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, BookText, Boxes,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, Clock3, Command,
  Database, FileClock, Fingerprint, GraduationCap, KeyRound, LayoutDashboard, LifeBuoy, LockKeyhole,
  LogOut, Menu, MonitorPlay, Network, Play, Plus, Power, RotateCcw, Search, SearchCheck, Server,
  Shield, SlidersHorizontal, Terminal, UsersRound, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import {
  SAFE_PERMISSIONS, LEARNERS, addAccount, addSafe, appendSessionCommand, canSafeMemberPerform,
  completeLab, evaluatePermission, launchPsmSession, makeInitialPamState, permissionDependencies,
  repairCpmFailure, resetPamState, runCpmOperation, setSafeMember,
  type CpmOperation, type PamAccount, type PamSafe, type PamState, type SafePermission,
} from "@/lib/pam-engine";
import { toast } from "sonner";

type SectionId = "overview" | "academy" | "environment" | "safes" | "accounts" | "access" | "cpm" | "psm" | "policies" | "discovery" | "audit" | "troubleshooting" | "assessments" | "knowledge" | "instructor";

const NAV_GROUPS: { label: string; items: { id: SectionId; title: string; icon: typeof Activity }[] }[] = [
  { label: "WORKSPACE", items: [
    { id: "overview", title: "Overview", icon: LayoutDashboard },
    { id: "academy", title: "Learning Academy", icon: BookOpen },
    { id: "environment", title: "PAM Environment", icon: Network },
  ] },
  { label: "OPERATIONS", items: [
    { id: "safes", title: "Safes", icon: Boxes },
    { id: "accounts", title: "Accounts", icon: KeyRound },
    { id: "access", title: "Access Management", icon: UsersRound },
    { id: "cpm", title: "CPM Operations", icon: CircleGaugeIcon },
    { id: "psm", title: "PSM Operations", icon: MonitorPlay },
    { id: "policies", title: "Policies", icon: SlidersHorizontal },
    { id: "discovery", title: "Discovery", icon: SearchCheck },
  ] },
  { label: "LEARN & REVIEW", items: [
    { id: "audit", title: "Audit & Reports", icon: FileClock },
    { id: "troubleshooting", title: "Troubleshooting", icon: LifeBuoy },
    { id: "assessments", title: "Assessments", icon: ClipboardCheck },
    { id: "knowledge", title: "Knowledge Base", icon: BookText },
    { id: "instructor", title: "Instructor Console", icon: GraduationCap },
  ] },
];
function CircleGaugeIcon(props: React.ComponentProps<typeof Activity>) { return <Activity {...props} />; }

const CLASSES = [
  { id: "class-01", label: "CLASS 01", title: "PAM foundations & administrator role", subtitle: "Architecture, credential risk and the enterprise PAM workflow", labs: ["Lab 01 · Trace the PAM architecture"] },
  { id: "class-02", label: "CLASS 02", title: "Safe administration & access management", subtitle: "Safe structure, permission boundaries and least privilege", labs: ["Lab 02 · Provision DBA-SAFE access"] },
  { id: "class-03", label: "CLASS 03", title: "Privileged account onboarding", subtitle: "Platform selection, account properties and onboarding validation", labs: ["Lab 03 · Onboard WIN-SRV-01 Administrator"] },
  { id: "class-04", label: "CLASS 04", title: "Identity & privileged account security", subtitle: "Human and non-human identities, classification and lifecycle", labs: ["Lab 04 · Classify the enterprise inventory"] },
  { id: "class-05", label: "CLASS 05", title: "CPM operations & password management", subtitle: "Verify, change, reconcile and evidence-led incident recovery", labs: ["Lab 05A · Rotate a managed credential", "Lab 05B · Recover a failed rotation"] },
  { id: "class-06", label: "CLASS 06", title: "PSM operations & session management", subtitle: "Approval, credential injection, recording and session audit", labs: ["Lab 06A · Launch an approved session", "Lab 06B · Diagnose a PSM launch failure"] },
];

const CLASS_TOPICS: Record<string, string[]> = {
  "class-01": ["Privileged access risk & lateral movement", "Credential lifecycle and accountability", "Vault, PVWA, CPM and PSM responsibilities", "Authentication versus privileged authentication", "Password vaulting, rotation and session brokering", "PAM request-to-audit operational flow"],
  "class-02": ["Safe ownership, members and boundaries", "Permission dependencies and least privilege", "Separation of duties and dual control", "Windows, Linux, DBA and application Safe design", "Access reviews, audit and Safe lifecycle", "Permission denials and systematic troubleshooting"],
  "class-03": ["Account types: local, domain, SSH, database and service", "Ownership, business purpose and dependencies", "Platform selection and onboarding properties", "Verify before enabling management", "Safe inventory and account lifecycle", "Address, username, platform and connectivity failures"],
  "class-04": ["Human versus non-human identity", "Technical custodian and business owner", "Shared account attribution and accountability", "Risk classification and privilege boundaries", "Service dependency and rotation readiness", "Discovery through recertification and retirement"],
  "class-05": ["CPM architecture and platform plugin responsibilities", "Verify: test Vault credential against target", "Change: rotate target and update the Vault safely", "Reconcile: restore synchronization after divergence", "Rotation schedules, complexity and dependencies", "Connectivity, privilege, lockout and plugin failure analysis", "Operation logs, retry gates and recovery evidence"],
  "class-06": ["PSM broker and connection component flow", "Credential injection without learner exposure", "Approval gates, tickets and session policies", "Session recording, monitoring and termination", "Authorization, target, connector and network failures", "Event timeline and incident evidence"],
};

const COMPONENTS = [
  { id: "Administrator", x: "8%", y: "45%", purpose: "Starts an approved privileged workflow from an authenticated operator identity.", responsibilities: "Request access, specify business justification, select an eligible account and review the resulting audit evidence.", inputs: "Authenticated identity, ticket reference, business reason.", outputs: "Audited request and attributed administrative intent.", dependency: "Identity provider, authorization policy and correct Safe membership.", failure: "Access denied when membership is missing, ticket is invalid or approval has not been granted.", task: "Review the request context before granting the shortest access needed.", ticket: "INC-40218 · Request blocked after team transfer" },
  { id: "PVWA", x: "29%", y: "20%", purpose: "The web access layer for safe, account and session workflows.", responsibilities: "Applies user-facing authorization, surfaces account inventory and initiates approved CPM or PSM actions.", inputs: "Authenticated requests and approved operational intent.", outputs: "Vault operations, CPM requests and PSM connection requests.", dependency: "Vault availability, identity services and correct permissions.", failure: "Login can succeed while a Safe-level operation still returns denied.", task: "Separate authentication success from authorization success in the investigation.", ticket: "INC-40192 · Vault reachable, Safe access denied" },
  { id: "Vault", x: "50%", y: "45%", purpose: "Protected storage for privileged credentials, Safes, policy and operational audit.", responsibilities: "Enforces Safe boundaries, stores account records and provides controlled credential operations.", inputs: "PVWA account queries, CPM actions, PSM requests and policy checks.", outputs: "Authorized records, controlled credential delivery and audit evidence.", dependency: "Healthy authorization policies, storage and trusted component connections.", failure: "A mis-scoped permission can deny list, retrieval, management or session access independently.", task: "Check the affected Safe policy and audit event before changing an account.", ticket: "INC-40403 · Account hidden by a Safe membership boundary" },
  { id: "CPM", x: "70%", y: "20%", purpose: "Manages target credential verification, password changes and reconciliation.", responsibilities: "Runs platform-specific operations, tracks schedule state and records evidence and failure context.", inputs: "Managed account properties, target connectivity, platform policy and account permissions.", outputs: "Verified, rotated or reconciled credential state and operation logs.", dependency: "Correct platform, reachable target, valid credential and adequate target account rights.", failure: "Lockout, complexity mismatch, target outage, dependency or plugin mismatch.", task: "Inspect account details and CPM result before deciding whether to reconcile or retry.", ticket: "INC-40511 · Password change failed; service account locked" },
  { id: "PSM", x: "70%", y: "70%", purpose: "Brokers privileged sessions through an approved connection component.", responsibilities: "Validates session access, injects credentials, records activity and supports termination.", inputs: "Authorized Safe account, target, connection component, approval and ticket.", outputs: "Isolated session, timestamped recording and termination event.", dependency: "PSM connector health, target connectivity and session authorization.", failure: "A missing approval, wrong component or unhealthy connector prevents launch.", task: "Inspect the authorization decision and connector status before retrying.", ticket: "INC-40602 · RDP connection rejected by connector" },
  { id: "Target System", x: "91%", y: "45%", purpose: "The Windows, Linux, database or application endpoint receiving a controlled operation.", responsibilities: "Applies its own authentication, password rules, availability and platform behavior.", inputs: "A CPM operation or PSM session delivered through an authorized component.", outputs: "Target response, resulting account state and activity visible to managed components.", dependency: "Network path, target account state, platform support and target-side rights.", failure: "Unreachable host, invalid account, lockout or target policy rejection.", task: "Distinguish a target failure from a Vault authorization or component failure.", ticket: "INC-40684 · Target accepts operator login but rejects managed account" },
];

const LIFECYCLE = [
  ["Discovery", "Identify privileged identities from approved inventory or discovery signals.", "Evidence: discovered target, identity, source and timestamp.", "Gate: owner unknown or duplicate target record.", "Register a named candidate before onboarding."],
  ["Classification", "Identify human, service, shared, database or application account type.", "Evidence: account type, privilege scope and risk tier.", "Gate: type or privilege is unverified.", "Select control requirements that match the account function."],
  ["Ownership", "Assign technical custodian and business owner for the identity.", "Evidence: accountable owner and business purpose.", "Gate: ownership gap or stale contact.", "Resolve ownership before granting operational access."],
  ["Approval", "Obtain risk-appropriate approval for onboarding and access.", "Evidence: approver, ticket and scope.", "Gate: approval absent or broader than the task.", "Use a bounded request with an expiry or review date."],
  ["Onboarding", "Create the account record in the correct Safe and platform.", "Evidence: target, username, platform, Safe and validation result.", "Gate: target unreachable or incorrect platform.", "Verify account identity before enabling management."],
  ["Security controls", "Apply rotation policy, access boundaries and dependency handling.", "Evidence: policy assignment and management health.", "Gate: dependency or target permissions are not ready.", "Validate control behavior before production-like use."],
  ["Access", "Grant only the operations needed for a user's role and task.", "Evidence: Safe membership and permission review.", "Gate: retrieve/use/manage permissions are conflated.", "Separate session use from direct credential retrieval."],
  ["Monitoring", "Review operation outcomes, privileged sessions and exceptions.", "Evidence: CPM and session events.", "Gate: failures are not assigned to an owner.", "Investigate failures in component-to-target order."],
  ["Recertification", "Reconfirm business need, owner and current Safe membership.", "Evidence: reviewer, decision and next review date.", "Gate: no reviewer or access not validated.", "Remove access that no longer supports a documented need."],
  ["Rotation", "Verify and rotate on schedule or after a risk event.", "Evidence: successful CPM change and follow-up verification.", "Gate: unresolved target state or service dependency.", "Reconcile only after understanding the divergence."],
  ["Retirement", "Remove access, dependencies and obsolete credential inventory.", "Evidence: owner approval and decommission record.", "Gate: active workload still depends on the identity.", "Confirm no dependency remains before retirement."],
].map(([name, description, evidence, gate, action]) => ({ name: name ?? "", description: description ?? "", evidence: evidence ?? "", gate: gate ?? "", action: action ?? "" }));

const TERMINAL_COMMANDS = ["hostname", "whoami", "ipconfig", "systeminfo", "net user", "Get-Service", "Get-Process"];

const ASSESSMENT_QUESTIONS = [
  { prompt: "A user authenticates to PVWA but cannot see a database account. Where do you verify first?", options: ["Browser cache", "Safe membership and List accounts permission", "CPM schedule only"], answer: 1, rationale: "Authentication proves identity, not Safe authorization. Start with the account Safe and its membership." },
  { prompt: "CPM change fails because the target account is locked. Which recovery order is safest?", options: ["Repeatedly retry change", "Inspect details, restore valid target state, reconcile if needed, then retry and verify", "Disable recording"], answer: 1, rationale: "Repeated changes can deepen credential divergence. Repair the specific target condition before reconciliation and retry." },
  { prompt: "What does PSM add to an approved privileged connection?", options: ["A copy of the password in the browser", "Credential brokering, recording and attributable session events", "A permanent admin grant"], answer: 1, rationale: "A controlled session can inject a credential without exposing it and produces reviewable evidence." },
  { prompt: "Which permission should not be granted automatically when a team only needs mediated sessions?", options: ["List accounts", "Initiate privileged sessions", "Retrieve accounts"], answer: 2, rationale: "Session use through PSM and direct secret retrieval are distinct privileges." },
  { prompt: "A PSM RDP request is denied before a session starts. Which checks are relevant?", options: ["Approval, Safe permission, target, component and connector health", "Password length only", "The local learner computer's shell"], answer: 0, rationale: "Diagnose the controlled session path across authorization, approval, component, connector and target." },
];

const PRACTICES: Record<string, string> = {
  "Lab 01 · Trace the PAM architecture": "Identify each component, then trace three independent flows: onboarding, password rotation and a recorded PSM session. Predict where the first failure appears when target connectivity is lost.",
  "Lab 02 · Provision DBA-SAFE access": "Create or inspect DBA-SAFE, confirm dba_user as owner, give the database team list/use/session access, keep direct retrieval withheld, then test both allowed and denied actions.",
  "Lab 03 · Onboard WIN-SRV-01 Administrator": "Select Windows Server Local, WIN-SRV-01, WIN-SAFE and windows_admin. Submit the record, verify the target and review the resulting account and audit row.",
  "Lab 04 · Classify the enterprise inventory": "Classify each inventory record by identity type, owner, dependency and risk. Flag the failed managed account and the unmanaged database account for remediation.",
  "Lab 05A · Rotate a managed credential": "Open Administrator on WIN-SRV-01. Verify the account, run Change, run Verify again and inspect the operation log plus audit evidence.",
  "Lab 05B · Recover a failed rotation": "Inspect the svc_backup failure details. Repair its account lockout, reconcile to restore Vault/target alignment, retry Change, verify, then close with evidence.",
  "Lab 06A · Launch an approved session": "Choose WIN-SRV-01 and Administrator. Request approval, provide a change ticket and reason, launch the session, run safe inspection commands, review events and terminate.",
  "Lab 06B · Diagnose a PSM launch failure": "Inspect session authorization, the RDP component and connector health. Restore the failing control and retry only after the approval and permission checks pass.",
};

const EMPTY_ACCOUNT: PamAccount = {
  id: "", name: "", username: "", address: "", platform: "Windows Server Local", safe: "WIN-SAFE", type: "Human administrator", owner: "windows_admin", purpose: "", dependency: "", status: "Unmanaged", policy: "Windows-90d", lastVerify: "Not verified", lastChange: "Never", lastReconcile: "Never",
};

function titleFor(section: SectionId): string {
  return NAV_GROUPS.flatMap((group) => group.items).find((item) => item.id === section)?.title ?? "Overview";
}
function initials(email: string): string { return (email.split("@")[0] ?? "learner").slice(0, 2).toUpperCase(); }
function cx(...classes: (string | false | undefined)[]) { return classes.filter(Boolean).join(" "); }

function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "bad" | "blue" | "neutral" }) {
  return <span className={`status status-${tone}`}><i />{children}</span>;
}
function SectionHeading({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="subheading">{description}</p>}</div>{actions && <div className="section-actions">{actions}</div>}</div>;
}
function Metric({ label, value, note, icon: Icon, accent = "cyan" }: { label: string; value: string | number; note: string; icon: typeof Activity; accent?: string }) {
  return <div className="metric-row"><span className={`metric-icon metric-${accent}`}><Icon size={17}/></span><div className="metric-copy"><p>{label}</p><strong>{value}</strong><small>{note}</small></div></div>;
}
function Panel({ title, note, action, children, className }: { title?: string; note?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={cx("panel", className)}>{(title || note || action) && <div className="panel-head"><div>{title && <h2>{title}</h2>}{note && <p>{note}</p>}</div>{action}</div>}{children}</section>;
}
function EmptyState({ title, detail, icon: Icon = Search }: { title: string; detail: string; icon?: typeof Activity }) {
  return <div className="empty-state"><Icon size={21}/><strong>{title}</strong><span>{detail}</span></div>;
}

export function PamAcademy() {
  const [sessionUser, setSessionUser] = useState<{ id: string; email: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState<SectionId>("overview");
  const [learner, setLearner] = useState("pam_admin");
  const [state, setState] = useState<PamState>(() => makeInitialPamState());
  const [stateLoaded, setStateLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSafe, setSelectedSafe] = useState("DBA-SAFE");
  const [selectedAccount, setSelectedAccount] = useState("account-1");
  const [selectedMember, setSelectedMember] = useState("dba_user");
  const [memberPermissions, setMemberPermissions] = useState<SafePermission[]>(["List accounts", "Use accounts", "Initiate privileged sessions"]);
  const [accessResult, setAccessResult] = useState<{ allowed: boolean; message: string } | null>(null);
  const [newSafe, setNewSafe] = useState({ name: "", description: "", owner: "dba_user" });
  const [accountDraft, setAccountDraft] = useState({ ...EMPTY_ACCOUNT });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState("class-01");
  const [selectedComponent, setSelectedComponent] = useState("Vault");
  const [lifecycleIndex, setLifecycleIndex] = useState(0);
  const [labId, setLabId] = useState(CLASSES[0]?.labs[0] ?? "");
  const [labMode, setLabMode] = useState<"guided" | "independent">("guided");
  const [labFeedback, setLabFeedback] = useState("");
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, number>>({});
  const [assessmentResult, setAssessmentResult] = useState<{ score: number; correct: number } | null>(null);
  const [terminalCommand, setTerminalCommand] = useState("");
  const [authIssue, setAuthIssue] = useState("");
  const [notice, setNotice] = useState("");
  const [showLearnerPicker, setShowLearnerPicker] = useState(false);
  const terminalEnd = useRef<HTMLDivElement>(null);
  const activeSession = state.sessions.find((item) => item.status === "Active");

  useEffect(() => {
    let alive = true;
    const loadForUser = async (userId: string) => {
      setStateLoaded(false);
      setState(makeInitialPamState());
      const { data, error } = await supabase.from("pam_training_state").select("state").eq("user_id", userId).maybeSingle();
      if (!alive) return;
      if (error) {
        setAuthIssue("Your sign-in is active, but training progress could not be loaded. Please refresh and try again.");
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
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!sessionUser?.id || !stateLoaded) return;
    setSaving(true);
    const timeout = window.setTimeout(() => {
      void supabase.from("pam_training_state").upsert({ user_id: sessionUser.id, state: state as unknown as import("@/integrations/supabase/types").Json, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .then(({ error }) => {
          setSaving(false);
          if (error) {
            setAuthIssue("Your recent changes could not be saved. Check your connection and retry.");
          } else setAuthIssue("");
        });
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [sessionUser?.id, state, stateLoaded]);

  useEffect(() => { terminalEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [activeSession?.commands.length]);

  const completionCount = state.completedLabs.length;
  const percent = Math.round((completionCount / 8) * 100);
  const managedCount = state.accounts.filter((account) => account.status === "Managed").length;
  const failedCount = state.accounts.filter((account) => account.status === "Rotation failed").length;
  const filteredAccounts = useMemo(() => state.accounts.filter((account) => {
    const query = search.toLowerCase().trim();
    const matchesQuery = !query || [account.name, account.username, account.address, account.safe, account.owner].some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (statusFilter === "all" || account.status === statusFilter);
  }), [state.accounts, search, statusFilter]);
  const currentSafe = state.safes.find((safe) => safe.name === selectedSafe);
  const selectedCpmAccount = state.accounts.find((account) => account.id === selectedAccount) ?? state.accounts[0];
  const selectedCpmOperations = state.cpmOperations.filter((operation) => operation.accountId === selectedCpmAccount?.id);
  const activeClass = CLASSES.find((item) => item.id === selectedClass) ?? CLASSES[0];
  const currentComponent = COMPONENTS.find((item) => item.id === selectedComponent) ?? COMPONENTS[2];
  const currentLifecycle = LIFECYCLE[lifecycleIndex] ?? LIFECYCLE[0];
  const currentLabPassed = state.completedLabs.includes(labId);
  const userDisplay = sessionUser?.email.split("@")[0] ?? "learner";

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");
    setAuthIssue("");
    const result = authMode === "signup"
      ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthBusy(false);
    if (result.error) {
      setAuthIssue(result.error.message);
    } else if (authMode === "signup" && !result.data.session) {
      setAuthMessage("Check your email to confirm your account. Your saved training workspace will be ready after confirmation.");
    } else {
      setAuthMessage(authMode === "signup" ? "Account created. Loading your training workspace…" : "Signed in. Loading your training workspace…");
    }
  }

  async function handleSocialAuth(provider: "google" | "lovable") {
    setAuthIssue("");
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) setAuthIssue(result.error.message);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setActive("overview");
    setAuthMessage("");
  }

  function updateState(next: PamState) { setState(next); }
  function handleCreateSafe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = addSafe(state, newSafe);
    if (result.error) { toast.error(result.error); return; }
    if (result.state !== state) {
      updateState(result.state);
      setSelectedSafe(newSafe.name.trim());
      setNewSafe({ name: "", description: "", owner: "dba_user" });
      toast.success("Safe created and recorded in the audit trail.");
    }
  }
  function handleSaveMember() {
    const result = setSafeMember(state, selectedSafe, { username: selectedMember, permissions: memberPermissions }, learner);
    if (result.error) { setAccessResult({ allowed: false, message: result.error }); toast.error(result.error); return; }
    updateState(result.state);
    setAccessResult({ allowed: true, message: `${selectedMember} access updated for ${selectedSafe}.` });
    toast.success("Safe membership updated.");
  }
  function handleAccountAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = addAccount(state, accountDraft, learner);
    if (result.error) { toast.error(result.error); return; }
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
    if (result.error) { toast.error(result.error); return; }
    updateState(result.state);
    toast.success("CPM incident action recorded. Review the audit evidence and retry.");
  }
  function handlePsmLaunch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = (event.currentTarget.elements.namedItem("psm-target") as HTMLInputElement | null)?.value ?? "WIN-SRV-01";
    const ticket = (event.currentTarget.elements.namedItem("psm-ticket") as HTMLInputElement | null)?.value ?? "";
    const reason = (event.currentTarget.elements.namedItem("psm-reason") as HTMLTextAreaElement | null)?.value ?? "";
    const account = state.accounts.find((item) => item.name === "Administrator" && item.address === target);
    if (!account) { toast.error("No managed Administrator account is available on that target."); return; }
    const result = launchPsmSession(state, { target, account, ticket, reason }, learner);
    if (result.error) { toast.error(result.error); setLabFeedback(result.error); return; }
    updateState(result.state);
    toast.success("PSM session launched. Commands run only in this training simulation.");
    setLabFeedback("Session started. Use the controlled command list, review the event timeline and terminate when finished.");
  }
  function toggleApproval() {
    const approved = !state.approvalGranted;
    updateState({ ...state, approvalGranted: approved, audit: [{ id: `audit-${Date.now()}`, time: new Date().toLocaleTimeString("en-US", { hour12: false }), actor: learner, action: approved ? "Approve session request" : "Withdraw session approval", target: "WIN-SRV-01 · Administrator", result: approved ? "Success" : "Warning", detail: approved ? "Training approval granted for current PSM scenario" : "Training approval withdrawn" }, ...state.audit] });
  }
  function closeSession() {
    const current = state.sessions.find((session) => session.status === "Active");
    if (!current) return;
    updateState(appendSessionCommand(state, current.id, "exit", learner));
    toast.success("Session terminated. Recording events remain in the audit trail.");
  }
  function runTerminal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeSession) { toast.error("Launch an approved session first."); return; }
    const command = terminalCommand.trim();
    if (!command) return;
    updateState(appendSessionCommand(state, activeSession.id, command, learner));
    setTerminalCommand("");
  }
  function markLabComplete(score = 100) {
    updateState(completeLab(state, labId, score));
    setLabFeedback(`Lab evidence saved. Score: ${score}/100. The workspace audit trail reflects your actions.`);
    toast.success("Lab completion saved to your learner record.");
  }
  function resetLab() {
    updateState(resetPamState());
    setLabFeedback("Training environment reset to the enterprise starting state. Saved lab completion and operation evidence have been cleared.");
    setAccessResult(null);
    setAssessmentResult(null);
    toast.success("Simulation state reset.");
  }
  function renderAuthGate() {
    return <div className="auth-screen">
      <div className="auth-brand"><span className="brand-mark"><Shield size={22}/></span><div><strong>SHADOWXLAB</strong><span>PAM ADMINISTRATOR ACADEMY</span></div></div>
      <div className="auth-layout">
        <div className="auth-intro"><div className="live-pill"><span/> TRAINING ENVIRONMENT · ONLINE</div><p className="eyebrow">PRIVILEGED ACCESS MANAGEMENT</p><h1>Operate the <em>control plane.</em></h1><p className="auth-lead">A hands-on administrator academy built around the workflows that protect enterprise credentials and privileged sessions.</p>
          <div className="auth-facts"><div><span>06</span><small>in-depth classes</small></div><div><span>08</span><small>operational labs</small></div><div><span>01</span><small>shared simulation</small></div></div>
          <div className="auth-assurance"><LockKeyhole size={16}/><span>Progress is saved privately to your learner account. Every PAM operation is simulated.</span></div>
        </div>
        <div className="auth-form-panel"><p className="eyebrow">LEARNER ACCESS</p><h2>{authMode === "signin" ? "Sign in to continue" : "Create learner access"}</h2><p className="muted-copy">Use your account to save and resume your training environment.</p>
          <div className="auth-switch"><Button type="button" size="sm" variant={authMode === "signin" ? "default" : "ghost"} onClick={() => { setAuthMode("signin"); setAuthIssue(""); setAuthMessage(""); }}>Sign in</Button><Button type="button" size="sm" variant={authMode === "signup" ? "default" : "ghost"} onClick={() => { setAuthMode("signup"); setAuthIssue(""); setAuthMessage(""); }}>Create account</Button></div>
          <form className="auth-fields" onSubmit={handleEmailAuth}><div className="field"><Label htmlFor="auth-email">Email address</Label><Input id="auth-email" autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></div><div className="field"><Label htmlFor="auth-password">Password</Label><Input id="auth-password" autoComplete={authMode === "signin" ? "current-password" : "new-password"} type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></div><Button type="submit" disabled={authBusy || !authReady} className="auth-submit">{authBusy ? "Please wait…" : authMode === "signin" ? "Sign in" : "Create account"}<ArrowRight size={16}/></Button></form>
          <div className="auth-divider"><span>OR CONTINUE WITH</span></div>
          <div className="social-buttons"><Button type="button" variant="outline" onClick={() => void handleSocialAuth("google")} className="social-button"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Continue with Google</Button><Button type="button" variant="outline" onClick={() => void handleSocialAuth("lovable")} className="social-button lovable-button"><Command size={17}/>Continue with Lovable</Button></div>
          {authMessage && <p className="auth-success"><CheckCircle2 size={16}/>{authMessage}</p>}{authIssue && <p className="auth-error"><AlertTriangle size={16}/>{authIssue}</p>}
          <p className="terms-note">By continuing, you agree to use this environment for training only. Never enter real production credentials.</p>
        </div>
      </div>
      <div className="auth-footer"><span>SHADOWXLAB · PAM OPERATIONS ACADEMY</span><span>GLOBAL FINANCIAL SERVICES · CORP-PAM-LAB</span></div>
    </div>;
  }

  function renderWorkspace() {
    if (active === "overview") return <OverviewView state={state} percent={percent} completionCount={completionCount} managedCount={managedCount} failedCount={failedCount} setActive={setActive} setLabId={setLabId} markLabComplete={markLabComplete} />;
    if (active === "academy") return <AcademyView classes={CLASSES} selectedClass={selectedClass} setSelectedClass={setSelectedClass} activeClass={activeClass} state={state} selectLab={(id) => { setLabId(id); setActive("academy"); setLabFeedback(""); }} />;
    if (active === "environment") return <EnvironmentView selectedComponent={selectedComponent} setSelectedComponent={setSelectedComponent} currentComponent={currentComponent} />;
    if (active === "safes") return <SafesView state={state} selectedSafe={selectedSafe} setSelectedSafe={setSelectedSafe} currentSafe={currentSafe} newSafe={newSafe} setNewSafe={setNewSafe} onCreateSafe={handleCreateSafe} learner={learner} selectedMember={selectedMember} setSelectedMember={setSelectedMember} memberPermissions={memberPermissions} setMemberPermissions={setMemberPermissions} onSaveMember={handleSaveMember} accessResult={accessResult} setAccessResult={setAccessResult} updateState={updateState} />;
    if (active === "accounts") return <AccountsView state={state} filteredAccounts={filteredAccounts} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} draft={accountDraft} setDraft={setAccountDraft} onAdd={handleAccountAdd} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} learner={learner} />;
    if (active === "access") return <AccessView state={state} selectedSafe={selectedSafe} setSelectedSafe={setSelectedSafe} learner={learner} accessResult={accessResult} setAccessResult={setAccessResult} />;
    if (active === "cpm") return <CpmView state={state} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} selectedCpmAccount={selectedCpmAccount} operations={selectedCpmOperations} onRun={handleCpm} onRepair={handleRepair} />;
    if (active === "psm") return <PsmView state={state} onLaunch={handlePsmLaunch} onApproval={toggleApproval} onClose={closeSession} onCommand={runTerminal} session={activeSession} command={terminalCommand} setCommand={setTerminalCommand} terminalEnd={terminalEnd} />;
    if (active === "policies") return <PoliciesView state={state} />;
    if (active === "discovery") return <DiscoveryView state={state} onOnboard={() => { setActive("accounts"); toast.message("Choose a discovered identity to onboard it into the shared account inventory."); }} />;
    if (active === "audit") return <AuditView state={state} search={search} setSearch={setSearch} />;
    if (active === "troubleshooting") return <TroubleshootingView state={state} setActive={setActive} setSelectedAccount={setSelectedAccount} />;
    if (active === "assessments") return <AssessmentView answers={assessmentAnswers} setAnswers={setAssessmentAnswers} result={assessmentResult} setResult={setAssessmentResult} markLabComplete={markLabComplete} />;
    if (active === "knowledge") return <KnowledgeView setActive={setActive} setSelectedClass={setSelectedClass} />;
    return <InstructorView state={state} learner={learner} setLearner={setLearner} setActive={setActive} resetLab={resetLab} />;
  }

  if (!authReady) return <div className="auth-loading"><span className="brand-mark"><Shield size={22}/></span><span>SECURING TRAINING WORKSPACE</span></div>;
  if (!sessionUser) return renderAuthGate();

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-brand"><span className="brand-mark"><Shield size={18}/></span><div><strong>SHADOWXLAB</strong><small>PAM ACADEMY</small></div><span className="brand-code">SX</span></div>
      <div className="workspace-switch"><span className="workspace-dot"/><div><strong>GFS · OPERATIONS LAB</strong><span>CORP-PAM-LAB</span></div><ChevronDown size={14}/></div>
      <nav className="main-nav" aria-label="Main navigation">{NAV_GROUPS.map((group) => <div className="nav-group" key={group.label}><p className="nav-label">{group.label}</p>{group.items.map((item) => { const Icon = item.icon; return <Button key={item.id} type="button" variant="ghost" onClick={() => setActive(item.id)} className={cx("nav-item", active === item.id && "nav-item-active")}><Icon size={16}/><span>{item.title}</span>{item.id === "cpm" && failedCount > 0 && <i className="nav-alert"/>}{item.id === "academy" && completionCount > 0 && <span className="nav-count">{completionCount}</span>}</Button>; })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="connection"><span className="pulse-dot"/><div><strong>All systems operational</strong><small>Last sync just now</small></div></div><div className="sidebar-user"><div className="user-avatar">{initials(sessionUser.email)}</div><div className="sidebar-user-info"><strong>{userDisplay}</strong><small>LEARNER ACCOUNT</small></div><Button type="button" variant="ghost" size="icon" title="Sign out" aria-label="Sign out" onClick={() => void handleSignOut()}><LogOut size={15}/></Button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><span className="topbar-title">ShadowXLab <span>/</span> PAM Academy</span><span className="environment-chip"><span/>CORP-PAM-LAB</span></div><div className="topbar-right"><span className="topbar-save"><span className={saving ? "save-dot busy" : "save-dot"}/>{saving ? "Saving" : stateLoaded ? "Progress saved" : "Loading"}</span><div className="topbar-separator"/><Button type="button" variant="ghost" size="icon" aria-label="Help" title="Training help" onClick={() => { setActive("knowledge"); }}><CircleHelp size={17}/></Button><div className="learner-control"><Button type="button" variant="ghost" onClick={() => setShowLearnerPicker(!showLearnerPicker)} className="learner-button"><span className="user-avatar small">{initials(sessionUser.email)}</span><span className="learner-identity"><strong>{userDisplay}</strong><small>Training mode</small></span><ChevronDown size={13}/></Button>{showLearnerPicker && <div className="learner-menu"><p>SIMULATED OPERATING IDENTITY</p>{LEARNERS.map((identity) => <Button type="button" variant="ghost" key={identity} onClick={() => { setLearner(identity); setShowLearnerPicker(false); }} className={cx("learner-option", learner === identity && "learner-option-active")}><span>{identity}</span>{learner === identity && <Check size={14}/>}</Button>)}<small>Identity changes affect only simulated Safe permissions.</small></div>}</div></div></header>
      <div className="breadcrumb"><span>ShadowXLab</span><ChevronRight size={13}/><span>Operations Center</span><ChevronRight size={13}/><strong>{titleFor(active)}</strong></div>
      <div className="workspace-content">{authIssue && <div className="inline-warning"><AlertTriangle size={16}/><span>{authIssue}</span><Button size="sm" variant="ghost" onClick={() => setAuthIssue("")}>Dismiss</Button></div>}{renderWorkspace()}</div>
      <footer className="app-footer"><span>SHADOWXLAB PAM ADMINISTRATOR ACADEMY</span><span>SIMULATED ENVIRONMENT · NO PRODUCTION ACCESS</span></footer>
    </main>
  </div>;
}

function OverviewView({ state, percent, completionCount, managedCount, failedCount, setActive, setLabId, markLabComplete }: { state: PamState; percent: number; completionCount: number; managedCount: number; failedCount: number; setActive: (section: SectionId) => void; setLabId: (labId: string) => void; markLabComplete: (score?: number) => void }) {
  const outstanding = state.accounts.filter((account) => account.status === "Verify required" || account.status === "Rotation failed" || account.status === "Unmanaged");
  const nextLab = CLASSES.flatMap((course) => course.labs).find((lab) => !state.completedLabs.includes(lab)) ?? CLASSES[0]?.labs[0] ?? "";
  return <>
    <SectionHeading eyebrow="FRIDAY, NOVEMBER 13 · SECURITY TRAINING" title="Operations overview" description="GLOBAL FINANCIAL SERVICES · Enterprise privileged access simulation" actions={<><Button type="button" variant="outline" onClick={() => setActive("audit")}><FileClock size={15}/>View audit</Button><Button type="button" onClick={() => { setActive("academy"); }}>{completionCount ? "Resume academy" : "Start learning"}<ArrowRight size={15}/></Button></>}/>
    <div className="overview-banner"><div className="banner-icon"><Shield size={25}/></div><div className="banner-copy"><p>ENTERPRISE SECURITY OPERATIONS · CORP-PAM-LAB</p><h2>Privileged access, under control.</h2><span>GLOBAL FINANCIAL SERVICES <b>·</b> corp.gfs.local <b>·</b> 9 connected targets</span></div><div className="banner-status"><span><i/>SIMULATION ACTIVE</span><small>TRAINING ONLY · NO LIVE SYSTEMS</small></div><div className="banner-grid"/></div>
    <div className="metrics-strip"><Metric label="Managed accounts" value={managedCount} note={`${state.accounts.length} in inventory`} icon={KeyRound}/><Metric label="Rotation exceptions" value={failedCount} note={failedCount ? "Requires investigation" : "No open failures"} icon={AlertTriangle} accent={failedCount ? "amber" : "green"}/><Metric label="Active sessions" value={state.sessions.filter((session) => session.status === "Active").length} note={`${state.sessions.length} recorded sessions`} icon={MonitorPlay} accent="blue"/><Metric label="Academy progress" value={`${completionCount}/8`} note={`${percent}% completion`} icon={GraduationCap} accent="green"/></div>
    <div className="overview-grid"><Panel className="learning-panel"><div className="learning-heading"><div><p className="eyebrow">YOUR NEXT MISSION</p><h2>{nextLab}</h2><p>Practice the same sequence an administrator follows during a controlled enterprise operation.</p></div><div className="radial-progress" style={{ "--progress": `${percent}%` } as React.CSSProperties}><strong>{percent}<small>%</small></strong><span>COMPLETE</span></div></div><div className="learning-footer"><span><BookOpen size={15}/> Six classes · eight operational labs</span><Button type="button" size="sm" onClick={() => { setLabId(nextLab); setActive("academy"); }}>Open next lab<ArrowRight size={14}/></Button></div></Panel>
      <Panel title="Platform health" note="Simulated services · current lab state"><div className="health-list">{[{name:"Digital Vault",detail:"Credential services",latency:"18 ms"},{name:"Web Access (PVWA)",detail:"Operator portal",latency:"42 ms"},{name:"Password Manager (CPM)",detail: failedCount ? `${failedCount} account exception` : "Rotation queue healthy",latency:"3 jobs"},{name:"Session Manager (PSM)",detail:"Recording enabled",latency:"1 node"}].map((service) => <div className="health-row" key={service.name}><span className="health-check"><Check size={12}/></span><div><strong>{service.name}</strong><small>{service.detail}</small></div><span className="health-time">{service.latency}</span></div>)}</div></Panel>
    </div>
    <div className="overview-lower"><Panel title="Attention required" note="Account operations that need review" action={<Button type="button" variant="ghost" size="sm" onClick={() => setActive("troubleshooting")}>Open queue<ArrowRight size={14}/></Button>}><div className="attention-list">{outstanding.slice(0, 4).map((account) => <div className="attention-row" key={account.id}><span className={account.status === "Rotation failed" ? "attention-icon critical" : "attention-icon"}>{account.status === "Rotation failed" ? <AlertTriangle size={15}/> : <Clock3 size={15}/>}</span><div><strong>{account.username}</strong><small>{account.address} · {account.status === "Rotation failed" ? account.failureCause : account.status}</small></div><Badge variant="outline" className={account.status === "Rotation failed" ? "badge-danger" : "badge-warning"}>{account.status === "Rotation failed" ? "FAILED" : account.status === "Unmanaged" ? "UNMANAGED" : "VERIFY"}</Badge><Button type="button" variant="ghost" size="icon" aria-label={`Inspect ${account.username}`} onClick={() => setActive("cpm")}><ChevronRight size={16}/></Button></div>)}{outstanding.length === 0 && <EmptyState title="No account exceptions" detail="All inventory is in a healthy state." icon={CheckCircle2}/>}</div></Panel>
      <Panel title="Recent audit activity" note="Latest simulated control-plane events" action={<Button type="button" variant="ghost" size="sm" onClick={() => setActive("audit")}>View all<ArrowRight size={14}/></Button>}><div className="compact-audit">{state.audit.slice(0, 4).map((event) => <div className="compact-audit-row" key={event.id}><span className={`audit-marker audit-${event.result.toLowerCase()}`}/><div><strong>{event.action}</strong><small>{event.actor} · {event.target}</small></div><span>{event.time}</span></div>)}</div></Panel></div>
    <QuickActions setActive={setActive}/>
  </>;
}

function QuickActions({ setActive }: { setActive: (section: SectionId) => void }) {
  const items: { section: SectionId; title: string; copy: string; icon: typeof Activity }[] = [
    { section: "safes", title: "Review Safe access", copy: "Members & permissions", icon: Boxes },
    { section: "accounts", title: "Onboard an account", copy: "Inventory & platform", icon: KeyRound },
    { section: "cpm", title: "Run a CPM operation", copy: "Verify · change · reconcile", icon: Activity },
    { section: "psm", title: "Launch a session", copy: "Approval · recording", icon: MonitorPlay },
  ];
  return <div className="quick-actions">{items.map((item) => { const Icon = item.icon; return <Button type="button" variant="outline" className="quick-action" key={item.title} onClick={() => setActive(item.section)}><span><Icon size={17}/></span><div><strong>{item.title}</strong><small>{item.copy}</small></div><ArrowUpRight size={14}/></Button>; })}</div>;
}

function AcademyView({ classes, selectedClass, setSelectedClass, activeClass, state, selectLab }: { classes: typeof CLASSES; selectedClass: string; setSelectedClass: (id: string) => void; activeClass: (typeof CLASSES)[number] | undefined; state: PamState; selectLab: (labId: string) => void }) {
  const current = activeClass ?? classes[0];
  const topics = CLASS_TOPICS[current?.id ?? "class-01"] ?? [];
  return <>
    <SectionHeading eyebrow="LEARNER DEVELOPMENT · SIX-CLASS PATH" title="Learning academy" description="Operational training built around real administrator responsibilities, from credential onboarding through session evidence." actions={<span className="academy-progress"><strong>{state.completedLabs.length}/8</strong><small>LABS COMPLETE</small></span>}/>
    <div className="academy-shell"><div className="class-list">{classes.map((course, index) => { const completedInClass = course.labs.filter((lab) => state.completedLabs.includes(lab)).length; const Icon = [Shield, Boxes, KeyRound, Fingerprint, Activity, MonitorPlay][index] ?? BookOpen; return <Button type="button" variant="ghost" key={course.id} onClick={() => setSelectedClass(course.id)} className={cx("class-row", selectedClass === course.id && "class-row-active")}><span className="class-icon"><Icon size={17}/></span><span className="class-row-copy"><small>{course.label} · {index + 1}H 20M</small><strong>{course.title}</strong><span>{completedInClass}/{course.labs.length} labs</span></span>{completedInClass === course.labs.length && <CheckCircle2 className="class-complete" size={16}/>}</Button>; })}<div className="academy-credential"><Shield size={18}/><div><strong>Operations readiness</strong><span>Complete six classes and labs to earn your academy record.</span></div><div className="readiness-track"><i style={{ width: `${Math.round(state.completedLabs.length / 8 * 100)}%` }}/></div></div></div>
      <div className="class-content"><div className="class-content-head"><div><p className="eyebrow">{current?.label} · CORE SESSION</p><h2>{current?.title}</h2><p>{current?.subtitle}</p></div><StatusBadge tone="blue">INTERACTIVE SESSION</StatusBadge></div>
        <div className="class-callout"><div className="callout-symbol"><Network size={19}/></div><div><strong>Enterprise context</strong><p>GLOBAL FINANCIAL SERVICES runs a hybrid Windows, Linux, database and payments environment. Your work here models an operations shift in CORP-PAM-LAB; every mutation updates the shared simulation inventory and audit history.</p></div></div>
        <div className="class-concepts"><div className="concept-topline"><h3>Session objectives & technical concepts</h3><span>{topics.length} LEARNING OBJECTIVES</span></div><div className="concept-grid">{topics.map((topic, index) => <div className="concept-item" key={topic}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{topic}</strong><p>{topicDetail(current?.id ?? "", index)}</p></div></div>)}</div></div>
        <div className="class-explanation"><div><p className="eyebrow">INSTRUCTOR EXPLANATION</p><h3>{instructorLine(current?.id ?? "")}</h3></div><p>{instructorCopy(current?.id ?? "")}</p></div>
        <div className="demonstration-strip"><div><span className="demo-icon"><Play size={15}/></span><div><strong>Instructor walkthrough</strong><small>Follow a realistic administrator workflow before independent execution.</small></div></div><Button type="button" variant="outline" size="sm" onClick={() => { const lab = current?.labs[0] ?? ""; selectLab(lab); }}>Open walkthrough<ArrowRight size={14}/></Button></div>
        <div className="lab-list-heading"><div><h3>Hands-on labs</h3><p>Operate the simulated environment; completion is scored and saved.</p></div></div>
        <div className="lab-rows">{current?.labs.map((lab, index) => { const done = state.completedLabs.includes(lab); return <div className="lab-row" key={lab}><div className={cx("lab-state", done && "lab-state-done")}>{done ? <Check size={16}/> : <span>{index + 1}</span>}</div><div className="lab-row-copy"><strong>{lab}</strong><small>{PRACTICES[lab]}</small></div>{done && <Badge className="badge-complete">COMPLETE · {state.scores[lab] ?? 100}/100</Badge>}<Button type="button" size="sm" variant={done ? "outline" : "default"} onClick={() => selectLab(lab)}>{done ? "Review" : "Start lab"}<ArrowRight size={14}/></Button></div>; })}</div>
      </div></div>
  </>;
}

function topicDetail(classId: string, index: number): string {
  const snippets: Record<string, string[]> = {
    "class-01": ["An attacker who gains a powerful credential can move laterally beyond the original host; vaulting reduces standing exposure and improves accountability.", "Track discovery, ownership, approval, onboarding, managed access, operation evidence, review and retirement as one accountable chain.", "PVWA handles operator workflows; the Vault enforces protected storage and access; CPM manages credentials; PSM brokers and records sessions.", "The first establishes who the requester is. The second determines which privileged account action that identity is allowed to perform.", "The Vault protects credentials; CPM controls their target-side lifecycle; PSM provides mediated, reviewable command access.", "A request should be attributable, policy checked, brokered through the correct component and closed with evidence."],
    "class-02": ["A Safe is a permission boundary and lifecycle container, not merely a folder name. Its membership should map to operational need.", "Retrieve, use and manage are separate capabilities; broad management permissions need explicit ownership and review.", "The administrator who manages Safe configuration need not be the business approver or the account's session operator.", "Separate platform-specific identities while keeping consistent owner, member, review and emergency-access practices.", "Membership should reflect current duties; audit evidence makes additions, changes and removals reviewable.", "Follow the identity, Safe, specific permission and attempted operation. Do not assume login failures imply a password problem."],
    "class-03": ["A target account's type determines how it is discovered, managed and accessed.", "Named responsibility plus a documented workload dependency prevents unmanaged credential changes from causing outages.", "A platform defines supported account behavior; the Safe controls access; account properties identify the target and intended use.", "Validate target reachability and account identity before enabling rotation; a wrong account can cause operational impact.", "An account should appear in inventory, CPM status, reports and audit as one shared record.", "Compare each field with the observed failure instead of changing platform or credentials blindly."],
    "class-04": ["Human identities are tied to a person; non-human identities serve workloads and require dependency-aware control.", "A custodian operates the account; a business owner is accountable for the supported service and continuing need.", "Shared access weakens direct attribution; a brokered session plus ticket and recording can restore meaningful accountability.", "Rank by privilege, exposure, business criticality, ownership and control coverage.", "Map the consumer before scheduling changes; coordinated rotation must account for the workload's credential consumers.", "Each lifecycle stage needs a decision, a control and evidence before advancing."],
    "class-05": ["CPM selects platform-specific logic to reach and manage a target account; configuration and target behavior must align.", "Verify tests whether the managed credential works on the target. It does not change the password.", "A change must update the target and protected record as a coordinated operation; inspect outcome before retry.", "Reconciliation is a recovery operation to restore the managed credential relationship, not a general retry button.", "A schedule is meaningful only when complexity, target constraints and dependent services remain compatible.", "Use operation codes and account context to distinguish connectivity, target rights, policy and dependency failures.", "Record the original failure, corrective action, retry outcome and verification result."],
    "class-06": ["PSM brokers the session between operator and target rather than giving the operator direct credential access.", "A connection component supplies the supported target protocol and launch configuration.", "Approval binds access to a specific business purpose, target and timeframe.", "Events and recordings let a reviewer reconstruct who connected, what happened and when.", "Separate permission denial from connector, target and session policy failures.", "A completed session includes launch, activity, termination and evidence review."],
  };
  return snippets[classId]?.[index] ?? "Translate the concept into a controlled operational decision and capture evidence for the next reviewer.";
}
function instructorLine(classId: string): string {
  const labels: Record<string, string> = { "class-01": "The PAM control plane is a chain of responsibilities.", "class-02": "A Safe boundary is only as strong as its least-privilege design.", "class-03": "An account is not managed until identity, target and control state agree.", "class-04": "Ownership and accountability are controls, not optional inventory fields.", "class-05": "Treat every CPM outcome as a state transition with a failure boundary.", "class-06": "A privileged session is a controlled and reviewable operation." };
  return labels[classId] ?? "Keep every change attributable, scoped and reviewable.";
}
function instructorCopy(classId: string): string {
  const copy: Record<string, string> = { "class-01": "Start by asking where the request is enforced, what identity enters each boundary, and what evidence proves the operation completed. A component outage and an authorization denial have different signatures and different owners.", "class-02": "Grant the smallest set that enables the task. For mediated administration, session permission does not imply password retrieval. Review dependencies before selecting permissions, and validate both an allowed and a denied operation.", "class-03": "Confirm account identity and target reachability first, then platform behavior, Safe placement, owner and verify result. Do not enable a rotation policy against an unverified target record.", "class-04": "Classify the account's function and dependencies before choosing control. Shared and service identities need an accountable owner, a consumer map and a planned rotation approach.", "class-05": "Verify, change and reconcile are distinct operations. A failed change leaves uncertainty about the target and Vault state; read the error, repair the identified condition, reconcile only when needed, then retry and verify.", "class-06": "Check approval and Safe session permission before testing the target path. Use the connection component and connector status to isolate launch failures; the session is not complete until it is terminated and evidence is reviewed." };
  return copy[classId] ?? "Use the operational record and audit trail to establish what happened before changing configuration.";
}

function EnvironmentView({ selectedComponent, setSelectedComponent, currentComponent }: { selectedComponent: string; setSelectedComponent: (id: string) => void; currentComponent: (typeof COMPONENTS)[number] | undefined }) {
  const selected = currentComponent ?? COMPONENTS[2];
  const [trace, setTrace] = useState("onboarding");
  const traceSteps = trace === "rotation" ? ["Administrator", "PVWA", "Vault", "CPM", "Target System"] : trace === "session" ? ["Administrator", "PVWA", "Vault", "PSM", "Target System"] : ["Administrator", "PVWA", "Vault", "CPM", "Target System"];
  return <><SectionHeading eyebrow="CONTROL PLANE · COMPONENT MAP" title="PAM environment" description="Explore the component responsibilities and trace administrator workflows through the CORP-PAM-LAB topology." actions={<StatusBadge tone="good">ALL COMPONENTS SIMULATED</StatusBadge>}/>
    <div className="environment-meta"><div><Server size={16}/><span><b>9</b> enterprise targets</span></div><div><UsersRound size={16}/><span><b>8</b> simulated identities</span></div><div><Boxes size={16}/><span><b>7</b> protection Safes</span></div><div><Activity size={16}/><span>Training network <b>isolated</b></span></div></div>
    <Panel title="Enterprise PAM architecture" note="Select a component for its operational remit. All service calls shown here are conceptual and simulated."><div className="architecture-toolbar"><div className="flow-tabs"><Button type="button" size="sm" variant={trace === "onboarding" ? "default" : "ghost"} onClick={() => setTrace("onboarding")}>Account onboarding</Button><Button type="button" size="sm" variant={trace === "rotation" ? "default" : "ghost"} onClick={() => setTrace("rotation")}>Password rotation</Button><Button type="button" size="sm" variant={trace === "session" ? "default" : "ghost"} onClick={() => setTrace("session")}>Privileged session</Button></div><span>SELECT A NODE TO INSPECT RESPONSIBILITIES</span></div>
      <div className="architecture-map"><div className="architecture-lines"><div className="line line-admin-pvwa"/><div className="line line-pvwa-vault"/><div className="line line-vault-cpm"/><div className="line line-cpm-target"/><div className="line line-vault-psm"/><div className="line line-psm-target"/></div>{COMPONENTS.map((component, index) => { const active = component.id === selectedComponent; const nodeIcons = [Fingerprint, Network, Shield, Activity, MonitorPlay, Server]; const Icon = nodeIcons[index] ?? Server; return <Button key={component.id} type="button" variant="ghost" style={{ left: component.x, top: component.y }} className={cx("architecture-node", active && "architecture-node-active", traceSteps.includes(component.id) && "architecture-node-onpath")} onClick={() => setSelectedComponent(component.id)}><span><Icon size={19}/></span><strong>{component.id}</strong><small>{index === 0 ? "Operator" : index === 2 ? "Credential boundary" : index === 5 ? "Managed endpoint" : "Control service"}</small></Button>; })}
        <div className="flow-label label-one">REQUEST · POLICY · ACCOUNT</div><div className="flow-label label-two">CONTROLLED CREDENTIAL OPERATION</div><div className="flow-label label-three">APPROVED · RECORDED SESSION</div>
      </div><div className="flow-legend"><span><i className="legend-cyan"/>Account & credential flow</span><span><i className="legend-blue"/>Brokered session flow</span><span><i className="legend-dashed"/>Audit & policy signals</span></div>
    </Panel>
    <div className="component-detail-grid"><Panel title={selected.id} note="COMPONENT RESPONSIBILITY"><p className="component-purpose">{selected.purpose}</p><div className="detail-facts"><Detail label="ADMINISTRATOR RESPONSIBILITIES" value={selected.responsibilities}/><Detail label="INPUTS" value={selected.inputs}/><Detail label="OUTPUTS" value={selected.outputs}/><Detail label="DEPENDENCIES" value={selected.dependency}/><Detail label="COMMON FAILURE" value={selected.failure}/><Detail label="ADMINISTRATOR TASK" value={selected.task}/></div></Panel><Panel title="Example operational ticket" note="FIELD SCENARIO"><div className="ticket-ref"><span>INCIDENT</span><b>{selected.ticket.split(" · ")[0]}</b><StatusBadge tone="warn">IN PROGRESS</StatusBadge></div><h3 className="ticket-title">{selected.ticket.split(" · ")[1] ?? selected.ticket}</h3><p className="ticket-body">Trace the failure to the component that owns the failed responsibility. Compare the operator's expected workflow with the recorded inputs, outputs and dependent health before retrying.</p><div className="ticket-action"><span>FIRST INVESTIGATION STEP</span><p>{selected.task}</p></div></Panel></div>
    <Panel title={`${trace === "session" ? "PSM session" : trace === "rotation" ? "CPM rotation" : "Account onboarding"} · sequence trace`} note="Follow the active control flow from request to target."><div className="trace-strip">{traceSteps.map((step, index) => <div className="trace-step" key={`${step}-${index}`}><span className={step === selectedComponent ? "trace-node selected" : "trace-node"}>{index + 1}</span><div><strong>{step}</strong><small>{traceStepDetail(trace, step)}</small></div>{index < traceSteps.length - 1 && <ArrowRight className="trace-arrow" size={16}/>}</div>)}</div></Panel>
  </>;
}
function traceStepDetail(flow: string, step: string): string {
  if (step === "Administrator") return "Authenticated request";
  if (step === "PVWA") return "Workflow & access";
  if (step === "Vault") return "Safe policy check";
  if (step === "CPM") return flow === "rotation" ? "Verify · change · reconcile" : "Account onboarding";
  if (step === "PSM") return "Credential injection & recording";
  return "Target response";
}
function Detail({ label, value }: { label: string; value: string }) { return <div className="detail-fact"><span>{label}</span><p>{value}</p></div>; }

function SafesView({ state, selectedSafe, setSelectedSafe, currentSafe, newSafe, setNewSafe, onCreateSafe, learner, selectedMember, setSelectedMember, memberPermissions, setMemberPermissions, onSaveMember, accessResult, setAccessResult, updateState }: { state: PamState; selectedSafe: string; setSelectedSafe: (safe: string) => void; currentSafe: PamSafe | undefined; newSafe: { name: string; description: string; owner: string }; setNewSafe: (draft: { name: string; description: string; owner: string }) => void; onCreateSafe: (event: FormEvent<HTMLFormElement>) => void; learner: string; selectedMember: string; setSelectedMember: (username: string) => void; memberPermissions: SafePermission[]; setMemberPermissions: (permissions: SafePermission[]) => void; onSaveMember: () => void; accessResult: { allowed: boolean; message: string } | null; setAccessResult: (result: { allowed: boolean; message: string } | null) => void; updateState: (state: PamState) => void }) {
  const [safeSearch, setSafeSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const visibleSafes = state.safes.filter((safe) => safe.name.toLowerCase().includes(safeSearch.toLowerCase()));
  const safeAccounts = state.accounts.filter((account) => account.safe === selectedSafe);
  const deps = permissionDependencies(memberPermissions);
  function testAccess(permission: SafePermission) { setAccessResult(evaluatePermission(state, selectedSafe, selectedMember, permission)); }
  function togglePermission(permission: SafePermission, checked: boolean) {
    setMemberPermissions(checked ? [...memberPermissions, permission] : memberPermissions.filter((item) => item !== permission));
  }
  return <><SectionHeading eyebrow="VAULT ADMINISTRATION · ACCESS BOUNDARIES" title="Safe administration" description="Create protection boundaries, assign members and validate least-privilege access against the shared enterprise inventory." actions={<Button type="button" variant="outline" onClick={() => document.getElementById("safe-create-form")?.scrollIntoView({ behavior: "smooth" })}><Plus size={15}/>Create Safe</Button>}/>
    <div className="safe-workspace"><aside className="safe-list-pane"><div className="pane-title"><div><strong>Safes</strong><span>{state.safes.length} configured</span></div><Button type="button" variant="ghost" size="icon" aria-label="Create Safe" onClick={() => document.getElementById("safe-create-form")?.scrollIntoView({ behavior: "smooth" })}><Plus size={16}/></Button></div><div className="search-field"><Search size={14}/><Input aria-label="Search Safes" placeholder="Find a Safe" value={safeSearch} onChange={(event) => setSafeSearch(event.target.value)}/></div><div className="safe-list">{visibleSafes.map((safe) => <Button type="button" variant="ghost" key={safe.name} onClick={() => { setSelectedSafe(safe.name); setAccessResult(null); }} className={cx("safe-list-item", selectedSafe === safe.name && "safe-list-active")}><span className="safe-folder"><Boxes size={15}/></span><span><strong>{safe.name}</strong><small>{safe.members.length} members · {state.accounts.filter((account) => account.safe === safe.name).length} accounts</small></span><ChevronRight size={14}/></Button>)}</div></aside>
      <div className="safe-detail-pane"><div className="safe-detail-head"><div className="safe-title-icon"><Boxes size={19}/></div><div><div className="safe-title-line"><h2>{currentSafe?.name ?? selectedSafe}</h2><StatusBadge tone="good">ACTIVE</StatusBadge></div><p>{currentSafe?.description}</p></div><Button type="button" variant="outline" size="sm" onClick={() => setAccessResult({ allowed: true, message: `${currentSafe?.name ?? selectedSafe} reviewed. ${currentSafe?.members.length ?? 0} members · ${safeAccounts.length} accounts.` })}>Review access</Button></div>
        <div className="safe-stats"><div><span>SAFE OWNER</span><strong>{currentSafe?.owner ?? "—"}</strong></div><div><span>MEMBERS</span><strong>{currentSafe?.members.length ?? 0}</strong></div><div><span>ACCOUNT INVENTORY</span><strong>{safeAccounts.length}</strong></div><div><span>POLICY CONTROL</span><strong>Least privilege</strong></div></div>
        <Tabs defaultValue="members" className="ops-tabs"><TabsList><TabsTrigger value="members">Members & permissions</TabsTrigger><TabsTrigger value="inventory">Accounts ({safeAccounts.length})</TabsTrigger><TabsTrigger value="activity">Audit activity</TabsTrigger></TabsList>
          <TabsContent value="members"><div className="member-table"><div className="member-table-head"><span>MEMBER</span><span>PERMISSIONS</span><span>ACTIONS</span></div>{currentSafe?.members.map((member) => <div className="member-table-row" key={member.username}><span className="member-name"><span className="member-avatar">{initials(member.username)}</span><span><strong>{member.username}</strong><small>{member.username === currentSafe.owner ? "Safe owner" : member.username === "auditor" ? "Read-only reviewer" : "Operations member"}</small></span></span><span className="member-permissions">{member.permissions.map((permission) => <span key={permission}>{permission}</span>)}</span><span className="member-actions"><Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedMember(member.username); setMemberPermissions(member.permissions); }}>Edit</Button>{member.username !== currentSafe.owner && <Button type="button" variant="ghost" size="sm" className="text-danger" onClick={() => { const result = setSafeMember(state, selectedSafe, null, learner); if (result.error) { toast.error(result.error); return; } updateState(result.state); toast.success(`${member.username} removed from ${selectedSafe}.`); }}>Remove</Button>}</span></div>)}</div>
            <div className="member-editor"><div className="member-editor-title"><div><h3>Configure member permissions</h3><p>Permission dependencies are validated before saving.</p></div><div className="field compact-field"><Label>Member</Label><Select value={selectedMember} onValueChange={(value) => { setSelectedMember(value); const found = currentSafe?.members.find((member) => member.username === value); if (found) setMemberPermissions(found.permissions); }}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{LEARNERS.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select></div></div><div className="permission-grid">{SAFE_PERMISSIONS.map((permission) => <label key={permission} className="permission-toggle"><Checkbox checked={memberPermissions.includes(permission)} onCheckedChange={(value) => togglePermission(permission, value === true)}/><span>{permission}</span></label>)}</div>{deps.length > 0 && <p className="dependency-note"><span>DEPENDENCIES</span>{deps.join(" · ")}</p>}<div className="member-editor-actions"><Button type="button" onClick={onSaveMember}>Save permissions<Check size={15}/></Button><Button type="button" variant="outline" onClick={() => testAccess(memberPermissions.includes("Use accounts") ? "Use accounts" : "List accounts")}>Test member access<SearchCheck size={14}/></Button></div></div>
          </TabsContent>
          <TabsContent value="inventory"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>ACCOUNT</th><th>TARGET</th><th>PLATFORM</th><th>MANAGEMENT</th></tr></thead><tbody>{safeAccounts.map((account) => <tr key={account.id} onClick={() => setSelectedAccountId(account.id)} className={cx(selectedAccountId === account.id && "row-selected")}><td><strong>{account.username}</strong><small>{account.type}</small></td><td>{account.address}</td><td>{account.platform}</td><td><StatusBadge tone={account.status === "Managed" ? "good" : account.status === "Rotation failed" ? "bad" : "warn"}>{account.status}</StatusBadge></td></tr>)}</tbody></table>{safeAccounts.length === 0 && <EmptyState title="No accounts in this Safe" detail="Onboard an account from the Accounts workspace." icon={KeyRound}/>}</div></TabsContent>
          <TabsContent value="activity"><div className="timeline">{state.audit.filter((event) => event.target.includes(selectedSafe) || event.detail.includes(selectedSafe)).slice(0, 8).map((event) => <TimelineEvent key={event.id} event={event}/>)}</div></TabsContent>
        </Tabs>
        {accessResult && <div className={cx("access-result", accessResult.allowed ? "access-result-ok" : "access-result-denied")}><span>{accessResult.allowed ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}</span><p>{accessResult.message}</p><Button type="button" variant="ghost" size="icon" aria-label="Dismiss result" onClick={() => setAccessResult(null)}><X size={14}/></Button></div>}
      </div></div>
    <div className="bottom-workspace"><Panel title="Create a Safe" note="Establish an isolated account and access boundary"><form id="safe-create-form" className="form-grid" onSubmit={onCreateSafe}><div className="field"><Label>Safe name</Label><Input required value={newSafe.name} onChange={(event) => setNewSafe({ ...newSafe, name: event.target.value.toUpperCase() })} placeholder="e.g. DBA-REPORTING" maxLength={30}/><small>3–30 uppercase letters, numbers or hyphens.</small></div><div className="field"><Label>Safe owner</Label><Select value={newSafe.owner} onValueChange={(owner) => setNewSafe({ ...newSafe, owner })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{LEARNERS.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select></div><div className="field span-two"><Label>Description</Label><Input required value={newSafe.description} onChange={(event) => setNewSafe({ ...newSafe, description: event.target.value })} placeholder="Business purpose and account scope"/></div><div className="form-end"><Button type="submit"><Plus size={15}/>Create Safe</Button></div></form></Panel>
      <Panel title="Permission validator" note="Confirm a permitted and denied action"><div className="field"><Label>Action to test</Label><Select value="Retrieve accounts" onValueChange={(permission) => { const result = evaluatePermission(state, selectedSafe, selectedMember, permission as SafePermission); setAccessResult(result); }}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{SAFE_PERMISSIONS.map((permission) => <SelectItem key={permission} value={permission}>{permission}</SelectItem>)}</SelectContent></Select></div><div className="validator-copy">Current test identity <b>{selectedMember}</b> in <b>{selectedSafe}</b>. Removing membership immediately affects access results.</div><Button type="button" variant="outline" onClick={() => testAccess("Retrieve accounts")}>Test Retrieve accounts<ArrowRight size={14}/></Button></Panel></div>
  </>;
}
function TimelineEvent({ event }: { event: PamState["audit"][number] }) { return <div className="timeline-event"><span className={`timeline-dot timeline-${event.result.toLowerCase()}`}/><div><strong>{event.action}</strong><small>{event.actor} · {event.target}</small><p>{event.detail}</p></div><time>{event.time}</time></div>; }

function AccountsView({ state, filteredAccounts, search, setSearch, statusFilter, setStatusFilter, draft, setDraft, onAdd, selectedAccount, setSelectedAccount, learner }: { state: PamState; filteredAccounts: PamAccount[]; search: string; setSearch: (value: string) => void; statusFilter: string; setStatusFilter: (value: string) => void; draft: PamAccount; setDraft: (draft: PamAccount) => void; onAdd: (event: FormEvent<HTMLFormElement>) => void; selectedAccount: string; setSelectedAccount: (id: string) => void; learner: string }) {
  const focused = state.accounts.find((account) => account.id === selectedAccount) ?? filteredAccounts[0] ?? state.accounts[0];
  const [drawer, setDrawer] = useState(false);
  const owners = [...new Set(state.accounts.map((account) => account.owner))];
  return <><SectionHeading eyebrow="PRIVILEGED INVENTORY · ACCOUNT LIFECYCLE" title="Account management" description="Onboard, verify and inspect privileged identities. Every change flows into Safe inventory, CPM operations and audit history." actions={<span className="inventory-total"><KeyRound size={15}/><b>{state.accounts.length}</b> accounts</span>}/>
    <div className="inventory-stats"><div><span>MANAGED</span><strong>{state.accounts.filter((account) => account.status === "Managed").length}</strong></div><div><span>VERIFY REQUIRED</span><strong>{state.accounts.filter((account) => account.status === "Verify required").length}</strong></div><div><span>ROTATION FAILED</span><strong>{state.accounts.filter((account) => account.status === "Rotation failed").length}</strong></div><div><span>UNMANAGED</span><strong>{state.accounts.filter((account) => account.status === "Unmanaged").length}</strong></div></div>
    <div className="account-layout"><Panel className="account-inventory" title="Enterprise account inventory" note="GLOBAL FINANCIAL SERVICES · 9 target systems" action={<Button type="button" size="sm" onClick={() => document.getElementById("account-onboard")?.scrollIntoView({ behavior: "smooth" })}><Plus size={14}/>Onboard account</Button>}><div className="table-toolbar"><div className="search-field"><Search size={14}/><Input aria-label="Search accounts" placeholder="Search username, target or Safe" value={search} onChange={(event) => setSearch(event.target.value)}/></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="filter-select"><SlidersHorizontal size={14}/><SelectValue placeholder="All states"/></SelectTrigger><SelectContent><SelectItem value="all">All management states</SelectItem>{["Managed", "Verify required", "Rotation failed", "Unmanaged"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select><span className="result-count">{filteredAccounts.length} RECORDS</span></div><div className="data-table-wrap"><table className="data-table account-table"><thead><tr><th>PRIVILEGED IDENTITY</th><th>TARGET SYSTEM</th><th>PLATFORM</th><th>SAFE</th><th>OWNER</th><th>STATUS</th></tr></thead><tbody>{filteredAccounts.map((account) => <tr key={account.id} onClick={() => { setSelectedAccount(account.id); setDrawer(true); }} className={cx("click-row", selectedAccount === account.id && "row-selected")}><td><strong>{account.username}</strong><small>{account.name} · {account.type}</small></td><td>{account.address}</td><td>{account.platform}</td><td><span className="code-cell">{account.safe}</span></td><td>{account.owner}</td><td><StatusBadge tone={account.status === "Managed" ? "good" : account.status === "Rotation failed" ? "bad" : "warn"}>{account.status}</StatusBadge></td></tr>)}</tbody></table>{filteredAccounts.length === 0 && <EmptyState title="No matching accounts" detail="Adjust the search text or management state."/>}</div></Panel>
      <Panel className="account-detail" title="Account details" note="SELECTED INVENTORY RECORD"><div className="account-detail-top"><div className="account-key-icon"><KeyRound size={20}/></div><div><h3>{focused?.username ?? "No account selected"}</h3><span>{focused?.address}</span></div><Button type="button" variant="ghost" size="icon" aria-label="Close details" onClick={() => setDrawer(false)}><X size={15}/></Button></div>{focused && <><StatusBadge tone={focused.status === "Managed" ? "good" : focused.status === "Rotation failed" ? "bad" : "warn"}>{focused.status.toUpperCase()}</StatusBadge><div className="detail-facts account-facts"><Detail label="PLATFORM" value={focused.platform}/><Detail label="SAFE" value={focused.safe}/><Detail label="ACCOUNT OWNER" value={focused.owner}/><Detail label="BUSINESS PURPOSE" value={focused.purpose}/><Detail label="DEPENDENCY" value={focused.dependency || "No dependency recorded"}/><Detail label="ROTATION POLICY" value={focused.policy}/><Detail label="LAST VERIFY" value={focused.lastVerify}/><Detail label="LAST CHANGE" value={focused.lastChange}/><Detail label="LAST RECONCILE" value={focused.lastReconcile}/></div>{focused.failureCause && <div className="failure-callout"><AlertTriangle size={15}/><span><strong>Failure detail</strong>{focused.failureCause}</span></div>}<div className="detail-link-row"><span>MANAGEMENT OPERATIONS</span><Button type="button" size="sm" variant="outline" onClick={() => { const item = state.accounts.find((account) => account.id === focused.id); if (item) document.getElementById("account-onboard")?.scrollIntoView({ behavior: "smooth" }); }}>Edit properties</Button></div><p className="access-note">Access test: <b>{learner}</b> {canSafeMemberPerform(state.safes.find((safe) => safe.name === focused.safe), learner, "List accounts") ? "can list accounts" : "cannot list accounts"} in {focused.safe}.</p></>}</Panel></div>
    <Panel title="Onboard a privileged account" note="Simulated target validation · supported Windows onboarding scenario"><form id="account-onboard" className="account-form" onSubmit={onAdd}><div className="form-grid"><div className="field"><Label>Account name</Label><Input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Administrator"/></div><div className="field"><Label>Username</Label><Input required value={draft.username} onChange={(event) => setDraft({ ...draft, username: event.target.value })} placeholder="Administrator"/></div><div className="field"><Label>Target address</Label><Input required value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value.toUpperCase() })} placeholder="WIN-SRV-01"/></div><div className="field"><Label>Platform</Label><Select value={draft.platform} onValueChange={(platform) => setDraft({ ...draft, platform })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["Windows Server Local", "Windows Domain Account", "Unix SSH", "SQL Server Account", "Oracle Database", "Unsupported platform"].map((platform) => <SelectItem key={platform} value={platform}>{platform}</SelectItem>)}</SelectContent></Select></div><div className="field"><Label>Safe</Label><Select value={draft.safe} onValueChange={(safe) => setDraft({ ...draft, safe })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{state.safes.map((safe) => <SelectItem key={safe.name} value={safe.name}>{safe.name}</SelectItem>)}</SelectContent></Select></div><div className="field"><Label>Account type</Label><Select value={draft.type} onValueChange={(type) => setDraft({ ...draft, type })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["Human administrator", "Domain administrator", "Service account", "Database account", "Application account", "Shared privileged"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div><div className="field"><Label>Owner</Label><Select value={draft.owner} onValueChange={(owner) => setDraft({ ...draft, owner })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{[...new Set([...LEARNERS, ...owners])].map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}</SelectContent></Select></div><div className="field"><Label>Rotation policy</Label><Input disabled value="Windows-90d · verify before change"/></div><div className="field span-two"><Label>Business purpose</Label><Textarea required rows={2} value={draft.purpose} onChange={(event) => setDraft({ ...draft, purpose: event.target.value })} placeholder="Describe the system responsibility this account supports"/></div><div className="field span-two"><Label>Application dependency <span className="optional">OPTIONAL</span></Label><Input value={draft.dependency} onChange={(event) => setDraft({ ...draft, dependency: event.target.value })} placeholder="Service or application using this identity"/></div><div className="form-end"><Button type="submit"><Plus size={15}/>Add account</Button><span>Management starts at Verify required until credential validation succeeds.</span></div></div></form></Panel>
    <div className={cx("detail-drawer-backdrop", drawer && "drawer-open")} onClick={() => setDrawer(false)}><div className="detail-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><strong>Account record</strong><Button type="button" variant="ghost" size="icon" aria-label="Close account details" onClick={() => setDrawer(false)}><X size={16}/></Button></div><p>{focused?.username} · {focused?.address}</p>{focused && <div className="detail-facts">{Object.entries({Platform:focused.platform,Safe:focused.safe,Owner:focused.owner,Policy:focused.policy,"Last verify":focused.lastVerify,"Last change":focused.lastChange,"Last reconcile":focused.lastReconcile}).map(([label,value]) => <Detail key={label} label={label.toUpperCase()} value={value}/>)}</div>}</div></div>
  </>;
}

function AccessView({ state, selectedSafe, setSelectedSafe, learner, accessResult, setAccessResult }: { state: PamState; selectedSafe: string; setSelectedSafe: (safe: string) => void; learner: string; accessResult: { allowed: boolean; message: string } | null; setAccessResult: (result: { allowed: boolean; message: string } | null) => void }) {
  const [identity, setIdentity] = useState(learner);
  const [permission, setPermission] = useState<SafePermission>("Retrieve accounts");
  const safe = state.safes.find((item) => item.name === selectedSafe);
  const selectedMember = safe?.members.find((member) => member.username === identity);
  return <><SectionHeading eyebrow="AUTHORIZATION · LEAST-PRIVILEGE TESTING" title="Access management" description="Inspect Safe membership and verify whether a specific simulated operator may perform an operation."/><div className="access-workspace"><Panel title="Permission decision test" note="Authorization is evaluated from the shared Safe membership state"><div className="form-grid"><div className="field"><Label>Safe</Label><Select value={selectedSafe} onValueChange={setSelectedSafe}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{state.safes.map((item) => <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select></div><div className="field"><Label>Simulated identity</Label><Select value={identity} onValueChange={setIdentity}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{LEARNERS.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select></div><div className="field span-two"><Label>Operation</Label><Select value={permission} onValueChange={(value) => setPermission(value as SafePermission)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{SAFE_PERMISSIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div><div className="policy-summary"><span>MEMBER PERMISSIONS</span><p>{selectedMember?.permissions.join(" · ") || "No active membership for this identity."}</p></div><Button type="button" onClick={() => setAccessResult(evaluatePermission(state, selectedSafe, identity, permission))}>Evaluate authorization<ArrowRight size={14}/></Button>{accessResult && <div className={cx("access-result", accessResult.allowed ? "access-result-ok" : "access-result-denied")}><span>{accessResult.allowed ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}</span><p>{accessResult.message}</p></div>}</Panel><Panel title="Permission boundary" note="What is checked"><div className="boundary-list">{[{name:"Safe membership",detail:"Identity must be an active member of the selected Safe."},{name:"Exact operation",detail:"List, retrieve, use, manage and session initiation are evaluated separately."},{name:"Dependencies",detail:"Permission setup validates prerequisite capabilities before saving."},{name:"Audit evidence",detail:"Denied tests produce a denied event and do not change access."}].map((item,index)=><div className="boundary-row" key={item.name}><span>0{index+1}</span><div><strong>{item.name}</strong><p>{item.detail}</p></div></div>)}</div><div className="small-note">Current workspace actor: <b>{learner}</b>. This is a simulation identity, not a real platform role.</div></Panel></div></>;
}

function CpmView({ state, selectedAccount, setSelectedAccount, selectedCpmAccount, operations, onRun, onRepair }: { state: PamState; selectedAccount: string; setSelectedAccount: (id: string) => void; selectedCpmAccount: PamAccount | undefined; operations: PamState["cpmOperations"]; onRun: (operation: CpmOperation) => void; onRepair: (repair: "unlock" | "reconcile-access" | "target-connectivity") => void }) {
  const queue = state.accounts.filter((account) => account.status === "Verify required" || account.status === "Rotation failed" || account.status === "Unmanaged");
  return <><SectionHeading eyebrow="CENTRAL POLICY MANAGER · OPERATIONS" title="CPM operations" description="Run deterministic account verification, password changes and reconciliation. Inspect operation evidence and repair failure conditions before retry." actions={<StatusBadge tone={state.accounts.some((account) => account.status === "Rotation failed") ? "warn" : "good"}>{state.accounts.some((account) => account.status === "Rotation failed") ? "EXCEPTIONS PRESENT" : "CPM HEALTHY"}</StatusBadge>}/>
    <div className="cpm-metrics"><div><span>MANAGED ACCOUNTS</span><strong>{state.accounts.filter((account) => account.status === "Managed").length}</strong><small>eligible for schedule</small></div><div><span>VERIFY REQUIRED</span><strong>{state.accounts.filter((account) => account.status === "Verify required").length}</strong><small>pending credential test</small></div><div><span>FAILED ROTATIONS</span><strong className={state.accounts.some((account) => account.status === "Rotation failed") ? "metric-danger" : ""}>{state.accounts.filter((account) => account.status === "Rotation failed").length}</strong><small>requires investigation</small></div><div><span>PENDING RECONCILE</span><strong>{state.accounts.filter((account) => account.status === "Rotation failed").length}</strong><small>review before retry</small></div></div>
    <div className="cpm-layout"><div className="cpm-main"><Panel title="Rotation and verification queue" note="Select an account to inspect its policy, state and operation history"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>ACCOUNT · TARGET</th><th>PLATFORM · SAFE</th><th>LAST CHANGE</th><th>MANAGEMENT STATE</th></tr></thead><tbody>{queue.map((account) => <tr key={account.id} className={cx("click-row", selectedAccount === account.id && "row-selected")} onClick={() => setSelectedAccount(account.id)}><td><strong>{account.username}</strong><small>{account.address}</small></td><td>{account.platform}<small>{account.safe}</small></td><td>{account.lastChange}</td><td><StatusBadge tone={account.status === "Rotation failed" ? "bad" : "warn"}>{account.status}</StatusBadge></td></tr>)}</tbody></table>{queue.length === 0 && <EmptyState title="No operation exceptions" detail="All accounts are managed and verified." icon={CheckCircle2}/>}</div></Panel>
      <Panel title="Operation history" note={selectedCpmAccount ? `${selectedCpmAccount.username} · ${selectedCpmAccount.address}` : "Select an account"}><div className="operation-list">{operations.length > 0 ? operations.map((operation) => <div className="operation-row" key={operation.id}><span className={operation.result === "Completed" ? "operation-indicator success" : "operation-indicator failed"}>{operation.result === "Completed" ? <Check size={13}/> : <AlertTriangle size={13}/>}</span><div><strong>{operation.operation} · {operation.result}</strong><p>{operation.detail}</p></div><time>{operation.time}</time></div>) : <EmptyState title="No operations recorded" detail="Run Verify, Change or Reconcile to create evidence." icon={Activity}/>}</div></Panel>
      </div><aside className="cpm-side"><Panel title="Account operation" note="Selected managed account"><Select value={selectedCpmAccount?.id ?? selectedAccount} onValueChange={setSelectedAccount}><SelectTrigger><SelectValue placeholder="Choose an account"/></SelectTrigger><SelectContent>{state.accounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.username} · {account.address}</SelectItem>)}</SelectContent></Select><div className="cpm-account-brief"><span className="account-key-icon"><KeyRound size={17}/></span><div><strong>{selectedCpmAccount?.username}</strong><small>{selectedCpmAccount?.address}</small></div></div><div className="detail-facts cpm-facts"><Detail label="PLATFORM" value={selectedCpmAccount?.platform ?? "—"}/><Detail label="SAFE" value={selectedCpmAccount?.safe ?? "—"}/><Detail label="POLICY" value={selectedCpmAccount?.policy ?? "—"}/><Detail label="LAST VERIFY" value={selectedCpmAccount?.lastVerify ?? "—"}/><Detail label="LAST CHANGE" value={selectedCpmAccount?.lastChange ?? "—"}/><Detail label="LAST RECONCILE" value={selectedCpmAccount?.lastReconcile ?? "—"}/></div>{selectedCpmAccount?.failureCause && <div className="failure-callout"><AlertTriangle size={15}/><span><strong>Failure reason</strong>{selectedCpmAccount.failureCause}</span></div>}<div className="operation-actions"><Button type="button" variant="outline" onClick={() => onRun("Verify")}><SearchCheck size={14}/>Verify</Button><Button type="button" onClick={() => onRun("Change")}><RotateCcw size={14}/>Change password</Button><Button type="button" variant="outline" onClick={() => onRun("Reconcile")}><Activity size={14}/>Reconcile</Button></div><div className="management-toggle"><span><b>Enable management</b><small>Management is simulated per account.</small></span><Button type="button" size="sm" variant="outline" onClick={() => onRun("Verify")}>{selectedCpmAccount?.status === "Managed" ? "Managed" : "Verify to enable"}</Button></div></Panel>
        {selectedCpmAccount?.failureCause && <Panel title="Incident recovery" note="Repair the target condition before retrying change"><div className="repair-options"><Button type="button" variant="outline" onClick={() => onRepair("unlock")}><Power size={14}/>Unlock target account</Button><Button type="button" variant="outline" onClick={() => onRepair("reconcile-access")}><KeyRound size={14}/>Restore reconcile access</Button><Button type="button" variant="outline" onClick={() => onRepair("target-connectivity")}><Network size={14}/>Restore connectivity</Button></div><p className="small-note">Record the corrective action, run Reconcile if the target and vault may differ, then Change and Verify.</p></Panel>}</aside></div>
    <div className="bottom-workspace"><Panel title="Rotation policy" note="Policy assignment is visible on each account"><div className="policy-grid"><div><span>POLICY</span><strong>Windows-90d</strong><small>Account-driven interval</small></div><div><span>ROTATION INTERVAL</span><strong>90 days</strong><small>Next schedule derived from last change</small></div><div><span>COMPLEXITY PROFILE</span><strong>GFS-Strong-24</strong><small>Simulated target policy</small></div><div><span>DEPENDENCY AWARE</span><strong>Enabled</strong><small>Review consumers before rotation</small></div></div></Panel><Panel title="CPM health checks" note="Component readiness"><div className="health-list"><div className="health-row"><span className="health-check"><Check size={12}/></span><div><strong>CPM worker</strong><small>Control service available</small></div><span className="health-time">HEALTHY</span></div><div className="health-row"><span className="health-check"><Check size={12}/></span><div><strong>Target connectivity</strong><small>Training network path simulated</small></div><span className="health-time">READY</span></div></div></Panel></div>
  </>;
}

function PsmView({ state, onLaunch, onApproval, onClose, onCommand, session, command, setCommand, terminalEnd }: { state: PamState; onLaunch: (event: FormEvent<HTMLFormElement>) => void; onApproval: () => void; onClose: () => void; onCommand: (event: FormEvent<HTMLFormElement>) => void; session: PamState["sessions"][number] | undefined; command: string; setCommand: (command: string) => void; terminalEnd: React.RefObject<HTMLDivElement | null> }) {
  const recent = state.sessions.slice(0, 5);
  return <><SectionHeading eyebrow="PRIVILEGED SESSION MANAGER · BROKERED ACCESS" title="PSM operations" description="Request controlled RDP access, run a safe simulated command set and review the session events and recording timeline." actions={<StatusBadge tone={state.psmConnectorHealthy ? "good" : "bad"}>{state.psmConnectorHealthy ? "PSM CONNECTOR HEALTHY" : "CONNECTOR UNAVAILABLE"}</StatusBadge>}/>
    <div className="psm-layout"><div className="psm-main"><Panel title="Launch a privileged session" note="Production-like ticket controls · isolated training session"><form className="session-form" onSubmit={onLaunch}><div className="form-grid"><div className="field"><Label>Target server</Label><Select name="target" defaultValue="WIN-SRV-01"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["WIN-SRV-01", "WIN-SRV-02", "WIN-DC-01", "WIN-APP-01"].map((target) => <SelectItem value={target} key={target}>{target}</SelectItem>)}</SelectContent></Select></div><div className="field"><Label>Target account</Label><Input disabled value="Administrator"/></div><div className="field"><Label>Connection component</Label><Input disabled value="RDP through PSM"/></div><div className="field"><Label>Ticket reference</Label><Input required name="psm-ticket" placeholder="CHG-12345"/></div><div className="field span-two"><Label>Business reason</Label><Textarea required name="psm-reason" rows={2} placeholder="Describe the approved administrative task (12+ characters)"/></div></div><div className="approval-row"><div className="approval-icon"><ClipboardCheck size={17}/></div><div><strong>Approval status</strong><small>{state.approvalGranted ? "Approved for this training scenario · WIN-SRV-01" : "Approval required before session launch"}</small></div><StatusBadge tone={state.approvalGranted ? "good" : "warn"}>{state.approvalGranted ? "APPROVED" : "PENDING"}</StatusBadge><Button type="button" size="sm" variant={state.approvalGranted ? "outline" : "default"} onClick={onApproval}>{state.approvalGranted ? "Withdraw" : "Request approval"}</Button></div><div className="session-footer"><span><Clock3 size={14}/>Session duration cap <b>60 min</b> · Recording <b>enabled</b></span><Button type="submit" disabled={!state.psmConnectorHealthy || Boolean(session)}><Play size={14}/>Launch through PSM</Button></div></form></Panel>
      <Panel className="terminal-panel" title="Controlled session console" note={session ? `${session.target} · ${session.account} · ${session.ticket}` : "A session terminal appears after an approved launch"} action={session && <Button type="button" variant="outline" size="sm" onClick={onClose}><Power size={14}/>Terminate</Button>}><div className="terminal-window"><div className="terminal-titlebar"><span><i/><i/><i/></span><strong>{session ? `psm-session://${session.target}/${session.account}` : "psm-session://awaiting-launch"}</strong><span className={session ? "terminal-live" : "terminal-idle"}>{session ? "SESSION ACTIVE" : "STANDBY"}</span></div><div className="terminal-body"><div className="terminal-intro">ShadowXLab controlled training shell<br/>Target: {session?.target ?? "not connected"}<br/>Identity: {session?.account ?? "not authenticated"}<br/>Type <b>help</b> to list allowed commands.</div>{session?.commands.map((entry,index)=>{ const [cmd,...output]=entry.split("\n"); return <div className="terminal-output" key={`${session.id}-${index}`}><div><span>PS&gt;</span> {cmd}</div>{output.map((line,idx)=><pre key={idx}>{line}</pre>)}</div>; })}<div ref={terminalEnd}/></div><form className="terminal-input-row" onSubmit={onCommand}><span>PS&gt;</span><Input aria-label="Simulated terminal command" value={command} onChange={(event)=>setCommand(event.target.value)} disabled={!session || session.status !== "Active"} placeholder={session ? "Enter a simulated command…" : "Launch an approved session to continue"}/><Button type="submit" size="icon" disabled={!session || session.status !== "Active" || !command.trim()} aria-label="Run simulated command"><ArrowRight size={15}/></Button></form></div><div className="command-chips">{TERMINAL_COMMANDS.map((item)=><Button type="button" key={item} variant="outline" size="sm" disabled={!session || session.status !== "Active"} onClick={()=>onCommand({ preventDefault:()=>{}, currentTarget: { elements: { namedItem:()=>null } } } as unknown as FormEvent<HTMLFormElement>)}>{item}</Button>)}</div><p className="terminal-disclaimer"><Shield size={13}/>Commands return fixed training data and never run on this device or a real server.</p></Panel></div>
      <aside className="psm-side"><Panel title="Session requirements" note="Access preflight"><div className="preflight-list">{[{label:"Safe session permission",ok:true,detail:"WIN-SAFE · Initiate privileged sessions"},{label:"Approval request",ok:state.approvalGranted,detail:state.approvalGranted?"Training approval recorded":"Awaiting operator approval"},{label:"PSM connector",ok:state.psmConnectorHealthy,detail:state.psmConnectorHealthy?"RDP component available":"Connector health check failed"},{label:"Recording policy",ok:true,detail:"Session events retained in audit"}].map((item)=> <div className="preflight-row" key={item.label}><span className={item.ok?"preflight-ok":"preflight-pending"}>{item.ok?<Check size={12}/>:<Clock3 size={12}/>}</span><div><strong>{item.label}</strong><small>{item.detail}</small></div></div>)}</div><Button type="button" variant="outline" className="full-width" onClick={onApproval}>{state.approvalGranted?"Reset approval":"Obtain approval"}</Button></Panel><Panel title="Session recording" note="Most recent session evidence">{session?<div className="recording-card"><div className="recording-header"><span><span className="recording-dot"/>{session.status === "Active" ? "RECORDING LIVE" : "RECORDING COMPLETE"}</span><span>{session.started}</span></div><div className="recording-title">{session.target} <span>→</span> {session.account}</div><div className="recording-timeline">{["Session requested","Approval verified","Credential injected",...session.commands.map((_,index)=>`Command ${index+1}`),...(session.status === "Terminated"?["Session terminated"]:[])].map((event,index)=><div key={`${event}-${index}`}><i style={{left:`${Math.min(index/(Math.max(session.commands.length+3,3))*100,100)}%`}}/><span>{event}</span></div>)}</div><div className="recording-meta"><span>CONNECTION</span><b>{session.component}</b><span>TICKET</span><b>{session.ticket}</b></div></div>:<EmptyState title="No session recorded" detail="Launch a session to create recording evidence." icon={MonitorPlay}/>}</Panel><Panel title="Session history" note={`${state.sessions.length} recorded training sessions`}><div className="session-history">{recent.map((item)=><div className="session-history-row" key={item.id}><span className="session-history-icon"><MonitorPlay size={14}/></span><div><strong>{item.target} · {item.account}</strong><small>{item.ticket} · {item.started}</small></div><StatusBadge tone={item.status==="Terminated"?"good":"blue"}>{item.status}</StatusBadge></div>)}</div></Panel></aside></div>
  </>;
}
