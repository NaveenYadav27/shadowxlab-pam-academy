import { describe, expect, it } from "vitest";
import {
  makeInitialPamState,
  addSafe,
  setSafeMember,
  evaluatePermission,
  canSafeMemberPerform,
  permissionDependencies,
  addAccount,
  runCpmOperation,
  repairCpmFailure,
  launchPsmSession,
  simulateTerminalCommand,
  appendSessionCommand,
  completeLab,
  evaluateLabObjectives,
  resetPamState,
  SUPPORTED_PLATFORMS,
  ALLOWED_TERMINAL_COMMANDS,
  type PamState,
  type NewAccountInput,
} from "../lib/pam-engine";

describe("PAM Control Plane Workflows", () => {
  // 1. Safe creation
  describe("1. Safe Creation", () => {
    it("creates a new Safe with owner permissions and audit event", () => {
      const state = makeInitialPamState();
      const res = addSafe(state, {
        name: "TEST-VAULT-SAFE",
        description: "Test boundary for automated validation",
        owner: "dba_user",
      });

      expect(res.error).toBeUndefined();
      expect(res.state.safes.some((s) => s.name === "TEST-VAULT-SAFE")).toBe(true);
      const created = res.state.safes.find((s) => s.name === "TEST-VAULT-SAFE");
      expect(created?.owner).toBe("dba_user");
      expect(created?.members[0]?.username).toBe("dba_user");
      expect(res.state.audit[0]?.action).toBe("Create Safe");
      expect(res.state.audit[0]?.target).toBe("TEST-VAULT-SAFE");
    });

    it("rejects duplicate Safe names and invalid naming conventions", () => {
      const state = makeInitialPamState();
      const duplicateRes = addSafe(state, {
        name: "DBA-SAFE",
        description: "Duplicate test",
        owner: "dba_user",
      });
      expect(duplicateRes.error).toBe("A Safe with that name already exists.");

      const invalidRes = addSafe(state, {
        name: "bad_safe_name",
        description: "Invalid format",
        owner: "dba_user",
      });
      expect(invalidRes.error).toContain("Use 3–30 uppercase letters");
    });
  });

  // 2. Permission validation
  describe("2. Permission Validation", () => {
    it("evaluates Safe permissions with least-privilege boundaries", () => {
      const state = makeInitialPamState();
      // pam_admin is member of WIN-SAFE
      const adminEval = evaluatePermission(state, "WIN-SAFE", "pam_admin", "Retrieve accounts");
      expect(adminEval.allowed).toBe(true);

      // dba_user is not member of WIN-SAFE
      const dbaEval = evaluatePermission(state, "WIN-SAFE", "dba_user", "Retrieve accounts");
      expect(dbaEval.allowed).toBe(false);
      expect(dbaEval.message).toContain("not authorized");
    });

    it("validates permission dependencies before saving member access", () => {
      const deps = permissionDependencies(["Use accounts"]);
      expect(deps).toContain("List accounts");

      const state = makeInitialPamState();
      const invalidSave = setSafeMember(
        state,
        "DBA-SAFE",
        { username: "dba_user", permissions: ["Use accounts"] },
        "pam_admin",
      );
      expect(invalidSave.error).toContain("List accounts");
    });
  });

  // 3. Account onboarding across platforms
  describe("3. Account Onboarding", () => {
    it.each(SUPPORTED_PLATFORMS)(
      "successfully onboards an account on platform '%s'",
      (platform) => {
        const state = makeInitialPamState();
        const input: NewAccountInput = {
          name: `SVC-${platform.replace(/\s+/g, "-")}`,
          username: `svc_${platform.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          address: "SRV-ENTERPRISE-01",
          platform,
          safe: "WIN-SAFE",
          type: "Service account",
          owner: "windows_admin",
          purpose: "Critical platform automated workload identity",
          dependency: "Payment Processing Gateway",
        };

        const res = addAccount(state, input, "pam_admin");
        expect(res.error).toBeUndefined();
        expect(res.state.accounts.some((a) => a.username === input.username)).toBe(true);
        const created = res.state.accounts.find((a) => a.username === input.username);
        expect(created?.status).toBe("Verify required");
        expect(created?.platform).toBe(platform);
        expect(res.state.audit[0]?.action).toBe("Onboard account");
      },
    );

    it("rejects unsupported platforms and incomplete target properties", () => {
      const state = makeInitialPamState();
      const badPlatformInput: NewAccountInput = {
        name: "Bad Account",
        username: "bad_user",
        address: "HOST-01",
        platform: "Unsupported Custom OS",
        safe: "WIN-SAFE",
        type: "Service account",
        owner: "windows_admin",
        purpose: "Testing invalid platform",
        dependency: "",
      };

      const res = addAccount(state, badPlatformInput, "pam_admin");
      expect(res.error).toContain("is unsupported");

      const missingAddress = addAccount(
        state,
        { ...badPlatformInput, platform: "Windows Server Local", address: "" },
        "pam_admin",
      );
      expect(missingAddress.error).toContain("Target address");
    });
  });

  // 4. CPM Verify
  describe("4. CPM Verify", () => {
    it("successfully verifies authentication state on target and transitions to Managed", () => {
      const state = makeInitialPamState();
      const targetAccount = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      expect(targetAccount).toBeDefined();
      if (!targetAccount) return;

      const res = runCpmOperation(state, targetAccount.id, "Verify", "pam_admin");
      expect(res.error).toBeUndefined();
      const updated = res.state.accounts.find((a) => a.id === targetAccount.id);
      expect(updated?.status).toBe("Managed");
      expect(updated?.lastVerify).toContain("Verified");
      expect(res.state.cpmOperations[0]?.result).toBe("Completed");
      expect(res.state.audit[0]?.result).toBe("Success");
    });
  });

  // 5. CPM Change success
  describe("5. CPM Change Success", () => {
    it("rotates managed target credential safely and updates Vault record", () => {
      const state = makeInitialPamState();
      const targetAccount = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      expect(targetAccount).toBeDefined();
      if (!targetAccount) return;

      const res = runCpmOperation(state, targetAccount.id, "Change", "pam_admin");
      expect(res.error).toBeUndefined();
      const updated = res.state.accounts.find((a) => a.id === targetAccount.id);
      expect(updated?.status).toBe("Managed");
      expect(updated?.lastChange).toContain("Changed");
      expect(res.state.cpmOperations[0]?.operation).toBe("Change");
      expect(res.state.cpmOperations[0]?.result).toBe("Completed");
    });
  });

  // 6. CPM Change failure
  describe("6. CPM Change Failure", () => {
    it("fails rotation when target is locked or divergent, setting status to Rotation failed", () => {
      const state = makeInitialPamState();
      const lockedAccount = state.accounts.find(
        (a) => a.username === "svc_backup" && a.status === "Rotation failed",
      );
      expect(lockedAccount).toBeDefined();
      if (!lockedAccount) return;

      const res = runCpmOperation(state, lockedAccount.id, "Change", "pam_admin");
      const updated = res.state.accounts.find((a) => a.id === lockedAccount.id);
      expect(updated?.status).toBe("Rotation failed");
      expect(res.state.cpmOperations[0]?.result).toBe("Failed");
      expect(res.state.cpmOperations[0]?.detail).toContain("Resolve incident");
    });

    it("rejects password change on unmanaged accounts", () => {
      const state = makeInitialPamState();
      const unmanaged = state.accounts.find((a) => a.status === "Unmanaged");
      expect(unmanaged).toBeDefined();
      if (!unmanaged) return;

      const res = runCpmOperation(state, unmanaged.id, "Change", "pam_admin");
      expect(res.error).toContain("Cannot rotate unmanaged account");
    });
  });

  // 7. CPM distinct recovery actions
  describe("7. CPM Incident Recovery", () => {
    it("strictly differentiates repair actions and rejects mismatched repairs", () => {
      const state = makeInitialPamState();
      const lockedAccount = state.accounts.find((a) => a.username === "svc_backup");
      expect(lockedAccount).toBeDefined();
      if (!lockedAccount) return;

      // Connectivity repair should be rejected on an account lockout
      const wrongRepair = repairCpmFailure(
        state,
        lockedAccount.id,
        "target-connectivity",
        "pam_admin",
      );
      expect(wrongRepair.error).toContain("Repair mismatched");

      // Matching unlock repair succeeds
      const correctRepair = repairCpmFailure(state, lockedAccount.id, "unlock", "pam_admin");
      expect(correctRepair.error).toBeUndefined();
      const repaired = correctRepair.state.accounts.find((a) => a.id === lockedAccount.id);
      expect(repaired?.failureCause).toBeUndefined();
      expect(repaired?.status).toBe("Verify required");
    });

    it("reconciles divergent credentials after repair and permits clean rotation", () => {
      const state = makeInitialPamState();
      const lockedAccount = state.accounts.find((a) => a.username === "svc_backup");
      if (!lockedAccount) return;

      const unlocked = repairCpmFailure(state, lockedAccount.id, "unlock", "pam_admin").state;
      const reconciled = runCpmOperation(
        unlocked,
        lockedAccount.id,
        "Reconcile",
        "pam_admin",
      ).state;
      expect(reconciled.cpmOperations[0]?.operation).toBe("Reconcile");
      expect(reconciled.cpmOperations[0]?.result).toBe("Completed");

      const rotated = runCpmOperation(reconciled, lockedAccount.id, "Change", "pam_admin").state;
      expect(rotated.cpmOperations[0]?.operation).toBe("Change");
      expect(rotated.cpmOperations[0]?.result).toBe("Completed");
    });
  });

  // 8. PSM approval gates
  describe("8. PSM Approval Gates", () => {
    it("refuses to launch privileged session without dual-control approval", () => {
      const state = makeInitialPamState();
      expect(state.approvalGranted).toBe(false);
      const targetAccount = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      if (!targetAccount) return;

      const res = launchPsmSession(
        state,
        {
          target: "WIN-SRV-01",
          account: targetAccount,
          ticket: "CHG-10294",
          reason: "Emergency kernel patching for security vulnerability",
        },
        "pam_admin",
      );

      expect(res.error).toContain("Dual-control approval required");
    });
  });

  // 9. PSM session launch
  describe("9. PSM Session Launch", () => {
    it("launches an active privileged session when all 8 preflight checks succeed", () => {
      let state = makeInitialPamState();
      state = { ...state, approvalGranted: true };
      const targetAccount = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      if (!targetAccount) return;

      const res = launchPsmSession(
        state,
        {
          target: "WIN-SRV-01",
          account: targetAccount,
          ticket: "CHG-99412",
          reason: "Scheduled quarterly database server maintenance",
        },
        "pam_admin",
      );

      expect(res.error).toBeUndefined();
      expect(res.state.sessions.length).toBe(1);
      const session = res.state.sessions[0];
      expect(session?.status).toBe("Active");
      expect(session?.target).toBe("WIN-SRV-01");
      expect(session?.account).toBe("Administrator");
      expect(res.state.audit[0]?.action).toBe("Launch PSM session");
    });

    it("rejects launch when actor lacks Initiate privileged sessions in target Safe", () => {
      let state = makeInitialPamState();
      state = { ...state, approvalGranted: true };
      const targetAccount = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      if (!targetAccount) return;

      // dba_user is not in WIN-SAFE
      const res = launchPsmSession(
        state,
        {
          target: "WIN-SRV-01",
          account: targetAccount,
          ticket: "CHG-99412",
          reason: "Unauthorized attempt from unauthorized persona",
        },
        "dba_user",
      );

      expect(res.error).toContain("Access denied: dba_user lacks Initiate privileged sessions");
    });
  });

  // 10. Terminal command execution
  describe("10. Terminal Command Execution", () => {
    it.each(ALLOWED_TERMINAL_COMMANDS.filter((cmd) => cmd !== "exit"))(
      "executes allowed command '%s' deterministically without OS command execution",
      (command) => {
        const simulated = simulateTerminalCommand(command);
        expect(simulated.valid).toBe(true);
        expect(simulated.output.length).toBeGreaterThan(0);
        expect(simulated.exit).toBe(false);
      },
    );

    it("appends executed command to session history and audit log", () => {
      let state = makeInitialPamState();
      state = { ...state, approvalGranted: true };
      const account = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      if (!account) return;

      const sessionRes = launchPsmSession(
        state,
        {
          target: "WIN-SRV-01",
          account,
          ticket: "CHG-55102",
          reason: "Operations routine security inspection",
        },
        "pam_admin",
      );
      const sessionId = sessionRes.state.sessions[0]?.id ?? "";

      const cmdState = appendSessionCommand(sessionRes.state, sessionId, "whoami", "pam_admin");
      const activeSession = cmdState.sessions.find((s) => s.id === sessionId);
      expect(activeSession?.commands.some((c) => c.includes("corp\\administrator"))).toBe(true);
      expect(cmdState.audit[0]?.action).toBe("Execute session command");
      expect(cmdState.audit[0]?.detail).toContain("whoami");
    });
  });

  // 11. Session termination
  describe("11. Session Termination", () => {
    it("terminates session, seals recording, and preserves audit trail", () => {
      let state = makeInitialPamState();
      state = { ...state, approvalGranted: true };
      const account = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      if (!account) return;

      const sessionRes = launchPsmSession(
        state,
        {
          target: "WIN-SRV-01",
          account,
          ticket: "CHG-55102",
          reason: "Operations routine inspection",
        },
        "pam_admin",
      );
      const sessionId = sessionRes.state.sessions[0]?.id ?? "";

      const termState = appendSessionCommand(sessionRes.state, sessionId, "exit", "pam_admin");
      const terminated = termState.sessions.find((s) => s.id === sessionId);
      expect(terminated?.status).toBe("Terminated");
      expect(termState.audit[0]?.action).toBe("Terminate PSM session");
    });
  });

  // 12. Lab objective evaluation
  describe("12. Lab Objective-Driven Evaluation", () => {
    it("evaluates Class 01 architecture trace objectives", () => {
      const state = makeInitialPamState();
      const evalResult = evaluateLabObjectives(state, "Lab 01 · Trace the PAM architecture");
      expect(evalResult.objectives.length).toBe(7);
      expect(evalResult.score).toBeGreaterThanOrEqual(50);
    });

    it("evaluates Class 02 DBA-SAFE access provisioning objectives", () => {
      let state = makeInitialPamState();
      const initialEval = evaluateLabObjectives(state, "Lab 02 · Provision DBA-SAFE access");
      expect(initialEval.objectives.some((o) => o.id === "add-dba-user")).toBe(true);

      // Provision dba_user with proper permissions
      state = setSafeMember(
        state,
        "DBA-SAFE",
        {
          username: "dba_user",
          permissions: ["List accounts", "Use accounts", "Initiate privileged sessions"],
        },
        "pam_admin",
      ).state;

      // Test allowed and denied access
      evaluatePermission(state, "DBA-SAFE", "dba_user", "Use accounts");
      evaluatePermission(state, "DBA-SAFE", "dba_user", "Retrieve accounts");

      const afterEval = evaluateLabObjectives(state, "Lab 02 · Provision DBA-SAFE access");
      expect(afterEval.score).toBe(100);
      expect(afterEval.completed).toBe(true);
    });

    it("evaluates Class 05 CPM recovery objectives and verifies completion", () => {
      let state = makeInitialPamState();
      const lockedAccount = state.accounts.find((a) => a.username === "svc_backup");
      if (!lockedAccount) return;

      // Class 05B: Recover failed rotation
      state = repairCpmFailure(state, lockedAccount.id, "unlock", "pam_admin").state;
      state = runCpmOperation(state, lockedAccount.id, "Reconcile", "pam_admin").state;
      state = runCpmOperation(state, lockedAccount.id, "Change", "pam_admin").state;
      state = runCpmOperation(state, lockedAccount.id, "Verify", "pam_admin").state;

      const evalResult = evaluateLabObjectives(state, "Lab 05B · Recover a failed rotation");
      expect(evalResult.completed).toBe(true);
      expect(evalResult.score).toBe(100);
    });

    it("evaluates Class 06 PSM session launch and execution objectives", () => {
      let state = makeInitialPamState();
      state = { ...state, approvalGranted: true };
      const account = state.accounts.find(
        (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
      );
      if (!account) return;

      const sessionRes = launchPsmSession(
        state,
        {
          target: "WIN-SRV-01",
          account,
          ticket: "CHG-77189",
          reason: "Scheduled quarterly system verification",
        },
        "pam_admin",
      );
      const sessionId = sessionRes.state.sessions[0]?.id ?? "";
      let sessionState = appendSessionCommand(sessionRes.state, sessionId, "whoami", "pam_admin");
      sessionState = appendSessionCommand(sessionState, sessionId, "exit", "pam_admin");

      const evalResult = evaluateLabObjectives(
        sessionState,
        "Lab 06A · Launch an approved session",
      );
      expect(evalResult.completed).toBe(true);
      expect(evalResult.score).toBe(100);
    });
  });

  // 13. Progress persistence and reset
  describe("13. Learner Progress Persistence and Isolation", () => {
    it("records completed lab score in learner record and allows state reset", () => {
      let state = makeInitialPamState();
      state = completeLab(state, "Lab 02 · Provision DBA-SAFE access", 95);
      expect(state.completedLabs).toContain("Lab 02 · Provision DBA-SAFE access");
      expect(state.scores["Lab 02 · Provision DBA-SAFE access"]).toBe(95);

      const reset = resetPamState();
      expect(reset.completedLabs).toHaveLength(0);
      expect(reset.scores).toEqual({});
      expect(reset.accounts.length).toBeGreaterThan(0);
    });
  });
});
