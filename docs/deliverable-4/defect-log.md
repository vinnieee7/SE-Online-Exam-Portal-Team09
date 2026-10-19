# Online Exam Portal (OEP) — Defect Tracking & Remediation Log
**Team Number:** 9 | **Section:** A  
**Course:** Software Engineering (Dept. of CSE, PES University)  
**QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
**Exit Criteria Compliance:** 0 Open Critical or High Severity Defects (STP §5.4)

---

### Defect Metrics Summary (STP §14.1)

| Metric | Target | Actual Value | Status |
| :--- | :---: | :---: | :---: |
| **Total Defects Logged** | — | **6** | Tracked |
| **Critical Defects (P1)** | 0 Open at Exit | **2 Logged, 2 Closed (0 Open)** | ✅ PASS |
| **High Defects (P2)** | 0 Open at Exit | **2 Logged, 2 Closed (0 Open)** | ✅ PASS |
| **Medium Defects (P3)** | $\le$ 2 Open | **2 Logged, 2 Closed (0 Open)** | ✅ PASS |
| **Defect Removal Efficiency (DRE)** | $\ge$ 90% | **100% (6 / 6 resolved prior to release)** | ✅ PASS |
| **Average Defect Turnaround Time** | $\le$ 2 days | **1.2 days** | ✅ PASS |

---

### Itemized Defect Reports (STP Annexure B Schema)

#### [DEF-001] Exam Attempt JSON Leaks Correct Answer Key to Candidate DevTools
- **Module:** M3 — Exam Delivery Engine
- **Requirement Ref:** `OEP-SR-004` / `TC-Sec-05`
- **Severity:** **Critical** | **Priority:** **P1**
- **Reporter:** Akshansh Agrawal (`PES2UG24CS045`)
- **Assignee:** Aditya Rao (`PES2UG24CS034`)
- **Date Reported:** 2026-10-21 | **Date Resolved:** 2026-10-21
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
- **Assignee:** Aditya Rao (`PES2UG24CS034`)
- **Date Reported:** 2026-10-25 | **Date Resolved:** 2026-10-25
- **Status:** **CLOSED / VERIFIED**
- **Steps to Reproduce:**
  1. Execute integration tests via Jest/Supertest.
- **Observed Behavior:** Supertest mock requests lack `req.socket`, throwing `TypeError: Cannot read properties of undefined`.
- **Root Cause:** Unsafe dereference `req.socket.remoteAddress`.
- **Resolution:** Added optional chaining and fallback: `(req && req.socket && req.socket.remoteAddress) || req.ip || '127.0.0.1'`. All tests pass cleanly.
