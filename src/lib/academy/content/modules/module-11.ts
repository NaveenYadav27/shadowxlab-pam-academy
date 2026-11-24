/**
 * SHADOWXLAB PAM ACADEMY — MODULE 11: PSM — PART 2
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_11: ClassCurriculum = {
  id: "module-11",
  number: "11",
  label: "MODULE 11",
  title: "PSM — Part 2",
  subtitle: "Live Monitoring, Suspicious Command Detection & Session Termination",
  duration: "50 mins",
  level: "Professional",
  track: "admin-20",
  category: "Privileged Session Management & Governance",
  overview:
    "Master live operational session surveillance, threat detection, and active incident intervention. Deconstruct continuous keystroke interception, dual optical/text recording engines, real-time command regex filtering, automated suspicious activity alerting (e.g., Mimikatz, /etc/shadow scraping), supervisor live viewing, and forceful session termination.",
  modules: [
    {
      id: "m11-core",
      number: "M11",
      title: "Live Monitoring & Active Session Interruption",
      description:
        "Comprehensive walkthrough of keystroke logging, video compression, live supervisor monitoring, automated threat detection rules, and immediate administrative session termination.",
      lessons: [
        {
          id: "m11-l01",
          number: "11.1",
          title: "Real-Time Surveillance, Command Detection & Forced Termination",
          subtitle:
            "Monitoring active administrative sessions, detecting unauthorized commands, and severing threat connections",
          estimatedMinutes: 25,
          learningObjectives: [
            "Analyze the dual recording engine: synchronized keystroke text streams and optical compressed video frames.",
            "Configure command filtering rules to detect malicious utilities (Mimikatz, Wireshark, unauthorized user creation).",
            "Execute real-time supervisor live viewing of active sessions without alerting or interrupting the operator.",
            "Perform immediate administrative session termination, severing target connections and sealing forensic evidence.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 10: PSM — Part 1.",
          ],
          conceptIntroduction:
            "Passive session recording is insufficient when an adversary or compromised insider is actively exfiltrating database records or deploying ransomware. If a security analyst must wait until a session terminates three hours later to review video recordings, the enterprise has already suffered catastrophic loss.\n\nEnterprise PAM transforms session management into an active defensive weapon through **Live Monitoring and Command Detection**.\n\nWhile an engineer works inside a PSM session, two concurrent recording pipelines operate in the background:\n1. **Optical Video Recording**: Captures graphical frame deltas, compresses them using proprietary codecs, and stores them in the Vault database or external storage safe.\n2. **Keystroke Text Interception**: A low-level keyboard hook driver captures every typed command, shell invocation, and process window title. This text stream is indexed in real time.\n\nSecurity administrators can define Command Detection Rules (e.g. flagging `mimikatz`, `dump-credentials`, `chmod 777 /etc/shadow`, or `drop table`). When a monitored command matches a high-severity regex rule, the system can instantly alert the SOC, trigger an automated session freeze, or enable an on-duty administrator to **forcefully terminate the session** with a single click—immediately severing the target TCP socket and sealing the forensic evidence.",
          whyItExists:
            "Live monitoring and active termination provide real-time incident response capabilities. Security teams can detect and halt malicious actions *while they are occurring*, rather than conducting post-mortem forensics after an exfiltration.",
          architecture: {
            overview:
              "The PSM recording engine operates as a kernel/user-mode filter on the RDS host, streaming synchronized text and video data into the Vault while exposing live sockets to the PVWA monitoring console.",
            componentResponsibilities: [
              {
                component: "PSM Interception Driver",
                role: "Hooks keyboard inputs, clipboard transfers, and window title changes within the shadow user session.",
                networkProtocols: "Windows API Hook (WH_KEYBOARD_LL)",
                securityBoundary: "RDS User Session Boundary",
              },
              {
                component: "Optical Recorder Worker",
                role: "Captures screen changes, compresses video frames into MPEG-4/AVI streams, and encrypts raw video before Vault transfer.",
                networkProtocols: "Local PSM Recording Spool",
                securityBoundary: "PSM Media Encoding Engine",
              },
              {
                component: "PVWA Monitoring Console",
                role: "Provides SOC analysts with real-time session listings, live screen viewing, search indexing, and forceful termination controls.",
                networkProtocols: "HTTPS Port 443 / WebSockets",
                securityBoundary: "Security Operations Console Tier",
              },
              {
                component: "Vault Audit & Storage Safe",
                role: "Stores compressed video recordings, keystroke text logs, and termination metadata in tamper-proof encrypted containers.",
                networkProtocols: "TCP 1858 from PSM host",
                securityBoundary: "Immutable Forensic Evidence Repository",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Monitored Operator",
                action:
                  "Types commands in an active SSH or RDP terminal session proxied through PSM.",
                channelOrProtocol: "PSM Session Window",
                verificationRule:
                  "Interception driver buffers keystrokes and correlates them with the active process name.",
              },
              {
                stepNumber: 2,
                actor: "PSM Command Detection Engine",
                action:
                  "Evaluates typed string against active threat regex (e.g., `(?i)(mimikatz|secretsdump|pypykatz)`).",
                channelOrProtocol: "Real-Time Pattern Matcher",
                verificationRule:
                  "Pattern matches malicious keyword; high-severity security alert raised.",
              },
              {
                stepNumber: 3,
                actor: "SOC Security Analyst",
                action:
                  "Observes alert in PVWA Monitoring console, clicks 'Live View', and watches real-time screen activity.",
                channelOrProtocol: "PVWA WebSocket Live Stream",
                verificationRule:
                  "Analyst confirms suspicious activity; operator receives zero on-screen warning.",
              },
              {
                stepNumber: 4,
                actor: "SOC Security Analyst",
                action: "Clicks 'Terminate Session' and enters incident reference `INC-77291`.",
                channelOrProtocol: "PVWA Administrative Action",
                verificationRule:
                  "PSM terminates target socket instantly; session recording closed, encrypted, and sealed in Vault.",
              },
            ],
          },
          terminology: [
            {
              term: "Live Monitoring",
              definition:
                "The capability of an authorized administrator or SOC analyst to view an active privileged session in real time as it happens.",
              enterpriseContext:
                "Used during high-risk production deployments or active insider threat investigations.",
            },
            {
              term: "Keystroke Interception",
              definition:
                "Capturing and indexing all character input from the keyboard, enabling text-based search across thousands of hours of recordings.",
              enterpriseContext:
                "Allows auditors to search for specific commands like 'iptables' or 'net user' and jump directly to that exact second in the video.",
            },
            {
              term: "Suspicious Command Detection",
              definition:
                "An automated pattern-matching rule that evaluates typed commands against known attack signatures and flags incidents.",
              enterpriseContext:
                "Critical for MITRE ATT&CK credential dumping and defense evasion detection.",
            },
            {
              term: "Session Termination",
              definition:
                "The forceful, immediate severance of an active privileged connection by an administrator, terminating target processes.",
              enterpriseContext:
                "The ultimate emergency brake during active security incidents or policy violations.",
            },
          ],
          administratorResponsibilities: [
            "Define and maintain high-priority command detection regex lists (e.g. credential scrapers, network discovery tools).",
            "Monitor active sessions during high-risk maintenance windows.",
            "Verify that session recordings are successfully offloaded from PSM local disks to the Vault storage safe.",
            "Enforce retention policies on session recordings (e.g., retain for 1 year to meet PCI-DSS requirement 10.7).",
          ],
          configurationAndAdministration: [
            {
              name: "Command Detection Rules: Threat Signatures",
              settingOrObject:
                "Platform > UI & Workflows > Privileged Session Management > Command Access Control",
              description:
                "Configures regex rules, action on match (Alert, Terminate, Block), and severity score.",
              productionBestPractice:
                "Set action to 'Alert' for ambiguous commands (e.g. `tcpdump`); set to 'Terminate' for definitive malware (`mimikatz`).",
            },
            {
              name: "Recording Safe Quota & Storage Retention",
              settingOrObject: "Safe `PSMRecordings` Properties",
              description:
                "Defines maximum storage capacity and version history for video and keystroke logs.",
              productionBestPractice:
                "Configure automatic archiving or offload to external secondary storage (e.g., S3, Azure Blob, or NAS).",
            },
            {
              name: "Live Viewing Permission: Safe Level",
              settingOrObject: "Safe Permissions > View Audit / Live Monitoring",
              description:
                "Restricts live session viewing to authorized SOC leads and security compliance officers.",
              productionBestPractice:
                "Never grant Live Monitoring to general administrative users to protect peer operational privacy.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Open Active Sessions View",
              action:
                "In PVWA, navigate to Monitoring > Active Sessions. Review list of currently connected administrative sessions.",
              expectedResult:
                "Displays active session table: User, Safe, Target Host, Protocol, and Session Duration.",
              operatorNotes:
                "Active sessions update automatically via real-time WebSocket polling.",
            },
            {
              stepNumber: 2,
              title: "Initiate Live View",
              action: "Select an active session and click 'Live View' in the action bar.",
              expectedResult:
                "A secure viewing pane opens rendering the operator's desktop/terminal in real time.",
            },
            {
              stepNumber: 3,
              title: "Inject Suspicious Command Test",
              action:
                "In the simulated target terminal, type `mimikatz` or unauthorized network sweep command.",
              expectedResult:
                "System flags the command; entry turns red in the session keystroke timeline.",
            },
            {
              stepNumber: 4,
              title: "Execute Forceful Termination",
              action:
                "Click 'Terminate Session', enter termination justification `Policy Violation: Unauthorized credential tool`, and submit.",
              expectedResult:
                "Target session is terminated immediately; terminal displays 'Connection terminated by Administrator'. Recording sealed.",
            },
          ],
          enterpriseScenario: {
            organization: "Titan Aerospace & Defense",
            businessContext:
              "Titan Defense manufactures missile defense radars. During a classified satellite launch rehearsal, the SOC detected an authorized contractor account executing reconnaissance commands on a core radar controller server outside their approved scope of work. Using PSM Live Monitoring, the SOC supervisor watched the contractor attempt to run memory-scraping tools. The supervisor immediately executed a Forceful Termination, severing the connection in under 5 seconds and preserving the complete keystroke and video evidence for counter-intelligence investigators.",
            governanceRequirements: [
              "Continuous keystroke recording and indexing across all classified defense networks.",
              "Immediate automated alerting upon execution of known attack tools or credential dumping utilities.",
              "Capability to terminate any active session within 10 seconds of anomalous activity detection.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Session recording missing from Vault: 'Recording file failed to upload from PSM host'.",
              rootCause:
                "Local hard drive on the PSM server host is 100% full, preventing video file generation.",
              securityImpact:
                "Unrecorded privileged session; severe compliance audit violation under SOX/PCI.",
              cyberArkCodeOrEvent: "PSMSR037E",
            },
            {
              symptom: "Live View fails to connect: 'WebSocket connection to PSM proxy failed'.",
              rootCause:
                "Intermediate reverse proxy or corporate web filter is dropping WebSocket traffic on HTTPS port 443.",
              securityImpact:
                "SOC analysts unable to monitor active sessions in real time during incident response.",
              cyberArkCodeOrEvent: "NET-WS-FAIL",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Check free disk space on PSM server recording spool volume.",
              logFileOrConsole: "C:\\Program Files (x86)\\CyberArk\\PSM\\Recordings",
              remediation:
                "Clear temporary dump files and ensure recording drive has at least 50GB free headroom.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Review PSM keystroke recorder log for hook errors.",
              logFileOrConsole: "C:\\Program Files (x86)\\CyberArk\\PSM\\Logs\\PSMTrace.log",
              remediation:
                "Restart the CyberArk Privileged Session Manager service to re-register the low-level keyboard hook driver.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Verify WebSocket proxy configuration in corporate firewall.",
              logFileOrConsole: "PVWA Web Server Logs / Edge Firewall Access Logs",
              remediation:
                "Configure HTTP Upgrade headers on load balancers to permit persistent WebSocket sessions.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Program Files (x86)\\CyberArk\\PSM\\Logs\\PSMTrace.log",
              sampleOutput:
                "Session 912: Command detection matched signature 'mimikatz.exe' on target WIN-SRV-01. Action triggered: Alert SOC.\nAdmin action received: Forceful termination requested by sec_analyst. Severing target RDP socket.",
              explanation:
                "The PSM detection engine successfully matched the malicious utility signature and processed the administrator's immediate termination command.",
            },
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 15:42:19 Session 912 terminated forcefully by user sec_analyst. Reason: Policy Violation. Forensic video recording archived in Safe PSMRecordings.",
              explanation:
                "The Vault kernel recorded the forceful termination event into the immutable audit trail and locked the video recording file.",
            },
          ],
          instructorNotes: [
            "Keystroke indexing is language-agnostic for standard ASCII, but verify keyboard layout settings if administering international Unix servers.",
            "Always notify users upon connection with a legal banner: 'Notice: This session is monitored and recorded for security compliance.' This eliminates privacy legal challenges.",
            "Forceful termination terminates the network connection; it does not necessarily terminate background daemons that may have detached on the target. Follow up with host-level triage.",
          ],
          securityImplications: [
            "Active Containment: Prevents a live threat actor from completing an attack chain by severing their access in seconds.",
            "Indelible Evidence: Sealed video recordings with synchronized keystroke timelines provide non-repudiable evidence for law enforcement and courts.",
            "Deterrence: Knowledge that sessions are actively surveilled drastically reduces insider threat activity and unauthorized policy violations.",
          ],
          knowledgeCheck: [
            {
              id: "m11-q01",
              question:
                "What dual recording streams does the Privileged Session Manager (PSM) capture concurrently during an active session?",
              options: [
                "Only audio from the operator's microphone.",
                "Synchronized optical video frame deltas and text-indexed keystroke inputs.",
                "Only network router NetFlow records.",
                "Power consumption metrics of the server host.",
              ],
              correctIndex: 1,
              explanation:
                "PSM captures both compressed optical video frames (showing exactly what was on screen) and an indexed text stream of typed keystrokes and window titles (enabling instant search across recordings).",
              conceptTested: "Dual Recording Engine Architecture",
            },
            {
              id: "m11-q02",
              question:
                "What action can a SOC analyst take immediately from the PVWA Monitoring console if an operator is observed typing malicious commands in a live session?",
              options: [
                "Reboot the Digital Vault server.",
                "Execute 'Terminate Session', which immediately severs the target connection and seals the forensic recording.",
                "Change the user's home address.",
                "Delete the target platform.",
              ],
              correctIndex: 1,
              explanation:
                "The 'Terminate Session' feature severs the network socket instantly, drops the user out of the target environment, and finalizes the recording for immediate forensic review.",
              conceptTested: "Forceful Session Termination Mechanics",
            },
            {
              id: "m11-q03",
              question:
                "Why is keystroke text indexing critical for compliance audits that involve thousands of hours of recorded sessions?",
              options: [
                "Because auditors cannot watch thousands of hours of video; text indexing allows them to search for specific commands and jump directly to that exact second in the recording.",
                "Because video recordings are deleted after 24 hours.",
                "Because text files take up more disk space than video.",
                "Because keystroke indexing translates code into different languages.",
              ],
              correctIndex: 0,
              explanation:
                "Keystroke indexing makes compliance audits scalable. Auditors can query 'whoami' or 'rm -rf' across thousands of sessions and jump straight to the relevant video timestamp.",
              conceptTested: "Keystroke Searchability & Audit Efficiency",
            },
          ],
          practicalExercise: {
            id: "m11-ex01",
            title: "Monitor Active Session, Inspect Sensitive Commands & Force Terminate",
            objective:
              "Monitor an active brokered PSM session, execute auditable reconnaissance commands (`whoami`, `net user`, `Get-Process`), inspect the live keystroke timeline, and execute forced session termination (Lab 06A).",
            scenario:
              "As a Security Officer monitoring live PSM sessions on WIN-SRV-01, launch or inspect an active session, execute administrative/reconnaissance commands (`whoami`, `net user`, `Get-Process`), inspect the command timeline, and forcefully terminate the session to seal the forensic recording.",
            prerequisites: [
              "Review Live Surveillance, Suspicious Command Detection, and Forced Termination in Section 1–4.",
            ],
            startingState:
              "PSM connector is healthy and supports live command capture and immediate termination.",
            instructions: [
              "Open the PSM Operations console and launch an approved session to WIN-SRV-01 (ticket `CHG-20412`, reason >= 12 chars) if no session is active.",
              "Execute supported audit commands in the live terminal: `whoami`, `net user`, and `Get-Process`.",
              "Review the real-time command and event timeline in the PSM monitoring view.",
              "Click 'Terminate' to forcefully sever the proxy session and seal the immutable recording in Reports & Audit, then validate all 6 Lab 06A objectives.",
            ],
            stepDetails: [
              {
                action: "Open PSM Operations and establish an approved session to WIN-SRV-01.",
                explanation:
                  "Provides an active monitored proxy stream for live surveillance and termination.",
                expectedResult: "Session transitions to Active in the PSM monitor.",
              },
              {
                action: "Run `whoami`, `net user`, and `Get-Process` in the session terminal.",
                explanation:
                  "Uses real simulator-supported commands (including account enumeration via `net user`) to populate the live forensic timeline.",
                expectedResult:
                  "All three commands appear in the session timeline with simulated output.",
              },
              {
                action: "Click 'Terminate' to forcefully end the session and seal the recording.",
                explanation:
                  "Severs the target network socket immediately and finalizes the audit record.",
                expectedResult:
                  "Session status changes to 'Terminated' and a Terminate PSM session audit entry is logged.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation: "Confirms all 6 Lab 06A monitoring and termination objectives.",
                expectedResult: "All 6/6 Lab 06A objectives pass (100/100).",
              },
            ],
            targetConsole: "psm",
            associatedLabId: "Lab 06A · Launch an approved session",
            validationObjectiveId: "terminate-session",
            validationCriteria:
              "Active session monitored, >= 2 commands audited, and session forcefully terminated with sealed audit record (6/6 Lab 06A objectives).",
            troubleshootingHints: [
              {
                symptom: "A command is rejected by the simulated PSM terminal.",
                hint: "The deterministic simulator only accepts its curated enterprise command set.",
                correctiveAction:
                  "Use supported commands such as `whoami`, `hostname`, `ipconfig`, `systeminfo`, `net user`, `Get-Service`, or `Get-Process`, then click Terminate.",
              },
            ],
            independentPractice: {
              title: "Forensic Review of Terminated Session Evidence",
              scenario:
                "Incident Response asks for the exact termination timestamp and command audit proof from your forced termination.",
              goal: "Without step-by-step guidance, inspect Reports & Audit and confirm the session launch, command execution, and termination events.",
              targetConsole: "audit",
              successCriteria: [
                "Located the Terminate PSM session event in Reports & Audit.",
                "Confirmed the session recording status shows retained/sealed.",
              ],
            },
          },
          completionCriteria: [
            "Deconstructed the dual optical and keystroke recording pipelines.",
            "Evaluated live monitoring and automated suspicious command detection rules.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the live monitoring and forceful termination in the PSM console.",
          ],
          references: [
            "CyberArk Privileged Session Manager: Monitoring and Incident Response Technical Guide",
            "NIST SP 800-92: Guide to Computer Security Log Management & Session Forensics",
            "MITRE ATT&CK Framework: Credential Dumping (T1003) & Command and Scripting Interpreter (T1059)",
          ],
        },
      ],
    },
  ],
};
