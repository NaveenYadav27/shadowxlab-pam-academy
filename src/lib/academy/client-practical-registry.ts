/**
 * SHADOWXLAB PAM ACADEMY — CLIENT FOUNDATION PRACTICAL REGISTRY
 * Explicit, typed module-to-practical routing for the 12-module CyberArk Basic Training programme.
 * Eliminates reliance on legacy associatedLabId string matching for client-12 modules
 * and provides dedicated concept builders for M04, M09, M10, M11, and M12.
 */

import type { GuidedConcept, IndependentChallengeSpec } from "./guided-lab-types";
import type { Lesson, PracticalExercise } from "./types";

export interface ClientPracticalRegistryEntry {
  clientModuleId: string;
  exerciseId: string;
  practicalObjective: string;
  targetConsole: PracticalExercise["targetConsole"];
  expectedOutcomes: string[];
  completionEvidence: string;
  buildConcepts: (
    lesson: Lesson,
    ex: PracticalExercise,
  ) => {
    concepts: GuidedConcept[];
    independent: IndependentChallengeSpec;
  };
}

/**
 * M04 — PVWA: Web Portal Fundamentals
 * Navigates PVWA Accounts, filters/inspects permitted properties, and investigates an access-denied case.
 * Never redirects to Discovery Scan or account onboarding.
 */
export function buildClientM04PvwaConcepts(
  _lesson: Lesson,
  ex: PracticalExercise,
): {
  concepts: GuidedConcept[];
  independent: IndependentChallengeSpec;
} {
  const prefix = ex.id;
  return {
    concepts: [
      {
        id: `${prefix}-c01`,
        order: 1,
        title: "Navigate PVWA Accounts & Inspect Permitted Properties",
        conceptIntro:
          "Password Vault Web Access (PVWA) is the central portal where operators search, filter, and inspect privileged accounts stored in authorized Safes.",
        importance:
          "Verifying account Address, Username, Platform ID, and Safe placement prevents operators from targeting the wrong host or platform.",
        realWorldContext:
          "Locate `Administrator` on `WIN-SRV-01` inside `WIN-SAFE` using the PVWA Accounts search and filter controls.",
        objective:
          "Navigate to the Accounts console, locate `Administrator` (`WIN-SRV-01`), and inspect its Safe and platform properties.",
        task: "Open `Accounts`, filter or search for `Administrator` on `WIN-SRV-01`, and inspect its Safe (`WIN-SAFE`) and Platform (`Windows Server Local`).",
        where: "Accounts Console (`Accounts` tab)",
        action:
          "Open `Accounts`, locate `Administrator` (`WIN-SRV-01`), and verify Safe `WIN-SAFE` and Platform `Windows Server Local`.",
        expectedResult:
          "`Administrator` on `WIN-SRV-01` is visible with permitted properties (`WIN-SAFE`, `Windows Server Local`, `Managed`).",
        why: "Operators must verify target metadata and Safe boundaries before initiating access requests.",
        targetConsole: "accounts",
        objectiveIds: ["m04-pvwa-inspect"],
        validatorRule: "m04-pvwa-inspect",
        hints: {
          level1Concept:
            "Which four core properties identify an account in the PVWA Accounts listing?",
          level2Location: "Open the `Accounts` tab in the top navigation bar.",
          level3Procedure:
            "In `Accounts`, search for `WIN-SRV-01` or `Administrator`, inspect its Safe (`WIN-SAFE`) and Platform (`Windows Server Local`), then click Check My Work.",
          level4Solution:
            "Open `Accounts`, inspect `Administrator` (`WIN-SRV-01`, `WIN-SAFE`, `Windows Server Local`), then click Check My Work.",
        },
        successExplanation:
          "PVWA account search and permitted property inspection verified for `WIN-SRV-01\\Administrator`.",
        successRealWorldRelevance:
          "Consistent property verification prevents misrouted administrative connections.",
        skillTag: "PVWA Account Navigation & Inspection",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Examine Simulated Access-Denied Scenario & Diagnostic Action",
        conceptIntro:
          "When a user lacks Safe permissions such as `Use accounts` or `Retrieve accounts`, the Vault denies access (`ITATS053E`) and logs an audit event.",
        importance:
          "Understanding why PVWA blocks an action lets support engineers diagnose Safe ACL gaps without granting excessive Vault Admin rights.",
        realWorldContext:
          "Investigate why `dba_user` is denied `Retrieve accounts` in `DBA-SAFE` (and why `INC-2043` / `ITATS053E` occurs when Safe ACLs are missing).",
        objective:
          "Examine the simulated access-denied boundary in `Safes` / `Troubleshooting` and identify the missing permission.",
        task: "Inspect `DBA-SAFE` member permissions for `dba_user` (or test `Retrieve accounts` in the Permission Evaluator) to confirm the access-denied boundary.",
        where: "Safes Console (`Safes` tab) → `DBA-SAFE`",
        action:
          "Open `Safes`, select `DBA-SAFE`, inspect `dba_user` permissions, and verify why `Retrieve accounts` is denied.",
        expectedResult:
          "Access-denied boundary confirmed: `dba_user` is blocked from `Retrieve accounts` (`ITATS053E` / least-privilege enforcement).",
        why: "Diagnosing access denials starts with checking Safe membership and granular permissions rather than bypassing Vault security.",
        targetConsole: "safes",
        objectiveIds: ["m04-access-denied"],
        validatorRule: "m04-access-denied",
        hints: {
          level1Concept:
            "What causes PVWA to block `Retrieve accounts` or display `ITATS053E` for a Safe member?",
          level2Location: "Open the `Safes` tab and select `DBA-SAFE`.",
          level3Procedure:
            "In `Safes` → `DBA-SAFE`, inspect `dba_user` permissions (note `Retrieve accounts` is withheld) or test `Retrieve accounts` in the Permission Evaluator, then click Check My Work.",
          level4Solution:
            "Confirm `Retrieve accounts` is withheld on `DBA-SAFE` for `dba_user` in `Safes`, then click Check My Work.",
        },
        successExplanation:
          "Simulated access-denied scenario analyzed: missing Safe ACLs trigger `ITATS053E` and block unauthorized retrieval.",
        successRealWorldRelevance:
          "Operators diagnose `Access Denied` tickets by inspecting Safe membership and granular ACLs.",
        skillTag: "PVWA Access-Denied Diagnostics",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Independent Account Property & Isolation Review",
      objective:
        "Verify `svc_backup` (`WIN-SRV-02`) properties in `Accounts` and confirm `auditor` is denied `Retrieve accounts` in `WIN-SAFE`.",
      initialEnvironment:
        "Baseline PVWA inventory loaded with `WIN-SAFE`, `DBA-SAFE`, and `svc_backup`.",
      enterpriseContext:
        "Auditors must be able to list accounts for compliance visibility without being able to retrieve plaintext passwords or launch sessions.",
      requirements: [
        "Inspect `svc_backup` on `WIN-SRV-02` in `Accounts` (`SERVICE-SAFE`).",
        "Confirm `auditor` in `WIN-SAFE` holds `List accounts` only and is denied `Retrieve accounts`.",
      ],
      targetConsole: "accounts",
      validatorRule: "ind-m04-pvwa",
      hints: {
        level1Concept:
          "Which permission allows `auditor` to view account metadata without retrieving passwords?",
        level2Location: "Inspect `svc_backup` in `Accounts` and `auditor` in `Safes` → `WIN-SAFE`.",
        level3Procedure:
          "Verify `svc_backup` (`WIN-SRV-02`, `SERVICE-SAFE`) in `Accounts` and confirm `auditor` only has `List accounts` in `WIN-SAFE`.",
        level4Solution:
          "Confirm `svc_backup` properties and `auditor` read-only isolation, then click Check Independent Challenge.",
      },
    },
  };
}

/**
 * M09 — Monitoring, Auditing and Reporting
 * Inspects Reports & Audit records, identifies suspicious/warning activity, and reviews compliance inventory.
 * Never requires launching a new PSM session.
 */
export function buildClientM09AuditConcepts(
  _lesson: Lesson,
  ex: PracticalExercise,
): {
  concepts: GuidedConcept[];
  independent: IndependentChallengeSpec;
} {
  const prefix = ex.id;
  return {
    concepts: [
      {
        id: `${prefix}-c01`,
        order: 1,
        title: "Inspect PAM Audit Records & User Activity in Reports & Audit",
        conceptIntro:
          "Every authentication, Safe modification, password operation, and session event is recorded in the Digital Vault's immutable audit journal.",
        importance:
          "SOC analysts and auditors rely on chronological PAM audit trails for non-repudiation and regulatory compliance.",
        realWorldContext:
          "Review the Vault audit journal in `Reports & Audit` to trace recent operator and automated CPM activity.",
        objective:
          "Open `Reports & Audit`, locate PAM audit records, and inspect user activity and privileged account access.",
        task: "Open `Reports & Audit` and inspect the chronological audit log entries (including `pam_operator`, `soc_analyst`, and `windows_admin` events).",
        where: "Reports & Audit Console (`Reports & Audit` tab)",
        action:
          "Open `Reports & Audit` and review the audit event journal, filtering by actor or action type.",
        expectedResult:
          "At least 4 chronological audit events inspected with actor, timestamp, target, and outcome.",
        why: "Centralized Vault logs cannot be tampered with by target host administrators.",
        targetConsole: "audit",
        objectiveIds: ["m09-audit-records"],
        validatorRule: "m09-audit-records",
        hints: {
          level1Concept:
            "Why are Digital Vault audit logs more trustworthy for SOC investigations than local server logs?",
          level2Location: "Open the `Reports & Audit` tab in the top navigation bar.",
          level3Procedure:
            "Open `Reports & Audit`, inspect the audit journal entries (`CPM Verify`, `Access review`, `Terminate PSM session`), then click Check My Work.",
          level4Solution:
            "Review the audit events in `Reports & Audit`, then return and click Check My Work.",
        },
        successExplanation:
          "PAM audit journal inspected: user activity, CPM operations, and session audit records verified.",
        successRealWorldRelevance:
          "Immutable Vault logs provide authoritative forensic evidence for SOC and compliance audits.",
        skillTag: "PAM Audit Journal Inspection",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Identify Suspicious Patterns & Compliance Inventory Evidence",
        conceptIntro:
          "SOC teams monitor PAM audit streams for anomalous patterns such as repeated failures, account lockouts, or unauthorized retrieval attempts.",
        importance:
          "Correlating warning/denied audit events with account and Safe inventories accelerates threat triage and compliance reporting.",
        realWorldContext:
          "Locate the `Warning` event on `svc_backup · WIN-SRV-02` (`Account locked on target`) and review the compliance inventory in `Reports & Audit`.",
        objective:
          "Identify warning/anomalous audit events and verify compliance inventory evidence in `Reports & Audit`.",
        task: "In `Reports & Audit`, locate the `Warning` / failed event (`svc_backup · WIN-SRV-02`) and inspect the Account & Safe Compliance inventory summary.",
        where: "Reports & Audit Console (`Reports & Audit` tab)",
        action:
          "Inspect the `Warning` event (`CPM Change` failure on `svc_backup`) and review the Compliance / Inventory evidence tabs.",
        expectedResult:
          "Suspicious/warning audit pattern and full Safe/Account compliance inventory evidence verified.",
        why: "Proactive anomaly triage catches credential compromise and rotation drift early.",
        targetConsole: "audit",
        objectiveIds: ["m09-suspicious-patterns"],
        validatorRule: "m09-suspicious-patterns",
        hints: {
          level1Concept:
            "Which audit event result values indicate potential anomalies or operational failures for SOC review?",
          level2Location:
            "Check the Result column (`Warning` / `Denied`) and Compliance tab in `Reports & Audit`.",
          level3Procedure:
            "In `Reports & Audit`, locate the `Warning` event on `svc_backup` and inspect the compliance inventory, then click Check My Work.",
          level4Solution:
            "Inspect the `Warning` audit event and compliance inventory in `Reports & Audit`, then click Check My Work.",
        },
        successExplanation:
          "Anomalous audit activity and compliance inventory evidence identified in `Reports & Audit`.",
        successRealWorldRelevance:
          "Simulated SIEM/CEF telemetry concepts map directly to SOC correlation rules.",
        skillTag: "SOC Anomaly & Compliance Analysis",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Independent SOC Forensic & Inventory Review",
      objective:
        "Verify automated vs human attribution in `Reports & Audit` and confirm compliance inventory readiness without launching a new PSM session.",
      initialEnvironment:
        "Reports & Audit console populated with Vault audit events and compliance inventory.",
      enterpriseContext:
        "SOC analysts must distinguish automated CPM service actions from human operator sessions during incident investigations.",
      requirements: [
        "Confirm both `Success` and `Warning`/`Denied` audit evidence is present in `Reports & Audit`.",
        "Confirm Safe and Account compliance inventory coverage is intact.",
      ],
      targetConsole: "audit",
      validatorRule: "ind-m09-audit",
      hints: {
        level1Concept:
          "How does `Reports & Audit` distinguish automated CPM actions from human operator actions?",
        level2Location: "Inspect the Actor and Action columns in `Reports & Audit`.",
        level3Procedure:
          "Review the Actor attribution (`pam_operator`, `soc_analyst`, `windows_admin`) and Compliance Inventory in `Reports & Audit`, then click Check Independent Challenge.",
        level4Solution:
          "Confirm audit attribution and compliance inventory in `Reports & Audit`, then click Check Independent Challenge.",
      },
    },
  };
}

/**
 * M10 — Troubleshooting Fundamentals
 * All three client-required simulated support tickets:
 * Ticket 1: Safe ACL permission denial (INC-2043)
 * Ticket 2: CPM credential desynchronization/lockout (INC-2041)
 * Ticket 3: PSM connection timeout/connectivity failure (INC-2044)
 */
export function buildClientM10TicketsConcepts(
  _lesson: Lesson,
  ex: PracticalExercise,
): {
  concepts: GuidedConcept[];
  independent: IndependentChallengeSpec;
} {
  const prefix = ex.id;
  return {
    concepts: [
      {
        id: `${prefix}-c01`,
        order: 1,
        title: "Ticket 1 — Diagnose & Resolve Safe ACL Permission Denial (INC-2043)",
        conceptIntro:
          "Ticket 1 (`INC-2043` / `ITATS053E`): `dba_user` reports `Access denied` when attempting to initiate a session in `DBA-SAFE`.",
        importance:
          "Safe ACL denials must be resolved by inspecting Safe membership and restoring least-privilege permissions (`List`, `Use`, `Initiate privileged sessions`)—never by granting Vault Admin.",
        realWorldContext:
          "Investigate `INC-2043` (Component: `Vault`, Target: `DBA-SAFE`, Error: `ITATS053E`) in the Troubleshooting workbench.",
        objective: "Identify the Vault Safe ACL root cause in `INC-2043` and execute remediation.",
        task: "Open `Troubleshooting`, select Ticket `INC-2043` (`ITATS053E` on `DBA-SAFE`), review the evidence and root cause, and execute remediation.",
        where: "Troubleshooting Workbench (`Troubleshooting` tab) → `INC-2043`",
        action:
          "Select `INC-2043` in `Troubleshooting` and click `Execute Automated Remediation` (or restore `dba_user` ACLs in `Safes`).",
        expectedResult:
          "Ticket `INC-2043` status transitions to `Resolved` and `DBA-SAFE` least-privilege ACLs are verified.",
        why: "Validating post-remediation Safe ACLs ensures `dba_user` can work without exposing `Retrieve accounts`.",
        targetConsole: "troubleshooting",
        objectiveIds: ["m10-ticket-1"],
        validatorRule: "m10-ticket-1",
        hints: {
          level1Concept: "Which CyberArk component enforces Safe ACL permissions (`ITATS053E`)?",
          level2Location: "Open `Troubleshooting` and select `INC-2043` (`Vault`).",
          level3Procedure:
            "In `Troubleshooting`, select `INC-2043` (`dba_user` / `DBA-SAFE`) and click `Execute Remediation`.",
          level4Solution: "Remediate `INC-2043` in `Troubleshooting`, then click Check My Work.",
        },
        successExplanation:
          "Ticket 1 (`INC-2043`) resolved: Vault Safe ACL least-privilege permissions restored for `dba_user`.",
        successRealWorldRelevance:
          "Safe ACL misconfigurations are the #1 cause of helpdesk `Access Denied` tickets.",
        skillTag: "Ticket 1: Safe ACL Troubleshooting",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Ticket 2 — Diagnose & Resolve CPM Credential Lockout (INC-2041)",
        conceptIntro:
          "Ticket 2 (`INC-2041` / `CACPM250E`): Service account `svc_backup` on `WIN-SRV-02` failed rotation due to a target lockout and credential desynchronization.",
        importance:
          "CPM lockouts require structured triage (inspecting `pm_error.log` / failure cause, unlocking, and reconciling) rather than retrying `Change` blindly.",
        realWorldContext:
          "Investigate `INC-2041` (Component: `CPM`, Account: `svc_backup`, Target: `WIN-SRV-02`) in the Troubleshooting workbench.",
        objective:
          "Identify the CPM lockout root cause in `INC-2041` and restore `svc_backup` to `Managed` state.",
        task: "In `Troubleshooting`, select Ticket `INC-2041` (`CACPM250E` on `svc_backup`) and execute remediation (or reconcile `svc_backup` in `CPM Operations`).",
        where: "Troubleshooting Workbench (`Troubleshooting` tab) → `INC-2041`",
        action:
          "Select `INC-2041` (`svc_backup` / `WIN-SRV-02`) in `Troubleshooting` and execute remediation.",
        expectedResult:
          "Ticket `INC-2041` is `Resolved` and `svc_backup` returns to `Managed` status.",
        why: "Reconciliation restores Vault-to-target synchronization without exposing passwords.",
        targetConsole: "troubleshooting",
        objectiveIds: ["m10-ticket-2"],
        validatorRule: "m10-ticket-2",
        hints: {
          level1Concept:
            "Which CPM operation recovers an account whose target password is locked or out-of-sync?",
          level2Location: "Open `Troubleshooting` and select `INC-2041` (`CPM`).",
          level3Procedure:
            "In `Troubleshooting`, select `INC-2041` (`svc_backup`) and click `Execute Remediation`.",
          level4Solution: "Remediate `INC-2041` in `Troubleshooting`, then click Check My Work.",
        },
        successExplanation:
          "Ticket 2 (`INC-2041`) resolved: `svc_backup` reconciled and restored to `Managed`.",
        successRealWorldRelevance:
          "Rapid CPM lockout recovery prevents scheduled backup and batch job outages.",
        skillTag: "Ticket 2: CPM Lockout Troubleshooting",
      },
      {
        id: `${prefix}-c03`,
        order: 3,
        title: "Ticket 3 — Diagnose & Resolve PSM Connection Timeout (INC-2044)",
        conceptIntro:
          "Ticket 3 (`INC-2044` / `PSMSR037E`): Administrators report PSM session timeouts when connecting to `WIN-SRV-01` over TCP 3389.",
        importance:
          "PSM connection failures require checking `PSMServer.log`, target TCP 3389 reachability, and PSM connector health.",
        realWorldContext:
          "Investigate `INC-2044` (Component: `PSM`, Target: `WIN-SRV-01`, Error: `PSMSR037E`) in the Troubleshooting workbench.",
        objective:
          "Identify the PSM connectivity root cause in `INC-2044`, remediate the ticket, and verify PSM connector health.",
        task: "In `Troubleshooting`, select Ticket `INC-2044` (`PSMSR037E` on `WIN-SRV-01`) and execute remediation.",
        where: "Troubleshooting Workbench (`Troubleshooting` tab) → `INC-2044`",
        action:
          "Select `INC-2044` (`PSM` / `WIN-SRV-01`) in `Troubleshooting` and execute remediation.",
        expectedResult:
          "Ticket `INC-2044` is `Resolved` and PSM connector health is verified operational.",
        why: "Restoring PSM connector reachability prevents operators from bypassing session recording.",
        targetConsole: "troubleshooting",
        objectiveIds: ["m10-ticket-3"],
        validatorRule: "m10-ticket-3",
        hints: {
          level1Concept:
            "Which component log and TCP port are checked when `PSMSR037E` occurs for Windows RDP?",
          level2Location: "Open `Troubleshooting` and select `INC-2044` (`PSM`).",
          level3Procedure:
            "In `Troubleshooting`, select `INC-2044` (`WIN-SRV-01`) and click `Execute Remediation`.",
          level4Solution: "Remediate `INC-2044` in `Troubleshooting`, then click Check My Work.",
        },
        successExplanation:
          "Ticket 3 (`INC-2044`) resolved: PSM connector health and TCP 3389 reachability verified.",
        successRealWorldRelevance:
          "Structured PSM diagnostics keep brokered administrative access available.",
        skillTag: "Ticket 3: PSM Connectivity Troubleshooting",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Independent Three-Ticket Verification",
      objective:
        "Confirm all three client support tickets (`INC-2043` Vault ACL, `INC-2041` CPM lockout, `INC-2044` PSM timeout) are Resolved with audit trail evidence.",
      initialEnvironment: "Troubleshooting workbench with Vault, CPM, and PSM incident tickets.",
      enterpriseContext:
        "Completing all three tickets proves end-to-end Tier-1/Tier-2 PAM diagnostic capability.",
      requirements: [
        "All three tickets (`INC-2043`, `INC-2041`, `INC-2044`) must have `Resolved` status.",
        "Remediation audit events must be recorded in `state.audit`.",
      ],
      targetConsole: "troubleshooting",
      validatorRule: "ind-m10-all-tickets",
      hints: {
        level1Concept: "Which three incidents represent Safe ACL, CPM lockout, and PSM timeout?",
        level2Location: "Check `INC-2043`, `INC-2041`, and `INC-2044` in `Troubleshooting`.",
        level3Procedure:
          "Ensure all three incidents (`INC-2043`, `INC-2041`, `INC-2044`) show `Resolved` status, then click Check Independent Challenge.",
        level4Solution:
          "Resolve any remaining open ticket among `INC-2043`, `INC-2041`, and `INC-2044`, then click Check Independent Challenge.",
      },
    },
  };
}

/**
 * M11 — Administration Best Practices
 * Reviews account ownership/lifecycle, revokes simulated leaver access, reviews EMERGENCY-SAFE break-glass,
 * and checks operational health. Never routes to DBA-SAFE permission setup.
 */
export function buildClientM11GovernanceConcepts(
  _lesson: Lesson,
  ex: PracticalExercise,
): {
  concepts: GuidedConcept[];
  independent: IndependentChallengeSpec;
} {
  const prefix = ex.id;
  return {
    concepts: [
      {
        id: `${prefix}-c01`,
        order: 1,
        title: "Review Account Ownership, Break-Glass Safe & Operational Health",
        conceptIntro:
          "Long-term PAM governance requires accountable owners on every account/Safe, tested emergency break-glass access, and daily system health checks.",
        importance:
          "Unowned accounts and untested break-glass procedures create blind spots during incidents and audits.",
        realWorldContext:
          "Inspect `EMERGENCY-SAFE` for break-glass governance, verify account ownership in `Accounts`, and confirm Vault/CPM/PSM health.",
        objective:
          "Verify `EMERGENCY-SAFE` exists, accounts have owners, and system health indicators are operational.",
        task: "Open `Access Management` (and `Safes` / `Accounts`), verify `EMERGENCY-SAFE` break-glass governance, accountable account owners, and operational health.",
        where: "Access Management (`Access` tab) & Safes (`EMERGENCY-SAFE`)",
        action:
          "Review user roles in `Access`, verify `EMERGENCY-SAFE` in `Safes`, and confirm component health.",
        expectedResult:
          "`EMERGENCY-SAFE` break-glass container, account ownership, and healthy component status verified.",
        why: "Routine governance prevents entitlement rot and ensures emergency readiness.",
        targetConsole: "access",
        objectiveIds: ["m11-lifecycle-health"],
        validatorRule: "m11-lifecycle-health",
        hints: {
          level1Concept:
            "Which dedicated Safe holds emergency credentials for catastrophic SSO or identity outages?",
          level2Location: "Check `Access` for user roles and `Safes` for `EMERGENCY-SAFE`.",
          level3Procedure:
            "Inspect user roles in `Access` and confirm `EMERGENCY-SAFE` exists in `Safes`, then click Check My Work.",
          level4Solution:
            "Verify `EMERGENCY-SAFE` and operational health, then click Check My Work.",
        },
        successExplanation:
          "Break-glass Safe (`EMERGENCY-SAFE`), ownership coverage, and operational health verified.",
        successRealWorldRelevance:
          "Daily health checks and break-glass readiness are core SOPs for PAM operations teams.",
        skillTag: "PAM Governance & Break-Glass Readiness",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Revoke Simulated Leaver Privileged Access",
        conceptIntro:
          "When an employee or contractor leaves the organization, their privileged PAM role and Safe entitlements must be revoked immediately.",
        importance:
          "Delayed offboarding is a primary vector for unauthorized post-employment access and compliance failure.",
        realWorldContext:
          "Simulated leaver scenario: In `Access Management`, downgrade a departing operator's role (e.g., change `windows_admin` or `dba_user` to `Auditor` or `Learner`) to revoke privileged administrative rights.",
        objective:
          "Execute a simulated leaver role revocation in `Access Management` (`updateUserRole`) and generate an audit record.",
        task: "Open `Access`, select a privileged user (e.g., `windows_admin` or `dba_user`), and update their role to `Learner` or `Auditor` to simulate leaver access revocation.",
        where: "Access Management Console (`Access` tab)",
        action:
          "In `Access`, change a user's role (e.g., `windows_admin` → `Auditor` or `Learner`) so an `Update User Role` audit event is logged.",
        expectedResult:
          "Simulated leaver role updated and `Update User Role` event recorded in the Vault audit trail.",
        why: "Every access revocation must leave an auditable record for compliance attestation.",
        targetConsole: "access",
        objectiveIds: ["m11-leaver-revocation"],
        validatorRule: "m11-leaver-revocation",
        hints: {
          level1Concept:
            "What immediate action must a PAM administrator take when HR flags an employee departure?",
          level2Location: "Open the `Access` tab in the top navigation bar.",
          level3Procedure:
            "In `Access`, locate a user (e.g., `windows_admin`) and change their role to `Auditor` or `Learner`, then click Check My Work.",
          level4Solution:
            "Update any user's role in `Access` to record an `Update User Role` event, then click Check My Work.",
        },
        successExplanation:
          "Simulated leaver access revocation executed and logged in the Vault audit journal.",
        successRealWorldRelevance:
          "Immediate leaver de-provisioning prevents former staff from retaining elevated access.",
        skillTag: "Leaver Access Revocation",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Independent Governance & Audit Verification",
      objective:
        "Confirm leaver revocation audit evidence and `EMERGENCY-SAFE` governance controls are documented and active.",
      initialEnvironment:
        "Access Management and Vault audit trail with simulated leaver role update.",
      enterpriseContext:
        "Security auditors verify both active role restrictions and immutable offboarding logs.",
      requirements: [
        "Confirm `Update User Role` audit event is recorded in `state.audit`.",
        "Confirm `EMERGENCY-SAFE` and healthy operational status remain intact.",
      ],
      targetConsole: "access",
      validatorRule: "ind-m11-governance",
      hints: {
        level1Concept: "Where is the leaver role change permanently recorded for auditors?",
        level2Location: "Check `Access` and `Reports & Audit`.",
        level3Procedure:
          "Verify the `Update User Role` audit entry exists and `EMERGENCY-SAFE` is intact, then click Check Independent Challenge.",
        level4Solution:
          "Confirm the `Update User Role` audit log and `EMERGENCY-SAFE`, then click Check Independent Challenge.",
      },
    },
  };
}

/**
 * M12 — Capstone Project and Assessment
 * Dedicated 5-task Capstone workflow aligned with CLIENT_CAPSTONE_PROJECT.
 * Never reuses CPM reconciliation (Lab 05B) as its capstone task.
 */
export function buildClientM12CapstoneConcepts(
  _lesson: Lesson,
  ex: PracticalExercise,
): {
  concepts: GuidedConcept[];
  independent: IndependentChallengeSpec;
} {
  const prefix = ex.id;
  return {
    concepts: [
      {
        id: `${prefix}-c01`,
        order: 1,
        title: "Tasks 1 & 2 — Verify Accounts, Platforms & Safe Structure",
        conceptIntro:
          "Capstone Tasks 1 and 2 require identifying Windows and Linux privileged accounts/platforms and designing a least-privilege Safe structure.",
        importance:
          "A sound PAM workflow starts with accurate account inventory and compartmentalized Safes.",
        realWorldContext:
          "Confirm Windows and Linux/database accounts and Safe ACL boundaries in the simulator before submitting your Capstone Workspace.",
        objective: "Verify Windows/Linux account inventory and Safe structure in the simulator.",
        task: "Verify that Windows/Linux accounts and at least 2 Safes with least-privilege members exist, and document Tasks 1 & 2 in the Capstone Workspace above.",
        where: "Capstone Workspace (Lesson Section 9B) / Accounts & Safes Consoles",
        action:
          "Inspect `Accounts` and `Safes`, then complete Tasks 1 & 2 in the Capstone Project Workspace.",
        expectedResult:
          "Windows/Linux accounts and partitioned Safe ACLs verified for Capstone Tasks 1 & 2.",
        why: "Inventory and Safe design form the foundation of all downstream PAM controls.",
        targetConsole: "assessments",
        objectiveIds: ["m12-capstone-state"],
        validatorRule: "m12-capstone-inventory-safes",
        hints: {
          level1Concept: "What are Capstone Tasks 1 and 2?",
          level2Location:
            "Use the Capstone Project Workspace in this lesson (and `Accounts` / `Safes`).",
          level3Procedure:
            "Verify accounts and Safes in the simulator, complete Tasks 1–2 notes in the Capstone Workspace, then click Check My Work.",
          level4Solution: "Confirm simulator accounts/Safes and click Check My Work.",
        },
        successExplanation:
          "Capstone Tasks 1 & 2 state verified: accounts, platforms, and Safe ACLs confirmed.",
        successRealWorldRelevance:
          "Structured inventory and Safe design are required deliverables in real PAM deployments.",
        skillTag: "Capstone: Accounts, Platforms & Safes",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Tasks 3, 4 & 5 — Onboarding, Audit Evidence & Security Controls",
        conceptIntro:
          "Capstone Tasks 3–5 cover onboarding/password management, reviewing audit evidence to troubleshoot an access issue, and documenting security controls.",
        importance:
          "Demonstrating end-to-end operational competence requires connecting policy, audit forensics, and Zero Trust governance.",
        realWorldContext:
          "Verify audit trail evidence and submit all 5 tasks in the Capstone Project Workspace to run `evaluateCapstoneProject()`.",
        objective:
          "Verify audit/troubleshooting evidence and evaluate all 5 tasks in the Capstone Workspace.",
        task: "Complete Tasks 3, 4, and 5 in the Capstone Project Workspace and click `Evaluate Capstone Project` to generate your Competency Report (>= 70%).",
        where: "Capstone Project Workspace (in this lesson)",
        action:
          "Document Tasks 3–5 in the Capstone Project Workspace and run `Evaluate Capstone Project`.",
        expectedResult:
          "Audit evidence verified and Capstone Competency Report generated with score >= 70%.",
        why: "Competency is validated by live state plus documented architectural rationale.",
        targetConsole: "assessments",
        objectiveIds: ["m12-capstone-state"],
        validatorRule: "m12-capstone-controls-audit",
        hints: {
          level1Concept: "What score is required to pass the Capstone Project?",
          level2Location: "Scroll to the Capstone Project Workspace in this lesson.",
          level3Procedure:
            "Fill in evidence/notes for all 5 Capstone tasks and click `Evaluate Capstone Project` (must score >= 70%), then click Check My Work.",
          level4Solution:
            "Evaluate the 5-task Capstone Project Workspace (>= 70%) and click Check My Work.",
        },
        successExplanation: "Capstone Tasks 3–5 and audit evidence verified.",
        successRealWorldRelevance:
          "Completes the 5-task CyberArk Basic Training Capstone deliverable.",
        skillTag: "Capstone: Lifecycle, Audit & Controls",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Capstone Competency Certification Check",
      objective:
        "Ensure all 5 Capstone tasks are evaluated via `evaluateCapstoneProject()` with an overall score >= 70%.",
      initialEnvironment: "Capstone Project Workspace with live `PamState`.",
      enterpriseContext:
        "Final certification requires >= 70% across the 5 client-defined Capstone project tasks.",
      requirements: [
        "All 5 Capstone tasks documented and evaluated in the Capstone Workspace.",
        "Live simulator state contains accounts, Safes, and audit evidence.",
      ],
      targetConsole: "assessments",
      validatorRule: "ind-m12-capstone",
      hints: {
        level1Concept: "How is the Capstone Competency Report generated?",
        level2Location: "Use the `Evaluate Capstone Project` button in the Capstone Workspace.",
        level3Procedure:
          "Complete all 5 tasks in the Capstone Workspace, click `Evaluate Capstone Project`, then click Check Independent Challenge.",
        level4Solution:
          "Submit and evaluate all 5 Capstone tasks (>= 70%), then click Check Independent Challenge.",
      },
    },
  };
}
