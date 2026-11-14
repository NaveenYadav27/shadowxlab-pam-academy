# SHADOWXLAB PAM ACADEMY — REPOSITORY BASELINE DOCUMENTATION

**Document Type:** Formal Recovery Baseline & Architectural Snapshot  
**Date:** 2026-11-14  
**Product Identity:** ShadowXLab PAM Academy (Enterprise Privileged Access Management Training Simulator)  
**Repository URL:** https://github.com/NaveenYadav27/shadowxlab-pam-academy.git  
**Local Repository Path:** `C:\Users\navee\OneDrive\Desktop\SXL-Main\SXL-SOC LAB\SXL-SOC Analyst\shadowxlab-pam-academy`  
**Current Branch:** `main`  
**Baseline Git Tag:** `shadowxlab-pam-academy-baseline-2026-11-14-v1`  
**Baseline Backup Location:** `backups/shadowxlab-pam-academy/2026-11-14/shadowxlab-pam-academy-baseline.zip`  
**Enhancement Authorization Status:** LOCKED (Pre-enhancement baseline established; changes must occur on `feature/saas-foundation`)

---

## 1. Product Identity & Overview

ShadowXLab PAM Academy is a high-fidelity, browser-based enterprise Privileged Access Management (PAM) training platform modeled after CyberArk Privileged Vault Web Access (PVWA) Classic (v9/v10). It provides deterministic simulation for Safe management, account onboarding, Central Policy Manager (CPM) lifecycle operations, Privileged Session Manager (PSM) session brokering, and structured operator curriculum (Classes C01–C06).

---

## 2. Architecture Summary

- **Frontend Core:** React 19, TypeScript (strict mode), Vite, TanStack Router / TanStack Start SSR core.
- **Styling Architecture:** CyberArk PVWA Classic light enterprise aesthetic implemented via `src/enterprise.css` and Tailwind CSS utility foundations.
- **PAM Simulation Engine (`src/lib/pam-engine.ts`):** Deterministic state machine simulating the Digital Vault (TCP 1858), Central Policy Manager (CPM), and Privileged Session Manager (PSM) without live enterprise infrastructure dependencies.
- **Curriculum Engine (`src/lib/academy-curriculum.ts`):** Complete structured curriculum data for Classes C01 through C06 covering Concepts & Architecture, Guided Hands-on Labs with live state evaluation, Enterprise Job Roles, Interview Preparation Q&A, and ShadowXLab Core Institutional Tenets.
- **Authentication & Authorization:** Temporary Demo Mode bypass (`VITE_PAM_DEMO_MODE=true` default identity: `demo.learner`), backed by Supabase client schema configuration for multi-tenant transition.
- **Testing Harness:** Vitest with jsdom environment, React Testing Library, ESLint, Prettier, and Playwright Chromium headless screenshot verification.

---

## 3. Existing Features & Functionality Status

### A. Verified Functionality (Tested and Validated)
- **Classic PVWA Top Shell & Navigation:** 42px header with status indicators (`CORP-PAM-VAULT01` Online, `CPM: ACTIVE`, `PSM: CONNECTED`), horizontal tabs (`Accounts`, `Safes`, `CPM Operations`, `PSM Operations`, `Policies`, `Administration`, `Reports & Audit`, `Dashboard`, `Learning Academy`, `Troubleshooting`).
- **Accounts Administration Console (`/`):**
  - Left navigation tree (`pvwa-accounts-tree`) with categorized views (All Accounts, Windows, Linux, Database, Service, Safe filters, CPM status filters).
  - 16 seeded privileged enterprise accounts across multiple infrastructure tiers.
  - Contextual action toolbar: `Add Account`, `Connect (PSM)`, `Verify`, `Change`, `Reconcile`, `Details`.
  - Master-detail pane with 5 tabs: *General Information*, *Management (CPM)*, *Activities*, *Sessions*, *Versions*.
- **Safe Management Console:**
  - 7 seeded enterprise Safes (`WIN-SAFE`, `UNIX-SAFE`, `DBA-SAFE`, `APP-SAFE`, `SERVICE-SAFE`, `DOMAIN-SAFE`, `EMERGENCY-SAFE`).
  - Safe creation modal with retention periods and owner allocation.
  - Granular RBAC permission matrix (10 distinct Safe authorizations including *Use accounts*, *Retrieve accounts*, *List accounts*, *Manage Safe*, *Initiate CPM operations*).
- **Central Policy Manager (CPM) Operations Console:**
  - Automated credential lifecycle execution: *Verify*, *Change*, *Reconcile*.
  - Independent high-privilege Reconcile Account workflow for desynchronized credentials.
  - Real-time CPM failure triaging and error repair engine.
- **Privileged Session Manager (PSM) Operations Console:**
  - Brokered session initiation with change ticket reference (`CHG-10294`).
  - Embedded high-contrast terminal console with live recording telemetry indicator (`● REC`).
  - Shared command dispatcher `executeTerminalCommand` with keyboard shortcuts.
- **Dedicated Learning Academy (Classes C01–C06):**
  - Left-hand sequential class curriculum sidebar.
  - 5-tab sub-navigation for each class:
    1. *Concepts & Architecture* (credential crisis, core components, ASCII protocol flow).
    2. *Hands-on Lab & Objectives* (enterprise bank scenario, step-by-step guided procedure, console jump buttons, live objective evaluation engine scoring 0–100/100).
    3. *Enterprise Job Roles* (PAM Administrator and Engineer profiles, salary ranges, daily tasks, certifications).
    4. *Interview Preparation* (fundamental/scenario technical interview Q&A with evaluation lenses).
    5. *ShadowXLab Vision & Values* (core institutional pillars).
- **Operations Dashboard:**
  - Metric strip without text collisions (Managed Accounts, Rotation Exceptions, Active Sessions, Academy Progress).
  - Circular progress completion indicator and platform service health status.
- **Audit & Governance Log:**
  - Immutable event stream recording user actions, CPM operations, PSM connections, and credential checkouts.

### B. Reported Functionality (Framework & Backend Configuration)
- **Supabase Backend Schema:** SQL tables, RLS policies, and stored procedures for accounts, safes, sessions, and learner progress.
- **TanStack React Start SSR Preview Server:** Server output bundle generated in `dist/server/server.js`.

### C. Unverified Functionality (Reserved for SaaS Phase)
- **Multi-Tenant SaaS Isolation:** Schema-level tenant isolation, custom enterprise branding per tenant, and external identity provider SAML/OIDC federated SSO.
- **Live Distributed PAM Connectors:** Direct agentic communication to external live Windows Active Directory Domain Controllers or Linux bastions (simulation deliberately contained).

---

## 4. Current Build, Test & Quality Baseline

- **TypeScript Compilation:** 0 errors (strict mode enabled).
- **Vite Production Build:**
  - Client bundle built in ~8–10s (`dist/client/`).
  - Server SSR bundle built in ~4–5s (`dist/server/server.js`).
- **ESLint & Prettier:** 0 errors, 9 Fast Refresh warnings.
- **Vitest Test Suite:**
  - 3 test files (`pam-workflows.test.ts`, `learner-journey-e2e.test.ts`, `app-routing.test.tsx`).
  - 39 passed out of 39 tests (100% pass rate).
- **Browser Runtime Screenshots (1440×900):**
  - Accounts View (`accounts-view-1440x900.png`)
  - Safes View (`safes-view-1440x900.png`)
  - CPM Operations (`cpm-view-1440x900.png`)
  - PSM Operations (`psm-view-1440x900.png`)
  - Dashboard Overview (`dashboard-fixed-1440x900.png`)
  - Class 01 Concepts (`academy-c01-concepts-1440x900.png`)
  - Class 01 Guided Lab (`academy-c01-lab-1440x900.png`)
  - Class 01 Job Roles (`academy-c01-roles-1440x900.png`)
  - Class 01 Interview Prep (`academy-c01-interview-1440x900.png`)
  - Class 01 Vision & Values (`academy-c01-vision-1440x900.png`)

---

## 5. Deployment Configuration & Known Limitations

### Deployment Configuration
- Self-hosted Linux/Windows server environment listening on `http://100.95.175.46:8080`.
- Systemd / Node preview execution via `npm run preview:8080` (or `preview --port 8080 --host`).
- Feature Flag: `VITE_PAM_DEMO_MODE=true` (bypasses Google OAuth for standalone validation).

### Known Limitations
- State persistence is currently pinned to local learner state and localStorage; persistence across disparate browser sessions will require SaaS database synchronization.
- Real terminal network protocols (raw TCP RDP/SSH streams) are simulated via browser-based pseudo-terminal; no actual enterprise hosts are compromised.

---

## 6. Backup Archive & Integrity Verification

- **Archive Location:** `backups/shadowxlab-pam-academy/2026-11-14/shadowxlab-pam-academy-baseline.zip`
- **Manifest:** `backups/shadowxlab-pam-academy/2026-11-14/baseline-manifest.json`
- **Checksums:** `backups/shadowxlab-pam-academy/2026-11-14/SHA256SUMS.txt`
- **Contents:** Full source code, test suites, scripts, build configurations, documentation, package manifests, and lockfiles. Excludes `node_modules`, `dist/`, `.vite/`, temporary files, and secrets.

---

## 7. Recovery & Restoration Procedure

To restore the application to this exact verified baseline in case of an enhancement regression:

```bash
# Method 1: Git Tag Checkout (Working Directory)
git fetch origin --tags
git checkout shadowxlab-pam-academy-baseline-2026-11-14-v1

# Method 2: Restoration from Verified Backup Archive
mkdir C:\restore-temp\shadowxlab-pam-academy
tar -xf backups/shadowxlab-pam-academy/2026-11-14/shadowxlab-pam-academy-baseline.zip -C C:\restore-temp\shadowxlab-pam-academy
cd C:\restore-temp\shadowxlab-pam-academy
npm install
npm test
npm run build
npm run preview:8080
```

---

## 8. Governance & Enhancement Authorization

- **Baseline Status:** SEALED & IMMUTABLE.
- **Direct Commits to Baseline:** STRICTLY PROHIBITED.
- **Next Permitted Action:** Create branch `feature/saas-foundation` from tag `shadowxlab-pam-academy-baseline-2026-11-14-v1`.
