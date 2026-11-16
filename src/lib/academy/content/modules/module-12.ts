/**
 * SHADOWXLAB PAM ACADEMY — MODULE 12: REPORTS
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_12: ClassCurriculum = {
  id: "module-12",
  number: "12",
  label: "MODULE 12",
  title: "Reports",
  subtitle: "Compliance Auditing, SIEM Integration & Immutable Audit Trails",
  duration: "45 mins",
  level: "Associate",
  track: "admin-20",
  category: "Privileged Session Management & Governance",
  overview:
    "Master compliance reporting engines, forensic audit log extraction, and SIEM event streaming. Deconstruct regulatory compliance standards (SOX 404, PCI-DSS 10.2, ISO 27001), built-in report definitions (Inventory, Activity, Entitlements), real-time Syslog / Common Event Format (CEF) forwarding to Splunk and Microsoft Sentinel, and the cryptographic immutability of the Digital Vault audit trail.",
  modules: [
    {
      id: "m12-core",
      number: "M12",
      title: "Audit Governance & Compliance Reporting",
      description:
        "Comprehensive walkthrough of built-in compliance report generation, SIEM integration protocols, Syslog/CEF formatting, and forensic audit verification.",
      lessons: [
        {
          id: "m12-l01",
          number: "12.1",
          title: "Compliance Report Generation & SIEM Forwarding",
          subtitle: "Generating audit-ready compliance reports and streaming real-time CEF events to enterprise SIEMs",
          estimatedMinutes: 25,
          learningObjectives: [
            "Generate standardized compliance reports satisfying SOX, PCI-DSS, and ISO 27001 auditing frameworks.",
            "Deconstruct the cryptographic immutability of the Digital Vault audit trail (append-only ledger).",
            "Configure real-time Syslog forwarding using Common Event Format (CEF) to Splunk, QRadar, and Microsoft Sentinel.",
            "Analyze privileged access activity reports to identify anomalies, policy violations, and unmanaged risks.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 04: Safes.",
            "Module 05: Accounts — Part 1.",
          ],
          conceptIntroduction:
            "In enterprise risk management, actions that cannot be proven to auditors did not happen. When external regulatory auditors arrive—whether for Sarbanes-Oxley (SOX), Payment Card Industry (PCI-DSS), or healthcare HIPAA reviews—their first demand is a comprehensive, tamper-proof accounting of every individual who accessed production systems, when passwords were last rotated, and whether access was independently authorized.\n\nEnterprise PAM provides two complementary mechanisms for compliance and forensic observability:\n1. **Built-in Compliance Reports**: The PVWA includes a dedicated reporting engine capable of generating point-in-time and historical datasets (Privileged Accounts Inventory, Activity Log Report, Safe Entitlement Report). These reports extract data directly from the Vault database and export to CSV, PDF, or Excel formats for auditor sign-off.\n2. **Real-Time SIEM Event Streaming**: While reports are batch-oriented, Security Operations Centers (SOCs) require millisecond-level visibility. The Digital Vault incorporates a native Syslog forwarding daemon (configured via `dbparm.ini`) that streams every administrative action—user login, password checkout, rotation failure, or session termination—directly into enterprise SIEMs (such as Splunk, IBM QRadar, or Microsoft Sentinel) formatted in industry-standard Common Event Format (CEF).\n\nCrucially, Vault audit logs are **cryptographically immutable**. They are stored in append-only database tables protected by the Vault's master encryption keys. Not even the Master Vault Administrator has the authority or mechanism to edit, alter, or delete historical audit records.",
          whyItExists:
            "Compliance fines for unmonitored privileged access routinely reach millions of dollars. The reporting and audit engine provides non-repudiable legal proof that privileged access controls were active, verified, and enforced.",
          architecture: {
            overview:
              "The Vault kernel commits all actions to an immutable audit ledger, while the Syslog translator streams events outbound to enterprise SIEM collectors over encrypted TLS or UDP.",
            componentResponsibilities: [
              {
                component: "Vault Immutable Audit Ledger",
                role: "Append-only database recording every cryptographic transaction, user checkout, CPM rotation, and administrative change.",
                networkProtocols: "Vault Kernel Database Engine (AES-256)",
                securityBoundary: "Tier-0 Immutable Core",
              },
              {
                component: "PVWA Reporting Engine",
                role: "Executes batch queries against Vault data to generate human-readable reports (Inventory, Activity, Entitlements).",
                networkProtocols: "HTTPS Port 443 to Web Clients; TCP 1858 to Vault",
                securityBoundary: "Management Presentation Tier",
              },
              {
                component: "Vault Syslog Translator Daemon",
                role: "Translates internal Vault audit codes (e.g. 7, 24, 355) into standard Common Event Format (CEF) strings and forwards to SIEM.",
                networkProtocols: "Syslog over TLS TCP 6514 / UDP 514",
                securityBoundary: "Outbound Telemetry Gateway",
              },
              {
                component: "Enterprise SIEM (Splunk / Sentinel)",
                role: "Ingests real-time CEF events, correlates PAM activity with endpoint telemetry, and triggers security alerts.",
                networkProtocols: "Syslog / CEF Listener",
                securityBoundary: "Enterprise Security Operations Tier",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Audited Administrator",
                action: "Executes an action in PVWA: checks out credential for `WIN-SRV-01\\Administrator`.",
                channelOrProtocol: "PVWA Web Console",
                verificationRule: "Vault kernel processes request and writes immutable audit record to internal database.",
              },
              {
                stepNumber: 2,
                actor: "Vault Syslog Daemon",
                action: "Captures audit event, formats into CEF message: `CEF:0|CyberArk|Vault|12.6|7|Retrieve Password|0|src=10.0.1.15 dst=WIN-SRV-01 act=Retrieve`.",
                channelOrProtocol: "Encrypted Syslog (TCP 6514)",
                verificationRule: "Syslog daemon transmits packet to configured enterprise SIEM collector.",
              },
              {
                stepNumber: 3,
                actor: "Compliance Officer",
                action: "In PVWA Reports, generates 'Privileged Accounts Inventory' for all production Safes over the last 90 days.",
                channelOrProtocol: "PVWA Reports Console",
                verificationRule: "Vault compiles report; displays account status, last password change date, and platform compliance.",
              },
              {
                stepNumber: 4,
                actor: "Compliance Officer",
                action: "Exports report to CSV/Excel and attaches cryptographic checksum for external regulatory submission.",
                channelOrProtocol: "Secure Download (HTTPS)",
                verificationRule: "Audit trail verifies report generation was logged with user identity and timestamp.",
              },
            ],
          },
          terminology: [
            {
              term: "Immutable Audit Trail",
              definition: "A record of events that cannot be modified, deleted, or overwritten by any user, including the root system administrator.",
              enterpriseContext: "The Vault audit log is append-only; even deleting an account retains the complete historical audit log of that account forever.",
            },
            {
              term: "Common Event Format (CEF)",
              definition: "An industry-standard log formatting syntax developed by ArcSight and adopted universally by modern SIEMs (Splunk, Sentinel).",
              enterpriseContext: "Standardizes field names (e.g., `suser`, `src`, `dst`, `act`) so automated SIEM rules can parse PAM events effortlessly.",
            },
            {
              term: "Privileged Accounts Inventory Report",
              definition: "A comprehensive audit report listing every vaulted account, its Safe, platform, address, owner, and last password rotation date.",
              enterpriseContext: "The primary artifact requested by SOX and ISO auditors to verify that all privileged credentials are accounted for.",
            },
            {
              term: "Safe Entitlement Report",
              definition: "A report mapping every user and security group to their explicit granular permissions across all Safes in the Vault.",
              enterpriseContext: "Used during quarterly access certifications to identify over-privileged users and enforce least privilege.",
            },
          ],
          administratorResponsibilities: [
            "Configure and test outbound Syslog forwarding to enterprise SIEM collectors via encrypted TLS.",
            "Schedule automated weekly or monthly compliance reports and archive them to secure compliance storage.",
            "Audit Vault activity logs weekly for unusual access spikes, failed logins, or after-hours credential checkouts.",
            "Verify that log retention periods meet regulatory requirements (e.g., 365 days for PCI-DSS 10.7).",
          ],
          configurationAndAdministration: [
            {
              name: "Syslog Server Configuration",
              settingOrObject: "dbparm.ini on Vault Server",
              description: "Configures Syslog server IP, port (514/6514), protocol (UDP/TLS), and translator file (`ArcSight.sample.xsl`).",
              productionBestPractice: "Always use TLS on TCP port 6514 with mutual certificate authentication to prevent log interception or spoofing.",
            },
            {
              name: "Audit Event Filtering (SyslogMessageCodeFilter)",
              settingOrObject: "dbparm.ini / SyslogMessageCodeFilter",
              description: "Specifies which Vault action codes (e.g. 7=Retrieve, 24=Store, 355=PSM Session) are forwarded to SIEM.",
              productionBestPractice: "Forward all critical security codes: 7, 24, 30, 31, 355, 356, 357 to avoid alert noise while catching all access.",
            },
            {
              name: "Report Generation Schedule",
              settingOrObject: "PVWA Reports > Scheduled Reports",
              description: "Configures automated recurring report jobs and designated email recipient distribution lists.",
              productionBestPractice: "Schedule heavy inventory reports to run on weekends to avoid impacting interactive PVWA daytime performance.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Open Reports & Audit Console",
              action: "In PVWA, navigate to Reports & Audit Console to review historical audit events.",
              expectedResult: "Audit table loads displaying Date/Time, User, Action, Target, and Result.",
              operatorNotes: "Filter events by Action (e.g., 'Change', 'Connect', 'Retrieve') to narrow analysis.",
            },
            {
              stepNumber: 2,
              title: "Generate Privileged Inventory Report",
              action: "Under Reports, select 'Privileged Accounts Inventory', choose Safes: All Safes, and click 'Generate'.",
              expectedResult: "Report compiles; shows total account count, managed percentage, and days since last rotation.",
            },
            {
              stepNumber: 3,
              title: "Verify Outbound Syslog Forwarding",
              action: "On the enterprise SIEM (Splunk/Sentinel), query index: `index=pam sourcetype=cyberark:vault`.",
              expectedResult: "Real-time CEF messages arrive corresponding to current administrative clicks in the PVWA.",
            },
            {
              stepNumber: 4,
              title: "Audit Password Change Failures",
              action: "Filter audit log for Result: 'Failed' and Action: 'Change' to identify broken credentials requiring reconciliation.",
              expectedResult: "Displays list of failed rotation events with associated CPM error codes (e.g., CACPM072E).",
            },
          ],
          enterpriseScenario: {
            organization: "Apex Global Financial Services",
            businessContext:
              "Apex Financial undergoes annual Sarbanes-Oxley (SOX) Section 404 audits and PCI-DSS Level 1 compliance evaluations. During a previous audit, external auditors discovered that the legacy PAM system could not prove that database root passwords had been rotated after a contractor resigned. The company faced a $2.5M fine and severe reputational damage. The PAM administrator was directed to configure automated monthly SOX compliance reports and stream real-time CEF events to the corporate Splunk SIEM.",
            governanceRequirements: [
              "Automated generation and immutable archiving of quarterly Privileged Inventory Reports.",
              "100% of credential checkouts and password changes streamed to Splunk in Common Event Format (CEF).",
              "Indelible retention of all audit records for a minimum of 7 years in accordance with FINRA requirements.",
            ],
          },
          failureScenarios: [
            {
              symptom: "SIEM stops receiving PAM audit events: 'No events from Vault in the last 60 minutes'.",
              rootCause: "The Vault Syslog service dropped the connection due to an expired TLS certificate on the Syslog collector.",
              securityImpact: "SOC blind to privileged access activity; potential delayed detection of active insider attacks.",
              cyberArkCodeOrEvent: "SYSLOG-FAIL",
            },
            {
              symptom: "Report generation in PVWA times out: 'HTTP 504 Gateway Timeout'.",
              rootCause: "Report scope was too broad (querying 20,000 accounts with 5 years of history without date filters).",
              securityImpact: "Administrator unable to export required audit data for visiting regulators.",
              cyberArkCodeOrEvent: "TIMEOUT-504",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Check Vault communication log for Syslog connection and SSL errors.",
              logFileOrConsole: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              remediation: "Search for 'Failed to send Syslog message'. Verify collector IP, port, and firewall reachability.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Test Syslog port reachability from Vault server (if network permits) or test from secondary node.",
              logFileOrConsole: "italog.log / dbparm.ini",
              remediation: "Confirm that intermediate firewalls permit outbound traffic from Vault to SIEM on TCP 6514.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Scope report queries to specific Safes and shorter date windows (e.g., 30–90 days).",
              logFileOrConsole: "PVWA Reports Console",
              remediation: "Break large corporate reports into departmental batches (e.g., Windows Safes first, then Unix Safes).",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 18:00:01 Syslog event sent: CEF:0|CyberArk|Vault|12.6|7|Retrieve Password|5|suser=sec_analyst dst=WIN-SRV-01 act=Retrieve\n15/11/2026 18:00:02 Report 'SOX_Q4_Inventory' generated successfully by user auditor_dan.",
              explanation:
                "Vault Syslog engine and Reporting engine executed normally, forwarding real-time CEF events to SIEM and generating compliance reports.",
            },
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 18:05:22 ITATS438E Failed to send Syslog message to 10.0.100.50:6514. TLS handshake failure: Remote certificate untrusted.",
              explanation:
                "The SIEM collector's TLS certificate was renewed with an internal CA whose root certificate was not installed in the Vault server's certificate store.",
            },
          ],
          instructorNotes: [
            "Never open inbound ports to the Vault for SIEM collectors. The Vault pushes Syslog outbound; it never listens for incoming SIEM queries.",
            "Use Common Event Format (CEF) over raw RFC 3164 text. Modern SIEM tools have pre-built CyberArk/PAM content packs that parse CEF instantly.",
            "Audit reports generated in PVWA are themselves audited: the audit log records who ran the report and which Safes were inspected.",
          ],
          securityImplications: [
            "Regulatory Defense: Clean, complete audit trails prevent multi-million-dollar non-compliance fines during external regulatory examinations.",
            "SOC Threat Hunting: Correlating PAM CEF events with EDR alerts enables immediate detection of lateral movement (e.g. PAM checkout followed by anomalous domain replication).",
            "Non-Repudiation: Immutable append-only audit ledgers guarantee that administrators cannot cover their tracks by altering system history.",
          ],
          knowledgeCheck: [
            {
              id: "m12-q01",
              question: "Why is the Digital Vault audit trail described as 'cryptographically immutable'?",
              options: [
                "Because audit records are stored in append-only tables encrypted with Vault master keys, and cannot be edited or deleted by any user or administrator.",
                "Because it is written onto write-once optical CD-ROMs.",
                "Because audit logs are automatically deleted after 24 hours.",
                "Because only Microsoft can read the log files.",
              ],
              correctIndex: 0,
              explanation:
                "The Vault kernel enforces strict immutability: audit records can only be appended, never updated or deleted, ensuring non-repudiable forensic evidence even if an administrative account is compromised.",
              conceptTested: "Audit Immutability & Forensic Integrity",
            },
            {
              id: "m12-q02",
              question: "Which standardized message format is recommended for streaming real-time PAM audit events to modern SIEMs such as Splunk and Microsoft Sentinel?",
              options: [
                "Plain Unformatted ASCII",
                "Common Event Format (CEF)",
                "HTML Web Pages",
                "Binary Hex Dumps",
              ],
              correctIndex: 1,
              explanation:
                "Common Event Format (CEF) provides structured key-value pairs (suser, src, dst, act) that SIEM platforms parse automatically for real-time alerting and dashboarding.",
              conceptTested: "SIEM Integration & Common Event Format (CEF)",
            },
            {
              id: "m12-q03",
              question: "Which compliance report is the primary artifact required by SOX 404 and ISO 27001 auditors to verify that all privileged credentials are accounted for and managed?",
              options: [
                "Privileged Accounts Inventory Report",
                "Network Ping Latency Report",
                "Printer Paper Consumption Report",
                "CPU Clock Speed History",
              ],
              correctIndex: 0,
              explanation:
                "The Privileged Accounts Inventory Report documents every privileged account, its assigned Safe, Platform, target address, owner, and rotation compliance status.",
              conceptTested: "Compliance Reporting Best Practices",
            },
          ],
          practicalExercise: {
            id: "m12-ex01",
            title: "Inspect Compliance Audit Trails and Review Operations Evidence",
            scenario:
              "Navigate to the Reports & Audit console to inspect historical audit events, filter credential checkouts and password change results, and verify that operational evidence is captured accurately.",
            instructions: [
              "Navigate to the Reports & Audit console.",
              "Review the chronological audit trail of privileged operations.",
              "Filter events by Action (e.g. Change, Connect, Verify) and Result (Success, Denied, Failed).",
              "Verify that audit records contain timestamp, user identity, target asset, and result.",
            ],
            targetConsole: "audit",
            associatedLabId: "Lab 05A · Verify credential status",
            validationObjectiveId: "inspect-result",
            validationCriteria:
              "The Reports & Audit console is inspected and privileged activity evidence is verified.",
          },
          completionCriteria: [
            "Deconstructed compliance reporting frameworks (SOX, PCI-DSS, ISO 27001).",
            "Evaluated immutable audit ledgers and real-time CEF Syslog integration.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the audit trail inspection in the Reports & Audit console.",
          ],
          references: [
            "PCI-DSS v4.0 Requirement 10: Log and Monitor All Access to System Components",
            "Sarbanes-Oxley (SOX) Section 404: Internal Controls Assessment Guidelines",
            "Micro Focus / OpenText Common Event Format (CEF) Implementation Standard",
          ],
        },
      ],
    },
  ],
};
