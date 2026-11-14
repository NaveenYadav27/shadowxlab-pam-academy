# SHADOWXLAB PAM ACADEMY — CLOUDFLARE DEPLOYMENT FORENSIC & ARCHITECTURE REPORT

**Target Hostname**: `cyberark.shadowxlab.com`  
**Repository**: `https://github.com/NaveenYadav27/shadowxlab-pam-academy.git`  
**Protected Recovery Baseline**: `shadowxlab-pam-academy-baseline-2026-11-14-v1` (`2146025`) — **Verified Intact**  
**Active Working Branch**: `feature/saas-foundation`  
**Date**: November 14, 2026  

---

## 1. EXECUTIVE SUMMARY & FORENSIC FINDINGS

The Cloudflare deployment for `shadowxlab-pam-academy` failed across multiple consecutive stages due to a series of dependency, toolchain, and CI build configuration mismatches between local developer environments (Windows x64 / Bun / npm 11) and Cloudflare Workers Builds CI (Linux x64 / Debian / Node.js 24.18.0 / npm 10.9.2).

### Deployment Architecture Determination
The project is built on:
* **Framework**: `@tanstack/react-start: 1.168.60` with `@tanstack/react-router: 1.170.41` and Vite `8.1.5`.
* **Deployment Target**: **Cloudflare Workers with Static Assets** (Modern Workers Sites replacement).
* **Entrypoints**:
  * **Static Client Assets**: `dist/client/` (binding `ASSETS`)
  * **Server SSR Fetch Worker**: `dist/server/server.js` (Fetch handler conforming to Cloudflare Workers module syntax)
* **Configuration**: `wrangler.json` (declarative Workers runtime config).

---

## 2. SEQUENCE OF DEPLOYMENT FAILURES & EXACT ROOT CAUSES

### Failure 1: Bun Frozen Lockfile Conflict (Screenshot 1 — 18:42:51)
* **Symptom**:
  ```text
  Installing project dependencies: bun install --frozen-lockfile
  error: lockfile had changes, but lockfile is frozen
  Failed: error occurred while installing tools or dependencies
  ```
* **Root Cause**: `bun.lock` was committed in the repository root, prompting Cloudflare Workers CI to detect Bun and run `bun install --frozen-lockfile`. However, `package.json` had evolved ahead of `bun.lock`.
* **Resolution**: Deleted `bun.lock` from version control and added it to `.gitignore`. Cloudflare automatically switched to `npm clean-install`.

---

### Failure 2: OS/Platform Architecture Rejection (Screenshot 2 — 18:50:13)
* **Symptom**:
  ```text
  Installing project dependencies: npm clean-install --progress=false
  npm error code EBADPLATFORM
  npm error notsup Unsupported platform for @esbuild/win32-x64@0.28.2: wanted {"os":"win32","cpu":"x64"} (current: {"os":"linux","cpu":"x64"})
  ```
* **Root Cause**: `@esbuild/win32-x64` was hardcoded directly in `dependencies` inside `package.json` from a previous local Windows install. When Cloudflare's Linux CI environment (`os: linux, cpu: x64`) executed `npm ci`, npm strictly enforced platform support and aborted with `EBADPLATFORM`.
* **Resolution**: Removed `@esbuild/win32-x64` from direct dependencies in `package.json`. Configured esbuild binary platform resolution to be managed automatically via optional dependencies.

---

### Failure 3: npm CLI Option Incompatibility & Unversioned Stubs (18:59:08)
* **Symptom**:
  ```text
  npm error
  npm error --allow-file
  ...
  npm error Clean install a project
  ```
* **Root Cause**: Two issues combined:
  1. An `.npmrc` file had `install-strategy=nested`, which triggers CLI usage errors in npm 10 during `npm ci`.
  2. The lockfile contained 16 empty stubs (`"node_modules/@babel/core/node_modules/semver": {}`) without `version` or `resolved` fields, causing npm 10's strict lockfile validator to throw `TypeError: Invalid Version:`.
* **Resolution**: Removed `.npmrc` and regenerated clean lockfile entries via `npm install --package-lock-only`, synchronizing all package dependencies.

---

### Failure 4: Cloudflare Dashboard Build Settings Mismatch (CRITICAL)
* **Symptom**: In the Cloudflare Dashboard Workers Builds settings (Screenshot 1):
  * **Build command**: `bun run build`
  * **Deploy command**: `npx wrangler deploy`
* **Root Cause**: Cloudflare Workers CI environment detects only `npm@10.9.2` and `nodejs@24.18.0` once `bun.lock` is removed. If the Dashboard Build Command remains `bun run build`, step 5 (*Building*) will fail with `bun: command not found`.
* **Resolution**:
  1. Updated `wrangler.json` to include `"build": { "command": "npm run build" }`.
  2. Cloudflare Dashboard Build settings must be confirmed to use `npm run build`.

---

## 3. ARCHITECTURE REPAIR & SSR FALLBACK RESOLUTION

### 1. Updated `wrangler.json`
`wrangler.json` was updated to explicitly declare:
```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "shadowxlab-pam-academy",
  "main": "dist/server/server.js",
  "compatibility_date": "2026-11-14",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "dist/client",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application"
  },
  "build": {
    "command": "npm run build"
  },
  "routes": [
    {
      "pattern": "cyberark.shadowxlab.com",
      "custom_domain": true
    }
  ]
}
```

### 2. Deep-Link SSR Fallback in `src/server.ts`
Because PAM Academy routes are managed inside the client SPA tree under `/`, direct HTTP requests to deep routes (e.g. `https://cyberark.shadowxlab.com/accounts`) previously returned 404 from TanStack Start's SSR route matcher.

We enhanced `src/server.ts` to inspect 404 responses for non-asset/non-API navigation requests and gracefully fall back to root SSR rendering:
```typescript
if (response.status === 404) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api") && !url.pathname.includes(".") && !url.pathname.startsWith("/assets")) {
    const rootRequest = new Request(new URL("/", request.url).href, request);
    const rootResponse = await handler.fetch(rootRequest, env, ctx);
    if (rootResponse.status === 200) {
      response = rootResponse;
    }
  }
}
```

---

## 4. VALIDATION GATES & VERIFICATION RESULTS

### Gate 1: Vitest Unit & Integration Test Suite
* **Command**: `npm test -- --run`
* **Result**: **100% PASSED** (4 test files, 48 tests)
  * `src/test/pam-workflows.test.ts` (35 tests): PASSED
  * `src/test/academy-curriculum.test.ts` (9 tests): PASSED
  * `src/test/learner-journey-e2e.test.ts` (3 tests): PASSED
  * `src/test/app-routing.test.tsx` (1 test): PASSED

### Gate 2: Production Build Pipeline
* **Command**: `npm run build`
* **Result**: **100% CLEAN**
  * Client bundle: `dist/client/` (`styles-*.css` 104 kB, `index-*.js` 592 kB, `routes-*.js` 605 kB)
  * Server bundle: `dist/server/server.js` (5.07 kB ESM fetch handler) + SSR routes (`724 kB`)

### Gate 3: Direct Cloudflare Worker Runtime Simulation
Executed direct `fetch(request, env, ctx)` validation on `dist/server/server.js` across all 12 operational modules:

| Route | HTTP Status | Response Length | Content-Type | Status |
| :--- | :---: | :---: | :---: | :---: |
| `/` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/overview` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/academy` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/accounts` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/safes` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/cpm` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/psm` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/policies` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/access` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/audit` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/discovery` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |
| `/troubleshooting` | 200 OK | 37,854 bytes | `text/html; charset=utf-8` | **PASS** |

---

## 5. RECOVERY BASELINE PRESERVATION

* **Tag**: `shadowxlab-pam-academy-baseline-2026-11-14-v1`
* **Target Commit**: `2146025`
* **Integrity Status**: **UNTOUCHED & IMMUTABLE**. Tag points directly to commit `2146025`.

---

## 6. CLOUDFLARE DASHBOARD STEP REQUIRED FOR USER

In the Cloudflare Dashboard under **Workers & Pages > shadowxlab-pam-academy > Settings > Builds & deployments**:
1. Click **Edit** next to **Build configuration** (shown in Screenshot 1).
2. Ensure:
   * **Build command**: `npm run build` *(Change from `bun run build` if set)*.
   * **Deploy command**: `npx wrangler deploy`.
   * **Root directory**: `/`.
   * **Production branch**: `main` (or `feature/saas-foundation`).
3. Click **Save and Deploy**.
