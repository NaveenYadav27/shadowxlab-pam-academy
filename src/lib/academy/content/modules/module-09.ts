/**
 * SHADOWXLAB PAM ACADEMY — MODULE 09: DISCOVERY AND ONBOARDING
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_09: ClassCurriculum = {
  id: "module-09",
  number: "09",
  label: "MODULE 09",
  title: "Discovery and Onboarding",
  subtitle: "Automated Discovery, Network Scans & Rule-Based Onboarding",
  duration: "50 mins",
  level: "Professional",
  track: "admin-20",
  category: "Credential Lifecycle & Workflows",
  overview:
    "Master automated enterprise discovery engines and programmatic onboarding pipelines. Deconstruct Active Directory scanning, subnet IP range sweeps via RPC/SMB, local administrator identification, shadow/unmanaged credential analysis, and automated onboarding rules that dynamically map newly discovered systems into secure Safes and Platforms.",
  modules: [
    {
      id: "m09-core",
      number: "M9",
      title: "Discovery Engines & Rule-Based Automation",
      description:
        "Comprehensive walkthrough of discovery scan engines, port discovery, account classification, unmanaged risk scoring, and auto-onboarding rules.",
      lessons: [
        {
          id: "m09-l01",
          number: "9.1",
          title: "Account Discovery Mechanics & Auto-Onboarding Rules",
          subtitle: "Scanning subnets, unearthing shadow accounts, and configuring automated onboarding rules",
          estimatedMinutes: 25,
          learningObjectives: [
            "Configure discovery scans across Active Directory organizational units and network subnet ranges.",
            "Analyze discovered accounts to identify unmanaged local admins, service accounts, and stale identities.",
            "Formulate Auto-Onboarding Rules matching regex patterns to route discovered accounts into target Safes.",
            "Evaluate operational discovery hygiene to prevent duplicate onboarding and scan-induced network friction.",
          ],
          prerequisites: [
            "Module 03: Policies and Platforms.",
            "Module 04: Safes.",
            "Module 05: Accounts — Part 1.",
          ],
          conceptIntroduction:
            "In dynamic enterprise environments—where hundreds of virtual machines and cloud instances are spun up and torn down daily—manual account onboarding is impossible. If IT provisions a new hypervisor cluster or database server, and the PAM team does not learn about it for three months, that server sits with static, unmonitored default credentials. Attackers thrive in this shadow IT gap.\n\nEnterprise PAM solves this with the **Automated Discovery Engine**. The Discovery Engine operates on two primary vectors:\n1. **Active Directory Scans**: Queries domain controllers to discover newly joined computer objects, domain admin accounts, service accounts with SPNs (Service Principal Names), and domain group modifications.\n2. **Network & Subnet Scans**: Sends probes across defined CIDR subnets (e.g. `10.100.0.0/20`) using SMB/RPC and SSH port scans to query local SAM databases and `/etc/passwd` files, extracting all local administrator accounts and running services.\n\nDiscovered accounts appear in the PVWA 'Pending Accounts' queue. To eliminate manual triage, administrators define **Auto-Onboarding Rules**. An Auto-Onboarding Rule evaluates discovered accounts against criteria (e.g. 'If OS is Windows Server 2022 AND Account Name is Administrator AND IP is in 10.100.0.0/20 -> Automatically onboard into `WIN-PROD-SAFE` with Platform `WindowsServerLocal` and immediately trigger Verify'). Newly deployed servers are secured within minutes of joining the network.",
          whyItExists:
            "Manual onboarding leaves an inevitable lag time during which new systems remain unmanaged and vulnerable. Automated discovery and onboarding closes this window, guaranteeing continuous 100% PAM coverage across the enterprise fleet.",
          architecture: {
            overview:
              "The Discovery Worker executes scheduled scans, populates the Vault's Pending Accounts queue, and triggers the Auto-Onboarding rule engine to commit accounts into production Safes.",
            componentResponsibilities: [
              {
                component: "Discovery Scanner Worker",
                role: "Background daemon or CPM scanner executing LDAP queries, SMB RPC calls, and SSH sweeps across enterprise subnets.",
                networkProtocols: "LDAPS 636, SMB 445, WMI 135, SSH 22",
                securityBoundary: "Network Discovery Engine",
              },
              {
                component: "Pending Accounts Queue",
                role: "Staging area in the Vault database where newly discovered identities are held for triage or automated rule matching.",
                networkProtocols: "TCP 1858 Internal Queue",
                securityBoundary: "Vault Staging Boundary",
              },
              {
                component: "Auto-Onboarding Rule Engine",
                role: "Evaluates pending accounts against regular expressions and attribute filters, assigning Safe, Platform, and initial CPM tasks.",
                networkProtocols: "Vault Kernel Processor",
                securityBoundary: "Automated Governance Tier",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Scheduled Discovery Task",
                action: "Executes nightly subnet scan against enterprise server VLAN `10.0.10.0/24`.",
                channelOrProtocol: "SMB TCP 445 / WMI",
                verificationRule: "Scanner authenticates using dedicated Discovery Service Account with read-only SAM query rights.",
              },
              {
                stepNumber: 2,
                actor: "Discovery Scanner Worker",
                action: "Extracts local accounts from 45 target servers and detects 3 unmanaged local Administrator accounts.",
                channelOrProtocol: "Encrypted Vault Protocol (TCP 1858)",
                verificationRule: "Scanner writes discovered records into the Vault 'Pending Accounts' repository.",
              },
              {
                stepNumber: 3,
                actor: "Auto-Onboarding Rule Engine",
                action: "Matches discovered account `WIN-SRV-09\\Administrator` against rule `RULE-WIN-PROD-AUTO`.",
                channelOrProtocol: "Vault Internal Rule Evaluation",
                verificationRule: "Criteria match: OS = Windows, User = Administrator, IP matches `10.0.10.*`.",
              },
              {
                stepNumber: 4,
                actor: "Auto-Onboarding Rule Engine",
                action: "Automatically moves account into Safe `WIN-SAFE`, assigns Platform `Windows Server Local`, and triggers Verify.",
                channelOrProtocol: "TCP 1858 Commit",
                verificationRule: "Account transitions from Pending to Managed inventory; CPM schedules rotation.",
              },
            ],
          },
          terminology: [
            {
              term: "Discovery Scan",
              definition: "An automated reconnaissance process that queries directory services or network subnets to inventory accounts and systems.",
              enterpriseContext: "Run continuously or scheduled nightly to detect new servers deployed by DevOps or infrastructure teams.",
            },
            {
              term: "Pending Accounts",
              definition: "The staging repository in the PVWA displaying accounts discovered on target systems that are not yet vaulted.",
              enterpriseContext: "Administrators inspect pending accounts to identify shadow IT or unauthorized local accounts.",
            },
            {
              term: "Auto-Onboarding Rule",
              definition: "A set of pattern-matching filters that automatically onboards pending accounts meeting specific criteria into predefined Safes.",
              enterpriseContext: "Eliminates manual onboarding delays and enforces consistent naming and platform assignments.",
            },
            {
              term: "Shadow Administrator",
              definition: "A local or domain account possessing administrative rights that exists outside official IT inventory records.",
              enterpriseContext: "Prime target for threat actors seeking unmonitored persistence on enterprise servers.",
            },
          ],
          administratorResponsibilities: [
            "Configure recurring discovery scans covering all corporate data center and cloud VPC subnets.",
            "Maintain dedicated, least-privilege Discovery Service Accounts with read-only network inspection rights.",
            "Author and test Auto-Onboarding Rules to streamline server provisioning without manual intervention.",
            "Triage the Pending Accounts queue weekly to investigate rogue accounts not matched by automated rules.",
          ],
          configurationAndAdministration: [
            {
              name: "Subnet CIDR Range Definition",
              settingOrObject: "PVWA Discovery > Discovery Management > Add Scan",
              description: "Defines IP boundaries and excluded IP addresses (e.g., printers, VoIP devices).",
              productionBestPractice: "Always exclude non-computer devices like network switches, SAN controllers, and printers to prevent scan lockups.",
            },
            {
              name: "Auto-Onboarding Rule Priority",
              settingOrObject: "Administration > Auto-Onboarding Rules",
              description: "The order in which rules are evaluated against a pending account object.",
              productionBestPractice: "Place highly specific departmental rules first; place broad catch-all rules at the bottom of the list.",
            },
            {
              name: "Discovery Account Security",
              settingOrObject: "Discovery Scan Properties > Scanner Account",
              description: "The credential used by the scanner to authenticate to remote target hosts and inspect local accounts.",
              productionBestPractice: "The discovery account only needs read-only rights to query local user lists; never grant it Domain Admin privileges.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Define Network Discovery Scan",
              action: "In PVWA Discovery, click 'New Scan'. Name: `PROD-VLAN-10`, Type: Network Subnet, Range: `10.0.10.0/24`.",
              expectedResult: "Scan task created and scheduled for execution.",
              operatorNotes: "Verify routing and firewall rules permit CPM scanner to reach target subnet on TCP 445.",
            },
            {
              stepNumber: 2,
              title: "Execute Discovery Scan",
              action: "Click 'Run Now' to initiate immediate scan execution. Monitor progress indicator.",
              expectedResult: "Scan completes; reports number of hosts probed and discovered accounts added to Pending queue.",
            },
            {
              stepNumber: 3,
              title: "Create Auto-Onboarding Rule",
              action: "Under Auto-Onboarding Rules, add rule: `WIN-AUTO-RULE`. Match OS: Windows, Account: Administrator, Target Safe: WIN-SAFE.",
              expectedResult: "Rule saved and activated.",
            },
            {
              stepNumber: 4,
              title: "Verify Automated Onboarding",
              action: "Open Accounts inventory and verify that accounts discovered on the scanned subnet have been onboarded into WIN-SAFE.",
              expectedResult: "Accounts appear in Managed inventory with Verify status recorded; Pending queue cleared.",
            },
          ],
          enterpriseScenario: {
            organization: "HyperScale Cloud Systems",
            businessContext:
              "HyperScale operates a hybrid multi-cloud environment where DevOps engineers provision up to 200 ephemeral Linux and Windows virtual machines each week using Terraform. In a security audit, 450 VMs were found running with default baked-in passwords that were never onboarded into PAM. The PAM architecture team deployed Automated Discovery Scans integrated with cloud VPC event streams and established Auto-Onboarding Rules, reducing time-to-onboarding from 14 days to 4 minutes.",
            governanceRequirements: [
              "100% of newly provisioned VMs must be detected and onboarded into PAM within 1 hour of booting.",
              "Automated classification: database servers routed to `DB-SAFE`, web servers routed to `WEB-SAFE`.",
              "Automatic decommissioning: accounts for terminated cloud instances purged after 30 days of inactivity.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Discovery scan finishes with zero accounts found: 'CACPM250E Access Denied during network sweep'.",
              rootCause: "The Discovery Service Account lacks administrative access to query the remote SAM database, or Windows UAC remote restrictions block it.",
              securityImpact: "Discovery blind spot; entire server subnet remains unmonitored.",
              cyberArkCodeOrEvent: "CACPM250E",
            },
            {
              symptom: "Auto-Onboarding Rule routes hundreds of non-administrative accounts into production Safes.",
              rootCause: "Rule regex was too broad (e.g. matching `.*` rather than specific privileged accounts like `Administrator` or `root`).",
              securityImpact: "Safe clutter, license exhaustion, and unintended password changes on unprivileged service accounts.",
              cyberArkCodeOrEvent: "RULE-MISCONFIG",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Verify Discovery Service Account permissions on target hosts.",
              logFileOrConsole: "PowerShell: Get-LocalGroupMember -Group 'Administrators' on target host",
              remediation: "Ensure the scanner account is a member of the local Administrators group or has WMI access granted.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Test network reachability from CPM scanner to target ports.",
              logFileOrConsole: "PowerShell: Test-NetConnection -ComputerName <TargetIP> -Port 445",
              remediation: "Inspect intermediate firewall rules and ensure SMB (TCP 445) and WMI (TCP 135) are allowed.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Review Auto-Onboarding Rule syntax and test regex in PVWA.",
              logFileOrConsole: "PVWA Administration > Auto-Onboarding Rules > Test Rule",
              remediation: "Narrow filter criteria: specify exact account names or require specific Active Directory OU paths.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\Discovery.log",
              sampleOutput:
                "Scanning Subnet 10.0.10.0/24... 32 hosts responded. Extracted 64 user records.\nMatching Auto-Onboarding Rules: 5 accounts matched RULE-WIN-PROD. Committing to Safe WIN-SAFE.",
              explanation:
                "Discovery engine completed successfully, found 5 unmanaged administrative accounts, and auto-onboarded them into WIN-SAFE.",
            },
            {
              logFile: "C:\\Windows\\Temp\\PVWA\\PVWA.App.log",
              sampleOutput:
                "Auto-Onboarding Worker: Account 'oracle' on 'DB-ORA-01' did not match any rule. Account deposited in Pending Accounts queue.",
              explanation:
                "The discovered account did not meet any auto-onboarding criteria and was safely retained in the Pending queue for manual administrator triage.",
            },
          ],
          instructorNotes: [
            "Discovery scans generate network traffic. Schedule intensive subnet scans during off-peak hours (e.g., midnight to 04:00) to avoid saturating network firewalls.",
            "Always enable 'Notify Administrator upon discovery of unmanaged accounts' to alert the SOC whenever a rogue local admin is found.",
            "Coordinate with the IT helpdesk before running discovery: let them know that the PAM scanner account will generate benign network logon events (Event ID 4624).",
          ],
          securityImplications: [
            "Eliminating Shadow IT: Automated discovery turns unknown, unmanaged attack surfaces into documented, governed assets.",
            "Rogue Account Detection: Attackers frequently create secondary local administrator accounts (e.g. `admin_backup`) for persistence; discovery scans immediately expose them.",
            "Continuous Compliance: Proves to auditors that the PAM inventory is dynamically maintained rather than reliant on static spreadsheets.",
          ],
          knowledgeCheck: [
            {
              id: "m09-q01",
              question: "What is the primary function of an Auto-Onboarding Rule in enterprise PAM?",
              options: [
                "To reboot the Vault server nightly.",
                "To automatically evaluate pending discovered accounts against criteria and onboard matching accounts into designated Safes and Platforms without manual intervention.",
                "To delete target operating systems from Active Directory.",
                "To bypass Multi-Factor Authentication for service accounts.",
              ],
              correctIndex: 1,
              explanation:
                "Auto-Onboarding Rules automate the intake pipeline. When discovery scans find new systems, rules automatically bind them to the correct Safe, Platform, and rotation policy.",
              conceptTested: "Auto-Onboarding Rules & Automated Intake",
            },
            {
              id: "m09-q02",
              question: "Where are newly discovered accounts stored prior to being matched by an auto-onboarding rule or approved by an administrator?",
              options: [
                "In the Windows Recycle Bin.",
                "In the Pending Accounts queue in the PVWA.",
                "In an unencrypted text file on the CPM server.",
                "Directly in the Master Safe with full administrative rights.",
              ],
              correctIndex: 1,
              explanation:
                "Discovered accounts that have not yet been onboarded reside in the 'Pending Accounts' staging queue in the PVWA, where administrators can review, onboard, or dismiss them.",
              conceptTested: "Pending Accounts Queue & Staging Workflow",
            },
            {
              id: "m09-q03",
              question: "Why should an administrator exclude network printers and VoIP phones from subnet discovery scans?",
              options: [
                "Because printers and non-computer appliances do not run Windows/Linux SAM databases, and aggressive port probes can cause them to freeze or print garbage pages.",
                "Because printers require 64-character passwords.",
                "Because the Vault database cannot store IP addresses.",
                "Because printers cannot connect to the internet.",
              ],
              correctIndex: 0,
              explanation:
                "Legacy network appliances, printers, and embedded IoT controllers often crash or exhibit erratic behavior when probed with SMB/RPC scanner traffic. Subnet scans should target defined server VLANs with non-compute IPs excluded.",
              conceptTested: "Discovery Scan Hygiene & Network Operational Safety",
            },
          ],
          practicalExercise: {
            id: "m09-ex01",
            title: "Execute Subnet Discovery Scan and Onboard Discovered Accounts",
            scenario:
              "Execute an automated network discovery scan across subnet 10.0.10.0/24, inspect the pending accounts queue, and onboard an unmanaged database candidate into target Safe management.",
            instructions: [
              "Navigate to the Discovery console.",
              "Run the automated discovery scan against subnet 10.0.10.0/24.",
              "Review the discovered inventory and filter unmanaged identities (e.g. `oracle` on DB-ORA-01).",
              "Execute onboarding to transfer the discovered account into the managed inventory.",
            ],
            targetConsole: "discovery",
            associatedLabId: "Lab 04 · Classify the enterprise inventory",
            validationObjectiveId: "flag-unmanaged",
            validationCriteria:
              "Discovery scan is executed and unmanaged candidate is onboarded into PAM management.",
          },
          completionCriteria: [
            "Deconstructed discovery scan engines across Active Directory and network subnets.",
            "Learned auto-onboarding rule configuration and shadow account mitigation.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the discovery scan and onboarding in the Discovery console.",
          ],
          references: [
            "CyberArk Privileged Access Security: Auto-Detection & Account Discovery Implementation Guide",
            "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment",
            "CIS Control 1: Inventory and Control of Enterprise Assets",
          ],
        },
      ],
    },
  ],
};
