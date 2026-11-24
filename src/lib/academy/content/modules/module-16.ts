/**
 * SHADOWXLAB PAM ACADEMY — MODULE 16: VAULT SECURITY
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_16: ClassCurriculum = {
  id: "module-16",
  number: "16",
  label: "MODULE 16",
  title: "Vault Security",
  subtitle: "Cryptographic Architecture, Key Management & Bastion Hardening",
  duration: "50 mins",
  level: "Advanced",
  track: "admin-20",
  category: "Self-Hosted Infrastructure & Hardening",
  overview:
    "Master the internal cryptographic engine and defense-in-depth security perimeter of the Digital Vault. Deconstruct multi-layer envelope encryption (AES-256), cryptographic key hierarchies (Server.key, Recovery.key, Safe Keys), Hardware Security Module (HSM) integration via PKCS#11, physical/hypervisor air-gapping, and M-of-N split-custody emergency access governance.",
  modules: [
    {
      id: "m16-core",
      number: "M16",
      title: "Cryptographic Architecture & Key Custody",
      description:
        "Technical analysis of symmetric key hierarchies, HSM integration, envelope encryption models, and emergency physical key escrow.",
      lessons: [
        {
          id: "m16-l01",
          number: "16.1",
          title: "Envelope Encryption, Key Hierarchies & HSM Integration",
          subtitle:
            "Deconstructing AES-256 envelope encryption, HSM hardware roots of trust, and dual-custody key escrow",
          estimatedMinutes: 25,
          learningObjectives: [
            "Deconstruct the multi-tier cryptographic key hierarchy: Master Recovery Key -> Server Key -> Safe Keys -> Object Secrets.",
            "Analyze AES-256 envelope encryption and compare software key storage with Hardware Security Module (HSM) integration.",
            "Formulate physical key escrow policies using M-of-N secret sharing (Shamir's Secret Sharing) for emergency recovery.",
            "Audit the Vault security perimeter against side-channel, cold-boot, and hypervisor-level threat vectors.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 04: Safes.",
            "Module 13: Self-Hosted Architecture.",
          ],
          conceptIntroduction:
            "The Digital Vault is designed under the assumption that the surrounding enterprise network has already been fully compromised by a sophisticated adversary. The Vault does not rely on Windows domain security, perimeter firewalls, or standard operating system permissions to protect secrets. Instead, it relies on a mathematically rigorous, multi-tier **Cryptographic Envelope Architecture**.\n\nEvery secret stored in the Vault is encrypted using standard AES-256-CBC/GCM. However, a single global key is never used to encrypt all data. Instead, the architecture utilizes a hierarchy of keys:\n1. **Object Level**: Each individual password or SSH key is encrypted with a unique key.\n2. **Safe Level**: Each Safe has its own unique **Safe Key**. The Safe Key encrypts all object keys inside that Safe container.\n3. **Server Level**: The **Server Key (`Server.key`)** encrypts all Safe Keys. It resides in memory on the Vault server while the service is running.\n4. **Recovery / Master Level**: The ultimate root of trust is the **Recovery Key (`Recovery.key`)**. It is never stored on the Vault server's hard drive. It exists exclusively on offline physical media (or within a FIPS 140-2 Level 3 HSM).\n\nIf an attacker steals the physical hard drives from a decommissioned Vault server, all data on the disk remains an unreadable blob of ciphertext. Without the Server Key (or Master Key), mathematical decryption is computationally infeasible. In high-assurance environments, the Server Key is stored inside a network-attached **Hardware Security Module (HSM)**, ensuring that cryptographic operations occur inside tamper-resistant hardware silicon where keys can never be extracted into host RAM.",
          whyItExists:
            "Without multi-tiered envelope encryption and hardware roots of trust, any administrator with hypervisor access or physical disk access could dump plaintext enterprise secrets. The cryptographic architecture ensures zero-knowledge protection even against rogue infrastructure admins.",
          architecture: {
            overview:
              "The cryptographic hierarchy cascades from the Root Master Key down to individual account secrets, ensuring that compromise of a lower-tier key does not compromise the broader Vault.",
            componentResponsibilities: [
              {
                component: "Hardware Security Module (HSM)",
                role: "Dedicated cryptographic hardware appliance (FIPS 140-2 Level 3) generating, storing, and executing operations with the Vault Server Key.",
                networkProtocols: "PKCS#11 API over dedicated TLS network link",
                securityBoundary: "Hardware Tamper-Proof Cryptographic Boundary",
              },
              {
                component: "Server Key (Server.key)",
                role: "Master symmetric key wrapping all individual Safe Keys. Loaded into Vault memory upon service initialization.",
                networkProtocols: "Encrypted memory allocation",
                securityBoundary: "Vault Runtime Memory Kernel",
              },
              {
                component: "Safe Keys",
                role: "Individual symmetric keys per Safe container. Wraps account object secrets; guarantees Safe-level cryptographic isolation.",
                networkProtocols: "Stored encrypted in Vault database",
                securityBoundary: "Safe Cryptographic Compartment",
              },
              {
                component: "Emergency Recovery Key",
                role: "Offline air-gapped cryptographic escrow key used to mount the database if the Server Key or HSM is destroyed.",
                networkProtocols: "Air-gapped physical media",
                securityBoundary: "Physical Dual-Custody Safe",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "PrivateArk Server Service Startup",
                action:
                  "Service initializes on Vault host; requests Server Key from local secure store or network HSM via PKCS#11.",
                channelOrProtocol: "PKCS#11 Cryptographic Call",
                verificationRule:
                  "HSM validates Vault client certificate and releases Server Key handle.",
              },
              {
                stepNumber: 2,
                actor: "Vault Cryptographic Engine",
                action:
                  "Uses Server Key to decrypt the Safe Key for `FINANCE-SAFE` stored in the encrypted database catalog.",
                channelOrProtocol: "AES-256 Key Unwrap",
                verificationRule:
                  "Cryptographic checksum matches; Safe Key loaded into isolated memory buffer.",
              },
              {
                stepNumber: 3,
                actor: "User Checkout Request",
                action: "User requests password for `FIN-SRV-01\\Administrator`.",
                channelOrProtocol: "TCP 1858 Request",
                verificationRule:
                  "Vault validates user Safe permissions; uses Safe Key to decrypt the specific account secret payload.",
              },
              {
                stepNumber: 4,
                actor: "Vault Kernel",
                action:
                  "Transmits decrypted secret across TCP 1858 TLS session directly to PSM memory; wipes decrypted buffer immediately.",
                channelOrProtocol: "Encrypted Vault Protocol (TCP 1858)",
                verificationRule:
                  "Memory buffer overwritten with zeros; zero cleartext residual left in storage or RAM.",
              },
            ],
          },
          terminology: [
            {
              term: "Envelope Encryption",
              definition:
                "A cryptographic practice of encrypting plaintext data with a data key, and then encrypting the data key with another key (key-wrapping).",
              enterpriseContext:
                "Enables fast re-keying and compartmentalization: rotating a Master Key does not require re-encrypting terabytes of data.",
            },
            {
              term: "Hardware Security Module (HSM)",
              definition:
                "A physical computing device that safeguards and manages digital keys, performing encryption and decryption inside a tamper-resistant enclosure.",
              enterpriseContext:
                "Common enterprise HSMs include Thales Luna, Entrust nShield, and AWS CloudHSM.",
            },
            {
              term: "Server.key",
              definition:
                "The symmetric key used by the running PrivateArk Server to decrypt Safe keys and database tables.",
              enterpriseContext:
                "Must be backed up to physical media during initial Vault installation; losing this key destroys the Vault.",
            },
            {
              term: "Recovery.key (Master Key)",
              definition:
                "The emergency root cryptographic key used to recover a Vault when standard operating keys are damaged.",
              enterpriseContext:
                "Split into physical custody shares using M-of-N algorithms; never stored on running servers.",
            },
            {
              term: "M-of-N Dual Custody",
              definition:
                "A security control requiring M out of N authorized key custodians (e.g. 2 of 3 executives) to be present to unlock an emergency key.",
              enterpriseContext:
                "Prevents a single rogue security administrator from unilaterally decrypting the entire corporate Vault.",
            },
          ],
          administratorResponsibilities: [
            "Maintain physical dual-custody control of all emergency recovery media in fireproof, biometric safes.",
            "Ensure HSM client software and PKCS#11 libraries are updated and certified for PAM compatibility.",
            "Perform an annual key escrow audit: verify that sealed envelopes containing recovery keys remain untampered.",
            "Verify that memory dump generation is disabled on the Vault OS to prevent keys from leaking into crash dump files.",
          ],
          configurationAndAdministration: [
            {
              name: "ServerKey Parameter in dbparm.ini",
              settingOrObject: "C:\\Program Files (x86)\\PrivateArk\\Server\\dbparm.ini",
              description:
                "Points to the path of the Server Key (local file path or PKCS#11 slot reference).",
              productionBestPractice:
                "In HSM environments, configure `ServerKey=PKCS11` with the slot ID and cryptographic pin.",
            },
            {
              name: "Memory Dump Disablement",
              settingOrObject: "Windows Crash Control Settings on Vault Host",
              description:
                "Disables automatic memory dumps (`CrashDumpEnabled = 0`) on system BSOD.",
              productionBestPractice:
                "Mandatory hardening requirement: prevents unencrypted keys in RAM from being written to `MEMORY.DMP` on disk.",
            },
            {
              name: "FIPS 140-2 Mode Enforcement",
              settingOrObject: "dbparm.ini / FIPSMode = Yes",
              description:
                "Enforces strict adherence to FIPS 140-2 approved cryptographic algorithms and cipher suites.",
              productionBestPractice:
                "Enable FIPSMode = Yes to satisfy federal and defense compliance mandates.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Inspect HSM Integration Status",
              action:
                "On the Vault host, execute the PKCS#11 diagnostic utility to test communication with the HSM appliance.",
              expectedResult:
                "Diagnostic utility connects, authenticates to cryptographic slot, and reports 'HSM Key Available'.",
              operatorNotes:
                "If failed, verify dedicated network link to HSM appliance and check token PIN status.",
            },
            {
              stepNumber: 2,
              title: "Verify Cryptographic Configuration",
              action:
                "Review `dbparm.ini` on the Vault server to confirm ServerKey and cryptographic cipher suite parameters.",
              expectedResult:
                "AES-256 configured; ServerKey properly referenced; FIPS mode enabled.",
            },
            {
              stepNumber: 3,
              title: "Execute Physical Key Escrow Audit",
              action:
                "Inspect physical tamper-evident key storage bags in corporate safe. Verify seal numbers match log register.",
              expectedResult:
                "Tamper-evident seals intact; signatures of dual custodians verified.",
            },
            {
              stepNumber: 4,
              title: "Validate Safe Key Cryptographic Integrity",
              action:
                "In PrivateArk Client, run database consistency check (PASTool / CheckDatabase).",
              expectedResult:
                "All Safe keys decrypt cleanly; zero cryptographic corruption or key mismatch errors reported.",
            },
          ],
          enterpriseScenario: {
            organization: "Fortress Federal Credit Union",
            businessContext:
              "Fortress FCU manages banking services for 2.4 million members. During an unannounced penetration test by national regulators, physical security auditors simulated the theft of a decommissioned Vault server hard drive from an e-waste disposal cage. The auditors mounted the raw drive in a forensic lab and attempted to extract database credentials. Because the PAM architecture utilized AES-256 envelope encryption with Server Keys stored inside a FIPS 140-2 Level 3 HSM, the forensic analysis yielded zero intelligible data, validating 100% compliance with NCUA security standards.",
            governanceRequirements: [
              "FIPS 140-2 Level 3 Hardware Security Module (HSM) mandatory for all root cryptographic key storage.",
              "Physical dual-custody key escrow: emergency recovery keys split between CISO and Chief Risk Officer.",
              "Disabling of all OS crash dumps and hibernation files to prevent RAM key extraction.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Vault service fails to start: 'ITATS001E Cannot find or open Server.key'.",
              rootCause:
                "The Server Key file path in dbparm.ini is invalid, the removable key drive was not mounted, or HSM network dropped.",
              securityImpact:
                "Vault completely offline; cannot decrypt database without the Server Key.",
              cyberArkCodeOrEvent: "ITATS001E",
            },
            {
              symptom:
                "HSM communication failure: 'PKCS#11 C_Initialize failed: Slot not available'.",
              rootCause:
                "The HSM network interface went down or the HSM partition was zeroized due to consecutive bad PIN attempts.",
              securityImpact:
                "Vault cannot access cryptographic hardware root; operations blocked.",
              cyberArkCodeOrEvent: "HSM-ERR-01",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Inspect PrivateArk Server startup console or italog.log for cryptographic initialization errors.",
              logFileOrConsole: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              remediation:
                "Search for ITATS001E or ITATS003E. Verify whether Server.key file is present or HSM token is mounted.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Test HSM reachability and verify PKCS#11 library bindings.",
              logFileOrConsole: "HSM Client Management Tools / italog.log",
              remediation:
                "Verify IP routing on dedicated HSM network interface and check HSM partition status.",
            },
            {
              stepNumber: 3,
              diagnosticAction:
                "In disaster recovery, retrieve emergency Master Recovery Keys from physical custody.",
              logFileOrConsole: "Physical Corporate Safe Escrow",
              remediation:
                "Under dual-custody supervision, use `Recovery.key` to mount the database and generate a replacement Server Key.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 08:00:01 Cryptographic Engine: Initializing AES-256 GCM envelope provider.\nServerKey loaded successfully from PKCS#11 Slot 1 (Luna HSM).\nSafe keys decrypted: 42 Safes online. Master database mounted cleanly.",
              explanation:
                "The Vault cryptographic subsystem initialized normally, retrieved the Server Key from the network HSM, and decrypted all 42 production Safes.",
            },
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 08:00:15 ITATS001E Cannot open Server Key C:\\Keys\\Server.key. File not found. The server cannot start.",
              explanation:
                "The PrivateArk service could not locate the required Server Key on disk. The administrator must mount the key drive or restore from escrow.",
            },
          ],
          instructorNotes: [
            "Never store the `Recovery.key` on any production or DR server. The Recovery Key is strictly an offline emergency asset.",
            "If an organization loses both the Server Key and the Recovery Key, the data in the Digital Vault is lost permanently; there is no vendor backdoor.",
            "When virtualizing the Vault, enable virtual TPM (vTPM) and hypervisor memory encryption (AMD SEV or Intel SGX) for additional defense-in-depth.",
          ],
          securityImplications: [
            "Mathematical Privacy: Even if an adversary achieves raw physical possession of the storage arrays, AES-256 envelope encryption ensures zero secret disclosure.",
            "Separation of Roles: Infrastructure engineers can manage hypervisors and storage without gaining access to the cryptographic keys that unlock the Vault.",
            "Anti-Ransomware Defense: Offline key escrow guarantees that an attacker who compromises the operating system cannot permanently destroy enterprise access.",
          ],
          knowledgeCheck: [
            {
              id: "m16-q01",
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
              conceptTested: "Server Key Role in Envelope Cryptography",
            },
            {
              id: "m16-q02",
              question:
                "Why is a Hardware Security Module (HSM) used in high-assurance PAM deployments?",
              options: [
                "To speed up the network internet connection.",
                "To store and execute operations with the Vault Server Key inside tamper-resistant hardware silicon, preventing the key from ever existing as a plaintext file on disk.",
                "To automatically create Active Directory user accounts.",
                "To record audio during remote desktop sessions.",
              ],
              correctIndex: 1,
              explanation:
                "An HSM provides FIPS 140-2 Level 3 hardware protection. Keys cannot be extracted, cloned, or dumped from memory, neutralizing memory-scraping and physical theft vectors.",
              conceptTested: "Hardware Security Module (HSM) Integration",
            },
            {
              id: "m16-q03",
              question:
                "Where should the Vault's ultimate root of trust, the Master Recovery Key (Recovery.key), be stored in production?",
              options: [
                "On the desktop of the Vault server host.",
                "On an offline physical medium (such as an encrypted USB or CD) locked in a physical fireproof safe under dual-custody control.",
                "In a shared Google Drive or OneDrive folder.",
                "In a public GitHub repository.",
              ],
              correctIndex: 1,
              explanation:
                "The Recovery Key must remain completely air-gapped from production networks, stored on physical media in sealed tamper-evident custody envelopes inside a fireproof safe.",
              conceptTested: "Master Key Escrow & Physical Dual-Custody",
            },
          ],
          practicalExercise: {
            id: "m16-ex01",
            title: "Audit Vault Security Boundaries & Protocol Isolation",
            objective:
              "Inspect the Vault protection boundary, verify TCP 1858 protocol isolation and Safe segregation, and validate the simulated control-plane baseline (Lab 01).",
            scenario:
              "Security Architecture requests a baseline audit of Vault isolation, Safe cryptographic boundaries, and audit trail integrity before approving HSM integration planning.",
            prerequisites: [
              "Review Envelope Encryption, Key Hierarchies, and HSM Integration in Section 1–4.",
            ],
            startingState:
              "Simulated Digital Vault is ONLINE with 7 isolated Safe containers and live immutable audit logging.",
            instructions: [
              "Open the Dashboard console and verify Digital Vault reports ONLINE with active component boundaries.",
              "Open the Safes console and confirm distinct tier-segregated Safe boundaries separate Windows, Unix, DBA, Service, and Emergency credentials.",
              "Open Reports & Audit and verify operational events are cryptographically logged with actor, target, and result.",
              "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion' to verify all 7 Lab 01 objectives.",
            ],
            stepDetails: [
              {
                action: "Open Dashboard and verify Digital Vault health and protocol isolation.",
                explanation:
                  "Vault hardening restricts ingress to encrypted TCP 1858 traffic from authenticated PAS components.",
                expectedResult: "Digital Vault reports ONLINE in Platform Health and header.",
              },
              {
                action: "Open Safes and verify Safe-level isolation across all 7 containers.",
                explanation:
                  "Each Safe acts as an independent cryptographic key and ACL boundary inside the Vault.",
                expectedResult:
                  "WIN-SAFE, UNIX-SAFE, DBA-SAFE, APP-SAFE, SERVICE-SAFE, DOMAIN-SAFE, and EMERGENCY-SAFE are cleanly separated.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation: "Validates all 7 Lab 01 Vault boundary baseline objectives.",
                expectedResult: "All 7/7 Lab 01 objectives pass (100/100).",
              },
            ],
            targetConsole: "overview",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "id-vault",
            validationCriteria:
              "Vault isolation boundary, Safe segregation, and audit integrity verified (7/7 Lab 01 objectives).",
            troubleshootingHints: [
              {
                symptom: "A Lab 01 baseline objective reports pending.",
                hint: "Confirm baseline Safes, CPM operations, and audit records exist in live state.",
                correctiveAction:
                  "Click Reset Simulator in the top subnav if baseline records were cleared, then re-validate.",
              },
            ],
            independentPractice: {
              title: "Least-Privilege Safe Audit Across DOMAIN-SAFE",
              scenario:
                "Tier-0 security policy requires verifying who holds access to DOMAIN-SAFE.",
              goal: "Without step-by-step instructions, open Safes > DOMAIN-SAFE and verify that only authorized personas hold member rights and `auditor` is strictly read-only.",
              targetConsole: "safes",
              successCriteria: [
                "Inspected DOMAIN-SAFE members and verified `auditor` holds only 'List accounts'.",
                "Confirmed non-admin operators do not hold 'Retrieve accounts' on DOMAIN-SAFE.",
              ],
            },
            simulationLimitationNote:
              "Physical HSM PKCS#11 integration, Operator Key splits, and envelope key rotation ceremonies are architectural security concepts outside this browser simulator. Live validation verifies the simulated Vault boundary baseline (Lab 01).",
          },
          completionCriteria: [
            "Deconstructed AES-256 envelope encryption and multi-tier key hierarchies.",
            "Evaluated HSM hardware integration and physical dual-custody key escrow.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the cryptographic security inspection in the PAM Environment console.",
          ],
          references: [
            "NIST SP 800-57 Part 1 Rev 5: Recommendation for Key Management - General Guidelines",
            "FIPS PUB 140-2: Security Requirements for Cryptographic Modules (Level 3 Standards)",
            "CyberArk Privileged Access Security: Cryptographic Architecture & HSM Integration Guide",
          ],
        },
      ],
    },
  ],
};
