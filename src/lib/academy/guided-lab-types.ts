/**
 * SHADOWXLAB PAM ACADEMY — AI-GUIDED HANDS-ON LAB TYPE DEFINITIONS
 * Models the LabEx-style concept-by-concept learning loop:
 * INTRODUCE -> INSTRUCT -> STUDENT EXECUTION -> VERIFY -> FEEDBACK -> NEXT CONCEPT
 * followed by Independent Challenge Mode and a Practical Competency Report.
 */

import type { PracticalExercise } from "./types";

export type ConceptPhase =
  "instruct" | "verified" | "failed" | "independent_challenge" | "completed";

export type HintLevel = 0 | 1 | 2 | 3 | 4;

export interface ProgressiveHints {
  /** Level 1 — Concept: guiding question */
  level1Concept: string;
  /** Level 2 — Location: where to inspect in the simulator */
  level2Location: string;
  /** Level 3 — Procedure: detailed step instructions */
  level3Procedure: string;
  /** Level 4 — Solution: complete answer and explanation */
  level4Solution: string;
}

export interface GuidedConcept {
  id: string;
  order: number;
  title: string;
  /** STATE 1 — INTRODUCE */
  conceptIntro: string;
  importance: string;
  realWorldContext: string;
  objective: string;
  /** STATE 2 — INSTRUCT (single actionable task) */
  task: string;
  where: string;
  action: string;
  expectedResult: string;
  why: string;
  targetConsole: PracticalExercise["targetConsole"];
  /** Associated deterministic LabObjective IDs evaluated by pam-engine */
  objectiveIds: string[];
  /** Custom deterministic criterion evaluator key */
  validatorRule:
    | "lab01-topology"
    | "lab01-live-trace"
    | "lab02-safe-boundary"
    | "lab02-member-config"
    | "lab02-least-privilege"
    | "lab02-allowed-test"
    | "lab02-denied-test"
    | "lab03-account-platform"
    | "lab03-safe-owner"
    | "lab03-cpm-verify"
    | "lab04-classify"
    | "lab04-exceptions"
    | "lab04-discovery-action"
    | "lab05a-pre-verify"
    | "lab05a-change"
    | "lab05a-audit-managed"
    | "lab05b-inspect-failure"
    | "lab05b-unlock"
    | "lab05b-reconcile"
    | "lab05b-change"
    | "lab05b-verify"
    | "lab06a-approval"
    | "lab06a-launch"
    | "lab06a-commands"
    | "lab06a-terminate"
    | "lab06b-failure-signals"
    | "lab06b-restore-prereqs"
    | "lab06b-launch"
    | "generic-live-action";
  hints: ProgressiveHints;
  /** Shown when concept passes validation */
  successExplanation: string;
  successRealWorldRelevance: string;
  /** Used in competency report */
  skillTag: string;
}

export interface IndependentChallengeSpec {
  id: string;
  title: string;
  objective: string;
  initialEnvironment: string;
  enterpriseContext: string;
  requirements: string[];
  targetConsole: PracticalExercise["targetConsole"];
  validatorRule:
    | "ind-safes-new-safe"
    | "ind-cpm-verify-pending"
    | "ind-psm-second-session"
    | "ind-accounts-onboard"
    | "ind-discovery-onboard"
    | "ind-audit-live-proof";
  hints: ProgressiveHints;
}

export interface GuidedLabPlan {
  exerciseId: string;
  labId: string;
  title: string;
  whatYouWillAccomplish: string;
  whyItMatters: string;
  enterpriseScenario: string;
  targetSystemOrAccount: string;
  expectedEndResult: string;
  concepts: GuidedConcept[];
  independentChallenge: IndependentChallengeSpec;
  recommendedNextSkill: string;
}

export interface ValidationCriterionResult {
  id: string;
  label: string;
  passed: boolean;
  expected: string;
  observed: string;
  possibleReason?: string | undefined;
  diagnosticAction: string;
}

export interface ConceptValidationResult {
  conceptId: string;
  labId: string;
  passed: boolean;
  criteria: ValidationCriterionResult[];
  simulatorEvidence: string[];
  summary: string;
  evaluatedAt: string;
}

export interface SessionBaselineSnapshot {
  safeCount: number;
  safeNames: string[];
  accountCount: number;
  cpmOpCount: number;
  sessionCount: number;
  auditCount: number;
  discoveryJobCount: number;
  resolvedIncidentCount: number;
  capturedAt: string;
}

export type MentorMessageSource = "validator" | "scripted-curriculum" | "ai-gateway" | "learner";

export interface MentorMessage {
  id: string;
  role: "mentor" | "learner" | "validator";
  source: MentorMessageSource;
  conceptId: string;
  timestamp: string;
  title?: string | undefined;
  content: string;
  hintLevel?: HintLevel | undefined;
  validationSnapshot?:
    | {
        conceptId: string;
        passed: boolean;
        criteria: Array<{ id: string; passed: boolean }>;
      }
    | undefined;
}

export interface PracticalCompetencyReport {
  taskAccomplished: string;
  criteriaPassed: string[];
  criteriaTotal: number;
  mistakesEncountered: string[];
  hintLevelsUsed: Record<string, HintLevel>;
  highestHintLevel: HintLevel;
  operationsPerformed: string[];
  areasRequiringImprovement: string[];
  recommendedNextSkill: string;
  completedAt: string;
}

export interface GuidedLabSessionState {
  sessionId: string;
  exerciseId: string;
  lessonId: string;
  currentConceptIndex: number;
  currentConceptId: string;
  phase: ConceptPhase;
  completedConceptIds: string[];
  validationResults: Record<string, ConceptValidationResult>;
  attemptCounts: Record<string, number>;
  mistakesByConcept: Record<string, string[]>;
  hintLevelsRequested: Record<string, HintLevel>;
  independentChallengeStatus: "locked" | "active" | "failed" | "passed";
  independentValidation?: ConceptValidationResult | undefined;
  independentAttempts: number;
  independentMistakes: string[];
  independentHintLevel: HintLevel;
  labCompleted: boolean;
  competencyReport?: PracticalCompetencyReport | undefined;
  baseline: SessionBaselineSnapshot;
  messages: MentorMessage[];
  updatedAt: string;
}

export type AiProviderMode = "unavailable" | "gateway-connected";

export interface AiProviderStatus {
  mode: AiProviderMode;
  label: string;
  disclosure: string;
  setupInstructions: string;
}

export type MentorIntent =
  | "welcome"
  | "why"
  | "explain_step"
  | "where"
  | "expected"
  | "stuck"
  | "error_meaning"
  | "hint"
  | "beginner"
  | "cyberark_real_world"
  | "try_myself"
  | "diagnose"
  | "validation_feedback"
  | "freeform";

export interface MentorContext {
  trackTitle: string;
  moduleTitle: string;
  lessonNumber: string;
  lessonTitle: string;
  exerciseTitle: string;
  plan: GuidedLabPlan;
  activeConcept: GuidedConcept | null;
  isIndependentChallenge: boolean;
  validationResult: ConceptValidationResult | null;
  attemptCount: number;
  hintLevel: HintLevel;
  completedConceptIds: string[];
  previousMistakes: string[];
  lessonFailureScenarios: Array<{
    symptom: string;
    rootCause: string;
    cyberArkCodeOrEvent?: string | undefined;
  }>;
  lessonInstructorNotes: string[];
  conversationHistory: MentorMessage[];
}

export interface MentorResponse {
  source: "scripted-curriculum" | "ai-gateway";
  title: string;
  content: string;
  hintLevel?: HintLevel | undefined;
  aiUnavailableNotice?: string | undefined;
}
