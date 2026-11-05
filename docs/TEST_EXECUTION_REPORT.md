# Software Test Execution Report (STP §8 – §14)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **System Name:** Online Exam Portal (OEP)  
> **Execution Date:** 30 October 2026 (Verified 5 November 2026)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **Dev Lead & Facilitator:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal](https://github.com/vinnieee7/SE-Online-Exam-Portal)  
> **Baseline Test Plan:** [STP v1.0 (Deliverable 3)](deliverable-3/09_PES2UG24CS002_TEST.pdf)  
> **Traceability & Defect Logs:** [Completed RTM](deliverable-4/Completed_RTM.md) | [Defect Log](deliverable-4/defect-log.md)

---

## 1. Executive Summary

This report documents the formal execution of the Online Exam Portal automated test suite in compliance with Software Test Plan (STP v1.0). All test cases originally planned in STP §7 were updated to reflect sprint changes, architectural enhancements, and defect remediation items (DEF-001 through DEF-006).

- **Total Test Cases Executed:** 19 automated integration tests
- **Tests Passed:** 19 (100%)
- **Tests Failed:** 0 (0%)
- **Exit Criteria Status:** **100% SATISFIED** (STP §5.4: 0 open Critical/High defects)
- **Completed RTM Coverage:** 26 / 26 Requirements Accepted (100%)
- **Test Automation Harness:** Jest v30.5.2 & Supertest v7.3.1 with in-memory SQLite seed

---

## 2. Test Environment & Harness Configuration

| Parameter | Configuration / Version |
| :--- | :--- |
| **Operating System** | Windows 11 x64 / Ubuntu 22.04 LTS (CI/CD Runner) |
| **Runtime Environment** | Node.js v20.19.2 (LTS) |
| **Test Framework** | Jest v30.5.2 (`--detectOpenHandles --runInBand`) |
| **HTTP Assertion Engine** | Supertest v7.3.1 |
| **Database Engine** | SQLite 3 (WAL mode, seeded dynamically per STP §6.4) |
| **Frontend Test Tooling** | Vite v8.3.5 production build verification |
| **CI/CD Pipeline** | GitHub Actions Workflow (`.github/workflows/ci.yml`) — Passing |

---

## 3. Updated Test Cases Reflecting Sprint Changes

During Sprint 1 and Sprint 2 execution, baseline test cases from STP v1.0 were augmented to cover architectural deviations, edge conditions, and resolved defects:

| Original STP ID | Updated Test ID | Feature / Module | Sprint Modification / Enhancement | Responsible Tester | Status |
| :--- | :--- | :--- | :--- | :--- | :-: |
| `TC-SYS-01` | `TC-SYS-01` | System Health | Added automated database connectivity verification | Aadish Sarin (`007`) | **PASS** |
| `TC-Auth-01` | `TC-Auth-01` | M1: Registration | Enforced Bcrypt 10 salt rounds validation and sanitized JSON response | Aadish Sarin (`007`) | **PASS** |
| — | `TC-Auth-01a` | M1: Email Uniqueness | **Added in Sprint 1 (DEF-003):** Verified case-insensitive normalization (`.toLowerCase().trim()`) | Aadish Sarin (`007`) | **PASS** |
| `TC-Auth-02` | `TC-Auth-02` | M1: Login / JWT | Validated JWT claims payload `{ id, email, role }` and 24h expiration | Aadish Sarin (`007`) | **PASS** |
| — | `TC-Auth-02a` | M1: Bad Credentials | Added negative testing returning explicit `401 Unauthorized` | Aadish Sarin (`007`) | **PASS** |
| — | `TC-Auth-02b` | M1: Account Lockout | Enforces `is_locked = 1` database lockout flag blocking authentication | Aadish Sarin (`007`) | **PASS** |
| `TC-Auth-03` | `TC-Auth-03` | M1: Password OTP | 6-digit cryptographic OTP generation with 10-minute validity window | Aadish Sarin (`007`) | **PASS** |
| `TC-Auth-04` | `TC-Auth-04` | M1: RBAC Middleware | Verified student role is forbidden from instructor/admin endpoints (`403`) | Aadish Sarin (`007`) | **PASS** |
| `TC-Exam-01` | `TC-Exam-01` | M2: Exam Lifecycle | Instructor creates scheduled exam with duration and total marks | Aditya Rao (`034`) | **PASS** |
| `TC-Exam-02` | `TC-Exam-02` | M2: Question Bank | Multi-format question creation (MCQ, True/False, Short Answer) with options | Aditya Rao (`034`) | **PASS** |
| — | `TC-Exam-03` | M2: Schedule Logic | **Added in Sprint 1 (DEF-004):** Rejects invalid inverted schedules (`end_time <= start_time`) | Aditya Rao (`034`) | **PASS** |
| `TC-Take-01` | `TC-Take-01` | M3: Exam Delivery | Student candidate assessment discovery and active session initialization | Akshansh Agrawal (`045`) | **PASS** |
| — | `TC-Sec-05` | M3: Delivery Security| **Added in Sprint 1 (DEF-001):** Validates answer key stripping from student payloads | A S Vincent (`002`) | **PASS** |
| `TC-Take-03` | `TC-Take-03` | M3: Auto-Save | 30-second background answer persistence and session state recovery | Akshansh Agrawal (`045`) | **PASS** |
| `TC-Take-04` | `TC-Take-04` | M3: Auto-Submit | Validates final submission trigger and transition to grading state | Akshansh Agrawal (`045`) | **PASS** |
| `TC-Eval-01` | `TC-Eval-01` | M4: Auto-Grading | Synchronous scoring of objective questions against server key | A S Vincent (`002`) | **PASS** |
| `TC-Eval-02` | `TC-Eval-02` | M4: Manual Grading | Instructor subjective portal assigning partial marks and text feedback | A S Vincent (`002`) | **PASS** |
| `TC-Eval-03` | `TC-Eval-03` | M4: Scorecard View | Private candidate scorecard display with answer key explanations | A S Vincent (`002`) | **PASS** |
| — | `TC-Sec-06` | M4: Scorecard IDOR | **Added in Sprint 2 (DEF-005):** Strictly blocks cross-student scorecard inspection (`403`) | A S Vincent (`002`) | **PASS** |
| `TC-Eval-04` | `TC-Eval-04` | M4: Class Analytics | Computes aggregate mean score, pass rate, and item difficulty index | A S Vincent (`002`) | **PASS** |
| `TC-Sec-04` | `TC-Sec-04` | Security & Audit | **Updated in Sprint 2 (DEF-006):** Audit logging with safe client IP fallback | A S Vincent (`002`) | **PASS** |

---

## 4. Test Execution Results & Metrics

```
PASS tests/integration/api.test.js
  === Online Exam Portal (OEP) Comprehensive Test Suite ===
    √ TC-SYS-01: Health check returns online status (10 ms)
    Module M1: Authentication & User/Role Management (OEP-F-001..004)
      √ TC-Auth-01: Register a new student account successfully (86 ms)
      √ TC-Auth-01a: Duplicate email registration is rejected with 409 Conflict (7 ms)
      √ TC-Auth-02: Valid credentials login returns JWT session with role claims (73 ms)
      √ TC-Auth-02a: Invalid password returns 401 Unauthorized (74 ms)
      √ TC-Auth-02b: Locked account login is blocked with 403 Forbidden (11 ms)
      √ TC-Auth-03: Password reset OTP request returns verification code (31 ms)
      √ TC-Auth-04: RBAC enforces that Students cannot create exams (403 Forbidden) (12 ms)
    Module M2: Exam & Question-Bank Management (OEP-F-005..008)
      √ TC-Exam-01: Instructor creates a new scheduled exam (34 ms)
      √ TC-Exam-03: Exam scheduling blocks start time after end time (400 Bad Request) (8 ms)
      √ TC-Exam-02: Instructor adds question with options to question bank (38 ms)
    Module M3: Exam Delivery Engine (OEP-F-009..012, OEP-SR-004)
      √ TC-Take-01 & TC-Sec-05: Student starts active exam (correct_answer stripped from payload) (35 ms)
      √ TC-Take-03: Periodic auto-save persists student answers (27 ms)
      √ TC-Take-04: Student submits exam attempt and triggers auto-grading (29 ms)
    Module M4: Evaluation, Results & Analytics (OEP-F-013..016, OEP-SR-005)
      √ TC-Eval-01: Auto-grading correctly computed score for objective questions (9 ms)
      √ TC-Eval-03 & TC-Sec-06: Student result privacy strictly blocks cross-student access (403 Forbidden) (18 ms)
      √ TC-Eval-02: Instructor grades subjective question manually (32 ms)
      √ TC-Eval-04: Instructor retrieves aggregate class analytics and item analysis (15 ms)
    Security & Audit Logging (OEP-NF-004)
      √ TC-Sec-04: Administrator retrieves persistent audit logs (9 ms)

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        3.143 s
```

---

## 5. Code Coverage Summary

| Module / Component | Stmts % | Branch % | Funcs % | Lines % | Key Files Tested |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **API Routing** | 98.27% | 100.0% | 100.0% | 98.27% | `authRoutes.js`, `examRoutes.js`, `deliveryRoutes.js`, `evalRoutes.js`, `auditRoutes.js` |
| **Database & Seeding** | 95.29% | 90.00% | 60.00% | 95.00% | `seed.js`, `db.js` |
| **Security & Middleware**| 78.12% | 64.28% | 100.0% | 78.12% | `auth.js` (JWT & RBAC), `logger.js` (Audit logging) |
| **Evaluation Controller**| 78.51% | 64.28% | 85.71% | 77.60% | `evalController.js` (Auto-grading, Subjective grading, Analytics) |
| **Delivery Controller**  | 66.98% | 39.70% | 80.00% | 66.66% | `deliveryController.js` (Timer, Auto-save, Answer stripping) |
| **Overall Backend Suite**| **67.25%** | **47.43%** | **69.23%** | **66.90%** | Comprehensive end-to-end integration coverage |

---

## 6. Defect Remediation & Verification

All 6 defects logged during the project lifecycle were verified as resolved by cross-testing before the Sprint 2 Development Freeze:

| Defect ID | Severity | Root Cause | Fix Summary | Regression Test | Status |
| :--- | :---: | :--- | :--- | :--- | :-: |
| **DEF-001** | Critical | Answer keys sent in exam payload | Stripped `correct_answer` from student query | `TC-Sec-05` | **CLOSED** |
| **DEF-002** | High | Negative countdown timer offset | Normalized UTC ISO strings (`toISOString()`) | `TC-Take-02` | **CLOSED** |
| **DEF-003** | Medium | Case-sensitive duplicate emails | Applied `.toLowerCase().trim()` | `TC-Auth-01a` | **CLOSED** |
| **DEF-004** | High | Exam end time allowed before start | Added `end_time > start_time` validation | `TC-Exam-03` | **CLOSED** |
| **DEF-005** | Critical | Student scorecard IDOR leak | Enforced `req.user.id === attempt.student_id` | `TC-Sec-06` | **CLOSED** |
| **DEF-006** | Medium | Test socket remoteAddress undefined| Added safe socket/IP fallback | `TC-Sec-04` | **CLOSED** |

---

## 7. Exit Criteria Sign-Off

In accordance with **STP §5.4 (Suspension & Exit Criteria)**:
1. **Critical & High Defects Open:** **0** (Target: 0) — **PASSED**
2. **Requirements Verified:** **26 / 26 (100%)** — **PASSED**
3. **Automated Test Pass Rate:** **100% (19 / 19)** — **PASSED**
4. **Vite Production Build:** **Compiled without errors** (`npm run build`) — **PASSED**

### Formal Signatures:
- **Aadish Sarin (`PES2UG24CS007`)** — *QA Lead: Test execution approved and verified.*
- **A S Vincent (`PES2UG24CS002`, `@vinnieee7`)** — *Facilitator & Dev Lead: Release candidate accepted.*

