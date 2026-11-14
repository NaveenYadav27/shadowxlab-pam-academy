/**
 * SHADOWXLAB PAM ACADEMY — LESSON CONTENT RENDERER
 * Renders the 12 deep instructional sections of an enterprise PAM lesson
 * with crisp typography, ASCII architecture diagrams, component tables, and runbooks.
 */

import React from "react";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Shield,
  Layers,
  Wrench,
  Building2,
  FileText,
  KeyRound,
  Workflow,
} from "lucide-react";
import type { Lesson } from "@/lib/academy/types";
import { VisualLearningCard } from "./visual/VisualLearningCard";
import { ArchitectureExplorer } from "./visual/ArchitectureExplorer";
import { WorkflowVisualizer, type WorkflowType } from "./visual/WorkflowVisualizer";

function getWorkflowForLesson(num: string): WorkflowType {
  if (num.startsWith("2.")) return "safe-auth";
  if (num.startsWith("3.")) return "onboarding";
  if (num.startsWith("4.")) return "onboarding";
  if (num.startsWith("5.")) return "rotation";
  if (num.startsWith("6.")) return "session";
  return "onboarding";
}

function getDefaultComponentForLesson(num: string): string {
  if (num.startsWith("1.1")) return "workstation";
  if (num.startsWith("1.2")) return "vault";
  if (num.startsWith("2.")) return "vault";
  if (num.startsWith("3.")) return "pvwa";
  if (num.startsWith("4.")) return "target";
  if (num.startsWith("5.")) return "cpm";
  if (num.startsWith("6.")) return "psm";
  return "vault";
}

interface LessonRendererProps {
  lesson: Lesson;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onJumpConsole?: (section: "accounts" | "safes" | "cpm" | "psm" | "audit") => void;
}

export const LessonRenderer: React.FC<LessonRendererProps> = ({
  lesson,
  isCompleted,
  onMarkComplete,
  onJumpConsole,
}) => {
  function handleScrollToArchitecture() {
    const el = document.getElementById("architecture-explorer-section");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  function handleScrollToLab() {
    const el = document.getElementById("lesson-completion-section");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="academy-center-reader">
      {/* Visual Learning Card Hero */}
      <VisualLearningCard
        lesson={lesson}
        isCompleted={isCompleted}
        onExploreArchitecture={handleScrollToArchitecture}
        onJumpLab={handleScrollToLab}
      />

      {/* 2. Concept Introduction & Why It Exists */}
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <BookOpen size={16} className="text-[#0078D4]" />
          1. Concept Introduction & Operational Rationale
        </h2>
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

      {/* 3. Enterprise Architecture & Control Flow */}
      <section className="academy-section-block" id="architecture-explorer-section">
        <h2 className="academy-section-title">
          <Layers size={16} className="text-[#0078D4]" />
          2. Enterprise Architecture & Interactive Topology
        </h2>
        <p className="academy-prose">{lesson.architecture.overview}</p>

        {/* Interactive SVG Architecture Topology Explorer */}
        <ArchitectureExplorer
          initialComponent={getDefaultComponentForLesson(lesson.number)}
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

      {/* 4. Operational Workflow Simulation */}
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <Workflow size={16} className="text-[#0078D4]" />
          3. Stepwise Operational Workflow Simulation
        </h2>
        <WorkflowVisualizer workflowId={getWorkflowForLesson(lesson.number)} />
      </section>

      {/* 5. Technical Terminology */}
      {lesson.terminology.length > 0 && (
        <section className="academy-section-block">
          <h2 className="academy-section-title">
            <FileText size={16} className="text-[#0078D4]" />
            3. Technical Terminology & Core Concepts
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
          4. Administrator Responsibilities & Operational Governance
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
          5. Real-World Enterprise Scenario: {lesson.enterpriseScenario.organization}
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
          6. Failure Scenarios & Systematic Troubleshooting Runbook
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
      </section>

      {/* 8. Security Implications & References */}
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <Shield size={16} className="text-[#0078D4]" />
          7. Security Implications & Compliance Standards
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

      {/* 9. Completion Action Bar */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "2px solid #E2E8F0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontSize: 12, color: "#64748B" }}>
            Lesson Status: <strong>{isCompleted ? "Completed" : "In Progress"}</strong>
          </span>
        </div>
        <button type="button" className="pvwa-btn pvwa-btn-primary" onClick={onMarkComplete}>
          <CheckCircle2 size={14} />
          {isCompleted ? "Review & Re-confirm Lesson" : "Mark Lesson as Completed"}
        </button>
      </div>
    </div>
  );
};
