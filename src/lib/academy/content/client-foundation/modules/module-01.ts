/**
 * MODULE 01 — INTRODUCTION TO PRIVILEGED ACCESS MANAGEMENT
 * Verbatim alignment with ShadowXLab CyberArk Basic Training Client Version.
 *
 * Duration: 2 Hours | Day: 1 | Domain: Fundamentals and Architecture (20%)
 * Learning Outcome: Explain the purpose of PAM and identify privileged accounts in common environments.
 */

import type { ClassCurriculum } from "../../../types";

export const CLIENT_MODULE_01: ClassCurriculum = {
  id: "client-m01",
  number: "01",
  label: "MODULE 01",
  title: "Introduction to Privileged Access Management",
  subtitle: "Identity Fundamentals, Privileged Risks & Enterprise PAM Boundaries",
  duration: "2 Hours",
  level: "Foundational",
  track: "client-12",
  category: "Fundamentals and Architecture",
  overview:
    "Establishes the foundation of Privileged Access Management. Covers the critical distinction between authentication and authorization, user account taxonomies, credential theft attack vectors, lateral movement, and the functional boundaries between PAM, IAM, and IGA across infrastructure, financial services, healthcare, and SOC environments.",
  modules: [
    {
      id: "cm01-core",
      number: "M01",
      title: "Introduction to Privileged Access Management",
      description:
        "Identity fundamentals, privileged account risks, attack chains, and enterprise use cases.",
      lessons: [
        {
          id: "cm01-l01",
          number: "1.1",
          title: "Identity Fundamentals, Privileged Risks & Enterprise Use Cases",
          subtitle: "Authentication vs Authorization, Credential Theft Vectors & The Role of PAM",
          estimatedMinutes: 120,
          learningObjectives: [
            "Explain the purpose of Privileged Access Management (PAM) in modern security architectures.",
            "Differentiate clearly between authentication (AuthN) and authorization (AuthZ).",
            "Identify and classify standard user accounts, service accounts, and privileged accounts.",
            "Analyze privileged credential theft attack vectors including Pass-the-Hash, Kerberoasting, and privilege escalation.",
            "Distinguish between PAM, Identity and Access Management (IAM), and Identity Governance and Administration (IGA).",
            "Evaluate PAM enterprise use cases across Infrastructure, Financial Services, Healthcare, and the Security Operations Center (SOC).",
          ],
          prerequisites: [
            "Basic understanding of enterprise operating systems (Windows Server, Linux).",
            "Familiarity with foundational networking protocols (TCP/IP, DNS, Active Directory).",
          ],
          conceptIntroduction:
            "Privileged Access Management (PAM) is a specialized cybersecurity discipline focused on safeguarding, controlling, and monitoring identities that possess elevated permissions beyond standard users. In modern enterprise environments, privileged accounts—such as local administrators, domain administrators, root accounts, service accounts, and cloud IAM roles—represent the 'keys to the kingdom.' If an attacker compromises standard user credentials, their impact is limited to that user's desktop; but when privileged credentials are stolen, the adversary can disable security controls, exfiltrate sensitive data, manipulate transaction logs, or deploy enterprise-wide ransomware. PAM enforces the principle of least privilege, eliminates hardcoded credentials, isolates administrative sessions, and provides tamper-proof audit trails.",
          whyItExists:
            "Privileged accounts are the primary target in over 80% of enterprise security breaches. Traditional perimeter defenses fail once an attacker secures a foothold through phishing or credential stuffing. Without PAM, credentials remain unmanaged, unrotated, and scattered across text files, configuration scripts, and endpoints, allowing adversaries to move laterally and escalate privileges without detection. PAM exists to establish an authoritative security boundary around elevated access.",
          architecture: {
            overview:
              "PAM acts as a secure intermediary between administrators and target endpoints. Rather than connecting directly to Windows domain controllers, Unix servers, databases, or cloud consoles, administrators authenticate to PAM, which mediates credential retrieval and brokers isolated sessions.",
            componentResponsibilities: [
              {
                component: "Standard User Identity",
                role: "Individual corporate account used for email, documents, and business apps.",
                securityBoundary: "Local workstation / SaaS portal; minimal endpoint rights.",
              },
              {
                component: "Privileged Account",
                role: "High-entitlement account capable of modifying system configurations, installing software, or accessing all data.",
                securityBoundary:
                  "Digital Vault boundary; strict access control and approval required.",
              },
              {
                component: "PAM Solution (CyberArk)",
                role: "Brokers, rotates, vaults, and monitors privileged credentials and active sessions.",
                networkProtocols: "TCP 1858 (Encrypted Vault), HTTPS (443), RDP (3389), SSH (22)",
                securityBoundary:
                  "Hardened security perimeter with zero direct credential disclosure.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Privileged User",
                action: "Authenticates to PAM using primary corporate identity + MFA.",
                channelOrProtocol: "HTTPS / TLS 1.3 to Web Portal (PVWA)",
                verificationRule: "Identity verified against enterprise identity provider (IdP).",
              },
              {
                stepNumber: 2,
                actor: "PAM Policy Engine",
                action:
                  "Evaluates authorization, Safe permissions, and dual-control approval rules.",
                channelOrProtocol: "Internal Vault Protocol",
                verificationRule: "User must possess explicit 'Use' or 'Retrieve' rights.",
              },
              {
                stepNumber: 3,
                actor: "PAM Broker",
                action:
                  "Injects vaulted target credentials into an isolated session without exposing the password to the user.",
                channelOrProtocol: "RDP Proxy / SSH Proxy",
                verificationRule:
                  "Target receives connection from PAM proxy, never user's client directly.",
              },
              {
                stepNumber: 4,
                actor: "Audit Subsystem",
                action:
                  "Records keystrokes, process launches, and session video to immutable storage.",
                channelOrProtocol: "Encrypted Storage (Vault)",
                verificationRule: "Audit records sealed with cryptographic hash.",
              },
            ],
          },
          terminology: [
            {
              term: "Authentication (AuthN)",
              definition:
                "The cryptographic verification of an entity's claimed identity (e.g., verifying who you are via password and MFA).",
              enterpriseContext: "Ensures only verified employees access the PAM portal.",
            },
            {
              term: "Authorization (AuthZ)",
              definition:
                "The enforcement of specific access rights, entitlements, and permissions granted to an authenticated identity.",
              enterpriseContext:
                "Determines whether an admin has rights to view or rotate credentials in a specific Safe.",
            },
            {
              term: "Privileged Account",
              definition:
                "Any identity possessing elevated permissions capable of modifying infrastructure configurations, accessing protected data, or overriding security policies.",
              enterpriseContext:
                "Examples include root, Domain Admin, local Administrator, and svc_database.",
            },
            {
              term: "PAM vs IAM vs IGA",
              definition:
                "IAM handles broad corporate identity lifecycle and SSO; IGA governs compliance and entitlement reviews; PAM specifically protects and isolates high-risk elevated access.",
              enterpriseContext:
                "PAM sits inside the deeper security layer, protecting the critical infrastructure from all other domains.",
            },
            {
              term: "Credential Theft & Lateral Movement",
              definition:
                "Techniques where an attacker extracts cached credentials (e.g. LSASS memory injection) and uses them to traverse network segments.",
              enterpriseContext:
                "PAM prevents lateral movement by enforcing single-use one-time passwords and session brokering.",
            },
          ],
          administratorResponsibilities: [
            "Maintain an authoritative inventory of all privileged accounts across on-premises and cloud systems.",
            "Classify accounts by criticality tier (Tier 0 Domain Controllers, Tier 1 Application Servers, Tier 2 Endpoints).",
            "Eliminate shared administrative accounts and hardcoded credentials in automation scripts.",
            "Enforce Multi-Factor Authentication (MFA) on all access paths leading to privileged tooling.",
          ],
          configurationAndAdministration: [
            {
              name: "Authentication Policy",
              settingOrObject: "SAML / OIDC / RADIUS Integration",
              description:
                "Configures how users prove their identity before reaching the PAM interface.",
              productionBestPractice:
                "Enforce hardware security key (FIDO2) or phishing-resistant MFA.",
            },
            {
              name: "Tiered Administration Model",
              settingOrObject: "Active Directory / Enterprise OUs",
              description:
                "Separates administrative credentials so workstation admins cannot compromise server tiers.",
              productionBestPractice:
                "Tier 0 credentials must never be exposed or logged onto Tier 1 or Tier 2 machines.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Privileged Account Identification",
              action:
                "Scan target environments and identify all unmanaged built-in and service accounts.",
              expectedResult:
                "Accurate catalog of target host, account username, and privilege tier.",
            },
            {
              stepNumber: 2,
              title: "Privilege Tier Classification",
              action:
                "Map account to Tier 0 (Core Identity), Tier 1 (Enterprise Servers), or Tier 2 (Workstations).",
              expectedResult: "Account assigned to proper governance boundary.",
            },
            {
              stepNumber: 3,
              title: "PAM Onboarding and Policy Binding",
              action:
                "Vault the account credentials into a dedicated Safe and attach automated rotation policy.",
              expectedResult:
                "Account password managed and direct local password known to no human.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "GFS operates high-throughput payment settlement backends. A recent penetration test revealed that developers were using shared local administrator credentials to troubleshoot production Linux databases, while IT helpdesk staff shared Windows domain admin accounts.",
            governanceRequirements: [
              "Zero shared privileged credentials across technical staff.",
              "Complete isolation of production database root credentials from developer workstations.",
              "Audit logging of every administrative access with named attribution.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Pass-the-Hash attack compromises multiple domain member servers.",
              rootCause:
                "Local Administrator account shares the same password hash across all workstations and servers.",
              securityImpact:
                "Adversary gains instant administrative control over the entire network.",
              cyberArkCodeOrEvent: "EVENT-PASS-THE-HASH-DETECTED",
            },
            {
              symptom:
                "Unmanaged service account password expires, halting payment batch processing.",
              rootCause:
                "Service account password was manually configured and excluded from rotation governance.",
              securityImpact: "Operational downtime and financial compliance breach.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Examine account inventory for accounts flagged as 'Unmanaged' or 'Stale'.",
              logFileOrConsole: "PVWA Accounts Console -> Discovered Accounts",
              remediation: "Onboard the unmanaged account into its designated Safe immediately.",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Verify whether the affected account has identical credentials on multiple endpoints.",
              logFileOrConsole: "Compliance Audit Report",
              remediation:
                "Apply CPM policy to randomize and individualize passwords across all endpoints.",
            },
          ],
          securityImplications: [
            "Lack of PAM allows an attacker with single-endpoint access to achieve full domain dominance within hours.",
            "Shared accounts destroy accountability, making it impossible to satisfy SOC2, PCI-DSS, or ISO 27001 audit standards.",
            "Hardcoded credentials in configuration files remain vulnerable to source code leakage and repository scraping.",
          ],
          knowledgeCheck: [
            {
              id: "cm01-q01",
              question:
                "What is the primary operational distinction between Authentication (AuthN) and Authorization (AuthZ)?",
              scenario:
                "An engineer enters their username, password, and YubiKey OTP, but is greeted with an 'Access Denied to Safe WIN-SAFE' message upon reaching the dashboard.",
              options: [
                "Authentication verifies who the user is; Authorization determines what specific resources and actions the user is permitted to access.",
                "Authentication assigns permissions to files; Authorization validates the user's password hash against the Vault.",
                "Authentication occurs inside target operating systems; Authorization is managed exclusively by cloud identity providers.",
                "Authentication is required only for standard accounts; Authorization is required only for domain administrators.",
              ],
              correctIndex: 0,
              explanation:
                "Authentication (AuthN) establishes identity through credentials and MFA. Once identity is proven, Authorization (AuthZ) checks access control rules (such as Safe permissions) to determine whether the identity has rights to access specific objects.",
              conceptTested: "Authentication vs Authorization Boundaries",
            },
            {
              id: "cm01-q02",
              question:
                "How does an unmanaged local administrator account with identical passwords across 50 servers enable lateral movement?",
              scenario:
                "An attacker compromises a low-priority print server and dumps the local Administrator password hash from LSASS memory.",
              options: [
                "The attacker can only execute commands on that single print server because Windows limits local accounts to local boundaries.",
                "The attacker can reuse the identical password hash (Pass-the-Hash) to authenticate as local Administrator on all 49 other servers without knowing the plaintext password.",
                "The domain controller automatically locks out all 50 servers when an administrator hash is extracted.",
                "The attacker is blocked because CyberArk prevents hash reuse on non-domain endpoints.",
              ],
              correctIndex: 1,
              explanation:
                "When local administrative passwords are synchronized or static across hosts, compromising one endpoint allows an attacker to execute Pass-the-Hash attacks across every machine in the fleet, achieving effortless lateral movement.",
              conceptTested: "Lateral Movement & Unmanaged Credential Risks",
            },
            {
              id: "cm01-q03",
              question:
                "Which of the following describes the functional domain boundary between PAM and Identity Governance and Administration (IGA)?",
              options: [
                "IGA isolates active SSH/RDP sessions; PAM manages employee corporate badge access.",
                "PAM rotates passwords and brokers real-time elevated sessions; IGA manages broad employee onboarding, role certification, and compliance attestation.",
                "PAM replaces all corporate Active Directory domains; IGA acts as the database repository for password hashes.",
                "There is no difference; PAM and IGA are identical vendor terms for single sign-on (SSO).",
              ],
              correctIndex: 1,
              explanation:
                "IGA solutions (like SailPoint or Saviynt) govern user lifecycle, role-based entitlement requests, and periodic compliance recertification. PAM (like CyberArk) secures, vaults, rotates, and brokers the real-time operational execution of privileged credentials and sessions.",
              conceptTested: "PAM vs IGA Enterprise Boundaries",
            },
          ],
          practicalExercise: {
            id: "cm01-ex01",
            title: "Privileged Posture & Identity Classification",
            objective:
              "Inspect the PAM environment topology, classify account privilege levels, and identify unmanaged accounts.",
            scenario:
              "Examine the enterprise PAM dashboard to locate active components, identify vaulted privileged credentials, and trace access paths.",
            prerequisites: ["Access to ShadowXLab PAM Academy simulator"],
            startingState: "Default baseline environment with sample accounts and Safes.",
            instructions: [
              "Navigate to the PAM Environment console to inspect the component topology (Vault, PVWA, CPM, PSM).",
              "Review the Accounts console to observe vaulted accounts (e.g., Administrator on WIN-SRV-01, svc_backup on WIN-SRV-02).",
              "Identify the difference between standard and privileged accounts in the simulator inventory.",
              "Validate the baseline operational posture.",
            ],
            stepDetails: [
              {
                action: "Navigate to PAM Environment Console",
                explanation: "Inspect the component layout and verify communication channels.",
                expectedResult: "All 4 core components visible and active.",
              },
              {
                action: "Review Accounts Inventory",
                explanation:
                  "Identify the address, platform, and Safe bindings for existing accounts.",
                expectedResult: "Accounts catalog loaded with status indicators.",
              },
              {
                action: "Execute Simulator Verification",
                explanation:
                  "Run the deterministic simulator evaluation to verify baseline status.",
                expectedResult: "100% baseline compliance verified.",
              },
            ],
            targetConsole: "overview",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "obj-cm01-baseline",
            validationCriteria:
              "Verify all 4 core components and baseline account inventory in the PAM simulator.",
            troubleshootingHints: [
              {
                symptom: "Component status indicators show disconnected or uninitialized state.",
                hint: "Click the Reset button in the top navigation bar to reset the simulator state to verified baseline.",
                correctiveAction: "Trigger onResetState to restore the clean training snapshot.",
              },
            ],
            independentPractice: {
              title: "Independent Identity Classification Audit",
              scenario:
                "Audit the account inventory and categorize each account by operational tier.",
              goal: "Confirm understanding of Tier 0, Tier 1, and service account classifications.",
              targetConsole: "accounts",
              successCriteria: [
                "Classify Administrator on WIN-SRV-01 as a Tier 1 server administrative account.",
                "Classify svc_backup on WIN-SRV-02 as a non-human privileged service account.",
              ],
            },
          },
          completionCriteria: [
            "Achieve 100% correct score on the Knowledge Checkpoint.",
            "Verify all 4 core components in the PAM simulator environment.",
            "Complete independent identity classification review.",
          ],
          references: [
            "NIST SP 800-207: Zero Trust Architecture",
            "CyberArk Privilege Cloud & Self-Hosted Architecture Overview",
            "CIS Critical Security Controls — Control 05: Account Management",
          ],
        },
      ],
    },
  ],
};
