/**
 * MODULE 04 — PVWA: WEB PORTAL FUNDAMENTALS
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 3 Hours | Day: 2 | Domain: Safes and Access Control (20%)
 * Practicals: Navigate a training instance; find a privileged account and inspect permitted properties; review a sample access-denied case.
 * Learning Outcome: Navigate core portal areas and understand account access workflows.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_04: ClassCurriculum = {
  id: "client-m04",
  number: "04",
  label: "MODULE 04",
  title: "PVWA — Web Portal Fundamentals",
  subtitle: "Interface Navigation, Account Filtering, Access Workflows & Access-Denied Diagnostics",
  duration: "3 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Safes and Access Control",
  overview:
    "Master the operational use and navigation of the Password Vault Web Access (PVWA) interface. Covers the PVWA layout, keyword search, faceted filtering, inspecting permitted account properties, executing access and checkout workflows, understanding administrative roles, and analyzing access-denied cases.",
  modules: [
    {
      id: "cm04-core",
      number: "M04",
      title: "PVWA — Web Portal Fundamentals",
      description:
        "Portal navigation, account inspection, access workflows, and troubleshooting access-denied events.",
      lessons: [
        {
          id: "cm04-l01",
          number: "4.1",
          title: "PVWA Navigation, Account Visibility & Access Workflows",
          subtitle:
            "Portal Layout, Search Filters, Property Inspection & Investigating Access Denials",
          estimatedMinutes: 180,
          learningObjectives: [
            "Navigate core portal areas and understand account access workflows.",
            "Utilize PVWA search bars, keywords, and faceted filters to locate privileged accounts rapidly.",
            "Inspect permitted account properties including Safe membership, platform binding, and address details.",
            "Understand the end-to-end access request, approval, and account utilization lifecycle.",
            "Recognize common access restrictions and investigate why an authorized user receives 'Access Denied'.",
            "Differentiate between user roles, operator permissions, and administrative entitlements within the portal.",
          ],
          prerequisites: [
            "Completion of Module 01, 02, and 03.",
            "Basic familiarity with modern web application interfaces and search mechanics.",
          ],
          conceptIntroduction:
            "The Password Vault Web Access (PVWA) is the primary graphical user interface for end users, administrators, and security auditors interacting with CyberArk. Through PVWA, users discover the accounts they are authorized to use, initiate brokered sessions, submit Dual Control access requests, and review operational dashboards. For administrators, PVWA provides configuration tools for Safes, platforms, and user permissions. For security teams, PVWA is an audit observation deck providing near real-time visibility into who accessed what credential, when, and for what approved business justification.",
          whyItExists:
            "Command-line or direct database interactions with a secure cryptographic vault are error-prone and dangerous for everyday operational staff. PVWA delivers a controlled, audited, role-based web interface that abstracts underlying cryptographic complexities while enforcing strict security policies (session timeouts, MFA, anti-CSRF protections, and role-based filtering).",
          architecture: {
            overview:
              "PVWA runs as an IIS/ASP.NET Core web application that communicates with the Digital Vault exclusively over TCP 1858. The interface does not maintain local state; all views, search indices, and permission checks are dynamically queried and validated by the Vault on every user interaction.",
            componentResponsibilities: [
              {
                component: "PVWA Web Tier",
                role: "Renders web pages, handles session management, and terminates TLS HTTPS (TCP 443).",
                networkProtocols: "HTTPS (TCP 443)",
                securityBoundary:
                  "Management web tier; protected by WAF and strict CORS/CSP headers.",
              },
              {
                component: "PVWA REST API / Engine",
                role: "Translates web requests into Vault protocol calls and formats responses for the UI.",
                networkProtocols: "TCP 1858 (Vault Protocol)",
                securityBoundary: "Authenticated service account (PVWAAppUser / PVWAGWUser).",
              },
              {
                component: "Digital Vault Access Evaluator",
                role: "Checks the requesting user's Safe ACLs and returns only the subset of accounts the user is authorized to see.",
                networkProtocols: "Internal Vault Kernel",
                securityBoundary: "Cryptographic Safe boundary; prevents metadata leakage.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "User",
                action: "Enters search query (e.g. 'WIN-SRV-01') into the PVWA search bar.",
                channelOrProtocol: "HTTPS (TCP 443)",
                verificationRule: "Query string sanitized against injection attacks.",
              },
              {
                stepNumber: 2,
                actor: "PVWA",
                action:
                  "Queries Vault database for matching accounts in Safes where the user has at least 'List accounts' permission.",
                channelOrProtocol: "TCP 1858",
                verificationRule: "Accounts in unauthorized Safes are completely invisible.",
              },
              {
                stepNumber: 3,
                actor: "PVWA",
                action:
                  "Renders Account Details pane showing Address, Username, Safe, and permitted action buttons (Connect, Show, Copy).",
                channelOrProtocol: "HTTPS (TCP 443)",
                verificationRule:
                  "Action buttons rendered only if user has corresponding rights (Use vs Retrieve).",
              },
              {
                stepNumber: 4,
                actor: "Audit Engine",
                action: "Records the search or account view event in the Vault audit journal.",
                channelOrProtocol: "Vault Audit Journal",
                verificationRule: "Audit log entry contains username, timestamp, and account ID.",
              },
            ],
          },
          terminology: [
            {
              term: "PVWA (Password Vault Web Access)",
              definition:
                "The web application interface used by human operators to search, view, check out, and manage privileged accounts.",
              enterpriseContext:
                "The daily workspace for both IT administrators and security teams.",
            },
            {
              term: "Account Filtering & Facets",
              definition:
                "UI mechanics allowing users to narrow down thousands of accounts by Safe, Platform, OS Type, or Management Status.",
              enterpriseContext:
                "Enables an admin to locate 'All Linux servers in EMEA' in seconds.",
            },
            {
              term: "Access Request (Dual Control)",
              definition:
                "A workflow where an operator requests temporary access to an account, requiring an authorized approver's sign-off.",
              enterpriseContext: "Mandatory for high-value root and domain admin accounts.",
            },
            {
              term: "Access Denied (ITATS006E / ITATS053E)",
              definition:
                "A Vault security denial resulting from missing Safe permissions, expired tickets, or invalid network client locations.",
              enterpriseContext:
                "The primary diagnostic symptom investigated by PAM helpdesk engineers.",
            },
            {
              term: "Account Properties",
              definition:
                "Metadata associated with an account object: Address (hostname/IP), Username, Platform ID, Safe Name, and Custom Tags.",
              enterpriseContext:
                "Essential for CPM and PSM to locate and authenticate against the target host.",
            },
          ],
          administratorResponsibilities: [
            "Configure intuitive search indexing and custom account properties for enterprise fleets.",
            "Investigate user access tickets and resolve permission mismatches.",
            "Ensure users only have visibility into accounts relevant to their job responsibilities.",
            "Verify session idle timeouts (e.g., 15 minutes) are enforced on the PVWA portal.",
          ],
          configurationAndAdministration: [
            {
              name: "PVWA Search Configuration",
              settingOrObject: "Options -> Search Properties",
              description:
                "Defines which account attributes (Username, Address, Safe, DeviceType) are searchable via the quick search bar.",
              productionBestPractice:
                "Index Address and Username for sub-second search response across large inventories.",
            },
            {
              name: "Session Inactivity Timeout",
              settingOrObject:
                "Administration -> Configuration Options -> Web Access -> SessionTimeout",
              description: "Automatically terminates idle web sessions after a specified duration.",
              productionBestPractice:
                "Enforce a 15-minute inactivity timeout in compliance with PCI-DSS and NIST standards.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Account Search and Inspection",
              action:
                "Log into PVWA, search for the target hostname or account name, and open the Account Details pane.",
              expectedResult:
                "Target account located; properties (Safe, Platform, Address, Username) verified.",
            },
            {
              stepNumber: 2,
              title: "Access Request Submission",
              action:
                "If account requires approval, click Request Access, select timeframe, and enter approved change ticket ID.",
              expectedResult: "Request submitted; status displays 'Pending Approval'.",
            },
            {
              stepNumber: 3,
              title: "Access-Denied Investigation",
              action:
                "When access is blocked, check the user's Safe membership and verify permissions in the Safes console.",
              expectedResult:
                "Root cause isolated (missing user membership or lack of 'Use accounts' permission).",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "A junior database administrator (dba_user) reports that they cannot locate the production Oracle database account in PVWA. A senior engineer investigates whether this is an account search filtering issue, a missing Safe permission, or an intentional security boundary.",
            governanceRequirements: [
              "Users must only see accounts for systems they are authorized to administer.",
              "All access requests must cite a verified change ticket number.",
              "Access denials must generate audit records without revealing sensitive account metadata.",
            ],
          },
          failureScenarios: [
            {
              symptom: "User searches for 'DBA-SAFE' or 'oracle' and receives 'No accounts found'.",
              rootCause:
                "User is not a member of Safe 'DBA-SAFE' or lacks the 'List accounts' permission.",
              securityImpact: "User cannot perform authorized job functions; work stoppage.",
              cyberArkCodeOrEvent: "ITATS053E",
            },
            {
              symptom: "User sees account in list but the 'Connect' button is disabled or missing.",
              rootCause:
                "User has 'List accounts' permission but lacks 'Use accounts' or 'Initiate privileged sessions' permission.",
              securityImpact: "User cannot initiate PSM session to target.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Verify user group membership in the Access Management console.",
              logFileOrConsole: "PVWA -> Access Management -> Users & Groups",
              remediation:
                "Ensure user belongs to the designated administrative group (e.g., DBA_Admins).",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Open the target Safe in the Safes console and inspect Members and Permissions.",
              logFileOrConsole: "PVWA -> Safes -> Safe Members",
              remediation:
                "Add user or user group with 'List accounts' and 'Use accounts' permissions.",
            },
          ],
          securityImplications: [
            "Granting broad 'Retrieve' rights in PVWA allows users to view plaintext passwords, bypassing PSM session isolation.",
            "Inadequate search filtering permissions may expose internal server naming conventions to unauthorized users.",
            "Failing to review access-denied trends may mask brute-force or unauthorized reconnaissance attempts.",
          ],
          knowledgeCheck: [
            {
              id: "cm04-q01",
              question:
                "If a user can see an account name and server address in PVWA but cannot click 'Connect' or launch a session, which permission is missing?",
              options: [
                "The user lacks 'List accounts' permission.",
                "The user has 'List accounts' but lacks 'Use accounts' (or 'Initiate privileged sessions') permission.",
                "The user has 'Retrieve accounts' but lacks Windows Domain Admin rights.",
                "The target host has disconnected from the Internet.",
              ],
              correctIndex: 1,
              explanation:
                "'List accounts' allows an operator to see the account object and metadata in search results, but 'Use accounts' is strictly required to consume the credential or initiate a proxied PSM session.",
              conceptTested: "List vs Use Permissions in PVWA",
            },
            {
              id: "cm04-q02",
              question:
                "When a user who is NOT a member of Safe 'FIN-PROD-SAFE' searches for an account stored inside that Safe, what does PVWA display?",
              options: [
                "The account is displayed with a red lock icon and password asterisks.",
                "The account does not appear in the search results at all ('No accounts found').",
                "A pop-up warning alerts the user that they are committing a security violation.",
                "PVWA displays the server IP address but obscures the username.",
              ],
              correctIndex: 1,
              explanation:
                "CyberArk enforces complete Safe isolation. If a user is not a member of a Safe with at least 'List accounts' rights, the accounts in that Safe are entirely invisible, preventing reconnaissance.",
              conceptTested: "Safe Isolation and Search Visibility",
            },
            {
              id: "cm04-q03",
              question:
                "What is the recommended remediation when an authorized database administrator receives an 'Access Denied' error trying to view an account in DBA-SAFE?",
              options: [
                "Grant the user full Digital Vault Administrator rights.",
                "Disable CyberArk Vault security filters on the target database.",
                "Navigate to Safes -> DBA-SAFE -> Members, and grant the user's role group 'List' and 'Use' permissions.",
                "Instruct the user to log in locally with the physical console keyboard.",
              ],
              correctIndex: 2,
              explanation:
                "Following least privilege, the administrator should update the Safe ACL in the Safes console to grant the user's group the specific permissions required ('List' and 'Use') without granting excessive administrative rights.",
              conceptTested: "Access Denied Troubleshooting",
            },
          ],
          practicalExercise: {
            id: "cm04-ex01",
            title: "PVWA Navigation, Account Inspection & Access-Denied Analysis",
            objective:
              "Navigate the Accounts console, search for target accounts, inspect properties, and investigate an access-denied condition.",
            scenario:
              "Navigate the PVWA Accounts view to locate the Administrator account on WIN-SRV-01, inspect its Safe and platform properties, and analyze why unauthorized access to restricted accounts is blocked.",
            prerequisites: ["Completion of Module 01-03"],
            startingState: "Configured accounts inventory in Accounts console.",
            instructions: [
              "Navigate to the Accounts console.",
              "Search for 'Administrator' or filter by platform 'Windows Server Local'.",
              "Select the account to inspect its permitted properties (Address: WIN-SRV-01, Safe: WIN-SAFE).",
              "Review the access restrictions and verify how unauthorized accounts are protected.",
              "Validate the operational exercise.",
            ],
            stepDetails: [
              {
                action: "Navigate to Accounts Console",
                explanation: "Open the account inventory interface.",
                expectedResult: "Account grid loaded with search bar and filter facets.",
              },
              {
                action: "Inspect Administrator Account Properties",
                explanation: "Review Username, Address, Safe name, and Platform binding.",
                expectedResult: "Account details pane rendered.",
              },
              {
                action: "Analyze Access-Denied Case",
                explanation:
                  "Review Safe permissions to verify why users without membership cannot access accounts.",
                expectedResult: "Access isolation boundary validated.",
              },
            ],
            targetConsole: "accounts",
            associatedLabId: "Client M04 · PVWA Web Portal Fundamentals",
            validationObjectiveId: "obj-cm04-pvwa",
            validationCriteria:
              "Search and inspect privileged accounts in the Accounts console and analyze access-denied controls.",
            troubleshootingHints: [
              {
                symptom: "Account search bar returns empty list.",
                hint: "Clear any active search filters or check that 'All Safes' is selected.",
                correctiveAction: "Reset the filter facet to show all available accounts.",
              },
            ],
            independentPractice: {
              title: "Independent Account Property Review",
              scenario:
                "Locate account 'svc_backup' on 'WIN-SRV-02' and document its Safe and Platform.",
              goal: "Confirm proficiency with PVWA search and property inspection.",
              targetConsole: "accounts",
              successCriteria: [
                "Locate svc_backup on WIN-SRV-02.",
                "Identify its Safe membership and CPM management state.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Inspect account properties in the Accounts console.",
            "Complete independent account property review.",
          ],
          references: [
            "CyberArk PVWA User Guide & Portal Navigation",
            "CyberArk Access Control Model & Permissions Reference",
            "NIST SP 800-53: AC-3 Access Enforcement",
          ],
        },
      ],
    },
  ],
};
