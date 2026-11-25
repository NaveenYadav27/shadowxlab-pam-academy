/**
 * MODULE 07 — PASSWORD MANAGEMENT AND ROTATION
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 3 Hours | Day: 3 | Domain: Account Onboarding and Password Management (25%)
 * Practicals: Review a sample password management policy; analyze a simulated verification or rotation failure.
 * Learning Outcome: Explain password management workflows and recognize common failure types.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_07: ClassCurriculum = {
  id: "client-m07",
  number: "07",
  label: "MODULE 07",
  title: "Password Management and Rotation",
  subtitle: "CPM Operations (Verify, Change, Reconcile), Rotation Policies & Failure Diagnostics",
  duration: "3 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Account Onboarding and Password Management",
  overview:
    "Master the core operational engine of CyberArk credential lifecycle management. Explores the three foundational Central Policy Manager (CPM) operations: Verify, Change, and Reconcile. Covers password complexity rules, rotation intervals, Master Policy enforcement, reconciliation mechanics, and diagnosing common CPM failures including connectivity drops, bad credentials, and CACPM072E errors.",
  modules: [
    {
      id: "cm07-core",
      number: "M07",
      title: "Password Management and Rotation",
      description:
        "CPM fundamentals, password lifecycle operations, policy configuration, and error diagnostics.",
      lessons: [
        {
          id: "cm07-l01",
          number: "7.1",
          title: "CPM Operations, Password Lifecycle & Failure Analysis",
          subtitle:
            "Verify vs Change vs Reconcile, Rotation Governance, Policy Review & CACPM072E Recovery",
          estimatedMinutes: 180,
          learningObjectives: [
            "Explain password management workflows and recognize common failure types.",
            "Differentiate clearly between the three core CPM operations: Verify, Change, and Reconcile.",
            "Describe the internal CPM workflow when rotating credentials on a target endpoint.",
            "Review a sample password management policy specifying rotation frequency, min/max length, and character constraints.",
            "Analyze simulated verification and rotation failures and isolate root causes (connectivity, lockouts, wrong password).",
            "Explain the role of Reconcile Accounts in automatically recovering out-of-sync credentials without manual admin intervention.",
            "Execute simulated CPM operations and resolve credential failures in the interactive simulator.",
          ],
          prerequisites: [
            "Completion of Module 01 through Module 06.",
            "Basic understanding of operating system password authentication mechanisms.",
          ],
          conceptIntroduction:
            "Automated credential management is the heartbeat of Privileged Access Management. Static passwords that remain unchanged for months or years represent an open invitation to attackers. CyberArk's Central Policy Manager (CPM) is an autonomous daemon that continuously manages passwords through three fundamental operations: (1) Verify (tests whether the Vault's stored password matches the target), (2) Change (logs into the target with the current password and sets a new random password), and (3) Reconcile (uses an independent, elevated administrative account to reset a broken or unknown password). Together, these operations guarantee that enterprise passwords stay synchronized, randomized, and compliant with corporate policy.",
          whyItExists:
            "Manual password changes are practically impossible across thousands of servers, resulting in administrative fatigue, delayed rotations, and human errors. Furthermore, when an administrator leaves an organization, manual rotation is frequently overlooked, leaving dormant credentials active. CPM automates this lifecycle entirely, generating cryptographically complex passwords that no human ever sees or memorizes.",
          architecture: {
            overview:
              "The CPM operates on an autonomous polling cycle. It queries the Vault over TCP 1858 for accounts requiring verification, change, or reconciliation. When an operation is due, CPM connects directly to the target system over native management ports (SMB TCP 445, SSH TCP 22, Oracle SQL 1521), executes the operation, updates the Vault with the new credential, and seals the audit record.",
            componentResponsibilities: [
              {
                component: "Central Policy Manager (CPM)",
                role: "Autonomous service executing Verify, Change, and Reconcile operations against target endpoints.",
                networkProtocols:
                  "TCP 1858 to Vault; Native management protocols to target systems",
                securityBoundary: "Management network; elevated execution rights on targets.",
              },
              {
                component: "Digital Vault",
                role: "Stores past and current password versions, generates random passwords, and maintains audit trails.",
                networkProtocols: "TCP 1858 (Vault Protocol)",
                securityBoundary: "Encrypted Safe boundary.",
              },
              {
                component: "Target System (SAM / Shadow / DB)",
                role: "The remote endpoint where the credential is authenticated or updated by the CPM.",
                networkProtocols: "SMB (445), SSH (22), SQL (1433/1521)",
                securityBoundary: "Target endpoint authentication subsystem.",
              },
              {
                component: "Reconcile Account",
                role: "A dedicated administrative account linked to the target account, used to reset passwords when out-of-sync.",
                securityBoundary: "Elevated reset entitlement (e.g., Domain Admin or root).",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "CPM Polling Loop",
                action:
                  "Scans Safes and identifies an account scheduled for password rotation (e.g. 30 days elapsed).",
                channelOrProtocol: "TCP 1858 to Vault",
                verificationRule:
                  "Master Policy rule 'Require password change every X days' evaluated.",
              },
              {
                stepNumber: 2,
                actor: "CPM Service",
                action:
                  "Connects to target system using current vaulted password and executes change command.",
                channelOrProtocol: "Native Port (e.g. SMB 445)",
                verificationRule:
                  "Target system accepts current credentials and validates new password against complexity policy.",
              },
              {
                stepNumber: 3,
                actor: "Target System",
                action: "Commits new password to local SAM database or /etc/shadow.",
                channelOrProtocol: "Target OS Kernel",
                verificationRule: "Success code returned to CPM.",
              },
              {
                stepNumber: 4,
                actor: "CPM -> Vault",
                action:
                  "Updates the account object in the Vault with the new password and archives the previous version.",
                channelOrProtocol: "TCP 1858",
                verificationRule: "New password encrypted in Safe; version history incremented.",
              },
              {
                stepNumber: 5,
                actor: "CPM (Post-Verification)",
                action:
                  "Optionally tests immediate login with the new password to confirm synchronization.",
                channelOrProtocol: "Native Target Port",
                verificationRule: "Account state marked 'Verified' in PVWA.",
              },
            ],
          },
          terminology: [
            {
              term: "Verify (CPM Operation)",
              definition:
                "A non-destructive test where CPM logs into the target system using the stored password to confirm it is valid.",
              enterpriseContext:
                "Ensures the Vault and target are synchronized without changing the password.",
            },
            {
              term: "Change (CPM Operation)",
              definition:
                "A standard rotation where CPM authenticates with the current password and changes it to a new cryptographically random value.",
              enterpriseContext:
                "The normal lifecycle operation executed periodically (e.g. every 30 or 90 days).",
            },
            {
              term: "Reconcile (CPM Operation)",
              definition:
                "An administrative reset where CPM uses a separate, elevated Reconcile Account to forcibly overwrite the target password when the current password is unknown or out-of-sync.",
              enterpriseContext:
                "The automated recovery mechanism that resolves 'Access Denied' or locked out accounts.",
            },
            {
              term: "Master Policy",
              definition:
                "The global governance baseline in CyberArk that mandates baseline security rules (e.g., 'Require password change every 30 days').",
              enterpriseContext:
                "Enforces universal security standards across all onboarded platforms.",
            },
            {
              term: "CACPM072E",
              definition:
                "The most common CyberArk CPM error code indicating that the CPM failed to connect to or authenticate with the target machine.",
              enterpriseContext:
                "Typically caused by firewall blockage, target server offline, or invalid credentials.",
            },
          ],
          administratorResponsibilities: [
            "Monitor the CPM Operations console daily for accounts flagged with failed verification or change status.",
            "Configure Reconcile Accounts on all managed platforms to enable automated recovery from desynchronization.",
            "Align password complexity rules with enterprise policy without exceeding target OS maximum length constraints.",
            "Investigate and remediate root causes of CACPM072E errors.",
          ],
          configurationAndAdministration: [
            {
              name: "Password Policy Settings",
              settingOrObject: "Platform Settings -> Automatic Password Management",
              description:
                "Configures: MinLength (e.g. 16), MaxLength (e.g. 32), MinUpper, MinLower, MinDigit, MinSpecial, and ExcludedCharacters.",
              productionBestPractice:
                "Enforce a minimum length of 20 characters for privileged server accounts.",
            },
            {
              name: "Reconcile Account Association",
              settingOrObject: "Account Object -> Linked Accounts -> Reconcile",
              description:
                "Links a domain or root account capable of resetting passwords for this specific account.",
              productionBestPractice:
                "Link a dedicated reconcile account to every operational server account.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Policy Review and Inspection",
              action:
                "Navigate to Password Policies console and inspect the active policy parameters.",
              expectedResult:
                "Verify complexity rules, rotation interval (30 days), and notification thresholds.",
            },
            {
              stepNumber: 2,
              title: "Manual Verification Execution",
              action: "In CPM Operations console, select target account and trigger 'Verify'.",
              expectedResult: "Operation queues; CPM status returns Success / Verified.",
            },
            {
              stepNumber: 3,
              title: "Reconciliation and Failure Recovery",
              action:
                "When an account fails verification (desynchronized), unlock the account and trigger 'Reconcile'.",
              expectedResult:
                "Reconcile account resets target credential; status returns to Verified.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "The privileged service account 'svc_backup' on server 'WIN-SRV-02' experienced an unexpected password change during an offline disaster recovery exercise. The Vault's stored password no longer matches the target machine, causing CPM verification to fail with error CACPM072E and locking the account.",
            governanceRequirements: [
              "Unlock svc_backup and reconcile the credential using the authorized reconcile account.",
              "Trigger an immediate password change and verify the new credential.",
              "Confirm that the account is restored to 100% operational health in the CPM console.",
            ],
          },
          failureScenarios: [
            {
              symptom: "CPM displays 'CACPM072E Connection to target failed' on svc_backup.",
              rootCause:
                "Target server password was changed out-of-band, leaving Vault credentials desynchronized.",
              securityImpact: "Automated backups fail; credential unusable.",
              cyberArkCodeOrEvent: "CACPM072E",
            },
            {
              symptom: "CPM Change operation fails with 'Account is locked by CPM'.",
              rootCause:
                "A previous CPM operation failed mid-execution, leaving the account object locked to prevent concurrency conflicts.",
              securityImpact:
                "No further rotations can execute until an administrator unlocks the account.",
              cyberArkCodeOrEvent: "CACPM163E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Inspect the account status in CPM Operations console to determine lock and sync state.",
              logFileOrConsole: "PVWA -> CPM Operations -> svc_backup",
              remediation:
                "If account is locked, click 'Unlock Account' to release the CPM operational lock.",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Execute Reconcile operation using the linked administrative reconcile account.",
              logFileOrConsole: "CPM Operations -> Click 'Reconcile'",
              remediation:
                "Reconcile account connects to target, overrides password, and saves new secret to Vault.",
            },
            {
              stepNumber: 3,
              diagnosticAction:
                "Execute Change followed by Verify to confirm end-to-end operational health.",
              logFileOrConsole: "CPM Operations -> Click 'Change' then 'Verify'",
              remediation: "Verify state displays green checkmark; audit record sealed.",
            },
          ],
          securityImplications: [
            "Accounts that remain in a failed CPM state for extended periods accumulate stale passwords, increasing breach risk.",
            "Failing to configure Reconcile Accounts forces administrators to manually reset passwords on endpoints, exposing credentials.",
            "Excessively lax password complexity rules on platforms allow brute-force cracking if hashes are leaked.",
          ],
          knowledgeCheck: [
            {
              id: "cm07-q01",
              question:
                "What is the key difference between a CPM 'Change' operation and a CPM 'Reconcile' operation?",
              options: [
                "Change creates a new account; Reconcile deletes an old account.",
                "Change authenticates with the current password to set a new one; Reconcile uses an independent elevated account to reset the password when the current password is unknown or broken.",
                "Change runs on Windows; Reconcile runs exclusively on Linux.",
                "Change requires Vault restart; Reconcile runs entirely inside the user's web browser.",
              ],
              correctIndex: 1,
              explanation:
                "CPM 'Change' requires knowledge of the current valid password to authenticate and set a new one. When a password falls out-of-sync or is unknown, 'Reconcile' uses a linked administrative account (such as root or Domain Admin) to overwrite the target credential forcibly.",
              conceptTested: "Change vs Reconcile Mechanics",
            },
            {
              id: "cm07-q02",
              question:
                "If an account in PVWA shows 'Locked by CPM' after a failed password rotation, what must an administrator do before any further rotation operations can proceed?",
              options: [
                "Reboot the Digital Vault server.",
                "Unlock the account in the CPM console or Account Details view.",
                "Delete the account and recreate it with a new name.",
                "Uninstall and reinstall the CPM service on the connector host.",
              ],
              correctIndex: 1,
              explanation:
                "When a CPM operation fails mid-execution, CyberArk locks the account object to prevent conflicting operations. An administrator must review the error, unlock the account, and proceed with remediation (such as Reconcile).",
              conceptTested: "Account Unlock & Concurrency Protection",
            },
            {
              id: "cm07-q03",
              question:
                "Which CyberArk error code is most commonly associated with CPM connection or authentication failures against target endpoints (e.g. firewall blocking ports or bad credentials)?",
              options: ["CACPM072E", "ITATS006E", "PSMSR037E", "CASGS001E"],
              correctIndex: 0,
              explanation:
                "CACPM072E is the hallmark CPM error indicating a failure connecting to or authenticating against a target machine during password verification or change.",
              conceptTested: "CPM Error Code Diagnostics",
            },
          ],
          practicalExercise: {
            id: "cm07-ex01",
            title: "CPM Lifecycle Operations, Policy Enforcement & Failure Diagnostics",
            objective:
              "Review password policy settings, trigger CPM lifecycle operations, and remediate an out-of-sync credential failure.",
            scenario:
              "Navigate to CPM Operations console to review the password management policy. Identify locked service account 'svc_backup' on WIN-SRV-02, unlock it, execute a Reconcile operation to recover synchronization, trigger a Change operation, and verify the final credential.",
            prerequisites: ["Completion of Module 01-06"],
            startingState:
              "Locked service account svc_backup with CACPM072E failure in CPM console.",
            instructions: [
              "Navigate to Password Policies console and review the password complexity rules and rotation intervals.",
              "Switch to CPM Operations console and locate account 'svc_backup' on WIN-SRV-02.",
              "Observe the error status (Locked by CPM / CACPM072E).",
              "Click 'Unlock Account' to clear the lock.",
              "Click 'Reconcile' to reset the credential using the linked reconcile account.",
              "Click 'Change' to rotate to a fresh random password.",
              "Click 'Verify' to confirm live synchronization.",
              "Run the simulator validation to confirm 5/5 objectives passed.",
            ],
            stepDetails: [
              {
                action: "Review Password Policy",
                explanation:
                  "Inspect rotation schedule, minimum length, and complexity constraints.",
                expectedResult: "Policy rules reviewed.",
              },
              {
                action: "Unlock svc_backup Account",
                explanation: "Release the CPM lock in the CPM console.",
                expectedResult: "Account unlocked.",
              },
              {
                action: "Reconcile, Change, and Verify",
                explanation: "Execute Reconcile -> Change -> Verify sequence.",
                expectedResult: "Account status transitions to Verified.",
              },
            ],
            targetConsole: "cpm",
            associatedLabId: "Lab 05B · Reconcile out-of-sync credential",
            validationObjectiveId: "obj-cm07-cpm",
            validationCriteria:
              "Unlock svc_backup, execute Reconcile, Change, and Verify operations, and validate in the simulator.",
            troubleshootingHints: [
              {
                symptom: "Reconcile button is disabled or fails.",
                hint: "Make sure you unlock the account first before triggering Reconcile.",
                correctiveAction: "Click 'Unlock' on svc_backup in the CPM Operations console.",
              },
            ],
            independentPractice: {
              title: "Independent CPM Password Verification",
              scenario:
                "Locate 'Administrator' on 'WIN-SRV-01' in CPM Operations and trigger a manual 'Verify' operation.",
              goal: "Confirm understanding of standard non-destructive CPM verification.",
              targetConsole: "cpm",
              successCriteria: [
                "Trigger Verify on Administrator account.",
                "Confirm status displays green Verified indicator.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Complete the password policy review.",
            "Pass all 5 validation criteria for Lab 05B (Unlock, Reconcile, Change, Verify) in the simulator.",
          ],
          references: [
            "CyberArk CPM Operations & Policy Management Guide",
            "CyberArk Error Code Reference: CACPM Error Codes",
            "NIST SP 800-63B: Digital Identity Guidelines — Authentication and Lifecycle Management",
          ],
        },
      ],
    },
  ],
};
