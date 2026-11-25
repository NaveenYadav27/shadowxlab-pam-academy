/**
 * MODULE 03 — ARCHITECTURE AND SECURITY CONCEPTS
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 2 Hours | Day: 1 | Domain: Fundamentals and Architecture (20%)
 * Practicals: Draw a basic PAM architecture diagram; trace a privileged access request through a sample workflow.
 * Learning Outcome: Describe the basic architecture and security principles behind PAM.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_03: ClassCurriculum = {
  id: "client-m03",
  number: "03",
  label: "MODULE 03",
  title: "Architecture and Security Concepts",
  subtitle: "PAM Workflow Architecture, Zero Trust Principles & Access Request Tracing",
  duration: "2 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Fundamentals and Architecture",
  overview:
    "Delivers a comprehensive exploration of PAM architectural patterns and security concepts. Details the interaction between users, management components, Digital Vault, and target endpoints across cloud, self-hosted, and hybrid topologies. Explores the foundational security principles of Least Privilege, Zero Trust, Multi-Factor Authentication, Separation of Duties, and Immutable Auditability.",
  modules: [
    {
      id: "cm03-core",
      number: "M03",
      title: "Architecture and Security Concepts",
      description:
        "PAM topology, security principles, architecture visualization, and access request tracing.",
      lessons: [
        {
          id: "cm03-l01",
          number: "3.1",
          title: "PAM Architecture Topology, Security Principles & Access Tracing",
          subtitle:
            "Architectural Models, Least Privilege, Zero Trust & Step-by-Step Request Tracing",
          estimatedMinutes: 120,
          learningObjectives: [
            "Describe the basic architecture and security principles behind PAM.",
            "Map the end-to-end data flow between users, PVWA, Vault, CPM, PSM, and target systems.",
            "Compare cloud-native (Privilege Cloud), self-hosted on-premises, and hybrid deployment models.",
            "Apply core cybersecurity principles: Principle of Least Privilege, Zero Trust, MFA, and Separation of Duties.",
            "Explain credential protection mechanisms including envelope encryption and memory wiping.",
            "Draw a basic PAM architecture diagram mapping component boundaries.",
            "Trace a privileged access request step-by-step through an approved administrative workflow.",
          ],
          prerequisites: [
            "Completion of Module 01 and Module 02.",
            "Basic understanding of TCP/IP networking, firewalls, and cryptographic concepts.",
          ],
          conceptIntroduction:
            "A well-architected PAM implementation eliminates direct trust relationships between human operators and production assets. In conventional IT setups, administrators connect directly from their endpoints to target servers via SSH or RDP using shared root or domain accounts. Under a Zero Trust PAM architecture, every access request must be explicitly verified, authorized, and brokered through an intermediary bastion. No user ever connects directly to a target; no user is given persistent local admin rights; and no credential is permanently known by a human operator.",
          whyItExists:
            "Adversaries exploit flat networks and shared administrative credentials to establish persistence. When direct administrator connections are allowed, an attacker on a single compromised workstation can capture credentials from memory or intercept traffic in transit. Architectural isolation through PAM guarantees that even if a workstation is completely infected with malware, target systems remain insulated behind audited, isolated proxies.",
          architecture: {
            overview:
              "PAM architecture enforces three strict isolation zones: (1) The User Zone (end user browser to PVWA over HTTPS), (2) The Management Zone (PVWA, CPM, PSM communicating with the Vault over TCP 1858), and (3) The Target Zone (CPM and PSM communicating with target hosts over native target ports).",
            diagramAscii: `
+-----------------------------------------------------------------------------------+
|                           SHADOWXLAB PAM ARCHITECTURE                             |
|                                                                                   |
|  [ User Workstation ]                                                             |
|           |                                                                       |
|      HTTPS (TCP 443)                                                              |
|           v                                                                       |
|  +-----------------+           TCP 1858            +--------------------------+   |
|  |      PVWA       | <---------------------------> |      DIGITAL VAULT       |   |
|  |  (Web Portal)   |                               |  (Encrypted Repository)  |   |
|  +-----------------+                               +--------------------------+   |
|           |                                                      ^                |
|      RDP (TCP 3389)                                              | TCP 1858       |
|           v                                                      v                |
|  +-----------------+      SMB/SSH/SQL/RDP          +--------------------------+   |
|  |       PSM       | --------------------------->  |           CPM            |   |
|  | (Session Proxy) |      (Isolated Target Zone)   |    (Password Engine)     |   |
|  +-----------------+                               +--------------------------+   |
|           |                                                      |                |
|           +-----------------------> [ Target Server ] <----------+                |
|                                     (Windows/Linux)                               |
+-----------------------------------------------------------------------------------+`,
            componentResponsibilities: [
              {
                component: "User Workstation",
                role: "Initiates access request via web browser; never receives plaintext target passwords.",
                securityBoundary: "Untrusted / Semi-trusted Corporate LAN tier.",
              },
              {
                component: "Digital Vault",
                role: "Evaluates access policies and dispenses one-time credentials exclusively to authorized components.",
                networkProtocols: "TCP 1858 (Vault Protocol)",
                securityBoundary: "High-security isolated bastion tier.",
              },
              {
                component: "PSM Session Proxy",
                role: "Terminates inbound user connection and initiates a new, separate outbound connection to target.",
                networkProtocols:
                  "Inbound TCP 3389; Outbound native target protocol (RDP 3389 / SSH 22)",
                securityBoundary: "Management bastion proxy; prevents network-level bridging.",
              },
              {
                component: "CPM Password Engine",
                role: "Rotates target credentials after session termination to ensure single-use credential lifecycle.",
                networkProtocols: "TCP 1858 to Vault; Native management protocols to target",
                securityBoundary:
                  "Management network; administrative control over target endpoints.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Administrator",
                action: "Authenticates to PVWA with corporate credentials and MFA token.",
                channelOrProtocol: "HTTPS (TCP 443)",
                verificationRule: "MFA challenge verified; user identity established.",
              },
              {
                stepNumber: 2,
                actor: "Administrator",
                action:
                  "Locates target account in permitted Safe and requests connection or approval.",
                channelOrProtocol: "PVWA Interface",
                verificationRule:
                  "Safe permission 'Use' or 'Initiate privileged sessions' verified.",
              },
              {
                stepNumber: 3,
                actor: "PVWA -> Vault",
                action: "Requests an ephemeral, one-time session ticket for the target host.",
                channelOrProtocol: "TCP 1858 (Vault Protocol)",
                verificationRule: "Vault validates account policy and dual-control approval state.",
              },
              {
                stepNumber: 4,
                actor: "PSM Proxy",
                action:
                  "Retrieves target credentials from Vault, establishes connection to target, and brokers session to user.",
                channelOrProtocol: "RDP / SSH to Target",
                verificationRule:
                  "User interacts with target via PSM; credentials never displayed on user screen.",
              },
              {
                stepNumber: 5,
                actor: "Audit & CPM",
                action:
                  "Audit records session video and keystrokes; upon disconnect, CPM optionally rotates target password.",
                channelOrProtocol: "Encrypted Recording Safe / Native CPM Change",
                verificationRule: "Single-use one-time password guarantee enforced.",
              },
            ],
          },
          terminology: [
            {
              term: "Principle of Least Privilege",
              definition:
                "The security rule that any user, program, or system process must be granted only the bare minimum rights necessary to perform its legitimate function.",
              enterpriseContext:
                "Admins receive 'Use' rights without 'Retrieve' rights to prevent credential exfiltration.",
            },
            {
              term: "Zero Trust Architecture (ZTA)",
              definition:
                "A cybersecurity paradigm based on the principle of 'Never Trust, Always Verify', requiring continuous authentication and context validation for every transaction.",
              enterpriseContext:
                "Eliminates assumed trust based on internal corporate IP location.",
            },
            {
              term: "Separation of Duties (SoD)",
              definition:
                "A governance control requiring multiple individuals or independent roles to complete a critical or high-risk task.",
              enterpriseContext:
                "Safe managers who grant permissions cannot approve their own account checkouts.",
            },
            {
              term: "Session Brokering",
              definition:
                "The architectural technique where an intermediary proxy connects to the target server on behalf of the user, injecting credentials in-flight.",
              enterpriseContext:
                "Prevents users from learning, writing down, or sharing target system passwords.",
            },
            {
              term: "Envelope Encryption",
              definition:
                "A cryptographic approach where data is encrypted with a data encryption key (DEK), which is itself encrypted with a master key (KEK).",
              enterpriseContext:
                "Used by the Digital Vault to ensure layered cryptographic protection of vaulted objects.",
            },
          ],
          administratorResponsibilities: [
            "Architect network firewall boundaries ensuring no direct administrative traffic bypasses the PSM proxy.",
            "Enforce separation of duties so Safe administrators do not possess unmonitored production access.",
            "Verify that privileged access workflows require ticketing integration or Dual Control for high-risk targets.",
            "Maintain comprehensive network topology diagrams for security and compliance audits.",
          ],
          configurationAndAdministration: [
            {
              name: "Dual Control Policy",
              settingOrObject: "Platform / Safe Setting",
              description:
                "Requires explicit manager approval before an account password or connection can be released.",
              productionBestPractice:
                "Mandate Dual Control for all Tier 0 (Domain Controller and Root) credentials.",
            },
            {
              name: "PSM Connection Component Binding",
              settingOrObject: "Platform Setting -> UI & Workflows -> Connection Components",
              description:
                "Attaches specific PSM connection components (PSM-RDP, PSM-SSH) to target platforms.",
              productionBestPractice:
                "Disable direct password show/copy for production infrastructure platforms.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Access Workflow Design Review",
              action:
                "Map the required approval chain and session isolation parameters for a new target platform.",
              expectedResult:
                "Approved workflow specification documenting user role, approver role, and PSM connector.",
            },
            {
              stepNumber: 2,
              title: "Network Boundary Verification",
              action:
                "Validate that target servers drop direct RDP/SSH packets originating from user desktop subnets.",
              expectedResult: "Target servers respond only to PSM and CPM IP addresses.",
            },
            {
              stepNumber: 3,
              title: "End-to-End Workflow Validation",
              action:
                "Execute a simulated test access request from user login through session recording seal.",
              expectedResult: "Complete audit record produced with zero credential exposure.",
            },
          ],
          enterpriseScenario: {
            organization: "National Healthcare Exchange (nhe.internal)",
            businessContext:
              "NHE stores electronic health records (EHR). HIPAA compliance mandates that database administrators cannot access database servers without Multi-Factor Authentication, Dual Control approval from the Chief Information Security Officer (CISO), and session recording.",
            governanceRequirements: [
              "Mandatory Dual Control for all patient database access.",
              "Complete session keystroke and video recording with 1-year retention.",
              "Strict separation of duties between database developers and production operators.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Administrator connects directly to target server via SSH, bypassing PSM monitoring.",
              rootCause: "Target server firewall rule permits port 22 from the corporate LAN.",
              securityImpact:
                "Unrecorded privileged access; inability to attribute unauthorized data changes.",
              cyberArkCodeOrEvent: "AUDIT-UNBROKERED-SESSION",
            },
            {
              symptom:
                "Dual Control approval request expires with no notification to the authorizer.",
              rootCause:
                "Approver notification email misconfigured or approver safe membership missing.",
              securityImpact:
                "Delayed emergency operational maintenance on critical infrastructure.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Inspect target host firewall logs to verify whether direct connections are rejected.",
              logFileOrConsole: "Target Host Event Viewer / iptables log",
              remediation:
                "Add host firewall rule restricting TCP 3389 and TCP 22 strictly to PSM IP addresses.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Verify Dual Control workflow state in PVWA Request Center.",
              logFileOrConsole: "PVWA -> Requests -> My Requests",
              remediation:
                "Confirm designated approvers possess 'Authorize account requests' permission on the Safe.",
            },
          ],
          securityImplications: [
            "Allowing direct connections from workstations to target endpoints invalidates Zero Trust posture.",
            "Without brokered sessions, malware on an administrator's laptop can hijack credentials or inject commands.",
            "Failure to enforce separation of duties creates single points of compromise for malicious insiders.",
          ],
          knowledgeCheck: [
            {
              id: "cm03-q01",
              question:
                "In a Zero Trust PAM architecture, why is it critical that administrators connect to target endpoints exclusively via PSM rather than directly?",
              options: [
                "Direct connections require too much network bandwidth compared to brokered connections.",
                "PSM isolates the session, keeps the target credential hidden from the user, and records all keystrokes and video for auditability.",
                "Direct connections prevent Windows servers from joining Active Directory domains.",
                "PSM automatically converts all Linux SSH commands into PowerShell scripts.",
              ],
              correctIndex: 1,
              explanation:
                "Connecting through PSM ensures session isolation, masks the password so the human user never sees it, and records full video and keystrokes for compliance and threat detection.",
              conceptTested: "Zero Trust PAM & Session Brokering",
            },
            {
              id: "cm03-q02",
              question:
                "Which of the following scenarios violates the Principle of Separation of Duties (SoD)?",
              options: [
                "An auditor has 'List' permissions to review account inventories but cannot retrieve passwords.",
                "A system administrator is the sole creator of a Safe, assigns themselves all permissions, and approves their own access requests without independent oversight.",
                "An operator must request approval from a team lead before checking out a domain administrator password.",
                "A security engineer manages PAM component health but does not have access to production server credentials.",
              ],
              correctIndex: 1,
              explanation:
                "Separation of Duties mandates that high-risk administrative powers (such as creating Safes, assigning permissions, and approving access) are divided among separate individuals to prevent unmonitored abuse.",
              conceptTested: "Separation of Duties",
            },
            {
              id: "cm03-q03",
              question:
                "When tracing an access request through an approved PAM workflow, which component generates the immutable audit event when an account is accessed?",
              options: [
                "The user's local web browser",
                "The Digital Vault",
                "The public DNS server",
                "The target host's BIOS",
              ],
              correctIndex: 1,
              explanation:
                "The Digital Vault generates and seals all tamper-proof audit records whenever credentials, Safes, or sessions are accessed or modified.",
              conceptTested: "Auditability & Access Request Tracing",
            },
          ],
          practicalExercise: {
            id: "cm03-ex01",
            title: "Architecture Diagram Analysis & Access Request Tracing",
            objective:
              "Trace an end-to-end privileged access request through the PAM architecture and verify security isolation boundaries.",
            scenario:
              "Analyze the PAM architecture diagram and trace the flow of a privileged access request from user authentication through PSM session brokering and audit recording.",
            prerequisites: ["Completion of Module 01 and Module 02"],
            startingState: "Configured PAM simulator environment with architecture viewer.",
            instructions: [
              "Inspect the ASCII architecture diagram and component topology in the lesson.",
              "Trace the 5-step access request workflow: AuthN -> Request -> Authorization -> PSM Brokering -> Audit Recording.",
              "Navigate to the Overview console to inspect the live status of the architecture.",
              "Execute the verification check to validate architectural understanding.",
            ],
            stepDetails: [
              {
                action: "Review PAM Architecture Diagram",
                explanation: "Identify the 3 isolation zones (User, Management, Target).",
                expectedResult: "Architecture boundaries clearly recognized.",
              },
              {
                action: "Trace Privileged Access Request Flow",
                explanation: "Follow the control flow steps from user login to session recording.",
                expectedResult: "All 5 workflow stages traced.",
              },
              {
                action: "Validate Architecture Posture",
                explanation: "Verify live simulator state alignment with the architecture model.",
                expectedResult: "100% architectural verification confirmed.",
              },
            ],
            targetConsole: "overview",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "obj-cm03-architecture",
            validationCriteria:
              "Complete the architectural workflow tracing and verify live component boundaries in the simulator.",
            troubleshootingHints: [
              {
                symptom: "Workflow tracing appears incomplete.",
                hint: "Ensure you have reviewed all 5 control flow steps in the Architecture section.",
                correctiveAction:
                  "Review stepDetails and verify baseline state in the Overview console.",
              },
            ],
            independentPractice: {
              title: "Independent Workflow Tracing Exercise",
              scenario:
                "Trace an emergency 'break-glass' access workflow and explain how it differs from a standard dual-control workflow.",
              goal: "Confirm understanding of emergency access controls.",
              targetConsole: "overview",
              successCriteria: [
                "Explain why break-glass workflows bypass normal approvals but trigger immediate high-priority audit alerts.",
                "Identify which component executes the post-incident password rotation.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Complete the architectural request tracing practical exercise.",
            "Verify all 3 isolation zones in the PAM simulator.",
          ],
          references: [
            "NIST Special Publication 800-207: Zero Trust Architecture",
            "CyberArk Privilege Cloud Security Blueprint",
            "Center for Internet Security (CIS) Benchmark for CyberArk",
          ],
        },
      ],
    },
  ],
};
