/**
 * MODULE 12 — CAPSTONE PROJECT AND ASSESSMENT
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 3 Hours | Day: 5 | Domain: Capstone Project (20%)
 * Scenario: Design a basic PAM workflow for Windows and Linux administrator accounts.
 * Exact 5 Tasks:
 * 1. Identify accounts and platforms
 * 2. Design a Safe structure and permissions
 * 3. Describe onboarding and password management
 * 4. Review audit evidence and troubleshoot an access issue
 * 5. Document configuration decisions and security controls
 *
 * Assessment: Knowledge check, practical demonstration or case study, capstone review.
 * Learning Outcome: Demonstrate foundational understanding through a structured PAM scenario.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_12: ClassCurriculum = {
  id: "client-m12",
  number: "12",
  label: "MODULE 12",
  title: "Capstone Project and Assessment",
  subtitle: "Comprehensive PAM Workflow Design, 5-Task Execution & Certification Review",
  duration: "3 Hours",
  level: "Associate",
  track: "client-12",
  category: "Capstone Project",
  overview:
    "The culminating capstone project and comprehensive assessment for the CyberArk Basic Training programme. Synthesizes all foundational skills acquired across Modules 01 through 11. Learners execute five structured project deliverables to design, configure, troubleshoot, and document an end-to-end privileged access workflow securing Windows and Linux administrator accounts. Concludes with a comprehensive multi-domain knowledge check, practical demonstration review, and automated generation of the Capstone Competency Report against the 70% certification threshold.",
  modules: [
    {
      id: "cm12-core",
      number: "M12",
      title: "Capstone Project and Assessment",
      description:
        "5-task capstone project, end-to-end PAM workflow validation, comprehensive evaluation, and competency certification.",
      lessons: [
        {
          id: "cm12-l01",
          number: "12.1",
          title: "Capstone PAM Workflow Design & Comprehensive Certification Assessment",
          subtitle: "5 Project Tasks, End-to-End Simulation Validation & Multi-Domain Evaluation",
          estimatedMinutes: 180,
          learningObjectives: [
            "Demonstrate foundational understanding through a structured PAM scenario.",
            "Task 1: Identify target accounts, addresses, platform policies, and custodians for Windows and Linux targets.",
            "Task 2: Design a least-privilege Safe structure with granular ACLs separating operator and administrator roles.",
            "Task 3: Describe and execute onboarding parameters and CPM password lifecycle rotation schedules.",
            "Task 4: Review simulated audit evidence, isolate root causes of access failures, and verify remediation.",
            "Task 5: Document configuration decisions, Zero Trust controls, MFA requirements, and compliance posture.",
            "Pass the comprehensive multi-domain knowledge check and achieve >= 70% on the final Capstone Evaluation Report.",
          ],
          prerequisites: [
            "Successful completion of all prerequisite modules (Modules 01 through 11).",
            "Working proficiency across Accounts, Safes, CPM, PSM, and Reports & Audit consoles.",
          ],
          conceptIntroduction:
            "The Capstone Project represents the practical proof of your operational capability as a PAM professional. Real-world security does not test individual concepts in isolation; you must know how account onboarding links to platform policies, how platform policies trigger CPM rotations, how Safe ACLs gate PSM sessions, how audit records provide non-repudiation, and how to methodically troubleshoot failures when things go wrong. In this capstone, you will design and validate a complete PAM access workflow for an enterprise environment spanning both Windows and Linux infrastructure.",
          whyItExists:
            "Certification without hands-on validation creates paper credentials that fail during real enterprise deployments. The Capstone Project ensures that every graduate of the CyberArk Basic Training programme has personally executed, troubleshot, and documented the exact tasks required in production PAM operations.",
          architecture: {
            overview:
              "The Capstone workflow integrates all core CyberArk components into a unified defense architecture: User -> PVWA -> Vault -> CPM & PSM -> Windows & Linux Target Hosts.",
            diagramAscii: `
+-----------------------------------------------------------------------------------+
|                        CAPSTONE PAM WORKFLOW ARCHITECTURE                         |
|                                                                                   |
|                      [ PAM Administrator / Operator ]                             |
|                                     |                                             |
|                               HTTPS (443)                                         |
|                                     v                                             |
|                             +---------------+                                     |
|                             |     PVWA      |                                     |
|                             +---------------+                                     |
|                                     |                                             |
|                                  TCP 1858                                         |
|                                     v                                             |
|                       +---------------------------+                               |
|                       |       DIGITAL VAULT       |                               |
|                       |   [WIN-SAFE] [LINUX-SAFE] |                               |
|                       +---------------------------+                               |
|                              |             |                                      |
|                     TCP 1858 |             | TCP 1858                             |
|                              v             v                                      |
|                       +-------------+ +-------------+                             |
|                       |     CPM     | |     PSM     |                             |
|                       +-------------+ +-------------+                             |
|                              |               |                                    |
|                   SMB / SSH  |               |  RDP / SSH                         |
|                  Management  |               |  Monitored Proxies                 |
|                              v               v                                    |
|                       +-----------------------------+                             |
|                       |       TARGET SYSTEMS        |                             |
|                       |  WIN-SRV-01   LIN-DB-01     |                             |
|                       +-----------------------------+                             |
+-----------------------------------------------------------------------------------+`,
            componentResponsibilities: [
              {
                component: "Task 1: Account Inventory",
                role: "Catalogs Windows local admin and Linux admin accounts, binding to WinServerLocal and UnixSSH platforms.",
                securityBoundary: "Target hosts and account metadata.",
              },
              {
                component: "Task 2: Safe Structure",
                role: "Establishes WIN-SAFE and LINUX-SAFE with least-privilege ACLs (List, Use; no excessive Retrieve).",
                securityBoundary: "Digital Vault Safe boundaries.",
              },
              {
                component: "Task 3: Onboarding & CPM",
                role: "Configures 30-day automated rotation, reconcile account linkages, and verification schedules.",
                securityBoundary: "Central Policy Manager automation.",
              },
              {
                component: "Task 4: Audit & Troubleshooting",
                role: "Analyzes audit event logs, isolates access-denied and lockout root causes, and validates recovery.",
                securityBoundary: "Reports & Audit and Troubleshooting workbench.",
              },
              {
                component: "Task 5: Documentation",
                role: "Documents Zero Trust controls, MFA requirements, and compliance architecture.",
                securityBoundary: "Executive architecture deliverable.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Learner",
                action:
                  "Executes Task 1: Identifies accounts and maps platform policies for Windows and Linux hosts.",
                channelOrProtocol: "Accounts Console",
                verificationRule: "Target accounts cataloged with valid properties.",
              },
              {
                stepNumber: 2,
                actor: "Learner",
                action:
                  "Executes Task 2: Configures Safe permissions enforcing least privilege and separation of duties.",
                channelOrProtocol: "Safes Console",
                verificationRule:
                  "Least privilege verified (no excessive Retrieve rights on operator role).",
              },
              {
                stepNumber: 3,
                actor: "Learner",
                action:
                  "Executes Task 3: Verifies CPM password management parameters and reconciliation workflow.",
                channelOrProtocol: "CPM Console",
                verificationRule: "Verification, change, and reconcile operations operational.",
              },
              {
                stepNumber: 4,
                actor: "Learner",
                action:
                  "Executes Task 4: Investigates simulated access incident and remediates error condition.",
                channelOrProtocol: "Troubleshooting Console",
                verificationRule: "Root cause isolated and corrective remediation verified.",
              },
              {
                stepNumber: 5,
                actor: "Learner",
                action:
                  "Executes Task 5: Synthesizes governance documentation and submits Capstone for evaluation.",
                channelOrProtocol: "Academy Workspace",
                verificationRule: "Competency Report generated against 70% passing threshold.",
              },
            ],
          },
          terminology: [
            {
              term: "Capstone Evaluation",
              definition:
                "A holistic assessment combining practical simulator execution, knowledge checkpoints, and forensic troubleshooting to measure operational competence.",
              enterpriseContext:
                "The final qualification requirement for the CyberArk Basic Training credential.",
            },
            {
              term: "Competency Report",
              definition:
                "An automated report evaluating candidate performance across the 5 project tasks and 5 assessment domains against the 70% threshold.",
              enterpriseContext:
                "Submitted to training managers and certification bodies for formal course sign-off.",
            },
            {
              term: "End-to-End Workflow",
              definition:
                "A complete operational cycle spanning discovery, vaulting, access control, session brokering, rotation, and audit review.",
              enterpriseContext: "The true measure of a complete PAM deployment.",
            },
            {
              term: "Remediation Verdict",
              definition:
                "A structured outcome indicating whether the candidate has achieved 'CERTIFIED' status or requires targeted remediation on specific domains.",
              enterpriseContext:
                "Provides clear guidance on areas requiring review before re-attempting certification.",
            },
          ],
          administratorResponsibilities: [
            "Complete all five required project tasks with thorough, verifiable configuration evidence.",
            "Verify that every practical activity passes deterministic simulator evaluation.",
            "Demonstrate mastery of troubleshooting protocols and log forensics.",
            "Submit the completed Capstone Evaluation for final competency review.",
          ],
          configurationAndAdministration: [
            {
              name: "5-Task Project Specification",
              settingOrObject: "Capstone Workbench",
              description:
                "Mandates execution of Tasks 1 through 5 covering Inventory, Safes, CPM, Audit/Troubleshooting, and Governance.",
              productionBestPractice:
                "Validate each task sequentially to ensure dependent configurations succeed.",
            },
            {
              name: "Assessment Passing Threshold",
              settingOrObject: "Certification Grading Engine",
              description:
                "Requires minimum overall weighted score of 70% across all 5 evaluation domains.",
              productionBestPractice: "Aim for 100% on core Safes and Onboarding domains.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Task 1 Execution (Accounts & Platforms)",
              action:
                "Catalog target accounts on Windows and Linux hosts, ensuring proper address and platform policy assignments.",
              expectedResult: "Task 1 verified in simulator.",
            },
            {
              stepNumber: 2,
              title: "Task 2 Execution (Safe Structure & ACLs)",
              action:
                "Structure Safes and assign granular permissions ensuring operators hold List and Use without Retrieve.",
              expectedResult: "Task 2 verified in simulator.",
            },
            {
              stepNumber: 3,
              title: "Task 3 Execution (Onboarding & CPM Policy)",
              action:
                "Verify CPM rotation schedules, complexity rules, and reconcile account linkages.",
              expectedResult: "Task 3 verified in simulator.",
            },
            {
              stepNumber: 4,
              title: "Task 4 Execution (Audit Review & Incident Remediation)",
              action:
                "Review audit log entries, troubleshoot simulated support ticket, and verify successful resolution.",
              expectedResult: "Task 4 verified in simulator.",
            },
            {
              stepNumber: 5,
              title: "Task 5 Execution & Final Evaluation",
              action:
                "Document configuration rationale and submit for automated Capstone Competency Report generation.",
              expectedResult: "Report generated with final score >= 70% and 'CERTIFIED' verdict.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "As the final requirement of the CyberArk Basic Training programme, you must deliver a fully configured and verified PAM workflow securing both the Windows Server 2022 tier and the Linux Oracle database tier, resolving outstanding operational incidents and documenting all security controls.",
            governanceRequirements: [
              "Complete all 5 Capstone project tasks.",
              "Achieve a score of >= 70% across all evaluation domains.",
              "Generate the official Capstone Competency Report.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Capstone evaluation score is below 70% ('REMEDIATION_REQUIRED').",
              rootCause:
                "One or more project tasks failed simulator validation or knowledge check questions were answered incorrectly.",
              securityImpact:
                "Candidate does not meet basic training competency standards; certification withheld.",
              cyberArkCodeOrEvent: "VERDICT-REMEDIATION-REQUIRED",
            },
            {
              symptom: "Dual Control approval bypass detected during emergency maintenance.",
              rootCause:
                "Safe ACL misconfiguration granted direct Retrieve permissions to operational tier.",
              securityImpact: "Unmonitored credential exposure violating separation of duties.",
              cyberArkCodeOrEvent: "AUDIT-UNAUTHORIZED-RETRIEVAL",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Review the Capstone Competency Report domain breakdown to identify low-scoring areas.",
              logFileOrConsole: "Capstone Evaluation Pane",
              remediation:
                "Revisit corresponding module practical exercises to remediate configuration gaps.",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Re-execute failed project tasks in the Capstone Workbench and re-evaluate.",
              logFileOrConsole: "Capstone Workbench -> Re-evaluate",
              remediation: "Verify overall score meets or exceeds the 70% passing threshold.",
            },
          ],
          securityImplications: [
            "Operating a PAM deployment without comprehensive domain competence leads to security misconfigurations and outages.",
            "Failing to enforce least privilege across all Safes leaves systems vulnerable to credential theft.",
            "Neglecting audit reviews permits unauthorized activities to escape detection.",
          ],
          knowledgeCheck: [
            {
              id: "cm12-q01",
              question:
                "In Capstone Task 2 (Safe Structure and Permissions), why is granting 'Retrieve accounts' to standard operators considered a severe security violation?",
              options: [
                "It causes the web browser to crash.",
                "It allows operators to view and copy the plaintext password, bypassing PSM session isolation, video recording, and keystroke auditing.",
                "It deletes the account from the target host.",
                "It changes the user's desktop wallpaper.",
              ],
              correctIndex: 1,
              explanation:
                "Granting 'Retrieve accounts' permits the user to copy the raw password, which can then be used to connect directly to the target server from an unmonitored laptop, completely circumventing PSM session recording.",
              conceptTested: "Capstone Task 2: Safe Permissions Governance",
            },
            {
              id: "cm12-q02",
              question:
                "In Capstone Task 3, how does configuring a linked Reconcile Account protect automated password management operations?",
              options: [
                "It automatically purchases additional CyberArk licenses.",
                "If the managed account password falls out of synchronization or becomes unknown, the Reconcile Account can autonomously reset the target credential without manual intervention.",
                "It disables all password changes on weekends.",
                "It forwards all emails to the security team.",
              ],
              correctIndex: 1,
              explanation:
                "A Reconcile Account possesses elevated rights (e.g. root or domain admin) and serves as an autonomous safety net, resetting target passwords that have become desynchronized or locked.",
              conceptTested: "Capstone Task 3: Reconcile Architecture",
            },
            {
              id: "cm12-q03",
              question:
                "What is the minimum overall passing score required to achieve certification on the ShadowXLab CyberArk Basic Training Capstone Assessment?",
              options: ["50%", "70%", "90%", "100%"],
              correctIndex: 1,
              explanation:
                "The authoritative client curriculum specifies a minimum passing score of 70% across the weighted assessment framework (Fundamentals 20%, Safes 20%, Onboarding 25%, Sessions 15%, Capstone 20%).",
              conceptTested: "Assessment Passing Threshold",
            },
          ],
          practicalExercise: {
            id: "cm12-ex01",
            title: "Comprehensive PAM Workflow Design & Capstone Competency Validation",
            objective:
              "Execute all 5 Capstone project tasks, validate end-to-end simulator state, and generate the official Capstone Competency Report.",
            scenario:
              "Design and validate a complete PAM workflow for Windows and Linux administrator accounts. Execute Tasks 1-5, verify simulator posture, resolve outstanding incidents, and generate your Capstone Competency Report against the 70% certification threshold.",
            prerequisites: ["Successful completion of Modules 01 through 11"],
            startingState: "Complete enterprise PAM simulator environment.",
            instructions: [
              "Review the Capstone Project requirements: Design a PAM workflow for Windows and Linux administrator accounts.",
              "Execute Task 1: Identify accounts and platforms (WIN-SRV-01 Administrator, LIN-DB-01 / oracle).",
              "Execute Task 2: Design Safe structure and least-privilege permissions (DBA-SAFE / WIN-SAFE).",
              "Execute Task 3: Onboard accounts and configure CPM password management (Verify / Reconcile).",
              "Execute Task 4: Review audit evidence and resolve simulated support incident.",
              "Execute Task 5: Document configuration decisions and security controls.",
              "Run the Capstone Evaluator to generate the Capstone Competency Report.",
            ],
            stepDetails: [
              {
                action: "Execute Task 1 (Accounts & Platforms)",
                explanation: "Verify account inventory across Windows and Linux targets.",
                expectedResult: "Task 1 criteria satisfied.",
              },
              {
                action: "Execute Task 2 (Safes & Permissions)",
                explanation: "Verify Safe boundaries and least-privilege ACLs.",
                expectedResult: "Task 2 criteria satisfied.",
              },
              {
                action: "Execute Task 3 (CPM Operations)",
                explanation: "Verify CPM lifecycle readiness and reconcile linkages.",
                expectedResult: "Task 3 criteria satisfied.",
              },
              {
                action: "Execute Task 4 (Audit & Troubleshooting)",
                explanation: "Review audit records and verify incident remediation.",
                expectedResult: "Task 4 criteria satisfied.",
              },
              {
                action: "Execute Task 5 (Governance & Competency Report)",
                explanation: "Generate final evaluation report against 70% threshold.",
                expectedResult: "Capstone Competency Report generated with CERTIFIED verdict.",
              },
            ],
            targetConsole: "assessments",
            associatedLabId: "Lab 05B · Reconcile out-of-sync credential",
            validationObjectiveId: "obj-cm12-capstone",
            validationCriteria:
              "Complete all 5 Capstone project tasks and achieve >= 70% on the Capstone Competency Report.",
            troubleshootingHints: [
              {
                symptom: "Capstone report displays score under 70%.",
                hint: "Ensure you have completed all previous module practicals (Lab 02 Safe permissions, Lab 05B CPM reconcile, Lab 06A PSM session).",
                correctiveAction:
                  "Review and complete any unvalidated module practicals, then re-evaluate.",
              },
            ],
            independentPractice: {
              title: "Independent Executive Architecture Summary",
              scenario:
                "Draft a 1-page executive briefing summarizing the security benefits of the completed PAM workflow for the organization's CISO.",
              goal: "Confirm ability to communicate PAM business and technical value to executive stakeholders.",
              targetConsole: "overview",
              successCriteria: [
                "Highlight reduction of credential theft and lateral movement risk.",
                "Detail compliance satisfaction for PCI-DSS, SOX, and ISO 27001.",
              ],
            },
          },
          completionCriteria: [
            "Score 100% on the Knowledge Checkpoint.",
            "Complete all 5 Capstone project tasks.",
            "Achieve an overall score of >= 70% on the Capstone Competency Report.",
          ],
          references: [
            "CyberArk Basic Training Client Version — Authoritative Curriculum",
            "CyberArk Certified Defender / Administrator Blueprint",
            "NIST Special Publication 800-207: Zero Trust Architecture",
          ],
        },
      ],
    },
  ],
};
