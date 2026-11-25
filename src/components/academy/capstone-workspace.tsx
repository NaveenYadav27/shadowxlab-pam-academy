/**
 * SHADOWXLAB PAM ACADEMY — MODULE 12 CAPSTONE WORKSPACE
 * Student-facing 5-task Capstone Project interface connected directly to
 * CLIENT_CAPSTONE_PROJECT and evaluateCapstoneProject(state, submissions).
 */

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import type { PamState } from "@/lib/pam-engine";
import {
  CLIENT_CAPSTONE_PROJECT,
  evaluateCapstoneProject,
  type CapstoneEvaluationReport,
  type CapstoneTaskSubmission,
} from "@/lib/academy/content/client-foundation/capstone";
import type { PracticalExercise } from "@/lib/academy/types";

interface CapstoneWorkspaceProps {
  state: PamState;
  savedSubmissions?: Record<number, CapstoneTaskSubmission> | undefined;
  savedReport?: CapstoneEvaluationReport | undefined;
  onSaveCapstone: (
    submissions: Record<number, CapstoneTaskSubmission>,
    report: CapstoneEvaluationReport,
  ) => void;
  onJumpConsole?: ((section: PracticalExercise["targetConsole"]) => void) | undefined;
}

export const CapstoneWorkspace: React.FC<CapstoneWorkspaceProps> = ({
  state,
  savedSubmissions,
  savedReport,
  onSaveCapstone,
  onJumpConsole,
}) => {
  const [submissions, setSubmissions] = useState<Record<number, CapstoneTaskSubmission>>(() => {
    const initial: Record<number, CapstoneTaskSubmission> = {};
    for (const task of CLIENT_CAPSTONE_PROJECT.tasks) {
      initial[task.taskNumber] = savedSubmissions?.[task.taskNumber] || {
        taskNumber: task.taskNumber,
        completed: false,
        notes: "",
        evidenceItems: [],
      };
    }
    return initial;
  });

  const [report, setReport] = useState<CapstoneEvaluationReport | null>(savedReport || null);

  function updateTaskNotes(taskNumber: 1 | 2 | 3 | 4 | 5, notes: string) {
    setSubmissions((prev) => ({
      ...prev,
      [taskNumber]: {
        taskNumber,
        completed: notes.trim().length > 0 || Boolean(prev[taskNumber]?.completed),
        notes,
        evidenceItems: notes
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      },
    }));
  }

  function toggleTaskReady(taskNumber: 1 | 2 | 3 | 4 | 5, completed: boolean) {
    setSubmissions((prev) => ({
      ...prev,
      [taskNumber]: {
        taskNumber,
        completed,
        notes: prev[taskNumber]?.notes || "",
        evidenceItems: prev[taskNumber]?.evidenceItems || [],
      },
    }));
  }

  function handleEvaluateCapstone() {
    const evaluated = evaluateCapstoneProject(state, submissions);
    setReport(evaluated);
    onSaveCapstone(submissions, evaluated);
  }

  return (
    <div
      id="capstone-project-workspace"
      style={{
        marginTop: 20,
        marginBottom: 20,
        padding: 16,
        background: "#F8FAFC",
        border: "1px solid #CBD5E1",
        borderTop: "3px solid #0078D4",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#0078D4",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Module 12 Capstone Project · 20% Assessment Weight · 70% Passing Threshold
          </div>
          <h3 style={{ margin: "2px 0 4px 0", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
            {CLIENT_CAPSTONE_PROJECT.title}
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.45 }}>
            {CLIENT_CAPSTONE_PROJECT.scenario}
          </p>
        </div>

        {report && (
          <div
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              background: report.passed ? "#DCFCE7" : "#FEF2F2",
              border: report.passed ? "1px solid #86EFAC" : "1px solid #FECACA",
              color: report.passed ? "#166534" : "#991B1B",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {report.verdict} · {report.overallScore}% (Min {report.minimumPassingScore}%)
          </div>
        )}
      </div>

      {/* Live Simulator Evidence Snapshot */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 8,
          marginBottom: 14,
          padding: 10,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 4,
          fontSize: 11,
        }}
      >
        <div>
          <strong style={{ color: "#334155" }}>Accounts:</strong>{" "}
          <span style={{ color: "#0078D4", fontWeight: 600 }}>{state.accounts.length}</span>
        </div>
        <div>
          <strong style={{ color: "#334155" }}>Safes:</strong>{" "}
          <span style={{ color: "#0078D4", fontWeight: 600 }}>{state.safes.length}</span>
        </div>
        <div>
          <strong style={{ color: "#334155" }}>CPM Ops:</strong>{" "}
          <span style={{ color: "#0078D4", fontWeight: 600 }}>{state.cpmOperations.length}</span>
        </div>
        <div>
          <strong style={{ color: "#334155" }}>Audit Events:</strong>{" "}
          <span style={{ color: "#0078D4", fontWeight: 600 }}>{state.audit.length}</span>
        </div>
        <div>
          <strong style={{ color: "#334155" }}>Resolved Incidents:</strong>{" "}
          <span style={{ color: "#0078D4", fontWeight: 600 }}>
            {state.incidents.filter((i) => i.status === "Resolved").length}/{state.incidents.length}
          </span>
        </div>
      </div>

      {/* 5 Client-Defined Capstone Tasks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CLIENT_CAPSTONE_PROJECT.tasks.map((task) => {
          const sub = submissions[task.taskNumber];
          const taskResult = report?.taskScores.find((t) => t.taskNumber === task.taskNumber);
          return (
            <div
              key={task.taskNumber}
              style={{
                padding: 12,
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{task.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {taskResult && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 12,
                        background: taskResult.passed ? "#DCFCE7" : "#FEF2F2",
                        color: taskResult.passed ? "#166534" : "#991B1B",
                      }}
                    >
                      {taskResult.passed ? "PASS" : "NEEDS WORK"} ({taskResult.score}%)
                    </span>
                  )}
                  {onJumpConsole && (
                    <button
                      type="button"
                      className="pvwa-btn"
                      style={{ fontSize: 11, padding: "3px 8px" }}
                      onClick={() => onJumpConsole(task.consoleTarget)}
                    >
                      Open {task.consoleTarget.toUpperCase()}
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>

              <p style={{ margin: "0 0 6px 0", fontSize: 12, color: "#334155" }}>
                <strong>Requirement:</strong> {task.requirement}
              </p>
              <p style={{ margin: "0 0 8px 0", fontSize: 11, color: "#64748B" }}>
                <strong>Deliverable:</strong> {task.deliverable}
              </p>

              <textarea
                aria-label={`Capstone Task ${task.taskNumber} evidence and documentation`}
                rows={2}
                placeholder={`Document your configuration & evidence for Task ${task.taskNumber}...`}
                value={sub?.notes || ""}
                onChange={(e) => updateTaskNotes(task.taskNumber, e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  fontSize: 12,
                  border: "1px solid #CBD5E1",
                  borderRadius: 3,
                  marginBottom: 6,
                  fontFamily: "inherit",
                }}
              />

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(sub?.completed)}
                  onChange={(e) => toggleTaskReady(task.taskNumber, e.target.checked)}
                />
                Mark Task {task.taskNumber} deliverable ready for evaluation
              </label>

              {taskResult && (
                <div
                  style={{
                    marginTop: 6,
                    padding: "6px 8px",
                    background: taskResult.passed ? "#F0FDF4" : "#FFFBEB",
                    border: taskResult.passed ? "1px solid #BBF7D0" : "1px solid #FDE68A",
                    borderRadius: 3,
                    fontSize: 11,
                    color: taskResult.passed ? "#166534" : "#92400E",
                  }}
                >
                  {taskResult.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Evaluate / Resubmit Button */}
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          className="pvwa-btn pvwa-btn-primary"
          onClick={handleEvaluateCapstone}
          style={{ fontSize: 12, padding: "7px 14px" }}
        >
          {report ? <RefreshCw size={14} /> : <ClipboardCheck size={14} />}
          {report ? "Re-evaluate Capstone Project" : "Evaluate Capstone Project"}
        </button>
        <span style={{ fontSize: 11, color: "#64748B" }}>
          Evaluates live PamState + your 5 task submissions via{" "}
          <code>evaluateCapstoneProject()</code>.
        </span>
      </div>

      {/* Capstone Competency Report */}
      {report && (
        <div
          role="region"
          aria-label="Capstone Competency Report"
          style={{
            marginTop: 14,
            padding: 12,
            background: "#FFFFFF",
            border: report.passed ? "1px solid #86EFAC" : "1px solid #FCA5A5",
            borderRadius: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            {report.passed ? (
              <Award size={18} className="text-[#16A34A]" />
            ) : (
              <AlertTriangle size={18} className="text-[#DC2626]" />
            )}
            <strong style={{ fontSize: 13, color: "#0F172A" }}>
              Capstone Competency Report — {report.verdict} ({report.overallScore}% /{" "}
              {report.minimumPassingScore}% Required)
            </strong>
          </div>
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>
            Tasks Passed: {report.completedTasks} / {report.totalTasks} · Evaluated:{" "}
            {new Date(report.evaluatedAt).toLocaleString()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {report.taskScores.map((t) => (
              <div
                key={t.taskNumber}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}
              >
                {t.passed ? (
                  <CheckCircle2 size={13} className="text-[#16A34A]" />
                ) : (
                  <AlertTriangle size={13} className="text-[#DC2626]" />
                )}
                <span>
                  <strong>Task {t.taskNumber}:</strong> {t.title} — {t.score}% ({t.feedback})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
