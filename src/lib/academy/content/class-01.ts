/**
 * SHADOWXLAB PAM ACADEMY — CLASS 01: PAM FOUNDATIONS & ADMINISTRATOR ROLE
 * Deep instructional content covering all 15 core architectural topics.
 */

import type { ClassCurriculum } from "../types";

export const CLASS_01: ClassCurriculum = {
  id: "class-01",
  number: "01",
  label: "CLASS 01",
  title: "PAM Foundations & Administrator Role",
  subtitle: "Architecture, Credential Risk & Enterprise Request-to-Audit Workflow",
  duration: "1H 45M",
  level: "Foundational",
  overview:
    "Master the core principles of enterprise Privileged Access Management (PAM), the anatomy of privileged credential compromise, the multi-tier CyberArk PAS component architecture, and the daily operational responsibilities of a PAM administrator.",
  modules: [
    {
      id: "c01-m01",
      number: "M1",
      title: "Privileged Identity Risk, Lateral Movement & Defense-in-Depth",
      description:
        "Understand the privileged credential crisis, pass-the-hash attacks, tier-0 infrastructure vulnerability, and why perimeter security fails without privileged access governance.",
      lessons: [
        {
          id: "c01-m01-l01",
          number: "1.1",
          title: "The Anatomy of Privileged Credential Compromise & Lateral Movement",
          subtitle: "From Workstation Phishing to Domain Controller Dominance",
          estimatedMinutes: 20,
          learningObjectives: [
            "Explain how adversaries exploit plaintext memory credentials via LSASS injection (Mimikatz).",
            "Trace the step-by-step lateral movement progression from Tier-2 endpoints to Tier-0 identity infrastructure.",
            "Differentiate between traditional access control and cryptographic privileged credential isolation.",
          ],
          prerequisites: [
            "Basic understanding of Active Directory domain hierarchy.",
            "Familiarity with Windows authentication protocols (NTLM, Kerberos).",
          ],
          conceptIntroduction:
            "Privileged access management is the architectural discipline of isolating, controlling, and continuously auditing identities that possess elevated administrative capabilities across an enterprise. Unlike standard business users whose compromised credentials provide limited scope, a single compromised privileged account (such as a Domain Admin, Unix root, or database SA) grants adversaries unrestricted access to dump customer databases, deploy ransomware, or establish persistent backdoors.",
          whyItExists:
            "Over 80% of major enterprise breaches involve compromised privileged credentials. In traditional unmanaged environments, system administrators frequently reuse passwords across servers, log into compromised workstations with high-privilege credentials, and leave administrative sessions open. When an attacker gains initial access via phishing or unpatched endpoints, they dump local memory to harvest hashes and move laterally through the enterprise until achieving total infrastructure domination.",
          architecture: {
            overview:
              "Enterprise architectures are partitioned into security tiers (Tier-0: Identity/PKI, Tier-1: Enterprise Servers/Applications, Tier-2: User Workstations). CyberArk PAM sits as an out-of-band trust boundary separating administrative operators from raw host credentials.",
            diagramAscii: `
[ Adversary Initial Foothold: Tier-2 Workstation ]
                      │
           (LSASS Memory Harvesting)
                      ▼
[ Stolen Local Admin / Helpdesk NTLM Hash ]
                      │
             (Pass-the-Hash / WMI)
                      ▼
[ Tier-1 Application Server / Jump Box ]
                      │
          (Kerberoasting / DCSync)
                      ▼
[ Tier-0 Domain Controller Compromise (Full Domain Admin) ]

================== WITH CYBERARK PAM CONTROL ==================

[ Admin Operator ] ──(HTTPS: 443)──► [ PVWA Portal / MFA Gate ]
                                              │
                                     (Proprietary TCP: 1858)
                                              ▼
                                   [ Hardened Digital Vault ]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         [ PSM Jump Server Proxy ]                        [ CPM Lifecycle Service ]
     (Transparent Credential Injection)                 (Periodic Verified Rotation)
                      │                                               │
               (RDP: 3389 / SSH: 22)                         (RPC: 135/445 / SSH: 22)
                      ▼                                               ▼
         [ Target Server / Database ]                     [ Target Password Sync ]
`,
            componentResponsibilities: [
              {
                component: "Digital Vault (Server)",
                role: "Encrypted, isolated repository storing privileged credentials and audit trails.",
                networkProtocols: "TCP 1858 (Proprietary non-routable protocol)",
                securityBoundary: "Hardened Windows Server, firewall closed except TCP 1858.",
              },
              {
                component: "PVWA (Web Access)",
                role: "Web UI and REST API portal for authentication, requests, and administrative operations.",
                networkProtocols: "HTTPS 443 from browser; TCP 1858 to Digital Vault",
                securityBoundary: "DMZ or management VLAN; zero local credential storage.",
              },
              {
                component: "CPM (Central Policy Manager)",
                role: "Automated engine executing password verification, rotation, and reconciliation on targets.",
                networkProtocols: "TCP 1858 to Vault; RPC 135/445, LDAP 389/636, SSH 22 to targets",
                securityBoundary:
                  "Internal administrative bastion; service runs under hardened local account.",
              },
              {
                component: "PSM (Privileged Session Manager)",
                role: "Proxy jump server that transparently injects credentials into client protocols and records sessions.",
                networkProtocols:
                  "RDP 3389 from clients; TCP 1858 to Vault; RDP 3389 / SSH 22 to targets",
                securityBoundary:
                  "Hardened Windows RDS server with restricted shell escape protections.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Operator",
                action: "Authenticates to PVWA with multi-factor authentication (MFA).",
                channelOrProtocol: "HTTPS 443",
                verificationRule:
                  "Operator must belong to authorized AD security groups mapped to Safe.",
              },
              {
                stepNumber: 2,
                actor: "PVWA",
                action:
                  "Queries the Digital Vault to check Safe authorization and dual-control approval.",
                channelOrProtocol: "TCP 1858",
                verificationRule: "Vault validates Safe ACLs, time windows, and ticket ID.",
              },
              {
                stepNumber: 3,
                actor: "PSM",
                action:
                  "Retrieves plaintext credential directly from Vault into memory and launches target connection.",
                channelOrProtocol: "TCP 1858 & Target Protocol",
                verificationRule: "Operator never sees or possesses the target password.",
              },
              {
                stepNumber: 4,
                actor: "CPM",
                action:
                  "Automatically rotates target password immediately following session checkout or scheduled cycle.",
                channelOrProtocol: "Target Protocol (RPC/SSH)",
                verificationRule:
                  "Rotated secret is updated in Vault before target host saves changes.",
              },
            ],
          },
          terminology: [
            {
              term: "Pass-the-Hash (PtH)",
              definition:
                "An exploitation technique where an adversary extracts an NTLM password hash from a compromised host and authenticates to remote services without cracking the plaintext password.",
              enterpriseContext:
                "Prevented by PAM through continuous randomized password rotation and one-time-use credentials (OTK), which invalidate harvested hashes.",
            },
            {
              term: "Kerberoasting",
              definition:
                "An attack targeting Active Directory service accounts (SPNs) where an adversary requests Kerberos TGS tickets and cracks the service account password offline.",
              enterpriseContext:
                "Prevented by vaulting Service Principals in CyberArk and enforcing complex passwords (32+ characters) that render brute-force cracking mathematically infeasible.",
            },
            {
              term: "Digital Vault",
              definition:
                "The fortified core of the CyberArk PAS infrastructure, featuring an encrypted database, custom micro-firewall, and isolated cryptographic keys.",
              enterpriseContext:
                "Communicates exclusively over TCP port 1858, rejecting any non-CyberArk packet even if network firewalls allow passage.",
            },
          ],
          administratorResponsibilities: [
            "Perform daily morning audits of Vault component connectivity and service states.",
            "Inspect rotation exception queues for failed CPM synchronization attempts.",
            "Enforce least-privilege Safe membership and eliminate static shared administrative passwords.",
            "Review session recordings for high-risk Tier-0 infrastructure modifications.",
          ],
          configurationAndAdministration: [
            {
              name: "Vault Firewall Rule (TCP 1858)",
              settingOrObject: "Windows Defender Firewall on Vault Server",
              description:
                "Restricts all inbound network traffic except TCP 1858 from designated PVWA, CPM, and PSM IP addresses.",
              productionBestPractice:
                "Never multi-home Vault NICs or open RDP to the Vault server.",
            },
            {
              name: "One-Time Password (OTP) Policy",
              settingOrObject: "Platform Policy > Automatic Password Management",
              description:
                "Forces a CPM password change immediately after an operator checks out a password or terminates a PSM session.",
              productionBestPractice:
                "Mandate OTP for all Tier-0 Domain Administrator and emergency break-glass Safes.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Component Health Audit",
              action:
                "Log into PVWA as a Vault Administrator and inspect the System Health dashboard.",
              expectedResult:
                "Vault Server, CPM, and PSM report green status with recent heartbeat timestamps (< 2 min).",
            },
            {
              stepNumber: 2,
              title: "Inventory Verification",
              action:
                "Navigate to the Accounts console and review management states across Windows and Linux targets.",
              expectedResult:
                "All accounts show 'Managed' status without pending verification flags.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "GFS operates a multi-region hybrid banking platform subject to strict PCI-DSS and SWIFT customer security controls. The enterprise recently detected unauthorized lateral movement originating from a developer workstation where a local administrator hash was dumped via Mimikatz.",
            governanceRequirements: [
              "Zero plaintext credentials permitted on administrator endpoints.",
              "Mandatory multi-factor authentication for all privileged sessions.",
              "Complete session keystroke capture and screen recording for all production database modifications.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "CPM fails to rotate password with error: 'Network path was not found' (CACPM072E).",
              rootCause:
                "Target server firewall blocking TCP 445/135 from the CPM bastion IP address.",
              securityImpact:
                "Credential becomes desynchronized and unmanaged, leaving the system exposed to stale password reuse.",
            },
            {
              symptom:
                "Operator receives 'PSMSR037E Access is denied' when initiating an RDP session.",
              rootCause:
                "Target server Remote Desktop Users group does not include the vaulted account.",
              securityImpact:
                "Legitimate emergency maintenance blocked during operational downtime.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Verify TCP 1858 network connectivity from PVWA to Vault using Test-NetConnection.",
              logFileOrConsole: "PowerShell console on PVWA server.",
              remediation:
                "Check Vault IP route and ensure the Vault Windows Firewall service is running.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Inspect pm.log and pm_error.log on the CPM server.",
              logFileOrConsole:
                "C:\\Program Files (x86)\\CyberArk\\Password Manager\\Logs\\pm_error.log",
              remediation:
                "Identify target error code and verify local firewall/RPC availability on target host.",
            },
          ],
          securityImplications: [
            "Vault keys must be stored on a dedicated Hardware Security Module (HSM) or secure physical volume.",
            "Failure to isolate the Digital Vault behind a non-routable boundary compromises all enterprise secrets simultaneously.",
          ],
          knowledgeCheck: [
            {
              id: "c01-q01",
              question:
                "Why does the CyberArk Digital Vault communicate exclusively on TCP port 1858?",
              options: [
                "Because port 1858 is standard HTTP traffic encrypted with TLS 1.3.",
                "To enforce a non-routable, proprietary encrypted protocol that rejects non-Vault packets at the network stack.",
                "To allow web browsers to access the vault database directly without an intermediate web server.",
                "To bypass operating system firewalls without administrative intervention.",
              ],
              correctIndex: 1,
              explanation:
                "The Vault protocol runs on TCP 1858 using proprietary encryption and session handshakes. Non-CyberArk traffic sent to this port is immediately discarded, insulating the Vault from generic network port exploits.",
              conceptTested: "Digital Vault Network Architecture",
            },
            {
              id: "c01-q02",
              question:
                "How does transparent PSM credential injection prevent Pass-the-Hash attacks?",
              options: [
                "It cracks the user's password and stores it in browser cookies.",
                "It connects to targets using plaintext Telnet rather than Kerberos.",
                "It injects the vaulted credential directly into target memory from the PSM server so the operator never sees or possesses the hash.",
                "It converts all Windows accounts into Active Directory Read-Only Domain Controllers.",
              ],
              correctIndex: 2,
              explanation:
                "Because credentials are injected server-side by PSM, the client workstation never receives the password or NTLM hash, rendering memory scraping tools on client machines useless.",
              conceptTested: "PSM Session Brokering & Credential Masking",
            },
          ],
          practicalExercise: {
            id: "ex-c01-01",
            title: "Trace PAS Component Connectivity & Audit Status",
            scenario:
              "As the PAM Administrator for Global Financial Services, navigate to the Accounts and Safe management consoles to audit the 7 enterprise Safes and verify that Vault, CPM, and PSM components report online status.",
            instructions: [
              "Review the top PVWA navigation bar to verify the Vault connection indicator reports 'ONLINE'.",
              "Navigate to the Safes console and inspect the operational boundaries of WIN-SAFE and UNIX-SAFE.",
              "Open the Learning Academy Class 01 hands-on lab tab and run the validation engine to confirm your trace.",
            ],
            targetConsole: "accounts",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "id-vault",
            validationCriteria:
              "Vault component status verified online and Safe architecture inspected.",
          },
          completionCriteria: [
            "Passed Knowledge Checkpoint questions with 100% conceptual accuracy.",
            "Inspected Digital Vault component architecture and network flow diagram.",
            "Verified operational readiness of Vault, CPM, and PSM in the simulation engine.",
          ],
          references: [
            "CyberArk PAS Installation & Deployment Guide (Privileged Access Security v12+)",
            "NIST SP 800-207: Zero Trust Architecture (Section 3.1: Logical Components)",
            "MITRE ATT&CK Technique T1555: Credentials from Password Stores",
          ],
        },
      ],
    },
    {
      id: "c01-m02",
      number: "M2",
      title: "CyberArk PAS Component Architecture & Trust Boundaries",
      description:
        "Comprehensive architectural breakdown of Digital Vault, Password Vault Web Access (PVWA), Central Policy Manager (CPM), and Privileged Session Manager (PSM).",
      lessons: [
        {
          id: "c01-m02-l01",
          number: "1.2",
          title: "The Four Pillars of CyberArk PAS: Vault, PVWA, CPM & PSM",
          subtitle: "Component Interdependence, Port Matrices, and Failover Topologies",
          estimatedMinutes: 25,
          learningObjectives: [
            "Delineate the precise technical boundaries between the Vault, PVWA, CPM, and PSM.",
            "Map all requisite firewall ports, directionalities, and transport protocols across components.",
            "Analyze single points of failure and High Availability (HA) / Disaster Recovery (DR) Vault clustering.",
          ],
          prerequisites: ["Completion of Lesson 1.1.", "Familiarity with TCP/IP network ports."],
          conceptIntroduction:
            "CyberArk Privileged Access Security (PAS) is intentionally partitioned into discrete, specialized server components rather than a monolithic application. This separation enforces defense-in-depth: compromising the web presentation tier (PVWA) does not expose the vault encryption keys, and a failure in an automated rotation plugin (CPM) does not disrupt live session brokering (PSM).",
          whyItExists:
            "In modern enterprise cybersecurity, architectural isolation is mandatory. If the web server, password rotation engine, and database were hosted on a single operating system, any web application vulnerability (e.g. Log4j, deserialization) would directly grant the attacker access to all vaulted secrets. The CyberArk four-pillar model ensures that the Digital Vault is physically and logically segregated from all user-facing interfaces.",
          architecture: {
            overview:
              "The Digital Vault acts as the single source of truth and authoritative policy repository. PVWA, CPM, and PSM act as dedicated clients that authenticate to the Vault using specialized internal Vault users with strictly scoped permissions.",
            diagramAscii: `
                                    [ FIREWALL ]
                                         │
┌────────────────────────────────────────┴────────────────────────────────────────┐
│                                                                                 │
│   ┌─────────────────────┐    TCP 1858    ┌──────────────────────────────┐       │
│   │   PVWA Web Portal   │───────────────►│    HARDENED DIGITAL VAULT    │       │
│   │ (IIS / REST API)    │                │  (Server 2022 / Firewalled)  │       │
│   └─────────────────────┘                │  - Encrypted Safe DB         │       │
│              ▲                           │  - Server Key + Recovery Key │       │
│              │ HTTPS 443                 └──────────────────────────────┘       │
│              │                                  ▲               ▲               │
│       [ Admin Browser ]                         │               │               │
│                                        TCP 1858 │      TCP 1858 │               │
│                                                 │               │               │
│                                  ┌──────────────┴───┐   ┌───────┴──────────┐    │
│                                  │   CPM Service    │   │  PSM Jump Server │    │
│                                  │ (Password Mgr)   │   │  (Session Proxy) │    │
│                                  └──────────────────┘   └──────────────────┘    │
│                                           │                       │             │
│                                RPC / SSH  │             RDP / SSH │             │
│                                           ▼                       ▼             │
│                                  [ TARGET WINDOWS ]     [ TARGET LINUX ]        │
│                                  [   & DB HOSTS   ]     [  & DB CLUSTERS ]      │
└─────────────────────────────────────────────────────────────────────────────────┘
`,
            componentResponsibilities: [
              {
                component: "Digital Vault",
                role: "Authoritative repository; executes Safe encryption, access control checks, and immutable logging.",
                networkProtocols: "Listens on TCP 1858 only; no outbound initiated connections.",
                securityBoundary:
                  "Operating system hardened; Windows services stripped down to minimal footprint.",
              },
              {
                component: "PVWA",
                role: "Renders UI, manages dual-control requests, processes ticketing approvals, and exposes REST API.",
                networkProtocols:
                  "Listens HTTPS 443 from clients; connects outbound TCP 1858 to Vault.",
                securityBoundary:
                  "Web application pool runs under restricted identity with zero Vault admin rights.",
              },
              {
                component: "CPM",
                role: "Polls Vault for rotation tasks; interacts directly with target operating systems to change passwords.",
                networkProtocols:
                  "Connects outbound TCP 1858 to Vault; connects outbound RPC/SSH/SQL to targets.",
                securityBoundary:
                  "Protected administrative host with least-privilege target discovery agents.",
              },
              {
                component: "PSM",
                role: "Establishes monitored RDP/SSH sessions, injects vaulted credentials, and logs keystrokes.",
                networkProtocols:
                  "Listens RDP 3389 from clients; connects outbound TCP 1858 to Vault; outbound to targets.",
                securityBoundary:
                  "RDS Jump host with strict AppLocker policies preventing arbitrary process execution.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "PVWA Internal User",
                action:
                  "PVWA queries Vault over TCP 1858 to populate account inventory based on logged-in user permissions.",
                channelOrProtocol: "TCP 1858",
                verificationRule:
                  "Vault checks Safe membership; unpermitted accounts are omitted from response.",
              },
              {
                stepNumber: 2,
                actor: "CPM Service User",
                action:
                  "CPM queries Vault for accounts flagged with 'ImmediateChange' or scheduled for periodic rotation.",
                channelOrProtocol: "TCP 1858",
                verificationRule:
                  "CPM possesses 'Initiate CPM Operations' permission on target Safe.",
              },
              {
                stepNumber: 3,
                actor: "PSMAppUser",
                action:
                  "PSM authenticates to Vault to retrieve the temporary password for a requested session.",
                channelOrProtocol: "TCP 1858",
                verificationRule: "Must be accompanied by active session token generated by PVWA.",
              },
            ],
          },
          terminology: [
            {
              term: "AppLocker",
              definition:
                "A Windows feature used on CyberArk PSM servers to restrict operators from running unauthorized executables, cmd.exe, or PowerShell during a proxied administrative session.",
              enterpriseContext:
                "Guarantees that an administrator connecting to a target cannot break out of the PSM jump server into the hosting RDS desktop environment.",
            },
            {
              term: "Disaster Recovery (DR) Vault",
              definition:
                "A standby Digital Vault server that continuously replicates encrypted Safe database updates from the Primary Vault over TCP 1858.",
              enterpriseContext:
                "If the primary Vault heartbeats stop, the DR Vault automatically initiates a failover sequence, promoting itself to Primary without credential loss.",
            },
          ],
          administratorResponsibilities: [
            "Monitor replication latency between Primary Vault and Disaster Recovery (DR) Vault clusters.",
            "Maintain AppLocker rules on PSM servers when onboarding custom connection components.",
            "Audit CPM service logs to verify that target platform plug-ins execute within expected timeout thresholds.",
          ],
          configurationAndAdministration: [
            {
              name: "Vault.ini Configuration",
              settingOrObject: "C:\\Program Files (x86)\\CyberArk\\...\\Vault.ini",
              description:
                "Specifies Vault IP addresses, recovery timeouts, and connection ports used by PVWA, CPM, and PSM.",
              productionBestPractice:
                "Include Primary and DR Vault IPs in the Address parameter for automatic client failover.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Checking Service Heartbeats",
              action:
                "Open the PVWA System Health console and verify that CPM and PSM reports match live server status.",
              expectedResult: "All components show active heartbeats under 2 minutes old.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "GFS deployed three PSM jump hosts behind an enterprise network load balancer (F5 BIG-IP) to handle 2,000 concurrent administrative sessions without performance degradation.",
            governanceRequirements: [
              "Zero downtime for privileged access during maintenance windows.",
              "Automatic DR Vault failover within 120 seconds of Primary Vault host outage.",
            ],
          },
          failureScenarios: [
            {
              symptom: "All CPM rotations fail simultaneously across all Safes.",
              rootCause:
                "The CyberArk Password Manager service on the CPM host is stopped or its Vault credential file (user.ini) is out of sync.",
              securityImpact:
                "Passwords expire across all production targets without automatic rotation, risking operational lockout.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Check CPM Windows Services console and restart 'CyberArk Password Manager'.",
              logFileOrConsole: "services.msc on CPM server.",
              remediation:
                "If service fails to start, re-create the CPM user credential file using CreateEnv.exe.",
            },
          ],
          securityImplications: [
            "Hardening scripts provided by CyberArk must be executed on all Vault, CPM, and PSM hosts during initial deployment.",
          ],
          knowledgeCheck: [
            {
              id: "c01-m02-q01",
              question:
                "Which CyberArk component initiates network connections directly to target hosts to rotate passwords?",
              options: [
                "PVWA",
                "Digital Vault",
                "CPM (Central Policy Manager)",
                "PSM (Privileged Session Manager)",
              ],
              correctIndex: 2,
              explanation:
                "CPM is the automated worker service that logs into target Windows, Linux, network, or database servers to verify, change, or reconcile credentials. The Vault never initiates outbound connections.",
              conceptTested: "Component Operational Roles",
            },
          ],
          completionCriteria: [
            "Understood the directional port matrix between PAS components.",
            "Explained why the Digital Vault never initiates outbound connections.",
          ],
          references: [
            "CyberArk PAS Architecture Overview Guide",
            "CyberArk Security Hardening Baseline Standards",
          ],
        },
      ],
    },
  ],
};
