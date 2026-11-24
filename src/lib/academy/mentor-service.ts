/**
 * SHADOWXLAB PAM ACADEMY — AI MENTOR & DETERMINISTIC CURRICULUM INSTRUCTOR SERVICE
 *
 * Honest AI Provider Policy:
 * - Never exposes API keys in frontend code.
 * - Checks whether a server-backed Lovable AI Gateway mentor endpoint is configured.
 * - When no AI provider is configured (current default), explicitly reports
 *   "AI Provider Unavailable" and serves deterministic curriculum-grounded
 *   instruction clearly labeled as Scripted Curriculum Fallback.
 * - Validator results are read-only inputs: the mentor can explain results
 *   and coach remediation, but can NEVER alter or bypass validation outcomes.
 */

import type {
  AiProviderStatus,
  ConceptValidationResult,
  HintLevel,
  MentorContext,
  MentorIntent,
  MentorResponse,
  ProgressiveHints,
} from "./guided-lab-types";

export const HINT_LEVEL_LABELS: Record<Exclude<HintLevel, 0>, string> = {
  1: "HINT 1 — CONCEPT",
  2: "HINT 2 — LOCATION",
  3: "HINT 3 — PROCEDURE",
  4: "HINT 4 — SOLUTION",
};

/**
 * Optional server-side endpoint (never holds keys in browser).
 * Set VITE_ACADEMY_AI_MENTOR_ENDPOINT to a Lovable Cloud Edge Function or
 * TanStack server route backed by LOVABLE_API_KEY on Lovable's AI gateway.
 */
function getConfiguredAiEndpoint(): string | null {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const endpoint = env?.["VITE_ACADEMY_AI_MENTOR_ENDPOINT"]?.trim();
  return endpoint ? endpoint : null;
}

export function getAiProviderStatus(): AiProviderStatus {
  const endpoint = getConfiguredAiEndpoint();
  if (endpoint) {
    return {
      mode: "gateway-connected",
      label: "AI Mentor Connected (Server Gateway)",
      disclosure: `Live AI mentor responses are routed securely through ${endpoint}. Simulator verification remains 100% deterministic.`,
      setupInstructions:
        "AI Mentor endpoint is configured. Keep LOVABLE_API_KEY stored strictly in server secrets.",
    };
  }

  return {
    mode: "unavailable",
    label: "AI Unavailable · Scripted Curriculum Mode",
    disclosure:
      "Live AI generation is currently unavailable (no server AI endpoint configured). Responses below are deterministic, curriculum-grounded instructor guidance — not live LLM output.",
    setupInstructions:
      "To enable live AI Mentor responses: (1) Deploy a server route or Lovable Cloud Edge Function that calls Lovable's AI Gateway (https://ai.gateway.lovable.dev/v1/chat/completions) using server-side secret LOVABLE_API_KEY (never in browser code), and (2) set VITE_ACADEMY_AI_MENTOR_ENDPOINT to that server route URL.",
  };
}

export function classifyLearnerQuestion(question: string): MentorIntent {
  const q = question.toLowerCase().trim();
  if (q.includes("why am i doing") || q.includes("why does") || q.includes("why")) return "why";
  if (q.includes("where do i go") || q.includes("where") || q.includes("which console")) {
    return "where";
  }
  if (q.includes("what should i see") || q.includes("expected") || q.includes("look like")) {
    return "expected";
  }
  if (
    q.includes("error") ||
    q.includes("fail") ||
    q.includes("denied") ||
    q.includes("cacpm") ||
    q.includes("itats")
  ) {
    return "error_meaning";
  }
  if (q.includes("hint") || q.includes("clue")) return "hint";
  if (q.includes("beginner") || q.includes("simple") || q.includes("eli5")) return "beginner";
  if (q.includes("cyberark") || q.includes("real world") || q.includes("production")) {
    return "cyberark_real_world";
  }
  if (q.includes("try it myself") || q.includes("myself") || q.includes("without help")) {
    return "try_myself";
  }
  if (q.includes("stuck") || q.includes("diagnose") || q.includes("help")) return "stuck";
  if (q.includes("explain") || q.includes("step")) return "explain_step";
  return "freeform";
}

export function getHintTextForLevel(hints: ProgressiveHints, level: Exclude<HintLevel, 0>): string {
  switch (level) {
    case 1:
      return hints.level1Concept;
    case 2:
      return hints.level2Location;
    case 3:
      return hints.level3Procedure;
    case 4:
      return hints.level4Solution;
  }
}

/**
 * Generates deterministic, curriculum-grounded validation feedback strictly from
 * the structured ConceptValidationResult produced by the validator.
 */
export function buildValidationFeedbackResponse(
  context: MentorContext,
  validation: ConceptValidationResult,
): MentorResponse {
  const conceptTitle = context.isIndependentChallenge
    ? context.plan.independentChallenge.title
    : context.activeConcept?.title || context.exerciseTitle;

  if (validation.passed) {
    const evidenceLines =
      validation.simulatorEvidence.length > 0
        ? validation.simulatorEvidence.map((e) => `• ${e}`).join("\n")
        : validation.criteria.map((c) => `• ${c.label}: ${c.observed}`).join("\n");

    const whyCorrect = context.isIndependentChallenge
      ? `You fulfilled every independent requirement without step-by-step prompts, demonstrating practical operational readiness in ${context.plan.title}.`
      : context.activeConcept?.successExplanation || validation.summary;

    const realWorld = context.isIndependentChallenge
      ? `Recommended next skill: ${context.plan.recommendedNextSkill}.`
      : context.activeConcept?.successRealWorldRelevance ||
        "This verification step mirrors production CyberArk change-control gates.";

    return {
      source: "scripted-curriculum",
      title: `CONCEPT VERIFIED ✓ — ${conceptTitle}`,
      content: [
        `**What you accomplished:** ${whyCorrect}`,
        `**Simulator evidence proving success:**\n${evidenceLines}`,
        `**Real-world PAM relevance:** ${realWorld}`,
        context.isIndependentChallenge
          ? "Your Practical Competency Report is now unlocked below."
          : "You may now click **Next Concept** when you are ready to continue.",
      ].join("\n\n"),
    };
  }

  const failed = validation.criteria.filter((c) => !c.passed);
  const primaryFail = failed[0];
  const passedCount = validation.criteria.filter((c) => c.passed).length;

  const progressNote =
    passedCount > 0
      ? `You're close — ${passedCount} of ${validation.criteria.length} criteria already pass in the live simulator.`
      : `The live simulator has not recorded the required state change yet (attempt #${Math.max(1, context.attemptCount)}).`;

  const lines = [
    progressNote,
    primaryFail
      ? `**Expected:** ${primaryFail.expected}\n**Observed:** ${primaryFail.observed}`
      : `**Observed:** ${validation.summary}`,
  ];

  if (primaryFail?.possibleReason) {
    lines.push(`**Possible reason:** ${primaryFail.possibleReason}`);
  }
  if (primaryFail?.diagnosticAction) {
    lines.push(`**Recommended diagnostic action:** ${primaryFail.diagnosticAction}`);
  }
  lines.push(
    `Use **Give Me a Hint** (starts with Concept / Location before revealing procedure), **Help Me Diagnose**, or jump back to the simulator console and click **Retry Check**.`,
  );

  return {
    source: "scripted-curriculum",
    title: `Not yet verified — ${conceptTitle}`,
    content: lines.join("\n\n"),
  };
}

/**
 * Deterministic curriculum-grounded mentor responder.
 * Uses active track, module, lesson, concept, validation result, and attempt history.
 */
export function buildDeterministicMentorResponse(
  context: MentorContext,
  intent: MentorIntent,
  userQuestion?: string,
  requestedHintLevel?: Exclude<HintLevel, 0>,
): MentorResponse {
  const status = getAiProviderStatus();
  const concept = context.activeConcept;
  const challenge = context.plan.independentChallenge;
  const validation = context.validationResult;
  const aiNotice =
    status.mode === "unavailable"
      ? "Scripted Curriculum Guidance (AI provider not configured)"
      : undefined;

  if (intent === "validation_feedback" && validation) {
    const res = buildValidationFeedbackResponse(context, validation);
    return { ...res, aiUnavailableNotice: aiNotice };
  }

  if (intent === "hint") {
    const hints = context.isIndependentChallenge ? challenge.hints : concept?.hints;
    const level: Exclude<HintLevel, 0> =
      requestedHintLevel ??
      (Math.min(4, Math.max(1, context.hintLevel + 1)) as Exclude<HintLevel, 0>);
    const hintBody = hints
      ? getHintTextForLevel(hints, level)
      : "Inspect the target console and confirm the required simulator state matches the expected criteria.";

    return {
      source: "scripted-curriculum",
      title: `${HINT_LEVEL_LABELS[level]} (No Penalty)`,
      hintLevel: level,
      aiUnavailableNotice: aiNotice,
      content: [
        hintBody,
        level < 4
          ? `Need more detail? Request the next hint level (Level ${level + 1}/4) anytime without penalty.`
          : "This is the complete Level 4 solution. Execute it in the simulator console, then click **Check My Work**.",
      ].join("\n\n"),
    };
  }

  const contextHeader = `Active Context: ${context.trackTitle} → ${context.moduleTitle} → Lesson ${context.lessonNumber} (${
    context.isIndependentChallenge
      ? "Independent Challenge"
      : `Concept ${concept?.order ?? 1}: ${concept?.title ?? context.exerciseTitle}`
  })`;

  switch (intent) {
    case "why":
      return {
        source: "scripted-curriculum",
        title: "Why This Step Matters",
        aiUnavailableNotice: aiNotice,
        content: context.isIndependentChallenge
          ? `${contextHeader}\n\n**Why Independent Practice matters:** ${challenge.enterpriseContext} Performing the operation without step-by-step guidance verifies you can apply ${context.lessonTitle} in a live production incident.`
          : `${contextHeader}\n\n**Operational rationale:** ${concept?.why}\n\n**Why it matters in PAM:** ${concept?.importance}`,
      };

    case "where":
      return {
        source: "scripted-curriculum",
        title: "Where to Perform This Operation",
        aiUnavailableNotice: aiNotice,
        content: context.isIndependentChallenge
          ? `${contextHeader}\n\n**Console:** Use the **${challenge.targetConsole.toUpperCase()}** console (via the top navigation bar or the Open Console button).`
          : `${contextHeader}\n\n**Where:** ${concept?.where}\n\nClick the **Open ${concept?.targetConsole.toUpperCase()} Console** button, execute the operation, then return to Learning Academy and click **Check My Work**.`,
      };

    case "expected":
      return {
        source: "scripted-curriculum",
        title: "Expected Simulator Outcome",
        aiUnavailableNotice: aiNotice,
        content: context.isIndependentChallenge
          ? `${contextHeader}\n\n**Expected outcome:** All Independent Challenge requirements satisfied:\n${challenge.requirements.map((r) => `• ${r}`).join("\n")}`
          : `${contextHeader}\n\n**What you should observe:** ${concept?.expectedResult}`,
      };

    case "explain_step":
      return {
        source: "scripted-curriculum",
        title: context.isIndependentChallenge
          ? "Independent Challenge Brief"
          : `Explaining Concept ${concept?.order}: ${concept?.title}`,
        aiUnavailableNotice: aiNotice,
        content: context.isIndependentChallenge
          ? `${contextHeader}\n\nIn Independent Challenge mode I will not give step-by-step clicks unless you explicitly request a Level 3/4 Hint.\n\n**Objective:** ${challenge.objective}\n**Initial Environment:** ${challenge.initialEnvironment}`
          : `${contextHeader}\n\n**Concept:** ${concept?.conceptIntro}\n\n**Current Task:** ${concept?.task}\n\n**Action:** ${concept?.action}`,
      };

    case "beginner":
      return {
        source: "scripted-curriculum",
        title: "Beginner-Friendly Breakdown",
        aiUnavailableNotice: aiNotice,
        content: context.isIndependentChallenge
          ? `${contextHeader}\n\nThink of this Independent Challenge as a real shift handover: you know the goal (${challenge.objective}), you have the live PAM console, and the simulator will objectively check whether the final state matches policy.`
          : `${contextHeader}\n\nIn plain terms:\n1. **What we are doing:** ${concept?.task}\n2. **Why it protects the company:** ${concept?.importance}\n3. **Where to click first:** Go to ${concept?.where}.\n4. **How you know it worked:** ${concept?.expectedResult}`,
      };

    case "cyberark_real_world": {
      const note =
        context.lessonInstructorNotes[0] ||
        "In production CyberArk PAS deployments, every administrative action routes through PVWA/Vault ACLs over TCP 1858 and is recorded in tamper-evident audit logs.";
      return {
        source: "scripted-curriculum",
        title: "How This Works in Production CyberArk",
        aiUnavailableNotice: aiNotice,
        content: `${contextHeader}\n\n**Enterprise Practice:** ${concept?.realWorldContext || challenge.enterpriseContext}\n\n**Architect Field Note:** ${note}`,
      };
    }

    case "error_meaning":
    case "diagnose":
    case "stuck": {
      const failed = validation?.criteria.filter((c) => !c.passed) || [];
      const failureScenario = context.lessonFailureScenarios[0];
      const parts: string[] = [contextHeader];

      if (failed.length > 0) {
        parts.push(
          `**Current Validator Findings (${failed.length} unmet):**\n` +
            failed
              .map(
                (f) =>
                  `• **${f.label}** — Observed: ${f.observed} | Next check: ${f.diagnosticAction}`,
              )
              .join("\n"),
        );
      } else {
        parts.push(
          context.attemptCount === 0
            ? "You haven't run **Check My Work** yet on this concept. Perform the task in the simulator console, then click **Check My Work** so the validator can inspect live state."
            : "Your last validation check passed! Click **Next Concept** to continue.",
        );
      }

      if (failureScenario) {
        parts.push(
          `**Related PAM Error Pattern${failureScenario.cyberArkCodeOrEvent ? ` (${failureScenario.cyberArkCodeOrEvent})` : ""}:** ${failureScenario.symptom} — Root cause: ${failureScenario.rootCause}`,
        );
      }

      if (context.previousMistakes.length > 0) {
        parts.push(
          `**Session attempt history:** ${context.attemptCount} check(s) so far on this concept. Request **Hint** (Level ${Math.min(4, context.hintLevel + 1)}/4) if you want more structured guidance.`,
        );
      }

      return {
        source: "scripted-curriculum",
        title:
          intent === "error_meaning" ? "Error & Validator Diagnosis" : "Diagnostic Walkthrough",
        aiUnavailableNotice: aiNotice,
        content: parts.join("\n\n"),
      };
    }

    case "try_myself":
      return {
        source: "scripted-curriculum",
        title: "Go Ahead — Standing By",
        aiUnavailableNotice: aiNotice,
        content: `Great! Open **${(context.isIndependentChallenge ? challenge.targetConsole : concept?.targetConsole || "overview").toUpperCase()} Console**, execute the operation at your own pace, and click **Check My Work** whenever you want me to verify the live simulator state. I will keep our session context right here.`,
      };

    case "freeform":
    default: {
      const unmet = validation?.criteria.filter((c) => !c.passed) || [];
      return {
        source: "scripted-curriculum",
        title: "Curriculum-Grounded Instructor Guidance",
        aiUnavailableNotice: aiNotice,
        content: [
          contextHeader,
          userQuestion ? `Regarding your question ("${userQuestion.trim()}"):` : "",
          context.isIndependentChallenge
            ? `Your active goal is **${challenge.title}**: ${challenge.objective}`
            : `Your active task is **${concept?.task}** in **${concept?.where}**.`,
          unmet.length > 0
            ? `Live validator currently shows **${unmet[0]!.label}** is still pending (Observed: ${unmet[0]!.observed}). Recommended action: ${unmet[0]!.diagnosticAction}`
            : `Expected result: ${context.isIndependentChallenge ? challenge.requirements[0] : concept?.expectedResult}`,
          `Note: Live generative AI is offline in this environment, so I am answering strictly from verified curriculum content and your live simulator state.`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    }
  }
}

/**
 * Primary async mentor entrypoint.
 * Calls configured server-side AI gateway endpoint when present (sending structured
 * validator JSON as immutable ground truth), and cleanly falls back to deterministic
 * curriculum instruction when AI is unavailable or unreachable.
 */
export async function requestMentorGuidance(
  context: MentorContext,
  intent: MentorIntent,
  userQuestion?: string,
  requestedHintLevel?: Exclude<HintLevel, 0>,
): Promise<MentorResponse> {
  const endpoint = getConfiguredAiEndpoint();
  const fallback = buildDeterministicMentorResponse(
    context,
    intent,
    userQuestion,
    requestedHintLevel,
  );

  if (!endpoint) {
    return fallback;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intent,
        userQuestion,
        requestedHintLevel,
        trackTitle: context.trackTitle,
        moduleTitle: context.moduleTitle,
        lessonNumber: context.lessonNumber,
        lessonTitle: context.lessonTitle,
        conceptId: context.isIndependentChallenge
          ? context.plan.independentChallenge.id
          : context.activeConcept?.id,
        validation: context.validationResult
          ? {
              conceptId: context.validationResult.conceptId,
              passed: context.validationResult.passed,
              criteria: context.validationResult.criteria.map((c) => ({
                id: c.id,
                passed: c.passed,
                expected: c.expected,
                observed: c.observed,
              })),
            }
          : null,
        attemptCount: context.attemptCount,
        hintLevel: context.hintLevel,
        historyLength: context.conversationHistory.length,
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as { title?: string; content?: string };
    if (!data.content || typeof data.content !== "string") {
      return fallback;
    }

    return {
      source: "ai-gateway",
      title: data.title || fallback.title,
      content: data.content,
      hintLevel: requestedHintLevel,
    };
  } catch {
    return fallback;
  }
}
