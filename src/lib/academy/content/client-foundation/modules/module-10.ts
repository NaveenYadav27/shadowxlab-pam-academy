/**
 * MODULE 10 — TROUBLESHOOTING FUNDAMENTALS
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 2 Hours | Day: 4 | Domain: Capstone & Operational Assessment
 * Practical: Work through three simulated CyberArk support tickets.
 * Learning Outcome: Use a repeatable process to investigate basic PAM support issues.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_10: ClassCurriculum = {
  id: "client-m10",
  number: "10",
  label: "MODULE 10",
  title: "Troubleshooting Fundamentals",
  subtitle: "Structured Diagnostics, Common Error Taxonomies & Simulated Support Ticket Resolution",
  duration: "2 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Session Management and Auditing",
  overview:
    "Establishes a systematic, repeatable diagnostic protocol for resolving enterprise PAM incidents. Covers common failure modes across user access (login failures, missing accounts, access denials), credential lifecycle (verify/change/reconcile failures, CACPM072E errors), and session brokering (PSM connection drops, timeouts). Emphasizes the 6-step structured troubleshooting process: Reproduce, Collect Evidence, Review Logs, Isolate Component, Validate Remediation, and Document.",
  modules: [
    {
      id: "cm10-core",
      number: "M10",
      title: "Troubleshooting Fundamentals",
      description:
        "Diagnostic protocols, component log forensics, error taxonomies, and 3 simulated support tickets.",
      lessons: [
        {
          id: "cm10-l01",
          number: "10.1",
          title: "Structured Diagnostic Protocol & 3 CyberArk Support Tickets",
          subtitle:
            "Log Forensics, Failure Taxonomy & Resolution of Safe ACL, CPM Lockout and PSM Tickets",
          estimatedMinutes: 120,
          learningObjectives: [
            "Use a repeatable process to investigate basic PAM support issues.",
            "Apply the 6-step structured troubleshooting methodology: Reproduce -> Evidence -> Logs -> Isolate -> Validate -> Document.",
            "Identify key CyberArk log files across components: italog.log (Vault), pm_error.log (CPM), PSMServer.log (PSM), and PVWA.App.log (PVWA).",
            "Diagnose and remediate Ticket 1: Safe ACL misconfiguration resulting in user 'Access Denied'.",
            "Diagnose and remediate Ticket 2: CPM verify/change failure (CACPM072E) caused by credential desynchronization.",
            "Diagnose and remediate Ticket 3: PSM session launch failure / timeout caused by network reachability or service issues.",
          ],
          prerequisites: [
            "Completion of Module 01 through Module 09.",
            "Working knowledge of PAM component topology and operational workflows.",
          ],
          conceptIntroduction:
            "When a privileged access failure occurs, high-pressure environments often lead inexperienced engineers to guess solutions or make arbitrary permission changes. In a Zero Trust architecture, random configuration changes degrade security posture and can introduce compliance violations. Structured troubleshooting replaces guesswork with a systematic forensic process: identifying the affected component, gathering log evidence, understanding the specific error code mechanism, testing the hypothesis, validating the remediation against live systems, and documenting the root cause.",
          whyItExists:
            "PAM is a mission-critical gateway. If an administrator cannot connect to an offline production server during a major incident, minutes matter. Having a structured diagnostic workflow enables engineers to rapidly isolate whether the problem lies with user credentials (PVWA), Safe ACLs (Vault), network routing/firewalls, CPM automation, or the PSM proxy service.",
          architecture: {
            overview:
              "Troubleshooting requires correlating evidence across the multi-tier component architecture. An incident initiated in the user browser flows through PVWA, queries the Vault, and interacts with either CPM or PSM before reaching the target server.",
            componentResponsibilities: [
              {
                component: "Digital Vault Logs (italog.log / pm.log)",
                role: "Records all Vault transactions, security denials, authentication failures, and Safe activities.",
                securityBoundary: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\",
              },
              {
                component: "CPM Logs (pm_error.log / pm.log)",
                role: "Logs details of all verify, change, and reconcile attempts, plugin execution traces, and target connection errors.",
                securityBoundary: "C:\\Program Files (x86)\\CyberArk\\Password Manager\\Logs\\",
              },
              {
                component: "PSM Logs (PSMServer.log / PSMTrace.log)",
                role: "Tracks session initiation requests, token validations, RDP proxy handshake events, and connection component errors.",
                securityBoundary: "C:\\Program Files (x86)\\CyberArk\\PSM\\Logs\\",
              },
              {
                component: "PVWA Web Logs (PVWA.App.log)",
                role: "Records HTTP request errors, authentication handshake errors, and web service exceptions.",
                securityBoundary: "C:\\CyberArk\\Password Vault Web Access\\Services\\Logs\\",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Support Engineer",
                action: "Reproduce the incident and capture exact error message and timestamp.",
                channelOrProtocol: "User Interface / Console",
                verificationRule: "Verify symptom matches ticket description.",
              },
              {
                stepNumber: 2,
                actor: "Support Engineer",
                action: "Collect evidence: Username, Account ID, Target Host, and Safe Name.",
                channelOrProtocol: "PVWA Console",
                verificationRule: "Correlate with system health dashboard.",
              },
              {
                stepNumber: 3,
                actor: "Support Engineer",
                action: "Review corresponding component log file (italog, pm_error, or PSMServer).",
                channelOrProtocol: "Log Analysis",
                verificationRule: "Match timestamp and error code.",
              },
              {
                stepNumber: 4,
                actor: "Support Engineer",
                action:
                  "Isolate root cause to specific domain (Permissions, Network, Credentials, or Service).",
                channelOrProtocol: "Diagnostic Assessment",
                verificationRule: "Single root cause identified.",
              },
              {
                stepNumber: 5,
                actor: "Support Engineer",
                action:
                  "Apply controlled remediation and validate that operational function succeeds.",
                channelOrProtocol: "PAM Console",
                verificationRule: "Verify action succeeds and audit confirms recovery.",
              },
              {
                stepNumber: 6,
                actor: "Support Engineer",
                action: "Document root cause and corrective action in support ticket.",
                channelOrProtocol: "Incident Ticket System",
                verificationRule: "Ticket updated with full remediation notes.",
              },
            ],
          },
          terminology: [
            {
              term: "Structured Troubleshooting Methodology",
              definition:
                "The 6-step discipline: (1) Reproduce, (2) Collect Evidence, (3) Review Logs, (4) Isolate Component, (5) Validate, and (6) Document.",
              enterpriseContext: "The required diagnostic procedure for all PAM operations teams.",
            },
            {
              term: "italog.log",
              definition:
                "The primary operational activity and diagnostic log file of the CyberArk Digital Vault server.",
              enterpriseContext:
                "First place to inspect when investigating user authentication or Vault-level access denials.",
            },
            {
              term: "pm_error.log",
              definition:
                "The specialized error log of the Central Policy Manager capturing failed credential operations and target error codes.",
              enterpriseContext: "Essential for debugging CACPM072E and account lockout issues.",
            },
            {
              term: "PSMServer.log",
              definition:
                "The main diagnostic log of the Privileged Session Manager tracking session proxy connections, disconnections, and errors.",
              enterpriseContext: "Used to diagnose PSMSR037E connection drops and RDP timeouts.",
            },
            {
              term: "Desynchronization",
              definition:
                "A state where the password recorded in the Digital Vault differs from the password actually set on the target endpoint.",
              enterpriseContext: "Resolved via Reconcile operation.",
            },
          ],
          administratorResponsibilities: [
            "Maintain familiarity with the location and format of logs across all CyberArk component servers.",
            "Avoid bypassing security controls or granting global administrator privileges as a troubleshooting workaround.",
            "Ensure system clocks across all servers are synchronized via NTP to enable accurate log correlation.",
            "Document every resolved support incident with root-cause categorization to improve knowledge base articles.",
          ],
          configurationAndAdministration: [
            {
              name: "CPM Debug Logging",
              settingOrObject: "cpm.ini -> DebugLevels",
              description:
                "Increases CPM verbosity to capture raw plugin communication traces during failed rotations.",
              productionBestPractice:
                "Enable verbose debug temporarily during active troubleshooting, then revert to standard level.",
            },
            {
              name: "PSM Trace Level",
              settingOrObject: "basic_psm.ini -> TraceLevels",
              description:
                "Configures detail level for PSM session dispatching and target connection diagnostics.",
              productionBestPractice:
                "Keep standard trace enabled; increase to level 1-2 when isolating connection drops.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Ticket 1 Investigation (Safe ACL Misconfiguration)",
              action:
                "User reports 'Access Denied' to DBA account. Review Safes console -> DBA-SAFE -> Members. Identify missing 'Use accounts' permission and add it.",
              expectedResult: "User permission corrected; connection succeeds.",
            },
            {
              stepNumber: 2,
              title: "Ticket 2 Investigation (CPM Credential Desync)",
              action:
                "CPM reports CACPM072E on svc_backup. Review CPM error log, unlock account, trigger Reconcile using linked reconcile account, then Change.",
              expectedResult: "Credential resynchronized; CPM status verified.",
            },
            {
              stepNumber: 3,
              title: "Ticket 3 Investigation (PSM Connection Drop)",
              action:
                "Admin reports PSM timeout to WIN-SRV-01. Verify network reachability to TCP 3389 and confirm PSM service health in System Health console.",
              expectedResult:
                "Target firewall rule or PSM connector restored; session establishes.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "The PAM support queue has received three critical morning tickets: (1) Ticket #1041: DBA lead unable to access Oracle database account, (2) Ticket #1042: Service account svc_backup locked with CACPM072E error, and (3) Ticket #1043: Helpdesk engineer experiencing PSM connection failure to Windows member server.",
            governanceRequirements: [
              "Systematic resolution of all three support tickets using standard diagnostic protocols.",
              "Strict adherence to least privilege during remediation.",
              "Audit documentation of every corrective action.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Ticket 1: 'ITATS053E You are unauthorized to perform this operation' when clicking Connect.",
              rootCause: "User assigned to Safe with 'List accounts' only, lacking 'Use accounts'.",
              securityImpact: "Database maintenance blocked.",
              cyberArkCodeOrEvent: "ITATS053E",
            },
            {
              symptom:
                "Ticket 2: 'CACPM072E Execution error. Error: 5. Access is denied' on password verify.",
              rootCause:
                "Target password was rotated outside of PAM, causing credential desynchronization.",
              securityImpact: "Nightly backup jobs fail.",
              cyberArkCodeOrEvent: "CACPM072E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Examine italog.log for user authorization failures.",
              logFileOrConsole: "italog.log -> Search for username and ITATS053E",
              remediation:
                "Add required 'Use accounts' or 'Initiate privileged sessions' permission to Safe ACL.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Examine pm_error.log for CPM execution failures.",
              logFileOrConsole: "pm_error.log -> Search for CACPM072E",
              remediation:
                "Execute Reconcile using linked administrative account to override desynchronized target password.",
            },
          ],
          securityImplications: [
            "Attempting to troubleshoot access issues by granting 'Vault Admin' rights introduces catastrophic security exposure.",
            "Failing to document support ticket resolutions leads to recurring outages and lost institutional knowledge.",
            "Ignoring recurring CACPM072E errors leaves accounts unrotated, violating compliance policies.",
          ],
          knowledgeCheck: [
            {
              id: "cm10-q01",
              question:
                "What is the very first step in the 6-step structured troubleshooting methodology before modifying any configurations?",
              options: [
                "Reboot the production database server.",
                "Reproduce the issue and collect accurate evidence (Username, Target, Timestamp, Error Code).",
                "Delete the Safe and recreate all accounts from scratch.",
                "Disable Multi-Factor Authentication for all administrators.",
              ],
              correctIndex: 1,
              explanation:
                "The first step of structured troubleshooting is to reproduce the issue and gather objective evidence (who was trying to do what, against what target, at what time, and what exact error occurred).",
              conceptTested: "Structured Troubleshooting Methodology",
            },
            {
              id: "cm10-q02",
              question:
                "When investigating a failed automated password change on a Windows server where the error log displays 'CACPM072E', which log file should you inspect on the CPM host for detailed execution traces?",
              options: [
                "PSMServer.log",
                "pm_error.log (or pm.log)",
                "PVWA.App.log",
                "setup.exe.log",
              ],
              correctIndex: 1,
              explanation:
                "pm_error.log and pm.log on the Central Policy Manager server record all operational execution steps, plugin traces, and target system response codes for CPM operations.",
              conceptTested: "Component Log File Identification",
            },
            {
              id: "cm10-q03",
              question:
                "In Support Ticket 2, the service account 'svc_backup' has an out-of-sync password and shows 'Locked by CPM'. What is the correct sequence of actions to restore it to operational health?",
              options: [
                "Delete the account -> Reboot the server -> Re-add the account.",
                "Unlock the account in the console -> Trigger Reconcile using the linked administrative account -> Execute Change and Verify.",
                "Change the Safe name to 'RECOVERY-SAFE' -> Disable the firewall.",
                "Instruct the user to use standard user credentials instead.",
              ],
              correctIndex: 1,
              explanation:
                "The standard recovery sequence for a locked, desynchronized account is: (1) Clear the lock, (2) Execute Reconcile using the linked administrative account, and (3) Execute Change/Verify to confirm end-to-end synchronization.",
              conceptTested: "Support Ticket 2 Resolution Workflow",
            },
          ],
          practicalExercise: {
            id: "cm10-ex01",
            title: "Structured Investigation of 3 CyberArk Support Tickets",
            objective:
              "Work through three simulated support tickets in the Troubleshooting console: resolve a Safe ACL denial, remediate a CACPM072E lockout, and diagnose a PSM connection issue.",
            scenario:
              "Access the Troubleshooting workbench to investigate three active support tickets. Apply the 6-step diagnostic protocol to resolve Ticket 1 (DBA Safe ACL), Ticket 2 (svc_backup CPM lockout), and Ticket 3 (PSM timeout), validating remediation against the live simulator.",
            prerequisites: ["Completion of Module 01-09"],
            startingState: "Active incidents in Troubleshooting workbench.",
            instructions: [
              "Navigate to Troubleshooting workbench.",
              "Review the three active support tickets.",
              "Select Ticket 1: Safe ACL misconfiguration. Identify missing permission and remediate in Safes console.",
              "Select Ticket 2: CACPM072E lockout on svc_backup. Unlock and trigger Reconcile in CPM console.",
              "Select Ticket 3: PSM connection timeout. Verify connector health and test connectivity.",
              "Verify that all three simulated incidents are resolved.",
              "Validate the operational exercise.",
            ],
            stepDetails: [
              {
                action: "Triage Ticket 1 (Safe ACL)",
                explanation:
                  "Review access denial symptom and correct dba_user permissions in DBA-SAFE.",
                expectedResult: "Ticket 1 resolved.",
              },
              {
                action: "Triage Ticket 2 (CPM Lockout)",
                explanation: "Unlock svc_backup and execute Reconcile operation.",
                expectedResult: "Ticket 2 resolved.",
              },
              {
                action: "Triage Ticket 3 (PSM Connection)",
                explanation: "Verify PSM proxy health and connector status.",
                expectedResult: "Ticket 3 resolved.",
              },
            ],
            targetConsole: "troubleshooting",
            associatedLabId: "Client M10 · Three Support Tickets",
            validationObjectiveId: "obj-cm10-troubleshoot",
            validationCriteria:
              "Investigate and resolve simulated CyberArk support tickets using structured diagnostic protocol.",
            troubleshootingHints: [
              {
                symptom: "Incidents still show open status in workbench.",
                hint: "Navigate to CPM console to ensure svc_backup is unlocked and reconciled.",
                correctiveAction: "Run Reconcile on svc_backup in CPM console.",
              },
            ],
            independentPractice: {
              title: "Independent Log File Identification",
              scenario:
                "Match each of the following symptoms with its primary diagnostic log: (A) User cannot log into PVWA, (B) CPM verification fails, (C) PSM connection terminates abruptly.",
              goal: "Confirm proficiency with component log mapping.",
              targetConsole: "troubleshooting",
              successCriteria: [
                "Map PVWA login issues to italog.log and PVWA.App.log.",
                "Map CPM verification failures to pm_error.log.",
                "Map PSM connection terminations to PSMServer.log.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Work through all three simulated support tickets.",
            "Demonstrate understanding of the 6-step diagnostic protocol.",
          ],
          references: [
            "CyberArk Troubleshooting Guide: Vault, CPM, PSM, PVWA",
            "CyberArk Error Code Reference & Diagnostic Flowcharts",
            "ITIL v4 Incident Management & Root Cause Analysis Guide",
          ],
        },
      ],
    },
  ],
};
