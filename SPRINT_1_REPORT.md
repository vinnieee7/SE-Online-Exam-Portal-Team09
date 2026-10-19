# Sprint 1 Report: Online Exam Portal (OEP)

> **Sprint Duration:** 19 October 2026 – 23 October 2026  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Milestone Due Date:** 23 October 2026  
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal](https://github.com/vinnieee7/SE-Online-Exam-Portal)

---

## 1. Executive Summary & Sprint Goal

**Sprint 1 Goal:** Establish the architectural foundation, persistent SQLite database schema and seed script, implement core security, authentication, and user management (Module M1), deliver instructor exam lifecycle and question-bank management (Module M2), and remediate all early-stage defects discovered during verification.

- **Sprint Velocity Planned:** 47 Story Points (14 Backlog Items)
- **Sprint Velocity Completed:** 47 Story Points (100% Commitment Met)
- **Defect Burndown:** 4 defects logged, 4 resolved and verified (0 Open)
- **Cross-Testing Mandate Status:** Compliant (Aadish tested Vincent's M1; Aditya tested Aadish's M2)

---

## 2. Planned vs. Completed Backlog Items

| Issue ID | Req ID | Title | Assignee | Est. SP | Outcome / Commit |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **#1** | `OEP-ENV-01` | Project Workspace & GitHub Actions CI | A S Vincent (`@vinnieee7`) | 3 | **Completed** (`2d4cb0b`) |
| **#2** | `OEP-ENV-02` | SQLite Schema & STP §6.4 Seed Engine | Aditya Rao (`034`) | 5 | **Completed** (`38a8513`) |
| **#3** | `OEP-F-001` | User Registration & Role Selection | A S Vincent (`@vinnieee7`) | 5 | **Completed** (`f43419a`) |
| **#4** | `OEP-F-002` | User Login & Secure JWT Session | A S Vincent (`@vinnieee7`) | 5 | **Completed** (`f43419a`) |
| **#5** | `OEP-F-003` | Password Reset via 6-Digit OTP | A S Vincent (`@vinnieee7`) | 3 | **Completed** (`f43419a`) |
| **#6** | `OEP-F-004` | Role-Based Access Control Middleware | A S Vincent (`@vinnieee7`) | 5 | **Completed** (`f43419a`) |
| **#7** | `OEP-F-005` | Exam Lifecycle CRUD Operations | Aadish Sarin (`007`) | 5 | **Completed** (`cab9cf8`) |
| **#8** | `OEP-F-006` | Question Bank CRUD (MCQ, T/F, Short) | Aadish Sarin (`007`) | 8 | **Completed** (`cab9cf8`) |
| **#9** | `OEP-F-007` | Exam Scheduling & Window Validation | Aadish Sarin (`007`) | 3 | **Completed** (`cab9cf8`) |
| **#10** | `OEP-F-008` | Question Randomization (Fisher-Yates) | Aadish Sarin (`007`) | 3 | **Completed** (`cab9cf8`) |
| **#11** | `DEF-001` | [BUG] Prevent DevTools Answer Key Leak | Aditya Rao (`034`) | 2 | **Resolved** (`c7c09e8`) |
| **#12** | `DEF-002` | [BUG] Fix Countdown Timer UTC Offset | Aditya Rao (`034`) | 2 | **Resolved** (`c7c09e8`) |
| **#13** | `DEF-003` | [BUG] Fix Case-Sensitive Email Registration | A S Vincent (`@vinnieee7`) | 1 | **Resolved** (`f43419a`) |
| **#14** | `DEF-004` | [BUG] Validate Exam End Time > Start Time | Aadish Sarin (`007`) | 2 | **Resolved** (`cab9cf8`) |

---

## 3. Team Member Work Breakdown (Sprint 1)

### A S Vincent (`PES2UG24CS002`, `@vinnieee7`) — 18 SP Delivered
1. **Workspace & CI Automation (`#1`):** Created the monorepo workspace structure, npm script orchestration, and automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`).
2. **Authentication & RBAC (`#3`, `#4`, `#5`, `#6`):**
   - Implemented Bcrypt password hashing (salt cost 10) in `backend/src/controllers/authController.js`.
   - Developed signed JWT session tokens with 24-hour expiration.
   - Built `backend/src/middleware/auth.js` enforcing server-side role validation.
   - Built candidate and faculty frontend authentication view (`AuthPage.jsx`) and context provider (`AuthContext.jsx`).
3. **Bug Remediation (`#13` / `DEF-003`):** Added case-insensitive email sanitization to block duplicate accounts.

### Aadish Sarin (`PES2UG24CS007`) — 19 SP Delivered
1. **Exam & Question Management (`#7`, `#8`, `#9`, `#10`):**
   - Built `backend/src/controllers/examController.js` and `backend/src/routes/examRoutes.js`.
   - Implemented full Question Bank CRUD supporting MCQ, True/False, and Short Answer question formats.
   - Added Fisher-Yates array shuffling algorithm for candidate question randomization.
2. **Bug Remediation (`#14` / `DEF-004`):** Fixed inverted start/end dates in exam scheduling.
3. **Cross-Testing Module M1:** Executed `TC-Auth-01` through `TC-Auth-04` verifying Vincent's implementation.

### Aditya Rao (`PES2UG24CS034`) — 9 SP Delivered
1. **Database Schema & Seed Engine (`#2`):** Implemented SQLite schema (`schema.sql`) and deterministic seed engine (`seed.js`) populating 7 accounts, 30 questions, and 4 exams.
2. **Early Bug Fixes (`#11` / `DEF-001`, `#12` / `DEF-002`):** Stripped correct answers from delivery API queries and normalized timestamp parsing.
3. **Cross-Testing Module M2:** Executed `TC-Exam-01` through `TC-Exam-04` verifying Aadish's implementation.

### Akshansh Agrawal (`PES2UG24CS045`) — 1 SP Delivered
1. **QA & Defect Reporting:** Performed manual exploratory testing on exam payload responses, identifying and logging critical defects `DEF-001` and `DEF-002`.

---

## 4. Testing & Verification Results

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

---

## 5. Deviations from Baseline Documentation

1. **Database Selection (SAD §3.2 Deviation):** SQLite 3 with WAL mode was selected instead of a heavier PostgreSQL daemon for local demonstration, enabling zero-config grading evaluation and 100% reproducible seeding in under 2 seconds.
2. **Fisher-Yates Randomization Timing (SRS §4.2 Optimization):** Question randomization is performed dynamically per assessment session generation on the server, ensuring students never receive static pre-cached questions.
