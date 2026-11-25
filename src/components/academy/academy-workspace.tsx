/**
 * SHADOWXLAB PAM ACADEMY — ACADEMY WORKSPACE (THREE-PANEL SYSTEM)
 * Reconstructs the Learning Academy into an enterprise-grade training system
 * featuring hierarchical tree navigation, deep instructional content, interactive
 * knowledge checkpoints, and live simulator exercise validation.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  GraduationCap,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Info,
  X,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import {
  ADMIN_MODULES_20,
  ACADEMY_CLASSES_V2,
  CLIENT_FOUNDATION_MODULES_12,
  CLIENT_FOUNDATION_SCHEDULE_5_DAYS,
  CLIENT_ASSESSMENT_FRAMEWORK,
  CLIENT_SCHEDULE_DISCREPANCIES,
  evaluateClientFoundationProgress,
  findClassById,
  getCurriculumMetrics,
  type CapstoneEvaluationReport,
  type CapstoneTaskSubmission,
} from "@/lib/academy/content";
import {
  DEFAULT_LEARNER_PROGRESS,
  evaluateLessonCheckpoint,
  loadLearnerProgress,
  saveLearnerProgress,
  markLessonComplete,
  recordCheckpointAnswer,
  resetCheckpointAnswersForQuestions,
  recordExerciseComplete,
  recordIndependentPracticeComplete,
  resetLearnerProgress,
} from "@/lib/academy/progress";
import { LessonTree } from "./lesson-tree";
import { LessonRenderer, type LessonNavTarget } from "./lesson-renderer";
import { LearningObjectivesPanel } from "./visual/LearningObjectivesPanel";
import { evaluateLabObjectives, type PamState } from "@/lib/pam-engine";

interface AcademyWorkspaceProps {
  state: PamState;
  onResetState: () => void;
  onJumpConsole?: (
    section:
      | "accounts"
      | "safes"
      | "cpm"
      | "psm"
      | "audit"
      | "policies"
      | "discovery"
      | "troubleshooting"
      | "overview"
      | "environment"
      | "access"
      | "assessments",
  ) => void;
  onUpdateState?: (updater: (prev: PamState) => PamState) => void;
}

export const AcademyWorkspace: React.FC<AcademyWorkspaceProps> = ({
  state,
  onResetState,
  onJumpConsole,
  onUpdateState,
}) => {
  const [progress, setProgress] = useState(DEFAULT_LEARNER_PROGRESS);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    setProgress(loadLearnerProgress());
  }, []);

  const currentTrack = progress.currentTrackId || "client-12";

  // Active Class / Module / Lesson resolution
  const activeDataset =
    currentTrack === "client-12"
      ? CLIENT_FOUNDATION_MODULES_12
      : currentTrack === "admin-20"
        ? ADMIN_MODULES_20
        : ACADEMY_CLASSES_V2;
  const currentClass =
    activeDataset.find((c) => c.id === progress.currentClassId) ||
    findClassById(progress.currentClassId) ||
    activeDataset[0];
  const currentModule =
    currentClass.modules.find((m) => m.id === progress.currentModuleId) || currentClass.modules[0];
  const currentLesson =
    currentModule.lessons.find((l) => l.id === progress.currentLessonId) ||
    currentModule.lessons[0];

  // Client assessment evaluation
  const clientAssessment = useMemo(() => {
    return evaluateClientFoundationProgress(progress);
  }, [progress]);

  // Build ordered linear lesson sequence for the active track
  const orderedTrackLessons: LessonNavTarget[] = useMemo(() => {
    const items: LessonNavTarget[] = [];
    for (const cls of activeDataset) {
      for (const mod of cls.modules) {
        for (const les of mod.lessons) {
          items.push({
            classId: cls.id,
            moduleId: mod.id,
            lessonId: les.id,
            label: `${cls.label} · Lesson ${les.number}`,
            title: les.title,
          });
        }
      }
    }
    return items;
  }, [activeDataset]);

  const currentLessonIdx = orderedTrackLessons.findIndex(
    (item) => item.lessonId === currentLesson.id,
  );
  const prevLesson = currentLessonIdx > 0 ? orderedTrackLessons[currentLessonIdx - 1] : null;
  const nextLesson =
    currentLessonIdx >= 0 && currentLessonIdx < orderedTrackLessons.length - 1
      ? orderedTrackLessons[currentLessonIdx + 1]
      : null;

  function handleSelectTrack(newTrack: "client-12" | "admin-20" | "intro-6") {
    const targetDataset =
      newTrack === "client-12"
        ? CLIENT_FOUNDATION_MODULES_12
        : newTrack === "admin-20"
          ? ADMIN_MODULES_20
          : ACADEMY_CLASSES_V2;
    const firstClass = targetDataset[0];
    const firstModule = firstClass.modules[0];
    const firstLesson = firstModule.lessons[0];

    const nextProgress = {
      ...progress,
      currentTrackId: newTrack,
      currentClassId: firstClass.id,
      currentModuleId: firstModule.id,
      currentLessonId: firstLesson.id,
    };
    setProgress(nextProgress);
    saveLearnerProgress(nextProgress);
    toast.info(
      newTrack === "client-12"
        ? "Switched to CyberArk Basic Training (12 Modules / 30 Hours)."
        : newTrack === "admin-20"
          ? "Switched to Flagship 20-Module Administrator Track."
          : "Switched to 6-Class Foundational Track.",
    );
  }

  function handleSelectClass(classId: string) {
    const cls = findClassById(classId);
    if (!cls) return;
    const firstMod = cls.modules[0];
    const firstLes = firstMod?.lessons[0];
    if (firstMod && firstLes) {
      const nextProgress = {
        ...progress,
        currentClassId: cls.id,
        currentModuleId: firstMod.id,
        currentLessonId: firstLes.id,
      };
      setProgress(nextProgress);
      saveLearnerProgress(nextProgress);
    }
  }

  function handleSelectLesson(classId: string, moduleId: string, lessonId: string) {
    const nextProgress = {
      ...progress,
      currentClassId: classId,
      currentModuleId: moduleId,
      currentLessonId: lessonId,
    };
    setProgress(nextProgress);
    saveLearnerProgress(nextProgress);
  }

  function handleNavigateLesson(target: LessonNavTarget) {
    handleSelectLesson(target.classId, target.moduleId, target.lessonId);
  }

  function handleMarkLessonComplete() {
    const checkpointStatus = evaluateLessonCheckpoint(
      currentLesson.knowledgeCheck,
      progress.checkpointAnswers,
    );
    const labEvaluation = currentLesson.practicalExercise
      ? evaluateLabObjectives(state, currentLesson.practicalExercise.associatedLabId)
      : null;
    const exerciseValidated =
      !currentLesson.practicalExercise ||
      progress.completedExercises.includes(currentLesson.practicalExercise.id) ||
      Boolean(labEvaluation?.completed);

    const capstoneValidated =
      currentLesson.id !== "cm12-l01" || Boolean(progress.capstoneReport?.passed);

    if (!checkpointStatus.passed || !exerciseValidated || !capstoneValidated) {
      const missing: string[] = [];
      if (!checkpointStatus.passed) {
        missing.push(
          `Knowledge Checkpoint (${checkpointStatus.correct}/${checkpointStatus.total}, need ${checkpointStatus.requiredCorrect})`,
        );
      }
      if (!exerciseValidated && currentLesson.practicalExercise) {
        missing.push(
          `Practical Lab validation (${labEvaluation?.score ?? 0}/100 in ${currentLesson.practicalExercise.targetConsole.toUpperCase()} console)`,
        );
      }
      if (!capstoneValidated) {
        missing.push("Capstone Project evaluation (>= 70% required)");
      }
      toast.error(
        `Complete required checks before finishing Lesson ${currentLesson.number}: ${missing.join(" and ")}.`,
      );
      return;
    }

    if (
      currentLesson.practicalExercise &&
      labEvaluation?.completed &&
      !progress.completedExercises.includes(currentLesson.practicalExercise.id)
    ) {
      recordExerciseComplete(currentLesson.practicalExercise.id);
    }

    const updated = markLessonComplete(currentLesson.id);
    setProgress(updated);
    toast.success(`Lesson ${currentLesson.number} completed and verified!`);
  }

  function handleRecordAnswer(qId: string, optIdx: number, isCorrect: boolean) {
    const updated = recordCheckpointAnswer(qId, optIdx, isCorrect);
    setProgress(updated);
  }

  function handleResetCheckpointAnswers(questionIds: string[]) {
    const updated = resetCheckpointAnswersForQuestions(questionIds);
    setProgress(updated);
  }

  function handleRecordExerciseComplete(exId: string) {
    const updated = recordExerciseComplete(exId);
    setProgress(updated);
  }

  function handleRecordIndependentComplete(exId: string) {
    const updated = recordIndependentPracticeComplete(exId);
    setProgress(updated);
  }

  function handleSaveCapstone(
    submissions: Record<number, CapstoneTaskSubmission>,
    report: CapstoneEvaluationReport,
  ) {
    const nextProgress: LearnerProgress = {
      ...progress,
      capstoneSubmissions: submissions,
      capstoneReport: report,
      lastUpdated: new Date().toISOString(),
    };
    saveLearnerProgress(nextProgress);
    setProgress(nextProgress);
    if (report.passed) {
      toast.success(`Capstone passed (${report.overallScore}%)! Competency Report generated.`);
    } else {
      toast.error(
        `Capstone score ${report.overallScore}% is below 70%. Review feedback and resubmit.`,
      );
    }
  }

  function handleFullReset() {
    if (confirm("Reset all lesson progress and simulation state?")) {
      const resetP = resetLearnerProgress();
      setProgress(resetP);
      onResetState();
      toast.info("Academy progress and simulation state reset to baseline.");
    }
  }

  // Track-scoped curriculum metrics
  const metrics = getCurriculumMetrics(currentTrack);
  const trackLessonIds = useMemo(
    () => new Set(orderedTrackLessons.map((item) => item.lessonId)),
    [orderedTrackLessons],
  );
  const totalLessonsCount = metrics.totalLessons;
  const completedLessonsCount = progress.completedLessons.filter((id) =>
    trackLessonIds.has(id),
  ).length;
  const remainingLessonsCount = Math.max(0, totalLessonsCount - completedLessonsCount);
  const overallPercentage =
    totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;
  const isTrackCompleted = totalLessonsCount > 0 && completedLessonsCount === totalLessonsCount;

  return (
    <>
      {/* Academy Top Header Bar */}
      <div className="pvwa-page-header">
        <div className="pvwa-page-title-block">
          <h1>
            <GraduationCap size={20} className="text-[#0078D4]" />
            Learning Academy
          </h1>
          <p>
            {currentTrack === "client-12"
              ? "SHADOWXLAB PAM ACADEMY · CyberArk Basic Training Client Version (12 Modules / 30 Hours)"
              : "SHADOWXLAB PAM ADMINISTRATOR ACADEMY · Enterprise Privileged Access Security Curriculum"}
          </p>
        </div>
        <div className="pvwa-toolbar">
          <span style={{ fontSize: 12, color: "#64748B", marginRight: 8 }}>
            {currentTrack === "client-12"
              ? "Foundation Track"
              : currentTrack === "admin-20"
                ? "Admin Track"
                : "Intro Track"}{" "}
            Progress:{" "}
            <strong>
              {completedLessonsCount}/{totalLessonsCount}
            </strong>{" "}
            Lessons ({overallPercentage}%)
          </span>
          {currentTrack === "client-12" && (
            <button
              type="button"
              className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
              onClick={() => setShowScheduleModal((prev) => !prev)}
              style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 8 }}
              title="5-Day Schedule & Assessment Framework"
            >
              <Calendar size={13} />
              Schedule & Assessment (30h)
            </button>
          )}
          <button
            type="button"
            className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
            onClick={handleFullReset}
            title="Reset training progress and simulation state"
          >
            <RotateCcw size={13} />
            Reset Progress
          </button>
        </div>
      </div>

      {/* 5-Day Schedule & Assessment Framework Drawer (when open) */}
      {showScheduleModal && (
        <div
          role="region"
          aria-label="Authoritative 5-Day Schedule and Assessment Framework"
          style={{
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderRadius: 4,
            padding: 16,
            marginBottom: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={18} className="text-[#0078D4]" />
              <strong style={{ fontSize: 14, color: "#0F172A" }}>
                Authoritative 5-Day Training Schedule & Assessment Framework (30 Hours)
              </strong>
            </div>
            <button
              type="button"
              className="pvwa-btn pvwa-btn-secondary pvwa-btn-sm"
              onClick={() => setShowScheduleModal(false)}
            >
              <X size={14} /> Close
            </button>
          </div>

          {/* Schedule Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {CLIENT_FOUNDATION_SCHEDULE_5_DAYS.map((day) => (
              <div
                key={day.dayNumber}
                style={{
                  background: day.discrepancy ? "#FEF3C7" : "#F8FAFC",
                  border: day.discrepancy ? "1px solid #F59E0B" : "1px solid #E2E8F0",
                  borderRadius: 4,
                  padding: 10,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 12, color: "#1E293B", marginBottom: 4 }}>
                  Day {day.dayNumber} ({day.printedDurationHours} Hours printed)
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>{day.title}</div>
                <div style={{ fontSize: 10, color: "#64748B" }}>
                  Modules:{" "}
                  {day.moduleNumbers.map((n) => `M${String(n).padStart(2, "0")}`).join(", ")}
                </div>
                {day.discrepancy && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#B45309",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <AlertTriangle size={11} />
                    Module sum: {day.moduleSumDurationHours}h (
                    {day.discrepancy.discrepancyHours > 0
                      ? `+${day.discrepancy.discrepancyHours}h`
                      : `${day.discrepancy.discrepancyHours}h`}{" "}
                    discrepancy surfaced)
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Schedule Discrepancies Details */}
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderLeft: "4px solid #D97706",
              borderRadius: 3,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 11.5,
              color: "#92400E",
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <Info size={14} />
              Schedule Discrepancy Notice (Surfaced Verbatim for Owner Approval)
            </div>
            <div>
              <strong>Day 4: </strong>Printed day duration is 6h, while the sum of Modules 8 (3h), 9
              (2h), and 10 (2h) is 7h (+1h).
              <br />
              <strong>Day 5: </strong>Printed day duration is 6h, while the sum of Module 11 (2h)
              and Module 12 Capstone (3h) is 5h (-1h).
              <br />
              <strong>Net Impact: </strong>The 5-day training total remains precisely 30 hours (6 +
              6 + 6 + 7 + 5 = 30h).
            </div>
          </div>

          {/* Assessment Framework Breakdown */}
          <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 12 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 12,
                color: "#0F172A",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Award size={15} className="text-[#0078D4]" />
              Weighted Assessment Framework (Total 100% · Passing Score: 70%)
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 8,
              }}
            >
              {clientAssessment.domainScores.map((domain) => (
                <div
                  key={domain.domainId}
                  style={{
                    background: domain.passed ? "#F0FDF4" : "#F8FAFC",
                    border: domain.passed ? "1px solid #86EFAC" : "1px solid #CBD5E1",
                    borderRadius: 3,
                    padding: 8,
                    fontSize: 11,
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#1E293B" }}>
                    {domain.title} ({domain.weightPercentage}%)
                  </div>
                  <div style={{ color: "#64748B", fontSize: 10, marginTop: 2 }}>
                    Earned: {domain.earnedPercentage}% (Contribution:{" "}
                    {domain.weightedScoreContribution} pts)
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      color: domain.passed ? "#16A34A" : "#D97706",
                    }}
                  >
                    {domain.passed ? "Domain Passed" : "In Progress"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: "#334155" }}>
              <strong>Overall Score: </strong>
              {clientAssessment.overallScorePercentage}% / 100% · <strong>Verdict: </strong>
              <span
                style={{
                  fontWeight: 700,
                  color: clientAssessment.isPassed ? "#16A34A" : "#D97706",
                }}
              >
                {clientAssessment.isPassed
                  ? "PASSING (>= 70%)"
                  : "PROGRESSING (< 70% passing threshold)"}
              </span>
            </div>
          </div>
        </div>
      )}

      {isTrackCompleted && (
        <div
          role="status"
          style={{
            background: "#F0FDF4",
            border: "1px solid #86EFAC",
            borderLeft: "4px solid #16A34A",
            borderRadius: 2,
            padding: "10px 14px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            fontSize: 12,
            color: "#166534",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={16} />
            <span>
              <strong>
                {currentTrack === "client-12"
                  ? "CyberArk Basic Training Programme Completed!"
                  : currentTrack === "admin-20"
                    ? "20-Module Administrator Track Completed!"
                    : "6-Class Foundational Track Completed!"}
              </strong>{" "}
              All {totalLessonsCount} lessons, checkpoints, and simulator validations have been
              recorded.
            </span>
          </div>
          {currentTrack === "client-12" && (
            <button
              type="button"
              className="pvwa-btn pvwa-btn-primary pvwa-btn-sm"
              onClick={() => setShowScheduleModal(true)}
            >
              View Capstone & Competency Report
            </button>
          )}
          {currentTrack === "intro-6" && (
            <button
              type="button"
              className="pvwa-btn pvwa-btn-primary pvwa-btn-sm"
              onClick={() => handleSelectTrack("admin-20")}
            >
              Continue to 20-Module Admin Track
            </button>
          )}
        </div>
      )}

      {/* Three-Panel Learning Layout */}
      <div className="academy-three-panel-layout">
        {/* LEFT PANEL: Class -> Module -> Lesson Tree */}
        <LessonTree
          currentClass={currentClass}
          currentLesson={currentLesson}
          completedLessons={progress.completedLessons}
          currentTrack={currentTrack}
          onSelectTrack={handleSelectTrack}
          onSelectClass={handleSelectClass}
          onSelectLesson={handleSelectLesson}
        />

        {/* CENTER PANEL: In-Depth Instructional Lesson Reader with Visual Architecture & Workflows */}
        <LessonRenderer
          lesson={currentLesson}
          isCompleted={progress.completedLessons.includes(currentLesson.id)}
          onMarkComplete={handleMarkLessonComplete}
          onJumpConsole={onJumpConsole}
          state={state}
          completedExercises={progress.completedExercises}
          completedIndependentPractices={progress.completedIndependentPractices || []}
          savedAnswers={progress.checkpointAnswers}
          onRecordExerciseComplete={handleRecordExerciseComplete}
          onRecordIndependentComplete={handleRecordIndependentComplete}
          onUpdateState={onUpdateState}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          onNavigateLesson={handleNavigateLesson}
          trackRemainingCount={remainingLessonsCount}
          trackTitle={
            currentTrack === "client-12"
              ? "CyberArk Basic Training (12 Modules / 30h)"
              : currentTrack === "admin-20"
                ? "20-Module Administrator Track"
                : "6-Class Foundational Track"
          }
          moduleTitle={`${currentClass.label}: ${currentClass.title}`}
          capstoneSubmissions={progress.capstoneSubmissions}
          capstoneReport={progress.capstoneReport}
          onSaveCapstone={handleSaveCapstone}
        />

        {/* RIGHT PANEL: Objectives, Terminology, Knowledge Checkpoint & Simulator Lab */}
        <LearningObjectivesPanel
          lesson={currentLesson}
          state={state}
          completedExercises={progress.completedExercises}
          savedAnswers={progress.checkpointAnswers}
          onRecordAnswer={handleRecordAnswer}
          onResetAnswers={handleResetCheckpointAnswers}
          onRecordExerciseComplete={handleRecordExerciseComplete}
          onJumpConsole={onJumpConsole}
        />
      </div>
    </>
  );
};
