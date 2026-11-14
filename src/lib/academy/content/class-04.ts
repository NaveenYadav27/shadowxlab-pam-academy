/**
 * SHADOWXLAB PAM ACADEMY — CLASS 04: IDENTITY & PRIVILEGED ACCOUNT SECURITY
 * Deep instructional content covering human vs non-human identities, shadow admin detection,
 * access recertification, and orphaned account remediation.
 */

import type { ClassCurriculum } from "../types";

export const CLASS_04: ClassCurriculum = {
  id: "class-04",
  number: "04",
  label: "CLASS 04",
  title: "Identity & Privileged Account Security",
  subtitle: "Identity Governance, Human vs Non-Human Attribution & Access Recertification",
  duration: "1H 45M",
  level: "Professional",
  overview:
    "Master the governance of privileged identities, distinguish between human custodians and machine service principals, detect dormant and orphaned accounts, and perform enterprise access recertification audits.",
  modules: [
    {
      id: "c04-m01",
      number: "M1",
      title: "Privileged Identity Governance, Human vs Non-Human Attribution & Ownership",
      description:
        "Understand the distinction between named human accounts and machine credentials, shared account risks, custodian attribution, and identity lifecycle governance.",
      lessons: [
        {
          id: "c04-m01-l01",
          number: "4.1",
          title: "Human vs Non-Human Identity Governance & Custodianship",
          subtitle:
            "Attribution, Service Account Sprawl, and the Elimination of Shared Static Secrets",
          estimatedMinutes: 20,
          learningObjectives: [
            "Differentiate governance controls for human privileged operators versus machine service accounts.",
            "Establish individual accountability when operating shared accounts (root, Administrator) via PSM attribution.",
            "Detect dormant, orphaned, and excessive privilege states across enterprise account inventories.",
          ],
          prerequisites: [
            "Completion of Classes 01 through 03.",
            "Familiarity with Active Directory ACLs and Unix sudoers.",
          ],
          conceptIntroduction:
            "Privileged identities fall into two broad classifications: Human Identities (named system engineers, database administrators, and security operators) and Non-Human Identities (application service accounts, scheduled tasks, CI/CD pipeline workers, and automated API daemons). While humans require interactive session isolation and multi-factor approval gates, non-human accounts require automated credential rotation with dependency synchronization to prevent application outages.",
          whyItExists:
            "Shared administrative accounts like 'root' or 'Administrator' historically created severe non-repudiation gaps: when multiple engineers know the same root password, forensic investigators cannot determine which individual performed an unauthorized system change. CyberArk PAM solves this by vaulting the shared secret and requiring users to connect via PSM using their personal named accounts, providing 100% individual attribution on all shared session commands.",
          architecture: {
            overview:
              "Identity governance links real-world corporate employees (custodians) to technical accounts stored in Safes, ensuring that every privileged object has an accountable owner and a defined expiration lifecycle.",
            diagramAscii: `
┌────────────────────────────────────────────────────────────────────────┐
│                   PRIVILEGED IDENTITY ATTRIBUTION                      │
│                                                                        │
│   [ Named Employee Identity ] ──► Authenticates to PVWA via SSO/MFA    │
│   (e.g., naveen.yadav@gfs)                                             │
│                 │                                                      │
│                 │ (Requests Access with ServiceNow Ticket)             │
│                 ▼                                                      │
│   ┌──────────────────────────┐                                         │
│   │   VAULTED SHARED SECRET  │                                         │
│   │   - Account: root        │ ◄─── Password NEVER revealed            │
│   │   - Target: LNX-SRV-01   │                                         │
│   └──────────────────────────┘                                         │
│                 │                                                      │
│                 │ (PSM Injects Credential into SSH Tunnel)             │
│                 ▼                                                      │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 IMMUTABLE SESSION AUDIT STREAM                 │   │
│   │ "Session 9104: naveen.yadav logged into LNX-SRV-01 as root.    │   │
│   │  Executed: /usr/bin/systemctl restart nginx [08:42:15 UTC]     │   │
│   │  Keystrokes: FULL REPLAY ARCHIVED - TICKET: CHG-10294"         │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
`,
            componentResponsibilities: [
              {
                component: "Identity Attribution Engine",
                role: "Maps individual operator authentications to vaulted shared account transactions.",
                securityBoundary:
                  "Maintains tamper-evident audit logs connecting human user to target action.",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Operator",
                action: "Logs into PVWA using personal enterprise credentials (naveen.yadav).",
                channelOrProtocol: "HTTPS SAML/OIDC",
                verificationRule: "MFA challenge successfully verified by identity provider.",
              },
              {
                stepNumber: 2,
                actor: "Vault Engine",
                action:
                  "Issues temporary checkout token linking 'naveen.yadav' to target account 'Administrator'.",
                channelOrProtocol: "Internal Vault DB",
                verificationRule:
                  "Audit log tags all downstream session events with operator identity.",
              },
            ],
          },
          terminology: [
            {
              term: "Non-Repudiation",
              definition:
                "The cryptographic assurance that a specific individual performed an action and cannot deny having done so.",
              enterpriseContext:
                "Achieved in CyberArk through PSM keystroke logging and video capture tied to named PVWA logins.",
            },
            {
              term: "Orphaned Account",
              definition:
                "A privileged account remaining active on a target system whose owner or business project has been terminated.",
              enterpriseContext:
                "High-risk attack vector; must be identified during quarterly access certifications and deleted.",
            },
          ],
          administratorResponsibilities: [
            "Conduct quarterly privileged access recertifications with application owners.",
            "Identify and decommission orphaned or dormant privileged accounts (> 90 days inactive).",
            "Ensure technical custodians are assigned to all service accounts to coordinate rotation windows.",
          ],
          configurationAndAdministration: [
            {
              name: "Custodianship Metadata",
              settingOrObject: "Account Object > Custom Properties > TechnicalOwner",
              description:
                "Records the email and employee ID of the engineer responsible for the target account.",
              productionBestPractice:
                "Mandate TechnicalOwner and BusinessJustification attributes for all newly onboarded accounts.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Discover Unmapped Privileged Accounts",
              action:
                "Run Accounts Discovery scan in PVWA against active IP subnets and import results into staging Safe.",
              expectedResult:
                "Discovered accounts list displays unmanaged local and domain administrator credentials.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Financial Services (corp.gfs.local)",
            businessContext:
              "During an identity audit, GFS discovered an active local account 'temp_admin' on a core transaction server that had not been rotated in 400 days. Forensic inquiry revealed the contracting engineer had departed the firm six months earlier.",
            governanceRequirements: [
              "Immediate vaulting and password change of temp_admin.",
              "Automated alerts for accounts showing zero rotation activity over 90 days.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "A critical payment daemon crashes immediately after CPM rotates the 'svc_payment' password.",
              rootCause:
                "The service account had hardcoded plaintext passwords in application config files that were not updated with CPM dependencies.",
              securityImpact:
                "Payment processing downtime; requires emergency password restoration or dependency plugin configuration.",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Inspect Windows Services or systemd units to identify dependent services running under the account.",
              logFileOrConsole: "services.msc or systemctl status",
              remediation:
                "Configure CPM Service Dependencies so CPM automatically updates Windows Service logons when rotating the account.",
            },
          ],
          securityImplications: [
            "Failing to vault non-human service accounts leaves them vulnerable to Kerberoasting attacks across the Active Directory domain.",
          ],
          knowledgeCheck: [
            {
              id: "c04-m01-q01",
              question:
                "How does CyberArk PSM guarantee non-repudiation when multiple engineers use the shared 'root' account?",
              options: [
                "It forces all engineers to share the same password.",
                "It binds the session to the engineer's individual authenticated PVWA identity, logging all actions under their personal name.",
                "It disables the root account and replaces it with a guest account.",
                "It sends an SMS to the target server administrator.",
              ],
              correctIndex: 1,
              explanation:
                "Even though the target account is shared (root), the connection is brokered through PSM after the user authenticates as themselves, creating an immutable audit trail attributing all root commands to the named individual.",
              conceptTested: "Privileged Identity Non-Repudiation",
            },
          ],
          practicalExercise: {
            id: "ex-c04-01",
            title: "Discover Unmanaged Accounts & Fix Safe Mapping",
            scenario:
              "Inspect newly discovered accounts across the corp.gfs.local subnet, identify unmapped privileged objects, and ensure they are assigned to compliant Safes.",
            instructions: [
              "Navigate to the Discovery / Accounts console.",
              "Review accounts flagged as 'Unmanaged' or needing Safe reassignment.",
              "Map discovered accounts into appropriate operational Safes.",
              "Run the Learning Academy Class 04 validation engine to verify compliance.",
            ],
            targetConsole: "accounts",
            associatedLabId: "Lab 04 · Discover accounts & fix Safe mapping",
            validationObjectiveId: "id-discovery",
            validationCriteria: "Account discovery inventory evaluated and Safe mapping verified.",
          },
          completionCriteria: [
            "Understood the operational difference between human and non-human identities.",
            "Demonstrated identity attribution and non-repudiation via PSM session auditing.",
          ],
          references: [
            "CyberArk Discovery & Audit Integration Guide",
            "NIST SP 800-63B: Digital Identity Guidelines",
          ],
        },
      ],
    },
  ],
};
