/**
 * SHADOWXLAB PAM ACADEMY — CLASS 02: SAFE ADMINISTRATION & ACCESS MANAGEMENT
 * Complete instructional content covering Safe architecture, granular permissions matrix,
 * dual-control authorization, and access governance.
 */

import type { ClassCurriculum } from "../types";

export const CLASS_02: ClassCurriculum = {
  id: "class-02",
  number: "02",
  label: "CLASS 02",
  title: "Safe Administration & Access Management",
  subtitle: "Safe Hierarchies, Granular Permissions Matrix & Dual-Control Governance",
  duration: "1H 45M",
  level: "Associate",
  overview:
    "Master Safe security architecture, enterprise naming conventions, granular Access Control Lists (ACLs), dual-control request workflows, and separation of duties in CyberArk PVWA Classic.",
  modules: [
    {
      id: "c02-m01",
      number: "M1",
      title: "Safe Security Boundaries, Tier Segregation & Retention Policies",
      description:
        "Understand the cryptographic role of Safes in the Digital Vault, tier-based boundary segregation, retention cycles, and enterprise naming conventions.",
      lessons: [
        {
          id: "c02-m01-l01",
          number: "2.1",
          title: "Safe Architecture & Enterprise Security Boundaries",
          subtitle: "Isolating Privileged Accounts by Risk Domain, Tier & Custodianship",
          estimatedMinutes: 20,
          learningObjectives: [
            "Explain how Safes act as cryptographic and operational isolation boundaries in the Vault.",
            "Formulate enterprise Safe naming conventions for multi-region infrastructure.",
            "Configure retention policies for password versioning and deleted object recovery.",
          ],
          prerequisites: ["Completion of Class 01.", "Basic understanding of RBAC access models."],
          conceptIntroduction:
            "A Safe is the primary logical container and security boundary within the CyberArk Digital Vault. All privileged accounts, credentials, and files reside inside Safes. Safes determine who can see an account, who can initiate a session, which CPM manages password rotations, and how long historical password versions are retained before permanent purging.",
          whyItExists:
            "Without compartmentalized Safes, granting an administrator access to manage a web server would inadvertently expose critical Domain Controller or database root credentials. By segregating credentials into dedicated Safes with independent Access Control Lists (ACLs), organizations enforce strict separation of duties and prevent blast-radius propagation during an account compromise.",
          architecture: {
            overview:
              "Safes are maintained in the encrypted Vault database. Each Safe has its own encryption key derived from the Vault Master Key and assigned operational properties.",
            diagramAscii: `
┌────────────────────────────────────────────────────────────────────────┐
│                   DIGITAL VAULT (SERVER 2022)                          │
│                                                                        │
│   ┌────────────────────┐   ┌────────────────────┐   ┌──────────────┐   │
│   │     WIN-SAFE       │   │     UNIX-SAFE      │   │   DBA-SAFE   │   │
│   │ Tier-1 Win Admins  │   │ Tier-1 Root & Sudo │   │ Oracle/MSSQL │   │
│   │ Retention: 30 Days │   │ Retention: 30 Days │   │ Ret: 90 Days │   │
│   └────────────────────┘   └────────────────────┘   └──────────────┘   │
│                                                                        │
│   ┌────────────────────┐   ┌────────────────────┐   ┌──────────────┐   │
│   │    DOMAIN-SAFE     │   │   EMERGENCY-SAFE   │   │ SERVICE-SAFE │   │
│   │ Tier-0 Dom Admins  │   │ Break-Glass OTP    │   │ App Machine  │   │
│   │ Dual-Control: YES  │   │ Dual-Control: YES  │   │ Non-Human    │   │
│   └────────────────────┘   └────────────────────┘   └──────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
`,
            componentResponsibilities: [
              {
                component: "Safe Container",
                role: "Encapsulates accounts, cryptographic version histories, and ACL permissions.",
                securityBoundary:
                  "Zero cross-Safe permission inheritance. Every Safe must be granted explicitly.",
              },
              {
                component: "Assigned CPM",
                role: "Central Policy Manager assigned to scan and rotate accounts inside this specific Safe.",
                securityBoundary:
                  "Only the assigned CPM instance possesses permission to update account contents.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Safe Owner",
                action: "Creates Safe with designated naming format (e.g., PROD-WIN-SRV-APP01).",
                channelOrProtocol: "PVWA HTTPS",
                verificationRule:
                  "Must follow corporate Safe naming standards and assign at least two owners.",
              },
              {
                stepNumber: 2,
                actor: "Vault Engine",
                action:
                  "Generates unique Safe encryption key and initializes object retention tables.",
                channelOrProtocol: "Internal Vault DB",
                verificationRule: "Audit log records Safe creation timestamp and creator identity.",
              },
            ],
          },
          terminology: [
            {
              term: "Safe Retention Period",
              definition:
                "The number of days historical password versions and deleted accounts remain recoverable in the Safe before permanent purging.",
              enterpriseContext:
                "Critical for forensic analysis; standard regulatory compliance (e.g. SOX) mandates at least 30 to 90 days retention.",
            },
            {
              term: "Safe Member",
              definition:
                "A user or security group authorized to interact with accounts inside a specific Safe according to a defined permission matrix.",
              enterpriseContext:
                "Best practice requires assigning Active Directory security groups rather than individual user accounts to Safes.",
            },
          ],
          administratorResponsibilities: [
            "Establish and enforce corporate Safe naming standards across all business units.",
            "Ensure every Safe has assigned primary and secondary technical owners.",
            "Verify that CPM service users and PSM application users are properly added as members during Safe provisioning.",
          ],
          configurationAndAdministration: [
            {
              name: "Safe Retention Configuration",
              settingOrObject: "Safe Properties > Retention",
              description:
                "Defines whether retention is based on number of days or number of password versions.",
              productionBestPractice:
                "Configure 'Retain deleted accounts for 30 days' and 'Retain historical versions for 30 days'.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Create an Enterprise Safe",
              action:
                "Navigate to Safes console in PVWA, click 'Add Safe', enter name, description, assigned CPM, and retention period.",
              expectedResult: "Safe is provisioned and appears in the enterprise Safes inventory.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "GFS requires separate Safes for their Swift Payment Gateway (SWIFT-SAFE), Core Banking Windows Infrastructure (WIN-SAFE), and Database Tier (DBA-SAFE). Segregation ensures database administrators cannot view or checkout payment API credentials.",
            governanceRequirements: [
              "Mandatory dual-control approval for all accounts housed in SWIFT-SAFE.",
              "Weekly access review audits of all Safe memberships.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Accounts added to a new Safe fail automatic CPM password management.",
              rootCause:
                "The administrator forgot to add the CPM service user (e.g. PasswordManager) as a member with 'Initiate CPM Operations' permission.",
              securityImpact: "Credentials inside the new Safe remain unmanaged and static.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Open Safe Members tab in PVWA and check for PasswordManager user.",
              logFileOrConsole: "PVWA Safes Console > Members tab",
              remediation:
                "Add PasswordManager user with full content authoring and CPM execution permissions.",
            },
          ],
          securityImplications: [
            "Never grant the built-in 'Everyone' group access to any Safe.",
            "Avoid housing Tier-0 Domain Controller accounts and Tier-2 helpdesk accounts in the same Safe boundary.",
          ],
          knowledgeCheck: [
            {
              id: "c02-m01-q01",
              question:
                "Why should Safe permissions be granted to Active Directory security groups rather than individual users?",
              options: [
                "Because individual users cannot log into PVWA.",
                "To streamline access lifecycle management through enterprise identity governance and avoid orphaned ACL entries.",
                "Because CyberArk Digital Vault does not support individual user objects.",
                "To disable multi-factor authentication on group members.",
              ],
              correctIndex: 1,
              explanation:
                "Using group-based authorization ensures that when an employee changes roles or leaves the organization, removing them from the AD group automatically revokes their Safe access without manual Vault administration.",
              conceptTested: "Safe Access Governance",
            },
          ],
          completionCriteria: [
            "Explained the isolation boundary of a CyberArk Safe.",
            "Understood the operational impact of Safe retention periods.",
          ],
          references: [
            "CyberArk Safe Administration & Design Best Practices Guide",
            "ISO/IEC 27001 Access Control Guidelines",
          ],
        },
      ],
    },
    {
      id: "c02-m02",
      number: "M2",
      title: "Granular Safe Permissions Matrix & RBAC Authorization Engine",
      description:
        "Comprehensive breakdown of the 10 core Safe permissions, permissions interdependence, least-privilege scoping, and permission denial diagnosis.",
      lessons: [
        {
          id: "c02-m02-l01",
          number: "2.2",
          title: "The CyberArk Safe Permissions Matrix",
          subtitle: "Demystifying Use vs Retrieve, Administrative Authorizations & Delegation",
          estimatedMinutes: 25,
          learningObjectives: [
            "Distinguish between 'Use accounts' (PSM session proxy) and 'Retrieve accounts' (plaintext password view).",
            "Identify mandatory permission dependencies (e.g. Add Account requires List Accounts).",
            "Configure least-privilege roles for Operators, Auditors, and Safe Managers.",
          ],
          prerequisites: ["Completion of Lesson 2.1."],
          conceptIntroduction:
            "CyberArk Safe permissions are highly granular, dividing rights into three distinct functional tiers: Content Consumption (Use vs Retrieve), Content Authoring (Add, Update, Delete), and Safe Governance (Manage Safe, View Audit). Understanding these permissions is the cornerstone of least-privilege PAM architecture.",
          whyItExists:
            "In legacy access management, administrators often held all-or-nothing privileges. In a mature PAM environment, an operations technician should be able to launch an RDP session via PSM to fix a server, but should NEVER have the right to view the plaintext password or delete the account.",
          architecture: {
            overview:
              "Safe permissions are evaluated atomically by the Digital Vault on every API or UI call. If a requested operation lacks the necessary permission bit in the Safe ACL, the Vault immediately rejects the transaction with an access denied code.",
            diagramAscii: `
====================== GRANULAR PERMISSION MATRIX ======================

[ ROLE: OPERATOR ]
  - List Accounts        : YES (Can view account metadata in inventory grid)
  - Use Accounts         : YES (Can click Connect to launch monitored PSM session)
  - Retrieve Accounts    : NO  (Cannot view or copy plaintext password)
  - Add / Update / Delete: NO  (Cannot tamper with vault secrets)

[ ROLE: AUDITOR / COMPLIANCE ]
  - List Accounts        : YES (Can inspect inventory and platform compliance)
  - View Audit Log       : YES (Can review historical checkout and rotation logs)
  - Use / Retrieve       : NO  (Cannot access target hosts or credentials)

[ ROLE: SAFE ADMINISTRATOR ]
  - Manage Safe          : YES (Can add/remove members and update Safe properties)
  - Add / Update Content : YES (Can onboard new systems and manual secrets)
  - Initiate CPM Ops     : YES (Can trigger manual Verify, Change, Reconcile)
`,
            componentResponsibilities: [
              {
                component: "Vault ACL Engine",
                role: "Evaluates the calling user's effective permissions against Safe metadata.",
                securityBoundary:
                  "Atomic evaluation; zero client-side caching of authorization decisions.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Operator",
                action: "Clicks 'Show Password' on account Administrator in WIN-SAFE.",
                channelOrProtocol: "PVWA HTTPS",
                verificationRule:
                  "Vault checks for 'Retrieve accounts' permission. If absent, request is blocked.",
              },
              {
                stepNumber: 2,
                actor: "Operator",
                action: "Clicks 'Connect' to launch PSM session.",
                channelOrProtocol: "PVWA HTTPS",
                verificationRule:
                  "Vault checks for 'Use accounts' permission. Since granted, session initiates.",
              },
            ],
          },
          terminology: [
            {
              term: "Use Accounts",
              definition:
                "Permission allowing a member to initiate a transparent PSM session without viewing or exposing the underlying credential.",
              enterpriseContext: "The gold standard for least-privilege operational access.",
            },
            {
              term: "Retrieve Accounts",
              definition:
                "Permission allowing a member to copy or view the plaintext password on screen.",
              enterpriseContext:
                "High-risk permission; should be restricted to emergency break-glass procedures.",
            },
            {
              term: "Initiate CPM Operations",
              definition:
                "Permission allowing a member to manually trigger immediate Verify, Change, or Reconcile tasks on accounts in the Safe.",
              enterpriseContext:
                "Mandatory for CPM service users and senior PAM tier-2/tier-3 administrators.",
            },
          ],
          administratorResponsibilities: [
            "Audit Safe memberships quarterly to identify and revoke excessive 'Retrieve accounts' permissions.",
            "Ensure least-privilege separation between Tier-1 system operators and Tier-3 PAM engineers.",
          ],
          configurationAndAdministration: [
            {
              name: "Safe Permissions Checkboxes",
              settingOrObject: "PVWA > Safes > Edit Members",
              description:
                "Configures the 10 distinct permission checkboxes for each assigned user or group.",
              productionBestPractice:
                "Never grant 'Manage Safe' or 'Retrieve accounts' to standard operator groups.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Grant Operator Permissions",
              action:
                "Add 'Tier-1-Ops-Team' AD group to WIN-SAFE. Check 'List accounts' and 'Use accounts'. Leave 'Retrieve accounts' unchecked.",
              expectedResult:
                "Operators can connect to servers via PSM but cannot copy or view passwords.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "GFS detected an internal auditor who was mistakenly granted 'Retrieve accounts' on DBA-SAFE, allowing them to view production database root passwords.",
            governanceRequirements: [
              "Immediate revocation of Retrieve permissions for all audit personas.",
              "Enforce 'Use accounts' only for technical operators.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Administrator tries to onboard an account but receives 'ITATS006E Not authorized to add account'.",
              rootCause:
                "The administrator's group possesses 'List accounts' but lacks 'Add accounts' on the target Safe.",
              securityImpact:
                "Onboarding blocked until permissions are escalated by a Safe Manager.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Examine the Safe permissions assigned to the user's AD group in PVWA.",
              logFileOrConsole: "PVWA > Safes > WIN-SAFE > Members",
              remediation: "Have a designated Safe Owner check the 'Add accounts' permission box.",
            },
          ],
          securityImplications: [
            "Possessing 'Retrieve accounts' allows an operator to bypass PSM session recording by manually typing the password into unmonitored consoles.",
          ],
          knowledgeCheck: [
            {
              id: "c02-m02-q01",
              question:
                "What is the critical security difference between 'Use accounts' and 'Retrieve accounts'?",
              options: [
                "'Use accounts' allows viewing the password in plaintext, while 'Retrieve accounts' launches an RDP session.",
                "'Use accounts' allows connecting via PSM without viewing the credential, while 'Retrieve accounts' exposes the plaintext password to the user.",
                "There is no technical difference between the two permissions.",
                "'Retrieve accounts' automatically rotates the password after 10 minutes.",
              ],
              correctIndex: 1,
              explanation:
                "'Use accounts' enables proxy session initiation where PSM injects the secret server-side. 'Retrieve accounts' displays the secret to the user, breaking session isolation and credential masking.",
              conceptTested: "Safe Permission Distinction",
            },
          ],
          practicalExercise: {
            id: "ex-c02-01",
            title: "Configure Granular Safe Permissions for DBA Team",
            scenario:
              "Configure member permissions on DBA-SAFE for dba_user so they can list and use database accounts without possessing Retrieve or administrative rights.",
            instructions: [
              "Navigate to the Safes console in PVWA.",
              "Select DBA-SAFE and review the current assigned members.",
              "Ensure dba_user has List Accounts and Use Accounts permissions enabled.",
              "Run the Learning Academy Class 02 validation engine to confirm compliance.",
            ],
            targetConsole: "safes",
            associatedLabId: "Lab 02 · Configure Safe permissions",
            validationObjectiveId: "id-dba-safe",
            validationCriteria:
              "DBA-SAFE member permissions validated with least-privilege scoping.",
          },
          completionCriteria: [
            "Memorized the distinction between Use and Retrieve permissions.",
            "Successfully configured least-privilege member rights on DBA-SAFE.",
          ],
          references: [
            "CyberArk Privileged Vault Web Access User Guide (Safe Permissions Reference)",
          ],
        },
      ],
    },
  ],
};
