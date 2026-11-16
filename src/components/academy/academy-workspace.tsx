/**
 * SHADOWXLAB PAM ACADEMY — ACADEMY WORKSPACE (THREE-PANEL SYSTEM)
 * Reconstructs the Learning Academy into an enterprise-grade training system
 * featuring hierarchical tree navigation, deep instructional content, interactive
 * knowledge checkpoints, and live simulator exercise validation.
 */

import React, { useState, useEffect } from "react";
import { GraduationCap, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  ADMIN_MODULES_20,
  ACADEMY_CLASSES_V2,
  findClassById,
  getCurriculumMetrics,
} from "@/lib/academy/content";
import {
  DEFAULT_LEARNER_PROGRESS,
  loadLearnerProgress,
  saveLearnerProgress,
  markLessonComplete,
  recordCheckpointAnswer,
  recordExerciseComplete,
  resetLearnerProgress,
} from "@/lib/academy/progress";
import { LessonTree } from "./lesson-tree";
import { LessonRenderer } from "./lesson-renderer";
import { LearningObjectivesPanel } from "./visual/LearningObjectivesPanel";
import type { PamState } from "@/lib/pam-engine";

interface AcademyWorkspaceProps {
  state: PamState;
  onResetState: () => void;
  onJumpConsole?: (section: any) => void;
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
  const currentClass = findClassById(progress.currentClassId) || activeDataset[0];
  const currentModule =
    currentClass.modules.find((m) => m.id === progress.currentModuleId) || currentClass.modules[0];
  const currentLesson =
    currentModule.lessons.find((l) => l.id === progress.currentLessonId) ||
    currentModule.lessons[0];

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

  function handleMarkLessonComplete() {
    const updated = markLessonComplete(currentLesson.id);
    setProgress(updated);
    toast.success(`Lesson ${currentLesson.number} completed!`);
  }

  function handleRecordAnswer(qId: string, optIdx: number, isCorrect: boolean) {
    const updated = recordCheckpointAnswer(qId, optIdx, isCorrect);
    setProgress(updated);
  }

  function handleRecordExerciseComplete(exId: string) {
    const updated = recordExerciseComplete(exId);
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

  // Aggregate curriculum metrics
  const metrics = getCurriculumMetrics(currentTrack);
  const totalLessonsCount = metrics.totalLessons;
  const completedLessonsCount = progress.completedLessons.length;
  const overallPercentage =
    totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

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
            Curriculum Progress:{" "}
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
          onRecordExerciseComplete={handleRecordExerciseComplete}
          onUpdateState={onUpdateState}
        />

        {/* RIGHT PANEL: Objectives, Terminology, Knowledge Checkpoint & Simulator Lab */}
        <LearningObjectivesPanel
          lesson={currentLesson}
          state={state}
          completedExercises={progress.completedExercises}
          savedAnswers={progress.checkpointAnswers}
          onRecordAnswer={handleRecordAnswer}
          onRecordExerciseComplete={handleRecordExerciseComplete}
          onJumpConsole={onJumpConsole}
        />
      </div>
    </>
  );
};
