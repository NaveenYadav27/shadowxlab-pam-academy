/**
 * MODULE 02 — CYBERARK PLATFORM FUNDAMENTALS
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 2 Hours | Day: 1 | Domain: Fundamentals and Architecture (20%)
 * Learning Outcome: Identify major CyberArk components and describe their responsibilities.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_02: ClassCurriculum = {
  id: "client-m02",
  number: "02",
  label: "MODULE 02",
  title: "CyberArk Platform Fundamentals",
  subtitle: "Core Architecture, Component Responsibilities & Enterprise Ecosystem",
  duration: "2 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Fundamentals and Architecture",
  overview:
    "Provides an architectural breakdown of the CyberArk Privileged Access Security suite. Explores core capabilities, platform terminology, deployment models (Privilege Cloud SaaS vs Self-Hosted), deep component responsibilities for the Digital Vault, CPM, PSM, and PVWA, and surveys the broader product landscape including Endpoint Privilege Security and Secrets Management for DevOps.",
  modules: [
    {
      id: "cm02-core",
      number: "M02",
      title: "CyberArk Platform Fundamentals",
      description:
        "Platform overview, Digital Vault, CPM, PSM, PVWA, and adjacent security solutions.",
      lessons: [
        {
          id: "cm02-l01",
          number: "2.1",
          title: "Core Components, Responsibilities & Product Landscape",
          subtitle:
            "Digital Vault, CPM, PSM, PVWA, Privilege Cloud vs Self-Hosted & Non-Human Secrets",
          estimatedMinutes: 120,
          learningObjectives: [
            "Identify major CyberArk components and describe their respective operational responsibilities.",
            "Explain the architecture and security isolation of the Digital Vault.",
            "Define the role of the Central Policy Manager (CPM) in automated password lifecycle management.",
            "Describe the function of the Privileged Session Manager (PSM) in session isolation and recording.",
            "Explain the purpose and capabilities of the Password Vault Web Access (PVWA) administrative interface.",
            "Differentiate between CyberArk Privilege Cloud (SaaS) and Self-Hosted PAM architectures at a high level.",
            "Survey the broader CyberArk product ecosystem including Endpoint Privilege Security (EPM) and Secrets Management (Conjur/Secrets Manager).",
          ],
          prerequisites: [
            "Completion of Module 01 (Identity Fundamentals & Privileged Risks).",
            "Basic understanding of client-server and multi-tier enterprise application architectures.",
          ],
          conceptIntroduction:
            "The CyberArk Privileged Access Security solution is built on a distributed, multi-tier architecture engineered for defense-in-depth and high resilience. At the center sits the Digital Vault—a hardened, isolated repository that stores cryptographic keys, policies, and secrets. Surrounding the Vault are specialized operational components: the Password Vault Web Access (PVWA) web interface, the Central Policy Manager (CPM) automation engine, and the Privileged Session Manager (PSM) proxy bastion. In self-hosted environments, organizations manage all components on-premises or in customer cloud VPCs; in CyberArk Privilege Cloud, the Vault and core services are maintained by CyberArk as a SaaS offering, while lightweight connectors (CPM/PSM) run in the customer network.",
          whyItExists:
            "Monolithic security tools that combine web interfaces, password engines, and session proxies onto a single server create single points of failure and catastrophic attack surfaces. CyberArk's segmented component architecture ensures that if a public-facing web portal is compromised, the attacker cannot reach target endpoints or extract vaulted keys without traversing hardened, audited Vault protocol boundaries.",
          architecture: {
            overview:
              "The CyberArk platform consists of four foundational components that communicate with the Digital Vault exclusively over encrypted proprietary protocols (TCP 1858). Neither PVWA, CPM, nor PSM store credentials permanently; all secrets reside exclusively within the Vault's encrypted Safe structures.",
            componentResponsibilities: [
              {
                component: "Digital Vault",
                role: "Central, hardened cryptographic repository that stores all secrets, Safes, access policies, and audit logs.",
                networkProtocols: "TCP 1858 (Proprietary Encrypted Vault Protocol)",
                securityBoundary:
                  "Isolated server with hardened OS; no web server, remote desktop, or general network access allowed.",
              },
              {
                component: "Password Vault Web Access (PVWA)",
                role: "Web-based graphical user interface and REST API portal for end users and administrators.",
                networkProtocols: "HTTPS (TCP 443) inbound from users; TCP 1858 outbound to Vault",
                securityBoundary:
                  "DMZ or management network tier; never communicates directly with target endpoints.",
              },
              {
                component: "Central Policy Manager (CPM)",
                role: "Background automation service responsible for verifying, changing, and reconciling passwords on target systems.",
                networkProtocols:
                  "TCP 1858 to Vault; Native protocols (SMB 445, SSH 22, Oracle 1521, LDAP 636) to target systems",
                securityBoundary:
                  "Management network; requires network reachability to target systems to execute credential changes.",
              },
              {
                component: "Privileged Session Manager (PSM)",
                role: "Brokers, isolates, monitors, and records privileged user sessions to Windows, Linux, and web applications.",
                networkProtocols:
                  "RDP (TCP 3389) inbound from client; Native target protocols outbound; TCP 1858 to Vault",
                securityBoundary:
                  "Isolated bastion host; prevents user workstation from having direct network connectivity to target.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "End User",
                action: "Navigates to PVWA URL over HTTPS and logs in.",
                channelOrProtocol: "HTTPS 443",
                verificationRule: "MFA challenge validated; authenticated session token generated.",
              },
              {
                stepNumber: 2,
                actor: "PVWA",
                action:
                  "Queries the Digital Vault to retrieve the list of accounts the user is authorized to see.",
                channelOrProtocol: "TCP 1858 (Vault Protocol)",
                verificationRule:
                  "Vault validates user's Safe membership and permissions (e.g. List, Use).",
              },
              {
                stepNumber: 3,
                actor: "CPM Service",
                action:
                  "Periodically queries Vault for accounts scheduled for password verification or rotation.",
                channelOrProtocol: "TCP 1858 (Vault Protocol)",
                verificationRule:
                  "Evaluates Master Policy rotation interval (e.g., every 30 days).",
              },
              {
                stepNumber: 4,
                actor: "PSM Service",
                action:
                  "Receives user connection request from PVWA, retrieves account credentials from Vault, and launches isolated target session.",
                channelOrProtocol: "RDP / SSH to Target",
                verificationRule: "Session video recorded; keystrokes indexed in real time.",
              },
            ],
          },
          terminology: [
            {
              term: "Digital Vault",
              definition:
                "The core secure database and cryptographic engine of the CyberArk PAS solution, enforcing Safe-level access control.",
              enterpriseContext:
                "The single source of truth for all secrets; runs on a hardened, bastion operating system.",
            },
            {
              term: "Central Policy Manager (CPM)",
              definition:
                "The operational engine that autonomously tests target account passwords, rotates expired credentials, and resolves out-of-sync states.",
              enterpriseContext:
                "Relieves human administrators from manually updating passwords on hundreds of servers.",
            },
            {
              term: "Privileged Session Manager (PSM)",
              definition:
                "A session isolation proxy that records administrative keystrokes and video while keeping target credentials hidden from the user.",
              enterpriseContext:
                "Guarantees that malicious tools on the administrator's laptop cannot infect the critical target server.",
            },
            {
              term: "Privilege Cloud vs Self-Hosted",
              definition:
                "Privilege Cloud is CyberArk's hosted SaaS deployment where CyberArk manages the Vault infrastructure; Self-Hosted requires the customer to deploy and manage all Vault servers on-premises or in IaaS.",
              enterpriseContext:
                "Allows organizations to choose between rapid cloud onboarding and strict sovereign on-prem control.",
            },
            {
              term: "Secrets Management (DevOps)",
              definition:
                "CyberArk solutions (such as Secrets Manager / Conjur) designed to provide dynamic, programmatic secrets to CI/CD pipelines, containers, and applications without hardcoding.",
              enterpriseContext:
                "Addresses non-human privileged identities in Kubernetes and cloud environments.",
            },
          ],
          administratorResponsibilities: [
            "Verify network firewall rules permit TCP 1858 strictly between authorized CyberArk components and the Vault.",
            "Monitor component health status (PVWA, CPM, PSM) to ensure automated rotations and brokered sessions operate without disruption.",
            "Understand when to leverage Privilege Cloud SaaS connectors versus managing on-premises Vault infrastructure.",
            "Collaborate with application teams to replace hardcoded credentials with dynamic Secrets Management.",
          ],
          configurationAndAdministration: [
            {
              name: "Vault Firewall Rule Base",
              settingOrObject: "Vault Inbound Filters",
              description:
                "Restricts all inbound communication to the Vault strictly to known IP addresses of CPM, PSM, and PVWA.",
              productionBestPractice:
                "Zero direct admin access to Vault OS; management solely via PVWA or private disaster recovery console.",
            },
            {
              name: "CPM Interval Configuration",
              settingOrObject: "cpm.ini / Platform Settings",
              description:
                "Determines how frequently the CPM scans Safes for expired or pending password rotations.",
              productionBestPractice:
                "Default scan interval set between 1 and 2 hours for standard server platforms.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Component Status Verification",
              action: "Log in to PVWA as administrator and inspect the System Health dashboard.",
              expectedResult:
                "All CPM, PSM, and PVWA instances display Green / Operational status.",
            },
            {
              stepNumber: 2,
              title: "Vault Heartbeat Check",
              action: "Verify Vault latency and database response time across TCP 1858.",
              expectedResult: "Response time under 15ms; zero dropped packets.",
            },
            {
              stepNumber: 3,
              title: "Session Broker Health Check",
              action: "Test PSM session initiation to a verified sandbox target.",
              expectedResult:
                "Session establishes cleanly; keystroke recording file initialized in recording Safe.",
            },
          ],
          enterpriseScenario: {
            organization: "FinTech Payments Global (fpg.internal)",
            businessContext:
              "FPG is adopting CyberArk to protect high-value credit card settlement nodes. Security leadership must decide how to configure component responsibilities to guarantee that even if an attacker compromises the web portal, the Vault database remains untouchable.",
            governanceRequirements: [
              "Strict component isolation across network segments.",
              "Vault must never communicate directly with user desktop subnets.",
              "Complete session auditing for all access to database targets.",
            ],
          },
          failureScenarios: [
            {
              symptom: "PVWA displays 'Vault is unavailable' error to all users.",
              rootCause: "Firewall blocking TCP 1858 or Vault PrivateArk Server service stopped.",
              securityImpact: "All privileged access requests blocked across the enterprise.",
              cyberArkCodeOrEvent: "ITATS006E",
            },
            {
              symptom: "CPM fails to rotate passwords across all Windows servers.",
              rootCause: "Network ACL blocking SMB TCP 445 from CPM to target subnet.",
              securityImpact:
                "Passwords become stale, violating corporate 30-day rotation compliance.",
              cyberArkCodeOrEvent: "CACPM072E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Test TCP 1858 port connectivity from PVWA and CPM servers to the Vault IP address.",
              logFileOrConsole: "Test-NetConnection -ComputerName VAULT-IP -Port 1858",
              remediation: "Correct intermediate firewall security group or network ACL rules.",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Inspect CyberArk component status in the PVWA System Health dashboard.",
              logFileOrConsole: "PVWA -> Administration -> System Health",
              remediation:
                "Restart the affected CyberArk service (CyberArk Central Policy Manager or CyberArk PSM).",
            },
          ],
          securityImplications: [
            "Exposing TCP 1858 to general user subnets exposes the Vault to unauthorized port scanning and denial of service.",
            "Failing to maintain distinct CPM and PSM network roles undermines separation of duties and defense-in-depth.",
            "Omitting endpoint privilege security allows local malware to hijack active sessions even after authentication.",
          ],
          knowledgeCheck: [
            {
              id: "cm02-q01",
              question:
                "Which CyberArk component is directly responsible for connecting to target systems to test credentials and execute automated password changes?",
              options: [
                "Password Vault Web Access (PVWA)",
                "Central Policy Manager (CPM)",
                "Privileged Session Manager (PSM)",
                "Digital Vault",
              ],
              correctIndex: 1,
              explanation:
                "The Central Policy Manager (CPM) is the automation service that connects to target endpoints using native protocols (such as SMB, SSH, or SQL) to verify, rotate, and reconcile passwords.",
              conceptTested: "Component Operational Responsibilities",
            },
            {
              id: "cm02-q02",
              question:
                "What proprietary network protocol and default port do CyberArk components use to communicate with the Digital Vault?",
              options: [
                "HTTPS over TCP 443",
                "Encrypted Vault Protocol over TCP 1858",
                "SSH over TCP 22",
                "RDP over TCP 3389",
              ],
              correctIndex: 1,
              explanation:
                "All CyberArk internal components (PVWA, CPM, PSM) communicate with the Digital Vault exclusively over TCP port 1858 using the encrypted proprietary Vault protocol.",
              conceptTested: "Vault Communication & Protocols",
            },
            {
              id: "cm02-q03",
              question:
                "In CyberArk Privilege Cloud (SaaS), which architecture statement is accurate?",
              options: [
                "All components including target servers must run entirely inside CyberArk's cloud.",
                "The Digital Vault and core services are managed as SaaS by CyberArk, while CPM/PSM connectors run within the customer's on-premises or cloud network to reach targets.",
                "Privilege Cloud does not support automated password rotation or session recording.",
                "The customer is responsible for patching and hardening the underlying Windows OS of the Digital Vault.",
              ],
              correctIndex: 1,
              explanation:
                "In CyberArk Privilege Cloud, CyberArk hosts and secures the Digital Vault infrastructure as a cloud service. The customer deploys lightweight connectors (CPM, PSM) within their own network boundaries to reach internal target endpoints.",
              conceptTested: "Privilege Cloud vs Self-Hosted Architecture",
            },
          ],
          practicalExercise: {
            id: "cm02-ex01",
            title: "Component Responsibility & Topology Inspection",
            objective:
              "Inspect each component in the PAM environment and identify its protocol bindings and operational responsibilities.",
            scenario:
              "Verify that PVWA, Digital Vault, CPM, and PSM are correctly mapped in the PAM Environment view and validate component operational readiness.",
            prerequisites: ["Completion of Module 01"],
            startingState: "Baseline multi-tier PAM simulator environment.",
            instructions: [
              "Navigate to the PAM Environment console.",
              "Select each component (Digital Vault, PVWA, CPM, PSM) to inspect its detailed role, protocols, and security boundaries.",
              "Observe the network flow paths between components.",
              "Confirm that all components display active and ready status.",
            ],
            stepDetails: [
              {
                action: "Inspect Digital Vault in PAM Environment view",
                explanation:
                  "Review Vault responsibilities, TCP 1858 isolation, and database role.",
                expectedResult: "Vault properties rendered.",
              },
              {
                action: "Inspect CPM in PAM Environment view",
                explanation: "Verify CPM protocol bindings to targets.",
                expectedResult: "CPM properties and verify/change duties displayed.",
              },
              {
                action: "Inspect PSM in PAM Environment view",
                explanation: "Review PSM proxy duties and session recording storage.",
                expectedResult: "PSM proxy architecture confirmed.",
              },
            ],
            targetConsole: "environment",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "obj-cm02-components",
            validationCriteria:
              "Inspect all 4 core components and confirm understanding of their architectural responsibilities.",
            troubleshootingHints: [
              {
                symptom: "Component inspector does not open detailed view.",
                hint: "Click directly on the component card in the PAM Environment view.",
                correctiveAction: "Select the component node to inspect its specific properties.",
              },
            ],
            independentPractice: {
              title: "Independent Architecture Analysis",
              scenario:
                "Review the communication paths in the environment view and verify port requirements.",
              goal: "Confirm understanding of TCP 1858 vs TCP 443 vs TCP 3389.",
              targetConsole: "environment",
              successCriteria: [
                "Confirm Vault communication is strictly TCP 1858.",
                "Confirm PVWA user ingress is HTTPS TCP 443.",
              ],
            },
          },
          completionCriteria: [
            "Pass the Knowledge Checkpoint with 100% score.",
            "Inspect all 4 core components in the PAM Environment console.",
            "Complete independent architecture analysis.",
          ],
          references: [
            "CyberArk Privilege Cloud Architecture Documentation",
            "CyberArk Component Communication Ports & Firewall Requirements",
            "NIST SP 800-128: Guide for Security-Focused Configuration Management",
          ],
        },
      ],
    },
  ],
};
