# Online Exam Portal (OEP) — Defect Tracking & Remediation Log
**Team Number:** 9 | **Section:** A  
**Course:** Software Engineering (Dept. of CSE, PES University)  
**QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
**Exit Criteria Compliance:** 0 Open Critical or High Severity Defects (STP §5.4)  
**Updated:** 11 Nov 2026 (v1.0.1) — real fix commits added; DEF-007 to DEF-012 logged

---

### Defect Metrics Summary (STP §14.1)

| Metric | Target | Actual Value | Status |
| :--- | :---: | :---: | :---: |
| **Total Defects Logged** | — | **12** (6 during the sprints, 6 in v1.0.1) | Tracked |
| **Critical Severity** | 0 Open at Exit | **3 Logged, 3 Closed (0 Open)** — DEF-001, DEF-005, DEF-007 | ✅ PASS |
| **High Severity** | 0 Open at Exit | **4 Logged, 4 Closed (0 Open)** — DEF-002, DEF-004, DEF-008, DEF-011 | ✅ PASS |
| **Medium Severity** | $\le$ 2 Open | **5 Logged, 5 Closed (0 Open)** — DEF-003, DEF-006, DEF-009, DEF-010, DEF-012 | ✅ PASS |
| **Defect Removal Efficiency (DRE)** | $\ge$ 90% | **100% (12 / 12 resolved before release)** | ✅ PASS |
| **Average Defect Turnaround Time** | $\le$ 2 days | DEF-001 – DEF-006: **1.2 days** as recorded by the team; DEF-007 – DEF-012: fixed the day they were found | ✅ PASS |

**Fix on GitHub** below is the first commit in this repository that contains the fixed code. The reported and resolved dates for DEF-001 – DEF-006 are the team's own records.

---

### Itemized Defect Reports (STP Annexure B Schema)

#### [DEF-001] Exam Attempt JSON Leaks Correct Answer Key to Candidate DevTools
- **Module:** M3 — Exam Delivery Engine
- **Requirement Ref:** `OEP-SR-004` / `TC-Sec-05`
- **Severity:** **Critical** | **Priority:** **P1**
- **Reporter:** Akshansh Agrawal (`PES2UG24CS045`)
- **Assignee:** Aditya Rao (`PES2UG24CS034`)
- **Date Reported:** 2026-10-21 | **Date Resolved:** 2026-10-21
- **Fix on GitHub:** `32262c0` (30 Oct 2026, PR #28) — first version of `deliveryController.js` on GitHub
- **Status:** **CLOSED / VERIFIED**
- **Steps to Reproduce:**
  1. Authenticate as student `student1@pesu.edu`.
  2. Initiate assessment `GET /api/delivery/exams/1/attempt`.
  3. Inspect Chrome DevTools Network Tab response payload for `questions`.
- **Observed Behavior:** The questions payload included `"correct_answer": "B"` and `"explanation"`, allowing examinees to cheat via browser inspect.
- **Root Cause:** SQL query in `deliveryController.js` executed `SELECT * FROM questions`.
- **Resolution:** Explicitly selected only `id, question_text, question_type, marks` and excluded `correct_answer` and `explanation` from student API queries. Retested in build v1.0.2.

---

#### [DEF-002] Server Countdown Timer Calculates Negative Remaining Seconds Due to Timezone Offset
- **Module:** M3 — Exam Delivery Engine
- **Requirement Ref:** `OEP-F-010` / `TC-Take-02`
- **Severity:** **High** | **Priority:** **P1**
- **Reporter:** Akshansh Agrawal (`PES2UG24CS045`)
- **Assignee:** Aditya Rao (`PES2UG24CS034`)
- **Date Reported:** 2026-10-22 | **Date Resolved:** 2026-10-22
- **Fix on GitHub:** `32262c0` (30 Oct 2026, PR #28); regression test `TC-Take-02e` added in v1.0.1
- **Status:** **CLOSED / VERIFIED**
- **Steps to Reproduce:**
  1. Start exam in IST (UTC+5:30) environment.
  2. Attempt starts, but timer reads `00:00` immediately and triggers early auto-submission.
- **Observed Behavior:** Database stored UTC `CURRENT_TIMESTAMP`, but JS `new Date(string)` parsed it as local time, causing a 5.5 hour discrepancy.
- **Root Cause:** Ambiguous date-time string lacking explicit ISO trailing `Z` designator.
- **Resolution:** Updated database write to use `new Date().toISOString()` and ensured safe UTC normalization in `deliveryController.js`. Verified in unit tests.

---

#### [DEF-003] Duplicate Student Registration Allowed When Email Contains Capital Letters
- **Module:** M1 — Authentication & User Management
- **Requirement Ref:** `OEP-F-001` / `TC-Auth-01a`
- **Severity:** **Medium** | **Priority:** **P2**
- **Reporter:** Aadish Sarin (`PES2UG24CS007`)
- **Assignee:** A S Vincent (`PES2UG24CS002`)
- **Date Reported:** 2026-10-22 | **Date Resolved:** 2026-10-23
- **Fix on GitHub:** `b7e0f11` (23 Oct 2026)
- **Status:** **CLOSED / VERIFIED**
- **Steps to Reproduce:**
  1. Register account with `Student1@pesu.edu`.
  2. Attempt registration again with `student1@pesu.edu`.
- **Observed Behavior:** Database allowed both accounts because SQLite default `TEXT UNIQUE` is case-sensitive.
- **Root Cause:** Email input was not normalized to lowercase prior to DB query and insertion.
- **Resolution:** Added `.toLowerCase().trim()` to all auth controllers (`register`, `login`, `resetPassword`). Duplicate emails now cleanly return `409 Conflict`.

---

#### [DEF-004] Exam End Time Allowed Prior to Start Time in Instructor Creation Form
- **Module:** M2 — Exam & Question-Bank Management
- **Requirement Ref:** `OEP-F-007` / `TC-Exam-03`
- **Severity:** **High** | **Priority:** **P2**
- **Reporter:** Aditya Rao (`PES2UG24CS034`)
- **Assignee:** Aadish Sarin (`PES2UG24CS007`)
- **Date Reported:** 2026-10-23 | **Date Resolved:** 2026-10-23
- **Fix on GitHub:** `bcfc262` (1 Nov 2026), PR #31 merged 2 Nov 2026
- **Status:** **CLOSED / VERIFIED**
- **Steps to Reproduce:**
  1. Instructor creates an exam with `start_time = 2026-10-30T14:00` and `end_time = 2026-10-30T10:00`.
  2. Click Submit.
- **Observed Behavior:** Exam created with inverted schedule, preventing any student from taking the assessment.
- **Root Cause:** Missing server-side date validation in `examController.js`.
- **Resolution:** Added constraint verification `if (new Date(end_time) <= new Date(start_time))` returning `400 Bad Request`. Verified with test `TC-Exam-03`.

---

#### [DEF-005] Student Scorecard Privacy Leak (IDOR Vulnerability)
- **Module:** M4 — Evaluation, Results & Analytics
- **Requirement Ref:** `OEP-SR-005` / `TC-Sec-06`
- **Severity:** **Critical** | **Priority:** **P1**
- **Reporter:** A S Vincent (`PES2UG24CS002`)
- **Assignee:** Akshansh Agrawal (`PES2UG24CS045`)
- **Date Reported:** 2026-10-24 | **Date Resolved:** 2026-10-24
- **Fix on GitHub:** `39470c5` (31 Oct 2026, PR #29), hardened in `8bf7220` (PR #30)
- **Status:** **CLOSED / VERIFIED**
- **Steps to Reproduce:**
  1. Log in as Student Beta (`student2@pesu.edu`).
  2. Send GET request to `/api/eval/attempts/1/scorecard` (which belongs to Student Alpha).
- **Observed Behavior:** Student Beta could view Student Alpha's scorecard and marks breakdown.
- **Root Cause:** Insecure Direct Object Reference (IDOR); controller did not compare `attempt.student_id` with `req.user.id`.
- **Resolution:** Enforced authorization check: if user role is `Student` and `attempt.student_id !== req.user.id`, return `403 Forbidden` and log security audit event. Verified with test `TC-Eval-03`.

---

#### [DEF-006] Audit Log Remote IP Crash During Automated Testing Environment
- **Module:** Cross-Cutting / Logging Middleware
- **Requirement Ref:** `OEP-NF-004` / `TC-Sec-04`
- **Severity:** **Medium** | **Priority:** **P3**
- **Reporter:** A S Vincent (`PES2UG24CS002`)
- **Assignee:** Aadish Sarin (`PES2UG24CS007`) — as assigned in GitHub issue #26
- **Date Reported:** 2026-10-25 | **Date Resolved:** 2026-10-25
- **Fix on GitHub:** `backend/src/middleware/logger.js` as first committed in `b7e0f11`
- **Status:** **CLOSED / VERIFIED**
- **Steps to Reproduce:**
  1. Execute integration tests via Jest/Supertest.
- **Observed Behavior:** Supertest mock requests lack `req.socket`, throwing `TypeError: Cannot read properties of undefined`.
- **Root Cause:** Unsafe dereference `req.socket.remoteAddress`.
- **Resolution:** Added optional chaining and fallback: `(req && req.socket && req.socket.remoteAddress) || req.ip || '127.0.0.1'`. All tests pass cleanly.

---

#### [DEF-007] Auto-Submit at Timer Expiry Posts to `/attempts/null/submit`
- **Module:** M3 — Exam Delivery Engine (`frontend/src/pages/ExamScreen.jsx`)
- **Requirement Ref:** `OEP-F-011` / `TC-Take-06` (browser test)
- **Severity:** **Critical** | **Priority:** **P1**
- **Reporter:** Aadish Sarin (`PES2UG24CS007`), viva-preparation testing
- **Module Owner:** Aditya Rao (`PES2UG24CS034`); fix submitted for his review in the v1.0.1 pull request
- **Date Reported:** 2026-11-11 | **Date Resolved:** 2026-11-11
- **Status:** **CLOSED / VERIFIED** (v1.0.1)
- **Steps to Reproduce:**
  1. As `instructor1@pesu.edu`, create a published exam with `duration_minutes: 0.25` (15 seconds).
  2. As `student1@pesu.edu`, start it in the browser and wait for 00:00.
- **Observed Behavior:** The browser sent `POST /api/delivery/attempts/null/submit` four times (HTTP 404 "Attempt not found"), showed "Error during final submission" and stayed on a frozen 00:00 screen. The attempt stayed `in_progress`.
- **Root Cause:** The countdown interval was created inside the first render's effect, so it called the first render's `submitFinalExam`, where `attemptId` was still `null`. The submission was also triggered from inside a state updater, which React StrictMode runs twice.
- **Resolution:** The attempt id and answers are read from refs; the updater only decrements the counter; a separate effect submits once when the counter reaches 0, guarded against a second submission; the "time is up" message is shown after the request instead of blocking it.
- **Verification:** Same steps after the fix: one `POST /api/delivery/attempts/4/submit` → 200, the candidate returns to the dashboard, and the attempt is `graded` with the answer chosen before expiry scored (5 marks).

---

#### [DEF-008] Exam Clock Runs at Double Speed in Development Mode
- **Module:** M3 — Exam Delivery Engine (`frontend/src/pages/ExamScreen.jsx`)
- **Requirement Ref:** `OEP-F-010` / `TC-Take-06` (browser test)
- **Severity:** **High** | **Priority:** **P2**
- **Reporter:** Aadish Sarin (`PES2UG24CS007`), viva-preparation testing
- **Module Owner:** Aditya Rao (`PES2UG24CS034`)
- **Date Reported:** 2026-11-11 | **Date Resolved:** 2026-11-11
- **Status:** **CLOSED / VERIFIED** (v1.0.1)
- **Steps to Reproduce:** Run `npm run dev:frontend`, start the live exam, and compare the timer with a clock.
- **Observed Behavior:** The timer went from 44:57 to 44:47 in 5.0 seconds of real time. The production build (`npm run build`) is not affected, but the demo runs the development server.
- **Root Cause:** React StrictMode runs effects twice in development. The first run's request resolved after its cleanup and still started its own countdown, so two intervals decremented the same counter.
- **Resolution:** The effect sets a `cancelled` flag on cleanup and ignores late responses.
- **Verification:** 10.0 seconds of real time now take 10 seconds off the clock.

---

#### [DEF-009] Simultaneous Attempt-Start Requests Return HTTP 500
- **Module:** M3 — Exam Delivery Engine (`backend/src/controllers/deliveryController.js`)
- **Requirement Ref:** `OEP-F-009` / `TC-Take-05a`
- **Severity:** **Medium** | **Priority:** **P2**
- **Reporter:** Aadish Sarin (`PES2UG24CS007`), viva-preparation testing
- **Module Owner:** Aditya Rao (`PES2UG24CS034`)
- **Date Reported:** 2026-11-11 | **Date Resolved:** 2026-11-11
- **Status:** **CLOSED / VERIFIED** (v1.0.1)
- **Steps to Reproduce:** Send two `GET /api/delivery/exams/1/attempt` requests at the same moment for a candidate who has no attempt yet (a double click, or StrictMode's double effect, does this).
- **Observed Behavior:** One of the two requests returned HTTP 500 "Failed to initiate exam attempt".
- **Root Cause:** Check-then-insert race: both requests found no attempt and both inserted one; `UNIQUE(exam_id, student_id)` rejected the second insert.
- **Resolution:** `INSERT OR IGNORE` followed by a re-read, so both requests return the same attempt; the start event is audited only by the request that created the row.
- **Verification:** `TC-Take-05a` fails on the previous code (HTTP 500) and passes on the fix (both 200, one attempt, one audit entry).

---

#### [DEF-010] Question Order Changes on Every Refresh
- **Module:** M3 — Exam Delivery Engine (`backend/src/controllers/deliveryController.js`)
- **Requirement Ref:** `OEP-F-008`, `DEV-02` / `TC-Take-05b`
- **Severity:** **Medium** | **Priority:** **P3**
- **Reporter:** Aadish Sarin (`PES2UG24CS007`), viva-preparation testing
- **Module Owner:** Aditya Rao (`PES2UG24CS034`)
- **Date Reported:** 2026-11-11 | **Date Resolved:** 2026-11-11
- **Status:** **CLOSED / VERIFIED** (v1.0.1)
- **Observed Behavior:** Every `GET /api/delivery/exams/:id/attempt` returned a new question order, so a refresh moved questions to different palette positions — contrary to deviation DEV-02, which promised a stable order per attempt.
- **Root Cause:** The shuffle used `Math.random()` on every request.
- **Resolution:** The Fisher-Yates shuffle is driven by a small seeded pseudo-random generator (mulberry32) seeded with the attempt id.
- **Verification:** `TC-Take-05b` (same order on resume; fails on the previous code) and `TC-Take-05c` (two candidates get different orders).

---

#### [DEF-011] Auto-Save Throughput Capped Near 60 Requests per Second
- **Module:** Persistence (`backend/src/config/db.js`)
- **Requirement Ref:** `OEP-NF-001`, `OEP-NF-002` / `TC-Perf-01`, `TC-Perf-02`
- **Severity:** **High** | **Priority:** **P2**
- **Reporter:** Aadish Sarin (`PES2UG24CS007`), JMeter load test
- **Module Owner:** Aditya Rao (`PES2UG24CS034`), database schema and setup
- **Date Reported:** 2026-11-11 | **Date Resolved:** 2026-11-11
- **Status:** **CLOSED / VERIFIED** (v1.0.1)
- **Steps to Reproduce:** Run `backend/perf/oep-load-test.jmx` with 500 candidates against the v1.0.0 database settings.
- **Observed Behavior:** A first run (stopped after 3 min 29 s when the test session was interrupted) served only 60.9 requests per second, with an average response time of 4,936 ms and a maximum of 11,670 ms (12,751 requests, 0 errors) — far above the 3.0 s p90 target.
- **Root Cause:** SQLite's default rollback journal with `synchronous = FULL` flushes to disk on every single `UPDATE`; each auto-save performs several writes, so the single database connection spent most of its time waiting for the disk.
- **Resolution:** `PRAGMA journal_mode = WAL` and `PRAGMA synchronous = NORMAL` (plus a 5 s busy timeout) when the connection opens. WAL with NORMAL sync remains crash-safe for the database; at most the last transactions before a power loss can be lost.
- **Verification:** Full JMeter run after the fix: 148,980 requests in the 10-minute exam phase with 0 errors, auto-save mean 17 ms and p90 41 ms, about 235 requests per second. See [Performance Load Test](evidence/performance-load-test.md).

---

#### [DEF-012] Invalid Requests Returned HTTP 500 with Internal Error Details
- **Module:** Cross-cutting (`backend/src/app.js`, all controllers), M2 exam creation, M1 user update
- **Requirement Ref:** `OEP-SR-003`, OWASP ZAP scan / `TC-Sec-07e`, `TC-Exam-01b`
- **Severity:** **Medium** | **Priority:** **P2**
- **Reporter:** Aadish Sarin (`PES2UG24CS007`), OWASP ZAP 2.17.0 scan
- **Date Reported:** 2026-11-11 | **Date Resolved:** 2026-11-11
- **Status:** **CLOSED / VERIFIED** (v1.0.1)
- **Observed Behavior:** During the first ZAP scan, a login or register request without a JSON body crashed with `Cannot destructure property 'email' of 'req.body'` (HTTP 500); malformed JSON returned 500 with the parser's message; creating an exam with a non-existent question id failed with `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed` (39 times) and an empty role in `PATCH /api/auth/users/:id` failed a CHECK constraint — each as HTTP 500. Every 500 response included `details: err.message`. Responses also carried `X-Powered-By: Express` and no `X-Content-Type-Options` header.
- **Root Cause:** Missing input validation before database writes; Express 5 leaves `req.body` undefined without a JSON body; the global error handler turned client errors into 500s; controllers sent raw error messages to the client.
- **Resolution:** Empty body defaults to `{}`; parse errors keep their 400 status; `question_ids` must reference existing questions; role is validated whenever it is present; all 24 server-error responses go through `utils/serverError.js` (logged on the server, generic message to the client); `X-Powered-By` disabled; `X-Content-Type-Options: nosniff` added.
- **Verification:** `TC-Sec-07e` and `TC-Exam-01b`; the final ZAP scan logged no server errors (see [Security Scan](evidence/security-scan.md)).
