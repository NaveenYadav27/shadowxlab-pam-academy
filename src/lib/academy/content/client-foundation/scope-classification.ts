/**
 * SHADOWXLAB PAM ACADEMY — CURRICULUM SCOPE CLASSIFICATION REGISTRY
 * Explicitly maps every module in the repository to either:
 * 1. CLIENT_FOUNDATION_SCOPE (Authoritative 12-Module CyberArk Basic Training)
 * 2. OUTSIDE_CLIENT_FOUNDATION_SCOPE (Advanced enterprise / infrastructure / legacy content preserved separately)
 *
 * Guarantees that no advanced content is forced onto foundation learners,
 * while ensuring no existing code or tests are broken.
 */

import type {
  ClassifiedContentItem,
  CurriculumContentClassification,
  OutsideScopeItem,
} from "./types";

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

export const CONTENT_CLASSIFICATION_REGISTRY: ClassifiedContentItem[] = [
  // 1. REQUIRED CLIENT CONTENT (Mandatory core curriculum topics from 12 modules)
  {
    id: "req-m01-pam-intro",
    title: "Introduction to PAM, Privileged Accounts & Attack Vectors",
    moduleId: "client-m01",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Core foundational concept required by client syllabus.",
  },
  {
    id: "req-m02-platform-arch",
    title: "CyberArk Core Components (Vault, PVWA, CPM, PSM) & Port Protocols",
    moduleId: "client-m02",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Architecture topology required for all subsequent modules.",
  },
  {
    id: "req-m03-sec-concepts",
    title: "Architecture and Security Concepts & Workflow Tracing",
    moduleId: "client-m03",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Zero Trust, least privilege, and privileged request workflow analysis.",
  },
  {
    id: "req-m04-pvwa-fundamentals",
    title: "PVWA — Web Portal Fundamentals, Account Visibility & Access-Denied Diagnostics",
    moduleId: "client-m04",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Web portal navigation and account inspection required by client syllabus.",
  },
  {
    id: "req-m05-safes-acls",
    title: "Safes and Access Control, 11 Granular Permissions & Member Assignment",
    moduleId: "client-m05",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Safe access control and least-privilege matrix required by client syllabus.",
  },
  {
    id: "req-m06-account-onboarding",
    title: "Privileged Account Onboarding (Local, Domain, Windows, Linux, Service Accounts)",
    moduleId: "client-m06",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Core onboarding procedure and property configuration.",
  },
  {
    id: "req-m07-password-mgmt",
    title: "Password Management & Rotation (Verify, Change, Reconcile, Master Policy)",
    moduleId: "client-m07",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "CPM operations and rotation governance required by client syllabus.",
  },
  {
    id: "req-m08-psm-sessions",
    title: "Privileged Session Management (PSM Isolation, Brokering, Monitoring, Recording)",
    moduleId: "client-m08",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Session brokering, isolation, and audit required by client syllabus.",
  },
  {
    id: "req-m09-monitoring-audit",
    title: "Monitoring, Auditing and Reporting (Vault Audit Evidence, SIEM Concepts, Reports)",
    moduleId: "client-m09",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Audit evidence and compliance reporting required by client syllabus.",
  },
  {
    id: "req-m10-troubleshooting",
    title: "Troubleshooting Fundamentals & 3 Simulated Support Tickets",
    moduleId: "client-m10",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Diagnostic protocols and 3 simulated support tickets required by client syllabus.",
  },
  {
    id: "req-m11-admin-best-practices",
    title: "Administration Best Practices (Governance, Health Checks, Leavers, Break-Glass)",
    moduleId: "client-m11",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Operational procedures and enterprise lifecycle governance.",
  },
  {
    id: "req-m12-capstone-project",
    title: "Capstone Project and Assessment (5 Authoritative Project Tasks)",
    moduleId: "client-m12",
    classification: "REQUIRED_CLIENT_CONTENT",
    isMandatoryGate: true,
    rationale: "Comprehensive end-to-end practical assessment required by client syllabus.",
  },

  // 2. SUPPORTING EXPLANATIONS (Contextual architectural details, transparent disclaimers)
  {
    id: "sup-m02-non-human-secrets",
    title: "Non-Human Secrets & DevOps Secrets Management Overview",
    moduleId: "client-m02",
    classification: "SUPPORTING_EXPLANATION",
    isMandatoryGate: false,
    rationale: "Provides product landscape context without requiring deep Conjur hands-on.",
  },
  {
    id: "sup-m06-dir-limitation",
    title: "Browser-Based Simulated Directory Sync Notice",
    moduleId: "client-m06",
    classification: "SUPPORTING_EXPLANATION",
    isMandatoryGate: false,
    rationale: "Transparently explains browser sandbox constraints versus real AD.",
  },
  {
    id: "sup-m09-discovery-limitation",
    title: "Synthetic Discovery Feeds vs Subnet Port Scanners",
    moduleId: "client-m09",
    classification: "SUPPORTING_EXPLANATION",
    isMandatoryGate: false,
    rationale: "Transparently explains browser sandbox constraints versus live network sweeps.",
  },

  // 3. OPTIONAL ENRICHMENT (Supplementary exercises, deep-dive readings — NEVER mandatory progression gates)
  {
    id: "enr-m01-indep-audit",
    title: "Independent Identity Classification Audit",
    moduleId: "client-m01",
    classification: "OPTIONAL_ENRICHMENT",
    isMandatoryGate: false,
    rationale: "Supplemental practice for learners wanting extra exercise.",
  },
  {
    id: "enr-m04-prop-review",
    title: "Independent Account Property Review",
    moduleId: "client-m04",
    classification: "OPTIONAL_ENRICHMENT",
    isMandatoryGate: false,
    rationale: "Supplemental PVWA inspection practice.",
  },
  {
    id: "enr-m07-cpm-verify",
    title: "Independent CPM Password Verification",
    moduleId: "client-m07",
    classification: "OPTIONAL_ENRICHMENT",
    isMandatoryGate: false,
    rationale: "Supplemental verification exercise.",
  },
  {
    id: "enr-m11-governance-checklist",
    title: "Independent Governance Checklist Review",
    moduleId: "client-m11",
    classification: "OPTIONAL_ENRICHMENT",
    isMandatoryGate: false,
    rationale: "Supplemental administration checklist.",
  },
];

export function isMandatoryProgressionGate(
  classification: CurriculumContentClassification,
): boolean {
  return classification === "REQUIRED_CLIENT_CONTENT";
}

export function getContentClassification(itemId: string): CurriculumContentClassification {
  const found = CONTENT_CLASSIFICATION_REGISTRY.find((item) => item.id === itemId);
  if (found) return found.classification;
  if (OUTSIDE_CLIENT_FOUNDATION_SCOPE_MODULES.some((item) => item.id === itemId)) {
    return "OUTSIDE_CLIENT_FOUNDATION_SCOPE";
  }
  return "REQUIRED_CLIENT_CONTENT";
}
