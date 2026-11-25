/**
 * MODULE 11 — ADMINISTRATION BEST PRACTICES
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 2 Hours | Day: 5 | Domain: Fundamentals and Architecture (or Governance)
 * Learning Outcome: Apply foundational operational and governance practices to common PAM scenarios.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_11: ClassCurriculum = {
  id: "client-m11",
  number: "11",
  label: "MODULE 11",
  title: "Administration Best Practices",
  subtitle:
    "Governance Lifecycle, Hardening, Health Checks & Enterprise Scenarios (Leavers & Break-Glass)",
  duration: "2 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Fundamentals and Architecture",
  overview:
    "Establishes operational and administrative best practices for managing an enterprise CyberArk deployment. Covers privileged account lifecycle governance, account ownership attestation, security hardening (least privilege, MFA, separation of duties), routine operational procedures (daily health checks, failed rotation triage, session reviews), and managing four critical enterprise scenarios: employee leaver access revocation, service account dependency failures, suspicious login triage, and emergency break-glass procedures.",
  modules: [
    {
      id: "cm11-core",
      number: "M11",
      title: "Administration Best Practices",
      description:
        "Lifecycle governance, operational hardening, health check routines, and enterprise emergency scenarios.",
      lessons: [
        {
          id: "cm11-l01",
          number: "11.1",
          title: "Governance Lifecycle, Operational Procedures & Enterprise Scenarios",
          subtitle:
            "Account Ownership, Security Hardening, Routine Health Checks, Leaver Revocation & Break-Glass",
          estimatedMinutes: 120,
          learningObjectives: [
            "Apply foundational operational and governance practices to common PAM scenarios.",
            "Define the privileged account governance lifecycle from initial onboarding through periodic recertification and decommissioning.",
            "Implement security hardening controls: Multi-Factor Authentication (MFA), least privilege, and administrative separation of duties.",
            "Establish daily and weekly operational routines: component health checks, failed password management review, and session auditing.",
            "Execute enterprise offboarding procedures to revoke leaver access immediately without disrupting business operations.",
            "Manage emergency 'break-glass' access workflows for critical infrastructure during major network or identity outages.",
          ],
          prerequisites: [
            "Completion of Module 01 through Module 10.",
            "Understanding of IT service management (ITSM) and security governance frameworks.",
          ],
          conceptIntroduction:
            "Deploying PAM technology is only half the battle; maintaining long-term security posture requires rigorous operational governance. Privileged accounts are dynamic: employees change roles, servers are decommissioned, third-party contractors leave, and emergency incidents arise. Administration best practices ensure that access permissions remain strictly aligned with current business needs, that components are monitored proactively, and that emergency procedures (such as break-glass access) are tested and documented before disaster strikes.",
          whyItExists:
            "Without disciplined administrative routines, PAM systems suffer from 'entitlement rot'—stale accounts accumulate in Safes, departed employees retain permissions, and failed password rotations go unnoticed until a system fails. Best practices establish a predictable, audited operational cadence that keeps the PAM environment secure, compliant, and healthy.",
          architecture: {
            overview:
              "Operational governance spans administrative controls across the entire CyberArk ecosystem. It interfaces with external identity providers (for leaver de-provisioning), ticketing systems (for change management), and physical vaults (for break-glass keys).",
            componentResponsibilities: [
              {
                component: "Access Management (PVWA)",
                role: "Central console for reviewing user entitlements, Safe memberships, and administrative roles.",
                networkProtocols: "HTTPS (TCP 443)",
                securityBoundary: "Role-based administrative tier.",
              },
              {
                component: "System Health Dashboard",
                role: "Provides real-time operational status, memory, and connectivity metrics for Vault, CPM, and PSM.",
                networkProtocols: "Internal telemetry over TCP 1858",
                securityBoundary: "Operational monitoring tier.",
              },
              {
                component: "Emergency Break-Glass Safe",
                role: "Dedicated Safe containing master emergency credentials protected by Dual Control and high-priority alerting.",
                networkProtocols: "TCP 1858 (Vault)",
                securityBoundary: "Maximum isolation tier; monitored directly by SOC.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "HR / Identity Provider",
                action: "Flags an employee departure (leaver) in the corporate directory.",
                channelOrProtocol: "SCIM / Active Directory Sync",
                verificationRule: "User account disabled in primary IdP.",
              },
              {
                stepNumber: 2,
                actor: "PAM Administrator",
                action:
                  "Audits user's direct Safe memberships and removes them from all PAM groups.",
                channelOrProtocol: "PVWA Access Management",
                verificationRule: "User completely loses access to all Safes and accounts.",
              },
              {
                stepNumber: 3,
                actor: "CPM Service",
                action:
                  "Immediately rotates any credentials that the departing user had checked out or retrieved.",
                channelOrProtocol: "Native CPM Change",
                verificationRule:
                  "Prevents departing employee from retaining knowledge of past passwords.",
              },
              {
                stepNumber: 4,
                actor: "Audit Journal",
                action: "Records the membership revocation and post-departure credential rotation.",
                channelOrProtocol: "Vault Audit Journal",
                verificationRule: "Compliance evidence archived for annual access review.",
              },
            ],
          },
          terminology: [
            {
              term: "Privileged Lifecycle Governance",
              definition:
                "The end-to-end management of an account from discovery, onboarding, policy assignment, and periodic attestation, to de-provisioning and archiving.",
              enterpriseContext:
                "Ensures no unmanaged or orphaned accounts exist in the enterprise.",
            },
            {
              term: "Break-Glass (Emergency Access)",
              definition:
                "A controlled, documented procedure for accessing highest-privilege accounts during catastrophic emergencies when standard PAM access paths are unavailable.",
              enterpriseContext:
                "Used when the corporate IdP/SSO is offline and administrators must reach domain controllers directly.",
            },
            {
              term: "Entitlement Attestation / Review",
              definition:
                "The formal, periodic sign-off by a manager or resource custodian confirming that an employee's access to a Safe is still required.",
              enterpriseContext: "A mandatory requirement for SOX, SOC2, and ISO 27001 audits.",
            },
            {
              term: "Leaver Procedure",
              definition:
                "The operational checklist executed when an employee resigns or is terminated, ensuring immediate revocation of all privileged access and rotation of known secrets.",
              enterpriseContext: "Prevents insider sabotage or credential theft by former staff.",
            },
            {
              term: "Health Check Routine",
              definition:
                "A daily inspection of component availability, failed password rotations, and unassigned discovery jobs.",
              enterpriseContext: "Guarantees 99.99% PAM operational uptime.",
            },
          ],
          administratorResponsibilities: [
            "Perform daily inspections of the PVWA System Health dashboard and remediate any warning indicators.",
            "Review failed password management reports every morning and address all failed verify/change events.",
            "Execute immediate access revocation when notified of employee departures.",
            "Participate in semi-annual break-glass drills to verify emergency credential access procedures.",
          ],
          configurationAndAdministration: [
            {
              name: "Break-Glass Safe Configuration",
              settingOrObject: "Safe: BREAK-GLASS-SAFE",
              description:
                "Stores emergency root and domain break-glass passwords with Dual Control, mandatory ticket ID, and SMS/email alerts to CISO.",
              productionBestPractice:
                "Require two executive authorizers to release break-glass credentials.",
            },
            {
              name: "Daily Operations Checklist",
              settingOrObject: "Standard Operating Procedure (SOP)",
              description:
                "Mandates daily checks: (1) System Health green, (2) Zero CPM lockouts > 24h, (3) Backup jobs verified.",
              productionBestPractice:
                "Formal sign-off by on-duty PAM engineer every morning at 09:00.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Daily System Health Check",
              action:
                "Log into PVWA -> System Health. Confirm Vault, CPM, and PSM instances display green status.",
              expectedResult: "All core services operational; no resource exhaustion.",
            },
            {
              stepNumber: 2,
              title: "Leaver Access Revocation",
              action:
                "When employee leaves, navigate to Access Management -> search user -> remove from all Safe memberships.",
              expectedResult: "Access revoked; audit event logged.",
            },
            {
              stepNumber: 3,
              title: "Emergency Break-Glass Drill",
              action:
                "Submit emergency request for break-glass account; verify that executive approver receives alert and approval workflow triggers.",
              expectedResult: "Emergency access verified with full audit trail.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "A senior infrastructure engineer has resigned to join a competitor. Security policy mandates immediate revocation of all their PAM entitlements and an emergency rotation of all privileged accounts the engineer accessed in the past 14 days.",
            governanceRequirements: [
              "Immediate removal of leaver from all Safe ACLs.",
              "Identification and rotation of all accounts accessed by the leaver within the past 14 days.",
              "Documentation of compliance sign-off in the access governance log.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Terminated contractor logs in remotely via PAM 3 days after contract end date.",
              rootCause:
                "HR notification delayed and contractor's Safe group membership was never revoked.",
              securityImpact: "Unauthorized access by non-employee; severe compliance violation.",
              cyberArkCodeOrEvent: "AUDIT-LEAVER-ACCESS-DETECTED",
            },
            {
              symptom:
                "Network outage takes down corporate SSO; admins cannot log into PVWA to fix core routers.",
              rootCause:
                "No emergency local break-glass procedure established; total operational paralysis.",
              securityImpact: "Extended network downtime affecting all customer transactions.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Verify user account status in corporate Active Directory / IdP.",
              logFileOrConsole: "IdP Admin Console",
              remediation: "Ensure directory account is disabled immediately.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Audit user's recent activity in PVWA Reports & Audit console.",
              logFileOrConsole: "PVWA -> Reports & Audit -> Filter by Username",
              remediation:
                "Trigger CPM Change on all accounts accessed by the user within the last 14 days.",
            },
          ],
          securityImplications: [
            "Failing to execute prompt leaver offboarding is a primary vector for insider intellectual property theft.",
            "Untested break-glass procedures frequently fail during real crises, leaving engineering teams stranded.",
            "Allowing failed CPM rotations to persist creates a backlog of desynchronized accounts that lock out operators during outages.",
          ],
          knowledgeCheck: [
            {
              id: "cm11-q01",
              question:
                "When an IT administrator departs an organization, what two immediate actions should the PAM team execute to ensure security?",
              options: [
                "Reboot the Digital Vault and delete the user's desktop computer.",
                "Revoke the user's Safe memberships immediately and rotate the credentials of any accounts the user accessed recently.",
                "Send an email asking the departing employee to promise they did not copy passwords.",
                "Disable all CyberArk component services for 48 hours.",
              ],
              correctIndex: 1,
              explanation:
                "Best practice requires immediately revoking all Safe and group memberships, followed by rotating the passwords of any accounts the departed employee had checked out or accessed, ensuring no stale knowledge persists.",
              conceptTested: "Leaver Deprovisioning & Password Invalidation",
            },
            {
              id: "cm11-q02",
              question:
                "What is the primary purpose of an emergency 'Break-Glass' account in a PAM environment?",
              options: [
                "To allow junior interns to practice administrative tasks without supervision.",
                "To provide an emergency, highly-audited access mechanism to critical infrastructure during major disasters when standard SSO or PAM paths are unavailable.",
                "To bypass all audit logging during high-speed database maintenance.",
                "To play video games on the corporate server.",
              ],
              correctIndex: 1,
              explanation:
                "Break-Glass accounts are emergency fail-safes reserved for catastrophic situations (such as primary identity provider outages). They provide emergency access under strict auditability and high-priority alerts.",
              conceptTested: "Emergency Break-Glass Governance",
            },
            {
              id: "cm11-q03",
              question:
                "Which daily operational routine is essential to prevent accounts from accumulating out-of-sync or locked states?",
              options: [
                "Deleting all audit records older than 24 hours.",
                "Reviewing the PVWA System Health dashboard and inspecting the CPM Operations console for failed rotations.",
                "Changing the master encryption keys of the Digital Vault every morning.",
                "Disabling firewalls between client laptops and the Vault.",
              ],
              correctIndex: 1,
              explanation:
                "A daily inspection of System Health and the CPM failed-rotation queue ensures that component connectivity issues, network drops, or password desynchronizations are caught and remediated proactively.",
              conceptTested: "Operational Health Check Routines",
            },
          ],
          practicalExercise: {
            id: "cm11-ex01",
            title: "Enterprise Governance Review, Leaver De-provisioning & Emergency Access",
            objective:
              "Execute administrative governance procedures: review user entitlements, execute a simulated leaver access revocation, and verify emergency break-glass workflow parameters.",
            scenario:
              "Navigate to the Access Management console to audit active user entitlements. Review user 'dba_user', simulate an offboarding review, verify emergency access governance, and validate live simulator state.",
            prerequisites: ["Completion of Module 01-10"],
            startingState: "Configured users, groups, and Safes in simulator.",
            instructions: [
              "Navigate to Access Management console.",
              "Review the list of users, roles, and group memberships.",
              "Inspect member 'dba_user' and audit their Safe access boundaries.",
              "Review the emergency break-glass procedure documentation.",
              "Validate the operational governance exercise.",
            ],
            stepDetails: [
              {
                action: "Navigate to Access Management",
                explanation: "Open user and group governance interface.",
                expectedResult: "User directory and role assignments displayed.",
              },
              {
                action: "Audit User Entitlements",
                explanation: "Review dba_user Safe memberships and permissions.",
                expectedResult: "Entitlement baseline verified.",
              },
              {
                action: "Verify Governance Controls",
                explanation: "Confirm least privilege and emergency access policies.",
                expectedResult: "Administrative governance verified.",
              },
            ],
            targetConsole: "access",
            associatedLabId: "Lab 02 · Configure Safe permissions",
            validationObjectiveId: "obj-cm11-governance",
            validationCriteria:
              "Audit user entitlements, verify least-privilege boundaries, and validate governance controls in the simulator.",
            troubleshootingHints: [
              {
                symptom: "Access console displays permission error.",
                hint: "Confirm you are operating as an administrator with governance review rights.",
                correctiveAction: "Verify admin role in simulator.",
              },
            ],
            independentPractice: {
              title: "Independent Governance Checklist Review",
              scenario:
                "Draft a daily 3-point morning operational checklist for a PAM operations engineer.",
              goal: "Confirm understanding of daily operational maintenance responsibilities.",
              targetConsole: "access",
              successCriteria: [
                "Include PVWA System Health dashboard check.",
                "Include CPM failed rotations review and resolution.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Complete the governance entitlement review in the Access console.",
            "Demonstrate understanding of leaver revocation and emergency break-glass procedures.",
          ],
          references: [
            "CyberArk Privilege Cloud Security Hardening Guidelines",
            "NIST SP 800-53: AC-2 Account Management & IA-2 Identification and Authentication",
            "Center for Internet Security (CIS) Controls — Control 06: Access Control Management",
          ],
        },
      ],
    },
  ],
};
