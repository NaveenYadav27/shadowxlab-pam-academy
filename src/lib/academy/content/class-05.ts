/**
 * SHADOWXLAB PAM ACADEMY — CLASS 05: CENTRAL POLICY MANAGER (CPM) OPERATIONS
 * Deep instructional content covering CPM architecture, the 3-state lifecycle
 * (VERIFY vs CHANGE vs RECONCILE), error taxonomy, and automated recovery runbooks.
 */

import type { ClassCurriculum } from "../types";

export const CLASS_05: ClassCurriculum = {
  id: "class-05",
  number: "05",
  label: "CLASS 05",
  title: "Central Policy Manager (CPM) Operations & Lifecycle",
  subtitle: "The Three-State Lifecycle: Verify, Change, Reconcile & Automated Error Recovery",
  duration: "2H 00M",
  level: "Professional",
  overview:
    "Master the operational engine of CyberArk: Central Policy Manager (CPM). Deep-dive into automated credential verification, periodic password change cycles, emergency reconciliation with high-privilege administrative accounts, and triaging CACPM error codes.",
  modules: [
    {
      id: "c05-m01",
      number: "M1",
      title: "The Three-State Credential Lifecycle: Verify vs Change vs Reconcile",
      description:
        "Understand the mechanical execution of Verification, Password Change, and Emergency Reconciliation across Windows, Linux, and database targets.",
      lessons: [
        {
          id: "c05-m01-l01",
          number: "5.1",
          title: "Mechanics of the Three-State Credential Lifecycle",
          subtitle: "Verify, Change, and Reconcile: Protocols, Handshakes, and Failure Taxonomy",
          estimatedMinutes: 25,
          learningObjectives: [
            "Explain the technical difference between CPM Verify, Change, and Reconcile operations.",
            "Trace the exact network handshake executed during password rotation on Windows and Unix targets.",
            "Deploy a dedicated Reconcile Account to forcibly restore synchronization when passwords diverge.",
          ],
          prerequisites: [
            "Completion of Classes 01 through 04.",
            "Understanding of target RPC and SSH authentication.",
          ],
          conceptIntroduction:
            "Central Policy Manager (CPM) is the automated worker engine of CyberArk PAS. It periodically polls the Digital Vault for accounts requiring action and connects directly to remote operating systems, databases, and APIs. The CPM lifecycle is governed by three fundamental operations: VERIFY (testing synchronization without modifying the target), CHANGE (generating a new secret and updating both target and Vault), and RECONCILE (using an independent privileged account to forcibly reset a broken target password).",
          whyItExists:
            "In production environments, credentials frequently drift out of synchronization: an engineer might manually change a root password on a server console during an emergency, a target server might suffer a network disconnect during a rotation, or an account might become locked due to automated scripts. Without a deterministic 3-state lifecycle, administrators would have to manually log into thousands of servers to fix broken passwords.",
          architecture: {
            overview:
              "CPM executes plug-in DLLs or terminal scripts (Terminal Plugin Controller / TPC) to communicate with targets. State transitions are tracked in the Vault database and reported to PVWA.",
            diagramAscii: `
======================== CPM THREE-STATE LIFECYCLE ========================

[ 1. VERIFY ]
  Vault Secret  ─────────────────► Target Authentication Test ──► MATCH: Status = OK
  (Read-Only Test)                                             ──► MISMATCH: Status = Verify Failed

[ 2. CHANGE ]
  Current Secret ────────────────► Logs into Target System
  Generates New Pass             ► Updates Password on Target Host
  Target Confirms OK             ► Writes New Password to Vault
                                 ► Complete: Old secret moved to history

[ 3. RECONCILE (Emergency Synchronization Restoration) ]
  When Vault Secret != Target Secret (Target rejects current password):
  
  CPM retrieves linked RECONCILE ACCOUNT (e.g. Domain Admin or Local Admin)
        │
        ▼ (Logs into Target using Reconcile Account)
  [ TARGET HOST / ACTIVE DIRECTORY ]
        │
        ▼ (Executes Administrative Force Reset without needing old password)
  net user <username> <new_random_password> /domain
        │
        ▼
  Target confirms reset OK ─────► CPM writes new password to Vault ──► SYNC RESTORED!
`,
            componentResponsibilities: [
              {
                component: "CPM Engine",
                role: "Polls Vault every interval (default 60s) for accounts flagged with ImmediateTask or due for rotation.",
                securityBoundary:
                  "Executes in hardened security context; memory cleared immediately after rotation.",
              },
              {
                component: "Reconcile Account",
                role: "High-privilege account linked to target account capable of administrative password resets.",
                securityBoundary:
                  "Restricted to emergency reconciliation; never exposed to interactive operators.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "CPM Service",
                action:
                  "Picks up account flagged for 'Verify'. Logs into target over SMB 445 / SSH 22 using vaulted password.",
                channelOrProtocol: "SMB/RPC or SSH",
                verificationRule:
                  "If login succeeds, Vault audit records 'Password Verified Successfully'.",
              },
              {
                stepNumber: 2,
                actor: "CPM Service",
                action:
                  "If login fails (e.g. status 'Verify required'), CPM triggers automated or manual Reconciliation.",
                channelOrProtocol: "Target Protocol via Reconcile Account",
                verificationRule:
                  "CPM retrieves linked Reconcile Account, authenticates to target, and forcibly overwrites secret.",
              },
            ],
          },
          terminology: [
            {
              term: "Verify",
              definition:
                "A read-only validation check performed by CPM that attempts to authenticate against the target host using the current vaulted password without altering it.",
              enterpriseContext:
                "Guarantees that the Vault record matches reality before an operator checks out the credential.",
            },
            {
              term: "Change",
              definition:
                "A standard rotation operation where CPM logs in using the current known password, generates a new randomized secret meeting policy complexity, updates the target, and stores the new secret in the Vault.",
              enterpriseContext:
                "Executed periodically (e.g. every 30, 60, or 90 days) or immediately upon session checkout (One-Time Password).",
            },
            {
              term: "Reconcile",
              definition:
                "An administrative recovery operation used when the Vault and target passwords are out of sync. CPM logs into the target using an independent Reconcile Account and resets the target password without needing the current invalid password.",
              enterpriseContext:
                "The ultimate recovery tool for resolving desynchronization incidents across enterprise fleets.",
            },
          ],
          administratorResponsibilities: [
            "Review the PVWA 'CPM Operations' console daily to identify and remediate rotation exceptions.",
            "Ensure every onboarded account is linked to an authorized, functional Reconcile Account.",
            "Triage CACPM error codes and coordinate with target network/system owners to resolve connectivity blocks.",
          ],
          configurationAndAdministration: [
            {
              name: "PerformPeriodicChange Parameter",
              settingOrObject: "Platform Policy > Automatic Password Management",
              description:
                "Enables automated rotation and defines interval in days (e.g. 30 days).",
              productionBestPractice:
                "Set PerformPeriodicChange=Yes and HeadStartInterval=5 days to avoid sudden mass expirations.",
            },
            {
              name: "Reconcile Account Linking",
              settingOrObject: "Account Object > Additional Details > Reconcile Account",
              description:
                "Associates the specific administrative credential authorized to reset this target account.",
              productionBestPractice:
                "Link Domain Admin reconcile accounts to domain members and root reconcile accounts to Linux nodes.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Triggering Credential Verification",
              action:
                "Select target account in Accounts or CPM console, click 'Verify' on the toolbar, and confirm prompt.",
              expectedResult:
                "CPM queue receives task, executes target handshake, and updates status to 'Managed (Verified)'.",
            },
            {
              stepNumber: 2,
              title: "Triggering Emergency Reconcile",
              action:
                "When an account shows 'Rotation failed' or 'Verify required', click 'Reconcile' on the toolbar.",
              expectedResult:
                "CPM executes Reconcile Account reset and brings the credential back into synchronized compliance.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "On server WIN-SRV-02, an infrastructure technician manually changed the local Administrator password during emergency maintenance without updating CyberArk. The account subsequently failed CPM verification with 'Logon failure' and was locked out.",
            governanceRequirements: [
              "Immediate reconciliation via Domain Reconcile Account.",
              "Enforce policy prohibiting manual password changes on managed target hosts.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "CPM displays 'CACPM250E Failed to perform reconcile: Target account is locked out'.",
              rootCause:
                "Excessive failed logon attempts caused the Windows SAM or AD lockout policy to trigger.",
              securityImpact:
                "Neither standard rotation nor reconcile can succeed until the target lockout expires or is cleared by a domain admin.",
            },
            {
              symptom:
                "CPM displays 'CACPM072E Network path was not found' during Change operation.",
              rootCause: "Target server firewall blocking TCP 445 / 135 or target server offline.",
              securityImpact:
                "Password rotation aborts safely without corrupting the Vault record.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Check target connectivity from CPM host using 'Test-NetConnection -Port 445 <TargetAddress>'.",
              logFileOrConsole: "PowerShell console on CPM server.",
              remediation:
                "Open port 445/135 on target Windows firewall to permit CPM RPC communication.",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Examine C:\\Program Files (x86)\\CyberArk\\Password Manager\\Logs\\pm.log for the exact error code.",
              logFileOrConsole: "pm.log / pm_error.log",
              remediation:
                "Match error code against CyberArk error database (e.g. CACPM068E = bad password, CACPM072E = network unreachable).",
            },
          ],
          securityImplications: [
            "Reconcile accounts must be heavily guarded because they possess the capability to reset all target passwords in their scope.",
          ],
          knowledgeCheck: [
            {
              id: "c05-m01-q01",
              question:
                "When a target system password has been manually changed outside of CyberArk and no longer matches the Vault, which CPM operation can restore synchronization without knowing the new password?",
              options: ["Verify", "Change", "Reconcile", "Discovery"],
              correctIndex: 2,
              explanation:
                "Reconcile uses an independent administrative account (the Reconcile Account) to forcibly overwrite the target password with a new random secret, restoring Vault-target synchronization without needing the unknown current password.",
              conceptTested: "CPM Reconcile Operation",
            },
            {
              id: "c05-m01-q02",
              question:
                "Why does CPM execute Verify before attempting a Password Change operation?",
              options: [
                "To ensure the Vault has internet access.",
                "To confirm that the current vaulted password is valid on the target before attempting to authenticate and update it.",
                "To reboot the target server.",
                "To send an email notification to the target user.",
              ],
              correctIndex: 1,
              explanation:
                "Standard Password Change requires authenticating to the target using the existing password. If CPM does not verify current validity first, the Change attempt could fail or lock out the account.",
              conceptTested: "Password Change Prerequisites",
            },
          ],
          practicalExercise: {
            id: "ex-c05-01",
            title: "Verify Credential Status & Reconcile Desynchronized Account",
            scenario:
              "Navigate to the CPM Operations console. Identify account Administrator on WIN-SRV-01, trigger Verify to test connectivity, then select the failed account on WIN-SRV-02 and execute Reconcile to restore operational compliance.",
            instructions: [
              "Navigate to CPM Operations console in PVWA.",
              "Select account Administrator on WIN-SRV-01 and click 'Verify'.",
              "Select the out-of-sync account (svc_backup or WIN-SRV-02) and click 'Reconcile'.",
              "Open Learning Academy Class 05 and validate completion of Lab 05A and Lab 05B.",
            ],
            targetConsole: "cpm",
            associatedLabId: "Lab 05A · Verify credential status",
            validationObjectiveId: "id-verify",
            validationCriteria: "CPM Verify operation executed and recorded in audit log.",
          },
          completionCriteria: [
            "Articulated the distinct mechanisms of Verify, Change, and Reconcile.",
            "Successfully performed simulated Verify and Reconcile tasks in the CPM console.",
          ],
          references: [
            "CyberArk Central Policy Manager User & Implementation Guide",
            "CyberArk CACPM Error Code Reference",
          ],
        },
      ],
    },
  ],
};
