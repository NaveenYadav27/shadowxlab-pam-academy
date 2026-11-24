/**
 * SHADOWXLAB PAM ACADEMY — LEARNER PROGRESS & STATE ENGINE
 * Provides robust localStorage persistence and reactive synchronization for course
 * progression, checkpoint answers, and simulator exercise completion.
 */

import type { KnowledgeCheckpointQuestion, LearnerProgress } from "./types";

const PROGRESS_STORAGE_KEY = "shadowxlab_pam_academy_progress_v4";

export const DEFAULT_LEARNER_PROGRESS: LearnerProgress = {
  currentTrackId: "admin-20",
  currentClassId: "module-01",
  currentModuleId: "m01-core",
  currentLessonId: "m01-l01",
  completedLessons: [],
  checkpointAnswers: {},
  checkpointScores: {},
  completedExercises: [],
  completedIndependentPractices: [],
  lastUpdated: "2026-11-16T00:00:00.000Z",
};

export function loadLearnerProgress(): LearnerProgress {
  if (typeof window === "undefined") {
    return DEFAULT_LEARNER_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_LEARNER_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<LearnerProgress>;
    const track =
      parsed.currentTrackId ||
      (parsed.currentClassId?.startsWith("class-") ? "intro-6" : "admin-20");
    return {
      currentTrackId: track,
      currentClassId: parsed.currentClassId || (track === "admin-20" ? "module-01" : "class-01"),
      currentModuleId: parsed.currentModuleId || (track === "admin-20" ? "m01-core" : "c01-m01"),
      currentLessonId: parsed.currentLessonId || (track === "admin-20" ? "m01-l01" : "c01-m01-l01"),
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      checkpointAnswers: parsed.checkpointAnswers || {},
      checkpointScores: parsed.checkpointScores || {},
      completedExercises: Array.isArray(parsed.completedExercises) ? parsed.completedExercises : [],
      completedIndependentPractices: Array.isArray(parsed.completedIndependentPractices)
        ? parsed.completedIndependentPractices
        : [],
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

export function resetCheckpointAnswersForQuestions(questionIds: string[]): LearnerProgress {
  const current = loadLearnerProgress();
  for (const id of questionIds) {
    delete current.checkpointAnswers[id];
    delete current.checkpointScores[id];
  }
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

export function recordIndependentPracticeComplete(exerciseId: string): LearnerProgress {
  const current = loadLearnerProgress();
  const existing = current.completedIndependentPractices || [];
  if (!existing.includes(exerciseId)) {
    current.completedIndependentPractices = [...existing, exerciseId];
  }
  saveLearnerProgress(current);
  return current;
}

export function evaluateLessonCheckpoint(
  questions: KnowledgeCheckpointQuestion[],
  savedAnswers: Record<string, number>,
): {
  total: number;
  answered: number;
  correct: number;
  requiredCorrect: number;
  percent: number;
  passed: boolean;
} {
  const total = questions.length;
  if (total === 0) {
    return { total: 0, answered: 0, correct: 0, requiredCorrect: 0, percent: 100, passed: true };
  }
  const answered = questions.filter((q) => savedAnswers[q.id] !== undefined).length;
  const correct = questions.filter((q) => savedAnswers[q.id] === q.correctIndex).length;
  const requiredCorrect = total >= 10 ? Math.ceil(total * 0.8) : total;
  const percent = Math.round((correct / total) * 100);
  const passed = answered === total && correct >= requiredCorrect;
  return { total, answered, correct, requiredCorrect, percent, passed };
}

export function resetLearnerProgress(): LearnerProgress {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
  }
  return DEFAULT_LEARNER_PROGRESS;
}
