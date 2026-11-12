# Sprint 3 Report: Online Exam Portal (OEP)

> **Sprint Duration:** 2 November 2026 – 6 November 2026 (Parallel Testing & Quality Assurance Activity)  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Dev Lead & Facilitator:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)  
> **Deliverables Reference:** [Mini-Project Deliverables Part-3 §1–§3](SE_Mini_Project_Delivereables_Part-3.pdf)  

---

## 1. Executive Summary & Sprint Goal

**Sprint 3 Goal:** Execute the formal **Mini-Project Deliverables Part-3** mandate. In parallel with final development activities, complete all testing according to the Software Test Plan (STP v1.0), develop comprehensive unit test suites for all 4 functional modules and cross-cutting security layers, generate quantitative code and branch coverage metrics, and produce all 4 formal test reports in the `docs/` repository directory.

- **Sprint Velocity:** 20 Story Points (5 SP equally allocated per member)
- **Cumulative Project Velocity:** **114 Story Points** across Sprints 1, 2, and 3 (100% Commitment Completed)
- **Automated Test Count:** **53 Automated Tests (34 Unit Tests + 19 Integration Tests)**
- **Test Pass Rate:** **100% (53 / 53 Passing, 0 Failures, 0 Errors)**
- **Code Coverage Achieved:** **68.20% Statements | 70.76% Functions | 67.75% Lines | 48.20% Branches**
- **Defects Open at Exit:** **0 Critical, 0 High, 0 Medium (STP §5.4 Met)**

---

## 2. Sprint 3 Deliverables Checklist (Part-3 Compliance)

| Requirement | Deliverable Description | Repository Location | Status |
| :--- | :--- | :--- | :-: |
| **Part-3 §1.a, §1.b** | **Test Cases Updation & Updated Test Case Document** | [`docs/UPDATED_TEST_CASES.md`](docs/UPDATED_TEST_CASES.md) | ✅ **Completed** |
| **Part-3 §2.a, §2.b.i** | **Unit Test Report** (34 unit tests across 5 suites) | [`docs/UNIT_TEST_REPORT.md`](docs/UNIT_TEST_REPORT.md) | ✅ **Completed** |
| **Part-3 §2.b.ii** | **System Validation Report** (End-to-end integration) | [`docs/SYSTEM_VALIDATION_REPORT.md`](docs/SYSTEM_VALIDATION_REPORT.md) | ✅ **Completed** |
| **Part-3 §2.b.iii** | **Code Coverage Report** (Istanbul / Jest instrumentation) | [`docs/CODE_COVERAGE_REPORT.md`](docs/CODE_COVERAGE_REPORT.md) | ✅ **Completed** |
| **Part-3 §2.b.iv** | **Branch Coverage Report** (Dual-path decision analysis) | [`docs/BRANCH_COVERAGE_REPORT.md`](docs/BRANCH_COVERAGE_REPORT.md) | ✅ **Completed** |
| **Part-3 §3.a, §3.b** | **Sprint-3 Report & Parallel Activity Finalization** | [`SPRINT_3_REPORT.md`](SPRINT_3_REPORT.md) | ✅ **Completed** |

---

## 3. Team Member Work Breakdown (Sprint 3 Balanced Allocation — 5 SP Each)

### 3.1 A S Vincent (`PES2UG24CS002`, `@vinnieee7`) — Dev Lead & Facilitator (5 SP Delivered)
1. **Module M1 Unit Testing (`tests/unit/auth.unit.test.js`):**
   - Built unit tests for bcrypt password hashing (10 salt rounds verification and format validation).
   - Authored JWT signing, payload claims `{ id, email, role }`, and forged secret rejection unit tests.
   - Built unit tests for `requireRole` middleware guard clauses across authorized, unauthorized, and missing session paths.
2. **Security Controls & Branch Coverage Analysis:**
   - Authored `docs/BRANCH_COVERAGE_REPORT.md` analyzing all decision diamonds in authentication and API routing.
   - Verified cross-student IDOR data isolation safeguards.

---

### 3.2 Aadish Sarin (`PES2UG24CS007`) — Team & QA Lead (5 SP Delivered)
1. **Module M2 Unit Testing (`tests/unit/exam.unit.test.js`):**
   - Engineered unit tests for the **Fisher-Yates (Knuth) shuffle algorithm**, validating element conservation, immutability, and permutation distributions.
   - Implemented unit tests for exam scheduling validation (`end_time > start_time` per DEF-004).
2. **QA Deliverable Reports & Documentation:**
   - Authored [`docs/UPDATED_TEST_CASES.md`](docs/UPDATED_TEST_CASES.md) updating all baseline STP test cases with sprint enhancements.
   - Authored [`docs/UNIT_TEST_REPORT.md`](docs/UNIT_TEST_REPORT.md) covering all 34 unit tests with sub-second execution metrics.

---

### 3.3 Aditya Rao (`PES2UG24CS034`) — DevOps Lead (5 SP Delivered)
1. **Module M3 Unit Testing (`tests/unit/delivery.unit.test.js`):**
   - Built unit tests for server-enforced countdown timer calculations, ensuring 0s floor truncation without negative offset errors (DEF-002).
   - Built unit tests for candidate question payload sanitization, guaranteeing `correct_answer` and `explanation` are stripped (DEF-001).
   - Built unit tests for 30-second periodic auto-save payload deserialization and flag validation.
2. **System Validation & CI/CD Pipeline:**
   - Authored [`docs/SYSTEM_VALIDATION_REPORT.md`](docs/SYSTEM_VALIDATION_REPORT.md) detailing the 4 core end-to-end user journeys.
   - Configured root and backend test scripts to run all 6 test suites concurrently in CI/CD pipeline.

---

### 3.4 Akshansh Agrawal (`PES2UG24CS045`) — Performance & Evaluation Lead (5 SP Delivered)
1. **Module M4 Unit Testing (`tests/unit/eval.unit.test.js`):**
   - Built unit tests for auto-grading engine evaluation of MCQ and True/False questions case-insensitively.
   - Implemented unit tests for Item Difficulty Index calculation ($P = R/T$) and categorical labeling (Easy, Moderate, Difficult).
   - Built unit tests for candidate scorecard IDOR gatekeeper function (DEF-005).
2. **Code Coverage Analysis & Reporting:**
   - Authored [`docs/CODE_COVERAGE_REPORT.md`](docs/CODE_COVERAGE_REPORT.md) capturing Istanbul statement, line, and function metrics across all files.

---

## 4. Final Test Suite Execution Summary (53 Passing Tests)

```
PASS tests/integration/api.test.js
PASS tests/unit/eval.unit.test.js
PASS tests/unit/delivery.unit.test.js
PASS tests/unit/exam.unit.test.js
PASS tests/unit/auth.unit.test.js
PASS tests/unit/logger.unit.test.js

------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Key Areas Covered 
------------------------|---------|----------|---------|---------|-------------------
All files               |   68.20 |    48.20 |   70.76 |   67.75 | Full Application  
 src/routes             |   98.27 |   100.00 |  100.00 |   98.27 | API Endpoints     
 src/db/seed.js         |   95.29 |    90.00 |   60.00 |   95.00 | Schema & Seed     
 src/config/db.js       |   83.33 |    53.84 |  100.00 |   92.59 | SQLite Connection 
 src/middleware         |   81.25 |    67.85 |  100.00 |   81.25 | Auth, RBAC & Log  
 src/controllers/eval   |   78.51 |    64.28 |   85.71 |   77.60 | Grading & Score   
 src/controllers/deliv  |   66.98 |    39.70 |   80.00 |   66.66 | Timer & Delivery  
 src/controllers/auth   |   46.60 |    36.17 |   42.85 |   46.60 | Auth Controller   
 src/controllers/exam   |   40.52 |    38.80 |   46.66 |   39.59 | Exam Controller   
------------------------|---------|----------|---------|---------|-------------------

Test Suites: 6 passed, 6 total
Tests:       53 passed, 53 total
Snapshots:   0 total
Time:        4.829 s
Ran all test suites.
```

---

## 5. Formal Project Completion Sign-Off

With the conclusion of Sprint 3, all academic requirements of the Software Engineering Mini-Project Deliverables (Parts 1, 2, and 3) have been fully satisfied:
- **Part-1 (Analysis & Design):** SRS v1.1 and SAD v1.0 approved.
- **Part-2 (Implementation & Sprints 1 & 2):** Backlog, CI/CD, modules M1–M4, and 2-minute demonstration plan completed.
- **Part-3 (Testing & Quality Assurance / Sprint 3):** Updated test cases, unit testing, system validation, code coverage, and branch coverage reports completed and uploaded to `docs/`.

### Signatures:
- **A S Vincent (`PES2UG24CS002`, `@vinnieee7`)** — *Facilitator & Dev Lead*
- **Aadish Sarin (`PES2UG24CS007`)** — *Team & QA Lead*
- **Aditya Rao (`PES2UG24CS034`)** — *DevOps Lead*
- **Akshansh Agrawal (`PES2UG24CS045`)** — *Performance Lead*

