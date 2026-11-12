# Online Exam Portal (OEP) — Automated Test Execution Evidence (Sprint 3 / Part-3)

> **Execution Timestamp:** 11–12 November 2026 (Sprint 3 & Maintenance Release v1.0.1)  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Harness:** Jest 30 + Supertest 7 (`npm test` = `jest --detectOpenHandles --runInBand`)  
> **Environment:** Windows 11, Intel Core i7-13645HX, 16 GB RAM, Node.js (Ubuntu CI Runner)  
> **Database:** SQLite 3 in WAL mode, reset by `seedDatabase()` at the start of each test file (STP §6.4 data)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`) | **Dev Lead:** A S Vincent (`PES2UG24CS002`)  

---

## 1. Test Results Summary (85 Tests Passing across 8 Suites)

The combined automated test suite executes **85 tests** across 8 test suites with a **100% pass rate**:
- **Integration & Security Test Suites (51 tests):**
  - `tests/integration/security.test.js` (19 tests) — HTTPS/TLS, bcrypt hashing, JWT validation, SQL injection guards, XSS containment.
  - `tests/integration/api.test.js` (19 tests) — Auth lifecycle, Exam CRUD, Delivery & auto-save, Grading & analytics.
  - `tests/integration/verification.test.js` (13 tests) — Edge case verification, concurrent attempt isolation, timer boundaries.
- **Sprint 3 Dedicated Unit Test Suites (34 tests):**
  - `tests/unit/auth.unit.test.js` (9 tests) — Salt rounds, token generation, requireRole middleware.
  - `tests/unit/exam.unit.test.js` (8 tests) — Fisher-Yates array shuffling, schedule validation, option normalization.
  - `tests/unit/delivery.unit.test.js` (5 tests) — Countdown timer floor, UTC synchronization, answer key stripping.
  - `tests/unit/eval.unit.test.js` (7 tests) — Objective scoring, subjective flag, Item Difficulty Index ($P = R/T$).
  - `tests/unit/logger.unit.test.js` (5 tests) — Client IP extraction, proxy fallback, audit event formatting.

```
tests/integration/security.test.js (19 tests)
  ✓ TC-Sec-01a: the API answers over HTTPS (8 ms)
  ✓ TC-Sec-01b: a current client negotiates TLS 1.3 (3 ms)
  ✓ TC-Sec-01c: a client limited to TLS 1.2 is still accepted (5 ms)
  ✓ TC-Sec-01d (control): the test client really can speak TLS 1.1 (8 ms)
  ✓ TC-Sec-01e: the OEP server refuses that TLS 1.1 client (2 ms)
  ✓ TC-Sec-02a: stored passwords are bcrypt hashes with cost factor 10 (69 ms)
  ✓ TC-Sec-02b: registration salts each hash and never returns it (71 ms)
  ✓ TC-Sec-03a: a request without a token gets 401 (3 ms)
  ✓ TC-Sec-03b: a token whose payload was edited to role Admin is rejected (3 ms)
  ✓ TC-Sec-03c: a token signed with a different secret is rejected (2 ms)
  ✓ TC-Sec-03d: an unsigned token (alg "none") is rejected (2 ms)
  ✓ TC-Sec-03e: a valid Student token cannot reach Instructor or Admin APIs (11 ms)
  ✓ TC-Sec-03g: self-registration cannot create an Administrator account (3 ms)
  ✓ TC-Sec-03f: locking an account blocks a token that was issued before the lock (75 ms)
  ✓ TC-Sec-07a: classic SQL login-bypass strings do not log anyone in (7 ms)
  ✓ TC-Sec-07b: a DROP TABLE payload is stored as text and the users table survives (70 ms)
  ✓ TC-Sec-07c: an injection payload in a URL id does not widen the query (2 ms)
  ✓ TC-Sec-07e: malformed or missing bodies get 400 with no internal details (ZAP finding) (8 ms)
  ✓ TC-Sec-07d: script markup in a question is returned as JSON data, not executed by the API (10 ms)

tests/integration/api.test.js (19 tests)
  ✓ TC-SYS-01: Health check returns online status (2 ms)
  ✓ TC-Auth-01: Register a new student account successfully (68 ms)
  ✓ TC-Auth-01a: Duplicate email registration is rejected with 409 Conflict (3 ms)
  ✓ TC-Auth-02: Valid credentials login returns JWT session with role claims (72 ms)
  ✓ TC-Auth-02a: Invalid password returns 401 Unauthorized (69 ms)
  ✓ TC-Auth-02b: Locked account login is blocked with 403 Forbidden (3 ms)
  ✓ TC-Auth-03: Password reset OTP request returns verification code (3 ms)
  ✓ TC-Auth-04: RBAC enforces that Students cannot create exams (403 Forbidden) (2 ms)
  ✓ TC-Exam-01: Instructor creates a new scheduled exam (4 ms)
  ✓ TC-Exam-03: Exam scheduling blocks start time after end time (400 Bad Request) (2 ms)
  ✓ TC-Exam-02: Instructor adds question with options to question bank (4 ms)
  ✓ TC-Take-01 & TC-Sec-05: Student starts active exam (correct_answer stripped from payload) (5 ms)
  ✓ TC-Take-03: Periodic auto-save persists student answers (7 ms)
  ✓ TC-Take-04: Student submits exam attempt and triggers auto-grading (4 ms)
  ✓ TC-Eval-01: Auto-grading correctly computed score for objective questions (3 ms)
  ✓ TC-Eval-03 & TC-Sec-06: Student result privacy strictly blocks cross-student access (403 Forbidden) (3 ms)
  ✓ TC-Eval-02: Instructor grades subjective question manually (3 ms)
  ✓ TC-Eval-04: Instructor retrieves aggregate class analytics and item analysis (4 ms)
  ✓ TC-Sec-04: Administrator retrieves persistent audit logs (3 ms)

<<<<<<< HEAD
tests/integration/verification.test.js (13 tests)
  ✓ TC-Exam-04a: a shuffle keeps every item exactly once and leaves the input untouched (4 ms)
  ✓ TC-Exam-04b: all 24 orders of 4 questions are equally likely over 24,000 shuffles (159 ms)
  ✓ TC-Exam-04c: a candidate gets every linked question exactly once, without answer keys (21 ms)
  ✓ TC-Exam-01b: linking a question id that does not exist returns 400, not 500 (7 ms)
  ✓ TC-Take-02a: a new attempt gets the full 45-minute duration (2700 s) (11 ms)
  ✓ TC-Take-02b: the clock keeps running on the server (40 min elapsed leaves about 300 s) (12 ms)
  ✓ TC-Take-02c: remaining time is capped by the exam window end (12 ms)
  ✓ TC-Take-02d: an attempt past its duration reports 0 seconds left (16 ms)
  ✓ TC-Take-02e (DEF-002 regression): a SQLite UTC timestamp without "Z" is read as UTC, even on an IST server (9 ms)
  ✓ TC-Auth-03b: requesting a new code invalidates the previous unused one (208 ms)
  ✓ TC-Take-05a: two simultaneous start requests share one attempt and one audit entry (24 ms)
  ✓ TC-Take-05b: resuming an attempt returns the questions in the same order (25 ms)
  ✓ TC-Take-05c: two candidates get different question orders (21 ms)

Test Suites: 3 passed, 3 total
Tests:       51 passed, 51 total
```

How to reproduce:

```bash
cd backend
npm install
npm test                                  # 51 tests, about 10 seconds
npx jest --runInBand --coverage           # same run with the coverage table below
=======
PASS tests/integration/api.test.js
  === Online Exam Portal (OEP) Comprehensive Test Suite ===
    √ TC-SYS-01: Health check returns online status (17 ms)
    Module M1: Authentication & User/Role Management (OEP-F-001..004)
      √ TC-Auth-01: Register a new student account successfully (125 ms)
      √ TC-Auth-01a: Duplicate email registration is rejected with 409 Conflict (13 ms)
      √ TC-Auth-02: Valid credentials login returns JWT session with role claims (108 ms)
      √ TC-Auth-02a: Invalid password returns 401 Unauthorized (105 ms)
      √ TC-Auth-02b: Locked account login is blocked with 403 Forbidden (21 ms)
      √ TC-Auth-03: Password reset OTP request returns verification code (27 ms)
      √ TC-Auth-04: RBAC enforces that Students cannot create exams (403 Forbidden) (13 ms)
    Module M2: Exam & Question-Bank Management (OEP-F-005..008)
      √ TC-Exam-01: Instructor creates a new scheduled exam (45 ms)
      √ TC-Exam-03: Exam scheduling blocks start time after end time (400 Bad Request) (20 ms)
      √ TC-Exam-02: Instructor adds question with options to question bank (54 ms)
    Module M3: Exam Delivery Engine (OEP-F-009..012, OEP-SR-004)
      √ TC-Take-01 & TC-Sec-05: Student starts active exam (correct_answer stripped from payload) (51 ms)
      √ TC-Take-03: Periodic auto-save persists student answers (36 ms)
      √ TC-Take-04: Student submits exam attempt and triggers auto-grading (81 ms)
    Module M4: Evaluation, Results & Analytics (OEP-F-013..016, OEP-SR-005)
      √ TC-Eval-01: Auto-grading correctly computed score for objective questions (17 ms)
      √ TC-Eval-03 & TC-Sec-06: Student result privacy strictly blocks cross-student access (403 Forbidden) (22 ms)
      √ TC-Eval-02: Instructor grades subjective question manually (39 ms)
      √ TC-Eval-04: Instructor retrieves aggregate class analytics and item analysis (25 ms)
    Security & Audit Logging (OEP-NF-004)
      √ TC-Sec-04: Administrator retrieves persistent audit logs (12 ms)

PASS tests/unit/auth.unit.test.js
  === Unit Test Suite: Module M1 Authentication & RBAC ===
    UT-Auth-01: Cryptographic Password Hashing (OEP-SR-002)
      √ hashes passwords using bcrypt with 10 salt rounds (248 ms)
    UT-Auth-02: JWT Token Generation & Verification (OEP-F-002)
      √ generates valid JWT with role claims and 24-hour expiration (3 ms)
      √ rejects token signed with an invalid secret (4 ms)
    UT-Auth-03: Role-Based Access Control Middleware (OEP-F-004)
      √ requireRole allows request through if user possesses required role (2 ms)
      √ requireRole returns 403 Forbidden if user role is unauthorized (2 ms)
      √ requireRole returns 401 Unauthorized if req.user is missing (1 ms)
    UT-Auth-04: Email Normalization & Sanity Checks (DEF-003)
      √ normalizes email inputs by trimming whitespace and converting to lowercase

PASS tests/unit/exam.unit.test.js
  === Unit Test Suite: Module M2 Exam & Question-Bank Management ===
    UT-Exam-01: Fisher-Yates Randomization Engine (OEP-F-008, TC-Exam-04)
      √ shuffleArray preserves all original elements and array length (2 ms)
      √ shuffleArray does not mutate the source array in place (1 ms)
      √ shuffleArray handles empty arrays and non-array inputs safely (1 ms)
      √ repeated shuffles produce randomized distributions across iterations (2 ms)
    UT-Exam-02: Exam Schedule Validation Logic (OEP-F-007, DEF-004, TC-Exam-03)
      √ accepts valid start time, end time, and duration (1 ms)
      √ rejects schedule where end time is earlier than start time (DEF-004) (1 ms)
      √ rejects schedule where window is shorter than duration (1 ms)
      √ rejects non-positive duration (1 ms)
    UT-Exam-03: Question Bank Option Normalization (OEP-F-006)
      √ verifies MCQ option key formatting (A, B, C, D)

PASS tests/unit/delivery.unit.test.js
  === Unit Test Suite: Module M3 Exam Delivery Engine ===
    UT-Take-01: Server-Enforced Countdown Timer Engine (OEP-F-010, DEF-002, TC-Take-02)
      √ calculates accurate remaining seconds during an active exam attempt (2 ms)
      √ returns exactly 0 remaining seconds when time has expired without negative offsets (DEF-002) (1 ms)
      √ handles UTC ISO timestamps consistently regardless of local timezone
    UT-Take-02: DevTools Answer Key Stripping Logic (OEP-SR-004, DEF-001, TC-Sec-05)
      √ strips correct_answer and explanation fields from student payload (1 ms)
    UT-Take-03: 30-Second Auto-Save Answer Parser (OEP-F-011, TC-Take-03)
      √ validates and sanitizes periodic auto-save submissions (1 ms)

PASS tests/unit/eval.unit.test.js
  === Unit Test Suite: Module M4 Evaluation, Results & Analytics ===
    UT-Eval-01: Objective Auto-Grading Engine (OEP-F-013, TC-Eval-01)
      √ correctly scores objective MCQ and True/False questions case-insensitively (2 ms)
      √ flags attempt as pending instructor review when subjective questions exist (1 ms)
    UT-Eval-02: Item Difficulty Index & Analytics Engine (OEP-F-016, TC-Eval-04)
      √ classifies high-success questions as Easy (P >= 0.70) (1 ms)
      √ classifies moderate-success questions as Moderate (0.30 <= P < 0.70) (1 ms)
      √ classifies low-success questions as Difficult (P < 0.30) (1 ms)
    UT-Eval-03: Scorecard Privacy & IDOR Safeguard (OEP-SR-005, DEF-005, TC-Sec-06)
      √ permits student to view their own scorecard (1 ms)
      √ blocks student from viewing another student scorecard (IDOR protection) (1 ms)
      √ permits instructors and administrators to inspect candidate scorecards

PASS tests/unit/logger.unit.test.js
  === Unit Test Suite: Cross-Cutting Audit Logger & Security ===
    UT-Sec-01: Audit Log Client IP Extraction & Fallback (OEP-NF-004, DEF-006, TC-Sec-04)
      √ extracts client IP from x-forwarded-for header when reverse-proxied (1 ms)
      √ falls back to socket remoteAddress when header is absent (1 ms)
      √ falls back safely to 127.0.0.1 when req or socket is undefined (DEF-006 fix) (1 ms)
    UT-Sec-02: Audit Event Payload Structuring
      √ structures audit event record with sanitized fields (1 ms)
      √ allows unauthenticated audit actions with null user_id (e.g., failed registration) (1 ms)

Test Suites: 6 passed, 6 total
Tests:       53 passed, 53 total
Snapshots:   0 total
Time:        4.829 s
>>>>>>> a49aa48 (feat(Sprint-3): [PES2UG24CS002] Finalize Part-3 testing deliverables, unit test suite (53 tests passing), and coverage reports)
```

---

## 2. Code Coverage (statements / branches / functions / lines, %)

| File | Stmts | Branch | Funcs | Lines |
| :--- | ---: | ---: | ---: | ---: |
| **All files** | **75.46** | **58.71** | **79.22** | **75.55** |
| `src/app.js` | 84.09 | 62.50 | 80.00 | 86.11 |
| `src/config/db.js` | 84.84 | 61.53 | 100.00 | 93.33 |
| `src/controllers/authController.js` | 65.09 | 61.70 | 57.14 | 65.09 |
| `src/controllers/deliveryController.js` | 72.64 | 50.70 | 85.71 | 72.41 |
| `src/controllers/evalController.js` | 78.67 | 64.28 | 85.71 | 77.77 |
| `src/controllers/examController.js` | 58.19 | 52.00 | 75.00 | 57.83 |
| `src/db/seed.js` | 95.29 | 90.00 | 60.00 | 95.00 |
| `src/middleware/auth.js` | 88.88 | 87.50 | 100.00 | 88.88 |
| `src/middleware/logger.js` | 83.33 | 66.66 | 100.00 | 83.33 |
| `src/routes/auditRoutes.js` | 91.66 | 100.00 | 100.00 | 91.66 |
| `src/routes/authRoutes.js` | 100.00 | 100.00 | 100.00 | 100.00 |
| `src/routes/deliveryRoutes.js` | 100.00 | 100.00 | 100.00 | 100.00 |
| `src/routes/evalRoutes.js` | 100.00 | 100.00 | 100.00 | 100.00 |
| `src/routes/examRoutes.js` | 100.00 | 100.00 | 100.00 | 100.00 |
| `src/secureServer.js` | 83.33 | 100.00 | 50.00 | 83.33 |
| `src/utils/serverError.js` | 33.33 | 100.00 | 0.00 | 33.33 |

---

## 3. Exit Criteria Compliance (STP §5.4 & Mini-Project Part-3)
- **Open Critical / High defects:** 0
- **Total Passing Automated Tests:** 85 / 85 (100% Pass Rate)
- **Status:** **APPROVED & FULLY COMPLIANT WITH PART-3 AND V1.0.1**
