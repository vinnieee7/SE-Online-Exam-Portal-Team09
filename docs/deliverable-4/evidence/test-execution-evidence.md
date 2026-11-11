# Online Exam Portal (OEP) — Automated Test Execution Evidence

> **Execution:** 11 November 2026, maintenance release v1.0.1
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9
> **Harness:** Jest 30 + Supertest 7 (`npm test` = `jest --detectOpenHandles --runInBand`)
> **Environment:** Windows 11, Intel Core i7-13645HX, 16 GB RAM, Node.js v26.13.0 (CI runs the same suite on Node 20, Ubuntu)
> **Database:** SQLite 3 in WAL mode, reset by `seedDatabase()` at the start of each test file (STP §6.4 data)
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)

This file replaces the earlier evidence page. That page showed 19 tests and a coverage table that was not reproduced by `npm test` (the script has no `--coverage` flag); the numbers below come from an actual run with `npx jest --runInBand --coverage`.

---

## 1. Test Results — 51 / 51 passed

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

Least-covered areas, candidates for further tests: exam update and delete (`examController.js`), admin user management and password-reset error paths (`authController.js`).

---

## 3. Exit Criteria Compliance (STP §5.4)
- **Open Critical / High defects:** 0
- **Pass rate:** 100% (51 / 51)
- **Status:** **APPROVED** (v1.0.1)
