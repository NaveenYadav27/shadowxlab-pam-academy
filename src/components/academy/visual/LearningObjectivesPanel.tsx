import React from "react";
import { CheckCircle2, BookOpen, Layers, Terminal } from "lucide-react";
import type { Lesson } from "@/lib/academy/types";
import { PracticalExerciseCard } from "../practical-exercise-card";
import { KnowledgeCheckpoint } from "../knowledge-checkpoint";
import type { PamState } from "@/lib/pam-engine";

interface LearningObjectivesPanelProps {
  lesson: Lesson;
  state: PamState;
  completedExercises: string[];
  savedAnswers: Record<string, number>;
  onRecordAnswer: (questionId: string, optionIndex: number, isCorrect: boolean) => void;
  onRecordExerciseComplete: (exerciseId: string) => void;
  onJumpConsole?: (section: "accounts" | "safes" | "cpm" | "psm" | "audit") => void;
}

export const LearningObjectivesPanel: React.FC<LearningObjectivesPanelProps> = ({
  lesson,
  state,
  completedExercises,
  savedAnswers,
  onRecordAnswer,
  onRecordExerciseComplete,
  onJumpConsole,
}) => {
  return (
    <div className="academy-right-sidebar">
      {/* 1. Quick Console Jump Shortcuts */}
      <div className="pvwa-academy-card" style={{ marginBottom: 12 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#64748B",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          Quick Jump to Operations Console:
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
            style={{ fontSize: 10, justifyContent: "center" }}
            onClick={() => onJumpConsole?.("safes")}
          >
            Safes Console
          </button>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
            style={{ fontSize: 10, justifyContent: "center" }}
            onClick={() => onJumpConsole?.("accounts")}
          >
            Accounts Console
          </button>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
            style={{ fontSize: 10, justifyContent: "center" }}
            onClick={() => onJumpConsole?.("cpm")}
          >
            CPM Console
          </button>
          <button
            type="button"
            className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
            style={{ fontSize: 10, justifyContent: "center" }}
            onClick={() => onJumpConsole?.("psm")}
          >
            PSM Console
          </button>
        </div>
      </div>

      {/* 2. Core Learning Objectives Card */}
      <div className="pvwa-academy-card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <CheckCircle2 size={14} className="text-[#0078D4]" />
          <span
            style={{ fontSize: 11, fontWeight: 700, color: "#1E293B", textTransform: "uppercase" }}
          >
            Lesson Learning Objectives
          </span>
        </div>
        <ul
          style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: "#334155", lineHeight: 1.5 }}
        >
          {lesson.learningObjectives.map((obj, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Practical Operational Exercise Card */}
      {lesson.practicalExercise && (
        <PracticalExerciseCard
          exercise={lesson.practicalExercise}
          state={state}
          isCompleted={completedExercises.includes(lesson.practicalExercise.id)}
          onRecordExerciseComplete={onRecordExerciseComplete}
          onJumpConsole={onJumpConsole}
        />
      )}

      {/* 4. Interactive Knowledge Checkpoint */}
      <KnowledgeCheckpoint
        questions={lesson.knowledgeCheck}
        savedAnswers={savedAnswers}
        onRecordAnswer={onRecordAnswer}
      />

      {/* 5. Technical Terminology Dictionary Card */}
      <div className="pvwa-academy-card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <BookOpen size={14} className="text-[#0078D4]" />
          <span
            style={{ fontSize: 11, fontWeight: 700, color: "#1E293B", textTransform: "uppercase" }}
          >
            Technical Terminology
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lesson.terminology.slice(0, 4).map((t, idx) => (
            <div key={idx} style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 6 }}>
              <strong style={{ fontSize: 11, color: "#0078D4", display: "block" }}>{t.term}</strong>
              <p
                style={{ margin: "2px 0 0 0", fontSize: 10.5, color: "#475569", lineHeight: 1.35 }}
              >
                {t.definition}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
