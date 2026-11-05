# Sprint 2 Report: Online Exam Portal (OEP)

> **Sprint Duration:** 26 October 2026 – 30 October 2026  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Milestone Due Date & Development Freeze:** 30 October 2026  
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal](https://github.com/vinnieee7/SE-Online-Exam-Portal)

---

## 1. Executive Summary & Sprint Goal

**Sprint 2 Goal:** Complete the active exam delivery engine with server-enforced countdown timer and 30-second periodic auto-save (Module M3), implement objective auto-grading, manual subjective grading, candidate scorecards, and class analytics (Module M4), integrate accessible UI dashboards with dark mode design system, harden security and audit logging, execute the full automated test suite (19/19 passing), and freeze development for final demonstration.

- **Sprint Velocity Planned:** 44 Story Points (13 Backlog Items)
- **Sprint Velocity Completed:** 44 Story Points (100% Commitment Met)
- **Defect Exit Criteria:** 0 Open Critical or High Defects (STP §5.4 Met)
- **Cumulative Velocity:** 91 / 91 Story Points across both sprints (100% Accepted)
- **Build Status:** Ready for final evaluation (`100% Accepted` on Completed RTM)

---

## 2. Planned vs. Completed Backlog Items

| Issue ID | Req ID | Title | Assignee | Est. SP | Outcome / Commit |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **#15** | `OEP-F-009` | Candidate Assessment Discovery & Start | Aditya Rao (`034`) | 3 | **Completed** (`c7c09e8`) |
| **#16** | `OEP-F-010` | Server-Enforced Countdown Timer Engine | Aditya Rao (`034`) | 3 | **Completed** (`c7c09e8`) |
| **#17** | `OEP-F-011` | 30s Periodic Auto-Save & Auto-Submit | Aditya Rao (`034`) | 3 | **Completed** (`c7c09e8`) |
| **#18** | `OEP-F-012` | Question Palette & Review Flagging | Aditya Rao (`034`) | 3 | **Completed** (`c7c09e8`) |
| **#19** | `OEP-F-013` | Instant Auto-Grading for Objective Questions| Akshansh Agrawal (`045`)| 5 | **Completed** (`72c9961`) |
| **#20** | `OEP-F-014` | Instructor Manual Subjective Grading Portal | Akshansh Agrawal (`045`)| 5 | **Completed** (`72c9961`) |
| **#21** | `OEP-F-015` | Private Candidate Scorecard Display | Akshansh Agrawal (`045`)| 3 | **Completed** (`72c9961`) |
| **#22** | `OEP-F-016` | Class Performance & Difficulty Analytics | Akshansh Agrawal (`045`)| 3 | **Completed** (`72c9961`) |
| **#23** | `OEP-UI-01` | Role Dashboards & Dark Mode Design System | Akshansh Agrawal (`045`) | 5 | **Completed** (`75b5278`) |
| **#24** | `OEP-SEC-01`| Security Audit Logging & IDOR Safeguards | A S Vincent (`@vinnieee7`) | 5 | **Completed** (`75b5278`) |
| **#25** | `DEF-005` | [BUG] Student Scorecard Privacy Leak (IDOR)| Akshansh Agrawal (`045`)| 2 | **Resolved** (`72c9961`) |
| **#26** | `DEF-006` | [BUG] Audit Log Socket Address Fallback | Aadish Sarin (`007`) | 1 | **Resolved** (`c7c09e8`) |
| **#27** | `OEP-QA-01` | Comprehensive Test Suite & Cross-Testing | Aadish Sarin (`007`) | 2 | **Completed** (`e6fc782`) |

---

## 3. Team Member Work Breakdown (Sprint 2 Balanced Allocation)

### A S Vincent (`PES2UG24CS002`, `@vinnieee7`) — 7 SP Delivered (25 SP Cumulative)
1. **Security Controls & Audit Logging (`#24`):**
   - Created persistent audit logging middleware (`backend/src/middleware/logger.js`) recording actor, event, timestamp, and client IP.
   - Designed and mounted `/api/audit-logs` endpoint with RBAC restricting access to Administrators.
   - Formulated strict IDOR defenses preventing cross-student scorecard inspection.
2. **Cross-Module Architecture & Review:**
   - Architecture review and backend API endpoint alignment across M1, M2, M3, M4.
   - Facilitated Sprint 2 freeze and release candidate sign-off.

### Aditya Rao (`PES2UG24CS034`) — 12 SP Delivered (21 SP Cumulative)
1. **Exam Delivery Engine (`#15`, `#16`, `#17`, `#18`):**
   - Implemented `backend/src/controllers/deliveryController.js` and `deliveryRoutes.js`.
   - Built the test-taking client interface (`ExamScreen.jsx`) with live server-synchronized countdown timer.
   - Implemented 30-second background auto-save interval and automatic submission upon timer expiration.
   - Implemented question navigation palette with color-coded answered/flagged indicators.

### Akshansh Agrawal (`PES2UG24CS045`) — 21 SP Delivered (23 SP Cumulative)
1. **Evaluation, Scorecards & Analytics (`#19`, `#20`, `#21`, `#22`):**
   - Implemented `backend/src/controllers/evalController.js` and `evalRoutes.js`.
   - Developed auto-grading engine for MCQ and True/False responses.
   - Built Instructor Grading Portal (`InstructorPortal.jsx`) allowing subjective question evaluation, partial marks awarding, and written feedback.
   - Built candidate Scorecard view (`ScorecardView.jsx`) with score breakdown and solution explanations.
   - Built class aggregate analytics reporting average score, pass rate, and item difficulty index.
2. **Role Dashboards & UI Design System (`#23`):**
   - Implemented system-wide dark mode styling (`index.css`) conforming to WCAG 2.1 AA 4.5:1 contrast standards.
   - Integrated responsive role dashboards across desktop and mobile viewports.
3. **Bug Remediation (`#25` / `DEF-005`):** Fixed critical IDOR vulnerability on scorecard endpoint.

### Aadish Sarin (`PES2UG24CS007`) — 3 SP Delivered (22 SP Cumulative)
1. **QA Lead Verification & Release Sign-Off (`#27`):**
   - Maintained defect tracking log and updated Completed RTM to 100% coverage.
   - Authored and executed comprehensive integration test suite (`api.test.js`) validating 19 test cases across all 4 modules.
2. **Bug Remediation (`#26` / `DEF-006`):** Resolved socket address undefined error in mock Supertest requests.

---

## 4. Final Verification & Test Execution Results

All 19 automated integration tests were executed via Jest + Supertest:

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

## 5. Development Cycle Freeze (30 October 2026)

In strict adherence to faculty submission deadlines:
- **Development Freeze Date:** 30 October 2026.
- **Final Product State:** Operational and stable.
- **RTM Coverage:** 26 / 26 Requirements Accepted (100%).
- **Defects Open:** 0 Critical, 0 High, 0 Medium, 0 Low.
