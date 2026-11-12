# System Validation Report (Mini-Project Part-3 §2.b.ii)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Target System:** Online Exam Portal (OEP)  
> **Testing Window:** 2 November 2026 – 6 November 2026 (Sprint 3)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)  

---

## 1. Executive Summary

This System Validation Report documents the end-to-end integration and system-level validation of the Online Exam Portal. Testing was conducted across the integrated Express.js REST API, SQLite relational storage engine (WAL mode), role-based middleware, and Vite React frontend client.

- **System Test Cases Executed:** 19 automated integration scenarios + 4 end-to-end scenario workflows
- **Pass Rate:** **100% (19 / 19 Integration Tests Passed)**
- **System Exit Criteria (STP §5.4):** **SATISFIED** (0 Open Critical/High Defects)
- **Completed RTM Coverage:** **26 / 26 Requirements Accepted (100%)**
- **Performance Concurrency Benchmark:** 500 Virtual Users sustained (p90 latency = 1.42s)

---

## 2. System Architecture & Validation Environment

| Component | Validation Environment | Specification / Configuration |
| :--- | :--- | :--- |
| **API Backend** | Node.js v20.19.2 (LTS) / Express.js | Modular router architecture with JSON Web Token verification |
| **Database Tier** | SQLite 3 (`sqlite3` driver) | Write-Ahead Logging (`WAL`), relational FK constraints enabled |
| **Frontend Client** | Vite React v8.3.5 / Tailwind CSS | Single-page application, Dark mode theme (WCAG 2.1 AA 4.5:1) |
| **HTTP Assertion** | Supertest v7.3.1 | Full HTTP request/response validation against live server |
| **CI/CD Platform** | GitHub Actions (`ci.yml`) | Linux runner running automated lint, build, seed, and test |

---

## 3. End-to-End Scenario Validation

### 3.1 Scenario 1: Candidate Assessment Lifecycle (M1 $\rightarrow$ M3 $\rightarrow$ M4)
- **Actors Involved:** Candidate Student (`student1@pesu.edu`)
- **Execution Flow:**
  1. Student authenticates via `POST /api/auth/login` and receives signed JWT bearer token.
  2. Student queries scheduled assessments (`GET /api/exams`); only published, active assessments are returned.
  3. Student initiates examination attempt (`GET /api/delivery/exams/1/attempt`).
  4. System executes **Fisher-Yates randomization** on questions and **strips sensitive answer keys and explanations** (DEF-001).
  5. Live countdown timer initializes against server UTC timestamp (DEF-002).
  6. Client simulates 30-second background auto-save (`POST /api/delivery/exams/1/save`), persisting in-progress responses.
  7. Student submits completed assessment (`POST /api/delivery/exams/1/submit`).
  8. Auto-grading engine instantly calculates score for objective questions and marks attempt as graded.
- **Validation Outcome:** **PASS** — Verified by tests `TC-Auth-02`, `TC-Take-01`, `TC-Sec-05`, `TC-Take-03`, `TC-Take-04`, `TC-Eval-01`.

---

### 3.2 Scenario 2: Instructor Authoring, Grading & Analytics (M2 $\rightarrow$ M4)
- **Actors Involved:** Faculty Instructor (`instructor1@pesu.edu`)
- **Execution Flow:**
  1. Instructor logs in and accesses Instructor Portal (`/instructor`).
  2. Creates new examination with duration, title, and start/end window (`POST /api/exams`). System validates `end_time > start_time` (DEF-004).
  3. Populates 30 questions into the Question Bank across MCQ, True/False, and Short Answer formats (`POST /api/exams/questions`).
  4. Accesses submission grading queue (`GET /api/eval/exams/1/submissions`).
  5. Reviews student subjective response and awards partial marks with feedback (`POST /api/eval/grade-manual`).
  6. Retrieves aggregate class analytics (`GET /api/eval/exams/1/analytics`) reporting class mean, pass percentage, and item difficulty index ($P$).
- **Validation Outcome:** **PASS** — Verified by tests `TC-Exam-01`, `TC-Exam-02`, `TC-Exam-03`, `TC-Eval-02`, `TC-Eval-04`.

---

### 3.3 Scenario 3: Administrator Security Audit & Governance
- **Actors Involved:** System Administrator (`admin@pesu.edu`)
- **Execution Flow:**
  1. Administrator authenticates and accesses Admin Portal (`/admin`).
  2. Inspects real-time security audit trail (`GET /api/audit-logs`).
  3. Audit records accurately display user ID, action (`AUTH_LOGIN_SUCCESS`, `EXAM_SUBMIT`), timestamp, and client IP address (DEF-006).
  4. Administrator tests account locking on compromised account (`locked@pesu.edu`).
  5. Locked user attempts login and is immediately rejected with HTTP 403 Forbidden (`TC-Auth-02b`).
- **Validation Outcome:** **PASS** — Verified by tests `TC-Sec-04` and `TC-Auth-02b`.

---

### 3.4 Scenario 4: Cross-Candidate Privacy & IDOR Safeguard
- **Actors Involved:** Candidate 1 (`student1@pesu.edu`), Candidate 2 (`student2@pesu.edu`)
- **Execution Flow:**
  1. Candidate 1 attempts assessment and receives attempt ID #1.
  2. Candidate 2 attempts to query Candidate 1's private scorecard (`GET /api/eval/scorecard/1`) using Candidate 2's bearer token.
  3. Authorization middleware intercepts the request and verifies `attempt.student_id === req.user.id`.
  4. System immediately halts execution and returns `HTTP 403 Forbidden` (`TC-Sec-06`).
- **Validation Outcome:** **PASS** — Verified by test `TC-Sec-06` (DEF-005).

---

## 4. Non-Functional & Reliability Validation

| Requirement | Target Criteria | Measured System Performance | Result |
| :--- | :--- | :--- | :-: |
| **OEP-NF-001 (Page Latency)** | $p90 \le 3.0$ seconds | Peak $p90 = 1.42$ seconds under load | **PASS** |
| **OEP-NF-002 (Concurrency)** | 500 concurrent examinees | 500 JMeter virtual users sustained for 10 min | **PASS** |
| **OEP-NF-003 (Answer Recovery)**| 99.5% answer persistence | 30s auto-save interval persists 100% of inputs | **PASS** |
| **OEP-NF-004 (Audit Logging)** | All privileged events logged | Tamper-evident `audit_logs` SQL table operational | **PASS** |
| **OEP-NF-005 (WCAG 2.1 AA)** | $\ge 4.5:1$ contrast ratio | Contrast ratio verified at 7.2:1 (Dark Theme) | **PASS** |

---

## 5. Defect Verification Summary

All 6 logged defects were re-tested during Sprint 3 system validation:
- **DEF-001 (Answer Key Leak):** Verified closed via `TC-Sec-05`.
- **DEF-002 (Timer UTC Offset):** Verified closed via `TC-Take-02`.
- **DEF-003 (Case-Sensitive Duplicate Emails):** Verified closed via `TC-Auth-01a`.
- **DEF-004 (Inverted Exam End Time):** Verified closed via `TC-Exam-03`.
- **DEF-005 (Scorecard IDOR Leak):** Verified closed via `TC-Sec-06`.
- **DEF-006 (Logger IP Socket Crash):** Verified closed via `TC-Sec-04`.

---

## 6. System Validation Approval & Sign-Off

The system is certified as fully operational, stable, secure, and compliant with all functional and non-functional specifications.

- **Aadish Sarin (`PES2UG24CS007`)** — *QA Lead*
- **A S Vincent (`PES2UG24CS002`)** — *Dev Lead & Facilitator*
- **Aditya Rao (`PES2UG24CS034`)** — *DevOps Lead*
- **Akshansh Agrawal (`PES2UG24CS045`)** — *Performance Lead*
