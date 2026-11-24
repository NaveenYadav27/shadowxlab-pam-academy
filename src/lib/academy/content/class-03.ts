/**
 * SHADOWXLAB PAM ACADEMY — CLASS 03: PRIVILEGED ACCOUNT ONBOARDING
 * Deep instructional content covering account discovery, technical properties,
 * platform mapping, Safe assignment, and initial verification.
 */

import type { ClassCurriculum } from "../types";

export const CLASS_03: ClassCurriculum = {
  id: "class-03",
  number: "03",
  label: "CLASS 03",
  title: "Privileged Account Onboarding",
  subtitle: "Discovery, Platform Binding, Target Parameterization & Lifecycle Verification",
  duration: "1H 45M",
  level: "Associate",
  overview:
    "Master the end-to-end account onboarding lifecycle across Windows Active Directory, Linux root/sudoers, relational databases, and non-human service accounts using CyberArk PVWA Classic.",
  modules: [
    {
      id: "c03-m01",
      number: "M1",
      title: "Privileged Account Discovery, Classification & Platform Binding",
      description:
        "Understand automated and manual discovery, account classification (Domain, Local, SSH, DBA, Service), and binding targets to management platforms.",
      lessons: [
        {
          id: "c03-m01-l01",
          number: "3.1",
          title: "Account Taxonomy & Target Platform Architecture",
          subtitle: "Selecting Platforms, Defining Address Resolution & Scoping Safe Storage",
          estimatedMinutes: 20,
          learningObjectives: [
            "Classify privileged accounts into appropriate enterprise platform types.",
            "Determine exact target address formats (FQDN, NetBIOS, IP) required for CPM plugin resolution.",
            "Explain the role of Account Platforms in defining CPM password rotation intervals and PSM connectors.",
          ],
          prerequisites: [
            "Completion of Classes 01 & 02.",
            "Basic understanding of DNS resolution and RPC/SSH protocols.",
          ],
          conceptIntroduction:
            "Onboarding is the process of taking an unmanaged privileged account from target infrastructure, storing its secret inside the Digital Vault, binding it to a management Platform, and placing it under automated CPM lifecycle control. A properly onboarded account is protected against manual credential theft, continuously rotated according to corporate complexity policies, and accessible only through audited PSM session brokers.",
          whyItExists:
            "Unmanaged accounts—often referred to as 'shadow credentials'—are the number one target of cyber adversaries. These include default manufacturer passwords, forgotten temporary administrator accounts, and hardcoded service passwords. By bringing every privileged account into the Vault, organizations achieve 100% credential inventory visibility and continuous automated rotation.",
          architecture: {
            overview:
              "An onboarded account object consists of metadata (Safe, Platform, Username, Address) linked to an encrypted secret version in the Vault database.",
            diagramAscii: `
┌────────────────────────────────────────────────────────────────────────┐
│                        ONBOARDED ACCOUNT OBJECT                        │
│                                                                        │
│   ┌─────────────────────┐   ┌──────────────────────────────────────┐   │
│   │   VAULT METADATA    │   │         BOUND TARGET PLATFORM        │   │
│   │ - Account ID        │   │ - Platform ID: WinDomain / UnixSSH   │   │
│   │ - Safe: WIN-SAFE    │   │ - CPM Policy: Change every 30 days   │   │
│   │ - Username: svc_pay │   │ - PSM Connectors: RDP / SSH          │   │
│   │ - Address: 10.0.1.5 │   │ - Password Complexity: 32 chars      │   │
│   └─────────────────────┘   └──────────────────────────────────────┘   │
│                                                 │                      │
│                                (CPM Management) │                      │
│                                                 ▼                      │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    MANAGED TARGET ENDPOINT                     │   │
│   │ - Target Type: Windows Server 2022 / RHEL 9 Linux              │   │
│   │ - Transport: SMB 445 / RPC 135 / SSH 22                        │   │
│   │ - Local SAM / Active Directory / /etc/shadow                   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
`,
            componentResponsibilities: [
              {
                component: "Target Platform",
                role: "Blueprint object defining password rules, rotation frequency, retry intervals, and associated connection components.",
                securityBoundary:
                  "Configured centrally by PAM engineers; inherited by all member accounts.",
              },
              {
                component: "Account Object",
                role: "The individual vault record encapsulating username, address, safe, and password version chain.",
                securityBoundary:
                  "Subject to Safe-level permissions and platform-level rotation policies.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Administrator",
                action: "Navigates to Accounts console in PVWA and clicks 'Add Account'.",
                channelOrProtocol: "HTTPS 443",
                verificationRule:
                  "Administrator must possess 'Add accounts' permission on target Safe.",
              },
              {
                stepNumber: 2,
                actor: "Administrator",
                action:
                  "Selects System Type (Windows), Platform (WinDomain), Safe (WIN-SAFE), Username, Address, and initial password.",
                channelOrProtocol: "HTTPS 443",
                verificationRule:
                  "Address must resolve via DNS; username must match target SAM/AD attribute.",
              },
              {
                stepNumber: 3,
                actor: "CPM Service",
                action:
                  "Initiates immediate Verify task to test password validity against target before enabling automatic management.",
                channelOrProtocol: "RPC 135/445",
                verificationRule:
                  "If Verify succeeds, account status flips from 'Unmanaged' to 'Managed'.",
              },
            ],
          },
          terminology: [
            {
              term: "Platform ID",
              definition:
                "The unique identifier of a CyberArk platform configuration (e.g. 'WinServerLocal', 'UnixSSH', 'Oracle') governing account behaviors.",
              enterpriseContext:
                "Controls which CPM DLL/plugin executes during password change operations.",
            },
            {
              term: "Target Address",
              definition:
                "The network hostname, Fully Qualified Domain Name (FQDN), or IP address where the privileged account resides.",
              enterpriseContext:
                "For local accounts, use the server FQDN. For Active Directory domain accounts, use the AD Domain Name (e.g. corp.gfs.local).",
            },
          ],
          administratorResponsibilities: [
            "Verify whether target accounts should be onboarded as Domain accounts or Local accounts.",
            "Perform initial credential verification immediately after onboarding to ensure Vault-target synchronization.",
            "Link reconcile accounts to onboarded systems to support automated recovery if passwords desynchronize.",
          ],
          configurationAndAdministration: [
            {
              name: "Address Property Format",
              settingOrObject: "Account Object > Address",
              description:
                "The resolvable destination address CPM uses to initiate authentication.",
              productionBestPractice:
                "Always use FQDN rather than dynamic IP addresses to avoid stale DHCP mapping issues.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Onboard an Unmanaged Windows Account",
              action:
                "Click Add Account, select Windows, choose Windows Domain platform, assign to WIN-SAFE, enter username and domain address.",
              expectedResult:
                "Account appears in inventory grid and CPM schedules initial verification.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "GFS deployed a new payment processing cluster on host WIN-SRV-02 with local account 'svc_backup'. The account was initially unmanaged, causing compliance failure during a SOC audit.",
            governanceRequirements: [
              "All service accounts must be vaulted within 24 hours of server provisioning.",
              "Mandatory binding to high-security service account platform enforcing 90-day automatic rotation.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Onboarded account displays 'Verify failed: Logon failure - unknown user name or bad password' (CACPM068E).",
              rootCause:
                "The administrator typed an incorrect initial password during onboarding, or the account is locked in Active Directory.",
              securityImpact:
                "Account is flagged as disabled/failed, requiring manual password synchronization or reconciliation.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Verify whether the target account exists and is enabled on the remote Windows/Linux host.",
              logFileOrConsole: "Active Directory Users and Computers (ADUC) or /etc/passwd.",
              remediation:
                "Unlock account on target host, enter known password in PVWA, and trigger 'Verify Now'.",
            },
          ],
          securityImplications: [
            "Onboarding accounts with 'Disable automatic management' checked defeats the primary security purpose of PAM.",
          ],
          knowledgeCheck: [
            {
              id: "c03-m01-q01",
              question:
                "When onboarding a Windows Active Directory Domain Administrator account, what should be entered in the 'Address' field?",
              options: [
                "The IP address of the administrator's personal workstation.",
                "The Active Directory Domain Name (e.g., corp.gfs.local) or Domain Controller FQDN.",
                "The local loopback address (127.0.0.1).",
                "The URL of the PVWA web portal.",
              ],
              correctIndex: 1,
              explanation:
                "Domain accounts authenticate against Active Directory domain controllers. The Address property must specify the domain name or domain controller FQDN so CPM connects to AD rather than an individual member server.",
              conceptTested: "Domain Account Target Configuration",
            },
          ],
          practicalExercise: {
            id: "ex-c03-01",
            title: "Validate & Onboard Privileged Account (WIN-SRV-01 Administrator)",
            objective:
              "Verify platform binding, Safe placement, accountable ownership, and CPM Verify validation for Administrator on WIN-SRV-01, then practice onboarding a new account independently.",
            scenario:
              "Global Financial Services requires all Windows local Administrator accounts to reside in WIN-SAFE under platform 'Windows Server Local', owned by 'windows_admin', and verified by CPM into 'Managed' state.",
            prerequisites: ["Review Account Taxonomy and Platform Binding in Section 1–4."],
            startingState:
              "WIN-SAFE exists and Administrator on WIN-SRV-01 is present in Accounts inventory; CPM Verify can be triggered from Accounts or CPM Operations.",
            instructions: [
              "Open the Accounts console and locate Administrator on address WIN-SRV-01.",
              "Confirm Platform is 'Windows Server Local', Safe is 'WIN-SAFE', and Owner is 'windows_admin'.",
              "Run CPM 'Verify' on WIN-SRV-01 Administrator (from Accounts detail actions or CPM Operations) and confirm its status is 'Managed'.",
              "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion' to verify all 6 Lab 03 objectives.",
            ],
            stepDetails: [
              {
                action: "Open the Accounts console and select Administrator on WIN-SRV-01.",
                explanation:
                  "Every onboarded account must map to an exact target address, platform plugin, and Safe boundary.",
                expectedResult:
                  "Account details display Username: Administrator, Address: WIN-SRV-01, Safe: WIN-SAFE.",
              },
              {
                action: "Confirm Platform is 'Windows Server Local' and Owner is 'windows_admin'.",
                explanation:
                  "Platform selection dictates which CPM plugin and password policy govern the credential.",
                expectedResult:
                  "Platform matches 'Windows Server Local' and accountable owner is 'windows_admin'.",
              },
              {
                action: "Click 'Verify' to execute a live CPM Verify against WIN-SRV-01.",
                explanation:
                  "Best practice mandates verifying vaulted credentials before handing an account over to automated rotation.",
                expectedResult:
                  "CPM Verify completes successfully and account status confirms 'Managed'.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation:
                  "Evaluates all 6 Lab 03 objectives: account presence, platform, Safe, owner, CPM Verify, and Managed state.",
                expectedResult: "All 6/6 Lab 03 objectives pass (100/100).",
              },
            ],
            targetConsole: "accounts",
            associatedLabId: "Lab 03 · Onboard WIN-SRV-01 Administrator",
            validationObjectiveId: "onboard-account",
            validationCriteria:
              "WIN-SRV-01 Administrator verified in WIN-SAFE under Windows Server Local with owner windows_admin and Managed status.",
            troubleshootingHints: [
              {
                symptom: "'Run CPM Verify against target' or 'Managed' objective is pending.",
                hint: "Ensure you selected Administrator on WIN-SRV-01 (not svc_backup on WIN-SRV-02) and triggered Verify.",
                correctiveAction:
                  "Open Accounts or CPM Operations, select Administrator (WIN-SRV-01), click Verify, confirm status is Managed, then re-validate.",
              },
            ],
            independentPractice: {
              title: "Onboard a New Windows Server Account Independently",
              scenario:
                "A newly provisioned application server (WIN-APP-09) needs its local Administrator account onboarded into WIN-SAFE without step-by-step instructions.",
              goal: "Use Add Account in the Accounts console to onboard a new privileged account into WIN-SAFE and verify it with CPM.",
              targetConsole: "accounts",
              successCriteria: [
                "Added a new account (e.g., local_admin on WIN-APP-09) in WIN-SAFE with platform 'Windows Server Local' and an assigned owner.",
                "Confirmed the new account appears in the Accounts inventory and ran CPM Verify on it.",
              ],
            },
          },
          completionCriteria: [
            "Explained the account onboarding lifecycle and platform assignment.",
            "Validated WIN-SRV-01 Administrator onboarding properties and CPM Verify in the PAM simulator.",
          ],
          references: [
            "CyberArk Privileged Account Onboarding Best Practices & Platform Selection Guide",
          ],
        },
      ],
    },
  ],
};
