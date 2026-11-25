/**
 * MODULE 09 — MONITORING, AUDITING AND REPORTING
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 2 Hours | Day: 4 | Domain: Session Management and Auditing (15%)
 * Practical: Analyze sample PAM audit events and identify suspicious activity.
 * Learning Outcome: Interpret basic PAM audit evidence and explain its value to security operations.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_09: ClassCurriculum = {
  id: "client-m09",
  number: "09",
  label: "MODULE 09",
  title: "Monitoring, Auditing and Reporting",
  subtitle: "Audit Fundamentals, Anomaly Detection, SOC Compliance & Suspicious Event Forensics",
  duration: "2 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Session Management and Auditing",
  overview:
    "Explore the principles of PAM audit logging, compliance reporting, and threat monitoring. Covers audit record types (user activity, account access, administrative modifications, session events), recognizing anomalous access patterns (repeated failures, off-hours logins, suspicious commands), generating compliance evidence, and integrating PAM telemetry with Security Operations Center (SOC) SIEM platforms.",
  modules: [
    {
      id: "cm09-core",
      number: "M09",
      title: "Monitoring, Auditing and Reporting",
      description:
        "Audit fundamentals, behavioral monitoring, compliance reporting, SOC workflows, and forensics.",
      lessons: [
        {
          id: "cm09-l01",
          number: "9.1",
          title: "Audit Logging, SOC Telemetry & Suspicious Activity Forensics",
          subtitle:
            "Audit Record Types, Anomalous Access Patterns, SIEM Concepts & Forensic Event Analysis",
          estimatedMinutes: 120,
          learningObjectives: [
            "Interpret basic PAM audit evidence and explain its value to security operations.",
            "Identify the four major categories of PAM audit records: user authentication, credential access, administrative changes, and session events.",
            "Detect suspicious privileged activity such as repeated access failures, unusual access times, and privilege escalation indicators.",
            "Explain how PAM reports satisfy regulatory compliance frameworks (SOX, PCI-DSS, ISO 27001, HIPAA).",
            "Describe the architecture of SIEM integration (Syslog, CEF, LEEF) for real-time threat monitoring in the SOC.",
            "Analyze sample PAM audit events and identify anomalous or unauthorized activity in a simulated environment.",
          ],
          prerequisites: [
            "Completion of Module 01 through Module 08.",
            "Basic understanding of security event logging and Security Operations Center (SOC) fundamentals.",
          ],
          conceptIntroduction:
            "In privileged security, what cannot be measured and audited cannot be defended. CyberArk's audit architecture is designed around non-repudiation: every action—whether a user searches for an account, copies a password, launches a session, or an administrator modifies a Safe—generates an immutable audit record sealed inside the Digital Vault. These audit streams serve two primary missions: (1) Compliance, proving to external auditors that privileged access is strictly governed, and (2) Threat Detection, feeding real-time telemetry to the Security Operations Center (SOC) to catch credential abuse and malicious insider activity before damage occurs.",
          whyItExists:
            "Standard endpoint event logs (such as Windows Event Logs or Linux syslog) can be cleared, modified, or stopped by local administrators. By centralizing audit records inside the hardened Digital Vault, CyberArk ensures that even if an attacker gains root or domain admin access, they cannot tamper with or erase the forensic evidence of their intrusion.",
          architecture: {
            overview:
              "Audit events originate from PVWA, CPM, PSM, and the Vault kernel itself. All events are written synchronously to the Vault's internal tamper-proof audit journal. In addition, the Vault can stream events in real time to external SIEM collectors (Splunk, Microsoft Sentinel, IBM QRadar) using Syslog over TLS.",
            componentResponsibilities: [
              {
                component: "Digital Vault Audit Engine",
                role: "Generates, encrypts, and permanently commits audit records to the Vault journal.",
                networkProtocols: "Internal Vault Kernel",
                securityBoundary: "WORM-compliant (Write Once, Read Many) immutable storage.",
              },
              {
                component: "Reports & Audit Console (PVWA)",
                role: "Provides graphical search, filtering, and report generation for compliance auditors.",
                networkProtocols: "HTTPS (TCP 443)",
                securityBoundary: "Role-based auditor access tier.",
              },
              {
                component: "SIEM Forwarder (Syslog/TLS)",
                role: "Streams structured security events (CEF/Syslog) to the enterprise SOC in real-time.",
                networkProtocols: "Syslog over TLS (TCP 6514 / UDP 514)",
                securityBoundary: "Outbound telemetry channel.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "User or Service",
                action:
                  "Executes an action in PAM (e.g. checks out credential or launches session).",
                channelOrProtocol: "PVWA or Component API",
                verificationRule: "Action processed by Vault.",
              },
              {
                stepNumber: 2,
                actor: "Vault Kernel",
                action:
                  "Generates an atomic audit record containing User, Target, Safe, Action, Timestamp, and Outcome.",
                channelOrProtocol: "Vault Database",
                verificationRule:
                  "Audit record assigned sequential sequence number and cryptographic hash.",
              },
              {
                stepNumber: 3,
                actor: "Vault SIEM Engine",
                action:
                  "Optionally translates audit record into Common Event Format (CEF) and transmits to SOC SIEM.",
                channelOrProtocol: "Syslog TLS 6514",
                verificationRule: "Real-time delivery to SOC correlation rules.",
              },
              {
                stepNumber: 4,
                actor: "Security Analyst",
                action:
                  "Reviews audit evidence in Reports & Audit console or SIEM dashboard to investigate anomalies.",
                channelOrProtocol: "PVWA / SIEM UI",
                verificationRule: "Analyst correlates event with change tickets or alerts.",
              },
            ],
          },
          terminology: [
            {
              term: "Immutable Audit Log",
              definition:
                "A log format where records, once committed, cannot be edited, overwritten, or deleted by any user or administrator.",
              enterpriseContext:
                "Guarantees non-repudiation during post-incident legal investigations.",
            },
            {
              term: "Non-Repudiation",
              definition:
                "The assurance that an individual cannot deny the authenticity of their signature on a document or the sending of a message that they originated.",
              enterpriseContext:
                "Ensures an admin cannot claim 'someone else logged in with my account' when MFA is enforced.",
            },
            {
              term: "Common Event Format (CEF)",
              definition:
                "A standardized logging format designed by ArcSight and adopted industry-wide for parsing security events into SIEM tools.",
              enterpriseContext:
                "Standard format used by CyberArk to stream telemetry to Splunk or Sentinel.",
            },
            {
              term: "Privileged Access Anomaly",
              definition:
                "Any deviation from normal administrative baseline behavior (e.g., access at 3:00 AM, bulk credential checkouts, or unexpected IP locations).",
              enterpriseContext:
                "Triggers immediate SOC investigation for potential account compromise.",
            },
            {
              term: "Entitlement / Access Review",
              definition:
                "A periodic governance process where Safe owners and managers verify that each user's current permissions are still justified.",
              enterpriseContext: "Required for SOX 404 and ISO 27001 compliance certification.",
            },
          ],
          administratorResponsibilities: [
            "Regularly review PAM audit reports for failed authentication spikes or unusual access patterns.",
            "Generate scheduled monthly privileged account inventory and activity reports for compliance auditors.",
            "Ensure the SIEM integration is active and verify that syslog test messages are received by the SOC.",
            "Coordinate with the SOC to establish automated alerts for high-risk events (such as break-glass checkouts).",
          ],
          configurationAndAdministration: [
            {
              name: "SIEM Syslog Integration",
              settingOrObject: "DBParcel.ini / Administration -> SIEM Integration",
              description:
                "Configures SIEM server IP, port, format (RFC 5424 / CEF), and facility code.",
              productionBestPractice:
                "Always use TLS encryption (TCP 6514) for SIEM syslog forwarding.",
            },
            {
              name: "Privileged Activity Reporting",
              settingOrObject: "Reports -> Generate Report -> Privileged Accounts Activity",
              description:
                "Generates automated CSV/PDF reports detailing all credential checkouts within a time range.",
              productionBestPractice:
                "Schedule weekly automated activity reports sent directly to compliance teams.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Audit Log Inspection",
              action:
                "Navigate to Reports & Audit console and filter events by date, user, or action type.",
              expectedResult: "Audit table populates with chronological security events.",
            },
            {
              stepNumber: 2,
              title: "Suspicious Event Analysis",
              action:
                "Search for repeated failed access attempts (e.g. multiple 'Access Denied' entries) or off-hours actions.",
              expectedResult:
                "Flag suspicious events, identify originating IP, and trace targeted Safe.",
            },
            {
              stepNumber: 3,
              title: "Compliance Report Export",
              action:
                "Export account inventory and access audit history to CSV for external audit documentation.",
              expectedResult: "Structured compliance report generated.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "A SOC alert flags three consecutive failed password retrieval attempts on the Tier 0 Domain Controller account in 'WIN-SAFE' at 2:15 AM originating from an unfamiliar IP address. A security analyst must review the audit logs, identify the user identity, verify the outcome, and document the incident.",
            governanceRequirements: [
              "Immediate forensic analysis of the suspicious event sequence.",
              "Verify whether the Vault successfully blocked the unauthorized access attempts.",
              "Generate a compliance incident record for the security committee.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Rapid sequence of 5 failed login attempts followed by an account checkout.",
              rootCause:
                "Credential stuffing or brute force attack against a privileged operator identity.",
              securityImpact:
                "Potential unauthorized access if attacker successfully guesses credentials.",
              cyberArkCodeOrEvent: "ITATS006E-BRUTE-FORCE",
            },
            {
              symptom: "SOC reports zero syslog events received from CyberArk for 48 hours.",
              rootCause:
                "Syslog daemon stopped on Vault or intermediate firewall dropped port 6514.",
              securityImpact: "Loss of real-time monitoring visibility; delayed incident response.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Open Reports & Audit console and inspect the chronological event log.",
              logFileOrConsole: "PVWA -> Reports & Audit",
              remediation:
                "Locate event ID; filter by username to isolate the full session history.",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Verify whether the target account credential was accessed or if access was blocked.",
              logFileOrConsole: "Event Details Pane",
              remediation:
                "Confirm Vault blocked the access (Action: 'Access Denied / Unauthorized').",
            },
          ],
          securityImplications: [
            "Failing to monitor audit logs allows active breaches to dwell undetected for months.",
            "Unsynchronized clocks across components can corrupt audit timestamps, invalidating legal evidence.",
            "Lack of SIEM forwarding creates operational blind spots between PAM and network security tools.",
          ],
          knowledgeCheck: [
            {
              id: "cm09-q01",
              question:
                "Why are CyberArk audit logs stored inside the Digital Vault considered legally and forensically superior to standard endpoint event logs?",
              options: [
                "They use less disk space than Windows event logs.",
                "They are stored in a hardened, tamper-proof (WORM) format that cannot be modified or erased even by system administrators.",
                "They are automatically translated into 50 foreign languages.",
                "They do not record the timestamp of the event.",
              ],
              correctIndex: 1,
              explanation:
                "Digital Vault audit logs are immutable and cryptographically sealed. Even if an attacker compromises a target host and wipes local event logs, the Vault's central record remains intact and untampered.",
              conceptTested: "Audit Immutability & Non-Repudiation",
            },
            {
              id: "cm09-q02",
              question:
                "Which of the following audit event patterns should immediately trigger a high-severity alert in a Security Operations Center (SOC)?",
              options: [
                "An administrator accesses a standard file server during regular business hours with an approved change ticket.",
                "Multiple repeated failed password retrieval attempts on a Tier 0 Domain Controller account occurring at 2:00 AM without an approved ticket.",
                "CPM successfully rotates a password at its scheduled 30-day interval.",
                "A user changes their PVWA interface color theme to dark mode.",
              ],
              correctIndex: 1,
              explanation:
                "Unscheduled, off-hours access attempts—especially repeated failures against critical Tier 0 accounts—are classic indicators of compromise (IoCs) and require immediate SOC triage.",
              conceptTested: "Suspicious Activity Detection",
            },
            {
              id: "cm09-q03",
              question:
                "What standard industry log format is most commonly used by CyberArk to stream real-time audit telemetry to external SIEM platforms such as Splunk, Microsoft Sentinel, or IBM QRadar?",
              options: [
                "Common Event Format (CEF) or Syslog over TLS",
                "Plain Microsoft Word (.docx) documents",
                "HTML email tables sent once per week",
                "Binary core dumps",
              ],
              correctIndex: 0,
              explanation:
                "CyberArk formats real-time security events using Common Event Format (CEF) or RFC-compliant Syslog, typically transmitted over TLS (TCP 6514) to SIEM platforms.",
              conceptTested: "SIEM Integration Formats",
            },
          ],
          practicalExercise: {
            id: "cm09-ex01",
            title: "Audit Event Forensics, Anomalous Access Detection & Compliance Reporting",
            objective:
              "Inspect the audit event journal in the Reports & Audit console, analyze sample PAM events, identify suspicious activity, and review compliance documentation.",
            scenario:
              "Navigate to the Reports & Audit console to examine recent security events. Locate the audit record generated by privileged access on WIN-SRV-01, identify the actor, timestamp, and target, and analyze a simulated unauthorized access denial event.",
            prerequisites: ["Completion of Module 01-08"],
            startingState: "Populated audit event log in Reports & Audit console.",
            instructions: [
              "Navigate to Reports & Audit console.",
              "Review the chronological list of audit events (logins, Safe accesses, password changes, session events).",
              "Select a session event to inspect its detailed metadata (Actor: pam_admin, Target: WIN-SRV-01, Event: Monitored Session).",
              "Identify any simulated 'Access Denied' or unauthorized attempts and review the root cause.",
              "Validate the operational exercise.",
            ],
            stepDetails: [
              {
                action: "Navigate to Reports & Audit Console",
                explanation: "Open the audit journal interface.",
                expectedResult: "Audit table loaded with event history.",
              },
              {
                action: "Inspect Session Audit Event",
                explanation: "Review actor attribution, timestamps, and target host.",
                expectedResult: "Event details pane rendered.",
              },
              {
                action: "Analyze Suspicious Access Event",
                explanation:
                  "Inspect an unauthorized access denial and verify defense-in-depth enforcement.",
                expectedResult: "Forensic analysis verified.",
              },
            ],
            targetConsole: "audit",
            associatedLabId: "Client M09 · Monitoring, Auditing and Reporting",
            validationObjectiveId: "obj-cm09-audit",
            validationCriteria:
              "Analyze PAM audit events, verify session audit records, and confirm understanding of SOC telemetry in the simulator.",
            simulationLimitationNote:
              "Audit records and compliance reports are generated within the deterministic PAM simulator engine. Real-world SIEM forwarding (Syslog/CEF/LEEF) and external syslog servers are simulated via structured event streaming in the Reports & Audit console.",
            troubleshootingHints: [
              {
                symptom: "No session audit records appear in the list.",
                hint: "Complete the practical exercise in Module 08 first to generate a monitored session audit record.",
                correctiveAction: "Run Lab 06A to populate session audit history.",
              },
            ],
            independentPractice: {
              title: "Independent Forensic Analysis",
              scenario:
                "Filter the audit log by action type 'Password Change' and verify that CPM automated rotations are logged with CPM service account attribution.",
              goal: "Confirm understanding of automated vs human audit event attribution.",
              targetConsole: "audit",
              successCriteria: [
                "Locate a CPM automated change event.",
                "Verify the actor is identified as CPM service account rather than a human user.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Analyze sample PAM audit events in the Reports & Audit console.",
            "Understand SIEM integration concepts and review simulation limitation notice.",
          ],
          references: [
            "CyberArk Audit and Reporting Administration Guide",
            "CyberArk SIEM Integration & CEF Event Dictionary",
            "NIST SP 800-92: Guide to Computer Security Log Management",
          ],
        },
      ],
    },
  ],
};
