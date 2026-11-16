/**
 * SHADOWXLAB PAM ACADEMY — MODULE 02: USER MANAGEMENT
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_02: ClassCurriculum = {
  id: "module-02",
  number: "02",
  label: "MODULE 02",
  title: "User Management",
  subtitle: "Directory Mapping, Authentication Protocols & Role Governance",
  duration: "45 mins",
  level: "Associate",
  track: "admin-20",
  category: "Core Administration & Access Control",
  overview:
    "Master enterprise user lifecycle management within the PAM ecosystem. Covers Active Directory/LDAP directory mapping, SAML 2.0 / RADIUS MFA integration, Vault internal users versus synchronized directory principals, license quota governance, and granular administrative role delegation.",
  modules: [
    {
      id: "m02-core",
      number: "M2",
      title: "Directory Integration & User Governance",
      description:
        "Detailed architecture and operational procedures for mapping enterprise identity providers, provisioning administrators, and managing user roles.",
      lessons: [
        {
          id: "m02-l01",
          number: "2.1",
          title: "Directory Mapping & Enterprise Authentication",
          subtitle: "Configuring LDAP synchronization, SAML federation, and role-based provisioning",
          estimatedMinutes: 25,
          learningObjectives: [
            "Configure Directory Mapping rules to dynamically provision PAM users based on Active Directory security groups.",
            "Compare internal Vault authentication with SAML 2.0 SSO and RADIUS Multi-Factor Authentication.",
            "Analyze user licensing constraints (EPV User vs External User vs AppProvider) and quota management.",
            "Implement granular role delegation separating PAM Administrators, Auditors, and Operations Engineers.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Working knowledge of Active Directory organizational units (OUs) and security group structures.",
          ],
          conceptIntroduction:
            "In an enterprise with thousands of technical staff, manually creating individual user accounts inside the Digital Vault is unscalable, error-prone, and presents severe offboarding security risks. If a systems engineer leaves the company, their access to privileged systems must be revoked instantly across all systems.\n\nEnterprise PAM solves this through Directory Mapping. The PAM solution connects to enterprise Directory Services (such as Microsoft Active Directory via secure LDAPS on TCP 636) and maps directory security groups (e.g., `AD_UNIX_Admins`, `AD_DBA_Team`, `AD_CyberArk_Admins`) directly to Vault Groups and Safe permissions. When a user authenticates via corporate Single Sign-On (SAML 2.0 or modern OIDC), the Vault queries their group memberships in real time, applies the matching Directory Map, and grants access to corresponding Safes without maintaining duplicate password hashes in the Vault database.",
          whyItExists:
            "Manual user creation creates orphaned accounts, credentials that survive HR terminations, and severe audit non-compliance. Directory Mapping guarantees immediate offboarding: when a user is disabled or removed from an AD security group, their PAM access terminates on their next request.",
          architecture: {
            overview:
              "The PVWA integrates with corporate Identity Providers (IdPs) and Active Directory Domain Controllers. The Digital Vault performs periodic background LDAP queries or evaluates claims tokens upon login.",
            componentResponsibilities: [
              {
                component: "Active Directory / LDAP",
                role: "Central source of truth for identity, group membership, and employee employment status.",
                networkProtocols: "LDAPS Port 636 / StartTLS Port 389 from PVWA and Vault",
                securityBoundary: "Enterprise Corporate Network / Identity Subnet",
              },
              {
                component: "Password Vault Web Access (PVWA)",
                role: "Terminates SAML 2.0 SSO assertions, validates claims, and forwards authenticated principal identity to the Vault over TCP 1858.",
                networkProtocols: "HTTPS 443 (Client to PVWA), SAML 2.0 POST binding",
                securityBoundary: "DMZ / Web Tier",
              },
              {
                component: "Digital Vault Directory Engine",
                role: "Evaluates Directory Map rules, maps AD groups to Vault Groups, checks license allocation, and establishes user session context.",
                networkProtocols: "TCP 1858 (Internal Vault Kernel Engine)",
                securityBoundary: "Tier-0 Isolated Security Zone",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Enterprise Engineer",
                action: "Navigates to PVWA and is redirected to Corporate IdP (Okta/Azure AD/Ping) for MFA authentication.",
                channelOrProtocol: "HTTPS Port 443 / SAML 2.0 Redirect",
                verificationRule: "IdP validates credentials, triggers FIDO2/Push MFA, and issues signed SAML assertion.",
              },
              {
                stepNumber: 2,
                actor: "PVWA Web Tier",
                action: "Validates SAML signature against trusted IdP certificate and extracts user UPN and group attributes.",
                channelOrProtocol: "SAML Assertion Consumer Service (ACS)",
                verificationRule: "PVWA confirms token signature validity and timestamp within clock-skew tolerance.",
              },
              {
                stepNumber: 3,
                actor: "Digital Vault",
                action: "Searches Directory Maps for matching AD security groups associated with the user.",
                channelOrProtocol: "Encrypted Vault Kernel (TCP 1858)",
                verificationRule: "Vault checks license count and binds user to corresponding Vault permissions and Safe memberships.",
              },
              {
                stepNumber: 4,
                actor: "PAM Administrator",
                action: "Delegates administrative roles by assigning group-level memberships rather than individual users.",
                channelOrProtocol: "Administration > Users & Groups Console",
                verificationRule: "Role separation enforced: Operators cannot manage Safes, Auditors cannot view passwords.",
              },
            ],
          },
          terminology: [
            {
              term: "Directory Map",
              definition: "A set of rules within the Vault that associates an LDAP query or AD security group with Vault properties, user templates, and authorized interfaces.",
              enterpriseContext: "Ensures users inherit appropriate Safe permissions automatically based on their AD department group.",
            },
            {
              term: "EPV User License",
              definition: "A licensed user seat allowing full interactive access to vaulted credentials and privileged sessions via PVWA.",
              enterpriseContext: "Organizations must monitor allocated EPV licenses against contract quotas to avoid license exhaustion.",
            },
            {
              term: "Vault Internal User",
              definition: "A user account created directly within the Vault database (e.g., Master, Administrator, PasswordManager, PSMServer).",
              enterpriseContext: "Used strictly for emergency break-glass access or internal system services; never for everyday human users.",
            },
            {
              term: "Role-Based Access Control (RBAC)",
              definition: "Restricting system access to authorized users based on their organizational role (e.g., Administrator, Auditor, Operator).",
              enterpriseContext: "Auditors receive read-only reporting access; Operations staff receive checkout permissions; PAM Admins configure system objects.",
            },
          ],
          administratorResponsibilities: [
            "Configure and maintain LDAPS connections to Domain Controllers with valid TLS certificates.",
            "Design and test Directory Mapping rules ensuring least-privilege group assignments.",
            "Monitor user license consumption and reclaim inactive user seats.",
            "Maintain emergency 'break-glass' internal Vault administrative credentials in a physical dual-custody safe.",
          ],
          configurationAndAdministration: [
            {
              name: "LDAP Server Connection: SSL/TLS",
              settingOrObject: "PVWA Administration > LDAP Integration > Directories",
              description: "Configures Domain Controller hostnames, port 636, and SSL CA certificates for encrypted directory queries.",
              productionBestPractice: "Always enforce LDAPS (TCP 636) with trusted internal PKI root certificates. Never allow unencrypted LDAP (Port 389).",
            },
            {
              name: "Directory Map Precedence",
              settingOrObject: "Directory Mapping Rules List",
              description: "Determines the evaluation order of mapping rules when a user belongs to multiple AD groups.",
              productionBestPractice: "Place the most restrictive or specialized administrative rules at the top of the priority list.",
            },
            {
              name: "Inactive User De-allocation",
              settingOrObject: "dbparm.ini / AutoDeleteExternalUsers",
              description: "Automatically deactivates or removes cached directory user objects if they have not logged in for 90 days.",
              productionBestPractice: "Enable automatic de-allocation to reclaim EPV user licenses from departed or inactive staff.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "LDAP Integration Test",
              action: "In PVWA Administration > LDAP Integration, select the target domain and click 'Test Directory Connection'.",
              expectedResult: "Connection succeeds with green status indicator; bind user authenticates cleanly.",
              operatorNotes: "If failed, verify domain controller firewall rules on port 636 and check whether bind user password expired.",
            },
            {
              stepNumber: 2,
              title: "Create Directory Mapping Rule",
              action: "Add a new Directory Map: specify AD Group `CN=PAM_Cloud_Admins,OU=Groups,DC=corp,DC=local` and link to `Cloud-Admins-VaultGroup`.",
              expectedResult: "Mapping rule saved; test user from group logs in and immediately inherits Cloud-Admins profile.",
            },
            {
              stepNumber: 3,
              title: "License Quota Audit",
              action: "Navigate to Administration > License Information and review Allocated vs Consumed user seats.",
              expectedResult: "Active user count is below the licensed threshold (e.g. 240/300 EPV licenses used).",
            },
            {
              stepNumber: 4,
              title: "Role Separation Validation",
              action: "Log in with a test Auditor account and attempt to access Administration > Safes management.",
              expectedResult: "Administrative actions are hidden or return HTTP 403 Forbidden; Auditor can only view Reports and System Health.",
            },
          ],
          enterpriseScenario: {
            organization: "Pacific Logistics Global",
            businessContext:
              "Pacific Logistics employs 3,500 IT operators and contractors across 12 countries. Prior to directory mapping, local contractors shared a static Vault administrative user account. An incident investigation revealed unauthorized credential access during off-hours, but the shared account made individual attribution impossible. The PAM administrator must implement Directory Mapping tied to AD with mandatory Azure AD SAML MFA.",
            governanceRequirements: [
              "Mandatory SAML 2.0 federation with conditional access MFA for all interactive PAM logins.",
              "Strict role separation: tier-1 helpdesk staff cannot view database or domain admin credentials.",
              "Automated provisioning and de-provisioning driven by Active Directory group membership changes.",
            ],
          },
          failureScenarios: [
            {
              symptom: "User receives 'ITATS020E User is not authorized to logon from this station' or 'Authentication failure'.",
              rootCause: "Directory Mapping rule did not match the user's AD groups, or the bind user account is locked out.",
              securityImpact: "Legitimate administrator locked out of emergency operational systems.",
              cyberArkCodeOrEvent: "ITATS020E",
            },
            {
              symptom: "New administrators cannot log in: 'ITATS006E License capacity exceeded'.",
              rootCause: "All allocated EPV user licenses have been consumed by inactive accounts or overly broad Directory Maps.",
              securityImpact: "Operational freeze; onboarding halts until inactive licenses are audited and purged.",
              cyberArkCodeOrEvent: "ITATS006E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Verify Active Directory bind account status and account lockout flags.",
              logFileOrConsole: "Active Directory Users and Computers (ADUC) / italog.log",
              remediation: "Unlock the bind account, reset its password, and update the credential stored in the Vault LDAP configuration.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Examine LDAP search filter and user DN in PVWA web logs.",
              logFileOrConsole: "C:\\Windows\\Temp\\PVWA\\PVWA.App.log",
              remediation: "Ensure the base DN includes the target OU where user accounts are located, and test with ldapsearch.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Audit user license consumption and delete orphaned external users.",
              logFileOrConsole: "PrivateArk Client > Tools > Administrative Tools > Users and Groups",
              remediation: "Select inactive external users who have not logged in for 90+ days and delete their cached Vault principal records.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 09:14:22 ITATS020E Authentication failure for user john.doe from station 10.1.20.15.\n15/11/2026 09:14:22 ITATS431E LDAP query failed: Server down or TLS handshake error on DC01.corp.local:636.",
              explanation:
                "The Vault could not reach Domain Controller DC01 on port 636 or the LDAPS certificate chain was untrusted by the Vault OS certificate store.",
            },
            {
              logFile: "C:\\Windows\\Temp\\PVWA\\PVWA.App.log",
              sampleOutput:
                "ERROR - User john.doe matched Directory Map 'All_Domain_Users' but no available EPV licenses remain (Max: 200, Used: 200).",
              explanation:
                "The Directory Map was too broad, auto-provisioning every standard domain user into EPV licenses until the license limit was exhausted.",
            },
          ],
          instructorNotes: [
            "Never map `Domain Users` or broad wildcard groups to an EPV User template. Only map dedicated security groups like `PAM_Windows_Admins`.",
            "Always maintain at least two emergency internal Vault Administrator accounts (`Master` and a secondary break-glass user) whose passwords are split in physical sealed envelopes.",
            "When using SAML authentication, ensure clock skew between the IdP and PVWA web servers is within 60 seconds to prevent token invalidation.",
          ],
          securityImplications: [
            "Single Point of Failure: If Directory Mapping relies on a single Domain Controller that fails, user authentication drops. Always configure multiple redundant LDAPS endpoints.",
            "Privilege Creep: Ensure AD groups mapped to PAM roles are subject to recurring quarterly access certification under SOX 404.",
            "License Governance: Inactive accounts that retain licenses also retain access potential; automated de-allocation is essential for defense-in-depth.",
          ],
          knowledgeCheck: [
            {
              id: "m02-q01",
              question: "What is the primary operational advantage of using Directory Mapping over creating local Vault users?",
              options: [
                "Directory Mapping allows users to bypass Multi-Factor Authentication.",
                "Directory Mapping ensures centralized provisioning and immediate de-provisioning tied to Active Directory employment status.",
                "Directory Mapping eliminates the need for Safe Access Control Lists.",
                "Directory Mapping runs on TCP port 80 without requiring encryption.",
              ],
              correctIndex: 1,
              explanation:
                "Directory Mapping links PAM access directly to Active Directory group membership. When an employee is terminated or transferred in AD, their PAM access is revoked immediately across all Safes without manual administrative intervention.",
              conceptTested: "Directory Mapping Operational Benefits",
            },
            {
              id: "m02-q02",
              question: "If an enterprise exhausts its licensed EPV User quota, what occurs when a valid AD user attempts their initial login via a Directory Map?",
              options: [
                "The Vault converts them to a Master administrator automatically.",
                "The Vault grants them temporary access for 24 hours.",
                "Authentication fails with an error indicating license capacity exceeded (ITATS006E).",
                "The Vault automatically deletes the oldest user account in the system.",
              ],
              correctIndex: 2,
              explanation:
                "When EPV user license capacity is exhausted, the Vault rejects any new user provisioning with a license capacity exceeded error. Inactive users must be purged or additional licenses acquired.",
              conceptTested: "User License Governance & Quota Management",
            },
            {
              id: "m02-q03",
              question: "Which role separation model represents production best practice in enterprise PAM?",
              options: [
                "All users are granted Master Administrator permissions for ease of access.",
                "Auditors have read-only access to audit logs and reports; Operators have access to check out credentials; PAM Admins manage Safes and configuration.",
                "Auditors are allowed to change root passwords on target servers directly.",
                "Developers manage the Vault firewall rules.",
              ],
              correctIndex: 1,
              explanation:
                "Enterprise PAM requires strict separation of duties: Auditors inspect logs without viewing passwords; Operators check out passwords or start sessions; PAM Administrators manage platforms, Safes, and infrastructure.",
              conceptTested: "Role-Based Access Control (RBAC) & Separation of Duties",
            },
          ],
          practicalExercise: {
            id: "m02-ex01",
            title: "Inspect Administrator Role Assignments and User Privileges",
            scenario:
              "As part of a quarterly governance review, audit the user accounts configured in the PAM simulator, verify their assigned roles (Administrator vs Operator vs Auditor), and confirm least privilege enforcement.",
            instructions: [
              "Navigate to the Access Management console.",
              "Review the active users and their operational permissions.",
              "Inspect user role attributes and verify that administrative permissions are restricted to authorized personnel.",
              "Verify that audit logging records your inspection activity.",
            ],
            targetConsole: "access",
            associatedLabId: "Lab 02 · Provision DBA-SAFE access",
            validationObjectiveId: "assign-owner",
            validationCriteria:
              "User role definitions and access permissions are reviewed in the Access Management console.",
          },
          completionCriteria: [
            "Mastered Directory Mapping mechanics and LDAPS connectivity requirements.",
            "Analyzed SAML/RADIUS MFA authentication flows and license quota governance.",
            "Completed all 3 knowledge checkpoint questions.",
            "Conducted the user role and privilege inspection in the Access Management console.",
          ],
          references: [
            "Active Directory Security Best Practices: Securing Privileged Groups (Microsoft TechNet)",
            "OASIS SAML 2.0 Web Browser SSO Profile Specification",
            "ISO/IEC 27001:2022 Control 5.15 - Access Control and User Management",
          ],
        },
      ],
    },
  ],
};
