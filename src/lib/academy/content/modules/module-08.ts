/**
 * SHADOWXLAB PAM ACADEMY — MODULE 08: WORKFLOWS
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_08: ClassCurriculum = {
  id: "module-08",
  number: "08",
  label: "MODULE 08",
  title: "Workflows",
  subtitle: "Dual Control, Access Requests & Ticketing System Integration",
  duration: "45 mins",
  level: "Associate",
  track: "admin-20",
  category: "Credential Lifecycle & Workflows",
  overview:
    "Master enterprise access request workflows, dual-control governance, and ITSM ticketing integration. Deconstruct the four-eyes principle (Maker-Checker), multi-level authorization hierarchies, time-windowed access grants, automated ticket verification with ServiceNow/Jira, and audited emergency break-glass procedures.",
  modules: [
    {
      id: "m08-core",
      number: "M8",
      title: "Dual Control & Access Workflows",
      description:
        "Technical configuration of Safe-level and Platform-level dual control, ticketing validation gates, approval routing, and emergency checkout bypasses.",
      lessons: [
        {
          id: "m08-l01",
          number: "8.1",
          title: "Dual Control Governance & Ticket Validation",
          subtitle: "Configuring multi-level approvals, time-bound access, and ITSM integration",
          estimatedMinutes: 25,
          learningObjectives: [
            "Implement Dual Control (Four-Eyes Principle) to eliminate unilateral access to high-risk credentials.",
            "Differentiate Safe-level permissions: 'Access without confirmation' vs 'Authorize account access'.",
            "Configure enterprise ticketing system integration (ServiceNow / Jira) validating Change Request numbers.",
            "Formulate break-glass emergency access protocols balancing operational agility with forensic auditability.",
          ],
          prerequisites: [
            "Module 03: Policies and Platforms.",
            "Module 04: Safes.",
            "Module 05: Accounts — Part 1.",
          ],
          conceptIntroduction:
            "In high-security environments, certain credentials represent existential risk to the enterprise. A Domain Administrator account, a root database password holding customer financial records, or a cryptographic signing key must never be accessible at the sole discretion of an individual engineer. Unilateral access enables rogue administrators, blackmailed insiders, or compromised accounts to inflict catastrophic damage before detection.\n\nEnterprise PAM mitigates this threat through **Dual Control (the Four-Eyes Principle)**. Under Dual Control, an operator cannot simply click 'Connect' or 'Show Password'. Instead, clicking the button launches an Access Request workflow. The operator must provide a legitimate business reason, enter an approved Change Management ticket number (e.g., `CHG-40291`), and specify the exact time window required (e.g., 'Today from 14:00 to 18:00').\n\nThe request is routed electronically to authorized Approvers (managers, security leads, or change advisory boards). Once an authorized approver reviews and approves the request, the Vault unblocks access—strictly within the approved timeframe. Every step of the request, justification, approval, and subsequent session is cryptographically bound into an indelible audit trail.",
          whyItExists:
            "Regulatory frameworks (SOX 404, PCI-DSS 7.1, ISO 27001) mandate that privileged access must be justified, time-bound, and independently authorized. Dual control guarantees that no single human has uncontrolled access to Tier-0 infrastructure.",
          architecture: {
            overview:
              "Dual Control leverages Safe permissions and PVWA notification daemons to enforce a strict separation between Requestors and Approvers.",
            componentResponsibilities: [
              {
                component: "Requestor Principal",
                role: "Operational engineer who requires temporary access to perform an approved change or incident triage.",
                networkProtocols: "HTTPS 443 to PVWA",
                securityBoundary: "Tier-1 / Tier-2 Operations Staff",
              },
              {
                component: "Approver Principal",
                role: "Manager, team lead, or SOC supervisor granted 'Authorize account access' permission on the target Safe.",
                networkProtocols: "HTTPS 443 / Email Notifications",
                securityBoundary: "Governance & Supervisory Authority",
              },
              {
                component: "ITSM Gateway (ServiceNow / Jira)",
                role: "External system of record validating that the submitted Change Request ticket is active, approved, and scheduled for the current time.",
                networkProtocols: "REST API HTTPS 443 over TLS",
                securityBoundary: "IT Service Management Boundary",
              },
              {
                component: "Digital Vault Kernel",
                role: "Enforces time window gates, holds pending requests, and releases access tokens only upon valid cryptographic approval signature.",
                networkProtocols: "TCP 1858 Internal Queue",
                securityBoundary: "Zero-Trust Enforcement Kernel",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Systems Engineer (Requestor)",
                action:
                  "Locates Tier-0 account in PVWA and clicks 'Connect'. System prompts: 'Confirmation Required'.",
                channelOrProtocol: "PVWA Web Console",
                verificationRule:
                  "Vault checks Safe ACL: user lacks 'Access without confirmation' permission.",
              },
              {
                stepNumber: 2,
                actor: "Systems Engineer (Requestor)",
                action:
                  "Submits request: Reason 'Emergency DB index rebuild', Ticket 'CHG-89211', Window 'Today 15:00 - 17:00'.",
                channelOrProtocol: "PVWA Request Workflow",
                verificationRule:
                  "PVWA queries ITSM API: confirms CHG-89211 is 'Approved' and current time is within change window.",
              },
              {
                stepNumber: 3,
                actor: "Infrastructure Manager (Approver)",
                action:
                  "Receives email alert, reviews request in PVWA Request Manager, and clicks 'Approve'.",
                channelOrProtocol: "PVWA Approvals Portal",
                verificationRule:
                  "Vault confirms Approver has 'Authorize account access' on Safe; request status updated to Approved.",
              },
              {
                stepNumber: 4,
                actor: "Systems Engineer (Requestor)",
                action:
                  "Re-opens account in PVWA and initiates PSM session cleanly within the authorized time window.",
                channelOrProtocol: "PSM Connection Component",
                verificationRule:
                  "Vault confirms request is approved and current wall-clock time is <= 17:00. Access granted.",
              },
            ],
          },
          terminology: [
            {
              term: "Dual Control",
              definition:
                "A workflow policy requiring at least two authorized individuals (Requestor and Approver) to enable access to a vaulted credential.",
              enterpriseContext:
                "Mandatory for Tier-0 Domain Admins, root passwords, and financial database superusers.",
            },
            {
              term: "Access Without Confirmation",
              definition:
                "A Safe permission that allows the member to check out credentials or launch sessions immediately without requiring managerial approval.",
              enterpriseContext:
                "Granted for low-risk non-production Safes; strictly withheld on production Tier-0 Safes.",
            },
            {
              term: "Authorize Account Access",
              definition:
                "A Safe permission that designates the member as an authorized Approver capable of granting or rejecting access requests.",
              enterpriseContext:
                "Typically assigned to team managers, IT directors, or SOC security leads.",
            },
            {
              term: "Time-Windowed Access",
              definition:
                "An access grant restricted to specific hours and calendar dates (e.g., Saturday between 02:00 and 06:00 UTC).",
              enterpriseContext:
                "Prevents operators from using an approval granted during a daytime maintenance window to access systems off-hours.",
            },
            {
              term: "Break-Glass Account",
              definition:
                "An emergency administrative credential configured to bypass Dual Control in the event of an outage of the ticketing system or network.",
              enterpriseContext:
                "Stored in physical tamper-evident envelopes; checkout generates high-severity SIEM alarms to the CISO.",
            },
          ],
          administratorResponsibilities: [
            "Enable Dual Control on all Safes housing Tier-0 and Tier-1 privileged accounts.",
            "Configure at least two redundant Approvers for every Safe to prevent single-point-of-failure approval bottlenecks.",
            "Integrate PVWA with corporate ITSM (ServiceNow) to enforce automated ticket validation rules.",
            "Audit all approved requests monthly against completed change management tickets for compliance reconciliation.",
          ],
          configurationAndAdministration: [
            {
              name: "Require Dual Control Approval",
              settingOrObject: "Master Policy > Require dual control password access approval",
              description: "Enforces dual control universally or via platform exceptions.",
              productionBestPractice:
                "Enable globally in Master Policy; create exceptions only for automated machine-to-machine application Safes.",
            },
            {
              name: "Ticketing System Validation",
              settingOrObject: "Platform > UI & Workflows > Ticketing System",
              description:
                "Configures mandatory ticket ID entry and regex validation (e.g. `^CHG-\\d{5,7}$`).",
              productionBestPractice:
                "Enforce ticket format regex on all platforms to prevent users from entering dummy text like 'test' or '123'.",
            },
            {
              name: "Multi-Level Approvals",
              settingOrObject: "Safe Properties > Number of Approvers Required",
              description:
                "Specifies whether 1, 2, or more distinct approvals are required before access is unlocked.",
              productionBestPractice:
                "Require 1 approver for standard production servers; require 2 distinct approvers for core banking roots.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Enable Dual Control on Safe",
              action:
                "In PVWA, edit `DBA-SAFE`, check 'Require dual control password access approval', and save.",
              expectedResult:
                "Dual control active. Members without confirmation rights will now be prompted for approval.",
            },
            {
              stepNumber: 2,
              title: "Assign Requestor & Approver Roles",
              action:
                "For `AD_DBA_Operators`, uncheck 'Access without confirmation'. For `AD_DBA_Managers`, check 'Authorize account access'.",
              expectedResult:
                "Operators cannot check out credentials without managerial sign-off; managers become authorized approvers.",
            },
            {
              stepNumber: 3,
              title: "Submit Access Request",
              action:
                "Log in as an operator, select target database account, enter Reason and Ticket `CHG-10294`, and submit.",
              expectedResult:
                "Request status changes to 'Pending Approval'; notification email sent to approvers.",
            },
            {
              stepNumber: 4,
              title: "Approve Request & Execute Session",
              action:
                "Log in as manager, navigate to Requests > Pending My Approval, review ticket, click Approve.",
              expectedResult:
                "Requestor refreshes console; 'Connect' button becomes active; session launches cleanly.",
            },
          ],
          enterpriseScenario: {
            organization: "Aegis Aerospace Systems",
            businessContext:
              "Aegis manufactures guidance avionics for satellite launch vehicles. A security assessment revealed that 45 propulsion engineers possessed standing, unmonitored root SSH access to telemetry control clusters. Following a near-miss incident where an engineer initiated an unscheduled firmware patch during launch rehearsals, leadership mandated Dual Control: all access requires prior approval from the Mission Director and a verified ticket in Jira Service Management.",
            governanceRequirements: [
              "Mandatory multi-party authorization: no individual can access telemetry systems unilaterally.",
              "Automated verification of Jira ticket status before access requests can be submitted.",
              "Immediate revocation of access upon expiration of the scheduled maintenance window.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "User receives error: 'Cannot connect: Request has expired or is outside approved time window'.",
              rootCause:
                "The operator attempted to launch the session after the requested 'To Time' had elapsed.",
              securityImpact:
                "Session correctly blocked, preventing unapproved after-hours access.",
              cyberArkCodeOrEvent: "ITATS032E",
            },
            {
              symptom: "Approver cannot see pending requests in PVWA Requests tab.",
              rootCause:
                "The approver's group lacks the 'Authorize account access' permission on the specific Safe housing the account.",
              securityImpact:
                "Approval bottleneck; maintenance work stalled because managers cannot approve requests.",
              cyberArkCodeOrEvent: "ITATS028E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Verify Requestor's Safe permissions in PVWA Safes console.",
              logFileOrConsole: "PVWA Safes > Select Safe > Members > Requestor Group",
              remediation:
                "Ensure 'Access without confirmation' is unchecked if Dual Control is intended, or checked if emergency direct access is required.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Verify Approver's Safe permissions in PVWA Safes console.",
              logFileOrConsole: "PVWA Safes > Select Safe > Members > Approver Group",
              remediation:
                "Check 'Authorize account access' on the Safe. Without this specific permission, users cannot see or approve requests.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Inspect active ticket status in external ITSM system.",
              logFileOrConsole: "ServiceNow / Jira API logs",
              remediation:
                "Confirm that ticket is in 'Approved' state and that system clocks between PVWA and ITSM are synchronized.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Windows\\Temp\\PVWA\\PVWA.App.log",
              sampleOutput:
                "Access Request ID 891 submitted by operator_alice on Safe DBA-SAFE. Approver Group: AD_DBA_Managers. Status: Pending Approval.",
              explanation:
                "Dual Control successfully trapped the checkout attempt and routed the request to the manager pool for independent authorization.",
            },
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 16:01:05 ITATS032E Access denied for user operator_alice. Approved request time window (14:00-16:00) has expired.",
              explanation:
                "Vault security kernel rejected the session connection attempt because the operator tried to connect after the approved maintenance window closed.",
            },
          ],
          instructorNotes: [
            "Never make the same user both a Requestor and their own Approver. The Vault will reject self-approval attempts by design.",
            "Configure notification email templates in PVWA Options so approvers receive direct email links to approve requests from mobile devices.",
            "For automated CI/CD pipelines, use Application Access Manager (AAM) or Secrets Hub rather than attempting to script human Dual Control workflows.",
          ],
          securityImplications: [
            "Eliminating Insider Threat: Dual control makes single-person sabotage or extortion virtually impossible on protected Tier-0 systems.",
            "Proof of Intent: In post-incident investigations, access requests provide definitive proof of who approved the access and what change ticket justified it.",
            "Time Boxing: Restricting access to 2–4 hour windows dramatically reduces the window of vulnerability during maintenance periods.",
          ],
          knowledgeCheck: [
            {
              id: "m08-q01",
              question:
                "Which Safe permission MUST a manager possess to be an authorized approver for dual-control requests in that Safe?",
              options: [
                "Manage Safe",
                "Authorize account access",
                "Access without confirmation",
                "Retrieve accounts",
              ],
              correctIndex: 1,
              explanation:
                "The 'Authorize account access' permission specifically grants the user or group the authority to review, approve, or reject dual-control requests submitted for accounts in that Safe.",
              conceptTested: "Safe Permissions for Dual Control Approval",
            },
            {
              id: "m08-q02",
              question:
                "An operator was granted an approved request for window 09:00 to 11:00. At 11:15, they attempt to click 'Connect'. What happens?",
              options: [
                "The session launches normally.",
                "The target server is rebooted.",
                "The Vault blocks the connection with an error indicating the request time window has expired (ITATS032E).",
                "The request is automatically extended for 24 hours.",
              ],
              correctIndex: 2,
              explanation:
                "Vault time-windowed access is strictly enforced. The moment the wall-clock time passes the requested 'To Time', access tokens are invalidated and the user must submit a new request.",
              conceptTested: "Time-Windowed Access Enforcement",
            },
            {
              id: "m08-q03",
              question:
                "What is the primary security objective of integrating PAM dual-control workflows with an external ITSM ticketing platform like ServiceNow?",
              options: [
                "To automatically delete the Vault database weekly.",
                "To ensure that privileged credentials cannot be accessed without an active, verified, and approved Change Request ticket.",
                "To increase network latency.",
                "To bypass Multi-Factor Authentication.",
              ],
              correctIndex: 1,
              explanation:
                "ITSM integration closes the governance loop by verifying that every access checkout maps to a legitimate, manager-approved change ticket in the enterprise system of record.",
              conceptTested: "ITSM Integration & Governance Justification",
            },
          ],
          practicalExercise: {
            id: "m08-ex01",
            title: "Execute Dual-Control Approved Session Workflow (Ticket to Termination)",
            objective:
              "Satisfy dual-control approval and change-ticket gating, launch a brokered PSM session, execute at least two audited commands, and terminate cleanly (Lab 06A).",
            scenario:
              "An emergency production maintenance window requires dual-control authorization and ticket CHG-12345 before connecting to WIN-SRV-01. Complete the ticket-gated session workflow and seal the recording.",
            prerequisites: [
              "Review Dual Control governance and ITSM ticket validation in Section 1–4.",
            ],
            startingState:
              "PSM connector is healthy; dual-control approval and a valid CHG-##### ticket are required before launching a session.",
            instructions: [
              "Open the PSM Operations console and select Administrator on WIN-SRV-01.",
              "Enable/verify Dual-Control Approval, enter change ticket `CHG-12345` and a documented business reason (>= 12 characters), and launch the brokered PSM session.",
              "Execute at least TWO allowed diagnostic commands in the terminal (`whoami` and `hostname`) and observe the live command timeline.",
              "Click 'Terminate' (or run `exit`) to close the session and seal the audit recording, then return to Learning Academy to validate all 6 Lab 06A objectives.",
            ],
            stepDetails: [
              {
                action:
                  "Open PSM Operations, select WIN-SRV-01 Administrator, confirm Dual-Control Approval, and enter ticket `CHG-12345` with a business reason.",
                explanation:
                  "Enforces separation of duties: no operator can access tier-0 targets without documented approval and a valid change ticket.",
                expectedResult:
                  "All preflight gates pass and an active brokered session initializes.",
              },
              {
                action: "Run `whoami` and `hostname` in the active PSM terminal.",
                explanation:
                  "Lab 06A requires >= 2 recorded commands to demonstrate live keystroke attribution.",
                expectedResult:
                  "Terminal displays simulated responses and records 2+ commands in the session timeline.",
              },
              {
                action: "Click 'Terminate' to end the session and seal the immutable recording.",
                explanation:
                  "Closing the session finalizes the audit evidence and releases the brokered proxy.",
                expectedResult:
                  "Session status changes to 'Terminated' and audit log records termination.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation:
                  "Evaluates all 6 Lab 06A objectives (approval, ticket, launch, >= 2 commands, timeline, termination).",
                expectedResult: "All 6/6 Lab 06A objectives pass (100/100).",
              },
            ],
            targetConsole: "psm",
            associatedLabId: "Lab 06A · Launch an approved session",
            validationObjectiveId: "obtain-approval",
            validationCriteria:
              "Dual-control approval, valid CHG ticket, brokered launch, >= 2 commands, and session termination verified (6/6 Lab 06A objectives).",
            troubleshootingHints: [
              {
                symptom: "Session launch is blocked with an approval, ticket, or reason error.",
                hint: "Verify ticket matches `CHG-12345` format, reason is at least 12 characters, and approval is granted.",
                correctiveAction:
                  "In PSM Operations, grant approval, enter `CHG-12345` and a 12+ character reason (e.g., 'Emergency server health check'), then launch.",
              },
              {
                symptom: "'Execute simulated commands' or 'Terminate session' remains pending.",
                hint: "Lab 06A requires at least 2 commands inside the session followed by terminating it.",
                correctiveAction:
                  "Run both `whoami` and `hostname` in the terminal, click Terminate, and re-validate.",
              },
            ],
            independentPractice: {
              title: "Verify Ticket Rejection & Audit Traceability",
              scenario:
                "Compliance wants proof that invalid ticket strings are rejected before a session can open.",
              goal: "Without guided steps, inspect Reports & Audit to confirm your approved session's ticket and termination entries, and test how PSM validates malformed ticket formats.",
              targetConsole: "audit",
              successCriteria: [
                "Verified the approved session launch and termination records appear in Reports & Audit.",
                "Confirmed malformed ticket inputs cannot bypass PSM preflight validation.",
              ],
            },
          },
          completionCriteria: [
            "Deconstructed Dual Control architecture and the Four-Eyes principle.",
            "Evaluated time-windowed access gates and ITSM ticket verification rules.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the dual-control session authorization in the PSM console.",
          ],
          references: [
            "NIST SP 800-53 Rev 5: AC-3 Access Enforcement & AC-5 Separation of Duties",
            "CyberArk Privileged Access Security: Dual Control & Approval Workflows Implementation Guide",
            "ITIL 4 Practice Guide: Change Enablement and Privileged Activity Authorization",
          ],
        },
      ],
    },
  ],
};
