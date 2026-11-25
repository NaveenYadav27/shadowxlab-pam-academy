import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLIENT_FOUNDATION_MODULES_12,
  CLIENT_FOUNDATION_SCHEDULE_5_DAYS,
  CLIENT_ASSESSMENT_FRAMEWORK,
  CLIENT_SCHEDULE_DISCREPANCIES,
  OUTSIDE_CLIENT_FOUNDATION_SCOPE_MODULES,
  evaluateClientFoundationProgress,
  evaluateCapstoneProject,
  CLIENT_CAPSTONE_PROJECT,
  findClassById,
  findLessonAnywhere,
  getCurriculumMetrics,
  ACADEMY_CLASSES_V2,
  ADMIN_MODULES_20,
  CONTENT_CLASSIFICATION_REGISTRY,
  isMandatoryProgressionGate,
  getContentClassification,
} from "@/lib/academy/content";
import { buildGuidedLabPlan } from "@/lib/academy/guided-lab-engine";
import {
  DEFAULT_LEARNER_PROGRESS,
  loadLearnerProgress,
  resetLearnerProgress,
  migrateLearnerProgress,
} from "@/lib/academy/progress";
import type { LearnerProgress } from "@/lib/academy/types";
import { makeInitialPamState } from "@/lib/pam-engine";
import { AcademyWorkspace } from "@/components/academy/academy-workspace";

describe("Task 07 — Strict Client Curriculum Alignment (CyberArk Basic Training)", () => {
  beforeEach(() => {
    resetLearnerProgress();
  });

  it("1. Curriculum Structure: registers exactly 12 foundation modules in exact sequence, totaling 30 hours", () => {
    expect(CLIENT_FOUNDATION_MODULES_12).toHaveLength(12);

    const expectedTitles = [
      "Introduction to Privileged Access Management",
      "CyberArk Platform Fundamentals",
      "Architecture and Security Concepts",
      "PVWA — Web Portal Fundamentals",
      "Safes and Access Control",
      "Privileged Account Onboarding",
      "Password Management and Rotation",
      "Privileged Session Management",
      "Monitoring, Auditing and Reporting",
      "Troubleshooting Fundamentals",
      "Administration Best Practices",
      "Capstone Project and Assessment",
    ];

    const actualTitles = CLIENT_FOUNDATION_MODULES_12.map((m) => m.title);
    expect(actualTitles).toEqual(expectedTitles);

    const expectedDurations = [
      "2 Hours", // M01
      "2 Hours", // M02
      "2 Hours", // M03
      "3 Hours", // M04
      "3 Hours", // M05
      "3 Hours", // M06
      "3 Hours", // M07
      "3 Hours", // M08
      "2 Hours", // M09
      "2 Hours", // M10
      "2 Hours", // M11
      "3 Hours", // M12
    ];

    const actualDurations = CLIENT_FOUNDATION_MODULES_12.map((m) => m.duration);
    expect(actualDurations).toEqual(expectedDurations);

    // Sum of module durations in hours must equal exactly 30 hours
    const totalHours = CLIENT_FOUNDATION_MODULES_12.reduce((sum, m) => {
      const match = m.duration.match(/(\d+)\s*Hours?/i);
      return sum + (match ? parseInt(match[1]!, 10) : 0);
    }, 0);
    expect(totalHours).toBe(30);

    // Track metrics must confirm 12 classes/modules and 30 hours (1800 minutes)
    const metrics = getCurriculumMetrics("client-12");
    expect(metrics.totalClasses).toBe(12);
    expect(metrics.totalModules).toBe(12);
    expect(metrics.totalLessons).toBe(12);
    expect(metrics.totalEstimatedMinutes).toBe(1800);
    expect(metrics.totalExercises).toBe(12);
    expect(metrics.completenessPercentage).toBe(100);
  });

  it("2. Content Completeness: verifies all 12 modules contain required topics, learning outcomes, and practical activities", () => {
    for (let i = 0; i < 12; i++) {
      const moduleCurriculum = CLIENT_FOUNDATION_MODULES_12[i]!;
      expect(moduleCurriculum.id).toBe(`client-m${String(i + 1).padStart(2, "0")}`);
      expect(moduleCurriculum.track).toBe("client-12");
      expect(moduleCurriculum.modules).toHaveLength(1);

      const unit = moduleCurriculum.modules[0]!;
      expect(unit.lessons).toHaveLength(1);

      const lesson = unit.lessons[0]!;
      expect(lesson.learningObjectives.length).toBeGreaterThanOrEqual(5);
      expect(lesson.conceptIntroduction.length).toBeGreaterThan(150);
      expect(lesson.whyItExists.length).toBeGreaterThan(100);
      expect(lesson.terminology.length).toBeGreaterThanOrEqual(4);
      expect(lesson.architecture.componentResponsibilities.length).toBeGreaterThanOrEqual(3);
      expect(lesson.architecture.controlFlow.length).toBeGreaterThanOrEqual(4);
      expect(lesson.failureScenarios.length).toBeGreaterThanOrEqual(2);
      expect(lesson.troubleshootingRunbook.length).toBeGreaterThanOrEqual(2);
      expect(lesson.knowledgeCheck.length).toBeGreaterThanOrEqual(3);
      expect(lesson.practicalExercise).toBeDefined();

      const practical = lesson.practicalExercise!;
      expect(practical.objective).toBeTruthy();
      expect(practical.scenario).toBeTruthy();
      expect(practical.instructions.length).toBeGreaterThanOrEqual(3);
      expect(practical.stepDetails?.length).toBeGreaterThanOrEqual(3);
      expect(practical.independentPractice).toBeDefined();
    }
  });

  it("3. Authoritative 5-Day Schedule: verifies printed schedule preservation and documents Day 4 and Day 5 discrepancies", () => {
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS).toHaveLength(5);

    // Verify printed durations verbatim from PDF (each day = 6 hours)
    for (const day of CLIENT_FOUNDATION_SCHEDULE_5_DAYS) {
      expect(day.printedDurationHours).toBe(6);
    }

    // Day 1: Modules 1-3, sum = 2+2+2 = 6h (Matches printed)
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[0]!.moduleNumbers).toEqual([1, 2, 3]);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[0]!.moduleSumDurationHours).toBe(6);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[0]!.discrepancy).toBeUndefined();

    // Day 2: Modules 4-5, sum = 3+3 = 6h (Matches printed)
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[1]!.moduleNumbers).toEqual([4, 5]);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[1]!.moduleSumDurationHours).toBe(6);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[1]!.discrepancy).toBeUndefined();

    // Day 3: Modules 6-7, sum = 3+3 = 6h (Matches printed)
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[2]!.moduleNumbers).toEqual([6, 7]);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[2]!.moduleSumDurationHours).toBe(6);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[2]!.discrepancy).toBeUndefined();

    // Day 4: Modules 8-10, sum = 3+2+2 = 7h (Discrepancy: printed says 6h, modules sum to 7h)
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[3]!.moduleNumbers).toEqual([8, 9, 10]);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[3]!.moduleSumDurationHours).toBe(7);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[3]!.discrepancy).toBeDefined();
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[3]!.discrepancy?.discrepancyHours).toBe(1);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[3]!.discrepancy?.status).toBe(
      "SURFACED_FOR_OWNER_APPROVAL",
    );

    // Day 5: Modules 11-12, sum = 2+3 = 5h (Discrepancy: printed says 6h, modules sum to 5h)
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[4]!.moduleNumbers).toEqual([11, 12]);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[4]!.moduleSumDurationHours).toBe(5);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[4]!.discrepancy).toBeDefined();
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[4]!.discrepancy?.discrepancyHours).toBe(-1);
    expect(CLIENT_FOUNDATION_SCHEDULE_5_DAYS[4]!.discrepancy?.status).toBe(
      "SURFACED_FOR_OWNER_APPROVAL",
    );

    // Total discrepancies registry
    expect(CLIENT_SCHEDULE_DISCREPANCIES).toHaveLength(2);
    // Net sum of all module durations must equal net sum of all printed days (30 hours)
    const totalPrintedHours = CLIENT_FOUNDATION_SCHEDULE_5_DAYS.reduce(
      (sum, d) => sum + d.printedDurationHours,
      0,
    );
    const totalModuleSumHours = CLIENT_FOUNDATION_SCHEDULE_5_DAYS.reduce(
      (sum, d) => sum + d.moduleSumDurationHours,
      0,
    );
    expect(totalPrintedHours).toBe(30);
    expect(totalModuleSumHours).toBe(30);
  });

  it("4. Assessment Framework: verifies domain weights (20%, 20%, 25%, 15%, 20% = 100%) and 70% passing threshold", () => {
    expect(CLIENT_ASSESSMENT_FRAMEWORK.totalWeight).toBe(100);
    expect(CLIENT_ASSESSMENT_FRAMEWORK.passingScorePercentage).toBe(70);
    expect(CLIENT_ASSESSMENT_FRAMEWORK.categories).toHaveLength(5);

    const expectedWeights: Record<string, number> = {
      fundamentals: 20,
      safes: 20,
      onboarding: 25,
      sessions: 15,
      capstone: 20,
    };

    for (const cat of CLIENT_ASSESSMENT_FRAMEWORK.categories) {
      expect(cat.weightPercentage).toBe(expectedWeights[cat.id]);
    }

    // Verify evaluation calculation with zero progress
    const emptyProgress: LearnerProgress = {
      ...DEFAULT_LEARNER_PROGRESS,
      completedLessons: [],
      completedExercises: [],
    };
    const initialEval = evaluateClientFoundationProgress(emptyProgress, 0);
    expect(initialEval.overallScorePercentage).toBe(0);
    expect(initialEval.isPassed).toBe(false);

    // Verify evaluation calculation with completed coursework
    const completeProgress: LearnerProgress = {
      ...DEFAULT_LEARNER_PROGRESS,
      completedLessons: CLIENT_FOUNDATION_MODULES_12.map(
        (m) => m.id.replace("client-m", "cm") + "-l01",
      ),
      completedExercises: CLIENT_FOUNDATION_MODULES_12.map(
        (m) => m.id.replace("client-m", "cm") + "-ex01",
      ),
    };
    const completedEval = evaluateClientFoundationProgress(completeProgress, 90);
    expect(completedEval.overallScorePercentage).toBe(98);
    expect(completedEval.isPassed).toBe(true);
    expect(completedEval.capstoneCompleted).toBe(true);
    expect(completedEval.summaryRecommendation).toContain("Certificate of Completion recommended");
  });

  it("5. Capstone Project: validates the 5 required tasks and deterministic evaluation", () => {
    expect(CLIENT_CAPSTONE_PROJECT.id).toBe("client-capstone-m12");
    expect(CLIENT_CAPSTONE_PROJECT.tasks).toHaveLength(5);
    expect(CLIENT_CAPSTONE_PROJECT.minimumPassingScore).toBe(70);

    const taskTitles = CLIENT_CAPSTONE_PROJECT.tasks.map((t) => t.title);
    expect(taskTitles).toEqual([
      "Task 1 — Identify Accounts and Platforms",
      "Task 2 — Design a Safe Structure and Permissions",
      "Task 3 — Describe Onboarding and Password Management",
      "Task 4 — Review Audit Evidence and Troubleshoot an Access Issue",
      "Task 5 — Document Configuration Decisions and Security Controls",
    ]);

    // Evaluate against baseline simulator state
    const simState = makeInitialPamState();
    const capstoneReport = evaluateCapstoneProject(simState, {
      1: { taskNumber: 1, completed: true, evidenceItems: ["WIN-SRV-01 Administrator"] },
      2: { taskNumber: 2, completed: true, evidenceItems: ["DBA-SAFE", "WIN-SAFE"] },
      3: { taskNumber: 3, completed: true, evidenceItems: ["CPM verify policy"] },
      4: { taskNumber: 4, completed: true, evidenceItems: ["Audit review"] },
      5: { taskNumber: 5, completed: true, evidenceItems: ["Executive summary"] },
    });

    expect(capstoneReport.totalTasks).toBe(5);
    expect(capstoneReport.taskScores).toHaveLength(5);
    expect(capstoneReport.overallScore).toBeGreaterThanOrEqual(70);
    expect(capstoneReport.passed).toBe(true);
    expect(capstoneReport.verdict).toBe("CERTIFIED");
  });

  it("6. Outside Scope Registry: preserves advanced modules separately and prevents them from appearing in foundation track", () => {
    expect(OUTSIDE_CLIENT_FOUNDATION_SCOPE_MODULES.length).toBeGreaterThanOrEqual(10);

    const outsideIds = OUTSIDE_CLIENT_FOUNDATION_SCOPE_MODULES.map((m) => m.id);
    expect(outsideIds).toContain("module-07"); // Dependents
    expect(outsideIds).toContain("module-08"); // Advanced Dual Control
    expect(outsideIds).toContain("module-09"); // Automated Network Discovery
    expect(outsideIds).toContain("module-13"); // Self-Hosted Architecture
    expect(outsideIds).toContain("module-14"); // Backup & Restore
    expect(outsideIds).toContain("module-15"); // Disaster Recovery
    expect(outsideIds).toContain("module-16"); // Vault Security
    expect(outsideIds).toContain("module-17"); // System Monitoring

    // None of the outside-scope modules should be in the foundation curriculum
    const foundationIds = CLIENT_FOUNDATION_MODULES_12.map((m) => m.id);
    for (const outId of outsideIds) {
      expect(foundationIds).not.toContain(outId);
    }
  });

  it("7. Guided Lab Engine Integration: verifies multi-concept plans generation for all 12 client foundation modules", () => {
    for (const mod of CLIENT_FOUNDATION_MODULES_12) {
      const lesson = mod.modules[0]!.lessons[0]!;
      const practical = lesson.practicalExercise!;
      const plan = buildGuidedLabPlan(lesson, practical);

      expect(plan.concepts.length).toBeGreaterThanOrEqual(2);
      expect(plan.whatYouWillAccomplish).toBeTruthy();
      expect(plan.whyItMatters).toBeTruthy();
      expect(plan.enterpriseScenario).toBeTruthy();
      expect(plan.targetSystemOrAccount).toBeTruthy();
      expect(plan.expectedEndResult).toBeTruthy();
      expect(plan.independentChallenge.requirements.length).toBeGreaterThanOrEqual(1);

      for (const concept of plan.concepts) {
        expect(concept.task).toBeTruthy();
        expect(concept.where).toBeTruthy();
        expect(concept.action).toBeTruthy();
        expect(concept.expectedResult).toBeTruthy();
        expect(concept.why).toBeTruthy();
        expect(concept.hints.level1Concept).toBeTruthy();
        expect(concept.hints.level2Location).toBeTruthy();
        expect(concept.hints.level3Procedure).toBeTruthy();
        expect(concept.hints.level4Solution).toBeTruthy();
      }
    }
  });

  it("8. Honest Simulation Disclaimers: confirms simulationLimitationNote is present on relevant simulated practicals", () => {
    // Module 06 (Linux target onboarding) must have simulationLimitationNote
    const m06 = findClassById("client-m06")!;
    const m06Practical = m06.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m06Practical.simulationLimitationNote).toBeDefined();
    expect(m06Practical.simulationLimitationNote).toContain(
      "Linux SSH target onboarding is simulated",
    );

    // Module 09 (SIEM forwarding) must have simulationLimitationNote
    const m09 = findClassById("client-m09")!;
    const m09Practical = m09.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m09Practical.simulationLimitationNote).toBeDefined();
    expect(m09Practical.simulationLimitationNote).toContain("SIEM forwarding");
  });

  it("9. Workspace UI: defaults to 12-Module Foundation Track, displays schedule drawer and discrepancy notice", () => {
    const simState = makeInitialPamState();
    render(<AcademyWorkspace state={simState} onResetState={vi.fn()} />);

    // Verify default track is Foundation Track
    expect(screen.getByText(/foundation track progress:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/cyberark basic training client version \(12 modules \/ 30 hours\)/i),
    ).toBeInTheDocument();

    // Verify Schedule & Assessment button exists and opens the drawer
    const scheduleBtn = screen.getByRole("button", { name: /schedule & assessment \(30h\)/i });
    expect(scheduleBtn).toBeInTheDocument();
    fireEvent.click(scheduleBtn);

    // Verify drawer contents
    expect(
      screen.getByRole("region", { name: /authoritative 5-day schedule/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Day 4/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Day 5/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/weighted assessment framework/i)).toBeInTheDocument();

    // Verify all 5 assessment domains are rendered in drawer
    expect(screen.getByText(/fundamentals and architecture \(20%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/safes and access control \(20%\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(/account onboarding and password management \(25%\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/session management and auditing \(15%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/capstone project \(20%\)/i)).toBeInTheDocument();
  });

  it("10. Practical Lab Mapping Fidelity: verifies required hands-on practical assignment for M03-M10", () => {
    // M03: Basic PAM architecture diagram and access workflow trace
    const m03 = findClassById("client-m03")!;
    const m03Ex = m03.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m03Ex.title).toContain("Architecture Diagram");
    expect(m03Ex.targetConsole).toBe("overview");

    // M04: PVWA navigation, account inspection and access-denied review
    const m04 = findClassById("client-m04")!;
    const m04Ex = m04.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m04Ex.title).toContain("PVWA Navigation");
    expect(m04Ex.targetConsole).toBe("accounts");

    // M05: Safe review/creation, permissions and access troubleshooting
    const m05 = findClassById("client-m05")!;
    const m05Ex = m05.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m05Ex.title).toContain("Safe Creation, Permission Matrix");
    expect(m05Ex.targetConsole).toBe("safes");

    // M06: Test Windows and Linux account onboarding
    const m06 = findClassById("client-m06")!;
    const m06Ex = m06.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m06Ex.title).toContain("Windows Administrator Onboarding");
    expect(m06Ex.targetConsole).toBe("accounts");

    // M07: Password policy and simulated verification/rotation failure analysis
    const m07 = findClassById("client-m07")!;
    const m07Ex = m07.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m07Ex.title).toContain("CPM Lifecycle Operations");
    expect(m07Ex.targetConsole).toBe("cpm");

    // M08: Privileged session workflow and sample session audit record
    const m08 = findClassById("client-m08")!;
    const m08Ex = m08.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m08Ex.title).toContain("Brokered PSM Session");
    expect(m08Ex.targetConsole).toBe("psm");

    // M09: PAM audit event analysis
    const m09 = findClassById("client-m09")!;
    const m09Ex = m09.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m09Ex.title).toContain("Audit Event Forensics");
    expect(m09Ex.targetConsole).toBe("audit");

    // M10: Three simulated support tickets
    const m10 = findClassById("client-m10")!;
    const m10Ex = m10.modules[0]!.lessons[0]!.practicalExercise!;
    expect(m10Ex.title).toContain("3 CyberArk Support Tickets");
    expect(m10Ex.targetConsole).toBe("troubleshooting");
  });

  it("11. Content Classification Registry: enforces 4 tiers and prevents enrichment from gating progress", () => {
    expect(CONTENT_CLASSIFICATION_REGISTRY.length).toBeGreaterThanOrEqual(15);

    // Required client content must be mandatory gates
    const requiredItems = CONTENT_CLASSIFICATION_REGISTRY.filter(
      (item) => item.classification === "REQUIRED_CLIENT_CONTENT",
    );
    expect(requiredItems.length).toBe(12);
    for (const item of requiredItems) {
      expect(isMandatoryProgressionGate(item.classification)).toBe(true);
      expect(item.isMandatoryGate).toBe(true);
    }

    // Optional enrichment must NEVER act as a mandatory gate
    const enrichmentItems = CONTENT_CLASSIFICATION_REGISTRY.filter(
      (item) => item.classification === "OPTIONAL_ENRICHMENT",
    );
    expect(enrichmentItems.length).toBeGreaterThanOrEqual(3);
    for (const item of enrichmentItems) {
      expect(isMandatoryProgressionGate(item.classification)).toBe(false);
      expect(item.isMandatoryGate).toBe(false);
    }

    // Supporting explanations must NEVER act as a mandatory gate
    const supportingItems = CONTENT_CLASSIFICATION_REGISTRY.filter(
      (item) => item.classification === "SUPPORTING_EXPLANATION",
    );
    expect(supportingItems.length).toBeGreaterThanOrEqual(2);
    for (const item of supportingItems) {
      expect(isMandatoryProgressionGate(item.classification)).toBe(false);
      expect(item.isMandatoryGate).toBe(false);
    }

    // Helper function lookup test
    expect(getContentClassification("req-m01-pam-intro")).toBe("REQUIRED_CLIENT_CONTENT");
    expect(getContentClassification("module-13")).toBe("OUTSIDE_CLIENT_FOUNDATION_SCOPE");
    expect(getContentClassification("enr-m01-indep-audit")).toBe("OPTIONAL_ENRICHMENT");
  });

  it("12. Safe Migration Strategy: normalizes legacy progress states without corrupting completed work", () => {
    // Scenario 1: Malformed or undefined state falls back to default
    const nullMigrated = migrateLearnerProgress(null);
    expect(nullMigrated.currentTrackId).toBe("client-12");
    expect(nullMigrated.currentClassId).toBe("client-m01");

    // Scenario 2: Legacy progress with draft client-m ID and completed lessons
    const legacyState: Partial<LearnerProgress> = {
      currentTrackId: "client-12",
      currentClassId: "client-m04",
      currentModuleId: undefined,
      currentLessonId: undefined,
      completedLessons: ["cm01-l01", "cm02-l01", "cm03-l01"],
      completedExercises: ["cm01-ex01", "cm02-ex01"],
    };
    const migrated = migrateLearnerProgress(legacyState);
    expect(migrated.currentTrackId).toBe("client-12");
    expect(migrated.currentClassId).toBe("client-m04");
    expect(migrated.currentModuleId).toBe("cm04-core");
    expect(migrated.currentLessonId).toBe("cm04-l01");
    // Completed work is preserved
    expect(migrated.completedLessons).toEqual(["cm01-l01", "cm02-l01", "cm03-l01"]);
    expect(migrated.completedExercises).toEqual(["cm01-ex01", "cm02-ex01"]);
  });

  it("13. Capstone Assessment Integrity: validates 5 client tasks without requiring standalone DR Safe or CPM automation isolation", () => {
    const simState = makeInitialPamState();

    // Verify baseline simulator meets criteria through valid account, safe, and incident evidence
    const report = evaluateCapstoneProject(simState, {
      1: {
        taskNumber: 1,
        completed: true,
        evidenceItems: ["Identified Windows and Linux accounts"],
      },
      2: { taskNumber: 2, completed: true, evidenceItems: ["Designed Safe structure with ACLs"] },
      3: {
        taskNumber: 3,
        completed: true,
        evidenceItems: ["Documented CPM onboarding & rotation"],
      },
      4: {
        taskNumber: 4,
        completed: true,
        evidenceItems: ["Investigated and resolved access issue"],
      },
      5: {
        taskNumber: 5,
        completed: true,
        evidenceItems: ["Documented Zero Trust security controls"],
      },
    });

    expect(report.passed).toBe(true);
    expect(report.overallScore).toBeGreaterThanOrEqual(70);
    expect(report.completedTasks).toBe(5);

    // Verify each task corresponds strictly to the 5 client project tasks
    const taskNames = report.taskScores.map((t) => t.title);
    expect(taskNames).toEqual([
      "Identify Accounts and Platforms",
      "Design a Safe Structure and Permissions",
      "Describe Onboarding and Password Management",
      "Review Audit Evidence and Troubleshoot an Access Issue",
      "Document Configuration Decisions and Security Controls",
    ]);
  });
});
