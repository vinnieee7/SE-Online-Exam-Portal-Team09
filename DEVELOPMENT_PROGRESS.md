# Online Exam Portal (OEP) — Development Progress & History

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Planned Freeze:** 30 October 2026 · **Last Feature Merge:** 2 November 2026 · **Maintenance Release v1.0.1:** 11 November 2026  
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)

---

## 1. Chronological Development Milestones

```
[12 Oct – 19 Oct] Backlog Creation & SRS Extraction
        │
        ├── Product Backlog Definition (28 items, 104 SP as recorded in the GitHub issues)
        └── Sprint Planning (Sprint 1: 52 SP | Sprint 2: 52 SP)
        │
[19 Oct – 23 Oct] Sprint 1 Execution
        │
        ├── Workspace init & GitHub Actions CI (Vincent)            5260d74, 19 Oct
        └── Module M1: Auth & RBAC (Vincent), React shell & theme    b7e0f11, 23 Oct
            (theme by Akshansh), first test suite (by Aadish)
        │
[26 Oct – 30 Oct] Sprint 2 Execution
        │
        ├── SQLite schema & seed (Aditya; committed by Vincent)     1293315, 30 Oct
        ├── Module M3: Delivery Engine & 30s Auto-Save (Aditya)     32262c0, 30 Oct (PR #28)
        │     includes the DEF-001 and DEF-002 fixes
        ├── Module M4: Auto-Grading & Analytics (Akshansh)          39470c5, 8bf7220, 31 Oct (PRs #29, #30)
        └── Planned development freeze                              30 Oct
        │
[1 Nov – 5 Nov] Late Integration & Documentation
        │
        ├── Module M2: Exam & Question CRUD (Aadish)                bcfc262, 1 Nov (PR #31 merged 2 Nov)
        └── Sprint reports, RTM, test report, Kanban                9cfa30d, db92eb4, 5 Nov
        │
[11 Nov] Maintenance Release v1.0.1
        │
        ├── Fixes DEF-007 – DEF-012 (exam timer, attempt start, DB write speed, error handling)
        ├── HTTPS mode (TLS 1.2+), 51 automated tests
        └── Executed evidence: JMeter, OWASP ZAP, Lighthouse/axe
```

---

## 2. Features Implemented & Verified

### Module M1: Authentication & User/Role Management (`OEP-F-001..004`)
- Institutional student and instructor registration with duplicate email rejection (`409 Conflict`).
- Cryptographic password hashing using Bcrypt (cost 10).
- Secure JWT issuance with 24-hour expiration containing user identity and role claims.
- 6-digit OTP verification for self-service password reset.
- Server-side Role-Based Access Control (RBAC) middleware guarding unauthorized operations.

### Module M2: Exam & Question-Bank Management (`OEP-F-005..008`)
- Exam lifecycle CRUD (create, read, update, publish).
- Comprehensive Question Bank supporting Multiple Choice (MCQ), True/False, and Short Answer formats.
- Server-side scheduling validation enforcing start/end window integrity.
- Fisher-Yates array shuffling algorithm for candidate question randomization.

### Module M3: Exam Delivery Engine (`OEP-F-009..012`)
- Candidate active exam listing and launch interface.
- Server-synchronized countdown timer engine resilient to client-side clock tampering.
- 30-second periodic background auto-save preserving examinee answers.
- Automatic exam submission upon countdown expiration.
- Interactive question navigation palette with color-coded status and mark-for-review flagging.

### Module M4: Evaluation, Results & Analytics (`OEP-F-013..016`)
- Automated instant grading engine for objective questions (MCQ, True/False).
- Faculty manual grading portal for subjective responses with partial marks and feedback.
- Candidate private scorecard view with detailed question breakdown and explanations.
- Class-wide aggregate performance analytics (mean, median, pass rate, item difficulty).

### Security & Cross-Cutting Controls (`OEP-NF-004`, `OEP-SR-001..005`)
- Strict stripping of `correct_answer` from student delivery payloads (`DEF-001` fix).
- Server-side object authorization eliminating IDOR vulnerabilities on candidate scorecards (`DEF-005` fix).
- Persistent audit logging tracking authentication, lockout, exam submission, and administrative events.
- Dark theme meeting WCAG 2.1 AA (4.5:1 contrast, labelled form fields, keyboard-reachable tables), fixed and audited in v1.0.1.

---

## 3. Defects Identified, Triaged & Remediated

| Defect ID | Severity | Module | Description | Root Cause | Remediation & Fix | Status |
| :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **DEF-001** | Critical (P1) | M3 | Answer key leaked in student delivery payload | `SELECT *` queried answer columns | Explicit column projection excluding answers | **CLOSED** |
| **DEF-002** | High (P1) | M3 | Countdown timer calculated negative time | Missing UTC `Z` designator in timestamp | Normalized ISO UTC date strings | **CLOSED** |
| **DEF-003** | Medium (P2) | M1 | Case-sensitive duplicate student registration | SQLite `TEXT UNIQUE` case sensitivity | Applied `.toLowerCase().trim()` | **CLOSED** |
| **DEF-004** | High (P2) | M2 | Exam end time allowed prior to start time | Missing server validation in controller | Enforced `end_time > start_time` check | **CLOSED** |
| **DEF-005** | Critical (P1) | M4 | Scorecard IDOR privacy leak | Missing candidate ownership check | Enforced `student_id === req.user.id` | **CLOSED** |
| **DEF-006** | Medium (P3) | Logger | Test harness crash on remote IP dereference | `req.socket` undefined in Supertest | Added optional chaining with fallback | **CLOSED** |
| **DEF-007** | Critical (P1) | M3 | Auto-submit at 00:00 failed; attempt stayed in progress | Timer callback captured the first render's `attemptId` (null) | Refs for attempt id and answers; expiry handled in an effect | **CLOSED** (v1.0.1) |
| **DEF-008** | High (P2) | M3 | Exam clock ran at double speed in development mode | StrictMode ran the start-up effect twice and both timers survived | Effect cancels its own work on cleanup | **CLOSED** (v1.0.1) |
| **DEF-009** | Medium (P2) | M3 | Simultaneous attempt-start requests returned HTTP 500 | Check-then-insert race on UNIQUE(exam_id, student_id) | `INSERT OR IGNORE` then re-read | **CLOSED** (v1.0.1) |
| **DEF-010** | Medium (P3) | M3 | Question order changed on every refresh | Unseeded shuffle on each request | Shuffle seeded with the attempt id | **CLOSED** (v1.0.1) |
| **DEF-011** | High (P2) | DB | Auto-save throughput capped near 60 requests/s under load | One disk flush per SQLite write (rollback journal, synchronous FULL) | WAL journal, synchronous NORMAL | **CLOSED** (v1.0.1) |
| **DEF-012** | Medium (P2) | All | Invalid requests returned HTTP 500 with internal error details | Missing validation; raw error messages sent to clients | Validation, safe error helper, security headers | **CLOSED** (v1.0.1) |

---

## 4. Known Limitations & Future Enhancements

While all 26 baseline requirements from the SRS are 100% satisfied and verified, the following non-critical enhancements are earmarked for future iterations:
1. **Webcam Proctoring / Browser Tab Lock:** Future versions can integrate WebRTC video recording and full-screen enforcement API for high-stakes remote proctoring.
2. **Formula / LaTeX Rendering in Question Prompts:** MathJax/KaTeX integration for mathematical equation rendering in question stems.
3. **Automated Export to CSV / Excel:** Faculty export button to download class grade books directly in `.xlsx` format.
4. **Server-side expiry:** the server does not submit an attempt on its own; if a candidate closes the browser before 00:00, the attempt stays in progress until they return.
5. **Production TLS certificate:** HTTPS mode uses a self-signed development certificate; a deployment would use a CA-issued certificate.
