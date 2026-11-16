/**
 * SHADOWXLAB PAM ACADEMY — 20-MODULE ADMINISTRATOR CURRICULUM REGISTRY
 * Aggregates all twenty comprehensive administrator modules.
 */

import { MODULE_01 } from "./module-01";
import { MODULE_02 } from "./module-02";
import { MODULE_03 } from "./module-03";
import { MODULE_04 } from "./module-04";
import { MODULE_05 } from "./module-05";
import { MODULE_06 } from "./module-06";
import { MODULE_07 } from "./module-07";
import { MODULE_08 } from "./module-08";
import { MODULE_09 } from "./module-09";
import { MODULE_10 } from "./module-10";
import { MODULE_11 } from "./module-11";
import { MODULE_12 } from "./module-12";
import { MODULE_13 } from "./module-13";
import { MODULE_14 } from "./module-14";
import { MODULE_15 } from "./module-15";
import { MODULE_16 } from "./module-16";
import { MODULE_17 } from "./module-17";
import { MODULE_18 } from "./module-18";
import { MODULE_19 } from "./module-19";
import { MODULE_20 } from "./module-20";
import type { ClassCurriculum } from "../../types";

export const ADMIN_MODULES_20: ClassCurriculum[] = [
  MODULE_01,
  MODULE_02,
  MODULE_03,
  MODULE_04,
  MODULE_05,
  MODULE_06,
  MODULE_07,
  MODULE_08,
  MODULE_09,
  MODULE_10,
  MODULE_11,
  MODULE_12,
  MODULE_13,
  MODULE_14,
  MODULE_15,
  MODULE_16,
  MODULE_17,
  MODULE_18,
  MODULE_19,
  MODULE_20,
];

export const ADMIN_CATEGORIES = [
  {
    category: "Core Administration & Access Control",
    modules: ["module-01", "module-02", "module-03", "module-04"],
  },
  {
    category: "Credential Lifecycle & Workflows",
    modules: ["module-05", "module-06", "module-07", "module-08", "module-09"],
  },
  {
    category: "Privileged Session Management & Governance",
    modules: ["module-10", "module-11", "module-12"],
  },
  {
    category: "Self-Hosted Infrastructure & Hardening",
    modules: ["module-13", "module-14", "module-15", "module-16", "module-17"],
  },
  {
    category: "Diagnostic Mastery & Certification",
    modules: ["module-18", "module-19", "module-20"],
  },
];
