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
            title: "Classify Enterprise Identity Inventory & Flag Governance Exceptions",
            objective:
              "Classify human, service, shared, and database identities in the simulated inventory, verify 100% owner attribution, and flag unmanaged and rotation-failed exceptions.",
            scenario:
              "Audit the enterprise inventory across corp.gfs.local to confirm accountable owners, inspect the shared emergency identity (shared_ops), identify the unmanaged Oracle account (oracle on DB-ORA-01), and flag the failed backup service account (svc_backup).",
            prerequisites: [
              "Review Human vs. Non-Human identity governance and ownership in Section 1–4.",
            ],
            startingState:
              "Inventory includes human, service (svc_backup, svc_sql, svc_payment), database (oracle Unmanaged, db_admin Managed), and shared (shared_ops in EMERGENCY-SAFE) accounts.",
            instructions: [
              "Open the Accounts console and filter/inspect the identity archetypes (human administrator, service account, database account, shared privileged).",
              "Confirm that every account lists an accountable owner and locate shared_ops inside EMERGENCY-SAFE.",
              "Identify the two governance exceptions: oracle on DB-ORA-01 (status: Unmanaged) and svc_backup on WIN-SRV-02 (status: Rotation failed).",
              "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion' to verify all 6 Lab 04 objectives.",
            ],
            stepDetails: [
              {
                action: "Open the Accounts console and inspect the Account Type and Owner columns.",
                explanation:
                  "Every privileged identity—human or non-human—requires a named technical custodian or business owner.",
                expectedResult:
                  "All inventory records show named owners across human, service, database, and shared categories.",
              },
              {
                action:
                  "Locate shared_ops (WIN-SRV-01) and verify it is isolated in EMERGENCY-SAFE.",
                explanation:
                  "Shared privileged accounts must be isolated in dual-control emergency Safes for attribution.",
                expectedResult: "shared_ops displays type Shared privileged in EMERGENCY-SAFE.",
              },
              {
                action:
                  "Inspect oracle (DB-ORA-01, Unmanaged) and svc_backup (WIN-SRV-02, Rotation failed).",
                explanation:
                  "Unmanaged credentials and failed service-account rotations represent top audit findings.",
                expectedResult:
                  "Both exceptions are identified with clear status and failure/ownership metadata.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation:
                  "Validates all 6 Lab 04 inventory classification and exception-identification objectives.",
                expectedResult: "All 6/6 Lab 04 objectives pass (100/100).",
              },
            ],
            targetConsole: "accounts",
            associatedLabId: "Lab 04 · Classify the enterprise inventory",
            validationObjectiveId: "classify-types",
            validationCriteria:
              "All 6 Lab 04 identity classification, owner attribution, and exception objectives verified.",
            troubleshootingHints: [
              {
                symptom: "'Identify unmanaged database identity (oracle on DB-ORA-01)' fails.",
                hint: "If you already rotated or verified oracle on DB-ORA-01, its status may have changed from Unmanaged.",
                correctiveAction:
                  "Check oracle on DB-ORA-01 in Accounts. If you already converted it to Managed during another test, click Reset Simulator to restore the baseline unmanaged candidate, then re-validate.",
              },
            ],
            independentPractice: {
              title: "Run a Live Account Discovery Scan & Onboard a Discovered Account",
              scenario:
                "Security Operations suspects additional unmanaged accounts exist on the enterprise network.",
              goal: "Use the Discovery console without step-by-step guidance to run a discovery scan and onboard one discovered privileged account into an appropriate Safe.",
              targetConsole: "discovery",
              successCriteria: [
                "Triggered a discovery scan in the Discovery console.",
                "Reviewed a discovered account's risk/platform metadata and onboarded it into a compliant Safe.",
              ],
            },
          },
          completionCriteria: [
            "Understood the operational difference between human and non-human identities.",
            "Classified the enterprise inventory and validated Lab 04 governance exceptions.",
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
