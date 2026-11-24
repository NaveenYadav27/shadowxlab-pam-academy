/**
 * SHADOWXLAB PAM ACADEMY — MODULE 13: SELF-HOSTED ARCHITECTURE
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_13: ClassCurriculum = {
  id: "module-13",
  number: "13",
  label: "MODULE 13",
  title: "Self-Hosted Architecture",
  subtitle: "Infrastructure Sizing, Bastion Hardening & High Availability Topologies",
  duration: "55 mins",
  level: "Professional",
  track: "admin-20",
  category: "Self-Hosted Infrastructure & Hardening",
  overview:
    "Master the engineering principles of self-hosted, on-premises PAM infrastructure deployments. Deconstruct physical and virtual server sizing matrices (CPU, RAM, IOPS), the automated Vault OS Hardening Script, network segmentation between Tier-0 and DMZ tiers, component farm topologies (load-balanced PVWA and PSM clusters), and High Availability clustering versus Disaster Recovery.",
  modules: [
    {
      id: "m13-core",
      number: "M13",
      title: "Self-Hosted Sizing & Hardening Engineering",
      description:
        "Comprehensive walkthrough of infrastructure sizing calculations, OS baseline lockdowns, component farm deployment, and network zoning.",
      lessons: [
        {
          id: "m13-l01",
          number: "13.1",
          title: "Infrastructure Sizing, OS Hardening & Component Clustering",
          subtitle:
            "Designing resilient self-hosted topologies, executing Vault hardening, and sizing PSM/CPM farms",
          estimatedMinutes: 25,
          learningObjectives: [
            "Calculate compute, memory, and storage requirements for enterprise PAM deployments based on account count and concurrent sessions.",
            "Deconstruct the automated Vault OS Hardening Script and analyze its security baselines (service removal, firewall drops, registry lockdown).",
            "Design scalable, load-balanced multi-node farms for PVWA and PSM components.",
            "Contrast Active/Passive Vault clustering with asynchronous Disaster Recovery (PADR) replication.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 10: PSM — Part 1.",
          ],
          conceptIntroduction:
            "Deploying an enterprise PAM solution in a self-hosted or private cloud environment is fundamentally different from installing standard enterprise software. The Digital Vault host is not a standard application server; it is a Tier-0 cryptographic bastion that must withstand nation-state attacks, internal network compromise, and zero-day vulnerabilities.\n\nA self-hosted architecture requires meticulous engineering across three domains:\n1. **Hardware & Resource Sizing**: Vault database performance is heavily bound to disk IOPS and memory throughput. Furthermore, PSM jump servers operate as Remote Desktop hosts where each concurrent session consumes dedicated RAM (150–250MB) and CPU cycles. Sizing mistakes lead to sluggish web interfaces and session connection timeouts.\n2. **Operating System Hardening**: Before the Digital Vault software is installed, the underlying Windows Server operating system undergoes an aggressive, automated hardening procedure. This script disables over 70 non-essential Windows services (including Remote Desktop, Print Spooler, SMB server, and Windows Update), strips default networking protocols, applies CIS Level 2 benchmark registry configurations, and permanently isolates the host behind a drop-silent firewall.\n3. **Component Farm Topology**: To avoid single points of failure, PVWA web nodes and PSM proxy servers are deployed in multi-node load-balanced farms across redundant hypervisors and availability zones, while the Vault is deployed in an Active/Passive cluster or paired with real-time Disaster Recovery replication.",
          whyItExists:
            "Default operating systems contain thousands of vulnerabilities and unnecessary listening ports. Hardening converts a standard server into an impervious cryptographic fortress, while proper sizing guarantees 99.999% availability during peak operational loads.",
          architecture: {
            overview:
              "The self-hosted architecture enforces strict network zoning: PVWA in DMZ/Web VLAN, PSM in Bastion VLAN, CPM in Management VLAN, and Digital Vault isolated in Tier-0 Management VLAN.",
            componentResponsibilities: [
              {
                component: "Hardened Digital Vault Host",
                role: "OS-hardened physical server or isolated VM running PrivateArk Server database engine on dedicated encrypted storage drives.",
                networkProtocols: "TCP 1858 Inbound only; all outbound network traffic blocked",
                securityBoundary: "Tier-0 Air-Gapped / Isolated Management VLAN",
              },
              {
                component: "PVWA Load-Balanced Farm",
                role: "Two or more Windows Server nodes running IIS behind an Application Delivery Controller (F5 / Citrix NetScaler).",
                networkProtocols: "HTTPS 443 Inbound; TCP 1858 Outbound to Vault",
                securityBoundary: "DMZ / Web Application Tier",
              },
              {
                component: "PSM Session Farm",
                role: "High-capacity RDS farm scaled horizontally to support concurrent administrative RDP/SSH sessions.",
                networkProtocols:
                  "RDP 3389 / HTTPS 443 Inbound; TCP 1858 to Vault; Target ports to production subnets",
                securityBoundary: "Bastion Jump Proxy Subnet",
              },
              {
                component: "CPM Management Node",
                role: "Dedicated orchestration worker located within network proximity to target production hosts.",
                networkProtocols:
                  "TCP 1858 to Vault; Management protocols (WMI, SSH, SQL) to targets",
                securityBoundary: "Management Subnet / Orchestration Tier",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Infrastructure Architect",
                action:
                  "Sizes deployment: 10,000 accounts, 200 concurrent PSM sessions -> Specifies 2x PVWA (8 vCPU/16GB), 3x PSM (16 vCPU/32GB), 1x Primary Vault + 1x DR Vault.",
                channelOrProtocol: "Architecture Sizing Matrix",
                verificationRule: "Sizing adheres to vendor concurrent session and IOPS formulas.",
              },
              {
                stepNumber: 2,
                actor: "PAM Systems Engineer",
                action:
                  "Executes Vault OS Hardening Script (`PostInstall.cmd` / `Hardening.ps1`) on clean Windows Server 2022 build.",
                channelOrProtocol: "Local Console Execution",
                verificationRule:
                  "70+ services disabled; RDP disabled; Windows Firewall set to block all inbound except TCP 1858.",
              },
              {
                stepNumber: 3,
                actor: "Network Security Team",
                action:
                  "Implements hardware firewall ACLs: only PVWA, CPM, and PSM static IPs can route to Vault on TCP 1858.",
                channelOrProtocol: "Hardware Firewall Policy",
                verificationRule:
                  "Any packets from unauthorized subnets dropped without RST/ICMP response.",
              },
              {
                stepNumber: 4,
                actor: "Load Balancer Controller",
                action:
                  "Monitors health check endpoints (`/PasswordVault/api/health`) across PVWA nodes and distributes client traffic evenly.",
                channelOrProtocol: "HTTPS Health Probes",
                verificationRule:
                  "Failed node automatically removed from rotation without user session disruption.",
              },
            ],
          },
          terminology: [
            {
              term: "Vault OS Hardening",
              definition:
                "The automated process of stripping and locking down the underlying Windows Server operating system to create an impregnable bastion.",
              enterpriseContext:
                "Removes remote management, stops SMB, disables NetBIOS, and eliminates all potential OS-level exploit vectors.",
            },
            {
              term: "Component Farm",
              definition:
                "A horizontally scaled cluster of redundant component servers (e.g., PVWA or PSM nodes) operating behind a load balancer.",
              enterpriseContext:
                "Guarantees high availability: if one PSM host crashes, traffic seamlessly routes to surviving nodes.",
            },
            {
              term: "Drop-Silent Firewall",
              definition:
                "A firewall configuration where packets sent to closed ports or from unauthorized IPs are silently discarded without sending ICMP unreachable or TCP reset packets.",
              enterpriseContext:
                "Makes the Digital Vault completely invisible to port scanners on the corporate network.",
            },
            {
              term: "Active/Passive Vault Cluster",
              definition:
                "A high-availability deployment where two Vault servers share an external SAN/NAS storage array; if Node A fails, Node B mounts storage and starts services in seconds.",
              enterpriseContext:
                "Provides near-zero Recovery Time Objective (RTO) for high-availability local data centers.",
            },
          ],
          administratorResponsibilities: [
            "Execute and verify complete OS hardening on all Vault and component hosts prior to production go-live.",
            "Monitor hardware utilization: ensure Vault database volume maintains at least 2,500 dedicated IOPS.",
            "Test load balancer failover quarterly by taking individual PVWA and PSM nodes offline during maintenance windows.",
            "Maintain strict separation of duties: network engineers manage switches, hypervisor admins manage VMs, PAM admins manage the Vault.",
          ],
          configurationAndAdministration: [
            {
              name: "Vault Storage Partitioning",
              settingOrObject: "Vault Server Disk Management",
              description:
                "Separates OS (C:), Database Engine & Data (D:), and Vault Audit/Recordings (E:).",
              productionBestPractice:
                "Always place the database and recording volumes on high-speed NVMe or SSD storage with dedicated IOPS.",
            },
            {
              name: "PVWA Load Balancer Sticky Sessions",
              settingOrObject: "F5 / NetScaler VIP Configuration",
              description:
                "Configures session persistence based on source IP or session cookie (`ASP.NET_SessionId`).",
              productionBestPractice:
                "Enable cookie-based sticky sessions with 15-minute persistence to prevent mid-session logout glitches.",
            },
            {
              name: "PSM Connection Throttling",
              settingOrObject:
                "PVWA Administration > Options > Privileged Session Management > Server ID",
              description: "Defines maximum concurrent sessions permitted per PSM server host.",
              productionBestPractice:
                "Cap concurrency at 80% of rated capacity (e.g. max 120 sessions on a 150-session host) to prevent memory saturation.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Execute Vault Hardening Script",
              action:
                "On clean Vault host, open administrative PowerShell, navigate to Hardening directory, and run `Hardening.ps1`.",
              expectedResult:
                "Script disables 70+ services, enforces local security policy, and configures Windows Firewall rules.",
              operatorNotes:
                "Once hardening completes, console will prompt for reboot. RDP access will be permanently disabled.",
            },
            {
              stepNumber: 2,
              title: "Verify Firewall Inbound Rules",
              action:
                "In Windows Defender Firewall with Advanced Security, inspect inbound rules for PrivateArk Server.",
              expectedResult:
                "Only TCP port 1858 is open, scoped strictly to approved component IP addresses.",
            },
            {
              stepNumber: 3,
              title: "Validate PVWA Load Balancer Health",
              action:
                "Send HTTP GET probe to `https://<LB_VIP>/PasswordVault/api/health` from an internal monitoring probe.",
              expectedResult:
                "Returns HTTP 200 OK with healthy component indicators for all backend PVWA nodes.",
            },
            {
              stepNumber: 4,
              title: "Review System Resource Allocation",
              action:
                "In PVWA System Health, review CPU, memory, and disk headroom across all component nodes.",
              expectedResult: "All nodes report healthy status with memory utilization below 75%.",
            },
          ],
          enterpriseScenario: {
            organization: "Elysium Global Banking Corp",
            businessContext:
              "Elysium operates financial transaction clearing systems across Zurich, Singapore, and New York. To satisfy Swiss banking secrecy regulations (FINMA Circular 2008/21), the bank cannot utilize multi-tenant cloud PAM solutions; all infrastructure must be self-hosted on physical bare-metal hardware. The architecture team designed an on-premises multi-site PAM topology featuring Active/Passive Vault clustering in Zurich and synchronous Disaster Recovery nodes in Geneva.",
            governanceRequirements: [
              "Zero reliance on public cloud infrastructure: 100% on-premises bare-metal deployment.",
              "Mandatory physical air-gapping: Vault servers deployed in locked, biometric-secured server cages.",
              "High-availability clustering delivering sub-30-second automated failover in the event of hardware failure.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Vault installation script fails: 'OS does not satisfy baseline hardening requirements'.",
              rootCause:
                "The server host was deployed from a standard corporate VM template with third-party monitoring agents and domain services installed.",
              securityImpact:
                "Hardening compromised; installation blocked to enforce security standards.",
              cyberArkCodeOrEvent: "HARDENING-ERR",
            },
            {
              symptom: "Users experience intermittent disconnects during PVWA navigation.",
              rootCause:
                "Application Delivery Controller (load balancer) is not configured with sticky sessions, routing subsequent requests to different PVWA nodes.",
              securityImpact: "Degraded user experience; session state lost across web requests.",
              cyberArkCodeOrEvent: "LB-STICKY-FAIL",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Inspect Vault hardening log file for failed registry or service modification steps.",
              logFileOrConsole:
                "C:\\Program Files (x86)\\PrivateArk\\Server\\Hardening\\Hardening.log",
              remediation:
                "Review errors, uninstall conflicting third-party software, and re-execute hardening script.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Verify load balancer VIP persistence settings.",
              logFileOrConsole: "F5 Big-IP / Citrix NetScaler Virtual Server Configuration",
              remediation:
                "Configure cookie-based HTTP persistence or source-IP affinity on port 443.",
            },
            {
              stepNumber: 3,
              diagnosticAction:
                "Audit disk performance and queue length on the Vault database storage volume.",
              logFileOrConsole:
                "Windows Performance Monitor: LogicalDisk -> Current Disk Queue Length",
              remediation:
                "If queue length exceeds 2 continuously, re-provision storage with higher guaranteed IOPS tier.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Hardening\\Hardening.log",
              sampleOutput:
                "Service Lockdown: Disabling Spooler... Success.\nDisabling RemoteRegistry... Success.\nDisabling TermService (RDP)... Success.\nFirewall Configuration: Inbound TCP 1858 bound to static IP list [10.0.1.10, 10.0.1.11, 10.0.1.12].",
              explanation:
                "Vault OS hardening script successfully stripped non-essential Windows services and locked the firewall down to authorized component nodes.",
            },
            {
              logFile: "C:\\Windows\\Temp\\PVWA\\PVWA.App.log",
              sampleOutput:
                "HealthCheck API: PVWA Node 01 Status: Healthy. Database latency: 3.2ms. Component connections: CPM (OK), PSM (OK).",
              explanation:
                "PVWA node health endpoint demonstrates healthy sub-5ms database latency to the local Vault cluster.",
            },
          ],
          instructorNotes: [
            "The Digital Vault server should NEVER be joined to an Active Directory domain. Domain membership exposes the Vault to domain-level compromise (Pass-the-Hash, Kerberoasting).",
            "Always keep hypervisor snapshotting disabled on production Vault VMs. Snapshots can roll back database transaction logs, causing irrecoverable cryptographic corruption.",
            "Install PrivateArk Server on dedicated bare-metal hardware for maximum security, or on an isolated hypervisor cluster dedicated exclusively to PAM components.",
          ],
          securityImplications: [
            "Bastion Hardening: An OS stripped of 70 services and all inbound ports has a vanishingly small attack surface, immune to 99% of commodity malware.",
            "Domain Isolation: Running the Vault as a standalone workgroup server ensures that a total Active Directory forest compromise does not grant access to the Vault.",
            "Resilience Engineering: Multi-node component farms guarantee that failure of any individual server node does not interrupt business operations.",
          ],
          knowledgeCheck: [
            {
              id: "m13-q01",
              question:
                "Why should a production Digital Vault server NEVER be joined to an enterprise Active Directory domain?",
              options: [
                "Because Windows Server does not support Active Directory.",
                "To prevent a domain-level compromise (e.g. compromised Domain Admin or Kerberos attack) from compromising the Vault operating system.",
                "Because domain joining makes the server run faster.",
                "Because domain controllers only communicate on port 80.",
              ],
              correctIndex: 1,
              explanation:
                "The Vault must remain an independent root of trust. Joining it to Active Directory subordinates the Vault's OS security to domain administrators, creating a circular vulnerability.",
              conceptTested: "Vault Workgroup Isolation & Tier-0 Bastion Architecture",
            },
            {
              id: "m13-q02",
              question: "What is the primary function of the automated Vault OS Hardening Script?",
              options: [
                "To install Google Chrome and video players.",
                "To disable over 70 non-essential Windows services (including RDP and SMB), configure drop-silent firewall rules, and apply strict CIS security benchmarks.",
                "To backup files to external USB drives.",
                "To automatically generate domain user accounts.",
              ],
              correctIndex: 1,
              explanation:
                "Vault OS hardening strips the operating system of all unnecessary services, removes remote access protocols, and locks down the host to make it an impenetrable cryptographic kernel.",
              conceptTested: "Vault OS Hardening Baselines & Security Controls",
            },
            {
              id: "m13-q03",
              question:
                "When deploying a multi-node PVWA web farm behind an Application Delivery Controller (load balancer), why must 'Sticky Sessions' be enabled?",
              options: [
                "To ensure user web requests stay routed to the same PVWA node, preserving session authentication state and preventing unexpected logouts.",
                "To make web pages load in black and white.",
                "To bypass the Vault firewall on port 1858.",
                "To disable SSL encryption.",
              ],
              correctIndex: 0,
              explanation:
                "PVWA maintains in-memory session tokens for web operators. If subsequent HTTP requests flip to a different PVWA node without shared session state, the user is logged out immediately.",
              conceptTested: "PVWA Load Balancing & Session Persistence",
            },
          ],
          practicalExercise: {
            id: "m13-ex01",
            title: "Audit Self-Hosted Control-Plane Topology & Latency Baseline",
            objective:
              "Inspect the four-tier control plane (Vault, PVWA, CPM, PSM), verify TCP 1858 protocol isolation, and validate Lab 01 baseline health in the simulator.",
            scenario:
              "Before scaling a self-hosted PAM deployment, audit the simulated four-tier component layout in Dashboard and confirm healthy Vault, PVWA, CPM, and PSM status.",
            prerequisites: [
              "Review Self-Hosted Sizing, OS Hardening, and Component Clustering in Section 1–4.",
            ],
            startingState:
              "Simulated Vault, PVWA, CPM, and PSM services report active health metrics in Dashboard.",
            instructions: [
              "Open the Dashboard console and inspect Platform Health for Digital Vault, PVWA, CPM, and PSM.",
              "Verify Vault status is Online and inspect component latencies and queue metrics.",
              "Review the Interactive Topology Explorer in Section 2 to confirm inbound-only TCP 1858 Vault isolation.",
              "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion' to verify all 7 Lab 01 objectives.",
            ],
            stepDetails: [
              {
                action: "Open Dashboard and inspect the Platform Health telemetry panel.",
                explanation:
                  "Baseline latency and queue visibility help architects determine when to scale PVWA/CPM/PSM clusters horizontally.",
                expectedResult:
                  "All four PAS tiers report active status with millisecond latency readings.",
              },
              {
                action:
                  "Verify TCP 1858 isolation and component roles in the Interactive Topology Explorer.",
                explanation: "Confirms the Digital Vault bastion initiates zero outbound sessions.",
                expectedResult:
                  "Component inspector confirms TCP 1858 inbound boundary for PVWA, CPM, and PSM.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation: "Validates all 7 Lab 01 control-plane baseline objectives.",
                expectedResult: "All 7/7 Lab 01 objectives pass (100/100).",
              },
            ],
            targetConsole: "overview",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "id-vault",
            validationCriteria:
              "Four-tier PAM topology and baseline control-plane health verified (7/7 Lab 01 objectives).",
            troubleshootingHints: [
              {
                symptom: "A Lab 01 trace objective reports pending.",
                hint: "Check that baseline Safes, CPM operations, and audit records exist in live state.",
                correctiveAction:
                  "Click Reset Simulator in the top subnav or run a CPM Verify in CPM Operations, then re-validate.",
              },
            ],
            independentPractice: {
              title: "Capacity & Safe Distribution Review",
              scenario:
                "Determine how managed accounts are currently distributed across Safes to plan CPM capacity.",
              goal: "Without guided steps, inspect Safes and Accounts to count active Safes and identify which Safe holds the most managed targets.",
              targetConsole: "safes",
              successCriteria: [
                "Audited Safe inventory and account distribution across Windows, Unix, DBA, and Service Safes.",
                "Confirmed separation of workload tiers across distinct Safe boundaries.",
              ],
            },
            simulationLimitationNote:
              "Hardware sizing, OS-level Vault bastion hardening scripts, and multi-node load balancer provisioning are architecture engineering topics outside the browser simulator. Live validation verifies the simulated 4-pillar PAM control-plane baseline (Lab 01).",
          },
          completionCriteria: [
            "Calculated infrastructure sizing formulas for enterprise PAM component farms.",
            "Deconstructed Vault OS hardening baselines and workgroup isolation principles.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the component topology inspection in the PAM Environment console.",
          ],
          references: [
            "CyberArk Digital Vault Sizing Guide & Hardware Requirements Matrix",
            "Center for Internet Security (CIS): Microsoft Windows Server Benchmark (Level 2 Bastion)",
            "NIST SP 800-160 Vol 2: Developing Cyber-Resilient Systems - A Systems Security Engineering Approach",
          ],
        },
      ],
    },
  ],
};
