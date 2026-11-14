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
} from "lucide-react";
import type { Lesson } from "@/lib/academy/types";

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
  return (
    <div className="academy-center-reader">
      {/* 1. Lesson Header */}
      <div className="academy-lesson-header">
        <span className="academy-lesson-tag">
          Lesson {lesson.number} · Enterprise Core Curriculum
        </span>
        <h1>{lesson.title}</h1>
        <p className="subtitle">{lesson.subtitle}</p>

        <div className="academy-meta-pills">
          <span className="academy-meta-pill">
            <Clock size={13} />
            {lesson.estimatedMinutes} Mins Duration
          </span>
          {lesson.prerequisites.map((prereq, idx) => (
            <span key={idx} className="academy-meta-pill">
              <KeyRound size={12} />
              Prereq: {prereq}
            </span>
          ))}
          {isCompleted && (
            <span
              className="academy-meta-pill"
              style={{ background: "#E6F4EA", borderColor: "#CEEAD6", color: "#137333" }}
            >
              <CheckCircle2 size={13} />
              Lesson Completed
            </span>
          )}
        </div>

        {/* Learning Objectives */}
        <div
          style={{
            marginTop: 14,
            padding: 12,
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 2,
          }}
        >
          <strong style={{ fontSize: 12, color: "#1E293B", display: "block", marginBottom: 6 }}>
            Core Learning Objectives:
          </strong>
          <ul
            style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#334155", lineHeight: 1.6 }}
          >
            {lesson.learningObjectives.map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </div>
      </div>

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
      <section className="academy-section-block">
        <h2 className="academy-section-title">
          <Layers size={16} className="text-[#0078D4]" />
          2. Enterprise Architecture & Control Flow
        </h2>
        <p className="academy-prose">{lesson.architecture.overview}</p>

        {lesson.architecture.diagramAscii && (
          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
              }}
            >
              Technical Protocol & Component Architecture:
            </span>
            <pre className="pvwa-arch-box">{lesson.architecture.diagramAscii}</pre>
          </div>
        )}

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

      {/* 4. Technical Terminology */}
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
