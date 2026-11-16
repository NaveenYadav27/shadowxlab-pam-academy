/**
 * SHADOWXLAB PAM ACADEMY — MODULE 14: BACKUP AND RESTORE
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_14: ClassCurriculum = {
  id: "module-14",
  number: "14",
  label: "MODULE 14",
  title: "Backup and Restore",
  subtitle: "PARASW Utility, Encrypted Archives & Granular Safe Recovery",
  duration: "45 mins",
  level: "Professional",
  track: "admin-20",
  category: "Self-Hosted Infrastructure & Hardening",
  overview:
    "Master enterprise Vault data protection, disaster backups, and granular object recovery. Deconstruct the PrivateArk Scheduled Tasks backup utility (PARASW.exe), cryptographic key escrow, encrypted backup destinations, full database dumps, differential Safe backups, and granular Safe-level recovery without rolling back entire system state.",
  modules: [
    {
      id: "m14-core",
      number: "M14",
      title: "Vault Backup Architecture & Granular Object Restore",
      description:
        "Comprehensive walkthrough of PARASW execution, encrypted backup repositories, master key escrow, and granular object-level restore operations.",
      lessons: [
        {
          id: "m14-l01",
          number: "14.1",
          title: "PARASW Backup Architecture & Granular Safe Restore",
          subtitle: "Automating scheduled encrypted backups, managing key escrow, and executing point-in-time Safe recovery",
          estimatedMinutes: 25,
          learningObjectives: [
            "Configure the PrivateArk Scheduled Tasks backup utility (PARASW.exe) for automated daily backups.",
            "Deconstruct the cryptographic structure of backup archives (double-layer envelope encryption).",
            "Execute a granular Safe-level restore to recover an accidentally deleted account without system downtime.",
            "Formulate cryptographic key escrow policies protecting Master Keys and Recovery Keys in physical vaults.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 04: Safes.",
            "Module 13: Self-Hosted Architecture.",
          ],
          conceptIntroduction:
            "In a mission-critical PAM environment, standard corporate backup agents (such as Commvault, Veeam, or NetBackup) cannot be installed on the Digital Vault. Installing third-party backup software directly on the Vault violates bastion OS hardening, introduces unmonitored services, and creates an attack path for attackers to exfiltrate raw database files.\n\nInstead, the Digital Vault utilizes its own dedicated, native backup architecture driven by **PARASW.exe (PrivateArk Scheduled Tasks)** or the modern Vault Backup Utility.\n\nThe backup utility executes from an authorized external backup server node (not on the Vault itself). The backup server authenticates to the Vault over TCP 1858 using a dedicated `Backup` service account. The Vault packages and encrypts the requested Safes and metadata, transmitting them over TCP 1858 into an encrypted backup repository on the backup host.\n\nCritically, the resulting backup archives remain **fully encrypted at rest**. They are protected by the Vault's encryption keys; even if an attacker steals the backup tapes or files, they cannot decrypt the passwords without the Vault's Master Keys. Furthermore, the architecture supports **Granular Safe-Level Restore**: if an administrator accidentally deletes a critical Safe, that specific Safe can be restored from backup into the running production Vault without rolling back other Safes or interrupting active operations.",
          whyItExists:
            "Third-party backup agents create unacceptable attack vectors on hardened bastion hosts. Native PAM backup utilities provide secure, encrypted, and granular recovery capabilities while preserving the Vault's isolation boundary.",
          architecture: {
            overview:
              "The backup server connects inbound to the Vault over TCP 1858. The Vault extracts requested Safe data, encrypts the stream, and commits backup archives to external storage.",
            componentResponsibilities: [
              {
                component: "Digital Vault Kernel",
                role: "Authenticates the Backup user, generates consistent database snapshots, and streams encrypted Safe objects outbound.",
                networkProtocols: "TCP 1858 Internal Execution",
                securityBoundary: "Tier-0 Cryptographic Bastion",
              },
              {
                component: "Dedicated Backup Host",
                role: "Authorized Windows server executing PARASW.exe or Vault Backup Utility scripts via Windows Task Scheduler.",
                networkProtocols: "TCP 1858 Outbound to Vault; SMB/NFS to Enterprise Backup Target",
                securityBoundary: "Management Subnet / Backup Tier",
              },
              {
                component: "Encrypted Backup Repository",
                role: "Storage volume (NAS/SAN/Tape) holding encrypted `.safe` archives, metadata catalogs, and database dumps.",
                networkProtocols: "Encrypted at rest (AES-256)",
                securityBoundary: "Enterprise Long-Term Archive Storage",
              },
              {
                component: "Cryptographic Master Keys",
                role: "Physical CD-ROM or HSM containing `Recovery.key` and `Server.key` required for bare-metal Vault recovery.",
                networkProtocols: "Air-gapped / Physical Escrow",
                securityBoundary: "Physical Dual-Custody Safe",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "Windows Task Scheduler (Backup Host)",
                action: "Triggers scheduled daily backup script: `PARASW.exe <VaultIP> Backup User.ini <DestDir>` at 01:00 UTC.",
                channelOrProtocol: "Local Script Execution",
                verificationRule: "Backup host authenticates using dedicated Backup user credential file.",
              },
              {
                stepNumber: 2,
                actor: "Digital Vault",
                action: "Validates Backup user identity and verifies IP address matches authorized node in dbparm.ini.",
                channelOrProtocol: "Encrypted Vault Protocol (TCP 1858)",
                verificationRule: "Vault initiates read-only snapshot of database tables and metadata.",
              },
              {
                stepNumber: 3,
                actor: "Backup Utility Engine",
                action: "Streams incremental or full Safe data across port 1858 and writes encrypted archive files to destination directory.",
                channelOrProtocol: "TCP 1858 Stream",
                verificationRule: "Cryptographic SHA-256 hash calculated for each archive to ensure backup catalog integrity.",
              },
              {
                stepNumber: 4,
                actor: "PAM Administrator",
                action: "Executes granular restore of single Safe `FINANCE-SAFE` from backup archive following accidental deletion.",
                channelOrProtocol: "PrivateArk Client Restore Wizard",
                verificationRule: "Vault restores Safe into active database; unaffected Safes continue operating with zero downtime.",
              },
            ],
          },
          terminology: [
            {
              term: "PARASW.exe",
              definition: "The command-line PrivateArk Scheduled Tasks utility used to automate full and incremental Vault backups.",
              enterpriseContext: "Executes from an authorized external backup host on a recurring nightly schedule.",
            },
            {
              term: "Granular Safe Restore",
              definition: "Restoring an individual Safe and its accounts from a backup archive without restoring or rebooting the entire Vault database.",
              enterpriseContext: "Eliminates downtime; other departments continue using the PAM system uninterrupted.",
            },
            {
              term: "Master / Recovery Key",
              definition: "The ultimate emergency cryptographic key used to rebuild a Vault or decrypt database volumes when standard server keys are lost.",
              enterpriseContext: "Stored on physical media in two separate sealed tamper-evident envelopes in distinct geographic safes.",
            },
            {
              term: "Full vs Incremental Backup",
              definition: "A full backup exports every Safe and object; an incremental backup exports only files and accounts modified since the last backup cycle.",
              enterpriseContext: "Production environments run full backups weekly and incremental backups nightly.",
            },
          ],
          administratorResponsibilities: [
            "Schedule and monitor daily automated backups via PARASW or the REST API backup service.",
            "Perform a test restore of an individual Safe into a staging environment at least once per quarter.",
            "Verify that backup archive storage volumes have sufficient capacity and retain at least 30 daily recovery points.",
            "Maintain physical dual-custody control of Vault Master Keys in fireproof corporate safes.",
          ],
          configurationAndAdministration: [
            {
              name: "PARASW Command Syntax",
              settingOrObject: "PARASW.exe Script on Backup Host",
              description: "Syntax: `PARASW.exe <VaultIP> /U <User> /P <PassFile> /D <DestPath> /S <SafeList>`.",
              productionBestPractice: "Use credential files (`user.ini`) generated by CreateCredFile utility. Never pass plaintext passwords in scripts.",
            },
            {
              name: "Backup User Authorized IP",
              settingOrObject: "dbparm.ini on Vault Server",
              description: "Restricts the `Backup` user account to authenticate exclusively from the static IP of the backup host.",
              productionBestPractice: "Never allow the Backup user to connect from arbitrary IP addresses.",
            },
            {
              name: "Catalog Integrity Verification",
              settingOrObject: "Post-Backup Verification Script",
              description: "Validates checksums of backup output against Vault manifest records.",
              productionBestPractice: "Configure alerts to notify the PAM team if backup archive size drops by more than 10% unexpectedly.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Execute Manual Backup Test",
              action: "On the backup server, run: `PARASW.exe 10.0.1.10 /U Backup /P C:\\Keys\\backup.ini /D D:\\Backups /S ALL`.",
              expectedResult: "Backup utility connects to Vault on port 1858 and streams encrypted Safe files into D:\\Backups.",
              operatorNotes: "Monitor transfer log for ITATS error codes or disk write bottlenecks.",
            },
            {
              stepNumber: 2,
              title: "Verify Backup Archive Integrity",
              action: "Inspect the backup destination folder. Confirm presence of `Vault.dmp`, Safe `.safe` folders, and `backup.log`.",
              expectedResult: "All production Safes are present with non-zero file sizes; backup.log reports 'Backup completed successfully'.",
            },
            {
              stepNumber: 3,
              title: "Execute Granular Safe Restore",
              action: "In PrivateArk Client, select Tools > Restore Safe. Select backup folder and choose `FINANCE-SAFE`.",
              expectedResult: "Vault extracts Safe from archive and mounts it into the running database.",
            },
            {
              stepNumber: 4,
              title: "Validate Restored Accounts",
              action: "In PVWA Accounts, verify that accounts inside `FINANCE-SAFE` are visible, intact, and functional.",
              expectedResult: "Restored accounts display historical password versions up to the point-in-time of the backup.",
            },
          ],
          enterpriseScenario: {
            organization: "National Healthcare Network (NHN)",
            businessContext:
              "NHN operates 45 regional hospitals. During an administrative cleanup script misconfiguration, an engineer accidentally deleted the primary `CLINICAL-SQL-SAFE` containing 80 database administrative accounts powering hospital emergency room systems. Because the PAM team had implemented daily automated PARASW backups, the lead administrator executed a Granular Safe Restore. The clinical safe was fully restored in 12 minutes without restarting the Vault or interrupting other hospital systems.",
            governanceRequirements: [
              "Daily encrypted backups of all 45 hospital Safes retained for 365 days under HIPAA rules.",
              "Capability to perform granular object restore with a Recovery Time Objective (RTO) of under 30 minutes.",
              "Zero plaintext exposure of backup files during transit or storage on secondary backup arrays.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Backup job fails: 'ITATS004E Authentication failure for user Backup'.",
              rootCause: "The stored credential file (`backup.ini`) has expired or desynchronized from the Vault user record.",
              securityImpact: "Nightly backup fails silently; enterprise unprotected against disaster events.",
              cyberArkCodeOrEvent: "ITATS004E",
            },
            {
              symptom: "Backup job fails: 'Disk full on backup repository destination'.",
              rootCause: "Historical backup retention was unconfigured, accumulating terabytes of unpruned daily archives.",
              securityImpact: "Subsequent backups abort; backup catalog corrupted.",
              cyberArkCodeOrEvent: "DISK-FULL",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Re-generate Backup user credential file using CreateCredFile utility.",
              logFileOrConsole: "CreateCredFile.exe C:\\Keys\\backup.ini /Password <Password> /AppType PARASW /Hostname <BackupHost>",
              remediation: "Replaces corrupt credential file with a freshly encrypted, machine-bound authentication ticket.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Check italog.log on Vault server for rejected Backup connections.",
              logFileOrConsole: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              remediation: "Verify that the backup host IP is authorized in dbparm.ini under AllowNodes.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Review backup archive retention scripts and purge archives older than corporate policy.",
              logFileOrConsole: "Backup Host Task Scheduler",
              remediation: "Implement automated rotation script deleting archives older than 30 or 90 days.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Backups\\backup.log",
              sampleOutput:
                "15/11/2026 01:14:02 Starting backup for Vault 10.0.1.10. User: Backup.\nBacking up Safe WIN-SAFE... 12 objects written.\nBacking up Safe DBA-SAFE... 8 objects written.\nBackup completed successfully. Total size: 1.4 GB. Elapsed time: 4m 12s.",
              explanation:
                "PARASW backup completed normally, backing up all Safes and committing an encrypted archive catalog to the storage array.",
            },
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\Server\\Logs\\italog.log",
              sampleOutput:
                "15/11/2026 01:00:03 ITATS108E Station 10.0.50.22 is not an authorized client IP for user Backup.",
              explanation:
                "The backup job was launched from an unauthorized server IP address. The Vault kernel rejected the connection to protect against rogue backup attempts.",
            },
          ],
          instructorNotes: [
            "Never store the Vault Master Keys or Server Keys in the same directory as the backup archives. If an attacker gains access to the backup storage, they must not find the keys there.",
            "Granular Safe Restore restores the Safe as it existed at the time of backup. Any passwords changed by CPM *after* the backup was taken will need to be reconciled.",
            "Test your backup restoration process regularly. A backup that has never been restored is merely a hypothesis, not a disaster recovery strategy.",
          ],
          securityImplications: [
            "Ransomware Defense: Immutable, offline backup archives ensure the organization can rebuild privileged access even if enterprise active directory is destroyed.",
            "Envelope Encryption: Backups remain encrypted with Vault keys; theft of physical backup tapes does not expose cleartext credentials.",
            "Compliance Continuity: Satisfies strict regulatory requirements for data retention and business continuity under SOX, HIPAA, and PCI-DSS.",
          ],
          knowledgeCheck: [
            {
              id: "m14-q01",
              question: "Why does the Digital Vault utilize a native backup utility (PARASW) rather than standard third-party backup agents installed on the host?",
              options: [
                "Because third-party agents are too cheap.",
                "To preserve the Vault's OS hardening and isolation boundary, preventing third-party software vulnerabilities and unmonitored services from running on the bastion host.",
                "Because Windows Server does not support third-party software.",
                "Because the Vault database cannot be backed up.",
              ],
              correctIndex: 1,
              explanation:
                "Installing third-party software on the Vault violates bastion hardening standards. The native backup utility connects remotely over TCP 1858 from an authorized external backup host.",
              conceptTested: "Native Backup vs Third-Party Agent Isolation",
            },
            {
              id: "m14-q02",
              question: "What is the primary operational advantage of 'Granular Safe-Level Restore'?",
              options: [
                "It restores all servers in the enterprise to factory defaults.",
                "It allows an administrator to restore an individual accidentally deleted Safe without rolling back the rest of the Vault or interrupting other users.",
                "It eliminates the need for Master Keys.",
                "It speeds up network latency.",
              ],
              correctIndex: 1,
              explanation:
                "Granular Safe Restore allows surgical recovery of a single compromised or deleted Safe into the live running Vault, avoiding system-wide rollbacks and downtime.",
              conceptTested: "Granular Safe Restore Capabilities",
            },
            {
              id: "m14-q03",
              question: "Are backup archives generated by PARASW encrypted or stored in plaintext?",
              options: [
                "Stored in unencrypted plaintext XML files.",
                "Fully encrypted using the Vault's cryptographic keys; cannot be decrypted without the Vault or Master recovery keys.",
                "Encrypted only if zip compression is selected.",
                "Stored in cleartext SQL database dumps.",
              ],
              correctIndex: 1,
              explanation:
                "Backup archives remain fully encrypted with the Vault's internal encryption keys. If backup media is stolen, the secrets cannot be read without the Master keys.",
              conceptTested: "Backup Cryptographic Protection at Rest",
            },
          ],
          practicalExercise: {
            id: "m14-ex01",
            title: "Review Vault Backup Status and Audit Data Protection",
            scenario:
              "Inspect system data protection and backup audit records in the simulator, review historical backup events, and verify that recovery points are recorded.",
            instructions: [
              "Navigate to the Reports & Audit console or Overview console.",
              "Review the audit trail for backup activity events.",
              "Verify that cryptographic operations and Safe states are recorded cleanly.",
              "Confirm that data protection policies align with enterprise retention mandates.",
            ],
            targetConsole: "audit",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "id-vault",
            validationCriteria:
              "Vault data protection and audit records are inspected in the audit console.",
          },
          completionCriteria: [
            "Deconstructed PARASW backup utility architecture and remote execution.",
            "Learned granular Safe-level restore workflows and key escrow governance.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the data protection audit review in the Reports & Audit console.",
          ],
          references: [
            "CyberArk Digital Vault Backup and Restore Implementation & Operations Guide",
            "NIST SP 800-34 Rev 1: Contingency Planning Guide for Federal Information Systems",
            "ISO/IEC 27001:2022 Control 8.13 - Information Backup & Redundancy",
          ],
        },
      ],
    },
  ],
};
