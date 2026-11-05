# Deviations from Baseline Architecture & Specifications (SAD / SRS)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Target System:** Online Exam Portal (OEP)  
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal](https://github.com/vinnieee7/SE-Online-Exam-Portal)  
> **Baseline References:** [SRS v1.1](deliverable-1/09_PES2UG24CS002.pdf) | [SAD v1.0](deliverable-2/PES2UG24CS002_SAD_Team9.docx) | [STP v1.0](deliverable-3/09_PES2UG24CS002_TEST.pdf)

---

## 1. Purpose & Scope

This document formally records all architectural, functional, and design deviations introduced during Sprint 1 and Sprint 2 execution. Each deviation is mapped to its original baseline section in the Software Requirements Specification (SRS v1.1) or Software Architecture Document (SAD v1.0), along with engineering justification, trade-off analysis, and verification evidence for the final live demonstration.

---

## 2. Summary of Formally Approved Deviations

| # | Baseline Reference | Baseline Specification | Final Implemented Architecture | Engineering Justification & Impact | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **DEV-01** | SAD §3.2 (Database Tier) | PostgreSQL daemon service | Embedded SQLite 3 with WAL mode & foreign key constraints | Zero external service dependencies; instant portable seeding (<2s); identical SQL compliance. | **Accepted** |
| **DEV-02** | SRS §3.2 / SAD §4.3 | Database `ORDER BY RANDOM()` | Server-side in-memory Fisher-Yates algorithm | Preserves deterministic question sequence across auto-save refreshes while ensuring true per-student permutation. | **Accepted** |
| **DEV-03** | SRS §3.3 / DEF-002 | Client-side `setInterval` countdown | Server-enforced expiration with ISO 8601 UTC timestamps | Eliminates client clock tampering and resolves IST timezone offset discrepancies. | **Accepted** |
| **DEV-04** | SRS §3.4 / SAD §4.5 | Pure synchronous auto-grading | Dual-phase hybrid grading (Auto-MCQ + Instructor Subjective Portal) | Accommodates short-answer questions with human instructor review and partial marks. | **Accepted** |
| **DEV-05** | SAD §5.1 (Auth Storage) | Server-side Redis session store | Stateless JWT tokens + DB account lockout validation | Fully portable, stateless scalability with instant revocation checks on locked accounts. | **Accepted** |
| **DEV-06** | SRS §4.2 / DEF-005 | OS syslog log stream | Relational `audit_logs` table + Role-gated Admin GUI | Searchable, tamper-evident security audit trail directly visible to administrators in the portal. | **Accepted** |

---

## 3. Detailed Technical Analysis of Deviations

### 3.1 DEV-01: Relational Database Engine (SAD §3.2)
- **Original Baseline:** SAD Section 3.2 prescribed a dedicated PostgreSQL 15 instance running on port 5432.
- **Implemented Design:** Switched to SQLite 3 (`sqlite3` driver) utilizing Write-Ahead Logging (`PRAGMA journal_mode = WAL`) and enforced foreign keys (`PRAGMA foreign_keys = ON;`).
- **Technical Rationale:**
  1. **Evaluator Portability:** Facilitates single-command evaluation (`npm start` or `npm test`) on any machine without requiring PostgreSQL server installation, root privileges, or daemon configuration.
  2. **Deterministic Test Reset:** Enables STP §6.4 compliant seed generation (`node src/db/seed.js`) executing 7 users, 30 questions, and 4 exams in under 1.8 seconds.
  3. **Zero Network Latency:** In-process database queries eliminate inter-process socket overhead, yielding sub-15ms integration test execution.

---

### 3.2 DEV-02: Question Randomization Engine (SAD §4.3 & SRS §3.2)
- **Original Baseline:** SRS Functional Requirement `OEP-F-008` indicated questions would be randomized using database queries (`ORDER BY RANDOM()`).
- **Implemented Design:** Questions are selected and ordered using the server-side **Fisher-Yates (Knuth) Shuffle Algorithm** (`backend/src/controllers/deliveryController.js`).
- **Technical Rationale:**
  1. **Session Stability:** Calling `ORDER BY RANDOM()` in SQL scrambled question order every time the candidate refreshed the page or triggered an auto-save call.
  2. **Security Integrity:** The Fisher-Yates engine calculates an immutable randomized order when the attempt is initialized and stores the ordered array of question IDs in the candidate's attempt record, preventing question shifting during the exam.

---

### 3.3 DEV-03: Exam Countdown Timer & Clock Synchronization (SRS §3.3 & DEF-002)
- **Original Baseline:** SRS `OEP-F-010` specified a browser-based countdown timer ticking down duration in minutes.
- **Implemented Design:** Implemented a server-enforced countdown synchronization protocol:
  1. Start time and duration are stored as UTC timestamps (`new Date().toISOString()`).
  2. Remaining seconds are calculated dynamically on every request:
     $$\text{Remaining Seconds} = \max\left(0, \lfloor (\text{ExpiresAt} - \text{CurrentServerTime}) / 1000 \rfloor\right)$$
  3. Automatic server-side submission is executed when remaining seconds reach 0.
- **Technical Rationale:**
  - Prevents candidate browser tampering (changing OS clock to gain extra time).
  - Remedied defect `DEF-002` where ambiguous local timestamps produced negative remaining time due to IST (UTC+5:30) timezone offsets.

---

### 3.4 DEV-04: Hybrid Evaluation Architecture (SRS §3.4 & SAD §4.5)
- **Original Baseline:** SRS `OEP-F-013` described an instant auto-grading engine evaluating all assessment submissions immediately upon completion.
- **Implemented Design:** Formulated a two-stage hybrid evaluation workflow:
  - **Stage 1 (Automated):** Multiple Choice Questions (MCQ) and True/False questions are auto-graded synchronously upon submission against sanitized server answer keys.
  - **Stage 2 (Manual Instructor Portal):** Subjective / Short Answer questions enter a pending grading queue rendered in `InstructorPortal.jsx`. Instructors review student text, assign partial or full marks, and leave feedback. Total scorecards update automatically.
- **Technical Rationale:**
  - Standard exact-string auto-grading failed on open-ended technical definitions (e.g., spacing or phrasing variations).
  - The Instructor Portal fulfills realistic university examination workflows while retaining instant grading for objective questions.

---

### 3.5 DEV-05: Stateless JWT Authentication vs. Redis Sessions (SAD §5.1)
- **Original Baseline:** SAD Section 5.1 proposed stateful session tokens managed in Redis.
- **Implemented Design:** Implemented stateless HMAC-SHA256 signed JSON Web Tokens (JWT) containing `{ id, email, role }` with a 24-hour expiration window. Account lockout states (`is_locked = 1`) are queried directly on protected operations.
- **Technical Rationale:**
  - Simplifies deployment footprint without compromising security.
  - Immediate security lockout is maintained because the authentication middleware validates the user's active status from the database.

---

### 3.6 DEV-06: Persistent Security Audit Trail (SRS §4.2)
- **Original Baseline:** SRS Non-Functional Requirement `OEP-NF-004` specified standard logging.
- **Implemented Design:** Implemented an active database-backed `audit_logs` table (`backend/src/middleware/logger.js`) capturing:
  - Actor ID and role
  - Event type (`AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILED`, `EXAM_ATTEMPT_START`, `EXAM_SUBMITTED`, etc.)
  - Request endpoint and HTTP status
  - Client IP address (with safe mock fallback for automated test harnesses per `DEF-006`)
  - Real-time Admin Portal viewer (`AdminPortal.jsx`)
- **Technical Rationale:**
  - Provides instant demonstrable compliance for the viva and grading demonstration, eliminating the need to inspect raw backend terminal logs.

---

## 4. Verification & Demo Readiness

All 6 deviations have been validated by automated tests and team cross-testing:
- **Test Suite Pass Rate:** 19 / 19 tests passing (`npm test`).
- **Defects Open:** 0 (All 6 logged defects verified and closed).
- **RTM Status:** 100% Accepted across all 26 requirements.
- **Ready for Demo:** Yes — full live system operational.

