# Online Exam Portal (OEP) — Development Progress & History

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Evaluation Date:** 30 October 2026 (Development Cycle Frozen)  
> **Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal](https://github.com/vinnieee7/SE-Online-Exam-Portal)

---

## 1. Chronological Development Milestones

```
[12 Oct – 19 Oct] Backlog Creation & SRS Extraction
        │
        ├── Product Backlog Definition (27 items, 91 SP)
        └── Sprint Planning (Sprint 1: 47 SP | Sprint 2: 44 SP)
        │
[19 Oct – 23 Oct] Sprint 1 Execution
        │
        ├── Workspace init & GitHub Actions CI (Vincent)
        ├── SQLite DB Schema & STP Seed Engine (Aditya)
        ├── Module M1: Auth & RBAC (Vincent)
        ├── Module M2: Exam & Question CRUD (Aadish)
        └── Defect Fixes: DEF-001, DEF-002, DEF-003, DEF-004
        │
[26 Oct – 30 Oct] Sprint 2 Execution & Final Release
        │
        ├── Module M3: Delivery Engine & 30s Auto-Save (Aditya)
        ├── Module M4: Auto-Grading & Analytics (Akshansh)
        ├── UI Navigation Shell & Dark Mode Design System (Vincent)
        ├── Security Controls & Audit Logging (Vincent)
        ├── Cross-Testing & Defect Remediation: DEF-005, DEF-006
        ├── Automated Test Suite (19/19 Passing)
        └── Development Cycle Frozen (30 October 2026)
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
- WCAG 2.1 AA accessible dark mode theme with 4.5:1 contrast ratio.

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

---

## 4. Known Limitations & Future Enhancements

While all 26 baseline requirements from the SRS are 100% satisfied and verified, the following non-critical enhancements are earmarked for future iterations:
1. **Webcam Proctoring / Browser Tab Lock:** Future versions can integrate WebRTC video recording and full-screen enforcement API for high-stakes remote proctoring.
2. **Formula / LaTeX Rendering in Question Prompts:** MathJax/KaTeX integration for mathematical equation rendering in question stems.
3. **Automated Export to CSV / Excel:** Faculty export button to download class grade books directly in `.xlsx` format.
