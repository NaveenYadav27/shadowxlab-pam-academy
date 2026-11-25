/**
 * SHADOWXLAB PAM ACADEMY — CURRICULUM SCOPE CLASSIFICATION REGISTRY
 * Explicitly maps every module in the repository to either:
 * 1. CLIENT_FOUNDATION_SCOPE (Authoritative 12-Module CyberArk Basic Training)
 * 2. OUTSIDE_CLIENT_FOUNDATION_SCOPE (Advanced enterprise / infrastructure / legacy content preserved separately)
 *
 * Guarantees that no advanced content is forced onto foundation learners,
 * while ensuring no existing code or tests are broken.
 */

import type { OutsideScopeItem } from "./types";

export const CLIENT_FOUNDATION_SCOPE_MODULE_IDS = [
  "client-m01",
  "client-m02",
  "client-m03",
  "client-m04",
  "client-m05",
  "client-m06",
  "client-m07",
  "client-m08",
  "client-m09",
  "client-m10",
  "client-m11",
  "client-m12",
];

export const OUTSIDE_CLIENT_FOUNDATION_SCOPE_MODULES: OutsideScopeItem[] = [
  {
    id: "module-07",
    title: "Dependents (Service Account Usages & Scheduled Tasks)",
    originalTrack: "admin-20",
    category: "Credential Lifecycle & Workflows",
    reason:
      "Deep-dive configuration of Windows Services, Scheduled Tasks, and IIS Application Pool password sync exceeds foundational scope.",
  },
  {
    id: "module-08",
    title: "Workflows (Advanced Dual Control & ITSM Integrations)",
    originalTrack: "admin-20",
    category: "Credential Lifecycle & Workflows",
    reason:
      "Multi-level approval chains and ServiceNow/Jira REST ticketing API integrations are advanced operational topics.",
  },
  {
    id: "module-09",
    title: "Discovery and Onboarding (Automated Network Scans)",
    originalTrack: "admin-20",
    category: "Credential Lifecycle & Workflows",
    reason:
      "Subnet discovery scans, account discovery rules, and unmanaged inventory bulk ingest exceed beginner onboarding.",
  },
  {
    id: "module-13",
    title: "Self-Hosted Architecture (Hardware Sizing & HA Bastions)",
    originalTrack: "admin-20",
    category: "Self-Hosted Infrastructure & Hardening",
    reason:
      "Physical server sizing, Windows OS bastions, and SAN/NAS storage replication are system engineering responsibilities.",
  },
  {
    id: "module-14",
    title: "Backup and Restore (PARASW Utility & Granular Safe Recovery)",
    originalTrack: "admin-20",
    category: "Self-Hosted Infrastructure & Hardening",
    reason:
      "Database snapshotting, cold backup execution, and PARASW encryption utilities are infrastructure-tier operations.",
  },
  {
    id: "module-15",
    title: "Disaster Recovery (PADR Replication & Failover Scenarios)",
    originalTrack: "admin-20",
    category: "Self-Hosted Infrastructure & Hardening",
    reason:
      "PADR asynchronous replication, split-brain prevention, and manual DNS failover procedures belong to advanced architecture.",
  },
  {
    id: "module-16",
    title: "Vault Security (Cryptographic Keys & Server Hardening)",
    originalTrack: "admin-20",
    category: "Self-Hosted Infrastructure & Hardening",
    reason:
      "Server key hierarchy, HSM hardware integration, and Cavium/Thales token management are specialist security topics.",
  },
  {
    id: "module-17",
    title: "System Monitoring (SNMP Traps & Component Telemetry)",
    originalTrack: "admin-20",
    category: "Self-Hosted Infrastructure & Hardening",
    reason:
      "SNMP MIBs, Splunk/Datadog agent telemetry, and host-level metric pipelines are infrastructure monitoring topics.",
  },
  {
    id: "module-18",
    title: "Common Issues (Deep Error Code Forensics)",
    originalTrack: "admin-20",
    category: "Diagnostic Mastery & Certification",
    reason:
      "Deep error code mechanics across 40+ CyberArk subsystem codes are consolidated into the foundational 3-ticket troubleshooting format in Module 10.",
  },
  {
    id: "module-19",
    title: "Troubleshooting (Advanced Multi-Tier Log Forensics)",
    originalTrack: "admin-20",
    category: "Diagnostic Mastery & Certification",
    reason:
      "Correlating italog, pm_error.log, and PSM trace logs simultaneously is preserved in the extended admin track.",
  },
  {
    id: "module-20",
    title: "Post-Course Administrator Assessment (Full 20-Module Exam)",
    originalTrack: "admin-20",
    category: "Diagnostic Mastery & Certification",
    reason:
      "Comprehensive 20-module certification exam is replaced in the foundation track by the authoritative Module 12 Capstone & 5-domain evaluation.",
  },
];
