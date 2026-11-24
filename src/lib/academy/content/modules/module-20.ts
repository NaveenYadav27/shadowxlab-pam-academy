/**
 * SHADOWXLAB PAM ACADEMY — MODULE 20: POST-COURSE ADMINISTRATOR ASSESSMENT
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_20: ClassCurriculum = {
  id: "module-20",
  number: "20",
  label: "MODULE 20",
  title: "Post-Course Administrator Assessment",
  subtitle: "Capstone Certification Exam & Comprehensive Scenario Evaluation",
  duration: "90 mins",
  level: "Advanced",
  track: "admin-20",
  category: "Diagnostic Mastery & Certification",
  overview:
    "The culminating qualification examination for the ShadowXLab PAM Enterprise Administrator certification. Evaluates cross-domain operational mastery across all 19 foundational domains: architecture topology, directory mapping, policy inheritance, Safe permissions, credential lifecycle, dependent synchronization, dual control, discovery pipelines, PSM session security, disaster recovery, cryptographic key management, error taxonomy, and systematic incident remediation.",
  modules: [
    {
      id: "m20-core",
      number: "M20",
      title: "Administrator Certification & Capstone Scenarios",
      description:
        "Comprehensive 25-scenario evaluation covering architecture, administration, security governance, and controlled emergency remediation.",
      lessons: [
        {
          id: "m20-l01",
          number: "20.1",
          title: "Enterprise PAM Administrator Certification Exam",
          subtitle:
            "Comprehensive 25-question scenario assessment and end-to-end operational capstone verification",
          estimatedMinutes: 45,
          learningObjectives: [
            "Demonstrate comprehensive theoretical and operational mastery across the 19 enterprise PAM administration domains.",
            "Synthesize architecture, permission scoping, platform policies, and session management to solve complex enterprise scenarios.",
            "Diagnose complex, multi-component failure cascades across Vault, CPM, PSM, and PVWA subsystems.",
            "Complete the hands-on operational capstone workflow verifying end-to-end credential stewardship in the live simulator.",
          ],
          prerequisites: [
            "Completion of Modules 01 through 19.",
            "Familiarity with all operational consoles in the ShadowXLab PAM simulator.",
          ],
          conceptIntroduction:
            "Enterprise Privileged Access Management is not a collection of isolated features; it is an integrated security ecosystem where a decision made in one subsystem directly influences the security and availability of the entire enterprise. A poorly configured Safe permission compromises the zero-knowledge guarantee of PSM; an uncoordinated password rotation on a parent account crashes dependent application services; an improperly tuned CPM interval degrades Vault database IOPS; and a neglected DR credential file exposes the organization to catastrophic data loss during regional outages.\n\nThis final capstone module evaluates your operational readiness as a certified enterprise PAM administrator. The assessment comprises two rigorous components:\n1. **25 Multi-Domain Scenario Questions**: Challenging technical scenarios reflecting real-world enterprise environments, failure modes, regulatory constraints, and cryptographic architectures across all 19 previous modules.\n2. **The Hands-on Capstone Workflow**: An end-to-end practical exercise requiring you to audit Safe permissions, onboard an unmanaged credential, execute pre-management verification, launch a brokered session, and resolve an incident in the live PAM simulator.\n\nAchieving a passing score demonstrates that you possess the theoretical depth and practical execution capabilities required to architect, govern, and troubleshoot enterprise privileged access infrastructure.",
          whyItExists:
            "Certification without rigorous scenario-based testing produces administrators who understand theory but falter during high-stress production outages. This capstone verifies real-world competence across the entire administrative lifecycle.",
          architecture: {
            overview:
              "The capstone assessment synthesizes the complete four-tier architecture: Vault Kernel (TCP 1858), PVWA Web Management, CPM Automation, and PSM Session Proxying.",
            componentResponsibilities: [
              {
                component: "Digital Vault Kernel",
                role: "Central cryptographic root of trust, Safe container host, and immutable audit ledger.",
                networkProtocols: "TCP 1858 (Proprietary Encrypted Protocol)",
                securityBoundary: "Tier-0 Air-Gapped Security Zone",
              },
              {
                component: "PVWA Operations Console",
                role: "Web administration gateway, request-approval engine, and reporting center.",
                networkProtocols: "HTTPS 443 Inbound; TCP 1858 Outbound to Vault",
                securityBoundary: "DMZ / Web Tier",
              },
              {
                component: "CPM Automation Worker",
                role: "Autonomous policy enforcement daemon executing password verification, rotation, and reconciliation.",
                networkProtocols: "TCP 1858 to Vault; Management RPC/SSH/SQL to targets",
                securityBoundary: "Management & Orchestration Tier",
              },
              {
                component: "PSM Session Bastion",
                role: "Air-gapped jump host proxy injecting vaulted credentials and recording keystroke/video sessions.",
                networkProtocols:
                  "RDP 3389 / HTTPS 443 Inbound; TCP 1858 to Vault; Target ports outbound",
                securityBoundary: "Bastion Proxy Subnet",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Certified Administrator Candidate",
                action:
                  "Initiates Module 20 capstone exam; reviews enterprise architecture scenarios.",
                channelOrProtocol: "PVWA Academy Interface",
                verificationRule:
                  "Candidate evaluates multi-domain architectural and operational trade-offs.",
              },
              {
                stepNumber: 2,
                actor: "Certified Administrator Candidate",
                action:
                  "Answers 25 scenario-based knowledge checkpoint questions covering Modules 01 through 19.",
                channelOrProtocol: "Interactive Checkpoint Engine",
                verificationRule:
                  "Scoring engine evaluates answers against verified enterprise best practices.",
              },
              {
                stepNumber: 3,
                actor: "Certified Administrator Candidate",
                action:
                  "Launches simulator capstone workflow: verifies Safe permissions, onboards credential, and verifies health.",
                channelOrProtocol: "Simulator Operations Consoles",
                verificationRule:
                  "Deterministic state engine validates execution of required operational tasks.",
              },
              {
                stepNumber: 4,
                actor: "Evaluation Engine",
                action:
                  "Computes cumulative score; generates certification outcome and updates learner transcript.",
                channelOrProtocol: "Certification Evaluation Ledger",
                verificationRule:
                  "Passing score (>= 80%) unlocks Administrator Qualification status.",
              },
            ],
          },
          terminology: [
            {
              term: "Enterprise PAM Administrator",
              definition:
                "A certified technical professional qualified to deploy, configure, govern, and troubleshoot enterprise privileged access infrastructure.",
              enterpriseContext:
                "Responsible for defending enterprise Tier-0 assets, enforcing least privilege, and ensuring regulatory compliance.",
            },
            {
              term: "Defense-in-Depth",
              definition:
                "A security architecture layering multiple defensive mechanisms (network zoning, OS hardening, envelope encryption, dual control, session recording).",
              enterpriseContext:
                "Guarantees that the compromise of any single component or credential does not yield access to the broader environment.",
            },
            {
              term: "Non-Repudiation",
              definition:
                "The assurance that an individual cannot deny the authenticity of their signature on a document or the sending of a message.",
              enterpriseContext:
                "Enforced in PAM via individual Directory Mapping, Dual Control approvals, and immutable Vault audit trails.",
            },
            {
              term: "Zero Standing Privileges (ZSP)",
              definition:
                "A modern security posture where human operators possess no static elevated credentials, receiving access only just-in-time via brokered sessions.",
              enterpriseContext:
                "The ultimate objective of mature enterprise Privileged Access Management programs.",
            },
          ],
          administratorResponsibilities: [
            "Maintain continuous 100% inventory coverage across on-premises, cloud, and hybrid infrastructure.",
            "Enforce least-privilege Safe membership and mandate Exclusive Checkout on all Tier-0 credentials.",
            "Conduct quarterly disaster recovery drills and audit physical Master Key escrow integrity.",
            "Lead incident response and root-cause analysis for all component outages and rotation failures.",
          ],
          configurationAndAdministration: [
            {
              name: "Continuous Compliance Baselines",
              settingOrObject: "Master Policy & Target Platforms",
              description:
                "Universal security rules mandating password rotation <= 90 days, session recording, and dual-control approval.",
              productionBestPractice:
                "Review Master Policy exceptions quarterly with Chief Information Security Officer (CISO).",
            },
            {
              name: "Disaster Recovery Readiness Audit",
              settingOrObject: "PADR Replication & Backup Repositories",
              description:
                "Continuous verification of sub-60-second replication latency and daily encrypted backup archives.",
              productionBestPractice:
                "Automate daily health check alerts verifying `padr.log` and `backup.log` completion statuses.",
            },
            {
              name: "Bastion Hardening Verification",
              settingOrObject: "Vault OS & PSM AppLocker Policies",
              description:
                "Strict isolation of component hosts with zero direct user access and drop-silent firewall rules.",
              productionBestPractice:
                "Re-run OS hardening and AppLocker verification scripts after every operating system patch cycle.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Review Assessment Instructions",
              action: "Carefully read all 25 scenario questions in the Knowledge Checkpoint panel.",
              expectedResult:
                "Questions cover architecture, Safes, accounts, dependents, PSM, DR, troubleshooting, and security.",
              operatorNotes:
                "Take your time: evaluate each scenario based on production best practices and root-cause evidence.",
            },
            {
              stepNumber: 2,
              title: "Execute Capstone Simulator Workflow",
              action:
                "Navigate across Accounts, Safes, CPM, and PSM consoles to verify system health and complete required lab tasks.",
              expectedResult:
                "All simulator objectives validated with green checkmarks in the evaluation checklist.",
            },
            {
              stepNumber: 3,
              title: "Submit Checkpoint Answers",
              action:
                "Select your answers for all 25 questions and review the detailed technical explanations.",
              expectedResult:
                "Answers recorded in learner progress store with instant feedback and score tabulation.",
            },
            {
              stepNumber: 4,
              title: "Final Certification Verification",
              action:
                "Confirm that all 20 modules in the Administrator Curriculum reflect completed status.",
              expectedResult:
                "Learner transcript registers 100% completion of the Flagship Administrator Curriculum.",
            },
          ],
          enterpriseScenario: {
            organization: "Global Sovereign Financial Network (GSFN)",
            businessContext:
              "GSFN provides sovereign debt clearing and cross-border currency settlement for 42 central banks, processing $2.8 trillion daily. Following a global regulatory audit by the Bank for International Settlements (BIS), GSFN mandated that all PAM engineering staff must demonstrate verified competency across multi-region high availability, envelope encryption, automated discovery, and zero-knowledge session management. You are serving as the Principal PAM Architect executing the final qualification audit.",
            governanceRequirements: [
              "Zero Tolerance for Standing Privileges: 100% of administrative workflows mediated via PSM proxies.",
              "Cryptographic Sovereignty: FIPS 140-2 Level 3 HSM key custody with M-of-N emergency physical escrow.",
              "Continuous Sub-15-Minute Recovery Time Objective (RTO) across international data centers.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Assessment score falls below 80% passing threshold.",
              rootCause:
                "Gaps in specific domain knowledge (e.g., Safe permission dependencies, error code classification, or DR failback).",
              securityImpact:
                "Candidate must review module instructional materials and re-attempt the assessment.",
              cyberArkCodeOrEvent: "QUAL-RETRY",
            },
            {
              symptom: "Simulator capstone exercise fails validation checklist.",
              rootCause:
                "One or more operational tasks (e.g. pre-verification, Safe membership, or session termination) omitted.",
              securityImpact:
                "Practical operational readiness unconfirmed; requires hands-on execution in simulator.",
              cyberArkCodeOrEvent: "LAB-INCOMPLETE",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Review question explanations for any incorrect answers.",
              logFileOrConsole: "PVWA Checkpoint Interface",
              remediation:
                "Re-read the corresponding module (e.g. Module 04 for Safe permissions, Module 15 for DR failover).",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Verify pending simulator lab objectives in the Live Objective Status checklist.",
              logFileOrConsole: "Practical Exercise Card",
              remediation:
                "Jump to the required operational console and execute the missing administrative action.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Re-run validation once all objectives report completed evidence.",
              logFileOrConsole: "Practical Exercise Card > Validate & Complete",
              remediation:
                "Confirms 100/100 score and seals capstone completion in learner progress.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\ShadowXLab\\Academy\\Certification.log",
              sampleOutput:
                "Candidate ID: PAM-ADMIN-QUAL-2026\nModule 20 Capstone Assessment: 25/25 Scenarios Evaluated.\nSimulator Operational Objectives: 100% Verified.\nFinal Qualification Status: CERTIFIED ENTERPRISE PAM ADMINISTRATOR.",
              explanation:
                "The candidate demonstrated complete theoretical mastery and practical operational competence across all 20 curriculum modules.",
            },
          ],
          instructorNotes: [
            "This assessment represents the gold standard of PAM administrator qualification. Treat each scenario as if it were an active production system holding live financial assets.",
            "Review your answers carefully: enterprise security demands precision. A single misconfigured permission or misunderstood error code can result in a production breach.",
            "Congratulations on completing the comprehensive 20-module administrator curriculum!",
          ],
          securityImplications: [
            "Human Capital Readiness: Certified administrators are the final and most critical defensive layer in enterprise cybersecurity.",
            "Operational Resilience: Rigorous training eliminates human configuration errors, preventing self-inflicted outages and security blind spots.",
            "Regulatory Trust: Proves to internal audit committees and external regulators that enterprise PAM infrastructure is governed by qualified experts.",
          ],
          knowledgeCheck: [
            {
              id: "m20-q01",
              question:
                "Which communication protocol and port is used exclusively for all inbound traffic to the Digital Vault kernel?",
              options: [
                "HTTPS over TCP Port 443",
                "Encrypted Vault Protocol over TCP Port 1858",
                "LDAPS over TCP Port 636",
                "RDP over TCP Port 3389",
              ],
              correctIndex: 1,
              explanation:
                "The Digital Vault communicates exclusively over its proprietary, hardened AES-256 encrypted protocol on TCP Port 1858. All component connections (PVWA, CPM, PSM) terminate on this port.",
              conceptTested: "Module 01: Core Architecture",
            },
            {
              id: "m20-q02",
              question:
                "What is the primary operational advantage of using Directory Mapping over creating local Vault users?",
              options: [
                "It eliminates the need for Master Keys.",
                "It ensures automated provisioning and immediate de-provisioning tied directly to Active Directory group membership.",
                "It allows passwords to be stored unencrypted.",
                "It bypasses the need for Safes.",
              ],
              correctIndex: 1,
              explanation:
                "Directory Mapping binds PAM access to corporate directory groups. When an employee is disabled or removed from a group in AD, their PAM access is revoked immediately across all Safes.",
              conceptTested: "Module 02: User Management",
            },
            {
              id: "m20-q03",
              question:
                "Why should an administrator NEVER modify out-of-the-box default platforms directly?",
              options: [
                "Default platforms are read-only and cannot be saved.",
                "Software upgrades can overwrite default platform files, destroying customizations; best practice is always to duplicate and edit the clone.",
                "Modifying default platforms causes the Vault license to terminate.",
                "Default platforms only work on Unix systems.",
              ],
              correctIndex: 1,
              explanation:
                "Vendor updates regularly patch and replace default platform templates. Customizing a cloned platform preserves your configurations across upgrades and prevents system regressions.",
              conceptTested: "Module 03: Policies and Platforms",
            },
            {
              id: "m20-q04",
              question:
                "Which Safe permission allows an engineer to launch a recorded session through PSM without ever viewing or copying the plaintext password?",
              options: ["Retrieve accounts", "Use accounts", "Manage Safe", "Unlock accounts"],
              correctIndex: 1,
              explanation:
                "'Use accounts' allows transparent session initiation via PSM without exposing the plaintext secret. 'Retrieve accounts' allows viewing the actual password and must be strictly restricted.",
              conceptTested: "Module 04: Safes & Permissions",
            },
            {
              id: "m20-q05",
              question:
                "Which five properties are fundamentally required to onboard an Account Object in the Digital Vault?",
              options: [
                "Safe, Platform, Address, Username, and Secret (Password/Key)",
                "IP Address, MAC Address, Domain, User Group, and Safe",
                "Platform, Operating System, RAM, CPU, and Secret",
                "Username, Ticket Number, Email, Department, and Phone",
              ],
              correctIndex: 0,
              explanation:
                "Every Account Object requires Safe (container), Platform (policy), Address (target host), Username (identifier), and Secret (credential payload).",
              conceptTested: "Module 05: Accounts Part 1",
            },
            {
              id: "m20-q06",
              question:
                "Why does a standard CPM 'Change' operation fail when an account's password has become desynchronized out-of-band on the target system?",
              options: [
                "Because the CPM service stops.",
                "Because a standard Change operation requires authenticating with the old password first; if the Vault's recorded password does not match the target, authentication fails.",
                "Because the target host firewall automatically blocks port 1858.",
                "Because the Vault database is locked.",
              ],
              correctIndex: 1,
              explanation:
                "Standard CPM password changes authenticate to the target using the existing password before setting the new one. If out of sync, authentication fails. Reconcile overcomes this by using a separate elevated administrator.",
              conceptTested: "Module 06: Accounts Part 2 (Reconcile)",
            },
            {
              id: "m20-q07",
              question:
                "What catastrophic failure occurs if a domain service account password is changed in Active Directory without updating remote services that run under it?",
              options: [
                "The target hard drive is erased.",
                "The remote services fail to authenticate, trigger account lockouts in Active Directory, and crash with Win32 Error 1069.",
                "The Vault Master Key is invalidated.",
                "The PVWA web portal becomes inaccessible.",
              ],
              correctIndex: 1,
              explanation:
                "Services attempting to connect using the old cached password cause Active Directory to detect repeated logon failures, locking out the service account and crashing production services with Win32 Error 1069.",
              conceptTested: "Module 07: Dependents (Usages)",
            },
            {
              id: "m20-q08",
              question:
                "Which Safe permission MUST a manager possess to be an authorized approver for dual-control access requests in that Safe?",
              options: [
                "Access without confirmation",
                "Authorize account access",
                "Manage Safe",
                "Retrieve accounts",
              ],
              correctIndex: 1,
              explanation:
                "The 'Authorize account access' permission specifically designates the user or group as an authorized Approver capable of granting or rejecting access requests.",
              conceptTested: "Module 08: Workflows (Dual Control)",
            },
            {
              id: "m20-q09",
              question:
                "What is the primary function of an Auto-Onboarding Rule in enterprise discovery workflows?",
              options: [
                "To reboot the Vault server nightly.",
                "To automatically evaluate pending discovered accounts against criteria and onboard matching accounts into designated Safes and Platforms without manual triage.",
                "To delete target operating systems from Active Directory.",
                "To bypass Multi-Factor Authentication.",
              ],
              correctIndex: 1,
              explanation:
                "Auto-Onboarding Rules automate intake: when discovery scans find new systems, rules automatically bind them to the correct Safe, Platform, and rotation schedule without human intervention.",
              conceptTested: "Module 09: Discovery and Onboarding",
            },
            {
              id: "m20-q10",
              question:
                "How does the Privileged Session Manager (PSM) achieve zero-knowledge credential isolation for administrative users?",
              options: [
                "By emailing the password to the user in a text file.",
                "By air-gapping the connection: the user connects to PSM; the PSM retrieves the credential from the Vault and injects it directly into the target protocol stream without revealing plaintext.",
                "By disabling encryption on the target server.",
                "By requiring users to memorize a 64-character password.",
              ],
              correctIndex: 1,
              explanation:
                "PSM acts as an isolated jump proxy. The user connects only to PSM; PSM fetches the secret from the Vault into memory and injects it into the target protocol, ensuring users never handle or view cleartext credentials.",
              conceptTested: "Module 10: PSM Part 1",
            },
            {
              id: "m20-q11",
              question:
                "What dual recording streams does the Privileged Session Manager (PSM) capture concurrently during an active session?",
              options: [
                "Audio from the microphone and GPS coordinates.",
                "Synchronized optical video frame deltas and text-indexed keystroke inputs.",
                "Network router NetFlow and temperature logs.",
                "Power consumption and disk drive speeds.",
              ],
              correctIndex: 1,
              explanation:
                "PSM captures both compressed optical video frames (visual evidence) and an indexed text stream of typed keystrokes and window titles (enabling instant search across recordings).",
              conceptTested: "Module 11: PSM Part 2",
            },
            {
              id: "m20-q12",
              question:
                "Why is the Digital Vault audit trail described as 'cryptographically immutable'?",
              options: [
                "Because it is written onto write-once optical CD-ROMs.",
                "Because audit records are stored in append-only tables encrypted with Vault master keys, and cannot be edited or deleted by any user or administrator.",
                "Because audit logs are deleted after 24 hours.",
                "Because only Microsoft can read the log files.",
              ],
              correctIndex: 1,
              explanation:
                "The Vault kernel enforces strict append-only immutability. Historical records cannot be altered or purged even by Master administrators, ensuring non-repudiable forensic evidence.",
              conceptTested: "Module 12: Reports & Audit Trails",
            },
            {
              id: "m20-q13",
              question:
                "Why should a production Digital Vault server host NEVER be joined to an enterprise Active Directory domain?",
              options: [
                "Because Windows Server does not support Active Directory.",
                "To prevent a domain-level compromise (such as a compromised Domain Admin or Kerberos attack) from compromising the Vault operating system.",
                "Because domain joining makes the server run slower.",
                "Because domain controllers block port 1858.",
              ],
              correctIndex: 1,
              explanation:
                "The Vault must remain an independent root of trust. Joining it to Active Directory subordinates the Vault's OS security to domain administrators, creating a critical circular vulnerability.",
              conceptTested: "Module 13: Self-Hosted Architecture",
            },
            {
              id: "m20-q14",
              question:
                "Why does the Digital Vault utilize a native backup utility (PARASW) rather than standard third-party backup agents installed on the host?",
              options: [
                "Because third-party agents are too expensive.",
                "To preserve the Vault's OS hardening and isolation boundary, preventing third-party software vulnerabilities and unmonitored services from running on the bastion host.",
                "Because Windows Server cannot back up files.",
                "Because the Vault database cannot be backed up.",
              ],
              correctIndex: 1,
              explanation:
                "Installing third-party software on the Vault violates bastion hardening standards. The native backup utility connects remotely over TCP 1858 from an authorized external backup host.",
              conceptTested: "Module 14: Backup and Restore",
            },
            {
              id: "m20-q15",
              question:
                "What catastrophic operational condition occurs if a network partition causes both the Primary Vault and DR Vault to act as active Primaries simultaneously?",
              options: [
                "The computer monitors will turn off.",
                "A Split-Brain condition, causing conflicting password rotations, divergent database versions, and corrupted credential state.",
                "The user licenses are automatically doubled.",
                "All user accounts are converted to guest users.",
              ],
              correctIndex: 1,
              explanation:
                "Split-brain occurs when both Vaults accept write operations independently. When the network reconnects, the databases have diverged irreconcilably, corrupting production passwords.",
              conceptTested: "Module 15: Disaster Recovery",
            },
            {
              id: "m20-q16",
              question:
                "What is the primary function of the 'Server.key' in the Digital Vault cryptographic hierarchy?",
              options: [
                "It is used by end users to log into the PVWA portal.",
                "It is the master symmetric key used by the running Vault server to encrypt and decrypt the individual Safe Keys.",
                "It is the SSL certificate used for HTTPS browsing.",
                "It is used to license the number of EPV users.",
              ],
              correctIndex: 1,
              explanation:
                "The Server Key acts as the key-encryption-key (KEK) in the envelope hierarchy. It wraps and unwraps the Safe Keys, which in turn encrypt the individual account secrets.",
              conceptTested: "Module 16: Vault Security & Cryptography",
            },
            {
              id: "m20-q17",
              question:
                "What is the primary function of a Component Heartbeat in the PAM architecture?",
              options: [
                "To rotate domain passwords automatically.",
                "To allow components (CPM, PSM, PVWA) to periodically report their operational health, service status, and active load to the Vault database.",
                "To reboot the user's laptop.",
                "To export video files to YouTube.",
              ],
              correctIndex: 1,
              explanation:
                "Component heartbeats provide continuous telemetry on port 1858, allowing the Vault and PVWA System Health dashboard to monitor cluster node availability in real time.",
              conceptTested: "Module 17: System Monitoring",
            },
            {
              id: "m20-q18",
              question:
                "What is the primary architectural difference between error code CACPM072E and error code CACPM250E?",
              options: [
                "CACPM072E is for Linux; CACPM250E is for Windows.",
                "CACPM072E indicates an infrastructure failure connecting to the Vault or missing Safe permissions; CACPM250E indicates an authentication or execution failure on the target endpoint.",
                "CACPM072E indicates license expiration; CACPM250E indicates network cable unplugged.",
                "There is no difference.",
              ],
              correctIndex: 1,
              explanation:
                "CACPM072E represents communication between CPM and the Vault (e.g. missing Safe membership); CACPM250E represents communication between CPM and the remote target system (e.g. bad password or access denied on target).",
              conceptTested: "Module 18: Common Issues",
            },
            {
              id: "m20-q19",
              question:
                "What is Step 1 of the 5-Step Systematic Diagnostic Protocol in enterprise PAM troubleshooting?",
              options: [
                "Reboot the Vault server immediately.",
                "Symptom & Scope Analysis: Determine the blast radius and isolate whether the failure is global, regional, or specific to a single account/platform.",
                "Delete the failing accounts and re-create them.",
                "Re-install Windows on the CPM server.",
              ],
              correctIndex: 1,
              explanation:
                "Step 1 is always Scope & Symptom Analysis. Determining the boundary of the failure prevents administrators from making unnecessary and dangerous changes to unaffected subsystems.",
              conceptTested: "Module 19: Troubleshooting Runbooks",
            },
            {
              id: "m20-q20",
              question:
                "Which utility is used to regenerate encrypted, machine-bound credential files (user.ini) when a component encounters error ITATS004E?",
              options: ["CreateCredFile.exe", "notepad.exe", "diskpart.exe", "FormatVault.exe"],
              correctIndex: 0,
              explanation:
                "CreateCredFile.exe generates encrypted credential files bound to the local machine's cryptographic hardware token and executable path, restoring authenticated component communication with the Vault.",
              conceptTested: "Module 19: Credential File Regeneration",
            },
            {
              id: "m20-q21",
              question:
                "When a user launching a session through PSM receives error PSMSR126E, which subsystem on the PSM host is responsible for blocking the execution?",
              options: [
                "Windows Defender Antivirus",
                "Windows AppLocker",
                "PrivateArk Database",
                "Microsoft IIS Web Server",
              ],
              correctIndex: 1,
              explanation:
                "PSMSR126E specifically indicates an AppLocker execution block on the PSM RDS host. The executable must be added to PSMConfigureAppLocker.xml and re-applied.",
              conceptTested: "Module 18: PSMSR126E AppLocker Mechanics",
            },
            {
              id: "m20-q22",
              question:
                "Why is a Hardware Security Module (HSM) used in high-assurance PAM deployments?",
              options: [
                "To speed up internet browsing.",
                "To store and execute operations with the Vault Server Key inside tamper-resistant hardware silicon, preventing the key from ever existing as a plaintext file on disk.",
                "To automatically create Active Directory user accounts.",
                "To record audio during remote desktop sessions.",
              ],
              correctIndex: 1,
              explanation:
                "An HSM provides FIPS 140-2 Level 3 hardware protection. Keys cannot be extracted, cloned, or dumped from memory, neutralizing memory-scraping and physical theft vectors.",
              conceptTested: "Module 16: Hardware Security Modules (HSM)",
            },
            {
              id: "m20-q23",
              question: "What does the 'MinValidityPeriod' setting on a target platform enforce?",
              options: [
                "How many days a user has worked at the company.",
                "The minimum duration (in minutes) a credential must remain valid after checkout before the CPM executes an automated post-use rotation.",
                "The SSL certificate expiration date.",
                "The minimum RAM required on the server.",
              ],
              correctIndex: 1,
              explanation:
                "MinValidityPeriod guarantees that the user has a sufficient window of time (e.g., 60 minutes) to perform their work before the Central Policy Manager automatically changes the password on the target endpoint.",
              conceptTested: "Module 03: MinValidityPeriod & OTP Mechanics",
            },
            {
              id: "m20-q24",
              question:
                "Where are newly discovered accounts stored prior to being matched by an auto-onboarding rule or approved by an administrator?",
              options: [
                "In the Windows Recycle Bin.",
                "In the Pending Accounts queue in the PVWA.",
                "In an unencrypted text file on the CPM server.",
                "Directly in the Master Safe with full administrative rights.",
              ],
              correctIndex: 1,
              explanation:
                "Discovered accounts that have not yet been onboarded reside in the 'Pending Accounts' staging queue in the PVWA, where administrators can review, onboard, or dismiss them.",
              conceptTested: "Module 09: Pending Accounts Queue",
            },
            {
              id: "m20-q25",
              question:
                "What action should an administrator take immediately if a Split-Brain condition is detected between Primary and DR Vaults?",
              options: [
                "Allow both Vaults to continue running until the weekend.",
                "Immediately halt the PrivateArk Server service on the secondary/unauthorized node to prevent further database divergence, isolate the primary, and execute a controlled resynchronization.",
                "Reboot all client workstations in the company.",
                "Delete all Safes from the Primary Vault.",
              ],
              correctIndex: 1,
              explanation:
                "In a split-brain event, immediate action is required to halt write operations on the rogue node. Stopping the database engine halts divergence; administrators can then determine the authoritative dataset and re-establish replication.",
              conceptTested: "Module 15: Split-Brain Emergency Response",
            },
          ],
          practicalExercise: {
            id: "m20-ex01",
            title: "Execute Enterprise PAM Administrator Capstone Workflow",
            objective:
              "Demonstrate end-to-end PAM administration readiness across Dashboard, Safes, Accounts/CPM, PSM, and Reports & Audit, pass the 25-question certification exam (>= 80%), and validate the capstone control-plane state.",
            scenario:
              "Complete the final capstone qualification check across the full PAM lifecycle: verify control-plane health, confirm least-privilege Safe boundaries, validate Managed account status, confirm audited PSM session lifecycle, and pass the 25-question certification assessment.",
            prerequisites: [
              "Completed Modules 01–19 or equivalent hands-on mastery across Safes, Accounts, CPM, PSM, and Troubleshooting.",
            ],
            startingState:
              "Full enterprise PAM simulator active across all consoles; 25-question certification exam loaded in Knowledge Checkpoints.",
            instructions: [
              "Open Dashboard and verify Vault, PVWA, CPM, and PSM report healthy online status.",
              "Confirm least-privilege Safe boundaries in Safes (`DBA-SAFE` without Retrieve accounts for `dba_user`) and Managed credentials in Accounts.",
              "Verify audited CPM rotation and terminated PSM session records exist in Reports & Audit.",
              "Complete the 25-question Enterprise PAM Administrator Certification Exam in Knowledge Checkpoints (score >= 20/25, 80%), then validate and complete Module 20.",
            ],
            stepDetails: [
              {
                action:
                  "Open Dashboard and verify all four PAS control-plane components are healthy.",
                explanation:
                  "Confirms baseline operational readiness across Vault, PVWA, CPM, and PSM.",
                expectedResult: "All four services display active status in Platform Health.",
              },
              {
                action: "Verify Safes, Accounts, CPM, and PSM audit evidence in Reports & Audit.",
                explanation:
                  "Demonstrates end-to-end operational traceability across every PAM lifecycle stage.",
                expectedResult:
                  "Audit ledger shows Verified/Changed credentials, Safe governance, and terminated PSM session records.",
              },
              {
                action:
                  "Complete all 25 certification exam questions (achieving >= 80% / 20 correct) and click 'Validate Simulator State & Record Lab Completion'.",
                explanation:
                  "Module 20 enforces realistic certification readiness: both live simulator validation and >= 80% exam mastery are required before marking the track complete.",
                expectedResult:
                  "Lab validation passes (100/100), exam passes (>= 80%), and Module 20 unlocks final track completion.",
              },
            ],
            targetConsole: "overview",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "id-vault",
            validationCriteria:
              "All capstone control-plane validation checks passed (7/7 Lab 01 objectives) alongside >= 80% on the 25-question exam.",
            troubleshootingHints: [
              {
                symptom: "'Complete Lesson' remains locked after validating the capstone lab.",
                hint: "Module 20 requires scoring at least 20/25 (80%) on the Knowledge Checkpoint certification exam.",
                correctiveAction:
                  "Review missed questions in the Knowledge Checkpoints panel, retry until you reach >= 20/25, and then click Complete Lesson.",
              },
            ],
            independentPractice: {
              title: "Full-Lifecycle Unassisted Verification Drill",
              scenario:
                "Simulate an unassisted production handover review before receiving final certification sign-off.",
              goal: "Without step-by-step guidance, confirm zero failed CPM accounts, at least one sealed PSM session, and least-privilege DBA-SAFE membership across the consoles.",
              targetConsole: "audit",
              successCriteria: [
                "Verified `DBA-SAFE` enforces least privilege without Retrieve accounts for `dba_user`.",
                "Verified `svc_backup` recovery or documented exception status and reviewed full audit trail in Reports & Audit.",
              ],
            },
          },
          completionCriteria: [
            "Completed all 25 multi-domain scenario assessment questions with passing score.",
            "Demonstrated theoretical and operational mastery across the 19 enterprise administration domains.",
            "Executed the end-to-end simulator capstone qualification workflow.",
            "Achieved certified Enterprise PAM Administrator qualification.",
          ],
          references: [
            "ShadowXLab PAM Academy: Enterprise Administrator Certification Standards",
            "NIST SP 800-53 Rev 5: Security and Privacy Controls for Information Systems and Organizations",
            "CIS Benchmarks for Privileged Access Management and Zero Trust Architecture",
          ],
        },
      ],
    },
  ],
};
