/**
 * SHADOWXLAB PAM ACADEMY — HIERARCHICAL LESSON TREE
 * Left-panel navigation representing Class -> Module -> Lesson progression
 * with real-time completion tracking and duration indicators.
 */

import React from "react";
import { CheckCircle2, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import { ACADEMY_CLASSES_V2 } from "@/lib/academy/content";
import type { ClassCurriculum, Lesson, Module } from "@/lib/academy/types";

interface LessonTreeProps {
  currentClass: ClassCurriculum;
  currentLesson: Lesson;
  completedLessons: string[];
  onSelectClass: (classId: string) => void;
  onSelectLesson: (classId: string, moduleId: string, lessonId: string) => void;
}

export const LessonTree: React.FC<LessonTreeProps> = ({
  currentClass,
  currentLesson,
  completedLessons,
  onSelectClass,
  onSelectLesson,
}) => {
  // Calculate class completion
  const totalClassLessons = currentClass.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedClassLessons = currentClass.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => completedLessons.includes(l.id)).length,
    0,
  );
  const percentComplete =
    totalClassLessons > 0 ? Math.round((completedClassLessons / totalClassLessons) * 100) : 0;

  return (
    <div className="academy-left-tree">
      {/* Tree Header */}
      <div className="academy-tree-header">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <GraduationCap size={16} className="text-[#0078D4]" />
          <h3>Curriculum Navigator</h3>
        </div>
        <p>Six-Class Enterprise PAM Program</p>

        {/* Class Selector */}
        <select
          className="academy-class-selector"
          value={currentClass.id}
          onChange={(e) => onSelectClass(e.target.value)}
        >
          {ACADEMY_CLASSES_V2.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.label}: {cls.title}
            </option>
          ))}
        </select>
      </div>

      {/* Class Progress Bar */}
      <div
        style={{ padding: "8px 12px", background: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            fontWeight: 700,
            color: "#64748B",
            marginBottom: 4,
          }}
        >
          <span>{currentClass.label} PROGRESS</span>
          <span>
            {completedClassLessons}/{totalClassLessons} ({percentComplete}%)
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 4,
            background: "#CBD5E1",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percentComplete}%`,
              height: "100%",
              background: "#0078D4",
              transition: "width 0.2s ease",
            }}
          />
        </div>
      </div>

      {/* Module & Lesson Groups */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {currentClass.modules.map((mod: Module) => (
          <div key={mod.id} className="academy-module-group">
            <div className="academy-module-title">
              <span>
                {mod.number}: {mod.title}
              </span>
              <span style={{ fontSize: 9, color: "#64748B" }}>
                {mod.lessons.length} {mod.lessons.length === 1 ? "Lesson" : "Lessons"}
              </span>
            </div>

            <div>
              {mod.lessons.map((les: Lesson) => {
                const isSelected = les.id === currentLesson.id;
                const isDone = completedLessons.includes(les.id);

                return (
                  <button
                    key={les.id}
                    type="button"
                    className={`academy-lesson-button ${isSelected ? "active" : ""}`}
                    onClick={() => onSelectLesson(currentClass.id, mod.id, les.id)}
                  >
                    <div className="academy-lesson-copy">
                      <span className="academy-lesson-num">Lesson {les.number}</span>
                      <span className="academy-lesson-name">{les.title}</span>
                      <span className="academy-lesson-meta">{les.estimatedMinutes} mins</span>
                    </div>
                    {isDone && (
                      <CheckCircle2
                        size={14}
                        className="text-emerald-600"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
