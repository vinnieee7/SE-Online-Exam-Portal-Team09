# Online Exam Portal (OEP) — Master Product Backlog

> **PES University — Department of Computer Science and Engineering**  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Author & Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal](https://github.com/vinnieee7/SE-Online-Exam-Portal)  
> **Baseline Documentation:** [SRS v1.1](docs/deliverable-1/09_PES2UG24CS002.pdf) | [SAD v1.0](docs/deliverable-2/PES2UG24CS002_SAD_Team9.docx) | [STP v1.0](docs/deliverable-3/09_PES2UG24CS002_TEST.pdf) | [Completed RTM](docs/deliverable-4/Completed_RTM.md)

---

## 1. Backlog Overview & Estimation Methodology

The Product Backlog encompasses all functional requirements (FR), non-functional requirements (NFR), security constraints (SR), bug remediation items (DEF), and DevOps environment prerequisites extracted from the Software Requirements Specification (SRS v1.1) and Software Test Plan (STP v1.0).

- **Estimation Scale:** Modified Fibonacci sequence (`1, 2, 3, 5, 8, 13`) story points (SP).
- **Total Backlog Items:** 27 items.
- **Total Backlog Velocity:** 91 Story Points.
- **Sprint Distribution:** Two fixed cycles:
  - **Sprint 1 (19 Oct – 23 Oct 2026):** Foundation, Auth/RBAC (M1), Exam Management (M2), initial defect fixes (47 SP).
  - **Sprint 2 (26 Oct – 30 Oct 2026):** Exam Delivery (M3), Evaluation & Analytics (M4), UI/UX Shell, Security & Audit, Final Verification (44 SP).

---

## 2. Team Work Allocation Summary

| Member Name | SRN | Primary Module / Responsibility | Sprint 1 SP | Sprint 2 SP | Total SP |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **A S Vincent** | `PES2UG24CS002` | **Dev Lead:** Module M1 (Auth & RBAC), Security Lead, UI Shell, Audit, Cross-Tester M4 | 18 | 12 | **30 SP** |
| **Aadish Sarin** | `PES2UG24CS007` | **Team & QA Lead:** Module M2 (Exam & Question Bank CRUD), RTM, Cross-Tester M1 | 19 | 2 | **21 SP** |
| **Aditya Rao** | `PES2UG24CS034` | **DevOps Lead:** Module M3 (Exam Delivery & Timer), DB Schema/Seed, Cross-Tester M2 | 9 | 14 | **23 SP** |
| **Akshansh Agrawal** | `PES2UG24CS045` | **Performance & UX Lead:** Module M4 (Auto-Grading & Analytics), Cross-Tester M3 | 1 | 16 | **17 SP** |
| **Team Total** | — | — | **47 SP** | **44 SP** | **91 SP** |

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
- **Resolution Status:** **Closed / Merged** via `chore: Initialize Online Exam Portal workspace` (Commit `2d4cb0b`).

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
- **Resolution Status:** Assigned to Aditya Rao (Commit `38a8513`).

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
- **Resolution Status:** **Closed / Merged** via `feat(M1): Implement registration & JWT login` (Commit `f43419a`). Verified by Aadish Sarin (`TC-Auth-01`).

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
- **Resolution Status:** **Closed / Merged** via Commit `f43419a`. Verified by Aadish Sarin (`TC-Auth-02`).

---

### Issue #5: Password Reset via 6-Digit One-Time Password (OTP)
- **Issue ID:** `OEP-F-003` | **GitHub Issue:** `#5`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
- **Story Points:** 3 SP | **Priority:** Medium | **Milestone:** Sprint 1
- **Labels:** `enhancement`, `backend`, `frontend`, `auth`, `vincent-PES2UG24CS002`
- **Requirement Ref:** `OEP-F-003`, `DS-Auth-03` | **Test Case:** `TC-Auth-03`
- **User Story:**
  > *As a registered user who forgot my password, I want to request a 6-digit OTP and reset my password, so that I can securely regain portal access.*
- **Description:** Implement `POST /api/auth/reset-password/request` generating a random 6-digit OTP with expiry, and `POST /api/auth/reset-password/confirm` applying the new bcrypt hash.
- **Acceptance Criteria:**
  1. OTP generation invalidates previous unused OTPs.
  2. OTP matches before password update is committed.
  3. Audit log records `PASSWORD_RESET` event.
- **Resolution Status:** **Closed / Merged** via Commit `f43419a`. Verified by Aadish Sarin (`TC-Auth-03`).

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
- **Resolution Status:** **Closed / Merged** via Commit `f43419a`. Verified by Aadish Sarin (`TC-Auth-04`).

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
- **Resolution Status:** Assigned to Aadish Sarin (Commit `cab9cf8`). Verified by Aditya Rao (`TC-Exam-01`).

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
- **Resolution Status:** Assigned to Aadish Sarin (Commit `cab9cf8`). Verified by Aditya Rao (`TC-Exam-02`).

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
- **Resolution Status:** Assigned to Aadish Sarin (Commit `cab9cf8`). Verified by Aditya Rao (`TC-Exam-03`).

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
- **Resolution Status:** Assigned to Aadish Sarin (Commit `cab9cf8`). Verified by Aditya Rao (`TC-Exam-04`).

---

### Issue #11: [BUG] DevTools Answer Key Leak in Exam Delivery Payload
- **Issue ID:** `DEF-001` | **GitHub Issue:** `#11`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`) | **Reporter:** Akshansh Agrawal (`PES2UG24CS045`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `bug`, `security`, `sprint-1`, `aditya-PES2UG24CS034`
- **Requirement Ref:** `OEP-SR-004` | **Test Case:** `TC-Sec-05`
- **Description:** `SELECT * FROM questions` leaked `correct_answer` and `explanation` in student JSON response.
- **Resolution:** Explicitly selected only safe fields (`id, question_text, question_type, marks`) for student delivery payloads.
- **Resolution Status:** Assigned to Aditya Rao (Commit `c7c09e8`). Verified by A S Vincent (`TC-Sec-05`).

---

### Issue #12: [BUG] Server Countdown Timer Calculates Negative Offset Due to Timezone
- **Issue ID:** `DEF-002` | **GitHub Issue:** `#12`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`) | **Reporter:** Akshansh Agrawal (`PES2UG24CS045`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `bug`, `backend`, `sprint-1`, `aditya-PES2UG24CS034`
- **Requirement Ref:** `OEP-F-010` | **Test Case:** `TC-Take-02`
- **Description:** Database stored UTC timestamp without explicit ISO trailing `Z`, causing a 5.5 hour IST offset error.
- **Resolution:** Normalized timestamps with `new Date().toISOString()`.
- **Resolution Status:** Assigned to Aditya Rao (Commit `c7c09e8`). Verified by Akshansh Agrawal (`TC-Take-02`).

---

### Issue #13: [BUG] Duplicate Student Registration Allowed with Uppercase Email
- **Issue ID:** `DEF-003` | **GitHub Issue:** `#13`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`) | **Reporter:** Aadish Sarin (`PES2UG24CS007`)
- **Story Points:** 1 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `bug`, `backend`, `auth`, `vincent-PES2UG24CS002`
- **Requirement Ref:** `OEP-F-001` | **Test Case:** `TC-Auth-01a`
- **Description:** SQLite default `TEXT UNIQUE` allowed `Student1@pesu.edu` alongside `student1@pesu.edu`.
- **Resolution:** Added `.toLowerCase().trim()` across registration, login, and password reset endpoints.
- **Resolution Status:** **Closed / Merged** via Commit `f43419a`. Verified by Aadish Sarin (`TC-Auth-01a`).

---

### Issue #14: [BUG] Exam End Time Allowed Prior to Start Time
- **Issue ID:** `DEF-004` | **GitHub Issue:** `#14`
- **Assigned To:** Aadish Sarin (`PES2UG24CS007`) | **Reporter:** Aditya Rao (`PES2UG24CS034`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 1
- **Labels:** `bug`, `backend`, `sprint-1`, `aadish-PES2UG24CS007`
- **Requirement Ref:** `OEP-F-007` | **Test Case:** `TC-Exam-03`
- **Description:** Missing server validation allowed inverted exam schedules.
- **Resolution:** Enforced `end_time > start_time` check returning `400 Bad Request`.
- **Resolution Status:** Assigned to Aadish Sarin (Commit `cab9cf8`). Verified by Aditya Rao (`TC-Exam-03`).

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
- **Resolution Status:** Assigned to Aditya Rao (Commit `c7c09e8`). Verified by Akshansh Agrawal (`TC-Take-01`).

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
- **Resolution Status:** Assigned to Aditya Rao (Commit `c7c09e8`). Verified by Akshansh Agrawal (`TC-Take-02`).

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
- **Resolution Status:** Assigned to Aditya Rao (Commit `c7c09e8`). Verified by Akshansh Agrawal (`TC-Take-03`).

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
- **Resolution Status:** Assigned to Aditya Rao (Commit `c7c09e8`). Verified by Akshansh Agrawal (`TC-Take-04`).

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
- **Resolution Status:** Assigned to Akshansh Agrawal (Commit `72c9961`). Verified by A S Vincent (`TC-Eval-01`).

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
- **Resolution Status:** Assigned to Akshansh Agrawal (Commit `72c9961`). Verified by A S Vincent (`TC-Eval-02`).

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
- **Resolution Status:** Assigned to Akshansh Agrawal (Commit `72c9961`). Verified by A S Vincent (`TC-Eval-03`).

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
- **Resolution Status:** Assigned to Akshansh Agrawal (Commit `72c9961`). Verified by A S Vincent (`TC-Eval-04`).

---

### Issue #23: Role-Based Dashboards, Navigation & Dark Mode Design System
- **Issue ID:** `OEP-UI-01` | **GitHub Issue:** `#23`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
- **Story Points:** 5 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `enhancement`, `frontend`, `ux`, `vincent-PES2UG24CS002`
- **Requirement Ref:** `DS-UX-01`, `OEP-NF-005` | **Test Case:** `TC-UX-01`
- **User Story:**
  > *As an authenticated user, I want a cohesive role-aware navigation bar, streamlined portal switching, and WCAG 2.1 AA compliant dark theme, so that I have an accessible, professional user experience.*
- **Description:** Implement `Navbar.jsx`, `App.jsx`, `AdminPortal.jsx`, and `index.css` design system with 4.5:1 contrast ratio and keyboard tab accessibility.
- **Acceptance Criteria:**
  1. Role-specific links rendered dynamically (Student, Instructor, Admin).
  2. Dark mode color tokens configured with high contrast.
  3. Fully responsive layout across mobile and desktop viewports.
- **Resolution Status:** **Closed / Merged** via Commit `75b5278`. Verified by Akshansh Agrawal (`TC-UX-01`).

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
- **Resolution Status:** **Closed / Merged** via Commit `75b5278`. Verified by A S Vincent (`TC-Sec-04`, `TC-Sec-06`).

---

### Issue #25: [BUG] Student Scorecard Privacy Leak (IDOR Vulnerability)
- **Issue ID:** `DEF-005` | **GitHub Issue:** `#25`
- **Assigned To:** Akshansh Agrawal (`PES2UG24CS045`) | **Reporter:** A S Vincent (`PES2UG24CS002`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `bug`, `security`, `sprint-2`, `akshansh-PES2UG24CS045`
- **Requirement Ref:** `OEP-SR-005` | **Test Case:** `TC-Sec-06`
- **Description:** Missing ownership check allowed Candidate B to inspect Candidate A's scorecard.
- **Resolution:** Enforced `if (req.user.role === 'Student' && attempt.student_id !== req.user.id) return res.status(403)`.
- **Resolution Status:** Assigned to Akshansh Agrawal (Commit `72c9961`). Verified by A S Vincent (`TC-Sec-06`).

---

### Issue #26: [BUG] Audit Log Socket Address Crash in Automated Test Environment
- **Issue ID:** `DEF-006` | **GitHub Issue:** `#26`
- **Assigned To:** Aditya Rao (`PES2UG24CS034`) | **Reporter:** A S Vincent (`PES2UG24CS002`)
- **Story Points:** 1 SP | **Priority:** Medium | **Milestone:** Sprint 2
- **Labels:** `bug`, `backend`, `sprint-2`, `aditya-PES2UG24CS034`
- **Requirement Ref:** `OEP-NF-004` | **Test Case:** `TC-Sec-04`
- **Description:** Supertest mock requests threw `TypeError: Cannot read properties of undefined (reading 'remoteAddress')`.
- **Resolution:** Added safe fallback `(req && req.socket && req.socket.remoteAddress) || req.ip || '127.0.0.1'`.
- **Resolution Status:** Assigned to Aditya Rao (Commit `c7c09e8`). Verified by A S Vincent (`TC-Sec-04`).

---

### Issue #27: Comprehensive Automated Integration Test Suite & Cross-Testing Sign-Off
- **Issue ID:** `OEP-QA-01` | **GitHub Issue:** `#27`
- **Assigned To:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`) & Aadish Sarin (`PES2UG24CS007`)
- **Story Points:** 2 SP | **Priority:** High | **Milestone:** Sprint 2
- **Labels:** `testing`, `backend`, `vincent-PES2UG24CS002`
- **Requirement Ref:** STP §1–§9, Cross-Testing Mandate | **Test Case:** All 19 Test Cases
- **User Story:**
  > *As Dev Lead and QA Lead, we want an automated integration test suite validating all 4 modules and security controls with 100% pass rate, so that software release exit criteria are verified before development freeze.*
- **Description:** Build `backend/tests/integration/api.test.js` exercising health check, registration, login, lockout, RBAC, exam CRUD, timing validation, delivery engine, answer stripping, auto-save, auto-grading, manual grading, scorecard privacy, and audit logging.
- **Acceptance Criteria:**
  1. 19 / 19 tests pass cleanly via `npm test`.
  2. Exit criteria satisfied: 0 open critical or high defects.
  3. Completed RTM signed off at 100% Accepted.
- **Resolution Status:** **Closed / Merged** via Commit `e6fc782`. Verified by A S Vincent and Aadish Sarin.

---

## 5. Traceability Matrix Summary (26 Requirements)

| Requirement Category | IDs | Total Count | Verification Status |
| :--- | :--- | :---: | :---: |
| **Functional Requirements (FR)** | `OEP-F-001` through `OEP-F-016` | 16 | **100% Accepted** |
| **Non-Functional Requirements (NFR)** | `OEP-NF-001` through `OEP-NF-005` | 5 | **100% Accepted** |
| **Security Requirements (SR)** | `OEP-SR-001` through `OEP-SR-005` | 5 | **100% Accepted** |
| **Environment / Tooling (ENV)** | `OEP-ENV-01`, `OEP-ENV-02` | 2 | **100% Accepted** |
| **Defect Remediation (DEF)** | `DEF-001` through `DEF-006` | 6 | **100% Closed (0 Open)** |
