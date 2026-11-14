/**
 * SHADOWXLAB PAM ACADEMY — PRACTICAL OPERATIONAL EXERCISE CARD
 * Connects the instructional lesson directly to the deterministic PAM simulator.
 * Evaluates live simulator state and provides quick console navigation.
 */

import React, { useMemo } from "react";
import { Terminal, ArrowRight, CheckCircle2, Clock3, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import {
  evaluateLabObjectives,
  type LabEvaluationResult,
  type LabObjective,
  type PamState,
} from "@/lib/pam-engine";
import type { PracticalExercise } from "@/lib/academy/types";

interface PracticalExerciseCardProps {
  exercise?: PracticalExercise;
  state: PamState;
  isCompleted: boolean;
  onRecordExerciseComplete: (exerciseId: string) => void;
  onJumpConsole?: (section: "accounts" | "safes" | "cpm" | "psm" | "audit") => void;
}

export const PracticalExerciseCard: React.FC<PracticalExerciseCardProps> = ({
  exercise,
  state,
  isCompleted,
  onRecordExerciseComplete,
  onJumpConsole,
}) => {
  const associatedLabId = exercise?.associatedLabId || "";
  const evaluation: LabEvaluationResult = useMemo(
    () => evaluateLabObjectives(state, associatedLabId),
    [state, associatedLabId],
  );

  if (!exercise) return null;

  function handleValidate() {
    if (evaluation.completed) {
      onRecordExerciseComplete(exercise.id);
      toast.success(`Operational exercise verified! Score: ${evaluation.score}/100.`);
    } else {
      toast.error(`Exercise incomplete: ${evaluation.feedback}`);
    }
  }

  return (
    <div className="pvwa-academy-card" style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: 8,
        }}
      >
        <div>
          <span
            style={{ fontSize: 10, fontWeight: 700, color: "#0078D4", textTransform: "uppercase" }}
          >
            Operational Simulator Lab
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
            {exercise.title}
          </h4>
        </div>
        <span
          className="pvwa-status-pill managed"
          style={{
            background: isCompleted || evaluation.completed ? "#E6F4EA" : "#FEF7E0",
            color: isCompleted || evaluation.completed ? "#137333" : "#B06000",
            border: isCompleted || evaluation.completed ? "1px solid #CEEAD6" : "1px solid #FEEFC3",
          }}
        >
          {isCompleted || evaluation.completed ? "COMPLETED" : "IN PROGRESS"}
        </span>
      </div>

      <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#475569", lineHeight: 1.45 }}>
        {exercise.scenario}
      </p>

      {/* Instructions */}
      <strong
        style={{
          fontSize: 11,
          color: "#1E293B",
          textTransform: "uppercase",
          display: "block",
          marginBottom: 4,
        }}
      >
        Required Operational Steps:
      </strong>
      <ol
        style={{
          margin: "0 0 12px 0",
          paddingLeft: 18,
          fontSize: 11,
          color: "#334155",
          lineHeight: 1.5,
        }}
      >
        {exercise.instructions.map((inst, idx) => (
          <li key={idx}>{inst}</li>
        ))}
      </ol>

      {/* Target Console Jump Action */}
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="pvwa-btn pvwa-btn-secondary"
          style={{ width: "100%", justifyContent: "center", fontSize: 11 }}
          onClick={() => onJumpConsole?.(exercise.targetConsole)}
        >
          <Terminal size={13} />
          Open {exercise.targetConsole.toUpperCase()} Console
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Live State Evaluation Checklist */}
      <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <strong style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>
            Live Objective Status
          </strong>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: evaluation.completed ? "#137333" : "#B06000",
            }}
          >
            Score: {evaluation.score}/100
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {evaluation.objectives.slice(0, 3).map((obj: LabObjective) => (
            <div
              key={obj.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "6px 8px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 2,
                fontSize: 11,
              }}
            >
              <span style={{ color: obj.done ? "#137333" : "#B06000", marginTop: 1 }}>
                {obj.done ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
              </span>
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#1E293B", fontSize: 11 }}>{obj.description}</strong>
                {obj.evidence && (
                  <small style={{ display: "block", color: "#64748B", fontSize: 10 }}>
                    {obj.evidence}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`pvwa-btn ${evaluation.completed ? "pvwa-btn-primary" : "pvwa-btn-secondary"}`}
          style={{ width: "100%", justifyContent: "center", fontSize: 11 }}
          onClick={handleValidate}
        >
          <ClipboardCheck size={13} />
          Validate & Complete Exercise
        </button>
      </div>
    </div>
  );
};
