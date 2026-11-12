# Unit Test Report (Mini-Project Part-3 §2.b.i)

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

This report documents the design, execution, and verification of dedicated unit test suites for all 4 functional modules and cross-cutting security layers of the Online Exam Portal. All unit tests isolate specific business logic, mathematical algorithms, cryptographic routines, and authorization guard clauses without requiring network or database I/O latency.

- **Total Unit Test Suites:** 5 suites
- **Total Unit Tests Executed:** 34 tests
- **Tests Passed:** 34 (100%)
- **Tests Failed:** 0 (0%)
- **Total Unit Execution Time:** 0.628 seconds
- **Test Framework:** Jest v30.5.2 (Node 20 LTS)

---

## 2. Unit Test Suite Execution Breakdown

```
PASS tests/unit/auth.unit.test.js
PASS tests/unit/exam.unit.test.js
PASS tests/unit/delivery.unit.test.js
PASS tests/unit/eval.unit.test.js
PASS tests/unit/logger.unit.test.js

Test Suites: 5 passed, 5 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        0.628 s
```

---

## 3. Itemized Test Results by Module

### 3.1 Module M1: Authentication & RBAC Middleware (`auth.unit.test.js`)
*Responsible Developer & Lead:* A S Vincent (`PES2UG24CS002`)  
*Responsible Tester:* Aadish Sarin (`PES2UG24CS007`)

| Test ID | Unit Component | Test Description | Duration | Status |
| :--- | :--- | :--- | :---: | :-: |
| **UT-Auth-01** | `bcrypt.hash` | Hashes passwords with 10 salt rounds ($2a$/$2b$ prefix) | 248 ms | **PASS** |
| **UT-Auth-02** | `bcrypt.compare` | Verifies matching plain password returns true | 48 ms | **PASS** |
| **UT-Auth-03** | `bcrypt.compare` | Verifies mismatched password returns false | 46 ms | **PASS** |
| **UT-Auth-04** | `jwt.sign` | Generates signed token containing `{ id, email, role }` | 3 ms | **PASS** |
| **UT-Auth-05** | `jwt.verify` | Verifies and extracts payload using `JWT_SECRET` | 2 ms | **PASS** |
| **UT-Auth-06** | `jwt.verify` | Rejects tampered tokens signed with untrusted secret | 4 ms | **PASS** |
| **UT-Auth-07** | `requireRole` | Permitted role calls `next()` without error | 2 ms | **PASS** |
| **UT-Auth-08** | `requireRole` | Unauthorized role halts with HTTP 403 Forbidden | 2 ms | **PASS** |
| **UT-Auth-09** | `requireRole` | Missing user session halts with HTTP 401 Unauthorized | 1 ms | **PASS** |
| **UT-Auth-10** | Sanitization | Normalizes email input (`.toLowerCase().trim()`) | 1 ms | **PASS** |

---

### 3.2 Module M2: Exam & Question-Bank Management (`exam.unit.test.js`)
*Responsible Developer & Lead:* Aadish Sarin (`PES2UG24CS007`)  
*Responsible Tester:* Aditya Rao (`PES2UG24CS034`)

| Test ID | Unit Component | Test Description | Duration | Status |
| :--- | :--- | :--- | :---: | :-: |
| **UT-Exam-01** | `shuffleArray` | Conserves all original elements and array length | 2 ms | **PASS** |
| **UT-Exam-02** | `shuffleArray` | Immutable copy preserves source array state | 1 ms | **PASS** |
| **UT-Exam-03** | `shuffleArray` | Safe fallback handling for `[]`, `null`, and `undefined` | 1 ms | **PASS** |
| **UT-Exam-04** | `shuffleArray` | Produces uniform randomized permutations across 25 iterations | 2 ms | **PASS** |
| **UT-Exam-05** | Schedule Logic | Accepts valid future start and end time window | 1 ms | **PASS** |
| **UT-Exam-06** | Schedule Logic | Rejects inverted schedule (`end_time <= start_time`) per DEF-004 | 1 ms | **PASS** |
| **UT-Exam-07** | Schedule Logic | Rejects window duration shorter than exam duration | 1 ms | **PASS** |
| **UT-Exam-08** | Schedule Logic | Rejects non-positive or zero exam duration values | 1 ms | **PASS** |

---

### 3.3 Module M3: Exam Delivery Engine (`delivery.unit.test.js`)
*Responsible Developer & Lead:* Aditya Rao (`PES2UG24CS034`)  
*Responsible Tester:* Akshansh Agrawal (`PES2UG24CS045`)

| Test ID | Unit Component | Test Description | Duration | Status |
| :--- | :--- | :--- | :---: | :-: |
| **UT-Take-01** | Countdown Timer | Computes exact remaining seconds during active assessment | 2 ms | **PASS** |
| **UT-Take-02** | Countdown Timer | Enforces lower bound of 0s without negative time (DEF-002) | 1 ms | **PASS** |
| **UT-Take-03** | UTC Sync | Preserves ISO 8601 UTC timestamps across client timezones | 1 ms | **PASS** |
| **UT-Take-04** | Payload Sanitizer| Strips `correct_answer` and `explanation` keys (DEF-001) | 1 ms | **PASS** |
| **UT-Take-05** | Auto-Save Parser| Sanitizes question IDs, trims options, and validates flags | 1 ms | **PASS** |

---

### 3.4 Module M4: Evaluation, Results & Analytics (`eval.unit.test.js`)
*Responsible Developer & Lead:* Akshansh Agrawal (`PES2UG24CS045`)  
*Responsible Tester:* A S Vincent (`PES2UG24CS002`)

| Test ID | Unit Component | Test Description | Duration | Status |
| :--- | :--- | :--- | :---: | :-: |
| **UT-Eval-01** | Auto-Grading | Evaluates MCQ and True/False questions case-insensitively | 2 ms | **PASS** |
| **UT-Eval-02** | Auto-Grading | Flags ShortAnswer attempts as pending instructor review | 1 ms | **PASS** |
| **UT-Eval-03** | Item Difficulty | Categorizes questions with $P \ge 0.70$ as 'Easy' | 1 ms | **PASS** |
| **UT-Eval-04** | Item Difficulty | Categorizes questions with $0.30 \le P < 0.70$ as 'Moderate' | 1 ms | **PASS** |
| **UT-Eval-05** | Item Difficulty | Categorizes questions with $P < 0.30$ as 'Difficult' | 1 ms | **PASS** |
| **UT-Eval-06** | IDOR Guard | Permits candidate to view their own private scorecard | 1 ms | **PASS** |
| **UT-Eval-07** | IDOR Guard | Blocks cross-candidate access with HTTP 403 (DEF-005) | 1 ms | **PASS** |

---

### 3.5 Cross-Cutting: Security Audit Logging (`logger.unit.test.js`)
*Responsible Developer & Lead:* A S Vincent (`PES2UG24CS002`)  
*Responsible Tester:* Aadish Sarin (`PES2UG24CS007`)

| Test ID | Unit Component | Test Description | Duration | Status |
| :--- | :--- | :--- | :---: | :-: |
| **UT-Sec-01** | IP Resolver | Prioritizes `x-forwarded-for` proxy header | 1 ms | **PASS** |
| **UT-Sec-02** | IP Resolver | Falls back to socket `remoteAddress` | 1 ms | **PASS** |
| **UT-Sec-03** | IP Resolver | Gracefully returns `'127.0.0.1'` on undefined socket (DEF-006) | 1 ms | **PASS** |
| **UT-Sec-04** | Event Formatter | Generates structured uppercase action audit record | 1 ms | **PASS** |
| **UT-Sec-05** | Event Formatter | Handles unauthenticated audit events with `user_id = null` | 1 ms | **PASS** |

---

## 4. Quality Assurance Conclusion & Sign-Off

The unit test suite validates all isolated algorithms and edge cases. Execution completes in **sub-second time (628 ms)**, making it ideal for continuous pre-commit checks and regression testing.

- **Aadish Sarin (`PES2UG24CS007`)** — *QA Lead*
- **A S Vincent (`PES2UG24CS002`)** — *Dev Lead & Facilitator*

