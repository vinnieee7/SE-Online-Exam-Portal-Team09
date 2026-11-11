# Sprint 1 Report: Online Exam Portal (OEP)

> **Sprint Duration:** 19 October 2026 – 23 October 2026  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Milestone Due Date:** 23 October 2026  
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)

---

## 1. Executive Summary & Sprint Goal

**Sprint 1 Goal:** Establish the architectural foundation, persistent SQLite database schema and seed script, implement core security, authentication, and user management (Module M1), deliver instructor exam lifecycle and question-bank management (Module M2), and remediate all early-stage defects discovered during verification.

- **Sprint Velocity Planned:** 52 Story Points (14 backlog items; points as recorded in the GitHub issues)
- **Delivered inside the sprint (by git commit date):** 22 Story Points — the workspace and M1 (#1, #3, #4, #5, #6, #13) in commits `5260d74` (19 Oct) and `b7e0f11` (23 Oct)
- **Carried over:** 30 Story Points — schema and seed (#2), M2 (#7–#10, #14) and the DEF-001/DEF-002 fixes (#11, #12). Their code was committed 30 Oct – 1 Nov 2026 and was on `main` by 2 Nov 2026 (PR #28, PR #31).
- **Defect Burndown:** 4 defects logged, 4 fixed and verified (0 open); the fixes for DEF-001, DEF-002 and DEF-004 reached GitHub with the carried-over code
- **Cross-Testing Mandate Status:** Compliant (Aadish tested Vincent's M1; Aditya tested Aadish's M2)

---

## 2. Planned vs. Completed Backlog Items

| Issue ID | Req ID | Title | Assignee | SP | Outcome | Commit on GitHub |
| :---: | :---: | :--- | :--- | :---: | :--- | :--- |
| **#1** | `OEP-ENV-01` | Project Workspace & GitHub Actions CI | A S Vincent (`@vinnieee7`) | 3 | Delivered in sprint | `5260d74` (19 Oct) |
| **#2** | `OEP-ENV-02` | SQLite Schema & STP §6.4 Seed Engine | Aditya Rao (`034`) | 5 | Carried over | `1293315` (30 Oct) — written by Aditya, committed by Vincent |
| **#3** | `OEP-F-001` | User Registration & Role Selection | A S Vincent (`@vinnieee7`) | 5 | Delivered in sprint | `b7e0f11` (23 Oct) |
| **#4** | `OEP-F-002` | User Login & Secure JWT Session | A S Vincent (`@vinnieee7`) | 5 | Delivered in sprint | `b7e0f11` (23 Oct) |
| **#5** | `OEP-F-003` | Password Reset via 6-Digit OTP | A S Vincent (`@vinnieee7`) | 3 | Delivered in sprint | `b7e0f11` (23 Oct) |
| **#6** | `OEP-F-004` | Role-Based Access Control Middleware | A S Vincent (`@vinnieee7`) | 5 | Delivered in sprint | `b7e0f11` (23 Oct) |
| **#7** | `OEP-F-005` | Exam Lifecycle CRUD Operations | Aadish Sarin (`007`) | 5 | Carried over | `bcfc262` (1 Nov), PR #31 merged 2 Nov |
| **#8** | `OEP-F-006` | Question Bank CRUD (MCQ, T/F, Short) | Aadish Sarin (`007`) | 8 | Carried over | `bcfc262` (1 Nov), PR #31 merged 2 Nov |
| **#9** | `OEP-F-007` | Exam Scheduling & Window Validation | Aadish Sarin (`007`) | 3 | Carried over | `bcfc262` (1 Nov), PR #31 merged 2 Nov |
| **#10** | `OEP-F-008` | Question Randomization (Fisher-Yates) | Aadish Sarin (`007`) | 3 | Carried over | `bcfc262` (1 Nov), PR #31 merged 2 Nov |
| **#11** | `DEF-001` | [BUG] Prevent DevTools Answer Key Leak | Aditya Rao (`034`) | 2 | Carried over | `32262c0` (30 Oct), PR #28 |
| **#12** | `DEF-002` | [BUG] Fix Countdown Timer UTC Offset | Aditya Rao (`034`) | 2 | Carried over | `32262c0` (30 Oct), PR #28 |
| **#13** | `DEF-003` | [BUG] Fix Case-Sensitive Email Registration | A S Vincent (`@vinnieee7`) | 1 | Delivered in sprint | `b7e0f11` (23 Oct) |
| **#14** | `DEF-004` | [BUG] Validate Exam End Time > Start Time | Aadish Sarin (`007`) | 2 | Carried over | `bcfc262` (1 Nov), PR #31 merged 2 Nov |

"Commit on GitHub" is the first commit in this repository that contains the item's code; the dates are git commit dates.

---

## 3. Team Member Work Breakdown (Sprint 1)

### A S Vincent (`PES2UG24CS002`, `@vinnieee7`) — 22 SP, all delivered in the sprint
1. **Workspace & CI Automation (`#1`):** Created the monorepo workspace structure, npm script orchestration, and automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`).
2. **Authentication & RBAC (`#3`, `#4`, `#5`, `#6`):**
   - Implemented Bcrypt password hashing (salt cost 10) in `backend/src/controllers/authController.js`.
   - Developed signed JWT session tokens with 24-hour expiration.
   - Built `backend/src/middleware/auth.js` enforcing server-side role validation.
   - Built candidate and faculty frontend authentication view (`AuthPage.jsx`) and context provider (`AuthContext.jsx`).
3. **Bug Remediation (`#13` / `DEF-003`):** Added case-insensitive email sanitization to block duplicate accounts.
4. **Integration:** committed the shared frontend shell and theme (built by Akshansh, issue #23) and the first version of the integration test suite (written by Aadish, issue #27) together with M1 in `b7e0f11`.

### Aadish Sarin (`PES2UG24CS007`) — 21 SP planned, carried over (merged 2 Nov)
1. **Exam & Question Management (`#7`, `#8`, `#9`, `#10`):**
   - Built `backend/src/controllers/examController.js` and `backend/src/routes/examRoutes.js`.
   - Implemented full Question Bank CRUD supporting MCQ, True/False, and Short Answer question formats.
   - Added Fisher-Yates array shuffling algorithm for candidate question randomization.
   - Code committed 1 Nov 2026 (`bcfc262`) and merged 2 Nov 2026 via PR #31.
2. **Bug Remediation (`#14` / `DEF-004`):** Fixed inverted start/end dates in exam scheduling.
3. **Cross-Testing Module M1:** Executed `TC-Auth-01` through `TC-Auth-04` verifying Vincent's implementation.

### Aditya Rao (`PES2UG24CS034`) — 9 SP planned, carried over (committed 30 Oct)
1. **Database Schema & Seed Engine (`#2`):** Implemented SQLite schema (`schema.sql`) and deterministic seed engine (`seed.js`) populating 7 accounts, 30 questions, and 4 exams. Committed to GitHub by A S Vincent in `1293315` (30 Oct 2026) during the CI repair.
2. **Early Bug Fixes (`#11` / `DEF-001`, `#12` / `DEF-002`):** Stripped correct answers from delivery API queries and normalized timestamp parsing. Both fixes are in the first M3 commit on GitHub, `32262c0` (30 Oct 2026).
3. **Cross-Testing Module M2:** Executed `TC-Exam-01` through `TC-Exam-04` verifying Aadish's implementation.

### Akshansh Agrawal (`PES2UG24CS045`) — no Sprint 1 issues assigned (QA support)
1. **QA & Defect Reporting:** Performed manual exploratory testing on exam payload responses, identifying and logging critical defects `DEF-001` and `DEF-002`.

---

## 4. Testing & Verification Results (as recorded by the team)

| Test Case | Description | Expected Result | Actual Result | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-SYS-01** | System health check (`GET /api/health`) | HTTP 200, status `ONLINE` | HTTP 200, status `ONLINE` | ✅ PASS |
| **TC-Auth-01** | New student registration | HTTP 201, sanitized user | HTTP 201, password excluded | ✅ PASS |
| **TC-Auth-01a**| Duplicate email registration | HTTP 409 Conflict | HTTP 409 Conflict | ✅ PASS |
| **TC-Auth-02** | Valid credentials login | HTTP 200, signed JWT | HTTP 200, JWT with role claims | ✅ PASS |
| **TC-Auth-02a**| Invalid password login | HTTP 401 Unauthorized | HTTP 401 Unauthorized | ✅ PASS |
| **TC-Auth-02b**| Locked account login attempt | HTTP 403 Forbidden | HTTP 403 Forbidden | ✅ PASS |
| **TC-Auth-03** | Password reset OTP verification | HTTP 200, 6-digit OTP | HTTP 200, OTP verified | ✅ PASS |
| **TC-Auth-04** | Student attempts instructor exam POST | HTTP 403 Forbidden | HTTP 403 Forbidden | ✅ PASS |
| **TC-Exam-01** | Instructor creates new exam | HTTP 201, exam ID | HTTP 201, ID returned | ✅ PASS |
| **TC-Exam-02** | Instructor adds banked question | HTTP 201, question ID | HTTP 201, options created | ✅ PASS |
| **TC-Exam-03** | End time before start time | HTTP 400 Bad Request | HTTP 400 Bad Request | ✅ PASS |

> **Note (added 11 Nov 2026):** the earliest CI run on GitHub is from 30 Oct 2026 (it failed because `seed.js` was missing; fixed in `1293315`). The M2 cases `TC-Exam-01`–`03` first ran in CI on 1 Nov 2026 with PR #31, because the M2 code was not on GitHub before then.

---

## 5. Deviations from Baseline Documentation

1. **Database Selection (SAD §3.2 Deviation):** SQLite 3 (foreign keys enforced; WAL journal mode since v1.0.1, DEF-011) was selected instead of a heavier PostgreSQL daemon for local demonstration, enabling zero-config grading evaluation and reproducible seeding in about 1 second.
2. **Fisher-Yates Randomization Timing (SRS §4.2 Optimization):** Question randomization is performed on the server for each candidate, so students never receive a shared static order. Since v1.0.1 the order is seeded by the attempt id, so it stays the same when a candidate refreshes (DEF-010).
