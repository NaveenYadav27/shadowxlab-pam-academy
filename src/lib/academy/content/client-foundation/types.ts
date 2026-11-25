/**
 * SHADOWXLAB PAM ACADEMY — CLIENT FOUNDATION CURRICULUM TYPES
 * Authoritative type definitions strictly aligned with the 8-page
 * ShadowXLab CyberArk Basic Training Client Version curriculum.
 */

import type { ClassCurriculum, Lesson, PracticalExercise } from "../../types";

export type AssessmentDomainId = "fundamentals" | "safes" | "onboarding" | "sessions" | "capstone";

export interface AssessmentDomainSpec {
  id: AssessmentDomainId;
  title: string;
  weightPercentage: number;
  moduleNumbers: number[];
  moduleIds: string[];
  description: string;
}

export interface ScheduleDiscrepancy {
  day: number;
  dayLabel: string;
  printedDurationHours: number;
  moduleSumDurationHours: number;
  discrepancyHours: number; // positive = modules exceed printed day duration; negative = modules under printed day duration
  status: "SURFACED_FOR_OWNER_APPROVAL";
  moduleBreakdown: { moduleNumber: number; title: string; durationHours: number }[];
  explanation: string;
  impactOnTotalHours: string;
}

export interface ScheduleDaySpec {
  dayNumber: number;
  title: string;
  printedDurationHours: number;
  moduleSumDurationHours: number;
  moduleNumbers: number[];
  moduleIds: string[];
  discrepancy?: ScheduleDiscrepancy | undefined;
}

export interface CapstoneTaskSpec {
  taskNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  requirement: string;
  deliverable: string;
  evaluationCriteria: string[];
  consoleTarget: PracticalExercise["targetConsole"];
}

export interface CapstoneProjectSpec {
  id: string;
  title: string;
  scenario: string;
  targetEnvironment: string;
  tasks: CapstoneTaskSpec[];
  minimumPassingScore: number; // 70%
}

export interface OutsideScopeItem {
  id: string;
  title: string;
  originalTrack: "admin-20" | "intro-6";
  category: string;
  reason: string;
}

export type CurriculumContentClassification =
  | "REQUIRED_CLIENT_CONTENT"
  | "SUPPORTING_EXPLANATION"
  | "OPTIONAL_ENRICHMENT"
  | "OUTSIDE_CLIENT_FOUNDATION_SCOPE";

export interface ClassifiedContentItem {
  id: string;
  title: string;
  moduleId: string;
  classification: CurriculumContentClassification;
  isMandatoryGate: boolean;
  rationale: string;
}
