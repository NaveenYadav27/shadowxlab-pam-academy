# ShadowXLab CyberArk Administrator Operations Academy

## Product scope

Build the academy as a real, interactive PAM operations simulation—not a static course catalog. The first screen is a dense operations overview with a persistent navigation rail, environment/user context, lab progress, incidents, and working entry points into the simulation workspaces.

Deliver the Classes 01–06 curriculum with objectives, enterprise context, detailed operational teaching, instructor walkthrough and independent practice modes, interactive labs, assessment, scoring, feedback, evidence, and reset. Focus the first release on functional shared workflows for Safes and permissions, account onboarding and inventory, CPM operations and failure recovery, PSM launch/terminal/session evidence, audit, and troubleshooting. Architecture, identity hierarchy, and account lifecycle views are interactive teaching surfaces. All terminal commands are deterministic simulations only; no commands run on the learner's device or real PAM infrastructure.

## Shared state and persistence

Create one consistent simulated enterprise state for the specified GLOBAL FINANCIAL SERVICES environment, systems, accounts, Safes, and learner identities. Changes made in one workspace must be visible in related views and produce audit events. Persist each signed-in learner's simulation and progress in Lovable Cloud, protected so learners can access only their own state. Add no display-name/profile table; application roles must not be stored in profile or browser storage. Authentication roles, if ever introduced, remain separate from profiles and must be checked using trusted server-side authorization.

Provide email/password, Google, and Sign in with Lovable entry, with signup confirmation behavior respected. Learners sign in to save and restore progress. No privileged real-world operations or real credential storage are included.

## Interface direction

Use an original ShadowXLab enterprise operations center: dark navy navigation, restrained cyan/blue status accents, light operational work areas, compact tables, split workspaces, drawers/dialogs, status indicators, audit timelines, and responsive desktop-first behavior. Keep all visual styling on semantic design tokens and existing UI primitives.

## Technical approach

- Replace the template `/` page with the portal and its own title, description, Open Graph, and Twitter metadata.
- Keep the experience inside the existing TanStack Start structure and route conventions.
- Implement the simulation as typed shared domain state and focused workspace views; use the generated Cloud browser client with authenticated RLS for per-user saves.
- Add an additive Cloud migration for the per-user training-state record, explicit authenticated/service-role grants, RLS, and own-row policies. Do not store app roles in that state as authorization claims.
- Add behavioral tests for core permission checks, simulated CPM/PSM transitions, account/Safe shared-state propagation, reset, and per-user state policy assumptions where testable.
- Verify the real signed-in save-and-restore path and a desktop/mobile preview after implementation.

## Not in scope

No integration with an actual CyberArk deployment, production credentials, actual remote sessions, real shell execution, or real enterprise identity directory. The configured environment is a training simulator.
