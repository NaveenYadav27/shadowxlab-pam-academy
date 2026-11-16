/**
 * SHADOWXLAB PAM ACADEMY — MODULE 15: DISASTER RECOVERY
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_15: ClassCurriculum = {
  id: "module-15",
  number: "15",
  label: "MODULE 15",
  title: "Disaster Recovery",
  subtitle: "PADR Replication, Failover Scenarios & Split-Brain Prevention",
  duration: "55 mins",
  level: "Professional",
  track: "admin-20",
  category: "Self-Hosted Infrastructure & Hardening",
  overview:
    "Master multi-datacenter disaster recovery, real-time database replication, and failover engineering. Deconstruct the CyberArk Disaster Recovery service (PADR.exe), continuous synchronization over TCP 1858, manual versus automated failover triggers, split-brain condition prevention, and post-disaster failback synchronization to restore primary site operations.",
  modules: [
    {
      id: "m15-core",
      number: "M15",
      title: "PADR Replication & Failover Engineering",
      description:
        "Comprehensive walkthrough of PADR replication mechanics, padr.ini configuration, failover execution, split-brain defense, and reverse failback synchronization.",
      lessons: [
        {
          id: "m15-l01",
          number: "15.1",
          title: "PADR Replication Architecture & Controlled Failover",
          subtitle: "Deploying multi-site DR Vaults, managing continuous sync, executing failovers, and preventing split-brain corruption",
          estimatedMinutes: 25,
          learningObjectives: [
            "Deconstruct the CyberArk Disaster Recovery engine (PADR.exe) and continuous synchronization over TCP 1858.",
            "Compare High Availability (HA) clustering with geographical Disaster Recovery (DR) topologies.",
            "Execute a controlled failover to the DR Vault during a simulated primary data center failure.",
            "Mitigate split-brain risk and execute reverse synchronization (failback) to restore primary baseline operations.",
          ],
          prerequisites: [
            "Module 01: Introduction to PAM Administration.",
            "Module 13: Self-Hosted Architecture.",
            "Module 14: Backup and Restore.",
          ],
          conceptIntroduction:
            "High Availability (HA) clustering protects an organization against local hardware failures (e.g., a power supply blowing on a primary Vault server within a single datacenter). However, local HA does nothing to protect against regional disasters—such as a data center flood, fiber optic severance, severe power grid outage, or a localized ransomware attack that disables an entire facility.\n\nEnterprise PAM addresses geographical resiliency through **Disaster Recovery (PADR)**.\n\nIn a PADR architecture, a secondary Digital Vault is deployed in a geographically distant data center or secondary cloud region. The Disaster Recovery Vault runs the **CyberArk Disaster Recovery service (PADR.exe)** as a background daemon. While in DR mode, the secondary Vault database engine is stopped in an idle, standby state.\n\nEvery few seconds (or continuously), the PADR service connects inbound to the Primary Vault over TCP 1858, pulls transaction logs, and applies the changes to its local standby database files. If the primary data center goes dark, a failover is executed: the PADR service starts the secondary database engine, promotes the DR Vault to Primary, and redirects component traffic (PVWA, CPM, PSM) to the secondary facility—delivering a Recovery Time Objective (RTO) of under 10 minutes.\n\nHowever, disaster recovery introduces the single most dangerous architectural risk in distributed systems: **Split-Brain**. If a temporary network partition severs communication between data centers, both Vaults must NOT be allowed to operate as Primary simultaneously. If both Vaults become primary, users in Site A will rotate passwords while users in Site B rotate different passwords, resulting in catastrophic database divergence and data corruption. Managing failover and split-brain defense is the supreme test of a PAM administrator.",
          whyItExists:
            "Without multi-site disaster recovery, a catastrophic data center outage permanently halts enterprise access to infrastructure. PADR guarantees business continuity across regional catastrophic events.",
          architecture: {
            overview:
              "PADR connects from the secondary DR Vault to the Primary Vault over TCP 1858, synchronizing database transaction logs and Safes asynchronously or near-real-time.",
            componentResponsibilities: [
              {
                component: "Primary Digital Vault",
                role: "Active production Vault processing all read/write transactions, user checkouts, and CPM rotation tasks.",
                networkProtocols: "TCP 1858 Inbound Listener",
                securityBoundary: "Primary Data Center (Tier-0)",
              },
              {
                component: "Disaster Recovery Vault (DR Node)",
                role: "Standby Vault running PADR.exe. Standby database engine is stopped until activated during failover.",
                networkProtocols: "TCP 1858 Outbound to Primary Vault; Inbound listener when promoted",
                securityBoundary: "Secondary Data Center / DR Facility",
              },
              {
                component: "CyberArk DR Service (PADR.exe)",
                role: "Replication daemon responsible for polling transaction logs, writing standby files, and orchestrating database promotion.",
                networkProtocols: "Windows Service executing on DR host",
                securityBoundary: "Replication Management Engine",
              },
              {
                component: "Dynamic DNS / VIP Gateway",
                role: "Directs PVWA, CPM, and PSM component traffic to the currently active Primary Vault IP address.",
                networkProtocols: "DNS Records / F5 GTM Global Traffic Manager",
                securityBoundary: "Enterprise Routing Core",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "PADR Replication Daemon",
                action: "Connects to Primary Vault every 60 seconds (or continuous streaming) over TCP 1858 using `DR` service user.",
                channelOrProtocol: "Encrypted Vault Protocol (TCP 1858)",
                verificationRule: "Primary Vault authenticates DR user; sends incremental database transaction log deltas.",
              },
              {
                stepNumber: 2,
                actor: "Disaster Event (Simulated)",
                action: "Primary data center experiences total power loss. Primary Vault goes dark.",
                channelOrProtocol: "Facility Outage",
                verificationRule: "PADR service detects consecutive heartbeat failures to Primary Vault on port 1858.",
              },
              {
                stepNumber: 3,
                actor: "PAM Administrator / Auto-Failover",
                action: "Triggers failover: PADR sets `FailoverMode = Yes`, mounts local database storage, and starts PrivateArk Server service.",
                channelOrProtocol: "PADR Promotion Routine",
                verificationRule: "DR Vault becomes fully operational Primary Vault; begins accepting inbound TCP 1858 traffic.",
              },
              {
                stepNumber: 4,
                actor: "Dynamic Routing Layer",
                action: "Updates DNS CNAME or GTM VIP: `vault.corp.local` resolves to the secondary DR Vault IP address.",
                channelOrProtocol: "DNS / Global Load Balancer",
                verificationRule: "PVWA, CPM, and PSM reconnect to promoted Vault; operations resume with zero data loss.",
              },
            ],
          },
          terminology: [
            {
              term: "PADR (Privileged Access Disaster Recovery)",
              definition: "The specialized Windows service responsible for continuous database replication from Primary to DR Vaults.",
              enterpriseContext: "Operates on the DR Vault host, logging replication status in `padr.log`.",
            },
            {
              term: "Split-Brain Condition",
              definition: "A catastrophic state where both Primary and DR Vaults operate simultaneously as active Primaries, accepting divergent changes.",
              enterpriseContext: "Strictly avoided by enforcing manual or quorum-verified failover and ensuring primary services are halted.",
            },
            {
              term: "Recovery Point Objective (RPO)",
              definition: "The maximum acceptable age of data that must be recovered from replication (e.g. less than 60 seconds of data loss).",
              enterpriseContext: "Continuous PADR replication delivers an RPO of sub-second to a few seconds under normal network conditions.",
            },
            {
              term: "Recovery Time Objective (RTO)",
              definition: "The duration of time required to promote the DR Vault and restore operational access after a disaster occurs.",
              enterpriseContext: "Production PAM target RTO is typically under 15 minutes for controlled failovers.",
            },
            {
              term: "Failback",
              definition: "The reverse synchronization procedure where changes made on the DR Vault during an outage are replicated back to the restored Primary.",
              enterpriseContext: "Must be executed carefully to prevent overwriting new production credentials with old stale primary data.",
            },
          ],
          administratorResponsibilities: [
            "Monitor `padr.log` daily to ensure continuous replication latency remains under 60 seconds.",
            "Verify that the DR Vault's license file, encryption keys, and dbparm.ini match the Primary Vault.",
            "Execute a controlled DR failover drill in staging or production at least once every 6 months.",
            "Never promote a DR Vault while the Primary Vault is still active on the network without isolating the Primary first.",
          ],
          configurationAndAdministration: [
            {
              name: "padr.ini Configuration File",
              settingOrObject: "C:\\Program Files (x86)\\PrivateArk\\PADR\\padr.ini on DR Vault",
              description: "Configures Primary Vault IP, replication interval, failover thresholds, and credential file paths.",
              productionBestPractice: "Set `CheckMilliSeconds = 1000` for near-real-time streaming; set `EnableFailover = No` for manual approval.",
            },
            {
              name: "DR User Credentials (user.ini)",
              settingOrObject: "CreateCredFile for DR service account",
              description: "Authentication ticket used by PADR to log into the Primary Vault.",
              productionBestPractice: "Re-generate the DR credential file whenever Vault Master Keys or machine hostnames are updated.",
            },
            {
              name: "FailoverMode Flag",
              settingOrObject: "padr.ini: FailoverMode = Yes / No",
              description: "When set to Yes, PADR ceases replication, starts PrivateArk Server, and converts into an active Primary Vault.",
              productionBestPractice: "In enterprise environments, prefer manual promotion (`FailoverMode = Yes` set by admin) to prevent false split-brain triggers.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Inspect PADR Replication Status",
              action: "On the DR Vault server, open `C:\\Program Files (x86)\\PrivateArk\\PADR\\padr.log` and review latest entries.",
              expectedResult: "Log demonstrates continuous cycles: 'Synchronization ended successfully. Last synchronized transaction: N'.",
              operatorNotes: "Transaction numbers must match the active transaction counter on the Primary Vault.",
            },
            {
              stepNumber: 2,
              title: "Simulate Disaster & Execute Failover",
              action: "Isolate Primary Vault network. On DR Vault, edit `padr.ini`, set `FailoverMode = Yes`, and restart CyberArk Disaster Recovery service.",
              expectedResult: "PADR service starts PrivateArk Server engine; DR Vault transitions to active Primary status in under 2 minutes.",
            },
            {
              stepNumber: 3,
              title: "Redirect Component Traffic",
              action: "Update DNS alias or PVWA `Vault.ini` files to point to the promoted DR Vault IP address.",
              expectedResult: "PVWA, CPM, and PSM reconnect; administrative logins and session launches succeed on the DR Vault.",
            },
            {
              stepNumber: 4,
              title: "Execute Reverse Failback",
              action: "When Primary site is restored, configure PADR on Primary to replicate FROM the DR Vault, then perform controlled reverse switch.",
              expectedResult: "All changes made on the DR Vault are synchronized back to Primary without data loss.",
            },
          ],
          enterpriseScenario: {
            organization: "Pacific Electric & Gas (PEG)",
            businessContext:
              "PEG provides electrical power to 16 million customers across the Pacific Northwest. During a catastrophic regional wildfire event that destroyed the utility's primary datacenter in Redding, all central operations servers were offline. The PAM engineering team activated the Disaster Recovery Vault in Boise, Idaho. Using pre-scripted DNS redirection, all 400 substation jump hosts and critical grid management credentials were operational on the Boise DR Vault within 7 minutes, preventing grid management paralysis.",
            governanceRequirements: [
              "Continuous replication between Redding and Boise with an RPO of under 10 seconds.",
              "Documented failover runbook delivering an RTO of under 15 minutes during catastrophic regional events.",
              "Strict split-brain prevention controls validated by semi-annual regulatory disaster drills.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Split-Brain condition occurs: users report password discrepancies across different data centers.",
              rootCause: "A temporary network WAN outage caused the DR Vault to auto-promote while the Primary Vault was still running.",
              securityImpact: "Catastrophic database divergence; conflicting password rotations on target servers.",
              cyberArkCodeOrEvent: "SPLIT-BRAIN-CRIT",
            },
            {
              symptom: "PADR replication halts: 'ITATS004E Authentication failure for user DR'.",
              rootCause: "The DR service account credential file (`user.ini`) became desynchronized after a Vault user update.",
              securityImpact: "DR Vault falls behind real-time state; RPO expands to days, exposing organization to data loss.",
              cyberArkCodeOrEvent: "ITATS004E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Examine padr.log on DR Vault for synchronization error codes.",
              logFileOrConsole: "C:\\Program Files (x86)\\PrivateArk\\PADR\\padr.log",
              remediation: "Search for network timeout or authentication failures. Verify TCP 1858 connectivity to Primary Vault.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Re-create DR credential file using CreateCredFile utility.",
              logFileOrConsole: "CreateCredFile.exe C:\\Keys\\user.ini /Password <Password> /AppType PADR",
              remediation: "Replaces invalid credential file with a newly encrypted machine-bound ticket.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "In split-brain event, immediately halt PrivateArk Server on the unauthorized node.",
              logFileOrConsole: "PrivateArk Server Administration GUI / services.msc",
              remediation: "Determine which node holds the most authoritative recent data, discard divergent data on the other, and re-initialize replication.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\PADR\\padr.log",
              sampleOutput:
                "15/11/2026 19:10:01 Synchronizing metadata and database tables...\n15/11/2026 19:10:04 Full replication cycle completed in 3.1 seconds. Last synchronized transaction: 1849201.\nStatus: Standby mode active. Server is idle.",
              explanation:
                "PADR replication is operating normally with healthy sub-second sync latency to the primary Vault.",
            },
            {
              logFile: "C:\\Program Files (x86)\\PrivateArk\\PADR\\padr.log",
              sampleOutput:
                "15/11/2026 19:15:00 Failover condition triggered. FailoverMode is Yes.\nStarting PrivateArk Database engine... Success.\nPromoting local Vault to Primary. The Vault is now UP and accepting connections.",
              explanation:
                "PADR successfully executed failover promotion routine, launching the database engine and converting the DR node into an active Primary.",
            },
          ],
          instructorNotes: [
            "In enterprise environments, disable automated failover (`EnableFailover = No`) unless you have automated network fencing to isolate the primary. Human-in-the-loop failover prevents accidental split-brain.",
            "The DR Vault uses the exact same `Server.key` as the Primary Vault. Ensure the server key is identical on both nodes.",
            "Always synchronize component configuration files (such as `dbparm.ini`) manually or via configuration management; PADR synchronizes database data, not host-level text files.",
          ],
          securityImplications: [
            "Business Continuity: Guarantees that access to critical infrastructure survives total data center loss, regional natural disasters, or grid outages.",
            "Cryptographic Parity: Replicated data remains encrypted with identical Vault keys; replication streams on port 1858 are encrypted in transit.",
            "Data Integrity: Robust failover and failback protocols ensure that privileged credentials never diverge into unmanageable split states.",
          ],
          knowledgeCheck: [
            {
              id: "m15-q01",
              question: "What is the primary architectural role of the CyberArk Disaster Recovery service (PADR.exe) on the DR Vault host?",
              options: [
                "It serves web pages to end users.",
                "It continuously pulls database transaction log deltas from the Primary Vault over TCP 1858 and keeps the standby database synchronized.",
                "It rotates passwords on target endpoints.",
                "It generates weekly compliance PDF reports.",
              ],
              correctIndex: 1,
              explanation:
                "PADR runs as a client service connecting to the Primary Vault, applying transaction log updates to the secondary Vault's standby storage in near-real-time.",
              conceptTested: "PADR Replication Mechanics & Architecture",
            },
            {
              id: "m15-q02",
              question: "What catastrophic condition occurs if a network partition causes both the Primary Vault and DR Vault to act as active Primaries at the same time?",
              options: [
                "The Vault computers will overheat.",
                "A Split-Brain condition, causing conflicting password rotations, divergent database versions, and corrupted credential state.",
                "The user licenses are automatically doubled.",
                "All user accounts are converted to guest users.",
              ],
              correctIndex: 1,
              explanation:
                "Split-brain occurs when both Vaults accept write operations independently. When the network reconnects, the databases have diverged irreconcilably, corrupting production passwords.",
              conceptTested: "Split-Brain Condition & Distributed Data Integrity",
            },
            {
              id: "m15-q03",
              question: "During standby replication mode, is the PrivateArk Server database engine running on the DR Vault host?",
              options: [
                "Yes, it is running and accepting client connections.",
                "No, the database engine is stopped/idle while PADR updates the underlying database files.",
                "It runs only on weekends.",
                "It runs only inside a web browser.",
              ],
              correctIndex: 1,
              explanation:
                "While in standby replication, the PrivateArk Server service is stopped. Only the PADR service runs, updating database files. The database engine is only started when failover is triggered.",
              conceptTested: "Standby DR State vs Active Primary State",
            },
          ],
          practicalExercise: {
            id: "m15-ex01",
            title: "Simulate Disaster Recovery Failover and Validate Standby Promotion",
            scenario:
              "Review the disaster recovery operational status, simulate a primary communication interruption, verify failover gates, and confirm that the standby node can assume primary responsibilities.",
            instructions: [
              "Navigate to the Overview or PAM Environment console.",
              "Inspect component connectivity and failover status indicators.",
              "Review the disaster recovery runbook and operational criteria.",
              "Confirm that component communication pathways support dynamic failover redirection.",
            ],
            targetConsole: "overview",
            associatedLabId: "Lab 01 · Trace the PAM architecture",
            validationObjectiveId: "id-vault",
            validationCriteria:
              "Disaster recovery topology and failover readiness are verified in the environment view.",
          },
          completionCriteria: [
            "Deconstructed PADR replication mechanisms over TCP 1858.",
            "Formulated failover procedures and split-brain prevention controls.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the disaster recovery readiness inspection in the PAM Environment console.",
          ],
          references: [
            "CyberArk Disaster Recovery (PADR) Implementation and Operations Runbook",
            "NIST SP 800-34 Rev 1: Contingency Planning Guide for Information Technology Systems",
            "High Availability and Disaster Recovery Patterns in Enterprise Cryptographic Infrastructure",
          ],
        },
      ],
    },
  ],
};
