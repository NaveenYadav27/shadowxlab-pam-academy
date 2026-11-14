/**
 * SHADOWXLAB PAM ACADEMY — LEARNER PROGRESS & STATE ENGINE
 * Provides robust localStorage persistence and reactive synchronization for course
 * progression, checkpoint answers, and simulator exercise completion.
 */

import type { LearnerProgress } from "./types";

const PROGRESS_STORAGE_KEY = "shadowxlab_pam_academy_progress_v3";

export const DEFAULT_LEARNER_PROGRESS: LearnerProgress = {
  currentClassId: "class-01",
  currentModuleId: "c01-m01",
  currentLessonId: "c01-m01-l01",
  completedLessons: [],
  checkpointAnswers: {},
  checkpointScores: {},
  completedExercises: [],
  lastUpdated: new Date().toISOString(),
};

export function loadLearnerProgress(): LearnerProgress {
  if (typeof window === "undefined") {
    return DEFAULT_LEARNER_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_LEARNER_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<LearnerProgress>;
    return {
      currentClassId: parsed.currentClassId || DEFAULT_LEARNER_PROGRESS.currentClassId,
      currentModuleId: parsed.currentModuleId || DEFAULT_LEARNER_PROGRESS.currentModuleId,
      currentLessonId: parsed.currentLessonId || DEFAULT_LEARNER_PROGRESS.currentLessonId,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      checkpointAnswers: parsed.checkpointAnswers || {},
      checkpointScores: parsed.checkpointScores || {},
      completedExercises: Array.isArray(parsed.completedExercises) ? parsed.completedExercises : [],
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to load learner progress from storage:", err);
    return DEFAULT_LEARNER_PROGRESS;
  }
}

export function saveLearnerProgress(progress: LearnerProgress): void {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      ...progress,
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Failed to save learner progress to storage:", err);
  }
}

export function markLessonComplete(lessonId: string): LearnerProgress {
  const current = loadLearnerProgress();
  if (!current.completedLessons.includes(lessonId)) {
    current.completedLessons.push(lessonId);
  }
  saveLearnerProgress(current);
  return current;
}

export function recordCheckpointAnswer(
  questionId: string,
  answerIndex: number,
  isCorrect: boolean,
): LearnerProgress {
  const current = loadLearnerProgress();
  current.checkpointAnswers[questionId] = answerIndex;
  current.checkpointScores[questionId] = isCorrect;
  saveLearnerProgress(current);
  return current;
}

export function recordExerciseComplete(exerciseId: string): LearnerProgress {
  const current = loadLearnerProgress();
  if (!current.completedExercises.includes(exerciseId)) {
    current.completedExercises.push(exerciseId);
  }
  saveLearnerProgress(current);
  return current;
}

export function resetLearnerProgress(): LearnerProgress {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
  }
  return DEFAULT_LEARNER_PROGRESS;
}
