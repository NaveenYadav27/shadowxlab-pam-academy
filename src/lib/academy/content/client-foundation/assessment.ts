/**
 * SHADOWXLAB PAM ACADEMY — CLIENT ASSESSMENT FRAMEWORK
 * Extracted verbatim from ShadowXLab CyberArk Basic Training Client Version.
 *
 * Weight Distribution:
 * - Fundamentals and architecture: 20%
 * - Safes and access control: 20%
 * - Account onboarding and password management: 25%
 * - Session management and auditing: 15%
 * - Capstone project: 20%
 * Total: 100% | Minimum Passing Score: 70%
 */

import type { AssessmentDomainSpec } from "./types";
import type { LearnerProgress } from "../../types";

export const CLIENT_ASSESSMENT_FRAMEWORK: {
  passingScorePercentage: number;
  totalWeight: number;
  categories: AssessmentDomainSpec[];
} = {
  passingScorePercentage: 70,
  totalWeight: 100,
  categories: [
    {
      id: "fundamentals",
      title: "Fundamentals and Architecture",
      weightPercentage: 20,
      moduleNumbers: [1, 2, 3],
      moduleIds: ["client-m01", "client-m02", "client-m03"],
      description:
        "Identity fundamentals, privileged risks, CyberArk core component topology (Vault, CPM, PSM, PVWA), and architectural security principles.",
    },
    {
      id: "safes",
      title: "Safes and Access Control",
      weightPercentage: 20,
      moduleNumbers: [4, 5],
      moduleIds: ["client-m04", "client-m05"],
      description:
        "PVWA navigation, Safe structure, granular permissions (List, Retrieve, Use, Add, Update, Administer), and least-privilege governance.",
    },
    {
      id: "onboarding",
      title: "Account Onboarding and Password Management",
      weightPercentage: 25,
      moduleNumbers: [6, 7],
      moduleIds: ["client-m06", "client-m07"],
      description:
        "Windows & Linux target onboarding, account configuration properties, CPM lifecycle operations (verify, change, reconcile), and rotation policies.",
    },
    {
      id: "sessions",
      title: "Session Management and Auditing",
      weightPercentage: 15,
      moduleNumbers: [8, 9],
      moduleIds: ["client-m08", "client-m09"],
      description:
        "PSM session isolation, remote RDP/SSH brokering, live session monitoring, termination, audit evidence analysis, and SOC alerting.",
    },
    {
      id: "capstone",
      title: "Capstone Project",
      weightPercentage: 20,
      moduleNumbers: [12],
      moduleIds: ["client-m12"],
      description:
        "Comprehensive end-to-end design, implementation, troubleshooting, and documentation of a privileged access workflow for Windows and Linux administrator accounts.",
    },
  ],
};

export interface DomainScoreResult {
  domainId: string;
  title: string;
  weightPercentage: number;
  earnedPercentage: number;
  weightedScoreContribution: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  exercisesCompletedCount: number;
  totalExercisesCount: number;
  passed: boolean;
}

export interface ClientAssessmentEvaluation {
  overallScorePercentage: number;
  passingScorePercentage: number;
  isPassed: boolean;
  domainScores: DomainScoreResult[];
  completedModulesCount: number;
  totalModulesCount: number;
  capstoneCompleted: boolean;
  summaryRecommendation: string;
}

export function evaluateClientFoundationProgress(
  progress: LearnerProgress,
  capstoneScore: number = 0,
): ClientAssessmentEvaluation {
  const domainScores: DomainScoreResult[] = CLIENT_ASSESSMENT_FRAMEWORK.categories.map((cat) => {
    // For capstone domain, score is driven by capstone evaluation (0-100)
    if (cat.id === "capstone") {
      const isCapstoneFinished = progress.completedLessons.includes("cm12-l01");
      const earned = isCapstoneFinished ? Math.max(capstoneScore, 85) : capstoneScore;
      const contribution = Math.round((earned * cat.weightPercentage) / 100);
      return {
        domainId: cat.id,
        title: cat.title,
        weightPercentage: cat.weightPercentage,
        earnedPercentage: earned,
        weightedScoreContribution: contribution,
        completedLessonsCount: isCapstoneFinished ? 1 : 0,
        totalLessonsCount: 1,
        exercisesCompletedCount: progress.completedExercises.includes("cm12-ex01") ? 1 : 0,
        totalExercisesCount: 1,
        passed: earned >= CLIENT_ASSESSMENT_FRAMEWORK.passingScorePercentage,
      };
    }

    // For other domains, calculate based on lessons completed + checkpoints + exercises
    const totalLessons = cat.moduleIds.length; // 1 lesson per module in foundation
    let completedCount = 0;
    let exercisesCompleted = 0;

    for (const modId of cat.moduleIds) {
      const lessonId = modId.replace("client-m", "cm") + "-l01";
      const exerciseId = modId.replace("client-m", "cm") + "-ex01";
      if (progress.completedLessons.includes(lessonId)) completedCount++;
      if (progress.completedExercises.includes(exerciseId)) exercisesCompleted++;
    }

    const earned = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const contribution = Math.round((earned * cat.weightPercentage) / 100);

    return {
      domainId: cat.id,
      title: cat.title,
      weightPercentage: cat.weightPercentage,
      earnedPercentage: earned,
      weightedScoreContribution: contribution,
      completedLessonsCount: completedCount,
      totalLessonsCount: totalLessons,
      exercisesCompletedCount: exercisesCompleted,
      totalExercisesCount: totalLessons,
      passed: earned >= CLIENT_ASSESSMENT_FRAMEWORK.passingScorePercentage,
    };
  });

  const overallScorePercentage = domainScores.reduce(
    (sum, d) => sum + d.weightedScoreContribution,
    0,
  );
  const isPassed = overallScorePercentage >= CLIENT_ASSESSMENT_FRAMEWORK.passingScorePercentage;
  const capstoneCompleted = progress.completedLessons.includes("cm12-l01");

  let summaryRecommendation = "";
  if (isPassed && capstoneCompleted) {
    summaryRecommendation =
      "Candidate has successfully demonstrated foundational competency across all 5 CyberArk PAM domains and completed the Capstone Project. Certificate of Completion recommended.";
  } else if (!capstoneCompleted) {
    summaryRecommendation =
      "Candidate has coursework in progress. Complete remaining modules and the Module 12 Capstone Project to achieve certification.";
  } else {
    summaryRecommendation = `Score is below the 70% passing threshold (${overallScorePercentage}%). Review failed domains and retake corresponding lab assessments.`;
  }

  return {
    overallScorePercentage,
    passingScorePercentage: CLIENT_ASSESSMENT_FRAMEWORK.passingScorePercentage,
    isPassed,
    domainScores,
    completedModulesCount: progress.completedLessons.filter((id) => id.startsWith("cm")).length,
    totalModulesCount: 12,
    capstoneCompleted,
    summaryRecommendation,
  };
}
