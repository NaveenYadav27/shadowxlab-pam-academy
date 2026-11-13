# CYBERARK PVWA CLASSIC — VISUAL AND ARCHITECTURAL REFERENCE SPECIFICATION

**Project:** ShadowXLab PAM Academy — Enterprise Privileged Vault Web Access Classic Reconstruction V2  
**Target Architecture:** CyberArk PVWA Classic Interface (v9 / v10 Classic Administration Console)

---

## 1. Primary Design Philosophy & Palette

Unlike modern SaaS landing pages or pitch-black gaming dashboards, the authentic CyberArk PVWA Classic administration experience is an **authoritative, dense, neutral/light enterprise management tool** designed for system and security administrators managing thousands of vaulted credentials and Safes.

### Core Color Palette:

- **Top Brand Header Bar:** `#132230` to `#1B2A38` (CyberArk Dark Slate Navy)
- **Top Header Border:** `#223547` (1px subtle border)
- **Global Tab Navigation Bar:** `#203040` (Dark Navy Sub-nav) with Active Tab `#FFFFFF` (clean cut white tab into light workspace) or `#0078D4` top border accent.
- **Application Workspace Background:** `#F0F2F5` / `#F4F6F9` (Crisp light enterprise workspace background)
- **Primary Surface / Data Grids / Panels:** `#FFFFFF` (Solid white administrative surfaces)
- **Grid / Panel Borders:** `#D1D5DB` / `#CBD5E1` (Crisp 1px solid light gray administrative boundaries)
- **Grid Table Header Row:** `#EBF0F5` or `#EDF2F7` (Neutral subtle gray with 1px border `#D1D5DB`)
- **Grid Alternating Rows:** `#FFFFFF` (even rows) and `#F8FAFC` (odd rows)
- **Row Hover State:** `#EDF5FD` (Soft ice blue hover)
- **Row Selected State:** `#D0E8F9` (Classic CyberArk selected row highlight with `#004578` bold text and `#0078D4` 3px left indicator bar)
- **Primary Action Accent:** `#0078D4` / `#0066B3` (CyberArk classic action blue)
- **Status Badges / Compliance Dots:**
  - _Managed / In Compliance:_ Badge bg `#DEF7EC`, text `#03543F`, border `#BCF0DA` (Green dot `#10B981`)
  - _Verify Required / Warning:_ Badge bg `#FEF08A`, text `#713F12`, border `#FDE047` (Amber dot `#F59E0B`)
  - _Rotation Failed / Error:_ Badge bg `#FDE8E8`, text `#9B1C1C`, border `#F8B4B4` (Red dot `#EF4444`)
  - _Unmanaged:_ Badge bg `#F1F5F9`, text `#475569`, border `#CBD5E1` (Slate dot `#94A3B8`)

---

## 2. Header Layout (40px–44px)

```
+----------------------------------------------------------------------------------------------------------+
| [SHADOWXLAB logo] PRIVILEGED ACCOUNT SECURITY | Environment: corp.gfs.local | Administrator (Demo) [Logoff] |
+----------------------------------------------------------------------------------------------------------+
```

- **Height:** 42px fixed height, sticky at top.
- **Left:** ShadowXLab PAM Shield icon (18px) + "SHADOWXLAB" bold white title (13px, tracking 0.5px) + subtle vertical divider + "PRIVILEGED ACCOUNT SECURITY" (11px, `#94A3B8`).
- **Right Context:** Connected vault environment pill (`corp.gfs.local`), logged-in administrator (`demo-learner@shadowxlab.com`), Help link, and classic text button `[Logoff]`.

---

## 3. Global Navigation Layout (34px–38px)

Traditional horizontal tab strip directly below the header:

```
+----------------------------------------------------------------------------------------------------------+
|  [Accounts]  [Safes]  [CPM Operations]  [PSM Sessions]  [Policies]  [Administration]  |  [Academy Training]  |
+----------------------------------------------------------------------------------------------------------+
```

- Tabs are classic enterprise flat tabs with clean rectangular geometry.
- Active tab has white background `#FFFFFF` that connects seamlessly to the page content below, with a 2px top accent bar `#0078D4` and bold text `#1E293B`.
- Inactive tabs have light gray/white text on dark navy (`#94A3B8` / `#CBD5E1`), transitioning on hover.
- **Separation:** "Academy Training" is positioned on the far right as a distinct training portal link so the administration experience remains strictly focused on PAM operations.

---

## 4. Accounts View (The Primary Administration Screen)

The default view when opening the application (replaces the old card-based overview).

### Layout Structure:

```
+----------------------------------------------------------------------------------------------------------+
| Breadcrumb: Administration Console > Privileged Accounts                                                |
| Toolbar: [+ Add Account] [Connect (PSM)] [Verify] [Change] [Reconcile] [Details] | Search: [_______] [Q]  |
| Filters: Safe: [All Safes v]  Platform: [All Platforms v]  Status: [All Statuses v]                     |
+----------------------+-----------------------------------------------------------------------------------+
| ACCOUNT VIEWS TREE   | ACCOUNTS GRID (High Density - 15-20 rows visible)                                  |
| - All Accounts (10)  | [ ] | St | Username   | Address       | Platform         | Safe       | CPM Status |
| - Recently Used      | [ ] | () | root       | 10.0.10.15    | Unix SSH         | Unix-Infra | Managed    |
| - Domain Accounts    | [x] | () | svc-cpm    | corp.gfs.local| Windows Domain   | Vault-Admn | Managed    |
| - Linux Accounts     | [ ] | () | db_admin   | 10.0.12.80    | Oracle DB        | DB-Finance | Error      |
| - Windows Accounts   | ...                                                                               |
| - CPM Errors (1)     |-----------------------------------------------------------------------------------|
|                      | SELECTED ACCOUNT DETAILS PANE (Below or side split)                               |
|                      | Tabs: [General Properties] [CPM Management] [Activities] [PSM Sessions] [Versions]|
+----------------------+-----------------------------------------------------------------------------------+
```

### Table Columns (High Density):

1. **Selector Checkbox:** 28px width, center aligned.
2. **Status Indicator:** 28px width, compliance icon/colored circle.
3. **User Name:** 120px–150px, bold dark navy text `#004578` (clickable to open details).
4. **Address:** 130px–160px, IP address or FQDN.
5. **Platform:** 140px, e.g. "Windows Domain", "Unix via SSH", "Oracle Database".
6. **Safe:** 120px, Safe name link.
7. **CPM Status:** 130px, badge pill (Managed, Verify required, Rotation failed).
8. **Last Verified:** 120px, timestamp or date.
9. **Last Password Change:** 120px, timestamp or date.
10. **Quick Action:** "Connect" button directly in row.

---

## 5. Classic Account Details Layout

When an account is selected or double-clicked, the detail pane/view opens:

- **Header:** Account Name (`svc-cpm@corp.gfs.local`), Safe Name, Platform.
- **Top Actions:** `[Connect (PSM)]`, `[Verify Password]`, `[Change Password]`, `[Reconcile Password]`, `[View Password]`, `[Edit Properties]`.
- **Administrative Tabs:**
  1. **General Information:** 2-column property sheet (Safe, Device Type, Target System, Address, User Name, Logon Domain, Port, Created Date).
  2. **CPM Status:** Automation status, Last verification timestamp, Last change timestamp, Next schedule, Failure reason / CPM error code, Reconciliation account assigned.
  3. **Activities (Audit Log):** Chronological tabular log of user & engine actions (Time, User, Action, Target, Result).
  4. **PSM Sessions:** History of interactive sessions launched on this account, duration, and session recordings.
  5. **Versions:** Historical password versions stored in the Vault.

---

## 6. Classic Safe Management View

- **Safe Inventory Grid:**
  - Columns: Safe Name, Description, Managed Accounts, Assigned Members, Safe Owner, Retention Period (Days).
  - Actions: `[+ Add Safe]`, `[Safe Properties]`, `[Delete Safe]`.
- **Safe Details & Permissions Matrix:**
  - Tab 1: **General** (Name, Description, Owner, Retention, File Count).
  - Tab 2: **Accounts in Safe** (Grid of accounts housed within this Safe).
  - Tab 3: **Members & Authorizations** (List of users/groups with permission checkboxes: Use accounts, Retrieve accounts, List accounts, Add accounts, Update password, Initiate CPM operations, Manage Safe).

---

## 7. CPM Operations Screen

- **Header:** CPM operational metrics strip: Total In Scope, In Compliance, Pending Verification, Error/Locked.
- **CPM Work Queue Table:** Accounts requiring verification or manual reconciliation.
- **Operations Controls:**
  - `[Verify Now]`
  - `[Change Immediately]`
  - `[Reconcile with Reconcile Account]`
  - `[Clear Error / Unlock]`
- **CPM Activity Log:** Detailed execution log of CPM policy engine tasks.

---

## 8. PSM Sessions Screen

- **PSM Launcher Bar:** Target account selector, connection protocol (RDP / SSH / SQL), Ticket ID/Reason, `[Connect Now]` button.
- **Live Terminal / Session Window:** When active, opens high-contrast monospace simulated remote terminal with live session recording indicator (`REC`).
- **Session Recordings Table:** Audit table of all recorded privileged sessions with Session ID, User, Target, Protocol, Start Time, Duration, Risk Level, and action to review command log.

---

## 9. Dimension, Spacing, and Typography Specifications

- **Font Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`
- **Body Font Size:** 12px / 13px (crisp, enterprise density)
- **Table Row Height:** 30px–34px
- **Toolbar Height:** 38px
- **Button Dimensions:**
  - Primary: Height 28px, padding 4px 12px, font-size 12px, radius 2px.
  - Secondary: Height 28px, padding 4px 10px, font-size 12px, border `1px solid #CBD5E1`.
- **Search & Dropdown Inputs:** Height 28px, font-size 12px, border `1px solid #CBD5E1`.
- **Table Header Height:** 30px, background `#EEF2F6`, uppercase 11px font with bold weight 600.
