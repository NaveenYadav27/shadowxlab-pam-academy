/**
 * SHADOWXLAB PAM ACADEMY — MODULE 05: ACCOUNTS — PART 1
 * Flagship 20-Module Enterprise PAM Administrator Curriculum
 */

import type { ClassCurriculum } from "../../types";

export const MODULE_05: ClassCurriculum = {
  id: "module-05",
  number: "05",
  label: "MODULE 05",
  title: "Accounts — Part 1",
  subtitle: "Onboarding Fundamentals, Object Naming & Property Validation",
  duration: "45 mins",
  level: "Associate",
  track: "admin-20",
  category: "Credential Lifecycle & Workflows",
  overview:
    "Master the operational fundamentals of account onboarding into the Digital Vault. Deconstruct account object anatomy, required system properties (Safe, Platform, Address, Username, Secret), naming conventions, initial password verification gates, and bulk onboarding automation via Password Upload Utility (PUU) and REST APIs.",
  modules: [
    {
      id: "m05-core",
      number: "M5",
      title: "Account Onboarding Fundamentals",
      description:
        "Technical breakdown of account properties, object schemas, onboarding workflows, and pre-management verification.",
      lessons: [
        {
          id: "m05-l01",
          number: "5.1",
          title: "Account Object Anatomy & Onboarding Lifecycle",
          subtitle: "Validating properties, platform bindings, and pre-management verification gates",
          estimatedMinutes: 25,
          learningObjectives: [
            "Deconstruct the internal schema of a vaulted Account Object and its mandatory properties.",
            "Formulate enterprise naming conventions for accounts, addresses, and object filenames.",
            "Execute the 4-phase onboarding lifecycle: Intake, Placement, Initial Verification, and Management Enablement.",
            "Evaluate automated onboarding techniques using REST APIs and the Password Upload Utility (PUU).",
          ],
          prerequisites: [
            "Module 03: Policies and Platforms.",
            "Module 04: Safes.",
          ],
          conceptIntroduction:
            "In the Digital Vault, an 'Account' is not merely a username and password string; it is a structured, cryptographic object with rich metadata, operational flags, and audit linkages.\n\nEvery Account Object requires five fundamental parameters to function within the enterprise architecture:\n1. **Safe**: The encrypted container that houses the object and determines user access.\n2. **Platform**: The policy template dictating password generation, rotation interval, and CPM plugin.\n3. **Address**: The network location (FQDN, NetBIOS name, or IP address) where the credential authenticates.\n4. **Username**: The exact account identifier recognized by the target operating system, database, or network device.\n5. **Secret (Password / SSH Key)**: The cryptographic authentication payload.\n\nBefore enabling automated management, the PAM administrator must verify that the recorded password actually matches the target system. Enabling automated rotation on an account with an incorrect initial password triggers immediate account lockouts and business disruption. This verification gate is the first rule of account stewardship.",
          whyItExists:
            "Improperly onboarded accounts lead to credential desynchronization, target system lockouts, and compliance audit failures. Standardized onboarding ensures that every account is immediately manageable, auditable, and rotatable by automated systems.",
          architecture: {
            overview:
              "Account onboarding binds human-readable asset metadata to low-level CPM management plugins and PSM proxy components through the Vault database kernel.",
            componentResponsibilities: [
              {
                component: "Account Object Model",
                role: "Encrypted record in the Vault containing metadata properties (Address, Username, DeviceType, Logins) and secret content.",
                networkProtocols: "Encrypted Vault Database Schema (AES-256)",
                securityBoundary: "Safe Internal Data Model",
              },
              {
                component: "Password Vault Web Access (PVWA)",
                role: "Provides web forms, CSV bulk upload wizards, and REST API endpoints (`POST /PasswordVault/API/Accounts`) for account onboarding.",
                networkProtocols: "HTTPS Port 443",
                securityBoundary: "Management Presentation Tier",
              },
              {
                component: "Central Policy Manager (CPM)",
                role: "Executes pre-management Verify operation against target system using platform plugin before enabling scheduled rotation.",
                networkProtocols: "Target management protocol (SMB 445, SSH 22, SQL 1433/1521)",
                securityBoundary: "Orchestration & Validation Worker",
              },
            ],
            controlFlow: [
              {
                stepNumber: 1,
                actor: "PAM Administrator",
                action: "Initiates account onboarding via PVWA web console or REST API, specifying Safe, Platform, Address, and Username.",
                channelOrProtocol: "HTTPS Port 443 / REST API",
                verificationRule: "PVWA validates that target Safe exists, Platform is active, and Address resolves.",
              },
              {
                stepNumber: 2,
                actor: "Digital Vault",
                action: "Generates new Account Object, writes encrypted payload to target Safe, and marks status 'Unmanaged'.",
                channelOrProtocol: "Vault Kernel Protocol (TCP 1858)",
                verificationRule: "Unique object constraint checked; duplicate accounts on same address/safe rejected.",
              },
              {
                stepNumber: 3,
                actor: "PAM Administrator",
                action: "Triggers CPM 'Verify' operation to test credentials against the remote host.",
                channelOrProtocol: "PVWA Accounts Console > Verify",
                verificationRule: "CPM connects to target host; verifies password authenticates cleanly without error.",
              },
              {
                stepNumber: 4,
                actor: "Central Policy Manager (CPM)",
                action: "Updates account status to 'Managed' and schedules recurring rotation according to platform policy.",
                channelOrProtocol: "TCP 1858 to Vault",
                verificationRule: "LastVerify timestamp updated; next scheduled rotation date calculated.",
              },
            ],
          },
          terminology: [
            {
              term: "Account Object",
              definition: "A composite digital asset in the Vault consisting of metadata properties, historical versions, and encrypted authentication secrets.",
              enterpriseContext: "Represents an administrative identity on a specific host or domain.",
            },
            {
              term: "Address Property",
              definition: "The network destination where the account resides. Can be an IP address, NetBIOS name, or fully qualified domain name (FQDN).",
              enterpriseContext: "Best practice is to use FQDN (e.g. `srv-sql-01.corp.local`) to ensure reliable DNS resolution across subnets.",
            },
            {
              term: "Pre-Management Verification",
              definition: "The mandatory operational step of testing an onboarded password against the target system before enabling automated rotation.",
              enterpriseContext: "Prevents CPM from attempting a password change with an invalid old password, which triggers account lockouts.",
            },
            {
              term: "Password Upload Utility (PUU)",
              definition: "A legacy command-line batch utility for bulk onboarding hundreds or thousands of accounts via structured CSV files.",
              enterpriseContext: "Largely superseded in modern enterprise by Ansible, Terraform, and the PVWA REST API.",
            },
          ],
          administratorResponsibilities: [
            "Enforce strict FQDN naming standards for the Address property across all onboarded accounts.",
            "Always execute a manual or automated Verify action immediately following initial onboarding.",
            "Verify that required platform-specific properties (e.g., Database Name, Port, SSH Key) are populated correctly.",
            "Assign accountable business and technical owners for every onboarded privileged account.",
          ],
          configurationAndAdministration: [
            {
              name: "Address Property Resolution",
              settingOrObject: "Account Details > Address",
              description: "Target hostname or IP address used by CPM and PSM to establish connectivity.",
              productionBestPractice: "Always use FQDN. Avoid using static IPs that change during DHCP or cloud migration events.",
            },
            {
              name: "Account Object Name Schema",
              settingOrObject: "Vault Object Name Generation",
              description: "Internal filename format: `<PlatformID>-<SafeName>-<Address>-<Username>`.",
              productionBestPractice: "Never customize object names manually; allow PVWA/Vault to auto-generate standard object keys.",
            },
            {
              name: "VerifyOnAdd Parameter",
              settingOrObject: "Platform > Automatic Password Management > Privileged Account Management",
              description: "Instructs CPM to automatically execute a Verify operation as soon as a new account is onboarded.",
              productionBestPractice: "Enable VerifyOnAdd = Yes on all platforms to automate the pre-management verification gate.",
            },
          ],
          operationalProcedures: [
            {
              stepNumber: 1,
              title: "Account Intake & Property Validation",
              action: "In PVWA Accounts, click 'Add Account'. Select System Type: Windows, Safe: WIN-SAFE, Platform: Windows Server Local.",
              expectedResult: "Form displays required properties: Address, Username, Password, Retype Password.",
              operatorNotes: "Ensure username does not include prefix like `.\\` or `CORP\\` unless onboarding a domain account.",
            },
            {
              stepNumber: 2,
              title: "Enter Account Metadata",
              action: "Input Address: `WIN-SRV-01.corp.local`, Username: `Administrator`, Owner: `windows_admin`, and current password.",
              expectedResult: "Account object created in WIN-SAFE with initial status 'Unmanaged' or 'Pending Verification'.",
            },
            {
              stepNumber: 3,
              title: "Trigger Pre-Management Verification",
              action: "Select the newly onboarded account and click 'Verify' in the operational toolbar.",
              expectedResult: "CPM polls the Vault, executes target authentication test, and reports 'Verify Completed'.",
            },
            {
              stepNumber: 4,
              title: "Confirm Managed State",
              action: "Inspect account status pill in the inventory.",
              expectedResult: "Status pill turns green: 'Managed'. Next scheduled change date displayed.",
            },
          ],
          enterpriseScenario: {
            organization: "Pinnacle Defense Technologies",
            businessContext:
              "Pinnacle Defense acquired a radar manufacturing firm with 400 Linux workstations and Windows engineering servers. An urgent compliance audit revealed that over 1,200 local administrator accounts were unmanaged, static, and undocumented. The PAM engineering team was mandated to onboard the entire inventory within 14 days using automated REST API scripts and ensure 100% pre-management verification.",
            governanceRequirements: [
              "Standardized FQDN addressing across all 1,200 systems.",
              "Mandatory pre-verification: no account may be scheduled for automated rotation until its existing password is confirmed.",
              "Audit logging of all onboarding operations with operator attribution.",
            ],
          },
          failureScenarios: [
            {
              symptom: "Account onboarding rejected: 'ITATS053E Object already exists in Safe'.",
              rootCause: "An account with the exact same Address and Username already exists in the destination Safe.",
              securityImpact: "Duplicate account creation blocked; prevents administrative confusion and desynchronization.",
              cyberArkCodeOrEvent: "ITATS053E",
            },
            {
              symptom: "CPM Verify fails immediately: 'CACPM072E Authentication failure on target'.",
              rootCause: "The administrator entered an incorrect current password during onboarding, or the account is locked on target.",
              securityImpact: "Target rejects credentials; automated rotation blocked to prevent account lockout.",
              cyberArkCodeOrEvent: "CACPM250E",
            },
          ],
          troubleshootingRunbook: [
            {
              stepNumber: 1,
              diagnosticAction: "Search inventory across all Safes for existing account objects with matching Address/Username.",
              logFileOrConsole: "PVWA Accounts Console > Search Bar > Filter All Safes",
              remediation: "If duplicate exists, delete orphaned object or update existing record rather than creating a duplicate.",
            },
            {
              stepNumber: 2,
              diagnosticAction: "Test target connectivity and authentication manually from CPM host using PowerShell or SSH.",
              logFileOrConsole: "PowerShell: Test-WSMan -ComputerName <Address> / ssh <Username>@<Address>",
              remediation: "Verify that target OS firewall permits RPC/SMB/SSH traffic from the CPM static IP.",
            },
            {
              stepNumber: 3,
              diagnosticAction: "Review CPM verify error log for specific OS return codes.",
              logFileOrConsole: "C:\\CyberArk\\Password Manager\\Logs\\pm.log",
              remediation: "Look for Win32 error codes: `5 (Access Denied)`, `1326 (Logon Failure)`, or `1909 (Account Locked)`. Correct root issue.",
            },
          ],
          diagnosticEvidence: [
            {
              logFile: "C:\\CyberArk\\Password Manager\\Logs\\pm.log",
              sampleOutput:
                "CACPM250E Verification failed for account WIN-SRV-01\\Administrator on platform Windows Server Local.\nTarget returned Win32 Error 1326: 'The user name or password is incorrect.'",
              explanation:
                "The password provided during onboarding does not match the real password on the target Windows server. Administrator must reconcile or reset the password.",
            },
            {
              logFile: "C:\\Windows\\Temp\\PVWA\\PVWA.App.log",
              sampleOutput:
                "REST API Call: POST /PasswordVault/API/Accounts - 409 Conflict. ITATS053E Object Operating System-WindowsServerLocal-WIN-SRV-01-Administrator already exists in Safe WIN-SAFE.",
              explanation:
                "Onboarding API call attempted to create an account that is already present in the Vault. The script must handle idempotency.",
            },
          ],
          instructorNotes: [
            "Always verify DNS resolution from the CPM server, not just your personal laptop. The CPM server must be able to resolve target FQDNs.",
            "Never use IP addresses for Windows Domain accounts. Windows Kerberos authentication requires canonical NetBIOS or DNS names.",
            "If onboarding in bulk via REST API, throttle requests to 10–20 per second to avoid saturating Vault database connection pools.",
          ],
          securityImplications: [
            "Inventory Completeness: An unmanaged account is a blind spot. PAM coverage is only as strong as the percentage of enterprise assets onboarded.",
            "Credential Validation: Pre-management verification guarantees that operational dashboards reflect real-world authentication state, not hypothetical values.",
            "Data Hygiene: Standardized naming conventions allow automated SIEM rules and compliance parsers to correlate Vault logs with endpoint authentication events.",
          ],
          knowledgeCheck: [
            {
              id: "m05-q01",
              question: "Which five core properties are fundamentally required to onboard an Account Object in the Digital Vault?",
              options: [
                "Safe, Platform, Address, Username, and Secret (Password/Key)",
                "Safe, User Group, Domain, IP, and MAC Address",
                "Platform, Operating System, RAM Size, CPU, and Secret",
                "Username, Ticket Number, Email, Phone Number, and Department",
              ],
              correctIndex: 0,
              explanation:
                "Every Account Object requires Safe (container), Platform (policy), Address (target host), Username (identifier), and Secret (credential payload).",
              conceptTested: "Fundamental Account Object Schema",
            },
            {
              id: "m05-q02",
              question: "Why must a PAM Administrator execute a 'Verify' operation before enabling automated recurring password rotation on a newly onboarded account?",
              options: [
                "Because the Digital Vault will not save the account without it.",
                "To confirm the stored password matches the real target system password, preventing automated change operations from locking out the account.",
                "To reboot the target server automatically.",
                "To generate a new SSL certificate for the PVWA portal.",
              ],
              correctIndex: 1,
              explanation:
                "If the password stored in the Vault does not match the real password on the target host, CPM change operations will fail and repeatedly trigger target system account lockout policies.",
              conceptTested: "Pre-Management Verification Governance",
            },
            {
              id: "m05-q03",
              question: "What error is returned if an administrator attempts to onboard an account with the exact same Address and Username in the same Safe?",
              options: [
                "ITATS006E Database Full",
                "ITATS053E Object already exists in Safe",
                "CACPM072E Connection Timeout",
                "PSMSR037E Session Broker Unavailable",
              ],
              correctIndex: 1,
              explanation:
                "The Vault enforces unique object naming within each Safe container. If an account with matching Address and Username already exists, the Vault returns ITATS053E Object already exists.",
              conceptTested: "Vault Object Uniqueness Constraints",
            },
          ],
          practicalExercise: {
            id: "m05-ex01",
            title: "Onboard and Verify a Privileged Server Account",
            scenario:
              "Onboard an administrative credential into WIN-SAFE, bind it to the Windows Server Local platform, validate required properties, and execute pre-management verification.",
            instructions: [
              "Navigate to the Accounts console.",
              "Review the accounts inventory to ensure no duplicate object exists for WIN-SRV-01.",
              "Inspect the target account's Safe, Platform, and Address properties.",
              "Verify that the account status transitions from Unmanaged to Managed.",
            ],
            targetConsole: "accounts",
            associatedLabId: "Lab 03 · Onboard WIN-SRV-01 Administrator",
            validationObjectiveId: "onboard-account",
            validationCriteria:
              "Target administrative account is onboarded and verified in the Accounts console.",
          },
          completionCriteria: [
            "Deconstructed the five mandatory properties of the Vault Account Object model.",
            "Understood pre-management verification gates and duplicate prevention rules.",
            "Answered all 3 knowledge checkpoint questions accurately.",
            "Executed the onboarding verification exercise in the Accounts console.",
          ],
          references: [
            "CyberArk Privileged Access Security: Account Onboarding & Inventory Management Guide",
            "NIST SP 800-53 Rev 5: IA-5 Authenticator Management & AC-2 Account Management",
            "Center for Internet Security (CIS): Controlling and Auditing Privileged Account Inventories",
          ],
        },
      ],
    },
  ],
};
