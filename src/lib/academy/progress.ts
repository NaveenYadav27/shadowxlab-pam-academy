/**
 * SHADOWXLAB PAM ACADEMY — LEARNER PROGRESS & STATE ENGINE
 * Provides robust localStorage persistence and reactive synchronization for course
 * progression, checkpoint answers, and simulator exercise completion.
 */

import type { KnowledgeCheckpointQuestion, LearnerProgress } from "./types";

const PROGRESS_STORAGE_KEY = "shadowxlab_pam_academy_progress_v4";

export const DEFAULT_LEARNER_PROGRESS: LearnerProgress = {
  currentTrackId: "client-12",
  currentClassId: "client-m01",
  currentModuleId: "cm01-core",
  currentLessonId: "cm01-l01",
  completedLessons: [],
  checkpointAnswers: {},
  checkpointScores: {},
  completedExercises: [],
  completedIndependentPractices: [],
  lastUpdated: "2026-11-24T00:00:00.000Z",
};

/**
 * Safely normalizes and migrates learner progress from prior iterations or draft IDs,
 * ensuring no progress corruption when navigating the authoritative 12-module track.
 */
export function migrateLearnerProgress(
  parsed: Partial<LearnerProgress> | null | undefined,
): LearnerProgress {
  if (!parsed) return DEFAULT_LEARNER_PROGRESS;

  const track =
    parsed.currentTrackId ||
    (parsed.currentClassId?.startsWith("client-m")
      ? "client-12"
      : parsed.currentClassId?.startsWith("class-")
        ? "intro-6"
        : parsed.currentClassId?.startsWith("module-")
          ? "admin-20"
          : "client-12");

  let currentClassId = parsed.currentClassId;
  let currentModuleId = parsed.currentModuleId;
  let currentLessonId = parsed.currentLessonId;

  // Validate class ID syntax within the active track
  if (track === "client-12") {
    if (!currentClassId || !currentClassId.startsWith("client-m")) {
      currentClassId = "client-m01";
    }
    if (!currentModuleId || !currentModuleId.startsWith("cm")) {
      const modNum = currentClassId.replace("client-m", "");
      currentModuleId = `cm${modNum}-core`;
    }
    if (!currentLessonId || !currentLessonId.startsWith("cm")) {
      const modNum = currentClassId.replace("client-m", "");
      currentLessonId = `cm${modNum}-l01`;
    }
  } else if (track === "admin-20") {
    if (!currentClassId || !currentClassId.startsWith("module-")) {
      currentClassId = "module-01";
    }
    if (!currentModuleId || !currentModuleId.startsWith("m")) {
      currentModuleId = "m01-core";
    }
    if (!currentLessonId || !currentLessonId.startsWith("m")) {
      currentLessonId = "m01-l01";
    }
  } else {
    if (!currentClassId || !currentClassId.startsWith("class-")) {
      currentClassId = "class-01";
    }
    if (!currentModuleId) currentModuleId = "c01-m01";
    if (!currentLessonId) currentLessonId = "c01-m01-l01";
  }

  return {
    currentTrackId: track,
    currentClassId,
    currentModuleId,
    currentLessonId,
    completedLessons: Array.isArray(parsed.completedLessons) ? [...parsed.completedLessons] : [],
    checkpointAnswers: parsed.checkpointAnswers ? { ...parsed.checkpointAnswers } : {},
    checkpointScores: parsed.checkpointScores ? { ...parsed.checkpointScores } : {},
    completedExercises: Array.isArray(parsed.completedExercises)
      ? [...parsed.completedExercises]
      : [],
    completedIndependentPractices: Array.isArray(parsed.completedIndependentPractices)
      ? [...parsed.completedIndependentPractices]
      : [],
    capstoneSubmissions: parsed.capstoneSubmissions ? { ...parsed.capstoneSubmissions } : undefined,
    capstoneReport: parsed.capstoneReport ? { ...parsed.capstoneReport } : undefined,
    lastUpdated: parsed.lastUpdated || new Date().toISOString(),
  };
}

export function loadLearnerProgress(): LearnerProgress {
  if (typeof window === "undefined") {
    return DEFAULT_LEARNER_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_LEARNER_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<LearnerProgress>;
    return migrateLearnerProgress(parsed);
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
