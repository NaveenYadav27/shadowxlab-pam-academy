import { describe, expect, it } from "vitest";
import {
  ACADEMY_CLASSES_V2,
  findClassById,
  findLessonAnywhere,
  getCurriculumMetrics,
} from "../lib/academy/content";

describe("PAM Academy V2 Curriculum Engine", () => {
  it("registers all 6 enterprise curriculum classes", () => {
    expect(ACADEMY_CLASSES_V2).toHaveLength(6);

    const expectedIds = ["class-01", "class-02", "class-03", "class-04", "class-05", "class-06"];
    expect(ACADEMY_CLASSES_V2.map((c) => c.id)).toEqual(expectedIds);
  });

  it("verifies Class 01 structure and content completeness", () => {
    const c01 = findClassById("class-01");
    expect(c01).toBeDefined();
    expect(c01?.title).toContain("PAM Foundations");
    expect(c01?.modules.length).toBeGreaterThanOrEqual(2);

    const found = findLessonAnywhere("c01-m01-l01");
    expect(found).toBeDefined();
    const lesson1 = found?.lesson;
    expect(lesson1?.title).toContain("The Anatomy of Privileged Credential Compromise");
    expect(lesson1?.learningObjectives.length).toBeGreaterThanOrEqual(3);
    expect(lesson1?.conceptIntroduction.length).toBeGreaterThan(100);
    expect(lesson1?.architecture.overview.length).toBeGreaterThan(100);
    expect(lesson1?.terminology.length).toBeGreaterThanOrEqual(3);
    expect(lesson1?.failureScenarios.length).toBeGreaterThanOrEqual(2);
    expect(lesson1?.troubleshootingRunbook.length).toBeGreaterThanOrEqual(2);
    expect(lesson1?.knowledgeCheck.length).toBeGreaterThanOrEqual(2);
    expect(lesson1?.practicalExercise).toBeDefined();
    expect(lesson1?.practicalExercise?.associatedLabId).toBe("Lab 01 · Trace the PAM architecture");
  });

  it("verifies Class 02 Safe administration & granular permissions matrix", () => {
    const c02 = findClassById("class-02");
    expect(c02).toBeDefined();
    expect(c02?.title).toContain("Safe Administration");
    const found = findLessonAnywhere("c02-m02-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.practicalExercise?.associatedLabId).toBe("Lab 02 · Configure Safe permissions");
    expect(lesson?.terminology.some((t) => t.term === "Use Accounts")).toBe(true);
    expect(lesson?.terminology.some((t) => t.term === "Retrieve Accounts")).toBe(true);
  });

  it("verifies Class 03 Privileged account onboarding & platform binding", () => {
    const c03 = findClassById("class-03");
    expect(c03).toBeDefined();
    expect(c03?.title).toContain("Privileged Account Onboarding");
    const found = findLessonAnywhere("c03-m01-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.practicalExercise?.associatedLabId).toBe(
      "Lab 03 · Onboard an unmanaged account",
    );
    expect(lesson?.architecture.componentResponsibilities.length).toBeGreaterThanOrEqual(2);
  });

  it("verifies Class 04 Identity & Privileged Account Security", () => {
    const c04 = findClassById("class-04");
    expect(c04).toBeDefined();
    expect(c04?.title).toContain("Identity & Privileged Account Security");
    const found = findLessonAnywhere("c04-m01-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.practicalExercise?.associatedLabId).toBe(
      "Lab 04 · Discover accounts & fix Safe mapping",
    );
  });

  it("verifies Class 05 CPM Operations & Password Management", () => {
    const c05 = findClassById("class-05");
    expect(c05).toBeDefined();
    expect(c05?.title).toContain("Central Policy Manager (CPM)");
    const found = findLessonAnywhere("c05-m01-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.practicalExercise?.associatedLabId).toBe("Lab 05A · Verify credential status");
    expect(lesson?.failureScenarios.some((f) => f.symptom.includes("CACPM072E"))).toBe(true);
    expect(lesson?.failureScenarios.some((f) => f.symptom.includes("CACPM250E"))).toBe(true);
  });

  it("verifies Class 06 PSM Operations & Session Management", () => {
    const c06 = findClassById("class-06");
    expect(c06).toBeDefined();
    expect(c06?.title).toContain("Privileged Session Manager (PSM)");
    const found = findLessonAnywhere("c06-m01-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.practicalExercise?.associatedLabId).toBe("Lab 06A · Launch an approved session");
  });

  it("enforces that all lessons meet strict enterprise quality criteria without placeholders", () => {
    const placeholderRegex = /TODO|Coming Soon|TBD|Placeholder/i;

    for (const c of ACADEMY_CLASSES_V2) {
      expect(c.title).toBeTruthy();
      expect(c.overview).toBeTruthy();
      expect(c.level).toBeTruthy();
      expect(c.duration).toBeTruthy();

      for (const m of c.modules) {
        expect(m.title).toBeTruthy();
        expect(m.description).toBeTruthy();
        expect(m.lessons.length).toBeGreaterThan(0);

        for (const l of m.lessons) {
          expect(l.title).toBeTruthy();
          expect(placeholderRegex.test(l.title)).toBe(false);
          expect(l.conceptIntroduction.length).toBeGreaterThan(100);
          expect(placeholderRegex.test(l.conceptIntroduction)).toBe(false);
          expect(l.architecture.overview.length).toBeGreaterThan(100);
          expect(l.enterpriseScenario.businessContext.length).toBeGreaterThan(50);

          // Terminology definitions check
          expect(l.terminology.length).toBeGreaterThanOrEqual(2);
          for (const term of l.terminology) {
            expect(term.term).toBeTruthy();
            expect(term.definition.length).toBeGreaterThan(20);
          }

          // Failure scenarios check
          expect(l.failureScenarios.length).toBeGreaterThanOrEqual(1);
          for (const failure of l.failureScenarios) {
            expect(failure.symptom).toBeTruthy();
            expect(failure.rootCause).toBeTruthy();
            expect(failure.securityImpact).toBeTruthy();
          }

          // Troubleshooting steps check
          expect(l.troubleshootingRunbook.length).toBeGreaterThanOrEqual(1);
          for (const step of l.troubleshootingRunbook) {
            expect(step.stepNumber).toBeGreaterThan(0);
            expect(step.diagnosticAction).toBeTruthy();
            expect(step.remediation).toBeTruthy();
          }

          // Knowledge check questions check
          expect(l.knowledgeCheck.length).toBeGreaterThanOrEqual(1);
          for (const q of l.knowledgeCheck) {
            expect(q.question).toBeTruthy();
            expect(q.options.length).toBeGreaterThanOrEqual(3);
            expect(q.correctIndex).toBeGreaterThanOrEqual(0);
            expect(q.correctIndex).toBeLessThan(q.options.length);
            expect(q.explanation.length).toBeGreaterThan(20);
          }

          // Completion criteria check
          expect(l.completionCriteria.length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it("calculates accurate curriculum metrics", () => {
    const metrics = getCurriculumMetrics();
    expect(metrics.totalClasses).toBe(6);
    expect(metrics.totalModules).toBeGreaterThanOrEqual(7);
    expect(metrics.totalLessons).toBeGreaterThanOrEqual(7);
    expect(metrics.totalQuestions).toBeGreaterThanOrEqual(11);
    expect(metrics.totalExercises).toBeGreaterThanOrEqual(6);
    expect(metrics.completenessPercentage).toBe(100);
  });
});
