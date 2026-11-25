/**
 * MODULE 08 — PRIVILEGED SESSION MANAGEMENT
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 3 Hours | Day: 4 | Domain: Session Management and Auditing (15%)
 * Practicals: Follow a privileged session workflow in a training instance where available; review a sample session audit record.
 * Learning Outcome: Describe how privileged sessions can be controlled and audited.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_08: ClassCurriculum = {
  id: "client-m08",
  number: "08",
  label: "MODULE 08",
  title: "Privileged Session Management",
  subtitle:
    "PSM Proxy Architecture, Monitored Sessions, Video/Keystroke Auditing & Session Termination",
  duration: "3 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Session Management and Auditing",
  overview:
    "Explore the capabilities and architecture of CyberArk Privileged Session Manager (PSM). Details session isolation mechanics, proxy bastions, approved RDP and SSH connection workflows, connection components, credential exposure prevention, live session monitoring, keystroke and video recording, and real-time session termination.",
  modules: [
    {
      id: "cm08-core",
      number: "M08",
      title: "Privileged Session Management",
      description:
        "PSM fundamentals, connection components, session isolation, live monitoring, audit review, and session termination.",
      lessons: [
        {
          id: "cm08-l01",
          number: "8.1",
          title: "PSM Architecture, Monitored Session Workflows & Audit Inspection",
          subtitle:
            "Session Isolation, RDP/SSH Proxies, Keystroke Logging & Monitored Session Termination",
          estimatedMinutes: 180,
          learningObjectives: [
            "Describe how privileged sessions can be controlled, isolated, and audited.",
            "Explain how PSM acts as an intermediary proxy between client workstations and target endpoints.",
            "Describe the end-to-end brokered session workflow for Windows RDP and SSH targets.",
            "Explain how connection components prevent credential exposure to the human administrator.",
            "Review session recording mechanics: video capture, keystroke indexing, and tamper-proof storage.",
            "Follow a privileged session workflow in a training instance from initiation to termination.",
            "Inspect sample session audit records and identify executed commands and operator attribution.",
          ],
          prerequisites: [
            "Completion of Module 01 through Module 07.",
            "Basic understanding of remote access protocols (RDP TCP 3389 and SSH TCP 22).",
          ],
          conceptIntroduction:
            "Privileged Session Manager (PSM) is CyberArk's session isolation and recording bastion. Rather than allowing administrators to open direct RDP or SSH sessions from their workstations to critical production servers, all sessions are routed through the PSM proxy. When an administrator clicks 'Connect' in PVWA, the user's workstation establishes a connection to the PSM host. In turn, the PSM host securely retrieves the target credentials from the Digital Vault and opens a secondary, isolated connection to the target server, injecting the credentials automatically. The user never sees, copies, or enters the password. Throughout the session, PSM records a full video of the user's screen and indexes all keystrokes, window titles, and commands into a searchable audit record.",
          whyItExists:
            "Without session isolation, malware or keyloggers residing on an administrator's laptop can capture privileged credentials or inject unauthorized commands into active sessions. Furthermore, direct connections leave no independent, objective recording of administrative activity. PSM establishes an air-gap boundary: the client workstation never touches the target server directly, and every single keystroke is permanently recorded for forensic review.",
          architecture: {
            overview:
              "PSM operates as a jump server / bastion host running Windows Server Remote Desktop Services (RDS). It sits between the user network tier and the target system tier, communicating with the Vault over TCP 1858 and with targets over native ports (3389 for Windows, 22 for Linux, 443 for web management consoles).",
            componentResponsibilities: [
              {
                component: "Client Workstation",
                role: "Runs standard RDP client (mstsc.exe) or browser-based HTML5 gateway; connects to PSM.",
                networkProtocols: "RDP (TCP 3389) or HTTPS (TCP 443)",
                securityBoundary: "User network zone; zero direct route to target servers.",
              },
              {
                component: "Privileged Session Manager (PSM)",
                role: "Terminates inbound client session, fetches credentials from Vault, launches connection component, and records session.",
                networkProtocols: "Inbound 3389; Outbound 3389/22 to target; 1858 to Vault",
                securityBoundary: "Isolated bastion perimeter.",
              },
              {
                component: "Digital Vault (Session Journal)",
                role: "Dispenses ephemeral one-time credentials to PSM and stores encrypted session recordings in dedicated recording Safes.",
                networkProtocols: "TCP 1858",
                securityBoundary: "Encrypted, WORM-compliant storage.",
              },
              {
                component: "Target System",
                role: "Accepts administrative connection originating exclusively from the PSM host IP address.",
                networkProtocols: "Native target port",
                securityBoundary: "Target server security perimeter.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "User",
                action:
                  "Clicks 'Connect' on a managed account in PVWA and selects connection component (e.g. PSM-RDP).",
                channelOrProtocol: "HTTPS 443",
                verificationRule:
                  "Safe permission 'Use accounts' or 'Initiate privileged sessions' verified.",
              },
              {
                stepNumber: 2,
                actor: "PVWA -> Vault",
                action:
                  "Generates an encrypted, short-lived session token containing target details and authorized user identity.",
                channelOrProtocol: "TCP 1858",
                verificationRule: "Token signed by Vault; expires in 60 seconds.",
              },
              {
                stepNumber: 3,
                actor: "User RDP Client",
                action: "Connects to the PSM proxy server presenting the session token.",
                channelOrProtocol: "RDP (TCP 3389)",
                verificationRule: "PSM validates token with Vault.",
              },
              {
                stepNumber: 4,
                actor: "PSM Service",
                action:
                  "Retrieves target account password from Vault and launches target connection component, injecting credentials.",
                channelOrProtocol: "RDP / SSH to Target",
                verificationRule: "Credentials injected in memory; zero display to user.",
              },
              {
                stepNumber: 5,
                actor: "PSM Recording Engine",
                action:
                  "Captures screen video and indexes keystrokes/commands, writing chunks to the Vault recording Safe.",
                channelOrProtocol: "TCP 1858",
                verificationRule:
                  "Live session visible in PVWA; audit stream tamper-sealed upon session termination.",
              },
            ],
          },
          terminology: [
            {
              term: "Privileged Session Manager (PSM)",
              definition:
                "The proxy component that brokers and records administrative sessions to target endpoints without revealing passwords.",
              enterpriseContext:
                "The primary tool for achieving compliance with session monitoring mandates.",
            },
            {
              term: "Connection Component",
              definition:
                "A specialized executable or script on the PSM server that knows how to launch, inject credentials into, and monitor a specific client application (e.g. PSM-RDP, PSM-SSH, PSM-SQLPlus).",
              enterpriseContext: "Defines the specific user experience for each target technology.",
            },
            {
              term: "Credential Masking / Concealment",
              definition:
                "The capability of PSM to inject target passwords directly into the connection stream so the human operator never sees or handles the secret.",
              enterpriseContext:
                "Completely eliminates password theft via shoulder-surfing or local screenshot malware.",
            },
            {
              term: "Session Recording (Video & Keystrokes)",
              definition:
                "The automated capture of screen pixels and textual commands during an active session, stored in an immutable, encrypted Vault Safe.",
              enterpriseContext:
                "Provides incontrovertible evidence for post-incident forensics and compliance audits.",
            },
            {
              term: "Live Session Monitoring & Termination",
              definition:
                "The ability of a security officer to watch an active administrative session in real-time and terminate it instantly if suspicious behavior is detected.",
              enterpriseContext:
                "Crucial for active threat response in Security Operations Centers.",
            },
          ],
          administratorResponsibilities: [
            "Ensure target server firewalls restrict RDP (3389) and SSH (22) strictly to PSM IP addresses.",
            "Monitor disk space on the PSM server and ensure recording Safes are properly sized and archived.",
            "Configure connection components to disable clipboard sharing (copy/paste) between client and target when high security is required.",
            "Establish procedures for investigating suspicious commands detected in PSM audit records.",
          ],
          configurationAndAdministration: [
            {
              name: "PSM-RDP Connection Component",
              settingOrObject: "Platform -> UI & Workflows -> Connection Components -> PSM-RDP",
              description:
                "Configures client window resolution, audio redirection, drive redirection, and clipboard synchronization.",
              productionBestPractice:
                "Disable client drive mapping to prevent data exfiltration from target servers.",
            },
            {
              name: "Recording Safe Retention",
              settingOrObject: "PSMRecordings Safe Properties",
              description:
                "Specifies how long video and keystroke recordings are kept before automated purging.",
              productionBestPractice:
                "Retain session recordings for at least 180 to 365 days in regulated environments.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Brokered Session Initiation",
              action:
                "Navigate to Accounts console, select target account, provide business justification / ticket ID, and click Connect.",
              expectedResult: "RDP connection file downloads or HTML5 session opens to target.",
            },
            {
              stepNumber: 2,
              title: "Monitored Operational Execution",
              action:
                "Execute authorized maintenance commands inside the session window (e.g., whoami, hostname).",
              expectedResult: "Commands executed on target; PSM indexes keystrokes in background.",
            },
            {
              stepNumber: 3,
              title: "Session Termination and Audit Verification",
              action:
                "Log out or click Terminate Session; navigate to Reports & Audit to review the completed session record.",
              expectedResult: "Session closed cleanly; video and keystroke logs verified.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "A third-party contractor requires administrative access to transaction server 'WIN-SRV-01' to perform database maintenance. Under GFS security policy, the contractor must not be given the local Administrator password, and all session actions must be monitored, recorded, and reviewed.",
            governanceRequirements: [
              "Zero credential disclosure to external contractor.",
              "Brokered session through PSM with active keystroke indexing.",
              "Security operator must verify session closure and seal audit record.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "User clicks Connect but receives 'PSMSR037E Failed to establish connection to target'.",
              rootCause:
                "Target server is offline or firewall is blocking TCP 3389 from PSM to target.",
              securityImpact: "Administrator cannot access target; operational delay.",
              cyberArkCodeOrEvent: "PSMSR037E",
            },
            {
              symptom: "Session drops immediately upon launch with 'Access Denied'.",
              rootCause:
                "Target account password was changed out-of-band and does not match Vault.",
              securityImpact: "Credential desynchronization prevents connection.",
              cyberArkCodeOrEvent: "PSMSR128E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Verify network connectivity from PSM server to target host port 3389/22.",
              logFileOrConsole: "Test-NetConnection -ComputerName WIN-SRV-01 -Port 3389",
              remediation: "Open port 3389 on target host firewall for the PSM server IP.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Inspect PSM log files on the connector server.",
              logFileOrConsole: "C:\\Program Files (x86)\\CyberArk\\PSM\\Logs\\PSMServer.log",
              remediation:
                "Check log for error code; verify account password using CPM if credentials failed.",
            },
          ],
          securityImplications: [
            "Direct connections bypassing PSM allow unrecorded privileged activity, violating PCI-DSS Req 10.",
            "Enabling clipboard drive redirection on PSM can allow users to copy sensitive customer files out of the environment.",
            "Failing to review session recordings regularly renders forensic auditing reactive rather than proactive.",
          ],
          knowledgeCheck: [
            {
              id: "cm08-q01",
              question:
                "How does the Privileged Session Manager (PSM) prevent an administrator from learning the plaintext password of a target server?",
              options: [
                "PSM requires the administrator to guess the password on each login.",
                "PSM retrieves the password directly from the Vault and injects it into the target session proxy in memory, keeping it concealed from the user.",
                "PSM disables all password authentication across the corporate network.",
                "PSM emails the password to the user in an encrypted ZIP file.",
              ],
              correctIndex: 1,
              explanation:
                "PSM brokers the connection by authenticating to the target on behalf of the user using credentials fetched directly from the Vault, completely isolating the password from the human operator.",
              conceptTested: "Credential Concealment via PSM",
            },
            {
              id: "cm08-q02",
              question:
                "What types of evidence are captured and stored by PSM during a monitored administrative session?",
              options: [
                "Only the user's login and logout timestamps.",
                "Full video recording of the graphical session, indexed textual keystrokes, window titles, and executed commands.",
                "Only the CPU and memory utilization metrics of the client laptop.",
                "The target system's BIOS serial number and motherboard temperature.",
              ],
              correctIndex: 1,
              explanation:
                "PSM captures full screen video recordings as well as searchable textual audit logs containing keystrokes, launched processes, and active window titles.",
              conceptTested: "PSM Session Evidence & Recording",
            },
            {
              id: "cm08-q03",
              question:
                "If an active session displays an operator running unauthorized reconnaissance commands (e.g., trying to disable audit logging), what capability does PSM provide to security operators?",
              options: [
                "Security operators must physically disconnect the target server's power cable.",
                "Security operators can view the live session in real-time and execute immediate session termination from the PVWA monitoring console.",
                "PSM will automatically format the operator's laptop hard drive.",
                "PSM sends an email to the user asking them to stop.",
              ],
              correctIndex: 1,
              explanation:
                "PSM provides live session monitoring and real-time session termination, allowing security officers to disconnect rogue or unauthorized sessions instantly.",
              conceptTested: "Live Monitoring & Session Termination",
            },
          ],
          practicalExercise: {
            id: "cm08-ex01",
            title: "Brokered PSM Session Initiation, Command Monitoring & Session Termination",
            objective:
              "Follow a complete privileged session workflow in the simulator: launch session to WIN-SRV-01, execute monitored commands, and terminate the session cleanly.",
            scenario:
              "Navigate to the PSM Operations console, initiate a monitored session to Administrator on WIN-SRV-01 with ticket 'CHG-12345', execute commands ('whoami', 'hostname'), observe live keystroke indexing, terminate the session, and verify the resulting audit record.",
            prerequisites: ["Completion of Module 01-07"],
            startingState: "Configured accounts and PSM session broker in simulator.",
            instructions: [
              "Navigate to PSM Operations console.",
              "Launch a monitored session to 'WIN-SRV-01' using account 'Administrator' with change ticket 'CHG-12345'.",
              "In the active session terminal, execute command 'whoami'.",
              "Execute command 'hostname'.",
              "Click 'Terminate Session' with reason 'Completed maintenance verification'.",
              "Verify that the session recording is sealed and audit event logged.",
              "Run the simulator validation to confirm 6/6 objectives passed.",
            ],
            stepDetails: [
              {
                action: "Launch Monitored PSM Session",
                explanation: "Initiate brokered connection to WIN-SRV-01.",
                expectedResult: "Session establishes; active session ID created.",
              },
              {
                action: "Execute Monitored Commands",
                explanation: "Run whoami and hostname in session terminal.",
                expectedResult: "Commands logged to session keystroke journal.",
              },
              {
                action: "Terminate Session & Seal Audit",
                explanation: "Close session cleanly with formal operator note.",
                expectedResult: "Session marked Terminated; audit record sealed.",
              },
            ],
            targetConsole: "psm",
            associatedLabId: "Lab 06A · Launch and terminate a monitored PSM session",
            validationObjectiveId: "obj-cm08-psm",
            validationCriteria:
              "Launch PSM session, execute monitored commands, terminate session, and validate in the simulator.",
            troubleshootingHints: [
              {
                symptom: "Validation fails on missing session commands.",
                hint: "Make sure you execute at least two commands (e.g. whoami and hostname) before terminating.",
                correctiveAction:
                  "Run commands in the session terminal, then click Terminate Session.",
              },
            ],
            independentPractice: {
              title: "Independent Session Auditing Review",
              scenario:
                "Navigate to Reports & Audit console and inspect the session audit record generated by your completed PSM session.",
              goal: "Verify understanding of session audit evidence retrieval.",
              targetConsole: "audit",
              successCriteria: [
                "Locate the session audit entry in Reports & Audit.",
                "Verify recorded commands and session duration.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Follow the privileged session workflow in the simulator.",
            "Pass all 6 validation criteria for Lab 06A.",
          ],
          references: [
            "CyberArk PSM Architecture and Implementation Guide",
            "CyberArk Session Monitoring and Threat Detection Best Practices",
            "PCI-DSS v4.0 Requirement 10: Log and Monitor All Access",
          ],
        },
      ],
    },
  ],
};
