import React from "react";
import {
  VaultServerSvg,
  PvwaPortalSvg,
  CpmEngineSvg,
  PsmProxySvg,
  SafeContainerSvg,
  PrivilegedAccountSvg,
  IdentityGovernanceSvg,
  PasswordRotationSvg,
  PrivilegedSessionSvg,
  AuditComplianceSvg,
} from "./pam-svg-icons";
import {
  Clock,
  CheckCircle,
  HelpCircle,
  ArrowDownCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { Lesson } from "@/lib/academy/types";

interface VisualLearningCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  onExploreArchitecture?: () => void;
  onJumpLab?: () => void;
}

export const VisualLearningCard: React.FC<VisualLearningCardProps> = ({
  lesson,
  isCompleted,
  onExploreArchitecture,
  onJumpLab,
}) => {
  // Determine relevant visual icon based on lesson number and title
  function getVisualIcon() {
    const num = lesson.number;
    if (num.startsWith("1.1")) return <IdentityGovernanceSvg size={76} highlighted />;
    if (num.startsWith("1.2")) return <VaultServerSvg size={76} highlighted />;
    if (num.startsWith("2.1")) return <SafeContainerSvg size={76} highlighted />;
    if (num.startsWith("2.2")) return <AuditComplianceSvg size={76} highlighted />;
    if (num.startsWith("3.1")) return <PrivilegedAccountSvg size={76} highlighted />;
    if (num.startsWith("4.1")) return <IdentityGovernanceSvg size={76} highlighted />;
    if (num.startsWith("5.1")) return <PasswordRotationSvg size={76} highlighted />;
    if (num.startsWith("6.1")) return <PrivilegedSessionSvg size={76} highlighted />;
    return <VaultServerSvg size={76} highlighted />;
  }

  return (
    <div className="visual-learning-hero-card">
      <div className="visual-learning-card-inner">
        {/* Left Side: Illustrative Visual Component & Status */}
        <div className="visual-card-artwork">
          <div className="visual-card-icon-wrapper">{getVisualIcon()}</div>
          <div className="visual-card-status-badge">
            {isCompleted ? (
              <span className="badge-completed">
                <CheckCircle size={12} />
                COMPLETED
              </span>
            ) : (
              <span className="badge-in-progress">
                <Sparkles size={12} />
                READY TO LEARN
              </span>
            )}
          </div>
        </div>

        {/* Center & Right: Concept Metadata & Objectives */}
        <div className="visual-card-body">
          <div className="visual-card-eyebrow">
            <span>LESSON {lesson.number} · CORE ENTERPRISE CURRICULUM</span>
            <div className="visual-card-meta-tags">
              <span className="meta-tag">
                <Clock size={11} />
                {lesson.estimatedMinutes} Mins Duration
              </span>
              <span className="meta-tag">
                <HelpCircle size={11} />
                {lesson.knowledgeCheck.length} Checkpoints
              </span>
            </div>
          </div>

          <h1 className="visual-card-title">{lesson.title}</h1>
          <p className="visual-card-subtitle">{lesson.subtitle}</p>

          <p className="visual-card-summary">{lesson.conceptIntroduction.slice(0, 220)}...</p>

          {/* Real-World Operational Relevance */}
          <div className="visual-card-relevance-box">
            <strong>Enterprise Operational Rationale:</strong> {lesson.whyItExists.slice(0, 260)}...
          </div>

          {/* Interactive Exploration Entry Points */}
          <div className="visual-card-actions">
            <button
              type="button"
              className="pvwa-btn pvwa-btn-primary pvwa-btn-sm"
              onClick={onExploreArchitecture}
              title="Jump to Interactive Architecture Explorer"
            >
              <ArrowDownCircle size={13} />
              Interactive Topology Explorer
            </button>
            {lesson.practicalExercise && (
              <button
                type="button"
                className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
                onClick={onJumpLab}
                title="Launch Simulator Lab"
              >
                <ExternalLink size={13} />
                Practical Lab: {lesson.practicalExercise.title}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
