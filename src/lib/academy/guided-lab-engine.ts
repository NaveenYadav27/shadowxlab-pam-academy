/**
 * SHADOWXLAB PAM ACADEMY — DETERMINISTIC GUIDED LAB ENGINE & VALIDATOR
 * Transforms any curriculum PracticalExercise into a concept-by-concept
 * LabEx-style guided session backed strictly by live PamState & pam-engine evaluators.
 *
 * Authority rule:
 * SIMULATOR -> DETERMINISTIC VALIDATOR -> VALIDATION RESULT -> AI MENTOR -> CONTEXTUAL FEEDBACK
 * The validator is the sole authority; AI and UI checkboxes can never bypass validation.
 */

import { evaluateLabObjectives, evaluatePermission, type PamState } from "@/lib/pam-engine";
import type { Lesson, PracticalExercise } from "./types";
import type {
  ConceptValidationResult,
  GuidedConcept,
  GuidedLabPlan,
  GuidedLabSessionState,
  HintLevel,
  IndependentChallengeSpec,
  PracticalCompetencyReport,
  SessionBaselineSnapshot,
  ValidationCriterionResult,
} from "./guided-lab-types";

const CONSOLE_LABELS: Record<PracticalExercise["targetConsole"], string> = {
  overview: "Dashboard (Overview) Console",
  accounts: "Accounts Console",
  safes: "Safes Console",
  cpm: "CPM Operations Console",
  psm: "PSM Operations Console",
  audit: "Reports & Audit Console",
  policies: "Policies Console",
  discovery: "Discovery Console",
  troubleshooting: "Troubleshooting Console",
  environment: "PAM Environment Console",
  access: "Administration / Access Console",
  assessments: "Assessments Console",
};

export function captureSessionBaseline(state: PamState): SessionBaselineSnapshot {
  return {
    safeCount: state.safes.length,
    safeNames: state.safes.map((s) => s.name),
    accountCount: state.accounts.length,
    cpmOpCount: state.cpmOperations.length,
    sessionCount: state.sessions.length,
    auditCount: state.audit.length,
    discoveryJobCount: state.discoveryJobs.length,
    resolvedIncidentCount: state.incidents.filter((i) => i.status === "Resolved").length,
    capturedAt: new Date().toISOString(),
  };
}

function getTargetSummary(labId: string, exercise: PracticalExercise): string {
  if (labId.includes("Lab 02")) return "Safe `DBA-SAFE` & member `dba_user` (Safes Console)";
  if (labId.includes("Lab 03")) return "Account `Administrator` on `WIN-SRV-01` in `WIN-SAFE`";
  if (labId.includes("Lab 04"))
    return "Enterprise account inventory (`oracle`, `svc_backup`, `shared_ops`)";
  if (labId.includes("Lab 05A")) return "Account `Administrator` on `WIN-SRV-01` (CPM Operations)";
  if (labId.includes("Lab 05B")) return "Locked service account `svc_backup` on `WIN-SRV-02`";
  if (labId.includes("Lab 06A")) return "Target `WIN-SRV-01` (`Administrator`) via PSM Broker";
  if (labId.includes("Lab 06B")) return "PSM Preflight Gates & Connector (`WIN-SRV-01`)";
  return `${CONSOLE_LABELS[exercise.targetConsole]} (${exercise.associatedLabId})`;
}

function getNextRecommendedSkill(labId: string): string {
  if (labId.includes("Lab 01"))
    return "Safe Partitioning & Granular Least-Privilege ACL Design (Lab 02)";
  if (labId.includes("Lab 02"))
    return "Privileged Account Onboarding & Platform Policy Binding (Lab 03)";
  if (labId.includes("Lab 03"))
    return "Discovery Governance & Unmanaged Credential Remediation (Lab 04)";
  if (labId.includes("Lab 04"))
    return "Automated CPM Credential Verification & Password Rotation (Lab 05A)";
  if (labId.includes("Lab 05A"))
    return "CPM Lockout Incident Recovery & Credential Reconciliation (Lab 05B)";
  if (labId.includes("Lab 05B"))
    return "Dual-Control Brokered PSM Sessions & Session Auditing (Lab 06A)";
  if (labId.includes("Lab 06A"))
    return "PSM Preflight Gate Diagnostics & Connector Recovery (Lab 06B)";
  if (labId.includes("Lab 06B")) return "Enterprise Compliance Auditing & Incident Forensics";
  return "Next Module Practical Lab & Enterprise Governance Validation";
}

function buildLab02Concepts(
  lesson: Lesson,
  ex: PracticalExercise,
): {
  concepts: GuidedConcept[];
  independent: IndependentChallengeSpec;
} {
  const prefix = ex.id;
  const org = lesson.enterpriseScenario?.organization || "Global Financial Services";
  return {
    concepts: [
      {
        id: `${prefix}-c01`,
        order: 1,
        title: "Verify Safe Boundaries & DBA-SAFE Ownership",
        conceptIntro:
          "A CyberArk Safe is an encrypted, logically isolated container inside the Digital Vault. Every Safe must have an accountable owner before permissions are delegated.",
        importance:
          "Segregating database credentials into a dedicated Safe limits blast radius so a compromise in one team cannot expose credentials belonging to another.",
        realWorldContext: `At ${org}, auditors require dedicated database Safes with named ownership instead of a monolithic shared Safe.`,
        objective:
          "Confirm DBA-SAFE exists in the Vault with an accountable owner and least-privilege baseline.",
        task: "Inspect DBA-SAFE and verify its container boundary and accountable owner.",
        where: "Safes Console (`Safes` tab in the top navigation bar)",
        action:
          "Open the Safes Console, select `DBA-SAFE`, and inspect its owner (`pam_admin`) and member roster (`pam_admin`, `dba_user`, `auditor`).",
        expectedResult:
          "`DBA-SAFE` appears in the Safe roster with owner `pam_admin` and read-only `auditor` separation.",
        why: "Unowned or mis-scoped Safes violate SOX/ISO-27001 accountability and create blind spots during access reviews.",
        targetConsole: "safes",
        objectiveIds: ["create-safe", "assign-owner"],
        validatorRule: "lab02-safe-boundary",
        hints: {
          level1Concept:
            "What makes a Safe an isolated security boundary in the Digital Vault, and who is accountable for approving changes to it?",
          level2Location:
            "Navigate to the `Safes` tab in the top navigation bar and look at the Safe directory list on the left.",
          level3Procedure:
            "Click `Safes` → select `DBA-SAFE` → verify the Safe Owner field shows `pam_admin` and members are listed, then return and click Check My Work.",
          level4Solution:
            "In `Safes`, confirm `DBA-SAFE` exists with owner `pam_admin` and members `pam_admin`, `dba_user`, and `auditor`. Click Check My Work to verify.",
        },
        successExplanation:
          "You confirmed `DBA-SAFE` is properly provisioned as an isolated Vault container with an accountable owner (`pam_admin`).",
        successRealWorldRelevance:
          "Named Safe ownership ensures quarterly access recertification always has an accountable approver.",
        skillTag: "Safe Boundary & Ownership Governance",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Configure Least-Privilege Permissions for dba_user",
        conceptIntro:
          "CyberArk separates `Use accounts` (transparent brokered session via PSM) from `Retrieve accounts` (viewing plaintext passwords).",
        importance:
          "Withholding `Retrieve accounts` prevents DBAs from copying cleartext master passwords onto workstations while still letting them do their job.",
        realWorldContext: `${org} mandates zero plaintext password retrieval for operational database staff.`,
        objective:
          "Save `dba_user` permissions on `DBA-SAFE` with session access enabled and plaintext retrieval disabled.",
        task: "Configure and save `dba_user` Safe membership on `DBA-SAFE` enforcing least privilege.",
        where: "Safes Console → Select `DBA-SAFE` → Member Permissions editor",
        action:
          "Select `dba_user` on `DBA-SAFE`. Ensure `List accounts`, `Use accounts`, and `Initiate privileged sessions` are checked, confirm `Retrieve accounts` is UNCHECKED, and click Save/Update Member Permissions.",
        expectedResult:
          "Permissions save cleanly and the simulator records an audited `DBA-SAFE` member update event.",
        why: "Explicitly saving and auditing Safe ACLs ensures the Vault enforces least privilege deterministically.",
        targetConsole: "safes",
        objectiveIds: ["add-dba-user", "least-privilege"],
        validatorRule: "lab02-member-config",
        hints: {
          level1Concept:
            "Which permission allows launching a PSM session without exposing the cleartext password, and which permission must remain unchecked?",
          level2Location:
            "Go to `Safes` → select `DBA-SAFE` → locate the Safe Members & Permissions panel for `dba_user`.",
          level3Procedure:
            "In `Safes` → `DBA-SAFE`, choose member `dba_user`, check `List accounts`, `Use accounts`, and `Initiate privileged sessions`, leave `Retrieve accounts` unchecked, and click Save Member.",
          level4Solution:
            "Open `Safes` → `DBA-SAFE` → edit `dba_user` → keep `List accounts`, `Use accounts`, `Initiate privileged sessions` checked and `Retrieve accounts` unchecked → click Save. Then click Check My Work.",
        },
        successExplanation:
          "`dba_user` is configured on `DBA-SAFE` with mediated session rights (`Use accounts`) and zero plaintext retrieval (`Retrieve accounts` withheld), backed by an audit trail entry.",
        successRealWorldRelevance:
          "This exact ACL separation eliminates credential theft from endpoints even if an operator workstation is compromised.",
        skillTag: "Least-Privilege Safe ACL Configuration",
      },
      {
        id: `${prefix}-c03`,
        order: 3,
        title: "Verify Permitted Access (`Use accounts` Allowed)",
        conceptIntro:
          "After configuring a Safe ACL, administrators validate that legitimate operational workflows succeed.",
        importance:
          "Validating allowed permissions before handing off a Safe prevents operational outages and helpdesk escalations.",
        realWorldContext:
          "DBAs must be able to list and use database credentials via PSM without friction.",
        objective:
          "Run a permitted access check for `dba_user` on `DBA-SAFE` and confirm an audited Success event.",
        task: "Evaluate a permitted permission (`Use accounts` or `List accounts`) for `dba_user` on `DBA-SAFE`.",
        where: "Safes Console → `DBA-SAFE` → Permission Evaluator / Access Test panel",
        action:
          "In `Safes` with `DBA-SAFE` selected, select user `dba_user`, choose `Use accounts` (or `List accounts`), and run the permission test.",
        expectedResult:
          "The Vault ACL evaluator returns Allowed/Authorized and logs a `Success` audit event targeting `DBA-SAFE`.",
        why: "Testing positive authorization confirms permission dependencies (`List accounts` + `Use accounts`) are intact.",
        targetConsole: "safes",
        objectiveIds: ["verify-allowed"],
        validatorRule: "lab02-allowed-test",
        hints: {
          level1Concept:
            "Which permission should succeed when `dba_user` connects to a database through PSM?",
          level2Location:
            "Inside the `Safes` console with `DBA-SAFE` selected, look for the Permission Evaluation / Test Access controls.",
          level3Procedure:
            "Select `DBA-SAFE` → in the Permission Tester choose `dba_user` and permission `Use accounts` → click Test/Evaluate Permission.",
          level4Solution:
            "Go to `Safes` → select `DBA-SAFE` → test `dba_user` with `Use accounts` (Allowed). Confirm a Success event is logged for `DBA-SAFE`, then click Check My Work.",
        },
        successExplanation:
          "The simulator confirmed `dba_user` is authorized for operational use on `DBA-SAFE` and recorded the proof in the Vault audit trail.",
        successRealWorldRelevance:
          "Pre-production ACL testing catches missing `List accounts` dependencies before change windows close.",
        skillTag: "Positive Safe ACL Verification",
      },
      {
        id: `${prefix}-c04`,
        order: 4,
        title: "Verify Denied Access (`Retrieve accounts` Blocked)",
        conceptIntro:
          "Security controls must be verified negatively as well as positively: confirm unauthorized actions are explicitly blocked and audited.",
        importance:
          "Auditors look for explicit denial evidence (`ITATS028E` / `Denied` audit records) proving cleartext password extraction is blocked.",
        realWorldContext: `${org} compliance reviews require documented proof that DBAs cannot retrieve plaintext passwords.`,
        objective:
          "Test `Retrieve accounts` for `dba_user` on `DBA-SAFE` and confirm the Vault records a `Denied` audit event.",
        task: "Run a negative permission test proving `dba_user` is denied `Retrieve accounts` on `DBA-SAFE`.",
        where: "Safes Console → `DBA-SAFE` → Permission Evaluator / Access Test panel",
        action:
          "Select user `dba_user`, select permission `Retrieve accounts` on `DBA-SAFE`, and click Evaluate/Test Permission.",
        expectedResult:
          "The evaluator denies the action and logs an immutable `Denied` record targeting `DBA-SAFE` in the audit trail.",
        why: "Negative testing validates that least-privilege boundaries actually hold under unauthorized requests.",
        targetConsole: "safes",
        objectiveIds: ["verify-denied"],
        validatorRule: "lab02-denied-test",
        hints: {
          level1Concept:
            "Which permission represents plaintext password retrieval that must be explicitly denied for `dba_user`?",
          level2Location:
            "In the `Safes` console on `DBA-SAFE`, use the Permission Evaluator panel.",
          level3Procedure:
            "Choose `DBA-SAFE` → select member `dba_user` → select `Retrieve accounts` → run the permission evaluation so a `Denied` audit entry is created.",
          level4Solution:
            "Open `Safes` → select `DBA-SAFE` → evaluate `dba_user` + `Retrieve accounts`. Confirm the result is Denied and logged to the audit trail, then click Check My Work.",
        },
        successExplanation:
          "The Vault explicitly denied `Retrieve accounts` for `dba_user` on `DBA-SAFE` and captured the denial in the audit trail.",
        successRealWorldRelevance:
          "Cryptographically logged access denials provide direct evidence for SOX, PCI-DSS, and SOC 2 auditors.",
        skillTag: "Negative ACL Testing & Denial Auditing",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Create & Scope a New Application Safe",
      objective:
        ex.independentPractice?.goal ||
        "Create a new isolated application Safe (for example, `TREASURY-SAFE`) with an accountable owner without step-by-step guidance.",
      initialEnvironment:
        ex.startingState ||
        "7 baseline Safes exist (`WIN-SAFE`, `UNIX-SAFE`, `DBA-SAFE`, `APP-SAFE`, `SERVICE-SAFE`, `DOMAIN-SAFE`, `EMERGENCY-SAFE`). `DBA-SAFE` least-privilege ACLs are verified.",
      enterpriseContext:
        ex.independentPractice?.scenario ||
        "A new Treasury API requires its own isolated Safe separated from `APP-SAFE` with accountable ownership.",
      requirements: [
        "Create a new Safe (beyond the 7 baseline Safes) using uppercase hyphenated naming (e.g., `TREASURY-SAFE`).",
        "Assign an accountable Safe owner and description.",
        "Keep all `DBA-SAFE` least-privilege objectives intact (no regression on Lab 02).",
      ],
      targetConsole: "safes",
      validatorRule: "ind-safes-new-safe",
      hints: {
        level1Concept:
          "Why does a new high-value application need its own Safe instead of sharing `APP-SAFE`?",
        level2Location: "Use the Create Safe form inside the `Safes` console.",
        level3Procedure:
          "Open `Safes`, fill in a new uppercase Safe name (such as `TREASURY-SAFE`), add a description and owner (`pam_admin`), and create the Safe.",
        level4Solution:
          "In `Safes`, create Safe `TREASURY-SAFE` with description `Treasury API isolated credentials` and owner `pam_admin`, then click Check Independent Challenge.",
      },
    },
  };
}

function buildLab05BConcepts(
  lesson: Lesson,
  ex: PracticalExercise,
): {
  concepts: GuidedConcept[];
  independent: IndependentChallengeSpec;
} {
  const prefix = ex.id;
  const org = lesson.enterpriseScenario?.organization || "Global Financial Services";
  return {
    concepts: [
      {
        id: `${prefix}-c01`,
        order: 1,
        title: "Diagnose `svc_backup` Lockout Root Cause",
        conceptIntro:
          "When CPM rotation fails, blindly retrying `Change` worsens lockouts. Operators first diagnose the exact failure cause.",
        importance:
          "Identifying whether a failure is a lockout, network timeout, or credential mismatch determines whether Unlock, Reconcile, or firewall repair is required.",
        realWorldContext: `At ${org}, service account \`svc_backup\` on \`WIN-SRV-02\` is in \`Rotation failed\` due to a target lockout (\`CACPM250E\`).`,
        objective:
          "Locate `svc_backup` (`WIN-SRV-02`) and confirm its failure state before executing recovery.",
        task: "Inspect `svc_backup` on `WIN-SRV-02` in CPM Operations and identify the lockout failure cause.",
        where: "CPM Operations Console (`CPM Operations` tab)",
        action:
          "Open `CPM Operations` and inspect the failed account `svc_backup` (`WIN-SRV-02`) to verify its `Rotation failed` status and lockout error.",
        expectedResult:
          "`svc_backup` is visible on `WIN-SRV-02` with failure cause indicating account lockout.",
        why: "Accurate root-cause triage prevents destructive recovery steps on production service accounts.",
        targetConsole: "cpm",
        objectiveIds: ["inspect-failure"],
        validatorRule: "lab05b-inspect-failure",
        hints: {
          level1Concept:
            "What distinguishes a target account lockout from a normal password mismatch?",
          level2Location:
            "Check `CPM Operations` (or `Troubleshooting`) for `svc_backup` on `WIN-SRV-02`.",
          level3Procedure:
            "Open `CPM Operations`, locate `svc_backup` (`WIN-SRV-02`), review its failure reason (`Account locked on target`), then return and click Check My Work.",
          level4Solution:
            "Confirm `svc_backup` (`WIN-SRV-02`) is present in `CPM Operations` with lockout failure details, then click Check My Work.",
        },
        successExplanation:
          "You confirmed `svc_backup` on `WIN-SRV-02` is in a target lockout state (`CACPM250E`) requiring Unlock before Reconcile.",
        successRealWorldRelevance:
          "Documenting the failure code before remediation gives change management an auditable incident record.",
        skillTag: "CPM Failure Triage",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Repair Target Account Lockout (Unlock)",
        conceptIntro:
          "CPM cannot verify or rotate a locked target account until the lockout condition on the remote endpoint is cleared.",
        importance:
          "Clearing the lockout first ensures subsequent Reconcile and Change operations can authenticate cleanly.",
        realWorldContext:
          "Automated backup jobs depend on restoring `svc_backup` without manual password sharing.",
        objective: "Unlock `svc_backup` on `WIN-SRV-02` via the simulator repair workflow.",
        task: "Execute the Unlock repair action on `svc_backup` (`WIN-SRV-02`).",
        where: "CPM Operations Console (or Troubleshooting Console) → `svc_backup` (`WIN-SRV-02`)",
        action:
          "Locate `svc_backup` in `CPM Operations` (or `Troubleshooting`) and run the `Unlock` / lockout repair action.",
        expectedResult:
          "The target lockout condition clears and an audited incident/unlock repair event is recorded.",
        why: "Unlocking restores target authentication availability so CPM can resynchronize the secret.",
        targetConsole: "cpm",
        objectiveIds: ["repair-lockout"],
        validatorRule: "lab05b-unlock",
        hints: {
          level1Concept:
            "Why will `Change` keep failing if the remote SAM/AD account remains locked?",
          level2Location:
            "Open `CPM Operations` → find `svc_backup` (`WIN-SRV-02`) → repair actions.",
          level3Procedure:
            "In `CPM Operations`, select `svc_backup` and click `Unlock` (or remediate incident `INC-2041` in Troubleshooting).",
          level4Solution:
            "Open `CPM Operations` → select `svc_backup` on `WIN-SRV-02` → click `Unlock target account`. Then click Check My Work.",
        },
        successExplanation:
          "Target lockout on `svc_backup` has been cleared and logged in the simulator audit trail.",
        successRealWorldRelevance:
          "Controlled unlock workflows prevent operators from resorting to unlogged domain admin resets.",
        skillTag: "Target Lockout Remediation",
      },
      {
        id: `${prefix}-c03`,
        order: 3,
        title: "Reconcile Vault & Target Credential",
        conceptIntro:
          "When the Vault password and target host password fall out of sync, CPM uses a privileged Reconcile Account to reset both to a synchronized secret.",
        importance:
          "Reconcile breaks password desynchronization without ever exposing a password to a human administrator.",
        realWorldContext:
          "After unlocking `svc_backup`, CPM must resynchronize the Vault and `WIN-SRV-02`.",
        objective: "Execute a successful CPM `Reconcile` operation on `svc_backup`.",
        task: "Run CPM `Reconcile` on `svc_backup` (`WIN-SRV-02`).",
        where: "CPM Operations Console → `svc_backup` (`WIN-SRV-02`)",
        action: "Select `svc_backup` in `CPM Operations` and click `Reconcile`.",
        expectedResult:
          "CPM logs a `Completed` Reconcile operation synchronizing the Vault and target credential.",
        why: "Standard `Change` requires knowing the current password; `Reconcile` recovers synchronization when credentials drift.",
        targetConsole: "cpm",
        objectiveIds: ["reconcile-account"],
        validatorRule: "lab05b-reconcile",
        hints: {
          level1Concept:
            "Which CPM operation uses a privileged reconcile account to resynchronize a drifted Vault/target password?",
          level2Location:
            "In `CPM Operations`, check the action buttons for `svc_backup` (`WIN-SRV-02`).",
          level3Procedure:
            "Ensure `svc_backup` is unlocked, then click `Reconcile` in `CPM Operations` and observe the completed CPM job.",
          level4Solution:
            "Open `CPM Operations` → locate `svc_backup` → click `Reconcile` → confirm status `Completed` → return and click Check My Work.",
        },
        successExplanation:
          "CPM successfully reconciled `svc_backup`, restoring cryptographic synchronization between the Vault and `WIN-SRV-02`.",
        successRealWorldRelevance:
          "Reconcile is the primary automated recovery tool for out-of-sync emergency or service accounts.",
        skillTag: "CPM Credential Reconciliation",
      },
      {
        id: `${prefix}-c04`,
        order: 4,
        title: "Execute CPM Password Change & Verify Managed Health",
        conceptIntro:
          "Following reconciliation, best practice is to rotate (`Change`) and confirm (`Verify`) the credential so it returns cleanly to `Managed` compliance.",
        importance:
          "Verifying after rotation proves the newly generated password actually authenticates against the target system.",
        realWorldContext: `${org} requires every recovered service account to pass CPM Change + Verify before closing the incident.`,
        objective: "Run CPM `Change` and `Verify` on `svc_backup` until its status is `Managed`.",
        task: "Run CPM `Change` followed by CPM `Verify` on `svc_backup` (`WIN-SRV-02`).",
        where: "CPM Operations Console → `svc_backup` (`WIN-SRV-02`)",
        action:
          "In `CPM Operations`, click `Change` on `svc_backup`, then click `Verify` and confirm its status becomes `Managed`.",
        expectedResult:
          "Completed `Change` and `Verify` jobs appear in CPM history and `svc_backup` status is `Managed`.",
        why: "Only a verified `Managed` credential guarantees the next automated rotation cycle will succeed.",
        targetConsole: "cpm",
        objectiveIds: ["retry-change", "verify-recovery"],
        validatorRule: "lab05b-verify",
        hints: {
          level1Concept:
            "After Reconcile restores sync, which two CPM operations rotate the secret and prove target authentication works?",
          level2Location: "Go to `CPM Operations` → `svc_backup` (`WIN-SRV-02`).",
          level3Procedure:
            "Click `Change` on `svc_backup`, wait for completion, then click `Verify` so `svc_backup` transitions to `Managed`.",
          level4Solution:
            "In `CPM Operations` on `svc_backup`, run `Change` and then `Verify`. Confirm status is `Managed`, then click Check My Work.",
        },
        successExplanation:
          "`svc_backup` has completed full CPM recovery (`Unlock` → `Reconcile` → `Change` → `Verify`) and is now `Managed`.",
        successRealWorldRelevance:
          "Closing the loop with Verify eliminates silent failures before scheduled backup jobs execute overnight.",
        skillTag: "End-to-End CPM Recovery & Verification",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Bring a Pending Account to Managed Compliance",
      objective:
        "Independently locate another account in `Verify required` status (such as `svc_payment` on `APP-PAY-01` or `postgres_admin` on `DB-PG-01`) and run CPM Verify to bring it to `Managed` compliance.",
      initialEnvironment:
        "`svc_backup` is recovered and `Managed`. Additional seeded accounts (`svc_payment`, `postgres_admin`) remain in `Verify required`.",
      enterpriseContext:
        "During shift handover, you must clear remaining unverified privileged credentials without guided instructions.",
      requirements: [
        "Select an account currently in `Verify required` status (`svc_payment` or `postgres_admin`).",
        "Execute CPM `Verify` so the account transitions to `Managed` with a completed CPM operation.",
        "Keep `svc_backup` healthy in `Managed` state.",
      ],
      targetConsole: "cpm",
      validatorRule: "ind-cpm-verify-pending",
      hints: {
        level1Concept:
          "Which status indicates an account has not yet been confirmed against its target?",
        level2Location: "Inspect the account queue in `CPM Operations` for `Verify required` rows.",
        level3Procedure:
          "Open `CPM Operations`, find `svc_payment` or `postgres_admin`, and click `Verify`.",
        level4Solution:
          "In `CPM Operations`, run `Verify` on `svc_payment` (`APP-PAY-01`) so it becomes `Managed`, then click Check Independent Challenge.",
      },
    },
  };
}

function buildLab05AConcepts(
  lesson: Lesson,
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
        title: "Pre-Verify Credential Before Rotation",
        conceptIntro:
          "CPM `Verify` authenticates to the target host using the vaulted secret without modifying it.",
        importance:
          "Verifying before rotating catches network or mismatch errors early instead of triggering failed changes.",
        realWorldContext:
          "Enterprise rotation SOPs verify target connectivity on `WIN-SRV-01` before changing passwords.",
        objective: "Confirm `Administrator` on `WIN-SRV-01` passes CPM `Verify`.",
        task: "Run CPM `Verify` on `Administrator` (`WIN-SRV-01`).",
        where: "CPM Operations Console (`CPM Operations` tab)",
        action: "Open `CPM Operations`, locate `Administrator` on `WIN-SRV-01`, and run `Verify`.",
        expectedResult:
          "CPM records a `Completed` Verify operation for `Administrator · WIN-SRV-01`.",
        why: "Pre-verification proves the Vault credential matches the endpoint before mutation.",
        targetConsole: "cpm",
        objectiveIds: ["pre-verify"],
        validatorRule: "lab05a-pre-verify",
        hints: {
          level1Concept:
            "Why should CPM confirm the current credential matches the target before rotating it?",
          level2Location: "Go to `CPM Operations` and locate `Administrator` (`WIN-SRV-01`).",
          level3Procedure: "In `CPM Operations`, click `Verify` on `Administrator` (`WIN-SRV-01`).",
          level4Solution:
            "Open `CPM Operations` → click `Verify` on `Administrator · WIN-SRV-01` → click Check My Work.",
        },
        successExplanation: "CPM verified that the vaulted credential matches `WIN-SRV-01`.",
        successRealWorldRelevance:
          "Pre-change verification eliminates preventable rotation rollbacks.",
        skillTag: "CPM Pre-Change Verification",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Execute Automated CPM Password Change",
        conceptIntro:
          "CPM `Change` generates a policy-compliant password, updates the target endpoint, and commits the new secret to the Digital Vault atomically.",
        importance:
          "Automated rotation enforces password complexity and rotation windows without human visibility.",
        realWorldContext:
          "Zero-standing-password compliance requires rotating `Administrator` on `WIN-SRV-01` under policy `Windows-90d`.",
        objective: "Execute a live CPM `Change` on `Administrator` (`WIN-SRV-01`).",
        task: "Run CPM `Change` to rotate the password for `Administrator` on `WIN-SRV-01`.",
        where: "CPM Operations Console → `Administrator` (`WIN-SRV-01`)",
        action:
          "In `CPM Operations`, click `Change` on `Administrator` (`WIN-SRV-01`) and observe the completed rotation.",
        expectedResult:
          "A `Completed` CPM `Change` job appears for `Administrator · WIN-SRV-01` and a `CPM Change` audit event is logged.",
        why: "Vault-managed rotation removes manual password resets and maintains version history.",
        targetConsole: "cpm",
        objectiveIds: ["run-change", "inspect-result", "verify-final"],
        validatorRule: "lab05a-change",
        hints: {
          level1Concept:
            "Which CPM operation generates a fresh password and updates both target and Vault?",
          level2Location: "In `CPM Operations`, locate `Administrator` (`WIN-SRV-01`).",
          level3Procedure:
            "Click `Change` on `Administrator` (`WIN-SRV-01`) and confirm the job succeeds.",
          level4Solution:
            "Open `CPM Operations` → click `Change` on `Administrator · WIN-SRV-01` → return and click Check My Work.",
        },
        successExplanation:
          "CPM rotated `Administrator` on `WIN-SRV-01`, logged the audit event, and kept the account in `Managed` state.",
        successRealWorldRelevance:
          "Automated CPM rotation guarantees credentials cannot linger unchanged past compliance intervals.",
        skillTag: "Automated CPM Password Rotation",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Verify an Unverified Production Credential",
      objective:
        "Without guided steps, locate an account in `Verify required` status (`svc_payment` or `postgres_admin`) and run CPM Verify to bring it into `Managed` compliance.",
      initialEnvironment: "`Administrator` on `WIN-SRV-01` has been rotated and verified.",
      enterpriseContext:
        lesson.enterpriseScenario?.businessContext ||
        "Operations must verify remaining unverified production credentials before the compliance audit cutoff.",
      requirements: [
        "Locate an account in `Verify required` status (`svc_payment` or `postgres_admin`).",
        "Run CPM `Verify` so it transitions cleanly to `Managed`.",
      ],
      targetConsole: "cpm",
      validatorRule: "ind-cpm-verify-pending",
      hints: {
        level1Concept: "Which accounts in the inventory still show `Verify required`?",
        level2Location:
          "Check `CPM Operations` or `Accounts` for accounts with `Verify required` status.",
        level3Procedure:
          "Open `CPM Operations`, locate `svc_payment` (`APP-PAY-01`), and click `Verify`.",
        level4Solution:
          "Run `Verify` on `svc_payment` in `CPM Operations` until status is `Managed`, then click Check Independent Challenge.",
      },
    },
  };
}

function buildLab06AConcepts(
  lesson: Lesson,
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
        title: "Obtain Dual-Control Approval",
        conceptIntro:
          "Dual Control prevents unilateral privileged access by requiring an explicit approval gate before PSM will broker a target session.",
        importance:
          "Enforcing approval ensures every privileged session is tied to peer review and governance policy.",
        realWorldContext:
          "Tier-1 server `WIN-SRV-01` enforces dual-control approval before any RDP connection.",
        objective: "Approve the pending dual-control request for `WIN-SRV-01`.",
        task: "Grant dual-control approval in the PSM Operations Console.",
        where: "PSM Operations Console (`PSM Operations` tab)",
        action: "Open `PSM Operations` and approve/grant dual-control workflow authorization.",
        expectedResult: "Dual-control approval state becomes Granted and ready for session launch.",
        why: "Without approval, PSM preflight blocks the connection to enforce separation of duties.",
        targetConsole: "psm",
        objectiveIds: ["obtain-approval"],
        validatorRule: "lab06a-approval",
        hints: {
          level1Concept:
            "What governance gate must be satisfied before PSM allows connecting to a dual-control account?",
          level2Location:
            "Navigate to `PSM Operations` and look at the Dual Control / Approval workflow controls.",
          level3Procedure:
            "Open `PSM Operations` and click the Approve / Grant Dual-Control button.",
          level4Solution:
            "In `PSM Operations`, grant dual-control approval so `approvalGranted` is active, then click Check My Work.",
        },
        successExplanation:
          "Dual-control approval is active, authorizing a governed PSM session launch.",
        successRealWorldRelevance:
          "Dual control satisfies PCI-DSS and SOX four-eyes requirements for Tier-0/Tier-1 servers.",
        skillTag: "Dual-Control Session Governance",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Launch Brokered PSM Session with Change Ticket",
        conceptIntro:
          "PSM injects credentials directly from the Vault into the target connection so the administrator never sees or handles the password.",
        importance:
          "Linking a change ticket (`CHG-12345`) correlates every recorded keystroke to an approved ITSM change.",
        realWorldContext:
          "All administrative connections to `WIN-SRV-01` must traverse PSM with a change ticket.",
        objective:
          "Launch a brokered PSM session to `WIN-SRV-01` (`Administrator`) with a valid change ticket.",
        task: "Enter a change ticket (e.g., `CHG-12345`) and launch a PSM session to `WIN-SRV-01`.",
        where: "PSM Operations Console → Launch Brokered Session form",
        action:
          "In `PSM Operations`, select `Administrator` on `WIN-SRV-01`, enter ticket `CHG-12345` and a reason, and click Launch Session.",
        expectedResult:
          "An active brokered PSM session opens with live terminal/recording telemetry.",
        why: "PSM isolates endpoints from admin workstations and binds sessions to ITSM ticket IDs.",
        targetConsole: "psm",
        objectiveIds: ["ticket-reference", "launch-psm"],
        validatorRule: "lab06a-launch",
        hints: {
          level1Concept: "Why does PSM require a ticket reference like `CHG-12345` at launch time?",
          level2Location: "In `PSM Operations`, locate the Session Launcher form.",
          level3Procedure:
            "Select `Administrator · WIN-SRV-01`, type `CHG-12345` into the ticket field, add a business reason, and click Launch.",
          level4Solution:
            "With dual-control approved in `PSM Operations`, enter ticket `CHG-12345`, select `WIN-SRV-01` (`Administrator`), and click Launch Session.",
        },
        successExplanation:
          "A brokered PSM session was established with ticket tracking and zero plaintext password exposure.",
        successRealWorldRelevance:
          "Ticket-bound PSM brokering creates an end-to-end audit chain from ITSM approval to target commands.",
        skillTag: "Ticket-Bound PSM Session Brokering",
      },
      {
        id: `${prefix}-c03`,
        order: 3,
        title: "Execute Audited Commands in the Live PSM Terminal",
        conceptIntro:
          "Every command issued inside a PSM session is captured as searchable keystroke and audit metadata.",
        importance:
          "Command-level telemetry enables SOC analysts to detect anomalous commands in real time.",
        realWorldContext: "Perform baseline host verification inside the recorded session.",
        objective:
          "Execute at least 2 commands (e.g., `whoami`, `hostname`) inside the active PSM session.",
        task: "Run at least two diagnostic commands in the live PSM session terminal.",
        where: "PSM Operations Console → Active Session Terminal",
        action:
          "Inside your active PSM session, execute `whoami` and `hostname` (at least 2 commands).",
        expectedResult: "Both commands appear in the session command timeline and audit trail.",
        why: "Proves keystroke auditing and command attribution are actively recording.",
        targetConsole: "psm",
        objectiveIds: ["execute-commands", "inspect-timeline"],
        validatorRule: "lab06a-commands",
        hints: {
          level1Concept:
            "How many commands must be recorded in the active session to populate the audit timeline?",
          level2Location:
            "Look at the interactive terminal inside your active session in `PSM Operations`.",
          level3Procedure:
            "Type `whoami` and submit, then type `hostname` and submit inside the active PSM terminal.",
          level4Solution:
            "In the active PSM session terminal, execute `whoami` and `hostname` (2+ commands), then click Check My Work.",
        },
        successExplanation:
          "Your session commands were captured in the immutable PSM timeline and audit log.",
        successRealWorldRelevance:
          "Keystroke indexing lets incident responders search across thousands of sessions in seconds.",
        skillTag: "PSM Session Telemetry & Command Auditing",
      },
      {
        id: `${prefix}-c04`,
        order: 4,
        title: "Terminate Session & Seal Forensic Recording",
        conceptIntro:
          "Properly terminating a PSM session closes the target channel and seals the session recording for long-term Vault retention.",
        importance:
          "Idle or orphaned privileged sessions increase hijacking exposure and delay post-session password rotation.",
        realWorldContext: "Complete the change window by terminating the session cleanly.",
        objective: "Terminate the active PSM session so its status becomes `Terminated`.",
        task: "Terminate your active PSM session and confirm the recording is sealed.",
        where: "PSM Operations Console → Active Session Controls",
        action:
          "Click `Terminate Session` (or type `exit` in the session terminal) to close and seal the session.",
        expectedResult:
          "Session status changes to `Terminated` and a termination audit record is sealed.",
        why: "Clean termination finalizes forensic recordings and triggers post-session governance.",
        targetConsole: "psm",
        objectiveIds: ["terminate-session"],
        validatorRule: "lab06a-terminate",
        hints: {
          level1Concept: "What happens to the PSM recording when a session is formally terminated?",
          level2Location:
            "In `PSM Operations`, find the `Terminate` button on your active session.",
          level3Procedure:
            "Click `Terminate` (or run `exit` in the session terminal) and verify status updates to `Terminated`.",
          level4Solution:
            "Click `Terminate Session` on your active session in `PSM Operations`, then click Check My Work.",
        },
        successExplanation:
          "The PSM session is cleanly terminated and its forensic recording is sealed in the audit log.",
        successRealWorldRelevance:
          "Sealed recordings provide non-repudiable evidence for regulatory audits and forensics.",
        skillTag: "PSM Session Termination & Forensic Sealing",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Execute a Second Governed PSM Change Session",
      objective:
        "Independently launch a new approved PSM session with a fresh change ticket, run at least one diagnostic command, and terminate it cleanly.",
      initialEnvironment:
        "Your first PSM session is terminated and sealed; PSM connector is healthy.",
      enterpriseContext:
        "An emergency follow-up verification requires a separate ticketed PSM session with clean termination.",
      requirements: [
        "Launch a new PSM session (total sessions increases beyond your guided session).",
        "Execute at least 1 command inside the new session.",
        "Terminate the new session cleanly so its status is `Terminated`.",
      ],
      targetConsole: "psm",
      validatorRule: "ind-psm-second-session",
      hints: {
        level1Concept: "What three stages make a complete governed PSM session lifecycle?",
        level2Location: "Use the session launcher and terminal in `PSM Operations`.",
        level3Procedure:
          "Launch a new session with a ticket (e.g., `CHG-20499`), execute `whoami`, and click `Terminate`.",
        level4Solution:
          "In `PSM Operations`, launch a second approved session (`CHG-20499`), run `whoami`, terminate it, and click Check Independent Challenge.",
      },
    },
  };
}

function buildLab06BConcepts(
  lesson: Lesson,
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
        title: "Verify PSM Preflight Failure Signals",
        conceptIntro:
          "PSM enforces preflight gates (dual-control approval, Safe permissions, connector health) before opening any target connection.",
        importance:
          "Recognizing which preflight gate blocked a session avoids misdiagnosing network issues.",
        realWorldContext:
          "Operators must capture and diagnose PSM preflight failure signals from the audit trail.",
        objective: "Trigger or review a PSM Launch / Approval event in the simulator audit log.",
        task: "Inspect PSM preflight gates and generate an audited Launch or Approval check in PSM Operations.",
        where: "PSM Operations Console (`PSM Operations` tab)",
        action:
          "Open `PSM Operations`, inspect connector health and dual-control approval, and attempt a session check or approval action.",
        expectedResult: "A `Launch` or `Approval` control-plane event appears in the audit trail.",
        why: "Control-plane audit entries pinpoint which preflight gate blocked access.",
        targetConsole: "psm",
        objectiveIds: ["diagnose-preflight", "review-failure-signals"],
        validatorRule: "lab06b-failure-signals",
        hints: {
          level1Concept: "What three preflight checks must pass before PSM brokers a session?",
          level2Location: "Go to `PSM Operations` and review the Preflight / Approval controls.",
          level3Procedure:
            "In `PSM Operations`, attempt a launch or click Approval so a Launch/Approval audit event is logged.",
          level4Solution:
            "Open `PSM Operations` → trigger a session launch check or grant approval → click Check My Work.",
        },
        successExplanation: "Preflight control-plane telemetry has been logged and diagnosed.",
        successRealWorldRelevance:
          "Structured preflight logging cuts mean-time-to-resolution on blocked emergency sessions.",
        skillTag: "PSM Preflight Diagnostics",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Restore Connector Health & Approval Prerequisites",
        conceptIntro:
          "Both PSM connector health and dual-control approval must be green before a governed connection can proceed.",
        importance:
          "Restoring prerequisites safely maintains security policy instead of bypassing controls.",
        realWorldContext:
          "Ensure the PSM connector is healthy and dual-control approval is granted.",
        objective: "Confirm `psmConnectorHealthy` is healthy and dual-control approval is granted.",
        task: "Restore PSM connector health (if degraded) and grant dual-control approval.",
        where: "PSM Operations Console",
        action:
          "In `PSM Operations`, ensure the PSM connector is healthy and approve dual-control access.",
        expectedResult: "Connector shows Healthy and Dual-Control Approval shows Granted.",
        why: "Both technical availability and governance approval are mandatory gates.",
        targetConsole: "psm",
        objectiveIds: ["restore-prerequisites"],
        validatorRule: "lab06b-restore-prereqs",
        hints: {
          level1Concept: "Which two operational prerequisites must both be true before launching?",
          level2Location:
            "Check the Connector Health toggle and Dual Control panel in `PSM Operations`.",
          level3Procedure:
            "Ensure PSM Connector Health is enabled/healthy and click Grant Approval.",
          level4Solution:
            "In `PSM Operations`, verify Connector is Healthy and Dual-Control Approval is Granted, then click Check My Work.",
        },
        successExplanation: "All PSM preflight gates are healthy and approved.",
        successRealWorldRelevance:
          "Keeping connector health monitored prevents surprise outages during incidents.",
        skillTag: "PSM Prerequisite Restoration",
      },
      {
        id: `${prefix}-c03`,
        order: 3,
        title: "Validate Healthy Approved Session Launch",
        conceptIntro:
          "After repairing preflight gates, always validate end-to-end session brokering.",
        importance: "Confirms Vault → PSM → Target brokering succeeds under live policy.",
        realWorldContext:
          "Verify service restoration by launching a ticketed session (`CHG-20412`).",
        objective: "Launch an approved PSM session in `PSM Operations`.",
        task: "Launch a brokered PSM session with a valid change ticket (e.g., `CHG-20412`).",
        where: "PSM Operations Console → Launch Session",
        action:
          "Select `Administrator · WIN-SRV-01`, enter ticket `CHG-20412`, and click Launch Session.",
        expectedResult: "A live brokered PSM session opens cleanly.",
        why: "End-to-end validation proves the incident is truly resolved.",
        targetConsole: "psm",
        objectiveIds: ["validate-healthy-launch"],
        validatorRule: "lab06b-launch",
        hints: {
          level1Concept: "What confirms that PSM preflight remediation actually worked?",
          level2Location: "Use the Session Launcher in `PSM Operations`.",
          level3Procedure: "Enter ticket `CHG-20412` and launch a session to `WIN-SRV-01`.",
          level4Solution:
            "In `PSM Operations`, launch an approved session with ticket `CHG-20412`, then click Check My Work.",
        },
        successExplanation: "Approved PSM session brokering succeeded end-to-end.",
        successRealWorldRelevance:
          "Always verify with a real brokered session before closing a PSM outage ticket.",
        skillTag: "PSM Service Restoration Validation",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: "Complete Audited Session Execution & Clean Termination",
      objective:
        "Without guided steps, execute at least one diagnostic command inside your PSM session and terminate it cleanly so the recording is sealed.",
      initialEnvironment: "An approved PSM session is launched and healthy.",
      enterpriseContext:
        lesson.enterpriseScenario?.businessContext ||
        "Close out the PSM validation by leaving a sealed forensic recording with command evidence.",
      requirements: [
        "Execute at least 1 command inside a PSM session.",
        "Terminate the session so status is `Terminated` and sealed in the audit log.",
      ],
      targetConsole: "psm",
      validatorRule: "ind-psm-second-session",
      hints: {
        level1Concept:
          "How do you prove commands were recorded and that the session did not stay open?",
        level2Location: "Check your active session terminal in `PSM Operations`.",
        level3Procedure: "Run `whoami` in the session terminal, then click `Terminate`.",
        level4Solution:
          "Execute `whoami` in the active PSM session and terminate it cleanly, then click Check Independent Challenge.",
      },
    },
  };
}

function buildLab03Concepts(
  lesson: Lesson,
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
        title: "Verify Account Metadata & Platform Binding",
        conceptIntro:
          "Onboarding binds a target account (`username` + `address`) to a Platform policy defining rotation frequency and password complexity.",
        importance:
          "Wrong platform selection causes CPM plugin failures when rotating credentials.",
        realWorldContext:
          "Local Windows servers like `WIN-SRV-01` require `Windows Server Local`, not a domain platform.",
        objective: "Confirm `Administrator` on `WIN-SRV-01` is bound to `Windows Server Local`.",
        task: "Inspect `Administrator` on `WIN-SRV-01` in Accounts and verify its platform binding.",
        where: "Accounts Console (`Accounts` tab)",
        action:
          "Open `Accounts`, locate `Administrator` (`WIN-SRV-01`), and verify platform `Windows Server Local`.",
        expectedResult: "`Administrator` on `WIN-SRV-01` is mapped to `Windows Server Local`.",
        why: "Platform policies drive which CPM plugin and complexity rules govern the account.",
        targetConsole: "accounts",
        objectiveIds: ["onboard-account", "platform-selection"],
        validatorRule: "lab03-account-platform",
        hints: {
          level1Concept:
            "Why does `WIN-SRV-01\\Administrator` use `Windows Server Local` instead of a Domain platform?",
          level2Location:
            "Open the `Accounts` console and inspect row `Administrator` (`WIN-SRV-01`).",
          level3Procedure:
            "Confirm `Administrator` on `WIN-SRV-01` lists platform `Windows Server Local`, then click Check My Work.",
          level4Solution:
            "In `Accounts`, verify `Administrator` (`WIN-SRV-01`) has platform `Windows Server Local`, then click Check My Work.",
        },
        successExplanation:
          "`Administrator` on `WIN-SRV-01` is mapped to the correct `Windows Server Local` platform.",
        successRealWorldRelevance:
          "Accurate platform classification prevents mass CPM plugin errors across server fleets.",
        skillTag: "Account Platform Binding",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Confirm Safe Placement & Accountable Owner",
        conceptIntro:
          "Every onboarded account must reside inside its scoped Safe with a named accountable owner.",
        importance:
          "Safe placement controls who can use or rotate the account; ownership assigns governance responsibility.",
        realWorldContext:
          "Windows server local admin accounts belong in `WIN-SAFE` owned by `windows_admin`.",
        objective:
          "Confirm `Administrator` (`WIN-SRV-01`) is placed in `WIN-SAFE` with owner `windows_admin`.",
        task: "Verify `WIN-SAFE` placement and `windows_admin` ownership for `Administrator` on `WIN-SRV-01`.",
        where: "Accounts Console → `Administrator` (`WIN-SRV-01`)",
        action:
          "Inspect the Safe and Owner columns for `Administrator` (`WIN-SRV-01`) in `Accounts`.",
        expectedResult: "Safe is `WIN-SAFE` and Owner is `windows_admin`.",
        why: "Misplaced accounts inherit the wrong Safe ACLs and expose credentials to unauthorized groups.",
        targetConsole: "accounts",
        objectiveIds: ["safe-placement", "assign-owner"],
        validatorRule: "lab03-safe-owner",
        hints: {
          level1Concept:
            "Which Safe holds Windows server administrative credentials and who owns them?",
          level2Location: "Check the Safe and Owner columns in the `Accounts` console.",
          level3Procedure:
            "Verify `Administrator` on `WIN-SRV-01` has Safe `WIN-SAFE` and Owner `windows_admin`.",
          level4Solution:
            "Confirm `Administrator · WIN-SRV-01` is in `WIN-SAFE` with owner `windows_admin`, then click Check My Work.",
        },
        successExplanation:
          "Account placement (`WIN-SAFE`) and ownership (`windows_admin`) are confirmed.",
        successRealWorldRelevance:
          "Clear Safe/owner governance prevents orphaned privileged credentials.",
        skillTag: "Safe Placement & Ownership",
      },
      {
        id: `${prefix}-c03`,
        order: 3,
        title: "Execute Live CPM Verification to Confirm Managed State",
        conceptIntro:
          "Onboarding is incomplete until CPM performs a live `Verify` proving the vaulted credential actually works on the target host.",
        importance:
          "An unverified onboarded account could contain a typo that breaks emergency access later.",
        realWorldContext:
          "Run a live CPM Verify against `WIN-SRV-01` and confirm `Managed` compliance.",
        objective:
          "Execute a live CPM `Verify` on `Administrator` (`WIN-SRV-01`) during this session.",
        task: "Trigger CPM `Verify` on `Administrator` (`WIN-SRV-01`) and confirm `Managed` status.",
        where: "CPM Operations Console (or Accounts Console) → `Administrator` (`WIN-SRV-01`)",
        action:
          "Run `Verify` on `Administrator` (`WIN-SRV-01`) and observe a newly recorded Completed CPM Verify job.",
        expectedResult: "A new `Completed` Verify operation is recorded and status is `Managed`.",
        why: "Live verification closes the onboarding loop with cryptographic authentication proof.",
        targetConsole: "cpm",
        objectiveIds: ["verify-creds", "management-status"],
        validatorRule: "lab03-cpm-verify",
        hints: {
          level1Concept: "Why is saving an account record not enough to prove CPM can manage it?",
          level2Location:
            "Open `CPM Operations` (or `Accounts`) and locate `Administrator` (`WIN-SRV-01`).",
          level3Procedure:
            "Click `Verify` on `Administrator` (`WIN-SRV-01`) so a new Verify job completes.",
          level4Solution:
            "In `CPM Operations`, run `Verify` on `Administrator` (`WIN-SRV-01`), confirm `Managed` status, then click Check My Work.",
        },
        successExplanation:
          "Live CPM Verify succeeded on `WIN-SRV-01`, confirming `Administrator` is actively `Managed`.",
        successRealWorldRelevance:
          "Automated post-onboarding Verify prevents silent vault-to-target drift.",
        skillTag: "Post-Onboarding CPM Verification",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Onboard a New Privileged Account Independently",
      objective:
        "Without step-by-step instructions, onboard a new privileged account in the Accounts Console into an appropriate Safe with a valid platform and owner.",
      initialEnvironment: "Baseline enterprise inventory is loaded and `WIN-SRV-01` is verified.",
      enterpriseContext:
        lesson.enterpriseScenario?.businessContext ||
        "A newly provisioned server requires its local administrative credential onboarded under Vault management.",
      requirements: [
        "Onboard at least one new privileged account in the `Accounts` console (increasing inventory count beyond baseline).",
        "Assign an existing Safe, platform, and accountable owner.",
      ],
      targetConsole: "accounts",
      validatorRule: "ind-accounts-onboard",
      hints: {
        level1Concept:
          "What four core attributes are required whenever you onboard an account into PAM?",
        level2Location: "Use the Add / Onboard Account form in the `Accounts` console.",
        level3Procedure:
          "Open `Accounts`, fill in username, target address (e.g., `WIN-APP-02`), platform (`Windows Server Local`), Safe (`WIN-SAFE`), and owner (`windows_admin`), then submit.",
        level4Solution:
          "In `Accounts`, onboard a new account (e.g., `local_adm` on `WIN-APP-02` in `WIN-SAFE`, owner `windows_admin`), then click Check Independent Challenge.",
      },
    },
  };
}

function buildLab04Concepts(
  lesson: Lesson,
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
        title: "Audit Account Archetypes & Ownership Coverage",
        conceptIntro:
          "Enterprise PAM separates human admins, service accounts, database accounts, and shared break-glass identities because each carries different rotation and session risks.",
        importance:
          "Accurate classification ensures service accounts get dependency-aware rotation and shared accounts get dual-control attribution.",
        realWorldContext:
          "Inspect inventory coverage across service, database, and shared accounts (`shared_ops`).",
        objective: "Confirm all inventory accounts have named owners and classified archetypes.",
        task: "Inspect the enterprise inventory in Accounts and confirm human, service, and shared account classification.",
        where: "Accounts Console (`Accounts` tab)",
        action: "Open `Accounts` and review account types, owners, and `shared_ops` mapping.",
        expectedResult: "100% of accounts carry named owners and clear identity archetypes.",
        why: "Unowned privileged accounts cannot be recertified during security audits.",
        targetConsole: "accounts",
        objectiveIds: ["classify-types", "accountable-owners", "shared-attribution"],
        validatorRule: "lab04-classify",
        hints: {
          level1Concept:
            "Why must shared accounts like `shared_ops` be distinguished from personal admin accounts?",
          level2Location: "Open the `Accounts` console and inspect the Type and Owner columns.",
          level3Procedure:
            "Verify service accounts, `shared_ops`, and named owners in `Accounts`, then click Check My Work.",
          level4Solution:
            "Confirm account types and owners in `Accounts`, then click Check My Work.",
        },
        successExplanation: "Inventory archetypes and 100% accountable ownership are confirmed.",
        successRealWorldRelevance: "Clear classification drives automated Safe onboarding rules.",
        skillTag: "Privileged Identity Classification",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Identify Unmanaged & Rotation-Exception Risks",
        conceptIntro:
          "Unmanaged database accounts (`oracle`) and failed service rotations (`svc_backup`) represent immediate credential exposure gaps.",
        importance:
          "Flagging exceptions prioritizes remediation before attackers exploit static or unmonitored passwords.",
        realWorldContext:
          "Audit `oracle` (`DB-ORA-01`, Unmanaged) and `svc_backup` (`WIN-SRV-02`, Rotation failed).",
        objective:
          "Confirm high-risk exceptions (`oracle` and `svc_backup`) are identified in live inventory.",
        task: "Locate unmanaged `oracle` and failed `svc_backup` in the Accounts/Discovery views.",
        where: "Accounts Console (`Accounts` tab)",
        action:
          "Inspect `oracle` on `DB-ORA-01` (Unmanaged) and `svc_backup` on `WIN-SRV-02` (Rotation failed).",
        expectedResult:
          "Both exception accounts are identified for onboarding/recovery remediation.",
        why: "Visibility into unmanaged and failing accounts is the first step in risk reduction.",
        targetConsole: "accounts",
        objectiveIds: ["flag-unmanaged", "rotation-exceptions", "remediation-decision"],
        validatorRule: "lab04-exceptions",
        hints: {
          level1Concept:
            "Which two statuses indicate an account is currently outside healthy automated rotation?",
          level2Location: "Filter or scan the Status column in `Accounts`.",
          level3Procedure:
            "Locate `oracle` (`Unmanaged`) and `svc_backup` (`Rotation failed`), then click Check My Work.",
          level4Solution:
            "Confirm `oracle` and `svc_backup` exceptions in `Accounts`, then click Check My Work.",
        },
        successExplanation:
          "Unmanaged and failed-rotation inventory exceptions have been identified.",
        successRealWorldRelevance:
          "Continuous exception tracking eliminates shadow privileged credentials.",
        skillTag: "Unmanaged Account Risk Triage",
      },
      {
        id: `${prefix}-c03`,
        order: 3,
        title: "Run Live Discovery Scan to Detect Shadow Credentials",
        conceptIntro:
          "Enterprise PAM continuously crawls Active Directory, Unix hosts, and databases to uncover unmanaged privileged accounts.",
        importance:
          "Manual spreadsheets go stale immediately; automated discovery keeps the Vault aligned with real infrastructure.",
        realWorldContext:
          "Execute a live Discovery scan to detect unmanaged privileged identities.",
        objective: "Run a live Discovery Scan in the Discovery Console.",
        task: "Trigger a Discovery Scan in the Discovery Console and observe newly captured scan telemetry.",
        where: "Discovery Console (`Discovery` tab)",
        action: "Open `Discovery` and click `Run Discovery Scan` (or execute a scan job).",
        expectedResult: "A new discovery job completes and logs a discovery audit event.",
        why: "Automated scans continuously surface unmanaged service and local admin accounts.",
        targetConsole: "discovery",
        objectiveIds: ["remediation-decision"],
        validatorRule: "lab04-discovery-action",
        hints: {
          level1Concept:
            "How does PAM keep track of newly created privileged accounts across hundreds of servers?",
          level2Location: "Open the `Discovery` tab in the top navigation bar.",
          level3Procedure:
            "In `Discovery`, click the button to run a new Discovery Scan and wait for the scan job to record.",
          level4Solution:
            "Navigate to `Discovery` → run a Discovery Scan (or onboard a discovered account) → return and click Check My Work.",
        },
        successExplanation: "Live Discovery telemetry was executed and recorded in the simulator.",
        successRealWorldRelevance:
          "Scheduled discovery feeds directly into automated onboarding pipelines.",
        skillTag: "Automated Credential Discovery",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Onboard a Discovered Unmanaged Account",
      objective:
        "Without step-by-step instructions, onboard at least one discovered unmanaged privileged account from Discovery (or add a new account in Accounts) into Vault management.",
      initialEnvironment:
        "Unmanaged discovered accounts (`svc_etl_sync`, `deploy_runner`, `oracle_sys_ro`, `ops_backup`) are pending in Discovery.",
      enterpriseContext:
        lesson.enterpriseScenario?.businessContext ||
        "Reduce shadow-admin exposure by onboarding a high-risk discovered credential into a Safe.",
      requirements: [
        "Onboard at least one discovered unmanaged account into a Safe (or onboard a new account in Accounts).",
        "Confirm the total managed inventory grows beyond the session baseline.",
      ],
      targetConsole: "discovery",
      validatorRule: "ind-discovery-onboard",
      hints: {
        level1Concept:
          "What closes the risk loop after Discovery finds an unmanaged privileged account?",
        level2Location: "Look at the Discovered Accounts table in the `Discovery` console.",
        level3Procedure:
          "Open `Discovery`, select an `Unmanaged` account (e.g., `svc_etl_sync`), and click `Onboard`.",
        level4Solution:
          "In `Discovery`, onboard `svc_etl_sync` (or any unmanaged discovered account), then click Check Independent Challenge.",
      },
    },
  };
}

function buildLab01AndGenericConcepts(
  lesson: Lesson,
  ex: PracticalExercise,
): {
  concepts: GuidedConcept[];
  independent: IndependentChallengeSpec;
} {
  const prefix = ex.id;
  const org = lesson.enterpriseScenario?.organization || "Global Financial Services (GFS Corp)";
  const consoleName = CONSOLE_LABELS[ex.targetConsole];
  const step1 = ex.stepDetails?.[0];
  const step2 = ex.stepDetails?.[1];

  return {
    concepts: [
      {
        id: `${prefix}-c01`,
        order: 1,
        title: `Inspect Core PAM Architecture & ${consoleName} Baseline`,
        conceptIntro: lesson.conceptIntroduction.split(". ").slice(0, 2).join(". ") + ".",
        importance: lesson.whyItExists.split(". ").slice(0, 2).join(". ") + ".",
        realWorldContext: `${org}: ${ex.scenario}`,
        objective:
          ex.objective ||
          `Verify the baseline state of the Digital Vault, PVWA, CPM, and PSM components in ${consoleName}.`,
        task:
          step1?.action ||
          `Inspect the four core PAM components and baseline health in ${consoleName}.`,
        where: consoleName,
        action:
          step1?.action ||
          `Open ${consoleName}, verify the Digital Vault is ONLINE, and inspect active PVWA, CPM, and PSM component status.`,
        expectedResult:
          step1?.expectedResult ||
          "Digital Vault reports ONLINE with active Safes, CPM operations, and healthy PSM connector.",
        why:
          step1?.explanation ||
          "Verifying baseline control-plane health confirms Vault isolation and component communication before making operational changes.",
        targetConsole: ex.targetConsole,
        objectiveIds: ["id-vault", "id-pvwa", "id-cpm", "id-psm"],
        validatorRule: "lab01-topology",
        hints: {
          level1Concept:
            "What are the four core components of an enterprise PAM deployment and which one acts as the hardened security bastion?",
          level2Location: `Open ${consoleName} using the console launch button or top navigation bar, and inspect the Platform Health & Vault header indicators.`,
          level3Procedure: `Click Open ${ex.targetConsole.toUpperCase()} Console → confirm Vault ONLINE status, Safes count, CPM jobs, and PSM connector health → return and click Check My Work.`,
          level4Solution: `Inspect the live component health in ${consoleName} (Vault ONLINE, 7 Safes, active CPM/PSM), then return and click Check My Work.`,
        },
        successExplanation:
          "Core PAM topology health is verified: Digital Vault, PVWA, CPM, and PSM are all operational in the live simulator.",
        successRealWorldRelevance:
          "Administrators always validate Vault heartbeat and component telemetry before running privileged changes.",
        skillTag: "PAM Architecture & Health Verification",
      },
      {
        id: `${prefix}-c02`,
        order: 2,
        title: "Trace Live Credential & Audit Control Flow in Simulator",
        conceptIntro:
          "Every privileged operation in PAM — verifying a credential, testing a Safe permission, scanning discovery, or remediating an incident — must flow through the Vault control plane and produce an immutable audit record.",
        importance:
          "Performing a real live operation and observing its audit trace proves end-to-end communication between PVWA, Vault, and operational engines.",
        realWorldContext:
          "Passive reading is not enough: enterprise operators verify control flow by executing a live operational check and confirming the resulting audit trail.",
        objective:
          "Execute a live operational action in the simulator (such as running CPM Verify on an account, testing a Safe permission, running a Discovery scan, or remediating an incident) to generate fresh control-plane audit evidence.",
        task: "Execute one live operational verification in the simulator to generate a new control-plane audit event.",
        where:
          ex.targetConsole === "overview" || ex.targetConsole === "audit"
            ? "CPM Operations Console (or Accounts / Safes Console), then verify in Reports & Audit"
            : consoleName,
        action:
          ex.targetConsole === "policies"
            ? "Open Policies Console and update or add a password policy (or run CPM Verify on `Administrator` in CPM Operations) so a new live audit record is created."
            : ex.targetConsole === "discovery"
              ? "Open Discovery Console and run a Discovery Scan (or onboard a discovered account) so a new live audit record is created."
              : ex.targetConsole === "troubleshooting"
                ? "Open Troubleshooting Console and execute a diagnostic remediation (or run CPM Verify in CPM Operations) so a new live audit record is created."
                : "Open CPM Operations (or Accounts) and run `Verify` on `Administrator` (`WIN-SRV-01`) or `svc_payment` (`APP-PAY-01`) — or run a permission test in Safes — to produce a live audit record.",
        expectedResult:
          step2?.expectedResult ||
          "A new live operational audit entry is appended to the simulator audit trail proving real Vault/component execution.",
        why:
          step2?.explanation ||
          "Live execution verifies the entire PAM control loop from operator console to Vault audit engine.",
        targetConsole:
          ex.targetConsole === "overview" || ex.targetConsole === "audit"
            ? "cpm"
            : ex.targetConsole,
        objectiveIds: ["trace-onboarding", "trace-rotation", "trace-session"],
        validatorRule: "lab01-live-trace",
        hints: {
          level1Concept:
            "How does an administrator prove that PVWA, Vault, and CPM/Safes are actually communicating and logging events?",
          level2Location:
            "Open `CPM Operations` (or `Safes` / `Discovery`) from the top navigation bar, execute an operation, and check `Reports & Audit`.",
          level3Procedure:
            "Open `CPM Operations`, locate `Administrator` (`WIN-SRV-01`) or `svc_payment`, click `Verify`, confirm the operation succeeds, then return and click Check My Work.",
          level4Solution:
            "Go to `CPM Operations` → click `Verify` on `Administrator` (`WIN-SRV-01`) or `svc_payment` (`APP-PAY-01`) → confirm a new audit record was logged → return to Learning Academy and click Check My Work.",
        },
        successExplanation:
          "Live simulator execution succeeded and produced verifiable control-plane audit evidence.",
        successRealWorldRelevance:
          "Every enterprise PAM change must leave a deterministic, tamper-evident audit trail for forensic review.",
        skillTag: "Live Control-Flow & Audit Verification",
      },
    ],
    independent: {
      id: `${prefix}-ind`,
      title: ex.independentPractice?.title || "Independent Operational Verification Challenge",
      objective:
        ex.independentPractice?.goal ||
        "Without step-by-step instructions, verify a `Verify required` account (`svc_payment` or `postgres_admin`) in CPM Operations OR execute an audited governance change (Safe permission check, policy update, or account onboarding) and confirm new audit evidence.",
      initialEnvironment:
        ex.startingState ||
        "All core PAM components are ONLINE. Unverified accounts (`svc_payment`, `postgres_admin`) and governance consoles are ready.",
      enterpriseContext:
        ex.independentPractice?.scenario ||
        "Prove operational independence by executing an additional verified PAM governance operation without guided steps.",
      requirements: [
        "Execute an additional real simulator operation (e.g., bring `svc_payment` or `postgres_admin` to `Managed` via CPM Verify, create a new Safe, onboard a discovered account, or evaluate a Safe ACL).",
        "Confirm fresh audit evidence is recorded beyond the guided concepts.",
      ],
      targetConsole:
        ex.independentPractice?.targetConsole === "overview" ||
        ex.independentPractice?.targetConsole === "audit"
          ? "cpm"
          : ex.independentPractice?.targetConsole || "cpm",
      validatorRule: "ind-audit-live-proof",
      hints: {
        level1Concept:
          "Which accounts in the simulator still need CPM verification or governance action?",
        level2Location:
          "Check `CPM Operations` (for `Verify required` accounts) or `Safes` / `Discovery`.",
        level3Procedure:
          "Open `CPM Operations`, run `Verify` on `svc_payment` (`APP-PAY-01`) or `postgres_admin` (`DB-PG-01`) so it transitions to `Managed`.",
        level4Solution:
          "In `CPM Operations`, click `Verify` on `svc_payment` (`APP-PAY-01`) and verify it changes from `Verify required` to `Managed`, then click Check Independent Challenge.",
      },
    },
  };
}

export function buildGuidedLabPlan(lesson: Lesson, exercise: PracticalExercise): GuidedLabPlan {
  const labId = exercise.associatedLabId || "";
  let built: { concepts: GuidedConcept[]; independent: IndependentChallengeSpec };

  if (labId.includes("Lab 02")) {
    built = buildLab02Concepts(lesson, exercise);
  } else if (labId.includes("Lab 05B")) {
    built = buildLab05BConcepts(lesson, exercise);
  } else if (labId.includes("Lab 05A")) {
    built = buildLab05AConcepts(lesson, exercise);
  } else if (labId.includes("Lab 06A")) {
    built = buildLab06AConcepts(lesson, exercise);
  } else if (labId.includes("Lab 06B")) {
    built = buildLab06BConcepts(lesson, exercise);
  } else if (labId.includes("Lab 03")) {
    built = buildLab03Concepts(lesson, exercise);
  } else if (labId.includes("Lab 04")) {
    built = buildLab04Concepts(lesson, exercise);
  } else {
    built = buildLab01AndGenericConcepts(lesson, exercise);
  }

  return {
    exerciseId: exercise.id,
    labId,
    title: exercise.title,
    whatYouWillAccomplish:
      exercise.objective ||
      `Complete ${built.concepts.length} guided hands-on concepts plus an independent verification challenge for ${exercise.title}.`,
    whyItMatters: lesson.whyItExists.split(". ").slice(0, 2).join(". ") + ".",
    enterpriseScenario: exercise.scenario,
    targetSystemOrAccount: getTargetSummary(labId, exercise),
    expectedEndResult: exercise.validationCriteria,
    concepts: built.concepts,
    independentChallenge: built.independent,
    recommendedNextSkill: getNextRecommendedSkill(labId),
  };
}

/**
 * Deterministic Concept Validator.
 * Strictly evaluates live PamState & pam-engine's evaluateLabObjectives().
 * Never trusts checkboxes, self-confirmation, or AI text.
 */
export function evaluateConceptValidation(
  concept: GuidedConcept,
  state: PamState,
  exercise: PracticalExercise,
  baseline: SessionBaselineSnapshot,
): ConceptValidationResult {
  const labEval = evaluateLabObjectives(state, exercise.associatedLabId);
  const objById = new Map(labEval.objectives.map((o) => [o.id, o]));
  const criteria: ValidationCriterionResult[] = [];
  const evidence: string[] = [];

  const newAuditEvents = state.audit.slice(
    0,
    Math.max(0, state.audit.length - baseline.auditCount),
  );
  const newCpmOps = state.cpmOperations.slice(
    0,
    Math.max(0, state.cpmOperations.length - baseline.cpmOpCount),
  );

  switch (concept.validatorRule) {
    case "lab02-safe-boundary": {
      const dbaSafe = state.safes.find((s) => s.name === "DBA-SAFE");
      const createSafeObj = objById.get("create-safe");
      const ownerObj = objById.get("assign-owner");
      criteria.push({
        id: "safe_exists",
        label: "DBA-SAFE container exists in Vault",
        passed: Boolean(dbaSafe && (createSafeObj?.done ?? true)),
        expected: "Safe `DBA-SAFE` exists in the Digital Vault.",
        observed: dbaSafe
          ? `DBA-SAFE present with ${dbaSafe.members.length} members.`
          : "DBA-SAFE was not found in state.safes.",
        possibleReason: dbaSafe ? undefined : "DBA-SAFE has not been created yet.",
        diagnosticAction: "Open Safes Console and confirm `DBA-SAFE` appears in the Safe roster.",
      });
      criteria.push({
        id: "safe_owner",
        label: "Accountable owner assigned to DBA-SAFE",
        passed: Boolean(dbaSafe?.owner && (ownerObj?.done ?? true)),
        expected: "DBA-SAFE has a named accountable owner (e.g., `pam_admin`).",
        observed: dbaSafe?.owner ? `Owner is \`${dbaSafe.owner}\`.` : "No owner assigned.",
        possibleReason: dbaSafe?.owner ? undefined : "Safe ownership metadata is empty.",
        diagnosticAction: "Inspect Safe ownership properties on `DBA-SAFE` in the Safes Console.",
      });
      if (dbaSafe)
        evidence.push(
          `DBA-SAFE verified (${dbaSafe.members.length} members, owner: ${dbaSafe.owner})`,
        );
      break;
    }

    case "lab02-member-config": {
      const dbaSafe = state.safes.find((s) => s.name === "DBA-SAFE");
      const dbaUser = dbaSafe?.members.find((m) => m.username === "dba_user");
      const hasList = Boolean(dbaUser?.permissions.includes("List accounts"));
      const hasUseOrSession = Boolean(
        dbaUser?.permissions.includes("Use accounts") ||
        dbaUser?.permissions.includes("Initiate privileged sessions"),
      );
      const noRetrieve = Boolean(dbaUser && !dbaUser.permissions.includes("Retrieve accounts"));
      const savedInAudit = state.audit.some(
        (a) =>
          a.target.includes("DBA-SAFE") &&
          a.result === "Success" &&
          (a.action.toLowerCase().includes("member") ||
            a.action.toLowerCase().includes("permission")),
      );

      criteria.push({
        id: "dba_user_member",
        label: "`dba_user` is a member of DBA-SAFE",
        passed: Boolean(dbaUser),
        expected: "`dba_user` is listed as a Safe member on `DBA-SAFE`.",
        observed: dbaUser
          ? `dba_user permissions: ${dbaUser.permissions.join(", ")}.`
          : "dba_user is not a member of DBA-SAFE.",
        possibleReason: dbaUser ? undefined : "dba_user was removed or not added to DBA-SAFE.",
        diagnosticAction: "Open Safes → DBA-SAFE and add/select member `dba_user`.",
      });
      criteria.push({
        id: "least_privilege_acl",
        label: "Least privilege enforced (List + Use/Session, NO Retrieve accounts)",
        passed: hasList && hasUseOrSession && noRetrieve,
        expected:
          "`dba_user` holds `List accounts` and `Use accounts` / `Initiate privileged sessions`, with `Retrieve accounts` unchecked.",
        observed: dbaUser
          ? `Current permissions: [${dbaUser.permissions.join(", ")}].`
          : "No permissions found for dba_user.",
        possibleReason: !noRetrieve
          ? "`Retrieve accounts` is currently enabled, exposing plaintext passwords."
          : "Missing `List accounts` or `Use accounts` / `Initiate privileged sessions`.",
        diagnosticAction:
          "In Safes → DBA-SAFE → `dba_user`, uncheck `Retrieve accounts`, keep `List accounts` and `Use accounts` checked, and save.",
      });
      criteria.push({
        id: "acl_saved_audited",
        label: "DBA-SAFE member configuration saved and audited",
        passed: savedInAudit,
        expected:
          "An audited `Success` member/permission update for `DBA-SAFE` exists in the Vault audit trail.",
        observed: savedInAudit
          ? "Audited DBA-SAFE member configuration event found."
          : "No DBA-SAFE member configuration update has been saved in the audit log yet.",
        possibleReason: "Permissions have not yet been saved in the Safes Console.",
        diagnosticAction:
          "Open Safes → select `DBA-SAFE` → select `dba_user` → click Save Member Permissions.",
      });
      if (dbaUser && savedInAudit) {
        evidence.push(`dba_user ACL saved on DBA-SAFE: [${dbaUser.permissions.join(", ")}]`);
      }
      break;
    }

    case "lab02-allowed-test": {
      const allowedObj = objById.get("verify-allowed");
      const allowedAudit = state.audit.find(
        (a) =>
          a.target.includes("DBA-SAFE") &&
          a.result === "Success" &&
          (a.action.toLowerCase().includes("use") ||
            a.action.toLowerCase().includes("list") ||
            a.action.toLowerCase().includes("member") ||
            a.action.toLowerCase().includes("permission")),
      );
      criteria.push({
        id: "verify_allowed",
        label: "Permitted operation verified on DBA-SAFE",
        passed: Boolean(allowedObj?.done && allowedAudit),
        expected:
          "An audited `Success` permission check for `dba_user` on `DBA-SAFE` (`Use accounts` or `List accounts`).",
        observed: allowedAudit
          ? `Recorded: ${allowedAudit.action} on ${allowedAudit.target} (${allowedAudit.result}).`
          : "No `Success` access verification event targeting `DBA-SAFE` found in audit trail.",
        possibleReason:
          "The positive permission evaluation on `DBA-SAFE` has not been executed yet.",
        diagnosticAction:
          "Open Safes → select `DBA-SAFE` → run the Permission Evaluator for `dba_user` with `Use accounts`.",
      });
      if (allowedAudit)
        evidence.push(
          `Audit: ${allowedAudit.action} -> ${allowedAudit.target} (${allowedAudit.result})`,
        );
      break;
    }

    case "lab02-denied-test": {
      const deniedObj = objById.get("verify-denied");
      const deniedAudit = state.audit.find(
        (a) => a.target.includes("DBA-SAFE") && a.result === "Denied",
      );
      const hasDbaSafeAudit = state.audit.some((a) => a.target.includes("DBA-SAFE"));
      const retrieveEval = evaluatePermission(state, "DBA-SAFE", "dba_user", "Retrieve accounts");
      const retrieveBlocked = !retrieveEval.allowed;

      criteria.push({
        id: "retrieve_withheld",
        label: "`Retrieve accounts` is denied for `dba_user` on `DBA-SAFE`",
        passed: retrieveBlocked,
        expected:
          "Live Vault ACL check for `dba_user` + `Retrieve accounts` on `DBA-SAFE` evaluates to Denied.",
        observed: retrieveBlocked
          ? `Live ACL check denied: ${retrieveEval.message}`
          : `Live ACL check ALLOWED plaintext retrieval: ${retrieveEval.message}`,
        possibleReason: retrieveBlocked
          ? undefined
          : "`Retrieve accounts` is currently granted to `dba_user`.",
        diagnosticAction:
          "In Safes → `DBA-SAFE` → Members → `dba_user`, uncheck `Retrieve accounts` and save.",
      });
      criteria.push({
        id: "denied_enforcement_verified",
        label: "Audited `DBA-SAFE` ACL enforcement & Lab 02 denial objective verified",
        passed: Boolean(deniedObj?.done && retrieveBlocked && (deniedAudit || hasDbaSafeAudit)),
        expected:
          "`DBA-SAFE` ACL configuration is audited and `Retrieve accounts` denial is enforced.",
        observed: deniedAudit
          ? `Recorded: ${deniedAudit.action} on ${deniedAudit.target} (${deniedAudit.result}).`
          : retrieveBlocked && hasDbaSafeAudit
            ? `DBA-SAFE ACL saved & audited; live ACL evaluation confirms Retrieve accounts is Denied.`
            : "DBA-SAFE ACL has not been saved/verified with Retrieve accounts denied yet.",
        possibleReason:
          "Save least-privilege `dba_user` permissions on `DBA-SAFE` and run the `Retrieve accounts` check in Permissions.",
        diagnosticAction:
          "Open Safes → `DBA-SAFE` → Permissions → test `dba_user` with `Retrieve accounts` and confirm Denied.",
      });
      if (retrieveBlocked && (deniedAudit || hasDbaSafeAudit)) {
        evidence.push(
          deniedAudit
            ? `Audit Denial: ${deniedAudit.action} -> ${deniedAudit.target} (Denied)`
            : `Live ACL Enforcement: ${retrieveEval.message}`,
        );
      }
      break;
    }

    case "lab05b-inspect-failure": {
      const svc = state.accounts.find((a) => a.username === "svc_backup");
      criteria.push({
        id: "svc_backup_located",
        label: "`svc_backup` on `WIN-SRV-02` located in inventory",
        passed: Boolean(svc),
        expected: "Service account `svc_backup` on `WIN-SRV-02` exists in simulator state.",
        observed: svc
          ? `Found \`svc_backup\` on \`${svc.address}\` (Status: ${svc.status}${svc.failureCause ? `, Cause: ${svc.failureCause}` : ""}).`
          : "`svc_backup` not found.",
        diagnosticAction: "Open CPM Operations and inspect `svc_backup` on `WIN-SRV-02`.",
      });
      if (svc)
        evidence.push(`Account svc_backup (${svc.address}) inspected — status: ${svc.status}`);
      break;
    }

    case "lab05b-unlock": {
      const svc = state.accounts.find((a) => a.username === "svc_backup");
      const unlockObj = objById.get("repair-lockout");
      criteria.push({
        id: "repair_lockout",
        label: "Target account lockout cleared on `svc_backup`",
        passed: Boolean(unlockObj?.done),
        expected: "`svc_backup` lockout failure cause is cleared and Unlock repair is audited.",
        observed: unlockObj?.done
          ? "Lockout cleared on `svc_backup`."
          : `Current status: ${svc?.status ?? "Unknown"}, Failure cause: ${svc?.failureCause ?? "Locked"}.`,
        possibleReason: "The target account `svc_backup` is still locked on `WIN-SRV-02`.",
        diagnosticAction:
          "Open CPM Operations (or Troubleshooting) and execute `Unlock` on `svc_backup`.",
      });
      if (unlockObj?.done) evidence.push("svc_backup lockout repaired on WIN-SRV-02");
      break;
    }

    case "lab05b-reconcile": {
      const svc = state.accounts.find((a) => a.username === "svc_backup");
      const reconcileObj = objById.get("reconcile-account");
      const reconcileOp = state.cpmOperations.find(
        (op) =>
          op.accountId === svc?.id && op.operation === "Reconcile" && op.result === "Completed",
      );
      criteria.push({
        id: "reconcile_completed",
        label: "CPM `Reconcile` completed for `svc_backup`",
        passed: Boolean(reconcileObj?.done && (reconcileOp || svc?.lastReconcile !== "Pending")),
        expected: "A `Completed` CPM `Reconcile` operation synchronizing `svc_backup`.",
        observed: reconcileOp
          ? `Reconcile completed: ${reconcileOp.detail}`
          : `No completed Reconcile job found for svc_backup (lastReconcile: ${svc?.lastReconcile ?? "Pending"}).`,
        possibleReason:
          "CPM Reconcile has not been run yet (or failed because lockout was not cleared first).",
        diagnosticAction: "In CPM Operations, click `Reconcile` on `svc_backup` (`WIN-SRV-02`).",
      });
      if (reconcileOp) evidence.push(`CPM Reconcile completed: ${reconcileOp.detail}`);
      break;
    }

    case "lab05b-change":
    case "lab05b-verify": {
      const svc = state.accounts.find((a) => a.username === "svc_backup");
      const changeObj = objById.get("retry-change");
      const verifyObj = objById.get("verify-recovery");
      criteria.push({
        id: "cpm_change_ok",
        label: "CPM `Change` rotation succeeded on `svc_backup`",
        passed: Boolean(changeObj?.done),
        expected: "Completed CPM `Change` operation on `svc_backup`.",
        observed: changeObj?.done
          ? "CPM Change succeeded on `svc_backup`."
          : `CPM Change not yet completed (status: ${svc?.status ?? "Unknown"}).`,
        possibleReason: "Password Change has not been executed after Reconcile.",
        diagnosticAction: "In CPM Operations, run `Change` on `svc_backup`.",
      });
      criteria.push({
        id: "cpm_verify_managed",
        label: "CPM `Verify` succeeded and `svc_backup` is `Managed`",
        passed: Boolean(verifyObj?.done && svc?.status === "Managed"),
        expected: "`svc_backup` has a successful CPM Verify result and status `Managed`.",
        observed: `Account exists with status \`${svc?.status ?? "Unknown"}\`, lastVerify: \`${svc?.lastVerify ?? "Never"}\`.`,
        possibleReason: "CPM has not verified the newly rotated credential yet.",
        diagnosticAction:
          "In CPM Operations, run `Verify` on `svc_backup` and confirm status transitions to `Managed`.",
      });
      if (svc?.status === "Managed")
        evidence.push(`svc_backup restored to Managed (${svc.lastVerify})`);
      break;
    }

    case "lab05a-pre-verify": {
      const winAdmin = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      const verifyOp = newCpmOps.find(
        (op) =>
          op.accountId === winAdmin?.id && op.operation === "Verify" && op.result === "Completed",
      );
      const anyVerifyOp = state.cpmOperations.find(
        (op) =>
          op.accountId === winAdmin?.id && op.operation === "Verify" && op.result === "Completed",
      );
      criteria.push({
        id: "pre_verify",
        label: "CPM `Verify` confirmed on `Administrator · WIN-SRV-01`",
        passed: Boolean(verifyOp || anyVerifyOp),
        expected: "Completed CPM `Verify` operation recorded for `Administrator` on `WIN-SRV-01`.",
        observed: verifyOp
          ? `Session CPM Verify completed: ${verifyOp.detail}`
          : anyVerifyOp
            ? `CPM Verify completed: ${anyVerifyOp.detail}`
            : `No completed CPM Verify operation found for Administrator (lastVerify: ${winAdmin?.lastVerify ?? "Unknown"}).`,
        possibleReason: "CPM Verify has not been executed on `Administrator` (`WIN-SRV-01`) yet.",
        diagnosticAction: "Open CPM Operations and click `Verify` on `Administrator · WIN-SRV-01`.",
      });
      if (verifyOp || anyVerifyOp) {
        evidence.push(`CPM Verify recorded for Administrator · WIN-SRV-01`);
      }
      break;
    }

    case "lab05a-change":
    case "lab05a-audit-managed": {
      const winAdmin = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      const changeOp = state.cpmOperations.find(
        (op) =>
          op.accountId === winAdmin?.id && op.operation === "Change" && op.result === "Completed",
      );
      const isManaged = winAdmin?.status === "Managed";
      criteria.push({
        id: "run_change",
        label: "CPM `Change` completed for `Administrator · WIN-SRV-01`",
        passed: Boolean(changeOp),
        expected: "A `Completed` CPM `Change` operation on `Administrator` (`WIN-SRV-01`).",
        observed: changeOp
          ? `Completed Change job: ${changeOp.detail}`
          : "No completed CPM `Change` operation recorded for `Administrator · WIN-SRV-01` yet.",
        possibleReason: "You have not executed CPM `Change` on `Administrator` (`WIN-SRV-01`).",
        diagnosticAction: "Open CPM Operations → click `Change` on `Administrator · WIN-SRV-01`.",
      });
      criteria.push({
        id: "account_managed",
        label: "`Administrator · WIN-SRV-01` remains in `Managed` status",
        passed: Boolean(isManaged),
        expected: "Account status is `Managed`.",
        observed: `Current status: \`${winAdmin?.status ?? "Unknown"}\`.`,
        possibleReason: isManaged ? undefined : "Credential requires verification or recovery.",
        diagnosticAction: "Confirm `Administrator` shows `Managed` in CPM Operations.",
      });
      if (changeOp) evidence.push(`CPM Change completed: ${changeOp.detail}`);
      break;
    }

    case "lab06a-approval": {
      const passed = state.approvalGranted || state.sessions.length > 0;
      criteria.push({
        id: "dual_control_approval",
        label: "Dual-control approval granted for PSM session",
        passed,
        expected: "`approvalGranted` is true (dual-control approval granted) in PSM Operations.",
        observed: passed
          ? "Dual-control approval is active."
          : "Dual-control approval has not been granted yet.",
        possibleReason: "The approval workflow gate in PSM Operations is still pending.",
        diagnosticAction: "Open PSM Operations and grant Dual-Control Approval.",
      });
      if (passed) evidence.push("Dual-control approval granted in PSM control plane");
      break;
    }

    case "lab06a-launch": {
      const session = state.sessions[0];
      const hasTicket = Boolean(session?.ticket);
      criteria.push({
        id: "session_launched",
        label: "Brokered PSM session launched",
        passed: Boolean(session),
        expected: "At least 1 active or recorded PSM session in `state.sessions`.",
        observed: session
          ? `Session ${session.id} launched for ${session.target} via ${session.component}.`
          : "Zero PSM sessions have been launched yet.",
        possibleReason:
          "Session has not been launched yet (check dual-control approval and ticket field).",
        diagnosticAction:
          "Open PSM Operations, enter ticket `CHG-12345`, and click Launch Session.",
      });
      criteria.push({
        id: "ticket_bound",
        label: "Valid change ticket reference attached",
        passed: hasTicket,
        expected: "Session carries a non-empty change ticket (e.g., `CHG-12345`).",
        observed: session?.ticket
          ? `Ticket attached: \`${session.ticket}\`.`
          : "No ticket reference recorded.",
        possibleReason: hasTicket ? undefined : "Launch a session with a change ticket entered.",
        diagnosticAction: "Enter `CHG-12345` in the Change Ticket field before launching.",
      });
      if (session)
        evidence.push(`PSM session ${session.id} launched (ticket: ${session.ticket || "N/A"})`);
      break;
    }

    case "lab06a-commands": {
      const session = state.sessions[0];
      const cmdCount = session?.commands.length ?? 0;
      const passed = cmdCount >= 2;
      criteria.push({
        id: "session_commands",
        label: "At least 2 audited commands executed in PSM terminal",
        passed,
        expected:
          "At least 2 commands (e.g., `whoami`, `hostname`) recorded in `session.commands`.",
        observed: session
          ? `${cmdCount} command${cmdCount === 1 ? "" : "s"} executed in session ${session.id}.`
          : "No PSM session exists yet.",
        possibleReason: passed
          ? undefined
          : "Run at least 2 commands inside the active PSM session terminal.",
        diagnosticAction:
          "In PSM Operations, type `whoami` and `hostname` inside your active session terminal.",
      });
      if (passed && session)
        evidence.push(`${cmdCount} commands captured in PSM timeline for ${session.id}`);
      break;
    }

    case "lab06a-terminate": {
      const session = state.sessions[0];
      const terminated = Boolean(session && session.status === "Terminated");
      criteria.push({
        id: "session_terminated",
        label: "PSM session cleanly terminated & recording sealed",
        passed: terminated,
        expected: "Active PSM session status transitions to `Terminated`.",
        observed: session
          ? `Session ${session.id} current status: \`${session.status}\`.`
          : "No PSM session found to terminate.",
        possibleReason: terminated ? undefined : "The PSM session is still active/open.",
        diagnosticAction: "In PSM Operations, click `Terminate` (or enter `exit` in the terminal).",
      });
      if (terminated && session)
        evidence.push(`PSM session ${session.id} terminated & audit recording sealed`);
      break;
    }

    case "lab06b-failure-signals": {
      const signalAudit = state.audit.find(
        (a) => a.action.includes("Launch") || a.action.includes("Approval"),
      );
      criteria.push({
        id: "preflight_signal",
        label: "PSM Launch or Approval control-plane event audited",
        passed: Boolean(signalAudit),
        expected: "An audit entry containing `Launch` or `Approval` from PSM Operations.",
        observed: signalAudit
          ? `Observed: ${signalAudit.action} (${signalAudit.result}) — ${signalAudit.detail}`
          : "No PSM Launch or Approval event recorded yet.",
        possibleReason: "No PSM launch check or approval action has been executed yet.",
        diagnosticAction:
          "Open PSM Operations and inspect/trigger the launch preflight or approval control.",
      });
      if (signalAudit) evidence.push(`Audit signal: ${signalAudit.action} (${signalAudit.result})`);
      break;
    }

    case "lab06b-restore-prereqs": {
      const healthy = state.psmConnectorHealthy;
      const approved = state.approvalGranted || state.sessions.length > 0;
      criteria.push({
        id: "connector_healthy",
        label: "PSM Connector health is Healthy",
        passed: healthy,
        expected: "PSM Connector reports Healthy.",
        observed: healthy
          ? "PSM Connector is Healthy."
          : "PSM Connector is currently Degraded/Offline.",
        possibleReason: healthy ? undefined : "PSM Connector outage simulation is active.",
        diagnosticAction: "Restore PSM Connector health in PSM Operations.",
      });
      criteria.push({
        id: "approval_granted",
        label: "Dual-control approval granted",
        passed: approved,
        expected: "Dual-control approval is granted.",
        observed: approved ? "Approval is granted." : "Approval is still pending.",
        possibleReason: approved ? undefined : "Grant dual-control approval in PSM Operations.",
        diagnosticAction: "Click Grant Dual-Control Approval in PSM Operations.",
      });
      if (healthy && approved)
        evidence.push("PSM connector Healthy & dual-control approval Granted");
      break;
    }

    case "lab06b-launch": {
      const hasSession = state.sessions.length > 0;
      criteria.push({
        id: "healthy_session_launched",
        label: "Approved PSM session launched after prerequisite restoration",
        passed: hasSession,
        expected: "At least 1 PSM session established in `state.sessions`.",
        observed: hasSession
          ? `Session ${state.sessions[0]!.id} launched cleanly.`
          : "No PSM session launched yet.",
        possibleReason: hasSession
          ? undefined
          : "Launch a session with ticket `CHG-20412` in PSM Operations.",
        diagnosticAction:
          "Open PSM Operations and launch an approved session with ticket `CHG-20412`.",
      });
      if (hasSession) evidence.push(`Session ${state.sessions[0]!.id} launched cleanly`);
      break;
    }

    case "lab03-account-platform": {
      const winAdmin = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      const isWinLocal = winAdmin?.platform === "Windows Server Local";
      criteria.push({
        id: "account_platform",
        label: "`Administrator · WIN-SRV-01` bound to `Windows Server Local`",
        passed: Boolean(winAdmin && isWinLocal),
        expected: "`Administrator` on `WIN-SRV-01` exists with platform `Windows Server Local`.",
        observed: winAdmin
          ? `Found \`${winAdmin.username}\` on \`${winAdmin.address}\` (Platform: ${winAdmin.platform}).`
          : "Account `Administrator` on `WIN-SRV-01` not found.",
        diagnosticAction: "Inspect `Administrator · WIN-SRV-01` in Accounts Console.",
      });
      if (winAdmin && isWinLocal)
        evidence.push(`Administrator · WIN-SRV-01 mapped to ${winAdmin.platform}`);
      break;
    }

    case "lab03-safe-owner": {
      const winAdmin = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      const ok = winAdmin?.safe === "WIN-SAFE" && winAdmin?.owner === "windows_admin";
      criteria.push({
        id: "safe_and_owner",
        label: "Placed in `WIN-SAFE` with owner `windows_admin`",
        passed: Boolean(ok),
        expected: "Safe = `WIN-SAFE` and Owner = `windows_admin`.",
        observed: winAdmin
          ? `Safe: \`${winAdmin.safe}\`, Owner: \`${winAdmin.owner}\`.`
          : "Account not found.",
        diagnosticAction:
          "Verify `WIN-SAFE` placement and `windows_admin` owner in Accounts Console.",
      });
      if (ok) evidence.push("WIN-SAFE placement and windows_admin ownership confirmed");
      break;
    }

    case "lab03-cpm-verify": {
      const winAdmin = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      const sessionVerify = newCpmOps.find(
        (op) =>
          op.accountId === winAdmin?.id && op.operation === "Verify" && op.result === "Completed",
      );
      const passed = Boolean(sessionVerify && winAdmin?.status === "Managed");
      criteria.push({
        id: "live_cpm_verify",
        label: "Live CPM `Verify` executed during this session on `Administrator · WIN-SRV-01`",
        passed,
        expected:
          "A newly completed CPM `Verify` job for `Administrator · WIN-SRV-01` and status `Managed`.",
        observed: sessionVerify
          ? `Session Verify succeeded (${sessionVerify.detail}); status is ${winAdmin?.status}.`
          : `No new CPM Verify job recorded in this session yet (current CPM ops: ${state.cpmOperations.length}, baseline: ${baseline.cpmOpCount}).`,
        possibleReason:
          "You have not triggered a live CPM `Verify` on `Administrator · WIN-SRV-01` during this lab session.",
        diagnosticAction:
          "Open CPM Operations (or Accounts) and click `Verify` on `Administrator · WIN-SRV-01`.",
      });
      if (passed && sessionVerify)
        evidence.push(`Live CPM Verify completed: ${sessionVerify.detail}`);
      break;
    }

    case "lab04-classify": {
      const classifyObj = objById.get("classify-types");
      const ownersObj = objById.get("accountable-owners");
      criteria.push({
        id: "inventory_classification",
        label: "Account archetypes and 100% ownership verified",
        passed: Boolean(classifyObj?.done && ownersObj?.done),
        expected: "Human, service, database, and shared accounts all carry named owners.",
        observed: `${state.accounts.length} accounts inspected; all owners assigned: ${state.accounts.every((a) => Boolean(a.owner))}.`,
        diagnosticAction: "Inspect account types and owners in Accounts Console.",
      });
      if (classifyObj?.done)
        evidence.push(
          `Classified ${state.accounts.length} enterprise accounts with 100% owner coverage`,
        );
      break;
    }

    case "lab04-exceptions": {
      const oracle = state.accounts.find((a) => a.username === "oracle");
      const svcBackup = state.accounts.find((a) => a.username === "svc_backup");
      criteria.push({
        id: "exception_accounts",
        label: "Unmanaged (`oracle`) and rotation-failed (`svc_backup`) accounts identified",
        passed: Boolean(oracle && svcBackup),
        expected:
          "`oracle` (`DB-ORA-01`) and `svc_backup` (`WIN-SRV-02`) present in inventory triage.",
        observed: `oracle: ${oracle?.status ?? "missing"}, svc_backup: ${svcBackup?.status ?? "missing"}.`,
        diagnosticAction: "Inspect `oracle` and `svc_backup` in Accounts Console.",
      });
      if (oracle && svcBackup)
        evidence.push(
          `Exceptions located: oracle (${oracle.status}), svc_backup (${svcBackup.status})`,
        );
      break;
    }

    case "lab04-discovery-action": {
      const ranScan = state.discoveryJobs.length > baseline.discoveryJobCount;
      const onboarded = state.accounts.length > baseline.accountCount;
      const passed = ranScan || onboarded;
      criteria.push({
        id: "discovery_executed",
        label: "Live Discovery Scan or account onboarding executed",
        passed,
        expected:
          "A new Discovery Scan job (or onboarded account) recorded beyond session baseline.",
        observed: ranScan
          ? `New Discovery scan executed (${state.discoveryJobs.length} total jobs vs. ${baseline.discoveryJobCount} baseline).`
          : onboarded
            ? `New account onboarded (${state.accounts.length} accounts vs. ${baseline.accountCount} baseline).`
            : `No new Discovery scan executed yet (${state.discoveryJobs.length} jobs; baseline: ${baseline.discoveryJobCount}).`,
        possibleReason: "You have not executed a Discovery Scan in the Discovery Console yet.",
        diagnosticAction: "Open Discovery Console and click `Run Discovery Scan`.",
      });
      if (passed)
        evidence.push(`Live Discovery activity recorded (${state.discoveryJobs.length} scan jobs)`);
      break;
    }

    case "lab01-topology": {
      const safesReady = state.safes.length > 0;
      const cpmReady = state.cpmOperations.length > 0;
      const psmReady = state.psmConnectorHealthy;
      criteria.push({
        id: "vault_pvwa_cpm_psm",
        label: "All four PAM components (Vault, PVWA, CPM, PSM) healthy",
        passed: safesReady && cpmReady && psmReady,
        expected: "Digital Vault active with Safes, CPM engine active, PSM connector healthy.",
        observed: `Safes: ${state.safes.length}, CPM ops: ${state.cpmOperations.length}, PSM connector healthy: ${psmReady}.`,
        diagnosticAction: "Inspect Platform Health in Dashboard (Overview) Console.",
      });
      if (safesReady && cpmReady && psmReady) {
        evidence.push(
          `Vault ONLINE (${state.safes.length} Safes), CPM active (${state.cpmOperations.length} ops), PSM connector healthy`,
        );
      }
      break;
    }

    case "lab01-live-trace":
    case "generic-live-action": {
      const hasLiveOperationalAudit = newAuditEvents.some(
        (a) => !a.action.toLowerCase().includes("telemetry preview"),
      );
      const hasNewCpm = state.cpmOperations.length > baseline.cpmOpCount;
      const hasNewSafe = state.safes.length > baseline.safeCount;
      const hasNewAccount = state.accounts.length > baseline.accountCount;
      const hasNewDiscovery = state.discoveryJobs.length > baseline.discoveryJobCount;
      const hasResolvedIncident =
        state.incidents.filter((i) => i.status === "Resolved").length >
        baseline.resolvedIncidentCount;
      const passed =
        hasLiveOperationalAudit ||
        hasNewCpm ||
        hasNewSafe ||
        hasNewAccount ||
        hasNewDiscovery ||
        hasResolvedIncident;

      criteria.push({
        id: "live_control_flow_audit",
        label: "Live operational action recorded in Vault audit trail",
        passed,
        expected:
          "At least one real simulator operation (e.g., CPM Verify, Safe ACL evaluation, Discovery scan, policy update, or incident remediation) logged beyond the session baseline.",
        observed: passed
          ? `Detected ${newAuditEvents.length} new audit event(s): ${newAuditEvents[0]?.action ?? "Operation recorded"} (${newAuditEvents[0]?.target ?? "Simulator"}).`
          : `No live operational action recorded yet (${state.audit.length} audit events; session baseline was ${baseline.auditCount}).`,
        possibleReason:
          "Viewing instructions or clicking Check My Work alone does not execute an operation. Perform a live action in the simulator console first.",
        diagnosticAction:
          "Open CPM Operations and click `Verify` on `Administrator` (`WIN-SRV-01`) or `svc_payment`, or test a Safe permission in Safes Console, then retry Check My Work.",
      });
      if (passed) {
        const latest = newAuditEvents[0];
        evidence.push(
          latest
            ? `Live Audit Proof: ${latest.action} on ${latest.target} (${latest.result})`
            : "Live simulator state change verified",
        );
      }
      break;
    }
  }

  const passed = criteria.length > 0 && criteria.every((c) => c.passed);
  const failedCriteria = criteria.filter((c) => !c.passed);

  return {
    conceptId: concept.id,
    labId: exercise.associatedLabId,
    passed,
    criteria,
    simulatorEvidence: evidence,
    summary: passed
      ? `All ${criteria.length} verification criteria satisfied against live simulator state.`
      : `${failedCriteria.length} of ${criteria.length} verification criteria not yet satisfied: ${failedCriteria.map((c) => c.label).join("; ")}.`,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Deterministic Independent Challenge Validator.
 * Evaluates live final PamState with zero checkboxes and zero self-confirmation.
 */
export function evaluateIndependentChallenge(
  plan: GuidedLabPlan,
  state: PamState,
  exercise: PracticalExercise,
  baseline: SessionBaselineSnapshot,
  guidedConceptAuditFloor: number,
): ConceptValidationResult {
  const challenge = plan.independentChallenge;
  const criteria: ValidationCriterionResult[] = [];
  const evidence: string[] = [];

  switch (challenge.validatorRule) {
    case "ind-safes-new-safe": {
      const baselineNames = new Set(baseline.safeNames);
      const newSafes = state.safes.filter((s) => !baselineNames.has(s.name));
      const labEval = evaluateLabObjectives(state, exercise.associatedLabId);
      const validNaming = newSafes.some((s) => /^[A-Z0-9_-]{3,}$/.test(s.name) && Boolean(s.owner));

      criteria.push({
        id: "new_safe_created",
        label: "New isolated Safe created beyond baseline Safes",
        passed: newSafes.length > 0,
        expected:
          "At least 1 newly created Safe beyond the 7 baseline Safes (e.g., `TREASURY-SAFE`).",
        observed:
          newSafes.length > 0
            ? `Created Safe(s): ${newSafes.map((s) => `${s.name} (owner: ${s.owner})`).join(", ")}.`
            : `Still at ${state.safes.length} baseline Safes; no new Safe created yet.`,
        possibleReason: "No new Safe has been created in the Safes Console yet.",
        diagnosticAction:
          "Open Safes Console and create a new isolated Safe (e.g., `TREASURY-SAFE`).",
      });
      criteria.push({
        id: "naming_and_owner",
        label: "Uppercase hyphenated naming & accountable owner enforced",
        passed: validNaming,
        expected:
          "New Safe uses uppercase naming (e.g., `TREASURY-SAFE`) and has an assigned owner.",
        observed: validNaming
          ? `Safe \`${newSafes[0]!.name}\` follows naming rules with owner \`${newSafes[0]!.owner}\`.`
          : "No newly created Safe satisfies naming and ownership rules yet.",
        diagnosticAction:
          "Create a Safe using uppercase letters/hyphens (e.g., `TREASURY-SAFE`) with an owner.",
      });
      criteria.push({
        id: "no_lab02_regression",
        label: "All DBA-SAFE Lab 02 least-privilege criteria remain intact",
        passed: labEval.completed,
        expected: "Lab 02 score remains 100/100.",
        observed: `Lab 02 live score: ${labEval.score}/100.`,
        diagnosticAction: "Confirm `DBA-SAFE` still enforces least privilege for `dba_user`.",
      });
      if (newSafes.length > 0) {
        evidence.push(`Created isolated Safe: ${newSafes[0]!.name} (owner: ${newSafes[0]!.owner})`);
      }
      break;
    }

    case "ind-cpm-verify-pending": {
      const svcPayment = state.accounts.find((a) => a.username === "svc_payment");
      const pgAdmin = state.accounts.find((a) => a.username === "postgres_admin");
      const pendingVerified = svcPayment?.status === "Managed" || pgAdmin?.status === "Managed";
      const labEval = evaluateLabObjectives(state, exercise.associatedLabId);

      criteria.push({
        id: "pending_account_verified",
        label:
          "A `Verify required` account (`svc_payment` or `postgres_admin`) verified to `Managed`",
        passed: pendingVerified,
        expected:
          "`svc_payment` (`APP-PAY-01`) or `postgres_admin` (`DB-PG-01`) transitions to `Managed`.",
        observed: `svc_payment: \`${svcPayment?.status ?? "N/A"}\`, postgres_admin: \`${pgAdmin?.status ?? "N/A"}\`.`,
        possibleReason: "Neither `svc_payment` nor `postgres_admin` has been verified via CPM yet.",
        diagnosticAction:
          "Open CPM Operations and run `Verify` on `svc_payment` (`APP-PAY-01`) or `postgres_admin`.",
      });
      criteria.push({
        id: "primary_lab_intact",
        label: "Primary CPM lab objectives remain 100% verified",
        passed: labEval.completed,
        expected: "Primary CPM lab score remains 100/100.",
        observed: `Live lab score: ${labEval.score}/100.`,
        diagnosticAction: "Confirm primary lab accounts remain in `Managed` state.",
      });
      if (pendingVerified) {
        const target = svcPayment?.status === "Managed" ? "svc_payment" : "postgres_admin";
        evidence.push(`Independent CPM Verify succeeded: ${target} is now Managed`);
      }
      break;
    }

    case "ind-psm-second-session": {
      const terminatedWithCommands = state.sessions.filter(
        (s) => s.status === "Terminated" && s.commands.length >= 1,
      );
      const isLab06B = plan.labId.includes("Lab 06B");
      const requiredTerminated = isLab06B ? 1 : 2;
      const passedCount = terminatedWithCommands.length >= requiredTerminated;

      criteria.push({
        id: "independent_psm_session",
        label: isLab06B
          ? "PSM session executed with ≥1 command and cleanly terminated"
          : "Second independent PSM session executed with ≥1 command and cleanly terminated",
        passed: passedCount,
        expected: `At least ${requiredTerminated} terminated PSM session(s) with audited command execution.`,
        observed: `${terminatedWithCommands.length} terminated session(s) with commands found (${state.sessions.length} total sessions).`,
        possibleReason: isLab06B
          ? "Execute a command in the session and terminate it cleanly."
          : "Launch a second approved PSM session, run at least 1 command, and terminate it.",
        diagnosticAction:
          "Open PSM Operations, launch a ticketed session (or use current session for Lab 06B), run `whoami`, and click `Terminate`.",
      });
      if (passedCount) {
        evidence.push(
          `${terminatedWithCommands.length} audited & terminated PSM session(s) sealed in forensic archive`,
        );
      }
      break;
    }

    case "ind-accounts-onboard":
    case "ind-discovery-onboard": {
      const onboardedNew = state.accounts.length > baseline.accountCount;
      const discoveredOnboarded = state.discoveredAccounts.some((d) => d.status === "Onboarded");
      const passed = onboardedNew || discoveredOnboarded;
      criteria.push({
        id: "new_account_onboarded",
        label: "New privileged account onboarded into Vault inventory",
        passed,
        expected: "Account count exceeds baseline or a discovered account status is `Onboarded`.",
        observed: `Inventory count: ${state.accounts.length} (baseline: ${baseline.accountCount}); discovered onboarded: ${discoveredOnboarded}.`,
        possibleReason: "No new account has been onboarded from Accounts or Discovery yet.",
        diagnosticAction:
          challenge.validatorRule === "ind-discovery-onboard"
            ? "Open Discovery Console and onboard an `Unmanaged` discovered account."
            : "Open Accounts Console and onboard a new privileged account into an existing Safe.",
      });
      if (passed) {
        evidence.push(
          `Inventory grew from ${baseline.accountCount} to ${state.accounts.length} vaulted accounts`,
        );
      }
      break;
    }

    case "ind-audit-live-proof": {
      const svcPayment = state.accounts.find((a) => a.username === "svc_payment");
      const pgAdmin = state.accounts.find((a) => a.username === "postgres_admin");
      const verifiedPending = svcPayment?.status === "Managed" || pgAdmin?.status === "Managed";
      const additionalRealAudit = state.audit.length > guidedConceptAuditFloor;
      const newSafe = state.safes.length > baseline.safeCount;
      const newAccount = state.accounts.length > baseline.accountCount;
      const passed = verifiedPending || additionalRealAudit || newSafe || newAccount;

      criteria.push({
        id: "independent_operational_proof",
        label: "Independent governance operation verified in live simulator",
        passed,
        expected:
          "Bring `svc_payment` or `postgres_admin` to `Managed`, create a new Safe, onboard an account, or record a fresh operational audit action beyond guided concepts.",
        observed: passed
          ? `Verified live operational change (audit count: ${state.audit.length}, svc_payment: ${svcPayment?.status ?? "N/A"}, postgres_admin: ${pgAdmin?.status ?? "N/A"}).`
          : `No additional operational change detected since completing guided concepts (audit count still ${state.audit.length}).`,
        possibleReason:
          "Execute one independent operational action in CPM Operations, Safes, Accounts, or Discovery.",
        diagnosticAction:
          "Open CPM Operations and run `Verify` on `svc_payment` (`APP-PAY-01`) or `postgres_admin` (`DB-PG-01`), then re-check.",
      });
      if (passed) {
        evidence.push(
          verifiedPending
            ? `Independent verification brought ${svcPayment?.status === "Managed" ? "svc_payment" : "postgres_admin"} to Managed`
            : `Independent operational audit recorded (${state.audit[0]?.action ?? "Action"})`,
        );
      }
      break;
    }
  }

  const passed = criteria.length > 0 && criteria.every((c) => c.passed);
  const failed = criteria.filter((c) => !c.passed);
  return {
    conceptId: challenge.id,
    labId: exercise.associatedLabId,
    passed,
    criteria,
    simulatorEvidence: evidence,
    summary: passed
      ? `Independent Challenge passed! All ${criteria.length} criteria verified against live simulator state.`
      : `Independent Challenge not yet verified (${failed.length} requirement${failed.length === 1 ? "" : "s"} remaining): ${failed.map((f) => f.label).join("; ")}.`,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Strict progression gate: a concept unlocks the next concept ONLY when
 * deterministic validation has passed for that concept.
 */
export function canAdvanceFromConcept(session: GuidedLabSessionState, conceptId: string): boolean {
  const result = session.validationResults[conceptId];
  return Boolean(result?.passed && session.completedConceptIds.includes(conceptId));
}

export function generateCompetencyReport(
  plan: GuidedLabPlan,
  session: GuidedLabSessionState,
  state: PamState,
): PracticalCompetencyReport {
  const criteriaPassed: string[] = [];
  let criteriaTotal = 0;

  for (const concept of plan.concepts) {
    const res = session.validationResults[concept.id];
    if (res) {
      criteriaTotal += res.criteria.length;
      for (const c of res.criteria) {
        if (c.passed) criteriaPassed.push(`${concept.title}: ${c.label}`);
      }
    }
  }
  if (session.independentValidation) {
    criteriaTotal += session.independentValidation.criteria.length;
    for (const c of session.independentValidation.criteria) {
      if (c.passed) criteriaPassed.push(`Independent Challenge: ${c.label}`);
    }
  }

  const mistakesEncountered: string[] = [];
  for (const concept of plan.concepts) {
    const m = session.mistakesByConcept[concept.id] || [];
    for (const item of m) {
      mistakesEncountered.push(`${concept.title} — ${item}`);
    }
  }
  for (const m of session.independentMistakes) {
    mistakesEncountered.push(`Independent Challenge — ${m}`);
  }

  const hintLevelsUsed: Record<string, HintLevel> = {};
  let highestHintLevel: HintLevel = 0;
  for (const concept of plan.concepts) {
    const lvl = session.hintLevelsRequested[concept.id] || 0;
    hintLevelsUsed[concept.title] = lvl;
    if (lvl > highestHintLevel) highestHintLevel = lvl;
  }
  hintLevelsUsed["Independent Challenge"] = session.independentHintLevel;
  if (session.independentHintLevel > highestHintLevel) {
    highestHintLevel = session.independentHintLevel;
  }

  const newAuditCount = Math.max(0, state.audit.length - session.baseline.auditCount);
  const operationsPerformed = state.audit
    .slice(0, Math.min(8, Math.max(newAuditCount, 3)))
    .map((a) => `${a.action} on ${a.target} (${a.result})`);

  const areasRequiringImprovement: string[] = [];
  for (const concept of plan.concepts) {
    const attempts = session.attemptCounts[concept.id] || 0;
    const hintLvl = session.hintLevelsRequested[concept.id] || 0;
    if (attempts > 1 || hintLvl >= 3) {
      areasRequiringImprovement.push(
        `Reinforce ${concept.skillTag} (${attempts} check attempt${attempts === 1 ? "" : "s"}, hint level ${hintLvl}/4).`,
      );
    }
  }
  if (session.independentAttempts > 1 || session.independentHintLevel >= 3) {
    areasRequiringImprovement.push(
      `Practice independent execution without procedure prompts (${session.independentAttempts} attempt${session.independentAttempts === 1 ? "" : "s"}).`,
    );
  }
  if (areasRequiringImprovement.length === 0) {
    areasRequiringImprovement.push(
      "Strong first-pass operational accuracy. Continue reinforcing cross-console troubleshooting speed.",
    );
  }

  return {
    taskAccomplished: `${plan.title} (${plan.concepts.length} guided concepts + Independent Challenge verified)`,
    criteriaPassed,
    criteriaTotal: Math.max(criteriaTotal, criteriaPassed.length),
    mistakesEncountered,
    hintLevelsUsed,
    highestHintLevel,
    operationsPerformed,
    areasRequiringImprovement,
    recommendedNextSkill: plan.recommendedNextSkill,
    completedAt: new Date().toISOString(),
  };
}
