/**
 * SHADOWXLAB PAM ACADEMY — GUIDED LAB SESSION PERSISTENCE
 * Persists concept-level guided lab state per exercise in localStorage.
 * Scoped reset clears ONLY the active practical session without erasing
 * unrelated Academy progress, checkpoints, or other lessons.
 */

import type { PamState } from "@/lib/pam-engine";
import { captureSessionBaseline } from "./guided-lab-engine";
import type { GuidedLabPlan, GuidedLabSessionState, MentorMessage } from "./guided-lab-types";

const GUIDED_LAB_STORAGE_KEY = "shadowxlab_pam_guided_lab_sessions_v1";

function makeSessionId(exerciseId: string): string {
  return `gls-${exerciseId}-${Date.now().toString(36)}`;
}

export function createInitialGuidedLabSession(
  plan: GuidedLabPlan,
  lessonId: string,
  state: PamState,
): GuidedLabSessionState {
  const firstConcept = plan.concepts[0]!;
  const now = new Date().toISOString();

  const introMessage: MentorMessage = {
    id: `msg-welcome-${Date.now()}`,
    role: "mentor",
    source: "scripted-curriculum",
    conceptId: firstConcept.id,
    timestamp: now,
    title: `Guided Lab Session Started · Concept 1 of ${plan.concepts.length}`,
    content: [
      `Welcome to your instructor-led practical: **${plan.title}**.`,
      `Target: ${plan.targetSystemOrAccount}.`,
      `We will work through ${plan.concepts.length} concepts one at a time, followed by an Independent Challenge. Let's begin with Concept 1: **${firstConcept.title}**.`,
      `Review the Task on the left, perform the action in the simulator, then click **Check My Work** so I can inspect the live simulator state.`,
    ].join("\n\n"),
  };

  return {
    sessionId: makeSessionId(plan.exerciseId),
    exerciseId: plan.exerciseId,
    lessonId,
    currentConceptIndex: 0,
    currentConceptId: firstConcept.id,
    phase: "instruct",
    completedConceptIds: [],
    validationResults: {},
    attemptCounts: {},
    mistakesByConcept: {},
    hintLevelsRequested: {},
    independentChallengeStatus: "locked",
    independentAttempts: 0,
    independentMistakes: [],
    independentHintLevel: 0,
    labCompleted: false,
    baseline: captureSessionBaseline(state),
    messages: [introMessage],
    updatedAt: now,
  };
}

function loadAllSessionsMap(): Record<string, GuidedLabSessionState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(GUIDED_LAB_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, GuidedLabSessionState>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveAllSessionsMap(map: Record<string, GuidedLabSessionState>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUIDED_LAB_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.error("Failed to save guided lab session state:", err);
  }
}

export function loadGuidedLabSession(
  plan: GuidedLabPlan,
  lessonId: string,
  state: PamState,
): GuidedLabSessionState {
  const map = loadAllSessionsMap();
  const existing = map[plan.exerciseId];
  if (
    existing &&
    existing.exerciseId === plan.exerciseId &&
    typeof existing.currentConceptIndex === "number" &&
    Array.isArray(existing.completedConceptIds) &&
    existing.baseline
  ) {
    // Ensure concept index stays valid if curriculum changed
    const safeIdx = Math.min(Math.max(0, existing.currentConceptIndex), plan.concepts.length - 1);
    return {
      ...existing,
      currentConceptIndex: safeIdx,
      currentConceptId:
        existing.phase === "independent_challenge" || existing.phase === "completed"
          ? plan.independentChallenge.id
          : plan.concepts[safeIdx]!.id,
      messages: Array.isArray(existing.messages) ? existing.messages : [],
      mistakesByConcept: existing.mistakesByConcept || {},
      independentMistakes: Array.isArray(existing.independentMistakes)
        ? existing.independentMistakes
        : [],
    };
  }

  const fresh = createInitialGuidedLabSession(plan, lessonId, state);
  saveGuidedLabSession(fresh);
  return fresh;
}

export function saveGuidedLabSession(session: GuidedLabSessionState): void {
  const map = loadAllSessionsMap();
  map[session.exerciseId] = {
    ...session,
    updatedAt: new Date().toISOString(),
  };
  saveAllSessionsMap(map);
}

/**
 * Resets ONLY the specified practical exercise session.
 * Never erases unrelated Academy progress, checkpoints, or other lab sessions.
 */
export function resetGuidedLabSession(
  plan: GuidedLabPlan,
  lessonId: string,
  state: PamState,
): GuidedLabSessionState {
  const map = loadAllSessionsMap();
  delete map[plan.exerciseId];
  saveAllSessionsMap(map);
  const fresh = createInitialGuidedLabSession(plan, lessonId, state);
  saveGuidedLabSession(fresh);
  return fresh;
}

export function clearAllGuidedLabSessions(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUIDED_LAB_STORAGE_KEY);
}
