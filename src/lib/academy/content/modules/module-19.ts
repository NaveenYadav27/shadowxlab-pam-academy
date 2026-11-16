/**
 * SHADOWXLAB PAM ACADEMY — MODULE 19: TROUBLESHOOTING
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_19: ClassCurriculum = {
  id: "module-19",
  number: "19",
  label: "MODULE 19",
  title: "Troubleshooting",
  subtitle: "Systematic Diagnostic Protocols, Log Forensics & Controlled Remediation",
  duration: "55 mins",
  level: "Professional",
  track: "admin-20",
  category: "Diagnostic Mastery & Certification",
  overview:
    "Master advanced diagnostic methodologies and incident triage for enterprise PAM infrastructure. Deconstruct the 5-Step Systematic Diagnostic Protocol, deep log forensics across all subsystem logs (italog.log, pm.log, PSMTrace.log, PVWA.App.log), log verbosity tuning (DebugLevels), credential file regeneration via CreateCredFile.exe, and controlled, evidence-led remediation workflows.",
  modules: [
    {
      id: "m19-core",
      number: "M19",
      title: "Systematic Troubleshooting & Log Forensics",
      description:
        "Comprehensive walkthrough of the 5-step diagnostic framework, multi-component log analysis, credential file reconstruction, and controlled operational remediation.",
      lessons: [
        {
          id: "m19-l01",
          number: "19.1",
          title: "The 5-Step Diagnostic Protocol & Subsystem Log Forensics",
          subtitle: "Executing evidence-based troubleshooting, analyzing raw log streams, and repairing desynchronized credential files",
          estimatedMinutes: 25,
          learningObjectives: [
            "Execute the 5-Step Systematic Diagnostic Protocol: Scope -> Correlate -> Hypothesize -> Remediate -> Verify.",
            "Analyze raw diagnostic log streams across Vault (italog), CPM (pm.log), PSM (PSMTrace), and PVWA (PVWA.App.log).",
            "Enable and configure diagnostic debug levels to isolate intermittent plugin, LDAP, and session failures.",
            "Regenerate corrupted component credential files (`user.ini`) using the CreateCredFile utility.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 05: Accounts — Part 1.",
            "Module 18: Common Issues.",
          ],
          conceptIntroduction:
            "When a critical PAM component fails in production, inexperienced administrators panic: they reboot servers at random, guess at firewall rules, or edit configuration files indiscriminately. In complex cryptographic systems, guessing causes catastrophic cascading failures—such as corrupting database states or triggering split-brain failovers.\n\nEnterprise PAM engineering mandates an evidence-based, disciplined troubleshooting framework: the **5-Step Systematic Diagnostic Protocol**:\n1. **Symptom & Scope Analysis**: Determine the blast radius. Is the failure affecting one user, one account, one Safe, one component, or the entire enterprise? (e.g., if only Oracle DBAs cannot connect, do not troubleshoot the Vault kernel; focus on the Oracle platform or PSM connection component).\n2. **Log File Correlation**: Inspect the raw diagnostic log file on the specific subsystem responsible for the action. Correlate timestamps across components to find the root error code.\n3. **Hypothesis Formulation**: Formulate a single, testable hypothesis based on diagnostic evidence (e.g. 'The CPM cannot connect to target because port 445 is blocked by a host firewall').\n4. **Controlled Remediation**: Apply exactly one targeted fix at a time. Never make multiple simultaneous configuration changes.\n5. **Verification & Audit Closure**: Test the workflow, verify that the operation completes with green status, confirm the fix is reflected in the audit trail, and document the root cause in the incident post-mortem.",
          whyItExists:
            "Disciplined troubleshooting reduces Mean Time to Resolution (MTTR) by 80%, prevents self-inflicted outages, and guarantees that infrastructure fixes are permanent, documented, and auditable.",
          architecture: {
            overview:
              "Every PAM component maintains dedicated, unbuffered diagnostic log files on its local operating system filesystem, tracking execution traces, API calls, and error stacks.",
            componentResponsibilities: [
              {
                component: "Vault Kernel Log (italog.log)",
                role: "The master system log on the Vault host recording service startups, licensing, replication, network connection drops, and ITATS errors.",
                networkProtocols: "`C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log`",
                securityBoundary: "Tier-0 Vault Bastion",
              },
              {
                component: "CPM Operational Logs (pm.log / pm_error.log)",
                role: "Records every verification, change, and reconcile transaction, target plugin return codes, and CACPM errors.",
                networkProtocols: "`C:\\CyberArk\\Password Manager\\Logs\\pm.log`",
                securityBoundary: "Orchestration Management Tier",
              },
              {
                component: "PSM Session Trace (PSMTrace.log)",
                role: "Records session brokering steps, RDP/SSH protocol handshakes, AppLocker blocks, and connection component dispatches.",
                networkProtocols: "`C:\\Program Files (x86)\\CyberArk\\PSM\\Logs\\PSMTrace.log`",
                securityBoundary: "Bastion Proxy Tier",
              },
              {
                component: "PVWA Application Log (PVWA.App.log)",
                role: "Records IIS web requests, REST API execution, LDAP synchronization queries, and SAML token authentication claims.",
                networkProtocols: "`C:\\Windows\\Temp\\PVWA\\PVWA.App.log`",
                securityBoundary: "Web Presentation Tier",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "PAM Administrator (Triage)",
                action: "Receives incident ticket: 'CPM rotation failing for svc_backup'. Identifies scope: Single account on single host.",
                channelOrProtocol: "Incident Intake",
                verificationRule: "Symptom localized; other accounts in the same Safe are rotating successfully.",
              },
              {
                stepNumber: 2,
                actor: "PAM Administrator (Log Forensics)",
                action: "Opens `pm_error.log` on the CPM host; searches for `svc_backup` at the failure timestamp.",
                channelOrProtocol: "Log Analysis",
                verificationRule: "Finds: `CACPM250E Verification failed: Win32 Error 1909: The referenced account is currently locked out.`",
              },
              {
                stepNumber: 3,
                actor: "PAM Administrator (Hypothesis)",
                action: "Hypothesizes that target account was locked due to bad password attempts by a third-party application.",
                channelOrProtocol: "Root-Cause Formulation",
                verificationRule: "Confirmed via Active Directory event log on target domain controller.",
              },
              {
                stepNumber: 4,
                actor: "PAM Administrator (Remediation & Verify)",
                action: "Unlocks account in AD, executes CPM Reconcile in PVWA, and confirms status transitions to 'Managed'.",
                channelOrProtocol: "Controlled Fix Execution",
                verificationRule: "Subsequent Verify passes with green status pill; incident closed with evidence attached.",
              },
            ],
          },
          terminology: [
            {
              term: "italog.log",
              definition: "The primary operational and security log of the Digital Vault server, tracking all component connections, licenses, and kernel events.",
              enterpriseContext: "The first file to inspect whenever any component cannot reach or authenticate to the Vault.",
            },
            {
              term: "pm.log / pm_error.log",
              definition: "The detailed execution and error logs generated by the Central Policy Manager during password operations.",
              enterpriseContext: "Records the full standard output and error output returned by target plugin scripts.",
            },
            {
              term: "PSMTrace.log",
              definition: "The verbose diagnostic trace log on the PSM server tracking session initialization, token validation, and dispatcher launches.",
              enterpriseContext: "Crucial for identifying AppLocker blocks, RDS licensing errors, and protocol connection failures.",
            },
            {
              term: "CreateCredFile.exe",
              definition: "A command-line utility used to generate encrypted, machine-bound credential files (`user.ini`) for component authentication.",
              enterpriseContext: "Used to regenerate broken component authentication tickets (e.g. for PasswordManager, PSMServer, or Backup users).",
            },
            {
              term: "DebugLevels",
              definition: "Configuration parameters in component INI files (e.g. `dbparm.ini`, `padr.ini`, `pm.ini`) that increase log verbosity.",
              enterpriseContext: "Turned on temporarily during deep troubleshooting to capture raw packet hex dumps and API traces, then turned off.",
            },
          ],
          administratorResponsibilities: [
            "Follow the 5-Step Diagnostic Protocol rigorously; never guess or make uncoordinated production changes.",
            "Know the exact filesystem path of primary log files on all four core components.",
            "Master the syntax of `CreateCredFile.exe` to resolve component credential desynchronization in emergencies.",
            "Ensure debug logging levels are disabled after resolving incidents to prevent log files from exhausting disk space.",
          ],
          configurationAndAdministration: [
            {
              name: "CreateCredFile Command Syntax",
              settingOrObject: "CreateCredFile.exe Utility",
              description: "Syntax: `CreateCredFile.exe <OutputFile> /Password <Pass> /AppType <Type> /Exe <ExePath> /Hostname <Host>`.",
              productionBestPractice: "Always bind credential files to the local machine's cryptographic hardware token (`/Hostname`) and binary path.",
            },
            {
              name: "CPM Debug Logging (pm.ini)",
              settingOrObject: "C:\\CyberArk\\Password Manager\\bin\\pm.ini",
              description: "Parameters: `Debug=Yes`, `Trace=Yes`, `MinDebugLevel=1`.",
              productionBestPractice: "Enable debug logging on specific individual platforms rather than globally across the entire CPM daemon.",
            },
            {
              name: "PVWA Web Debug (web.config)",
              settingOrObject: "C:\\inetpub\\wwwroot\\PasswordVault\\web.config",
              description: "Configures `<compilation debug=\"true\">` and log4net trace listeners for deep REST API diagnostics.",
              productionBestPractice: "Never leave compilation debug enabled in production; it disables ASP.NET runtime optimizations.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Step 1: Scope & Localize Incident",
              action: "Determine whether the failure is global (Vault down), regional (PSM farm down), or isolated (single account).",
              expectedResult: "Scope bounded; troubleshooting directed to the specific failing subsystem.",
              operatorNotes: "If only one account is failing, do NOT touch Vault or component services.",
            },
            {
              stepNumber: 2,
              title: "Step 2: Inspect Diagnostic Log",
              action: "Connect to the component host, open the relevant log file (e.g. `pm_error.log`), and search for the target account name.",
              expectedResult: "Extracts exact error string, timestamp, and target OS error code.",
            },
            {
              stepNumber: 3,
              title: "Step 3: Regenerate Component Credential File",
              action: "If component reports ITATS004E (Authentication failure), use CreateCredFile to re-create `user.ini` and reset user password in Vault.",
              expectedResult: "Component service restarts cleanly, authenticates on port 1858, and resumes normal processing.",
            },
            {
              stepNumber: 4,
              title: "Step 4: Execute & Verify Fix",
              action: "Trigger the failed operation manually in PVWA (e.g. click Verify or Reconcile). Confirm green status.",
              expectedResult: "Operation succeeds; evidence logged in audit trail; ticket updated with root-cause analysis.",
            },
          ],
          enterpriseScenario: {
            organization: "Ironclad Global Defense Services",
            businessContext:
              "Ironclad manages tactical communication nodes for allied defense coalitions. Following an emergency Windows patching cycle, all CPM automated password rotations halted across 2,400 servers. A junior administrator proposed restoring the entire Vault database from tape. The senior PAM architect intervened, applied the 5-Step Diagnostic Protocol, inspected `pm_error.log`, and discovered that the Windows patch had updated the local machine certificate, breaking the CPM's machine-bound credential file. Using `CreateCredFile.exe`, the architect regenerated `user.ini` and restored full operational rotation in 8 minutes without rolling back data.",
            governanceRequirements: [
              "Zero uncoordinated system reboots or database rollbacks during production incident triage.",
              "Mandatory root-cause analysis documentation attached to all resolved high-severity tickets.",
              "Regeneration of component credential files executed strictly via cryptographically machine-bound tickets.",
            ],
          },
          failureScenarios: [
            {
              symptom: "CPM service stops immediately upon startup: 'CACPM072E Connection to Vault failed: ITATS004E Authentication failure'.",
              rootCause: "The CPM credential file (`user.ini`) is corrupted or desynchronized from the PasswordManager user password stored in the Vault.",
              securityImpact: "Complete CPM failure; all scheduled password changes across the enterprise stop.",
              cyberArkCodeOrEvent: "ITATS004E",
            },
            {
              symptom: "Target verification fails with: 'CACPM250E Target unreachable on port 445 (SMB)'.",
              rootCause: "Host-based firewall (Windows Defender Firewall or iptables) on target endpoint is blocking incoming connections from CPM.",
              securityImpact: "Single account verification fails; target is flagged unmanaged.",
              cyberArkCodeOrEvent: "CACPM250E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Re-create component credential file using CreateCredFile.exe.",
              logFileOrConsole: "Command Prompt on CPM/PSM host",
              remediation: "Execute CreateCredFile, generate new user.ini, reset internal user password in PrivateArk Client, and restart service.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Verify network socket connectivity to target host ports.",
              logFileOrConsole: "PowerShell: Test-NetConnection -ComputerName <Target> -Port 445 / 22 / 1433",
              remediation: "If port test fails, update network firewalls or target host firewall rules to allow traffic from CPM static IP.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Inspect target event logs for OS authentication rejection details.",
              logFileOrConsole: "Target Event Viewer > Security Log (Event 4625: Failed Logon)",
              remediation: "Review Sub Status code (e.g. 0xC000006A = bad password, 0xC0000234 = account locked). Apply targeted fix.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\pm_error.log",
              sampleOutput:
                "CACPM072E Communication error with Digital Vault. ITATS004E Authentication failure for user PasswordManager.\nService shutting down.",
              explanation:
                "The CPM's user.ini credential file does not match the Vault's PasswordManager user account password. Credential file regeneration required.",
            },
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 22:14:02 ITATS004E Authentication failure for user PasswordManager from station 10.0.1.20.",
              explanation:
                "Vault italog confirms authentication rejection for the CPM user. Re-synchronizing user.ini will resolve the outage.",
            },
          ],
          instructorNotes: [
            "Always reset the internal user password in PrivateArk Client FIRST, then generate the new `user.ini` with matching password, then restart the service.",
            "Never share credential files between component servers. Each component server requires its own uniquely generated machine-bound credential file.",
            "When troubleshooting target issues, always test connectivity FROM the CPM host, not your personal desktop. Network routing and firewall rules differ.",
          ],
          securityImplications: [
            "Evidence-Led Integrity: Prevents accidental destruction of forensic logs or system data during high-stress outages.",
            "Cryptographic Binding: Machine-bound credential files prevent stolen component files from functioning on adversary-controlled machines.",
            "Audit Traceability: Systematic troubleshooting ensures every remediation step is recorded with clear justification and verified results.",
          ],
          knowledgeCheck: [
            {
              id: "m19-q01",
              question: "What is Step 1 of the 5-Step Systematic Diagnostic Protocol in enterprise PAM troubleshooting?",
              options: [
                "Reboot the Vault server immediately.",
                "Symptom & Scope Analysis: Determine the blast radius and isolate whether the failure is global, regional, or specific to a single account/platform.",
                "Delete the failing accounts and re-create them.",
                "Re-install Windows on the CPM server.",
              ],
              correctIndex: 1,
              explanation:
                "Step 1 is always Scope & Symptom Analysis. Determining the boundary of the failure prevents administrators from making unnecessary and dangerous changes to unaffected subsystems.",
              conceptTested: "The 5-Step Diagnostic Protocol & Incident Scoping",
            },
            {
              id: "m19-q02",
              question: "Which utility is used to regenerate encrypted, machine-bound credential files (user.ini) when a component encounters error ITATS004E?",
              options: [
                "CreateCredFile.exe",
                "notepad.exe",
                "diskpart.exe",
                "FormatVault.exe",
              ],
              correctIndex: 0,
              explanation:
                "CreateCredFile.exe generates encrypted credential files bound to the local machine's cryptographic hardware token and executable path, restoring authenticated component communication with the Vault.",
              conceptTested: "CreateCredFile Utility & Component Credential Regeneration",
            },
            {
              id: "m19-q03",
              question: "Why should verbose diagnostic debug logging (e.g. DebugLevels) be turned off immediately after resolving an operational incident?",
              options: [
                "Because debug logging makes web pages load in black and white.",
                "Because verbose debug logging writes raw payloads to disk, which can quickly exhaust storage capacity and degrade component performance.",
                "Because debug logging deletes user accounts.",
                "Because debug logging is prohibited by law.",
              ],
              correctIndex: 1,
              explanation:
                "Verbose debug traces generate gigabytes of log output rapidly. Leaving debug enabled risks disk space exhaustion, which can crash the component host.",
              conceptTested: "Debug Verbosity Management & Operational Hygiene",
            },
          ],
          practicalExercise: {
            id: "m19-ex01",
            title: "Diagnose Component Incident and Execute Controlled Remediation",
            scenario:
              "Diagnose an active credential rotation failure on the troubleshooting workbench, inspect diagnostic log evidence (pm.log, italog.log), isolate root cause, and execute controlled remediation.",
            instructions: [
              "Navigate to the Troubleshooting console.",
              "Inspect the recorded diagnostic events and component alerts.",
              "Review the diagnostic log streams to identify root-cause error codes.",
              "Execute the remediation procedure (e.g. Unlock account, Reconcile, or Repair) and verify that the account returns to Managed health.",
            ],
            targetConsole: "troubleshooting",
            associatedLabId: "Lab 05B · Recover a failed rotation",
            validationObjectiveId: "repair-lockout",
            validationCriteria:
              "Operational failure is diagnosed from logs and controlled remediation restores healthy state.",
          },
          completionCriteria: [
            "Deconstructed the 5-Step Systematic Diagnostic Protocol.",
            "Mastered log forensics across italog.log, pm.log, PSMTrace.log, and PVWA.App.log.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the controlled incident remediation in the Troubleshooting console.",
          ],
          references: [
            "CyberArk Privileged Access Security: Troubleshooting and Diagnostic Runbook",
            "NIST SP 800-61 Rev 2: Computer Security Incident Handling Guide",
            "SANS Institute: The Art of Root Cause Analysis in Enterprise Distributed Systems",
          ],
        },
      ],
    },
  ],
};
