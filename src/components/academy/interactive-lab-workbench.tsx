/**
 * SHADOWXLAB PAM ACADEMY — INTERACTIVE PRACTICAL LAB WORKBENCH
 * Embedded operational learning workbench providing interactive task execution,
 * simulated CLI/PACLI terminal output, live simulator state evaluation,
 * and seamless navigation to live operational consoles.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Terminal,
  Play,
  CheckCircle2,
  Clock3,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  ClipboardCheck,
  Laptop,
  CheckSquare,
  Square,
  Lightbulb,
  Wrench,
  Compass,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  evaluateLabObjectives,
  type LabEvaluationResult,
  type LabObjective,
  type PamState,
} from "@/lib/pam-engine";
import type {
  FailureScenario,
  PracticalExercise,
  PracticalStepDetail,
  PracticalTroubleshootingHint,
  TroubleshootingStep,
} from "@/lib/academy/types";

interface InteractiveLabWorkbenchProps {
  exercise: PracticalExercise;
  state: PamState;
  isCompleted: boolean;
  onRecordExerciseComplete: (exerciseId: string) => void;
  isIndependentCompleted?: boolean;
  onRecordIndependentComplete?: (exerciseId: string) => void;
  onJumpConsole?: (section: any) => void;
  onUpdateState?: (updater: (prev: PamState) => PamState) => void;
  lessonFailureScenarios?: FailureScenario[];
  lessonRunbook?: TroubleshootingStep[];
}

export const InteractiveLabWorkbench: React.FC<InteractiveLabWorkbenchProps> = ({
  exercise,
  state,
  isCompleted,
  onRecordExerciseComplete,
  isIndependentCompleted = false,
  onRecordIndependentComplete,
  onJumpConsole,
  onUpdateState,
  lessonFailureScenarios = [],
  lessonRunbook = [],
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [simulating, setSimulating] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[] | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [revealedFixes, setRevealedFixes] = useState<Record<number, boolean>>({});
  const [independentChecks, setIndependentChecks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setCheckedSteps({});
    setSimulating(false);
    setTerminalOutput(null);
    setValidationError(null);
    setHintLevel(0);
    setRevealedFixes({});
    setIndependentChecks({});
  }, [exercise.id]);

  const associatedLabId = exercise.associatedLabId || "";
  const evaluation: LabEvaluationResult = useMemo(
    () => evaluateLabObjectives(state, associatedLabId),
    [state, associatedLabId],
  );

  const troubleshootingHints: PracticalTroubleshootingHint[] = useMemo(() => {
    if (exercise.troubleshootingHints && exercise.troubleshootingHints.length > 0) {
      return exercise.troubleshootingHints;
    }
    return lessonFailureScenarios.slice(0, 2).map((scenario, idx) => ({
      symptom: scenario.symptom,
      hint: `Inspect ${lessonRunbook[idx]?.logFileOrConsole || exercise.targetConsole.toUpperCase()} for: ${scenario.rootCause}`,
      correctiveAction:
        lessonRunbook[idx]?.remediation ||
        `Verify all pending simulator objectives in the ${exercise.targetConsole.toUpperCase()} console and re-validate.`,
    }));
  }, [exercise, lessonFailureScenarios, lessonRunbook]);

  const steps: PracticalStepDetail[] = useMemo(() => {
    if (exercise.stepDetails && exercise.stepDetails.length > 0) {
      return exercise.stepDetails;
    }
    return exercise.instructions.map((action) => ({ action }));
  }, [exercise.instructions, exercise.stepDetails]);

  function toggleStep(idx: number) {
    setCheckedSteps((prev) => {
      const updated = { ...prev, [idx]: !prev[idx] };
      const count = Object.values(updated).filter(Boolean).length;
      if (updated[idx]) {
        toast.info(`Step ${idx + 1} marked done (${count}/${steps.length}).`);
      }
      return updated;
    });
  }

  function handleRunSimulation() {
    setSimulating(true);
    setTerminalOutput([
      `[TELEMETRY] Initializing read-only diagnostic preview for ${exercise.title}...`,
      `[TARGET] Querying simulated Vault control plane for '${exercise.targetConsole.toUpperCase()}'...`,
    ]);

    setTimeout(() => {
      const generatedLogs = generateSimulationLogs(exercise, state);
      setTerminalOutput(generatedLogs);
      setSimulating(false);

      if (onUpdateState) {
        onUpdateState((prev) => ({
          ...prev,
          audit: [
            {
              id: `audit-${Date.now()}`,
              time: new Date().toLocaleTimeString("en-US", { hour12: false }),
              actor: "pam_admin",
              action: `Telemetry Preview: ${exercise.title.slice(0, 22)}`,
              target: exercise.targetConsole.toUpperCase(),
              result: "Success",
              detail: `Read-only diagnostic telemetry inspected for ${exercise.id}`,
            },
            ...prev.audit,
          ],
        }));
      }

      toast.info(
        "Diagnostic telemetry captured. Execute live operations in the console to satisfy simulator objectives.",
      );
    }, 500);
  }

  function handleValidateLab() {
    if (evaluation.completed) {
      setValidationError(null);
      onRecordExerciseComplete(exercise.id);
      toast.success(
        `Lab validated against live simulator state (${evaluation.score}/100): ${exercise.title}.`,
      );
      return;
    }

    const pendingObjectives = evaluation.objectives.filter((obj) => !obj.done);
    const pendingList = pendingObjectives.map((obj) => obj.description).join("; ");
    setValidationError(
      `${pendingObjectives.length} simulator objective${pendingObjectives.length === 1 ? "" : "s"} still pending: ${pendingList}`,
    );
    if (hintLevel === 0 && troubleshootingHints.length > 0) {
      setHintLevel(1);
    }
    toast.error(
      `Validation failed (${evaluation.score}/100). Complete pending simulator objectives before recording completion.`,
    );
  }

  function handleRetryReset() {
    setCheckedSteps({});
    setValidationError(null);
    setTerminalOutput(null);
    toast.info("Checklist reset. Open the live console to retry the operational steps.");
  }

  function handleConfirmIndependentPractice() {
    if (!exercise.independentPractice) return;
    const criteria = exercise.independentPractice.successCriteria;
    const checkedCount = criteria.filter((_, idx) => Boolean(independentChecks[idx])).length;
    if (checkedCount < criteria.length) {
      toast.error(
        `Verify all ${criteria.length} independent practice success criteria (${checkedCount}/${criteria.length} checked).`,
      );
      return;
    }
    onRecordIndependentComplete?.(exercise.id);
    toast.success(`Independent practice completed: ${exercise.independentPractice.title}`);
  }

  const stepsDoneCount = Object.values(checkedSteps).filter(Boolean).length;
  const pendingObjectives = evaluation.objectives.filter((obj) => !obj.done);
  const isLabVerified = isCompleted || evaluation.completed;

  return (
    <div
      id="practical-lab-workbench"
      className="pvwa-academy-card"
      style={{
        border: "1px solid #0078D4",
        borderRadius: 4,
        background: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(0, 120, 212, 0.08)",
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(90deg, #001A33 0%, #002B4D 100%)",
          color: "#FFFFFF",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          borderBottom: "2px solid #0078D4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              background: "rgba(0, 120, 212, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60A5FA",
              flexShrink: 0,
            }}
          >
            <Terminal size={18} />
          </div>
          <div>
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "#93C5FD",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Guided Hands-On Lab &amp; Live Validator
            </span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>
              {exercise.title}
            </h3>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            className="pvwa-status-pill"
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              color: "#E2E8F0",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              fontSize: 10,
            }}
          >
            CONSOLE: {exercise.targetConsole.toUpperCase()}
          </span>
          <span
            className="pvwa-status-pill managed"
            style={{
              background: isLabVerified ? "#137333" : "#B06000",
              color: "#FFFFFF",
              border: "none",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {isLabVerified ? "VALIDATED" : `${evaluation.score}% VERIFIED`}
          </span>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Honest Simulator Scope Note (if applicable) */}
        {exercise.simulationLimitationNote && (
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderLeft: "3px solid #D97706",
              padding: "8px 12px",
              marginBottom: 12,
              fontSize: 11.5,
              color: "#92400E",
              lineHeight: 1.45,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Simulator Scope Note: </strong>
              {exercise.simulationLimitationNote}
            </div>
          </div>
        )}

        {/* Objective, Scenario, Prerequisites & Starting State */}
        <div
          style={{
            background: "#F8FAFC",
            borderLeft: "3px solid #0078D4",
            padding: "10px 14px",
            marginBottom: 14,
            fontSize: 12,
            color: "#334155",
            lineHeight: 1.5,
          }}
        >
          {exercise.objective && (
            <div style={{ marginBottom: 6 }}>
              <strong style={{ color: "#0F172A", fontSize: 11, textTransform: "uppercase" }}>
                Lab Objective:{" "}
              </strong>
              <span>{exercise.objective}</span>
            </div>
          )}
          <strong
            style={{
              display: "block",
              color: "#0078D4",
              marginBottom: 3,
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            Operational Scenario
          </strong>
          <div>{exercise.scenario}</div>

          {(exercise.startingState ||
            (exercise.prerequisites && exercise.prerequisites.length > 0)) && (
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid #E2E8F0",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 8,
                fontSize: 11.5,
              }}
            >
              {exercise.startingState && (
                <div>
                  <strong
                    style={{
                      color: "#1E293B",
                      display: "block",
                      fontSize: 10.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Starting Environment State
                  </strong>
                  <span style={{ color: "#475569" }}>{exercise.startingState}</span>
                </div>
              )}
              {exercise.prerequisites && exercise.prerequisites.length > 0 && (
                <div>
                  <strong
                    style={{
                      color: "#1E293B",
                      display: "block",
                      fontSize: 10.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Prerequisites
                  </strong>
                  <ul style={{ margin: "2px 0 0 0", paddingLeft: 16, color: "#475569" }}>
                    {exercise.prerequisites.map((pre, i) => (
                      <li key={i}>{pre}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step-by-Step Guided Execution */}
        <div style={{ marginBottom: 16 }}>
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
            <strong style={{ fontSize: 11, color: "#1E293B", textTransform: "uppercase" }}>
              Guided Execution Steps ({stepsDoneCount}/{steps.length} tracked)
            </strong>
            <span style={{ fontSize: 11, color: "#64748B" }}>
              Execute in live simulator console · click steps to track progress
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {steps.map((step, idx) => {
              const isChecked = Boolean(checkedSteps[idx]);
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 12px",
                    background: isChecked ? "#F0FDF4" : "#FFFFFF",
                    border: isChecked ? "1px solid #86EFAC" : "1px solid #E2E8F0",
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ color: isChecked ? "#16A34A" : "#94A3B8", marginTop: 1 }}>
                    {isChecked ? <CheckSquare size={15} /> : <Square size={15} />}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: isChecked ? "#15803D" : "#334155",
                      lineHeight: 1.45,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, marginRight: 6 }}>Step {idx + 1}:</span>
                      <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>
                        {step.action}
                      </span>
                    </div>
                    {step.explanation && (
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>
                        <strong>Why:</strong> {step.explanation}
                      </div>
                    )}
                    {step.expectedResult && (
                      <div style={{ fontSize: 11, color: "#0369A1", marginTop: 2 }}>
                        <strong>Expected Result:</strong> {step.expectedResult}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Toolbar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <button
            type="button"
            className="pvwa-btn pvwa-btn-primary"
            style={{ justifyContent: "center", fontSize: 12, padding: "8px 14px" }}
            onClick={() => {
              onJumpConsole?.(exercise.targetConsole);
              toast.info(
                `Opened ${exercise.targetConsole.toUpperCase()} Console. Complete the guided steps, then return to validate.`,
              );
            }}
          >
            <Laptop size={14} />
            Open {exercise.targetConsole.toUpperCase()} Console
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            className="pvwa-btn pvwa-btn-secondary"
            style={{ justifyContent: "center", fontSize: 12, padding: "8px 14px" }}
            onClick={handleRunSimulation}
            disabled={simulating}
          >
            <Play size={14} className={simulating ? "animate-spin" : "text-[#0078D4]"} />
            {simulating ? "Capturing Telemetry..." : "Run Diagnostic Telemetry Preview"}
          </button>
        </div>

        {/* Diagnostic Telemetry Preview Output */}
        {terminalOutput && (
          <div
            style={{
              background: "#0A101D",
              color: "#38BDF8",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 11.5,
              padding: "12px 14px",
              borderRadius: 3,
              marginBottom: 16,
              border: "1px solid #1E293B",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                borderBottom: "1px solid #1E293B",
                paddingBottom: 4,
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: 10, textTransform: "uppercase" }}>
                Read-Only Diagnostic Telemetry Preview
              </span>
              <span style={{ color: "#22C55E", fontSize: 10 }}>● SIMULATED OUTPUT</span>
            </div>
            {terminalOutput.map((line, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 3,
                  color: line.startsWith("[OK]")
                    ? "#4ADE80"
                    : line.startsWith("[ERR]")
                      ? "#F87171"
                      : line.startsWith(">")
                        ? "#FBBF24"
                        : "#94A3B8",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Live Simulator Validation Matrix (ALL objectives shown) */}
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 3,
            padding: "12px",
            marginBottom: 14,
          }}
        >
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
            <div>
              <strong style={{ fontSize: 11, color: "#1E293B", textTransform: "uppercase" }}>
                Live Simulator Validation ({evaluation.objectives.filter((o) => o.done).length}/
                {evaluation.objectives.length} Objectives Passed)
              </strong>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                Success Criteria: {exercise.validationCriteria}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: evaluation.completed ? "#16A34A" : "#B06000",
              }}
            >
              Simulator Score: {evaluation.score}/100
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {evaluation.objectives.map((obj: LabObjective) => (
              <div
                key={obj.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "6px 10px",
                  background: obj.done ? "#F0FDF4" : "#FFFFFF",
                  border: obj.done ? "1px solid #BBF7D0" : "1px solid #E2E8F0",
                  borderRadius: 2,
                  fontSize: 11.5,
                }}
              >
                <span style={{ color: obj.done ? "#16A34A" : "#D97706", marginTop: 1 }}>
                  {obj.done ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: "#1E293B" }}>{obj.description}</span>
                  {obj.evidence && (
                    <small
                      style={{ display: "block", color: "#64748B", fontSize: 10.5, marginTop: 1 }}
                    >
                      Evidence: {obj.evidence}
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Error + Retry Feedback */}
        {validationError && !evaluation.completed && (
          <div
            role="alert"
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderLeft: "3px solid #DC2626",
              padding: "10px 12px",
              marginBottom: 12,
              fontSize: 11.5,
              color: "#991B1B",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
              <AlertCircle size={14} />
              Validation Not Yet Passed ({pendingObjectives.length} Pending)
            </div>
            <p style={{ margin: "4px 0 8px 0", lineHeight: 1.45 }}>{validationError}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                onClick={() => onJumpConsole?.(exercise.targetConsole)}
              >
                Retry in {exercise.targetConsole.toUpperCase()} Console
              </button>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                onClick={handleRetryReset}
              >
                <RotateCcw size={12} />
                Reset Step Checklist
              </button>
            </div>
          </div>
        )}

        {/* Validate Button */}
        <button
          type="button"
          className={`pvwa-btn ${evaluation.completed ? "pvwa-btn-primary" : "pvwa-btn-secondary"}`}
          style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "9px" }}
          onClick={handleValidateLab}
        >
          <ClipboardCheck size={15} />
          {isCompleted
            ? "Lab Validated (Click to Re-Verify Live State)"
            : "Validate Simulator State & Record Lab Completion"}
        </button>

        {/* STEP 5: Progressive Troubleshooting Hints */}
        {troubleshootingHints.length > 0 && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: 3,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 6,
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
                <Wrench size={13} />
                Troubleshooting &amp; Progressive Hints
              </strong>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                style={{ fontSize: 10.5, padding: "2px 8px" }}
                onClick={() =>
                  setHintLevel((prev) => (prev < troubleshootingHints.length ? prev + 1 : 0))
                }
              >
                <Lightbulb size={12} />
                {hintLevel === 0
                  ? "Show Troubleshooting Hint"
                  : hintLevel < troubleshootingHints.length
                    ? `Show Next Hint (${hintLevel}/${troubleshootingHints.length})`
                    : "Hide Hints"}
              </button>
            </div>

            {hintLevel > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {troubleshootingHints.slice(0, hintLevel).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #FDE68A",
                      borderRadius: 2,
                      padding: "8px 10px",
                      fontSize: 11.5,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#92400E" }}>
                      Symptom {idx + 1}: {item.symptom}
                    </div>
                    <div style={{ color: "#334155", marginTop: 3 }}>
                      <strong>Hint:</strong> {item.hint}
                    </div>
                    {revealedFixes[idx] ? (
                      <div style={{ color: "#0369A1", marginTop: 4 }}>
                        <strong>Corrective Action:</strong> {item.correctiveAction}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                        style={{ marginTop: 6, fontSize: 10, padding: "2px 8px" }}
                        onClick={() => setRevealedFixes((prev) => ({ ...prev, [idx]: true }))}
                      >
                        Reveal Corrective Action
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: Independent Practice (Reduced Guidance) */}
        {exercise.independentPractice && (
          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              background: "#F8FAFC",
              border: "1px solid #CBD5E1",
              borderLeft: "3px solid #203142",
              borderRadius: 3,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <strong
                style={{
                  fontSize: 11,
                  color: "#203142",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Compass size={13} />
                Independent Practice (Reduced Guidance)
              </strong>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 2,
                  background: isIndependentCompleted ? "#DCFCE7" : "#E2E8F0",
                  color: isIndependentCompleted ? "#166534" : "#334155",
                }}
              >
                {isIndependentCompleted ? "COMPLETED" : "FOLLOW-UP CHALLENGE"}
              </span>
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
              {exercise.independentPractice.title}
            </div>
            <p style={{ margin: "0 0 6px 0", fontSize: 12, color: "#334155", lineHeight: 1.45 }}>
              {exercise.independentPractice.scenario}
            </p>
            <p style={{ margin: "0 0 8px 0", fontSize: 11.5, color: "#005A9E" }}>
              <strong>Goal:</strong> {exercise.independentPractice.goal}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
              {exercise.independentPractice.successCriteria.map((criterion, idx) => {
                const checked = isIndependentCompleted || Boolean(independentChecks[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => setIndependentChecks((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      padding: "6px 8px",
                      background: checked ? "#F0FDF4" : "#FFFFFF",
                      border: checked ? "1px solid #86EFAC" : "1px solid #E2E8F0",
                      borderRadius: 2,
                      fontSize: 11.5,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ color: checked ? "#16A34A" : "#94A3B8", marginTop: 1 }}>
                      {checked ? <CheckSquare size={14} /> : <Square size={14} />}
                    </span>
                    <span style={{ color: "#334155" }}>{criterion}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                onClick={() => onJumpConsole?.(exercise.independentPractice?.targetConsole)}
              >
                Open {exercise.independentPractice.targetConsole.toUpperCase()} Console
                <ArrowRight size={12} />
              </button>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-primary pvwa-btn-sm"
                onClick={handleConfirmIndependentPractice}
              >
                <CheckCircle2 size={12} />
                {isIndependentCompleted
                  ? "Independent Practice Recorded"
                  : "Record Independent Practice"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Generates realistic CLI/API output based on the specific exercise domain
 */
function generateSimulationLogs(exercise: PracticalExercise, state: PamState): string[] {
  const consoleName = exercise.targetConsole.toLowerCase();
  const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });

  if (consoleName === "access" || exercise.id.includes("02")) {
    return [
      `> PACLI LOGON VAULT="Vault-Corp-PAM-01" USER="pam_admin" AUTH_METHOD=SAML`,
      `[OK] ${timeStr} Authenticated administrative session established.`,
      `> PACLI GETUSERS DETAILS=YES FILTER="ROLES"`,
      `------------------------------------------------------------------------`,
      `Username          Assigned Role          Auth Method      Status`,
      `------------------------------------------------------------------------`,
      `pam_admin         Vault Master Admin     SAML 2.0         Active`,
      `dba_user          Database Operator      SAML 2.0         Active`,
      `windows_admin     Tier-1 Server Admin    RADIUS/PKI       Active`,
      `auditor           Security Auditor       SAML 2.0         Active`,
      `cpm_user          CPM Background Engine  Internal Auth    Active`,
      `psm_user          PSM Gateway Broker     Internal Auth    Active`,
      `------------------------------------------------------------------------`,
      `[OK] Role inspection complete: 6 user identities audited. Least-privilege role boundaries verified.`,
      `[AUDIT] Cryptographic event recorded in Event ID 2044: Role inspection completed.`,
    ];
  }

  if (consoleName === "safes" || exercise.id.includes("04")) {
    return [
      `> PACLI OPENSAFE SAFE="DBA-SAFE" USER="pam_admin"`,
      `[OK] ${timeStr} Safe 'DBA-SAFE' opened successfully.`,
      `> PACLI SAFEMEMBERS SAFE="DBA-SAFE"`,
      `------------------------------------------------------------------------`,
      `Member Username   Permissions                     Owner Status`,
      `------------------------------------------------------------------------`,
      `pam_admin         Full Administrator (13 rights)  Accountable Owner`,
      `dba_user          List, Use, Initiate Session     Authorized Operator`,
      `auditor           List accounts                   Read-Only Auditor`,
      `------------------------------------------------------------------------`,
      `[OK] Least-privilege validation confirmed: Retrieve Accounts withheld from dba_user.`,
      `[AUDIT] Safe governance verified for DBA-SAFE.`,
    ];
  }

  if (consoleName === "accounts" || exercise.id.includes("05") || exercise.id.includes("07")) {
    return [
      `> Get-PASAccount -Safe "WIN-SAFE" | Format-Table Id, Username, Address, PlatformId`,
      `------------------------------------------------------------------------`,
      `Id            Username        Address         PlatformId`,
      `------------------------------------------------------------------------`,
      `account-1     Administrator   WIN-SRV-01      Windows-90d`,
      `account-2     root            LINUX-PRD-01    UnixSSH-30d`,
      `account-3     svc_backup      WIN-SRV-02      Windows-90d`,
      `account-4     db_admin        SQL-PRD-01      MS-SQL-30d`,
      `------------------------------------------------------------------------`,
      `[OK] Account metadata and target platform linkages validated. Total accounts: ${state.accounts.length}.`,
      `[AUDIT] Accounts inventory verified against target platforms.`,
    ];
  }

  if (
    consoleName === "cpm" ||
    exercise.id.includes("06") ||
    exercise.id.includes("18") ||
    exercise.id.includes("19")
  ) {
    return [
      `> CACPM012I Starting automated credential management cycle for target WIN-SRV-01...`,
      `[OK] ${timeStr} Dispatched CPM task to agent 'CPM-PROD-01'.`,
      `> CACPM243I Verifying password hash on remote SAM/Active Directory endpoint...`,
      `[OK] Handshake established over TCP 445 (SMB) & 135 (RPC).`,
      `[OK] Credential verified successfully. Next rotation scheduled per policy: 90 days.`,
      `[AUDIT] Audit ID: audit-${Date.now()}: CPM Verify completed successfully.`,
    ];
  }

  if (
    consoleName === "psm" ||
    exercise.id.includes("08") ||
    exercise.id.includes("10") ||
    exercise.id.includes("11")
  ) {
    return [
      `> PSMSR015I Initializing isolated privileged session proxy via PSM-SRV-01...`,
      `[OK] ${timeStr} Listening on isolated proxy port TCP 3389.`,
      `[OK] Video recording engine initialized: codec=AVC444, resolution=1920x1080.`,
      `[OK] Keystroke capture filter enabled: real-time behavioral audit active.`,
      `[OK] Target authenticated without releasing cleartext password to operator workstation.`,
      `[AUDIT] Session session-${Date.now()} active and monitored.`,
    ];
  }

  // Generic / Overview fallback
  return [
    `> Test-PAMComponentHealth -Component "${exercise.targetConsole.toUpperCase()}"`,
    `[OK] ${timeStr} Digital Vault connectivity active on TCP 1858.`,
    `[OK] PVWA Web Application Gateway: HEALTHY (Latency: 8ms).`,
    `[OK] CPM Management Service: ONLINE (0 queue backlog).`,
    `[OK] PSM Session Proxy: HEALTHY (Active sessions: ${state.sessions.length}).`,
    `[OK] Operational exercise '${exercise.title}' pre-flight check complete.`,
    `[AUDIT] Evidence recorded in Vault transaction log.`,
  ];
}
