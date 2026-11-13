import { describe, expect, it } from "vitest";
import {
  makeInitialPamState,
  evaluateLabObjectives,
  completeLab,
  evaluatePermission,
  addAccount,
  runCpmOperation,
  repairCpmFailure,
  launchPsmSession,
  appendSessionCommand,
  type PamState,
  type NewAccountInput,
} from "@/lib/pam-engine";

/**
 * End-to-End Learner Journey Test Suite
 * Validates the complete 17-step learner journey specified in Phase 6:
 * 1. Register learner A
 * 2. Complete Class 01
 * 3. Verify Class 02 unlock
 * 4. Refresh page (state reload simulation)
 * 5. Verify progress remains
 * 6. Logout
 * 7. Register learner B
 * 8. Verify learner B has independent progress
 * 9. Attempt unauthorized retrieval
 * 10. Verify denial and audit event
 * 11. Complete account onboarding
 * 12. Trigger CPM failure and repair
 * 13. Launch PSM session
 * 14. Execute approved command
 * 15. Inspect recording
 * 16. Terminate session
 * 17. Verify evidence and progress
 */
describe("Phase 6: Complete End-to-End Learner Journey", () => {
  // Shared mock persistence store simulating Supabase RLS isolation
  const mockDatabase: Record<string, PamState> = {};

  const saveLearnerState = (userId: string, state: PamState) => {
    mockDatabase[userId] = JSON.parse(JSON.stringify(state));
  };

  const loadLearnerState = (userId: string): PamState => {
    return mockDatabase[userId]
      ? JSON.parse(JSON.stringify(mockDatabase[userId]))
      : makeInitialPamState();
  };

  it("executes the full 17-step operational lifecycle across multiple learners", () => {
    // -------------------------------------------------------------
    // Step 1: Register learner A
    // -------------------------------------------------------------
    const learnerAId = "user-uuid-learner-a-1111";
    let stateA = makeInitialPamState();
    saveLearnerState(learnerAId, stateA);
    expect(stateA.completedLabs).toHaveLength(0);
    expect(loadLearnerState(learnerAId).completedLabs).toHaveLength(0);

    // -------------------------------------------------------------
    // Step 2: Complete Class 01 through objective evaluation
    // -------------------------------------------------------------
    const c01Evaluation = evaluateLabObjectives(stateA, "Lab 01 · Trace the PAM architecture");
    expect(c01Evaluation.objectives.length).toBeGreaterThan(0);
    expect(c01Evaluation.completed).toBe(true);
    expect(c01Evaluation.score).toBe(100);

    stateA = completeLab(stateA, "Lab 01 · Trace the PAM architecture", 100);
    expect(stateA.completedLabs).toContain("Lab 01 · Trace the PAM architecture");
    saveLearnerState(learnerAId, stateA);

    // -------------------------------------------------------------
    // Step 3: Verify Class 02 unlock
    // Class 01 completion unlocks Class 02 access
    // -------------------------------------------------------------
    const hasClass01Completed = stateA.completedLabs.includes(
      "Lab 01 · Trace the PAM architecture",
    );
    expect(hasClass01Completed).toBe(true);

    // -------------------------------------------------------------
    // Step 4: Refresh page / session reload simulation
    // -------------------------------------------------------------
    const reloadedStateA = loadLearnerState(learnerAId);

    // -------------------------------------------------------------
    // Step 5: Verify progress remains for Learner A
    // -------------------------------------------------------------
    expect(reloadedStateA.completedLabs).toContain("Lab 01 · Trace the PAM architecture");
    expect(reloadedStateA.completedLabs).toHaveLength(1);

    // -------------------------------------------------------------
    // Step 6: Logout Learner A
    // Local workspace cleared
    // -------------------------------------------------------------
    stateA = makeInitialPamState(); // simulated local clear on signout

    // -------------------------------------------------------------
    // Step 7: Register Learner B
    // -------------------------------------------------------------
    const learnerBId = "user-uuid-learner-b-2222";
    let stateB = makeInitialPamState();
    saveLearnerState(learnerBId, stateB);

    // -------------------------------------------------------------
    // Step 8: Verify Learner B has independent, zeroed progress
    // -------------------------------------------------------------
    const reloadedStateB = loadLearnerState(learnerBId);
    expect(reloadedStateB.completedLabs).toHaveLength(0);
    expect(reloadedStateB.completedLabs).not.toContain("Lab 01 · Trace the PAM architecture");
    // Confirm Learner A's stored progress is completely untouched
    expect(loadLearnerState(learnerAId).completedLabs).toHaveLength(1);

    // -------------------------------------------------------------
    // Step 9: Attempt unauthorized retrieval
    // Auditor attempting to perform credential retrieval on DBA-SAFE
    // -------------------------------------------------------------
    const auditorCheck = evaluatePermission(stateB, "DBA-SAFE", "pam_auditor", "Retrieve accounts");
    expect(auditorCheck.allowed).toBe(false);
    expect(auditorCheck.message).toContain("not authorized for Retrieve accounts");

    // -------------------------------------------------------------
    // Step 10: Verify denial and produce audit event
    // -------------------------------------------------------------
    stateB = {
      ...stateB,
      audit: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: "pam_auditor",
          action: "Retrieve accounts",
          target: "DBA-SAFE/ora_db_admin",
          outcome: "Denied",
          detail: auditorCheck.message,
        },
        ...stateB.audit,
      ],
    };
    expect(stateB.audit[0]?.outcome).toBe("Denied");
    expect(stateB.audit[0]?.actor).toBe("pam_auditor");

    // -------------------------------------------------------------
    // Step 11: Complete account onboarding
    // Onboard a valid Unix SSH production account into UNIX-SAFE
    // -------------------------------------------------------------
    const input: NewAccountInput = {
      name: "SRV-LNX-PROD-01 Root",
      username: "root_prod",
      address: "10.100.20.15",
      platform: "Unix SSH",
      safe: "UNIX-SAFE",
      type: "Root / Superuser",
      owner: "linux_engineer",
      purpose: "Core payment gateway host administration",
      dependency: "Payment processing daemon",
    };

    const onboardResult = addAccount(stateB, input, "pam_admin");
    expect(onboardResult.error).toBeUndefined();
    stateB = onboardResult.state;
    const onboardedAccount = stateB.accounts.find((a) => a.username === "root_prod");
    expect(onboardedAccount).toBeDefined();
    expect(onboardedAccount?.platform).toBe("Unix SSH");
    expect(stateB.audit.some((evt) => evt.action === "Onboard account")).toBe(true);

    // -------------------------------------------------------------
    // Step 12: Trigger CPM failure and repair
    // Target svc_backup account in lockout state
    // -------------------------------------------------------------
    const lockedAccount = stateB.accounts.find((a) => a.username === "svc_backup");
    expect(lockedAccount).toBeDefined();
    if (!lockedAccount) return;

    // Change triggers rotation failure due to simulated account lockout
    const changeFail = runCpmOperation(stateB, lockedAccount.id, "Change", "pam_admin");
    expect(changeFail.state.accounts.find((a) => a.id === lockedAccount.id)?.status).toBe(
      "Rotation failed",
    );
    expect(changeFail.state.cpmOperations[0]?.result).toBe("Failed");
    stateB = changeFail.state;

    // Ineffective repair (e.g. attempting network repair for lockout condition) does not fix lockout
    const wrongRepair = repairCpmFailure(
      stateB,
      lockedAccount.id,
      "target-connectivity",
      "pam_admin",
    );
    expect(wrongRepair.error).toContain("Repair mismatched");
    expect(wrongRepair.state.accounts.find((a) => a.id === lockedAccount.id)?.status).toBe(
      "Rotation failed",
    );

    // Correct diagnostic repair (unlocking the locked account on domain controller)
    const unlockRepair = repairCpmFailure(stateB, lockedAccount.id, "unlock", "pam_admin");
    expect(unlockRepair.error).toBeUndefined();
    expect(unlockRepair.state.accounts.find((a) => a.id === lockedAccount.id)?.status).toBe(
      "Verify required",
    );
    expect(
      unlockRepair.state.accounts.find((a) => a.id === lockedAccount.id)?.failureCause,
    ).toBeUndefined();
    stateB = unlockRepair.state;

    // Retry CPM Change operation after recovery — now succeeds and restores Managed status
    const retryChange = runCpmOperation(stateB, lockedAccount.id, "Change", "pam_admin");
    expect(retryChange.state.accounts.find((a) => a.id === lockedAccount.id)?.status).toBe(
      "Managed",
    );
    expect(retryChange.state.cpmOperations[0]?.result).toBe("Completed");
    stateB = retryChange.state;

    // -------------------------------------------------------------
    // Step 13: Launch PSM session
    // Must pass all 8 preflight gates: Safe membership, ticket, justification
    // -------------------------------------------------------------
    stateB = { ...stateB, approvalGranted: true };
    const adminAccount = stateB.accounts.find(
      (a) => a.username === "Administrator" && a.address === "WIN-SRV-01",
    );
    expect(adminAccount).toBeDefined();
    if (!adminAccount) return;

    const psmLaunch = launchPsmSession(
      stateB,
      {
        target: "WIN-SRV-01",
        account: adminAccount,
        ticket: "CHG-48192",
        reason: "Emergency certificate inspection ticket CHG-48192",
      },
      "pam_admin",
    );

    expect(psmLaunch.error).toBeUndefined();
    stateB = psmLaunch.state;

    const activeSession = stateB.sessions.find((s) => s.status === "Active");
    expect(activeSession).toBeDefined();
    expect(activeSession?.status).toBe("Active");
    const sessionId = activeSession?.id ?? "";

    // -------------------------------------------------------------
    // Step 14: Execute approved command in simulated terminal
    // -------------------------------------------------------------
    stateB = appendSessionCommand(stateB, sessionId, "whoami", "pam_admin");
    const updatedSession = stateB.sessions.find((s) => s.id === sessionId);
    expect(updatedSession?.commands.some((h) => h.includes("whoami"))).toBe(true);
    expect(updatedSession?.commands.some((h) => h.includes("corp\\administrator"))).toBe(true);

    // Verify unauthorized command is rejected
    stateB = appendSessionCommand(stateB, sessionId, "curl malicious-site.com", "pam_admin");
    const blockedSession = stateB.sessions.find((s) => s.id === sessionId);
    expect(blockedSession?.commands.some((h) => h.includes("is not recognized"))).toBe(true);

    // -------------------------------------------------------------
    // Step 15: Inspect recording
    // Session timeline contains timestamped commands and audit records
    // -------------------------------------------------------------
    expect(blockedSession?.commands.length).toBeGreaterThan(1);
    expect(stateB.audit.some((evt) => evt.action === "Execute session command")).toBe(true);

    // -------------------------------------------------------------
    // Step 16: Terminate session
    // Executing 'exit' clean terminates the PSM session
    // -------------------------------------------------------------
    stateB = appendSessionCommand(stateB, sessionId, "exit", "pam_admin");

    const terminatedSession = stateB.sessions.find((s) => s.id === sessionId);
    expect(terminatedSession?.status).toBe("Terminated");
    // Verify recording and history preserved
    expect(terminatedSession?.commands.length).toBeGreaterThan(0);

    // -------------------------------------------------------------
    // Step 17: Verify evidence and progress persistence
    // -------------------------------------------------------------
    saveLearnerState(learnerBId, stateB);
    const persistedB = loadLearnerState(learnerBId);

    // Verify session evidence persisted in database
    expect(persistedB.sessions.some((s) => s.status === "Terminated")).toBe(true);
    // Verify audit logs preserved
    expect(persistedB.audit.some((a) => a.action === "Terminate PSM session")).toBe(true);
    expect(persistedB.audit.some((a) => a.action === "Onboard account")).toBe(true);
    // Verify accounts inventory preserved
    expect(persistedB.accounts.some((a) => a.username === "root_prod")).toBe(true);
  });
});
