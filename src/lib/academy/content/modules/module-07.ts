/**
 * SHADOWXLAB PAM ACADEMY — MODULE 07: DEPENDENTS (USAGES)
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_07: ClassCurriculum = {
  id: "module-07",
  number: "07",
  label: "MODULE 07",
  title: "Dependents",
  subtitle: "Service Account Usages, Windows Services & Scheduled Tasks",
  duration: "45 mins",
  level: "Professional",
  track: "admin-20",
  category: "Credential Lifecycle & Workflows",
  overview:
    "Master the management of non-human service identities and their attached system usages. Deconstruct the mechanics of Windows Services, Scheduled Tasks, and IIS Application Pools dependent on vaulted domain accounts, synchronized rotation propagation, service restart governance, and the remediation of catastrophic Service Logon Failures (Win32 Error 1069).",
  modules: [
    {
      id: "m07-core",
      number: "M7",
      title: "Service Account Usages & Dependency Architecture",
      description:
        "Comprehensive walkthrough of service account usages, CPM dependency plugins, synchronized rotation order, and application service restarts.",
      lessons: [
        {
          id: "m07-l01",
          number: "7.1",
          title: "Service Account Dependencies & Usage Synchronization",
          subtitle:
            "Configuring Windows Services, Scheduled Tasks, and IIS AppPool usages under vaulted credentials",
          estimatedMinutes: 25,
          learningObjectives: [
            "Analyze the operational risks of rotating domain service accounts that power remote operating system services.",
            "Configure Windows Service, Scheduled Task, and IIS Application Pool usages attached to a master Account Object.",
            "Deconstruct the synchronized execution sequence: Password Change -> Usage Updates -> Service Restarts.",
            "Troubleshoot and remediate Windows Error 1069 (The service did not start due to a logon failure).",
          ],
          prerequisites: [
            "Module 03: Policies and Platforms.",
            "Module 05: Accounts — Part 1.",
            "Module 06: Accounts — Part 2.",
          ],
          conceptIntroduction:
            "In enterprise environments, the most dangerous privileged accounts are not interactive human administrators; they are **Non-Human Service Accounts**. An active directory account like `CORP\\svc_app_cluster` might be configured as the 'Log On As' identity for 40 Windows Services across 20 production application servers, 15 Scheduled Tasks, and 8 IIS Application Pools.\n\nIf a PAM administrator rotates the password for `CORP\\svc_app_cluster` in Active Directory without simultaneously updating every remote server where that service runs, disaster ensues. The next time a service restarts or attempts an authenticated RPC call, it attempts to authenticate using the old cached password. Active Directory records repeated bad password attempts, locks out the domain service account, and cascades an outage across the entire application fleet.\n\nEnterprise PAM solves this with **Dependents (Usages)**. An Account Object in the Vault can have dozens of 'Usages' attached to it. A Usage defines a specific instance where the credential is consumed (e.g. 'Windows Service: SQLSERVERAGENT on SRV-DB-01'). When the CPM rotates the master account, it executes an orchestrated, atomic workflow: first, it changes the password in Active Directory; second, it connects to every remote host to update the local Service Control Manager (SCM), Task Scheduler, or IIS configuration; third, it optionally restarts the services to ensure they run with the new credentials.",
          whyItExists:
            "Service accounts are historically left static for 5–10 years because teams fear breaking production applications during rotation. Dependents enable safe, automated rotation of complex service infrastructures without human errors or application downtime.",
          architecture: {
            overview:
              "Dependents are child objects bound to a parent Account. The CPM evaluates child usages during every rotation cycle and propagates new secrets across the fleet.",
            componentResponsibilities: [
              {
                component: "Parent Account Object",
                role: "The master Active Directory or LDAP identity storing the central password hash.",
                networkProtocols: "Vault Kernel Database Object (TCP 1858)",
                securityBoundary: "Identity Domain Boundary",
              },
              {
                component: "Child Usages (Dependents)",
                role: "Metadata objects specifying remote machine address, usage type (Windows Service, Task, AppPool), and service name.",
                networkProtocols: "Vault Child Object Schema",
                securityBoundary: "Host Deployment Boundary",
              },
              {
                component: "Central Policy Manager (CPM)",
                role: "Orchestrates multi-phase rotation: changes master account in AD, connects via RPC/WMI to remote endpoints, updates SCM, and restarts services.",
                networkProtocols: "WMI (TCP 135), RPC/SMB (TCP 445), WinRM (TCP 5985)",
                securityBoundary: "Automation Enforcement Engine",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "CPM Polling Engine",
                action:
                  "Detects scheduled rotation interval reached for parent account `CORP\\svc_app_cluster`.",
                channelOrProtocol: "Vault Queue (TCP 1858)",
                verificationRule:
                  "CPM queries Vault for all child usages attached to the parent account.",
              },
              {
                stepNumber: 2,
                actor: "Central Policy Manager (CPM)",
                action:
                  "Generates new 32-character password and updates the account in Active Directory Domain Services.",
                channelOrProtocol: "LDAPS Port 636 / Kerberos",
                verificationRule: "Domain Controller confirms password updated successfully.",
              },
              {
                stepNumber: 3,
                actor: "Central Policy Manager (CPM)",
                action:
                  "Connects sequentially or in parallel to each remote host listed in child usages and updates the local service configuration.",
                channelOrProtocol: "Win32 SCM API (ChangeServiceConfig)",
                verificationRule:
                  "Target Service Control Manager accepts new password; confirms configuration written to registry.",
              },
              {
                stepNumber: 4,
                actor: "Central Policy Manager (CPM)",
                action:
                  "Restarts the target Windows service (if `RestartService = Yes`) and confirms service state transitions to Running.",
                channelOrProtocol: "SCM ControlService API",
                verificationRule:
                  "Service starts cleanly without Error 1069; Vault marks parent and all usages Managed.",
              },
            ],
          },
          terminology: [
            {
              term: "Dependent (Usage)",
              definition:
                "A child object attached to a vaulted credential representing an endpoint instance (Service, Task, AppPool) where the password is deployed.",
              enterpriseContext:
                "Guarantees that password changes are synchronized to endpoints before services encounter authentication errors.",
            },
            {
              term: "Service Control Manager (SCM)",
              definition:
                "The Windows OS subsystem responsible for managing services, drivers, and background daemons.",
              enterpriseContext:
                "The CPM interacts with the SCM via remote RPC APIs to update the 'Log On As' password.",
            },
            {
              term: "Win32 Error 1069",
              definition:
                "'The service did not start due to a logon failure' - the quintessential Windows service authentication error.",
              enterpriseContext:
                "Occurs when a domain password was changed but the local service was not updated with the new credential.",
            },
            {
              term: "RestartService Setting",
              definition:
                "A usage parameter dictating whether the CPM should bounce the target service immediately following password synchronization.",
              enterpriseContext:
                "Set to 'No' on mission-critical database engines where service restarts must wait for approved maintenance windows.",
            },
          ],
          administratorResponsibilities: [
            "Audit all production service accounts to identify every remote server where the credential is configured as a service or task.",
            "Attach explicit Usages for 100% of discovered service endpoints before enabling automated password rotation.",
            "Coordinate with application owners to determine whether `RestartService` is permitted or if restarts must be handled manually.",
            "Ensure the CPM worker has administrative RPC/WMI connectivity to all target servers hosting usages.",
          ],
          configurationAndAdministration: [
            {
              name: "Usage Type: Windows Service",
              settingOrObject: "Account Details > Usages > Add Usage > Windows Service",
              description:
                "Requires Target Address and exact Service Name (e.g. `MSSQLSERVER` or `AppClusterSvc`).",
              productionBestPractice:
                "Always use the true Service Name (registry key), not the human-readable Display Name.",
            },
            {
              name: "RestartService Flag",
              settingOrObject: "Usage Properties > RestartService",
              description:
                "Determines if CPM issues stop/start commands to the service after updating its password in the SCM.",
              productionBestPractice:
                "Set to Yes for lightweight background tasks; set to No for core ERP and core database engines.",
            },
            {
              name: "Usage Failure Policy",
              settingOrObject: "Platform > Automatic Password Management > Usage Settings",
              description:
                "Governs whether failure of a single usage should roll back the master password change or mark the usage failed.",
              productionBestPractice:
                "Configure alerts to notify the on-call engineer immediately if a usage update fails.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Discover Service Usages",
              action:
                "Execute a remote WMI query across target servers: `Get-WmiObject Win32_Service | Where-Object { $_.StartName -like '*svc_app*' }`.",
              expectedResult:
                "Returns list of hosts, service names, and startup modes running under the target service account.",
              operatorNotes: "Document every endpoint before configuring the Vault object.",
            },
            {
              stepNumber: 2,
              title: "Attach Windows Service Usage",
              action:
                "In PVWA Accounts, open parent account `CORP\\svc_app`, click 'Add Usage', select Windows Service, enter Address and Service Name.",
              expectedResult: "Usage is registered under the parent account as a dependent object.",
            },
            {
              stepNumber: 3,
              title: "Test Synchronized Rotation",
              action:
                "Click 'Change' on the parent account. Monitor CPM logs as it processes the master account and subsequent usages.",
              expectedResult:
                "CPM updates Active Directory, connects to target host, updates SCM, and reports success.",
            },
            {
              stepNumber: 4,
              title: "Validate Remote Service Health",
              action:
                "Connect to target host and inspect Windows Event Viewer (System Log) for Service Control Manager events.",
              expectedResult:
                "No Event ID 7000 or 7041 (Logon Failure) recorded; service running cleanly with new password.",
            },
          ],
          enterpriseScenario: {
            organization: "Nordic Telecommunications (NordicTel)",
            businessContext:
              "NordicTel operates a national cellular billing platform driven by 60 core application servers running under a central domain service account `CORP\\svc_billing`. During a security mandate to rotate all passwords older than 180 days, an engineer changed the password in Active Directory without updating the 60 servers. Within 3 minutes, 180 billing services crashed with Error 1069, causing an 8-hour outage and $1.4M in regulatory fines. The PAM team was instructed to onboard `svc_billing` with comprehensive automated Usages.",
            governanceRequirements: [
              "Automated atomic synchronization: master password change must be propagated to all 60 service endpoints automatically.",
              "Pre-flight verification of target SCM accessibility before Active Directory password changes are executed.",
              "Scheduled maintenance windows: service restarts restricted to Sunday 02:00–04:00 UTC.",
            ],
          },
          failureScenarios: [
            {
              symptom:
                "Windows Event Log shows Event ID 7000: 'The service failed to start due to logon failure (Error 1069)'.",
              rootCause:
                "Master account password was rotated in Active Directory, but the usage update on the local host failed or was missing.",
              securityImpact:
                "Critical business service fails to start; production application crash.",
              cyberArkCodeOrEvent: "Win32 Error 1069",
            },
            {
              symptom:
                "CPM Usage update fails: 'CACPM250E Cannot connect to remote Service Control Manager (RPC Unavailable)'.",
              rootCause:
                "Target server firewall is blocking TCP port 445 (SMB) or TCP port 135 (RPC Endpoint Mapper) from CPM.",
              securityImpact:
                "Usage update fails while master password changes, leaving endpoint desynchronized.",
              cyberArkCodeOrEvent: "CACPM250E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction:
                "Inspect Windows System Event Log on target host for Service Control Manager errors.",
              logFileOrConsole:
                "Event Viewer > Windows Logs > System > Filter Event ID 7000, 7009, 7041",
              remediation:
                "Confirm whether logon failure is due to bad password or 'Logon as a Service' right missing.",
            },
            {
              stepNumber: 2,
              diagnosticAction:
                "Test remote RPC connectivity from CPM server to target host using PowerShell.",
              logFileOrConsole:
                "PowerShell: Get-Service -ComputerName <TargetAddress> -Name <ServiceName>",
              remediation:
                "If RPC error occurs, check Windows Firewall rules on target for 'Remote Service Management'.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Manually re-sync usage credential from PVWA.",
              logFileOrConsole:
                "PVWA Accounts > Select Parent Account > Usages Tab > Click 'Change' on specific failed usage",
              remediation:
                "Forces CPM to push current active Vault password into the specific remote service without rotating AD again.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\pm.log",
              sampleOutput:
                "Action: Updating usage MSSQLSERVER on target SRV-DB-01 for parent account CORP\\svc_app.\nSCM ChangeServiceConfig succeeded. Service restart requested: Service successfully stopped and started.",
              explanation:
                "CPM successfully pushed the new password to the remote Windows Service Control Manager and bounced the service without incident.",
            },
            {
              logFile: "Target Host Windows Event Viewer (System Log)",
              sampleOutput:
                "Log Name: System, Event ID: 7000, Source: Service Control Manager\nThe BillingSyncService service failed to start due to the following error: The service did not start due to a logon failure.",
              explanation:
                "The target host attempted to start BillingSyncService using stale credentials. The service usage was missing from the Vault dependent configuration.",
            },
          ],
          instructorNotes: [
            "Always use the service short name (e.g. `W3SVC`), not the display name (`World Wide Web Publishing Service`), when configuring Usages in the Vault.",
            "For Scheduled Tasks, the task must be configured to 'Run whether user is logged on or not' with 'Do not store password' unchecked for CPM updates to apply.",
            "Group Managed Service Accounts (gMSAs) are an alternative for native Windows environments, but PAM Dependents are essential for legacy, multi-domain, and cross-platform services.",
          ],
          securityImplications: [
            "Defeating Lateral Movement: Attackers actively target service accounts because they historically have static passwords and elevated domain privileges. Rotating them breaks persistence.",
            "Privilege Scoping: Identifying usages uncovers 'zombie' servers where service accounts were left running years after application decommissioning.",
            "Resilience & Availability: Synchronized dependent management prevents accidental denial-of-service self-inflicted by uncoordinated password changes.",
          ],
          knowledgeCheck: [
            {
              id: "m07-q01",
              question:
                "What catastrophic operational failure occurs if a domain service account password is changed in Active Directory without updating remote services that run under it?",
              options: [
                "The target server hard drive is reformatted.",
                "The remote services fail to authenticate, trigger account lockouts in Active Directory, and crash with Win32 Error 1069.",
                "The Vault master key is invalidated.",
                "The PVWA web portal becomes inaccessible.",
              ],
              correctIndex: 1,
              explanation:
                "When remote services attempt to connect using the old cached password, Active Directory detects bad password attempts, locks out the domain account, and crashes all dependent services with Win32 Error 1069 (Logon Failure).",
              conceptTested: "Service Account Desynchronization & Cascading Outages",
            },
            {
              id: "m07-q02",
              question:
                "Why should an administrator consider setting 'RestartService = No' on a database engine usage?",
              options: [
                "Because database services do not use passwords.",
                "To prevent an unannounced database shutdown and transaction interruption during core business hours.",
                "Because the CPM plugin cannot restart services.",
                "To save user license quotas.",
              ],
              correctIndex: 1,
              explanation:
                "Restarting a core database engine drops all active client connections and aborts inflight transactions. In production environments, password updates are applied to the SCM immediately, but restarts are scheduled during approved maintenance windows.",
              conceptTested: "Service Restart Governance & Production Availability",
            },
            {
              id: "m07-q03",
              question:
                "Which Windows subsystem is responsible for maintaining the 'Log On As' credentials of background services and is updated by CPM usage plugins?",
              options: [
                "Windows Defender Firewall",
                "Service Control Manager (SCM)",
                "Local Security Authority (LSA) Secrets only",
                "Windows Update Agent",
              ],
              correctIndex: 1,
              explanation:
                "The Service Control Manager (SCM) maintains service configurations and credentials in the Windows operating system. The CPM connects via remote RPC calls (ChangeServiceConfig) to update SCM records.",
              conceptTested: "Windows Service Control Manager Mechanics",
            },
          ],
          practicalExercise: {
            id: "m07-ex01",
            title: "Audit Service Account Dependents & Classify Enterprise Inventory",
            objective:
              "Inspect non-human service accounts (`svc_backup`, `svc_sql`, `svc_payment`) and their dependent usages in Accounts, verify accountable ownership, and validate Lab 04 inventory classification.",
            scenario:
              "Before scheduling automated rotation on SERVICE-SAFE, audit all service accounts and their linked usages (Backup Agent, SQL Agent, Payment API), confirm accountable owners, and review unmanaged/failed exceptions.",
            prerequisites: [
              "Review Service Account Usages and Win32 Error 1069 prevention in Section 1–4.",
            ],
            startingState:
              "SERVICE-SAFE holds svc_backup (Backup Agent, Rotation failed), svc_sql (SQL Agent, Managed), and svc_payment (Payment API, Verify required); oracle (DB-ORA-01) is Unmanaged.",
            instructions: [
              "Open the Accounts console and filter or inspect SERVICE-SAFE accounts (`svc_backup`, `svc_sql`, `svc_payment`).",
              "Review each service account's Dependency/Usage field (Backup Agent, SQL Agent, Payment API) and assigned Owner.",
              "Confirm shared emergency identity (`shared_ops` in EMERGENCY-SAFE) and unmanaged database candidate (`oracle` on DB-ORA-01) are accurately classified.",
              "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion' to verify all 6 Lab 04 objectives.",
            ],
            stepDetails: [
              {
                action: "Open Accounts and inspect `svc_backup`, `svc_sql`, and `svc_payment`.",
                explanation:
                  "Rotating a service account without updating its dependent Windows services or scheduled tasks triggers Win32 Error 1069 outages.",
                expectedResult:
                  "Each service account displays its dependent workload (Backup Agent, SQL Agent, Payment API) and owner.",
              },
              {
                action:
                  "Inspect `shared_ops` (EMERGENCY-SAFE) and `oracle` (DB-ORA-01, Unmanaged) to complete full archetype review.",
                explanation:
                  "Lab 04 verifies enterprise-wide classification across human, service, database, and shared accounts.",
                expectedResult:
                  "All inventory records show named owners and governance exceptions are visible.",
              },
              {
                action:
                  "Return to Learning Academy and click 'Validate Simulator State & Record Lab Completion'.",
                explanation: "Validates all 6 Lab 04 classification and exception objectives.",
                expectedResult: "All 6/6 Lab 04 objectives pass (100/100).",
              },
            ],
            targetConsole: "accounts",
            associatedLabId: "Lab 04 · Classify the enterprise inventory",
            validationObjectiveId: "classify-types",
            validationCriteria:
              "Service accounts, dependencies, owners, and governance exceptions verified (6/6 Lab 04 objectives).",
            troubleshootingHints: [
              {
                symptom: "'Identify unmanaged database identity (oracle on DB-ORA-01)' fails.",
                hint: "If oracle on DB-ORA-01 was previously rotated/verified, its status changed from Unmanaged.",
                correctiveAction:
                  "Click Reset Simulator in the top subnav to restore the baseline inventory (with oracle Unmanaged), then re-validate.",
              },
            ],
            independentPractice: {
              title: "Verify Pending Service Account Health (`svc_payment`)",
              scenario:
                "Application owners ask whether `svc_payment` on APP-PAYMENT-01 is still synchronized before its next rotation window.",
              goal: "Without step-by-step instructions, locate `svc_payment` in CPM Operations and execute a non-disruptive Verify check.",
              targetConsole: "cpm",
              successCriteria: [
                "Located `svc_payment` (APP-PAYMENT-01) with dependency 'Payment API'.",
                "Executed CPM Verify without triggering an unapproved password Change.",
              ],
            },
            simulationLimitationNote:
              "Automated Windows Service Control Manager restarts (RestartService) on remote endpoints are modeled via account dependency metadata rather than live OS service calls; live validation evaluates Lab 04 inventory and service-account classification.",
          },
          completionCriteria: [
            "Deconstructed service account dependencies across Windows Services, Tasks, and AppPools.",
            "Analyzed synchronized rotation control flows and Error 1069 remediation.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the service account inspection exercise in the Accounts console.",
          ],
          references: [
            "Microsoft TechNet: Service Control Manager Architecture and Account Authentication",
            "CyberArk Privileged Access Security: Managing Service Accounts & Dependents Guide",
            "NIST SP 800-53 Rev 5: IA-5(1) Authenticator Management for Non-Human Accounts",
          ],
        },
      ],
    },
  ],
};
