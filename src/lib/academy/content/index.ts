/**
 * SHADOWXLAB PAM ACADEMY — CURRICULUM REGISTRY & CONTENT REPOSITORY
 * Aggregates both the Flagship 20-Module Administrator Curriculum
 * and the foundational 6-Class Introductory Pathway.
 */

import { CLASS_01 } from "./class-01";
import { CLASS_02 } from "./class-02";
import { CLASS_03 } from "./class-03";
import { CLASS_04 } from "./class-04";
import { CLASS_05 } from "./class-05";
import { CLASS_06 } from "./class-06";
import { ADMIN_MODULES_20, ADMIN_CATEGORIES } from "./modules";
import {
  CLIENT_FOUNDATION_MODULES_12,
  CLIENT_FOUNDATION_SCHEDULE_5_DAYS,
  CLIENT_ASSESSMENT_FRAMEWORK,
  CLIENT_SCHEDULE_DISCREPANCIES,
  OUTSIDE_CLIENT_FOUNDATION_SCOPE_MODULES,
  CONTENT_CLASSIFICATION_REGISTRY,
  isMandatoryProgressionGate,
  getContentClassification,
  evaluateClientFoundationProgress,
  evaluateCapstoneProject,
  CLIENT_CAPSTONE_PROJECT,
} from "./client-foundation";

export * from "./client-foundation";
import type { ClassCurriculum, Lesson, Module } from "../types";

export { ADMIN_MODULES_20, ADMIN_CATEGORIES };

export const ACADEMY_CLASSES_V2: ClassCurriculum[] = [
  CLASS_01,
  CLASS_02,
  CLASS_03,
  CLASS_04,
  CLASS_05,
  CLASS_06,
];

export const ALL_CURRICULUM_ITEMS: ClassCurriculum[] = [...ADMIN_MODULES_20, ...ACADEMY_CLASSES_V2];

export function findClassById(classId: string): ClassCurriculum | undefined {
  return (
    CLIENT_FOUNDATION_MODULES_12.find((c) => c.id === classId) ||
    ALL_CURRICULUM_ITEMS.find((c) => c.id === classId)
  );
}

export function findModuleById(classId: string, moduleId: string): Module | undefined {
  const cls = findClassById(classId);
  return cls?.modules.find((m) => m.id === moduleId);
}

export function findLessonById(
  classId: string,
  moduleId: string,
  lessonId: string,
): Lesson | undefined {
  const mod = findModuleById(classId, moduleId);
  return mod?.lessons.find((l) => l.id === lessonId);
}

export function findLessonAnywhere(lessonId: string):
  | {
      classCurriculum: ClassCurriculum;
      module: Module;
      lesson: Lesson;
    }
  | undefined {
  for (const c of [...CLIENT_FOUNDATION_MODULES_12, ...ALL_CURRICULUM_ITEMS]) {
    for (const m of c.modules) {
      for (const l of m.lessons) {
        if (l.id === lessonId) {
          return { classCurriculum: c, module: m, lesson: l };
        }
      }
    }
  }
  return undefined;
}

export function getCurriculumMetrics(track: "client-12" | "admin-20" | "intro-6" = "client-12") {
  const dataset =
    track === "client-12"
      ? CLIENT_FOUNDATION_MODULES_12
      : track === "admin-20"
        ? ADMIN_MODULES_20
        : ACADEMY_CLASSES_V2;

  let totalModules = 0;
  let totalLessons = 0;
  let totalEstimatedMinutes = 0;
  let totalQuestions = 0;
  let totalExercises = 0;

  for (const c of dataset) {
    totalModules += c.modules.length;
    for (const m of c.modules) {
      totalLessons += m.lessons.length;
      for (const l of m.lessons) {
        totalEstimatedMinutes += l.estimatedMinutes;
        totalQuestions += l.knowledgeCheck.length;
        if (l.practicalExercise) totalExercises++;
      }
    }
  }

  return {
    track,
    totalClasses: dataset.length,
    totalModules,
    totalLessons,
    totalEstimatedMinutes,
    totalQuestions,
    totalExercises,
    completenessPercentage: 100,
  };
}
