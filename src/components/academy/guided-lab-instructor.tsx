/**
 * SHADOWXLAB PAM ACADEMY — AI-GUIDED HANDS-ON LAB INSTRUCTOR (LABEX-STYLE LOOP)
 *
 * Implements the concept-by-concept practical learning workflow:
 * INTRODUCE -> INSTRUCT -> STUDENT EXECUTION -> VERIFY -> FEEDBACK -> NEXT CONCEPT
 * followed by Independent Challenge Mode and a Practical Competency Report.
 *
 * Architecture invariant:
 * SIMULATOR -> DETERMINISTIC VALIDATOR -> VALIDATION RESULT -> AI MENTOR -> CONTEXTUAL FEEDBACK
 * The deterministic validator is the sole authority; AI and UI clicks cannot bypass verification.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Compass,
  HelpCircle,
  Info,
  Laptop,
  Lightbulb,
  Lock,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  Terminal,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import type { PamState } from "@/lib/pam-engine";
import type { Lesson, PracticalExercise } from "@/lib/academy/types";
import {
  buildGuidedLabPlan,
  canAdvanceFromConcept,
  evaluateConceptValidation,
  evaluateIndependentChallenge,
  generateCompetencyReport,
} from "@/lib/academy/guided-lab-engine";
import {
  loadGuidedLabSession,
  resetGuidedLabSession,
  saveGuidedLabSession,
} from "@/lib/academy/guided-lab-storage";
import {
  classifyLearnerQuestion,
  getAiProviderStatus,
  getHintTextForLevel,
  HINT_LEVEL_LABELS,
  requestMentorGuidance,
} from "@/lib/academy/mentor-service";
import type {
  ConceptValidationResult,
  GuidedLabSessionState,
  HintLevel,
  MentorContext,
  MentorIntent,
  MentorMessage,
} from "@/lib/academy/guided-lab-types";

export interface GuidedLabInstructorProps {
  lesson: Lesson;
  exercise: PracticalExercise;
  state: PamState;
  trackTitle?: string | undefined;
  moduleTitle?: string | undefined;
  isCompleted: boolean;
  isIndependentCompleted?: boolean | undefined;
  onRecordExerciseComplete: (exerciseId: string) => void;
  onRecordIndependentComplete?: ((exerciseId: string) => void) | undefined;
  onJumpConsole?: ((section: PracticalExercise["targetConsole"]) => void) | undefined;
}

const QUICK_MENTOR_QUESTIONS: Array<{ label: string; question: string; intent: MentorIntent }> = [
  { label: "Why am I doing this?", question: "Why am I doing this?", intent: "why" },
  { label: "Explain this step", question: "Explain the current step.", intent: "explain_step" },
  { label: "Where do I go?", question: "Where do I go?", intent: "where" },
  { label: "What should I see?", question: "What should I see?", intent: "expected" },
  { label: "I am stuck", question: "I am stuck.", intent: "stuck" },
  {
    label: "What does this error mean?",
    question: "What does this error mean?",
    intent: "error_meaning",
  },
  { label: "Give me a small hint", question: "Give me a small hint.", intent: "hint" },
  {
    label: "Explain like a beginner",
    question: "Explain this like I am a beginner.",
    intent: "beginner",
  },
  {
    label: "Real CyberArk?",
    question: "How is this done in a real CyberArk environment?",
    intent: "cyberark_real_world",
  },
  { label: "Try it myself", question: "I want to try it myself.", intent: "try_myself" },
];

function makeMessageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const GuidedLabInstructor: React.FC<GuidedLabInstructorProps> = ({
  lesson,
  exercise,
  state,
  trackTitle = "PAM Administrator Track",
  moduleTitle,
  isCompleted,
  onRecordExerciseComplete,
  onRecordIndependentComplete,
  onJumpConsole,
}) => {
  const plan = useMemo(() => buildGuidedLabPlan(lesson, exercise), [lesson, exercise]);
  const aiStatus = useMemo(() => getAiProviderStatus(), []);

  const [session, setSession] = useState<GuidedLabSessionState>(() =>
    loadGuidedLabSession(plan, lesson.id, state),
  );
  const [questionInput, setQuestionInput] = useState("");
  const [mentorBusy, setMentorBusy] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [showAiSetup, setShowAiSetup] = useState(false);
  const [guidedAuditFloor, setGuidedAuditFloor] = useState<number>(state.audit.length);

  const mentorInputRef = useRef<HTMLInputElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Reload session whenever exercise changes
  useEffect(() => {
    const loaded = loadGuidedLabSession(plan, lesson.id, state);
    setSession(loaded);
    setShowBriefing(loaded.currentConceptIndex === 0 && !loaded.labCompleted);
    setGuidedAuditFloor(state.audit.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.exerciseId, lesson.id]);

  // Auto-scroll mentor panel when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [session.messages.length]);

  const isIndependentMode =
    session.phase === "independent_challenge" ||
    session.independentChallengeStatus === "active" ||
    session.independentChallengeStatus === "failed";
  const isLabCompleted = session.labCompleted || session.phase === "completed";
  const activeConcept =
    !isIndependentMode && !isLabCompleted
      ? plan.concepts[session.currentConceptIndex] || plan.concepts[0]!
      : null;

  const activeValidation: ConceptValidationResult | null = isIndependentMode
    ? session.independentValidation || null
    : activeConcept
      ? session.validationResults[activeConcept.id] || null
      : null;

  const activeHintLevel: HintLevel = isIndependentMode
    ? session.independentHintLevel
    : activeConcept
      ? session.hintLevelsRequested[activeConcept.id] || 0
      : 0;

  const activeAttempts = isIndependentMode
    ? session.independentAttempts
    : activeConcept
      ? session.attemptCounts[activeConcept.id] || 0
      : 0;

  const canAdvance = Boolean(activeConcept && canAdvanceFromConcept(session, activeConcept.id));
  const isFinalGuidedConcept = session.currentConceptIndex >= plan.concepts.length - 1;

  function persistSession(next: GuidedLabSessionState) {
    setSession(next);
    saveGuidedLabSession(next);
  }

  function buildMentorContext(
    currentSession: GuidedLabSessionState,
    overrideValidation?: ConceptValidationResult | null,
    overrideHintLevel?: HintLevel,
  ): MentorContext {
    const inInd =
      currentSession.phase === "independent_challenge" ||
      currentSession.independentChallengeStatus === "active" ||
      currentSession.independentChallengeStatus === "failed";
    const concept = inInd
      ? null
      : plan.concepts[currentSession.currentConceptIndex] || plan.concepts[0] || null;
    const conceptId = inInd ? plan.independentChallenge.id : concept?.id || plan.exerciseId;
    const val =
      overrideValidation !== undefined
        ? overrideValidation
        : inInd
          ? currentSession.independentValidation || null
          : currentSession.validationResults[conceptId] || null;
    const hintLvl =
      overrideHintLevel !== undefined
        ? overrideHintLevel
        : inInd
          ? currentSession.independentHintLevel
          : currentSession.hintLevelsRequested[conceptId] || 0;

    return {
      trackTitle,
      moduleTitle: moduleTitle || `Lesson ${lesson.number}: ${lesson.title}`,
      lessonNumber: lesson.number,
      lessonTitle: lesson.title,
      exerciseTitle: exercise.title,
      plan,
      activeConcept: concept,
      isIndependentChallenge: inInd,
      validationResult: val,
      attemptCount: inInd
        ? currentSession.independentAttempts
        : currentSession.attemptCounts[conceptId] || 0,
      hintLevel: hintLvl,
      completedConceptIds: currentSession.completedConceptIds,
      previousMistakes: inInd
        ? currentSession.independentMistakes
        : currentSession.mistakesByConcept[conceptId] || [],
      lessonFailureScenarios: lesson.failureScenarios.map((f) => ({
        symptom: f.symptom,
        rootCause: f.rootCause,
        cyberArkCodeOrEvent: f.cyberArkCodeOrEvent,
      })),
      lessonInstructorNotes: lesson.instructorNotes || [],
      conversationHistory: currentSession.messages,
    };
  }

  /**
   * STATE 4 -> STATE 5: Deterministic Check My Work
   * Validator inspects live PamState; mentor explains the immutable validation result.
   */
  async function handleCheckWork() {
    if (isLabCompleted) return;

    if (isIndependentMode) {
      const result = evaluateIndependentChallenge(
        plan,
        state,
        exercise,
        session.baseline,
        guidedAuditFloor,
      );
      const nextAttempts = session.independentAttempts + 1;
      const failedLabels = result.criteria.filter((c) => !c.passed).map((c) => c.label);
      const nextMistakes = result.passed
        ? session.independentMistakes
        : [...session.independentMistakes, ...failedLabels];

      const validatorMsg: MentorMessage = {
        id: makeMessageId("val"),
        role: "validator",
        source: "validator",
        conceptId: plan.independentChallenge.id,
        timestamp: result.evaluatedAt,
        title: result.passed
          ? "Validator: Independent Challenge Passed ✓"
          : `Validator: Not Yet Verified (Attempt #${nextAttempts})`,
        content: result.summary,
        validationSnapshot: {
          conceptId: result.conceptId,
          passed: result.passed,
          criteria: result.criteria.map((c) => ({ id: c.id, passed: c.passed })),
        },
      };

      const prelimSession: GuidedLabSessionState = {
        ...session,
        independentValidation: result,
        independentAttempts: nextAttempts,
        independentMistakes: nextMistakes,
        independentChallengeStatus: result.passed ? "passed" : "failed",
        phase: result.passed ? "completed" : "independent_challenge",
        labCompleted: result.passed,
        messages: [...session.messages, validatorMsg],
      };

      const competencyReport = result.passed
        ? generateCompetencyReport(plan, prelimSession, state)
        : undefined;

      setMentorBusy(true);
      const mentorResp = await requestMentorGuidance(
        buildMentorContext(prelimSession, result),
        "validation_feedback",
      );
      setMentorBusy(false);

      const mentorMsg: MentorMessage = {
        id: makeMessageId("mentor"),
        role: "mentor",
        source: mentorResp.source,
        conceptId: plan.independentChallenge.id,
        timestamp: new Date().toISOString(),
        title: mentorResp.title,
        content: mentorResp.content,
      };

      const finalSession: GuidedLabSessionState = {
        ...prelimSession,
        competencyReport,
        messages: [...prelimSession.messages, mentorMsg],
      };

      persistSession(finalSession);

      if (result.passed) {
        onRecordExerciseComplete(exercise.id);
        onRecordIndependentComplete?.(exercise.id);
        toast.success(`Independent Challenge verified! Competency report generated.`);
      } else {
        toast.error(`Independent Challenge not yet verified. Inspect the validator findings.`);
      }
      return;
    }

    if (!activeConcept) return;

    // Evaluate live simulator state deterministically
    const result = evaluateConceptValidation(activeConcept, state, exercise, session.baseline);
    const prevAttempts = session.attemptCounts[activeConcept.id] || 0;
    const nextAttempts = prevAttempts + 1;
    const failedLabels = result.criteria.filter((c) => !c.passed).map((c) => c.label);
    const nextCompletedIds = result.passed
      ? Array.from(new Set([...session.completedConceptIds, activeConcept.id]))
      : session.completedConceptIds;

    const validatorMsg: MentorMessage = {
      id: makeMessageId("val"),
      role: "validator",
      source: "validator",
      conceptId: activeConcept.id,
      timestamp: result.evaluatedAt,
      title: result.passed
        ? `Validator: Concept ${activeConcept.order} Passed ✓`
        : `Validator: Not Yet Verified (Attempt #${nextAttempts})`,
      content: result.summary,
      validationSnapshot: {
        conceptId: result.conceptId,
        passed: result.passed,
        criteria: result.criteria.map((c) => ({ id: c.id, passed: c.passed })),
      },
    };

    const updatedSession: GuidedLabSessionState = {
      ...session,
      phase: result.passed ? "verified" : "failed",
      completedConceptIds: nextCompletedIds,
      validationResults: {
        ...session.validationResults,
        [activeConcept.id]: result,
      },
      attemptCounts: {
        ...session.attemptCounts,
        [activeConcept.id]: nextAttempts,
      },
      mistakesByConcept: result.passed
        ? session.mistakesByConcept
        : {
            ...session.mistakesByConcept,
            [activeConcept.id]: [
              ...(session.mistakesByConcept[activeConcept.id] || []),
              ...failedLabels,
            ],
          },
      messages: [...session.messages, validatorMsg],
    };

    setMentorBusy(true);
    const mentorResp = await requestMentorGuidance(
      buildMentorContext(updatedSession, result),
      "validation_feedback",
    );
    setMentorBusy(false);

    const mentorMsg: MentorMessage = {
      id: makeMessageId("mentor"),
      role: "mentor",
      source: mentorResp.source,
      conceptId: activeConcept.id,
      timestamp: new Date().toISOString(),
      title: mentorResp.title,
      content: mentorResp.content,
    };

    const finalSession: GuidedLabSessionState = {
      ...updatedSession,
      messages: [...updatedSession.messages, mentorMsg],
    };

    persistSession(finalSession);

    if (result.passed) {
      // If all guided concepts are now verified, record guided exercise completion
      if (plan.concepts.every((c) => nextCompletedIds.includes(c.id))) {
        onRecordExerciseComplete(exercise.id);
      }
      toast.success(`Concept ${activeConcept.order} verified against live simulator state!`);
    } else {
      toast.error(
        `Concept ${activeConcept.order} not yet verified. Review observed simulator state.`,
      );
    }
  }

  /**
   * STATE 6 — NEXT CONCEPT (strictly locked behind deterministic validation)
   */
  function handleNextConcept() {
    if (!activeConcept || !canAdvanceFromConcept(session, activeConcept.id)) {
      return;
    }

    if (isFinalGuidedConcept) {
      // Transition into Independent Challenge Mode
      setGuidedAuditFloor(state.audit.length);
      const introChallengeMsg: MentorMessage = {
        id: makeMessageId("mentor"),
        role: "mentor",
        source: "scripted-curriculum",
        conceptId: plan.independentChallenge.id,
        timestamp: new Date().toISOString(),
        title: `Independent Challenge Unlocked — ${plan.independentChallenge.title}`,
        content: [
          `Excellent work completing all ${plan.concepts.length} guided concepts!`,
          `Now it is your turn to operate independently without step-by-step instructions.`,
          `**Objective:** ${plan.independentChallenge.objective}`,
          `Perform the work in the live simulator console and click **Check Independent Challenge** when ready. I remain available if you request help.`,
        ].join("\n\n"),
      };

      persistSession({
        ...session,
        currentConceptId: plan.independentChallenge.id,
        phase: "independent_challenge",
        independentChallengeStatus: "active",
        messages: [...session.messages, introChallengeMsg],
      });
      setShowBriefing(false);
      return;
    }

    const nextIdx = session.currentConceptIndex + 1;
    const nextConcept = plan.concepts[nextIdx]!;
    const introMsg: MentorMessage = {
      id: makeMessageId("mentor"),
      role: "mentor",
      source: "scripted-curriculum",
      conceptId: nextConcept.id,
      timestamp: new Date().toISOString(),
      title: `Concept ${nextConcept.order} of ${plan.concepts.length}: ${nextConcept.title}`,
      content: [
        `${nextConcept.conceptIntro}`,
        `**Your Task:** ${nextConcept.task}`,
        `**Where:** ${nextConcept.where}`,
        `Complete this operation in the simulator, then click **Check My Work**.`,
      ].join("\n\n"),
    };

    persistSession({
      ...session,
      currentConceptIndex: nextIdx,
      currentConceptId: nextConcept.id,
      phase: "instruct",
      messages: [...session.messages, introMsg],
    });
    setShowBriefing(false);
  }

  /**
   * Progressive 4-Level Hints (non-punitive; never skips directly to Solution)
   */
  async function handleRequestHint(explicitLevel?: Exclude<HintLevel, 0>) {
    const currentLvl = activeHintLevel;
    const nextLvl: Exclude<HintLevel, 0> =
      explicitLevel ?? (Math.min(4, currentLvl + 1) as Exclude<HintLevel, 0>);
    const targetId = isIndependentMode
      ? plan.independentChallenge.id
      : activeConcept?.id || plan.exerciseId;

    const learnerMsg: MentorMessage = {
      id: makeMessageId("learner"),
      role: "learner",
      source: "learner",
      conceptId: targetId,
      timestamp: new Date().toISOString(),
      content: `Requesting ${HINT_LEVEL_LABELS[nextLvl]}`,
    };

    const nextSessionBase: GuidedLabSessionState = isIndependentMode
      ? {
          ...session,
          independentHintLevel: Math.max(session.independentHintLevel, nextLvl) as HintLevel,
          messages: [...session.messages, learnerMsg],
        }
      : {
          ...session,
          hintLevelsRequested: {
            ...session.hintLevelsRequested,
            [targetId]: Math.max(currentLvl, nextLvl) as HintLevel,
          },
          messages: [...session.messages, learnerMsg],
        };

    setMentorBusy(true);
    const resp = await requestMentorGuidance(
      buildMentorContext(nextSessionBase, undefined, nextLvl),
      "hint",
      undefined,
      nextLvl,
    );
    setMentorBusy(false);

    const mentorMsg: MentorMessage = {
      id: makeMessageId("mentor"),
      role: "mentor",
      source: resp.source,
      conceptId: targetId,
      timestamp: new Date().toISOString(),
      title: resp.title,
      content: resp.content,
      hintLevel: nextLvl,
    };

    persistSession({
      ...nextSessionBase,
      messages: [...nextSessionBase.messages, mentorMsg],
    });
  }

  /**
   * Ask Mentor (Quick Question or Free-Text Input) — retains conversation context!
   */
  async function handleAskMentor(question: string, explicitIntent?: MentorIntent) {
    const trimmed = question.trim();
    if (!trimmed) return;

    const intent = explicitIntent || classifyLearnerQuestion(trimmed);
    if (intent === "hint") {
      await handleRequestHint();
      setQuestionInput("");
      return;
    }

    const targetId = isIndependentMode
      ? plan.independentChallenge.id
      : activeConcept?.id || plan.exerciseId;

    const learnerMsg: MentorMessage = {
      id: makeMessageId("learner"),
      role: "learner",
      source: "learner",
      conceptId: targetId,
      timestamp: new Date().toISOString(),
      content: trimmed,
    };

    const withLearnerMsg: GuidedLabSessionState = {
      ...session,
      messages: [...session.messages, learnerMsg],
    };

    setQuestionInput("");
    setMentorBusy(true);
    const resp = await requestMentorGuidance(buildMentorContext(withLearnerMsg), intent, trimmed);
    setMentorBusy(false);

    const mentorMsg: MentorMessage = {
      id: makeMessageId("mentor"),
      role: "mentor",
      source: resp.source,
      conceptId: targetId,
      timestamp: new Date().toISOString(),
      title: resp.title,
      content: resp.content,
    };

    persistSession({
      ...withLearnerMsg,
      messages: [...withLearnerMsg.messages, mentorMsg],
    });
  }

  /**
   * Explicit Scoped Reset — resets ONLY the current practical session,
   * never erasing unrelated Academy progress or checkpoints.
   */
  function handleResetCurrentSession() {
    const fresh = resetGuidedLabSession(plan, lesson.id, state);
    setSession(fresh);
    setShowBriefing(true);
    setGuidedAuditFloor(state.audit.length);
    toast.info(
      `Guided lab session reset for "${exercise.title}". Other Academy progress preserved.`,
    );
  }

  const activeHints = isIndependentMode
    ? plan.independentChallenge.hints
    : activeConcept?.hints || null;
  const activeConsole = isIndependentMode
    ? plan.independentChallenge.targetConsole
    : activeConcept?.targetConsole || exercise.targetConsole;

  return (
    <div
      id="practical-lab-workbench"
      className="guided-lab-shell"
      data-testid="guided-lab-instructor"
    >
      {/* Top Session Banner */}
      <div className="guided-lab-banner">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="guided-lab-banner-icon">
            <Terminal size={18} />
          </div>
          <div>
            <span className="guided-lab-eyebrow">
              Guided Lab Session · Concept-by-Concept Instructor
            </span>
            <h3 className="guided-lab-title">{plan.title}</h3>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="guided-lab-pill guided-lab-pill-dark">
            {isLabCompleted
              ? "LAB COMPLETED ✓"
              : isIndependentMode
                ? "INDEPENDENT CHALLENGE"
                : `CONCEPT ${session.currentConceptIndex + 1} OF ${plan.concepts.length}`}
          </span>
          <span
            className="guided-lab-pill"
            style={{
              background: isLabCompleted || isCompleted ? "#137333" : "#0078D4",
              color: "#FFFFFF",
              border: "none",
            }}
          >
            {session.completedConceptIds.length}/{plan.concepts.length} CONCEPTS VERIFIED
          </span>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
            style={{
              fontSize: 11,
              background: "rgba(255,255,255,0.12)",
              color: "#FFFFFF",
              borderColor: "rgba(255,255,255,0.28)",
            }}
            onClick={handleResetCurrentSession}
            title="Reset only this guided lab session without affecting other Academy progress"
          >
            <RotateCcw size={12} />
            Reset Lab Session
          </button>
        </div>
      </div>

      {/* Concept Progress Rail — strictly conceals future concept instructions/titles */}
      <div className="guided-lab-stepper" role="list" aria-label="Guided lab concept progression">
        {plan.concepts.map((c, idx) => {
          const done = session.completedConceptIds.includes(c.id);
          const isCurrent =
            !isIndependentMode && !isLabCompleted && idx === session.currentConceptIndex;
          const isLocked = !done && !isCurrent;
          return (
            <div
              key={c.id}
              role="listitem"
              className={`guided-lab-step-chip ${done ? "done" : isCurrent ? "active" : "locked"}`}
            >
              {done ? (
                <CheckCircle2 size={13} />
              ) : isLocked ? (
                <Lock size={12} />
              ) : (
                <span className="guided-lab-step-dot" />
              )}
              <span>
                {isLocked ? `Concept ${c.order} (Locked)` : `Concept ${c.order}: ${c.title}`}
              </span>
            </div>
          );
        })}
        <div
          role="listitem"
          className={`guided-lab-step-chip ${
            isLabCompleted ? "done" : isIndependentMode ? "active" : "locked"
          }`}
        >
          {isLabCompleted ? (
            <Award size={13} />
          ) : isIndependentMode ? (
            <Compass size={13} />
          ) : (
            <Lock size={12} />
          )}
          <span>
            {isIndependentMode || isLabCompleted
              ? "Independent Challenge"
              : "Independent Challenge (Locked)"}
          </span>
        </div>
      </div>

      {/* Session Briefing (What / Why / Scenario / Target / End Result) */}
      <div className="guided-lab-briefing">
        <button
          type="button"
          className="guided-lab-briefing-toggle"
          onClick={() => setShowBriefing((prev) => !prev)}
          aria-expanded={showBriefing}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
            <ShieldCheck size={14} className="text-[#0078D4]" />
            Session Mission Brief · Target: {plan.targetSystemOrAccount}
          </span>
          {showBriefing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showBriefing && (
          <div className="guided-lab-briefing-grid">
            <div>
              <strong>What You Will Accomplish</strong>
              <p>{plan.whatYouWillAccomplish}</p>
            </div>
            <div>
              <strong>Why It Matters</strong>
              <p>{plan.whyItMatters}</p>
            </div>
            <div>
              <strong>Enterprise Scenario</strong>
              <p>{plan.enterpriseScenario}</p>
            </div>
            <div>
              <strong>Expected End Result</strong>
              <p>{plan.expectedEndResult}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Guided Lab Layout */}
      <div className="guided-lab-workspace">
        {/* LEFT / MAIN AREA: Active Concept / Independent Challenge / Competency Report */}
        <div className="guided-lab-main">
          {/* CASE A: LAB COMPLETED -> PRACTICAL COMPETENCY REPORT */}
          {isLabCompleted && session.competencyReport ? (
            <div
              className="guided-lab-card guided-lab-card-success"
              data-testid="competency-report"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Award size={20} className="text-[#15803D]" />
                  <div>
                    <span className="guided-lab-section-eyebrow" style={{ color: "#15803D" }}>
                      Practical Competency Report
                    </span>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#14532D" }}>
                      {session.competencyReport.taskAccomplished}
                    </h4>
                  </div>
                </div>
                <span
                  className="pvwa-status-pill managed"
                  style={{ background: "#16A34A", color: "#FFFFFF", border: "none" }}
                >
                  COMPETENCY VERIFIED ✓
                </span>
              </div>

              <div className="guided-lab-report-grid">
                <div className="guided-lab-report-block">
                  <strong>
                    Criteria Passed ({session.competencyReport.criteriaPassed.length}/
                    {session.competencyReport.criteriaTotal})
                  </strong>
                  <ul>
                    {session.competencyReport.criteriaPassed.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="guided-lab-report-block">
                  <strong>Operations Successfully Performed</strong>
                  <ul>
                    {session.competencyReport.operationsPerformed.map((op, i) => (
                      <li key={i}>{op}</li>
                    ))}
                  </ul>
                </div>

                <div className="guided-lab-report-block">
                  <strong>Mistakes Encountered</strong>
                  {session.competencyReport.mistakesEncountered.length === 0 ? (
                    <p style={{ margin: "4px 0 0 0", color: "#15803D" }}>
                      None — passed every verification check on the first attempt.
                    </p>
                  ) : (
                    <ul>
                      {session.competencyReport.mistakesEncountered.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="guided-lab-report-block">
                  <strong>Hint Levels Used (Informational · Non-Punitive)</strong>
                  <ul>
                    {Object.entries(session.competencyReport.hintLevelsUsed).map(([name, lvl]) => (
                      <li key={name}>
                        {name}: {lvl === 0 ? "No hints needed" : `Level ${lvl}/4`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="guided-lab-report-footer">
                <div>
                  <strong>Areas Requiring Improvement:</strong>
                  <ul style={{ margin: "4px 0 8px 0", paddingLeft: 18 }}>
                    {session.competencyReport.areasRequiringImprovement.map((area, i) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ paddingTop: 6, borderTop: "1px solid #BBF7D0" }}>
                  <strong>Recommended Next Skill: </strong>
                  <span>{session.competencyReport.recommendedNextSkill}</span>
                </div>
              </div>
            </div>
          ) : isIndependentMode ? (
            /* CASE B: INDEPENDENT CHALLENGE MODE (NO STEP-BY-STEP INSTRUCTIONS) */
            <div className="guided-lab-card" data-testid="independent-challenge-panel">
              <div className="guided-lab-concept-head">
                <div>
                  <span className="guided-lab-section-eyebrow" style={{ color: "#203142" }}>
                    Independent Challenge Mode · No Step-by-Step Prompts
                  </span>
                  <h4 className="guided-lab-concept-title">{plan.independentChallenge.title}</h4>
                </div>
                <span
                  className="guided-lab-pill"
                  style={{ background: "#E2E8F0", color: "#1E293B" }}
                >
                  ATTEMPTS: {session.independentAttempts}
                </span>
              </div>

              <div className="guided-lab-intro-box">
                <p>
                  <strong>Objective:</strong> {plan.independentChallenge.objective}
                </p>
                <p>
                  <strong>Initial Environment:</strong>{" "}
                  {plan.independentChallenge.initialEnvironment}
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>Enterprise Context:</strong> {plan.independentChallenge.enterpriseContext}
                </p>
              </div>

              <div className="guided-lab-task-box">
                <strong className="guided-lab-task-label">
                  REQUIREMENTS (PERFORM INDEPENDENTLY)
                </strong>
                <ul
                  style={{
                    margin: "6px 0 0 0",
                    paddingLeft: 18,
                    fontSize: 12,
                    color: "#1E293B",
                    lineHeight: 1.55,
                  }}
                >
                  {plan.independentChallenge.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="guided-lab-action-row">
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary"
                  onClick={() => onJumpConsole?.(activeConsole)}
                >
                  <Laptop size={14} />
                  Open {activeConsole.toUpperCase()} Console
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-primary"
                  onClick={handleCheckWork}
                  disabled={mentorBusy}
                >
                  <ClipboardCheck size={14} />
                  Check My Work (Validate Challenge)
                </button>
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary"
                  onClick={() => handleRequestHint()}
                  disabled={mentorBusy}
                >
                  <Lightbulb size={14} />
                  {activeHintLevel === 0
                    ? "Hint"
                    : activeHintLevel < 4
                      ? `Next Hint (${activeHintLevel}/4)`
                      : "View Solution (4/4)"}
                </button>
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary"
                  onClick={() => mentorInputRef.current?.focus()}
                >
                  <MessageSquare size={14} />
                  Ask Mentor
                </button>
              </div>
            </div>
          ) : activeConcept ? (
            /* CASE C: ACTIVE GUIDED CONCEPT (ONLY THIS CONCEPT IS EXPOSED) */
            <div className="guided-lab-card" data-testid="active-concept-panel">
              <div className="guided-lab-concept-head">
                <div>
                  <span className="guided-lab-section-eyebrow">
                    Concept {activeConcept.order} of {plan.concepts.length} · Active Step
                  </span>
                  <h4 className="guided-lab-concept-title">{activeConcept.title}</h4>
                </div>
                <span
                  className="guided-lab-pill"
                  style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                >
                  CONSOLE: {activeConcept.targetConsole.toUpperCase()}
                </span>
              </div>

              {/* STATE 1 — INTRODUCE */}
              <div className="guided-lab-intro-box">
                <span className="guided-lab-sublabel">1. Concept &amp; Operational Context</span>
                <p>{activeConcept.conceptIntro}</p>
                <p>
                  <strong>Why It Matters:</strong> {activeConcept.importance}
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>Real-World Context:</strong> {activeConcept.realWorldContext}
                </p>
              </div>

              {/* STATE 2 — INSTRUCT (ONE ACTIONABLE INSTRUCTION) */}
              <div className="guided-lab-task-box">
                <span className="guided-lab-sublabel" style={{ color: "#005A9E" }}>
                  2. Your Single Actionable Instruction
                </span>
                <dl className="guided-lab-instruction-grid">
                  <div>
                    <dt>TASK</dt>
                    <dd>{activeConcept.task}</dd>
                  </div>
                  <div>
                    <dt>WHERE</dt>
                    <dd>{activeConcept.where}</dd>
                  </div>
                  <div>
                    <dt>ACTION</dt>
                    <dd>{activeConcept.action}</dd>
                  </div>
                  <div>
                    <dt>EXPECTED RESULT</dt>
                    <dd>{activeConcept.expectedResult}</dd>
                  </div>
                  <div>
                    <dt>WHY</dt>
                    <dd>{activeConcept.why}</dd>
                  </div>
                </dl>
              </div>

              {/* STATE 3 — STUDENT EXECUTION CONTROLS */}
              <div className="guided-lab-action-row">
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary"
                  onClick={() => onJumpConsole?.(activeConcept.targetConsole)}
                >
                  <Laptop size={14} />
                  Open {activeConcept.targetConsole.toUpperCase()} Console
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-primary"
                  onClick={handleCheckWork}
                  disabled={mentorBusy}
                >
                  <ClipboardCheck size={14} />
                  Check My Work
                </button>
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary"
                  onClick={() => handleRequestHint()}
                  disabled={mentorBusy}
                >
                  <Lightbulb size={14} />
                  {activeHintLevel === 0
                    ? "Hint"
                    : activeHintLevel < 4
                      ? `Hint (${activeHintLevel}/4)`
                      : "Hint (4/4)"}
                </button>
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary"
                  onClick={() => handleAskMentor("Why am I doing this?", "why")}
                  disabled={mentorBusy}
                >
                  <HelpCircle size={14} />
                  Explain Why
                </button>
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary"
                  onClick={() => mentorInputRef.current?.focus()}
                >
                  <MessageSquare size={14} />
                  Ask Mentor
                </button>
              </div>

              {/* STATE 6 — NEXT CONCEPT BUTTON (STRICTLY LOCKED UNTIL VERIFIED) */}
              <div className="guided-lab-progression-bar">
                <div style={{ fontSize: 11.5, color: canAdvance ? "#15803D" : "#475569" }}>
                  {canAdvance ? (
                    <strong>
                      CONCEPT VERIFIED ✓ — Ready to advance to{" "}
                      {isFinalGuidedConcept
                        ? "Independent Challenge"
                        : `Concept ${activeConcept.order + 1}`}
                      .
                    </strong>
                  ) : (
                    <span>
                      Perform the action in the simulator and click <strong>Check My Work</strong>{" "}
                      to unlock the next concept.
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className={`pvwa-btn ${canAdvance ? "pvwa-btn-primary" : "pvwa-btn-secondary"}`}
                  onClick={handleNextConcept}
                  disabled={!canAdvance}
                  data-testid="next-concept-btn"
                >
                  {!canAdvance && <Lock size={13} />}
                  {isFinalGuidedConcept ? "Start Independent Challenge" : "Next Concept"}
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : null}

          {/* PROGRESSIVE 4-LEVEL HINTS PANEL (NON-PUNITIVE) */}
          {!isLabCompleted && activeHints && activeHintLevel > 0 && (
            <div className="guided-lab-hints-box" data-testid="progressive-hints-panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <strong
                  style={{
                    fontSize: 11,
                    color: "#92400E",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Lightbulb size={13} />
                  Progressive Hints (Level {activeHintLevel}/4 · No Penalty)
                </strong>
                {activeHintLevel < 4 && (
                  <button
                    type="button"
                    className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                    style={{ fontSize: 10.5 }}
                    onClick={() => handleRequestHint()}
                  >
                    Unlock {HINT_LEVEL_LABELS[(activeHintLevel + 1) as Exclude<HintLevel, 0>]}
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {([1, 2, 3, 4] as Array<Exclude<HintLevel, 0>>)
                  .filter((lvl) => lvl <= activeHintLevel)
                  .map((lvl) => (
                    <div key={lvl} className="guided-lab-hint-item">
                      <span className="guided-lab-hint-tag">{HINT_LEVEL_LABELS[lvl]}</span>
                      <p
                        style={{
                          margin: "3px 0 0 0",
                          fontSize: 12,
                          color: "#1E293B",
                          lineHeight: 1.45,
                        }}
                      >
                        {getHintTextForLevel(activeHints, lvl)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* STATE 4 & 5 — DETERMINISTIC VALIDATION RESULT FEEDBACK CARD */}
          {!isLabCompleted && activeValidation && (
            <div
              role={activeValidation.passed ? "status" : "alert"}
              className={`guided-lab-validation-card ${activeValidation.passed ? "passed" : "failed"}`}
              data-testid="validation-feedback-card"
            >
              {activeValidation.passed ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 700,
                      color: "#15803D",
                      fontSize: 13,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>CONCEPT VERIFIED ✓</span>
                  </div>
                  <p style={{ margin: "6px 0", fontSize: 12, color: "#166534", lineHeight: 1.5 }}>
                    {activeConcept?.successExplanation || activeValidation.summary}
                  </p>
                  {activeValidation.simulatorEvidence.length > 0 && (
                    <div style={{ fontSize: 11.5, color: "#14532D", marginTop: 4 }}>
                      <strong>Simulator Evidence:</strong>
                      <ul style={{ margin: "3px 0 0 0", paddingLeft: 18 }}>
                        {activeValidation.simulatorEvidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeConcept?.successRealWorldRelevance && (
                    <p style={{ margin: "6px 0 0 0", fontSize: 11.5, color: "#166534" }}>
                      <strong>Real-World Relevance:</strong>{" "}
                      {activeConcept.successRealWorldRelevance}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 700,
                        color: "#991B1B",
                        fontSize: 13,
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>Not yet verified</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#7F1D1D", fontWeight: 600 }}>
                      Attempt #{activeAttempts} · Deterministic Simulator Check
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {activeValidation.criteria.map((c) => (
                      <div
                        key={c.id}
                        className={`guided-lab-criterion-row ${c.passed ? "ok" : "unmet"}`}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontWeight: 700,
                            fontSize: 11.5,
                          }}
                        >
                          {c.passed ? (
                            <CheckCircle2 size={13} className="text-[#16A34A]" />
                          ) : (
                            <AlertCircle size={13} className="text-[#DC2626]" />
                          )}
                          <span>{c.label}</span>
                        </div>
                        {!c.passed && (
                          <div
                            style={{
                              fontSize: 11.5,
                              marginTop: 4,
                              lineHeight: 1.45,
                              color: "#334155",
                            }}
                          >
                            <div>
                              <strong>Expected:</strong> {c.expected}
                            </div>
                            <div>
                              <strong>Observed:</strong> {c.observed}
                            </div>
                            {c.possibleReason && (
                              <div>
                                <strong>Possible reason:</strong> {c.possibleReason}
                              </div>
                            )}
                            <div style={{ color: "#0369A1" }}>
                              <strong>Recommended diagnostic action:</strong> {c.diagnosticAction}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Failure Action Buttons */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-primary pvwa-btn-sm"
                      onClick={handleCheckWork}
                      disabled={mentorBusy}
                    >
                      <RotateCcw size={12} />
                      Retry Check
                    </button>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                      onClick={() => handleRequestHint()}
                      disabled={mentorBusy}
                    >
                      <Lightbulb size={12} />
                      Give Me a Hint
                    </button>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                      onClick={() =>
                        handleAskMentor("Help me diagnose why this failed.", "diagnose")
                      }
                      disabled={mentorBusy}
                    >
                      <Wrench size={12} />
                      Help Me Diagnose
                    </button>
                    <button
                      type="button"
                      className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                      onClick={() => handleAskMentor("Explain the current step.", "explain_step")}
                      disabled={mentorBusy}
                    >
                      <HelpCircle size={12} />
                      Explain This
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT / SIDE AREA: AI MENTOR PANEL */}
        <aside className="guided-lab-mentor-panel" aria-label="AI Lab Mentor">
          <div className="guided-lab-mentor-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bot size={16} className="text-[#0078D4]" />
              <div>
                <strong style={{ fontSize: 12.5, color: "#0F172A", display: "block" }}>
                  Lab Mentor &amp; Instructor
                </strong>
                <span style={{ fontSize: 10.5, color: "#475569" }}>
                  Context: Lesson {lesson.number} ·{" "}
                  {isIndependentMode
                    ? "Independent Challenge"
                    : activeConcept
                      ? `Concept ${activeConcept.order}/${plan.concepts.length}`
                      : "Completed"}
                </span>
              </div>
            </div>
            <span
              className={`guided-lab-ai-badge ${aiStatus.mode}`}
              data-testid="ai-provider-status"
            >
              {aiStatus.label}
            </span>
          </div>

          {/* Honest AI Provider Status & Scripted Fallback Disclosure */}
          <div className="guided-lab-ai-disclosure">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <Info size={13} style={{ flexShrink: 0, marginTop: 2, color: "#92400E" }} />
              <div style={{ flex: 1 }}>
                <span>{aiStatus.disclosure}</span>{" "}
                <button
                  type="button"
                  className="guided-lab-inline-link"
                  onClick={() => setShowAiSetup((prev) => !prev)}
                >
                  {showAiSetup ? "Hide setup guide" : "How to enable live AI"}
                </button>
              </div>
            </div>
            {showAiSetup && (
              <p
                style={{
                  margin: "6px 0 0 19px",
                  fontSize: 10.5,
                  color: "#78350F",
                  lineHeight: 1.45,
                }}
              >
                {aiStatus.setupInstructions}
              </p>
            )}
          </div>

          {/* Conversation History (Context Retained Across Session) */}
          <div className="guided-lab-chat-log" ref={chatScrollRef} data-testid="mentor-chat-log">
            {session.messages.map((msg) => (
              <div key={msg.id} className={`guided-lab-msg guided-lab-msg-${msg.role}`}>
                <div className="guided-lab-msg-meta">
                  <span className="guided-lab-msg-sender">
                    {msg.role === "learner"
                      ? "You"
                      : msg.role === "validator"
                        ? "Simulator Validator (Authority)"
                        : msg.source === "ai-gateway"
                          ? "AI Mentor (Live Gateway)"
                          : "Instructor (Scripted Curriculum)"}
                  </span>
                </div>
                {msg.title && <div className="guided-lab-msg-title">{msg.title}</div>}
                <div className="guided-lab-msg-body">{msg.content}</div>
                {msg.validationSnapshot && (
                  <div className="guided-lab-val-chip">
                    <code>
                      {msg.validationSnapshot.conceptId} · passed:{" "}
                      {String(msg.validationSnapshot.passed)} · criteria:{" "}
                      {msg.validationSnapshot.criteria.filter((c) => c.passed).length}/
                      {msg.validationSnapshot.criteria.length}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick-Ask Student Question Chips */}
          <div className="guided-lab-quick-prompts">
            {QUICK_MENTOR_QUESTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="guided-lab-prompt-chip"
                onClick={() => handleAskMentor(item.question, item.intent)}
                disabled={mentorBusy}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Ask Mentor Free-Text Form */}
          <form
            className="guided-lab-mentor-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAskMentor(questionInput);
            }}
          >
            <input
              ref={mentorInputRef}
              type="text"
              className="pvwa-input"
              style={{ flex: 1, fontSize: 12, padding: "6px 10px" }}
              placeholder="Ask the mentor about this step, error, or concept..."
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              aria-label="Ask the Lab Mentor a question"
            />
            <button
              type="submit"
              className="pvwa-btn pvwa-btn-primary pvwa-btn-sm"
              disabled={mentorBusy || !questionInput.trim()}
              aria-label="Send question to Mentor"
            >
              <Send size={13} />
              Ask
            </button>
          </form>

          {/* Compact Mentor Action Footer */}
          <div className="guided-lab-mentor-footer">
            <button
              type="button"
              className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
              style={{ fontSize: 10.5 }}
              onClick={() => handleRequestHint()}
              disabled={mentorBusy || isLabCompleted}
            >
              <Lightbulb size={12} />
              Hint
            </button>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
              style={{ fontSize: 10.5 }}
              onClick={() => handleAskMentor("Explain the current step.", "explain_step")}
              disabled={mentorBusy || isLabCompleted}
            >
              <HelpCircle size={12} />
              Explain
            </button>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
              style={{ fontSize: 10.5 }}
              onClick={() => handleAskMentor("Help me diagnose this issue.", "diagnose")}
              disabled={mentorBusy || isLabCompleted}
            >
              <Wrench size={12} />
              Troubleshoot
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
