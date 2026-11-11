# Software Test Execution Report (STP §8 – §14)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9
> **System Name:** Online Exam Portal (OEP)
> **Execution Dates:** 30 October 2026 (Sprint 2 freeze, 19 tests) · **11 November 2026 (v1.0.1, this report)**
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)
> **Dev Lead & Facilitator:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)
> **Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)
> **Baseline Test Plan:** STP v1.0 (Deliverable 3, submitted separately)
> **Traceability & Defect Logs:** [Completed RTM](deliverable-4/Completed_RTM.md) | [Defect Log](deliverable-4/defect-log.md)

---

## 1. Executive Summary

- **Automated tests:** 51 executed, **51 passed** (3 files: `api.test.js` 19, `security.test.js` 19, `verification.test.js` 13) — [log](deliverable-4/evidence/test-execution-evidence.md)
- **Browser test:** `TC-Take-06` (exam timer and auto-submit) passed after the DEF-007 / DEF-008 fixes
- **Load test (Apache JMeter 5.6.3):** 500 concurrent candidates for 10 minutes, then 500 simultaneous submissions — p90 48 ms overall and 0 errors in the 10-minute exam phase; in the 500-submission spike Windows refused 110 of 500 simultaneous new connections (see results) — [results](deliverable-4/evidence/performance-load-test.md)
- **Vulnerability scan (OWASP ZAP 2.17.0):** first scan found unhandled 500 errors leaking internal messages and two missing security headers (fixed, DEF-012); final scan: 0 server errors, remaining alerts assessed as false positives or accepted risk — [results](deliverable-4/evidence/security-scan.md)
- **Accessibility (Lighthouse 12.8.2, axe-core 4.10.2):** login page 100/100; 0 WCAG 2.1 A/AA violations on all 14 pages and dialogs after fixing contrast, labels and keyboard access — [results](deliverable-4/evidence/accessibility-audit.md)
- **Defects:** 12 logged, 12 closed — DEF-007 to DEF-012 were found during this verification (§6)
- **Exit criteria (STP §5.4):** satisfied — 0 open Critical/High defects; 25 of 26 requirements Accepted with executed evidence, OEP-NF-002 Partial (connection burst, see the load-test results)

At the 30 October freeze only the 19 API tests had been executed; the load, accessibility, TLS and scan results quoted in earlier versions of the documents had no run behind them. All of them were executed for this report.

---

## 2. Test Environment

| Parameter | Configuration |
| :--- | :--- |
| **Machine** | Windows 11, Intel Core i7-13645HX, 16 GB RAM (load generator and server on the same machine) |
| **Runtime** | Node.js v26.13.0 locally; Node.js 20 on Ubuntu in GitHub Actions CI |
| **Test framework** | Jest 30 + Supertest 7 (`--detectOpenHandles --runInBand`) |
| **Database** | SQLite 3, WAL journal mode, reseeded per test file (STP §6.4 data) |
| **Load testing** | Apache JMeter 5.6.3 on OpenJDK 21 (plan `backend/perf/oep-load-test.jmx`) |
| **Security scan** | OWASP ZAP 2.17.0, Automation Framework (`backend/security/`) |
| **Accessibility** | Lighthouse 12.8.2 (Microsoft Edge, headless) and axe-core 4.10.2 |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`): backend tests + frontend build |

---

## 3. Test Cases

| Test ID | Feature / Module | What is checked | Assigned tester (STP) | Status |
| :--- | :--- | :--- | :--- | :-: |
| `TC-SYS-01` | System | Health endpoint returns ONLINE | Aadish Sarin | **PASS** |
| `TC-Auth-01`, `01a` | M1: Registration | 201 with sanitized user; duplicate (any case) → 409 | Aadish Sarin | **PASS** |
| `TC-Auth-02`, `02a`, `02b` | M1: Login | JWT with role claims; wrong password 401; locked account 403 | Aadish Sarin | **PASS** |
| `TC-Auth-03`, `03b` | M1: Password reset | 6-digit code (crypto-random, 15-minute validity); a new code cancels the old; codes work once | Aadish Sarin | **PASS** |
| `TC-Auth-04` | M1: RBAC | Student cannot create exams (403) | Aadish Sarin | **PASS** |
| `TC-Exam-01`, `02`, `03` | M2: Exams & bank | Create exam, add question, reject end ≤ start | Aditya Rao | **PASS** |
| `TC-Exam-04a`–`c` | M2: Randomization | Shuffle keeps every item; all 24 orders equally likely (24,000 runs); candidates get each question once, no keys | Aditya Rao | **PASS** |
| `TC-Take-01`, `TC-Sec-05` | M3: Start exam | Attempt created; `correct_answer` and `explanation` absent | Akshansh Agrawal / A S Vincent | **PASS** |
| `TC-Take-02a`–`e` | M3: Timer | Full duration on start; time keeps running server-side; capped by window end; 0 after expiry; DEF-002 regression under Asia/Kolkata | Akshansh Agrawal | **PASS** |
| `TC-Take-03`, `04` | M3: Auto-save, submit | Answers persisted; submission triggers grading | Akshansh Agrawal | **PASS** |
| `TC-Take-05a`–`c` | M3: Attempt start | Simultaneous starts share one attempt (DEF-009); stable order on resume (DEF-010); candidates differ | Akshansh Agrawal | **PASS** |
| `TC-Take-06` (browser) | M3: Expiry | See §4 | Akshansh Agrawal | **PASS** |
| `TC-Eval-01`–`04`, `TC-Sec-06` | M4 | Auto-grade score; scorecard IDOR blocked; manual grading; analytics | A S Vincent | **PASS** |
| `TC-Sec-01a`–`e` | TLS | HTTPS works; TLS 1.3 and 1.2 accepted; TLS 1.1 refused (with control) | A S Vincent | **PASS** |
| `TC-Sec-02a`, `b` | Password storage | bcrypt cost 10, unique salt, hash never returned | A S Vincent | **PASS** |
| `TC-Sec-03a`–`g` | Authorization | No token 401; edited, foreign-key and `alg: none` tokens refused; student blocked from staff APIs; lock applies to issued tokens; no self-registration as Admin | A S Vincent | **PASS** |
| `TC-Sec-04` | Audit log | Admin reads audit log | A S Vincent | **PASS** |
| `TC-Sec-07a`–`d` | Injection | SQL login bypass fails; DROP TABLE payload stored as text; URL id injection → 404; script markup returned as JSON | A S Vincent | **PASS** |
| `TC-Perf-01`, `02` | Performance | p90 ≤ 3.0 s with 500 concurrent candidates; no errors | Akshansh Agrawal | **PASS** (NF-001) / **PARTIAL** (NF-002) |
| `TC-UX-01` | Accessibility | WCAG 2.1 A/AA rules on every page | Akshansh Agrawal | **PASS** |

The v1.0.1 tests were written and run by Aadish Sarin (QA lead) on 11 Nov 2026; the assigned testers review them in the v1.0.1 pull request.

---

## 4. Browser Test `TC-Take-06`: Exam Timer and Auto-Submit

Run in the in-app browser against `npm run dev:frontend` (React development mode), as `student1@pesu.edu`.

| Step | Before the fix | After the fix |
| :--- | :--- | :--- |
| Start the live exam, compare the timer with a clock | 44:57 → 44:47 in 5.0 s (double speed, DEF-008) | 44:57 → 44:47 in 10.0 s |
| Start a 15-second exam, answer one question, wait for 00:00 | Four `POST /api/delivery/attempts/null/submit` → 404; frozen 00:00 screen; attempt stays `in_progress` (DEF-007) | One `POST /api/delivery/attempts/4/submit` → 200; "Time is up" message; back on the dashboard |
| Check the database | — | Attempt 4 `graded`, score 5; one `EXAM_ATTEMPT_START` and one `EXAM_SUBMIT` audit entry |

---

## 5. Code Coverage

Overall **75.5% statements, 58.7% branches** (was not measured before; per-file table in the [evidence log](deliverable-4/evidence/test-execution-evidence.md)).

---

## 6. Defects

| Defect | Severity | Root cause | Fix | Regression test | Status |
| :--- | :---: | :--- | :--- | :--- | :-: |
| DEF-001 | Critical | Answer keys in exam payload | Explicit column list | `TC-Sec-05` | CLOSED |
| DEF-002 | High | UTC timestamp without `Z` read as local time | ISO strings; add `T`/`Z` on read | `TC-Take-02e` | CLOSED |
| DEF-003 | Medium | Case-sensitive duplicate emails | `.toLowerCase().trim()` | `TC-Auth-01a` | CLOSED |
| DEF-004 | High | End time allowed before start | 400 if `end <= start` | `TC-Exam-03` | CLOSED |
| DEF-005 | Critical | Scorecard IDOR | Owner-or-staff check | `TC-Sec-06` | CLOSED |
| DEF-006 | Medium | `req.socket` undefined in Supertest | Fallback chain | `TC-Sec-04` | CLOSED |
| DEF-007 | Critical | Timer callback used the first render's null attempt id | Refs + expiry effect | `TC-Take-06` | CLOSED |
| DEF-008 | High | Two countdowns under React StrictMode | Cancel flag in effect cleanup | `TC-Take-06` | CLOSED |
| DEF-009 | Medium | Check-then-insert race on attempt start | `INSERT OR IGNORE` + re-read | `TC-Take-05a` | CLOSED |
| DEF-010 | Medium | Unseeded shuffle per request | Shuffle seeded by attempt id | `TC-Take-05b` | CLOSED |
| DEF-011 | High | One disk flush per SQLite write capped auto-save near 60 requests/s | WAL journal, `synchronous = NORMAL` | `TC-Perf-01` | CLOSED |
| DEF-012 | Medium | Missing input validation; raw error messages in 500 responses | Validation, safe error helper, security headers | `TC-Sec-07e`, `TC-Exam-01b`, ZAP | CLOSED |

---

## 7. Exit Criteria Sign-Off (STP §5.4)

1. **Critical & High defects open:** 0 — **PASSED**
2. **Requirements verified:** 26 / 26 have executed evidence; 25 Accepted, 1 Partial (OEP-NF-002) — **PASSED with one documented limitation**
3. **Automated pass rate:** 100% (51 / 51) — **PASSED**
4. **Frontend production build:** compiles (`npm run build`) — **PASSED**

- **Aadish Sarin (`PES2UG24CS007`)** — QA Lead: v1.0.1 test execution approved.
- **A S Vincent (`PES2UG24CS002`)** — Dev Lead: review pending on the v1.0.1 pull request.
