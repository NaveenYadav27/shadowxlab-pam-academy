import { describe, expect, it } from "vitest";
import {
  ADMIN_MODULES_20,
  ACADEMY_CLASSES_V2,
  ALL_CURRICULUM_ITEMS,
  findClassById,
  findLessonAnywhere,
  getCurriculumMetrics,
} from "../lib/academy/content";

describe("PAM Academy V2 Curriculum Engine — Dual Track & 20-Module System", () => {
  it("registers all 20 enterprise administrator modules in ADMIN_MODULES_20", () => {
    expect(ADMIN_MODULES_20).toHaveLength(20);

    const expectedModuleIds = [
      "module-01",
      "module-02",
      "module-03",
      "module-04",
      "module-05",
      "module-06",
      "module-07",
      "module-08",
      "module-09",
      "module-10",
      "module-11",
      "module-12",
      "module-13",
      "module-14",
      "module-15",
      "module-16",
      "module-17",
      "module-18",
      "module-19",
      "module-20",
    ];
    expect(ADMIN_MODULES_20.map((m) => m.id)).toEqual(expectedModuleIds);
  });

  it("registers all 6 legacy introductory classes in ACADEMY_CLASSES_V2", () => {
    expect(ACADEMY_CLASSES_V2).toHaveLength(6);

    const expectedLegacyIds = ["class-01", "class-02", "class-03", "class-04", "class-05", "class-06"];
    expect(ACADEMY_CLASSES_V2.map((c) => c.id)).toEqual(expectedLegacyIds);
  });

  it("registers all 26 total curriculum objects in ALL_CURRICULUM_ITEMS", () => {
    expect(ALL_CURRICULUM_ITEMS).toHaveLength(26);
  });

  it("verifies Class 01 structure and content completeness in legacy track", () => {
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

  it("verifies Module 01 Introduction to PAM Administration in flagship track", () => {
    const m01 = findClassById("module-01");
    expect(m01).toBeDefined();
    expect(m01?.label).toBe("MODULE 01");
    expect(m01?.title).toBe("Introduction to PAM Administration");
    expect(m01?.track).toBe("admin-20");

    const found = findLessonAnywhere("m01-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.title).toContain("PAM Architecture Topology & Protocol Isolation");
    expect(lesson?.conceptIntroduction.length).toBeGreaterThan(200);
    expect(lesson?.architecture.componentResponsibilities.length).toBeGreaterThanOrEqual(3);
    expect(lesson?.architecture.controlFlow.length).toBeGreaterThanOrEqual(4);
    expect(lesson?.terminology.some((t) => t.term === "Digital Vault")).toBe(true);
    expect(lesson?.terminology.some((t) => t.term === "PSM (Privileged Session Manager)")).toBe(true);
    expect(lesson?.knowledgeCheck.length).toBeGreaterThanOrEqual(3);
    expect(lesson?.diagnosticEvidence).toBeDefined();
    expect(lesson?.instructorNotes).toBeDefined();
  });

  it("verifies Module 03 Policies and Platforms configuration items and knowledge checks", () => {
    const m03 = findClassById("module-03");
    expect(m03).toBeDefined();
    expect(m03?.title).toBe("Policies and Platforms");
    const found = findLessonAnywhere("m03-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.terminology.some((t) => t.term === "Exclusive Mode")).toBe(true);
    expect(lesson?.terminology.some((t) => t.term === "MinValidityPeriod")).toBe(true);
    expect(lesson?.configurationAndAdministration.some((c) => c.name === "PerformPeriodicChange")).toBe(true);
    expect(lesson?.knowledgeCheck.length).toBeGreaterThanOrEqual(3);
  });

  it("verifies Module 04 Safes 10+ granular permissions and architecture", () => {
    const m04 = findClassById("module-04");
    expect(m04).toBeDefined();
    expect(m04?.title).toBe("Safes");
    const found = findLessonAnywhere("m04-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.terminology.some((t) => t.term === "Use Accounts")).toBe(true);
    expect(lesson?.terminology.some((t) => t.term === "Retrieve Accounts")).toBe(true);
    expect(lesson?.failureScenarios.some((f) => f.symptom.includes("CACPM072E"))).toBe(true);
  });

  it("verifies Module 06 Accounts Part 2 Reconcile mechanics", () => {
    const m06 = findClassById("module-06");
    expect(m06).toBeDefined();
    expect(m06?.title).toContain("Accounts — Part 2");
    const found = findLessonAnywhere("m06-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.terminology.some((t) => t.term === "Reconcile Account")).toBe(true);
    expect(lesson?.terminology.some((t) => t.term === "Logon Account")).toBe(true);
    expect(lesson?.failureScenarios.some((f) => f.symptom.includes("CACPM250E"))).toBe(true);
  });

  it("verifies Module 07 Dependents (Usages) and Windows Error 1069", () => {
    const m07 = findClassById("module-07");
    expect(m07).toBeDefined();
    expect(m07?.title).toContain("Dependents");
    const found = findLessonAnywhere("m07-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.terminology.some((t) => t.term.includes("Win32 Error 1069"))).toBe(true);
    expect(lesson?.configurationAndAdministration.some((c) => c.name.includes("RestartService"))).toBe(true);
  });

  it("verifies Module 10 and 11 PSM session management and live termination", () => {
    const m10 = findClassById("module-10");
    const m11 = findClassById("module-11");
    expect(m10?.title).toContain("PSM — Part 1");
    expect(m11?.title).toContain("PSM — Part 2");

    const found11 = findLessonAnywhere("m11-l01");
    expect(found11?.lesson.terminology.some((t) => t.term === "Session Termination")).toBe(true);
    expect(found11?.lesson.terminology.some((t) => t.term === "Suspicious Command Detection")).toBe(true);
  });

  it("verifies Module 15 Disaster Recovery (PADR) and split-brain defense", () => {
    const m15 = findClassById("module-15");
    expect(m15?.title).toBe("Disaster Recovery");
    const found = findLessonAnywhere("m15-l01");
    expect(found?.lesson.terminology.some((t) => t.term.includes("Split-Brain Condition"))).toBe(true);
    expect(found?.lesson.terminology.some((t) => t.term.includes("PADR"))).toBe(true);
  });

  it("verifies Module 18 Common Issues failure taxonomy and error codes", () => {
    const m18 = findClassById("module-18");
    expect(m18?.title).toBe("Common Issues");
    const found = findLessonAnywhere("m18-l01");
    expect(found?.lesson.terminology.some((t) => t.term === "CACPM072E")).toBe(true);
    expect(found?.lesson.terminology.some((t) => t.term === "CACPM250E")).toBe(true);
    expect(found?.lesson.terminology.some((t) => t.term === "PSMSR126E")).toBe(true);
    expect(found?.lesson.terminology.some((t) => t.term === "ITATS108E")).toBe(true);
  });

  it("verifies Module 20 Post-Course Administrator Assessment contains 25 scenario questions", () => {
    const m20 = findClassById("module-20");
    expect(m20).toBeDefined();
    expect(m20?.title).toBe("Post-Course Administrator Assessment");
    const found = findLessonAnywhere("m20-l01");
    expect(found).toBeDefined();
    const lesson = found?.lesson;
    expect(lesson?.knowledgeCheck).toHaveLength(25);

    for (const q of lesson!.knowledgeCheck) {
      expect(q.id).toMatch(/^m20-q\d{2}$/);
      expect(q.question.length).toBeGreaterThan(20);
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThan(30);
      expect(q.conceptTested.length).toBeGreaterThan(5);
    }
  });

  it("enforces strict enterprise quality criteria without placeholders across ALL 26 classes and modules", () => {
    const placeholderRegex = /TODO|Coming Soon|TBD|Placeholder/i;

    for (const c of ALL_CURRICULUM_ITEMS) {
      expect(c.title).toBeTruthy();
      expect(c.overview).toBeTruthy();
      expect(c.level).toBeTruthy();
      expect(c.duration).toBeTruthy();
      expect(placeholderRegex.test(c.overview)).toBe(false);

      for (const m of c.modules) {
        expect(m.title).toBeTruthy();
        expect(m.description).toBeTruthy();
        expect(m.lessons.length).toBeGreaterThan(0);
        expect(placeholderRegex.test(m.description)).toBe(false);

        for (const l of m.lessons) {
          expect(l.title).toBeTruthy();
          expect(placeholderRegex.test(l.title)).toBe(false);
          expect(l.conceptIntroduction.length).toBeGreaterThan(100);
          expect(placeholderRegex.test(l.conceptIntroduction)).toBe(false);
          expect(l.whyItExists.length).toBeGreaterThan(50);
          expect(placeholderRegex.test(l.whyItExists)).toBe(false);
          expect(l.architecture.overview.length).toBeGreaterThan(80);
          expect(l.enterpriseScenario.businessContext.length).toBeGreaterThan(50);
          expect(placeholderRegex.test(l.enterpriseScenario.businessContext)).toBe(false);

          // Terminology definitions check
          expect(l.terminology.length).toBeGreaterThanOrEqual(2);
          for (const term of l.terminology) {
            expect(term.term).toBeTruthy();
            expect(term.definition.length).toBeGreaterThan(15);
            expect(placeholderRegex.test(term.definition)).toBe(false);
          }

          // Failure scenarios check
          expect(l.failureScenarios.length).toBeGreaterThanOrEqual(1);
          for (const failure of l.failureScenarios) {
            expect(failure.symptom).toBeTruthy();
            expect(failure.rootCause).toBeTruthy();
            expect(failure.securityImpact).toBeTruthy();
            expect(placeholderRegex.test(failure.symptom)).toBe(false);
          }

          // Troubleshooting steps check
          expect(l.troubleshootingRunbook.length).toBeGreaterThanOrEqual(1);
          for (const step of l.troubleshootingRunbook) {
            expect(step.stepNumber).toBeGreaterThan(0);
            expect(step.diagnosticAction).toBeTruthy();
            expect(step.remediation).toBeTruthy();
            expect(placeholderRegex.test(step.remediation)).toBe(false);
          }

          // Knowledge check questions check
          expect(l.knowledgeCheck.length).toBeGreaterThanOrEqual(1);
          for (const q of l.knowledgeCheck) {
            expect(q.question).toBeTruthy();
            expect(placeholderRegex.test(q.question)).toBe(false);
            expect(q.options.length).toBeGreaterThanOrEqual(3);
            expect(q.correctIndex).toBeGreaterThanOrEqual(0);
            expect(q.correctIndex).toBeLessThan(q.options.length);
            expect(q.explanation.length).toBeGreaterThan(20);
            expect(placeholderRegex.test(q.explanation)).toBe(false);
          }

          // Completion criteria check
          expect(l.completionCriteria.length).toBeGreaterThanOrEqual(2);
          expect(l.references.length).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("calculates accurate curriculum metrics for both tracks", () => {
    const adminMetrics = getCurriculumMetrics("admin-20");
    expect(adminMetrics.totalClasses).toBe(20);
    expect(adminMetrics.totalModules).toBe(20);
    expect(adminMetrics.totalLessons).toBe(20);
    expect(adminMetrics.totalQuestions).toBeGreaterThanOrEqual(80); // 19*3 + 25 = 82 questions!
    expect(adminMetrics.totalExercises).toBe(20);
    expect(adminMetrics.completenessPercentage).toBe(100);

    const introMetrics = getCurriculumMetrics("intro-6");
    expect(introMetrics.totalClasses).toBe(6);
    expect(introMetrics.totalModules).toBeGreaterThanOrEqual(7);
    expect(introMetrics.totalLessons).toBeGreaterThanOrEqual(7);
    expect(introMetrics.totalQuestions).toBeGreaterThanOrEqual(11);
    expect(introMetrics.totalExercises).toBeGreaterThanOrEqual(6);
    expect(introMetrics.completenessPercentage).toBe(100);
  });
});
