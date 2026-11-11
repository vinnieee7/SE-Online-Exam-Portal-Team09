# Sprint 2 Report: Online Exam Portal (OEP)

> **Sprint Duration:** 26 October 2026 – 30 October 2026  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Milestone Due Date:** 30 October 2026 (planned development freeze; last feature merge 2 November 2026)  
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)

---

## 1. Executive Summary & Sprint Goal

**Sprint 2 Goal:** Complete the active exam delivery engine with server-enforced countdown timer and 30-second periodic auto-save (Module M3), implement objective auto-grading, manual subjective grading, candidate scorecards, and class analytics (Module M4), integrate accessible UI dashboards with dark mode design system, harden security and audit logging, execute the full automated test suite (19/19 passing), and freeze development for final demonstration.

- **Sprint Velocity Planned:** 52 Story Points (14 backlog items including #32, which was added on 5 Nov; points as recorded in the GitHub issues)
- **Delivered:** M3 merged 30 Oct (PR #28) and M4 merged 31 Oct (PRs #29, #30); #23 and #24 were already in commit `b7e0f11`. Sprint 1's carried-over M2 merged 2 Nov (PR #31). The load test (#32) was executed on 11 Nov in v1.0.1.
- **Defect Exit Criteria:** 0 Open Critical or High Defects (STP §5.4 Met)
- **Cumulative:** 104 / 104 Story Points delivered across both sprints
- **Evidence gap at the freeze (closed 11 Nov 2026):** the performance (OEP-NF-001/002), accessibility (OEP-NF-005) and TLS (OEP-SR-001) requirements were marked Accepted without executed evidence. They were verified in maintenance release v1.0.1 — see the [Completed RTM](docs/deliverable-4/Completed_RTM.md).

---

## 2. Planned vs. Completed Backlog Items

| Issue ID | Req ID | Title | Assignee | SP | Commit on GitHub |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **#15** | `OEP-F-009` | Candidate Assessment Discovery & Start | Aditya Rao (`034`) | 3 | `32262c0` (30 Oct), PR #28 |
| **#16** | `OEP-F-010` | Server-Enforced Countdown Timer Engine | Aditya Rao (`034`) | 5 | `32262c0` (30 Oct), PR #28 |
| **#17** | `OEP-F-011` | 30s Periodic Auto-Save & Auto-Submit | Aditya Rao (`034`) | 5 | `32262c0` (30 Oct), PR #28; auto-submit fixed in v1.0.1 (DEF-007, DEF-008) |
| **#18** | `OEP-F-012` | Question Palette & Review Flagging | Aditya Rao (`034`) | 3 | `32262c0` (30 Oct), PR #28 |
| **#19** | `OEP-F-013` | Instant Auto-Grading for Objective Questions | Akshansh Agrawal (`045`) | 5 | `39470c5` (31 Oct), PR #29 |
| **#20** | `OEP-F-014` | Instructor Manual Subjective Grading Portal | Akshansh Agrawal (`045`) | 5 | `39470c5` + `8bf7220` (31 Oct), PRs #29, #30 |
| **#21** | `OEP-F-015` | Private Candidate Scorecard Display | Akshansh Agrawal (`045`) | 3 | `39470c5` + `8bf7220` (31 Oct), PRs #29, #30 |
| **#22** | `OEP-F-016` | Class Performance & Difficulty Analytics | Akshansh Agrawal (`045`) | 5 | `39470c5` + `8bf7220` (31 Oct), PRs #29, #30 |
| **#23** | `OEP-UI-01` | Role Dashboards & Dark Mode Design System | Akshansh Agrawal (`045`) | 5 | `b7e0f11` (23 Oct) — built by Akshansh, committed by Vincent; WCAG fixes in v1.0.1 |
| **#24** | `OEP-SEC-01` | Security Audit Logging & IDOR Safeguards | A S Vincent (`@vinnieee7`) | 5 | `b7e0f11` (23 Oct); ownership checks in the M3/M4 commits |
| **#25** | `DEF-005` | [BUG] Student Scorecard Privacy Leak (IDOR) | Akshansh Agrawal (`045`) | 2 | `39470c5`, hardened in `8bf7220` (31 Oct) |
| **#26** | `DEF-006` | [BUG] Audit Log Socket Address Fallback | Aadish Sarin (`007`) | 1 | Fallback present in `logger.js` since `b7e0f11` |
| **#27** | `OEP-QA-01` | Comprehensive Test Suite & Cross-Testing | Aadish Sarin (`007`) | 2 | `b7e0f11` (written by Aadish, committed by Vincent) + `1293315`; 51 tests in v1.0.1 |
| **#32** | `OEP-PERF-01` | 500 Concurrent Users Load & Latency Test | Akshansh Agrawal (`045`) | 3 | Executed 11 Nov 2026 (v1.0.1): [results](docs/deliverable-4/evidence/performance-load-test.md) |

---

## 3. Team Member Work Breakdown (Sprint 2 Balanced Allocation — 7 Issues Each)

### A S Vincent (`PES2UG24CS002`, `@vinnieee7`) — 5 SP (27 SP cumulative)
1. **Security Controls & Audit Logging (`#24`):**
   - Created persistent audit logging middleware (`backend/src/middleware/logger.js`) recording actor, event, timestamp, and client IP.
   - Designed and mounted `/api/audit-logs` endpoint with RBAC restricting access to Administrators.
   - Formulated strict IDOR defenses preventing cross-student scorecard inspection.
2. **Cross-Module Architecture & Review:**
   - Architecture review and backend API endpoint alignment across M1, M2, M3, M4.
   - Facilitated Sprint 2 freeze and release candidate sign-off.

### Aditya Rao (`PES2UG24CS034`) — 16 SP (25 SP cumulative)
1. **Exam Delivery Engine (`#15`, `#16`, `#17`, `#18`):**
   - Implemented `backend/src/controllers/deliveryController.js` and `deliveryRoutes.js`.
   - Built the test-taking client interface (`ExamScreen.jsx`) with live server-synchronized countdown timer.
   - Implemented 30-second background auto-save interval and automatic submission upon timer expiration.
   - Implemented question navigation palette with color-coded answered/flagged indicators.

### Akshansh Agrawal (`PES2UG24CS045`) — 28 SP (28 SP cumulative)
1. **Evaluation, Scorecards & Analytics (`#19`, `#20`, `#21`, `#22`):**
   - Implemented `backend/src/controllers/evalController.js` and `evalRoutes.js`.
   - Developed auto-grading engine for MCQ and True/False responses.
   - Built Instructor Grading Portal (`InstructorPortal.jsx`) allowing subjective question evaluation, partial marks awarding, and written feedback.
   - Built candidate Scorecard view (`ScorecardView.jsx`) with score breakdown and solution explanations.
   - Built class aggregate analytics reporting average score, pass rate, and item difficulty index.
2. **Role Dashboards & UI Design System (`#23`):**
   - Implemented system-wide dark mode styling (`index.css`), committed by A S Vincent in `b7e0f11`. The 11 Nov audit found the muted text below the WCAG 2.1 AA 4.5:1 contrast minimum; fixed in v1.0.1.
   - Integrated responsive role dashboards across desktop and mobile viewports.
3. **Bug Remediation (`#25` / `DEF-005`):** Fixed critical IDOR vulnerability on scorecard endpoint.

### Aadish Sarin (`PES2UG24CS007`) — 3 SP (24 SP cumulative)
1. **QA Lead Verification & Release Sign-Off (`#27`):**
   - Maintained defect tracking log and updated Completed RTM to 100% coverage.
   - Authored and executed comprehensive integration test suite (`api.test.js`, first committed by A S Vincent in `b7e0f11`) validating 19 test cases across all 4 modules.
2. **Bug Remediation (`#26` / `DEF-006`):** Resolved socket address undefined error in mock Supertest requests.

---

## 4. Final Verification & Test Execution Results

At the freeze, all 19 automated integration tests passed (Jest + Supertest). The v1.0.1 re-run on 11 Nov 2026 (51 tests in 3 files) is recorded in the [Test Execution Report](docs/TEST_EXECUTION_REPORT.md).

```
PASS tests/integration/api.test.js
  === Online Exam Portal (OEP) Comprehensive Test Suite ===
    √ TC-SYS-01: Health check returns online status (26 ms)
    Module M1: Authentication & User/Role Management (OEP-F-001..004)
      √ TC-Auth-01: Register a new student account successfully (157 ms)
      √ TC-Auth-01a: Duplicate email registration is rejected with 409 Conflict (28 ms)
      √ TC-Auth-02: Valid credentials login returns JWT session with role claims (174 ms)
      √ TC-Auth-02a: Invalid password returns 401 Unauthorized (176 ms)
      √ TC-Auth-02b: Locked account login is blocked with 403 Forbidden (52 ms)
      √ TC-Auth-03: Password reset OTP request returns verification code (51 ms)
      √ TC-Auth-04: RBAC enforces that Students cannot create exams (403 Forbidden) (31 ms)
    Module M2: Exam & Question-Bank Management (OEP-F-005..008)
      √ TC-Exam-01: Instructor creates a new scheduled exam (94 ms)
      √ TC-Exam-03: Exam scheduling blocks start time after end time (400 Bad Request) (24 ms)
      √ TC-Exam-02: Instructor adds question with options to question bank (108 ms)
    Module M3: Exam Delivery Engine (OEP-F-009..012, OEP-SR-004)
      √ TC-Take-01 & TC-Sec-05: Student starts active exam (correct_answer stripped from payload) (81 ms)
      √ TC-Take-03: Periodic auto-save persists student answers (65 ms)
      √ TC-Take-04: Student submits exam attempt and triggers auto-grading (165 ms)
    Module M4: Evaluation, Results & Analytics (OEP-F-013..016, OEP-SR-005)
      √ TC-Eval-01: Auto-grading correctly computed score for objective questions (38 ms)
      √ TC-Eval-03 & TC-Sec-06: Student result privacy strictly blocks cross-student access (403 Forbidden) (55 ms)
      √ TC-Eval-02: Instructor grades subjective question manually (70 ms)
      √ TC-Eval-04: Instructor retrieves aggregate class analytics and item analysis (37 ms)
    Security & Audit Logging (OEP-NF-004)
      √ TC-Sec-04: Administrator retrieves persistent audit logs (38 ms)

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        37.188 s
```

---

## 5. Development Freeze

- **Planned freeze:** 30 October 2026.
- **Actual last feature merge:** 2 November 2026 (PR #31, M2). The M4 hardening (PR #30) merged on 31 October.
- **Documentation finalised:** 5 November 2026.
- **Maintenance release v1.0.1:** 11 November 2026 — fixes DEF-007 to DEF-012 and adds executed evidence for OEP-NF-001, OEP-NF-002, OEP-NF-005 and OEP-SR-001.
- **RTM Coverage:** 25 of 26 requirements Accepted with executed evidence, OEP-NF-002 Partial (since v1.0.1).
- **Defects Open:** 0 (12 logged, 12 closed).
