/**
 * SHADOWXLAB PAM ACADEMY — CURRICULUM REGISTRY & CONTENT REPOSITORY
 * Aggregates all six enterprise PAM classes, modules, and structured lessons.
 */

import { CLASS_01 } from "./class-01";
import { CLASS_02 } from "./class-02";
import { CLASS_03 } from "./class-03";
import { CLASS_04 } from "./class-04";
import { CLASS_05 } from "./class-05";
import { CLASS_06 } from "./class-06";
import type { ClassCurriculum, Lesson, Module } from "../types";

export const ACADEMY_CLASSES_V2: ClassCurriculum[] = [
  CLASS_01,
  CLASS_02,
  CLASS_03,
  CLASS_04,
  CLASS_05,
  CLASS_06,
];

export function findClassById(classId: string): ClassCurriculum | undefined {
  return ACADEMY_CLASSES_V2.find((c) => c.id === classId);
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
  for (const c of ACADEMY_CLASSES_V2) {
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

export function getCurriculumMetrics() {
  let totalModules = 0;
  let totalLessons = 0;
  let totalEstimatedMinutes = 0;
  let totalQuestions = 0;
  let totalExercises = 0;

  for (const c of ACADEMY_CLASSES_V2) {
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
    totalClasses: ACADEMY_CLASSES_V2.length,
    totalModules,
    totalLessons,
    totalEstimatedMinutes,
    totalQuestions,
    totalExercises,
    completenessPercentage: 100,
  };
}
