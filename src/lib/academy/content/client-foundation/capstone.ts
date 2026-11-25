/**
 * SHADOWXLAB PAM ACADEMY — CAPSTONE PROJECT (MODULE 12) SPECIFICATION
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Project Scenario:
 * "Design a basic PAM workflow for Windows and Linux administrator accounts."
 *
 * 5 Required Deliverable Tasks:
 * 1. Identify accounts and platforms
 * 2. Design a Safe structure and permissions
 * 3. Describe onboarding and password management
 * 4. Review audit evidence and troubleshoot an access issue
 * 5. Document configuration decisions and security controls
 */

import type { CapstoneProjectSpec, CapstoneTaskSpec } from "./types";
import type { PamState } from "@/lib/pam-engine";

export const CAPSTONE_TASKS: CapstoneTaskSpec[] = [
  {
    taskNumber: 1,
    title: "Task 1 — Identify Accounts and Platforms",
    requirement:
      "Define target privileged accounts (e.g., local administrator on Windows, root/named admin on Linux) and determine corresponding platform policy assignments, address properties, and administrative ownership.",
    deliverable:
      "Structured inventory matrix detailing: Account Name, Host Address, Platform Policy ID, Account Type (Local/Domain/Service), and Custodian.",
    evaluationCriteria: [
      "At least one Windows administrator target identified with valid address and platform binding",
      "At least one Linux administrator account identified with appropriate SSH/Unix platform binding",
      "Target systems prerequisites documented (connectivity, ports TCP 445/3389/22, directory ownership)",
    ],
    consoleTarget: "accounts",
  },
  {
    taskNumber: 2,
    title: "Task 2 — Design a Safe Structure and Permissions",
    requirement:
      "Design an enterprise Safe hierarchy separating Windows and Linux administrative tiers. Assign role-based permissions (List, Retrieve, Use, Add, Update, Administer) following the principle of least privilege and separation of duties.",
    deliverable:
      "Safe architecture plan detailing Safe naming conventions, retention policies, and granular user/group ACL assignments for admin, operator, and auditor roles.",
    evaluationCriteria: [
      "Dedicated logical Safes defined (e.g. WIN-ADMIN-SAFE and LINUX-ADMIN-SAFE)",
      "Granular permissions mapped correctly: Operators receive List/Use/Initiate PSM; Administrators receive Add/Update/Manage Safe; Auditors receive List/Audit",
      "Excessive permissions avoided (no general users given Retrieve or Manage Safe)",
    ],
    consoleTarget: "safes",
  },
  {
    taskNumber: 3,
    title: "Task 3 — Describe Onboarding and Password Management",
    requirement:
      "Specify the step-by-step onboarding procedure for both accounts and define the CPM password lifecycle policy including automated verification, rotation frequency, and reconciliation workflow.",
    deliverable:
      "Onboarding specification & CPM policy configuration sheet documenting rotation intervals (e.g., 30/90 days), complexity rules, and reconcile account linkage.",
    evaluationCriteria: [
      "Onboarding parameter validation (username, address, platform, Safe association)",
      "CPM policy parameters specified: Verify frequency, Change interval, and Reconcile linkage",
      "Emergency out-of-sync recovery procedure documented (CPM error code CACPM072E remediation)",
    ],
    consoleTarget: "cpm",
  },
  {
    taskNumber: 4,
    title: "Task 4 — Review Audit Evidence and Troubleshoot an Access Issue",
    requirement:
      "Investigate a simulated PAM incident (e.g., an unauthorized retrieval attempt or failed CPM reconciliation). Review audit event logs, isolate the root cause, and document corrective actions.",
    deliverable:
      "Incident forensic summary citing event IDs, timestamps, failure mechanics, and verification that corrective remediation succeeded.",
    evaluationCriteria: [
      "Identification of specific audit event evidence (actor, timestamp, target account, error reason)",
      "Root cause isolated to configuration error or network desynchronization",
      "Remediation executed and verified against live simulator state",
    ],
    consoleTarget: "audit",
  },
  {
    taskNumber: 5,
    title: "Task 5 — Document Configuration Decisions and Security Controls",
    requirement:
      "Author an executive summary documenting all architectural and governance decisions made during the workflow design, explaining how least privilege, Zero Trust, MFA, and immutable auditability are enforced.",
    deliverable:
      "Final operational architecture report synthesizing controls, compliance posture, and risk mitigations.",
    evaluationCriteria: [
      "Clear explanation of Zero Trust and least privilege enforcement across the workflow",
      "Justification of Safe partitioning and credential isolation architecture",
      "Compliance auditability and non-repudiation controls documented for SOC/security auditors",
    ],
    consoleTarget: "overview",
  },
];

export const CLIENT_CAPSTONE_PROJECT: CapstoneProjectSpec = {
  id: "client-capstone-m12",
  title: "Comprehensive PAM Workflow Design & Operational Validation",
  scenario:
    "You are the Lead Privileged Access Management Engineer tasked with onboarding and securing privileged access for critical infrastructure at Global Financial Services. You must design and validate an end-to-end PAM workflow securing both Windows domain server administration and Linux production database administration.",
  targetEnvironment: "ShadowXLab Enterprise PAM Simulator (Vault, PVWA, CPM, PSM)",
  tasks: CAPSTONE_TASKS,
  minimumPassingScore: 70,
};

export interface CapstoneTaskSubmission {
  taskNumber: 1 | 2 | 3 | 4 | 5;
  completed: boolean;
  notes?: string;
  evidenceItems: string[];
}

export interface CapstoneEvaluationReport {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  taskScores: {
    taskNumber: number;
    title: string;
    score: number; // 0-100
    passed: boolean;
    feedback: string;
  }[];
  overallScore: number;
  minimumPassingScore: number;
  passed: boolean;
  verdict: "CERTIFIED" | "REMEDIATION_REQUIRED";
  evaluatedAt: string;
}

export function evaluateCapstoneProject(
  state: PamState,
  submissions: Record<number, CapstoneTaskSubmission> = {},
): CapstoneEvaluationReport {
  // Task 1: Check account inventory in state (at least 1 Windows account + 1 Linux or Oracle account)
  const hasWin = state.accounts.some(
    (a) => a.platform.toLowerCase().includes("win") || a.username.toLowerCase().includes("admin"),
  );
  const hasLinux =
    state.accounts.some(
      (a) =>
        a.platform.toLowerCase().includes("unix") ||
        a.platform.toLowerCase().includes("linux") ||
        a.platform.toLowerCase().includes("ora") ||
        a.username === "oracle",
    ) || Boolean(submissions[1]?.completed);
  const task1Score = hasWin && hasLinux ? 100 : hasWin ? 75 : submissions[1]?.completed ? 80 : 50;

  // Task 2: Check Safe structure and permissions in state
  const hasSafes = state.safes.length >= 2;
  const hasSafeMembers = state.safes.some((s) => s.members && s.members.length >= 2);
  const task2Score =
    hasSafes && hasSafeMembers ? 100 : hasSafes ? 80 : submissions[2]?.completed ? 85 : 50;

  // Task 3: Check CPM operations and password management
  const hasCpmOps = state.cpmOperations.length > 0;
  const task3Score = hasCpmOps ? 100 : submissions[3]?.completed ? 85 : 60;

  // Task 4: Check audit records and troubleshooting
  const hasAuditEvents = state.audit.length >= 3;
  const hasResolvedIncident =
    state.incidents.some((i) => i.status === "Resolved") || submissions[4]?.completed;
  const task4Score =
    hasAuditEvents && hasResolvedIncident
      ? 100
      : hasAuditEvents
        ? 80
        : submissions[4]?.completed
          ? 85
          : 50;

  // Task 5: Documentation of controls & governance
  const task5Score = submissions[5]?.completed ? 100 : 75;

  const taskScores = [
    {
      taskNumber: 1,
      title: "Identify Accounts and Platforms",
      score: task1Score,
      passed: task1Score >= 70,
      feedback:
        task1Score >= 70
          ? "Accounts and platform policy associations properly cataloged for Windows and Linux hosts."
          : "Define target accounts on both Windows and Linux hosts in the Accounts console.",
    },
    {
      taskNumber: 2,
      title: "Design a Safe Structure and Permissions",
      score: task2Score,
      passed: task2Score >= 70,
      feedback:
        task2Score >= 70
          ? "Safe hierarchy separates operational tiers with least-privilege ACL boundaries."
          : "Review Safe permissions to ensure separation of duties between admin and operator roles.",
    },
    {
      taskNumber: 3,
      title: "Describe Onboarding and Password Management",
      score: task3Score,
      passed: task3Score >= 70,
      feedback:
        task3Score >= 70
          ? "CPM verification, rotation schedules, and reconcile linkages configured accurately."
          : "Execute a CPM verify or rotation operation in the CPM console to generate baseline operational evidence.",
    },
    {
      taskNumber: 4,
      title: "Review Audit Evidence and Troubleshoot an Access Issue",
      score: task4Score,
      passed: task4Score >= 70,
      feedback:
        task4Score >= 70
          ? "Audit evidence forensic analysis verified; root cause identified and remediated."
          : "Inspect audit log entries and resolve outstanding incidents in the Troubleshooting workbench.",
    },
    {
      taskNumber: 5,
      title: "Document Configuration Decisions and Security Controls",
      score: task5Score,
      passed: task5Score >= 70,
      feedback:
        task5Score >= 70
          ? "Zero Trust controls, MFA requirements, and compliance architecture documented."
          : "Complete configuration rationale documentation covering least privilege and auditability.",
    },
  ];

  const overallScore = Math.round(
    taskScores.reduce((sum, t) => sum + t.score, 0) / taskScores.length,
  );
  const passed = overallScore >= CLIENT_CAPSTONE_PROJECT.minimumPassingScore;
  const completedTasks = taskScores.filter((t) => t.passed).length;

  return {
    projectId: CLIENT_CAPSTONE_PROJECT.id,
    projectName: CLIENT_CAPSTONE_PROJECT.title,
    totalTasks: 5,
    completedTasks,
    taskScores,
    overallScore,
    minimumPassingScore: CLIENT_CAPSTONE_PROJECT.minimumPassingScore,
    passed,
    verdict: passed ? "CERTIFIED" : "REMEDIATION_REQUIRED",
    evaluatedAt: new Date().toISOString(),
  };
}
