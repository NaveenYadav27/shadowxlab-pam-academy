/**
 * SHADOWXLAB PAM ACADEMY — MODULE 10: PSM — PART 1
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_10: ClassCurriculum = {
  id: "module-10",
  number: "10",
  label: "MODULE 10",
  title: "PSM — Part 1",
  subtitle: "Session Isolation, RDS Bastion Architecture & Connection Components",
  duration: "50 mins",
  level: "Professional",
  track: "admin-20",
  category: "Privileged Session Management & Governance",
  overview:
    "Master the architecture of Privileged Session Manager (PSM) proxies. Deconstruct Remote Desktop Services (RDS) jump host mechanics, zero-knowledge credential injection, protocol isolation (RDP, SSH, Web), built-in Connection Components (PSM-RDP, PSM-SSH, PSM-Web), and Universal Connector customization for proprietary enterprise management consoles.",
  modules: [
    {
      id: "m10-core",
      number: "M10",
      title: "PSM Proxy Architecture & Connection Components",
      description:
        "Technical configuration of PSM RDS jump servers, connection components, credential injection drivers, and workstation-to-target isolation.",
      lessons: [
        {
          id: "m10-l01",
          number: "10.1",
          title: "PSM Session Brokering & Credential Injection",
          subtitle: "Deploying RDS bastion farms, configuring connection components, and enforcing zero-knowledge access",
          estimatedMinutes: 25,
          learningObjectives: [
            "Deconstruct the proxy mechanics of PSM jump servers isolating user workstations from target production assets.",
            "Analyze the zero-knowledge credential injection workflow where users never view plaintext passwords.",
            "Configure built-in connection components (PSM-RDP, PSM-SSH, PSM-SQL) and customize Universal Connectors.",
            "Evaluate RDS farm load balancing and sizing requirements for high-concurrency enterprise deployments.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 03: Policies and Platforms.",
            "Module 04: Safes.",
          ],
          conceptIntroduction:
            "In a traditional environment, when an engineer needs to administer a database, domain controller, or Linux server, they establish a direct network connection from their personal laptop or desktop. This creates severe vulnerability: if the engineer's workstation is compromised by keyloggers, infostealers, or ransomware, the attacker intercepts the administrative credentials in memory and rides the open network socket directly into core production servers.\n\nThe **Privileged Session Manager (PSM)** fundamentally breaks this direct path by introducing an isolated, hardened bastion proxy. The user's workstation connects *only* to the PSM proxy server over standard RDP (TCP 3389) or HTML5 browser gateway. The PSM server establishes a completely separate, outbound connection to the target server.\n\nCrucially, the user never types or knows the target credential. The PSM server queries the Digital Vault over TCP 1858, retrieves the target password or SSH private key into an isolated in-memory buffer, launches the client application (e.g. Putty, SSMS, Remote Desktop Connection), and **injects the credentials directly into the protocol stream**. The user sees the administrative desktop or command prompt rendered inside their window, but cannot copy, view, or steal the password. All communication between the user's laptop and the production server is air-gapped through the PSM proxy.",
          whyItExists:
            "PSM prevents malware on administrative workstations from infecting production infrastructure. It enforces the zero-knowledge principle (users cannot leak credentials they do not know) while establishing a centralized choke point for session recording and policy enforcement.",
          architecture: {
            overview:
              "PSM operates as a specialized Remote Desktop Services (RDS) server. Administrative tools execute locally within isolated, ephemeral user sessions on the PSM host.",
            componentResponsibilities: [
              {
                component: "Client Workstation",
                role: "Initiates RDP or HTML5 session to the PSM proxy server. Never connects directly to target endpoints.",
                networkProtocols: "RDP TCP 3389 / HTTPS 443 (HTML5 Gateway)",
                securityBoundary: "Untrusted Corporate User Workstation",
              },
              {
                component: "PSM Server (RDS Host)",
                role: "Hardened Windows Server running Remote Desktop Services. Spawns ephemeral shadow users (`PSM-xxxx`), retrieves secrets from Vault, and executes connection components.",
                networkProtocols: "TCP 1858 to Vault; RDP 3389, SSH 22, SQL 1433/1521 to Targets",
                securityBoundary: "Tier-1 Bastion Proxy Subnet",
              },
              {
                component: "Connection Component",
                role: "Standardized automation definition specifying the executable (e.g. `mstsc.exe`, `putty.exe`, Chrome), command-line arguments, and credential injection targets.",
                networkProtocols: "Internal PSM Dispatcher API",
                securityBoundary: "Application Injection Engine",
              },
              {
                component: "Target System",
                role: "The destination Windows server, Unix host, database, or network appliance being administered.",
                networkProtocols: "Inbound administrative port (22, 3389, 443, 1521)",
                securityBoundary: "Protected Production Infrastructure",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Administrative Engineer",
                action: "Locates target account in PVWA and clicks 'Connect'. Selects Connection Component `PSM-RDP`.",
                channelOrProtocol: "HTTPS 443 to PVWA",
                verificationRule: "PVWA verifies user possesses 'Use accounts' permission and valid dual-control approval.",
              },
              {
                stepNumber: 2,
                actor: "PVWA Web Tier",
                action: "Generates an encrypted one-time session token file (`.rdp`) configured to route the client to the PSM farm.",
                channelOrProtocol: "Dynamic RDP Descriptor Download",
                verificationRule: "Token contains session UUID, target address, and ephemeral routing ticket.",
              },
              {
                stepNumber: 3,
                actor: "User RDP Client (mstsc.exe)",
                action: "Launches and establishes connection to the PSM server, presenting the session token.",
                channelOrProtocol: "RDP TCP 3389 to PSM Host",
                verificationRule: "PSM validates token with Vault; creates isolated local shadow user session (`PSM-xxxx`).",
              },
              {
                stepNumber: 4,
                actor: "PSM Server Engine",
                action: "Retrieves target credential from Vault over TCP 1858, connects to target host, and injects credential without plaintext display.",
                channelOrProtocol: "Outbound Target Protocol (RDP / SSH)",
                verificationRule: "Keystroke recorder and optical screen capture initialize before target GUI is rendered.",
              },
            ],
          },
          terminology: [
            {
              term: "Privileged Session Manager (PSM)",
              definition: "A dedicated jump server proxy that establishes mediated, isolated, recorded sessions to target assets without revealing secrets.",
              enterpriseContext: "Enterprise environments deploy load-balanced PSM farms to support hundreds of concurrent administrative sessions.",
            },
            {
              term: "Connection Component",
              definition: "A configuration object in the Vault defining how PSM launches a specific client tool (RDP, SSH, Web, DB) and injects credentials.",
              enterpriseContext: "Built-in components include PSM-RDP, PSM-SSH, PSM-Telnet; administrators create custom Universal Connectors for proprietary apps.",
            },
            {
              term: "Zero-Knowledge Access",
              definition: "A security architecture where operational engineers execute tasks on systems without ever knowing or seeing the plaintext password.",
              enterpriseContext: "Eliminates password sharing, shoulder surfing, and the risk of engineers memorizing root credentials.",
            },
            {
              term: "PSM Shadow User",
              definition: "An ephemeral, locally generated Windows user account (`PSM-0100000000000000`) created on the PSM host to sandbox the active session.",
              enterpriseContext: "Deleted automatically upon session termination to prevent data leakage between subsequent operators.",
            },
          ],
          administratorResponsibilities: [
            "Maintain RDS licensing and operating system health across all PSM farm nodes.",
            "Verify network routing: PSM servers must have outbound firewall access to target server subnets on required administrative ports.",
            "Configure AppLocker rules on PSM hosts to restrict shadow users from launching unapproved executables or escaping into the PSM OS.",
            "Monitor PSM disk space: session recordings (video and text logs) consume significant storage before uploading to the Vault.",
          ],
          configurationAndAdministration: [
            {
              name: "PSM Server ID & Address",
              settingOrObject: "PVWA Administration > Options > Privileged Session Management > Configured PSM Servers",
              description: "Defines the network FQDN and Vault user ID of each PSM node in the farm.",
              productionBestPractice: "Deploy at least two PSM nodes behind a hardware load balancer with sticky sessions enabled.",
            },
            {
              name: "Connection Component: PSM-RDP ClientApp",
              settingOrObject: "Administration > Options > Connection Components > PSM-RDP > Target Settings",
              description: "Specifies client binary path (e.g., `mstsc.exe`) and resolution parameters.",
              productionBestPractice: "Enforce standard 1440x900 or 1080p display resolution to optimize optical recording compression.",
            },
            {
              name: "AppLocker Hardening Script",
              settingOrObject: "C:\\Program Files (x86)\\CyberArk\\PSM\\Hardening\\PSMConfigureAppLocker.ps1",
              description: "Locks down the PSM RDS host, permitting only whitelisted binaries (mstsc, putty, winscp) to execute.",
              productionBestPractice: "Always re-run the AppLocker script after installing new client tools or custom Universal Connectors.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Verify PSM Component Health",
              action: "In PVWA Administration > System Health, check PSM Server status pill.",
              expectedResult: "PSM Server reports 'Connected' with green status; heartbeat under 60 seconds.",
              operatorNotes: "If red or warning, check the CyberArk Privileged Session Manager service on the PSM Windows host.",
            },
            {
              stepNumber: 2,
              title: "Launch Brokered Session",
              action: "In Accounts inventory, select `WIN-SRV-01\\Administrator`, click 'Connect', and enter ticket reference.",
              expectedResult: "Browser downloads `.rdp` session descriptor file or opens HTML5 in-browser viewer.",
            },
            {
              stepNumber: 3,
              title: "Confirm Zero-Knowledge Injection",
              action: "Open the downloaded RDP session; observe PSM connection banner and automatic target login.",
              expectedResult: "Target desktop opens immediately; user is never prompted to type the Administrator password.",
            },
            {
              stepNumber: 4,
              title: "Inspect Active Session State",
              action: "In PVWA, navigate to PSM Operations / Monitoring to observe the live session entry.",
              expectedResult: "Session entry displays: User, Target Address, Connection Component (`PSM-RDP`), and duration timer.",
            },
          ],
          enterpriseScenario: {
            organization: "Starlight Financial Infrastructure",
            businessContext:
              "Starlight operates core banking ledger databases. A third-party security audit discovered that contract database administrators were installing unauthorized network sniffing tools and copying production database dumps to their personal USB drives during maintenance. The CISO ordered all direct RDP and SSH access to production subnets terminated at the firewall; all administrative workflows were redirected through a hardened PSM RDS jump cluster with strict AppLocker policies.",
            governanceRequirements: [
              "Complete firewall air-gap: zero direct IP routing between user workstations and production subnets.",
              "100% of sessions mediated by PSM with zero-knowledge credential injection.",
              "AppLocker lockdown on PSM hosts: users cannot launch unauthorized binaries, command prompts, or copy files via clipboard.",
            ],
          },
          failureScenarios: [
            {
              symptom: "User clicks Connect: 'PSMSR037E Privileged Session Manager server is unavailable'.",
              rootCause: "The PSM service on the RDS host is stopped, or network routing from PVWA/client to PSM is down.",
              securityImpact: "Users blocked from connecting to remote systems; operational outage.",
              cyberArkCodeOrEvent: "PSMSR037E",
            },
            {
              symptom: "Session launches but crashes immediately with 'PSMSR126E [Application] failed to start due to AppLocker rule'.",
              rootCause: "The client executable (e.g. custom SQL tool) was not whitelisted in the PSM AppLocker configuration XML.",
              securityImpact: "Connection component fails to execute; user cannot launch administrative tool.",
              cyberArkCodeOrEvent: "PSMSR126E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Inspect CyberArk Privileged Session Manager service status on the PSM server host.",
              logFileOrConsole: "services.msc / PSMTrace.log",
              remediation: "If stopped, check Event Viewer for licensing errors or restart the PSM service.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Check PSM AppLocker event logs for blocked executable paths.",
              logFileOrConsole: "Event Viewer > Applications and Services Logs > Microsoft > Windows > AppLocker > EXE and DLL",
              remediation: "Add the application binary path or publisher rule to PSMConfigureAppLocker.xml and re-run the PowerShell script.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Test target port connectivity outbound from the PSM server host.",
              logFileOrConsole: "PowerShell: Test-NetConnection -ComputerName <TargetHost> -Port 3389 / 22",
              remediation: "Ensure hardware firewalls allow PSM host IP to reach target subnet on destination administrative ports.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Program Files (x86)\\CyberArk\\PSM\\Logs\\PSMTrace.log",
              sampleOutput:
                "PSMSR037E [Connection 849] Session initialization failed. Failed to retrieve account credentials from Vault (ITATS006E Database is unavailable).",
              explanation:
                "The PSM server could not connect to the Digital Vault on TCP 1858 to fetch the target password. Intermediate firewall dropped connection.",
            },
            {
              logFile: "C:\\Program Files (x86)\\CyberArk\\PSM\\Logs\\Components\\PSM-RDP.log",
              sampleOutput:
                "PSMSR126E Error executing dispatcher for component PSM-RDP. The process was blocked by AppLocker policy: C:\\Windows\\System32\\mstsc.exe.",
              explanation:
                "PSM AppLocker rules were not properly enabled or the binary path was corrupted. Administrator must re-apply the baseline AppLocker configuration.",
            },
          ],
          instructorNotes: [
            "In high-security environments, always disable clipboard redirection (`Clipboard Redirection = No`) on PSM connection components to prevent data exfiltration.",
            "Each concurrent PSM session consumes approximately 150–250MB of RAM on the PSM host. Size your PSM servers accordingly (e.g., 32GB RAM supports ~150 concurrent sessions).",
            "When onboarding custom web consoles, use the CyberArk Web Connection Component (Selenium-based) and ensure Google Chrome is updated consistently.",
          ],
          securityImplications: [
            "Malware Air Gap: Even if an engineer's laptop is infected with keyloggers or ransomware, the malware cannot traverse the RDP stream into production servers.",
            "Zero Credential Leakage: Engineers never view the real password; they cannot sell credentials on dark web markets or share them with unauthorized peers.",
            "Complete Session Attributability: Every action performed on the target host is tied back to the engineer's individual corporate SSO identity.",
          ],
          knowledgeCheck: [
            {
              id: "m10-q01",
              question: "What is the primary architectural security benefit of mediating administrative access through a Privileged Session Manager (PSM) proxy?",
              options: [
                "It reduces server hardware costs.",
                "It isolates user workstations from production endpoints, injects credentials transparently without revealing plaintext, and records all activity.",
                "It eliminates the need for firewalls.",
                "It allows users to bypass Multi-Factor Authentication.",
              ],
              correctIndex: 1,
              explanation:
                "PSM air-gaps administrative access: the user's laptop connects only to the PSM proxy; the PSM injects the vaulted secret directly into the target session, ensuring users never handle plaintext credentials while providing complete recording.",
              conceptTested: "PSM Proxy Architecture & Zero-Knowledge Benefits",
            },
            {
              id: "m10-q02",
              question: "If a user receives error PSMSR126E when launching a session, what is the most probable cause on the PSM host?",
              options: [
                "The target server has ran out of hard drive space.",
                "The application binary was blocked by Windows AppLocker policies on the PSM server.",
                "The Vault administrator deleted the user license.",
                "The user's monitor resolution is too high.",
              ],
              correctIndex: 1,
              explanation:
                "PSMSR126E indicates that the connection component executable was blocked by AppLocker. The PSM host is heavily locked down; any client tool must be explicitly whitelisted in the AppLocker XML configuration.",
              conceptTested: "PSM AppLocker Lockdown & Troubleshooting",
            },
            {
              id: "m10-q03",
              question: "What communication channel does the PSM server use to retrieve target credentials during session initialization?",
              options: [
                "Direct database connection to the target server",
                "Encrypted Vault Protocol over TCP 1858 to the Digital Vault",
                "Unencrypted HTTP over Port 80",
                "DNS queries to the corporate domain controller",
              ],
              correctIndex: 1,
              explanation:
                "The PSM server queries the Digital Vault kernel over its proprietary, hardened AES-256 encrypted protocol on TCP Port 1858 to retrieve target secrets.",
              conceptTested: "PSM to Vault Protocol Architecture",
            },
          ],
          practicalExercise: {
            id: "m10-ex01",
            title: "Launch and Verify an Isolated PSM Session",
            scenario:
              "Initiate a brokered privileged session to Windows target WIN-SRV-01 through the PSM proxy, verify zero-knowledge credential injection, and confirm session establishment.",
            instructions: [
              "Navigate to the PSM Operations console.",
              "Verify that the PSM connection broker is reported healthy.",
              "Launch a brokered session to WIN-SRV-01 with ticket reference `CHG-20412`.",
              "Confirm that the session initializes and renders in the active session monitoring view.",
            ],
            targetConsole: "psm",
            associatedLabId: "Lab 06A · Launch an approved session",
            validationObjectiveId: "launch-psm",
            validationCriteria:
              "Brokered session is launched through PSM and appears in the active session list.",
          },
          completionCriteria: [
            "Deconstructed PSM RDS jump host architecture and proxy mechanics.",
            "Analyzed zero-knowledge credential injection and connection components.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the brokered session launch in the PSM Operations console.",
          ],
          references: [
            "CyberArk Privileged Session Manager: Implementation and Hardening Guide",
            "Microsoft Remote Desktop Services Architecture & AppLocker Security Guidelines",
            "NIST SP 800-53 Rev 5: AC-17 Remote Access & SC-7 Boundary Protection",
          ],
        },
      ],
    },
  ],
};
