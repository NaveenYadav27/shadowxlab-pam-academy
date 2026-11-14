export interface ConceptSection {
  title: string;
  summary: string;
  keyPoints: string[];
  architectureDiagram?: string;
}

export interface LabGuide {
  id: string;
  title: string;
  description: string;
  scenario: string;
  prerequisites: string[];
  steps: {
    number: number;
    title: string;
    action: string;
    expectedResult: string;
    consoleSection?: string;
  }[];
}

export interface JobRoleProfile {
  title: string;
  level: string;
  salaryRange: string;
  overview: string;
  dailyWorkflows: string[];
  requiredSkills: string[];
  certifications: string[];
}

export interface InterviewQA {
  question: string;
  difficulty: "Fundamental" | "Intermediate" | "Advanced" | "Scenario";
  answer: string;
  interviewerInsight: string;
}

export interface VisionMissionBlock {
  vision: string;
  mission: string;
  values: {
    name: string;
    principle: string;
    application: string;
  }[];
}

export interface ClassCurriculum {
  id: string;
  label: string;
  number: string;
  title: string;
  subtitle: string;
  duration: string;
  level: "Foundational" | "Associate" | "Professional" | "Advanced";
  concepts: ConceptSection[];
  labGuide: LabGuide;
  jobRoles: JobRoleProfile[];
  interviewPrep: InterviewQA[];
  visionMission: VisionMissionBlock;
}

export const SHADOWXLAB_CORE_VISION: VisionMissionBlock = {
  vision:
    "To eliminate privileged credential misuse and lateral movement attacks across global enterprises by engineering the most rigorous, high-fidelity browser-based PAM operational training platform in the world.",
  mission:
    "To bridge the severe enterprise cybersecurity skills deficit by replacing passive video-based tutorials with deterministic, hands-on administrative simulation that builds real-world production competence from day one.",
  values: [
    {
      name: "Operational Fidelity Over Theory",
      principle: "Security cannot be learned through slides or multiple-choice questions alone.",
      application:
        "Every learner interacts with authentic PVWA Classic administration screens, live CPM rotation cycles, and isolated PSM terminal brokers.",
    },
    {
      name: "Least Privilege by Architecture",
      principle:
        "Privilege must be granted conditionally, scoped strictly, and retracted automatically.",
      application:
        "Safe boundaries, member permission matrices, and dual-control approval gates are enforced across every training workflow.",
    },
    {
      name: "Evidence-Led Accountability",
      principle: "If an action is not provably audited, it cannot be trusted in production.",
      application:
        "Every vault operation, password check-out, and terminal keystroke generates immutable audit events and replayable evidence.",
    },
    {
      name: "Deterministic Simulation Security",
      principle:
        "Practice on production-grade architectures without endangering live enterprise systems.",
      application:
        "Safe, contained, zero-credential-leakage simulation engine prevents real-world infrastructure compromise while training genuine operational muscle memory.",
    },
    {
      name: "Workforce Career Empowerment",
      principle:
        "Mastery must translate directly to enterprise employment and operational leadership.",
      application:
        "Curriculum directly maps to real job roles, SOC integration, incident response, and tier-1 through tier-3 PAM engineering interviews.",
    },
  ],
};

export const ACADEMY_CLASSES: ClassCurriculum[] = [
  {
    id: "class-01",
    label: "CLASS 01",
    number: "01",
    title: "PAM Foundations & Administrator Role",
    subtitle: "Architecture, Credential Risk & Enterprise Request-to-Audit Workflow",
    duration: "1H 20M",
    level: "Foundational",
    concepts: [
      {
        title: "The Privileged Credential Crisis & Lateral Movement",
        summary:
          "Privileged accounts (Domain Admins, Unix root, database SA, service principals) represent the keys to the enterprise kingdom. Over 80% of enterprise security breaches involve compromised privileged credentials.",
        keyPoints: [
          "Attack Vector: Attackers dump local LSASS memory with tools like Mimikatz to harvest plaintext passwords and NTLM hashes.",
          "Lateral Movement: Pass-the-Hash and Kerberoasting allow adversaries to traverse workstation-to-server tiers until reaching Domain Controller Tier-0.",
          "Mitigation: CyberArk Digital Vault isolates credentials behind an hardened bastion, while CPM rotates passwords automatically after checkout, rendering stolen hashes useless.",
        ],
      },
      {
        title: "CyberArk Core Component Architecture",
        summary:
          "The classic CyberArk Privileged Access Security (PAS) solution consists of four primary interdependent components working in tandem.",
        keyPoints: [
          "Digital Vault (Server): Hardened Windows server with non-routable protocol (TCP 1858), encrypted filesystem, and tamper-evident metadata database.",
          "PVWA (Password Vault Web Access): Classic IIS/Web application providing administrative GUI, REST API, reporting, and policy configuration.",
          "CPM (Central Policy Manager): Windows service responsible for automated credential discovery, verification, periodic rotation, and emergency reconciliation on target hosts.",
          "PSM (Privileged Session Manager): Hardened jump server proxy that terminates user sessions, injects credentials directly into target protocols (RDP, SSH, SQL), and records all keystrokes.",
        ],
      },
      {
        title: "Enterprise PAM Request-to-Audit Operational Workflow",
        summary:
          "Every operational interaction follows a strict governance sequence to guarantee non-repudiation and least privilege.",
        keyPoints: [
          "1. Request: Operator requests access to target account citing ServiceNow ticket ID and business justification.",
          "2. Approval: Dual-control gate routes notification to Safe Owner or Security Manager for authorization.",
          "3. Injection: PSM proxies connection and retrieves password from Vault; password is never displayed on the operator screen.",
          "4. Recording: Video frame capture and indexed keystroke logging record the entire administrative session.",
          "5. One-Time Password Rotation: Upon session closure, CPM automatically rotates the target password to a new cryptographically random string.",
          "6. Audit Archival: Tamper-proof log entry stored in Vault with timestamp, actor, client IP, and ServiceNow ticket correlation.",
        ],
      },
    ],
    labGuide: {
      id: "Lab 01 · Trace the PAM architecture",
      title: "Lab 01 · Trace the PAM Architecture & Request Flow",
      description:
        "Inspect the initialized Digital Vault environment, review component health indicators, and trace the lifecycle of a privileged credential from inventory through CPM verification and PSM connection.",
      scenario:
        "Global Financial Services (corp.gfs.local) has deployed a CyberArk PAM environment with 7 Safes and 16 target accounts. As the new PAM Administrator, you must validate component connectivity, inspect the Safe architecture, test CPM verification, and confirm PSM session readiness.",
      prerequisites: [
        "Logged into ShadowXLab PAM Academy in Demo Mode.",
        "Basic understanding of Windows Active Directory and Linux SSH privileged access.",
      ],
      steps: [
        {
          number: 1,
          title: "Inspect Vault Component Health",
          action:
            "Review top header status indicators for Vault Server (CORP-PAM-VAULT01), CPM (ACTIVE), and PSM (CONNECTED).",
          expectedResult: "All three core components report healthy green operational status.",
          consoleSection: "accounts",
        },
        {
          number: 2,
          title: "Audit Safe Architecture Boundaries",
          action:
            "Navigate to the Safes Console. Inspect the 7 seeded Safes: WIN-SAFE, UNIX-SAFE, DBA-SAFE, APP-SAFE, SERVICE-SAFE, DOMAIN-SAFE, and EMERGENCY-SAFE.",
          expectedResult: "Safes are segregated by operational domain and security boundary.",
          consoleSection: "safes",
        },
        {
          number: 3,
          title: "Examine Privileged Account Inventory",
          action:
            "Navigate to Accounts Console. Locate account Administrator on WIN-SRV-01 and root on LNX-SRV-01.",
          expectedResult:
            "Account grid renders target system, platform type, and current CPM management state.",
          consoleSection: "accounts",
        },
        {
          number: 4,
          title: "Trigger Credential Verification (CPM)",
          action:
            "Select account Administrator and click 'Verify' on the toolbar. Review the simulated CPM execution.",
          expectedResult: "CPM verifies password against target system and appends audit event.",
          consoleSection: "cpm",
        },
        {
          number: 5,
          title: "Launch Brokered PSM Connection",
          action:
            "Select root on LNX-SRV-01 and click 'Connect (PSM)'. Open the active console and run 'whoami'.",
          expectedResult:
            "PSM establishes monitored terminal session with active recording telemetry.",
          consoleSection: "psm",
        },
        {
          number: 6,
          title: "Validate Lab Objectives",
          action: "Return to Learning Academy Class 01 and click 'Validate & Complete Lab'.",
          expectedResult: "All 7 objectives evaluate to DONE with 100/100 score.",
          consoleSection: "academy",
        },
      ],
    },
    jobRoles: [
      {
        title: "PAM / CyberArk Operations Administrator",
        level: "Mid-Level (2–4 Years Experience)",
        salaryRange: "$95,000 – $130,000 / year (₹14,00,000 – ₹22,00,000 INR)",
        overview:
          "Responsible for day-to-day administration of CyberArk PAS / Privilege Cloud environments, Safe provisioning, account onboarding, CPM rotation troubleshooting, and break-glass lifecycle management.",
        dailyWorkflows: [
          "Perform daily morning health checks on Digital Vault services, CPM queues, and PSM connection brokers.",
          "Triage and resolve failed password rotation incidents (e.g. account lockouts, RPC server unavailable, access denied).",
          "Onboard new infrastructure and application service accounts across Windows, Linux, AWS, and database targets.",
          "Grant, modify, and recertify Safe memberships in adherence with least-privilege RBAC standards.",
          "Provide audit evidence and access logs to internal compliance and external regulatory auditors.",
        ],
        requiredSkills: [
          "CyberArk PVWA Classic and Modern interface administration",
          "Windows Server (Active Directory, Kerberos, LDAP, Group Policy)",
          "Linux/Unix system administration (SSH key exchange, sudoers, PAM modules)",
          "Network protocols: TCP 1858 (Vault), 3389 (RDP), 22 (SSH), 443 (HTTPS), 135/445 (SMB/WMI)",
          "ITSM ticketing integration (ServiceNow change requests)",
        ],
        certifications: [
          "CyberArk Certified Defender (PAM)",
          "CyberArk Certified Sentry (PAM)",
          "CompTIA Security+ / CySA+",
        ],
      },
      {
        title: "Privileged Access Management (PAM) Engineer",
        level: "Senior (4–7 Years Experience)",
        salaryRange: "$130,000 – $170,000 / year (₹22,00,000 – ₹35,00,000 INR)",
        overview:
          "Designs, deploys, and scales enterprise PAM infrastructure. Automates account discovery, custom CPM plugin development, disaster recovery vault clustering, and zero-trust PAM integrations.",
        dailyWorkflows: [
          "Architect high-availability Vault clusters and Disaster Recovery (DR) replication topology.",
          "Develop custom CPM plugins and PSM connection components for proprietary in-house applications.",
          "Design automated account discovery pipelines using network scanning and Active Directory hooks.",
          "Implement Just-In-Time (JIT) access and ephemeral credential provisioning.",
          "Lead emergency response during severe credential compromise or vault recovery drills.",
        ],
        requiredSkills: [
          "CyberArk PAS architecture and component clustering (Disaster Recovery Vault)",
          "PowerShell, Python, and REST API automation (CyberArk PACLI and REST APIs)",
          "Database administration (Oracle, Microsoft SQL, PostgreSQL authentication)",
          "Cloud IAM privilege management (AWS IAM, Azure Privileged Identity Management)",
          "Public Key Infrastructure (PKI), TLS certificates, and HSM integration",
        ],
        certifications: [
          "CyberArk Certified Delivery Engineer (CDE)",
          "CyberArk Certified Guardian",
          "CISSP (Certified Information Systems Security Professional)",
        ],
      },
    ],
    interviewPrep: [
      {
        question:
          "Describe the core CyberArk PAS components and the exact network ports required between them.",
        difficulty: "Fundamental",
        answer:
          "The Digital Vault communicates on proprietary TCP 1858 with PVWA, CPM, and PSM. PVWA serves users over HTTPS 443. PSM listens on RDP 3389 or HTML5 Gateway 443 from operators, and connects outbound to Windows targets on 3389/SMB 445 or Linux on SSH 22. CPM connects to targets over SMB/RPC 135/445, LDAP 389/636, or SSH 22 to perform password rotations.",
        interviewerInsight:
          "Interviewers look for exact port knowledge and directional traffic understanding to ensure you can troubleshoot enterprise firewall rules.",
      },
      {
        question:
          "What is the difference between CPM Password Verification, Password Change, and Reconciliation?",
        difficulty: "Fundamental",
        answer:
          "Verify tests whether the credential stored in the Vault matches the active password on the target host by performing an authentication handshake without modifying the target. Change generates a new random password, logs into the target using the current password, updates the target to the new password, and saves the new password in the Vault. Reconcile handles out-of-sync credentials: CPM logs into the target host using an independent high-privilege Reconcile Account and forcibly resets the target password without needing the current invalid password.",
        interviewerInsight:
          "This is the single most frequently asked PAM interview question worldwide. You must articulate the 3-state lifecycle accurately.",
      },
      {
        question:
          "How does CyberArk PSM prevent administrators from discovering the target system credentials?",
        difficulty: "Intermediate",
        answer:
          "PSM uses transparent credential injection. The operator authenticates to PVWA and requests a connection. PVWA instructs PSM to create an isolated RDP/SSH proxy session. PSM retrieves the target credentials directly from the Digital Vault over TCP 1858 and programmatically injects them into the native client protocol memory space on the PSM server. The operator's client machine receives only encrypted screen display bitmaps and returns mouse/keystroke coordinates.",
        interviewerInsight:
          "Demonstrates that you understand session isolation and zero-trust credential masking.",
      },
      {
        question:
          "What is the security risk of storing an Active Directory Domain Administrator in a Safe with shared membership?",
        difficulty: "Scenario",
        answer:
          "If multiple users have 'Retrieve' or 'Use' permissions on a Tier-0 Domain Admin without dual control, attribution is lost. If an operator extracts the hash or password, they could establish persistence or launch Golden Ticket attacks. Tier-0 accounts must be placed in a dedicated DOMAIN-SAFE restricted strictly to domain architects, enforced by dual-control ServiceNow change requests, one-time-password (OTP) checkout, and exclusive locking.",
        interviewerInsight:
          "Tests your architectural alignment with Microsoft Active Directory Tiering (Tier-0, Tier-1, Tier-2) and PAM governance.",
      },
      {
        question:
          "How does the Digital Vault protect itself from being attacked if an attacker gains root/admin on the host OS?",
        difficulty: "Advanced",
        answer:
          "The Digital Vault runs on a stripped-down, hardened Windows Server with all non-essential Windows services disabled, local Windows Firewall locked strictly to TCP 1858, no third-party agents (anti-virus or backup) installed, and encrypted filesystem volumes (Vault keys stored on HSM or encrypted key storage). The Vault database is inaccessible to standard Windows administrative tools.",
        interviewerInsight: "Shows you understand CyberArk's proprietary bastion hardening model.",
      },
    ],
    visionMission: SHADOWXLAB_CORE_VISION,
  },
  {
    id: "class-02",
    label: "CLASS 02",
    number: "02",
    title: "Safe Administration & Access Management",
    subtitle: "Safe Hierarchies, Granular Permissions & Least Privilege Boundaries",
    duration: "1H 20M",
    level: "Associate",
    concepts: [
      {
        title: "Safe Architecture & Boundary Segregation",
        summary:
          "Safes are the fundamental security isolation boundaries within the CyberArk Digital Vault. Safes control encryption domain, operational retention policies, and granular user/group authorizations.",
        keyPoints: [
          "Segregation by Tier: Separate Safes by operational domain (Windows Server, Linux Infrastructure, Database Administration, Core Network, and Cloud IAM).",
          "Segregation by Sensitivity: Standard administrative credentials must never share a Safe boundary with Tier-0 breakglass or domain-level administrative credentials.",
          "Retention Policies: Safes define retention duration for deleted accounts and historical password versions (e.g. 7 days for standard systems, 90 days for critical financial records).",
        ],
      },
      {
        title: "Granular Safe Permissions Matrix",
        summary:
          "CyberArk Safe permissions are highly granular and divided into three operational categories: Content Retrieval, Safe Administration, and Session Access.",
        keyPoints: [
          "Access Permissions: 'Use accounts' (connect via PSM without viewing password) vs 'Retrieve accounts' (display password in plaintext).",
          "Authoring Permissions: 'List accounts' (view object metadata in grid), 'Add accounts' (enroll new credentials), 'Update account content' (modify password manual values).",
          "Administrative Permissions: 'Manage Safe' (add/remove members, modify permissions), 'Initiate CPM operations' (trigger manual verify/change/reconcile), 'View Audit'.",
        ],
      },
      {
        title: "Least Privilege & Separation of Duties",
        summary:
          "Enforcing least privilege guarantees that operators can only execute tasks required for their certified job functions.",
        keyPoints: [
          "Security Auditors: Granted 'List accounts' and 'View Audit' only. Never granted 'Retrieve' or 'Use'.",
          "Junior Operators: Granted 'List accounts', 'Use accounts', and 'Initiate privileged sessions'. Never granted 'Retrieve' or 'Manage Safe'.",
          "Safe Owners: Granted 'Manage Safe' to approve access and delegate lower-tier operators.",
        ],
      },
    ],
    labGuide: {
      id: "Lab 02 · Provision DBA-SAFE access",
      title: "Lab 02 · Safe Permission Configuration & Access Provisioning",
      description:
        "Provision a new database administrator identity on DBA-SAFE, configure granular least-privilege permissions, and verify authorization boundaries through access reviews.",
      scenario:
        "The Oracle Database operations team has hired a senior DBA contractor. You must grant the contractor membership on DBA-SAFE with permission to list, use, and initiate sessions, while strictly denying plaintext retrieval and safe management.",
      prerequisites: ["Completion of Class 01.", "Access to Safes Console in PAM Academy."],
      steps: [
        {
          number: 1,
          title: "Select Target Safe",
          action: "Navigate to Safes Console and select 'DBA-SAFE' from the inventory list.",
          expectedResult: "DBA-SAFE details panel opens with current membership list.",
          consoleSection: "safes",
        },
        {
          number: 2,
          title: "Inspect Member Permissions",
          action: "Switch to 'Members & Permissions' tab. Select member 'dba_user'.",
          expectedResult: "Active permission checkboxes display current authorizations.",
          consoleSection: "safes",
        },
        {
          number: 3,
          title: "Configure Least Privilege Boundary",
          action:
            "Ensure 'Use accounts', 'List accounts', and 'Initiate privileged sessions' are enabled. Confirm 'Retrieve accounts' and 'Manage Safe' are disabled.",
          expectedResult: "Granular authorization matrix reflects least privilege policy.",
          consoleSection: "safes",
        },
        {
          number: 4,
          title: "Save Authorizations & Review Access",
          action:
            "Click 'Save Member Permissions'. Then click 'Review Access' on the Safe toolbar.",
          expectedResult: "Access boundary validation reports successful compliance test.",
          consoleSection: "safes",
        },
      ],
    },
    jobRoles: [
      {
        title: "IAM & Access Governance Specialist",
        level: "Mid-to-Senior",
        salaryRange: "$105,000 – $145,000 / year",
        overview:
          "Governs enterprise Safe access requests, executes quarterly privileged user recertifications, enforces dual-control approval policies, and ensures regulatory compliance with SOX, PCI-DSS, and ISO 27001.",
        dailyWorkflows: [
          "Review and approve/reject Safe access provisioning requests in accordance with role-based access control (RBAC).",
          "Conduct quarterly Safe access reviews and automatically purge stale or orphaned memberships.",
          "Design Safe hierarchy templates for new business units and mergers & acquisitions.",
          "Ensure PCI-DSS requirement 7 (restrict access to need-to-know) and requirement 8 (identify and authenticate access) compliance.",
        ],
        requiredSkills: [
          "CyberArk Safe permissions matrix and inheritance models",
          "SailPoint / Saviynt Identity Governance integration",
          "Active Directory group design (Role groups vs Resource groups)",
          "Audit compliance frameworks (SOX, PCI-DSS, NIST SP 800-53 AC-6)",
        ],
        certifications: [
          "CyberArk Certified Defender",
          "CISA (Certified Information Systems Auditor)",
        ],
      },
    ],
    interviewPrep: [
      {
        question:
          "Explain the difference between 'Use accounts' and 'Retrieve accounts' permissions in a CyberArk Safe.",
        difficulty: "Fundamental",
        answer:
          "'Use accounts' allows the operator to initiate a brokered PSM session (RDP, SSH, SQL) where PSM injects the password into the session transparently without ever exposing it to the user. 'Retrieve accounts' allows the user to click 'Show Password' or 'Copy Password' in PVWA and view the raw plaintext secret in the browser. In production, 95%+ of operators should have 'Use' only.",
        interviewerInsight:
          "Crucial for identifying candidates who understand zero-trust credential hygiene vs dangerous legacy practices.",
      },
      {
        question:
          "How should an enterprise structure Safes to prevent privilege escalation between Windows Server admins and Linux admins?",
        difficulty: "Intermediate",
        answer:
          "Establish distinct Safe boundaries based on operational tier and operating system: WIN-SAFE and UNIX-SAFE. Ensure that membership is mapped to dedicated Active Directory security groups (e.g., CyberArk-WIN-Users and CyberArk-UNIX-Users). Never place Linux root and Windows Domain Admin credentials in the same Safe. Furthermore, ensure local administrator passwords are keyed uniquely by CPM.",
        interviewerInsight: "Tests structural design thinking and segregation of duties.",
      },
    ],
    visionMission: SHADOWXLAB_CORE_VISION,
  },
  {
    id: "class-03",
    label: "CLASS 03",
    number: "03",
    title: "Privileged Account Onboarding",
    subtitle: "Platform Configuration, Property Mapping & Credential Validation",
    duration: "1H 20M",
    level: "Associate",
    concepts: [
      {
        title: "Account Types & Architectural Classification",
        summary:
          "Enterprises possess diverse privileged account architectures: local administrator accounts, Active Directory domain accounts, service accounts, database superusers, and network appliance enable accounts.",
        keyPoints: [
          "Local Accounts: Stored locally on target SAM database or /etc/shadow. Bound to a single machine IP/hostname.",
          "Domain Accounts: Reside on Active Directory Domain Controllers. Have privileges across multiple member servers.",
          "Service Accounts: Non-human accounts executing Windows Services, cron jobs, or IIS Application Pools. Have service dependencies that must be restarted upon rotation.",
          "Database Superusers: Accounts like Oracle SYS/SYSTEM or SQL Server sa executing database maintenance tasks.",
        ],
      },
      {
        title: "Platform Selection & Account Properties",
        summary:
          "Every onboarded account must be assigned to an active CyberArk Platform policy. The platform defines password length, rotation frequency, CPM plugin executable, and prompt timing.",
        keyPoints: [
          "Mandatory Properties: Address (hostname or FQDN), User Name, Safe assignment, and Platform ID.",
          "Optional/Custom Properties: Database port, service name, logon domain, or linked reconcile account.",
          "Pre-onboarding Verification: Credentials must be verified manually or through discovery before enabling automatic rotation.",
        ],
      },
    ],
    labGuide: {
      id: "Lab 03 · Onboard WIN-SRV-01 Administrator",
      title: "Lab 03 · Manual Account Onboarding & Platform Validation",
      description:
        "Onboard a privileged administrative credential into the Digital Vault, assign it to a target platform, configure properties, and verify CPM readiness.",
      scenario:
        "A new Windows application server WIN-SRV-01 has been provisioned. As the PAM Administrator, you must onboard its local administrator account into WIN-SAFE under the Windows Server Local platform policy.",
      prerequisites: ["Completion of Class 01 and 02", "Access to Accounts Console in PAM Academy"],
      steps: [
        {
          number: 1,
          title: "Open Add Account Workflow",
          action: "Navigate to Accounts Console and click '+ Add Account' on the context toolbar.",
          expectedResult: "CyberArk classic account onboarding modal opens.",
          consoleSection: "accounts",
        },
        {
          number: 2,
          title: "Select Safe & Platform",
          action: "Select Safe 'WIN-SAFE' and Platform 'Windows Server Local'.",
          expectedResult: "Form fields dynamically update to match platform requirements.",
          consoleSection: "accounts",
        },
        {
          number: 3,
          title: "Input Account Properties",
          action:
            "Enter Username 'Administrator', Target Address 'WIN-SRV-01', Purpose 'Application Host Management', and Owner 'windows_admin'.",
          expectedResult: "All mandatory identifying properties populated.",
          consoleSection: "accounts",
        },
        {
          number: 4,
          title: "Submit Onboarding Request",
          action: "Click 'Onboard Account'.",
          expectedResult:
            "Account appears in inventory grid with status 'Managed' and audit event generated.",
          consoleSection: "accounts",
        },
      ],
    },
    jobRoles: [
      {
        title: "PAM Onboarding & Integration Engineer",
        level: "Mid-Level",
        salaryRange: "$100,000 – $135,000 / year",
        overview:
          "Specializes in onboarding enterprise assets into the Vault at scale, configuring account discovery rules (DNA / Discovery), and working with server application owners to onboard service accounts safely.",
        dailyWorkflows: [
          "Execute automated discovery scans across enterprise IP subnets to identify unmanaged privileged accounts.",
          "Work with Linux and Windows server teams to onboard local root and administrator accounts.",
          "Map application service dependencies to ensure CPM restarts services when passwords rotate.",
          "Validate post-onboarding CPM verification to prevent broken production services.",
        ],
        requiredSkills: [
          "CyberArk Discovery & Onboarding Rules (Automatic Onboarding)",
          "PowerShell and Bash scripting for bulk account imports",
          "WMI, RPC, and SSH connectivity troubleshooting",
          "Windows Service Control Manager (SCM) and IIS AppPool architectures",
        ],
        certifications: [
          "CyberArk Certified Defender",
          "Microsoft Certified: Windows Server Hybrid Core",
        ],
      },
    ],
    interviewPrep: [
      {
        question:
          "What happens if you onboard an Active Directory service account with an incorrect address or username?",
        difficulty: "Intermediate",
        answer:
          "If the address or username does not match Active Directory, the initial CPM verification will fail with 'Account not found' or 'Access Denied'. If automatic change is triggered, the CPM will fail rotation and may lock the account out, potentially bringing down the dependent enterprise service. Pre-onboarding credential validation is mandatory.",
        interviewerInsight:
          "Assesses whether the candidate understands the operational risk of automated rotation on mission-critical services.",
      },
    ],
    visionMission: SHADOWXLAB_CORE_VISION,
  },
  {
    id: "class-04",
    label: "CLASS 04",
    number: "04",
    title: "Identity & Privileged Account Security",
    subtitle: "Human vs Non-Human Identities, Tiering & Privilege Boundaries",
    duration: "1H 20M",
    level: "Professional",
    concepts: [
      {
        title: "Human vs Non-Human Identity Governance",
        summary:
          "Enterprises today possess 10 to 45 times more non-human machine identities (service accounts, API tokens, CI/CD runners, RPA bots) than human administrative users.",
        keyPoints: [
          "Human Identities: Bound to individuals (e.g., jsmith-adm). Rotated on long intervals or checked out with dual control. Authenticated via MFA.",
          "Non-Human Identities: Embedded in configuration files, CI/CD pipelines, Kubernetes secrets, or Windows services. Must be rotated without breaking uptime.",
          "Technical Custodian vs Business Owner: Every non-human identity must have an identified human owner responsible for recertification.",
        ],
      },
      {
        title: "Active Directory Tiering Model (Tier 0, 1, 2)",
        summary:
          "Microsoft's Enterprise Access Model isolates privilege domains to prevent lateral credential exposure.",
        keyPoints: [
          "Tier 0 (Identity): Domain Controllers, PKI, ADFS, CyberArk Vault. Credentials must never be cached on lower tiers.",
          "Tier 1 (Enterprise Applications): SQL databases, application servers, web farms, file clusters.",
          "Tier 2 (Workstations & Endpoints): User laptops, POS terminals, developer workstations.",
        ],
      },
    ],
    labGuide: {
      id: "Lab 04 · Classify the enterprise inventory",
      title: "Lab 04 · Enterprise Identity Classification & Risk Scoring",
      description:
        "Audit the enterprise privileged account inventory across Windows, Linux, Database, and Cloud platforms. Classify human vs non-human identities and identify unmanaged high-risk targets.",
      scenario:
        "Global Financial Services requires a complete classification audit of its 16 vaulted privileged accounts to prepare for a regulatory compliance audit.",
      prerequisites: ["Completion of Classes 01–03", "Access to Accounts and Policies consoles"],
      steps: [
        {
          number: 1,
          title: "Filter by Account Type",
          action:
            "In Accounts Console, use the Type dropdown to inspect Service accounts vs Database vs Human Administrator accounts.",
          expectedResult: "Grid displays filtered accounts by identity classification.",
          consoleSection: "accounts",
        },
        {
          number: 2,
          title: "Identify Unmanaged Credentials",
          action:
            "Filter grid by status 'Unmanaged' and identify accounts not currently subject to automated CPM rotation.",
          expectedResult:
            "Identifies accounts like oracle on DB-ORA-01 requiring policy enrollment.",
          consoleSection: "accounts",
        },
        {
          number: 3,
          title: "Audit Password Policies",
          action:
            "Navigate to Password Policies view and review rotation intervals (Emergency-7d, Standard-30d, Service-60d).",
          expectedResult: "Policy matrix displays complexity rules and rotation frequencies.",
          consoleSection: "policies",
        },
      ],
    },
    jobRoles: [
      {
        title: "IAM Security Architect",
        level: "Senior / Lead",
        salaryRange: "$150,000 – $200,000 / year",
        overview:
          "Defines enterprise privileged identity governance frameworks, cloud IAM integration policies, Active Directory tiering, and non-human secret management architectures.",
        dailyWorkflows: [
          "Establish enterprise PAM policies aligned with CIS benchmarks and NIST 800-207 Zero Trust.",
          "Architect secrets management integration for CI/CD pipelines (Jenkins, GitHub Actions, HashiCorp Vault / CyberArk Conjur).",
          "Define break-glass procedures for Disaster Recovery and ransomware defense scenarios.",
        ],
        requiredSkills: [
          "Zero Trust Architecture (NIST SP 800-207)",
          "CyberArk PAS and Conjur Secrets Manager",
          "Cloud Identity (AWS IAM Identity Center, Azure AD / Entra ID PIM)",
        ],
        certifications: ["CISSP", "CyberArk Certified Guardian"],
      },
    ],
    interviewPrep: [
      {
        question:
          "Why is rotating a Windows service account password more complex than rotating a human administrator password?",
        difficulty: "Intermediate",
        answer:
          "When a human administrator password is changed, the new password is saved in the Vault and used for subsequent logins. But when a Windows service account password is changed in Active Directory, any running Windows service running under that service account will immediately fail on next restart or ticket renewal if its local Service Control Manager (SCM) credential is not synchronized. CPM must rotate the password in AD, connect to every member server running that service, update the password in SCM, and gracefully restart the service.",
        interviewerInsight:
          "Essential for determining whether the candidate has real production operations experience.",
      },
    ],
    visionMission: SHADOWXLAB_CORE_VISION,
  },
  {
    id: "class-05",
    label: "CLASS 05",
    number: "05",
    title: "CPM Operations & Password Management",
    subtitle: "Deterministic Verification, Rotation Cycles & Error Recovery",
    duration: "1H 20M",
    level: "Professional",
    concepts: [
      {
        title: "Central Policy Manager (CPM) Architecture",
        summary:
          "The CPM is the automated lifecycle engine of CyberArk. It runs as a Windows service that executes policy plugins (DLLs, scripts, and terminal prompts) against target devices.",
        keyPoints: [
          "Heartbeat Engine: CPM periodically polls the Digital Vault over TCP 1858 to download tasks queued for execution.",
          "Verify: Non-destructive test of password against target authentication API (SMB, SSH, LDAP, TNS, TDS).",
          "Change: Generates new cryptographically strong password meeting policy complexity, authenticates with current credential, commits new password to target, and confirms Vault storage.",
          "Reconcile: Resets out-of-sync credentials by authenticating as an assigned Reconcile Account with administrative reset authority.",
        ],
      },
      {
        title: "Root Cause Analysis of CPM Rotation Failures",
        summary:
          "In production environments, password rotations encounter failures across four common vectors.",
        keyPoints: [
          "Error 2101 / 2103: Network connectivity failure (host down, firewall blocking port 135/445 or 22).",
          "Error 2121: Authentication failure (current password does not match target, credentials desynchronized).",
          "Error 80070005: Access Denied / insufficient permissions on target system to change password.",
          "Account Locked: Consecutive failed authentication attempts triggered target account lockout policy.",
        ],
      },
    ],
    labGuide: {
      id: "Lab 05A · Rotate a managed credential",
      title: "Lab 05 · CPM Credential Rotation & Failure Diagnosis",
      description:
        "Trigger deterministic credential rotation, observe CPM policy execution, diagnose a simulated rotation failure, and recover synchronization using reconciliation.",
      scenario:
        "Account svc_backup on WIN-SRV-02 has experienced a rotation failure and is flagged 'Rotation failed' due to account lockout on target. You must diagnose the error, repair target connectivity, and execute reconciliation.",
      prerequisites: ["Completion of Classes 01–04", "Access to CPM Console in PAM Academy"],
      steps: [
        {
          number: 1,
          title: "Review CPM Operations Queue",
          action:
            "Navigate to CPM Console. Inspect the summary strip: Total Managed, Verify Required, Rotation Failed.",
          expectedResult: "Identifies svc_backup in Rotation Failed status.",
          consoleSection: "cpm",
        },
        {
          number: 2,
          title: "Select Failed Account",
          action:
            "Select account svc_backup on WIN-SRV-02 and review the failure cause in CPM details.",
          expectedResult: "Details display: 'Account locked on target host'.",
          consoleSection: "cpm",
        },
        {
          number: 3,
          title: "Execute Diagnostic Repair",
          action: "Click 'Unlock Account on Target' in the diagnostic repair panel.",
          expectedResult: "Target account lockout flag cleared.",
          consoleSection: "cpm",
        },
        {
          number: 4,
          title: "Execute Password Reconciliation",
          action: "Click 'Reconcile Account' on the CPM toolbar.",
          expectedResult:
            "Reconciliation succeeds: account transitions to 'Managed' and audit event generated.",
          consoleSection: "cpm",
        },
      ],
    },
    jobRoles: [
      {
        title: "PAM L2/L3 Incident & Operations Engineer",
        level: "Mid-to-Senior",
        salaryRange: "$115,000 – $150,000 / year",
        overview:
          "Specializes in resolving complex CPM rotation failures, plugin debugging, target host authentication desynchronization, and managing high-severity PAM operational incidents.",
        dailyWorkflows: [
          "Investigate CPM log files (pm.log, pm_error.log, and individual platform third-party logs).",
          "Diagnose WMI and RPC communication errors across firewalled server enclaves.",
          "Configure and maintain reconcile accounts across Active Directory domains and Linux clusters.",
          "Coordinate emergency credential rotations following security incidents or employee departures.",
        ],
        requiredSkills: [
          "CyberArk CPM architecture, plugin mechanics, and process/prompts ini files",
          "Windows RPC, DCOM, and SMB network diagnostics",
          "Linux SSH PAM configuration and shadow file permissions",
          "Log analysis and regex troubleshooting",
        ],
        certifications: ["CyberArk Certified Sentry", "CyberArk Certified Defender"],
      },
    ],
    interviewPrep: [
      {
        question:
          "A CPM password change fails with error 'Access is Denied (win32 error 5)'. What is your step-by-step troubleshooting methodology?",
        difficulty: "Advanced",
        answer:
          "1. Inspect pm_error.log in CPM directory for exact error code and timestamp.\n2. Confirm the account is not locked out in Active Directory or target local SAM.\n3. Verify network connectivity from CPM server to target on port 445 (SMB) and 135 (RPC) using Test-NetConnection.\n4. Check User Account Control (UAC) remote restrictions (LocalAccountTokenFilterPolicy registry key on target Windows server).\n5. Verify that the account has permission to change its own password, or assign a domain reconcile account to execute the change via privileged reset.",
        interviewerInsight:
          "Proves whether you have genuine hands-on engineering troubleshooting capability or only conceptual awareness.",
      },
    ],
    visionMission: SHADOWXLAB_CORE_VISION,
  },
  {
    id: "class-06",
    label: "CLASS 06",
    number: "06",
    title: "PSM Operations & Session Management",
    subtitle: "Brokered Connections, Session Recording & Security Telemetry",
    duration: "1H 20M",
    level: "Advanced",
    concepts: [
      {
        title: "Privileged Session Manager (PSM) Gateway Architecture",
        summary:
          "PSM eliminates the need for administrators to know privileged passwords. It establishes a secure jump host boundary between user workstations and mission-critical servers.",
        keyPoints: [
          "Protocol Isolation: User workstations connect to PSM over TLS/RDP. PSM initiates a completely separate native session to the target host.",
          "Credential Injection: PSM retrieves the target credentials from the Vault in real-time and injects them into the session without operator visibility.",
          "Complete Keystroke & Video Telemetry: PSM records every keystroke, window title, executed command, and video frames for forensic auditing.",
        ],
      },
      {
        title: "Live Monitoring & Session Termination",
        summary:
          "Security Operations Center (SOC) analysts can monitor active PSM sessions in real-time and immediately terminate rogue or unapproved commands.",
        keyPoints: [
          "Real-Time Monitoring: Security teams can shadow active sessions without alerting the operator.",
          "Suspicious Command Triggers: Commands like 'cat /etc/shadow', 'mimikatz', or unauthorized database drops trigger high-risk alerts.",
          "Emergency Kill: Authorized administrators can sever the session immediately, locking the target account.",
        ],
      },
    ],
    labGuide: {
      id: "Lab 06A · Launch an approved session",
      title: "Lab 06 · PSM Session Brokering & Terminal Command Auditing",
      description:
        "Configure ticket-backed session approval, launch an isolated terminal session on a target server, execute administrative commands, and review immutable session recordings.",
      scenario:
        "A critical maintenance task requires emergency SSH root access to LNX-SRV-01. You must input a valid change ticket ID, initiate an approved PSM session, execute diagnostic commands, and verify session audit telemetry.",
      prerequisites: ["Completion of Classes 01–05", "Access to PSM Console in PAM Academy"],
      steps: [
        {
          number: 1,
          title: "Configure Session Launch",
          action:
            "Navigate to PSM Console. In Launch Privileged Session, select target root on LNX-SRV-01.",
          expectedResult: "Target connection parameters populated.",
          consoleSection: "psm",
        },
        {
          number: 2,
          title: "Input ITSM Change Ticket",
          action: "Enter Ticket Reference 'CHG-10294' and Reason 'Kernel security patch update'.",
          expectedResult: "Dual-control ticket gate satisfied.",
          consoleSection: "psm",
        },
        {
          number: 3,
          title: "Launch Monitored Session",
          action: "Click 'Launch Brokered Session'.",
          expectedResult:
            "Live terminal opens with recording indicator '● REC' and root shell prompt.",
          consoleSection: "psm",
        },
        {
          number: 4,
          title: "Execute Audited Commands",
          action: "Click command shortcuts 'whoami' and 'uname -r'. Observe deterministic output.",
          expectedResult: "Commands executed, responses returned, and keystrokes captured.",
          consoleSection: "psm",
        },
        {
          number: 5,
          title: "Terminate Session & Review Audit Archive",
          action: "Click 'End Session' and navigate to 'Session Monitoring & Recordings' tab.",
          expectedResult: "Session archived with duration, command log, and evidence verified.",
          consoleSection: "psm",
        },
      ],
    },
    jobRoles: [
      {
        title: "SOC / Threat Hunter PAM Specialist",
        level: "Senior",
        salaryRange: "$125,000 – $165,000 / year",
        overview:
          "Integrates PAM session telemetry with SIEM (Splunk, Microsoft Sentinel) to detect anomalous privileged user behavior, insider threats, and lateral movement in real-time.",
        dailyWorkflows: [
          "Monitor live PSM session alerts triggered by risky command executions.",
          "Perform forensic reviews of recorded PSM sessions following security incident investigations.",
          "Tune CyberArk Privileged Threat Analytics (PTA) behavioral baselines.",
          "Correlate SIEM security alerts with PAM credential checkout and terminal telemetry.",
        ],
        requiredSkills: [
          "CyberArk PSM architecture and keystroke logging integration",
          "SIEM integration (Splunk, Microsoft Sentinel, IBM QRadar)",
          "CyberArk Privileged Threat Analytics (PTA)",
          "MITRE ATT&CK framework for Privileged Access (TA0004)",
        ],
        certifications: ["CyberArk Certified Sentry", "GIAC Certified Incident Handler (GCIH)"],
      },
    ],
    interviewPrep: [
      {
        question:
          "How does CyberArk PSM handle session recording storage and prevent video files from filling up server disks?",
        difficulty: "Intermediate",
        answer:
          "PSM records sessions into proprietary compressed video formats (typically AVI/MPEG-4) and text-indexed keystroke databases. Recordings are not stored permanently on the PSM jump server; upon session completion, the PSM service automatically uploads the recording file to the Digital Vault over TCP 1858 or archives it to an external secure storage repository (e.g. S3, Azure Blob, or NAS) based on Safe retention rules.",
        interviewerInsight:
          "Checks storage architecture knowledge and operational capacity planning.",
      },
    ],
    visionMission: SHADOWXLAB_CORE_VISION,
  },
];
