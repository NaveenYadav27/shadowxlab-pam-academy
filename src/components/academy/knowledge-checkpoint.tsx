/**
 * SHADOWXLAB PAM ACADEMY — INTERACTIVE KNOWLEDGE CHECKPOINT
 * Multiple-choice & scenario-based quiz engine providing immediate feedback,
 * conceptual explanations, score tracking, and persistent state.
 */

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Lightbulb } from "lucide-react";
import type { KnowledgeCheckpointQuestion } from "@/lib/academy/types";
import { evaluateLessonCheckpoint } from "@/lib/academy/progress";

interface KnowledgeCheckpointProps {
  questions: KnowledgeCheckpointQuestion[];
  savedAnswers: Record<string, number>;
  onRecordAnswer: (questionId: string, optionIndex: number, isCorrect: boolean) => void;
  onResetAnswers?: (questionIds: string[]) => void;
}

export const KnowledgeCheckpoint: React.FC<KnowledgeCheckpointProps> = ({
  questions,
  savedAnswers,
  onRecordAnswer,
  onResetAnswers,
}) => {
  const [localAnswers, setLocalAnswers] = useState<Record<string, number>>(savedAnswers);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalAnswers(savedAnswers);
  }, [savedAnswers]);

  const status = evaluateLessonCheckpoint(questions, localAnswers);

  function handleSelect(question: KnowledgeCheckpointQuestion, optionIdx: number) {
    const isCorrect = optionIdx === question.correctIndex;
    setLocalAnswers((prev) => ({ ...prev, [question.id]: optionIdx }));
    setAttempts((prev) => ({ ...prev, [question.id]: (prev[question.id] || 0) + 1 }));
    if (isCorrect) {
      setRevealedQuestions((prev) => ({ ...prev, [question.id]: true }));
    }
    onRecordAnswer(question.id, optionIdx, isCorrect);
  }

  function handleRevealAnswer(questionId: string) {
    setRevealedQuestions((prev) => ({ ...prev, [questionId]: true }));
  }

  function handleReset() {
    const questionIds = questions.map((q) => q.id);
    setLocalAnswers((prev) => {
      const next = { ...prev };
      for (const id of questionIds) {
        delete next[id];
      }
      return next;
    });
    setAttempts({});
    setRevealedQuestions({});
    onResetAnswers?.(questionIds);
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="checkpoint-card" style={{ textAlign: "center", padding: 20 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
          No knowledge checkpoints assigned to this lesson.
        </p>
      </div>
    );
  }

  return (
    <div className="checkpoint-card" id="knowledge-checkpoint-section">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: 8,
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: "#1E293B",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <HelpCircle size={15} className="text-[#0078D4]" />
            Knowledge Checkpoints
          </h4>
          <span style={{ fontSize: 11, color: status.passed ? "#137333" : "#64748B" }}>
            Score: <strong>{status.correct}</strong> / {status.total} Correct
            {status.passed
              ? " · Passed"
              : ` · Need ${status.requiredCorrect}/${status.total} to pass`}
          </span>
        </div>
        {status.answered > 0 && (
          <button
            type="button"
            className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
            style={{ padding: "2px 6px", fontSize: 10 }}
            onClick={handleReset}
            title="Reset checkpoint answers for this lesson"
          >
            <RotateCcw size={11} />
            Retry
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {questions.map((q, qIdx) => {
          const selectedIdx = localAnswers[q.id];
          const hasAnswered = selectedIdx !== undefined;
          const isCorrect = selectedIdx === q.correctIndex;
          const attemptCount = attempts[q.id] || 0;
          const shouldRevealSolution = isCorrect || Boolean(revealedQuestions[q.id]);

          return (
            <div
              key={q.id}
              style={{
                padding: 10,
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 2,
              }}
            >
              <div className="checkpoint-question">
                <span style={{ color: "#0078D4", marginRight: 6 }}>Q{qIdx + 1}:</span>
                {q.question}
              </div>

              {q.scenario && (
                <div
                  style={{
                    fontSize: 11,
                    fontStyle: "italic",
                    color: "#475569",
                    marginBottom: 8,
                    background: "#FFFFFF",
                    padding: "4px 8px",
                    borderLeft: "2px solid #CBD5E1",
                  }}
                >
                  Scenario: {q.scenario}
                </div>
              )}

              <div className="checkpoint-options">
                {q.options.map((opt, optIdx) => {
                  let optClass = "checkpoint-option";
                  if (hasAnswered) {
                    if (shouldRevealSolution && optIdx === q.correctIndex) {
                      optClass += " correct";
                    } else if (optIdx === selectedIdx && !isCorrect) {
                      optClass += " incorrect";
                    } else if (optIdx === selectedIdx && isCorrect) {
                      optClass += " correct";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      className={optClass}
                      onClick={() => handleSelect(q, optIdx)}
                    >
                      <span style={{ fontWeight: 700, marginRight: 6 }}>
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className={`checkpoint-feedback ${isCorrect ? "correct" : "incorrect"}`}>
                  {isCorrect ? (
                    <>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}
                      >
                        <CheckCircle2 size={13} /> Correct!
                      </div>
                      <p style={{ margin: "4px 0 0 0" }}>{q.explanation}</p>
                    </>
                  ) : shouldRevealSolution ? (
                    <>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}
                      >
                        <XCircle size={13} /> Incorrect — Review Explanation &amp; Retry:
                      </div>
                      <p style={{ margin: "4px 0 0 0" }}>{q.explanation}</p>
                    </>
                  ) : (
                    <>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}
                      >
                        <XCircle size={13} /> Not quite — try again
                      </div>
                      <p style={{ margin: "4px 0 6px 0" }}>
                        <Lightbulb size={12} style={{ display: "inline", marginRight: 4 }} />
                        Hint: Focus on <strong>{q.conceptTested}</strong> in this lesson and select
                        another option.
                        {attemptCount >= 2
                          ? " Still stuck? Reveal the full explanation below."
                          : ""}
                      </p>
                      <button
                        type="button"
                        className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                        style={{ padding: "2px 8px", fontSize: 10 }}
                        onClick={() => handleRevealAnswer(q.id)}
                      >
                        Reveal Explanation
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
