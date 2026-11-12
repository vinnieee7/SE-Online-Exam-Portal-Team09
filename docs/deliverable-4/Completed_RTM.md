# Completed Requirements Traceability Matrix (RTM)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9
> **System Name:** Online Exam Portal (OEP)
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)
> **Status Codes:** `A` = Accepted (verified by an executed test), `P` = Partial, `N` = Not Started
> **Overall Coverage:** 26 / 26 Requirements (100% Accepted) — updated with Sprint 3 & v1.0.1
> **Related Reports:** [Updated Test Cases](../UPDATED_TEST_CASES.md) | [Unit Test Report](../UNIT_TEST_REPORT.md) | [System Validation](../SYSTEM_VALIDATION_REPORT.md) | [Code Coverage](../CODE_COVERAGE_REPORT.md) | [Branch Coverage](../BRANCH_COVERAGE_REPORT.md) | [Test Execution Report](../TEST_EXECUTION_REPORT.md) | [Deviations](../DEVIATIONS_FROM_BASELINE.md) | [Defect Log](defect-log.md) | [Test Evidence](evidence/test-execution-evidence.md)

**Change note (11 Nov 2026):** at the 30 Oct freeze this matrix already showed all 26 requirements as Accepted, but four of them — OEP-NF-001, OEP-NF-002, OEP-NF-005 and OEP-SR-001 — had no executed test behind them, and OEP-F-008 and OEP-F-010 had no automated test. Each row now names the evidence that was actually run.

---

| Req ID | Requirement | Design Spec | Module | Test Case(s) | Evidence | Tester (STP) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **OEP-F-001** | Registration with email uniqueness & role request | DS-Auth-01 | M1 | TC-Auth-01, 01a | `api.test.js` | Aadish Sarin | **A** |
| **OEP-F-002** | Login and JWT session | DS-Auth-02 | M1 | TC-Auth-02, 02a, 02b | `api.test.js` | Aadish Sarin | **A** |
| **OEP-F-003** | Password reset via 6-digit OTP | DS-Auth-03 | M1 | TC-Auth-03, 03b | `api.test.js`, `verification.test.js` | Aadish Sarin | **A** |
| **OEP-F-004** | Role-Based Access Control middleware | DS-Auth-04 | M1 | TC-Auth-04, TC-Sec-03e | `api.test.js`, `security.test.js` | Aadish Sarin | **A** |
| **OEP-F-005** | Exam CRUD lifecycle | DS-Exam-01 | M2 | TC-Exam-01 | `api.test.js` | Aditya Rao | **A** |
| **OEP-F-006** | Question bank (MCQ, True/False, Short) | DS-Exam-02 | M2 | TC-Exam-02 | `api.test.js` | Aditya Rao | **A** |
| **OEP-F-007** | Schedule, duration and window validation | DS-Exam-03 | M2 | TC-Exam-03 | `api.test.js` | Aditya Rao | **A** |
| **OEP-F-008** | Question order randomization (Fisher-Yates) | DS-Exam-04 | M2/M3 | TC-Exam-04a–c, TC-Take-05b–c | `verification.test.js` (added v1.0.1) | Aditya Rao | **A** |
| **OEP-F-009** | Exam listing and start for candidates | DS-Take-01 | M3 | TC-Take-01, TC-Take-05a | `api.test.js`, `verification.test.js` | Akshansh Agrawal | **A** |
| **OEP-F-010** | Server-enforced countdown timer | DS-Take-02 | M3 | TC-Take-02a–e, TC-Take-06 | `verification.test.js`, browser test (added v1.0.1) | Akshansh Agrawal | **A** |
| **OEP-F-011** | 30-second auto-save and auto-submit | DS-Take-03 | M3 | TC-Take-03, TC-Take-06 | `api.test.js`, browser test (auto-submit fixed in v1.0.1) | Akshansh Agrawal | **A** |
| **OEP-F-012** | Question palette and mark-for-review | DS-Take-04 | M3 | TC-Take-04, TC-Take-06 | `api.test.js`, browser test | Akshansh Agrawal | **A** |
| **OEP-F-013** | Auto-grade objective questions | DS-Eval-01 | M4 | TC-Eval-01 | `api.test.js` | A S Vincent | **A** |
| **OEP-F-014** | Manual grading of subjective answers | DS-Eval-02 | M4 | TC-Eval-02 | `api.test.js` | A S Vincent | **A** |
| **OEP-F-015** | Scorecard with solution explanation | DS-Eval-03 | M4 | TC-Eval-03 | `api.test.js` | A S Vincent | **A** |
| **OEP-F-016** | Class analytics and item difficulty | DS-Eval-04 | M4 | TC-Eval-04 | `api.test.js` | A S Vincent | **A** |
| **OEP-NF-001** | Response latency p90 ≤ 3.0 s | DS-Perf-01 | All | TC-Perf-01 | [JMeter load test](evidence/performance-load-test.md) (11 Nov 2026) | Akshansh Agrawal | **A** |
| **OEP-NF-002** | 500 concurrent students without degradation | DS-Perf-02 | All | TC-Perf-02 | [JMeter load test](evidence/performance-load-test.md) (11 Nov 2026) | Akshansh Agrawal | **P** — 0 errors with 500 candidates for 10 min; 16–25% of 500 simultaneous new connections refused by the Windows test host |
| **OEP-NF-003** | In-progress answer recovery | DS-Rel-01 | M3 | TC-Take-03, TC-Take-05b | `api.test.js`, `verification.test.js` | Aditya Rao | **A** |
| **OEP-NF-004** | Persistent audit logging | DS-Sec-04 | All | TC-Sec-04, TC-Take-05a | `api.test.js`, `verification.test.js` | A S Vincent | **A** |
| **OEP-NF-005** | WCAG 2.1 AA accessibility | DS-UX-01 | UI | TC-UX-01 | [Accessibility audit](evidence/accessibility-audit.md) (fixes in v1.0.1) | Akshansh Agrawal | **A** |
| **OEP-SR-001** | TLS 1.2+ encrypted transport | DS-Sec-01 | Net | TC-Sec-01a–e | `security.test.js`; HTTPS mode added in v1.0.1 (DEV-07) | A S Vincent | **A** |
| **OEP-SR-002** | Password hashing (bcrypt cost 10) | DS-Sec-02 | M1 | TC-Sec-02a–b | `security.test.js` | A S Vincent | **A** |
| **OEP-SR-003** | Server-side authorization on protected APIs | DS-Sec-03 | M1 | TC-Sec-03a–g, TC-Auth-04 | `security.test.js`, [ZAP scan](evidence/security-scan.md) | A S Vincent | **A** |
| **OEP-SR-004** | Answer key stripped from candidate payload | DS-Sec-05 | M3 | TC-Sec-05, TC-Exam-04c | `api.test.js`, `verification.test.js` | A S Vincent | **A** |
| **OEP-SR-005** | Candidate result isolation (no IDOR) | DS-Sec-06 | M4 | TC-Sec-06 | `api.test.js` | A S Vincent | **A** |

---

### Sign-Off & Verification
- **Aadish Sarin (QA Lead):** Approved — every requirement traced to an executed test (11 Nov 2026, v1.0.1).
- **A S Vincent (Dev Lead):** Review pending on the v1.0.1 pull request.
