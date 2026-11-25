/**
 * MODULE 05 — SAFES AND ACCESS CONTROL
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 3 Hours | Day: 2 | Domain: Safes and Access Control (20%)
 * Practicals: Create or review a training Safe where permitted; assign permissions to a test user and validate access; troubleshoot a permissions scenario.
 * Learning Outcome: Explain Safe structure and apply foundational access-control concepts.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_05: ClassCurriculum = {
  id: "client-m05",
  number: "05",
  label: "MODULE 05",
  title: "Safes and Access Control",
  subtitle: "Safe Hierarchy, Granular Permissions Matrix, Group ACLs & Access Troubleshooting",
  duration: "3 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Safes and Access Control",
  overview:
    "Delivers comprehensive training on CyberArk Safe architecture and granular access governance. Covers the purpose and organization of Safes, Safe ownership, the granular permissions matrix (List, Retrieve, Use, Add, Update, Administer), user and group membership management, least-privilege role design, periodic entitlement reviews, and troubleshooting real-world access denial scenarios.",
  modules: [
    {
      id: "cm05-core",
      number: "M05",
      title: "Safes and Access Control",
      description:
        "Safe hierarchy, granular permissions, user/group management, and access-control troubleshooting.",
      lessons: [
        {
          id: "cm05-l01",
          number: "5.1",
          title: "Safe Fundamentals, Permissions Matrix & Access Governance",
          subtitle:
            "Safe Organization, Granular ACLs (List, Retrieve, Use), Group Membership & Least Privilege",
          estimatedMinutes: 180,
          learningObjectives: [
            "Explain Safe structure and apply foundational access-control concepts.",
            "Describe the purpose and organization of Safes as logical isolation boundaries within the Vault.",
            "Differentiate between granular Safe permissions: List, Retrieve, Use, Add, Update, and Administer accounts.",
            "Manage user and group membership at the Safe level to enforce role-based access control (RBAC).",
            "Apply least-privilege best practices to prevent excessive permissions and privilege creep.",
            "Create or review a training Safe and assign granular permissions to a test user.",
            "Troubleshoot real-world permissions misconfigurations and access denial cases.",
          ],
          prerequisites: [
            "Completion of Module 01 through Module 04.",
            "Basic understanding of role-based access control (RBAC) and Active Directory security groups.",
          ],
          conceptIntroduction:
            "In CyberArk, a Safe is the foundational logical isolation container inside the Digital Vault. Every privileged account, secret, and file object must reside within an authorized Safe. Access control is enforced at the Safe boundary: rather than assigning permissions to individual accounts, administrators assign permissions to users and directory groups at the Safe level. A user only has access to an account if they are an authorized member of the Safe containing that account. By structuring Safes logically (e.g., by operating system, environment, application tier, or business unit) and assigning granular permissions, organizations establish strict multi-tenancy and defense-in-depth.",
          whyItExists:
            "Without Safe-level isolation, all vaulted credentials would sit in a flat, unsegmented pool. A compromised administrator account could potentially access every credential in the enterprise. Safes enforce compartmentalization: a database administrator granted access to the Oracle Safe has zero visibility into the Windows Domain Controller Safe or the Cloud Root Safe.",
          architecture: {
            overview:
              "Safes are cryptographic partitions within the Digital Vault database. Each Safe has its own Access Control List (ACL), retention policy, and encryption metadata. The Vault evaluates Safe ACLs on every request, verifying whether the requesting user's identity or group memberships grant the required operational permission.",
            componentResponsibilities: [
              {
                component: "Safe Boundary",
                role: "Encapsulates accounts, passwords, and file objects into a single governance unit.",
                securityBoundary: "Cryptographic container; permissions evaluated by Vault kernel.",
              },
              {
                component: "Safe ACL (Access Control List)",
                role: "Defines the specific granular permissions granted to individual users or groups.",
                securityBoundary:
                  "Explicit permission matrix (e.g. List, Retrieve, Use, Add, Update).",
              },
              {
                component: "CPM Safe Association",
                role: "Binds a specific Central Policy Manager instance to manage all accounts within the Safe.",
                networkProtocols: "TCP 1858 (Vault Protocol)",
                securityBoundary: "Determines which CPM engine has authority to rotate passwords.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Safe Administrator",
                action:
                  "Creates a new Safe (e.g. 'DBA-SAFE') and assigns an managing CPM instance.",
                channelOrProtocol: "PVWA -> Safes Console",
                verificationRule: "Safe name must be unique; managing CPM must be active.",
              },
              {
                stepNumber: 2,
                actor: "Safe Administrator",
                action:
                  "Adds user or group (e.g., 'dba_user') and assigns least-privilege permissions (List, Use).",
                channelOrProtocol: "PVWA -> Safe Members",
                verificationRule:
                  "'Retrieve' permission excluded to prevent plaintext password viewing.",
              },
              {
                stepNumber: 3,
                actor: "End User (dba_user)",
                action: "Logs into PVWA; Vault evaluates DBA-SAFE membership.",
                channelOrProtocol: "HTTPS 443 -> TCP 1858",
                verificationRule:
                  "User sees accounts in DBA-SAFE and can click 'Connect', but cannot copy password.",
              },
              {
                stepNumber: 4,
                actor: "Vault Audit",
                action:
                  "Logs every permission evaluation, connection launch, and administrative change.",
                channelOrProtocol: "Immutable Vault Journal",
                verificationRule:
                  "Audit entry recorded with administrator ID, timestamp, and granted ACLs.",
              },
            ],
          },
          terminology: [
            {
              term: "Safe",
              definition:
                "The core logical and cryptographic security container in CyberArk where privileged accounts and files are stored.",
              enterpriseContext:
                "The primary boundary for granting or revoking administrative access.",
            },
            {
              term: "List Accounts",
              definition:
                "Permission allowing a member to see the account name, address, and metadata in PVWA search results.",
              enterpriseContext: "The prerequisite base permission for all user interactions.",
            },
            {
              term: "Use Accounts",
              definition:
                "Permission allowing a member to consume the credential for automated operations or launch a proxied PSM session without viewing the password.",
              enterpriseContext:
                "Standard operational permission granted to everyday administrators.",
            },
            {
              term: "Retrieve Accounts",
              definition:
                "High-privilege permission allowing a member to display or copy the plaintext password of an account.",
              enterpriseContext:
                "Strictly restricted; generally reserved for emergency break-glass or offline disaster recovery.",
            },
            {
              term: "Manage Safe",
              definition:
                "Administrative permission allowing a user to update Safe properties, add or remove Safe members, and edit ACLs.",
              enterpriseContext: "Restricted exclusively to authorized PAM administrators.",
            },
          ],
          administratorResponsibilities: [
            "Structure Safes according to a consistent enterprise naming convention (e.g., <ENV>-<PLATFORM>-<TIER>-SAFE).",
            "Assign Safe permissions to Active Directory / IdP groups rather than individual user accounts to prevent orphan rights.",
            "Enforce least privilege: grant 'Use' permissions instead of 'Retrieve' permissions wherever PSM is deployed.",
            "Conduct quarterly Safe access reviews to identify and remove stale or excessive entitlements.",
          ],
          configurationAndAdministration: [
            {
              name: "Safe Permissions Matrix",
              settingOrObject: "Safe Members -> Member Permissions",
              description:
                "Grants specific rights: List accounts, Retrieve accounts, Use accounts, Add accounts, Update account content, Update account properties, Initiate privileged sessions, Authorize account requests, Manage Safe.",
              productionBestPractice:
                "Never grant 'Retrieve accounts' or 'Manage Safe' to general operator groups.",
            },
            {
              name: "History and Retention Policy",
              settingOrObject: "Safe Properties -> History Retention",
              description:
                "Specifies how many days past password versions and deleted account objects are retained in the Vault.",
              productionBestPractice:
                "Set retention to at least 90 days for compliance with auditing standards.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Safe Creation and Configuration",
              action:
                "Navigate to Safes console, click Add Safe, define name, assign CPM, and configure retention.",
              expectedResult: "Safe created with verified settings.",
            },
            {
              stepNumber: 2,
              title: "Member and Permission Assignment",
              action:
                "Add target user or group to the Safe and select least-privilege checkboxes (List, Use, Initiate sessions).",
              expectedResult: "Member added with configured permissions.",
            },
            {
              stepNumber: 3,
              title: "Permissions Verification & Troubleshooting",
              action:
                "Test access from the member's perspective; verify that permitted actions succeed and unpermitted actions are blocked.",
              expectedResult: "Access operates strictly within defined boundaries.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "GFS security policy dictates that all database administrators (dba_user) must access database credentials in 'DBA-SAFE' strictly through PSM without having the ability to view or copy the plaintext password. A junior engineer accidentally assigned 'Retrieve accounts' and 'Manage Safe' to dba_user.",
            governanceRequirements: [
              "Immediate remediation of excessive permissions on DBA-SAFE.",
              "Enforce least-privilege: dba_user must have 'List accounts', 'Use accounts', and 'Initiate privileged sessions' only.",
              "Document the permission change in the compliance audit trail.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Operator can view and copy plaintext database passwords, violating security policy.",
              rootCause:
                "Safe ACL grants 'Retrieve accounts' permission to the operator role group.",
              securityImpact: "Credential exposure; risk of unmonitored direct database access.",
              cyberArkCodeOrEvent: "AUDIT-PASSWORD-RETRIEVED",
            },
            {
              symptom: "Operator cannot initiate PSM session to database server ('Access Denied').",
              rootCause:
                "Safe ACL grants 'List accounts' but lacks 'Use accounts' or 'Initiate privileged sessions'.",
              securityImpact: "Operational blockage during scheduled database maintenance.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Open Safes console, select affected Safe, and review Members and Permissions.",
              logFileOrConsole: "PVWA -> Safes -> DBA-SAFE -> Members",
              remediation:
                "Select dba_user, click Edit Permissions, deselect 'Retrieve accounts' and 'Manage Safe', and ensure 'List accounts' and 'Use accounts' are checked.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Verify changes by checking the Vault audit log.",
              logFileOrConsole: "Reports & Audit Console",
              remediation: "Confirm 'Update Safe Member' audit event recorded.",
            },
          ],
          securityImplications: [
            "Granting excessive Safe permissions (especially 'Manage Safe') allows non-admins to alter access controls.",
            "Failing to separate Safes by tier allows a breach in one department to compromise another.",
            "Orphaned Safe permissions left behind after employee role changes create compliance vulnerabilities.",
          ],
          knowledgeCheck: [
            {
              id: "cm05-q01",
              question:
                "Which Safe permission is strictly required to launch an isolated PSM session to a target server without allowing the user to view or copy the plaintext password?",
              options: [
                "Retrieve accounts",
                "Use accounts (or Initiate privileged sessions)",
                "Manage Safe",
                "Add accounts",
              ],
              correctIndex: 1,
              explanation:
                "'Use accounts' allows the operator or PSM broker to use the credential to establish a session, while 'Retrieve accounts' allows displaying the plaintext password. To prevent password exposure, grant 'Use accounts' and omit 'Retrieve accounts'.",
              conceptTested: "Granular Safe Permissions: Use vs Retrieve",
            },
            {
              id: "cm05-q02",
              question:
                "Why is it considered a security best practice to assign Safe permissions to directory groups (e.g., Active Directory / IdP groups) rather than individual user accounts?",
              options: [
                "The Digital Vault cannot store individual user accounts.",
                "Group-based assignment centralizes identity lifecycle management, ensures consistent least privilege, and prevents orphaned permissions when users change roles.",
                "Individual user assignments require more network bandwidth across TCP 1858.",
                "Group assignments disable session recording automatically.",
              ],
              correctIndex: 1,
              explanation:
                "Assigning permissions to directory groups aligns with enterprise Role-Based Access Control (RBAC), streamlining onboarding, offboarding, and auditing while preventing access creep.",
              conceptTested: "Group-Based Safe Access Control",
            },
            {
              id: "cm05-q03",
              question:
                "In the DBA-SAFE scenario, user 'dba_user' had excessive rights ('Retrieve accounts' and 'Manage Safe'). What is the correct least-privilege permission set for their daily database administration duties?",
              options: [
                "List accounts, Use accounts, Initiate privileged sessions",
                "Retrieve accounts, Manage Safe, Delete accounts",
                "Unlock accounts, Clear history, Administer Vault",
                "No permissions; database administrators should never use CyberArk",
              ],
              correctIndex: 0,
              explanation:
                "Least privilege for an operational administrator consists of 'List accounts' (to see the account in PVWA), 'Use accounts' (to connect), and 'Initiate privileged sessions' (to broker via PSM), without granting password retrieval or Safe management rights.",
              conceptTested: "Least Privilege Permission Configuration",
            },
          ],
          practicalExercise: {
            id: "cm05-ex01",
            title: "Safe Creation, Permission Matrix & Least Privilege Troubleshooting",
            objective:
              "Configure least-privilege permissions on a target Safe, assign permissions to a test user, and validate access boundaries.",
            scenario:
              "Navigate to the Safes console, inspect 'DBA-SAFE', verify member 'dba_user', and adjust permissions to ensure least-privilege compliance (List, Use, Initiate sessions; no excessive Retrieve or Manage Safe rights).",
            prerequisites: ["Completion of Module 01-04"],
            startingState: "Existing DBA-SAFE with member dba_user.",
            instructions: [
              "Navigate to the Safes console.",
              "Select 'DBA-SAFE' and inspect its properties and members.",
              "Open member 'dba_user' and configure permissions: ensure 'List accounts', 'Use accounts', and 'Initiate privileged sessions' are enabled.",
              "Ensure excessive permissions ('Retrieve accounts' and 'Manage Safe') are removed.",
              "Save changes and run the simulator validation to confirm compliance.",
            ],
            stepDetails: [
              {
                action: "Navigate to Safes Console",
                explanation: "Open the Safe inventory and select DBA-SAFE.",
                expectedResult: "DBA-SAFE details and member list displayed.",
              },
              {
                action: "Edit dba_user Permissions",
                explanation: "Configure least-privilege ACLs: List, Use, Initiate sessions.",
                expectedResult: "Permissions saved to Vault state.",
              },
              {
                action: "Execute Simulator Validation",
                explanation:
                  "Verify that DBA-SAFE and dba_user permissions meet all 6 objective criteria.",
                expectedResult: "6/6 objectives passed; lab completion recorded.",
              },
            ],
            targetConsole: "safes",
            associatedLabId: "Lab 02 · Configure Safe permissions",
            validationObjectiveId: "obj-cm05-safes",
            validationCriteria:
              "Configure least-privilege permissions for dba_user on DBA-SAFE and validate in the simulator.",
            troubleshootingHints: [
              {
                symptom: "Validation fails on excessive permissions check.",
                hint: "Make sure 'Retrieve accounts' and 'Manage Safe' are not checked for dba_user.",
                correctiveAction:
                  "Deselect Retrieve and Manage Safe in the member permission modal and click Save.",
              },
            ],
            independentPractice: {
              title: "Independent Safe Access Review",
              scenario:
                "Audit the member permissions on 'WIN-SAFE' and confirm whether separation of duties is maintained.",
              goal: "Verify understanding of Safe ACL auditing.",
              targetConsole: "safes",
              successCriteria: [
                "Inspect members of WIN-SAFE.",
                "Confirm that non-admin operators do not hold Manage Safe permissions.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Complete Safe permission configuration in the Safes console.",
            "Pass all 6 validation criteria for Lab 02 in the simulator.",
          ],
          references: [
            "CyberArk Safe Management & Access Permissions Guide",
            "NIST SP 800-53: AC-6 Least Privilege",
            "CyberArk Privilege Cloud Safe Design Best Practices",
          ],
        },
      ],
    },
  ],
};
