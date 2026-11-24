/**
 * SHADOWXLAB PAM ACADEMY — LESSON CONTENT RENDERER
 * Renders the 12 deep instructional sections of an enterprise PAM lesson
 * with crisp typography, ASCII architecture diagrams, component tables, and runbooks.
 */

import React from "react";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Layers,
  Wrench,
  Building2,
  FileText,
  Workflow,
  Terminal,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  Lock,
} from "lucide-react";
import type { Lesson } from "@/lib/academy/types";
import { evaluateLessonCheckpoint } from "@/lib/academy/progress";
import { VisualLearningCard } from "./visual/VisualLearningCard";
import { ArchitectureExplorer } from "./visual/ArchitectureExplorer";
import { WorkflowVisualizer, type WorkflowType } from "./visual/WorkflowVisualizer";
import { GuidedLabInstructor } from "./guided-lab-instructor";
import { evaluateLabObjectives, makeInitialPamState, type PamState } from "@/lib/pam-engine";

export interface LessonNavTarget {
  classId: string;
  moduleId: string;
  lessonId: string;
  label: string;
  title: string;
}

function getWorkflowForLesson(lesson: Lesson): WorkflowType {
  const consoleTarget = lesson.practicalExercise?.targetConsole;
  if (consoleTarget === "safes" || consoleTarget === "access") return "safe-auth";
  if (consoleTarget === "cpm" || consoleTarget === "troubleshooting") return "rotation";
  if (consoleTarget === "psm") return "session";
  if (lesson.id.startsWith("c02") || lesson.id.startsWith("m04")) return "safe-auth";
  if (lesson.id.startsWith("c05") || lesson.id.startsWith("m06")) return "rotation";
  if (lesson.id.startsWith("c06") || lesson.id.startsWith("m10") || lesson.id.startsWith("m11")) {
    return "session";
  }
  return "onboarding";
}

function getDefaultComponentForLesson(lesson: Lesson): string {
  const consoleTarget = lesson.practicalExercise?.targetConsole;
  if (consoleTarget === "cpm" || consoleTarget === "troubleshooting") return "cpm";
  if (consoleTarget === "psm") return "psm";
  if (
    consoleTarget === "accounts" ||
    consoleTarget === "discovery" ||
    consoleTarget === "policies"
  ) {
    return "pvwa";
  }
  if (lesson.id === "c01-m01-l01") return "workstation";
  if (lesson.id.startsWith("c04") || lesson.id.startsWith("m07")) return "target";
  return "vault";
}

interface LessonRendererProps {
  lesson: Lesson;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onJumpConsole?: (section: NonNullable<Lesson["practicalExercise"]>["targetConsole"]) => void;
  state?: PamState;
  completedExercises?: string[];
  completedIndependentPractices?: string[];
  savedAnswers?: Record<string, number>;
  onRecordExerciseComplete?: (exerciseId: string) => void;
  onRecordIndependentComplete?: (exerciseId: string) => void;
  onUpdateState?: (updater: (prev: PamState) => PamState) => void;
  prevLesson?: LessonNavTarget | null;
  nextLesson?: LessonNavTarget | null;
  onNavigateLesson?: (target: LessonNavTarget) => void;
  trackRemainingCount?: number;
  trackTitle?: string;
  moduleTitle?: string;
}

export const LessonRenderer: React.FC<LessonRendererProps> = ({
  lesson,
  isCompleted,
  onMarkComplete,
  onJumpConsole,
  state,
  completedExercises = [],
  completedIndependentPractices = [],
  savedAnswers = {},
  onRecordExerciseComplete,
  onRecordIndependentComplete,
  prevLesson = null,
  nextLesson = null,
  onNavigateLesson,
  trackRemainingCount = 0,
  trackTitle,
  moduleTitle,
}) => {
  const liveState = state || makeInitialPamState();
  const checkpointStatus = evaluateLessonCheckpoint(lesson.knowledgeCheck, savedAnswers);
  const labEvaluation = lesson.practicalExercise
    ? evaluateLabObjectives(liveState, lesson.practicalExercise.associatedLabId)
    : null;
  const exerciseValidated =
    !lesson.practicalExercise ||
    completedExercises.includes(lesson.practicalExercise.id) ||
    Boolean(labEvaluation?.completed);
  const canCompleteLesson = checkpointStatus.passed && exerciseValidated;

  function handleScrollToArchitecture() {
    const el = document.getElementById("architecture-explorer-section");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  function handleScrollToCheckpoint() {
    const el = document.getElementById("knowledge-checkpoint-section");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleScrollToLab() {
    const el = document.getElementById("practical-lab-workbench");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
      el.style.borderColor = "#0078D4";
      el.style.boxShadow = "0 0 0 3px rgba(0, 120, 212, 0.4)";
      setTimeout(() => {
        el.style.borderColor = "#0078D4";
        el.style.boxShadow = "0 2px 8px rgba(0, 120, 212, 0.08)";
      }, 2500);
    } else if (lesson.practicalExercise?.targetConsole) {
      onJumpConsole?.(lesson.practicalExercise.targetConsole);
    }
  }

  return (
    <div className="academy-center-reader">
      {/* Visual Learning Card Hero */}
      <VisualLearningCard
        lesson={lesson}
        isCompleted={isCompleted}
        onExploreArchitecture={handleScrollToArchitecture}
        onJumpLab={handleScrollToLab}
        onJumpConsole={onJumpConsole}
      />

      {/* 1. Concept Introduction, Prerequisites & Why It Exists */}
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <BookOpen size={16} className="text-[#0078D4]" />
          1. Concept Introduction &amp; Operational Rationale
        </h2>
        {lesson.prerequisites && lesson.prerequisites.length > 0 && (
          <div
            style={{
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              padding: "8px 12px",
              marginBottom: 10,
              fontSize: 11.5,
              color: "#334155",
            }}
          >
            <strong style={{ color: "#1E293B", textTransform: "uppercase", fontSize: 10.5 }}>
              Prerequisites:{" "}
            </strong>
            <span>{lesson.prerequisites.join(" · ")}</span>
          </div>
        )}
        <p className="academy-prose">{lesson.conceptIntroduction}</p>
        <div
          style={{
            background: "#F8FAFC",
            borderLeft: "3px solid #0078D4",
            padding: "10px 14px",
            marginBottom: 12,
          }}
        >
          <strong style={{ fontSize: 12, color: "#0078D4", display: "block", marginBottom: 4 }}>
            Why This Security Control Exists:
          </strong>
          <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.55 }}>
            {lesson.whyItExists}
          </p>
        </div>
      </section>

      {/* 2. Enterprise Architecture & Control Flow */}
      <section className="academy-section-block" id="architecture-explorer-section">
        <h2 className="academy-section-title">
          <Layers size={16} className="text-[#0078D4]" />
          2. Enterprise Architecture & Interactive Topology
        </h2>
        <p className="academy-prose">{lesson.architecture.overview}</p>

        {/* Interactive SVG Architecture Topology Explorer */}
        <ArchitectureExplorer
          initialComponent={getDefaultComponentForLesson(lesson)}
          onJumpConsole={onJumpConsole}
        />

        {/* Component Responsibilities Table */}
        <span
          style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}
        >
          Component Responsibilities & Network Security Boundaries:
        </span>
        <table className="academy-table">
          <thead>
            <tr>
              <th style={{ width: "22%" }}>Component</th>
              <th style={{ width: "42%" }}>Operational Role</th>
              <th style={{ width: "18%" }}>Protocols</th>
              <th style={{ width: "18%" }}>Security Boundary</th>
            </tr>
          </thead>
          <tbody>
            {lesson.architecture.componentResponsibilities.map((comp, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{comp.component}</strong>
                </td>
                <td>{comp.role}</td>
                <td>
                  <code>{comp.networkProtocols || "N/A"}</code>
                </td>
                <td style={{ fontSize: 11, color: "#64748B" }}>{comp.securityBoundary}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Step-by-Step Control Flow */}
        <span
          style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}
        >
          Step-by-Step Transaction Control Flow:
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {lesson.architecture.controlFlow.map((cf) => (
            <div
              key={cf.stepNumber}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 10px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 2,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#0078D4",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {cf.stepNumber}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <strong style={{ color: "#1E293B" }}>{cf.actor}</strong>
                  <span style={{ fontSize: 10, color: "#64748B" }}>{cf.channelOrProtocol}</span>
                </div>
                <p style={{ margin: "0 0 2px 0", color: "#334155" }}>{cf.action}</p>
                <small style={{ color: "#0078D4", fontStyle: "italic" }}>
                  Verification: {cf.verificationRule}
                </small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Operational Workflow Simulation & Procedures */}
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <Workflow size={16} className="text-[#0078D4]" />
          3. Operational Workflow Simulation &amp; Guided Procedures
        </h2>
        <WorkflowVisualizer workflowId={getWorkflowForLesson(lesson)} />

        {lesson.operationalProcedures && lesson.operationalProcedures.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <ClipboardList size={13} className="text-[#0078D4]" />
              Standard Operating Procedure (What Happens &amp; Expected Result):
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {lesson.operationalProcedures.map((proc) => (
                <div
                  key={proc.stepNumber}
                  style={{
                    padding: "8px 12px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderLeft: "3px solid #0078D4",
                    borderRadius: 2,
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>
                    Step {proc.stepNumber}: {proc.title}
                  </div>
                  <p style={{ margin: "0 0 3px 0", color: "#334155", lineHeight: 1.45 }}>
                    {proc.action}
                  </p>
                  <div style={{ fontSize: 11.5, color: "#0369A1" }}>
                    <strong>Expected Result:</strong> {proc.expectedResult}
                  </div>
                  {proc.operatorNotes && (
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                      <strong>Operator Note:</strong> {proc.operatorNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. Technical Terminology */}
      {lesson.terminology.length > 0 && (
        <section className="academy-section-block">
          <h2 className="academy-section-title">
            <FileText size={16} className="text-[#0078D4]" />
            4. Technical Terminology &amp; Core Concepts
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 10,
            }}
          >
            {lesson.terminology.map((term, idx) => (
              <div
                key={idx}
                style={{
                  padding: 10,
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 2,
                }}
              >
                <strong
                  style={{ fontSize: 13, color: "#0078D4", display: "block", marginBottom: 2 }}
                >
                  {term.term}
                </strong>
                <p
                  style={{ margin: "0 0 4px 0", fontSize: 12, color: "#334155", lineHeight: 1.45 }}
                >
                  {term.definition}
                </p>
                <small style={{ fontSize: 11, color: "#64748B", display: "block" }}>
                  <b>Enterprise Context:</b> {term.enterpriseContext}
                </small>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Administrator Responsibilities & Governance */}
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <Wrench size={16} className="text-[#0078D4]" />
          5. Administrator Responsibilities &amp; Operational Governance
        </h2>
        <div style={{ marginBottom: 12 }}>
          <strong style={{ fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>
            Daily Production Workflows:
          </strong>
          <ul
            style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#334155", lineHeight: 1.6 }}
          >
            {lesson.administratorResponsibilities.map((resp, idx) => (
              <li key={idx}>{resp}</li>
            ))}
          </ul>
        </div>

        {lesson.configurationAndAdministration.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <strong style={{ fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>
              Configuration Objects & Production Best Practices:
            </strong>
            <table className="academy-table">
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Parameter / Object</th>
                  <th style={{ width: "45%" }}>Technical Description</th>
                  <th style={{ width: "30%" }}>Production Best Practice</th>
                </tr>
              </thead>
              <tbody>
                {lesson.configurationAndAdministration.map((cfg, idx) => (
                  <tr key={idx}>
                    <td>
                      <code>{cfg.name}</code>
                    </td>
                    <td>{cfg.description}</td>
                    <td style={{ color: "#137333", fontWeight: 600 }}>
                      {cfg.productionBestPractice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 6. Real-World Enterprise Scenario */}
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <Building2 size={16} className="text-[#0078D4]" />
          6. Real-World Enterprise Scenario: {lesson.enterpriseScenario.organization}
        </h2>
        <p className="academy-prose">{lesson.enterpriseScenario.businessContext}</p>
        <div
          style={{
            padding: 10,
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 2,
          }}
        >
          <strong
            style={{
              fontSize: 11,
              color: "#64748B",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 4,
            }}
          >
            Mandatory Governance Controls:
          </strong>
          <ul
            style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#334155", lineHeight: 1.5 }}
          >
            {lesson.enterpriseScenario.governanceRequirements.map((gov, idx) => (
              <li key={idx}>{gov}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Failure Scenarios & Troubleshooting Runbook */}
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <AlertTriangle size={16} className="text-amber-600" />
          7. Failure Scenarios &amp; Systematic Troubleshooting Runbook
        </h2>

        {/* Failure Scenarios */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {lesson.failureScenarios.map((fail, idx) => (
            <div
              key={idx}
              style={{
                padding: 10,
                background: "#FEF7E0",
                border: "1px solid #FEEFC3",
                borderRadius: 2,
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <strong style={{ color: "#B06000" }}>Symptom: {fail.symptom}</strong>
                {fail.cyberArkCodeOrEvent && (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      background: "#FFFFFF",
                      padding: "1px 6px",
                      borderRadius: 2,
                      border: "1px solid #E2E8F0",
                      color: "#B06000",
                    }}
                  >
                    {fail.cyberArkCodeOrEvent}
                  </span>
                )}
              </div>
              <p style={{ margin: "2px 0 2px 0", color: "#334155" }}>
                <b>Root Cause:</b> {fail.rootCause}
              </p>
              <small style={{ color: "#C5221F", fontWeight: 600 }}>
                <b>Security Impact:</b> {fail.securityImpact}
              </small>
            </div>
          ))}
        </div>

        {/* Troubleshooting Runbook Table */}
        <span
          style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}
        >
          Structured Diagnostic & Remediation Procedure:
        </span>
        <table className="academy-table">
          <thead>
            <tr>
              <th style={{ width: "8%" }}>Step</th>
              <th style={{ width: "38%" }}>Diagnostic Action</th>
              <th style={{ width: "24%" }}>Log File / Console</th>
              <th style={{ width: "30%" }}>Remediation Procedure</th>
            </tr>
          </thead>
          <tbody>
            {lesson.troubleshootingRunbook.map((tr) => (
              <tr key={tr.stepNumber}>
                <td>
                  <strong>#{tr.stepNumber}</strong>
                </td>
                <td>{tr.diagnosticAction}</td>
                <td>
                  <code>{tr.logFileOrConsole}</code>
                </td>
                <td style={{ color: "#0078D4", fontWeight: 600 }}>{tr.remediation}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Diagnostic Evidence (Log Samples) */}
        {lesson.diagnosticEvidence && lesson.diagnosticEvidence.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Diagnostic Log Evidence & System Event Output:
            </span>
            {lesson.diagnosticEvidence.map((diag, idx) => (
              <div
                key={idx}
                style={{
                  background: "#0F172A",
                  color: "#E2E8F0",
                  padding: "10px 14px",
                  borderRadius: 4,
                  marginBottom: 8,
                  fontFamily: "monospace",
                  fontSize: 11,
                }}
              >
                <div
                  style={{
                    color: "#38BDF8",
                    fontWeight: 700,
                    marginBottom: 4,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Source: {diag.logFile}</span>
                </div>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#F87171" }}>
                  {diag.sampleOutput}
                </pre>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "#94A3B8",
                    fontStyle: "italic",
                    borderTop: "1px solid #1E293B",
                    paddingTop: 4,
                  }}
                >
                  Analysis: {diag.explanation}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructor Field Notes */}
        {lesson.instructorNotes && lesson.instructorNotes.length > 0 && (
          <div
            style={{
              background: "#EFF6FF",
              borderLeft: "3px solid #2563EB",
              padding: "10px 14px",
              marginTop: 12,
              borderRadius: "0 4px 4px 0",
            }}
          >
            <strong
              style={{
                fontSize: 11,
                color: "#1D4ED8",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 4,
              }}
            >
              Senior PAM Architect Field Notes:
            </strong>
            <ul
              style={{
                margin: 0,
                paddingLeft: 16,
                fontSize: 12,
                color: "#1E3A8A",
                lineHeight: 1.5,
              }}
            >
              {lesson.instructorNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 8. Security Implications & References */}
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <Shield size={16} className="text-[#0078D4]" />
          8. Security Implications &amp; Compliance Standards
        </h2>
        <ul
          style={{
            margin: "0 0 12px 0",
            paddingLeft: 18,
            fontSize: 12,
            color: "#334155",
            lineHeight: 1.6,
          }}
        >
          {lesson.securityImplications.map((sec, idx) => (
            <li key={idx}>{sec}</li>
          ))}
        </ul>

        <div
          style={{ fontSize: 11, color: "#64748B", borderTop: "1px solid #E2E8F0", paddingTop: 8 }}
        >
          <strong>Authoritative Industry References:</strong>
          <ul style={{ margin: "4px 0 0 0", paddingLeft: 18 }}>
            {lesson.references.map((ref, idx) => (
              <li key={idx}>{ref}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. Instructor-Led Guided Hands-On Lab Session & Live Validator */}
      {lesson.practicalExercise && (
        <section className="academy-section-block">
          <h2 className="academy-section-title">
            <Terminal size={16} className="text-[#0078D4]" />
            9. Guided Lab Session, Live Verification &amp; Independent Challenge
          </h2>
          <GuidedLabInstructor
            lesson={lesson}
            exercise={lesson.practicalExercise}
            state={liveState}
            trackTitle={trackTitle}
            moduleTitle={moduleTitle}
            isCompleted={Boolean(completedExercises.includes(lesson.practicalExercise.id))}
            isIndependentCompleted={Boolean(
              completedIndependentPractices.includes(lesson.practicalExercise.id),
            )}
            onRecordExerciseComplete={onRecordExerciseComplete || (() => {})}
            onRecordIndependentComplete={onRecordIndependentComplete}
            onJumpConsole={onJumpConsole}
          />
        </section>
      )}

      {/* 10. Lesson Completion Readiness & Progression Bar */}
      <div
        style={{
          marginTop: 24,
          padding: "16px",
          background: isCompleted ? "#F0FDF4" : "#F8FAFC",
          border: isCompleted ? "1px solid #86EFAC" : "1px solid #CBD5E1",
          borderTop: isCompleted ? "3px solid #16A34A" : "3px solid #0078D4",
          borderRadius: 3,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div>
            <strong style={{ fontSize: 12.5, color: "#0F172A", display: "block" }}>
              Lesson {lesson.number} Completion &amp; Competency Gate
            </strong>
            <span style={{ fontSize: 11.5, color: "#475569" }}>
              Status:{" "}
              <strong style={{ color: isCompleted ? "#15803D" : "#005A9E" }}>
                {isCompleted
                  ? "Completed"
                  : canCompleteLesson
                    ? "Ready to Complete"
                    : "Verification Pending"}
              </strong>
              {trackRemainingCount > 0
                ? ` · ${trackRemainingCount} lesson${trackRemainingCount === 1 ? "" : "s"} remaining in track`
                : " · All lessons in this track completed"}
            </span>
          </div>

          <button
            type="button"
            className={`pvwa-btn ${canCompleteLesson || isCompleted ? "pvwa-btn-primary" : "pvwa-btn-secondary"}`}
            onClick={onMarkComplete}
            title={
              canCompleteLesson
                ? "Record lesson completion"
                : "Pass the Knowledge Checkpoint and validate the Practical Lab to complete this lesson"
            }
          >
            {canCompleteLesson || isCompleted ? <CheckCircle2 size={14} /> : <Lock size={14} />}
            {isCompleted ? "Lesson Completed (Re-confirm)" : "Complete Lesson"}
          </button>
        </div>

        {/* Live Readiness Breakdown */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              padding: "8px 10px",
              background: "#FFFFFF",
              border: checkpointStatus.passed ? "1px solid #86EFAC" : "1px solid #E2E8F0",
              borderRadius: 2,
              fontSize: 11.5,
            }}
          >
            <div
              style={{ fontWeight: 700, color: checkpointStatus.passed ? "#15803D" : "#B45309" }}
            >
              {checkpointStatus.passed ? "✓" : "○"} Knowledge Checkpoint ({checkpointStatus.correct}
              /{checkpointStatus.total})
            </div>
            <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>
              {checkpointStatus.passed
                ? `Passed (${checkpointStatus.percent}%).`
                : `Score ${checkpointStatus.requiredCorrect}/${checkpointStatus.total} to pass.`}
            </div>
            {!checkpointStatus.passed && (
              <button
                type="button"
                className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                style={{ marginTop: 6, fontSize: 10, padding: "2px 8px" }}
                onClick={handleScrollToCheckpoint}
              >
                Go to Checkpoint
              </button>
            )}
          </div>

          {lesson.practicalExercise && (
            <div
              style={{
                padding: "8px 10px",
                background: "#FFFFFF",
                border: exerciseValidated ? "1px solid #86EFAC" : "1px solid #E2E8F0",
                borderRadius: 2,
                fontSize: 11.5,
              }}
            >
              <div style={{ fontWeight: 700, color: exerciseValidated ? "#15803D" : "#B45309" }}>
                {exerciseValidated ? "✓" : "○"} Practical Lab Validation (
                {labEvaluation?.score ?? 0}/100)
              </div>
              <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>
                {exerciseValidated
                  ? `Validated: ${lesson.practicalExercise.title}`
                  : "Complete live simulator objectives and validate."}
              </div>
              {!exerciseValidated && (
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                  style={{ marginTop: 6, fontSize: 10, padding: "2px 8px" }}
                  onClick={handleScrollToLab}
                >
                  Go to Practical Lab
                </button>
              )}
            </div>
          )}
        </div>

        {/* Completion Criteria Summary */}
        {lesson.completionCriteria && lesson.completionCriteria.length > 0 && (
          <div style={{ marginBottom: 12, fontSize: 11.5, color: "#334155" }}>
            <strong style={{ fontSize: 10.5, textTransform: "uppercase", color: "#64748B" }}>
              Lesson Mastery Criteria:
            </strong>
            <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.5 }}>
              {lesson.completionCriteria.map((criteria, idx) => (
                <li key={idx}>{criteria}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Linear Progression Navigation */}
        {(prevLesson || nextLesson) && onNavigateLesson && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              paddingTop: 10,
              borderTop: "1px solid #E2E8F0",
            }}
          >
            <div>
              {prevLesson && (
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                  onClick={() => onNavigateLesson(prevLesson)}
                >
                  <ArrowLeft size={13} />
                  Previous: {prevLesson.label}
                </button>
              )}
            </div>
            <div>
              {nextLesson && (
                <button
                  type="button"
                  className="pvwa-btn pvwa-btn-primary pvwa-btn-sm"
                  onClick={() => onNavigateLesson(nextLesson)}
                >
                  Next: {nextLesson.label}
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
