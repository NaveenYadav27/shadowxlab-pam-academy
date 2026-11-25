/**
 * SHADOWXLAB PAM ACADEMY — HIERARCHICAL LESSON TREE
 * Left-panel navigation representing Class/Module -> Unit -> Lesson progression
 * with dual-pathway support (20-Module Flagship Track vs 6-Class Foundational Track),
 * category grouping, real-time completion tracking, and duration indicators.
 */

import React from "react";
import { CheckCircle2, GraduationCap, Shield, BookOpen, Calendar } from "lucide-react";
import {
  ADMIN_MODULES_20,
  ADMIN_CATEGORIES,
  ACADEMY_CLASSES_V2,
  CLIENT_FOUNDATION_MODULES_12,
  CLIENT_FOUNDATION_SCHEDULE_5_DAYS,
} from "@/lib/academy/content";
import type { ClassCurriculum, Lesson, Module } from "@/lib/academy/types";

interface LessonTreeProps {
  currentClass: ClassCurriculum;
  currentLesson: Lesson;
  completedLessons: string[];
  currentTrack: "client-12" | "admin-20" | "intro-6";
  onSelectTrack: (track: "client-12" | "admin-20" | "intro-6") => void;
  onSelectClass: (classId: string) => void;
  onSelectLesson: (classId: string, moduleId: string, lessonId: string) => void;
}

export const LessonTree: React.FC<LessonTreeProps> = ({
  currentClass,
  currentLesson,
  completedLessons,
  currentTrack,
  onSelectTrack,
  onSelectClass,
  onSelectLesson,
}) => {
  // Calculate class/module completion
  const totalClassLessons = currentClass.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedClassLessons = currentClass.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => completedLessons.includes(l.id)).length,
    0,
  );
  const percentComplete =
    totalClassLessons > 0 ? Math.round((completedClassLessons / totalClassLessons) * 100) : 0;

  const isClientTrack = currentTrack === "client-12";
  const is20Track = currentTrack === "admin-20";
  const isIntroTrack = currentTrack === "intro-6";

  return (
    <div className="academy-left-tree">
      {/* Track Selector Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #CBD5E1",
          background: "#E2E8F0",
        }}
      >
        <button
          type="button"
          onClick={() => onSelectTrack("client-12")}
          style={{
            flex: 1.2,
            padding: "8px 4px",
            fontSize: 9.5,
            fontWeight: 700,
            border: "none",
            borderBottom: isClientTrack ? "2px solid #0078D4" : "2px solid transparent",
            background: isClientTrack ? "#FFFFFF" : "transparent",
            color: isClientTrack ? "#0078D4" : "#64748B",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            textTransform: "uppercase",
          }}
          title="Authoritative 12-Module CyberArk Basic Training Programme (30 Hours)"
        >
          <Shield size={12} />
          Foundation (12 M)
        </button>
        <button
          type="button"
          onClick={() => onSelectTrack("admin-20")}
          style={{
            flex: 1,
            padding: "8px 4px",
            fontSize: 9.5,
            fontWeight: 700,
            border: "none",
            borderBottom: is20Track ? "2px solid #0078D4" : "2px solid transparent",
            background: is20Track ? "#FFFFFF" : "transparent",
            color: is20Track ? "#0078D4" : "#64748B",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            textTransform: "uppercase",
          }}
          title="Preserved Extended 20-Module Administrator Track"
        >
          <Shield size={12} />
          Admin Track (20 Modules)
        </button>
        <button
          type="button"
          onClick={() => onSelectTrack("intro-6")}
          style={{
            flex: 1,
            padding: "8px 4px",
            fontSize: 9.5,
            fontWeight: 700,
            border: "none",
            borderBottom: isIntroTrack ? "2px solid #0078D4" : "2px solid transparent",
            background: isIntroTrack ? "#FFFFFF" : "transparent",
            color: isIntroTrack ? "#0078D4" : "#64748B",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            textTransform: "uppercase",
          }}
          title="Preserved Legacy 6-Class Foundational Track"
        >
          <BookOpen size={12} />
          Intro Track (6 Classes)
        </button>
      </div>

      {/* Tree Header */}
      <div className="academy-tree-header">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <GraduationCap size={16} className="text-[#0078D4]" />
          <h3>Curriculum Navigator</h3>
        </div>
        <p>
          {isClientTrack
            ? "Authoritative 12-Module CyberArk Basic Training (30 Hours)"
            : is20Track
              ? "Preserved Extended Scope: 20-Module Administrator Curriculum"
              : "Preserved Legacy Scope: Six-Class Foundational Introduction"}
        </p>

        {(is20Track || isIntroTrack) && (
          <div
            style={{
              margin: "6px 0 0 0",
              padding: "4px 8px",
              background: "#F8FAFC",
              border: "1px solid #CBD5E1",
              borderLeft: "3px solid #64748B",
              fontSize: 10,
              color: "#475569",
              borderRadius: 2,
            }}
          >
            <strong>Preserved Reference Track: </strong>
            Classified as outside core client foundation scope.
          </div>
        )}

        {/* Module / Class Selector */}
        <select
          className="academy-class-selector"
          value={currentClass.id}
          onChange={(e) => onSelectClass(e.target.value)}
        >
          {isClientTrack
            ? CLIENT_FOUNDATION_SCHEDULE_5_DAYS.map((day) => (
                <optgroup
                  key={day.dayNumber}
                  label={`Day ${day.dayNumber} (${day.printedDurationHours}h${day.discrepancy ? ` · module sum ${day.moduleSumDurationHours}h*` : ""}): ${day.title}`}
                >
                  {day.moduleIds.map((mId) => {
                    const modItem = CLIENT_FOUNDATION_MODULES_12.find((m) => m.id === mId);
                    if (!modItem) return null;
                    return (
                      <option key={modItem.id} value={modItem.id}>
                        {modItem.label}: {modItem.title} ({modItem.duration})
                      </option>
                    );
                  })}
                </optgroup>
              ))
            : is20Track
              ? ADMIN_CATEGORIES.map((cat) => (
                  <optgroup key={cat.category} label={cat.category}>
                    {cat.modules.map((mId) => {
                      const modItem = ADMIN_MODULES_20.find((m) => m.id === mId);
                      if (!modItem) return null;
                      return (
                        <option key={modItem.id} value={modItem.id}>
                          {modItem.label}: {modItem.title}
                        </option>
                      );
                    })}
                  </optgroup>
                ))
              : ACADEMY_CLASSES_V2.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.label}: {cls.title}
                  </option>
                ))}
        </select>
      </div>

      {/* Progress Bar */}
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
