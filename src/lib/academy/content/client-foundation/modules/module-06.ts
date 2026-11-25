/**
 * MODULE 06 — PRIVILEGED ACCOUNT ONBOARDING
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 3 Hours | Day: 3 | Domain: Account Onboarding and Password Management (25%)
 * Practicals: Onboard a test Windows administrator account where supported; review or onboard a test Linux account in an authorized lab.
 * Learning Outcome: Understand the onboarding workflow and the configuration elements involved.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_06: ClassCurriculum = {
  id: "client-m06",
  number: "06",
  label: "MODULE 06",
  title: "Privileged Account Onboarding",
  subtitle: "Target Prerequisites, Account Properties, Platform Binding & Windows/Linux Onboarding",
  duration: "3 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Account Onboarding and Password Management",
  overview:
    "Master the complete privileged account onboarding lifecycle. Covers account taxonomies (local, domain, Windows, Linux, service accounts), target system prerequisites (ports, permissions, connectivity), essential configuration properties (Address, Username, Platform ID, Safe), platform policy association, onboarding workflows, and validation of managed credentials across Windows and simulated Linux environments.",
  modules: [
    {
      id: "cm06-core",
      number: "M06",
      title: "Privileged Account Onboarding",
      description:
        "Onboarding fundamentals, account properties, platform bindings, Windows administrator onboarding, and Linux target account review.",
      lessons: [
        {
          id: "cm06-l01",
          number: "6.1",
          title: "Account Onboarding Workflows, Target Prerequisites & Platform Policies",
          subtitle:
            "Onboarding Parameters, Platform Selection, Windows Administrator Lab & Linux Target Review",
          estimatedMinutes: 180,
          learningObjectives: [
            "Understand the onboarding workflow and the configuration elements involved.",
            "Differentiate onboarding requirements across local accounts, domain accounts, Windows hosts, Linux servers, and service accounts.",
            "Identify target system prerequisites including network reachability, listening ports (TCP 445/22), and administrative permissions.",
            "Configure mandatory account properties: Account Name, Host Address (FQDN/IP), Username, Platform ID, and Safe.",
            "Explain the purpose of Platform Policies in defining password complexity, rotation intervals, and connection components.",
            "Onboard a test Windows administrator account into the Vault and validate its configuration.",
            "Review Linux account onboarding parameters in an authorized lab environment with simulated limitations noted.",
          ],
          prerequisites: [
            "Completion of Module 01 through Module 05.",
            "Basic understanding of Windows Server local accounts and Linux root/sudo accounts.",
          ],
          conceptIntroduction:
            "Privileged account onboarding is the foundational process of bringing unmanaged accounts under CyberArk governance. When an account is onboarded, its current password or SSH key is securely deposited into a designated Safe, and the account is bound to a specific Platform Policy. Once onboarded, the Central Policy Manager (CPM) takes custody of the account, verifying connectivity, enforcing password complexity rules, rotating the credential on a regular schedule, and enabling brokered session access through PSM.",
          whyItExists:
            "Unmanaged accounts—accounts that exist on servers but are not tracked, monitored, or rotated by PAM—are the leading point of entry for attackers. Without a standardized onboarding workflow, organizations accumulate 'shadow accounts' with static, unrotated passwords that remain vulnerable to credential dumping and brute-force attacks.",
          architecture: {
            overview:
              "The onboarding workflow links four core objects together: (1) The Target Host (where the account exists), (2) The Account Object (containing metadata: Address, Username, Password), (3) The Platform Policy (defining management rules), and (4) The Safe (enforcing access control).",
            componentResponsibilities: [
              {
                component: "Target System (Windows/Linux)",
                role: "Hosts the local or domain account; responds to CPM verification and password change commands.",
                networkProtocols: "SMB (TCP 445), RPC (TCP 135), SSH (TCP 22)",
                securityBoundary: "Target endpoint perimeter.",
              },
              {
                component: "PVWA Onboarding Wizard",
                role: "Collects account parameters (Address, Username, Safe, Platform) and initial credentials from administrator.",
                networkProtocols: "HTTPS (TCP 443)",
                securityBoundary: "Administrative UI tier.",
              },
              {
                component: "Digital Vault Object Store",
                role: "Stores the account object and encrypted password within the designated Safe.",
                networkProtocols: "TCP 1858 (Vault Protocol)",
                securityBoundary: "Encrypted Safe boundary.",
              },
              {
                component: "CPM Validator",
                role: "Connects to target system to verify that the deposited password matches the actual target password.",
                networkProtocols: "Native management protocol to target",
                securityBoundary: "Automated credential management service.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Administrator",
                action: "Navigates to Accounts console and clicks 'Add Account'.",
                channelOrProtocol: "PVWA Web Interface",
                verificationRule: "User must have 'Add accounts' permission on the target Safe.",
              },
              {
                stepNumber: 2,
                actor: "Administrator",
                action:
                  "Selects System Type (Windows/Unix), Platform ID (e.g., WinServerLocal), and target Safe.",
                channelOrProtocol: "HTTPS 443",
                verificationRule:
                  "Platform must be active and compatible with the target operating system.",
              },
              {
                stepNumber: 3,
                actor: "Administrator",
                action:
                  "Inputs Address (hostname or IP), Username (e.g. Administrator), and initial password.",
                channelOrProtocol: "HTTPS 443",
                verificationRule:
                  "Address must resolve; username must conform to target system naming conventions.",
              },
              {
                stepNumber: 4,
                actor: "PVWA -> Vault",
                action:
                  "Transmits account payload to Vault; Vault creates encrypted account object inside Safe.",
                channelOrProtocol: "TCP 1858",
                verificationRule: "Object written; initial version sealed in Vault journal.",
              },
              {
                stepNumber: 5,
                actor: "CPM Service",
                action:
                  "Picks up new account and executes immediate 'Verify' operation against target host.",
                channelOrProtocol: "Native Target Port (SMB 445 / SSH 22)",
                verificationRule:
                  "Account status transitions to 'Verified' upon successful authentication.",
              },
            ],
          },
          terminology: [
            {
              term: "Account Onboarding",
              definition:
                "The administrative process of registering an existing privileged account in CyberArk, vaulting its credential, and assigning a platform policy.",
              enterpriseContext:
                "Transforms unmanaged risk into governed, monitored privileged access.",
            },
            {
              term: "Platform Policy",
              definition:
                "A set of configuration parameters governing password complexity, rotation intervals, prompt scripts, and PSM connection components for a category of accounts.",
              enterpriseContext:
                "Examples include 'WinServerLocal', 'UnixSSH', and 'OracleDatabase'.",
            },
            {
              term: "Address Property",
              definition:
                "The hostname, Fully Qualified Domain Name (FQDN), or IP address where the account resides or authenticates.",
              enterpriseContext:
                "Crucial for CPM and PSM to establish network connections to the target host.",
            },
            {
              term: "Target Prerequisites",
              definition:
                "The network and administrative requirements (open ports, firewall rules, local administrative rights) required before CPM can manage an account.",
              enterpriseContext:
                "For Windows: TCP 445 open, File and Printer Sharing enabled, Remote Registry active.",
            },
            {
              term: "Reconcile Account",
              definition:
                "A high-privilege account linked to a managed account, used to reset the managed account's password if it falls out of sync.",
              enterpriseContext: "Essential safety net for automated password management.",
            },
          ],
          administratorResponsibilities: [
            "Verify target firewall rules and prerequisites before initiating account onboarding.",
            "Select the correct Platform Policy that aligns with the target system's OS version and security policy.",
            "Ensure accounts are placed into logically partitioned Safes with correct least-privilege ACLs.",
            "Verify that CPM successfully validates the credential immediately following onboarding.",
          ],
          configurationAndAdministration: [
            {
              name: "Mandatory Account Properties",
              settingOrObject: "Account Object Schema",
              description: "Requires: Address (IP or FQDN), Username, Safe Name, and Platform ID.",
              productionBestPractice:
                "Always use FQDN rather than bare hostnames to prevent DNS resolution failures.",
            },
            {
              name: "Automatic Password Verification on Onboard",
              settingOrObject:
                "Platform Setting -> Automatic Management -> PerformPeriodicVerification",
              description:
                "Instructs CPM to verify the initial password against the target immediately after account creation.",
              productionBestPractice:
                "Keep enabled to instantly catch typographical errors in initial passwords.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Pre-Onboarding Validation",
              action:
                "Test network reachability from CPM to target host (TCP 445 for Windows, TCP 22 for Linux).",
              expectedResult: "Target responds; port open.",
            },
            {
              stepNumber: 2,
              title: "Account Creation in PVWA",
              action:
                "Open Accounts console -> Add Account -> select Platform, Safe, enter Address and Username -> Save.",
              expectedResult:
                "Account object appears in Accounts list with status 'Pending Verification'.",
            },
            {
              stepNumber: 3,
              title: "Post-Onboarding Verification",
              action: "Trigger manual Verify or wait for CPM scan; inspect CPM status indicator.",
              expectedResult: "Status changes to 'Verified' with green checkmark.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "A new Windows Server 2022 member server ('WIN-SRV-01') has been provisioned for the core transaction ledger. PAM engineering must onboard the local 'Administrator' account into 'WIN-SAFE' using platform 'WinServerLocal' and verify target connectivity.",
            governanceRequirements: [
              "Onboard local Administrator into WIN-SAFE.",
              "Enforce automatic 30-day CPM rotation.",
              "Document Linux onboarding configuration for upcoming database deployment.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Account created but CPM displays 'CACPM072E Connection to target failed'.",
              rootCause: "Target server firewall blocking SMB TCP 445 from CPM IP.",
              securityImpact:
                "Password cannot be verified or rotated; account remains in error state.",
              cyberArkCodeOrEvent: "CACPM072E",
            },
            {
              symptom: "CPM displays 'Access Denied (error 5)' during verification.",
              rootCause:
                "Initial password entered in PVWA does not match the actual password on the target machine.",
              securityImpact: "Credential desynchronization; admin cannot connect.",
              cyberArkCodeOrEvent: "CACPM068E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Verify network connectivity from CPM host using Test-NetConnection.",
              logFileOrConsole: "Test-NetConnection -ComputerName WIN-SRV-01 -Port 445",
              remediation:
                "Configure target host Windows Firewall to permit File and Printer Sharing (SMB-In).",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Check CPM error log for specific error code.",
              logFileOrConsole:
                "C:\\Program Files (x86)\\CyberArk\\Password Manager\\Logs\\pm_error.log",
              remediation:
                "If error is invalid credentials, update password in Vault or use Reconcile Account.",
            },
          ],
          securityImplications: [
            "Onboarding accounts with wrong platform policies can result in CPM lockout or corrupted passwords.",
            "Failing to onboard service accounts leaves them vulnerable to unmonitored lateral movement.",
            "Placing all accounts into a single generic Safe eliminates boundary isolation.",
          ],
          knowledgeCheck: [
            {
              id: "cm06-q01",
              question:
                "Which four core properties are mandatory when creating or onboarding a privileged account object in CyberArk?",
              options: [
                "Address, Username, Safe Name, and Platform ID",
                "Email Address, Job Title, Manager Name, and Department",
                "IP Address, MAC Address, CPU Model, and RAM Size",
                "Safe Name, Domain Admin Token, BIOS UUID, and Kerberos Ticket",
              ],
              correctIndex: 0,
              explanation:
                "Every managed account in CyberArk must have an Address (where it lives), a Username (who it is), a Safe Name (where it is secured), and a Platform ID (which policies govern it).",
              conceptTested: "Mandatory Onboarding Properties",
            },
            {
              id: "cm06-q02",
              question:
                "Before CPM can successfully manage a local Windows administrator account on target server 'WIN-SRV-01', which network port must be accessible between CPM and the target?",
              options: [
                "TCP 443 (HTTPS)",
                "TCP 445 (SMB / RPC)",
                "TCP 3389 (RDP)",
                "TCP 1858 (Vault)",
              ],
              correctIndex: 1,
              explanation:
                "CPM manages Windows local and domain accounts by connecting over SMB/RPC (TCP 445) to communicate with the target machine's Service Control Manager and Security Accounts Manager (SAM).",
              conceptTested: "Windows Target Onboarding Prerequisites",
            },
            {
              id: "cm06-q03",
              question: "What is the primary role of a Platform Policy in CyberArk?",
              options: [
                "It specifies the physical hardware chassis used by the Digital Vault server.",
                "It defines the automated rules for password complexity, verification/change frequency, prompt sequences, and PSM connection tools for accounts using that platform.",
                "It automatically purchases software licenses from Microsoft or Red Hat.",
                "It deletes inactive accounts from the corporate Active Directory tree.",
              ],
              correctIndex: 1,
              explanation:
                "Platform Policies (like WinServerLocal or UnixSSH) define how the CPM and PSM interact with target accounts, including rotation schedules, complexity constraints, and connection components.",
              conceptTested: "Platform Policy Purpose and Capabilities",
            },
          ],
          practicalExercise: {
            id: "cm06-ex01",
            title: "Windows Administrator Onboarding & Linux Target Account Review",
            objective:
              "Onboard a test Windows administrator account into the Vault, verify its properties, and review Linux target account onboarding requirements.",
            scenario:
              "Navigate to the Accounts console and onboard local account 'Administrator' on target 'WIN-SRV-01' into Safe 'WIN-SAFE' with platform 'Windows Server Local'. Review the configuration properties and validate live simulator state.",
            prerequisites: ["Completion of Module 01-05"],
            startingState: "WIN-SAFE created; target WIN-SRV-01 available.",
            instructions: [
              "Navigate to the Accounts console.",
              "Review existing accounts and locate 'Administrator' on 'WIN-SRV-01' in 'WIN-SAFE'.",
              "Verify the account properties: Username (Administrator), Address (WIN-SRV-01), Platform (Windows Server Local), Safe (WIN-SAFE).",
              "Review the Linux target account onboarding parameters (UnixSSH, SSH Key / Password, root/sudo) with simulator limitations noted.",
              "Execute the verification check to validate onboarding compliance.",
            ],
            stepDetails: [
              {
                action: "Navigate to Accounts Console",
                explanation: "Open the account inventory.",
                expectedResult: "Account inventory displayed.",
              },
              {
                action: "Inspect Windows Administrator Properties",
                explanation: "Verify Username, Address, Platform, and Safe binding.",
                expectedResult: "Properties match target specification.",
              },
              {
                action: "Review Linux Target Account Parameters",
                explanation:
                  "Inspect simulated UnixSSH platform properties and SSH port 22 requirements.",
                expectedResult: "Linux onboarding requirements reviewed.",
              },
            ],
            targetConsole: "accounts",
            associatedLabId: "Lab 03 · Onboard an administrator account",
            validationObjectiveId: "obj-cm06-onboard",
            validationCriteria:
              "Verify onboarding of Administrator on WIN-SRV-01 into WIN-SAFE and review Linux onboarding parameters in the simulator.",
            simulationLimitationNote:
              "In this cloud training environment, Windows target account onboarding is validated against live simulated Vault state. Linux SSH target onboarding is simulated via the PAM engine account registry, modeling SSH key and password properties without live external Linux daemon connectivity.",
            troubleshootingHints: [
              {
                symptom: "Account shows 'Not Found' in Accounts view.",
                hint: "Click the Reset button in the top navigation bar to initialize the baseline accounts inventory.",
                correctiveAction: "Restore baseline training state.",
              },
            ],
            independentPractice: {
              title: "Independent Linux Target Onboarding Review",
              scenario:
                "Document the required configuration parameters to onboard account 'root' on Linux database host 'LIN-DB-01'.",
              goal: "Verify understanding of Linux onboarding prerequisites and platform selection.",
              targetConsole: "accounts",
              successCriteria: [
                "Select platform 'Unix via SSH' (UnixSSH).",
                "Document port TCP 22 requirement and specify 'LINUX-SAFE' association.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Verify Windows administrator account onboarding properties.",
            "Review Linux onboarding parameters with simulation limitation notice understood.",
          ],
          references: [
            "CyberArk Account Onboarding & Platform Configuration Guide",
            "CyberArk Target System Prerequisites for Windows & Unix",
            "NIST SP 800-123: Guide to General Server Security",
          ],
        },
      ],
    },
  ],
};
