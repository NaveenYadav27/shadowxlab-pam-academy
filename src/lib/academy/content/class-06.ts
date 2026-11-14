/**
 * SHADOWXLAB PAM ACADEMY — CLASS 06: PSM OPERATIONS & SESSION MANAGEMENT
 * Deep instructional content covering PSM architecture, session isolation,
 * connection components, live session monitoring, keystroke auditing, and incident termination.
 */

import type { ClassCurriculum } from "../types";

export const CLASS_06: ClassCurriculum = {
  id: "class-06",
  number: "06",
  label: "CLASS 06",
  title: "Privileged Session Manager (PSM) Architecture & Monitoring",
  subtitle: "Connection Brokering, Credential Injection, Live Monitoring & Forensic Recording",
  duration: "2H 00M",
  level: "Advanced",
  overview:
    "Master the architecture and operations of CyberArk Privileged Session Manager (PSM). Understand connection component workflows, transparent server-side credential injection, ticket-based dual control, live session termination, and forensic keystroke audit trails.",
  modules: [
    {
      id: "c06-m01",
      number: "M1",
      title: "Privileged Session Manager Jump Server Architecture & Protocol Isolation",
      description:
        "Understand the mechanical execution of PSM proxying, credential masking, ticket-based authorization, live session monitoring, and emergency termination.",
      lessons: [
        {
          id: "c06-m01-l01",
          number: "6.1",
          title: "PSM Connection Brokering & Credential Injection Mechanics",
          subtitle:
            "Session Handshakes, Transparent Memory Injection, and Air-Gapped Endpoint Isolation",
          estimatedMinutes: 25,
          learningObjectives: [
            "Explain how PSM acts as an air-gapped jump server isolating client endpoints from target infrastructure.",
            "Trace the server-side credential injection mechanism that prevents operators from viewing target passwords.",
            "Configure ticket-based authorization (ServiceNow / Remedy) requiring valid change numbers to launch sessions.",
            "Demonstrate live session monitoring, interactive keystroke logging, and immediate administrator session termination.",
          ],
          prerequisites: [
            "Completion of Classes 01 through 05.",
            "Understanding of RDP (3389) and SSH (22) protocol mechanics.",
          ],
          conceptIntroduction:
            "Privileged Session Manager (PSM) is a hardened proxy and jump server that brokers all interactive administrative access to target systems. When an administrator requires access to a Windows server, Linux bastion, or database, they do not connect directly to the target. Instead, they authenticate to PVWA and initiate a PSM session. PSM retrieves the target credentials from the Digital Vault, establishes an isolated session to the target host, and transparently injects the credentials into the target protocol in memory on the PSM server.",
          whyItExists:
            "If administrators connect directly to servers from their corporate laptops, any malware or keylogger on the laptop can intercept passwords, steal Kerberos tickets, or tamper with open terminal sessions. By forcing all privileged access through PSM, client endpoints never touch target networks or credentials directly. Furthermore, PSM captures full video recordings and text keystroke logs of every action, providing undeniable forensic evidence for compliance and incident response.",
          architecture: {
            overview:
              "PSM utilizes specialized Connection Components (e.g. PSM-RDP, PSM-SSH, PSM-SQLPlus) hosted on hardened Windows Remote Desktop Session Host (RDSH) servers with restricted user privileges.",
            diagramAscii: `
[ OPERATOR CLIENT WORKSTATION ]
  - Connects to PVWA over HTTPS (Port 443)
  - Enters ServiceNow Change Ticket: CHG-10294
  - Clicks "Connect" ──► Downloads encrypted .rdp session token
            │
            ▼ (RDP Connection over TCP 3389 / HTML5 GW 443)
[ HARDENED CYBERARK PSM JUMP SERVER ]
  - Authenticates operator using temporary Vault token
  - Contacts Digital Vault (TCP 1858) ──► Fetches Target Secret into memory
  - Spawns isolated Windows/Linux client process (e.g. mstsc.exe / plink.exe)
  - Transparently injects credentials into client logon memory
  - Starts screen capture and keystroke logging engine
            │
            ▼ (Outbound Target Protocol: RDP 3389 / SSH 22 / SQL 1521)
[ PRODUCTION ENTERPRISE TARGET HOST ]
  - Windows Domain Controller / Linux Mainframe / Core Database
  - Target logs logon from PSM Jump Server IP
  - Zero client workstation footprint on target network!
`,
            componentResponsibilities: [
              {
                component: "PSM Connection Broker",
                role: "Authenticates client RDP connection, validates session ticket, and requests secret from Vault.",
                securityBoundary:
                  "Hardened Windows RDS server; client clipboard and local drive redirection disabled.",
              },
              {
                component: "Connection Component",
                role: "The specialized automation executable (e.g., PSM-RDP, PSM-SSH) that logs into the target protocol.",
                securityBoundary:
                  "Executed under restricted ephemeral shadow user accounts with strict AppLocker rules.",
              },
              {
                component: "Session Recorder",
                role: "Captures compressed video stream and indexing OCR/keystroke metadata simultaneously.",
                securityBoundary:
                  "Encrypted recording files written to Vault Safe (PSMRecordings) upon session close.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Operator",
                action:
                  "Selects account root on LNX-SRV-01 in PVWA, enters Ticket ID 'CHG-10294', and clicks Connect.",
                channelOrProtocol: "HTTPS 443",
                verificationRule:
                  "PVWA checks if ticketing integration is satisfied and generates signed session token.",
              },
              {
                stepNumber: 2,
                actor: "PSM Server",
                action:
                  "Establishes proxy connection, retrieves vaulted root password, and launches SSH connection to target.",
                channelOrProtocol: "TCP 1858 & SSH 22",
                verificationRule:
                  "Credential injected directly into SSH client memory; never sent to operator workstation.",
              },
              {
                stepNumber: 3,
                actor: "Session Monitor",
                action:
                  "Records all keystrokes in real time. If a blacklisted command is entered (e.g., 'rm -rf /'), triggers alert.",
                channelOrProtocol: "Internal PSM Audit Engine",
                verificationRule:
                  "Security Officer can view live session and click 'Terminate' to instantly sever the connection.",
              },
            ],
          },
          terminology: [
            {
              term: "Connection Component",
              definition:
                "A CyberArk PAS configuration definition specifying the target executable, protocol parameters, and window title handling used by PSM to connect to a specific application or server type.",
              enterpriseContext:
                "Examples include PSM-RDP for Windows, PSM-SSH for Linux, and PSM-Toad for database administration.",
            },
            {
              term: "Credential Injection",
              definition:
                "The automated technique where PSM intercepts the target authentication dialog in memory and inputs the vaulted password without displaying it on the operator's screen.",
              enterpriseContext:
                "Eliminates credential theft by ensuring users never possess the secrets required to log into servers.",
            },
            {
              term: "Live Session Monitoring",
              definition:
                "An administrative capability in PVWA allowing authorized security analysts to watch an active administrator's screen in real time and terminate the session if suspicious behavior is detected.",
              enterpriseContext:
                "Required for high-risk Tier-0 infrastructure modifications and regulatory audits.",
            },
          ],
          administratorResponsibilities: [
            "Maintain AppLocker rules on PSM jump servers to allow only certified administrative connection executables.",
            "Review active sessions daily and investigate high-risk command triggers flagged by the audit engine.",
            "Ensure PSM recording Safes have adequate storage capacity and retention policies configured.",
          ],
          configurationAndAdministration: [
            {
              name: "RequireTicketingValidation",
              settingOrObject: "Platform Policy > Privileged Session Management > Ticket System",
              description:
                "Mandates that operators enter an approved change request or incident ticket number prior to launching a session.",
              productionBestPractice:
                "Enable ticket validation for all production database and Domain Controller accounts.",
            },
            {
              name: "Keystroke Text Logging",
              settingOrObject:
                "Platform Policy > Privileged Session Management > EnableTextRecorder",
              description:
                "Extracts searchable textual keystrokes from terminal sessions for instant audit querying.",
              productionBestPractice:
                "Always enable Text Recorder on all SSH and command-line connection components.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Launch an Approved PSM Session",
              action:
                "In Accounts console, locate target account, click 'Connect (PSM)', provide change ticket number, and launch terminal.",
              expectedResult:
                "PSM console opens with live recording indicator (● REC) and command prompt ready for execution.",
            },
            {
              stepNumber: 2,
              title: "Monitor and Terminate an Active Session",
              action:
                "Navigate to PSM Operations console, locate the active session in the work queue, and click 'Terminate'.",
              expectedResult:
                "PSM instantly severs target socket connection and archives final recording in Vault.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "A contractor required emergency access to transaction server LNX-SRV-01. Access was approved under change request CHG-10294. GFS SOC threat hunters monitored the live SSH session and observed an unapproved attempt to dump the user shadow file.",
            governanceRequirements: [
              "Immediate session termination within 15 seconds of blacklisted command execution.",
              "Automatic generation of immutable incident audit package for compliance forensics.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Operator clicks Connect but session fails with 'PSMSR126E [SessionID] Failed to connect to target' (Network unreachable).",
              rootCause:
                "Target server firewall or intermediate network security group blocking TCP 22 or 3389 from the PSM server IP.",
              securityImpact:
                "Operator cannot establish administrative session; requires firewall rule correction.",
            },
            {
              symptom:
                "PSM connection aborts with 'PSMSR037E Privileged Session Manager server is not configured in the Vault'.",
              rootCause:
                "The PSM server object in the Vault database is disabled or its Vault.ini credentials expired.",
              securityImpact:
                "All operators routed through this specific PSM node fail to connect.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Verify network routing from PSM server to target using Test-NetConnection -Port 3389 <TargetIP>.",
              logFileOrConsole: "PSM Server PowerShell terminal.",
              remediation:
                "Add firewall permit rule allowing PSM subnet to access target management ports.",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Inspect C:\\Program Files (x86)\\CyberArk\\PSM\\Logs\\PSMTrace.log.",
              logFileOrConsole: "PSMTrace.log / PSMConsole.log",
              remediation:
                "Search for Session ID to locate the exact handshake failure or AppLocker block event.",
            },
          ],
          securityImplications: [
            "If PSM AppLocker rules are disabled, a malicious operator could exploit the RDSH server to pivot across the enterprise management network.",
          ],
          knowledgeCheck: [
            {
              id: "c06-m01-q01",
              question:
                "What prevents an operator connecting via PSM from stealing the target system password?",
              options: [
                "The target system does not have a password.",
                "PSM retrieves the password directly from the Vault and injects it into the target protocol in memory on the PSM server, so the client workstation never sees or receives the secret.",
                "The operator's keyboard is locked during the entire session.",
                "The password is encrypted with the user's personal credit card number.",
              ],
              correctIndex: 1,
              explanation:
                "Transparent credential injection happens on the PSM jump server. The client machine only receives encrypted display bitmaps (RDP/HTML5) and transmits keyboard/mouse events, completely isolating the secret from the user.",
              conceptTested: "PSM Credential Masking Mechanics",
            },
            {
              id: "c06-m01-q02",
              question:
                "What happens when a Security Officer clicks 'Terminate' on an active session in the PSM Operations console?",
              options: [
                "The target server is powered down immediately.",
                "PSM severs the network socket connection to the target, terminates the proxy process, and finalizes the immutable recording file in the Vault.",
                "The operator's computer is rebooted.",
                "The target password is deleted from the Vault.",
              ],
              correctIndex: 1,
              explanation:
                "Terminating a session immediately kills the proxy process on the PSM jump server, cutting off the operator's access instantly and sealing the recorded audit log.",
              conceptTested: "Session Termination & Containment",
            },
          ],
          practicalExercise: {
            id: "ex-c06-01",
            title: "Launch Brokered Session & Audit Keystrokes",
            scenario:
              "Navigate to Accounts console or PSM Operations. Select root on LNX-SRV-01, initiate a connection citing ticket CHG-10294, open the terminal to execute 'whoami', and observe the live session recording in the audit console.",
            instructions: [
              "Navigate to Accounts console in PVWA.",
              "Select account root on LNX-SRV-01 and click 'Connect (PSM)'.",
              "Enter change ticket ID 'CHG-10294' and launch the brokered terminal.",
              "Run command 'whoami' inside the terminal console.",
              "Open Learning Academy Class 06 and validate completion of Lab 06A and Lab 06B.",
            ],
            targetConsole: "psm",
            associatedLabId: "Lab 06A · Launch an approved session",
            validationObjectiveId: "id-psm-launch",
            validationCriteria: "PSM terminal session established with active recording telemetry.",
          },
          completionCriteria: [
            "Demonstrated the end-to-end PSM connection brokering lifecycle.",
            "Executed simulated terminal commands and reviewed immutable audit records.",
          ],
          references: [
            "CyberArk Privileged Session Manager Installation & Implementation Guide",
            "NIST SP 800-53 Control AC-2(7): Privileged User Auditing",
          ],
        },
      ],
    },
  ],
};
