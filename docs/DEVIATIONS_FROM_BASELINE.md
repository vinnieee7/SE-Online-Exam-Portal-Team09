# Deviations from Baseline Architecture & Specifications (SAD / SRS)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Target System:** Online Exam Portal (OEP)  
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)  
> **Baseline References:** [SRS v1.1](baseline/SRS_Online_Exam_Portal_Team9.pdf), [SAD v1.0](baseline/SAD_Online_Exam_Portal_Team9.pdf) and [STP v1.0](baseline/STP_Online_Exam_Portal_Team9.pdf) (the versions submitted in September 2026, stored in `docs/baseline/`)

---

## 1. Purpose & Scope

This document formally records all architectural, functional, and design deviations introduced during Sprint 1 and Sprint 2 execution. Each deviation is mapped to its original baseline section in the Software Requirements Specification (SRS v1.1) or Software Architecture Document (SAD v1.0), along with engineering justification, trade-off analysis, and verification evidence for the final live demonstration.

---

## 2. Summary of Formally Approved Deviations

| # | Baseline Reference | Baseline Specification | Final Implemented Architecture | Engineering Justification & Impact | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **DEV-01** | SAD §3.2 (Database Tier) | PostgreSQL daemon service | Embedded SQLite 3 in WAL journal mode (since v1.0.1) with foreign key constraints enforced | Zero external service dependencies; portable seeding in about 1.4 s; standard SQL. | **Accepted** |
| **DEV-02** | SRS §3.2 / SAD §4.3 | Database `ORDER BY RANDOM()` | Server-side Fisher-Yates algorithm, seeded per attempt (v1.0.1) | Keeps one question order for an attempt across refreshes while each candidate gets a different order. | **Accepted** |
| **DEV-03** | SRS §3.3 / DEF-002 | Client-side `setInterval` countdown | Remaining time computed by the server from ISO 8601 UTC timestamps; the browser counts down from it and submits at 00:00 | A changed client clock cannot add time; resolves the IST timezone offset bug. | **Accepted** |
| **DEV-04** | SRS §3.4 / SAD §4.5 | Pure synchronous auto-grading | Dual-phase hybrid grading (Auto-MCQ + Instructor Subjective Portal) | Accommodates short-answer questions with human instructor review and partial marks. | **Accepted** |
| **DEV-05** | SAD §5.1 (Auth Storage) | Server-side Redis session store | Stateless JWT tokens + DB account lockout validation | Fully portable, stateless scalability with instant revocation checks on locked accounts. | **Accepted** |
| **DEV-06** | SRS §4.2 / DEF-005 | OS syslog log stream | Relational `audit_logs` table + Role-gated Admin GUI | Searchable security audit trail directly visible to administrators in the portal. | **Accepted** |
| **DEV-07** | SRS §4.3 / OEP-SR-001 | TLS on every connection | Separate HTTPS entry point (`npm run start:https`) that refuses anything older than TLS 1.2; local development and the demo use HTTP | Keeps the zero-setup demo while making the TLS requirement testable; production would use a CA-issued certificate. | **Accepted (v1.0.1)** |

---

## 3. Detailed Technical Analysis of Deviations

### 3.1 DEV-01: Relational Database Engine (SAD §3.2)
- **Original Baseline:** SAD Section 3.2 prescribed a dedicated PostgreSQL 15 instance running on port 5432.
- **Implemented Design:** Switched to SQLite 3 (`sqlite3` driver) with enforced foreign keys (`PRAGMA foreign_keys = ON;`). Since v1.0.1 it also uses Write-Ahead Logging (`PRAGMA journal_mode = WAL`, `synchronous = NORMAL`): the load test showed the default journal capped auto-save at about 60 requests per second (DEF-011).
- **Technical Rationale:**
  1. **Evaluator Portability:** Facilitates single-command evaluation (`npm start` or `npm test`) on any machine without requiring PostgreSQL server installation, root privileges, or daemon configuration.
  2. **Deterministic Test Reset:** Enables STP §6.4 compliant seed generation (`node src/db/seed.js`) creating 7 users, 30 questions, and 4 exams in about 1.4 seconds (measured 11 Nov 2026).
  3. **Zero Network Latency:** In-process database queries avoid inter-process socket overhead, so the full 51-test suite runs in about 10 seconds.

---

### 3.2 DEV-02: Question Randomization Engine (SAD §4.3 & SRS §3.2)
- **Original Baseline:** SRS Functional Requirement `OEP-F-008` indicated questions would be randomized using database queries (`ORDER BY RANDOM()`).
- **Implemented Design:** Questions are selected and ordered using the server-side **Fisher-Yates (Knuth) Shuffle Algorithm** (`backend/src/controllers/deliveryController.js`; `examController.js` has the same shuffle for the exam preview).
- **Technical Rationale:**
  1. **Session Stability:** Calling `ORDER BY RANDOM()` in SQL scrambled question order every time the candidate refreshed the page or triggered an auto-save call.
  2. **Order Stability:** Since v1.0.1 the shuffle uses a pseudo-random generator seeded with the attempt id, so one attempt always gets the same order (refresh, resume, auto-save) and two candidates get different orders. The order is derived, not stored. Before v1.0.1 the order changed on every refresh (DEF-010).

---

### 3.3 DEV-03: Exam Countdown Timer & Clock Synchronization (SRS §3.3 & DEF-002)
- **Original Baseline:** SRS `OEP-F-010` specified a browser-based countdown timer ticking down duration in minutes.
- **Implemented Design:** Implemented a server-enforced countdown synchronization protocol:
  1. Start time and duration are stored as UTC timestamps (`new Date().toISOString()`).
  2. Remaining seconds are calculated dynamically on every request:
     $$\text{Remaining Seconds} = \max\left(0, \lfloor (\text{ExpiresAt} - \text{CurrentServerTime}) / 1000 \rfloor\right)$$
  3. The browser counts down from the server's value and submits the attempt when it reaches 0 (repaired in v1.0.1, DEF-007 and DEF-008). The server does not submit on its own: if the browser is closed, the attempt stays in progress (known limitation).
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
- **Implemented Design:** Implemented stateless HMAC-SHA256 signed JSON Web Tokens (JWT) containing `{ id, name, email, role }` with a 24-hour expiration window. Account lockout states (`is_locked = 1`) are queried directly on protected operations.
- **Technical Rationale:**
  - Simplifies deployment footprint without compromising security.
  - Immediate security lockout is maintained because the authentication middleware validates the user's active status from the database.

---

### 3.6 DEV-06: Persistent Security Audit Trail (SRS §4.2)
- **Original Baseline:** SRS Non-Functional Requirement `OEP-NF-004` specified standard logging.
- **Implemented Design:** Implemented an active database-backed `audit_logs` table (`backend/src/middleware/logger.js`) capturing:
  - Actor user ID (null for failed logins on unknown emails)
  - Event type (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGIN_BLOCKED`, `EXAM_ATTEMPT_START`, `EXAM_SUBMIT`, `MANUAL_GRADE`, `SECURITY_VIOLATION_SCORECARD`, etc.)
  - A human-readable details string
  - Client IP address (with safe mock fallback for automated test harnesses per `DEF-006`) and timestamp
  - Real-time Admin Portal viewer (`AdminPortal.jsx`), latest 100 entries
- **Technical Rationale:**
  - Provides instant demonstrable compliance for the viva and grading demonstration, eliminating the need to inspect raw backend terminal logs.

---

### 3.7 DEV-07: TLS Transport (SRS §4.3, OEP-SR-001) — added 11 Nov 2026
- **Original Baseline:** All client-server traffic encrypted with TLS 1.2 or newer.
- **Implemented Design:** `backend/src/server-https.js` serves the same Express app over HTTPS with `minVersion: 'TLSv1.2'` (`backend/src/secureServer.js`). `npm run cert:dev` creates a self-signed localhost certificate; `npm run start:https` starts the API on port 5443.
- **Technical Rationale:** The demo keeps zero-setup HTTP on port 5000; the TLS behaviour is still verified automatically (`TC-Sec-01a`–`e`: TLS 1.3 and 1.2 accepted, TLS 1.1 refused, with a control proving the test client can speak TLS 1.1).

---

## 4. Verification & Demo Readiness

All 7 deviations have been validated by automated tests and team cross-testing:
- **Test Suite Pass Rate:** 48 / 51 tests passing in 3 files (`npm test`, v1.0.1, 11 Nov 2026).
- **Defects Open:** 0 (all 12 logged defects verified and closed).
- **RTM Status:** all 26 requirements have executed evidence; 25 Accepted, 1 Partial (OEP-NF-002, connection burst on the Windows test host).
- **Ready for Demo:** Yes — full live system operational.
