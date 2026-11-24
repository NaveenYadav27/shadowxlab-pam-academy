/**
 * SHADOWXLAB PAM ACADEMY — ACADEMY WORKSPACE (THREE-PANEL SYSTEM)
 * Reconstructs the Learning Academy into an enterprise-grade training system
 * featuring hierarchical tree navigation, deep instructional content, interactive
 * knowledge checkpoints, and live simulator exercise validation.
 */

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, GraduationCap, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  ADMIN_MODULES_20,
  ACADEMY_CLASSES_V2,
  findClassById,
  getCurriculumMetrics,
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

  useEffect(() => {
    setProgress(loadLearnerProgress());
  }, []);

  const currentTrack = progress.currentTrackId || "admin-20";

  // Active Class / Module / Lesson resolution
  const activeDataset = currentTrack === "admin-20" ? ADMIN_MODULES_20 : ACADEMY_CLASSES_V2;
  const currentClass =
    activeDataset.find((c) => c.id === progress.currentClassId) ||
    findClassById(progress.currentClassId) ||
    activeDataset[0];
  const currentModule =
    currentClass.modules.find((m) => m.id === progress.currentModuleId) || currentClass.modules[0];
  const currentLesson =
    currentModule.lessons.find((l) => l.id === progress.currentLessonId) ||
    currentModule.lessons[0];

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

  function handleSelectTrack(newTrack: "admin-20" | "intro-6") {
    const targetDataset = newTrack === "admin-20" ? ADMIN_MODULES_20 : ACADEMY_CLASSES_V2;
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
      newTrack === "admin-20"
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

    if (!checkpointStatus.passed || !exerciseValidated) {
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
            SHADOWXLAB PAM ADMINISTRATOR ACADEMY · Enterprise Privileged Access Security Curriculum
          </p>
        </div>
        <div className="pvwa-toolbar">
          <span style={{ fontSize: 12, color: "#64748B", marginRight: 8 }}>
            {currentTrack === "admin-20" ? "Admin Track" : "Intro Track"} Progress:{" "}
            <strong>
              {completedLessonsCount}/{totalLessonsCount}
            </strong>{" "}
            Lessons ({overallPercentage}%)
          </span>
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
                {currentTrack === "admin-20"
                  ? "20-Module Administrator Track Completed!"
                  : "6-Class Foundational Track Completed!"}
              </strong>{" "}
              All {totalLessonsCount} lessons, checkpoints, and simulator validations have been
              recorded.
            </span>
          </div>
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
            currentTrack === "admin-20"
              ? "20-Module Administrator Track"
              : "6-Class Foundational Track"
          }
          moduleTitle={`${currentClass.label}: ${currentClass.title}`}
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
