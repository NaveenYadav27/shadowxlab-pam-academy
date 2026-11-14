# CyberArk PVWA Classic — Administration Experience Reconstruction V2

**Repository:** [https://github.com/NaveenYadav27/shadowxlab-pam-academy](https://github.com/NaveenYadav27/shadowxlab-pam-academy)  
**Deployment Target:** `http://100.95.175.46:8080`  
**Latest Production Commit:** [`207c68e`](https://github.com/NaveenYadav27/shadowxlab-pam-academy/commit/207c68e)  
**Build & Test Validation:** TypeScript, Vite, ESLint, and 39 Vitest tests passing  

---

## 1. Executive Summary & Design Pivot

The previous dark-mode interface redesign has been completely replaced. The interface has been reconstructed from the ground up to reproduce the authentic **CyberArk Privileged Vault Web Access (PVWA) Classic (v9/v10)** administration console.

### Key Architectural Shifts:
1. **Light/Neutral Enterprise Workspace:**
   - Eliminated the pitch-black `#0b0f14` canvas, glowing neon accents, and oversized cards.
   - Applied the authentic CyberArk PVWA Classic palette: dark navy top header (`#132230`), navy horizontal tab strip (`#203142`), light enterprise workspace background (`#F4F6F9`), crisp white administrative panels (`#FFFFFF`), subtle borders (`#D1D5DB`), and classic CyberArk selection blue (`#D0E8F9`).
2. **Accounts View as Default Route (`/`):**
   - Direct navigation to `/` immediately opens the **Accounts View** instead of the old overview dashboard.
   - Preserves high operational density with 16 seeded privileged accounts across Windows, Linux, Database, Service, and Emergency tiers.
3. **Left-Hand Accounts Navigation Tree:**
   - Reconstructed the iconic CyberArk PVWA Classic left-hand navigation pane (`pvwa-accounts-tree`):
     - **Account Views:** All Accounts (16), Windows Accounts, Unix / Linux Accounts, Database Accounts, Service Accounts.
     - **CPM Status:** In Compliance / Managed, Verify Required, Rotation Failed.
     - **Safes:** Direct filters for `WIN-SAFE`, `UNIX-SAFE`, `DBA-SAFE`, `SERVICE-SAFE`, `DOMAIN-SAFE`, `EMERGENCY-SAFE`, `APP-SAFE`.
4. **Classic Action Toolbars & Dense Table Grid:**
   - Standard 28px enterprise buttons: `[+ Add Account]`, `[Connect (PSM)]`, `[Verify]`, `[Change]`, `[Reconcile]`, `[Details]`.
   - Compact 32px table rows with alternating zebra striping (`#FFFFFF` and `#F8FAFC`), status dots, clickable bold usernames, and inline quick action controls.
5. **Classic Tabbed Account Details (Master-Detail):**
   - Selecting any account displays the structured lower detail pane with traditional administrative tabs:
     - `General Information` (2-column key-value attribute sheet)
     - `Management (CPM)` (Policy, verification dates, failure diagnosis)
     - `Activities` (Audit trail log)
     - `Sessions` (PSM sessions history)
     - `Versions` (Historical password generation log)
6. **Dedicated Class-Wise Learning Academy (C01–C06):**
   - Kept strictly separate under its own dedicated `[Learning Academy]` tab.
   - Sequential curriculum starting from **Class 01 (PAM Foundations & Administrator Role)** through **Class 06 (PSM Operations)**.
   - Each class features 5 structured enterprise sections:
     1. `[📖 1. Concepts & Architecture]` — Credential risk, core components, and network protocol diagrams.
     2. `[🔬 2. Hands-on Lab & Objectives]` — Real-world banking scenarios, guided steps, console shortcuts, and live validation.
     3. `[💼 3. Enterprise Job Roles]` — PAM Administrator and Engineer profiles, daily operational workflows, and required certifications.
     4. `[🎯 4. Technical Interview Prep]` — High-frequency questions, suggested architectural responses, and interviewer evaluation lenses.
     5. `[🛡️ 5. ShadowXLab Vision & Values]` — Institutional principles and high-fidelity operational tenets.
7. **Fixed Dashboard Overview:**
   - Reconstructed the metrics strip with 4 distinct white enterprise cards (`Managed Accounts`, `Rotation Exceptions`, `Active Sessions`, `Academy Progress`).
   - Clean spacing eliminates number/label text collisions.

---

## 2. Browser Verification & Runtime Screenshots (1440x900)

The interface was rendered in headless Chromium at `1440x900` via Playwright. All views loaded cleanly with HTTP 200:

````carousel
![Accounts View 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/accounts-view-1440x900.png)
<!-- slide -->
![Safe Management 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/safes-view-1440x900.png)
<!-- slide -->
![CPM Operations 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/cpm-view-1440x900.png)
<!-- slide -->
![PSM Operations 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/psm-view-1440x900.png)
<!-- slide -->
![Fixed Dashboard Overview 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/dashboard-fixed-1440x900.png)
<!-- slide -->
![Class 01 Concepts Tab 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/academy-c01-concepts-1440x900.png)
<!-- slide -->
![Class 01 Hands-on Lab 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/academy-c01-lab-1440x900.png)
<!-- slide -->
![Class 01 Job Roles 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/academy-c01-roles-1440x900.png)
<!-- slide -->
![Class 01 Interview Prep 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/academy-c01-interview-1440x900.png)
<!-- slide -->
![Class 01 Vision & Values 1440x900](/C:/Users/navee/.gemini/antigravity/brain/af616998-49a4-48c2-b3f9-321b27a44bd9/screenshots/academy-c01-vision-1440x900.png)
````

---

## 3. Screen-by-Screen Implementation Breakdown

### 1. Classic Shell & Navigation
- **Top Header Bar (42px):**
  - Left: ShadowXLab Shield icon + `SHADOWXLAB PRIVILEGED ACCOUNT SECURITY` logo text + `PVWA CLASSIC v12.6`.
  - Center: Status indicators for Vault connection (`CORP-PAM-VAULT01`), CPM, and PSM proxy.
  - Right: Demo badge, connected administrator identity (`demo.learner`), and `[Reset/Logoff]` button.
- **Horizontal Tab Navigation (36px):**
  - Flat enterprise tabs: `[Accounts]`, `[Safes]`, `[CPM Operations]`, `[PSM Operations]`, `[Policies]`, `[Administration]`, `[Reports & Audit]`, `[Dashboard]`.
  - Active tab is rendered in white `#FFFFFF` with a 2px `#0078D4` top border accent, seamlessly uniting with the content canvas.
  - Separate `[Learning Academy]` tab positioned distinctly with a graduation cap icon.
- **Subnav / Breadcrumbs Bar (32px):**
  - Displays context navigation (`PAM Administration > Privileged Accounts > Inventory`), vault statistics, and baseline reset control.

### 2. Accounts View (The Primary Administration Screen)
- **Left Filter Tree (`pvwa-accounts-tree`):**
  - 210px width pane with categorized views: All Accounts (16), Windows Accounts, Linux Accounts, Database Accounts, Service Accounts, CPM Status groups, and Safes list.
- **Toolbar & Filter Strip:**
  - Contextual buttons enabled upon selection: `[+ Add Account]`, `[Connect (PSM)]`, `[Verify]`, `[Change]`, `[Reconcile]`.
  - Search input with inline filters for Safe, Platform, Account Type, and Management State.
- **Dense Data Grid:**
  - Rows: 32px height, alternating white/light-gray background.
  - High density: 16 accounts rendered comfortably on screen at 1440x900.
  - Columns: Checkbox, Status Dot, Username, Address, Platform, Safe, CPM Status, Last Verified, Last Password Change, Quick Action (`Connect`).
- **Account Details Panel:**
  - Lower tabbed master-detail sheet displaying General properties, CPM scheduling/errors, audit logs, and recorded sessions.

### 3. Safe Management View
- **Inventory Grid:** Safe Name, Description, Managed Accounts count, Assigned Members count, Safe Owner, and Retention Period.
- **Actions:** `[+ Add Safe]`, `[Review Access]`, and `[Permissions]`.
- **Details Tabs:** General configuration, accounts enclosed in the Safe, and full least-privilege permission matrix with granular checkboxes.

### 4. CPM Operations View
- **Summary Metrics Strip:** Managed Accounts, Verify Required, Rotation Failed, and Pending Reconcile.
- **Work Queue Grid:** Target accounts, policies, last verified timestamps, next scheduled runs, and CPM failure causes.
- **Controls:** `[Verify Now]`, `[Change Immediately]`, `[Reconcile with Reconcile Account]`, and error repair/unlock triggers.
- **Audit Execution History:** Live table of all CPM policy engine operations.

### 5. PSM Operations View
- **Connection Launcher:** Target selection, protocol configuration (SSH/RDP/SQL), ticket reference (`CHG-10294`), and session launch.
- **Live Terminal Window:** Embedded high-contrast console with live recording indicator (`● REC`), interactive command execution (`executeTerminalCommand`), deterministic command shortcuts, and session termination.
- **Recorded Archive Table:** Chronological list of recorded sessions, duration, risk levels, and executed command logs.

### 6. Learning Academy (C01–C06 Sequential Training Portal)
- **Sequential Class List:** C01 through C06 with clear duration badges, titles, and completion indicators.
- **5 Sub-Navigation Tabs:**
  - Concepts & Architecture (diagrams, key points, attack analysis).
  - Hands-on Lab & Objectives (step-by-step guided instructions, direct console shortcuts, live validation engine).
  - Enterprise Job Roles (salary ranges, daily workflows, certifications).
  - Interview Preparation (technical questions, suggested enterprise answers, evaluation lenses).
  - ShadowXLab Vision & Values (core institutional pillars).

---

## 4. Verification & Deployment Instructions

### Automated Verification Results
```
> npm test
 ✓ src/test/pam-workflows.test.ts (35 tests)
 ✓ src/test/learner-journey-e2e.test.ts (3 tests)
 ✓ src/test/app-routing.test.tsx (1 test)
 Test Files  3 passed (3)
      Tests  39 passed (39)

> npm run lint
 0 errors, 9 warnings (Fast Refresh warnings only)

> npm run build
 ✓ built client in 9.73s
 ✓ built ssr in 5.13s
```

### Self-Hosted Deployment Commands (Port 8080)
```bash
# 1. Pull the latest reconstructed code
git pull origin main

# 2. Build production assets
npm run build

# 3. Launch the production server on port 8080
npm run preview:8080
```
