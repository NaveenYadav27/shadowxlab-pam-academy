# ShadowXLab PAM Academy

# MASTER BUILD PROMPT — SHADOWXLAB CYBERARK ADMINISTRATOR OPERATIONS TRAINING PORTAL

## PROJECT IDENTITY

Build an enterprise-grade CyberArk Administrator Training and Operations Simulation Portal inside ShadowXLab.

Project Name:
ShadowXLab CyberArk Administrator Operations Academy

Product Category:
Enterprise Privileged Access Management (PAM) Learning Platform / CyberArk Administrator Job Simulation

Primary Purpose:
Train learners to perform actual day-to-day CyberArk Administrator responsibilities through realistic workflows, interactive system operations, troubleshooting scenarios, guided sessions, and hands-on labs.

This must NOT be a generic LMS, static course website, collection of cards, or quiz application.

The platform must simulate the operational experience of a CyberArk administrator working in an enterprise environment.

---

# 1. NON-NEGOTIABLE PRODUCT REQUIREMENTS

Build a functioning interactive training platform.

Do not create:

- Static pages pretending to be interactive.
- Empty dashboards with decorative charts.
- Generic cybersecurity cards.
- Labs consisting only of instructions and reveal-answer buttons.
- Fake buttons that do nothing.
- Navigation that leads to empty pages.
- Repeated placeholder content.
- Generic AI-generated explanations instead of detailed technical teaching.
- A superficial CyberArk-themed UI without operational logic.

Every major interaction must work.

Every lab must have:

- Defined starting state.
- Learning objective.
- Enterprise scenario.
- Operational task.
- Interactive controls.
- State changes.
- Validation.
- Feedback.
- Evidence.
- Scoring.
- Reset.
- Instructor walkthrough.
- Learner independent mode.

The learner must be able to operate the simulated PAM environment.

---

# 2. VISUAL DESIGN — ENTERPRISE PAM OPERATIONS CENTER

Design an original enterprise PAM interface inspired by the operational density, workflows, terminology, and administrative experience of real CyberArk environments.

Do not reproduce proprietary CyberArk branding, logos, or copyrighted screens pixel-for-pixel.

Create an original ShadowXLab design that feels like a professional enterprise security operations product.

## Design characteristics

- Dark navy enterprise shell.
- Deep blue and slate navigation.
- Cyan/blue operational highlights.
- White/light-grey content panels.
- High-density information tables.
- Realistic administrative forms.
- Persistent left navigation.
- Top navigation with environment and user context.
- Breadcrumb navigation.
- Context-sensitive actions.
- Status badges.
- Search and filtering.
- Details drawers.
- Tabs.
- Modal confirmations.
- Audit timeline.
- Realistic error states.
- Responsive desktop-first layout.

Avoid excessive cards.

Prefer:

- Data tables.
- Operational workspaces.
- Split-screen configuration panels.
- Interactive diagrams.
- Detail panes.
- Workflow consoles.
- Task execution screens.

## Main application layout

LEFT NAVIGATION:

1. Overview
2. Learning Academy
3. PAM Environment
4. Safes
5. Accounts
6. Access Management
7. CPM Operations
8. PSM Operations
9. Policies
10. Discovery
11. Audit & Reports
12. Troubleshooting
13. Assessments
14. Knowledge Base
15. Instructor Console

TOP HEADER:

- ShadowXLab PAM Academy
- Environment: CORP-PAM-LAB
- Current learner identity
- Training mode
- Notifications
- Help
- Profile

---

# 3. LEARNING ACADEMY — CLASSES THROUGH CLASS 06

Create a structured CyberArk Administrator training curriculum.

Every class must have:

- Session objectives.
- Detailed concepts.
- Enterprise examples.
- Technical architecture.
- Instructor explanation.
- Demonstration.
- Guided lab.
- Independent lab.
- Knowledge assessment.
- Completion criteria.

Do not limit sessions to short summaries.

## CLASS 01 — CYBERARK PAM FOUNDATIONS AND ADMINISTRATOR ROLE

### Topics

1. What is Privileged Access Management?
2. Why enterprises implement PAM.
3. Privileged account risks.
4. Credential theft and lateral movement.
5. Privileged account lifecycle.
6. CyberArk ecosystem overview.
7. Vault.
8. PVWA.
9. CPM.
10. PSM.
11. Safes.
12. Accounts.
13. Policies.
14. Administrator responsibilities.
15. PAM architecture.
16. User authentication versus privileged authentication.
17. Password vaulting.
18. Session management.
19. Auditability.
20. Enterprise PAM workflow.

### Interactive architecture

Build a clickable architecture diagram:

Administrator → PVWA → Vault → CPM → Target System

Privileged User → PVWA → PSM → Target System

Clicking each component should reveal:

- Purpose.
- Responsibilities.
- Inputs.
- Outputs.
- Dependencies.
- Common failures.
- Administrator tasks.
- Example operational tickets.

### Lab 01

Investigate an enterprise PAM architecture.

Learner must:

- Identify components.
- Explain their responsibilities.
- Trace account onboarding.
- Trace password rotation.
- Trace privileged session establishment.
- Identify component failure scenarios.

---

## CLASS 02 — SAFE ADMINISTRATION AND ACCESS MANAGEMENT

### Topics

1. What is a Safe?
2. Safe structure and purpose.
3. Safe ownership.
4. Safe permissions.
5. Safe members.
6. Safe-level access.
7. Permission boundaries.
8. Least privilege.
9. Safe administration.
10. Safe creation.
11. Safe naming standards.
12. Safe access provisioning.
13. Safe access review.
14. Safe permission troubleshooting.
15. Safe audit logs.
16. Safe deletion and lifecycle.
17. Role separation.
18. Dual control.
19. Safe design for Windows, Linux, DBA, and application accounts.

### Interactive Safe Administration Workspace

Create an actual simulated Safe administration page.

Learner must be able to:

- Create a Safe.
- Enter Safe name.
- Enter description.
- Select owner.
- Assign permissions.
- Add members.
- Remove members.
- Edit permissions.
- View member permissions.
- Review access.
- View audit events.

Permission controls must include realistic options such as:

- List accounts.
- Retrieve accounts.
- Use accounts.
- Manage Safe.
- Manage accounts.
- Add accounts.
- Update account properties.
- Delete accounts.
- Initiate privileged sessions.

Permissions should have realistic dependencies and validation.

### Lab 02

Scenario:

A new database administration team requires controlled access to privileged database credentials.

Learner must:

1. Create DBA-SAFE.
2. Assign the Safe owner.
3. Add DBA team members.
4. Assign least-privilege permissions.
5. Restrict unnecessary retrieval.
6. Validate permitted operations.
7. Validate denied operations.
8. Review the audit trail.

The platform must show permission results when learners attempt actions.

---

## CLASS 03 — PRIVILEGED ACCOUNT ONBOARDING AND MANAGEMENT

### Topics

1. What is a privileged account?
2. Windows local Administrator.
3. Domain accounts.
4. Linux root.
5. SSH accounts.
6. Database privileged accounts.
7. Application accounts.
8. Service accounts.
9. Account ownership.
10. Account dependencies.
11. Account onboarding.
12. Account platform assignment.
13. Account policy.
14. Account verification.
15. Account management.
16. Account lifecycle.
17. Account inventory.
18. Account reconciliation.
19. Account troubleshooting.
20. Onboarding failures.

### Account Onboarding Workspace

Create an operational account onboarding interface.

Fields:

- Account name.
- Username.
- Address/target.
- Platform.
- Safe.
- Account type.
- Owner.
- Business purpose.
- Application dependency.
- Management status.
- Rotation policy.

Available actions:

- Add account.
- Verify account.
- Change password.
- Reconcile password.
- Edit properties.
- View account details.
- View activity.
- View management status.

### Lab 03

Scenario:

A new Windows Server 2022 system has been deployed.

The Administrator account must be onboarded into PAM.

Learner must:

1. Identify the account.
2. Determine the correct platform.
3. Assign the correct Safe.
4. Configure account properties.
5. Set ownership.
6. Onboard the account.
7. Verify credentials.
8. Enable management.
9. Validate account status.
10. Review the account record.

Simulate real validation errors:

- Incorrect address.
- Invalid username.
- Wrong platform.
- Invalid Safe.
- Incorrect credential.
- Account unreachable.
- Unsupported account configuration.

---

## CLASS 04 — USER ACCOUNTS AND PRIVILEGED ACCOUNT SECURITY

### Topics

1. Standard users versus privileged users.
2. Administrator accounts.
3. Linux root.
4. Domain Administrator.
5. Service accounts.
6. Application accounts.
7. Shared privileged accounts.
8. Human identities versus non-human identities.
9. Account ownership.
10. Business owner versus technical custodian.
11. Account accountability.
12. Least privilege.
13. Privilege boundaries.
14. Account risk classification.
15. Service account dependencies.
16. Credential rotation.
17. Shared account attribution.
18. Privileged access governance.
19. Recertification.
20. Account retirement.

### Visual learning

Build an interactive identity hierarchy:

Human identities:

- Standard user.
- Privileged administrator.
- Domain administrator.

Non-human identities:

- Service account.
- Application account.
- Workload identity.
- Shared privileged account.

Click every identity to display:

- Definition.
- Purpose.
- Permissions.
- Risk.
- Example.
- Ownership.
- Recommended control.
- PAM management approach.
- Common administrative mistakes.

### Account Lifecycle Visualization

Create a dynamic lifecycle:

DISCOVERY
→ CLASSIFICATION
→ OWNERSHIP
→ APPROVAL
→ ONBOARDING
→ SECURITY CONTROLS
→ ACCESS
→ MONITORING
→ RECERTIFICATION
→ ROTATION
→ RETIREMENT

Learners must click each stage.

Show:

- Current state.
- Required action.
- Control requirement.
- Evidence.
- Decision gate.
- Failure condition.
- Next stage.

### Lab 04

Scenario:

An enterprise has 30 privileged identities across Windows, Linux, Active Directory, and applications.

Learner must:

- Classify each account.
- Identify privileged accounts.
- Assign owners.
- Identify shared identities.
- Detect excessive privilege.
- Identify unmanaged service accounts.
- Recommend appropriate PAM controls.
- Identify accounts requiring immediate remediation.

Create a working account inventory table and classification workflow.

---

## CLASS 05 — CPM OPERATIONS AND PASSWORD MANAGEMENT

This must be one of the most technically detailed sessions.

### Topics

1. What is CPM?
2. CPM architecture.
3. CPM responsibilities.
4. Account management.
5. Verify operation.
6. Change operation.
7. Reconcile operation.
8. Automatic password rotation.
9. Manual password rotation.
10. Password policies.
11. Platform configuration.
12. Rotation intervals.
13. Password complexity.
14. Account dependencies.
15. Rotation failures.
16. Verification failures.
17. Reconciliation failures.
18. CPM connectivity.
19. Target account permissions.
20. Troubleshooting logs.
21. Operational recovery.
22. Password management evidence.

### CPM Operations Console

Create an operational CPM dashboard.

Include:

- Managed accounts.
- Accounts requiring verification.
- Rotation queue.
- Failed rotations.
- Pending reconciliation.
- Password change history.
- Platform assignment.
- Last successful change.
- Next scheduled change.
- Failure reason.
- CPM health.

### Account detail page

Show:

- Account identity.
- Target system.
- Platform.
- Safe.
- Owner.
- Management status.
- Last verify.
- Last change.
- Last reconcile.
- Current policy.
- Recent activity.
- Error history.

### Functional actions

Learner must be able to:

- Run Verify.
- Run Change.
- Run Reconcile.
- Enable/disable management.
- Change policy.
- Inspect failure details.
- Resolve failure.
- Retry operation.
- Review resulting audit events.

### Lab 05A — Password Rotation

Scenario:

A Windows Administrator account must be managed by CPM.

Learner must:

1. Inspect the account.
2. Verify credentials.
3. Enable management.
4. Confirm platform.
5. Trigger password change.
6. Observe simulated CPM activity.
7. Verify resulting credential.
8. Review logs.
9. Confirm successful operation.

### Lab 05B — CPM Rotation Failure

Scenario:

A managed account password change failed.

Possible causes:

- Target unreachable.
- Incorrect reconcile account.
- Insufficient privileges.
- Password complexity mismatch.
- Dependency failure.
- Invalid platform configuration.
- Account locked.

Learner must:

1. Read the error.
2. Inspect account configuration.
3. Determine root cause.
4. Correct configuration.
5. Run reconciliation if required.
6. Retry change.
7. Verify account.
8. Close incident with evidence.

Do not simply reveal the answer.

---

## CLASS 06 — PSM OPERATIONS AND PRIVILEGED SESSION MANAGEMENT

### Topics

1. What is PSM?
2. Why enterprises use PSM.
3. Session brokering.
4. Session authentication.
5. Credential injection.
6. Direct access versus controlled access.
7. PSM connection components.
8. Connection components.
9. Target systems.
10. Session policies.
11. Session recording.
12. Session monitoring.
13. Session termination.
14. Session audit.
15. PSM connection failures.
16. Connection troubleshooting.
17. Session evidence.
18. User accountability.
19. Privileged session governance.
20. Operational incident response.

### PSM Session Workspace

Create a realistic privileged session launch environment.

Include:

- Target server.
- Target account.
- Connection component.
- Session reason.
- Ticket/reference number.
- Approval status.
- Session duration.
- Launch action.

After launch, show a simulated terminal or remote session.

Example target:
WIN-SRV-01

Account:
Administrator

Connection:
RDP through PSM

Session actions:

- Login.
- Execute simulated administrative commands.
- Inspect system.
- View session events.
- View recording timeline.
- Terminate session.

### PSM session simulation

Create an interactive terminal that supports a controlled set of commands.

Examples:

- hostname
- whoami
- ipconfig
- systeminfo
- net user
- Get-Service
- Get-Process
- exit

Commands must return deterministic simulated results.

The session must not execute real commands on the user's computer.

### Lab 06A — Launch Privileged Session

Scenario:

A Windows administrator needs approved access to a production server.

Learner must:

1. Select target.
2. Select privileged account.
3. Enter business reason.
4. Enter ticket reference.
5. Obtain approval where required.
6. Launch PSM session.
7. Execute simulated commands.
8. Inspect recording.
9. Terminate session.
10. Review audit evidence.

### Lab 06B — PSM Connection Failure

Scenario:

A user cannot launch an RDP session through PSM.

Potential causes:

- Invalid target.
- Incorrect connection component.
- Missing account permissions.
- Target unreachable.
- PSM connector failure.
- Authorization failure.
- Session policy restriction.

Learner must diagnose and resolve the incident.

---

# 4. REALISTIC ENTERPRISE LAB ENVIRONMENT

Create a persistent simulated enterprise environment.

## Enterprise identity

Company:
GLOBAL FINANCIAL SERVICES

Domain:
corp.gfs.local

Environment:
CORP-PAM-LAB

## Systems

Windows:

- WIN-SRV-01
- WIN-SRV-02
- WIN-DC-01
- WIN-APP-01

Linux:

- LNX-SRV-01
- LNX-SRV-02

Database:

- DB-SQL-01
- DB-ORA-01

Application:

- APP-PAYMENT-01

## Accounts

- Administrator
- DomainAdmin-GFS
- svc_backup
- svc_sql
- svc_payment
- app_integrator
- root
- oracle
- db_admin
- shared_ops

## Safes

- WIN-SAFE
- UNIX-SAFE
- DBA-SAFE
- APP-SAFE
- SERVICE-SAFE
- DOMAIN-SAFE
- EMERGENCY-SAFE

## Users

- pam_admin
- pam_operator
- soc_analyst
- windows_admin
- linux_admin
- dba_user
- app_owner
- auditor

Implement different permissions and access levels.

---

# 5. FUNCTIONAL PAM ADMINISTRATION ENGINE

Create a consistent simulated backend/state engine.

Core entities:

- Users.
- Groups.
- Safes.
- Safe members.
- Accounts.
- Platforms.
- Account owners.
- Policies.
- CPM operations.
- PSM sessions.
- Approval requests.
- Audit events.
- Incidents.
- Lab progress.

All operational modules must use the same state.

If a learner creates an account in Accounts, it must appear in:

- Safe inventory.
- CPM operations.
- Account reports.
- Audit history.
- Relevant labs.

If a learner removes Safe access, the permission change must affect access testing

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0cd102e2-99b7-4197-80bb-dfe889d92066).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
