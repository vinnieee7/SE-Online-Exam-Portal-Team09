# Unit Test Report (Mini-Project Part-3 §2.b.i)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9
> **Target System:** Online Exam Portal (OEP)
> **Testing Window:** 2 – 6 November 2026 (Sprint 3); results regenerated 12 November 2026 after the v1.0.1 fixes
> **Team:** Aadish Sarin (`PES2UG24CS007`, QA Lead) · A S Vincent (`PES2UG24CS002`, Dev Lead) · Aditya Rao (`PES2UG24CS034`, DevOps Lead) · Akshansh Agrawal (`PES2UG24CS045`, Performance Lead)
> **Code tested:** commit `57e01fd` on `main` · **Repository:** https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09


---

## 1. Summary

Unit tests check one function or rule at a time, with no HTTP server and no database. They live in `backend/tests/unit/` and run with every `npm test`, locally and in GitHub Actions CI.

| Item | Value |
| :--- | :--- |
| Test suites | 5 (one per module plus audit logging) |
| Test cases | **34** |
| Passed / failed | **34 passed, 0 failed** |
| Run time | 0.27 s for the five unit suites |
| Framework | Jest 30.5.2 on Node.js (CI uses Node 20) |
| Run on | 12 November 2026, commit `57e01fd` |

Command: `cd backend && npx jest tests/unit`

## 2. Results by module

Developer and tester follow the cross-testing allocation in STP §9: nobody tests the module they built. Durations are as reported by Jest (0 ms means under 1 ms).

### 2.1 M1 · Authentication & RBAC — `auth.unit.test.js`

*Developer:* A S Vincent · *Tester:* Aadish Sarin · **7/7 passed**

*What it calls:* the real `requireRole` middleware and `JWT_SECRET` from `src/middleware/auth.js`, plus the bcryptjs / jsonwebtoken calls the controllers make.

| Test ID | What is checked | Requirement / defect | Time | Result |
| :--- | :--- | :--- | ---: | :---: |
| UT-Auth-01a | hashes passwords using bcrypt with 10 salt rounds | OEP-SR-002 | 162 ms | **PASS** |
| UT-Auth-02a | generates valid JWT with role claims and 24-hour expiration | OEP-F-002 | 0 ms | **PASS** |
| UT-Auth-02b | rejects token signed with an invalid secret | OEP-F-002 | 1 ms | **PASS** |
| UT-Auth-03a | requireRole allows request through if user possesses required role | OEP-F-004 | 0 ms | **PASS** |
| UT-Auth-03b | requireRole returns 403 Forbidden if user role is unauthorized | OEP-F-004 | 0 ms | **PASS** |
| UT-Auth-03c | requireRole returns 401 Unauthorized if req.user is missing | OEP-F-004 | 1 ms | **PASS** |
| UT-Auth-04a | normalizes email inputs by trimming whitespace and converting to lowercase | DEF-003 | 0 ms | **PASS** |

### 2.2 M2 · Exam & Question Bank — `exam.unit.test.js`

*Developer:* Aadish Sarin · *Tester:* Aditya Rao · **9/9 passed**

*What it calls:* the real `shuffleArray` exported by `src/controllers/examController.js`; the schedule and option-key rules are re-stated in the test file.

| Test ID | What is checked | Requirement / defect | Time | Result |
| :--- | :--- | :--- | ---: | :---: |
| UT-Exam-01a | shuffleArray preserves all original elements and array length | OEP-F-008 | 0 ms | **PASS** |
| UT-Exam-01b | shuffleArray does not mutate the source array in place | OEP-F-008 | 0 ms | **PASS** |
| UT-Exam-01c | shuffleArray handles empty arrays and non-array inputs safely | OEP-F-008 | 0 ms | **PASS** |
| UT-Exam-01d | repeated shuffles produce randomized distributions across iterations | OEP-F-008 | 0 ms | **PASS** |
| UT-Exam-02a | accepts valid start time, end time, and duration | OEP-F-007, DEF-004 | 0 ms | **PASS** |
| UT-Exam-02b | rejects schedule where end time is earlier than start time (DEF-004) | OEP-F-007, DEF-004 | 0 ms | **PASS** |
| UT-Exam-02c | rejects schedule where window is shorter than duration | OEP-F-007, DEF-004 | 0 ms | **PASS** |
| UT-Exam-02d | rejects non-positive duration | OEP-F-007, DEF-004 | 0 ms | **PASS** |
| UT-Exam-03a | verifies MCQ option key formatting (A, B, C, D) | OEP-F-006 | 1 ms | **PASS** |

### 2.3 M3 · Exam Delivery — `delivery.unit.test.js`

*Developer:* Aditya Rao · *Tester:* Akshansh Agrawal · **5/5 passed**

*What it calls:* timer, answer-key stripping and auto-save rules re-stated in the test file (the controller code itself is covered by TC-Take-02a–e, TC-Take-05a–c and TC-Sec-05 in the System Testing Report).

| Test ID | What is checked | Requirement / defect | Time | Result |
| :--- | :--- | :--- | ---: | :---: |
| UT-Take-01a | calculates accurate remaining seconds during an active exam attempt | OEP-F-010, DEF-002 | 0 ms | **PASS** |
| UT-Take-01b | returns exactly 0 remaining seconds when time has expired without negative offsets (DEF-002) | OEP-F-010, DEF-002 | 1 ms | **PASS** |
| UT-Take-01c | handles UTC ISO timestamps consistently regardless of local timezone | OEP-F-010, DEF-002 | 0 ms | **PASS** |
| UT-Take-02a | strips correct_answer and explanation fields from student payload | OEP-SR-004, DEF-001 | 0 ms | **PASS** |
| UT-Take-03a | validates and sanitizes periodic auto-save submissions | OEP-F-011 | 0 ms | **PASS** |

### 2.4 M4 · Evaluation & Analytics — `eval.unit.test.js`

*Developer:* Akshansh Agrawal · *Tester:* A S Vincent · **8/8 passed**

*What it calls:* grading, difficulty-index and scorecard-ownership rules re-stated in the test file (the controller code itself is covered by TC-Eval-01–04 and TC-Sec-06).

| Test ID | What is checked | Requirement / defect | Time | Result |
| :--- | :--- | :--- | ---: | :---: |
| UT-Eval-01a | correctly scores objective MCQ and True/False questions case-insensitively | OEP-F-013 | 1 ms | **PASS** |
| UT-Eval-01b | flags attempt as pending instructor review when subjective questions exist | OEP-F-013 | 0 ms | **PASS** |
| UT-Eval-02a | classifies high-success questions as Easy (P >= 0.70) | OEP-F-016 | 0 ms | **PASS** |
| UT-Eval-02b | classifies moderate-success questions as Moderate (0.30 <= P < 0.70) | OEP-F-016 | 0 ms | **PASS** |
| UT-Eval-02c | classifies low-success questions as Difficult (P < 0.30) | OEP-F-016 | 0 ms | **PASS** |
| UT-Eval-03a | permits student to view their own scorecard | OEP-SR-005, DEF-005 | 0 ms | **PASS** |
| UT-Eval-03b | blocks student from viewing another student scorecard (IDOR protection) | OEP-SR-005, DEF-005 | 0 ms | **PASS** |
| UT-Eval-03c | permits instructors and administrators to inspect candidate scorecards | OEP-SR-005, DEF-005 | 1 ms | **PASS** |

### 2.5 Cross-cutting · Audit logging — `logger.unit.test.js`

*Developer:* A S Vincent · *Tester:* Aadish Sarin · **5/5 passed**

*What it calls:* IP-fallback and audit-record rules re-stated in the test file (the real logger is exercised by TC-Sec-04 and TC-Take-05a).

| Test ID | What is checked | Requirement / defect | Time | Result |
| :--- | :--- | :--- | ---: | :---: |
| UT-Sec-01a | extracts client IP from x-forwarded-for header when reverse-proxied | OEP-NF-004, DEF-006 | 0 ms | **PASS** |
| UT-Sec-01b | falls back to socket remoteAddress when header is absent | OEP-NF-004, DEF-006 | 0 ms | **PASS** |
| UT-Sec-01c | falls back safely to 127.0.0.1 when req or socket is undefined (DEF-006 fix) | OEP-NF-004, DEF-006 | 0 ms | **PASS** |
| UT-Sec-02a | structures audit event record with sanitized fields | — | 0 ms | **PASS** |
| UT-Sec-02b | allows unauthenticated audit actions with null user_id (e.g., failed registration) | — | 0 ms | **PASS** |

## 3. What the unit tests do and do not cover

- The **M1** and **M2** suites import application code directly (`requireRole`, `shuffleArray`).
- The **M3**, **M4** and logging suites check each rule as written in the test file. The same rules in the real controllers are verified end to end by the integration suites (see the System Testing Report), because those controllers read and write the database inside each handler.
- On their own the unit suites reach 19.5% of backend statements; together with the integration suites the total is 75.6% (see the Code Coverage Report).

## 4. Conclusion

All 34 unit tests pass. No defects were found by the unit suites in Sprint 3; the 12 defects in the defect log were found by cross-testing, the browser test, the load test and the ZAP scan, and each has a regression test.

*Prepared by Aadish Sarin (QA Lead).*
