/**
 * SHADOWXLAB PAM ACADEMY — MODULE 04: SAFES
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_04: ClassCurriculum = {
  id: "module-04",
  number: "04",
  label: "MODULE 04",
  title: "Safes",
  subtitle: "Logical Isolation, Retention Governance & Granular Permissions Matrix",
  duration: "55 mins",
  level: "Professional",
  track: "admin-20",
  category: "Core Administration & Access Control",
  overview:
    "Master the core storage container of the Digital Vault. Deconstruct Safe cryptographic isolation, retention policies (versioning vs day-based retention), the 10+ granular Safe permissions, permission dependencies, least-privilege membership scoping, and automated Safe lifecycle governance.",
  modules: [
    {
      id: "m04-core",
      number: "M4",
      title: "Safe Architecture & Permissions Matrix",
      description:
        "In-depth analysis of Safe containers, encryption keys, granular permission scoping, and member access governance.",
      lessons: [
        {
          id: "m04-l01",
          number: "4.1",
          title: "Safe Architecture & Granular Access Control",
          subtitle: "Configuring cryptographic containers, retention policies, and least-privilege permission matrices",
          estimatedMinutes: 25,
          learningObjectives: [
            "Deconstruct Safe architecture as both a logical administrative container and a cryptographic storage boundary.",
            "Configure Safe retention policies balancing compliance audit requirements with Vault database storage capacity.",
            "Analyze the 10+ granular Safe permissions and evaluate functional dependencies between them.",
            "Implement least-privilege Safe membership scoping separating operational users, automated service accounts, and auditors.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 02: User Management.",
            "Module 03: Policies and Platforms.",
          ],
          conceptIntroduction:
            "In the Digital Vault, accounts and secrets are never stored in a flat directory or unsecured table. Instead, every credential resides within a hardened, encrypted container known as a Safe.\n\nA Safe is both a logical governance boundary and a cryptographic isolation unit. Each Safe is encrypted with its own unique symmetric encryption key (Safe Key), which is itself wrapped by the Vault's Master Server Key. If an attacker could somehow access a raw storage block belonging to Safe A, they would possess zero ability to decrypt credentials stored in Safe B.\n\nFurthermore, the Safe is the fundamental unit of Access Control in the PAM ecosystem. Users and groups are assigned as Safe Members, and their capabilities are governed by a matrix of granular permissions. There is no such thing as a global 'read' permission in an enterprise Vault; an operator might have permission to initiate a brokered session through PSM (`Use accounts`) while being strictly denied the ability to view the plaintext password (`Retrieve accounts`). Understanding this permission matrix is the hallmark of professional PAM administration.",
          whyItExists:
            "Without granular Safes, access control would be binary (all-or-nothing). Safes enable departmental multi-tenancy, separation of duties between Windows, Unix, and Database teams, and strict cryptographic compartmentalization across sensitive environments.",
          architecture: {
            overview:
              "Safes partition the Vault database into isolated cryptographic compartments. Access is evaluated at the Safe boundary before any account object is exposed to a user.",
            componentResponsibilities: [
              {
                component: "Safe Container",
                role: "Encrypted volume storing account objects, file categories, historical password versions, and Safe-specific audit trails.",
                networkProtocols: "Vault Storage Engine Internal (AES-256)",
                securityBoundary: "Cryptographic & Access Control Boundary",
              },
              {
                component: "Safe Permissions Engine",
                role: "Evaluates inbound user requests against Safe ACLs, enforcing permission dependencies and operational restrictions.",
                networkProtocols: "TCP 1858 (Vault Kernel Execution)",
                securityBoundary: "Kernel Authorization Gate",
              },
              {
                component: "CPM Service Account (PasswordManager)",
                role: "Must be added as a member of every managed Safe with administrative rights (Add, Update, Unlock) to perform password rotations.",
                networkProtocols: "TCP 1858 from CPM host",
                securityBoundary: "Automated Management Principal",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "PAM Administrator",
                action: "Creates a new Safe `FINANCE-TIER0-SAFE`, specifies 90-day retention, and assigns accountable business owner.",
                channelOrProtocol: "PVWA Safes Management Console",
                verificationRule: "Vault generates a unique Safe Key, initializes encrypted directory structure, and logs creation event.",
              },
              {
                stepNumber: 2,
                actor: "PAM Administrator",
                action: "Assigns the local CPM worker (`PasswordManager`) as a Safe Member with full operational permissions.",
                channelOrProtocol: "Safe Members > Add Member",
                verificationRule: "CPM granted: Manage Safe, Add accounts, Update content, Update properties, Initiate CPM operations.",
              },
              {
                stepNumber: 3,
                actor: "PAM Administrator",
                action: "Assigns Active Directory group `AD_Finance_Operators` as Safe Members with strictly scoped permissions.",
                channelOrProtocol: "Safe Members > Add Directory Group",
                verificationRule: "Granted: `List accounts`, `Use accounts`. Denied: `Retrieve accounts`, `Delete accounts`.",
              },
              {
                stepNumber: 4,
                actor: "Finance Operator",
                action: "Logs in to PVWA, views accounts in `FINANCE-TIER0-SAFE`, and clicks 'Connect'.",
                channelOrProtocol: "PVWA Accounts Console",
                verificationRule: "Vault validates `Use accounts` permission; PSM establishes session. 'Show Password' button is disabled.",
              },
            ],
          },
          terminology: [
            {
              term: "Safe",
              definition: "A cryptographically isolated storage container within the Digital Vault that holds privileged accounts and files.",
              enterpriseContext: "Safes are designed around technology boundaries, department ownership, and risk tiers (e.g. WIN-T0-SAFE, DBA-PROD-SAFE).",
            },
            {
              term: "Use Accounts",
              definition: "Permission allowing a user to initiate transparent privileged sessions (via PSM) or run automated tasks without viewing plaintext.",
              enterpriseContext: "The gold standard for least-privilege; allows users to execute their jobs while remaining completely blind to the password.",
            },
            {
              term: "Retrieve Accounts",
              definition: "Permission allowing a user to view, copy, or extract the actual plaintext password or private key from the Vault.",
              enterpriseContext: "High-risk permission. Must be strictly restricted to emergency break-glass operators and protected by dual-control approval.",
            },
            {
              term: "List Accounts",
              definition: "Permission allowing a user to view metadata (account name, address, safe, platform) in the PVWA inventory.",
              enterpriseContext: "Prerequisite for almost all other operations; if a user lacks 'List accounts', the Safe appears completely empty.",
            },
            {
              term: "Safe Retention Policy",
              definition: "Configures how long the Vault retains historical password versions or deleted objects before permanent purge.",
              enterpriseContext: "Standard production policy is 30–90 days or last 5–10 versions to satisfy compliance audit requirements.",
            },
          ],
          administratorResponsibilities: [
            "Design Safe naming conventions reflecting environment, technology, and sensitivity (e.g., `APP-ENV-TIER`).",
            "Always add the CPM user (`PasswordManager`) to every Safe containing accounts requiring automated management.",
            "Enforce least privilege: never grant `Retrieve accounts` when `Use accounts` is sufficient for day-to-day operations.",
            "Periodically audit Safe member rosters and revoke access for departed employees or decommissioned groups.",
          ],
          configurationAndAdministration: [
            {
              name: "Retention Period (Days vs Versions)",
              settingOrObject: "Safe Properties > History Retention",
              description: "Configures whether deleted accounts and previous passwords are kept for N days or for the last N versions.",
              productionBestPractice: "Use 'Retain versions for X days' (typically 90 days) to prevent runaway database growth from frequent CPM rotations.",
            },
            {
              name: "CPM User Assignment",
              settingOrObject: "Safe Properties > Assigned CPM",
              description: "Selects which CPM node manages the credentials within this specific Safe.",
              productionBestPractice: "Bind Safes to the CPM located geographically closest to the target servers to avoid WAN latency and firewall traversal.",
            },
            {
              name: "Permission Dependency: Retrieve vs List",
              settingOrObject: "Safe Members Permissions Dialog",
              description: "Internal rule: granting 'Retrieve accounts' or 'Use accounts' requires 'List accounts' to be selected.",
              productionBestPractice: "Always verify that dependent permissions are checked simultaneously to avoid unexpected permission denial errors.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Create Production Safe",
              action: "In PVWA, navigate to Administration > Safes > Add Safe. Enter Safe Name `DBA-SAFE`, Description, and assign CPM.",
              expectedResult: "Safe created successfully and registered in Vault storage engine.",
              operatorNotes: "Safe names cannot contain spaces or special characters like `\\ / : * ? \" < > |`.",
            },
            {
              stepNumber: 2,
              title: "Assign CPM Management Permissions",
              action: "Add user `PasswordManager` as member of `DBA-SAFE` with full management permissions.",
              expectedResult: "CPM is authorized to scan and rotate credentials in this Safe.",
            },
            {
              stepNumber: 3,
              title: "Configure Tier-1 Operator Access",
              action: "Add directory group `AD_DBA_Operators`. Check `List accounts`, `Use accounts`, and `Initiate CP/PSM connections`.",
              expectedResult: "Operators can launch sessions through PSM but cannot copy plaintext passwords.",
            },
            {
              stepNumber: 4,
              title: "Validate Permission Boundary",
              action: "Log in as a member of `AD_DBA_Operators`, locate a database account, and attempt to click 'Show Password'.",
              expectedResult: "'Show Password' button is grayed out or displays 'Action not permitted by Safe permissions'.",
            },
          ],
          enterpriseScenario: {
            organization: "Meridian Financial Trust",
            businessContext:
              "Meridian Financial Trust manages $40B in assets across banking applications. An internal security audit cited the firm for high-risk Safe design: 450 database administrator accounts were pooled in a single monolithic Safe where all 80 IT staff held full `Retrieve accounts` permissions. An insider threat could dump every database master password in seconds. The PAM administrator must restructure the environment into segmented Safes (`DB-ORACLE-PROD`, `DB-SQL-PROD`, `DB-DEV`) with least-privilege member access.",
            governanceRequirements: [
              "Segregation of duties: Oracle DBAs cannot see SQL Server credentials.",
              "Zero plaintext retrieval for operational staff; all DBA tool access must route through PSM.",
              "Granular Safe-level audit trails retaining 180 days of version history for SOX compliance.",
            ],
          },
          failureScenarios: [
            {
              symptom: "User can log in to PVWA but sees zero Safes or accounts in the inventory.",
              rootCause: "User or their AD group is not listed as a member of any Safe, or lacks 'List accounts' permission.",
              securityImpact: "Staff cannot perform scheduled administrative duties; false positive ticket filed claiming Vault is down.",
              cyberArkCodeOrEvent: "ITATS028E",
            },
            {
              symptom: "CPM fails to rotate any account in the Safe: 'CACPM072E Safe access denied for PasswordManager'.",
              rootCause: "The administrator forgot to add the `PasswordManager` service account as a member of the new Safe.",
              securityImpact: "All accounts in the Safe fail automated rotation, violating compliance password age requirements.",
              cyberArkCodeOrEvent: "CACPM072E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Check Safe member list in PVWA Safes Management.",
              logFileOrConsole: "PVWA Safes Console > Select Safe > Members",
              remediation: "Verify that `PasswordManager` is present with Add, Update, and Initiate CPM permissions. Add if missing.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Verify user's effective permissions on the Safe.",
              logFileOrConsole: "Safe Members > Select User/Group > Edit Permissions",
              remediation: "Ensure 'List accounts' is checked if the user needs to view accounts, and 'Use accounts' is checked for PSM.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Inspect Vault audit log for access denial events.",
              logFileOrConsole: "italog.log / Safe History Report",
              remediation: "Search for `Action denied by Safe ACL` to identify which specific permission was withheld.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 11:05:12 ITATS028E Access denied. User dba_user does not have 'Retrieve accounts' permission on Safe DBA-SAFE.",
              explanation:
                "The Vault kernel successfully blocked dba_user from extracting the plaintext password because their Safe membership is restricted to 'Use accounts' only.",
            },
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\pm_error.log",
              sampleOutput:
                "CACPM072E Cannot perform password change. PasswordManager user is not authorized on Safe FIN-TIER0-SAFE (ITATS028E).",
              explanation:
                "The newly created Safe FIN-TIER0-SAFE did not have the CPM PasswordManager user added as a member. The administrator must add the CPM user to the Safe.",
            },
          ],
          instructorNotes: [
            "Never add individual human users to Safes when directory groups exist. Always assign Active Directory security groups to maintain scalability.",
            "Always name Safes logically: `[Department]-[Environment]-[Platform]` (e.g., `SEC-PROD-WIN`, `FIN-DEV-LINUX`).",
            "Be cautious with 'Delete accounts' permission; grant it only to Senior PAM Administrators to prevent accidental data loss.",
          ],
          securityImplications: [
            "Blast Radius Limitation: Compromise of an account in one Safe does not provide an attacker with cryptographic or logical access to other Safes.",
            "Least Privilege Enforcement: Distinguishing between 'Use' and 'Retrieve' eliminates unnecessary exposure of cleartext secrets.",
            "Regulatory Compliance: Independent Safe retention policies allow financial records to be retained for 7 years while temporary test environments purge after 7 days.",
          ],
          knowledgeCheck: [
            {
              id: "m04-q01",
              question: "Which Safe permission allows an engineer to launch a recorded RDP session through PSM without ever seeing the plaintext password?",
              options: [
                "Retrieve accounts",
                "Use accounts",
                "Unlock accounts",
                "Manage Safe",
              ],
              correctIndex: 1,
              explanation:
                "'Use accounts' allows transparent session initiation via PSM or application credential injection without exposing the plaintext password to the user. 'Retrieve accounts' allows viewing the actual password and should be restricted.",
              conceptTested: "Use Accounts vs Retrieve Accounts Least Privilege",
            },
            {
              id: "m04-q02",
              question: "A new Safe was created and accounts were onboarded, but the CPM is failing to rotate passwords with error CACPM072E. What is the most common administrator oversight?",
              options: [
                "The target servers do not have internet access.",
                "The administrator forgot to add the CPM service user (e.g., PasswordManager) as a member of the Safe.",
                "The Safe name contains more than 8 characters.",
                "The user license expired.",
              ],
              correctIndex: 1,
              explanation:
                "For the CPM to manage accounts in a Safe, the CPM service account (e.g. `PasswordManager`) must be explicitly added as a Safe Member with permissions to add, update, and change credentials.",
              conceptTested: "CPM Safe Membership Requirements",
            },
            {
              id: "m04-q03",
              question: "If a user is granted 'Use accounts' permission on a Safe but NOT 'List accounts', what will they experience in the PVWA?",
              options: [
                "They will see the accounts and be able to connect normally.",
                "They will not be able to see the accounts in the inventory at all, making it impossible to click Connect.",
                "The PVWA will display an error and log them out immediately.",
                "They will automatically receive administrative rights.",
              ],
              correctIndex: 1,
              explanation:
                "Due to permission dependencies, 'List accounts' is required to view account objects in the PVWA inventory. Without 'List accounts', the Safe appears empty to the user.",
              conceptTested: "Safe Permission Dependencies & Functional Visibility",
            },
          ],
          practicalExercise: {
            id: "m04-ex01",
            title: "Inspect Safe Governance and Permission Boundaries",
            scenario:
              "Navigate to the Safes console, inspect existing Safes (e.g. WIN-SAFE, DBA-SAFE), and verify that safe member permissions adhere to least privilege.",
            instructions: [
              "Navigate to the Safes console.",
              "Inspect the configured Safes, their assigned CPMs, and member rosters.",
              "Review the permission matrix for each member (confirm separation between operational users and administrators).",
              "Validate that the CPM worker has administrative rights while operational users are scoped to least privilege.",
            ],
            targetConsole: "safes",
            associatedLabId: "Lab 02 · Provision DBA-SAFE access",
            validationObjectiveId: "create-safe",
            validationCriteria:
              "The Safes console is reviewed and safe member permissions are verified.",
          },
          completionCriteria: [
            "Deconstructed Safe cryptographic architecture and retention policies.",
            "Evaluated the 10+ granular Safe permissions and dependency chains.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the Safe governance inspection in the Safes console.",
          ],
          references: [
            "CyberArk Privileged Access Security: Safe Design & Best Practice Architecture Guide",
            "NIST SP 800-53 Rev 5: AC-6 Least Privilege & SC-28 Protection of Information at Rest",
            "SANS Institute: Implementing Enterprise Vault Partitioning & Multi-Tenancy",
          ],
        },
      ],
    },
  ],
};
