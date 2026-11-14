/**
 * SHADOWXLAB PAM ACADEMY — INSTRUCTIONAL CONTENT ENGINE TYPE DEFINITIONS
 * Strongly-typed educational content model supporting deep enterprise instruction,
 * architecture diagrams, failure taxonomy, interactive checkpoints, and practical labs.
 */

export type DifficultyLevel = "Foundational" | "Associate" | "Professional" | "Advanced";

export interface TechnicalTerm {
  term: string;
  definition: string;
  enterpriseContext: string;
}

export interface ComponentResponsibility {
  component: string; // e.g. "Digital Vault", "PVWA", "CPM", "PSM", "Target Host"
  role: string;
  networkProtocols?: string; // e.g. "TCP 1858 (Encrypted Vault Protocol)"
  securityBoundary: string;
}

export interface ControlFlowStep {
  stepNumber: number;
  actor: string;
  action: string;
  channelOrProtocol: string;
  verificationRule: string;
}

export interface ConfigurationItem {
  name: string;
  settingOrObject: string;
  description: string;
  productionBestPractice: string;
}

export interface OperationalProcedureStep {
  stepNumber: number;
  title: string;
  action: string;
  expectedResult: string;
  operatorNotes?: string;
}

export interface FailureScenario {
  symptom: string;
  rootCause: string;
  securityImpact: string;
  cyberArkCodeOrEvent?: string; // e.g. "CACPM072E", "PSMSR037E"
}

export interface TroubleshootingStep {
  stepNumber: number;
  diagnosticAction: string;
  logFileOrConsole: string;
  remediation: string;
}

export interface KnowledgeCheckpointQuestion {
  id: string;
  question: string;
  scenario?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTested: string;
}

export interface PracticalExercise {
  id: string;
  title: string;
  scenario: string;
  instructions: string[];
  targetConsole: "accounts" | "safes" | "cpm" | "psm" | "audit";
  associatedLabId: string;
  validationObjectiveId: string;
  validationCriteria: string;
}

export interface Lesson {
  id: string;
  number: string; // e.g. "1.1", "1.2"
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  learningObjectives: string[];
  prerequisites: string[];

  // 1. Concept Introduction & Why It Exists
  conceptIntroduction: string;
  whyItExists: string;

  // 2. Enterprise Architecture & Control Flow
  architecture: {
    overview: string;
    diagramAscii?: string;
    componentResponsibilities: ComponentResponsibility[];
    controlFlow: ControlFlowStep[];
  };

  // 3. Technical Terminology
  terminology: TechnicalTerm[];

  // 4. Administrator Responsibilities & Governance
  administratorResponsibilities: string[];
  configurationAndAdministration: ConfigurationItem[];
  operationalProcedures: OperationalProcedureStep[];

  // 5. Real-World Enterprise Scenario
  enterpriseScenario: {
    organization: string; // "Global Financial Services (corp.gfs.local)"
    businessContext: string;
    governanceRequirements: string[];
  };

  // 6. Failure Scenarios & Troubleshooting Runbooks
  failureScenarios: FailureScenario[];
  troubleshootingRunbook: TroubleshootingStep[];

  // 7. Security Implications & Compliance
  securityImplications: string[];

  // 8. Interactive Knowledge Checkpoint
  knowledgeCheck: KnowledgeCheckpointQuestion[];

  // 9. Practical Operational Exercise (Simulator Integrated)
  practicalExercise?: PracticalExercise;

  // 10. Completion Criteria & References
  completionCriteria: string[];
  references: string[];
}

export interface Module {
  id: string;
  number: string; // e.g. "M1", "M2"
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface ClassCurriculum {
  id: string;
  number: string; // e.g. "01", "02"
  label: string; // e.g. "CLASS 01"
  title: string;
  subtitle: string;
  duration: string;
  level: DifficultyLevel;
  overview: string;
  modules: Module[];
}

export interface LearnerProgress {
  currentClassId: string;
  currentModuleId: string;
  currentLessonId: string;
  completedLessons: string[]; // lesson IDs
  checkpointAnswers: Record<string, number>; // questionId -> selectedIndex
  checkpointScores: Record<string, boolean>; // questionId -> isCorrect
  completedExercises: string[]; // exercise IDs
  lastUpdated: string;
}
