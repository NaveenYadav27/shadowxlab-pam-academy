/**
 * SHADOWXLAB PAM ACADEMY — MODULE 18: COMMON ISSUES
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_18: ClassCurriculum = {
  id: "module-18",
  number: "18",
  label: "MODULE 18",
  title: "Common Issues",
  subtitle: "Failure Taxonomy, Error Code Mechanics & Root-Cause Analysis",
  duration: "55 mins",
  level: "Professional",
  track: "admin-20",
  category: "Diagnostic Mastery & Certification",
  overview:
    "Master the complete diagnostic taxonomy of enterprise PAM error codes across all subsystems. Deconstruct Central Policy Manager errors (CACPM072E, CACPM250E, CACPM154E), Privileged Session Manager errors (PSMSR037E, PSMSR126E), PVWA web errors (ITATS006E, ITATS020E), and Digital Vault kernel errors (ITATS108E, ITATS004E), mapping symptoms to root causes and immediate remediation runbooks.",
  modules: [
    {
      id: "m18-core",
      number: "M18",
      title: "Diagnostic Taxonomy & Subsystem Error Codes",
      description:
        "Comprehensive walkthrough of CPM, PSM, PVWA, and Vault error codes, root-cause categorization, log interpretation, and incident triage.",
      lessons: [
        {
          id: "m18-l01",
          number: "18.1",
          title: "Subsystem Error Code Taxonomy & Diagnostic Protocols",
          subtitle: "Deconstructing CACPM, PSMSR, and ITATS error codes across the PAM ecosystem",
          estimatedMinutes: 25,
          learningObjectives: [
            "Deconstruct the four primary error code families: CACPM (CPM), PSMSR (PSM), and ITATS (Vault/Database).",
            "Diagnose the root causes of CPM communication failures (CACPM072E) and target verification errors (CACPM250E).",
            "Troubleshoot PSM proxy outages (PSMSR037E) and AppLocker execution blocks (PSMSR126E).",
            "Resolve Vault station authorization denials (ITATS108E) and credential file desynchronization (ITATS004E).",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 05: Accounts — Part 1.",
            "Module 10: PSM — Part 1.",
          ],
          conceptIntroduction:
            "In an enterprise managing tens of thousands of privileged credentials, components and target systems interact across complex firewalls, directory services, and operating systems. When an operation fails, the PAM system does not generate vague generic errors; it produces structured, deterministic error codes prefixed by the originating subsystem:\n\n- **CACPM (Central Policy Manager)**: Indicates failures during automated credential verification, rotation, or reconciliation.\n- **PSMSR (Privileged Session Manager)**: Indicates failures during session brokering, RDS jump proxying, or connection component execution.\n- **ITATS (Internal Technological Architecture Transmission & Storage)**: Indicates Digital Vault kernel errors, access control denials, database unavailability, or station IP mismatches.\n\nProfessional PAM administrators must be able to read an error code and immediately understand where the breakdown occurred: Is it a network routing partition? A target OS permission denial? A desynchronized credential file? Or an AppLocker rule blocking an executable? By mastering this failure taxonomy, administrators resolve operational incidents in minutes rather than hours.",
          whyItExists:
            "Without a structured understanding of error codes, administrators waste hours chasing wrong leads (e.g. diagnosing target server firewalls when the true issue is a Safe permission denial). Error taxonomy provides instant root-cause clarity.",
          architecture: {
            overview:
              "Error codes originate at specific component boundaries and propagate through the Vault audit engine and PVWA presentation layer.",
            componentResponsibilities: [
              {
                component: "Central Policy Manager (CACPM Codes)",
                role: "Generates error codes during target system interactions (SMB, SSH, SQL) or Vault communication.",
                networkProtocols: "pm.log / pm_error.log",
                securityBoundary: "Orchestration & Target Management",
              },
              {
                component: "Privileged Session Manager (PSMSR Codes)",
                role: "Generates error codes during RDS session initialization, credential injection, or AppLocker policy enforcement.",
                networkProtocols: "PSMTrace.log / Components.log",
                securityBoundary: "Proxy & Session Execution",
              },
              {
                component: "Digital Vault Kernel (ITATS Codes)",
                role: "Generates error codes for database access, station IP authorization, authentication failures, and Safe ACL denials.",
                networkProtocols: "italog.log / PrivateArk Console",
                securityBoundary: "Cryptographic & Access Control Kernel",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Central Policy Manager (CPM)",
                action:
                  "Attempts to verify password for `WIN-SRV-01\\Administrator` on target host.",
                channelOrProtocol: "SMB Port 445 / RPC",
                verificationRule: "Target OS returns Win32 Error 5: Access is denied.",
              },
              {
                stepNumber: 2,
                actor: "CPM Error Engine",
                action:
                  "Translates Win32 Error 5 into structured PAM code: `CACPM250E Verification failed: Access is denied`.",
                channelOrProtocol: "Local Error Formatter",
                verificationRule:
                  "CPM writes diagnostic context to `pm.log` and reports failure code to the Vault.",
              },
              {
                stepNumber: 3,
                actor: "Digital Vault",
                action:
                  "Commits failure event to account metadata and audit trail; updates account status pill to 'Verify Failed'.",
                channelOrProtocol: "Encrypted Vault Protocol (TCP 1858)",
                verificationRule: "Audit record timestamped with error code and target address.",
              },
              {
                stepNumber: 4,
                actor: "PAM Administrator",
                action:
                  "Inspects account details in PVWA; sees CACPM250E; consults runbook to adjust target administrative rights.",
                channelOrProtocol: "PVWA Operations Console",
                verificationRule: "Root cause identified accurately without guessing.",
              },
            ],
          },
          terminology: [
            {
              term: "CACPM072E",
              definition:
                "CPM communication failure: Indicates CPM cannot communicate with the Digital Vault on port 1858 or lacks Safe permissions.",
              enterpriseContext:
                "Commonly caused by a stopped Vault service, firewall drop, or missing CPM membership on a newly created Safe.",
            },
            {
              term: "CACPM250E",
              definition:
                "CPM target execution failure: Indicates CPM connected to target, but the target operating system rejected the command or credential.",
              enterpriseContext:
                "Accompanied by OS return codes: Win32 Error 1326 (Bad Password), Win32 Error 5 (Access Denied), Win32 Error 1909 (Locked).",
            },
            {
              term: "PSMSR037E",
              definition:
                "PSM server unavailable: Indicates the client or PVWA cannot reach the PSM service or the PSM service is stopped.",
              enterpriseContext:
                "Commonly caused by RDS licensing exhaustion, stopped CyberArk PSM service, or firewall blocking port 3389.",
            },
            {
              term: "PSMSR126E",
              definition:
                "PSM executable blocked: Indicates that the client binary launched by a connection component was blocked by AppLocker.",
              enterpriseContext:
                "Resolved by updating `PSMConfigureAppLocker.xml` on the PSM host and re-applying AppLocker rules.",
            },
            {
              term: "ITATS108E",
              definition:
                "Unauthorized client station: Indicates an inbound connection to the Vault was rejected because the client IP is not in the authorized node list.",
              enterpriseContext:
                "Occurs when a component server's IP address changes or is misconfigured in `dbparm.ini`.",
            },
          ],
          administratorResponsibilities: [
            "Maintain an active error code runbook mapping common error codes to step-by-step remediation procedures.",
            "Triage CPM rotation errors daily: distinguish between bad passwords (reconcile needed) and network outages (firewall check).",
            "Monitor PSM logs for PSMSR126E errors after software updates or new connection component deployments.",
            "Verify that component static IP addresses match the `AllowNodes` parameter in Vault `dbparm.ini`.",
          ],
          configurationAndAdministration: [
            {
              name: "Error Notification Thresholds",
              settingOrObject: "Platform > Automatic Password Management > Notification",
              description:
                "Configures email alerts dispatched to administrators upon specific CACPM error occurrences.",
              productionBestPractice:
                "Send instant alerts for CACPM072E (infrastructure block) and aggregate CACPM250E into daily digest.",
            },
            {
              name: "AppLocker Whitelist Configuration",
              settingOrObject:
                "C:\\Program Files (x86)\\CyberArk\\PSM\\Hardening\\PSMConfigureAppLocker.xml",
              description:
                "XML file defining allowed executables, DLLs, and publisher rules on the PSM RDS host.",
              productionBestPractice:
                "Always use Publisher/Digital Signature rules rather than plain path rules for commercial client tools.",
            },
            {
              name: "Vault Authorized Node List",
              settingOrObject: "dbparm.ini / AllowNodes parameter",
              description:
                "List of static IP addresses permitted to connect to the Vault over TCP port 1858.",
              productionBestPractice:
                "Update AllowNodes immediately before changing IP addresses on PVWA, CPM, or PSM servers.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Triage CPM Error Code CACPM072E",
              action:
                "Check if error affects a single Safe or all Safes. If single Safe, check Safe members for `PasswordManager`.",
              expectedResult:
                "Adding `PasswordManager` with Add/Update/Manage rights resolves error immediately.",
              operatorNotes:
                "If CACPM072E affects all Safes, test TCP port 1858 reachability from CPM host to Vault.",
            },
            {
              stepNumber: 2,
              title: "Triage Target Error Code CACPM250E",
              action:
                "Open account details in PVWA; read the trailing Win32 error code (e.g., Error 1326: bad password).",
              expectedResult:
                "Root cause determined: credential is out of sync. Click 'Reconcile' to execute elevated reset.",
            },
            {
              stepNumber: 3,
              title: "Remediate PSM AppLocker Error PSMSR126E",
              action:
                "On PSM host, edit `PSMConfigureAppLocker.xml`, add target executable path, and run `PSMConfigureAppLocker.ps1` in PowerShell.",
              expectedResult:
                "AppLocker rules refreshed; subsequent connection launch succeeds cleanly.",
            },
            {
              stepNumber: 4,
              title: "Remediate Vault Station Denial ITATS108E",
              action:
                "On Vault host, open `dbparm.ini`, locate `AllowNodes`, add the new component IP address, and restart PrivateArk Server.",
              expectedResult: "Vault accepts connection on TCP 1858; ITATS108E errors cease.",
            },
          ],
          enterpriseScenario: {
            organization: "Vanguard Global Asset Management",
            businessContext:
              "Following a corporate IP renumbering project across data center management VLANs, 350 production server accounts across 40 Safes began failing automated password rotations with CACPM072E and CACPM250E errors, while users launching PSM sessions were blocked with PSMSR037E. The operations team initially blamed the target servers. The lead PAM administrator executed systematic error taxonomy triage, identifying that the CPM and PSM IP addresses were blocked by the Vault firewall (ITATS108E) and missing from several newly created Safes (CACPM072E), restoring full fleet management in 20 minutes.",
            governanceRequirements: [
              "Zero unmonitored credential rotation failures exceeding 24 hours.",
              "Mandatory logging and root-cause classification of all CACPM and PSMSR error events.",
              "Automated alert routing to on-call PAM engineers upon detection of infrastructure communication errors.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "All accounts in a specific Safe fail rotation: 'CACPM072E Safe access denied for user PasswordManager'.",
              rootCause:
                "The administrator created a new Safe but omitted adding the `PasswordManager` service account as a member.",
              securityImpact:
                "Credential rotation fails; passwords age out and violate corporate policy.",
              cyberArkCodeOrEvent: "CACPM072E",
            },
            {
              symptom:
                "User cannot connect via PSM: 'PSMSR126E [Application] failed to start due to AppLocker rule'.",
              rootCause:
                "An updated version of SQL Server Management Studio (SSMS) was installed on the PSM host without updating AppLocker rules.",
              securityImpact: "DBAs blocked from performing scheduled database maintenance.",
              cyberArkCodeOrEvent: "PSMSR126E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Correlate error code with subsystem log file.",
              logFileOrConsole: "CACPM -> pm.log; PSMSR -> PSMTrace.log; ITATS -> italog.log",
              remediation:
                "Always inspect the raw log file on the generating component host for the full un-truncated error string.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Extract target OS return codes from CACPM250E error messages.",
              logFileOrConsole: "C:\\CyberArk\\Password Manager\\Logs\\pm.log",
              remediation:
                "Look for Win32 Error 5 (Permissions), Error 1326 (Bad Password), or Error 1909 (Account Locked). Apply targeted fix.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Verify Vault station authorization in dbparm.ini.",
              logFileOrConsole: "C:\\Program Files (x86)\\PrivateArk\\Server\\dbparm.ini",
              remediation:
                "Confirm component IP address matches AllowNodes. If mismatch, correct and restart PrivateArk Server.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\pm_error.log",
              sampleOutput:
                "CACPM072E Communication error with Digital Vault. ITATS028E Access denied for user PasswordManager on Safe PROD-DB-SAFE.",
              explanation:
                "Error code CACPM072E wraps Vault error ITATS028E: the CPM user is not a member of Safe PROD-DB-SAFE. Administrator must add PasswordManager to Safe.",
            },
            {
              logFile: "C:\\Program Files (x86)\\CyberArk\\PSM\\Logs\\PSMTrace.log",
              sampleOutput:
                "PSMSR126E [Session 1042] Failed to execute dispatcher for component PSM-RDP. The process C:\\Windows\\System32\\mstsc.exe was blocked by AppLocker.",
              explanation:
                "PSMSR126E confirms the client binary was blocked by Windows AppLocker policies on the PSM RDS host.",
            },
          ],
          instructorNotes: [
            "CACPM072E almost always indicates an infrastructure problem (Vault down, firewall drop, or missing Safe membership). Do not troubleshoot target servers for CACPM072E.",
            "CACPM250E almost always indicates a target endpoint problem (target firewall, bad password, account locked, or missing local admin rights). Focus troubleshooting on the target.",
            "Keep an offline copy of the CyberArk Error Messages Reference Guide on your administrative workstation for instant lookup.",
          ],
          securityImplications: [
            "Rapid Incident Resolution: Understanding error codes minimizes downtime during high-severity production outages.",
            "Avoiding Unnecessary Escalation: Distinguishing between target OS authentication errors and Vault infrastructure errors prevents misdirected support tickets.",
            "Maintaining Audit Compliance: Fast remediation of rotation failures prevents accounts from lingering in non-compliant expired states.",
          ],
          knowledgeCheck: [
            {
              id: "m18-q01",
              question:
                "What is the primary architectural difference between error code CACPM072E and error code CACPM250E?",
              options: [
                "CACPM072E is for Linux; CACPM250E is for Windows.",
                "CACPM072E indicates an infrastructure failure connecting to the Vault or missing Safe permissions; CACPM250E indicates an authentication or execution failure on the target endpoint.",
                "CACPM072E indicates license expiration; CACPM250E indicates network cable unplugged.",
                "There is no difference.",
              ],
              correctIndex: 1,
              explanation:
                "CACPM072E represents communication between CPM and the Vault (e.g. missing Safe membership); CACPM250E represents communication between CPM and the remote target system (e.g. bad password or access denied on target).",
              conceptTested: "CACPM072E vs CACPM250E Subsystem Boundaries",
            },
            {
              id: "m18-q02",
              question:
                "When a user launching a session through PSM receives error PSMSR126E, which subsystem on the PSM host is responsible for blocking the execution?",
              options: [
                "Windows Defender Antivirus",
                "Windows AppLocker",
                "PrivateArk Database",
                "Microsoft IIS Web Server",
              ],
              correctIndex: 1,
              explanation:
                "PSMSR126E specifically indicates an AppLocker execution block on the PSM RDS host. The executable must be added to PSMConfigureAppLocker.xml and re-applied.",
              conceptTested: "PSMSR126E AppLocker Mechanics",
            },
            {
              id: "m18-q03",
              question:
                "What does Vault error code ITATS108E indicate when a component server attempts to connect on TCP 1858?",
              options: [
                "The Vault hard drive is full.",
                "The client station IP address is not authorized in dbparm.ini to connect to the Vault.",
                "The user entered an expired password.",
                "The target server is shutting down.",
              ],
              correctIndex: 1,
              explanation:
                "ITATS108E indicates an unauthorized station IP. The Digital Vault restricts inbound TCP 1858 connections to pre-approved static IP addresses defined in dbparm.ini.",
              conceptTested: "ITATS108E Station Authorization Mechanics",
            },
          ],
          practicalExercise: {
            id: "m18-ex01",
            title: "Diagnose Error Code Taxonomy & Remediate Locked Account (svc_backup)",
            objective:
              "Correlate the simulated CPM lockout failure in Troubleshooting/CPM Operations and execute full Lab 05B recovery (Unlock -> Reconcile -> Change -> Verify) on `svc_backup`.",
            scenario:
              "A recurring rotation alert triggered for `svc_backup` on `WIN-SRV-02`. Inspect the error symptoms in Troubleshooting, identify the account lockout root cause, and execute controlled recovery in CPM Operations so `svc_backup` returns to Managed status.",
            prerequisites: [
              "Review CACPM072E, CACPM250E, PSMSR126E, and ITATS108E error taxonomy in Section 1–4.",
            ],
            startingState:
              "`svc_backup` on `WIN-SRV-02` is in 'Rotation failed' status ('Account locked on target') with Reconcile Pending.",
            instructions: [
              "Open the Troubleshooting console and inspect the open CPM failure incident and diagnostic evidence.",
              "Switch to CPM Operations, select `svc_backup` (WIN-SRV-02), and click 'Unlock target account' to clear the lockout condition.",
              "Execute 'Reconcile' on `svc_backup` to resynchronize Vault and target credentials.",
              "Execute 'Change' and then 'Verify' on `svc_backup` until status transitions to 'Managed', then return to Learning Academy to validate all 5 Lab 05B objectives.",
            ],
            stepDetails: [
              {
                action: "Open Troubleshooting and inspect the open CPM rotation failure incident.",
                explanation:
                  "Mapping symptoms to error taxonomy distinguishes credential lockout from network/ACL issues.",
                expectedResult:
                  "Incident panel identifies the failed CPM rotation and recommended remediation path.",
              },
              {
                action:
                  "Open CPM Operations, select `svc_backup` (WIN-SRV-02), and click 'Unlock target account'.",
                explanation: "Clears the target lockout before attempting reconcile or rotation.",
                expectedResult:
                  "Lockout condition clears and an incident repair audit event is logged.",
              },
              {
                action: "Click 'Reconcile', then 'Change', then 'Verify' on `svc_backup`.",
                explanation:
                  "Restores credential synchronization, rotates the password safely, and verifies live authentication.",
                expectedResult:
                  "All three CPM operations complete and `svc_backup` status becomes 'Managed'.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation: "Validates all 5 Lab 05B failure-recovery objectives.",
                expectedResult: "All 5/5 Lab 05B objectives pass (100/100).",
              },
            ],
            targetConsole: "troubleshooting",
            associatedLabId: "Lab 05B · Recover a failed rotation",
            validationObjectiveId: "inspect-failure",
            validationCriteria:
              "Failure root cause diagnosed and `svc_backup` fully recovered via Unlock, Reconcile, Change, and Verify (5/5 Lab 05B objectives).",
            troubleshootingHints: [
              {
                symptom: "Lab 05B stays at 20% after reviewing Troubleshooting.",
                hint: "Inspecting logs alone only completes 1 of 5 Lab 05B objectives; you must also execute the recovery sequence on `svc_backup`.",
                correctiveAction:
                  "Open CPM Operations, select `svc_backup` (WIN-SRV-02), click Unlock target account -> Reconcile -> Change -> Verify, then re-validate.",
              },
            ],
            independentPractice: {
              title: "Remediate an Additional Open Incident in Troubleshooting Workbench",
              scenario:
                "The Troubleshooting workbench still contains additional open operational incidents.",
              goal: "Without step-by-step guidance, step through the 5-step diagnostic workflow on another open incident in Troubleshooting and execute its remediation.",
              targetConsole: "troubleshooting",
              successCriteria: [
                "Selected an open incident in the Troubleshooting workbench and reviewed its diagnostic evidence.",
                "Completed the guided remediation workflow and confirmed the incident status updated to Resolved.",
              ],
            },
          },
          completionCriteria: [
            "Deconstructed the CACPM, PSMSR, and ITATS error code families.",
            "Analyzed root causes for communication failures, target rejections, and AppLocker blocks.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the diagnostic classification exercise in the Troubleshooting console.",
          ],
          references: [
            "CyberArk Privileged Access Security: Comprehensive Error Codes & Messages Reference Guide",
            "Microsoft TechNet: Win32 System Error Codes Reference (Errors 5, 1326, 1909)",
            "SANS Institute: Structured Incident Triage for Enterprise Privileged Access Infrastructure",
          ],
        },
      ],
    },
  ],
};
