/**
 * SHADOWXLAB PAM ACADEMY — MODULE 03: POLICIES AND PLATFORMS
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_03: ClassCurriculum = {
  id: "module-03",
  number: "03",
  label: "MODULE 03",
  title: "Policies and Platforms",
  subtitle: "Master Policy Rules, Platform Inheritance & Rotation Governance",
  duration: "50 mins",
  level: "Professional",
  track: "admin-20",
  category: "Core Administration & Access Control",
  overview:
    "Master the policy framework that governs automated credential behavior in the enterprise. Deconstruct the hierarchy between the global Master Policy and Target Platforms, platform duplication, password complexity and generation rules, rotation intervals (MinValidityPeriod, PerformPeriodicChange), and high-security checkout modes (Exclusive Checkout and One-Time Passwords).",
  modules: [
    {
      id: "m03-core",
      number: "M3",
      title: "Platform Governance & Policy Architecture",
      description:
        "Technical configuration of target platforms, CPM plugin bindings, password rotation triggers, and Master Policy exception handling.",
      lessons: [
        {
          id: "m03-l01",
          number: "3.1",
          title: "Master Policy Hierarchy & Target Platform Customization",
          subtitle: "Configuring platform inheritance, rotation intervals, and exclusive checkout enforcement",
          estimatedMinutes: 25,
          learningObjectives: [
            "Deconstruct the hierarchy between the enterprise Master Policy and specific Target Platforms.",
            "Clone and customize target platforms for specialized workload requirements without modifying default templates.",
            "Configure automated rotation cycles: PerformPeriodicChange, MinValidityPeriod, and DaysNotifyPriorExpiration.",
            "Enforce Exclusive Checkout and One-Time Password (OTP) modes for sensitive Tier-0 credentials.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 02: User Management.",
          ],
          conceptIntroduction:
            "In an enterprise managing tens of thousands of privileged credentials, policies cannot be applied manually account by account. Instead, the PAM architecture utilizes a dual-tier governance model: the global Master Policy and Target Platforms.\n\nThe Master Policy defines baseline corporate security mandates for the entire organization—such as 'Require password change every 90 days', 'Require dual-control approval for checkout', or 'Record and store privileged sessions'. These high-level rules are enforced universally across all vaulted accounts.\n\nHowever, different technology stacks have distinct operational realities. A Windows Domain Controller local account cannot be rotated using the same protocol as an Oracle Database DBA password, a Cisco router enable secret, or an AWS IAM Access Key. Target Platforms solve this by acting as technology-specific policy templates. Each account onboarded into the Vault is bound to exactly one Platform (e.g., `UnixSSH`, `WindowsServerLocal`, `OracleDatabase`). The Platform defines the specific CPM plugin executable, the communication protocol, the rotation interval, password complexity rules, and connection component bindings (such as `PSM-SSH` or `PSM-RDP`).",
          whyItExists:
            "Without platforms, administrators would have to hand-craft connection strings, rotation schedules, and complexity parameters for every single server. Target Platforms enable standardization, inheritance, and instantaneous fleet-wide policy updates.",
          architecture: {
            overview:
              "Policy evaluation follows a strict cascade: Master Policy baseline rules apply universally unless a formal Platform Exception is configured on an individual Target Platform.",
            componentResponsibilities: [
              {
                component: "Master Policy Engine",
                role: "Defines organization-wide security baselines (rotation frequency, session recording, approval requirements).",
                networkProtocols: "Vault Internal Kernel Rules (TCP 1858)",
                securityBoundary: "Enterprise Governance Baseline",
              },
              {
                component: "Target Platform",
                role: "Defines technical execution parameters: CPM plugin binary (e.g., PMWindows.dll), protocol ports, complexity regex, and checkout rules.",
                networkProtocols: "Configuration stored in Vault Safe `PasswordManagerShared`",
                securityBoundary: "Technology Subsystem Boundary",
              },
              {
                component: "Central Policy Manager (CPM)",
                role: "Reads platform configuration parameters to determine when and how to rotate, verify, or reconcile passwords on target endpoints.",
                networkProtocols: "Management protocols (RPC, SSH, SQL, REST APIs) directly to target hosts",
                securityBoundary: "Orchestration & Enforcement Engine",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Security Governance Board",
                action: "Defines Master Policy rule: 'Require password change every 30 days for Tier-0 Domain Accounts'.",
                channelOrProtocol: "PVWA Administration > Master Policy",
                verificationRule: "Master Policy rule is committed to Vault database and marked active.",
              },
              {
                stepNumber: 2,
                actor: "PAM Administrator",
                action: "Clones default `Windows Server Local` platform to create specialized platform `WIN-FINANCE-HIGHSEC`.",
                channelOrProtocol: "Administration > Platform Management",
                verificationRule: "Platform ID is unique; duplicates CPM plugin bindings and default parameters safely.",
              },
              {
                stepNumber: 3,
                actor: "PAM Administrator",
                action: "Configures `MinValidityPeriod = 60` and enables `EnforceExclusiveMode = Yes` on the new platform.",
                channelOrProtocol: "Platform Settings > UI & Workflows",
                verificationRule: "When an engineer checks out the credential, all other users are locked out until released.",
              },
              {
                stepNumber: 4,
                actor: "Operational User",
                action: "Checks out the password for server FIN-APP-01, completes emergency maintenance, and releases checkout.",
                channelOrProtocol: "PVWA Accounts Console",
                verificationRule: "Immediate check-in triggers CPM to execute one-time password rotation on target server.",
              },
            ],
          },
          terminology: [
            {
              term: "Target Platform",
              definition: "A policy and configuration template that governs account behavior, password generation rules, and CPM/PSM integration for a specific technology.",
              enterpriseContext: "Accounts inherit their operational behavior directly from their assigned platform.",
            },
            {
              term: "Master Policy",
              definition: "The global security ruleset enforced across the entire Vault, setting standards for password changes, approvals, and session recording.",
              enterpriseContext: "Audited by compliance officers to verify enterprise alignment with regulatory standards.",
            },
            {
              term: "Exclusive Mode",
              definition: "A platform checkout setting that guarantees only one user can access or view an account credential at any given time.",
              enterpriseContext: "Essential for financial and defense environments to guarantee strict single-user accountability for root access.",
            },
            {
              term: "One-Time Password (OTP)",
              definition: "A workflow where a credential is automatically rotated by the CPM immediately upon release or after `MinValidityPeriod` expires.",
              enterpriseContext: "Guarantees that a checked-out password cannot be reused by the engineer after their task concludes.",
            },
            {
              term: "MinValidityPeriod",
              definition: "The minimum time (in minutes) an account remains checked out before the CPM executes an automated post-use rotation.",
              enterpriseContext: "Prevents CPM from rotating a credential in the middle of an engineer's active terminal session.",
            },
          ],
          administratorResponsibilities: [
            "Never modify out-of-the-box default platforms directly; always clone them before customizing.",
            "Enforce Exclusive Checkout and OTP on Tier-0 domain admin and production database accounts.",
            "Tune CPM rotation intervals (`PerformPeriodicChange = Yes`, `ExecutionDays = 30`) to balance security with target system API load.",
            "Define password length and complexity rules that comply with corporate policy without violating target OS character limitations.",
          ],
          configurationAndAdministration: [
            {
              name: "PerformPeriodicChange",
              settingOrObject: "Platform > Automatic Password Management > General",
              description: "Enables automated recurring password rotation by CPM without requiring human intervention.",
              productionBestPractice: "Set to Yes for all standard server local and domain administrative credentials.",
            },
            {
              name: "MinValidityPeriod",
              settingOrObject: "Platform > Privileged Account Management > General",
              description: "Minimum duration (in minutes) that a credential remains locked to a user before CPM initiates post-use change.",
              productionBestPractice: "Set to 60 minutes for interactive administrative access; 15 minutes for automated batch tasks.",
            },
            {
              name: "PasswordLength & PasswordComplexity",
              settingOrObject: "Platform > Automatic Password Management > Generate",
              description: "Specifies minimum length, character sets (Alpha, Numeric, Special), and forbidden characters.",
              productionBestPractice: "Enforce 24+ characters with mixed case, numbers, and symbols; exclude characters known to break shell scripts.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Platform Duplication",
              action: "Navigate to Administration > Platform Management, select `Windows Server Local`, and click 'Duplicate'.",
              expectedResult: "A copy is created; specify new Platform ID `WIN-FINANCE-HIGHSEC` and save.",
              operatorNotes: "Duplication prevents accidental corruption of the baseline platform package.",
            },
            {
              stepNumber: 2,
              title: "Configure Exclusive Checkout & OTP",
              action: "Edit `WIN-FINANCE-HIGHSEC`, expand UI & Workflows > Privileged Account Management, set `EnforceExclusiveMode = Yes`.",
              expectedResult: "Platform configuration updated. Any account bound to this platform will now require exclusive checkout.",
            },
            {
              stepNumber: 3,
              title: "Set Password Complexity Parameters",
              action: "Under Automatic Password Management > Generate, set `PasswordLength = 32` and `MinSpecialCharacters = 2`.",
              expectedResult: "CPM will generate 32-character high-entropy passwords during future rotation cycles.",
            },
            {
              stepNumber: 4,
              title: "Verify Platform Binding on Target Account",
              action: "Open Accounts inventory, edit a test account, update its platform to `WIN-FINANCE-HIGHSEC`, and click Save.",
              expectedResult: "Account properties reflect the new platform; subsequent checkout enforces exclusive single-user lock.",
            },
          ],
          enterpriseScenario: {
            organization: "Vanguard Healthcare Systems",
            businessContext:
              "Vanguard Healthcare operates 850 electronic health record (EHR) database servers subject to strict HIPAA compliance. An internal audit revealed that multiple database administrators were sharing a single elevated `db_master` account concurrently, making it impossible to determine which engineer executed an unauthorized patient record export. The PAM team was instructed to configure Exclusive Checkout and One-Time Password rotation across all database platforms.",
            governanceRequirements: [
              "Strict single-operator accountability: concurrent checkouts of the same administrative account are strictly prohibited.",
              "Mandatory post-use rotation: passwords must be changed by CPM within 60 minutes of release.",
              "Password generation must produce at least 28 characters with high cryptographic entropy.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Account cannot be checked out: 'Account is locked by another user: jsmith'.",
              rootCause: "Exclusive checkout is active on the platform and previous user forgot to release the account after finishing work.",
              securityImpact: "Other authorized operators blocked from performing emergency recovery tasks.",
              cyberArkCodeOrEvent: "ITATS024E",
            },
            {
              symptom: "CPM rotation fails with error: 'Target system password rejected character set'.",
              rootCause: "Platform password generation policy included special characters (e.g. `^`, `&`, `|`, `\"`) forbidden by the target OS or database shell.",
              securityImpact: "Credential desynchronization; target rejects new password while Vault retains old hash.",
              cyberArkCodeOrEvent: "CACPM154E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Administrator inspects active locks on the account in the Accounts Console.",
              logFileOrConsole: "PVWA Accounts Console > Account Details > Locked By",
              remediation: "If legitimate, contact the lock holder. If abandoned, a Safe Administrator can click 'Unlock Account' to force release.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Review CPM plugin execution log for password generation syntax errors.",
              logFileOrConsole: "C:\\CyberArk\\Password Manager\\Logs\\pm.log / <PlatformID>.log",
              remediation: "Adjust `PasswordForbiddenChars` in Platform settings to strip problematic characters from the generation pool.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Confirm Master Policy exception status in PVWA Administration.",
              logFileOrConsole: "Administration > Master Policy > Exceptions",
              remediation: "Verify that the platform exception was not inadvertently deleted, overriding local platform settings.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\pm.log",
              sampleOutput:
                "CACPM154E Error changing password for account FIN-APP-01\\Administrator on platform WIN-FINANCE-HIGHSEC.\nTarget shell returned: 'Error: password contains illegal character: ;'",
              explanation:
                "The target Windows/PowerShell script interpreter choked on semicolon (;) in the generated password. Semicolon must be added to PasswordForbiddenChars in the platform configuration.",
            },
            {
              logFile: "C:\\Windows\\Temp\\PVWA\\PVWA.App.log",
              sampleOutput:
                "User Alice requested Show Password for Account ID 451. Action rejected: Account is currently locked exclusively by User Bob.",
              explanation:
                "Platform Exclusive Mode functioned correctly, denying Alice concurrent access while Bob held an active checkout token.",
            },
          ],
          instructorNotes: [
            "When designing platforms, always specify `DaysNotifyPriorExpiration = 7` so account owners receive warning emails before automated rotation windows.",
            "Exclusive checkout without CPM automated rotation defeats the purpose; always combine Exclusive Mode with One-Time Password (OTP) or immediate rotation on release.",
            "Ensure `MinValidityPeriod` is long enough for human tasks (e.g. 60m), otherwise the CPM will rotate the password while the user is actively connected.",
          ],
          securityImplications: [
            "Repudiation Defense: Exclusive checkout provides non-repudiation; only one named individual possessed the secret at the timestamp of any incident.",
            "Mitigating Pass-the-Hash: Automated 24-hour rotation limits the operational window of stolen credential artifacts to hours rather than months.",
            "Policy Enforcement: Centralized platforms prevent rogue administrators from configuring weak 8-character passwords on sensitive endpoints.",
          ],
          knowledgeCheck: [
            {
              id: "m03-q01",
              question: "What happens when an account is assigned to a platform with 'EnforceExclusiveMode = Yes' and User A checks it out?",
              options: [
                "User B can still view the password if they belong to the Auditor group.",
                "User B is blocked from checking out or viewing the password until User A releases the lock or it expires.",
                "The Vault generates a duplicate second password for User B.",
                "The target server is automatically rebooted.",
              ],
              correctIndex: 1,
              explanation:
                "Exclusive Mode enforces single-operator concurrency. Once User A checks out the credential, all other users receive a locked notice until User A releases the account or an administrator forces an unlock.",
              conceptTested: "Exclusive Checkout Mechanics",
            },
            {
              id: "m03-q02",
              question: "Why should an administrator NEVER modify out-of-the-box default platforms directly?",
              options: [
                "Default platforms are encrypted and cannot be opened.",
                "Upgrades to the PAM software can overwrite default platform files, destroying customizations; best practice is always to duplicate and edit the clone.",
                "Modifying default platforms causes the Vault license to terminate immediately.",
                "Default platforms only work for Linux targets.",
              ],
              correctIndex: 1,
              explanation:
                "CyberArk and PAM vendor updates routinely patch and replace default platform templates. Customizing a cloned platform preserves your configuration across software upgrades and avoids system-wide regression.",
              conceptTested: "Platform Customization & Lifecycle Best Practices",
            },
            {
              id: "m03-q03",
              question: "What is the primary function of the 'MinValidityPeriod' setting on a target platform?",
              options: [
                "It defines how many days a user has worked at the company before receiving access.",
                "It specifies the minimum time (in minutes) a credential must remain valid after checkout before the CPM executes a post-use rotation.",
                "It defines the SSL certificate expiration window for the PVWA web portal.",
                "It specifies the minimum RAM required on the CPM host.",
              ],
              correctIndex: 1,
              explanation:
                "MinValidityPeriod guarantees that the user has a sufficient window of time (e.g., 60 minutes) to perform their work before the Central Policy Manager automatically changes the password on the target endpoint.",
              conceptTested: "One-Time Password & MinValidityPeriod Mechanics",
            },
          ],
          practicalExercise: {
            id: "m03-ex01",
            title: "Inspect Password Policies and Platform Rotation Governance",
            scenario:
              "Navigate to the Password Policies console to review active platform rules, rotation schedules, and complexity requirements enforced across the enterprise fleet.",
            instructions: [
              "Navigate to the Password Policies console.",
              "Inspect the active platform definitions (Windows Server, Linux SSH, Database).",
              "Review the configured rotation intervals, complexity parameters, and exclusive checkout flags.",
              "Verify that policy rules are reflected in the operational state.",
            ],
            targetConsole: "policies",
            associatedLabId: "Lab 03 · Onboard WIN-SRV-01 Administrator",
            validationObjectiveId: "platform-selection",
            validationCriteria:
              "The Password Policies console is reviewed and platform parameters are verified.",
          },
          completionCriteria: [
            "Mastered the relationship between Master Policy rules and Target Platforms.",
            "Learned platform duplication and configuration of Exclusive Mode and OTP.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the policy inspection in the Password Policies console.",
          ],
          references: [
            "NIST SP 800-63B: Digital Identity Guidelines - Authentication & Lifecycle Management",
            "CyberArk Core PAS: Master Policy & Platform Management Technical Specification",
            "Center for Internet Security (CIS): Enterprise Password Governance Benchmarks",
          ],
        },
      ],
    },
  ],
};
