/**
 * SHADOWXLAB PAM ACADEMY — INTERACTIVE KNOWLEDGE CHECKPOINT
 * Multiple-choice & scenario-based quiz engine providing immediate feedback,
 * conceptual explanations, score tracking, and persistent state.
 */

import React, { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw } from "lucide-react";
import type { KnowledgeCheckpointQuestion } from "@/lib/academy/types";

interface KnowledgeCheckpointProps {
  questions: KnowledgeCheckpointQuestion[];
  savedAnswers: Record<string, number>;
  onRecordAnswer: (questionId: string, optionIndex: number, isCorrect: boolean) => void;
}

export const KnowledgeCheckpoint: React.FC<KnowledgeCheckpointProps> = ({
  questions,
  savedAnswers,
  onRecordAnswer,
}) => {
  const [localAnswers, setLocalAnswers] = useState<Record<string, number>>(savedAnswers);

  const answeredCount = Object.keys(localAnswers).length;
  const correctCount = questions.filter(
    (q) => localAnswers[q.id] !== undefined && localAnswers[q.id] === q.correctIndex,
  ).length;

  function handleSelect(question: KnowledgeCheckpointQuestion, optionIdx: number) {
    const isCorrect = optionIdx === question.correctIndex;
    setLocalAnswers((prev) => ({ ...prev, [question.id]: optionIdx }));
    onRecordAnswer(question.id, optionIdx, isCorrect);
  }

  function handleReset() {
    setLocalAnswers({});
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
    <div className="checkpoint-card">
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
          <span style={{ fontSize: 11, color: "#64748B" }}>
            Score: <strong>{correctCount}</strong> / {questions.length} Correct
          </span>
        </div>
        {answeredCount > 0 && (
          <button
            type="button"
            className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
            style={{ padding: "2px 6px", fontSize: 10 }}
            onClick={handleReset}
            title="Reset checkpoint answers"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {questions.map((q, qIdx) => {
          const selectedIdx = localAnswers[q.id];
          const hasAnswered = selectedIdx !== undefined;
          const isCorrect = selectedIdx === q.correctIndex;

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
                    if (optIdx === q.correctIndex) {
                      optClass += " correct";
                    } else if (optIdx === selectedIdx) {
                      optClass += " incorrect";
                    }
                  } else if (optIdx === selectedIdx) {
                    optClass += " selected";
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
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={13} /> Correct!
                      </>
                    ) : (
                      <>
                        <XCircle size={13} /> Incorrect — Review Explanation:
                      </>
                    )}
                  </div>
                  <p style={{ margin: "4px 0 0 0" }}>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
