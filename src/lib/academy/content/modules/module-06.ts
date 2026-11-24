/**
 * SHADOWXLAB PAM ACADEMY — MODULE 06: ACCOUNTS — PART 2
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_06: ClassCurriculum = {
  id: "module-06",
  number: "06",
  label: "MODULE 06",
  title: "Accounts — Part 2",
  subtitle: "Reconcile Architecture, Linked Accounts & Desynchronization Recovery",
  duration: "50 mins",
  level: "Professional",
  track: "admin-20",
  category: "Credential Lifecycle & Workflows",
  overview:
    "Master advanced credential lifecycle mechanics and automated incident recovery. Deconstruct the mechanics of Reconcile Accounts, Logon Accounts, linked credential binding, out-of-sync password resolution, and administrative reset protocols when standard verification fails.",
  modules: [
    {
      id: "m06-core",
      number: "M6",
      title: "Reconcile Architecture & Linked Accounts",
      description:
        "Comprehensive walkthrough of Reconcile and Logon linked account bindings, desynchronization troubleshooting, and emergency password resets.",
      lessons: [
        {
          id: "m06-l01",
          number: "6.1",
          title: "Reconcile Accounts & Linked Credential Binding",
          subtitle:
            "Recovering desynchronized passwords and configuring elevated administrative reset accounts",
          estimatedMinutes: 25,
          learningObjectives: [
            "Deconstruct the architectural difference between a standard CPM Password Change and an administrative Reconcile operation.",
            "Configure Reconcile Account linkage at the platform and individual account levels.",
            "Analyze the role of Logon Accounts in environments where direct root or administrative login is disabled.",
            "Execute the systematic 4-step recovery protocol for resolving credential desynchronization (out-of-sync passwords).",
          ],
          prerequisites: [
            "Module 03: Policies and Platforms.",
            "Module 04: Safes.",
            "Module 05: Accounts — Part 1.",
          ],
          conceptIntroduction:
            "In a production environment, password management encounters real-world failures. An engineer might change an administrative password locally on a server during an outage, or a network glitch might interrupt a CPM change cycle halfway through—resulting in the Vault holding one password hash while the target endpoint holds another. This state is known as **Credential Desynchronization**.\n\nWhen an account is desynchronized, a standard CPM 'Change' operation will fail because the CPM must authenticate using the old password before setting the new one. If the CPM does not know the current real password, it cannot authenticate, and the account is trapped in a broken state.\n\nEnterprise PAM solves this with **Reconcile Accounts**. A Reconcile Account is a separate, elevated administrative credential (such as a Domain Admin on Windows or an account with `sudo passwd` privileges on Unix) that is linked to the target account. When a Reconcile operation is triggered, the CPM authenticates to the target host using the *Reconcile Account's* credentials and forcibly resets the managed account's password without ever needing to know what the broken old password was. Once the reset succeeds, the CPM writes the new password back into the Vault database, restoring full synchronization.",
          whyItExists:
            "Without Reconcile Accounts, every desynchronization incident requires an administrator to manually log into target servers out-of-band to reset passwords. In a fleet of 10,000 servers, automated reconciliation is the only scalable way to maintain credential hygiene.",
          architecture: {
            overview:
              "Reconcile and Logon accounts are linked to managed accounts as dependent objects. The CPM uses the linked account's credentials to authenticate and manage the primary target.",
            componentResponsibilities: [
              {
                component: "Managed Target Account",
                role: "The primary operational credential (e.g. `svc_sql` or local `Administrator`) whose password is vault-managed.",
                networkProtocols: "Target system authentication",
                securityBoundary: "Managed Asset Boundary",
              },
              {
                component: "Linked Reconcile Account",
                role: "Elevated administrative credential with OS-level authority to reset other users' passwords on target systems without knowing the old password.",
                networkProtocols:
                  "RPC/SMB NetUserSetInfo, SSH sudo /usr/bin/passwd, SQL ALTER USER",
                securityBoundary: "Elevated Administrative Tier",
              },
              {
                component: "Linked Logon Account",
                role: "Standard non-root user credential used to establish the initial SSH/RDP connection before escalating via `su`, `sudo`, or RunAs.",
                networkProtocols: "SSH Port 22 / RDP Port 3389",
                securityBoundary: "Ingress Gateway Boundary",
              },
              {
                component: "Central Policy Manager (CPM)",
                role: "Retrieves both the managed account and linked account from Vault, executes administrative reset via linked credentials, and updates Vault.",
                networkProtocols: "TCP 1858 to Vault; Management protocols to target",
                securityBoundary: "Orchestration Engine",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "CPM Polling Engine",
                action:
                  "Detects an account in 'Rotation Failed' status or receives an administrator-triggered Reconcile command.",
                channelOrProtocol: "Vault Internal Queue (TCP 1858)",
                verificationRule:
                  "CPM verifies that a valid Reconcile Account is linked to the account or platform.",
              },
              {
                stepNumber: 2,
                actor: "Central Policy Manager (CPM)",
                action: "Retrieves the Reconcile Account credentials from the Vault.",
                channelOrProtocol: "Encrypted Vault Protocol (TCP 1858)",
                verificationRule:
                  "Vault confirms CPM has Retrieve and Use permissions on the Safe holding the Reconcile Account.",
              },
              {
                stepNumber: 3,
                actor: "Central Policy Manager (CPM)",
                action:
                  "Connects to target host using the Reconcile Account and executes administrative password reset for the target user.",
                channelOrProtocol: "Win32 RPC / Linux SSH sudo",
                verificationRule:
                  "Target OS accepts password change command executed under elevated Reconcile principal context.",
              },
              {
                stepNumber: 4,
                actor: "Central Policy Manager (CPM)",
                action:
                  "Generates new password hash, stores it in the Vault database, and marks account status 'Managed'.",
                channelOrProtocol: "TCP 1858 to Vault",
                verificationRule:
                  "Vault commits new password version; failure flags cleared; audit event logged.",
              },
            ],
          },
          terminology: [
            {
              term: "Reconcile Account",
              definition:
                "An elevated credential configured with administrative rights to forcibly reset passwords on target hosts without knowing current passwords.",
              enterpriseContext:
                "Typically a Windows Domain Admin or a Unix account configured in /etc/sudoers with NOPASSWD for `/usr/bin/passwd`.",
            },
            {
              term: "Logon Account",
              definition:
                "A linked credential used to authenticate the initial connection to a target system when direct administrative login is disabled by policy.",
              enterpriseContext:
                "Crucial for Linux environments where `PermitRootLogin no` is enforced in sshd_config.",
            },
            {
              term: "Credential Desynchronization",
              definition:
                "A condition where the password stored in the Vault does not match the active password on the target endpoint.",
              enterpriseContext:
                "Occurs when local out-of-band changes happen or network drops occur mid-rotation.",
            },
            {
              term: "Platform-Level vs Account-Level Linkage",
              definition:
                "Reconcile accounts can be linked globally on a Platform (inherited by all accounts) or explicitly on an individual Account object.",
              enterpriseContext:
                "Best practice is platform-level linkage for domain accounts, and account-level linkage for special multi-domain hosts.",
            },
          ],
          administratorResponsibilities: [
            "Ensure every managed platform has an assigned, verified Reconcile Account.",
            "Verify that Reconcile Accounts reside in dedicated, high-security Safes with restricted access control.",
            "Configure sudoers permissions on Linux targets to allow Reconcile users to run `passwd <user>` without password prompting.",
            "Regularly audit accounts in 'Rotation Failed' status and initiate automated reconcile workflows.",
          ],
          configurationAndAdministration: [
            {
              name: "ReconcileAccountSafe & ReconcileAccountName",
              settingOrObject:
                "Platform > Automatic Password Management > Additional Policy Settings",
              description:
                "Defines the default Reconcile Account inherited by all accounts on this platform.",
              productionBestPractice:
                "Configure at the platform level whenever possible to avoid configuring individual accounts manually.",
            },
            {
              name: "AutoReconcileWhenUnsynched",
              settingOrObject: "Platform > Automatic Password Management > General",
              description:
                "Directs CPM to automatically trigger a Reconcile operation as soon as a Verify operation fails.",
              productionBestPractice:
                "Set AutoReconcileWhenUnsynched = Yes in production to ensure self-healing credential recovery.",
            },
            {
              name: "Linux Sudoers Configuration for Reconcile",
              settingOrObject: "/etc/sudoers on Linux Target Hosts",
              description:
                "Grants CPM reconcile user privilege to execute passwd commands for other accounts.",
              productionBestPractice:
                "Enforce: `reconcile_user ALL=(ALL) NOPASSWD: /usr/bin/passwd [A-Za-z0-9]*` and deny changing root.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Onboard Dedicated Reconcile Account",
              action:
                "Onboard a Windows Domain Administrator account `rec_win_admin` into a dedicated Safe `SEC-RECONCILE-SAFE`.",
              expectedResult: "Reconcile account is verified and managed by CPM.",
              operatorNotes:
                "Do not use standard interactive accounts as Reconcile accounts. Use dedicated non-human service accounts.",
            },
            {
              stepNumber: 2,
              title: "Link Reconcile Account to Platform",
              action:
                "Edit `Windows Server Local` platform, navigate to Additional Policy Settings, and link `rec_win_admin`.",
              expectedResult:
                "All accounts on the platform inherit `rec_win_admin` as their default reconcile authority.",
            },
            {
              stepNumber: 3,
              title: "Simulate & Identify Desynchronization",
              action:
                "Locate an account flagged with status 'Rotation Failed' (e.g. `svc_backup`). Inspect error cause.",
              expectedResult:
                "Failure cause indicates 'Authentication failure: Win32 Error 1326' (target password desynchronized).",
            },
            {
              stepNumber: 4,
              title: "Trigger Automated Reconciliation",
              action: "In PVWA Accounts, click 'Reconcile' on the failed account.",
              expectedResult:
                "CPM authenticates using `rec_win_admin`, resets `svc_backup` password, and marks account Managed.",
            },
          ],
          enterpriseScenario: {
            organization: "Summit Energy Partners",
            businessContext:
              "Summit Energy manages pipeline SCADA systems and power plant control servers. During an unannounced disaster recovery test, local system passwords on 230 remote substation servers were rolled back via VM snapshots, causing 100% credential desynchronization with the central Vault. Without Reconcile accounts, technicians faced a 4-week physical travel nightmare to reset servers locally. The PAM team utilized automated Reconcile accounts to remediate all 230 servers in 42 minutes.",
            governanceRequirements: [
              "Zero manual out-of-band password resets during snapshot or recovery events.",
              "Mandatory Reconcile Account linkage across all operational and SCADA platforms.",
              "Self-healing credential governance: automatic reconciliation upon verification failure.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Reconcile fails: 'CACPM250E Reconcile account does not have sufficient permissions to reset password'.",
              rootCause:
                "The Reconcile Account is missing local Administrator or sudo rights on the target host.",
              securityImpact:
                "Desynchronized credential remains broken; automated recovery blocked.",
              cyberArkCodeOrEvent: "CACPM250E",
            },
            {
              symptom:
                "Reconcile fails: 'ITATS028E Access denied to Reconcile Safe for PasswordManager'.",
              rootCause:
                "The CPM user is not a member of the Safe holding the linked Reconcile Account.",
              securityImpact:
                "CPM cannot retrieve reconcile credentials; all reconciliation operations on that platform fail.",
              cyberArkCodeOrEvent: "ITATS028E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Verify Reconcile Account Safe permissions for the CPM user.",
              logFileOrConsole: "PVWA Safes > SEC-RECONCILE-SAFE > Members",
              remediation:
                "Ensure `PasswordManager` is added as a member with 'Retrieve accounts' and 'Use accounts' permissions.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Test Reconcile Account rights manually on target host.",
              logFileOrConsole:
                "PowerShell: net user <ManagedUser> <NewPassword> / sudo /usr/bin/passwd <ManagedUser>",
              remediation:
                "Verify that the reconcile account belongs to the local Administrators group or has appropriate sudoers rules.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Inspect pm_error.log for specific Reconcile plugin failure codes.",
              logFileOrConsole: "C:\\CyberArk\\Password Manager\\Logs\\pm_error.log",
              remediation:
                "Look for Win32 Error 5 (Access Denied) or Linux 'sudo: a password is required'. Adjust target permissions.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\pm.log",
              sampleOutput:
                "CACPM250E Reconcile operation failed for account WIN-SRV-01\\Administrator using reconcile account CORP\\rec_win_admin.\nTarget returned Win32 Error 5: 'Access is denied.'",
              explanation:
                "The reconcile account CORP\\rec_win_admin connected successfully to WIN-SRV-01, but does not possess local administrative rights to reset the Administrator password.",
            },
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\pm.log",
              sampleOutput:
                "Action: Reconcile completed successfully for account svc_backup on target DB-ORA-01. New password synchronized in Vault.",
              explanation:
                "Reconciliation successfully recovered an out-of-sync credential using the linked DBA admin account.",
            },
          ],
          instructorNotes: [
            "Never use the same account to reconcile itself. An account cannot reset its own password if it is already out of sync.",
            "Reconcile accounts should be heavily audited; an alert should trigger in the SIEM whenever a Reconcile Account is checked out interactively by a human.",
            "In Unix environments, always verify that `/etc/sudoers` has `requiretty` disabled for the reconcile user if CPM connects non-interactively.",
          ],
          securityImplications: [
            "Self-Healing Resiliency: Automated reconciliation ensures enterprise credential hygiene even after server crashes, rollbacks, and network partitions.",
            "Privilege Compartmentalization: Operational staff can trigger a Reconcile without ever possessing or knowing the elevated Reconcile Account's password.",
            "Audit Trail Defense: Every Reconcile event creates an indelible audit entry identifying which Reconcile credential was used and which account was reset.",
          ],
          knowledgeCheck: [
            {
              id: "m06-q01",
              question:
                "Why does a standard CPM 'Change' operation fail when an account's password has become desynchronized out-of-band?",
              options: [
                "Because the CPM service shuts down automatically.",
                "Because a standard Change operation requires authenticating with the old password first; if the Vault's recorded password does not match the target, authentication fails.",
                "Because the Vault database is read-only.",
                "Because the target server firewall automatically blocks port 1858.",
              ],
              correctIndex: 1,
              explanation:
                "Standard CPM password changes authenticate to the target using the existing password before issuing the change command. If the password is out of sync, authentication is rejected. Reconcile overcomes this by using a separate elevated administrator.",
              conceptTested: "Change vs Reconcile Architectural Mechanics",
            },
            {
              id: "m06-q02",
              question: "What is the primary function of a 'Logon Account' in enterprise PAM?",
              options: [
                "It is used by auditors to download compliance reports.",
                "It is an unprivileged credential used to establish the initial connection to a target server where direct administrative or root login is prohibited.",
                "It is used to back up the Vault database.",
                "It is the account used to purchase user licenses.",
              ],
              correctIndex: 1,
              explanation:
                "In hardened environments, direct SSH root login or interactive domain admin logins are disabled. A Logon Account authenticates the initial session before elevating privileges via `su`, `sudo`, or RunAs.",
              conceptTested: "Logon Account Role & Security Best Practice",
            },
            {
              id: "m06-q03",
              question:
                "Which setting directs the CPM to automatically trigger a Reconcile operation as soon as a scheduled Verify test fails?",
              options: [
                "EnforceExclusiveMode = Yes",
                "AutoReconcileWhenUnsynched = Yes",
                "MinValidityPeriod = 0",
                "PerformPeriodicChange = No",
              ],
              correctIndex: 1,
              explanation:
                "When AutoReconcileWhenUnsynched is enabled on a platform, the CPM does not simply flag the account as failed; it immediately attempts self-healing by launching a Reconcile workflow using the linked reconcile credential.",
              conceptTested: "Automated Self-Healing Governance",
            },
          ],
          practicalExercise: {
            id: "m06-ex01",
            title: "Unlock, Reconcile & Recover Desynchronized Service Credential (svc_backup)",
            objective:
              "Diagnose the lockout failure on svc_backup (WIN-SRV-02), clear the lockout, reconcile Vault-target synchronization, rotate via Change, and verify Managed recovery (Lab 05B).",
            scenario:
              "The service account `svc_backup` on target `WIN-SRV-02` is locked out and flagged in 'Rotation failed' status. Clear the target lockout, execute Reconcile to restore synchronization, retry CPM Change, and verify Managed health.",
            prerequisites: [
              "Review Reconcile Account mechanics and CACPM250E diagnostics in Section 1–4.",
            ],
            startingState:
              "svc_backup on WIN-SRV-02 (SERVICE-SAFE) is in 'Rotation failed' status with failure detail 'Account locked on target' and Reconcile 'Pending'.",
            instructions: [
              "Open the CPM Operations console and select `svc_backup` on `WIN-SRV-02`.",
              "Inspect the failure detail ('Account locked on target') and click the Unlock / Repair target lockout action.",
              "Click 'Reconcile' to forcibly resynchronize the Vault and target credential.",
              "Click 'Change' to rotate the recovered credential, then click 'Verify' to confirm status returns to 'Managed'.",
              "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion' to verify all 5 Lab 05B objectives.",
            ],
            stepDetails: [
              {
                action: "Open CPM Operations and select `svc_backup` (WIN-SRV-02).",
                explanation:
                  "Standard Change fails on locked or out-of-sync accounts until the underlying lockout is remediated.",
                expectedResult:
                  "Account panel displays status 'Rotation failed' and failure detail 'Account locked on target'.",
              },
              {
                action: "Click 'Unlock target account' (Repair lockout) for `svc_backup`.",
                explanation:
                  "Clears the target directory lockout condition so CPM reconcile/change operations can authenticate.",
                expectedResult:
                  "Audit trail records lockout repair and failure cause clears on `svc_backup`.",
              },
              {
                action: "Click 'Reconcile' on `svc_backup`.",
                explanation:
                  "Uses the linked Reconcile authority to overwrite the diverged target password without needing the unknown password.",
                expectedResult: "CPM operation log records a Completed Reconcile operation.",
              },
              {
                action: "Run 'Change' and then 'Verify' on `svc_backup`.",
                explanation:
                  "Confirms automated periodic rotation and live authentication both succeed after recovery.",
                expectedResult:
                  "CPM logs Completed Change and Verify operations; `svc_backup` status transitions to 'Managed'.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation:
                  "Verifies all 5 Lab 05B recovery objectives (failure inspection, unlock, reconcile, change, verify).",
                expectedResult: "All 5/5 Lab 05B objectives pass (100/100).",
              },
            ],
            targetConsole: "cpm",
            associatedLabId: "Lab 05B · Recover a failed rotation",
            validationObjectiveId: "reconcile-account",
            validationCriteria:
              "svc_backup (WIN-SRV-02) unlocked, reconciled, rotated via Change, verified, and restored to Managed status (5/5 Lab 05B objectives).",
            troubleshootingHints: [
              {
                symptom: "Reconcile or Change fails immediately on svc_backup.",
                hint: "Check whether the target account lockout has been repaired first.",
                correctiveAction:
                  "Click 'Unlock target account' in CPM Operations for svc_backup (WIN-SRV-02) before clicking Reconcile.",
              },
              {
                symptom:
                  "'Retry CPM Change' or 'Verify restored credential health' stays pending after Reconcile.",
                hint: "Lab 05B requires completing all four recovery operations: Unlock, Reconcile, Change, and Verify.",
                correctiveAction:
                  "Run Change and then Verify on svc_backup in CPM Operations until status is 'Managed', then re-validate.",
              },
            ],
            independentPractice: {
              title: "Verify Post-Recovery Audit Evidence in Reports & Audit",
              scenario:
                "Change Management requires audit proof that the svc_backup outage was recovered through controlled Unlock, Reconcile, Change, and Verify operations.",
              goal: "Without step-by-step guidance, inspect Reports & Audit and confirm the sequential recovery audit trail for svc_backup.",
              targetConsole: "audit",
              successCriteria: [
                "Located the lockout repair and Reconcile/Change/Verify entries for svc_backup in Reports & Audit.",
                "Confirmed svc_backup now displays Managed health with no active failure cause.",
              ],
            },
          },
          completionCriteria: [
            "Deconstructed the mechanics of Reconcile and Logon linked account bindings.",
            "Formulated the 4-phase recovery protocol for desynchronized credentials.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the reconciliation recovery in the CPM Operations console.",
          ],
          references: [
            "CyberArk Core PAS: Central Policy Manager Reconcile Account Configuration Guide",
            "NIST SP 800-128: Guide for Security-Focused Configuration Management of Information Systems",
            "Linux Server Hardening: Managing Sudoers and Sudo Passwordless Delegations",
          ],
        },
      ],
    },
  ],
};
