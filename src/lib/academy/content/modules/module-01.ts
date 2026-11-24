/**
 * SHADOWXLAB PAM ACADEMY — MODULE 01: INTRODUCTION TO PAM ADMINISTRATION
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_01: ClassCurriculum = {
  id: "module-01",
  number: "01",
  label: "MODULE 01",
  title: "Introduction to PAM Administration",
  subtitle: "Core Architecture, Component Topology & the Security Perimeter",
  duration: "45 mins",
  level: "Foundational",
  track: "admin-20",
  category: "Core Administration & Access Control",
  overview:
    "Establishes the foundational architecture of enterprise Privileged Access Management (PAM). Covers the zero-trust security perimeter, component isolation models, the four primary subsystems (Digital Vault, PVWA, CPM, PSM), communication over proprietary TCP 1858, and the distinction between standard infrastructure management and privileged administrative stewardship.",
  modules: [
    {
      id: "m01-core",
      number: "M1",
      title: "Core Architecture & Component Mechanics",
      description:
        "Comprehensive walkthrough of the PAM infrastructure topology, component communication pathways, protocol isolation, and administrator baseline responsibilities.",
      lessons: [
        {
          id: "m01-l01",
          number: "1.1",
          title: "PAM Architecture Topology & Protocol Isolation",
          subtitle:
            "Deconstructing Vault, PVWA, CPM, and PSM interactions across secure network boundaries",
          estimatedMinutes: 25,
          learningObjectives: [
            "Deconstruct the four core components of an enterprise PAM deployment and their dedicated roles.",
            "Analyze protocol isolation across TCP 1858 (Vault protocol) and secure proxy channels.",
            "Distinguish between standard application architecture and the hardened non-routable bastion model.",
            "Map user interaction paths from PVWA authentication to mediated PSM target access.",
          ],
          prerequisites: [
            "Basic understanding of enterprise TCP/IP networking and firewall topologies.",
            "Familiarity with Active Directory, LDAP authentication, and identity providers.",
          ],
          conceptIntroduction:
            "Privileged Access Management (PAM) is not merely a shared password safe; it is an active security perimeter designed to defend an enterprise against lateral movement, credential theft, and unauthorized privilege escalation. In a traditional IT environment, administrative credentials (domain admins, root users, database service accounts) are distributed across thousands of endpoints, stored in configuration files, or memorized by engineers. If a single workstation is compromised via phishing or malware, attackers extract these credentials using memory-scraping tools such as Mimikatz and pivot unimpeded across the corporate network.\n\nAn enterprise PAM solution dismantles this attack surface by introducing a zero-knowledge brokering architecture. Sensitive credentials are encrypted and locked within a hardened bastion—the Digital Vault. End users, operators, and administrators never handle or know the actual plaintext passwords. Instead, all administrative workflows are authenticated through a centralized web portal (PVWA), rotated automatically by a background policy engine (CPM), and proxied through isolated jump hosts (PSM) where every keystroke and graphical frame is recorded and audited in real time.",
          whyItExists:
            "Without centralized PAM, enterprise credentials exist in an uncontrolled state with static passwords, absent accountability, and unmonitored sessions. Regulatory frameworks (PCI-DSS 8.2, SOX 404, ISO 27001 A.9) legally mandate that all privileged access must be uniquely attributable, rotated periodically, and audited continuously. PAM exists to eliminate standing privileges by introducing just-in-time checkouts and mediated jump access.",
          architecture: {
            overview:
              "The PAM architecture adheres to an asymmetrical hub-and-spoke model where the Digital Vault acts as the isolated kernel. No component connects directly to another without routing through the Vault or establishing mediated proxy tunnels.",
            componentResponsibilities: [
              {
                component: "Digital Vault",
                role: "Encrypted relational database and security kernel. Stores credentials, cryptographic keys, access control lists, and audit trails. Executes on hardened Windows Server with all non-essential OS services and networking disabled.",
                networkProtocols:
                  "TCP 1858 (Inbound from PVWA, CPM, PSM; outbound traffic strictly blocked)",
                securityBoundary: "Tier-0 Air-Gapped / Isolated Management VLAN",
              },
              {
                component: "Password Vault Web Access (PVWA)",
                role: "Centralized management console and user portal. Exposes REST APIs, authentication endpoints (SAML, RADIUS, LDAP), request-approval workflows, and system administration interfaces.",
                networkProtocols: "HTTPS 443 (Client to PVWA), TCP 1858 (PVWA to Vault)",
                securityBoundary: "DMZ / Web Tier",
              },
              {
                component: "Central Policy Manager (CPM)",
                role: "Background automation worker responsible for credential lifecycle. Periodically verifies, rotates, and reconciles passwords on remote target systems without user intervention.",
                networkProtocols:
                  "TCP 1858 (To Vault), RPC/SMB/SSH/SQL/HTTPS (From CPM to Target Systems)",
                securityBoundary: "Management Subnet / Orchestration Tier",
              },
              {
                component: "Privileged Session Manager (PSM)",
                role: "High-security RDS-based proxy bastion. Injects vaulted credentials directly into destination protocols (RDP, SSH, Web), isolating end-user laptops from target production servers.",
                networkProtocols:
                  "HTTPS/RDP 3389 (User to PSM), RDP/SSH/HTTPS (PSM to Target), TCP 1858 (PSM to Vault)",
                securityBoundary: "Bastion Jump Subnet",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Administrative User",
                action:
                  "Authenticates to PVWA via Corporate SSO / SAML with mandatory MFA token verification.",
                channelOrProtocol: "HTTPS (Port 443)",
                verificationRule:
                  "PVWA queries Vault over TCP 1858 to validate user license, group membership, and active sessions.",
              },
              {
                stepNumber: 2,
                actor: "PVWA Web Tier",
                action:
                  "Queries the Digital Vault to retrieve the list of Safes and accounts visible to the authenticated user.",
                channelOrProtocol: "Encrypted Vault Protocol (TCP 1858)",
                verificationRule:
                  "Vault enforces Safe-level Access Control Lists (ACLs); user only sees authorized targets.",
              },
              {
                stepNumber: 3,
                actor: "Administrative User",
                action:
                  "Clicks 'Connect' to initiate an administrative session to production database SRV-DB-01.",
                channelOrProtocol: "PVWA REST API / RDP Session File (.rdp)",
                verificationRule:
                  "PVWA invokes PSM API to generate a one-time dynamic session token.",
              },
              {
                stepNumber: 4,
                actor: "Privileged Session Manager (PSM)",
                action:
                  "Retrieves target credential from Vault, connects to target host, and injects credential without showing plaintext to user.",
                channelOrProtocol: "RDP Port 3389 / Target SSH Port 22",
                verificationRule:
                  "Keystroke recorder and video capture worker start recording before session window opens.",
              },
              {
                stepNumber: 5,
                actor: "Central Policy Manager (CPM)",
                action:
                  "Detects session termination or scheduled interval and executes one-time password rotation on target host.",
                channelOrProtocol: "Target Management Protocol (WMI/RPC/SSH)",
                verificationRule:
                  "CPM verifies new password hash matches Vault database state and marks account healthy.",
              },
            ],
          },
          terminology: [
            {
              term: "Digital Vault",
              definition:
                "The core secure storage engine operating on an OS-hardened server where all secrets, keys, and audit records reside.",
              enterpriseContext:
                "The Vault never initiates outbound connections; all components must poll or connect inbound on TCP 1858.",
            },
            {
              term: "PVWA (Password Vault Web Access)",
              definition:
                "The web-based graphical user interface and REST API gateway for end users and PAM administrators.",
              enterpriseContext:
                "Enterprise deployments utilize load-balanced PVWA pools behind an application delivery controller (F5/Citrix).",
            },
            {
              term: "CPM (Central Policy Manager)",
              definition:
                "The automated daemon service responsible for testing, changing, and reconciling account credentials on remote endpoints.",
              enterpriseContext:
                "Can be clustered or segmented across disparate geographical data centers to overcome firewall boundaries.",
            },
            {
              term: "PSM (Privileged Session Manager)",
              definition:
                "A secure jump server gateway that establishes isolated, recorded sessions to target assets without revealing secrets.",
              enterpriseContext:
                "Prevents workstation-to-server malware injection; all access terminates on the PSM farm.",
            },
          ],
          administratorResponsibilities: [
            "Maintain high availability and health status of all four core components (Vault, PVWA, CPM, PSM).",
            "Enforce strict firewall rules: only authorized component IP addresses may reach the Vault on TCP 1858.",
            "Monitor disk utilization, replication latency, and service heartbeats across all deployed component nodes.",
            "Review system audit logs daily for unauthorized connection attempts or service degradation flags.",
          ],
          configurationAndAdministration: [
            {
              name: "Vault Firewall Rule: Port 1858",
              settingOrObject: "Inbound Windows Firewall on Vault Server",
              description:
                "Restricts TCP 1858 inbound exclusively to the static IPs of PVWA, CPM, and PSM servers.",
              productionBestPractice:
                "Never open TCP 1858 to wide corporate subnets. Reject all traffic from unauthorized hosts with drop-silent rules.",
            },
            {
              name: "PVWA Base URL & Session Timeout",
              settingOrObject: "PVWA Options > General > Application URL",
              description: "Configures canonical FQDN and inactive operator timeout period.",
              productionBestPractice:
                "Enforce a maximum 15-minute inactivity timeout for PVWA web administrative sessions.",
            },
            {
              name: "CPM Interval Scan Cycle",
              settingOrObject: "pm.ini / Platform Default Execution Interval",
              description:
                "Defines the frequency at which CPM polls the Vault for pending password verification or rotation requests.",
              productionBestPractice:
                "Set interval to 1–2 minutes (60–120s) in enterprise environments to minimize rotation backlog.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Component Heartbeat Verification",
              action:
                "Log in to PVWA as PAM Administrator, navigate to Administration > System Health, and inspect component status pills.",
              expectedResult:
                "Digital Vault, CPM, PSM, and PVWA nodes report 'Connected' with latency under 15ms.",
              operatorNotes:
                "A warning or red pill indicates service stoppage or network routing partition on TCP 1858.",
            },
            {
              stepNumber: 2,
              title: "Vault Bastion Inspection",
              action:
                "Access the physical or hypervisor console of the Vault server and review PrivateArk Server console state.",
              expectedResult:
                "PrivateArk Server engine reports 'The Server is UP and running'. Active threads and DB connections within limits.",
              operatorNotes:
                "Do not attempt to RDP directly to the Vault server; remote desktop is permanently disabled by hardening scripts.",
            },
            {
              stepNumber: 3,
              title: "CPM Service Poll Verification",
              action:
                "Inspect the CyberArk Password Manager service status on the CPM Windows Server host.",
              expectedResult:
                "Service status is 'Running', and pm.log demonstrates continuous polling cycles without ITATS connection errors.",
            },
            {
              stepNumber: 4,
              title: "End-to-End Test Session",
              action:
                "Select a test Windows local account, click 'Connect' via PSM, and verify that the session launches cleanly.",
              expectedResult:
                "Target server desktop renders in secure session window; audit log records PSM Connect event.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (GFS Corp)",
            businessContext:
              "GFS Corp operates multi-region banking infrastructure comprising 14,000 servers and databases. Following a third-party red team audit that weaponized exposed local administrator passwords across Tier-1 branch servers, the CISO mandated immediate deployment of ShadowXLab PAM Academy architecture to eliminate standing privileges and satisfy FINRA/SOX compliance requirements.",
            governanceRequirements: [
              "Zero plaintext credentials on administrator workstations or developer environments.",
              "100% of administrative sessions must route through hardened PSM jump proxies with optical and keystroke recording.",
              "Vault communication must be strictly confined to dedicated management VLANs over TCP 1858.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "PVWA displays 'Server Error in /PasswordVault Application' or 'ITATS006E Database is unavailable'.",
              rootCause:
                "Network connectivity between PVWA and Vault over TCP 1858 is severed, or Vault service stopped.",
              securityImpact:
                "All users locked out of credential checkouts and emergency access; critical business interruption.",
              cyberArkCodeOrEvent: "ITATS006E",
            },
            {
              symptom:
                "CPM fails to perform password rotation: 'CACPM072E Connection to Vault failed on port 1858'.",
              rootCause:
                "Firewall rule dropped, CPM machine IP changed, or Vault credential file (user.ini) desynchronized.",
              securityImpact:
                "Credentials expire on target systems without rotating; accounts fail compliance audit windows.",
              cyberArkCodeOrEvent: "CACPM072E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Execute network socket test from PVWA or CPM host to the Vault IP on port 1858.",
              logFileOrConsole:
                "PowerShell: Test-NetConnection -ComputerName <Vault_IP> -Port 1858",
              remediation:
                "If TcpTestSucceeded is False, inspect intermediate hardware firewalls, router ACLs, and Vault host firewall.",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Inspect Vault server event and communication log for rejected connection attempts.",
              logFileOrConsole: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              remediation:
                "Search for 'Station is not defined' or IP mismatch errors. Add authorized IP to dbparm.ini AllowNodes list.",
            },
            {
              stepNumber: 3,
              diagnosticAction:
                "Verify that PrivateArk Server service is running and database engine has mounted encrypted drives.",
              logFileOrConsole: "PrivateArk Server Administration GUI / dbparm.ini",
              remediation:
                "Restart the PrivateArk Server service or mount encrypted storage volume using recovery keys.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "14/11/2026 14:22:01 ITATS006E Database is unavailable. Connection failed.\n14/11/2026 14:22:02 ITATS108E Station 10.0.10.45 is not an authorized client IP for TCP 1858.",
              explanation:
                "The Vault rejected the connection from 10.0.10.45 because that IP was not pre-authorized in the Vault's firewall configuration or dbparm.ini.",
            },
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\pm_error.log",
              sampleOutput:
                "CACPM072E Communication error with Digital Vault. ITATS004E Authentication failure for PasswordManager user.",
              explanation:
                "The CPM's stored authentication credential file (user.ini) has become corrupt or out of sync with the Vault internal user record.",
            },
          ],
          instructorNotes: [
            "In high-availability enterprise environments, the Digital Vault is typically deployed in an Active/Passive cluster or paired with a Disaster Recovery (PADR) replication partner.",
            "Never install any third-party agents (AV, backup clients, remote monitoring tools) on the Vault server unless they are certified CyberArk hardening exceptions.",
            "The CPM does not act as a proxy; it connects directly from its own network interface to the remote target ports (WMI, SSH, SQL). Ensure CPM has routing to endpoints.",
          ],
          securityImplications: [
            "Zero Trust Architecture: The Vault treats all network entities as untrusted until validated through cryptographic tokens on port 1858.",
            "Least Privilege: Component service accounts (e.g., PasswordManager, PSMServer) only have access to the Safes required for their operational scope.",
            "Audit Integrity: Vault audit records are tamper-proof and append-only; even the master Vault administrator cannot delete or alter historical audit entries.",
          ],
          knowledgeCheck: [
            {
              id: "m01-q01",
              question:
                "Which communication protocol and port does the Digital Vault use for all component interactions?",
              options: [
                "HTTPS over TCP Port 443",
                "Proprietary encrypted Vault protocol over TCP Port 1858",
                "LDAPS over TCP Port 636",
                "SSH Tunneling over TCP Port 22",
              ],
              correctIndex: 1,
              explanation:
                "The Digital Vault communicates exclusively over its proprietary, hardened, AES-256 encrypted protocol on TCP Port 1858. All inbound requests from PVWA, CPM, and PSM must utilize this port.",
              conceptTested: "Vault Communication Architecture",
            },
            {
              id: "m01-q02",
              question:
                "An administrative user reports that they cannot see any servers in the PVWA account inventory. What is the most probable architectural cause?",
              options: [
                "The target servers have shut down their SSH/RDP daemons.",
                "The user has not been granted 'List accounts' permission on the Safes containing those server credentials.",
                "The CPM service has experienced a heartbeat timeout on port 1858.",
                "The PSM proxy server certificate has expired.",
              ],
              correctIndex: 1,
              explanation:
                "The PVWA only presents accounts located in Safes where the authenticated user is an authorized Safe member with at least 'List accounts' permission. Target server health or CPM status does not affect inventory visibility.",
              conceptTested: "Safe Access Control Lists & PVWA Visibility",
            },
            {
              id: "m01-q03",
              question:
                "Why is remote desktop (RDP) typically disabled on a production Digital Vault server host?",
              options: [
                "Windows Server does not support RDP on non-domain joined servers.",
                "To comply with Vault OS hardening standards that eliminate remote attack vectors and ensure administration occurs only at the physical/hypervisor console.",
                "Because PrivateArk Server uses port 3389 for database replication.",
                "To prevent CPM from inadvertently rotating the Vault administrator password.",
              ],
              correctIndex: 1,
              explanation:
                "Digital Vault OS hardening strictly disables all inbound listening services, including RDP (TCP 3389), SMB, and Remote Registry, to eliminate remote exploit surfaces. Physical or hypervisor console access is strictly enforced.",
              conceptTested: "Vault Hardening & Security Bastion Principles",
            },
          ],
          practicalExercise: {
            id: "m01-ex01",
            title: "Inspect PAM Component Topology & Validate Network Heartbeats",
            objective:
              "Verify Digital Vault, PVWA, CPM, and PSM health indicators and confirm live onboarding, rotation, and session audit traces in the simulator.",
            scenario:
              "As the lead PAM Administrator at GFS Corp, audit the four core components (Vault, PVWA, CPM, PSM), inspect their operational latency, and confirm that all components have established healthy communication with the Vault.",
            prerequisites: [
              "Review Section 1–4 of Module 01 and inspect the Interactive Topology Explorer.",
            ],
            startingState:
              "Baseline simulator active with Vault ONLINE, 7 Safes, 12 seeded accounts, CPM operation log, and 4 audit entries.",
            instructions: [
              "Open the Dashboard (Overview) console and inspect the Platform Health panel for Digital Vault, PVWA, CPM, and PSM.",
              "Verify the top header reports 'Vault: ONLINE' and check component latency/queue indicators.",
              "Open Reports & Audit to inspect the baseline CPM Verify, Access Review, CPM Change, and PSM Terminate audit records.",
              "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion' to verify all 7 Lab 01 objectives.",
            ],
            stepDetails: [
              {
                action: "Open Dashboard and inspect all four services in Platform Health.",
                explanation:
                  "Confirms each isolated PAS tier (Vault, PVWA, CPM, PSM) is reachable and reporting telemetry.",
                expectedResult:
                  "Vault, PVWA, CPM, and PSM all display active status with latency/job metrics.",
              },
              {
                action:
                  "Confirm the header indicator shows 'Vault: ONLINE' and review Safe/account counts.",
                explanation:
                  "Verifies PVWA has an authenticated TCP 1858 channel to the simulated Digital Vault.",
                expectedResult:
                  "Header badge reports ONLINE and subnav displays active Vault inventory counts.",
              },
              {
                action:
                  "Open Reports & Audit and review the chronological control-plane audit trail.",
                explanation:
                  "Demonstrates immutable Vault auditing across CPM rotation, Safe review, and PSM sessions.",
                expectedResult:
                  "Audit table lists CPM Verify, Access review, CPM Change warning, and Terminate PSM session events.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation:
                  "Evaluates all 7 Lab 01 architecture and control-flow objectives against live state.",
                expectedResult: "All 7/7 Lab 01 objectives report passed (100/100).",
              },
            ],
            targetConsole: "overview",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "id-vault",
            validationCriteria:
              "All 7 Lab 01 component topology and control-flow audit objectives verified in live PamState.",
            troubleshootingHints: [
              {
                symptom: "A Lab 01 trace objective (CPM, PSM, or onboarding) shows pending.",
                hint: "Verify that baseline Safes, CPM operations, and audit events have not been cleared.",
                correctiveAction:
                  "Click Reset Simulator in the subnav or trigger a CPM Verify in CPM Operations, then re-validate.",
              },
            ],
            independentPractice: {
              title: "Independent Control-Plane Exception Triage",
              scenario:
                "Without guided steps, use Dashboard and Accounts to identify which accounts currently require operator attention.",
              goal: "Locate both the unmanaged database account and the failed backup rotation account.",
              targetConsole: "accounts",
              successCriteria: [
                "Identified oracle on DB-ORA-01 as Unmanaged.",
                "Identified svc_backup on WIN-SRV-02 as Rotation failed with failure detail 'Account locked on target'.",
              ],
            },
          },
          completionCriteria: [
            "Analyzed the four-component PAM architecture (Vault, PVWA, CPM, PSM).",
            "Identified TCP 1858 protocol rules and bastion hardening constraints.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the practical inspection exercise in the PAM simulator.",
          ],
          references: [
            "NIST SP 800-207: Zero Trust Architecture & Control Plane Isolation",
            "CyberArk PAM Implementation Guide: Component Architecture & Network Requirements",
            "CIS Microsoft Windows Server Benchmark: Bastion Host Hardening Standards",
          ],
        },
      ],
    },
  ],
};
