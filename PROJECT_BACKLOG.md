# Online Exam Portal (OEP) — Master Product Backlog

> **PES University — Department of Computer Science and Engineering**  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Author & Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)  
> **Baseline Documentation:** SRS v1.1, SAD v1.0 and STP v1.0 (submitted separately; not stored in this repository) | [Completed RTM](docs/deliverable-4/Completed_RTM.md)

---

## 1. Backlog Overview & Estimation Methodology

The Product Backlog encompasses all functional requirements (FR), non-functional requirements (NFR), security constraints (SR), bug remediation items (DEF), and DevOps environment prerequisites extracted from the Software Requirements Specification (SRS v1.1) and Software Test Plan (STP v1.0).

- **Estimation Scale:** Modified Fibonacci sequence (`1, 2, 3, 5, 8, 13`) story points (SP).
- **Total Backlog Items:** 28 items (GitHub issues #1–#27 and #32).
- **Total Backlog Size:** 104 story points. Feature issues carry their points in the GitHub issue body; the six bug issues (#11–#14, #25, #26) have no points field on GitHub, so their points come from this file.
- **Sprint Distribution:** Two fixed cycles:
  - **Sprint 1 (19 Oct – 23 Oct 2026):** Foundation, Auth/RBAC (M1), Exam Management (M2), initial defect fixes (52 SP).
  - **Sprint 2 (26 Oct – 30 Oct 2026):** Exam Delivery (M3), Evaluation & Analytics (M4), UI/UX Shell, Security & Audit, Final Verification (52 SP).
- **Delivery against plan (git history):** the workspace and M1 (22 SP) have commits dated inside Sprint 1. The schema and seed (#2), M2 (#7–#10, #14) and the DEF-001/DEF-002 fixes (#11, #12) were committed 30 Oct – 1 Nov and were all on `main` by 2 Nov 2026 (PR #28, PR #31). Details: [SPRINT_1_REPORT.md](SPRINT_1_REPORT.md).
- **Maintenance release v1.0.1 (11 Nov 2026):** six defects found in viva-preparation testing (DEF-007 – DEF-012) were fixed, and the performance, accessibility, TLS and security-scan requirements were verified with executed evidence. See [section 6](#6-maintenance-release-v101-11-nov-2026).

---

## 2. Team Work Allocation Summary (Balanced Distribution — 7 Issues Each)

| Member Name | SRN | Primary Module / Responsibility | Issues Assigned | Sprint 1 SP | Sprint 2 SP | Total SP |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **A S Vincent** | `PES2UG24CS002` | **Dev Lead & Facilitator:** Module M1 (Auth & RBAC), Security Audit Trail, Cross-Testing M4 | **7 Issues** (#1, #3, #4, #5, #6, #13, #24) | 22 | 5 | **27 SP** |
| **Aadish Sarin** | `PES2UG24CS007` | **Team & QA Lead:** Module M2 (Exam Lifecycle, Question Bank), Integration Test Suite, RTM | **7 Issues** (#7, #8, #9, #10, #14, #26, #27) | 21 | 3 | **24 SP** |
| **Aditya Rao** | `PES2UG24CS034` | **DevOps Lead:** Module M3 (Delivery Engine, Timer, Auto-save), Database Schema & Seed | **7 Issues** (#2, #11, #12, #15, #16, #17, #18) | 9 | 16 | **25 SP** |
| **Akshansh Agrawal** | `PES2UG24CS045` | **Performance & UX Lead:** Module M4 (Auto-Grading, Analytics), UI Shell, JMeter Load Testing | **7 Issues** (#19, #20, #21, #22, #23, #25, #32) | 0 | 28 | **28 SP** |
| **Team Total** | — | — | **28 Issues** | **52 SP** | **52 SP** | **104 SP** |

---

## 3. Sprint 1 Master Backlog Items (19 Oct – 23 Oct 2026)

### Issue #1: Project Workspace Initialization, CI Pipeline & Tooling
- **Issue ID:** `OEP-ENV-01` | **GitHub Issue:** `#1`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
- **Story Points:** 3 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `enhancement`, `ci/cd`, `documentation`, `vincent-PES2UG24CS002`
- **User Story:**
  > *As Dev Lead, I want a standardized monorepo structure with automated GitHub Actions CI, so that backend tests and frontend production builds are automatically verified on every push and pull request.*
- **Description:** Initialize project root with Express.js API backend, Vite React frontend, unified npm scripts, ESLint/Oxlint, and GitHub Actions workflow (`.github/workflows/ci.yml`).
- **Acceptance Criteria:**
  1. `npm install` and `npm test` execute from root.
  2. GitHub Actions runs Node 20 on Ubuntu with dependency caching.
  3. CI pipeline triggers on `main`, `develop`, and `feature/**` branches.
- **Resolution Status:** **Closed / Merged** via `chore: Initialize Online Exam Portal workspace, CI/CD workflow & SE documentation (Sprint-1)` (Commit `5260d74`, 19 Oct 2026).

---

### Issue #2: SQLite Database Schema & Reproducible Seed Engine
- **Issue ID:** `OEP-ENV-02` | **GitHub Issue:** `#2`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `database`, `backend`, `sprint-1`, `aditya-PES2UG24CS034`
- **User Story:**
  > *As DevOps Lead, I want a complete relational SQLite schema and deterministic seed script, so that developers and automated test suites have realistic data conforming to STP §6.4.*
- **Description:** Implement `schema.sql` (users, exams, questions, options, attempts, answers, audit_logs) and `seed.js` populating 7 users, 30 questions, and 4 exams.
- **Acceptance Criteria:**
  1. Foreign keys and cascade constraints enforced.
  2. `npm run db:reset` seeds 100% STP §6.4 compliant records in under 2 seconds.
- **Resolution Status:** **Closed / Merged.** `schema.sql`, `seed.js` and `db.js` were written by Aditya Rao and committed to `main` by A S Vincent in `1293315` (30 Oct 2026) as part of the CI repair: the first CI run had failed with `Cannot find module …/seed.js`.

---

### Issue #3: User Registration with Email Uniqueness & Role Request
- **Issue ID:** `OEP-F-001` | **GitHub Issue:** `#3`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `enhancement`, `backend`, `frontend`, `auth`, `vincent-PES2UG24CS002`
- **Requirement Ref:** `OEP-F-001`, `DS-Auth-01` | **Test Case:** `TC-Auth-01`, `TC-Auth-01a`
- **User Story:**
  > *As a new student or instructor, I want to register for an account using my institutional email, name, password, and requested role, so that I can gain authenticated access to the assessment portal.*
- **Description:** Implement `POST /api/auth/register` with validation, duplicate email rejection (`409 Conflict`), and case-insensitive email normalization.
- **Acceptance Criteria:**
  1. Successful registration returns `201 Created` with sanitized user object (password excluded).
  2. Duplicate email returns `409 Conflict`.
  3. Passwords hashed using bcrypt (cost 10).
- **Resolution Status:** **Closed / Merged** via `feat(M1): … Implement registration, bcrypt hashing, JWT login, RBAC middleware & UI shell` (Commit `b7e0f11`, 23 Oct 2026). Verified by Aadish Sarin (`TC-Auth-01`).

---

### Issue #4: User Login & Secure JWT Session Generation
- **Issue ID:** `OEP-F-002` | **GitHub Issue:** `#4`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `enhancement`, `backend`, `security`, `auth`, `vincent-PES2UG24CS002`
- **Requirement Ref:** `OEP-F-002`, `DS-Auth-02`, `OEP-SR-002` | **Test Case:** `TC-Auth-02`, `TC-Auth-02a`, `TC-Auth-02b`
- **User Story:**
  > *As a registered user, I want to authenticate using my email and password, so that I receive a cryptographically signed JWT token with my role claims to access protected views.*
- **Description:** Implement `POST /api/auth/login`. Verify password with `bcrypt.compare`. Enforce account lockout checking (`is_locked = 1` returns `403 Forbidden`). Issue 24-hour signed JWT.
- **Acceptance Criteria:**
  1. Valid credentials return `200 OK` with token and user claims.
  2. Invalid credentials return `401 Unauthorized`.
  3. Locked accounts return `403 Forbidden` with descriptive message.
- **Resolution Status:** **Closed / Merged** via Commit `b7e0f11`. Verified by Aadish Sarin (`TC-Auth-02`).

---

### Issue #5: Password Reset via 6-Digit One-Time Password (OTP)
- **Issue ID:** `OEP-F-003` | **GitHub Issue:** `#5`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
- **Story Points:** 3 SP | **Priority:** Medium | **Milestone:** Sprint 1
- **Labels:** `enhancement`, `backend`, `frontend`, `auth`, `vincent-PES2UG24CS002`
- **Requirement Ref:** `OEP-F-003`, `DS-Auth-03` | **Test Case:** `TC-Auth-03`
- **User Story:**
  > *As a registered user who forgot my password, I want to request a 6-digit OTP and reset my password, so that I can securely regain portal access.*
- **Description:** Implement `POST /api/auth/reset-password/request` generating a random 6-digit OTP with expiry, and `POST /api/auth/reset-password/verify` applying the new bcrypt hash.
- **Acceptance Criteria:**
  1. OTP generation invalidates previous unused OTPs.
  2. OTP matches before password update is committed.
  3. Audit log records `PASSWORD_RESET_REQUEST` and `PASSWORD_RESET_SUCCESS` events.
- **Resolution Status:** **Closed / Merged** via Commit `b7e0f11`. Acceptance criterion 1 (a new code invalidates earlier unused codes) and a cryptographically secure code generator were added in v1.0.1 (11 Nov 2026, `TC-Auth-03b`). Verified by Aadish Sarin (`TC-Auth-03`).

---

### Issue #6: Server-Side Role-Based Access Control (RBAC) Middleware
- **Issue ID:** `OEP-F-004` | **GitHub Issue:** `#6`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `security`, `backend`, `auth`, `vincent-PES2UG24CS002`
- **Requirement Ref:** `OEP-F-004`, `DS-Auth-04`, `OEP-SR-003` | **Test Case:** `TC-Auth-04`, `TC-Sec-03`
- **User Story:**
  > *As an administrator, I want server-side RBAC middleware to validate JWT signatures and enforce role permissions, so that students cannot access exam creation, grading, or audit APIs.*
- **Description:** Implement `verifyToken` and `authorizeRoles(...allowedRoles)` in `backend/src/middleware/auth.js`.
- **Acceptance Criteria:**
  1. Missing or corrupted bearer tokens return `401 Unauthorized`.
  2. Valid token but insufficient role returns `403 Forbidden`.
  3. `req.user` payload populated with `id, email, role, name`.
- **Resolution Status:** **Closed / Merged** via Commit `b7e0f11`. Verified by Aadish Sarin (`TC-Auth-04`); token-tampering cases automated in v1.0.1 (`TC-Sec-03a`–`f`).

---

### Issue #7: Exam Lifecycle CRUD Operations
- **Issue ID:** `OEP-F-005` | **GitHub Issue:** `#7`
- **Assigned To:** Aadish Sarin (`PES2UG24CS007`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `enhancement`, `backend`, `sprint-1`, `aadish-PES2UG24CS007`
- **Requirement Ref:** `OEP-F-005`, `DS-Exam-01` | **Test Case:** `TC-Exam-01`
- **User Story:**
  > *As an instructor, I want to create, view, update, and publish exams, so that I can organize tests with durations, descriptions, and assigned question sets.*
- **Description:** Build `examController.js` and `examRoutes.js` supporting `POST /api/exams`, `GET /api/exams`, and `PUT /api/exams/:id`.
- **Acceptance Criteria:** Only instructors/admins can perform CRUD; returns created exam ID.
- **Resolution Status:** **Closed / Merged** via Commit `bcfc262` (1 Nov 2026); PR #31 merged 2 Nov 2026, after Sprint 1 and after the planned 30 Oct freeze. Verified by Aditya Rao (`TC-Exam-01`).

---

### Issue #8: Question Bank CRUD Management (MCQ, True/False, Short Answer)
- **Issue ID:** `OEP-F-006` | **GitHub Issue:** `#8`
- **Assigned To:** Aadish Sarin (`PES2UG24CS007`)
- **Story Points:** 8 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `enhancement`, `backend`, `sprint-1`, `aadish-PES2UG24CS007`
- **Requirement Ref:** `OEP-F-006`, `DS-Exam-02` | **Test Case:** `TC-Exam-02`
- **User Story:**
  > *As an instructor, I want to maintain a question bank supporting Multiple Choice, True/False, and Short Answer question types with option sets and marks, so that I can reuse questions across assessments.*
- **Description:** Implement `POST /api/exams/questions` and `GET /api/exams/questions`. Store options in the `options` table with atomic transaction rollback.
- **Acceptance Criteria:** Inserts question record and associated option rows; enforces correct answer specification.
- **Resolution Status:** **Closed / Merged** via Commit `bcfc262` (1 Nov 2026); PR #31 merged 2 Nov 2026. Verified by Aditya Rao (`TC-Exam-02`).

---

### Issue #9: Exam Scheduling, Duration & Window Validation
- **Issue ID:** `OEP-F-007` | **GitHub Issue:** `#9`
- **Assigned To:** Aadish Sarin (`PES2UG24CS007`)
- **Story Points:** 3 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `enhancement`, `backend`, `sprint-1`, `aadish-PES2UG24CS007`
- **Requirement Ref:** `OEP-F-007`, `DS-Exam-03` | **Test Case:** `TC-Exam-03`
- **User Story:**
  > *As an instructor, I want exam scheduling rules strictly validated, so that assessments cannot have start times after end times or non-positive durations.*
- **Description:** Validate ISO 8601 date inputs in `examController.js`.
- **Acceptance Criteria:** Returns `400 Bad Request` if `end_time <= start_time` or `duration_minutes <= 0`.
- **Resolution Status:** **Closed / Merged** via Commit `bcfc262` (1 Nov 2026); PR #31 merged 2 Nov 2026. Verified by Aditya Rao (`TC-Exam-03`).

---

### Issue #10: Question Order Randomization Engine (Fisher-Yates)
- **Issue ID:** `OEP-F-008` | **GitHub Issue:** `#10`
- **Assigned To:** Aadish Sarin (`PES2UG24CS007`)
- **Story Points:** 3 SP | **Priority:** Medium | **Milestone:** Sprint 1
- **Labels:** `enhancement`, `backend`, `sprint-1`, `aadish-PES2UG24CS007`
- **Requirement Ref:** `OEP-F-008`, `DS-Exam-04` | **Test Case:** `TC-Exam-04`
- **User Story:**
  > *As an instructor, I want questions and options randomized using the Fisher-Yates algorithm, so that each candidate receives an individualized question sequence to deter cheating.*
- **Description:** Implement server-side Fisher-Yates shuffle on exam question delivery.
- **Acceptance Criteria:** Preserves total question count; sequence varies across candidate attempt records.
- **Resolution Status:** **Closed / Merged** via Commit `bcfc262` (1 Nov 2026); PR #31 merged 2 Nov 2026. Verified by Aditya Rao (`TC-Exam-04`); automated in v1.0.1 (`TC-Exam-04a`–`c`). Since v1.0.1 the delivery engine seeds the shuffle with the attempt id, so one attempt keeps one order across refreshes (DEF-010).

---

### Issue #11: [BUG] DevTools Answer Key Leak in Exam Delivery Payload
- **Issue ID:** `DEF-001` | **GitHub Issue:** `#11`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`) | **Reporter:** Akshansh Agrawal (`PES2UG24CS045`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `bug`, `security`, `sprint-1`, `aditya-PES2UG24CS034`
- **Requirement Ref:** `OEP-SR-004` | **Test Case:** `TC-Sec-05`
- **Description:** `SELECT * FROM questions` leaked `correct_answer` and `explanation` in student JSON response.
- **Resolution:** Explicitly selected only safe fields (`id, question_text, question_type, marks`) for student delivery payloads.
- **Resolution Status:** **Closed / Merged.** The safe column list is in the first version of `deliveryController.js` on GitHub, commit `32262c0` (30 Oct 2026, PR #28). Verified by A S Vincent (`TC-Sec-05`).

---

### Issue #12: [BUG] Server Countdown Timer Calculates Negative Offset Due to Timezone
- **Issue ID:** `DEF-002` | **GitHub Issue:** `#12`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`) | **Reporter:** Akshansh Agrawal (`PES2UG24CS045`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `bug`, `backend`, `sprint-1`, `aditya-PES2UG24CS034`
- **Requirement Ref:** `OEP-F-010` | **Test Case:** `TC-Take-02`
- **Description:** Database stored UTC timestamp without explicit ISO trailing `Z`, causing a 5.5 hour IST offset error.
- **Resolution:** Normalized timestamps with `new Date().toISOString()`.
- **Resolution Status:** **Closed / Merged** via Commit `32262c0` (30 Oct 2026, PR #28). Verified by Akshansh Agrawal (`TC-Take-02`); automated in v1.0.1 (`TC-Take-02a`–`e`, including a DEF-002 regression check under the Asia/Kolkata timezone).

---

### Issue #13: [BUG] Duplicate Student Registration Allowed with Uppercase Email
- **Issue ID:** `DEF-003` | **GitHub Issue:** `#13`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`) | **Reporter:** Aadish Sarin (`PES2UG24CS007`)
- **Story Points:** 1 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `bug`, `backend`, `auth`, `vincent-PES2UG24CS002`
- **Requirement Ref:** `OEP-F-001` | **Test Case:** `TC-Auth-01a`
- **Description:** SQLite default `TEXT UNIQUE` allowed `Student1@pesu.edu` alongside `student1@pesu.edu`.
- **Resolution:** Added `.toLowerCase().trim()` across registration, login, and password reset endpoints.
- **Resolution Status:** **Closed / Merged** via Commit `b7e0f11`. Verified by Aadish Sarin (`TC-Auth-01a`).

---

### Issue #14: [BUG] Exam End Time Allowed Prior to Start Time
- **Issue ID:** `DEF-004` | **GitHub Issue:** `#14`
- **Assigned To:** Aadish Sarin (`PES2UG24CS007`) | **Reporter:** Aditya Rao (`PES2UG24CS034`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `bug`, `backend`, `sprint-1`, `aadish-PES2UG24CS007`
- **Requirement Ref:** `OEP-F-007` | **Test Case:** `TC-Exam-03`
- **Description:** Missing server validation allowed inverted exam schedules.
- **Resolution:** Enforced `end_time > start_time` check returning `400 Bad Request`.
- **Resolution Status:** **Closed / Merged** via Commit `bcfc262` (1 Nov 2026); PR #31 merged 2 Nov 2026. Verified by Aditya Rao (`TC-Exam-03`).

---

## 4. Sprint 2 Master Backlog Items (26 Oct – 30 Oct 2026)

### Issue #15: Candidate Assessment Discovery & Start Interface
- **Issue ID:** `OEP-F-009` | **GitHub Issue:** `#15`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`)
- **Story Points:** 3 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `frontend`, `backend`, `sprint-2`, `aditya-PES2UG24CS034`
- **Requirement Ref:** `OEP-F-009`, `DS-Take-01` | **Test Case:** `TC-Take-01`
- **User Story:**
  > *As a student, I want to see a list of my scheduled and live exams with duration instructions, so that I can initiate an attempt when the assessment opens.*
- **Acceptance Criteria:** Displays active exams; creates attempt record upon start.
- **Resolution Status:** **Closed / Merged** via Commit `32262c0` (30 Oct 2026, PR #28). Verified by Akshansh Agrawal (`TC-Take-01`).

---

### Issue #16: Server-Enforced Countdown Timer Engine
- **Issue ID:** `OEP-F-010` | **GitHub Issue:** `#16`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `backend`, `frontend`, `sprint-2`, `aditya-PES2UG24CS034`
- **Requirement Ref:** `OEP-F-010`, `DS-Take-02` | **Test Case:** `TC-Take-02`
- **User Story:**
  > *As a candidate, I want an active countdown timer calculated by the server, so that timing is tamper-resistant against client clock manipulation.*
- **Acceptance Criteria:** `remaining_seconds` calculated server-side; client syncs every tick.
- **Resolution Status:** **Closed / Merged** via Commit `32262c0` (30 Oct 2026, PR #28). Verified by Akshansh Agrawal (`TC-Take-02`); automated in v1.0.1 (`TC-Take-02a`–`e`, including a DEF-002 regression check under the Asia/Kolkata timezone).

---

### Issue #17: 30-Second Periodic Auto-Save & Auto-Submit on Expiry
- **Issue ID:** `OEP-F-011` | **GitHub Issue:** `#17`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `backend`, `frontend`, `reliability`, `aditya-PES2UG24CS034`
- **Requirement Ref:** `OEP-F-011`, `DS-Take-03`, `OEP-NF-003` | **Test Case:** `TC-Take-03`, `TC-Rel-01`
- **User Story:**
  > *As a candidate taking an exam, I want my answers auto-saved every 30 seconds and submitted automatically when the timer reaches zero, so that no work is lost in case of network interruption.*
- **Acceptance Criteria:** Batch answer upsert endpoint `POST /api/delivery/attempts/:id/answers`; auto-submits upon expiry.
- **Resolution Status:** **Closed / Merged** via Commit `32262c0` (30 Oct 2026, PR #28). Auto-submit at 00:00 failed (DEF-007) and the clock ran at double speed in development mode (DEF-008); both fixed in v1.0.1. Verified by Akshansh Agrawal (`TC-Take-03`) and by the v1.0.1 browser test `TC-Take-06`.

---

### Issue #18: Question Navigation Palette & Review Flagging
- **Issue ID:** `OEP-F-012` | **GitHub Issue:** `#18`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`)
- **Story Points:** 3 SP | **Priority:** Medium | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `frontend`, `sprint-2`, `aditya-PES2UG24CS034`
- **Requirement Ref:** `OEP-F-012`, `DS-Take-04` | **Test Case:** `TC-Take-04`
- **User Story:**
  > *As a candidate, I want an interactive question palette showing answered, unanswered, and flagged questions, so that I can easily navigate and review questions before submitting.*
- **Acceptance Criteria:** Interactive color-coded grid with direct jump navigation.
- **Resolution Status:** **Closed / Merged** via Commit `32262c0` (30 Oct 2026, PR #28). Verified by Akshansh Agrawal (`TC-Take-04`).

---

### Issue #19: Automated Instant Grading Engine for Objective Questions
- **Issue ID:** `OEP-F-013` | **GitHub Issue:** `#19`
- **Assigned To:** Akshansh Agrawal (`PES2UG24CS045`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `backend`, `sprint-2`, `akshansh-PES2UG24CS045`
- **Requirement Ref:** `OEP-F-013`, `DS-Eval-01` | **Test Case:** `TC-Eval-01`
- **User Story:**
  > *As an instructor, I want MCQ and True/False responses evaluated automatically on submission against server answer keys, so that candidate scores are computed immediately without manual effort.*
- **Acceptance Criteria:** Auto-computes score; updates attempt status to `submitted`.
- **Resolution Status:** **Closed / Merged** via Commits `39470c5` and `8bf7220` (31 Oct 2026, PRs #29 and #30). Verified by A S Vincent (`TC-Eval-01`).

---

### Issue #20: Instructor Manual Subjective Grading Portal
- **Issue ID:** `OEP-F-014` | **GitHub Issue:** `#20`
- **Assigned To:** Akshansh Agrawal (`PES2UG24CS045`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `backend`, `frontend`, `akshansh-PES2UG24CS045`
- **Requirement Ref:** `OEP-F-014`, `DS-Eval-02` | **Test Case:** `TC-Eval-02`
- **User Story:**
  > *As an instructor, I want an interface to review candidate short-answer submissions, assign partial or full marks, and record qualitative feedback, so that subjective evaluations are fair and recorded.*
- **Acceptance Criteria:** Saves awarded marks and feedback; updates total attempt score.
- **Resolution Status:** **Closed / Merged** via Commits `39470c5` and `8bf7220` (31 Oct 2026, PRs #29 and #30). Verified by A S Vincent (`TC-Eval-02`).

---

### Issue #21: Private Candidate Scorecard Display with Explanations
- **Issue ID:** `OEP-F-015` | **GitHub Issue:** `#21`
- **Assigned To:** Akshansh Agrawal (`PES2UG24CS045`)
- **Story Points:** 3 SP | **Priority:** Medium | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `frontend`, `backend`, `akshansh-PES2UG24CS045`
- **Requirement Ref:** `OEP-F-015`, `DS-Eval-03` | **Test Case:** `TC-Eval-03`
- **User Story:**
  > *As a student, I want to view my individual scorecard with score breakdown and question explanations after grading, so that I can understand my errors and evaluate my progress.*
- **Acceptance Criteria:** Displays total score, max marks, question breakdown, and answer explanations.
- **Resolution Status:** **Closed / Merged** via Commits `39470c5` and `8bf7220` (31 Oct 2026, PRs #29 and #30). Verified by A S Vincent (`TC-Eval-03`).

---

### Issue #22: Class Performance Analytics & Item Difficulty Index
- **Issue ID:** `OEP-F-016` | **GitHub Issue:** `#22`
- **Assigned To:** Akshansh Agrawal (`PES2UG24CS045`)
- **Story Points:** 5 SP | **Priority:** Medium | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `backend`, `frontend`, `akshansh-PES2UG24CS045`
- **Requirement Ref:** `OEP-F-016`, `DS-Eval-04` | **Test Case:** `TC-Eval-04`
- **User Story:**
  > *As an instructor, I want aggregate class performance statistics (mean, median, pass rate, item difficulty index), so that I can analyze question efficacy and assess learning outcomes.*
- **Acceptance Criteria:** Computes aggregate stats and per-question correct response rates.
- **Resolution Status:** **Closed / Merged** via Commits `39470c5` and `8bf7220` (31 Oct 2026, PRs #29 and #30). Verified by A S Vincent (`TC-Eval-04`).

---

### Issue #23: Role-Based Dashboards, Navigation & Dark Mode Design System
- **Issue ID:** `OEP-UI-01` | **GitHub Issue:** `#23`
- **Assigned To:** Akshansh Agrawal (`PES2UG24CS045`, `@akshagra`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `frontend`, `ux`, `akshansh-PES2UG24CS045`
- **Requirement Ref:** `DS-UX-01`, `OEP-NF-005` | **Test Case:** `TC-UX-01`
- **User Story:**
  > *As an authenticated user, I want a cohesive role-aware navigation bar, streamlined portal switching, and WCAG 2.1 AA compliant dark theme, so that I have an accessible, professional user experience.*
- **Description:** Implement `Navbar.jsx`, `App.jsx`, `AdminPortal.jsx`, and `index.css` design system with 4.5:1 contrast ratio and keyboard tab accessibility.
- **Acceptance Criteria:**
  1. Role-specific links rendered dynamically (Student, Instructor, Admin).
  2. Dark mode color tokens configured with high contrast.
  3. Fully responsive layout across mobile and desktop viewports.
- **Resolution Status:** **Closed / Merged.** Theme, navbar and portal shell built by Akshansh Agrawal and committed by A S Vincent in `b7e0f11` (23 Oct 2026). The 11 Nov 2026 audit found WCAG 2.1 AA failures (muted-text contrast 3.38–3.96:1, unlabelled form fields and dropdowns, scrollable tables unreachable by keyboard); fixed in v1.0.1. Evidence (`TC-UX-01`): [Accessibility Audit](docs/deliverable-4/evidence/accessibility-audit.md).

---

### Issue #24: Security Audit Logging & IDOR Data Isolation Safeguards
- **Issue ID:** `OEP-SEC-01` | **GitHub Issue:** `#24`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `security`, `backend`, `vincent-PES2UG24CS002`
- **Requirement Ref:** `OEP-NF-004`, `OEP-SR-001`, `OEP-SR-005` | **Test Case:** `TC-Sec-01`, `TC-Sec-04`, `TC-Sec-06`
- **User Story:**
  > *As Security Lead and compliance officer, I want tamper-proof persistent audit logging for critical actions (login, lockout, exam submission, unauthorized access) and strict authorization checks preventing IDOR leaks, so that candidate assessment data remains confidential and auditable.*
- **Description:** Build `backend/src/middleware/logger.js`, `auditRoutes.js`, and enforce strict `req.user.id === attempt.student_id` validation.
- **Acceptance Criteria:**
  1. Audit events written to `audit_logs` table with timestamp, user ID, event type, and IP address.
  2. Cross-candidate scorecard access blocked with `403 Forbidden`.
  3. `GET /api/audit-logs` restricted strictly to Administrator role.
- **Resolution Status:** **Closed / Merged.** Audit logger and `/api/audit-logs` route in commit `b7e0f11`; the candidate ownership checks are in the M3 and M4 controllers (`32262c0`, `39470c5`, `8bf7220`). Verified by A S Vincent (`TC-Sec-04`, `TC-Sec-06`).

---

### Issue #25: [BUG] Student Scorecard Privacy Leak (IDOR Vulnerability)
- **Issue ID:** `DEF-005` | **GitHub Issue:** `#25`
- **Assigned To:** Akshansh Agrawal (`PES2UG24CS045`) | **Reporter:** A S Vincent (`PES2UG24CS002`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `bug`, `security`, `sprint-2`, `akshansh-PES2UG24CS045`
- **Requirement Ref:** `OEP-SR-005` | **Test Case:** `TC-Sec-06`
- **Description:** Missing ownership check allowed Candidate B to inspect Candidate A's scorecard.
- **Resolution:** Enforced `if (req.user.role === 'Student' && attempt.student_id !== req.user.id) return res.status(403)`.
- **Resolution Status:** **Closed / Merged.** Ownership check in `39470c5`; hardened in `8bf7220` (fails closed for unknown roles, adds the token-based `my-scorecard` route), 31 Oct 2026. Verified by A S Vincent (`TC-Sec-06`).

---

### Issue #26: [BUG] Audit Log Socket Address Crash in Automated Test Environment
- **Issue ID:** `DEF-006` | **GitHub Issue:** `#26`
- **Assigned To:** Aadish Sarin (`PES2UG24CS007`, `@aadishs-364`) | **Reporter:** A S Vincent (`PES2UG24CS002`)
- **Story Points:** 1 SP | **Priority:** Medium | **Milestone:** Sprint 2
- **Labels:** `bug`, `backend`, `sprint-2`, `aadish-PES2UG24CS007`
- **Requirement Ref:** `OEP-NF-004` | **Test Case:** `TC-Sec-04`
- **Description:** Supertest mock requests threw `TypeError: Cannot read properties of undefined (reading 'remoteAddress')`.
- **Resolution:** Added safe fallback `(req && req.socket && req.socket.remoteAddress) || req.ip || '127.0.0.1'`.
- **Resolution Status:** **Closed.** The fallback chain is in `backend/src/middleware/logger.js` as first committed in `b7e0f11`. Verified by A S Vincent (`TC-Sec-04`).

---

### Issue #27: Comprehensive Automated Integration Test Suite & Cross-Testing Sign-Off
- **Issue ID:** `OEP-QA-01` | **GitHub Issue:** `#27`
- **Assigned To:** Aadish Sarin (`PES2UG24CS007`, `@aadishs-364`) & A S Vincent (`PES2UG24CS002`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `testing`, `backend`, `aadish-PES2UG24CS007`
- **Requirement Ref:** STP §1–§9, Cross-Testing Mandate | **Test Case:** All 19 Test Cases
- **User Story:**
  > *As Dev Lead and QA Lead, we want an automated integration test suite validating all 4 modules and security controls with 100% pass rate, so that software release exit criteria are verified before development freeze.*
- **Description:** Build `backend/tests/integration/api.test.js` exercising health check, registration, login, lockout, RBAC, exam CRUD, timing validation, delivery engine, answer stripping, auto-save, auto-grading, manual grading, scorecard privacy, and audit logging.
- **Acceptance Criteria:**
  1. 19 / 19 tests passed at the Sprint 2 freeze; since v1.0.1 the suite has 51 tests in 3 files, all passing (`npm test`).
  2. Exit criteria satisfied: 0 open critical or high defects.
  3. Completed RTM signed off (v1.0.1: 25 Accepted, 1 Partial — OEP-NF-002).
- **Resolution Status:** **Closed / Merged.** Suite written by Aadish Sarin; first committed by A S Vincent in `b7e0f11` (23 Oct 2026) and set to skip modules not yet merged in `1293315` (30 Oct 2026). Extended to 51 tests in 3 files in v1.0.1 (11 Nov 2026). Verified by A S Vincent and Aadish Sarin.

---

### Issue #32: Performance Load Testing & Concurrency Benchmark (500 Concurrent Users)
- **Issue ID:** `OEP-PERF-01` | **GitHub Issue:** `#32`
- **Assigned To:** Akshansh Agrawal (`PES2UG24CS045`, `@akshagra`)
- **Story Points:** 3 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `performance`, `testing`, `sprint-2`, `akshansh-PES2UG24CS045`
- **Requirement Ref:** `OEP-NF-001`, `OEP-NF-002`, `DS-Perf-01`, `DS-Perf-02` | **Test Case:** `TC-Perf-01`, `TC-Perf-02`
- **User Story:**
  > *As Performance & Reliability Lead, I want to execute automated load and concurrency benchmarks simulating 500 concurrent candidates, so that system throughput satisfies Non-Functional Requirements OEP-NF-001 and OEP-NF-002 with p90 latency $\le$ 3.0 seconds under peak examination submission pressure.*
- **Description:** Synthetic Apache JMeter concurrency test exercising concurrent exam auto-save polling and submission endpoints under 500 simulated examinees.
- **Acceptance Criteria:**
  1. 500 concurrent examinee sessions sustained for 10 minutes.
  2. 90th percentile (p90) response latency verified $\le$ 3.0 seconds.
  3. Zero unhandled HTTP 500 errors during concurrency spike.
- **Resolution Status:** **Closed.** Executed on 11 Nov 2026 with Apache JMeter 5.6.3 (plan `backend/perf/oep-load-test.jmx`): 500 candidates for 10 minutes gave 148,980 requests with 0 errors and an auto-save p90 of 41 ms (overall p90 48 ms, target 3.0 s). When all 500 then opened new connections in the same instant to submit, Windows refused 110 of them (22%) before they reached the API; every submission that connected succeeded. Acceptance criteria 1 and 2 are met; criterion 3 (zero failed requests) is met for the 10-minute run but not for the connection burst. Full results: [Performance Load Test](docs/deliverable-4/evidence/performance-load-test.md). The "p90 1.42 s" previously recorded here had no run behind it and has been replaced by these measurements.

---

## 5. Traceability Matrix Summary (26 Requirements)

| Requirement Category | IDs | Total Count | Verification Status |
| :--- | :--- | :---: | :---: |
| **Functional Requirements (FR)** | `OEP-F-001` through `OEP-F-016` | 16 | **100% Accepted** |
| **Non-Functional Requirements (NFR)** | `OEP-NF-001` through `OEP-NF-005` | 5 | **4 Accepted, 1 Partial** (OEP-NF-002) |
| **Security Requirements (SR)** | `OEP-SR-001` through `OEP-SR-005` | 5 | **100% Accepted** |
| **Environment / Tooling (ENV)** | `OEP-ENV-01`, `OEP-ENV-02` | 2 | **100% Accepted** |
| **Defect Remediation (DEF)** | `DEF-001` through `DEF-012` | 12 | **100% Closed (0 Open)**; DEF-007 – DEF-012 found and fixed in v1.0.1 |

---

## 6. Maintenance Release v1.0.1 (11 Nov 2026)

Viva-preparation testing found six defects and four requirements whose evidence had never been produced. All were handled in one pull request, one commit per area.

| Item | Type | What changed | Evidence |
| :--- | :--- | :--- | :--- |
| `DEF-007` | Bug (M3) | Auto-submit at 00:00 posted to `/attempts/null/submit` and failed; the attempt stayed in progress | Browser test `TC-Take-06` |
| `DEF-008` | Bug (M3) | In development mode two countdown timers ran, so the clock ticked at double speed | Browser test `TC-Take-06` |
| `DEF-009` | Bug (M3) | Two simultaneous attempt-start requests could return HTTP 500 | `TC-Take-05a` |
| `DEF-010` | Bug (M3) | Question order changed on every refresh, contrary to DEV-02 | `TC-Take-05b` |
| `DEF-011` | Bug (DB) | Auto-save capped near 60 requests/s under load; fixed with SQLite WAL | [Load test](docs/deliverable-4/evidence/performance-load-test.md) |
| `DEF-012` | Bug (all) | Invalid requests returned HTTP 500 with internal error details; missing security headers | ZAP scan, `TC-Sec-07e`, `TC-Exam-01b` |
| `OEP-F-003`, `OEP-F-004` | Fix (M1) | New reset code cancels the old one; codes are crypto-random; no self-registration as Admin | `TC-Auth-03b`, `TC-Sec-03g` |
| `OEP-NF-001/002` | Evidence | JMeter: 500 candidates for 10 min, then 500 simultaneous submissions | [Load test](docs/deliverable-4/evidence/performance-load-test.md) |
| `OEP-NF-005` | Fix + evidence | WCAG 2.1 AA fixes (contrast, labels, keyboard access) and audit | [Accessibility audit](docs/deliverable-4/evidence/accessibility-audit.md) |
| `OEP-SR-001` | Feature + evidence | HTTPS entry point with TLS 1.2 minimum (`npm run start:https`) | `TC-Sec-01a`–`e` |
| Security scan | Evidence | OWASP ZAP 2.17.0 scan of all 26 API routes, plus 19 automated security tests | [Security scan](docs/deliverable-4/evidence/security-scan.md) |
