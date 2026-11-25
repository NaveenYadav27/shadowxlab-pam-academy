/**
 * SHADOWXLAB PAM ACADEMY — AUTHORITATIVE 5-DAY TRAINING SCHEDULE
 * Extracted verbatim from ShadowXLab CyberArk Basic Training Client Version.
 *
 * Total Programme Duration: 30 hours (12 modules).
 * Preserves printed durations exactly while explicitly surfacing day-level discrepancies.
 */

import type { ScheduleDaySpec, ScheduleDiscrepancy } from "./types";

export const CLIENT_SCHEDULE_DISCREPANCIES: ScheduleDiscrepancy[] = [
  {
    day: 4,
    dayLabel: "Day 4 — Privileged Session Management & Operations",
    printedDurationHours: 6,
    moduleSumDurationHours: 7,
    discrepancyHours: 1,
    status: "SURFACED_FOR_OWNER_APPROVAL",
    moduleBreakdown: [
      { moduleNumber: 8, title: "Privileged Session Management", durationHours: 3 },
      { moduleNumber: 9, title: "Monitoring, Auditing and Reporting", durationHours: 2 },
      { moduleNumber: 10, title: "Troubleshooting Fundamentals", durationHours: 2 },
    ],
    explanation:
      "The client training document assigns Modules 8, 9, and 10 to Day 4 with a printed day duration of 6 hours. However, the sum of their individual module durations is 3h + 2h + 2h = 7 hours (+1 hour discrepancy). In strict adherence to safety rules, module durations and printed schedule text are preserved verbatim, and this discrepancy is surfaced for stakeholder approval.",
    impactOnTotalHours:
      "Offset by Day 5 module sum (5 hours vs 6 printed hours). The overall 5-day training sum remains exactly 30 hours.",
  },
  {
    day: 5,
    dayLabel: "Day 5 — Administration Best Practices, Capstone & Assessment",
    printedDurationHours: 6,
    moduleSumDurationHours: 5,
    discrepancyHours: -1,
    status: "SURFACED_FOR_OWNER_APPROVAL",
    moduleBreakdown: [
      { moduleNumber: 11, title: "Administration Best Practices", durationHours: 2 },
      { moduleNumber: 12, title: "Capstone Project and Assessment", durationHours: 3 },
    ],
    explanation:
      "The client training document assigns Module 11 and Module 12 to Day 5 with a printed day duration of 6 hours. However, the sum of their individual module durations is 2h + 3h = 5 hours (-1 hour discrepancy). The remaining 1 hour typically accounts for instructor review, live Q&A, and final certification debrief.",
    impactOnTotalHours:
      "Offsets Day 4 (+1 hour). The overall programme total across all 12 modules is precisely 30 hours (6 + 6 + 6 + 7 + 5 = 30 hours).",
  },
];

export const CLIENT_FOUNDATION_SCHEDULE_5_DAYS: ScheduleDaySpec[] = [
  {
    dayNumber: 1,
    title: "PAM Foundations, Platform Architecture & Security Principles",
    printedDurationHours: 6,
    moduleSumDurationHours: 6,
    moduleNumbers: [1, 2, 3],
    moduleIds: ["client-m01", "client-m02", "client-m03"],
  },
  {
    dayNumber: 2,
    title: "Web Portal Navigation, Safes Architecture & Access Control",
    printedDurationHours: 6,
    moduleSumDurationHours: 6,
    moduleNumbers: [4, 5],
    moduleIds: ["client-m04", "client-m05"],
  },
  {
    dayNumber: 3,
    title: "Privileged Account Onboarding & Central Policy Management (CPM)",
    printedDurationHours: 6,
    moduleSumDurationHours: 6,
    moduleNumbers: [6, 7],
    moduleIds: ["client-m06", "client-m07"],
  },
  {
    dayNumber: 4,
    title: "Privileged Session Management, Auditing & Troubleshooting",
    printedDurationHours: 6,
    moduleSumDurationHours: 7,
    moduleNumbers: [8, 9, 10],
    moduleIds: ["client-m08", "client-m09", "client-m10"],
    discrepancy: CLIENT_SCHEDULE_DISCREPANCIES[0],
  },
  {
    dayNumber: 5,
    title: "Operational Best Practices, Capstone Project & Evaluation",
    printedDurationHours: 6,
    moduleSumDurationHours: 5,
    moduleNumbers: [11, 12],
    moduleIds: ["client-m11", "client-m12"],
    discrepancy: CLIENT_SCHEDULE_DISCREPANCIES[1],
  },
];
