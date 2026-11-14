/**
 * SHADOWXLAB PAM ACADEMY — ACADEMY WORKSPACE (THREE-PANEL SYSTEM)
 * Reconstructs the Learning Academy into an enterprise-grade training system
 * featuring hierarchical tree navigation, deep instructional content, interactive
 * knowledge checkpoints, and live simulator exercise validation.
 */

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  RotateCcw,
  BookOpen,
  Terminal,
  Shield,
  Layers,
  KeyRound,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ACADEMY_CLASSES_V2, findClassById, findLessonById } from "@/lib/academy/content";
import {
  loadLearnerProgress,
  saveLearnerProgress,
  markLessonComplete,
  recordCheckpointAnswer,
  recordExerciseComplete,
  resetLearnerProgress,
} from "@/lib/academy/progress";
import { LessonTree } from "./lesson-tree";
import { LessonRenderer } from "./lesson-renderer";
import { KnowledgeCheckpoint } from "./knowledge-checkpoint";
import { PracticalExerciseCard } from "./practical-exercise-card";
import type { PamState } from "@/lib/pam-engine";

interface AcademyWorkspaceProps {
  state: PamState;
  onResetState: () => void;
  onJumpConsole?: (section: "accounts" | "safes" | "cpm" | "psm" | "audit") => void;
}

export const AcademyWorkspace: React.FC<AcademyWorkspaceProps> = ({
  state,
  onResetState,
  onJumpConsole,
}) => {
  const [progress, setProgress] = useState(loadLearnerProgress());

  // Active Class, Module, Lesson
  const currentClass = findClassById(progress.currentClassId) || ACADEMY_CLASSES_V2[0];
  const currentModule =
    currentClass.modules.find((m) => m.id === progress.currentModuleId) || currentClass.modules[0];
  const currentLesson =
    currentModule.lessons.find((l) => l.id === progress.currentLessonId) ||
    currentModule.lessons[0];

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
  const totalLessonsCount = ACADEMY_CLASSES_V2.reduce(
    (acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0),
    0,
  );
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
          onSelectClass={handleSelectClass}
          onSelectLesson={handleSelectLesson}
        />

        {/* CENTER PANEL: In-Depth Instructional Lesson Reader */}
        <LessonRenderer
          lesson={currentLesson}
          isCompleted={progress.completedLessons.includes(currentLesson.id)}
          onMarkComplete={handleMarkLessonComplete}
          onJumpConsole={onJumpConsole}
        />

        {/* RIGHT PANEL: Objectives, Knowledge Checkpoint & Simulator Lab */}
        <div className="academy-right-sidebar">
          {/* Operations Console Quick Jump Shortcuts */}
          <div className="pvwa-academy-card" style={{ marginBottom: 12 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Quick Jump to Operations Console:
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                style={{ fontSize: 10, justifyContent: "center" }}
                onClick={() => onJumpConsole?.("safes")}
              >
                Safes Console
              </button>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                style={{ fontSize: 10, justifyContent: "center" }}
                onClick={() => onJumpConsole?.("accounts")}
              >
                Accounts Console
              </button>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                style={{ fontSize: 10, justifyContent: "center" }}
                onClick={() => onJumpConsole?.("cpm")}
              >
                CPM Console
              </button>
              <button
                type="button"
                className="pvwa-btn pvwa-btn-sm pvwa-btn-secondary"
                style={{ fontSize: 10, justifyContent: "center" }}
                onClick={() => onJumpConsole?.("psm")}
              >
                PSM Console
              </button>
            </div>
          </div>

          {/* Practical Operational Exercise Card */}
          {currentLesson.practicalExercise && (
            <PracticalExerciseCard
              exercise={currentLesson.practicalExercise}
              state={state}
              isCompleted={progress.completedExercises.includes(currentLesson.practicalExercise.id)}
              onRecordExerciseComplete={handleRecordExerciseComplete}
              onJumpConsole={onJumpConsole}
            />
          )}

          {/* Interactive Knowledge Checkpoint */}
          <KnowledgeCheckpoint
            questions={currentLesson.knowledgeCheck}
            savedAnswers={progress.checkpointAnswers}
            onRecordAnswer={handleRecordAnswer}
          />
        </div>
      </div>
    </>
  );
};
