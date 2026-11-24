import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACADEMY_CLASSES_V2, ADMIN_MODULES_20, findLessonAnywhere } from "@/lib/academy/content";
import { resetLearnerProgress } from "@/lib/academy/progress";
import {
  appendSessionCommand,
  launchPsmSession,
  makeInitialPamState,
  repairCpmFailure,
  runCpmOperation,
  setSafeMember,
  terminatePsmSession,
} from "@/lib/pam-engine";
import { AcademyWorkspace } from "@/components/academy/academy-workspace";
import { InteractiveLabWorkbench } from "@/components/academy/interactive-lab-workbench";
import { KnowledgeCheckpoint } from "@/components/academy/knowledge-checkpoint";

describe("PAM Academy Course & Hands-On Alignment", () => {
  beforeEach(() => {
    resetLearnerProgress();
  });

  it("ensures all 28 lessons across both Intro (6 classes) and Admin (20 modules) tracks have complete hands-on practicals, hints, and independent practice", () => {
    const introLessons = ACADEMY_CLASSES_V2.flatMap((cls) =>
      cls.modules.flatMap((mod) => mod.lessons),
    );
    const adminLessons = ADMIN_MODULES_20.flatMap((mod) =>
      mod.modules.flatMap((unit) => unit.lessons),
    );
    expect(introLessons).toHaveLength(8);
    expect(adminLessons).toHaveLength(20);

    for (const lesson of [...introLessons, ...adminLessons]) {
      expect(lesson.practicalExercise, `Missing practical on ${lesson.id}`).toBeDefined();
      const ex = lesson.practicalExercise!;
      expect(ex.objective, `Missing objective on ${lesson.id}`).toBeTruthy();
      expect(ex.startingState, `Missing startingState on ${lesson.id}`).toBeTruthy();
      expect(ex.prerequisites?.length).toBeGreaterThanOrEqual(1);
      expect(ex.stepDetails?.length).toBeGreaterThanOrEqual(3);
      expect(ex.troubleshootingHints?.length).toBeGreaterThanOrEqual(1);
      expect(ex.independentPractice, `Missing independentPractice on ${lesson.id}`).toBeDefined();
      expect(ex.independentPractice?.successCriteria.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("displays all simulator objectives without truncation and blocks fake completion when objectives are unmet", () => {
    const class06Lesson = findLessonAnywhere("c06-m01-l01")!.lesson;
    const baselineState = makeInitialPamState();
    const onComplete = vi.fn();

    render(
      <InteractiveLabWorkbench
        exercise={class06Lesson.practicalExercise!}
        state={baselineState}
        isCompleted={false}
        onRecordExerciseComplete={onComplete}
      />,
    );

    // Lab 06A has 6 objectives — verify the 6th objective ("Terminate session") is visible (not sliced to 3)
    expect(screen.getByText(/terminate session and seal audit record/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/6 objectives passed/i)).toBeInTheDocument();

    // Clicking step checkboxes must NOT bypass real simulator validation
    fireEvent.click(screen.getByText(/step 1:/i));
    fireEvent.click(
      screen.getByRole("button", { name: /validate simulator state & record lab completion/i }),
    );

    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/validation not yet passed/i);
    // Progressive troubleshooting hint unlocks on failed validation without immediately spoiling the fix
    expect(screen.getByRole("button", { name: /reveal corrective action/i })).toBeInTheDocument();
  });

  it("validates Class 06 Lab 06A against live simulator state after launching, running 2 commands, and terminating a PSM session", () => {
    const class06Lesson = findLessonAnywhere("c06-m01-l01")!.lesson;
    let simState = { ...makeInitialPamState(), approvalGranted: true };
    const launched = launchPsmSession(
      simState,
      {
        target: "WIN-SRV-01",
        account: simState.accounts[0]!,
        ticket: "CHG-12345",
        reason: "Class 06 hands-on verification",
      },
      "pam_admin",
    );
    expect(launched.error).toBeUndefined();
    simState = launched.state;
    const sessionId = simState.sessions[0]!.id;
    simState = appendSessionCommand(simState, sessionId, "whoami", "pam_admin");
    simState = appendSessionCommand(simState, sessionId, "hostname", "pam_admin");
    simState = terminatePsmSession(
      simState,
      sessionId,
      "Completed Class 06 verification",
      "pam_admin",
    ).state;

    const onComplete = vi.fn();
    render(
      <InteractiveLabWorkbench
        exercise={class06Lesson.practicalExercise!}
        state={simState}
        isCompleted={false}
        onRecordExerciseComplete={onComplete}
      />,
    );

    expect(screen.getByText(/6\/6 objectives passed/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /validate simulator state & record lab completion/i }),
    );
    expect(onComplete).toHaveBeenCalledWith("ex-c06-01");
  });

  it("validates Class 05 Lab 05A against live simulator state after running CPM Verify and Change on WIN-SRV-01 Administrator", () => {
    const class05Lesson = findLessonAnywhere("c05-m01-l01")!.lesson;
    let simState = makeInitialPamState();
    simState = runCpmOperation(simState, "account-1", "Verify", "pam_admin").state;
    simState = runCpmOperation(simState, "account-1", "Change", "pam_admin").state;

    const onComplete = vi.fn();
    render(
      <InteractiveLabWorkbench
        exercise={class05Lesson.practicalExercise!}
        state={simState}
        isCompleted={false}
        onRecordExerciseComplete={onComplete}
      />,
    );

    expect(screen.getByText(/4\/4 objectives passed/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /validate simulator state & record lab completion/i }),
    );
    expect(onComplete).toHaveBeenCalledWith("ex-c05-01");
  });

  it("provides progressive hints before revealing answers on wrong checkpoint selections and supports persisted reset", () => {
    const lesson = findLessonAnywhere("c01-m02-l01")!.lesson;
    const question = lesson.knowledgeCheck[0]!;
    const onRecordAnswer = vi.fn();
    const onResetAnswers = vi.fn();

    render(
      <KnowledgeCheckpoint
        questions={[question]}
        savedAnswers={{}}
        onRecordAnswer={onRecordAnswer}
        onResetAnswers={onResetAnswers}
      />,
    );

    // Pick a wrong option (index 0; correctIndex is 2)
    fireEvent.click(screen.getByRole("button", { name: /^A\./i }));

    expect(screen.getByText(/not quite — try again/i)).toBeInTheDocument();
    expect(screen.queryByText(question.explanation)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reveal explanation/i })).toBeInTheDocument();

    // Retry and pick the correct option (index 2)
    fireEvent.click(screen.getByRole("button", { name: /^C\./i }));
    expect(screen.getByText(/correct!/i)).toBeInTheDocument();
    expect(screen.getByText(question.explanation)).toBeInTheDocument();

    // Reset persists via callback
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onResetAnswers).toHaveBeenCalledWith([question.id]);
  });

  it("gates lesson completion on checkpoint + lab validation, tracks progress per track, and enables linear Next Lesson progression", () => {
    const simState = makeInitialPamState();
    render(<AcademyWorkspace state={simState} onResetState={vi.fn()} />);

    // Switch to Intro Track (6 Classes / 8 Lessons)
    fireEvent.click(screen.getByRole("button", { name: /intro track \(6 classes\)/i }));
    expect(screen.getByText(/intro track progress:/i)).toBeInTheDocument();

    // Verify prerequisites and standard operating procedure are rendered
    expect(screen.getByText(/prerequisites:/i)).toBeInTheDocument();
    expect(screen.getByText(/standard operating procedure/i)).toBeInTheDocument();

    // Attempting to complete Lesson 1.1 before passing Knowledge Checkpoint must be blocked
    const completeBtn = screen.getByRole("button", { name: /complete lesson/i });
    fireEvent.click(completeBtn);
    expect(screen.getByText(/verification pending/i)).toBeInTheDocument();

    // Answer both Lesson 1.1 checkpoint questions correctly (correctIndex 1 and 2)
    const c01Lesson1 = findLessonAnywhere("c01-m01-l01")!.lesson;
    for (const q of c01Lesson1.knowledgeCheck) {
      const correctOptionText = q.options[q.correctIndex]!;
      fireEvent.click(
        screen.getByRole("button", { name: new RegExp(correctOptionText.slice(0, 28), "i") }),
      );
    }

    // Lab 01 objectives pass on baseline simulator state, so lesson is now ready to complete
    expect(screen.getByText(/ready to complete/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /complete lesson/i }));
    expect(screen.getByText(/lesson completed \(re-confirm\)/i)).toBeInTheDocument();

    // Linear Next Lesson button advances cleanly to Lesson 1.2
    const nextBtn = screen.getByRole("button", { name: /next: class 01 · lesson 1\.2/i });
    fireEvent.click(nextBtn);
    expect(
      screen.getByRole("heading", { name: /the four pillars of cyberark pas/i }),
    ).toBeInTheDocument();
  }, 15000);

  it("validates Module 06 Lab 05B end-to-end after unlocking, reconciling, changing, and verifying svc_backup", () => {
    const m06Lesson = findLessonAnywhere("m06-l01")!.lesson;
    let simState = makeInitialPamState();
    const svcBackup = simState.accounts.find((a) => a.username === "svc_backup")!;
    expect(svcBackup.address).toBe("WIN-SRV-02");

    simState = repairCpmFailure(simState, svcBackup.id, "unlock", "pam_admin").state;
    simState = runCpmOperation(simState, svcBackup.id, "Reconcile", "pam_admin").state;
    simState = runCpmOperation(simState, svcBackup.id, "Change", "pam_admin").state;
    simState = runCpmOperation(simState, svcBackup.id, "Verify", "pam_admin").state;

    const onComplete = vi.fn();
    render(
      <InteractiveLabWorkbench
        exercise={m06Lesson.practicalExercise!}
        state={simState}
        isCompleted={false}
        onRecordExerciseComplete={onComplete}
      />,
    );

    expect(screen.getByText(/5\/5 objectives passed/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /validate simulator state & record lab completion/i }),
    );
    expect(onComplete).toHaveBeenCalledWith("m06-ex01");
  });

  it("validates Module 04 Lab 02 end-to-end after saving least-privilege dba_user permissions on DBA-SAFE and verifies Independent Practice criteria", () => {
    const m04Lesson = findLessonAnywhere("m04-l01")!.lesson;
    let simState = makeInitialPamState();
    simState = setSafeMember(
      simState,
      "DBA-SAFE",
      {
        username: "dba_user",
        permissions: ["List accounts", "Use accounts", "Initiate privileged sessions"],
      },
      "pam_admin",
    ).state;

    const onComplete = vi.fn();
    const onIndependentComplete = vi.fn();
    render(
      <InteractiveLabWorkbench
        exercise={m04Lesson.practicalExercise!}
        state={simState}
        isCompleted={false}
        onRecordExerciseComplete={onComplete}
        onRecordIndependentComplete={onIndependentComplete}
      />,
    );

    expect(screen.getByText(/6\/6 objectives passed/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /validate simulator state & record lab completion/i }),
    );
    expect(onComplete).toHaveBeenCalledWith("m04-ex01");

    // Independent Practice blocks until all success criteria are checked
    const independentBtn = screen.getByRole("button", { name: /record independent practice/i });
    fireEvent.click(independentBtn);
    expect(onIndependentComplete).not.toHaveBeenCalled();

    for (const criterion of m04Lesson.practicalExercise!.independentPractice!.successCriteria) {
      fireEvent.click(screen.getByText(criterion));
    }
    fireEvent.click(independentBtn);
    expect(onIndependentComplete).toHaveBeenCalledWith("m04-ex01");
  });
});
